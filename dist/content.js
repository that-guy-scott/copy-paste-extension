(function() {
    'use strict';
    
    let isEnabled = true;
    let isSelecting = false;
    let selectionTimeout;
    let statusElement = null;
    let isPasteEnabled = true;
    let holdTimer = null;
    let holdStartTime = 0;
    let pasteIndicator = null;
    let isHolding = false;
    let spinnerTimer = null;
    let initialMouseX = 0;
    let initialMouseY = 0;
    let HOLD_DURATION = 450;
    let STATUS_DURATION = 2000;
    let PREVIEW_LENGTH = 30;
    let MIN_SELECTION_LENGTH = 1;
    let SPINNER_DELAY = 100;
    let MOVEMENT_TOLERANCE = 8;
    let NOTIFICATION_POSITION = 'top-right';
    let MOUSE_SELECTION_ENABLED = true;
    let KEYBOARD_SELECTION_ENABLED = true;
    let DOUBLE_CLICK_ENABLED = true;
    let AUTO_TRIM_ENABLED = true;
    let DUPLICATE_PREVENTION_ENABLED = false;
    let WEBSITE_BLACKLIST = '';
    let HIDE_TOAST_NOTIFICATIONS = false;
    let HIDE_PASTE_SPINNER = false;
    let SPINNER_STYLE = 'circular';
    let lastCopiedText = '';
    
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
        'spinnerStyle',
        'mouseSelectionEnabled',
        'keyboardSelectionEnabled',
        'doubleClickEnabled',
        'autoTrimEnabled',
        'duplicatePreventionEnabled',
        'hideToastNotifications',
        'hidePasteSpinner',
        'websiteBlacklist'
    ], function(result) {
        isEnabled = result.autoCopyEnabled !== false;
        isPasteEnabled = result.holdPasteEnabled !== false;
        HOLD_DURATION = result.pasteDelay || 450;
        STATUS_DURATION = result.statusDuration || 2000;
        PREVIEW_LENGTH = result.previewLength || 30;
        MIN_SELECTION_LENGTH = result.minSelectionLength || 1;
        MOVEMENT_TOLERANCE = result.movementTolerance || 8;
        SPINNER_DELAY = result.spinnerDelay || 100;
        NOTIFICATION_POSITION = result.notificationPosition || 'top-right';
        MOUSE_SELECTION_ENABLED = result.mouseSelectionEnabled !== false;
        KEYBOARD_SELECTION_ENABLED = result.keyboardSelectionEnabled !== false;
        DOUBLE_CLICK_ENABLED = result.doubleClickEnabled !== false;
        AUTO_TRIM_ENABLED = result.autoTrimEnabled !== false;
        DUPLICATE_PREVENTION_ENABLED = result.duplicatePreventionEnabled === true;
        HIDE_TOAST_NOTIFICATIONS = result.hideToastNotifications === true;
        HIDE_PASTE_SPINNER = result.hidePasteSpinner === true;
        SPINNER_STYLE = result.spinnerStyle || 'circular';
        WEBSITE_BLACKLIST = result.websiteBlacklist || '';
        
        if (isEnabled && !isCurrentSiteBlacklisted()) {
            initializeAutoCopy();
        }
    });
    
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (changes.autoCopyEnabled) {
            isEnabled = changes.autoCopyEnabled.newValue;
            if (isEnabled) {
                initializeAutoCopy();
            } else {
                removeEventListeners();
            }
        }
        if (changes.holdPasteEnabled) {
            isPasteEnabled = changes.holdPasteEnabled.newValue;
        }
        if (changes.pasteDelay) {
            HOLD_DURATION = changes.pasteDelay.newValue;
        }
        if (changes.statusDuration) {
            STATUS_DURATION = changes.statusDuration.newValue;
        }
        if (changes.previewLength) {
            PREVIEW_LENGTH = changes.previewLength.newValue;
        }
        if (changes.minSelectionLength) {
            MIN_SELECTION_LENGTH = changes.minSelectionLength.newValue;
        }
        if (changes.movementTolerance) {
            MOVEMENT_TOLERANCE = changes.movementTolerance.newValue;
        }
        if (changes.spinnerDelay) {
            SPINNER_DELAY = changes.spinnerDelay.newValue;
        }
        if (changes.notificationPosition) {
            NOTIFICATION_POSITION = changes.notificationPosition.newValue;
            updateStatusElementPosition();
        }
        if (changes.mouseSelectionEnabled) {
            MOUSE_SELECTION_ENABLED = changes.mouseSelectionEnabled.newValue;
        }
        if (changes.keyboardSelectionEnabled) {
            KEYBOARD_SELECTION_ENABLED = changes.keyboardSelectionEnabled.newValue;
        }
        if (changes.doubleClickEnabled) {
            DOUBLE_CLICK_ENABLED = changes.doubleClickEnabled.newValue;
        }
        if (changes.autoTrimEnabled) {
            AUTO_TRIM_ENABLED = changes.autoTrimEnabled.newValue;
        }
        if (changes.duplicatePreventionEnabled) {
            DUPLICATE_PREVENTION_ENABLED = changes.duplicatePreventionEnabled.newValue;
        }
        if (changes.hideToastNotifications) {
            HIDE_TOAST_NOTIFICATIONS = changes.hideToastNotifications.newValue;
        }
        if (changes.hidePasteSpinner) {
            HIDE_PASTE_SPINNER = changes.hidePasteSpinner.newValue;
        }
        if (changes.spinnerStyle) {
            SPINNER_STYLE = changes.spinnerStyle.newValue;
            recreatePasteIndicator();
        }
        if (changes.websiteBlacklist) {
            WEBSITE_BLACKLIST = changes.websiteBlacklist.newValue;
            // Check if current site should be disabled
            if (isCurrentSiteBlacklisted()) {
                removeEventListeners();
            } else if (isEnabled) {
                initializeAutoCopy();
            }
        }
    });
    
    function isCurrentSiteBlacklisted() {
        if (!WEBSITE_BLACKLIST || WEBSITE_BLACKLIST.trim() === '') {
            return false;
        }
        
        const currentDomain = window.location.hostname;
        const blacklistedDomains = WEBSITE_BLACKLIST.split('\n')
            .map(domain => domain.trim())
            .filter(domain => domain.length > 0);
        
        return blacklistedDomains.some(domain => {
            // Check for exact match or subdomain match
            return currentDomain === domain || currentDomain.endsWith('.' + domain);
        });
    }
    
    function processTextForCopy(text) {
        if (!text) return null;
        
        // Apply auto-trim if enabled
        const processedText = AUTO_TRIM_ENABLED ? text.trim() : text;
        
        // Check minimum length
        if (processedText.length < MIN_SELECTION_LENGTH) {
            return null;
        }
        
        // Check for duplicate prevention
        if (DUPLICATE_PREVENTION_ENABLED && processedText === lastCopiedText) {
            return null;
        }
        
        return processedText;
    }
    
    function handleSuccessfulCopy(text) {
        lastCopiedText = text;
        const preview = text.length > PREVIEW_LENGTH ? text.substring(0, PREVIEW_LENGTH) + '...' : text;
        showStatus(`Copied: "${preview}"`);
    }
    
    function initializeAutoCopy() {
        createStatusElement();
        createPasteIndicator();
        addEventListeners();
    }
    
    function createStatusElement() {
        if (statusElement) return;
        
        statusElement = document.createElement('div');
        statusElement.id = 'auto-copy-status';
        statusElement.style.cssText = `
            position: fixed;
            background-color: #4CAF50;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 999999;
            pointer-events: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        updateStatusElementPosition();
        document.body.appendChild(statusElement);
    }
    
    function updateStatusElementPosition() {
        if (!statusElement) return;
        
        // Clear existing position styles
        statusElement.style.top = '';
        statusElement.style.bottom = '';
        statusElement.style.left = '';
        statusElement.style.right = '';
        
        // Set position based on NOTIFICATION_POSITION
        switch (NOTIFICATION_POSITION) {
            case 'top-left':
                statusElement.style.top = '20px';
                statusElement.style.left = '20px';
                break;
            case 'top-right':
                statusElement.style.top = '20px';
                statusElement.style.right = '20px';
                break;
            case 'bottom-left':
                statusElement.style.bottom = '20px';
                statusElement.style.left = '20px';
                break;
            case 'bottom-right':
                statusElement.style.bottom = '20px';
                statusElement.style.right = '20px';
                break;
            default:
                statusElement.style.top = '20px';
                statusElement.style.right = '20px';
        }
    }
    
    function createPasteIndicator() {
        if (pasteIndicator) return;
        
        pasteIndicator = document.createElement('div');
        pasteIndicator.className = `copy-paste-spinner ${SPINNER_STYLE}`;
        
        // Create inner content based on spinner type
        if (SPINNER_STYLE === 'circular') {
            const progressRing = document.createElement('div');
            progressRing.className = 'progress-ring';
            const text = document.createElement('div');
            text.className = 'spinner-text';
            text.textContent = 'PASTE';
            pasteIndicator.appendChild(progressRing);
            pasteIndicator.appendChild(text);
        } else if (SPINNER_STYLE === 'dots') {
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                pasteIndicator.appendChild(dot);
            }
        } else if (SPINNER_STYLE === 'bars') {
            for (let i = 0; i < 4; i++) {
                const bar = document.createElement('div');
                bar.className = 'bar';
                pasteIndicator.appendChild(bar);
            }
        } else if (SPINNER_STYLE === 'pulse') {
            const text = document.createElement('div');
            text.className = 'pulse-text';
            text.textContent = 'PASTE';
            pasteIndicator.appendChild(text);
        } else if (SPINNER_STYLE === 'spiral') {
            const spiralLine = document.createElement('div');
            spiralLine.className = 'spiral-line';
            pasteIndicator.appendChild(spiralLine);
        } else if (SPINNER_STYLE === 'ripple') {
            for (let i = 0; i < 3; i++) {
                const circle = document.createElement('div');
                circle.className = 'ripple-circle';
                pasteIndicator.appendChild(circle);
            }
        } else if (SPINNER_STYLE === 'grid') {
            for (let i = 0; i < 9; i++) {
                const square = document.createElement('div');
                square.className = 'grid-square';
                pasteIndicator.appendChild(square);
            }
        } else if (SPINNER_STYLE === 'loader') {
            const loaderBar = document.createElement('div');
            loaderBar.className = 'loader-bar';
            const loaderFill = document.createElement('div');
            loaderFill.className = 'loader-fill';
            loaderBar.appendChild(loaderFill);
            const text = document.createElement('div');
            text.className = 'loader-text';
            text.textContent = 'PASTE';
            pasteIndicator.appendChild(loaderBar);
            pasteIndicator.appendChild(text);
        }
        
        document.body.appendChild(pasteIndicator);
    }
    
    function recreatePasteIndicator() {
        if (pasteIndicator) {
            pasteIndicator.remove();
            pasteIndicator = null;
        }
        createPasteIndicator();
    }
    
    function showStatus(message) {
        if (!statusElement || !isEnabled || HIDE_TOAST_NOTIFICATIONS) return;
        
        statusElement.textContent = message;
        statusElement.style.opacity = '1';
        
        setTimeout(() => {
            if (statusElement) {
                statusElement.style.opacity = '0';
            }
        }, STATUS_DURATION);
    }
    
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                return success;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }
    
    async function pasteFromClipboard(targetElement, x, y) {
        try {
            const text = await navigator.clipboard.readText();
            if (!text || text.trim().length === 0) {
                showStatus('Clipboard is empty');
                return false;
            }
            
            const success = insertTextAtPosition(targetElement, text);
            if (success) {
                const preview = text.length > PREVIEW_LENGTH ? text.substring(0, PREVIEW_LENGTH) + '...' : text;
                showStatus(`Pasted: "${preview}"`);
                return true;
            } else {
                showStatus('Failed to paste text');
                return false;
            }
        } catch (err) {
            showStatus('Cannot access clipboard');
            return false;
        }
    }
    
    function insertTextAtPosition(element, text) {
        try {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                const start = element.selectionStart;
                const end = element.selectionEnd;
                const value = element.value;
                
                element.value = value.substring(0, start) + text + value.substring(end);
                element.selectionStart = element.selectionEnd = start + text.length;
                element.focus();
                
                element.dispatchEvent(new Event('input', { bubbles: true }));
                return true;
            } else if (element.contentEditable === 'true' || element.isContentEditable) {
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                
                range.deleteContents();
                const textNode = document.createTextNode(text);
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
                
                element.focus();
                element.dispatchEvent(new Event('input', { bubbles: true }));
                return true;
            }
            return false;
        } catch (err) {
            return false;
        }
    }
    
    function getSelectedText() {
        if (window.getSelection) {
            return window.getSelection().toString();
        } else if (document.selection && document.selection.type !== "Control") {
            return document.selection.createRange().text;
        }
        return '';
    }
    
    function handleMouseDown(e) {
        if (!isEnabled) return;
        
        isSelecting = true;
        if (selectionTimeout) {
            clearTimeout(selectionTimeout);
        }
        
        if (isPasteEnabled && canPasteToElement(e.target)) {
            startHoldTimer(e);
        }
    }
    
    function canPasteToElement(element) {
        return element.tagName === 'INPUT' || 
               element.tagName === 'TEXTAREA' || 
               element.contentEditable === 'true' || 
               element.isContentEditable;
    }
    
    function startHoldTimer(e) {
        if (holdTimer) {
            clearTimeout(holdTimer);
        }
        if (spinnerTimer) {
            clearTimeout(spinnerTimer);
        }
        
        isHolding = true;
        holdStartTime = Date.now();
        initialMouseX = e.clientX;
        initialMouseY = e.clientY;
        
        spinnerTimer = setTimeout(() => {
            if (isHolding && !HIDE_PASTE_SPINNER) {
                showPasteIndicator(e.clientX, e.clientY);
            }
        }, SPINNER_DELAY);
        
        holdTimer = setTimeout(() => {
            if (isHolding) {
                completePaste(e.target, e.clientX, e.clientY);
            }
        }, HOLD_DURATION);
    }
    
    function showPasteIndicator(x, y) {
        if (!pasteIndicator) return;
        
        pasteIndicator.style.left = (x - 30) + 'px';
        pasteIndicator.style.top = (y - 30) + 'px';
        pasteIndicator.style.display = 'block';
        pasteIndicator.style.transform = 'scale(0.8)';
        
        requestAnimationFrame(() => {
            pasteIndicator.style.transform = 'scale(1)';
        });
        
        animateProgress();
    }
    
    function animateProgress() {
        if (!isHolding || !pasteIndicator) return;
        
        const elapsed = Date.now() - holdStartTime;
        const animationDuration = HOLD_DURATION - SPINNER_DELAY;
        const animationElapsed = Math.max(0, elapsed - SPINNER_DELAY);
        const progress = Math.min(animationElapsed / animationDuration, 1);
        
        // Only animate progress for circular spinner
        if (SPINNER_STYLE === 'circular') {
            const progressRing = pasteIndicator.querySelector('.progress-ring');
            if (progressRing) {
                const angle = progress * 360;
                // Blue to green transition: interpolate between #2196F3 and #4CAF50
                const blue = { r: 33, g: 150, b: 243 };
                const green = { r: 76, g: 175, b: 80 };
                const r = Math.round(blue.r + (green.r - blue.r) * progress);
                const g = Math.round(blue.g + (green.g - blue.g) * progress);
                const b = Math.round(blue.b + (green.b - blue.b) * progress);
                const color = `rgb(${r}, ${g}, ${b})`;
                progressRing.style.borderTopColor = color;
                progressRing.style.transform = `rotate(${-90 + angle}deg)`;
            }
        }
        
        if (progress < 1 && isHolding) {
            requestAnimationFrame(animateProgress);
        }
    }
    
    function completePaste(targetElement, x, y) {
        hidePasteIndicator();
        pasteFromClipboard(targetElement, x, y);
        isHolding = false;
    }
    
    function hidePasteIndicator() {
        if (pasteIndicator) {
            pasteIndicator.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (pasteIndicator) {
                    pasteIndicator.style.display = 'none';
                }
            }, 100);
        }
    }
    
    function cancelHold() {
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        if (spinnerTimer) {
            clearTimeout(spinnerTimer);
            spinnerTimer = null;
        }
        isHolding = false;
        hidePasteIndicator();
    }
    
    function handleMouseMove(e) {
        if (isHolding) {
            const dx = e.clientX - initialMouseX;
            const dy = e.clientY - initialMouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > MOVEMENT_TOLERANCE) {
                cancelHold();
            }
        }
    }
    
    function handleMouseUp(e) {
        if (!isEnabled || !MOUSE_SELECTION_ENABLED) return;
        
        if (isHolding) {
            cancelHold();
        }
        
        if (!isSelecting) return;
        isSelecting = false;
        
        selectionTimeout = setTimeout(() => {
            const selectedText = getSelectedText();
            
            const processedText = processTextForCopy(selectedText);
            if (processedText) {
                copyToClipboard(processedText)
                    .then(success => {
                        if (success) {
                            handleSuccessfulCopy(processedText);
                        } else {
                            showStatus('Failed to copy text');
                        }
                    });
            }
        }, 10);
    }
    
    function handleKeyUp(e) {
        if (!isEnabled || !KEYBOARD_SELECTION_ENABLED) return;
        
        if (e.shiftKey || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
            e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
            (e.ctrlKey && e.key === 'a')) {
            
            setTimeout(() => {
                const selectedText = getSelectedText();
                
                if (selectedText && selectedText.trim().length >= MIN_SELECTION_LENGTH) {
                    copyToClipboard(selectedText.trim())
                        .then(success => {
                            if (success) {
                                const preview = selectedText.length > 30 
                                    ? selectedText.substring(0, 30) + '...' 
                                    : selectedText;
                                showStatus(`Copied: "${preview}"`);
                            } else {
                                showStatus('Failed to copy text');
                            }
                        });
                }
            }, 10);
        }
    }
    
    function handleDoubleClick(e) {
        if (!isEnabled || !DOUBLE_CLICK_ENABLED) return;
        
        setTimeout(() => {
            const selectedText = getSelectedText();
            
            const processedText = processTextForCopy(selectedText);
            if (processedText) {
                copyToClipboard(processedText)
                    .then(success => {
                        if (success) {
                            handleSuccessfulCopy(processedText);
                        } else {
                            showStatus('Failed to copy text');
                        }
                    });
            }
        }, 10);
    }
    
    function addEventListeners() {
        document.addEventListener('mousedown', handleMouseDown, true);
        document.addEventListener('mouseup', handleMouseUp, true);
        document.addEventListener('mousemove', handleMouseMove, true);
        document.addEventListener('keyup', handleKeyUp, true);
        document.addEventListener('dblclick', handleDoubleClick, true);
    }
    
    function removeEventListeners() {
        document.removeEventListener('mousedown', handleMouseDown, true);
        document.removeEventListener('mouseup', handleMouseUp, true);
        document.removeEventListener('mousemove', handleMouseMove, true);
        document.removeEventListener('keyup', handleKeyUp, true);
        document.removeEventListener('dblclick', handleDoubleClick, true);
        
        if (statusElement) {
            statusElement.style.opacity = '0';
        }
        
        if (isHolding) {
            cancelHold();
        }
    }
})();