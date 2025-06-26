// widget-overlay.js - Enhanced with footer integration

class WidgetOverlayHandler {
    constructor() {
        this.widgetPetri = document.getElementById('widget-petri');
        this.contentSticky = document.getElementById('content-sticky');
        this.pageFooter = document.getElementById('page-footer');
        
        // Array of all widgets to manage in sequence
        this.widgets = [
            { id: 'widget-world', element: null, frame: null },
            { id: 'widget-world-viz', element: null, frame: null },
            { id: 'widget-swiss', element: null, frame: null },
            { id: 'widget-swiss-viz', element: null, frame: null },
            { id: 'widget-death', element: null, frame: null },
            { id: 'widget-death-viz', element: null, frame: null, isInteractive: true },
            { id: 'widget-timeline', element: null, frame: null },
            { id: 'widget-timeline-viz', element: null, frame: null }
        ];
        
        this.overlayStartPosition = 0;
        this.widgetScrollRange = 0; // Range of scroll for each widget
        this.totalScrollRange = 0;
        this.footerHeight = 0;
        
        this.breakpoints = {
            mobile: 599,
            tabletV: 600,
            tabletH: 900,
            desktop: 1200
        };
        
        this.initWidgets();
        
        if (this.widgetPetri && this.hasValidWidgets()) {
            this.init();
        }
    }

    initWidgets() {
        // Initialize elements for each widget
        this.widgets.forEach(widget => {
            widget.element = document.getElementById(widget.id);
            if (widget.element) {
                // Look for frame inside the widget (can be .world-frame, .frame, etc.)
                widget.frame = widget.element.querySelector('.frame') || 
                              widget.element.querySelector('.world-frame') ||
                              widget.element.querySelector(`[class*="frame"]`);
                
                // If no frame found, use the element itself
                if (!widget.frame) {
                    widget.frame = widget.element;
                }
                
                // Initialize widget properties
                widget.element.classList.remove('active');
                widget.scrollRange = 0;
                widget.contentOverflow = 0;
                widget.isScrollingContent = false;
                widget.lastScrollTop = 0;
                if (widget.frame) {
                    widget.frame.style.transform = 'translateY(100%)';
                    widget.frame.style.opacity = '1';
                    // Ensure internal scrolling is disabled initially
                    widget.frame.classList.remove('frame-scrollable');
                    widget.frame.scrollTop = 0;
                }
            }
        });
        
        // Filter only widgets that actually exist in the DOM
        this.widgets = this.widgets.filter(widget => widget.element !== null);
        
        // Initialize footer for home page
        this.initFooter();
    }

    initFooter() {
        if (this.pageFooter) {
            // Add home-specific class to footer
            this.pageFooter.classList.add('home-footer');
            
            // Position footer after widgets initially
            this.pageFooter.style.position = 'absolute';
            this.pageFooter.style.top = '100%';
            this.pageFooter.style.left = '0';
            this.pageFooter.style.right = '0';
            this.pageFooter.style.zIndex = '30';
        }
    }

    hasValidWidgets() {
        return this.widgets.length > 0;
    }

