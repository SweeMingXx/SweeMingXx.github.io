# Spider-Man — Be Greater

An original, unofficial cinematic fan concept. Not affiliated with Marvel or Sony.

**Live site:** https://sweemingxx.github.io/spider-man/

## Features
- Procedural Three.js mask with Classic, Symbiote, and Miles Morales suits.
- Interactive canvas fallback when WebGL or the CDN is unavailable.
- Animated city skyline, rain, embers, web-swing effect, and pausable news ticker.
- Character dossiers, original illustrated portraits, and a silent fan-made motion teaser.
- Loadout builder with 4 web-shooter mods and 4 gadgets (up to 2 equipped).
- Personalized 900 × 1200 PNG export, shareable loadout URLs, and local persistence.
- Responsive layouts, keyboard controls, focus-managed dialogs, and reduced-motion support.

## Run locally
Serve this directory with any static server, for example `python -m http.server 8000`, then visit `http://localhost:8000/`.

No build step. Three.js and Barlow fonts load from public CDNs; the canvas experience uses locally generated artwork. Suit ratings are fictional design values. The ticket dialog only links to external official movie and cinema services.

## Deployment
Files are published beneath `/spider-man/` in the existing GitHub Pages repository. The homepage and other projects are not changed.

## Validation
JavaScript syntax and a simulated DOM/canvas functional suite were checked, including suit switching, gadget limits, persistence, poster download dispatch, share-link encoding, dialog dismissal, and fallback animation. A real-browser visual/WebGL test was not available in the build environment.
