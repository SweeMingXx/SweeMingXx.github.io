# Second Serving

A private, browser-based computer-vision food rescue studio. **Live:** https://sweemingxx.github.io/second-serving/

## The user need
Food disappears to the back of the fridge. Second Serving closes a practical loop: identify produce → confirm and prioritise → save a visible shelf → cook a matched meal → log what was actually used.

## Working features
- Upload, drag-and-drop and camera capture with local COCO-SSD inference through TensorFlow.js.
- Five supported visual categories: apple, banana, orange, broccoli, carrot. Manual entry for any ingredient.
- Actual model confidence labels and bounding boxes, editable weights, no fabricated freshness detection.
- Clearly labelled illustrated demo. Demo ingredients cannot be saved or counted as impact.
- Persistent local shelf, editable weights, deletion, user-confirmed use history and undo.
- Six original plant-based recipes, ranked by ingredient match and use-first priority; quick-meal filter; cooking checklists; missing-ingredient clipboard list.
- Responsive layout, accessible native dialogs, keyboard focus, live status messages, reduced motion, errors and recovery paths.

## Run
Serve this directory with any static web server. HTTPS or localhost is required for camera access. There is no build step or backend. GitHub Pages publishes this directory without changing the root site.

## Privacy and limitations
Photos are processed in browser memory, not uploaded or persisted. The first scan downloads TensorFlow.js 4.22.0 and COCO-SSD 2.2.3 from jsDelivr and model assets from Google. Fonts load from Google Fonts. Those services receive standard network request metadata. No analytics or API keys. Shelf/history live under localStorage key `second-serving-v1`; all apps on this Pages origin share an origin. If storage fails, an explicit session-only warning appears.

COCO-SSD is a general object detector, not a specialist food or spoilage model. Multiple detections of one class become one editable ingredient weight. Default weights are user-editable suggestions, not image measurements. Priority is chosen by the user, not an expiration estimate. Totals represent user-confirmed logged weights, not verified avoided waste or carbon savings. Recipes do not verify allergens or food safety. Follow local food-safety advice and package instructions; do not use suspect food.

All interface illustrations and recipe text were created for this project. No stock-photo dependency.

## Validation
The dedicated GitHub Actions workflow validates JavaScript syntax and browser interactions at desktop and mobile sizes, then polls the public Pages URL and repeats smoke tests live. It also exercises real model loading and inference on a blank test image (which must not hallucinate supported produce). A green check is not a guarantee of detection quality on every image or camera compatibility on every device.
