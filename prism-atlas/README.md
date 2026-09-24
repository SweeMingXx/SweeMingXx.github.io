# Prism Atlas

**A little data. Infinite expression.**

Live: https://SweeMingXx.github.io/prism-atlas/

An independent InnovArt 2027 hackathon project: an inclusive, local-first creative studio that translates one dataset into generative artwork, pentatonic sound, and a grounded written description. This is a working application, not a mockup. No AI or backend is required.

## Why it matters

A blank canvas can exclude people who do not identify as artists. A conventional chart can exclude ways of understanding beyond visual analysis. Prism Atlas offers a low-friction starting point for students, educators, community storytellers, and curious creators: bring a rhythm from your life, explore it through different senses, and keep the creative process—not just the output.

## Working features

- Three original deterministic SVG renderers: woven ribbons, orbital bloom, and contours.
- Four coordinated palettes, live flow/detail controls, seeded variations, 40-state undo/redo.
- Three clearly labelled illustrative datasets, plus local CSV upload/paste: exactly two columns, optional header, 3–120 rows, 64 KB maximum. Quoted CSV labels supported. Finite decimal values within ±1,000,000,000; labels up to 60 characters.
- Data explorer: normalized visual overview, exact accessible table, descriptive statistics, and transparent mappings.
- Browser Web Audio sonification: 11 C-major pentatonic pitches from C3 to C5, one note every 520 ms. Always opt-in. No microphone.
- Data-grounded artwork description and optional browser read-aloud. Speech voice availability and local/network processing depend on the browser.
- Export 2400 × 1800 PNG, vector SVG, original CSV, and JSON creative recipes. SVG and JSON include source data, description, settings, seed, creator credit, timestamp, and SHA-256 recipe checksum.
- Restore JSON recipes (150 KB maximum); editable share links encode the recipe in the URL fragment.
- Local collection of up to 20 pieces, removal with undo, and automatic local session persistence.
- Responsive mobile layout, keyboard controls, native focus-contained dialogs, reduced-motion support, explicit controls for sound and motion, immersive view, and a four-step guided introduction.

## Hackathon fit

1. Integrating environmental and other data into artistic expression.
2. Transforming expression across sensory modalities: visual, musical, written.
3. Promoting adaptive art through alternate interaction and experience paths.
4. Developing creative skills through transparent cause-and-effect controls.
5. Facilitating sharing, exhibition, and creative remixing.
6. Exploring provenance through portable, reproducible creative recipes.

The provenance receipt is **not** a copyright check, ownership certificate, blockchain record, or authenticity guarantee. Accessibility intent is not a substitute for formal testing and co-design with disabled artists.

## A 90-second demo

- **0–15 s:** Show the default Tidal memory piece. Explain that its source is illustrative, not a live ocean feed.
- **15–30 s:** Open Explore data. Trace a high value to a wider fold and higher pitch. The table preserves the original values.
- **30–45 s:** Listen to the piece, then open the written description. One source, different ways of understanding.
- **45–60 s:** Import a simple CSV of personal observations. Change form and palette; undo a variation.
- **60–75 s:** Export a PNG and a JSON recipe. Explain the difference between an image and a reproducible creative process.
- **75–90 s:** Copy a recipe link, open it in another tab, and remix it. Finish with the inclusive, local-first value proposition.

## Run locally

Serve this directory with any static HTTP server, for example `python3 -m http.server 8080`. Open `http://localhost:8080`. No application dependency installation or build step. HTTPS or localhost enables clipboard and SHA-256 Web Crypto features.

The files are `index.html`, `style.css`, `app.js`, and `icon.svg`. System fonts avoid external font requests. All artwork is original procedural geometry; no stock images, licensed artwork, or third-party models are bundled.

## Data mapping

Values are min–max normalized within a dataset; equal-valued datasets map to 0.5. Ribbons use interpolated values to adjust cross-section radius. Bloom and contour modes use them to vary radial distance. A deterministic seeded generator controls phase and background particles. Flow changes geometry; detail changes path count. Artistic geometry is intentionally not a quantitative chart. Sonification quantizes the same normalized values to `[0,2,4,7,9,12,14,16,19,21,24]` semitones above C3.

## Privacy and limitations

- No app server, analytics, account, external fonts, paid API, or remote data feed. GitHub Pages still receives ordinary hosting requests under its own policies.
- Session and collection use this browser's localStorage. Clearing site data removes them. Recipes are the portable backup.
- URL fragments contain data and creator credit. A copied link discloses them to its recipients and any platform used to share it. Do not share private datasets.
- Audio and speech require browser support. Read-aloud may use a browser/vendor voice service. SVG/CSV/description remain available when sound is unavailable.
- Seeded geometry is deterministic; rasterization and speech voices can vary between browsers.
- It is an expressive learning tool, not a medical service, scientific visualization package, data verification service, or official InnovArt event application.
- No prize, award, event selection, or publication outcome is promised.

## Testing and deployment

The repository's existing GitHub Pages branch deployment serves `/prism-atlas/`, leaving other projects unchanged. The scoped GitHub Actions workflow tests the app in Chromium on desktop/mobile, exercises CSV errors and custom data, exports, undo/redo, collection persistence, link round-trips, keyboard behavior, and reduced motion, then verifies the published URL. Reports and screenshots are uploaded as CI artifacts.

## Next research steps

Co-design sessions with blind and low-vision creators; user studies on whether cross-sensory mappings support pattern recognition; richer CSV column selection; localization; offline service-worker support; and user-selected audio instrument/tempo. These are future directions, not features claimed by this prototype.
