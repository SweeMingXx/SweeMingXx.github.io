# Prism Atlas 1.1 — from creation to exhibition

## New: data composer

Open **Edit these observations** beneath the data selector, or **Be the source** below the studio.

- Edit labels and numeric values with a live preview. Add or remove observations within the existing 3–120-point limit.
- Edit artwork title, dataset name, units, and source/context. Labels are limited to 60 characters; titles and dataset names to 80 characters; units to 16 characters; source/context to 400 characters. Numeric values must be finite and within ±1,000,000,000.
- Audition each observation's mapped pentatonic pitch.
- Validation errors preserve the last valid preview and block applying invalid data.
- The editor is a separate draft. **Keep original**, closing the dialog, and Escape discard it. **Apply to my artwork** creates one undoable change.
- Altered data is explicitly marked as edited, rather than silently inheriting an illustrative dataset's original provenance.

## New: downloadable soundtrack

**Build an exhibition → Download WAV only** exports one pass through the current observations. Audio is synthesized locally; it is not a recording and never accesses a microphone.

Format: mono, 22,050 Hz, 16-bit PCM. Notes begin every 520 ms; the final note has a 1-second tail. Duration is `(number of observations − 1) × 0.52 + 1` seconds. Pitches use the same 11-note C-major pentatonic mapping as the studio. The exported envelope and level are designed for offline playback and are not a bit-for-bit capture of Web Audio output.

## New: portable exhibition

Create a self-contained HTML page containing:

- Original vector artwork, title, optional creator credit, and an optional statement (up to 1,200 characters).
- The exact data-grounded description and original source values.
- An optional embedded WAV with native audio controls; never autoplay.
- The original settings, seed, JSON recipe, and SHA-256 checksum where supported by the originating browser.
- Immersive viewing, a print layout, and recipe download so an audience can later remix the work.

Open the downloaded file directly in a browser. The exhibition itself makes no network requests. Only following its explicit studio link requires internet access. Data, credits, and statements are included in plain text; only distribute data you are permitted to share.

The exhibition creator credit is added to the exported recipe without modifying the current studio session. Exporting is non-destructive. All user-entered content is HTML escaped; JSON embedded in script data blocks also escapes `<`, `>`, and `&`.

## Engineering and deployment

`advanced.js` consumes a narrow `window.PrismStudio` API. Read operations return cloned snapshots; commits use the existing validator, history, and persistence. `scripts/upgrade-core.mjs` is an idempotent, exact-anchor migration that adds the bridge and entrypoint tags to the original application; it refuses ambiguous source. No runtime source rewriting or eval is used.

The narrowly scoped source-upgrade workflow persists only the migrated app, HTML entrypoint, and matching baseline test version. A normal release commit then triggers the repository's existing GitHub Pages branch deployment. Other projects and Pages configuration remain untouched. Browser verification exercises the original studio and the new composer, WAV, safe exhibition, offline, and recovery flows. Reports and screenshots are available as GitHub Actions artifacts.

## A stronger hackathon demo

1. Open the data composer. Change one observation and show the immediate visual response.
2. Audition that observation. Explain normalization and the common data behind art and sound.
3. Apply, undo, and redo to demonstrate safe exploration.
4. Add a short creator statement and download the exhibition with audio.
5. Disconnect from the network and open the downloaded HTML file. Show the image, soundtrack, written story, source table, and remixable recipe.
6. Conclude: a creative process that can move from a learner's private browser to a classroom or community exhibition, without requiring an account, server, or paid API.

## Still not claimed

No live environmental feed, clinical benefit, copyright verification, formal accessibility certification, judging outcome, or book-publication guarantee. Co-design and real-world usability studies remain essential next steps.
