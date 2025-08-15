# Advanced Copy-Paste Features Development Plan

## **Features to Implement:**
- [ ] **Smart Replace Mode** - Auto-replace selected text with clipboard content
- [ ] **Clipboard History** - Remember last 5-10 copied items
- [ ] **Multi-Selection Copy** - Combine multiple selections with modifier key
- [ ] **Paste Preview** - Show what will be pasted before completing action

---

## **Phase 1: Smart Replace Mode**

### **Settings Addition:**
- [x] Add `smartReplaceEnabled` toggle to Advanced Settings
- [x] Add tooltip: "Replace selected text in input fields with clipboard content instead of copying"

### **Logic Implementation:**
- [x] Detect when user selects text in editable elements (input, textarea, contentEditable)
- [x] Check if clipboard has content and Smart Replace is enabled
- [x] Instead of copying selection, replace it with clipboard content
- [x] Show notification: "Replaced with: [clipboard preview]"

### **Technical Details:**
- [x] Modify `handleMouseUp()` and `handleKeyUp()` functions
- [x] Add `isEditableElement()` helper function
- [x] Add `replaceSelectedText()` function using existing paste logic

---

## **Phase 2: Clipboard History**

### **Settings Addition:**
- [ ] Add `clipboardHistoryEnabled` toggle
- [ ] Add `clipboardHistorySize` slider (3-10 items)
- [ ] Add "Clear History" button

### **Storage Structure:**
```javascript
clipboardHistory: [
  { text: "copied text", timestamp: 1234567890, preview: "copied..." },
  // ... up to 10 items
]
```

### **UI Implementation:**
- [ ] Add history indicator to paste spinner
- [ ] Show current history position during paste gesture
- [ ] Cycle through history with mouse wheel during hold-to-paste
- [ ] Visual feedback: "Item 2/5: [preview]"

### **Technical Details:**
- [ ] Modify `copyToClipboard()` to save to history
- [ ] Add `getHistoryItem(index)` function
- [ ] Extend paste functionality to support history navigation

---

## **Phase 3: Multi-Selection Copy**

### **Settings Addition:**
- [ ] Add `multiSelectionEnabled` toggle
- [ ] Add `multiSelectionSeparator` dropdown (Space, Newline, Comma, Custom)
- [ ] Add visual feedback settings

### **Implementation:**
- [ ] Detect Ctrl/Cmd key during selections
- [ ] Store multiple selections in temporary array
- [ ] Show accumulation indicator: "3 selections ready"
- [ ] Combine selections on final action (release modifier or copy command)

### **Visual Feedback:**
- [ ] Highlight accumulated selections with special styling
- [ ] Show selection counter in notification area
- [ ] Clear visual indicators when multi-selection ends

---

## **Phase 4: Paste Preview**

### **Settings Addition:**
- [ ] Add `pastePreviewEnabled` toggle
- [ ] Add `pastePreviewLength` slider (10-50 characters)
- [ ] Add preview position option (above/below cursor)

### **Implementation:**
- [ ] Show preview tooltip during paste hold gesture
- [ ] Display: "Pasting: [clipboard preview]"
- [ ] Position preview near cursor/input field
- [ ] Auto-hide when paste completes or cancels

### **Technical Details:**
- [ ] Modify `showPasteIndicator()` to include preview
- [ ] Add preview popup element with dark background
- [ ] Integrate with clipboard history to show current item

---

## **Settings UI Organization:**

### **New Settings Section: "Advanced Features"**
```
Advanced Features:
├── Smart Replace Mode ☐
├── Multi-Selection Copy ☐  
├── Clipboard History ☐
│   ├── History Size: [5] items
│   └── [Clear History] button
└── Paste Preview ☐
    └── Preview Length: [30] chars
```

### **Enhanced Visual Options:**
```
Visual Options:
├── Hide Toast Notifications ☐
├── Hide Paste Spinner ☐
├── Show Paste Preview ☐
└── Multi-Selection Separator: [Newline ▼]
```

---

## **Technical Implementation Strategy:**

### **File Changes Required:**
- [ ] **background.js** - Add default values for new settings
- [ ] **popup.html** - Add new settings UI section
- [ ] **popup.js** - Add event handlers for new settings
- [ ] **content.js** - Implement core functionality (primary changes)

### **Key Functions to Add:**
- [ ] `handleSmartReplace()`
- [ ] `addToClipboardHistory()`
- [ ] `navigateClipboardHistory()`
- [ ] `handleMultiSelection()`
- [ ] `showPastePreview()`

### **Storage Extensions:**
- [ ] Add 6 new settings properties
- [ ] Add clipboard history array storage
- [ ] Add multi-selection temporary state

### **Backward Compatibility:**
- [ ] All new features default to disabled
- [ ] Existing functionality unchanged
- [ ] Progressive enhancement approach

---

## **Development Notes:**

This implementation will significantly enhance the extension's functionality while maintaining the current user experience for those who prefer the existing behavior. Each phase can be developed and tested independently, allowing for incremental releases.

### **Testing Checklist:**
- [ ] Test smart replace with various input types
- [ ] Verify clipboard history persistence across tabs
- [ ] Test multi-selection with different separator options
- [ ] Validate paste preview positioning and content
- [ ] Ensure backward compatibility with existing features
- [ ] Test all new settings save/load correctly