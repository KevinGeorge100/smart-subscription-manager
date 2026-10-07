# Operations runbook

## Production unavailable

1. Check `/api/health` for process liveness and `/api/ready` for required Firebase Admin variable names.
2. Check the latest Vercel Production deployment, its commit SHA, and any recent failures.
3. Search structured function logs by `requestId`, then `component` and `event`; never copy secrets or user content into incident notes.
4. If the incident began with a deployment, use the [rollback procedure](DEPLOYMENT.md#rollback), then verify the public routes and a login/dashboard flow.

## CI failure

Find the failing job and step (typecheck, lint, tests, application build, or Docker build). Reproduce it locally with the same Node major version and `npm ci`. Fix and rerun; do not tag a release while checks are red.

## Gmail synchronization failure

Filter logs for `gmail_sync_started`, `gmail_sync_completed`, and `gmail_sync_failed`. Compare duration and account/email counts; check OAuth configuration and provider status without logging addresses, message bodies, or tokens.

## AI provider failure

Filter `ai_request_failed` by endpoint and request ID. Check provider configuration and status. Confirm `/` and `/api/health` still work; the AI provider is not part of core readiness.

## Cron failure

Filter `cron_job_started`, `cron_job_skipped`, `cron_job_completed`, and `cron_job_failed` by operation. Verify `CRON_SECRET`, SMTP configuration, and the Vercel schedules in `vercel.json`. Keep Bearer tokens out of logs.

## Firebase readiness failure

Query `/api/ready`; it returns only missing configuration names. Correct the runtime environment in Vercel or the container and redeploy or restart as appropriate. The endpoint does not validate credentials by connecting to Firebase.

## Rollback

Use a supported Vercel rollback to the last healthy Production deployment or revert the bad Git commit and push the revert to `main`. Follow the [deployment guide](DEPLOYMENT.md#rollback) and verify service after recovery.
