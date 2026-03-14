/**
 * env.ts — Server-Only Environment Variable Registry
 *
 * Single source of truth for all backend secrets.
 * Throws at first read if a required variable is absent,
 * so misconfiguration surfaces immediately instead of at runtime.
 *
 * ⚠️  Never import this file in client-side code.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[env] Missing required environment variable: "${name}". ` +
        `Add it to .env.local (dev) or your Vercel / Cloud Run dashboard (prod).`
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

// ── Firebase Admin ────────────────────────────────────────────────────────────

export const FIREBASE_PROJECT_ID = () => required('FIREBASE_PROJECT_ID');
export const FIREBASE_CLIENT_EMAIL = () => required('FIREBASE_CLIENT_EMAIL');
export const FIREBASE_PRIVATE_KEY = () =>
  required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

// ── Google / Gemini ───────────────────────────────────────────────────────────

export const GEMINI_API_KEY = () => required('GEMINI_API_KEY');
export const GOOGLE_CLIENT_ID = () => required('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET = () => required('GOOGLE_CLIENT_SECRET');
export const GOOGLE_REDIRECT_URI = () => required('GOOGLE_REDIRECT_URI');

/**
 * Optional: when set (automatically true on Cloud Run), logError will emit
 * structured JSON entries to stdout for Cloud Logging ingestion.
 */
export const GOOGLE_CLOUD_PROJECT = () => optional('GOOGLE_CLOUD_PROJECT');

// ── SMTP ──────────────────────────────────────────────────────────────────────

export const SMTP_HOST = () => required('SMTP_HOST');
export const SMTP_PORT = () => required('SMTP_PORT');
export const SMTP_USER = () => required('SMTP_USER');
export const SMTP_PASS = () => required('SMTP_PASS');

// ── Cron Authentication ───────────────────────────────────────────────────────

/**
 * Shared secret passed as ?secret= query param to cron endpoints.
 * Set in Vercel cron headers or Upstash scheduler.
 */
export const CRON_SECRET = () => required('CRON_SECRET');

// ── RuFlo Orchestration ───────────────────────────────────────────────────────

/**
 * Shared secret that RuFlo sends in the `Authorization: Bearer <secret>`
 * header when posting extraction results to /api/orchestration/ruflo.
 *
 * Generate with: openssl rand -hex 32
 */
export const RUFLO_WEBHOOK_SECRET = () => required('RUFLO_WEBHOOK_SECRET');
