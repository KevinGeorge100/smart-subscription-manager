import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as nodemailer from 'nodemailer';
import { Timestamp } from 'firebase-admin/firestore';
import { type User as UserAccount, type Subscription } from '@/types';
import { add, format, differenceInDays } from 'date-fns';

export const dynamic = 'force-dynamic';

const REMINDER_WINDOW_DAYS = 7; // Send reminders for subscriptions renewing in the next 7 days

/**
 * Configures and returns a nodemailer transporter for sending emails.
 * It reads SMTP configuration from environment variables.
 */
function getEmailTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        console.warn("SMTP environment variables not fully configured. Email sending will be disabled.");
        return null;
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465, // Use SSL for port 465
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

/**
 * Generates the HTML content for a reminder email.
 */
function generateReminderEmailHTML(user: UserAccount, subscriptions: Subscription[]): string {
    const subscriptionsHtml = subscriptions.map(sub => `
        <li style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 5px;">
            <strong style="font-size: 1.1em;">${sub.name}</strong><br>
            Amount: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(sub.amount)}<br>
            Renews on: ${format((sub.renewalDate as any).toDate(), 'PPP')} (${differenceInDays((sub.renewalDate as any).toDate(), new Date())} days)
        </li>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Hi ${user.firstName},</h2>
            <p>This is a friendly reminder that you have subscriptions renewing soon:</p>
            <ul style="list-style-type: none; padding: 0;">
                ${subscriptionsHtml}
            </ul>
            <p>You can manage your subscriptions by logging into your Smart Subscription Manager dashboard.</p>
            <br>
            <p>Thanks,</p>
            <p>The Smart Subscription Manager Team</p>
        </div>
    `;
}


export async function GET(request: Request) {
    // 1. Authenticate the cron job request
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transporter = getEmailTransporter();
    if (!transporter) {
        return NextResponse.json({ success: false, message: "Email service not configured." }, { status: 500 });
    }

    try {
        // 2. Query for upcoming subscriptions across all users
        const now = Timestamp.now();
        const reminderWindowEnd = Timestamp.fromDate(add(now.toDate(), { days: REMINDER_WINDOW_DAYS }));

        // This query requires a Firestore index. The error message from Firebase
        // will guide you to create it if it doesn't exist.
        const snapshot = await adminDb.collectionGroup('subscriptions')
            .where('renewalDate', '>=', now)
            .where('renewalDate', '<=', reminderWindowEnd)
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ success: true, message: 'No upcoming renewals to process.' });
        }

        // 3. Filter out subscriptions that have already had a reminder sent recently
        const recentReminderThreshold = add(new Date(), { days: -REMINDER_WINDOW_DAYS });
        const subsToRemind: Subscription[] = [];

        snapshot.docs.forEach(doc => {
            const sub = doc.data() as Subscription;
            sub.id = doc.id;
            const subData = doc.data() as any;
            const reminderSent = subData.reminderSentAt ? subData.reminderSentAt.toDate() : null;

            if (!reminderSent || reminderSent < recentReminderThreshold) {
                subsToRemind.push(sub);
            }
        });

        if (subsToRemind.length === 0) {
            return NextResponse.json({ success: true, message: 'No new reminders to send.' });
        }

        // 4. Group subscriptions by user ID
        const subsByUserId = subsToRemind.reduce((acc, sub) => {
            if (!acc[sub.userId]) {
                acc[sub.userId] = [];
            }
            acc[sub.userId].push(sub);
            return acc;
        }, {} as Record<string, Subscription[]>);

        let emailsSent = 0;
        const batch = adminDb.batch();

        // 5. Process each user's reminders
        for (const userId in subsByUserId) {
            const userDoc = await adminDb.collection('users').doc(userId).get();
            if (!userDoc.exists) continue;

            const user = userDoc.data() as UserAccount;
            const userSubscriptions = subsByUserId[userId];
            const notifSettings = user.settings?.notifications || { email: true, dashboard: true };

            // A. Send email
            if (notifSettings.email) {
                await transporter.sendMail({
                    from: `"Smart Subscription Manager" <${process.env.SMTP_USER}>`,
                    to: user.email,
                    subject: 'Upcoming Subscription Renewals',
                    html: generateReminderEmailHTML(user, userSubscriptions),
                });
                emailsSent++;
            }

            // B. Create Dashboard Notification
            if (notifSettings.dashboard) {
                const notificationRef = adminDb.collection('users').doc(userId).collection('notifications').doc();
                batch.set(notificationRef, {
                    id: notificationRef.id,
                    userId,
                    title: 'Subscription Renewal Alert',
                    message: userSubscriptions.length === 1
                        ? `Your ${userSubscriptions[0].name} subscription is renewing in ${differenceInDays((userSubscriptions[0].renewalDate as any).toDate(), new Date())} days.`
                        : `You have ${userSubscriptions.length} subscriptions renewing in the next ${REMINDER_WINDOW_DAYS} days.`,
                    type: 'renewal',
                    read: false,
                    createdAt: now,
                    metadata: {
                        subscriptionId: userSubscriptions.length === 1 ? userSubscriptions[0].id : undefined,
                        amount: userSubscriptions.reduce((sum: number, sub) => sum + sub.amount, 0),
                    }
                });
            }

            // C. Mark subscriptions as reminded in a batch
            userSubscriptions.forEach(sub => {
                const subRef = adminDb.doc(`users/${userId}/subscriptions/${sub.id}`);
                batch.update(subRef, { reminderSentAt: now });
            });
        }

        // 6. Commit the batch update
        if (subsToRemind.length > 0) {
            await batch.commit();
        }

        return NextResponse.json({ success: true, message: `Sent ${emailsSent} reminder emails.` });

    } catch (error: any) {
        console.error('Cron job failed:', error);
        // This is where you might integrate with a logging/monitoring service
        if (error.code === 'failed-precondition') {
            return NextResponse.json({
                success: false,
                message: 'Query requires an index. Please create the required Firestore index.',
                error: error.message
            }, { status: 500 });
        }
        return NextResponse.json({ success: false, message: 'An internal error occurred.' }, { status: 500 });
    }
}
