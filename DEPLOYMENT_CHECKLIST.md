# Chrome Web Store Deployment Checklist

## ✅ Pre-Packaging Preparation
- [ ] Test extension in clean Chrome profile
- [ ] Verify all features work (auto-copy, hold-to-paste, toggles)
- [ ] Check permissions are minimal and justified
- [ ] Update manifest.json version number
- [ ] Add homepage_url to manifest.json
- [ ] Ensure proper extension name and description in manifest

## ✅ Create Distribution Package
- [ ] Create `/dist/` folder for clean build
- [ ] Copy only required files to dist:
  - [ ] manifest.json
  - [ ] content.js
  - [ ] background.js
  - [ ] popup.html
  - [ ] popup.js
  - [ ] content.css
  - [ ] icons/ folder (icon16.png, icon48.png, icon128.png)
- [ ] Exclude development files (assets/, README.md, .gitignore, etc.)
- [ ] Create ZIP file from dist folder contents
- [ ] Test ZIP package by loading as unpacked extension

## ✅ Chrome Web Store Account Setup
- [ ] Create Google Developer account ($5 one-time fee)
- [ ] Access Chrome Web Store Developer Dashboard
- [ ] Verify developer identity if required

## ✅ Store Listing Assets
- [ ] Create 3-5 screenshots (1280x800 or 640x400)
  - [ ] Show auto-copy in action
  - [ ] Show hold-to-paste gesture
  - [ ] Show popup settings
  - [ ] Show visual feedback
- [ ] Create small promo tile (440x280) from original-logo.png
- [ ] Create large promo tile (920x680) - optional
- [ ] Write detailed store description (adapt from README)
- [ ] Select category: Productivity
- [ ] Prepare privacy policy statement (if needed)

## ✅ Upload and Configuration
- [ ] Upload ZIP file to Developer Dashboard
- [ ] Fill out store listing:
  - [ ] Title: "Auto Copy Selection"
  - [ ] Summary description
  - [ ] Detailed description
  - [ ] Category and tags
  - [ ] Screenshots and promotional images
- [ ] Configure pricing (Free)
- [ ] Set target countries/regions
- [ ] Add support contact information

## ✅ Review and Submission
- [ ] Preview store listing
- [ ] Verify all information is accurate
- [ ] Complete content rating questionnaire
- [ ] Submit for Google review
- [ ] Monitor review status (typically 1-3 days)
- [ ] Address any review feedback if required
- [ ] Publish extension once approved

## ✅ Post-Launch
- [ ] Test installation from Chrome Web Store
- [ ] Monitor user reviews and ratings
- [ ] Prepare for future updates and version management

## Required Files for Distribution ZIP

```
dist/
├── manifest.json
├── content.js
├── background.js
├── popup.html
├── popup.js
├── content.css
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Store Listing Description Template

**Title:** Auto Copy Selection

**Summary:** Streamline your copy-paste workflow with automatic text copying and intuitive paste gestures.

**Detailed Description:**
```
🔄 AUTO COPY
• Automatically copies any text you select on web pages
• Works with mouse selection, keyboard selection, and double-click
• Visual feedback shows what was copied

📋 HOLD-TO-PASTE
• Click and hold for 450ms on any input field to paste
• Beautiful visual progress indicator
• Smart targeting - only works on editable elements
• Movement tolerant - small mouse movements won't cancel

⚙️ CONFIGURABLE
• Toggle features independently via popup
• No external dependencies
• Works on all websites
• Privacy-focused - no data collection

Perfect for users who frequently copy and paste text across websites, forms, and applications.
```

## Screenshot Ideas
1. Text selection with copy notification
2. Hold-to-paste gesture with progress indicator
3. Extension popup showing toggle controls
4. Before/after showing paste in input field
5. Multiple features working together

## Privacy Policy Template
```
This extension:
• Only accesses clipboard when you trigger paste gesture
• Does not collect, store, or transmit personal data
• Operates entirely locally within your browser
• Requires no external services or network connections
```