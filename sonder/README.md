# Sonder — A little space to feel

An original, local-first multisensory art studio for InnovArt 2027.

## The idea
A blank canvas and specialist software can exclude people before they begin. Sonder lets a person start with a feeling or a small moment, then shape one deterministic creative recipe across visuals, sound, and language. No account, paid API, AI sentiment inference, or uploaded personal text.

## Features
- Four artist-designed feeling palettes: Still, Radiant, Curious, Tender.
- Three procedural contour families: Flow, Bloom, Orbit. Energy and intricacy drive geometry, musical tempo and layering, and the generated description.
- Seeded text-to-composition hashing: the words affect reproducibility, not semantic interpretation. A remix creates a new seed without rewriting the moment.
- Optional Web Audio pentatonic soundscapes; user-initiated only, stopped when the tab is hidden.
- Text descriptions, optional browser speech, keyboard controls, reduced-motion support, animation pause, and expanded viewing.
- Undo/redo, automatic local draft, private browser collection (24 moments), reversible deletion, JSON backup/import.
- 2400 × 2040 PNG; described SVG; stereo 44,100 Hz, 16-bit, 12-second WAV; editable JSON.
- Privacy-preserving remix links carry art settings, not titles or written moments.
- Offline app shell after a successful first visit. No external font, art, analytics, or runtime library dependencies.

## Running
Serve this directory with any static HTTP server, for example `python3 -m http.server 8080`. ES modules require HTTP rather than file://. GitHub Pages serves the site at `/sonder/`.

## Architecture
`engine.mjs` is the deterministic recipe (validation, seed, geometry, description, note plan, SVG and WAV serializers). `app.mjs` connects native browser APIs and semantic controls. `style.css` is the responsive design system. `sw.js` is scoped to this application only. No build step.

The palette and musical associations are authored creative choices, not empirically validated translations of emotion. This is a creative expression tool, not therapy. Descriptions are structured descriptions, not computer-vision or AI captions. The collection is local-only, not a social platform. Clearing browser data removes stored work; export JSON for backup. Seeds are not cryptographic ownership proofs.

## Hackathon fit
Primary: transforming artistic expressions across sensory modalities, advancing interactivity in art, promoting adaptive art, teaching creative processes, and personalizing artistic experiences. The application includes an optional guided exercise to help a first-time maker compare form, energy, sound, and description.

## A 3-minute demo
1. Frame the barrier: “What if someone wants to create but does not identify as an artist?”
2. Write a small moment, choose a feeling, then move Energy. Explain that this is their control, not a model deciding how they feel.
3. Change Flow to Bloom. Turn on sound; explain shared recipe and deterministic tempo. Open the description to demonstrate a nonvisual route into the composition.
4. Save the work, export SVG or WAV, and open a remix link. Show that private writing is not in the link.
5. Turn off the network after the initial load and continue creating. Close with future co-design and usability testing with diverse artists and assistive-technology users.

## Honest evaluation
Automated browser tests cover workflows, exports, responsiveness and baseline accessibility. They do not establish full accessibility conformance or user benefit. Before submission, conduct consent-based usability sessions with target users, report real findings, and iterate. No fabricated user metrics or award claims are included.

## Design
Warm paper, quiet olive, charcoal, and an acid-lime accent. System sans-serif with an editorial Georgia italic. Native buttons and dialogs; obvious focus rings; motion and audio under user control. Original mathematical line art; no stock asset dependencies.