    init() {
        // Wait for widget-petri handler to be completely initialized
        this.initDelay = setTimeout(() => {
            this.calculateOverlayPositions();
            this.setupScrollHandlers();
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.calculateOverlayPositions();
                }, 100);
            });
        }, 100);
    }

    setupScrollHandlers() {
        // Main scroll handler
        window.addEventListener('scroll', this.handleOverlayScroll.bind(this));
        
        // Setup internal scroll detection for each frame (skip interactive widgets)
        this.widgets.forEach(widget => {
            if (widget.frame && !widget.isInteractive) {
                // Remove any existing event listeners
                widget.frame.removeEventListener('wheel', widget.wheelHandler);
                widget.frame.removeEventListener('scroll', widget.scrollHandler);
                
                // Create bound handlers
                widget.wheelHandler = this.handleFrameWheel.bind(this, widget);
                widget.scrollHandler = this.handleFrameScroll.bind(this, widget);
                
                widget.frame.addEventListener('wheel', widget.wheelHandler, { passive: false });
                widget.frame.addEventListener('scroll', widget.scrollHandler, { passive: true });
            }
        });
    }

    handleFrameScroll(widget, event) {
        // Track manual scroll changes to prevent conflicts
        if (widget.isScrollingContent) {
            widget.lastScrollTop = widget.frame.scrollTop;
        }
    }

    handleFrameWheel(widget, event) {
        // Only handle wheel events when frame is scrollable and not in sliding phase
        if (!widget.frame.classList.contains('frame-scrollable') || !widget.isScrollingContent) {
            return;
        }
        
        const frame = widget.frame;
        const isScrollingDown = event.deltaY > 0;
        const isScrollingUp = event.deltaY < 0;
        
        const atTop = frame.scrollTop <= 1; // Small threshold for floating point precision
        const atBottom = frame.scrollTop >= (frame.scrollHeight - frame.clientHeight - 1);
        
        // Allow page scroll to continue if:
        // - Scrolling up and at top of frame content
        // - Scrolling down and at bottom of frame content
        if ((isScrollingUp && atTop) || (isScrollingDown && atBottom)) {
            // Don't prevent default - allow page scroll to continue
            return;
        }
        
        // Prevent page scroll when scrolling within frame content
        event.stopPropagation();
    }

    calculateFooterHeight() {
        if (!this.pageFooter) return 0;
        
        // Temporarily make footer visible to measure its height
        const originalPosition = this.pageFooter.style.position;
        const originalVisibility = this.pageFooter.style.visibility;
        const originalTop = this.pageFooter.style.top;
        
        this.pageFooter.style.position = 'static';
        this.pageFooter.style.visibility = 'hidden';
        this.pageFooter.style.top = 'auto';
        
        // Force layout and measure
        this.pageFooter.offsetHeight;
        const footerHeight = this.pageFooter.offsetHeight;
        
        // Restore original styles
        this.pageFooter.style.position = originalPosition;
        this.pageFooter.style.visibility = originalVisibility;
        this.pageFooter.style.top = originalTop;
        
        return footerHeight;
    }

    calculateOverlayPositions() {
        const windowHeight = window.innerHeight;
        
        // Calculate footer height first
        this.footerHeight = this.calculateFooterHeight();
        
        // Calculate overlay start position
        const stickyHandler = window.stickyScrollHandler;
        let petriLockPosition = 0;
        
        if (stickyHandler && stickyHandler.contentLockPosition) {
            petriLockPosition = stickyHandler.contentLockPosition;
        } else {
            // Fallback: calculate manually
            const widgetAmr = document.getElementById('widget-amr');
            if (widgetAmr) {
                const amrRect = widgetAmr.getBoundingClientRect();
                const pageYOffset = window.pageYOffset || document.documentElement.scrollTop;
                petriLockPosition = amrRect.top + pageYOffset + widgetAmr.offsetHeight - windowHeight;
            }
        }
        
        // Overlay starts after 3.5 viewport heights of petri scroll
        this.overlayStartPosition = petriLockPosition + (windowHeight * 3.5);
        
        // Base scroll range for each widget (for the sliding animation)
        this.baseWidgetScrollRange = windowHeight;
        
        // Calculate scroll ranges for each widget including content overflow
        this.calculateWidgetScrollRanges();
        
        // Calculate total scroll range
        this.totalScrollRange = this.widgets.reduce((total, widget) => total + widget.scrollRange, 0);
        
        // Calculate footer position (after all widgets are complete)
        const footerStartPosition = this.overlayStartPosition + this.totalScrollRange;
        
        // Position footer
        if (this.pageFooter) {
            this.pageFooter.style.top = `${footerStartPosition}px`;
        }
        
        // Extend body height to include footer
        const totalScrollHeight = footerStartPosition + this.footerHeight + windowHeight;
        const currentBodyHeight = parseInt(document.body.style.minHeight) || 0;
        if (totalScrollHeight > currentBodyHeight) {
            document.body.style.minHeight = `${totalScrollHeight}px`;
        }
        
        console.log(`Overlay start: ${this.overlayStartPosition}px, total range: ${this.totalScrollRange}px, footer height: ${this.footerHeight}px`);
        console.log('Widget ranges:', this.widgets.map(w => ({ id: w.id, range: w.scrollRange })));
    }

    calculateWidgetScrollRanges() {
        const windowHeight = window.innerHeight;
        
        this.widgets.forEach(widget => {
            if (!widget.frame) {
                widget.scrollRange = this.baseWidgetScrollRange;
                widget.contentOverflow = 0;
                return;
            }
            
            // Special handling for interactive widgets
            if (widget.isInteractive && widget.id === 'widget-death-viz') {
                // Wait for the death viz handler to be initialized and get expansion height
                const deathHandler = window.deathVizHandler;
                if (deathHandler && typeof deathHandler.getExpansionHeight === 'function') {
                    widget.contentOverflow = deathHandler.getExpansionHeight();
                    widget.scrollRange = this.baseWidgetScrollRange + widget.contentOverflow;
                    widget.isScrollingContent = false; // No internal scrolling for interactive widgets
                    console.log(`Interactive widget ${widget.id}: expansion=${widget.contentOverflow}px, total range=${widget.scrollRange}px`);
                } else {
                    // Fallback if handler not ready
                    widget.scrollRange = this.baseWidgetScrollRange;
                    widget.contentOverflow = 0;
                }
                return;
            }
            
            // Standard content overflow calculation for non-interactive widgets
            const originalDisplay = widget.element.style.display;
            const originalVisibility = widget.element.style.visibility;
            const originalTransform = widget.frame.style.transform;
            const originalOverflow = widget.frame.style.overflowY;
            
            widget.element.style.display = 'block';
            widget.element.style.visibility = 'hidden';
            widget.frame.style.transform = 'translateY(0%)';
            widget.frame.style.overflowY = 'visible';
            
            // Force layout
            widget.frame.offsetHeight;
            
            // Get content height
            const contentHeight = widget.frame.scrollHeight;
            const frameHeight = windowHeight; // Frame is 100vh
            
            // Calculate overflow with additional bottom margin (3rem = ~48px)
            const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const additionalBottomMargin = 3 * remInPx;
            const contentOverflow = Math.max(0, contentHeight - frameHeight + additionalBottomMargin);
            
            // Base range (for sliding animation) + content overflow
            widget.scrollRange = this.baseWidgetScrollRange + contentOverflow;
            widget.contentOverflow = contentOverflow;
            
            // Store initial scroll state
            widget.isScrollingContent = false;
            widget.lastScrollTop = 0;
            
            // Restore original styles
            widget.element.style.display = originalDisplay;
            widget.element.style.visibility = originalVisibility;
            widget.frame.style.transform = originalTransform;
            widget.frame.style.overflowY = originalOverflow;
        });
    }

    handleOverlayScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop < this.overlayStartPosition) {
            // Before overlay - hide all widgets and show petri
            this.resetToInitialState();
            return;
        }
        
        // Calculate scroll progress within the overlay system
        const scrollProgress = scrollTop - this.overlayStartPosition;
        
        // Check if we're past all widgets (entering footer area)
        if (scrollProgress >= this.totalScrollRange) {
            // Past all widgets - show all widgets as completely visible and show footer
            this.showAllWidgetsComplete();
            this.showFooter();
            return;
        }
        
        // Hide footer when in widget area
        this.hideFooter();
        
        // Find which widget should be active based on cumulative scroll ranges
        let cumulativeRange = 0;
        let currentWidgetIndex = -1;
        let progressInWidget = 0;
        
        for (let i = 0; i < this.widgets.length; i++) {
            const widget = this.widgets[i];
            const nextCumulativeRange = cumulativeRange + widget.scrollRange;
            
            if (scrollProgress >= cumulativeRange && scrollProgress < nextCumulativeRange) {
                currentWidgetIndex = i;
                progressInWidget = (scrollProgress - cumulativeRange) / widget.scrollRange;
                break;
            }
            
            cumulativeRange = nextCumulativeRange;
        }
        
        // If no widget found, default to last widget
        if (currentWidgetIndex === -1) {
            currentWidgetIndex = this.widgets.length - 1;
            progressInWidget = 1;
        }
        
        // Clamp values
        const clampedProgress = Math.min(1, Math.max(0, progressInWidget));
        
        // Update the widget system
        this.updateWidgetSystem(currentWidgetIndex, clampedProgress);
    }

    showFooter() {
        if (this.pageFooter) {
            this.pageFooter.style.visibility = 'visible';
            this.pageFooter.style.opacity = '1';
        }
    }

    hideFooter() {
        if (this.pageFooter) {
            this.pageFooter.style.visibility = 'hidden';
            this.pageFooter.style.opacity = '0';
        }
    }

    resetToInitialState() {
        // Remove overlay class from petri
        if (this.widgetPetri) {
            this.widgetPetri.classList.remove('overlayed');
        }
        
        // Hide footer
        this.hideFooter();
        
        // Hide all widgets and reset their positions
        this.widgets.forEach(widget => {
            if (widget.element) {
                widget.element.classList.remove('active');
            }
            if (widget.frame) {
                widget.frame.style.transform = 'translateY(100%)';
                widget.frame.style.opacity = '1';
                // Disable internal scrolling and reset scroll state (except interactive widgets)
                if (!widget.isInteractive) {
                    widget.frame.classList.remove('frame-scrollable');
                    widget.frame.scrollTop = 0;
                }
                widget.isScrollingContent = false;
                widget.lastScrollTop = 0;
            }
            
            // Reset interactive widgets
            if (widget.isInteractive && widget.id === 'widget-death-viz') {
                const deathHandler = window.deathVizHandler;
                if (deathHandler && typeof deathHandler.setScrollProgress === 'function') {
                    deathHandler.setScrollProgress(0);
                }
            }
        });
    }

    showAllWidgetsComplete() {
        // Activate overlay
        if (this.widgetPetri) {
            this.widgetPetri.classList.add('overlayed');
        }
        
        // Show all widgets as completely visible
        this.widgets.forEach(widget => {
            if (widget.element) {
                widget.element.classList.add('active');
            }
            if (widget.frame) {
                widget.frame.style.transform = 'translateY(0%)';
                widget.frame.style.opacity = '1';
            }
            
            // Set interactive widgets to full progress
            if (widget.isInteractive && widget.id === 'widget-death-viz') {
                const deathHandler = window.deathVizHandler;
                if (deathHandler && typeof deathHandler.setScrollProgress === 'function') {
                    deathHandler.setScrollProgress(1.0);
                }
            }
        });
    }

    updateWidgetSystem(targetWidgetIndex, progress) {
        // Activate overlay if not already active
        if (this.widgetPetri && !this.widgetPetri.classList.contains('overlayed')) {
            this.widgetPetri.classList.add('overlayed');
        }
        
        // Process each widget based on its relationship to the target
        this.widgets.forEach((widget, index) => {
            const wasActive = widget.element.classList.contains('active');
            
            if (index < targetWidgetIndex) {
                // Widgets before target: show as completely visible
                this.showWidgetComplete(widget);
                
            } else if (index === targetWidgetIndex) {
                // Current target widget: show with transition based on progress
                this.showWidgetWithProgress(widget, progress);
                
            } else {
                // Widgets after target: hide
                this.hideWidget(widget);
            }
            
            // Notify widget of state change if needed
            const isActive = widget.element.classList.contains('active');
            if (wasActive !== isActive) {
                this.notifyWidgetStateChange(widget, isActive);
            }
        });
    }

    notifyWidgetStateChange(widget, isActive) {
        // Dispatch custom event for widget state change
        const event = new CustomEvent('widgetStateChange', {
            detail: {
                widgetId: widget.id,
                isActive: isActive
            }
        });
        window.dispatchEvent(event);
        
        // Also notify the widget directly if it has a handler
        if (widget.element) {
            const handler = window[`${widget.id}Handler`];
            if (handler && typeof handler.onStateChange === 'function') {
                handler.onStateChange(isActive);
            }
        }
    }

    showWidgetComplete(widget) {
        if (widget.element) {
            widget.element.classList.add('active');
        }
        if (widget.frame) {
            widget.frame.style.transform = 'translateY(0%)';
            widget.frame.style.opacity = '1';
            
            // Handle interactive widgets
            if (widget.isInteractive && widget.id === 'widget-death-viz') {
                const deathHandler = window.deathVizHandler;
                if (deathHandler && typeof deathHandler.setScrollProgress === 'function') {
                    deathHandler.setScrollProgress(1.0); // Full expansion
                }
            } else {
                // Standard widgets: enable internal scrolling and scroll to bottom if content overflows
                widget.frame.classList.add('frame-scrollable');
                widget.isScrollingContent = true;
                if (widget.contentOverflow > 0) {
                    widget.frame.scrollTop = widget.contentOverflow;
                    widget.lastScrollTop = widget.contentOverflow;
                }
            }
        }
    }

    showWidgetWithProgress(widget, progress) {
        if (widget.element) {
            widget.element.classList.add('active');
        }
        if (widget.frame) {
            // Handle interactive widgets
            if (widget.isInteractive && widget.id === 'widget-death-viz') {
                // Calculate sliding phase and interactive phase
                const slidingPhase = this.baseWidgetScrollRange / widget.scrollRange;
                
                if (progress <= slidingPhase) {
                    // Sliding phase: widget is sliding up
                    const slidingProgress = progress / slidingPhase;
                    const easedProgress = this.easeOutCubic(slidingProgress);
                    
                    // Calculate Y position (from 100% to 0%)
                    const translateY = 100 - (easedProgress * 100);
                    widget.frame.style.transform = `translateY(${translateY}%)`;
                    
                    // Reset interactive state
                    const deathHandler = window.deathVizHandler;
                    if (deathHandler && typeof deathHandler.setScrollProgress === 'function') {
                        deathHandler.setScrollProgress(0);
                    }
                } else {
                    // Interactive phase: widget is at top, run interactive scaling
                    widget.frame.style.transform = 'translateY(0%)';
                    
                    // Calculate progress in interactive phase (0-1)
                    const interactiveProgress = (progress - slidingPhase) / (1 - slidingPhase);
                    
                    const deathHandler = window.deathVizHandler;
                    if (deathHandler && typeof deathHandler.setScrollProgress === 'function') {
                        deathHandler.setScrollProgress(interactiveProgress);
                    }
                }
            } else {
                // Standard widget handling
                const slidingPhase = this.baseWidgetScrollRange / widget.scrollRange;
                
                if (progress <= slidingPhase) {
                    // Sliding phase: widget is sliding up
                    const slidingProgress = progress / slidingPhase;
                    const easedProgress = this.easeOutCubic(slidingProgress);
                    
                    // Calculate Y position (from 100% to 0%)
                    const translateY = 100 - (easedProgress * 100);
                    
                    widget.frame.style.transform = `translateY(${translateY}%)`;
                    widget.frame.classList.remove('frame-scrollable');
                    
                    // Reset internal scroll state
                    widget.frame.scrollTop = 0;
                    widget.isScrollingContent = false;
                    widget.lastScrollTop = 0;
                    
                } else {
                    // Content scroll phase: widget is at top, scroll internal content
                    widget.frame.style.transform = 'translateY(0%)';
                    widget.frame.classList.add('frame-scrollable');
                    widget.isScrollingContent = true;
                    
                    if (widget.contentOverflow > 0) {
                        // Calculate target scroll position
                        const contentScrollProgress = (progress - slidingPhase) / (1 - slidingPhase);
                        const targetScrollTop = contentScrollProgress * widget.contentOverflow;
                        
                        // Only update scroll if significantly different to avoid glitches
                        const scrollDifference = Math.abs(targetScrollTop - widget.frame.scrollTop);
                        if (scrollDifference > 2) { // 2px threshold to prevent micro-adjustments
                            widget.frame.scrollTop = targetScrollTop;
                            widget.lastScrollTop = targetScrollTop;
                        }
                    }
                }
            }
            
            widget.frame.style.opacity = '1';
        }
    }

    hideWidget(widget) {
        if (widget.element) {
            widget.element.classList.remove('active');
        }
        if (widget.frame) {
            widget.frame.style.transform = 'translateY(100%)';
            widget.frame.style.opacity = '1';
            
            // Handle interactive widgets
            if (widget.isInteractive && widget.id === 'widget-death-viz') {
                const deathHandler = window.deathVizHandler;
                if (deathHandler && typeof deathHandler.setScrollProgress === 'function') {
                    deathHandler.setScrollProgress(0);
                }
            } else {
                // Standard widgets: disable internal scrolling and reset scroll state
                widget.frame.classList.remove('frame-scrollable');
                widget.frame.scrollTop = 0;
            }
            
            widget.isScrollingContent = false;
            widget.lastScrollTop = 0;
        }
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Method to dynamically add new widgets (if needed)
    addWidget(widgetId) {
        const element = document.getElementById(widgetId);
        if (element && !this.widgets.find(w => w.id === widgetId)) {
            const frame = element.querySelector('.frame') || 
                         element.querySelector('.world-frame') ||
                         element.querySelector(`[class*="frame"]`) ||
                         element;
            
            this.widgets.push({
                id: widgetId,
                element: element,
                frame: frame
            });
            
            // Recalculate positions
            this.calculateOverlayPositions();
            
            console.log(`Added widget: ${widgetId}`);
        }
    }

    // Method to dynamically remove widgets (if needed)
    removeWidget(widgetId) {
        const index = this.widgets.findIndex(w => w.id === widgetId);
        if (index !== -1) {
            // Hide widget if active
            const widget = this.widgets[index];
            if (widget.element) {
                widget.element.classList.remove('active');
            }
            
            // Remove from array
            this.widgets.splice(index, 1);
            
            // Recalculate positions
            this.calculateOverlayPositions();
            
            console.log(`Removed widget: ${widgetId}`);
        }
    }
}

// Store reference globally so the petri handler can access it
window.widgetOverlayHandler = null;

// Initialize
let widget_count = 0;

function CSVLoadedTrigger() {
    widget_count++;
    console.log("widget_count: " + widget_count);
    if(widget_count == 4) {
        // Small delay to ensure death handler is ready
        setTimeout(() => {
            window.widgetOverlayHandler = new WidgetOverlayHandler();
        }, 100);
    }
}

function openLegendaPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;
    popup.classList.add('active');

    // On mobile, move popup-overlay to end of body to ensure it's above overlays
    if (window.innerWidth < 600) {
        document.body.appendChild(popup);
    }
}

function closeLegendaPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;
    popup.classList.remove('active');
}