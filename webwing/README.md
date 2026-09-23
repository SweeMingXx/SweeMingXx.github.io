# WEB//WING — Rooftop Rush

An original, dependency-free web-slinging arcade. All art is drawn procedurally with Canvas; sound is synthesized with Web Audio. No external assets, tracking, accounts, or runtime dependencies.

**Play:** https://sweemingxx.github.io/webwing/

## Controls
- Space, Up, click or tap the playfield to flap.
- P / Escape pauses or resumes; R retries after a run; M toggles sound.
- Switching tabs, resizing the playfield, or opening a dialog pauses a run.

## Gameplay
Pass each tower pair for 1 point. Three difficulties offer distinct gap sizes and speeds. Gold sparks permanently unlock Midnight Signal at 15 lifetime sparks and Voltage at 40. Every seventh gate has a shield pickup that protects one collision for 5 seconds. District colors change at 10 and 20 points. Milestone badges unlock at 5, 15 and 30 points. Scores are stored separately per difficulty in localStorage. Settings, suits and progression persist on the same browser, with a graceful session-only fallback when storage is blocked.

## Development
Serve this directory with any static HTTP server, for example `python3 -m http.server 8080`, and visit localhost:8080. No build step. The host repository's existing GitHub Pages deployment publishes this folder without modifying other pages.

Fixed-step 120 Hz simulation; device-pixel-ratio-aware responsive canvas; keyboard and touch controls; explicit pause/retry states; semantic dialog controls; reduced decorative motion setting; sound muted by default. This is a visual timing game, not a screen-reader-equivalent game.

All characters, graphics and sounds are original. Not affiliated with Marvel or the creators of Flappy Bird.
