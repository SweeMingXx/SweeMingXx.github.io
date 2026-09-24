# SPECTRA — a new way to feel art

**Live studio:** https://SweeMingXx.github.io/spectra/

An original, browser-only multisensory art studio for InnovArt 2027. It connects generative visual art, sound, and descriptive language without requiring an account, uploaded image processing, or a paid API.

## Why it matters

Visual-first art tools often make sound and accessible alternatives an afterthought. SPECTRA lets one composition drive three complementary representations: a living contour artwork, a playable pentatonic score, and a structural text description. Its goal is creative exploration and artistic translation—not a claim of universal color perception or clinical benefit.

## Working features

- Three original parametric forms: Flow, Bloom, Orbit; four curated starting compositions.
- Five editable colors, palette remixing, and local image-to-palette extraction (PNG/JPEG/WebP, 10 MB maximum and 40 megapixels maximum).
- Hue maps to C/D/E/G/A in a pentatonic scale; brightness selects octave 3 or 4. Three synthesized instruments, tempo 48–120 BPM, adjustable volume, live note highlighting.
- Play the canvas spatially, use number keys 1–5, or select a color using canvas arrow keys and press Enter.
- Reduced-motion support, visual animation pause independent of music, higher-contrast option, semantic controls, keyboard-operable tabs, browser-native dialog focus management, descriptive text, and optional browser speech synthesis.
- Up to 40 named local creations, portable project import/export, and reproducible share URLs containing settings—not source images.
- PNG print (2000 × 1600), stereo WAV (16 seconds, 44.1 kHz, 16-bit PCM), labeled SVG color score, and JSON project exports.
- No runtime JavaScript dependencies. Static HTML, CSS, Canvas 2D and Web Audio. Google Fonts are optional; local system fonts provide fallback.

## 90-second judging demo

1. Start the Amber tides soundscape. Tap different regions of the artwork or press 1–5 and hear the relationship between color and notes.
2. Open Your experience, pause motion and inspect the same composition as a text description and a labeled score.
3. Import an image you own: five locally extracted colors reshape the artwork and retune the soundscape. Nothing is uploaded.
4. Select Bloom, change tempo or instrument, then name and save the piece.
5. Download the soundscape or visual score. Share the composition link and open it in a second browser context to reproduce its settings.

## Hackathon fit

- Transforming artistic expression across media and sensory modalities.
- Developing tools for art and improving creative skills.
- Personalizing artistic expressions and experiences.
- Enhancing audience interaction and participation.
- Accessible/adaptive creative exploration.

## Honest scope

This is a fully functional creative prototype, not a clinically validated tool or a claim of WCAG conformance. Accessibility co-design and testing with blind, low-vision and Deaf artists remains future work. Color-to-note associations are intentionally chosen and explained, not scientifically inherent. Imported images supply a palette, not semantic scene descriptions. Speech synthesis depends on browser support and voices. Shared compositions are not a realtime collaboration service. Collection persistence is device/browser-local: export JSON to back up work.

## Development

Serve this directory with any static HTTP server. There is no build step. The root Pages repository's existing publishing mechanism serves `/spectra/`; unrelated apps are not modified.

Automated browser checks are in `spectra/test-browser.cjs` and `.github/workflows/spectra-check.yml`. They verify studio initialization, artwork rendering, audio playback, presets, settings, keyboard access, local image import, collection persistence, shared links, exports, mobile overflow and live-site readiness. Verification results are persisted in `spectra/verification.json` by the workflow.

## Privacy and rights

Images are processed in memory and discarded after palette extraction. Browser local storage holds settings and saved compositions. The site itself has no analytics, account, server-side image service, or tracking code. GitHub Pages and Google Fonts have their own request handling. Browser narration may use a speech service. Export only assets you are entitled to use.
