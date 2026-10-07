# Deployment

## Deployment model

Vercel is the primary production host. GitHub's deployment history records `main` commits as Production and branch commits as Preview. The Dockerfile provides a portable alternate runtime; its image is validated in CI but is not published. A GitHub Release marks a validated commit and does not itself deploy to Vercel.

| Environment | Source | Use |
| --- | --- | --- |
| Local | Developer checkout | Build and test before review. |
| Preview | Vercel branch or pull-request deployment, when Git integration is configured | Review the candidate with preview-specific configuration. |
| Production | `main` Vercel deployment | Serve the public domain with production configuration. |

Feature branch → pull request → CI, CodeQL and Preview → review → merge to `main` → Vercel Production → health checks → version tag and GitHub Release. Wait for all checks before tagging. Preview is the pre-production environment; there is no permanent staging service.

## Required configuration

Public build variables: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_APP_URL`.

Runtime secrets and server configuration: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` for core Firebase Admin; `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_GENAI_API_KEY` or `GEMINI_API_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ENCRYPTION_KEY`, and `CRON_SECRET` for their respective features. Set values separately per environment in Vercel or inject them at container runtime. Never commit values or pass secrets as Docker build arguments. `APP_VERSION` and `GIT_SHA` are optional health metadata; release container builds set both. Vercel does not automatically receive them from the release workflow.

## Production verification

After a deployment, verify `/`, `/api/health` (HTTP 200), and `/api/ready` (HTTP 200 when Firebase Admin configuration is present). Check a login and dashboard flow using an authorized test account. Readiness checks configuration presence, not Firebase connectivity. Confirm the Production deployment SHA in GitHub/Vercel rather than assuming a tag caused a deployment.

## Release process

Use Semantic Versioning. Update `package.json` and `CHANGELOG.md`, merge to `main`, and wait for CI, CodeQL, Docker validation, and the Vercel production deployment. Then create and push an annotated `vMAJOR.MINOR.PATCH` tag on that exact `main` commit. The tag workflow re-runs typecheck, lint, tests, application build and Docker build before creating a GitHub Release with generated notes. It does not publish an image or deploy to production. See [release checklist](RELEASE_CHECKLIST.md).

## Rollback

For an urgent deployment-caused outage, locate the last healthy Production deployment in Vercel and use its supported rollback mechanism if the project and account permit it; verify `/`, `/api/health`, and `/api/ready` afterward. Vercel's Hobby plan may only allow rollback to the immediately previous Production deployment. Promotion of a suitable existing deployment may require a production rebuild and environment review. Check the actual deployment and permissions before acting.

Alternatively, `git revert <bad_commit>` and `git push origin main` preserve history and trigger a new validated Production deployment. Wait for CI and the deployment, then repeat verification. Never force-push or reset shared production history. See [runbook](RUNBOOK.md).

## Recommended `main` protection

Branch protection is **not currently enabled** (GitHub API returned “Branch not protected” during Step 8). Recommend requiring a pull request, the CI and CodeQL checks, blocking force pushes, and blocking branch deletion. Configure these in repository settings when available; this document does not imply they are active.
