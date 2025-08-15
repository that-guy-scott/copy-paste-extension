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
    let SMART_REPLACE_ENABLED = false;
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
        'smartReplaceEnabled',
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
        SMART_REPLACE_ENABLED = result.smartReplaceEnabled === true;
        WEBSITE_BLACKLIST = result.websiteBlacklist || '';
        
        console.log('Extension settings loaded:', {
            isEnabled: isEnabled,
            isBlacklisted: isCurrentSiteBlacklisted(),
            HIDE_TOAST_NOTIFICATIONS: HIDE_TOAST_NOTIFICATIONS
        });
        
        if (isEnabled && !isCurrentSiteBlacklisted()) {
            initializeAutoCopy();
        } else {
            console.log('Extension not initialized:', { isEnabled, isBlacklisted: isCurrentSiteBlacklisted() });
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
            updateSpinnerTiming();
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
        if (changes.smartReplaceEnabled) {
            SMART_REPLACE_ENABLED = changes.smartReplaceEnabled.newValue;
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
    
    function isEditableElement(element) {
        if (!element) return false;
        
        const tagName = element.tagName.toLowerCase();
        
        // Check for input elements (except readonly)
        if (tagName === 'input') {
            const type = element.type.toLowerCase();
            const editableTypes = ['text', 'password', 'email', 'search', 'url', 'tel'];
            return editableTypes.includes(type) && !element.readOnly && !element.disabled;
        }
        
        // Check for textarea (except readonly)
        if (tagName === 'textarea') {
            return !element.readOnly && !element.disabled;
        }
        
        // Check for contenteditable elements
        if (element.contentEditable === 'true' || element.isContentEditable) {
            return true;
        }
        
        return false;
    }
    
    async function handleSmartReplace(targetElement, selectedText) {
        try {
            // Get clipboard content
            const clipboardText = await navigator.clipboard.readText();
            if (!clipboardText || clipboardText.trim().length === 0) {
                return false; // No clipboard content, proceed with normal copy
            }
            
            // Replace selected text with clipboard content
            const success = await replaceSelectedText(targetElement, clipboardText);
            if (success) {
                const preview = clipboardText.length > PREVIEW_LENGTH 
                    ? clipboardText.substring(0, PREVIEW_LENGTH) + '...' 
                    : clipboardText;
                showStatus(`Replaced with: "${preview}"`);
                return true;
            }
            
            return false;
        } catch (err) {
            console.log('Smart replace failed, proceeding with normal copy:', err);
            return false; // Fallback to normal copy
        }
    }
    
    async function replaceSelectedText(element, newText) {
        const tagName = element.tagName.toLowerCase();
        
        try {
            if (tagName === 'input' || tagName === 'textarea') {
                const start = element.selectionStart;
                const end = element.selectionEnd;
                
                if (start !== null && end !== null && start !== end) {
                    const currentValue = element.value;
                    element.value = currentValue.substring(0, start) + newText + currentValue.substring(end);
                    
                    // Set cursor position after inserted text
                    const newCursorPos = start + newText.length;
                    element.setSelectionRange(newCursorPos, newCursorPos);
                    
                    // Trigger input event for frameworks
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    return true;
                }
            } else if (element.contentEditable === 'true' || element.isContentEditable) {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    
                    if (!range.collapsed) { // There is selected text
                        range.deleteContents();
                        const textNode = document.createTextNode(newText);
                        range.insertNode(textNode);
                        range.setStartAfter(textNode);
                        range.setEndAfter(textNode);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        
                        // Trigger input event for frameworks
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        return true;
                    }
                }
            }
            
            return false;
        } catch (err) {
            console.log('Replace text failed:', err);
            return false;
        }
    }
    
    function handleSuccessfulCopy(text) {
        lastCopiedText = text;
        const preview = text.length > PREVIEW_LENGTH ? text.substring(0, PREVIEW_LENGTH) + '...' : text;
        showStatus(`Copied: "${preview}"`);
    }
    
    function initializeAutoCopy() {
        console.log('initializeAutoCopy called');
        createStatusElement();
        createPasteIndicator();
        addEventListeners();
        console.log('initializeAutoCopy completed, statusElement:', !!statusElement);
    }
    
    function createStatusElement() {
        if (statusElement) return;
        
        console.log('createStatusElement called, document.body:', !!document.body);
        
        if (!document.body) {
            console.log('document.body not available, retrying in 100ms');
            setTimeout(createStatusElement, 100);
            return;
        }
        
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
        console.log('statusElement created and appended to body');
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
        updateSpinnerTiming();
    }
    
    function recreatePasteIndicator() {
        if (pasteIndicator) {
            pasteIndicator.remove();
            pasteIndicator = null;
        }
        createPasteIndicator();
    }
    
    function updateSpinnerTiming() {
        if (!pasteIndicator) return;
        
        const duration = HOLD_DURATION + 'ms';
        
        // Update spinner element animations based on type
        if (SPINNER_STYLE === 'circular') {
            // Circular spinner timing is handled in animateProgress() function
            // No CSS animations to update for circular spinner
        } else if (SPINNER_STYLE === 'dots') {
            const dots = pasteIndicator.querySelectorAll('.dot');
            const delays = [-0.7, -0.35, 0]; // Proportional to duration
            dots.forEach((dot, index) => {
                dot.style.animationDuration = duration;
                dot.style.animationDelay = (HOLD_DURATION * delays[index]) + 'ms';
            });
        } else if (SPINNER_STYLE === 'bars') {
            const bars = pasteIndicator.querySelectorAll('.bar');
            const delays = [-0.8, -0.6, -0.4, -0.2]; // Proportional to duration
            bars.forEach((bar, index) => {
                bar.style.animationDuration = duration;
                bar.style.animationDelay = (HOLD_DURATION * delays[index]) + 'ms';
            });
        } else if (SPINNER_STYLE === 'pulse') {
            pasteIndicator.style.animationDuration = duration;
        } else if (SPINNER_STYLE === 'spiral') {
            const spiralLine = pasteIndicator.querySelector('.spiral-line');
            if (spiralLine) {
                // Keep spin fast, sync color transition to hold duration
                spiralLine.style.animationDuration = '1s, ' + duration;
            }
        } else if (SPINNER_STYLE === 'ripple') {
            const circles = pasteIndicator.querySelectorAll('.ripple-circle');
            const delays = [0, 0.33, 0.66]; // Proportional to duration
            circles.forEach((circle, index) => {
                circle.style.animationDuration = duration;
                circle.style.animationDelay = (HOLD_DURATION * delays[index]) + 'ms';
            });
        } else if (SPINNER_STYLE === 'grid') {
            const squares = pasteIndicator.querySelectorAll('.grid-square');
            const delays = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]; // Proportional to duration
            squares.forEach((square, index) => {
                square.style.animationDuration = duration;
                square.style.animationDelay = (HOLD_DURATION * delays[index]) + 'ms';
            });
        } else if (SPINNER_STYLE === 'loader') {
            const loaderFill = pasteIndicator.querySelector('.loader-fill');
            if (loaderFill) {
                loaderFill.style.animationDuration = duration;
            }
        }
    }
    
    function showStatus(message) {
        console.log('showStatus called:', message, {
            statusElement: !!statusElement,
            isEnabled: isEnabled,
            HIDE_TOAST_NOTIFICATIONS: HIDE_TOAST_NOTIFICATIONS
        });
        
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
        
        selectionTimeout = setTimeout(async () => {
            const selectedText = getSelectedText();
            
            const processedText = processTextForCopy(selectedText);
            if (processedText) {
                // Check if Smart Replace should be used
                if (SMART_REPLACE_ENABLED && isEditableElement(e.target)) {
                    const replaced = await handleSmartReplace(e.target, processedText);
                    if (replaced) {
                        return; // Smart replace succeeded, don't proceed with normal copy
                    }
                }
                
                // Normal copy behavior
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
            
            setTimeout(async () => {
                const selectedText = getSelectedText();
                
                if (selectedText && selectedText.trim().length >= MIN_SELECTION_LENGTH) {
                    const processedText = selectedText.trim();
                    
                    // Check if Smart Replace should be used
                    if (SMART_REPLACE_ENABLED && isEditableElement(e.target)) {
                        const replaced = await handleSmartReplace(e.target, processedText);
                        if (replaced) {
                            return; // Smart replace succeeded, don't proceed with normal copy
                        }
                    }
                    
                    // Normal copy behavior
                    copyToClipboard(processedText)
                        .then(success => {
                            if (success) {
                                const preview = processedText.length > 30 
                                    ? processedText.substring(0, 30) + '...' 
                                    : processedText;
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
        
        setTimeout(async () => {
            const selectedText = getSelectedText();
            
            const processedText = processTextForCopy(selectedText);
            if (processedText) {
                // Check if Smart Replace should be used
                if (SMART_REPLACE_ENABLED && isEditableElement(e.target)) {
                    const replaced = await handleSmartReplace(e.target, processedText);
                    if (replaced) {
                        return; // Smart replace succeeded, don't proceed with normal copy
                    }
                }
                
                // Normal copy behavior
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