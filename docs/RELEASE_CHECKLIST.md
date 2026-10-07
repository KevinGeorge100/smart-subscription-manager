# Release checklist

- [ ] Version selected using Semantic Versioning; package version and `CHANGELOG.md` updated.
- [ ] CI green, including tests, production build, and Docker build/smoke test.
- [ ] CodeQL green.
- [ ] Public build variables and runtime secrets verified in the target environment; no secrets committed.
- [ ] Vercel Production deployment for the intended `main` SHA is complete.
- [ ] `/` responds; `/api/health` returns 200; `/api/ready` returns the expected result.
- [ ] Login and dashboard smoke test completed with an authorized test account.
- [ ] Rollback target and access confirmed.
- [ ] Annotated `vMAJOR.MINOR.PATCH` tag pushed on the validated `main` SHA.
- [ ] Release workflow green and GitHub Release notes present.
