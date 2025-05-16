// widgets-perti.js - Improved version with correct breakpoints

class StickyScrollHandler {
    constructor() {
        this.contentSticky = document.getElementById('content-sticky');
        this.widgetPetri = document.getElementById('widget-petri');
        this.petriFrame = this.widgetPetri ? this.widgetPetri.querySelector('.petri-frame') : null;
        this.widgetAmr = document.getElementById('widget-amr');
        
        this.isContentLocked = false;
        this.contentLockPosition = 0;
        this.breakpoints = {
            mobile: 599,      // max-width: 599px
            tabletV: 600,     // min-width: 600px  
            tabletH: 900,     // min-width: 900px
            desktop: 1200     // min-width: 1200px
        };
        
        if (this.contentSticky && this.widgetPetri && this.petriFrame) {
            this.init();
        }
    }

    init() {
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', () => {
            // Debounce resize events
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.calculateLockPosition();
            }, 100);
        });
        this.calculateLockPosition();
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
        
        // Margine bottom desiderato: 2rem
        const bottomMargin = 2 * remInPx;
        
        // Calcolo basato sull'ultimo elemento (widget-amr) per maggiore precisione
        if (this.widgetAmr) {
            // Ottieni la posizione e dimensioni del widget AMR
            const amrRect = this.widgetAmr.getBoundingClientRect();
            const pageYOffset = window.pageYOffset || document.documentElement.scrollTop;
            const amrOffsetTop = amrRect.top + pageYOffset;
            const amrHeight = this.widgetAmr.offsetHeight;
            
            // Calcola quando l'elemento sarà completamente scrollato + margin
            this.contentLockPosition = amrOffsetTop + amrHeight - windowHeight + bottomMargin;
        } else {
            // Fallback: approccio basato sull'altezza totale del contenuto
            const contentHeight = this.contentSticky.scrollHeight;
            this.contentLockPosition = contentHeight - windowHeight + bottomMargin;
        }
        
        // Aggiustamenti specifici per viewport (mobile-first)
        switch(viewportType) {
            case 'mobile':
                // Su mobile, aggiungi più spazio per compensare layout peculiarità
                this.contentLockPosition += remInPx * 1.5; // +1.5rem extra su mobile
                break;
            case 'tablet-v':
                // Su tablet verticale, aggiustamento moderato
                this.contentLockPosition += remInPx * 1; // +1rem extra 
                break;
            case 'tablet-h':
                // Su tablet orizzontale, leggero aggiustamento
                this.contentLockPosition += remInPx * 0.5; // +0.5rem extra
                break;
            case 'desktop':
                // Su desktop mantieni il calcolo preciso
                break;
        }
        
        // Assicurati che la posizione non sia negativa
        this.contentLockPosition = Math.max(0, this.contentLockPosition);
        
        // Imposta l'altezza minima del body per permettere lo scroll
        // Su mobile usa un moltiplicatore più alto per garantire spazio sufficiente
        const scrollMultiplier = viewportType === 'mobile' ? 2.8 : 2.5;
        const totalScrollHeight = this.contentLockPosition + (windowHeight * scrollMultiplier);
        document.body.style.minHeight = `${totalScrollHeight}px`;
        
        // Debug log per sviluppo (puoi commentare in produzione)
        console.log(`Viewport: ${viewportType}, Lock position: ${this.contentLockPosition}px, Bottom margin: ${bottomMargin}px`);
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop < 0) return;
        
        // Tolleranza più alta su mobile per evitare flickering
        const viewportType = this.getViewportType();
        const tolerance = viewportType === 'mobile' ? 10 : 5;
        
        if (scrollTop >= (this.contentLockPosition - tolerance) && !this.isContentLocked) {
            this.lockContent();
            console.log("contentLockPosition" + this.contentLockPosition);
        } else if (scrollTop < (this.contentLockPosition - tolerance) && this.isContentLocked) {
            this.unlockContent();
        }

        if (this.isContentLocked) {
            this.updatePetriPosition(scrollTop);
        }
    }

    lockContent() {
        this.isContentLocked = true;
        
        // Applica lo stato locked
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
        this.petriFrame.style.transform = 'translateY(100%)';
    }

    updatePetriPosition(scrollTop) {
        const scrollBeyondLock = scrollTop - this.contentLockPosition;
        const windowHeight = window.innerHeight;
        const viewportType = this.getViewportType();
        
        // Aggiusta la velocità di scroll in base al viewport (mobile più lento)
        let scrollFactor = 1;
        switch(viewportType) {
            case 'mobile':
                scrollFactor = 0.7; // Scroll più lento su mobile per maggiore controllo
                break;
            case 'tablet-v':
                scrollFactor = 0.8; // Scroll moderato su tablet verticale
                break;
            case 'tablet-h':
                scrollFactor = 0.9; // Scroll quasi normale su tablet orizzontale
                break;
        }
        
        const progress = Math.min(1, Math.max(0, scrollBeyondLock / (windowHeight * scrollFactor)));
        const easeProgress = this.easeOutCubic(progress);
        const translateY = (1 - easeProgress) * 100;
        
        this.petriFrame.style.transform = `translateY(${translateY}%)`;
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// Initialization with better timing
document.addEventListener('DOMContentLoaded', () => {
    new StickyScrollHandler();
});

// Fallback for cases where DOM is already loaded
if (document.readyState !== 'loading') {
    new StickyScrollHandler();
}