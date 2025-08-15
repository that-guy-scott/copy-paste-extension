document.addEventListener('DOMContentLoaded', function() {
    const copyToggle = document.getElementById('enableToggle');
    const pasteToggle = document.getElementById('pasteToggle');
    const status = document.getElementById('status');
    
    chrome.storage.sync.get(['autoCopyEnabled', 'holdPasteEnabled'], function(result) {
        copyToggle.checked = result.autoCopyEnabled !== false;
        pasteToggle.checked = result.holdPasteEnabled !== false;
        updateStatus(copyToggle.checked, pasteToggle.checked);
    });
    
    copyToggle.addEventListener('change', function() {
        const enabled = copyToggle.checked;
        
        chrome.storage.sync.set({ autoCopyEnabled: enabled }, function() {
            updateStatus(enabled, pasteToggle.checked);
        });
    });
    
    pasteToggle.addEventListener('change', function() {
        const enabled = pasteToggle.checked;
        
        chrome.storage.sync.set({ holdPasteEnabled: enabled }, function() {
            updateStatus(copyToggle.checked, enabled);
        });
    });
    
    function updateStatus(copyEnabled, pasteEnabled) {
        let statusText = '';
        if (copyEnabled && pasteEnabled) {
            statusText = 'Auto copy & paste active';
        } else if (copyEnabled) {
            statusText = 'Auto copy active';
        } else if (pasteEnabled) {
            statusText = 'Hold paste active';
        } else {
            statusText = 'All features disabled';
        }
        
        status.textContent = statusText;
        status.style.color = (copyEnabled || pasteEnabled) ? '#4CAF50' : '#999';
    }
});