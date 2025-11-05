// widget-petri.js - Robust scroll control with improved synchronization
// Updated to ensure consistent step 1-2 behavior while preserving resistant step 3 animation

class StickyScrollHandler {
    constructor() {
        this.contentSticky = document.getElementById('content-sticky');
        this.widgetPetri = document.getElementById('widget-petri');
        this.petriFrame = this.widgetPetri ? this.widgetPetri.querySelector('.petri-frame') : null;
        this.widgetAmr = document.getElementById('widget-amr');
        
        this.isContentLocked = false;
        this.contentLockPosition = 0;
        this.breakpoints = {
            mobile: 700,
            tabletV: 600,
            tabletH: 900,
            desktop: 1200
        };
        
        // Get all content blocks and circle
        this.contentBlocks = [];
        this.circle = null;
        this.legenda = null;
        this.currentTargetBlock = 0;
        this.isTransitioning = false;
        
        // Get petri dish containers for animation control - more robust approach
        this.bacteriumPetri = document.getElementById('bacterium-petri');
        this.resistantBacteriumPetri = document.getElementById('resistant-bacterium-petri');
        this.currentAnimationStep = 0;
        
        // Circle animation control
        this.circlesAnimated = false;
        
        // Scroll milestones for precise control
        this.scrollMilestones = [];
        
        // Safari detection and animation fallback
        this.isSafari = this.detectSafari();
        this.activeAnimations = new Map(); // Track active JS animations
        
        console.log("isSticky: " + this.contentSticky);
        console.log("isWidgetPetri: " + this.widgetPetri);
        console.log("isPetriFrame: " + this.petriFrame);
        console.log("isSafari: " + this.isSafari);
        

        if (this.contentSticky && this.widgetPetri && this.petriFrame) {
            this.init();
            console.log("Attivo");
        }

    }

