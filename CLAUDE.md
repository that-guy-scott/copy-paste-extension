# Auto Copy Selection - Chrome Extension

## Development Rules
- **Code Size Limit**: New or updated code must be 200 lines or less

## Project Overview
**Auto Copy Selection** is a sophisticated Chrome extension that revolutionizes copy-paste workflows with automatic text copying and intuitive hold-to-paste gestures. The extension features 15+ configurable settings across 4 organized categories, making it one of the most customizable clipboard extensions available.

## Architecture & Key Components

### Core Files
- **`content.js`** (500+ lines) - Main content script with copy/paste logic
- **`popup.js`** (350+ lines) - Settings interface with tooltip system
- **`background.js`** - Service worker with default settings initialization
- **`popup.html`** - Settings UI with collapsible sections
- **`content.css`** - Visual styling for notifications and indicators
- **`manifest.json`** - Chrome extension configuration (Manifest V3)

### Build System
- **`build.js`** - Node.js build script that copies files to `dist/` directory
- **`package.json`** - npm configuration with `npm run build` script
- Run with: `node build.js` or `npm run build`

## Core Features & Settings

### Main Functionality
1. **Auto Copy** - Automatically copies selected text via mouse, keyboard, or double-click
2. **Hold-to-Paste** - Click and hold on input fields to paste clipboard contents
3. **Visual Feedback** - Notifications and progress indicators
4. **Website Blacklist** - Disable extension on specific domains

### 15+ Configuration Options
**Basic Settings:**
- `autoCopyEnabled` - Master toggle for auto copy
- `holdPasteEnabled` - Master toggle for hold-to-paste

**Timing Settings:**
- `pasteDelay` (200-1000ms) - Hold duration before pasting
- `statusDuration` (200-5000ms) - Notification display time
- `spinnerDelay` (0-500ms) - When paste indicator appears

**Text & Copy Settings:**
- `previewLength` (10-100 chars) - Characters shown in notifications
- `minSelectionLength` (1-50 chars) - Minimum text length to trigger copy
- `mouseSelectionEnabled` - Enable mouse selection copying
- `keyboardSelectionEnabled` - Enable keyboard selection copying
- `doubleClickEnabled` - Enable double-click copying
- `autoTrimEnabled` - Auto-trim whitespace from copied text
- `duplicatePreventionEnabled` - Skip copying identical text

**Advanced Settings:**
- `movementTolerance` (2-20px) - Mouse movement allowed during paste
- `notificationPosition` - Corner position for notifications (top-right, top-left, etc.)
- `websiteBlacklist` - Domains where extension is disabled

## Development Patterns

### Settings Management
- All settings stored in `chrome.storage.sync`
- Default values defined in `background.js` on installation
- Real-time synchronization across all tabs
- Settings UI uses sliders, toggles, and text inputs

### Event Handling
- Content script uses event delegation for performance
- Selection detection via `mouseup`, `keyup`, and `dblclick` events
- Hold-to-paste uses `mousedown`, `mouseup`, and `mousemove` events
- Smart cleanup to prevent memory leaks

### Visual Feedback System
- Non-intrusive notifications positioned in corners
- Circular progress indicator for paste gestures
- Tooltip system with 15+ contextual help messages
- Mobile-aware design (tooltips disabled on touch devices)

## File Structure
```
├── assets/
│   └── icon-full.png              # High-resolution source logo
├── icons/
│   ├── icon16.png                 # 16x16 browser icon
│   ├── icon48.png                 # 48x48 extension icon  
│   └── icon128.png                # 128x128 store icon
├── dist/                          # Build output directory
├── content.js                     # Main content script (500+ lines)
├── content.css                    # Visual styling
├── background.js                  # Service worker with defaults
├── popup.html                     # Settings interface
├── popup.js                       # Settings logic (350+ lines)
├── manifest.json                  # Extension configuration
├── build.js                       # Build automation script
├── package.json                   # npm configuration
├── DEPLOYMENT_CHECKLIST.md        # Chrome Web Store deployment guide
└── README.md                      # Comprehensive documentation
```

## Development Guidelines

### Code Style
- Modern JavaScript (ES6+) with strict mode
- Extensive inline documentation and comments
- Modular design with clean separation of concerns
- Performance-optimized event handling

### Security & Privacy
- Minimal Chrome permissions: `activeTab`, `storage`, `clipboardRead`
- No data collection or external services
- Local processing only
- Domain isolation via blacklist feature

### Browser Compatibility
- Chrome 88+ with full feature support
- Chromium-based browsers (Edge, Brave, Opera, Vivaldi)
- Manifest V3 compliance

## Common Development Tasks

### Adding New Settings
1. Add default value in `background.js`
2. Add UI element in `popup.html`
3. Add event listener in `popup.js`
4. Implement functionality in `content.js`
5. Update storage sync calls

### Testing
- Test in clean Chrome profile
- Verify all 15+ settings work correctly
- Test auto-copy triggers (mouse, keyboard, double-click)
- Test hold-to-paste on various input types
- Check website blacklist functionality

### Building & Deployment
1. Run `npm run build` to create distribution files
2. Follow `DEPLOYMENT_CHECKLIST.md` for Chrome Web Store submission
3. Required files for distribution are in `dist/` directory
4. Exclude development files (assets/, README.md, etc.)

## Key Variables & Constants

### Content Script Globals
- `isEnabled` - Auto copy state
- `isPasteEnabled` - Hold-to-paste state
- `HOLD_DURATION` - Paste delay timing
- `STATUS_DURATION` - Notification display time
- `PREVIEW_LENGTH` - Text preview length
- `MIN_SELECTION_LENGTH` - Minimum copy length
- `lastCopiedText` - Duplicate prevention tracking

### Performance Optimizations
- Event delegation for memory efficiency
- Lazy initialization for fast startup
- Minimal DOM manipulation
- Cleanup management to prevent leaks

## Troubleshooting Areas
- Auto copy issues: Check triggers, minimum length, blacklist
- Hold-to-paste issues: Adjust movement tolerance, timing
- Performance issues: Disable unused triggers
- Settings problems: Verify Chrome storage permissions

## Version History
- **v2.0** - The Customization Update (current)
  - 15+ configurable settings
  - Professional UI with collapsible sections
  - Tooltip system and accessibility improvements
- **v1.0** - Foundation Release
  - Basic auto-copy and hold-to-paste functionality