# AFTERLIGHT

**Your only enemy is who you used to be.** An original mobile-first, 60-second arcade game, created with Canvas 2D and Web Audio. No runtime dependencies, database, account, analytics, paid API, external assets, or backend.

## Play
https://sweemingxx.github.io/afterlight/

Drag anywhere inside the arena like a joystick. Release to stop. On desktop, use WASD / arrows; Space triggers a pulse; Escape pauses. Collect diamonds, avoid coral echoes, survive 60 seconds. Every 8 seconds a new echo loops your previous route, up to 6 echoes. 3 shields; 4 shards charge 2 seconds of protection. New echoes have a 1-second grace window at each loop boundary. After a hit you are immune for 110 simulation ticks. A shard is 100 points multiplied by a chain of up to 5; chains expire after 4 seconds. Survival grants 10 points per whole second.

Free run uses a random seed. Daily uses the UTC date, captured on page load, to create the same shard sequence for everyone. Share links include a seed, not personal data. Equal scores are not proof of competition integrity: there is no anti-cheat, server, or global leaderboard. Zen has no damage and does not save ranked scores. Local bests are saved in localStorage, with a session-only fallback if storage is unavailable. No IndexedDB or database.

Service worker caches the game for offline play after the first successful online load. Install availability depends on browser. Audio is optional and synthesized locally. Reduced effects respect the OS preference and can be toggled. Tab-away automatically pauses. Native dialogs provide focus trapping and keyboard dismissal. All graphics and audio are original procedural assets.

## Development
Serve this directory with any static HTTP server. No build step. `node test-core.cjs` runs deterministic engine tests. The simulation uses a fixed 60 Hz timestep and a 360 × 480 logical arena; render resolution is capped at device pixel ratio 2. Slow frames are clamped to avoid sudden simulation jumps.

Files are isolated under `afterlight/` so other projects on this GitHub Pages site are unaffected.
