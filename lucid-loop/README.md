# LUCID LOOP

**Play: https://sweemingxx.github.io/lucid-loop/**

An entirely separate, original psychedelic flap arcade. Guide a luminous jellyfish through organic moving gates. Includes procedural Canvas dreamscapes, synthesized pentatonic notes, slow-time focus, perfect-pass streaks, three difficulty modes, three crossfading color worlds and persistent local records.

## Controls
- Space / Up / click / tap the playfield: flap upward.
- Hold Shift or the on-screen Focus button: slow physics and the world to 45% speed. Full energy lasts 2.5 seconds; regeneration takes 10 seconds. Release after depletion to reactivate.
- P / Escape: pause or resume.
- R: retry after a trip.
- M: toggle audio (off by default).

Each gate is worth 1 distance point. Passing within 22 logical pixels of the center earns a perfect pass, increases the consecutive-perfect streak and restores 15% focus. Worlds change every 8 gates. Best scores are separate for Chill, Flow and Warp. The flight log retains the last 6 completed trips.

## Comfort and access
No strobe effects or screen flashes. Calm visuals removes trails, glow and decorative animation and makes gates stationary; it defaults on when the operating system requests reduced motion. Opening panels, tabbing away or resizing pauses gameplay. Touch, keyboard and mouse controls are supported. Dialogs have native focus management. This is a visual timing game, not a screen-reader-equivalent game.

Settings and records use the browser's localStorage, with a session-only fallback when storage is blocked. No accounts, trackers, remote fonts, downloaded sound or runtime dependencies.

## Development
Serve this folder using any static HTTP server. No build step. `index.html`, `style.css` and `game.js` are the complete application. Browser regression tests in `tests` run through the dedicated GitHub Actions workflow. The existing site deployment serves this separate directory without changing WEB//WING or other applications.

All characters, art, sounds and code are original to this project.
