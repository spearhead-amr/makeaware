class WorkshopsGridAlignment {
    constructor() {
        this.container = document.querySelector('.container');
        this.cards = [];
        this.init();
    }

    init() {
        if (!this.container) return;
        
        // Wait for images to load
        this.waitForImages().then(() => {
            this.setupLayout();
            this.bindEvents();
        });
    }

    waitForImages() {
        const images = this.container.querySelectorAll('img');
        const promises = Array.from(images).map(img => {
            return new Promise(resolve => {
                if (img.complete && img.naturalHeight !== 0) {
                    resolve();
                } else {
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // Even if image fails, continue
                    
                    // Fallback timeout in case image never loads
                    setTimeout(() => resolve(), 3000);
                }
            });
        });
        
        // Also add a general timeout for the entire process
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 6000));
        
        return Promise.race([Promise.all(promises), timeoutPromise]);
    }

    getCardsPerRow() {
        const width = window.innerWidth;
        
        // Based on the updated breakpoints from responsive.styl
        if (width >= 2200) { // desktop-w
            return 4;
        } else if (width >= 900) { // tablet-h
            return 3;
        } else if (width >= 600) { // tablet-v
            return 2;
        } else {
            return 1; // mobile
        }
    }

    setupLayout() {
        this.cards = Array.from(this.container.querySelectorAll('.workshops-card'));
        
        if (this.cards.length === 0) return;
        
        const cardsPerRow = this.getCardsPerRow();
        
        // Only apply custom positioning when we have more than 1 card per row
        if (cardsPerRow === 1) {
            this.resetLayout();
            return;
        }

        // Get gap from CSS based on screen size - with fallback to width-based calculation
        let gap;
        const width = window.innerWidth;
        
        if (width >= 900) { // tablet-h and above
            gap = 14; // 1rem at 16px base font size
        } else {
            gap = 11; // 0.5rem at 16px base font size
        }
        
        // Try to get actual computed gap, but use fallback if needed
        const computedGap = getComputedStyle(this.container).gap;
        if (computedGap && computedGap !== 'normal') {
            if (computedGap.includes('rem')) {
                const remValue = parseFloat(computedGap);
                const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
                const computedPixels = remValue * rootFontSize;
                // Only use computed value if it makes sense
                if (computedPixels > 0) {
                    gap = computedPixels;
                }
            } else {
                const parsedGap = parseInt(computedGap);
                if (parsedGap > 0) {
                    gap = parsedGap;
                }
            }
        }
        
        // Reset all cards - no transitions
        this.cards.forEach(card => {
            card.style.position = 'relative';
            card.style.transform = '';
        });
        
        // Single layout calculation
        setTimeout(() => {
            // Track the bottom position of each column
            const columnBottoms = Array(cardsPerRow).fill(0);
            
            // Initialize first row
            for (let i = 0; i < Math.min(cardsPerRow, this.cards.length); i++) {
                const card = this.cards[i];
                columnBottoms[i] = card.offsetTop + card.offsetHeight;
            }
            
            // Process remaining cards
            for (let i = cardsPerRow; i < this.cards.length; i++) {
                const card = this.cards[i];
                const columnIndex = i % cardsPerRow;
                
                // Calculate target position
                const targetTop = columnBottoms[columnIndex] + gap;
                const currentTop = card.offsetTop;
                const translateY = targetTop - currentTop;
                
                // Apply transform immediately
                card.style.transform = `translateY(${translateY}px)`;
                
                // Update column bottom position
                columnBottoms[columnIndex] = targetTop + card.offsetHeight;
            }
        }, 100);
    }

    resetLayout() {
        this.cards.forEach(card => {
            card.style.position = '';
            card.style.transform = '';
        });
    }

    bindEvents() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.setupLayout();
            }, 250);
        });
    }
}

// Initialize when DOM is loaded
window.addEventListener('load', () => {
    new WorkshopsGridAlignment();
});

if (document.readyState !== 'loading') {
    new WorkshopsGridAlignment();
}