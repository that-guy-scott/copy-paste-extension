chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({ 
        autoCopyEnabled: true,
        holdPasteEnabled: true,
        pasteDelay: 450,
        statusDuration: 2000,
        previewLength: 30,
        minSelectionLength: 1,
        movementTolerance: 8,
        spinnerDelay: 100,
        notificationPosition: 'top-right',
        mouseSelectionEnabled: true,
        keyboardSelectionEnabled: true,
        doubleClickEnabled: true,
        autoTrimEnabled: true,
        duplicatePreventionEnabled: false,
        websiteBlacklist: ''
    });
});