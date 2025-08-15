# Auto Copy Selection

A Chrome extension that streamlines your copy-paste workflow with automatic text copying and intuitive paste gestures.

## Features

### 🔄 Auto Copy
- **Automatic Clipboard Sync**: Any text you select on web pages is instantly copied to your clipboard
- **Smart Selection Detection**: Works with mouse selection, keyboard selection (Shift+arrows), and double-click
- **Visual Feedback**: Unobtrusive notification shows what was copied

### 📋 Hold-to-Paste
- **Gesture-Based Pasting**: Click and hold for 450ms on any input field to paste clipboard contents
- **Visual Progress Indicator**: Beautiful circular progress animation shows hold progress
- **Smart Targeting**: Only activates on editable elements (input fields, textareas, contenteditable areas)
- **Movement Tolerance**: Small mouse movements won't cancel the paste operation

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Usage

### Auto Copy
1. Simply select any text on a webpage
2. The text is automatically copied to your clipboard
3. A brief notification confirms the copy operation

### Hold-to-Paste
1. Copy text to your clipboard (using auto-copy or Ctrl+C)
2. Click and hold on any input field, textarea, or editable area
3. A blue progress indicator will appear after 100ms
4. Keep holding until the circle completes (450ms total)
5. Release to paste the clipboard contents at the cursor position

## Settings

Click the extension icon in your toolbar to access settings:

- **Enable Auto Copy**: Toggle automatic copying of selected text
- **Hold & Release to Paste**: Toggle the hold-to-paste gesture
- **Status Display**: Shows current feature status

Both features can be enabled or disabled independently.

## Supported Elements

The hold-to-paste feature works with:
- Standard input fields (`<input type="text">`)
- Textareas (`<textarea>`)
- Content-editable divs and spans
- Rich text editors that use contenteditable

## Permissions

The extension requires these permissions:

- **activeTab**: To detect text selections and interact with web pages
- **storage**: To save your preference settings
- **clipboardRead**: To read clipboard contents for the paste feature

## Troubleshooting

### Auto Copy Not Working
- Check that the feature is enabled in the extension popup
- Ensure you're selecting text (not just clicking)
- Some websites may prevent clipboard access

### Hold-to-Paste Not Working
- Verify the feature is enabled in settings
- Make sure you're clicking on an editable element
- Hold for the full duration (450ms) without moving the mouse significantly
- Check that your clipboard contains text content

### General Issues
- Try refreshing the webpage after enabling/disabling features
- Restart Chrome if the extension stops responding
- Check the Chrome Extensions page for any error messages

## File Structure

```
├── assets/
│   └── original-logo.png     # Source logo file (high resolution)
├── icons/
│   ├── icon16.png           # 16x16 extension icon
│   ├── icon48.png           # 48x48 extension icon
│   └── icon128.png          # 128x128 extension icon
├── content.js               # Main content script
├── background.js            # Background service worker
├── popup.html              # Extension popup interface
├── popup.js                # Popup functionality
├── content.css             # Content script styles
└── manifest.json           # Extension manifest
```

The `/assets/` folder contains project source files that are not part of the extension package. The `/icons/` folder contains the optimized icons used by the Chrome extension.

## Browser Compatibility

- Chrome 88+
- Chromium-based browsers (Edge, Brave, etc.)

## Version History

### v1.0
- Initial release with auto-copy functionality
- Hold-to-paste gesture implementation
- Visual feedback system
- Configurable settings popup

## Privacy

This extension:
- Only accesses clipboard data when you trigger the paste gesture
- Does not collect, store, or transmit any personal data
- Operates entirely locally within your browser
- Requires no external services or network connections

## Support

For issues, feature requests, or questions, please check the troubleshooting section above or review your browser's extension management settings.