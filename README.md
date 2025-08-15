<div align="center">
  <img src="assets/icon-full.png" alt="Auto Copy Selection Logo" width="200"/>
  
  # Auto Copy Selection
  
  [![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-brightgreen?style=flat-square&logo=google-chrome)](https://chrome.google.com/webstore)
  [![Version](https://img.shields.io/badge/version-2.0-blue?style=flat-square)](https://github.com)
  [![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
  [![Made with Love](https://img.shields.io/badge/made%20with-%E2%9D%A4-red?style=flat-square)](https://github.com)
  
  A powerful Chrome extension that revolutionizes your copy-paste workflow with automatic text copying, intuitive paste gestures, and comprehensive customization options.
</div>

## ✨ Features Overview

Transform your browsing experience with **15+ configurable settings** across **4 organized categories**, making this one of the most customizable clipboard extensions available.

### 🔄 Intelligent Auto Copy
- **Smart Selection Detection**: Copy text via mouse selection, keyboard shortcuts (Shift+arrows, Ctrl+A), or double-click
- **Selective Triggers**: Enable/disable specific copy methods individually
- **Minimum Length Filter**: Prevent copying accidental micro-selections (1-50 characters)
- **Duplicate Prevention**: Skip copying identical text twice in a row
- **Auto-trim Whitespace**: Automatically clean up copied text formatting

### 📋 Advanced Hold-to-Paste
- **Gesture-Based Pasting**: Click and hold on input fields to paste clipboard contents
- **Customizable Timing**: Adjust hold duration (200-1000ms) to match your preference
- **Visual Progress Indicator**: Beautiful circular animation with configurable delay (0-500ms)
- **Movement Tolerance**: Customize mouse sensitivity (2-20px) for paste cancellation
- **Smart Targeting**: Works with input fields, textareas, and contenteditable areas

### 🎨 Visual Customization
- **Notification Positioning**: Choose from 4 corner positions for status messages
- **Status Duration Control**: Customize how long notifications stay visible (200-5000ms)
- **Preview Length**: Control text preview in notifications (10-100 characters)
- **Spinner Animations**: 8 different paste indicator styles (Circular Progress, Bouncing Dots, Animated Bars, Simple Pulse, Spinning Spiral, Ripple Waves, Grid Matrix, Progress Loader)
- **Visual Options**: Hide toast notifications or paste spinner completely
- **Unobtrusive Design**: Clean interface with optional visual feedback

### 🛡️ Privacy & Control
- **Website Blacklist**: Disable extension on specific domains (banking, secure sites)
- **Domain Matching**: Supports exact domains and subdomains
- **Real-time Toggle**: Instant enable/disable without page refresh
- **Local Operation**: No data collection or external services

### 🎛️ Professional Settings Interface
- **Collapsible Sections**: Organized, space-efficient settings layout
- **Helpful Tooltips**: Non-intrusive explanations for every setting
- **Real-time Updates**: Changes apply immediately across all tabs
- **Accessibility**: Full keyboard navigation and screen reader support

### 🎨 Enhanced UI Design
- **Custom Checkboxes**: Themed green checkboxes with smooth animations
- **Modern Dropdowns**: Enhanced styling with custom arrows and shadows
- **Interactive Sliders**: Progress gradients and responsive hover effects
- **Consistent Styling**: Unified design language across all form elements
- **Visual Feedback**: Hover states and micro-interactions for better UX

## 📱 Settings Categories

### Basic Settings
- **Enable Auto Copy**: Master toggle for automatic text copying
- **Hold & Release to Paste**: Master toggle for gesture-based pasting

### Timing Settings  
- **Paste Delay** (200-1000ms): Hold duration before pasting
- **Status Duration** (200-5000ms): How long notifications stay visible
- **Spinner Delay** (0-500ms): When paste indicator appears

### Text & Copy Settings
- **Preview Length** (10-100 chars): Characters shown in notifications
- **Min Selection** (1-50 chars): Minimum text length to trigger copy
- **Copy Triggers**: Individual control over mouse, keyboard, and double-click
- **Smart Features**: Auto-trim whitespace and duplicate prevention
- **Spinner Style**: Choose from 8 different paste animation styles

### Advanced Settings
- **Movement Tolerance** (2-20px): Mouse movement allowed during paste
- **Notification Position**: Choose corner for displaying notifications
- **Visual Options**: Hide toast notifications and paste spinner
- **Website Blacklist**: Domains where extension is disabled

## 🚀 Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## 💡 Usage Examples

### Quick Setup for Power Users
1. **Increase paste delay** to 800ms for more deliberate gestures
2. **Enable duplicate prevention** to avoid clipboard noise
3. **Set minimum selection** to 3 characters to prevent accidental copies
4. **Add banking domains** to blacklist for security

### Accessibility Configuration
1. **Position notifications** in preferred corner
2. **Extend status duration** to 5000ms for easier reading
3. **Increase preview length** to 60 characters for more context
4. **Disable mouse triggers** if using keyboard-only navigation

### Developer/Writer Workflow
1. **Enable all copy triggers** for maximum flexibility
2. **Set preview length** to 100 characters for code snippets
3. **Reduce paste delay** to 200ms for rapid workflow
4. **Use bottom positioning** to avoid interfering with dev tools

## 🔧 Advanced Configuration

### Website Blacklist Examples
```
banking.com
mail.google.com
*.secure-site.org
company.workday.com
```

### Performance Optimization
- **Disable unused triggers**: Turn off double-click if not needed
- **Optimize delays**: Shorter durations for faster workflow
- **Mobile detection**: Tooltips automatically disabled on touch devices

## 🛠️ Technical Features

### Smart Text Processing
- **Unicode support**: Handles international characters and emojis
- **Whitespace normalization**: Removes formatting artifacts
- **Length validation**: Prevents empty or oversized selections
- **Encoding preservation**: Maintains text integrity

### Performance Optimizations
- **Event delegation**: Efficient memory usage
- **Lazy initialization**: Fast startup time
- **Cleanup management**: Prevents memory leaks
- **Minimal DOM manipulation**: Smooth user experience

### Modern UI Design
- **CSS Custom Properties**: Theme-consistent styling with green accent color (#4CAF50)
- **Smooth Animations**: 0.3s transitions for all interactive elements
- **Custom Form Elements**: Styled checkboxes, dropdowns, and sliders
- **Responsive Feedback**: Hover states with scale transforms and shadows
- **Progressive Enhancement**: Graceful fallbacks for older browsers

### Security & Privacy
- **Local processing**: All operations happen in your browser
- **No data collection**: Zero telemetry or analytics
- **Domain isolation**: Blacklist prevents operation on sensitive sites
- **Permission minimization**: Only required Chrome APIs used

## 📋 Supported Elements

### Copy Sources
- Selected text on any webpage
- Text fields and textareas
- Contenteditable elements
- Rich text editors
- Code blocks and pre-formatted text

### Paste Targets
- Standard input fields (`<input type="text">`)
- Multi-line textareas (`<textarea>`)
- Content-editable divs and spans
- Rich text editors (TinyMCE, CKEditor, etc.)
- Web-based IDEs and code editors

## 🔐 Permissions

The extension requires these minimal permissions:

- **activeTab**: Detect text selections and interact with current tab
- **storage**: Save your personalized settings
- **clipboardRead**: Access clipboard for paste functionality

**Privacy Guarantee**: No data is collected, transmitted, or stored outside your browser.

## 🐛 Troubleshooting

### Auto Copy Issues
- **Not copying**: Check if feature is enabled and minimum length is met
- **Wrong trigger**: Verify which copy triggers are enabled
- **Duplicate skipping**: Check if duplicate prevention is enabled
- **Site blocking**: Verify domain isn't in blacklist

### Hold-to-Paste Issues
- **Too sensitive**: Increase movement tolerance setting
- **Too slow**: Decrease paste delay time
- **Indicator missing**: Reduce spinner delay or check if element is supported
- **Position issues**: Try different notification positions

### Performance Issues
- **Slow response**: Disable unused copy triggers
- **High memory**: Check for runaway tooltip creation
- **Conflicts**: Add problematic sites to blacklist

### Settings Problems
- **Not saving**: Check Chrome storage permissions
- **Reset issues**: Clear extension data in Chrome settings
- **Tooltip bugs**: Disable and re-enable extension

## 📁 File Structure

```
├── assets/
│   └── icon-full.png           # High-resolution source logo
├── icons/
│   ├── icon16.png              # 16x16 browser icon
│   ├── icon48.png              # 48x48 extension icon
│   └── icon128.png             # 128x128 store icon
├── dist/                       # Build output directory
├── content.js                  # Main content script (500+ lines)
├── content.css                 # Visual styling
├── background.js               # Service worker with default settings
├── popup.html                  # Settings interface with enhanced UI
├── popup.js                    # Settings logic with tooltip system (350+ lines)
├── build.js                    # Node.js build script
├── package.json                # npm configuration
└── manifest.json              # Extension configuration
```

## 🌟 What Makes This Special

### Enterprise-Level Customization
- **15+ configurable options** for precise workflow tuning
- **Granular control** over every aspect of copy-paste behavior
- **Professional interface** with intuitive organization
- **Accessibility compliance** with full keyboard and screen reader support

### Advanced User Experience
- **Non-intrusive tooltips** that appear only when needed
- **Smart positioning** that adapts to available space
- **Real-time updates** across all browser tabs
- **Mobile-aware** design that disables inappropriate features

### Developer-Friendly Architecture
- **Modular design** with clean separation of concerns
- **Extensive documentation** with inline code comments
- **Performance optimized** with efficient event handling
- **Extensible structure** for future feature additions

## 🎯 Browser Compatibility

- **Chrome 88+**: Full feature support
- **Chromium-based browsers**: Edge, Brave, Opera, Vivaldi
- **Progressive enhancement**: Graceful degradation on older versions

## 📈 Version History

### v2.0 - The Customization Update
- **Phase 1**: Core UX improvements with 4 new sliders
- **Phase 2**: Advanced visual customization with 3 new controls
- **Phase 3**: Professional features with selective triggers, blacklist, and smart features
- **Tooltip System**: Comprehensive help system with 15+ explanations
- **UI Overhaul**: Collapsible sections and modern interface design
- **Enhanced Styling**: Custom checkboxes, dropdowns, and sliders with green theme
- **Settings Reorganization**: Improved logical grouping of timing vs visual settings
- **8 Spinner Styles**: Multiple paste animation options for personalization
- **Build System**: Automated build process with npm integration

### v1.0 - Foundation Release
- Initial auto-copy functionality
- Basic hold-to-paste implementation
- Simple settings interface
- Core visual feedback system

## 🤝 Contributing

This extension demonstrates modern Chrome extension development with:
- **Manifest V3** compliance
- **Modern JavaScript** (ES6+)
- **Responsive CSS** with smooth animations
- **Accessibility best practices**
- **Performance optimization** techniques

## 📞 Support

For technical issues:
1. Check the troubleshooting section above
2. Verify your Chrome version compatibility
3. Review browser console for error messages
4. Test in incognito mode to isolate conflicts

For feature requests or bugs, ensure you've explored all 15+ settings options first - the solution might already be available through configuration!

---

**Auto Copy Selection** - Transforming productivity, one copy-paste at a time. ⚡