# Verification notes

Documentation review: September 25, 2026.

Environment: Linux, Node.js 25.2.0.

Passed:

- `node --check content.js`, `node --check background.js` and `node --check popup.js`.
- `npm run build`: recreated the distributable files in `dist/`.
- Manifest-referenced script, stylesheet, popup and icon files exist in both the root package and `dist/`.

The root and distributable manifests now link to this repository. No interactive Chrome session was available for selection, hold-to-paste, domain exclusions or preference synchronization checks. Syntax and packaging checks do not establish browser compatibility or accessibility conformance.
