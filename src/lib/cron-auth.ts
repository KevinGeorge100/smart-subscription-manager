import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

export interface CronAuthResult {
    isAuthorized: boolean;
    errorResponse?: NextResponse;
}

/**
 * Validates the Authorization: Bearer <CRON_SECRET> header for scheduled background jobs.
 *
 * Requirements:
 * - Fails secure if CRON_SECRET is not configured in process.env.
 * - Fails if Authorization header is missing or does not follow "Bearer <token>".
 * - Uses timing-safe buffer comparison to prevent timing side-channel attacks.
 * - Never prints or leaks the secret value in logs or HTTP responses.
 *
 * @param request The incoming HTTP request
 * @returns CronAuthResult with isAuthorized boolean and optional 401 error response
 */
export function verifyCronAuth(request: Request): CronAuthResult {
    const configuredSecret = process.env.CRON_SECRET;

    if (!configuredSecret || configuredSecret.trim() === '') {
        logger.error('cron', 'cron_auth_unconfigured');
        return {
            isAuthorized: false,
            errorResponse: NextResponse.json(
                { error: 'Unauthorized: Server cron secret is not configured.' },
                { status: 401 }
            ),
        };
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return {
            isAuthorized: false,
            errorResponse: NextResponse.json(
                { error: 'Unauthorized: Missing Authorization header.' },
                { status: 401 }
            ),
        };
    }

    if (!authHeader.startsWith('Bearer ')) {
        return {
            isAuthorized: false,
            errorResponse: NextResponse.json(
                { error: 'Unauthorized: Authorization header must use Bearer scheme.' },
                { status: 401 }
            ),
        };
    }

    const providedToken = authHeader.slice(7).trim();
    if (!providedToken) {
        return {
            isAuthorized: false,
            errorResponse: NextResponse.json(
                { error: 'Unauthorized: Bearer token is empty.' },
                { status: 401 }
            ),
        };
    }

    // Timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(configuredSecret);
    const providedBuffer = Buffer.from(providedToken);

    const isMatch =
        expectedBuffer.length === providedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!isMatch) {
        return {
            isAuthorized: false,
            errorResponse: NextResponse.json(
                { error: 'Unauthorized: Invalid cron token.' },
                { status: 401 }
            ),
        };
    }

    return { isAuthorized: true };
}
