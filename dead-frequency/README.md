# DEAD FREQUENCY

An original, browser-playable open-city zombie survival FPS. Built for GitHub Pages with procedural Three.js art and synthesized Web Audio. No asset packs, licensed characters, accounts, analytics, or backend.

**Play:** https://sweemingxx.github.io/dead-frequency/

## The loop
Explore Ashfall City, collect supply caches, restore three radio relays (5 seconds each), and reach the northern extraction pad. Hold the pad for 8 seconds to escape. City streets remain freely explorable throughout the run. This is a complete small single-player browser game, not an AAA production or multiplayer service.

## Features
- First-person mouse capture, fallback drag-to-look, keyboard movement, sprint, jump, aim, reload and weapon switching.
- Carbine (24-round magazine) and shotgun (6-shell magazine), headshot damage, building occlusion, finite reserve ammunition and nearby enemy sound attraction.
- Walkers and runners, obstacle avoidance, melee attacks, stamina, medkits and a central healing safehouse.
- 36 city blocks with procedural buildings, rooftops, windows, street lights, abandoned cars, trees, signage and atmospheric particles.
- Three relay objectives, 28 supply caches, minimap, full paused tactical map, objective markers, victory and death screens.
- 240-second day/night cycle with more aggressive infected at night.
- Local player / inventory / looted-cache / objective persistence every 15 seconds and on pause. Enemy positions are regenerated on load. Saved progress is removed after victory or death.
- Touch movement, drag-look and action buttons. Desktop or landscape tablet recommended.
- Locally saved sensitivity, volume, camera bob, resolution and touch preferences; error recovery, focus styling, modal focus containment, help and pause.

## Controls
WASD / arrows move; mouse looks; left mouse fires; right mouse aims; Shift sprints; Space jumps; R reloads; 1 / 2 switches weapons; E loots or activates; Q uses a medkit; M opens a paused map; Escape pauses. On touch devices use the displayed controls.

## Run locally
Serve this directory with any static HTTP server, e.g. `python -m http.server 8000`, and open http://localhost:8000. WebGL and an initial connection to jsDelivr are required to load the pinned Three.js dependency. No connection is needed during an already-loaded run; offline reload is not guaranteed. Browser storage is device-specific and can be unavailable in private browsing. No npm build is required for the game.

## Architecture
`index.html` contains the interface, world generation, simulation, audio, persistence, settings and rendering. The simulation clamps frame delta and pauses on focus loss, map viewing or pointer unlock. Geometry and materials are reused, and windows are instanced. The city seed is deterministic. Standard GitHub Pages branch publishing hosts this project under `/dead-frequency/` without changing other projects.

## Validation
The path-scoped `dead-frequency-check.yml` workflow installs Playwright on an isolated GitHub runner, checks desktop/touch viewports, exercises the game loop, and uploads screenshots and results. It also checks the deployed public URL after publication. `?test=1` exposes an opt-in simulation bridge for these tests; normal play has no test bridge.

## Limitations
Stylized procedural art, no multiplayer, no interiors, no controller support, and no cross-device cloud saves. The simulation is designed around one compact open city and a repeatable extraction mission. Touch performance depends on GPU capability; turn off high resolution if needed.
