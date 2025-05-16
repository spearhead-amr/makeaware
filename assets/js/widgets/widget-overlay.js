// widget-overlay.js - Gestisce la transizione tra widget-petri e widget-world

class WidgetOverlayHandler {
    constructor() {
        this.widgetPetri = document.getElementById('widget-petri');
        this.widgetWorld = document.getElementById('widget-world');
        this.worldFrame = this.widgetWorld ? this.widgetWorld.querySelector('.world-frame') : null;
        this.contentSticky = document.getElementById('content-sticky');
        
        this.isOverlayActive = false;
        this.overlayStartPosition = 0;
        this.overlayScrollRange = 0;
        
        this.breakpoints = {
            mobile: 599,
            tabletV: 600,
            tabletH: 900,
            desktop: 1200
        };
        
        if (this.widgetPetri && this.widgetWorld && this.worldFrame) {
            this.init();
        }
    }

    init() {
        // Aspetta che il widget-petri handler sia completamente inizializzato
        this.initDelay = setTimeout(() => {
            this.calculateOverlayPositions();
            window.addEventListener('scroll', this.handleOverlayScroll.bind(this));
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.calculateOverlayPositions();
                }, 100);
            });
        }, 100);
    }

    calculateOverlayPositions() {
        const windowHeight = window.innerHeight;
        
        // Calcola la posizione di inizio dell'overlay
        // Dovrebbe iniziare dopo che tutti i blocchi del petri sono stati mostrati
        // Assumendo che il widget-petri abbia ~3.5 viewport heights di scroll
        
        // Prima ottieni la lock position del content-sticky
        const stickyHandler = window.stickyScrollHandler;
        let petriLockPosition = 0;
        
        if (stickyHandler && stickyHandler.contentLockPosition) {
            petriLockPosition = stickyHandler.contentLockPosition;
        } else {
            // Fallback: calcola manualmente
            const widgetAmr = document.getElementById('widget-amr');
            if (widgetAmr) {
                const amrRect = widgetAmr.getBoundingClientRect();
                const pageYOffset = window.pageYOffset || document.documentElement.scrollTop;
                petriLockPosition = amrRect.top + pageYOffset + widgetAmr.offsetHeight - windowHeight;
            }
        }
        
        // L'overlay inizia dopo 3.5 viewport heights di scroll del petri
        this.overlayStartPosition = petriLockPosition + (windowHeight * 3.5);
        
        // Range di scroll per la transizione (1 viewport height)
        this.overlayScrollRange = windowHeight;
        
        // Estendi l'altezza del body per permettere il scroll dell'overlay
        const totalScrollHeight = this.overlayStartPosition + this.overlayScrollRange + windowHeight;
        const currentBodyHeight = parseInt(document.body.style.minHeight) || 0;
        if (totalScrollHeight > currentBodyHeight) {
            document.body.style.minHeight = `${totalScrollHeight}px`;
        }
        
        console.log(`Overlay start: ${this.overlayStartPosition}px, range: ${this.overlayScrollRange}px`);
    }

    handleOverlayScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop < this.overlayStartPosition) {
            // Prima dell'overlay - assicurati che world sia nascosto
            if (this.isOverlayActive) {
                this.hideWorldWidget();
            }
            return;
        }
        
        // Calcola il progresso della transizione
        const scrollProgress = (scrollTop - this.overlayStartPosition) / this.overlayScrollRange;
        const clampedProgress = Math.min(1, Math.max(0, scrollProgress));
        
        // Attiva l'overlay se non è già attivo
        if (!this.isOverlayActive) {
            this.showWorldWidget();
        }
        
        // Applica la trasformazione basata sul progresso
        this.updateWorldPosition(clampedProgress);
    }

    showWorldWidget() {
        this.isOverlayActive = true;
        
        // Aggiungi classe 'overlayed' al widget-petri per eventuali stili specifici
        this.widgetPetri.classList.add('overlayed');
        
        // Attiva il widget-world
        this.widgetWorld.classList.add('active');
        
        // Assicurati che il world-frame sia inizialmente fuori dallo schermo
        if (this.worldFrame) {
            this.worldFrame.style.transform = 'translateY(100%)';
        }
    }

    hideWorldWidget() {
        this.isOverlayActive = false;
        
        // Rimuovi la classe overlayed dal petri
        this.widgetPetri.classList.remove('overlayed');
        
        // Disattiva il widget-world
        this.widgetWorld.classList.remove('active');
        
        // Reset della posizione
        if (this.worldFrame) {
            this.worldFrame.style.transform = 'translateY(100%)';
        }
    }

    updateWorldPosition(progress) {
        if (!this.worldFrame) return;
        
        // Applica easing per una transizione più fluida
        const easedProgress = this.easeOutCubic(progress);
        
        // Calcola la posizione Y (da 100% a 0%)
        const translateY = 100 - (easedProgress * 100);
        
        // Applica la trasformazione
        this.worldFrame.style.transform = `translateY(${translateY}%)`;
        
        // Opzionale: aggiungi un effetto di dissolvenza al petri frame quando world è completamente visibile
        if (progress > 0.8) {
            const fadeProgress = (progress - 0.8) / 0.2;
            const petriFrame = this.widgetPetri.querySelector('.petri-frame');
            
        } else {
            // Ripristina l'opacità del petri frame
            const petriFrame = this.widgetPetri.querySelector('.petri-frame');
            if (petriFrame) {
                petriFrame.style.opacity = '1';
            }
        }
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// Store reference globally so the petri handler can access it
window.widgetOverlayHandler = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    window.widgetOverlayHandler = new WidgetOverlayHandler();
});

if (document.readyState !== 'loading') {
    window.widgetOverlayHandler = new WidgetOverlayHandler();
}