# D_Builds GED Learning Hub — Release Hardening

Source: V13 Expedition Release Candidate, sanitized for a public code repository.

## Start
Open `index.html` in Safari. The current prototype is a single-file HTML/Canvas app using localStorage and IndexedDB. It is not a production multi-user service and has no teacher authentication.

## Privacy
The public branch intentionally contains **no learner backup, real outcomes, scanned attachments, or historical Math Games results**. The default portfolio starts empty with placeholder code `LEARNER-001`. Never commit student exports, screenshots or identifiable fixtures. Test only with synthetic records.

## Capabilities
- Learn, Play, Check, 37-skill LED board, Ridge Run eight-gate bicycle game
- Male/female illustration options, three bicycle styles, terrain, weather and themes
- Guided/game vs independent vs external-practice evidence separation
- Smart Capture/OCR, duplicate review, JSON backup/restore, GED Math Mastery V78 file bridge
- Teacher *presentation mode*, not permission enforcement

## Status
This is a release-hardening branch, **not a cleared commercial release**. Read `CODEX_RELEASE_BRIEF.md` and `AGENTS.md` before edits. Run `npm test` and `npm run lint:html`. Browser regression coverage and owner acceptance remain required. No official GED endorsement is claimed.
