// legend-popup.js - Simple responsive legend popup handler

class LegendPopupHandler {
    constructor() {
        this.activePopup = null;
        
        // Mapping of buttons to their respective popups
        this.legendMappings = [
            {
                buttonId: 'legenda-button-world',
                popupId: 'legenda-world'
            },
            {
                buttonId: 'legenda-button-swiss',
                popupId: 'legenda-swiss'
            }
        ];
        
        this.init();
    }

    init() {
        this.updateClasses();
        this.setupEventListeners();
        this.setupResizeHandler();
    }

    updateClasses() {
        const isDesktop = window.innerWidth >= 900;
        
        this.legendMappings.forEach(mapping => {
            const popup = document.getElementById(mapping.popupId);
            if (popup) {
                if (isDesktop) {
                    // Above 900px: use popup-overlay-desktop
                    popup.classList.remove('active');
                } else {
                    // Below 900px: use popup-overlay
                    popup.classList.add('popup-overlay');
                }
            }
        });
        
        if (isDesktop) {
            this.activePopup = null;
        }
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.updateClasses();
        });
    }

    setupEventListeners() {
        this.legendMappings.forEach(mapping => {
            const button = document.getElementById(mapping.buttonId);
            const popup = document.getElementById(mapping.popupId);
            
            if (button && popup) {
                // Click on button
                button.addEventListener('click', (e) => {
                    if (window.innerWidth < 900) {
                        e.stopPropagation();
                        this.togglePopup(mapping.popupId);
                    }
                });
                
                // Click on close button
                const closeBtn = popup.querySelector('.close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', (e) => {
                        if (window.innerWidth < 900) {
                            e.stopPropagation();
                            this.hidePopup(mapping.popupId);
                        }
                    });
                }
                
                // Click inside popup (prevents closing)
                const popupMain = popup.querySelector('.popup-main');
                if (popupMain) {
                    popupMain.addEventListener('click', (e) => {
                        if (window.innerWidth < 900) {
                            e.stopPropagation();
                        }
                    });
                }
                
                // Click on overlay
                popup.addEventListener('click', (e) => {
                    if (window.innerWidth < 900 && e.target === popup) {
                        this.hidePopup(mapping.popupId);
                    }
                });
            }
        });
        
        // Global click to close
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 900 && this.activePopup) {
                const clickedElement = e.target;
                const isLegendButton = this.legendMappings.some(mapping => {
                    const button = document.getElementById(mapping.buttonId);
                    return button && (button === clickedElement || button.contains(clickedElement));
                });
                
                const isInsidePopup = this.legendMappings.some(mapping => {
                    const popup = document.getElementById(mapping.popupId);
                    return popup && popup.contains(clickedElement);
                });
                
                if (!isLegendButton && !isInsidePopup) {
                    this.hidePopup(this.activePopup);
                }
            }
        });
    }

    togglePopup(popupId) {
        if (this.activePopup === popupId) {
            this.hidePopup(popupId);
        } else {
            if (this.activePopup) {
                this.hidePopup(this.activePopup);
            }
            this.showPopup(popupId);
        }
    }

    showPopup(popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.classList.add('active');
            this.activePopup = popupId;
            // On mobile, move popup to <body> to ensure it stays fixed and above overlays
            if (window.innerWidth < 900) {
                document.body.appendChild(popup);
            }
        }
    }

    hidePopup(popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.classList.remove('active');
            if (this.activePopup === popupId) {
                this.activePopup = null;
            }
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.legendPopupHandler = new LegendPopupHandler();
});

if (document.readyState !== 'loading') {
    window.legendPopupHandler = new LegendPopupHandler();
}