import { getAuthAdmin } from '@/lib/firebase-admin';

export interface AuthenticatedUser {
    uid: string;
    email?: string;
}

/**
 * Resolves and cryptographically verifies the Firebase identity of the caller.
 *
 * Checks in priority order:
 * 1. An explicitly passed `idToken` argument.
 * 2. Next.js request headers (`Authorization: Bearer <token>`).
 * 3. Next.js cookies (`__session` or `firebase_token`).
 *
 * Returns `{ uid, email }` on successful verification.
 * Throws an Error with 401-style message if token is missing or invalid.
 */
export async function verifyAuth(explicitToken?: string): Promise<AuthenticatedUser> {
    let token = explicitToken?.trim();

    if (!token) {
        try {
            const { headers, cookies } = await import('next/headers');
            const headerList = await headers();
            const authHeader = headerList.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.slice(7).trim();
            }

            if (!token) {
                const cookieStore = await cookies();
                token = cookieStore.get('__session')?.value || cookieStore.get('firebase_token')?.value;
            }
        } catch {
            // Not in a request context where next/headers is available
        }
    }

    if (!token) {
        throw new Error('Unauthorized: Authentication token is required.');
    }

    try {
        const decoded = await getAuthAdmin().verifyIdToken(token);
        return {
            uid: decoded.uid,
            email: decoded.email,
        };
    } catch (err: any) {
        throw new Error(`Unauthorized: Invalid or expired authentication token (${err?.message || 'verification failed'}).`);
    }
}

/**
 * Verifies authentication for Next.js Route Handlers (Request context).
 * Extracts Bearer token from the Request Authorization header and verifies it via Firebase Admin.
 */
export async function verifyRequestAuth(request: Request): Promise<AuthenticatedUser> {
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
            const match = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
            if (match) {
                token = decodeURIComponent(match[1]);
            }
        }
    }

    if (!token) {
        throw new Error('Unauthorized: Missing Authorization header or session token.');
    }

    try {
        const decoded = await getAuthAdmin().verifyIdToken(token);
        return {
            uid: decoded.uid,
            email: decoded.email,
        };
    } catch (err: any) {
        throw new Error(`Unauthorized: Invalid or expired authentication token (${err?.message || 'verification failed'}).`);
    }
}
