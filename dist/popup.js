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
    const hideToastNotifications = document.getElementById('hideToastNotifications');
    const hidePasteSpinner = document.getElementById('hidePasteSpinner');
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
        'hideToastNotifications',
        'hidePasteSpinner',
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
        hideToastNotifications.checked = result.hideToastNotifications === true;
        hidePasteSpinner.checked = result.hidePasteSpinner === true;
        websiteBlacklist.value = result.websiteBlacklist || '';
        
        updateStatus(copyToggle.checked, pasteToggle.checked);
        initializeCollapsible();
        initializeTooltips();
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
    
    hideToastNotifications.addEventListener('change', function() {
        chrome.storage.sync.set({ hideToastNotifications: hideToastNotifications.checked });
    });
    
    hidePasteSpinner.addEventListener('change', function() {
        chrome.storage.sync.set({ hidePasteSpinner: hidePasteSpinner.checked });
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
    
    function initializeTooltips() {
        // Check if we're on a touch device
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            // Disable tooltips on touch devices
            return;
        }
        
        let currentTooltip = null;
        let showTimeout = null;
        let hideTimeout = null;
        
        // Get all tooltip triggers
        const triggers = document.querySelectorAll('.tooltip-trigger');
        
        triggers.forEach(trigger => {
            const tooltipText = trigger.getAttribute('data-tooltip');
            if (!tooltipText) return;
            
            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = tooltipText;
            document.body.appendChild(tooltip);
            
            // Mouse enter event
            trigger.addEventListener('mouseenter', function(e) {
                // Cancel any pending hide
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                }
                
                // Hide any existing tooltip
                hideCurrentTooltip();
                
                // Set up show timeout
                showTimeout = setTimeout(() => {
                    showTooltip(tooltip, trigger);
                    currentTooltip = tooltip;
                }, 800); // 800ms delay as specified
            });
            
            // Mouse leave event
            trigger.addEventListener('mouseleave', function() {
                // Cancel pending show
                if (showTimeout) {
                    clearTimeout(showTimeout);
                    showTimeout = null;
                }
                
                // Hide tooltip immediately
                hideCurrentTooltip();
            });
            
            // Focus event for keyboard accessibility
            trigger.addEventListener('focus', function() {
                if (showTimeout) {
                    clearTimeout(showTimeout);
                }
                hideCurrentTooltip();
                showTooltip(tooltip, trigger);
                currentTooltip = tooltip;
            });
            
            // Blur event for keyboard accessibility
            trigger.addEventListener('blur', function() {
                hideCurrentTooltip();
            });
        });
        
        // Global event listeners for interaction cancellation
        document.addEventListener('scroll', hideCurrentTooltip, true);
        document.addEventListener('click', hideCurrentTooltip, true);
        document.addEventListener('keydown', hideCurrentTooltip, true);
        
        // Hide tooltip when collapsible sections are toggled
        const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
        collapsibleHeaders.forEach(header => {
            header.addEventListener('click', hideCurrentTooltip);
        });
        
        function showTooltip(tooltip, trigger) {
            // Position the tooltip
            positionTooltip(tooltip, trigger);
            
            // Show the tooltip
            tooltip.classList.add('show');
        }
        
        function hideCurrentTooltip() {
            if (showTimeout) {
                clearTimeout(showTimeout);
                showTimeout = null;
            }
            
            if (currentTooltip) {
                currentTooltip.classList.remove('show');
                currentTooltip.classList.remove('above', 'below', 'left', 'right');
                currentTooltip.style.top = '';
                currentTooltip.style.left = '';
                currentTooltip = null;
            }
        }
        
        // Cleanup function to remove all tooltips when popup closes
        window.addEventListener('beforeunload', function() {
            const tooltips = document.querySelectorAll('.tooltip');
            tooltips.forEach(tooltip => tooltip.remove());
        });
        
        function positionTooltip(tooltip, trigger) {
            const triggerRect = trigger.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Reset position classes and styles
            tooltip.classList.remove('above', 'below', 'left', 'right');
            tooltip.style.top = '';
            tooltip.style.left = '';
            tooltip.style.right = '';
            tooltip.style.bottom = '';
            
            // Make tooltip visible to calculate its dimensions
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '1';
            
            const tooltipRect = tooltip.getBoundingClientRect();
            const tooltipWidth = tooltipRect.width;
            const tooltipHeight = tooltipRect.height;
            
            // Hide tooltip again
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'visible';
            
            // Calculate available space
            const spaceAbove = triggerRect.top;
            const spaceBelow = viewportHeight - triggerRect.bottom;
            const spaceLeft = triggerRect.left;
            const spaceRight = viewportWidth - triggerRect.right;
            
            let top, left;
            
            // Determine position - prefer above, then below, then sides
            if (spaceAbove >= tooltipHeight + 10) {
                // Position above
                tooltip.classList.add('above');
                top = triggerRect.top - tooltipHeight - 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
            } else if (spaceBelow >= tooltipHeight + 10) {
                // Position below
                tooltip.classList.add('below');
                top = triggerRect.bottom + 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
            } else if (spaceLeft >= tooltipWidth + 10) {
                // Position left
                tooltip.classList.add('left');
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2);
                left = triggerRect.left - tooltipWidth - 8;
            } else if (spaceRight >= tooltipWidth + 10) {
                // Position right
                tooltip.classList.add('right');
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2);
                left = triggerRect.right + 8;
            } else {
                // Fallback to below with edge adjustment
                tooltip.classList.add('below');
                top = triggerRect.bottom + 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
            }
            
            // Ensure tooltip stays within viewport bounds
            if (left < 8) {
                left = 8;
            } else if (left + tooltipWidth > viewportWidth - 8) {
                left = viewportWidth - tooltipWidth - 8;
            }
            
            if (top < 8) {
                top = 8;
            } else if (top + tooltipHeight > viewportHeight - 8) {
                top = viewportHeight - tooltipHeight - 8;
            }
            
            // Apply final position
            tooltip.style.top = top + 'px';
            tooltip.style.left = left + 'px';
        }
    }
});