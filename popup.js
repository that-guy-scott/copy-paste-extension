document.addEventListener('DOMContentLoaded', function() {
    const copyToggle = document.getElementById('enableToggle');
    const pasteToggle = document.getElementById('pasteToggle');
    const delaySlider = document.getElementById('delaySlider');
    const delayValue = document.getElementById('delayValue');
    const status = document.getElementById('status');
    
    chrome.storage.sync.get(['autoCopyEnabled', 'holdPasteEnabled', 'pasteDelay'], function(result) {
        copyToggle.checked = result.autoCopyEnabled !== false;
        pasteToggle.checked = result.holdPasteEnabled !== false;
        const delay = result.pasteDelay || 450;
        delaySlider.value = delay;
        delayValue.textContent = delay + 'ms';
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
    
    delaySlider.addEventListener('input', function() {
        const delay = parseInt(delaySlider.value);
        delayValue.textContent = delay + 'ms';
        
        chrome.storage.sync.set({ pasteDelay: delay });
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