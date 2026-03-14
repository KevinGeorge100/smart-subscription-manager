import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    amount = 0;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

// ── Observability Bridge ──────────────────────────────────────────────────────

/**
 * logError — Centralized error logger with RuFlo Monitoring Dashboard bridge.
 *
 * Always logs to console.error (visible in local dev + Vercel Function logs).
 *
 * When the app runs on Google Cloud (Cloud Run / App Hosting), the env var
 * GOOGLE_CLOUD_PROJECT is set automatically. In that case, a structured JSON
 * entry is written to stdout. Cloud Logging picks it up and the
 * "severity":"ERROR" + "workflow_failure":true fields make it trivially
 * filterable inside the RuFlo Monitoring Dashboard.
 *
 * No extra npm dependency required — Cloud Run ingests stdout JSON natively.
 *
 * @param context  Short label, e.g. "ruflo-webhook" or "cron-reminders".
 * @param error    The thrown value (usually an Error instance).
 * @param extra    Optional bag of structured key-value pairs to include.
 */
export function logError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Always log to console (Vercel / local dev)
  console.error(`[${context}]`, errorMessage, extra ?? '', errorStack ?? '');

  // Structured Cloud Logging entry (Cloud Run / GCP App Hosting)
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    const logEntry = {
      severity: 'ERROR',
      message: `[${context}] ${errorMessage}`,
      workflow_failure: true,
      source: context,
      project: process.env.GOOGLE_CLOUD_PROJECT,
      error: errorMessage,
      stack: errorStack,
      ...extra,
      timestamp: new Date().toISOString(),
    };
    // Cloud Logging auto-ingests structured JSON on stdout
    process.stdout.write(JSON.stringify(logEntry) + '\n');
  }
}
