# V13 release status

This is a single-user, browser-local release candidate. Teacher tools change presentation and provide no access restriction. Do not use a shared browser profile for private records. JSON exports contain all records and attachments in plaintext and must be stored privately. Browser storage may be cleared or evicted; save separate backups.

## Implemented hardening

- Empty portfolio on first run, with no historical learner fixtures.
- Restore validates schema, nested collections, record IDs, scores, attachment types and references, and size limits before review.
- Restore requires explicit replacement and learner-code confirmation. New attachments use fresh IDs. A local journal plus copy-on-write commit preserves the old portfolio before commit and the new portfolio after commit; reload resumes cleanup. The original localStorage key, database name and files store remain unchanged. Legacy Blob attachments remain readable; new records add `storageEncoding: arraybuffer-v1` and `blobBytes` for portable WebKit persistence, with Blob reconstruction on read. JSON backup format stays unchanged.
- Failed attachment exports stop instead of reporting an incomplete backup as complete.
- CSV formula neutralization applies to both export paths. Attachment display names remove path separators and control characters.
- Completed sessions are idempotent. Scores are recomputed from selected answers; invalid choices are ignored. Guided/game/external evidence cannot verify progression. Limited banks or repeated item prompts cannot qualify an independent set; imported V78/V2 independence remains unverified.
- Remote OCR/PDF script and model downloads are replaced by pinned local assets. PDF evaluation is disabled and PDF.js is upgraded beyond the CVE-2024-4367 affected range. No network or account connection is required for text capture or core learning.
- Route changes are announced, evidence dialogs trap keyboard focus and support Escape, and progress indicators include text labels.

## Validation and remaining acceptance

Automated unit/runtime tests use only synthetic data. Playwright tests cover Chromium and WebKit; run `npm ci`, `npm run build`, `npx playwright install --with-deps chromium webkit`, then `npm run test:browser`. Browser execution may be restricted in managed desktop environments; such a failure is not a browser pass.

Before commercial release, the owner must complete actual Mac Safari/VoiceOver and iPhone/iPad testing, including rotation, 200% zoom, reduced motion and backup recovery in a fresh profile. A qualified educator must review all question variants and curriculum/resource rights. Privacy/support/terms, branding and hosting security require owner decisions. No standardized GED readiness or endorsement is claimed. Do not merge or deploy until the owner approves.

## Distribution

Run `npm ci && npm run build`. Distribute the entire `dist/` directory, including `vendor/`, licenses and the SHA-256 manifest. Serve it from a dedicated HTTPS origin or a loopback local server; opening a single HTML file via `file://` is insufficient for OCR/PDF workers. Avoid third-party analytics and scripts on the portfolio origin. External resource links contact their destinations only when opened.
