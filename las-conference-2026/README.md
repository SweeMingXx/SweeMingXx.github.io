# Libraries for Tomorrow — LAS Conference 2026

Live edition: https://sweemingxx.github.io/las-conference-2026/

An independent conference reading edition, built from the 14 PDF reports supplied by the project owner and the official programme at https://las.org.sg/conference/. Not an official LAS publication.

## Coverage and editorial policy

- All 14 uploaded documents are separately indexed, accounting for 57 original pages.
- There are 13 distinct full texts: the two uploaded Future of Librarianship panel files have identical extracted text and share one web text without losing either source record.
- The executive report, complete 33-quotation anthology, six Day 1 uploads and six Day 2 uploads are included.
- Narratives, speaker roles, comparison tables, diagram labels, quantitative specifications, strategic recommendations and quotations are retained. Running PDF page furniture is omitted; line breaks and ligatures are normalised for web reading. The original PDF visual layouts are not reproduced on the live site.
- Misleading filenames and conflicting source statements are explained in the reading room and the source index. No unsupported reconciliation is silently applied.
- Sessions appearing only in the official programme are clearly labelled when no standalone report was supplied. Missing programme times are not invented.
- Claims and quotations are attributed to the supplied reports, not presented as independently fact-checked transcripts.

## Experience

Original SVG folio artwork, subtle scroll parallax, section reveals and reading progress. Natural browser scrolling is never hijacked. Motion can be disabled and the system reduced-motion preference is respected.

The full-screen reading room supports native modal focus containment, Escape, direct report links, section navigation, adjustable text, device-local saved reports, full-text downloads and print styling. Search indexes every report, including tables and quotations. There are no analytics, tracking scripts, remote fonts, external visual assets or runtime dependencies.

## Structure

- `index.html`: semantic page and reader shell
- `styles.css`: responsive layout, typography, motion, reader and print rules
- `app.js`: safe text rendering, navigation, search, bookmarks and motion
- `data.js`: source manifest and linked programme
- `reports/*.md`: complete, reformatted report texts
- `tests/verify.mjs`: Playwright browser checks and axe accessibility checks
- `verification/results.json`: latest persisted test and live-check evidence
- `verification/*.png`: browser screenshots

## Run locally

Serve this directory over HTTP (ES modules and fetch do not work reliably from file://):

```sh
python3 -m http.server 8080
```

Open http://localhost:8080/ . No build step is required.

## Validate

```sh
npm ci
npx playwright install --with-deps chromium
npm test
```

The verification workflow uses Ubuntu 24.04 and checks all report readers, source-entry counts, linked programme entries, search and recovery, saved reports, section navigation, print behaviour, keyboard controls, reduced motion, responsive layouts at 375px/768px/1024px/1440px, network failure/retry, browser exceptions and the live HTTPS deployment. Axe checks cover WCAG A/AA rules; automated results do not replace a full human accessibility audit.

The site lives in its own folder. Other GitHub Pages projects in this repository are untouched.
