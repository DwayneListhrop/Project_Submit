# D_Builds Studio Hub QA — pilot

This is an **initial CI harness**, not a certificate that any app is release-ready.

- GitHub Actions runs on pull requests and main pushes.
- Playwright validates the harness on every run.
- Run **Studio Hub QA → Run workflow** with `target_url` pointing to an actual deployed preview to get a minimal application smoke test.
- A test's "skipped" result is not a pass. Without `target_url`, application coverage is zero.
- Every run uploads `qa-report.json`, Playwright results, and failure evidence for 30 days.
- For native testing use workflow_dispatch with `run_xcode=true`, commit an Xcode project with a shared testable scheme and set repository variable `STUDIO_XCODE_SCHEME`. Configure an available simulator matching the runner image.
- Release readiness stays **false** until each app has its own end-to-end tests, scientific reference fixtures, accessibility checks, security/privacy assessments and stable packaging.
- Protect `main` with required status checks after the pilot is verified; repository administration is a separate operation.
- Cloudflare R2/Workers deployment is not configured by this repository change. Configure scoped credentials, bucket, Worker endpoint, authorization and artifact retention policy before enabling publishing. Never place secrets in source or browser-visible JSON.
- Preserve version history using protected Git tags/releases. Do not delete previous verified builds automatically.
