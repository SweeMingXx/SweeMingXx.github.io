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

The homepage uses a typographic editorial poster, a crimson gradient feature with original CSS page sculpture, a clear reading path, and responsive navigation. It links directly to the overview, both-day programme and complete report collection. Decorative motion can be disabled and system reduced-motion settings are respected. Natural browser scrolling is never hijacked.

The full-screen reading room supports native modal focus containment, Escape, direct report links, section navigation, adjustable text, device-local saved reports, full-text downloads and print styling. Search indexes every report, including tables and quotations. There are no analytics, tracking scripts, remote fonts, external visual assets or runtime dependencies.

## Structure

- `index.html`: semantic landing page and reader shell
- `styles.css`: responsive site layout, reader and print rules
- `theme.css`: red colour system for the full experience
- `landing.css`: typography-led homepage, responsive poster and navigation
- `app.js`: safe text rendering, search, bookmarks and motion controls
- `data.js`: source manifest and linked programme
- `reports/*.md`: complete, reformatted report texts
- `tests/verify.mjs`: Playwright browser and axe accessibility checks
- `tests/verify-home.mjs`: live visual layout checks at 375px, 560px, 768px, 1024px and 1440px
- `tests/live.mjs`: exact deployed-asset and live content verification
- `verification/`: historical evidence; current workflow screenshots are available as the `las-conference-verification` Actions artifact

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
node tests/verify-home.mjs
node tests/live.mjs
```

The GitHub Actions workflow uses Ubuntu 24.04 and checks all report readers, source-entry counts, linked programme entries, search and recovery, saved reports, section navigation, print behaviour, keyboard controls, reduced motion, responsive layouts, network failure/retry, browser exceptions, and live HTTPS deployment. Axe checks cover WCAG A/AA rules; automated results do not replace a full human accessibility audit.

The site lives in its own folder. Other GitHub Pages projects in this repository are untouched.