    init() {
        this.setupElements();
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.calculateLockPosition();
                this.calculateScrollMilestones();
            }, 100);
        });
        this.calculateLockPosition();
        this.calculateScrollMilestones();
    }

    setupElements() {
        // Get circle element
        this.circle = this.petriFrame.querySelector('.petri-circle');
        
        // Get legenda element
        this.legenda = this.petriFrame.querySelector('#petri-legenda');
        
        // Get all content blocks
        this.contentBlocks = this.petriFrame.querySelectorAll('.petri-content-block');
        
        // Set initial states
        if (this.circle) {
            this.circle.style.opacity = '0';
        }
        
        if (this.legenda) {
            this.legenda.style.opacity = '0';
        }
        
        this.contentBlocks.forEach((block, index) => {
            block.style.opacity = '0';
            block.style.display = index === 0 ? 'block' : 'none';
        });
        
        // Initialize petri dishes animation state
        this.resetPetriAnimations();
    }

    getViewportType() {
        const width = window.innerWidth;
        if (width <= this.breakpoints.mobile) return 'mobile';
        if (width < this.breakpoints.tabletH) return 'tablet-v';
        if (width < this.breakpoints.desktop) return 'tablet-h';
        return 'desktop';
    }

    calculateLockPosition() {
        const windowHeight = window.innerHeight;
        const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const viewportType = this.getViewportType();
        
        const bottomMargin = 3 * remInPx;
        
        if (this.widgetAmr) {
            const amrRect = this.widgetAmr.getBoundingClientRect();
            const pageYOffset = window.pageYOffset || document.documentElement.scrollTop;
            const amrOffsetTop = amrRect.top + pageYOffset;
            const amrHeight = this.widgetAmr.offsetHeight;
            
            this.contentLockPosition = amrOffsetTop + amrHeight - windowHeight + bottomMargin;
        } else {
            const contentHeight = this.contentSticky.scrollHeight;
            this.contentLockPosition = contentHeight - windowHeight + bottomMargin;
        }
        
        // Viewport adjustments
        switch(viewportType) {
            case 'mobile':
                this.contentLockPosition += remInPx * 1.5;
                break;
            case 'tablet-v':
                this.contentLockPosition += remInPx * 1;
                break;
            case 'tablet-h':
                this.contentLockPosition += remInPx * 0.5;
                break;
        }
        
        this.contentLockPosition = Math.max(0, this.contentLockPosition);
        
        // Set minimum body height for scrolling through multiple blocks
        const scrollMultiplier = 3.5;
        const totalScrollHeight = this.contentLockPosition + (windowHeight * scrollMultiplier);
        document.body.style.minHeight = `${totalScrollHeight}px`;
        
        console.log(`Viewport: ${viewportType}, Lock position: ${this.contentLockPosition}px`);
    }

    calculateScrollMilestones() {
        const windowHeight = window.innerHeight;
        
        // Fixed milestones based on viewport height
        this.scrollMilestones = [
            {
                // Milestone 0: Initial state (before lock)
                start: 0,
                end: this.contentLockPosition,
                phase: 'unlock'
            },
            {
                // Milestone 1: Blur and circle appear (0-50vh after lock)
                start: this.contentLockPosition,
                end: this.contentLockPosition + (windowHeight * 0.5),
                phase: 'blur-circle'
            },
            {
                // Milestone 2: First block appears (50vh-100vh after lock)
                start: this.contentLockPosition + (windowHeight * 0.5),
                end: this.contentLockPosition + windowHeight,
                phase: 'block',
                blockIndex: 0
            },
            {
                // Milestone 3: Second block (100vh-200vh after lock)
                start: this.contentLockPosition + windowHeight,
                end: this.contentLockPosition + (windowHeight * 2),
                phase: 'block',
                blockIndex: 1
            },
            {
                // Milestone 4: Third block (200vh-300vh after lock)
                start: this.contentLockPosition + (windowHeight * 2),
                end: this.contentLockPosition + (windowHeight * 3),
                phase: 'block',
                blockIndex: 2
            },
            {
                // Milestone 5: Fourth block (300vh-350vh after lock)
                start: this.contentLockPosition + (windowHeight * 3),
                end: this.contentLockPosition + (windowHeight * 3.5),
                phase: 'block',
                blockIndex: 3
            }
        ];
    }

    getCurrentMilestone(scrollTop) {
        for (let i = 0; i < this.scrollMilestones.length; i++) {
            const milestone = this.scrollMilestones[i];
            if (scrollTop >= milestone.start && scrollTop < milestone.end) {
                return { ...milestone, index: i };
            }
        }
        return this.scrollMilestones[this.scrollMilestones.length - 1];
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop < 0) return;
        
        const currentMilestone = this.getCurrentMilestone(scrollTop);
        
        // Handle lock/unlock based on milestone
        if (currentMilestone.phase === 'unlock' && this.isContentLocked) {
            this.unlockContent();
            return;
        } else if (currentMilestone.phase !== 'unlock' && !this.isContentLocked) {
            this.lockContent();
        }
        
        if (this.isContentLocked) {
            this.updatePetriEffects(scrollTop, currentMilestone);
        }
    }

    lockContent() {
        this.isContentLocked = true;
        
        this.contentSticky.classList.add('locked');
        this.contentSticky.style.position = 'fixed';
        this.contentSticky.style.top = `${-this.contentLockPosition}px`;
        this.contentSticky.style.zIndex = '1';
        
        this.widgetPetri.classList.add('active');
    }

    unlockContent() {
        this.isContentLocked = false;
        
        this.contentSticky.classList.remove('locked');
        this.contentSticky.style.position = '';
        this.contentSticky.style.top = '';
        this.contentSticky.style.zIndex = '';
        
        this.widgetPetri.classList.remove('active');
        
        // Reset all effects to initial state
        this.petriFrame.style.backdropFilter = 'blur(0px)';
        // Safari (iOS) requires the webkit-prefixed property when setting via JS
        this.petriFrame.style.webkitBackdropFilter = 'blur(0px)';
        this.petriFrame.style.background = 'rgba(255, 255, 255, 0)';
        
        if (this.circle) {
            this.circle.style.opacity = '0';
        }
        
        if (this.legenda) {
            this.legenda.style.opacity = '0';
        }
        
        // Reset all blocks to initial state
        this.contentBlocks.forEach((block, index) => {
            block.style.opacity = '0';
            block.style.display = index === 0 ? 'block' : 'none';
        });
        
        this.currentTargetBlock = 0;
        this.isTransitioning = false;
        
        // Reset petri animations
        this.resetPetriAnimations();
        
        // Reset circle container animations
        this.resetCircleContainers();
        
        // Clean up Safari overlay circles and masks
        this.cleanupSafariOverlays();
        
        // Clear any pending timeouts
        clearTimeout(this.blockTimeout);
    }

    updatePetriEffects(scrollTop, milestone) {
        const progressInMilestone = (scrollTop - milestone.start) / (milestone.end - milestone.start);
        const clampedProgress = Math.min(1, Math.max(0, progressInMilestone));
        
        switch (milestone.phase) {
            case 'blur-circle':
                this.handleBlurCirclePhase(clampedProgress);
                break;
            case 'block':
                this.handleBlockPhase(milestone.blockIndex, clampedProgress);
                break;
        }
    }

    handleBlurCirclePhase(progress) {
        // Apply easing
        const easedProgress = this.easeOutCubic(progress);
        
        // Update blur and background
        const blurAmount = easedProgress * 10; // Max 10px blur
        const backgroundOpacity = easedProgress * 1; // Max 100% opacity
        this.petriFrame.style.backdropFilter = `blur(${blurAmount}px)`;
        // Also set webkit-prefixed property for Safari/iOS
        this.petriFrame.style.webkitBackdropFilter = `blur(${blurAmount}px)`;
        this.petriFrame.style.background = `rgba(255, 255, 255, ${backgroundOpacity})`;
        
        // Update circle opacity (same as blur)
        if (this.circle) {
            this.circle.style.opacity = easedProgress;
        }
        
        // IMPORTANT: Reset petri animations during blur phase (before first text)
        if (this.currentAnimationStep !== 0) {
            this.setGrowthAnimationStep(0);
            this.currentAnimationStep = 0;
        }
        
        // Trigger circle container animation when progress starts
        if (progress > 0.1 && !this.circlesAnimated) {
            this.animateCircleContainers();
            this.circlesAnimated = true;
        }
        
        // Hide legenda during blur phase (before first block appears)
        if (this.legenda) {
            this.legenda.style.opacity = '0';
        }
        
        // Ensure first block is ready but not visible yet
        if (this.contentBlocks[0]) {
            this.contentBlocks[0].style.display = 'block';
            this.contentBlocks[0].style.opacity = '0';
        }
    }

    handleBlockPhase(targetBlockIndex, progress) {
        // Ensure blur and circle are at 100%
        this.petriFrame.style.backdropFilter = 'blur(10px)';
        this.petriFrame.style.webkitBackdropFilter = 'blur(10px)';
        this.petriFrame.style.background = 'rgba(255, 255, 255, 1)';
        if (this.circle) {
            this.circle.style.opacity = '1';
        }
        
        // Show legenda starting from first block (targetBlockIndex 0) and keep it for all others
        if (targetBlockIndex >= 0 && this.legenda) {
            this.legenda.style.opacity = '1';
        }
        
        // Update petri growth animations based on block index
        this.updatePetriGrowthAnimations(targetBlockIndex);
        
        // Handle block transitions
        if (targetBlockIndex !== this.currentTargetBlock && !this.isTransitioning) {
            this.transitionToBlock(targetBlockIndex);
        } else if (targetBlockIndex === this.currentTargetBlock) {
            // Ensure the correct block is visible
            const targetBlock = this.contentBlocks[targetBlockIndex];
            if (targetBlock && targetBlock.style.opacity === '0') {
                targetBlock.style.display = 'block';
                targetBlock.style.opacity = '1';
            }
        }
    }

    updatePetriGrowthAnimations(blockIndex) {
        // Determine animation step based on content block
        let targetStep = 0;
        
        // Step 1 starts from blockIndex 0 (first text)
        if (blockIndex >= 2) {
            // Third block and beyond: bacteria + antibiotic + inhibition zone
            targetStep = 3;
        } else if (blockIndex >= 1) {
            // Second block: bacteria + antibiotic  
            targetStep = 2;
        } else if (blockIndex >= 0) {
            // First block: bacteria growth only
            targetStep = 1;
        }
        
        // Only update if the step has changed
        if (targetStep !== this.currentAnimationStep) {
            this.setGrowthAnimationStep(targetStep);
            this.currentAnimationStep = targetStep;
        }
    }

    // Improved class application with more robust error handling
    setGrowthAnimationStep(step) {
        // Remove all step classes from both petri dishes - more robust approach
        const stepClasses = ['step-1-active', 'step-2-active', 'step-3-active'];
        
        // Clear all classes from both dishes
        if (this.bacteriumPetri) {
            stepClasses.forEach(className => {
                this.bacteriumPetri.classList.remove(className);
            });
        }
        
        if (this.resistantBacteriumPetri) {
            stepClasses.forEach(className => {
                this.resistantBacteriumPetri.classList.remove(className);
            });
        }
        
        // Force a small delay to ensure classes are cleared before applying new ones
        // This helps with synchronization issues
        setTimeout(() => {
            this.applyStepClasses(step);
        }, 10);
    }
    
    // Separate method for applying classes to ensure synchronization (removed - using Safari-aware version below)

    animateCircleContainers() {
        // Add class to trigger circle container animation
        if (this.widgetPetri) {
            this.widgetPetri.classList.add('circles-visible');
        }
        console.log('Circle containers animation triggered');
    }

    resetCircleContainers() {
        // Remove animation class and reset state
        if (this.widgetPetri) {
            this.widgetPetri.classList.remove('circles-visible');
        }
        this.circlesAnimated = false;
        console.log('Circle containers animation reset');
    }

    cleanupSafariOverlays() {
        // Remove all Safari overlay circles and mask containers
        document.querySelectorAll('.safari-overlay-circle').forEach(el => {
            el.remove();
        });
        document.querySelectorAll('[id^="safari-mask-"]').forEach(el => {
            el.remove();
        });
        
        console.log('Safari overlay circles and masks cleaned up');
    }

    resetPetriAnimations() {
        // Remove all animation step classes from both petri dishes
        const stepClasses = ['step-1-active', 'step-2-active', 'step-3-active'];
        
        if (this.bacteriumPetri) {
            stepClasses.forEach(className => {
                this.bacteriumPetri.classList.remove(className);
            });
        }
        
        if (this.resistantBacteriumPetri) {
            stepClasses.forEach(className => {
                this.resistantBacteriumPetri.classList.remove(className);
            });
        }
        
        // Cancel all active Safari animations and reset circles
        if (this.isSafari) {
            this.activeAnimations.forEach((animationId) => {
                cancelAnimationFrame(animationId);
            });
            this.activeAnimations.clear();
            
            // Reset all circle radii, transforms, and opacity
            const allCircles = document.querySelectorAll('.growth-circle, .antibiotic-circle, .inhibition-circle');
            allCircles.forEach(circle => {
                circle.setAttribute('r', '0');
                circle.style.transform = 'scale(0)';
                circle.style.opacity = '0';
            });
            
            // Remove Safari overlay circles and masks
            document.querySelectorAll('.safari-overlay-circle').forEach(el => el.remove());
            document.querySelectorAll('[id^="safari-mask-"]').forEach(el => el.remove());
        }
        
        this.currentAnimationStep = 0;
        console.log('All petri animations reset');
    }

    transitionToBlock(newIndex) {
        if (newIndex < 0 || newIndex >= this.contentBlocks.length || this.isTransitioning) {
            return;
        }
        
        this.isTransitioning = true;
        
        const currentBlock = this.contentBlocks[this.currentTargetBlock];
        const newBlock = this.contentBlocks[newIndex];
        
        // Immediately hide all other blocks
        this.contentBlocks.forEach((block, index) => {
            if (index !== this.currentTargetBlock && index !== newIndex) {
                block.style.display = 'none';
                block.style.opacity = '0';
            }
        });
        
        // Fade out current block
        if (currentBlock) {
            currentBlock.style.opacity = '0';
        }
        
        // Clear any existing timeout
        clearTimeout(this.blockTimeout);
        
        // After a delay, switch blocks and fade in
        this.blockTimeout = setTimeout(() => {
            // Hide current block
            if (currentBlock) {
                currentBlock.style.display = 'none';
            }
            
            // Show and fade in new block
            if (newBlock) {
                newBlock.style.display = 'block';
                newBlock.style.opacity = '0';
                
                // Force reflow
                newBlock.offsetHeight;
                
                // Fade in
                newBlock.style.opacity = '1';
            }
            
            this.currentTargetBlock = newIndex;
            this.isTransitioning = false;
        }, 150);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Safari detection method - covers mobile, tablet, and desktop Safari that needs fallback
    detectSafari() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isTabletSafari = /ipad/.test(userAgent) || 
                              (/macintosh/.test(userAgent) && 'ontouchend' in document); // iPad Pro with desktop user agent
        const isMobileSafari = /mobile.*safari/.test(userAgent) && !/chrome/.test(userAgent);
        const isDesktopSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent) && !/mobile/.test(userAgent);
        const isAndroidWebView = /android.*webkit/.test(userAgent) && !/chrome/.test(userAgent);
        
        // Return true for Safari on any platform that might have SVG animation issues
        const needsFallback = isIOS || isTabletSafari || isMobileSafari || isDesktopSafari || isAndroidWebView;

        console.log("User Agent: " + userAgent);
        console.log("Is iOS: " + isIOS);
        console.log("Is Tablet Safari: " + isTabletSafari);
        console.log("Is Mobile Safari: " + isMobileSafari);
        console.log("Is Desktop Safari: " + isDesktopSafari);
        console.log("Is Android WebView: " + isAndroidWebView);
        console.log("Needs Safari fallback: " + needsFallback);
        
        return needsFallback;
    }


    // Web Animations API approach for Safari - more reliable than requestAnimationFrame
    animateCircleRadius(circle, targetRadius, duration = 2000, delay = 0) {
        if (!circle) {
            console.log('animateCircleRadius: circle is null');
            return;
        }

        const circleId = circle.getAttribute('cx') + '-' + circle.getAttribute('cy') + '-' + circle.classList.toString();
        console.log(`Starting Web Animation for circle ${circleId} to radius ${targetRadius} over ${duration}ms`);
        
        // Cancel existing animation for this circle
        if (this.activeAnimations.has(circleId)) {
            const existingAnimation = this.activeAnimations.get(circleId);
            if (existingAnimation && existingAnimation.cancel) {
                existingAnimation.cancel();
            }
        }

        setTimeout(() => {
            // Try Web Animations API first
            const baseRadius = 50;
            const targetScale = targetRadius / baseRadius;
            
            circle.setAttribute('r', baseRadius);
            const cx = circle.getAttribute('cx');
            const cy = circle.getAttribute('cy');
            circle.style.transformOrigin = `${cx}px ${cy}px`;
            
            console.log(`Starting Web Animation: scaling to ${targetScale}x (target radius: ${targetRadius})`);
            
            try {
                const animation = circle.animate([
                    { transform: 'scale(0)' },
                    { transform: `scale(${targetScale})` }
                ], {
                    duration: duration,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // ease-out
                    fill: 'forwards'
                });
                
                this.activeAnimations.set(circleId, animation);
                
                animation.addEventListener('finish', () => {
                    console.log(`Web Animation completed for circle ${circleId}`);
                    this.activeAnimations.delete(circleId);
                });
                
                // Fallback: also update r attribute directly for Safari
                const startTime = performance.now();
                const updateRadius = () => {
                    const elapsed = performance.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const currentRadius = progress * targetRadius;
                    
                    circle.setAttribute('r', currentRadius);
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateRadius);
                    }
                };
                requestAnimationFrame(updateRadius);
                
            } catch (error) {
                console.log('Web Animations API failed, using fallback:', error);
                // Fallback to direct attribute manipulation
                this.fallbackDirectAnimation(circle, targetRadius, duration);
            }
        }, delay);
    }
    
    // Fallback direct animation for Safari
    fallbackDirectAnimation(circle, targetRadius, duration) {
        const startTime = performance.now();
        const startRadius = 0;
        
        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentRadius = startRadius + (targetRadius - startRadius) * progress;
            
            // Set both attribute and style
            circle.setAttribute('r', currentRadius);
            circle.style.r = currentRadius;
            
            // Force visibility
            circle.style.display = 'block';
            circle.style.visibility = 'visible';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                console.log(`Fallback animation completed for radius ${targetRadius}`);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Enhanced method to apply step classes with Safari fallback
    applyStepClasses(step) {
        if (step === 0) {
            // Step 0: Reset state - all animations cleared
            console.log('Petri animations reset (step 0)');
            
            // Stop all active animations and reset radii
            this.activeAnimations.forEach((animationId) => {
                cancelAnimationFrame(animationId);
            });
            this.activeAnimations.clear();
            
            // Reset all circle radii and transforms
            const allCircles = document.querySelectorAll('.growth-circle, .antibiotic-circle, .inhibition-circle');
            allCircles.forEach(circle => {
                circle.setAttribute('r', '0');
                circle.style.transform = 'scale(0)';
            });
            
            return;
        }
        
        const targetClass = `step-${step}-active`;
        
        // Apply class to both petri dishes simultaneously
        const elementsToUpdate = [this.bacteriumPetri, this.resistantBacteriumPetri].filter(Boolean);
        
        elementsToUpdate.forEach(element => {
            element.classList.add(targetClass);
        });
        
        console.log(`Applied ${targetClass} to ${elementsToUpdate.length} petri dishes`);
        
        // If Safari, use JavaScript animation fallback
        if (this.isSafari) {
            this.applySafariAnimations(step);
        }
        
        // Log detailed status for debugging
        if (this.bacteriumPetri) {
            console.log('Bacterium petri classes:', Array.from(this.bacteriumPetri.classList));
        }
        if (this.resistantBacteriumPetri) {
            console.log('Resistant petri classes:', Array.from(this.resistantBacteriumPetri.classList));
        }
    }

    // Safari-specific animations using HTML div overlays instead of SVG
    applySafariAnimations(step) {
        console.log('Applying Safari HTML overlay animations for step:', step);
        
        // If step 0, cleanup and return
        if (step === 0) {
            document.querySelectorAll('.safari-overlay-circle').forEach(el => el.remove());
            document.querySelectorAll('[id^="safari-mask-"]').forEach(el => el.remove());
            console.log('Step 0: Safari overlays cleaned up');
            return;
        }
        
        // Check if this step has already been animated to avoid duplicates
        const existingStepCircles = document.querySelectorAll(`.safari-overlay-circle[data-step="${step}"]`);
        if (existingStepCircles.length > 0) {
            console.log(`Step ${step} circles already exist, skipping creation`);
            return;
        }
        
        // Get the SVG containers to position overlays
        const bacteriumSvg = this.bacteriumPetri ? this.bacteriumPetri.querySelector('.circle-svg') : null;
        const resistantSvg = this.resistantBacteriumPetri ? this.resistantBacteriumPetri.querySelector('.circle-svg') : null;
        
        if (!bacteriumSvg && !resistantSvg) {
            console.log('No SVG containers found for overlays');
            return;
        }
        
        console.log('Creating HTML overlay circles for Safari');
        
        // Safari scroll stabilization - use relative positioning instead of getBoundingClientRect
        const createOverlays = () => {
            // Create overlay circles for both petri dishes
            [bacteriumSvg, resistantSvg].forEach((svg, dishIndex) => {
                if (!svg) return;
                
                const dishName = dishIndex === 0 ? 'bacterium' : 'resistant';
                
                // Get SVG dimensions from attributes instead of getBoundingClientRect for stability
                const svgViewBox = svg.getAttribute('viewBox').split(' ');
                const svgWidth = parseFloat(svgViewBox[2]);
                const svgHeight = parseFloat(svgViewBox[3]);
                
                // Use SVG's computed style dimensions for better stability
                const computedStyle = window.getComputedStyle(svg);
                const actualWidth = parseFloat(computedStyle.width);
                const actualHeight = parseFloat(computedStyle.height);
                
                const scaleX = actualWidth / svgWidth;
                const scaleY = actualHeight / svgHeight;
                
                // Pass SVG element directly instead of getBoundingClientRect
                this.createOverlayCircles(svg, null, scaleX, scaleY, dishName, step);
            });
        };
        
        // Use stable relative positioning - no delay needed
        createOverlays();
    }
    
    // Create HTML div circles that overlay the SVG
    createOverlayCircles(svg, svgRect, scaleX, scaleY, dishName, step) {
        // Define circle data for this specific step only
        let circleData = [];
        
        // Only create circles for the current step
        if (step === 1) {
            // Step 1: Black bubbles grow
            const blackCircles = dishName === 'bacterium' ? [
                { cx: 130, cy: 150, maxR: 300, className: 'growth-circle-1', color: '#151515', step: 1 },
                { cx: 80, cy: 240, maxR: 300, className: 'growth-circle-1', color: '#151515', step: 1 },
                { cx: 270, cy: 130, maxR: 200, className: 'growth-circle-2', color: '#151515', step: 1 },
                { cx: 200, cy: 250, maxR: 160, className: 'growth-circle-3', color: '#151515', step: 1 }
            ] : [
                { cx: 220, cy: 110, maxR: 300, className: 'growth-circle-1', color: '#151515', step: 1 },
                { cx: 290, cy: 160, maxR: 300, className: 'growth-circle-1', color: '#151515', step: 1 },
                { cx: 160, cy: 200, maxR: 200, className: 'growth-circle-2', color: '#151515', step: 1 },
                { cx: 240, cy: 270, maxR: 160, className: 'growth-circle-3', color: '#151515', step: 1 }
            ];
            circleData.push(...blackCircles);
        } else if (step === 2) {
            // Step 2: Pink bubble grows
            circleData.push({ cx: 200, cy: 200, maxR: 25, className: 'antibiotic-circle', color: '#ff00e5', step: 2 });
        } else if (step === 3) {
            // Step 3: Grey bubbles grow (different behavior for left vs right petri dish)
            if (dishName === 'bacterium') {
                // Left petri dish: grey bubble grows and stays
                circleData.push({ 
                    cx: 200, cy: 200, maxR: 100, 
                    className: 'inhibition-circle-left', color: '#d9d9d9', 
                    step: 3, behavior: 'stay' 
                });
            } else {
                // Right petri dish: grey bubble grows and then disappears
                circleData.push({ 
                    cx: 200, cy: 200, maxR: 55, 
                    className: 'inhibition-circle-right', color: '#d9d9d9', 
                    step: 3, behavior: 'disappear' 
                });
            }
        }
        
        // Skip if no circles for this step
        if (circleData.length === 0) {
            return;
        }
        
        // Create mask container for this SVG if it doesn't exist
        let maskId = `safari-mask-${dishName}`;
        let maskContainer = document.getElementById(maskId);
        
        if (!maskContainer) {
            maskContainer = document.createElement('div');
            maskContainer.id = maskId;
            
            // Get viewport type for better positioning on tablets
            const viewportType = this.getViewportType();
            
            // Use relative positioning approach for Safari scroll stability
            // Position mask container relative to SVG's parent, not viewport
            const svgParent = svg.parentElement;
            
            // Ensure SVG parent has relative positioning
            if (svgParent && window.getComputedStyle(svgParent).position === 'static') {
                svgParent.style.position = 'relative';
            }
            
            // Position mask container to match the SVG inner circle (r=140, centered at 200,200)
            // The inner circle center is at (200,200) in SVG coordinates
            const innerCircleCenterX = 200 * scaleX; // Center X in actual pixels
            const innerCircleCenterY = 200 * scaleY; // Center Y in actual pixels
            const innerRadius = 140 * Math.min(scaleX, scaleY); // Inner circle radius in actual pixels
            
            // Get SVG's position within its parent more accurately
            // Use getBoundingClientRect relative to parent for more precise positioning
            const svgRect = svg.getBoundingClientRect();
            const parentRect = svgParent.getBoundingClientRect();
            
            const svgRelativeLeft = svgRect.left - parentRect.left;
            const svgRelativeTop = svgRect.top - parentRect.top;
            
            // Debug positioning calculations
            // Get SVG computed style for debugging
            const svgComputedStyle = window.getComputedStyle(svg);
            const svgActualWidth = parseFloat(svgComputedStyle.width);
            const svgActualHeight = parseFloat(svgComputedStyle.height);
            
            console.log(`SVG positioning debug for ${dishName}:`);
            console.log(`- SVG viewBox: ${svg.getAttribute('viewBox')}`);
            console.log(`- SVG relative position: (${svgRelativeLeft}, ${svgRelativeTop})`);
            console.log(`- SVG actual size: ${svgActualWidth}x${svgActualHeight}`);
            console.log(`- SVG margins: ${svgComputedStyle.marginLeft}, ${svgComputedStyle.marginTop}`);
            console.log(`- SVG padding: ${svgComputedStyle.paddingLeft}, ${svgComputedStyle.paddingTop}`);
            console.log(`- Scale factors: ${scaleX}, ${scaleY}`);
            console.log(`- Inner circle center: (${innerCircleCenterX}, ${innerCircleCenterY})`);
            console.log(`- Inner radius: ${innerRadius}`);
            
            // Position mask so its center aligns with the inner circle center
            const maskLeft = svgRelativeLeft + innerCircleCenterX - innerRadius;
            const maskTop = svgRelativeTop + innerCircleCenterY - innerRadius;
            
            console.log(`- Calculated mask position: (${maskLeft}, ${maskTop})`);
            
            maskContainer.style.cssText = `
                position: absolute;
                left: ${maskLeft}px;
                top: ${maskTop}px;
                width: ${innerRadius * 2}px;
                height: ${innerRadius * 2}px;
                border-radius: 50%;
                overflow: hidden;
                z-index: 11;
                pointer-events: none;
                will-change: transform;
                backface-visibility: hidden;
            `;
            
            // Add specific optimizations for tablets
            if (viewportType.includes('tablet')) {
                maskContainer.style.transform = 'translateZ(0)'; // Force hardware acceleration
                maskContainer.style.webkitTransform = 'translateZ(0)';
            }
            
            // Append to SVG's parent for relative positioning stability
            if (svgParent) {
                svgParent.appendChild(maskContainer);
                console.log(`Created mask container for ${dishName} (${viewportType}) relative to SVG parent at`, maskContainer.style.left, maskContainer.style.top);
            } else {
                document.body.appendChild(maskContainer);
                console.log(`Fallback: Created mask container for ${dishName} (${viewportType}) in body at`, maskContainer.style.left, maskContainer.style.top);
            }
        }

        // Create each overlay circle inside the mask
        circleData.forEach((data, index) => {
            const overlay = document.createElement('div');
            overlay.className = `safari-overlay-circle ${data.className}`;
            overlay.setAttribute('data-step', data.step); // Track which step this circle belongs to
            overlay.setAttribute('data-dish', dishName); // Track which dish this circle belongs to
            
            const size = data.maxR * 2 * Math.min(scaleX, scaleY);
            
            // Position relative to mask container (mask center is at 0,0 of its coordinate system)
            const maskCenterX = 140 * Math.min(scaleX, scaleY); // Center of mask container
            const maskCenterY = 140 * Math.min(scaleX, scaleY);
            
            // Calculate circle position relative to mask
            const circleX = (data.cx - 200) * scaleX; // Offset from SVG center (200,200)
            const circleY = (data.cy - 200) * scaleY;
            
            const leftPos = maskCenterX + circleX - (size / 2);
            const topPos = maskCenterY + circleY - (size / 2);
            
            // Get viewport type for tablet-specific optimizations
            const viewportType = this.getViewportType();
            
            // Determine z-index based on step to ensure proper layering
            let zIndex = 10; // Default for step 1 (black bubbles)
            if (data.step === 2) {
                zIndex = 12; // Pink bubble on top
            } else if (data.step === 3) {
                zIndex = 11; // Grey bubble below pink but above black
            }
            
            // Base styles
            let baseStyles = `
                position: absolute;
                left: ${leftPos}px;
                top: ${topPos}px;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background-color: ${data.color};
                transform: scale(0);
                transform-origin: center;
                transition: transform 7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                pointer-events: none;
                opacity: 1;
                z-index: ${zIndex};
            `;
            
            // Add tablet and Safari-specific optimizations
            if (viewportType.includes('tablet') || this.isSafari) {
                baseStyles += `
                    will-change: transform;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    -webkit-transform: scale(0);
                    -webkit-transition: -webkit-transform 7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                `;
            }
            
            overlay.style.cssText = baseStyles;
            
            console.log(`Creating ${data.className} (${viewportType}): size=${size}px, pos=(${leftPos},${topPos}), color=${data.color}`);
            
            // Only add to mask container (not body)
            maskContainer.appendChild(overlay);
            
            // Force reflow and trigger animation with staggered delays for better performance
            overlay.offsetHeight;
            
            // Determine animation timing based on step and behavior
            let animationDelay = 50;
            let shouldAnimate = true; // Always animate since we only create circles for current step
            
            // Step-based animation timing
            if (data.step === 1) {
                // Step 1: Black bubbles grow with staggered timing
                animationDelay = 50 + (index * 100); // More spacing between black bubbles
            } else if (data.step === 2) {
                // Step 2: Pink bubble grows
                animationDelay = 100;
            } else if (data.step === 3) {
                // Step 3: Grey bubbles grow
                animationDelay = 150;
            }
            
            if (shouldAnimate) {
                setTimeout(() => {
                    console.log(`Triggering step ${data.step} animation for ${data.className} with delay ${animationDelay}ms`);
                    overlay.style.transform = 'scale(1)';
                    
                    // Also set webkit-specific transform for better Safari/tablet support
                    if (viewportType.includes('tablet') || this.isSafari) {
                        overlay.style.webkitTransform = 'scale(1)';
                    }
                    
                    // Special behavior for right petri dish grey bubble (disappear after growing)
                    if (data.behavior === 'disappear') {
                        setTimeout(() => {
                            console.log(`Making ${data.className} disappear`);
                            overlay.style.transition = 'transform 2s ease, opacity 2s ease';
                            overlay.style.webkitTransition = '-webkit-transform 2s ease, opacity 2s ease';
                            overlay.style.transform = 'scale(0)';
                            overlay.style.webkitTransform = 'scale(0)';
                            overlay.style.opacity = '0';
                        }, 3000); // Disappear after 3 seconds of being visible
                    }
                    
                    // Check if animation worked after a delay
                    setTimeout(() => {
                        const computedTransform = window.getComputedStyle(overlay).transform;
                        console.log(`Animation check for ${data.className}: transform = ${computedTransform}`);
                    }, 1000);
                }, animationDelay);
            }
        });
    }

    // For step-based animations
    updateOverlayAnimations(step) {
        const overlays = document.querySelectorAll('.safari-overlay-circle');
        overlays.forEach(overlay => {
            if (step >= 1 && overlay.classList.contains('growth-circle')) {
                overlay.style.transform = 'scale(1)';
            } else {
                overlay.style.transform = 'scale(0)';
            }
        });
        
        if (step >= 1) {
            // Step 1+: Growth circles - try direct CSS approach for Safari
            [...bacteriumCircles, ...resistantCircles].forEach((circle, index) => {
                console.log(`Circle ${index}:`, circle.classList.toString());
                console.log(`Circle position: cx=${circle.getAttribute('cx')}, cy=${circle.getAttribute('cy')}`);
                
                if (circle.classList.contains('growth-circle-1')) {
                    console.log('Animating growth-circle-1 to radius 90');
                    circle.style.opacity = '1';
                    // Try direct CSS approach for Safari
                    circle.style.transition = 'transform 7s ease';
                    circle.style.transformOrigin = `${circle.getAttribute('cx')}px ${circle.getAttribute('cy')}px`;
                    circle.setAttribute('r', '50');
                    circle.style.transform = 'scale(1.8)'; // 90/50 = 1.8
                    
                    // Also try JS fallback
                    this.animateCircleRadius(circle, 90, 7000, 0);
                } else if (circle.classList.contains('growth-circle-2')) {
                    console.log('Animating growth-circle-2 to radius 200');
                    circle.style.opacity = '1';
                    // Try direct CSS approach for Safari
                    circle.style.transition = 'transform 7s ease';
                    circle.style.transformOrigin = `${circle.getAttribute('cx')}px ${circle.getAttribute('cy')}px`;
                    circle.setAttribute('r', '50');
                    circle.style.transform = 'scale(4)'; // 200/50 = 4
                    
                    // Also try JS fallback
                    this.animateCircleRadius(circle, 200, 7000, 0);
                } else if (circle.classList.contains('growth-circle-3')) {
                    console.log('Animating growth-circle-3 to radius 160');
                    circle.style.opacity = '1';
                    // Try direct CSS approach for Safari
                    circle.style.transition = 'transform 7s ease';
                    circle.style.transformOrigin = `${circle.getAttribute('cx')}px ${circle.getAttribute('cy')}px`;
                    circle.setAttribute('r', '50');
                    circle.style.transform = 'scale(3.2)'; // 160/50 = 3.2
                    
                    // Also try JS fallback
                    this.animateCircleRadius(circle, 160, 7000, 0);
                }
            });
        }
        
        if (step >= 2) {
            // Step 2+: Antibiotic circles
            [...bacteriumCircles, ...resistantCircles].forEach(circle => {
                if (circle.classList.contains('antibiotic-circle')) {
                    circle.style.opacity = '1';
                    this.animateCircleRadius(circle, 25, 2000, 0);
                }
            });
        }
        
        if (step >= 3) {
            // Step 3: Inhibition zones
            bacteriumCircles.forEach(circle => {
                if (circle.classList.contains('inhibition-circle') && !circle.classList.contains('resistant')) {
                    circle.style.opacity = '1';
                    this.animateCircleRadius(circle, 100, 6000, 0);
                }
            });
            
            // Resistant bacterium has special dissolving animation
            resistantCircles.forEach(circle => {
                if (circle.classList.contains('inhibition-circle') && circle.classList.contains('resistant')) {
                    // Simulate the keyframe animation manually (it handles its own opacity)
                    this.animateResistantInhibition(circle);
                }
            });
        }
    }

    // Force Safari to prepare for SVG rendering changes
    prepareForSafariAnimation() {
        // Get all SVG elements and force a repaint
        const allSVGs = document.querySelectorAll('.circle-svg');
        allSVGs.forEach(svg => {
            // Force hardware acceleration and repaint
            svg.style.transform = 'translateZ(0)';
            svg.style.willChange = 'transform';
            
            // Force a reflow
            svg.offsetHeight;
            
            // Reset transform to avoid visual issues
            setTimeout(() => {
                svg.style.transform = '';
                svg.style.willChange = '';
            }, 100);
        });
        
        console.log('Forced Safari repaint for', allSVGs.length, 'SVG elements');
    }

    // Special animation for resistant inhibition zone (replicates CSS keyframe) using transforms
    animateResistantInhibition(circle) {
        if (!circle) return;

        const startTime = performance.now();
        const totalDuration = 4000; // 4s like CSS keyframe
        const baseRadius = 50; // Base radius for scaling
        
        // Set up the circle for transform animation
        circle.setAttribute('r', baseRadius);
        const cx = circle.getAttribute('cx');
        const cy = circle.getAttribute('cy');
        circle.style.transformOrigin = `${cx}px ${cy}px`;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = elapsed / totalDuration;
            
            let targetRadius = 0;
            let opacity = 0;
            
            if (progress <= 0.2) {
                // 0% to 20%: grow from 0 to 20, opacity 0 to 1
                const localProgress = progress / 0.2;
                targetRadius = 20 * localProgress;
                opacity = localProgress;
            } else if (progress <= 0.5) {
                // 20% to 50%: grow from 20 to 35, opacity stays 1
                const localProgress = (progress - 0.2) / 0.3;
                targetRadius = 20 + (15 * localProgress);
                opacity = 1;
            } else if (progress <= 0.8) {
                // 50% to 80%: grow from 35 to 42, opacity fades to 0.3
                const localProgress = (progress - 0.5) / 0.3;
                targetRadius = 35 + (7 * localProgress);
                opacity = 1 - (0.7 * localProgress);
            } else if (progress <= 1) {
                // 80% to 100%: radius stays 42, opacity fades to 0
                const localProgress = (progress - 0.8) / 0.2;
                targetRadius = 42;
                opacity = 0.3 - (0.3 * localProgress);
            }
            
            const scale = targetRadius / baseRadius;
            circle.style.transform = `scale(${scale})`;
            circle.style.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Store reference globally so other handlers can access it
window.stickyScrollHandler = null;

// Initialization
window.stickyScrollHandler = new StickyScrollHandler();
