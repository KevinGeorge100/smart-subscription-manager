import * as nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

/**
 * Configures and returns a nodemailer transporter for sending emails.
 * It reads SMTP configuration from environment variables.
 * 
 * Used by cron jobs (reminders, pulse) and user-facing features (welcome emails).
 */
export function getEmailTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        logger.warn('email', 'email_transport_unconfigured');
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
