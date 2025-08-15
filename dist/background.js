chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({ 
        autoCopyEnabled: true,
        holdPasteEnabled: true 
    });
});