# Codex release task — GED Learning Hub V13

**Objective:** Refactor, test, secure and polish the sanitized V13 single-file learning hub into a commercially distributable product. Work on this branch with small, reviewable commits. Do not merge or deploy without owner approval.

## P0 release gates

1. **Privacy and security:** No historical learner records, backups, screenshots or other identifying data in source/build/test artifacts. New learner: zero attempts, empty progress. Harden import schema, limits, HTML/CSV escaping, attachment handling, duplicate review, and network dependencies. Teacher toggle is UI presentation, not access control: ship single-user/local-only with clear disclosure or implement authenticated server-side roles for multi-user release.
2. **Integrity and recovery:** Preserve the existing localStorage key and IndexedDB format or implement explicit migration. Synthetic backup/export/restore round trips including attachments. Test corrupt JSON, mismatched learner code, interrupted writes and rollback, duplicate IDs, out-of-range scores and malicious filenames. Never silently overwrite user work.
3. **Assessment integrity:** Guided lessons, games and externally reported Math Games scores must never independently count as verified mastery. Ensure eight-gate progress counters match answer history and that each ride writes exactly one game record. Test question generators and keys, repeated small item banks, hints availability, delayed independent checks, and LED thresholds. Do not claim standardized GED readiness.
4. **External code / licenses:** Audit Tesseract.js, PDF.js, any remote scripts and third-party curriculum/resources. Prefer version-pinned, audited assets; provide dependable fallback when offline. Follow applicable copyright and licensing requirements. Never scrape a private TEKS Math Games profile or request credentials.
5. **Safari, accessibility, mobile:** WCAG 2.2 AA target; keyboard and Safari VoiceOver; 320px width, 200% zoom, iPad/iPhone Safari portrait and landscape; reduced-motion control; labels beyond LED color alone; route feedback announced accessibly.
6. **Automated CI:** Unit tests for scoring, evidence classification, duplicate scans, integrity and safe restore; Playwright WebKit smoke/E2E tests; PR CI without production secrets or student data; no regressions.

## P1 user experience

- Modularize 280KB monolithic HTML while preserving behavior.
- Clear first-run onboarding, teacher guide, concise help, offline and backup notices.
- Improve pedal-link geometry, rider choices, bikes and terrain without changing grading.
- Keep signature graphite + mint default, support branded palette alternatives with coherent contrast.
- Finalize privacy policy, terms/support, brand/legal review, accessibility statement, versioning and payment/distribution path.

## Owner acceptance

- Fresh learner shows 0 recorded attempts and 0 verified skills.
- Eight-question ride yields one unverified game event, with correct/visited separately counted.
- Independent formative checks remain locked until scoring; only qualifying checks inform verified progression.
- Suspected OCR duplicates require confirmation; low-confidence results are unscored.
- Synthetic backup restores in a fresh Safari profile with exact record and attachment counts; corrupted restore is nondestructive.
- CI green and actual Mac Safari + iPhone/iPad acceptance passed.

**Explicit exclusions:** do not ship GED-01's private historical data or imply official GED endorsement. Do not merge to main or deploy prior to approval.
