document.addEventListener('DOMContentLoaded', function() {
    function saveSettings(obj, callback) {
        chrome.storage.sync.set(obj, function() {
            if (chrome.runtime.lastError) {
                console.error('Failed to save settings:', chrome.runtime.lastError.message);
            }
            if (callback) callback();
        });
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function updateSliderProgress(slider) {
        const pct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        slider.style.setProperty('--progress', pct + '%');
    }

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
    const spinnerStyle = document.getElementById('spinnerStyle');
    const mouseSelectionTrigger = document.getElementById('mouseSelectionTrigger');
    const keyboardSelectionTrigger = document.getElementById('keyboardSelectionTrigger');
    const doubleClickTrigger = document.getElementById('doubleClickTrigger');
    const autoTrimWhitespace = document.getElementById('autoTrimWhitespace');
    const duplicatePrevention = document.getElementById('duplicatePrevention');
    const hideToastNotifications = document.getElementById('hideToastNotifications');
    const hidePasteSpinner = document.getElementById('hidePasteSpinner');
    const smartReplaceEnabled = document.getElementById('smartReplaceEnabled');
    const textTransformSelect = document.getElementById('textTransform');
    const pasteMethodSelect = document.getElementById('pasteMethodSelect');
    const pasteMethodContainer = document.getElementById('pasteMethodContainer');
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
        'spinnerStyle',
        'mouseSelectionEnabled',
        'keyboardSelectionEnabled',
        'doubleClickEnabled',
        'autoTrimEnabled',
        'duplicatePreventionEnabled',
        'hideToastNotifications',
        'hidePasteSpinner',
        'smartReplaceEnabled',
        'pasteMethod',
        'textTransform',
        'websiteBlacklist'
    ], function(result) {
        if (chrome.runtime.lastError) {
            console.error('Failed to load settings:', chrome.runtime.lastError.message);
            return;
        }
        copyToggle.checked = result.autoCopyEnabled !== false;
        pasteToggle.checked = result.holdPasteEnabled !== false;
        
        const delay = clamp(result.pasteDelay ?? 450, 200, 1000);
        delaySlider.value = delay;
        delayValue.textContent = delay + 'ms';
        updateSliderProgress(delaySlider);

        const statusDuration = clamp(result.statusDuration ?? 2000, 200, 5000);
        statusDurationSlider.value = statusDuration;
        statusDurationValue.textContent = statusDuration + 'ms';
        updateSliderProgress(statusDurationSlider);

        const previewLength = clamp(result.previewLength ?? 30, 10, 100);
        previewLengthSlider.value = previewLength;
        previewLengthValue.textContent = previewLength + ' chars';
        updateSliderProgress(previewLengthSlider);

        const minSelection = clamp(result.minSelectionLength ?? 1, 1, 50);
        minSelectionSlider.value = minSelection;
        minSelectionValue.textContent = minSelection + ' char' + (minSelection === 1 ? '' : 's');
        updateSliderProgress(minSelectionSlider);

        const movementTolerance = clamp(result.movementTolerance ?? 8, 2, 20);
        movementToleranceSlider.value = movementTolerance;
        movementToleranceValue.textContent = movementTolerance + 'px';
        updateSliderProgress(movementToleranceSlider);

        const spinnerDelay = clamp(result.spinnerDelay ?? 100, 0, 500);
        spinnerDelaySlider.value = spinnerDelay;
        spinnerDelayValue.textContent = spinnerDelay + 'ms';
        updateSliderProgress(spinnerDelaySlider);
        
        const position = result.notificationPosition || 'top-right';
        notificationPosition.value = position;
        
        const spinner = result.spinnerStyle || 'circular';
        spinnerStyle.value = spinner;
        
        mouseSelectionTrigger.checked = result.mouseSelectionEnabled !== false;
        keyboardSelectionTrigger.checked = result.keyboardSelectionEnabled !== false;
        doubleClickTrigger.checked = result.doubleClickEnabled !== false;
        autoTrimWhitespace.checked = result.autoTrimEnabled !== false;
        duplicatePrevention.checked = result.duplicatePreventionEnabled === true;
        hideToastNotifications.checked = result.hideToastNotifications === true;
        hidePasteSpinner.checked = result.hidePasteSpinner === true;
        smartReplaceEnabled.checked = result.smartReplaceEnabled === true;
        textTransformSelect.value = result.textTransform || 'none';
        const pasteMethod = result.pasteMethod || 'middle-click';
        pasteMethodSelect.value = pasteMethod;
        updateHoldOnlyVisibility(pasteMethod);
        updatePasteMethodVisibility(pasteToggle.checked);
        websiteBlacklist.value = result.websiteBlacklist || '';

        updateStatus(copyToggle.checked, pasteToggle.checked);
        initializeCollapsible();
        initializeTooltips();
    });
    
    copyToggle.addEventListener('change', function() {
        const enabled = copyToggle.checked;
        
        saveSettings({ autoCopyEnabled: enabled }, function() {
            updateStatus(enabled, pasteToggle.checked);
        });
    });
    
    pasteToggle.addEventListener('change', function() {
        const enabled = pasteToggle.checked;
        updatePasteMethodVisibility(enabled);
        saveSettings({ holdPasteEnabled: enabled }, function() {
            updateStatus(copyToggle.checked, enabled);
        });
    });

    pasteMethodSelect.addEventListener('change', function() {
        const method = pasteMethodSelect.value;
        updateHoldOnlyVisibility(method);
        saveSettings({ pasteMethod: method });
    });
    
    delaySlider.addEventListener('input', function() {
        const delay = parseInt(delaySlider.value) || 450;
        delayValue.textContent = delay + 'ms';
        updateSliderProgress(delaySlider);
        saveSettings({ pasteDelay: delay });
    });

    statusDurationSlider.addEventListener('input', function() {
        const duration = parseInt(statusDurationSlider.value) || 2000;
        statusDurationValue.textContent = duration + 'ms';
        updateSliderProgress(statusDurationSlider);
        saveSettings({ statusDuration: duration });
    });

    previewLengthSlider.addEventListener('input', function() {
        const length = parseInt(previewLengthSlider.value) || 30;
        previewLengthValue.textContent = length + ' chars';
        updateSliderProgress(previewLengthSlider);
        saveSettings({ previewLength: length });
    });

    minSelectionSlider.addEventListener('input', function() {
        const minLength = parseInt(minSelectionSlider.value) || 1;
        minSelectionValue.textContent = minLength + ' char' + (minLength === 1 ? '' : 's');
        updateSliderProgress(minSelectionSlider);
        saveSettings({ minSelectionLength: minLength });
    });

    movementToleranceSlider.addEventListener('input', function() {
        const tolerance = parseInt(movementToleranceSlider.value) || 8;
        movementToleranceValue.textContent = tolerance + 'px';
        updateSliderProgress(movementToleranceSlider);
        saveSettings({ movementTolerance: tolerance });
    });

    spinnerDelaySlider.addEventListener('input', function() {
        const delay = parseInt(spinnerDelaySlider.value) || 0;
        spinnerDelayValue.textContent = delay + 'ms';
        updateSliderProgress(spinnerDelaySlider);
        saveSettings({ spinnerDelay: delay });
    });
    
    notificationPosition.addEventListener('change', function() {
        const position = notificationPosition.value;
        
        saveSettings({ notificationPosition: position });
    });
    
    spinnerStyle.addEventListener('change', function() {
        const style = spinnerStyle.value;
        
        saveSettings({ spinnerStyle: style });
    });
    
    mouseSelectionTrigger.addEventListener('change', function() {
        saveSettings({ mouseSelectionEnabled: mouseSelectionTrigger.checked });
    });
    
    keyboardSelectionTrigger.addEventListener('change', function() {
        saveSettings({ keyboardSelectionEnabled: keyboardSelectionTrigger.checked });
    });
    
    doubleClickTrigger.addEventListener('change', function() {
        saveSettings({ doubleClickEnabled: doubleClickTrigger.checked });
    });
    
    autoTrimWhitespace.addEventListener('change', function() {
        saveSettings({ autoTrimEnabled: autoTrimWhitespace.checked });
    });
    
    duplicatePrevention.addEventListener('change', function() {
        saveSettings({ duplicatePreventionEnabled: duplicatePrevention.checked });
    });
    
    hideToastNotifications.addEventListener('change', function() {
        saveSettings({ hideToastNotifications: hideToastNotifications.checked });
    });
    
    hidePasteSpinner.addEventListener('change', function() {
        saveSettings({ hidePasteSpinner: hidePasteSpinner.checked });
    });
    
    smartReplaceEnabled.addEventListener('change', function() {
        saveSettings({ smartReplaceEnabled: smartReplaceEnabled.checked });
    });

    textTransformSelect.addEventListener('change', function() {
        saveSettings({ textTransform: textTransformSelect.value });
    });

    let blacklistDebounce = null;
    websiteBlacklist.addEventListener('input', function() {
        clearTimeout(blacklistDebounce);
        blacklistDebounce = setTimeout(function() {
            saveSettings({ websiteBlacklist: websiteBlacklist.value });
        }, 500);
    });
    
    function updateHoldOnlyVisibility(method) {
        const isHold = method === 'hold';
        document.querySelectorAll('.hold-only-setting').forEach(el => {
            el.style.display = isHold ? '' : 'none';
        });
        // Recalculate collapsible section heights
        document.querySelectorAll('.collapsible-content:not(.collapsed)').forEach(content => {
            content.style.maxHeight = content.scrollHeight + 'px';
        });
    }

    function updatePasteMethodVisibility(pasteEnabled) {
        pasteMethodContainer.style.display = pasteEnabled ? '' : 'none';
        if (!pasteEnabled) {
            document.querySelectorAll('.hold-only-setting').forEach(el => {
                el.style.display = 'none';
            });
        } else {
            updateHoldOnlyVisibility(pasteMethodSelect.value);
        }
        // Recalculate collapsible section heights
        document.querySelectorAll('.collapsible-content:not(.collapsed)').forEach(content => {
            content.style.maxHeight = content.scrollHeight + 'px';
        });
    }

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
                        header.setAttribute('aria-expanded', 'true');
                    } else {
                        // Collapse
                        content.classList.add('collapsed');
                        content.style.maxHeight = '0';
                        arrow.classList.add('collapsed');
                        header.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });
    }
    
    let tooltipsInitialized = false;
    function initializeTooltips() {
        if (tooltipsInitialized) return;
        tooltipsInitialized = true;

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
            tooltip.textContent = tooltipText;
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
                }, 400); // 400ms delay for responsive tooltips
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