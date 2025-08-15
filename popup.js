document.addEventListener('DOMContentLoaded', function() {
    const copyToggle = document.getElementById('enableToggle');
    const pasteToggle = document.getElementById('pasteToggle');
    const delaySlider = document.getElementById('delaySlider');
    const delayValue = document.getElementById('delayValue');
    const statusDurationSlider = document.getElementById('statusDurationSlider');
    const statusDurationValue = document.getElementById('statusDurationValue');
    const previewLengthSlider = document.getElementById('previewLengthSlider');
    const previewLengthValue = document.getElementById('previewLengthValue');
    const minSelectionSlider = document.getElementById('minSelectionSlider');
    const minSelectionValue = document.getElementById('minSelectionValue');
    const movementToleranceSlider = document.getElementById('movementToleranceSlider');
    const movementToleranceValue = document.getElementById('movementToleranceValue');
    const spinnerDelaySlider = document.getElementById('spinnerDelaySlider');
    const spinnerDelayValue = document.getElementById('spinnerDelayValue');
    const notificationPosition = document.getElementById('notificationPosition');
    const mouseSelectionTrigger = document.getElementById('mouseSelectionTrigger');
    const keyboardSelectionTrigger = document.getElementById('keyboardSelectionTrigger');
    const doubleClickTrigger = document.getElementById('doubleClickTrigger');
    const autoTrimWhitespace = document.getElementById('autoTrimWhitespace');
    const duplicatePrevention = document.getElementById('duplicatePrevention');
    const websiteBlacklist = document.getElementById('websiteBlacklist');
    const status = document.getElementById('status');
    
    chrome.storage.sync.get([
        'autoCopyEnabled', 
        'holdPasteEnabled', 
        'pasteDelay',
        'statusDuration',
        'previewLength',
        'minSelectionLength',
        'movementTolerance',
        'spinnerDelay',
        'notificationPosition',
        'mouseSelectionEnabled',
        'keyboardSelectionEnabled',
        'doubleClickEnabled',
        'autoTrimEnabled',
        'duplicatePreventionEnabled',
        'websiteBlacklist'
    ], function(result) {
        copyToggle.checked = result.autoCopyEnabled !== false;
        pasteToggle.checked = result.holdPasteEnabled !== false;
        
        const delay = result.pasteDelay || 450;
        delaySlider.value = delay;
        delayValue.textContent = delay + 'ms';
        
        const statusDuration = result.statusDuration || 2000;
        statusDurationSlider.value = statusDuration;
        statusDurationValue.textContent = statusDuration + 'ms';
        
        const previewLength = result.previewLength || 30;
        previewLengthSlider.value = previewLength;
        previewLengthValue.textContent = previewLength + ' chars';
        
        const minSelection = result.minSelectionLength || 1;
        minSelectionSlider.value = minSelection;
        minSelectionValue.textContent = minSelection + ' char' + (minSelection === 1 ? '' : 's');
        
        const movementTolerance = result.movementTolerance || 8;
        movementToleranceSlider.value = movementTolerance;
        movementToleranceValue.textContent = movementTolerance + 'px';
        
        const spinnerDelay = result.spinnerDelay || 100;
        spinnerDelaySlider.value = spinnerDelay;
        spinnerDelayValue.textContent = spinnerDelay + 'ms';
        
        const position = result.notificationPosition || 'top-right';
        notificationPosition.value = position;
        
        mouseSelectionTrigger.checked = result.mouseSelectionEnabled !== false;
        keyboardSelectionTrigger.checked = result.keyboardSelectionEnabled !== false;
        doubleClickTrigger.checked = result.doubleClickEnabled !== false;
        autoTrimWhitespace.checked = result.autoTrimEnabled !== false;
        duplicatePrevention.checked = result.duplicatePreventionEnabled === true;
        websiteBlacklist.value = result.websiteBlacklist || '';
        
        updateStatus(copyToggle.checked, pasteToggle.checked);
        initializeCollapsible();
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
    
    statusDurationSlider.addEventListener('input', function() {
        const duration = parseInt(statusDurationSlider.value);
        statusDurationValue.textContent = duration + 'ms';
        
        chrome.storage.sync.set({ statusDuration: duration });
    });
    
    previewLengthSlider.addEventListener('input', function() {
        const length = parseInt(previewLengthSlider.value);
        previewLengthValue.textContent = length + ' chars';
        
        chrome.storage.sync.set({ previewLength: length });
    });
    
    minSelectionSlider.addEventListener('input', function() {
        const minLength = parseInt(minSelectionSlider.value);
        minSelectionValue.textContent = minLength + ' char' + (minLength === 1 ? '' : 's');
        
        chrome.storage.sync.set({ minSelectionLength: minLength });
    });
    
    movementToleranceSlider.addEventListener('input', function() {
        const tolerance = parseInt(movementToleranceSlider.value);
        movementToleranceValue.textContent = tolerance + 'px';
        
        chrome.storage.sync.set({ movementTolerance: tolerance });
    });
    
    spinnerDelaySlider.addEventListener('input', function() {
        const delay = parseInt(spinnerDelaySlider.value);
        spinnerDelayValue.textContent = delay + 'ms';
        
        chrome.storage.sync.set({ spinnerDelay: delay });
    });
    
    notificationPosition.addEventListener('change', function() {
        const position = notificationPosition.value;
        
        chrome.storage.sync.set({ notificationPosition: position });
    });
    
    mouseSelectionTrigger.addEventListener('change', function() {
        chrome.storage.sync.set({ mouseSelectionEnabled: mouseSelectionTrigger.checked });
    });
    
    keyboardSelectionTrigger.addEventListener('change', function() {
        chrome.storage.sync.set({ keyboardSelectionEnabled: keyboardSelectionTrigger.checked });
    });
    
    doubleClickTrigger.addEventListener('change', function() {
        chrome.storage.sync.set({ doubleClickEnabled: doubleClickTrigger.checked });
    });
    
    autoTrimWhitespace.addEventListener('change', function() {
        chrome.storage.sync.set({ autoTrimEnabled: autoTrimWhitespace.checked });
    });
    
    duplicatePrevention.addEventListener('change', function() {
        chrome.storage.sync.set({ duplicatePreventionEnabled: duplicatePrevention.checked });
    });
    
    websiteBlacklist.addEventListener('input', function() {
        chrome.storage.sync.set({ websiteBlacklist: websiteBlacklist.value });
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
    
    function initializeCollapsible() {
        const headers = document.querySelectorAll('.collapsible-header');
        
        headers.forEach(header => {
            const targetId = header.dataset.target;
            const content = document.getElementById(targetId);
            const arrow = header.querySelector('.collapsible-arrow');
            
            // Set initial max-height for smooth animation
            if (content) {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
            
            header.addEventListener('click', function() {
                if (content && arrow) {
                    const isCollapsed = content.classList.contains('collapsed');
                    
                    if (isCollapsed) {
                        // Expand
                        content.classList.remove('collapsed');
                        content.style.maxHeight = content.scrollHeight + 'px';
                        arrow.classList.remove('collapsed');
                    } else {
                        // Collapse
                        content.classList.add('collapsed');
                        content.style.maxHeight = '0';
                        arrow.classList.add('collapsed');
                    }
                }
            });
        });
    }
});