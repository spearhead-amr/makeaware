// widget-petri.js - Robust scroll control with fixed sequence
// Updated to expose instance globally

class StickyScrollHandler {
    constructor() {
        this.contentSticky = document.getElementById('content-sticky');
        this.widgetPetri = document.getElementById('widget-petri');
        this.petriFrame = this.widgetPetri ? this.widgetPetri.querySelector('.petri-frame') : null;
        this.widgetAmr = document.getElementById('widget-amr');
        
        this.isContentLocked = false;
        this.contentLockPosition = 0;
        this.breakpoints = {
            mobile: 599,
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
        
        // Scroll milestones for precise control
        this.scrollMilestones = [];
        
        if (this.contentSticky && this.widgetPetri && this.petriFrame) {
            this.init();
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
        // Ridotto da 3.5 per lasciare spazio all'overlay handler
        const scrollMultiplier = 3.5;
        const totalScrollHeight = this.contentLockPosition + (windowHeight * scrollMultiplier);
        document.body.style.minHeight = `${totalScrollHeight}px`;
        
        //console.log(`Viewport: ${viewportType}, Lock position: ${this.contentLockPosition}px`);
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
                // Ridotto per lasciare spazio alla transizione overlay
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
        const backgroundOpacity = easedProgress * 1; // Max 95% opacity
        this.petriFrame.style.backdropFilter = `blur(${blurAmount}px)`;
        this.petriFrame.style.background = `rgba(255, 255, 255, ${backgroundOpacity})`;
        
        // Update circle opacity (same as blur)
        if (this.circle) {
            this.circle.style.opacity = easedProgress;
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
        this.petriFrame.style.background = 'rgba(255, 255, 255, 1)';
        if (this.circle) {
            this.circle.style.opacity = '1';
        }
        
        // Show legenda starting from first block (targetBlockIndex 0) and keep it for all others
        if (targetBlockIndex >= 0 && this.legenda) {
            this.legenda.style.opacity = '1';
        }
        
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
}

// Store reference globally so other handlers can access it
window.stickyScrollHandler = null;

// Initialization
window.addEventListener('load', () => {
    window.stickyScrollHandler = new StickyScrollHandler();
});

if (document.readyState !== 'loading') {
    window.stickyScrollHandler = new StickyScrollHandler();
}