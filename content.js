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
    const SPINNER_DELAY = 100;
    const MOVEMENT_TOLERANCE = 8;
    
    chrome.storage.sync.get(['autoCopyEnabled', 'holdPasteEnabled', 'pasteDelay'], function(result) {
        isEnabled = result.autoCopyEnabled !== false;
        isPasteEnabled = result.holdPasteEnabled !== false;
        HOLD_DURATION = result.pasteDelay || 450;
        if (isEnabled) {
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
    });
    
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
            top: 20px;
            right: 20px;
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
        document.body.appendChild(statusElement);
    }
    
    function createPasteIndicator() {
        if (pasteIndicator) return;
        
        pasteIndicator = document.createElement('div');
        pasteIndicator.style.cssText = `
            position: fixed;
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, #2196F3, #1976D2);
            border-radius: 50%;
            display: none;
            z-index: 1000000;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
            transition: transform 0.1s ease;
        `;
        
        const progressRing = document.createElement('div');
        progressRing.style.cssText = `
            position: absolute;
            top: 5px;
            left: 5px;
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            transform: rotate(-90deg);
            transition: border-top-color 0.1s ease;
        `;
        
        const text = document.createElement('div');
        text.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-family: Arial, sans-serif;
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            line-height: 1;
        `;
        text.textContent = 'PASTE';
        
        pasteIndicator.appendChild(progressRing);
        pasteIndicator.appendChild(text);
        document.body.appendChild(pasteIndicator);
    }
    
    function showStatus(message) {
        if (!statusElement || !isEnabled) return;
        
        statusElement.textContent = message;
        statusElement.style.opacity = '1';
        
        setTimeout(() => {
            if (statusElement) {
                statusElement.style.opacity = '0';
            }
        }, 2000);
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
                const preview = text.length > 30 ? text.substring(0, 30) + '...' : text;
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
            if (isHolding) {
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
        const progressRing = pasteIndicator.querySelector('div');
        
        if (progressRing) {
            const angle = progress * 360;
            progressRing.style.borderTopColor = progress < 1 ? 'white' : '#4CAF50';
            progressRing.style.transform = `rotate(${-90 + angle}deg)`;
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
        if (!isEnabled) return;
        
        if (isHolding) {
            cancelHold();
        }
        
        if (!isSelecting) return;
        isSelecting = false;
        
        selectionTimeout = setTimeout(() => {
            const selectedText = getSelectedText();
            
            if (selectedText && selectedText.trim().length > 0) {
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
    
    function handleKeyUp(e) {
        if (!isEnabled) return;
        
        if (e.shiftKey || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
            e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
            (e.ctrlKey && e.key === 'a')) {
            
            setTimeout(() => {
                const selectedText = getSelectedText();
                
                if (selectedText && selectedText.trim().length > 0) {
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
        if (!isEnabled) return;
        
        setTimeout(() => {
            const selectedText = getSelectedText();
            
            if (selectedText && selectedText.trim().length > 0) {
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