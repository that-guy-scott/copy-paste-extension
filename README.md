# Auto Copy Selection

A Chrome extension for automatically copying selected text and pasting with a hold gesture. It lets you tune copying, gesture timing and visual feedback for repetitive browser work.

<img src="assets/icon-full.png" alt="Auto Copy Selection icon" width="160">

## Features

- Copy triggers for mouse selection, keyboard selection and double-click.
- Minimum selection length, whitespace trimming and duplicate-copy controls.
- Hold-to-paste for supported inputs, textareas and editable elements.
- Configurable delay, movement tolerance, notifications and paste indicators.
- A domain exclusion list and a settings popup.

This is a source-distributed Manifest V3 extension. The manifest and package currently identify version **1.0.0**. No verified Chrome Web Store listing is linked here.

## Install from source

```bash
git clone https://github.com/that-guy-scott/copy-paste-extension.git
cd copy-paste-extension
```

1. Open `chrome://extensions/` in Chrome.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this repository's root directory, which contains `manifest.json`.
4. Open an ordinary HTTP/HTTPS page and use the extension popup to configure it. Reload existing tabs if needed.

A Node.js build script can also create a `dist/` copy:

```bash
npm run build
```

The build uses Node's built-in modules and needs no npm dependencies. Load either the root or `dist/`, not both. It replaces the existing `dist/` directory.

## Use and limitations

Select text to copy it. Enable hold-to-paste and hold on a supported editable field to paste. Increase the hold delay or movement tolerance if gestures trigger too easily. Disable unwanted copy triggers and exclude sites where the behavior interferes with the page.

Chrome restricts content scripts on browser-internal pages and some other surfaces. Rich text editors and application-specific inputs can behave differently; compatibility with every editor or Chromium browser is not established. The repository does not include an automated browser test suite or an accessibility conformance audit.

## Permissions and settings

The [manifest](manifest.json) requests `activeTab`, `storage`, `clipboardRead` and `clipboardWrite`, and injects content scripts on HTTP and HTTPS pages.

Clipboard interactions occur in the browser. Settings use `chrome.storage.sync`, so Chrome can synchronize preferences through the signed-in browser account. The source does not contain a separate analytics service; this is not a promise that all browser settings remain only on one device.

## Code and validation

- [content.js](content.js): copy/paste behavior and page interactions.
- [background.js](background.js): default settings and extension lifecycle.
- [popup.js](popup.js) / [popup.html](popup.html): settings interface.
- [build.js](build.js): package files into `dist/`.

```bash
node --check content.js
node --check background.js
node --check popup.js
npm run build
```

These checks validate syntax and packaging. Manual testing should cover selection, paste gestures, excluded domains and preference updates on representative sites. See [verification notes](docs/verification.md).

`package.json` declares MIT, but this repository does not currently contain a standalone license file.
