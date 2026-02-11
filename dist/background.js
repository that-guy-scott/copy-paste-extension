const DEFAULTS = {
    autoCopyEnabled: true,
    holdPasteEnabled: true,
    pasteDelay: 450,
    statusDuration: 2000,
    previewLength: 30,
    minSelectionLength: 1,
    movementTolerance: 8,
    spinnerDelay: 500,
    notificationPosition: 'top-right',
    mouseSelectionEnabled: true,
    keyboardSelectionEnabled: true,
    doubleClickEnabled: true,
    autoTrimEnabled: true,
    duplicatePreventionEnabled: false,
    websiteBlacklist: '',
    hideToastNotifications: false,
    hidePasteSpinner: false,
    spinnerStyle: 'circular',
    smartReplaceEnabled: false
};

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        chrome.storage.sync.set(DEFAULTS, function() {
            if (chrome.runtime.lastError) {
                console.error('Failed to set defaults:', chrome.runtime.lastError.message);
            }
        });
    } else if (details.reason === 'update') {
        chrome.storage.sync.get(Object.keys(DEFAULTS), function(existing) {
            if (chrome.runtime.lastError) {
                console.error('Failed to read settings:', chrome.runtime.lastError.message);
                return;
            }
            const missing = {};
            for (const [key, value] of Object.entries(DEFAULTS)) {
                if (!(key in existing)) {
                    missing[key] = value;
                }
            }
            if (Object.keys(missing).length > 0) {
                chrome.storage.sync.set(missing, function() {
                    if (chrome.runtime.lastError) {
                        console.error('Failed to set missing defaults:', chrome.runtime.lastError.message);
                    }
                });
            }
        });
    }
});
