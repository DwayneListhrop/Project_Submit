# Project_Submit — Initial non-destructive inventory

Audit date: 2026-11-21. This is a **partial search-based inventory**, not a complete repository tree audit. No source files were moved, renamed, or deleted.

| Path | Classification | Notes | Status |
| --- | --- | --- | --- |
| `ScriptureBridge_BookSite_SingleHTML_WithKeyboards_Themes.html` | Standalone HTML application | Scripture Bridge interactive book site | Located; build untested |
| `portfolio-platform/index.html` | Web app entry point | Loads `/src/main.jsx`; inspect dependencies and build process | Located; build untested |
| `tools/studio-hub-qa/README.md` | Developer tools / QA | Playwright and GitHub Actions pilot | Located; not Studio Hub app |
| `tools/studio-hub-qa/tests/smoke.spec.mjs` | Developer tools / QA | Smoke tests | Located; untested |
| `tools/studio-hub-qa/report.mjs` | Developer tools / QA | QA report generator | Located; untested |
| `tools/studio-hub-qa/package.json` | Developer tools / QA | QA dependencies/scripts | Located; untested |
| `.github/workflows/studio-hub-qa.yml` | CI | Studio Hub QA workflow | Located; untested |

## Repository responsibilities
- `dwayne-lis/d_builds`: primary project registry and development hub.
- `DwayneListhrop/Project_Submit`: existing project source, portfolio platform and QA workflow; retain in place pending review.

## Cleanup queue
1. Enumerate the complete repository tree (search results are not exhaustive).
2. Record source dependencies, commit hashes and actual runnable entry points.
3. Compare files with `d_builds` and flag duplicates by content hash, not filename alone.
4. Check for Xcode projects and confirm buildability; a workflow mention of Xcode is not proof a project exists.
5. Add catalog links in Studio Hub only after its actual source is located and read-only authorization is implemented.
6. Review each proposed migration before any moves or deletions.

**Safety:** Never commit secrets, tokens, signing certificates or build outputs. Do not claim the Studio Hub application is connected yet.

## Verified repository-wide counts (2026-11-21)
- `Project_Submit` main: **14 tracked files**, **7 directory entries**; recursive Git tree response `truncated=false`.
- `d_builds` main: **77 tracked files**, **33 directory entries**; recursive Git tree response `truncated=false`.
- Across both repositories: **91 tracked files** and **40 directory entries**.
- Cross-repository Git blob SHA comparison: **0 exact matching files**. Similar apps or changed versions may still overlap.
- Project_Submit extension counts: 2 HTML, 4 MJS, 3 Markdown, 2 JSON, 1 JSX, 1 CSS, 1 YAML.
- These counts exclude history, branches other than main, untracked local files, and repositories not accessible through the two connected accounts.

## Verified file list (Project_Submit)
- `.github/workflows/studio-hub-qa.yml`
- `PROJECT_INVENTORY.md`
- `ScriptureBridge_BookSite_SingleHTML_WithKeyboards_Themes.html`
- `portfolio-platform/README.md`
- `portfolio-platform/index.html`
- `portfolio-platform/package.json`
- `portfolio-platform/src/main.jsx`
- `portfolio-platform/src/styles.css`
- `tools/studio-hub-qa/README.md`
- `tools/studio-hub-qa/package.json`
- `tools/studio-hub-qa/playwright.config.mjs`
- `tools/studio-hub-qa/report.mjs`
- `tools/studio-hub-qa/tests/portfolio.spec.mjs`
- `tools/studio-hub-qa/tests/smoke.spec.mjs`
