import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getEmailTransporter } from '@/lib/email';
import { type User as UserAccount, type Subscription } from '@/types';
import { format, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { verifyCronAuth } from '@/lib/cron-auth';
import { durationMs, logger, requestIdFor, safeError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Generates the HTML content for the Monthly Pulse email.
 */
function generatePulseEmailHTML(
    user: UserAccount,
    totalMonthlySpend: number,
    renewingThisMonth: Subscription[]
): string {
    const toDate = (date: any): Date => {
        if (!date) return new Date();
        if (date instanceof Date) return date;
        if (typeof date.toDate === 'function') return date.toDate();
        return new Date(date);
    };

    const formatINR = (amount: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    const subscriptionsHtml = renewingThisMonth
        .sort((a, b) => toDate(a.renewalDate).getTime() - toDate(b.renewalDate).getTime())
        .map(sub => `
        <tr style="border-bottom: 1px solid #232328;">
            <td style="padding: 12px 0;">
                <strong style="color: #ffffff; font-size: 14px;">${sub.name}</strong><br>
                <span style="color: #888891; font-size: 12px;">${format(toDate(sub.renewalDate), 'MMM do, yyyy')}</span>
            </td>
            <td style="padding: 12px 0; text-align: right; color: #ffffff; font-weight: 500;">
                ${formatINR(sub.amount)}
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your SubZero Monthly Pulse</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededf0;">
    <div style="max-w-width: 600px; margin: 0 auto; background-color: #15151b; padding: 40px 30px; border-radius: 12px; border: 1px solid #232328; margin-top: 40px; margin-bottom: 40px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; width: 48px; height: 48px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                <span style="color: white; font-weight: bold; font-size: 24px;">S</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">Your Financial Pulse</h1>
            <p style="margin: 5px 0 0 0; color: #888891; font-size: 14px;">${format(new Date(), 'MMMM yyyy')} Overview</p>
        </div>

        <!-- Greeting -->
        <p style="font-size: 16px; line-height: 1.5; color: #ededf0;">Hi ${user.firstName},</p>
        <p style="font-size: 15px; line-height: 1.5; color: #a1a1aa; margin-bottom: 30px;">This is your automated monthly rundown of your subscription spending. Here is what to expect this month.</p>

        <!-- Big Stat -->
        <div style="background-color: #1a1a23; border: 1px solid #282832; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #888891; font-weight: 600; margin-bottom: 8px;">Projected Spend This Month</p>
            <p style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">${formatINR(totalMonthlySpend)}</p>
        </div>

        <!-- Renewals Table -->
        <h3 style="font-size: 16px; font-weight: 600; color: #ffffff; border-bottom: 1px solid #232328; padding-bottom: 10px; margin-bottom: 10px;">Upcoming Renewals</h3>
        ${renewingThisMonth.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse;">
                ${subscriptionsHtml}
            </table>
        ` : `
            <p style="color: #888891; font-style: italic; font-size: 14px; margin-top: 15px;">You have no recorded subscriptions renewing this month.</p>
        `}

        <!-- Footer -->
        <div style="margin-top: 40px; text-align: center; border-top: 1px solid #232328; padding-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://smart-subscription-manager.vercel.app'}/dashboard" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block;">Manage Subscriptions</a>
            <p style="font-size: 12px; color: #52525b; margin-top: 30px;">
                You are receiving this because you enabled email notifications in SubZero.<br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://smart-subscription-manager.vercel.app'}/dashboard/settings" style="color: #888891;">Update your preferences</a>
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

export async function GET(request: Request) {
    const requestId = requestIdFor(request);
    const startedAt = performance.now();
    const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'X-Request-ID': requestId } });
    // 1. Authenticate the cron job request via Bearer token
    const auth = verifyCronAuth(request);
    if (!auth.isAuthorized) {
        logger.warn('cron', 'authentication_failed', requestId, { operation: 'pulse' });
        auth.errorResponse!.headers.set('X-Request-ID', requestId);
        return auth.errorResponse!;
    }

    logger.info('cron', 'cron_job_started', requestId, { operation: 'pulse' });

    const transporter = getEmailTransporter();
    if (!transporter) {
        logger.error('cron', 'cron_job_failed', requestId, { operation: 'pulse', status: 'email_unavailable', durationMs: durationMs(startedAt) });
        return reply({ success: false, message: "Email service not configured." }, 500);
    }

    try {
        const usersSnapshot = await adminDb.collection('users').get();
        if (usersSnapshot.empty) {
            logger.info('cron', 'cron_job_skipped', requestId, { operation: 'pulse', status: 'no_users', durationMs: durationMs(startedAt), count: 0 });
            return reply({ success: true, message: 'No users found.' });
        }

        let emailsSent = 0;
        const currentMonthStart = startOfMonth(new Date());
        const currentMonthEnd = endOfMonth(new Date());

        for (const userDoc of usersSnapshot.docs) {
            const user = userDoc.data() as UserAccount;
            const notifSettings = user.settings?.notifications || { email: true, dashboard: true };

            // Skip users who have explicitly opted out of email notifications
            if (!notifSettings.email) continue;
            if (!user.email || !user.firstName) continue;

            const subsSnapshot = await adminDb.collection('users').doc(userDoc.id).collection('subscriptions').get();
            const subscriptions = subsSnapshot.docs.map(doc => doc.data() as Subscription);

            // Filter out active subscriptions
            const activeSubscriptions = subscriptions.filter(sub => {
                // Determine if active based on whatever standard check logic exists.
                // Normally in SubZero, presence in collection assumes active.
                return true;
            });

            if (activeSubscriptions.length === 0) continue;

            let totalMonthlySpend = 0;
            const renewingThisMonth: Subscription[] = [];

            activeSubscriptions.forEach(sub => {
                // Add to total monthly projected spend
                if (sub.billingCycle === 'monthly') {
                    totalMonthlySpend += sub.amount;
                } else if (sub.billingCycle === 'yearly') {
                    totalMonthlySpend += sub.amount / 12; // Amortalize yearly spend
                }

                // Check if renewal falls within this calendar month
                if (sub.renewalDate) {
                   const toDate = (date: any): Date => {
                       if (date instanceof Date) return date;
                       if (typeof date.toDate === 'function') return date.toDate();
                       return new Date(date);
                   };
                   const date = toDate(sub.renewalDate);
                   if (date >= currentMonthStart && date <= currentMonthEnd) {
                       renewingThisMonth.push(sub);
                   }
                }
            });

            // Send Pulse Email
            await transporter.sendMail({
                from: `"SubZero Insights" <${process.env.SMTP_USER || 'noreply@example.com'}>`,
                to: user.email,
                subject: '📊 Your SubZero Monthly Pulse',
                html: generatePulseEmailHTML(user, totalMonthlySpend, renewingThisMonth),
            });
            emailsSent++;
        }

        logger.info('cron', 'cron_job_completed', requestId, { operation: 'pulse', durationMs: durationMs(startedAt), usersProcessed: usersSnapshot.size, emailsSent });
        return reply({ success: true, message: `Sent ${emailsSent} Monthly Pulse emails.` });

    } catch (error: any) {
        logger.error('cron', 'cron_job_failed', requestId, { operation: 'pulse', durationMs: durationMs(startedAt), ...safeError(error) });
        return reply({ success: false, message: 'An internal error occurred.' }, 500);
    }
}
