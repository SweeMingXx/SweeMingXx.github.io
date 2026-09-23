# Layer / Form

An editorial 3D-print portfolio for Swee Ming. Published at https://sweemingxx.github.io/layer-form/ without changing the existing homepage.

## Run

No build or runtime dependencies. From this directory run `python -m http.server 8080`, then open http://localhost:8080.

## Make it yours

- Edit the `PROJECTS` array at the top of `app.js` for titles, descriptions, categories, proposed materials and target dimensions.
- Add original print photographs under `layer-form/images/` and set the matching entry's `image` to `./images/your-photo.webp`. Recommended: optimized WebP, at least 1200 px on its longest edge. Always use images you own or have permission to publish.
- The launch collection consists of six original, procedurally rendered digital concepts. They are not real print photos or verified completed projects. When replacing these with real work, update the sample notice, project status, concept labels, detail disclaimer and about copy to accurately describe your work. Record verified specifications rather than reusing the sample design targets.
- Update the introduction and GitHub contact link in `index.html`. No private contact information is published.
- Edit color tokens at the top of `style.css` to customize the palette.
- Commit to `main` to publish through the existing GitHub Pages configuration. All asset URLs are relative so this folder also works as a standalone project site.

## Interaction and accessibility

Semantic headings and landmarks, skip link, visible keyboard focus, labelled filter state and result count, native modal focus containment and Escape close, focus restoration, keyboard rotation (left/right arrows; Home resets), explicit reset controls, motion toggle with optional local persistence, reduced-motion support and responsive mobile layouts. Scrolling remains native; no scroll hijacking or autoplaying model animation.

The original models use a local Canvas 2D software renderer with shaded parametric meshes. Geometry is cached and rendering is on demand. There is no remote model, image, tracking, analytics or 3D-library dependency. Google Fonts supplies DM Sans and Instrument Serif; local Arial and Georgia fallbacks keep the page readable when fonts cannot load.

Functional objects are concept designs, not fabrication-ready or safety-tested products. Lighting requires appropriate low-heat components and thermal testing. Bowl concept is not represented as food safe.
