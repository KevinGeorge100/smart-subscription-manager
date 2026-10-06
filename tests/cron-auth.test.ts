import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { verifyCronAuth } from '../src/lib/cron-auth';

describe('verifyCronAuth', () => {
    it('fails secure when CRON_SECRET environment variable is missing', () => {
        const originalSecret = process.env.CRON_SECRET;
        delete process.env.CRON_SECRET;

        try {
            const req = new Request('https://example.com/api/cron/send-reminders', {
                headers: { authorization: 'Bearer some-token' },
            });
            const result = verifyCronAuth(req);
            assert.equal(result.isAuthorized, false);
            assert.equal(result.errorResponse?.status, 401);
        } finally {
            process.env.CRON_SECRET = originalSecret;
        }
    });

    it('rejects requests with missing Authorization header', () => {
        const originalSecret = process.env.CRON_SECRET;
        process.env.CRON_SECRET = 'super-secret-test-token';

        try {
            const req = new Request('https://example.com/api/cron/send-reminders');
            const result = verifyCronAuth(req);
            assert.equal(result.isAuthorized, false);
            assert.equal(result.errorResponse?.status, 401);
        } finally {
            process.env.CRON_SECRET = originalSecret;
        }
    });

    it('rejects requests with non-Bearer authorization scheme', () => {
        const originalSecret = process.env.CRON_SECRET;
        process.env.CRON_SECRET = 'super-secret-test-token';

        try {
            const req = new Request('https://example.com/api/cron/send-reminders', {
                headers: { authorization: 'Basic dXNlcjpwYXNz' },
            });
            const result = verifyCronAuth(req);
            assert.equal(result.isAuthorized, false);
            assert.equal(result.errorResponse?.status, 401);
        } finally {
            process.env.CRON_SECRET = originalSecret;
        }
    });

    it('rejects requests with an empty Bearer token', () => {
        const originalSecret = process.env.CRON_SECRET;
        process.env.CRON_SECRET = 'super-secret-test-token';

        try {
            const req = new Request('https://example.com/api/cron/send-reminders', {
                headers: { authorization: 'Bearer ' },
            });
            const result = verifyCronAuth(req);
            assert.equal(result.isAuthorized, false);
            assert.equal(result.errorResponse?.status, 401);
        } finally {
            process.env.CRON_SECRET = originalSecret;
        }
    });

    it('rejects requests with an invalid Bearer token', () => {
        const originalSecret = process.env.CRON_SECRET;
        process.env.CRON_SECRET = 'super-secret-test-token';

        try {
            const req = new Request('https://example.com/api/cron/send-reminders', {
                headers: { authorization: 'Bearer wrong-token' },
            });
            const result = verifyCronAuth(req);
            assert.equal(result.isAuthorized, false);
            assert.equal(result.errorResponse?.status, 401);
        } finally {
            process.env.CRON_SECRET = originalSecret;
        }
    });

    it('authorizes requests with correct Bearer token matching CRON_SECRET', () => {
        const originalSecret = process.env.CRON_SECRET;
        process.env.CRON_SECRET = 'super-secret-test-token';

        try {
            const req = new Request('https://example.com/api/cron/send-reminders', {
                headers: { authorization: 'Bearer super-secret-test-token' },
            });
            const result = verifyCronAuth(req);
            assert.equal(result.isAuthorized, true);
            assert.equal(result.errorResponse, undefined);
        } finally {
            process.env.CRON_SECRET = originalSecret;
        }
    });
});
