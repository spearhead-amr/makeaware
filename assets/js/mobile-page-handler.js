/**
 * Mobile Page Initialization
 * Additional mobile-specific fixes for scroll and layout issues
 */

class MobilePageHandler {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isIOS = this.detectIOS();
        this.init();
    }

    detectMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    detectIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    init() {
        if (this.isMobile) {
            this.handleMobileScrollIssues();
            this.setupMobileScrollListeners();
        }
    }

    handleMobileScrollIssues() {
        // Force scroll to top with multiple methods for different mobile browsers
        const scrollToTop = () => {
            // Standard methods
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            // iOS Safari specific
            if (this.isIOS && window.pageYOffset > 0) {
                window.scrollTo(0, 0);
                setTimeout(() => window.scrollTo(0, 0), 0);
            }

            // Additional mobile browser support
            if (document.scrollingElement) {
                document.scrollingElement.scrollTop = 0;
            }
        };

        // Execute immediately and with delays to handle various mobile browser behaviors
        scrollToTop();
        setTimeout(scrollToTop, 0);
        setTimeout(scrollToTop, 50);
        
        // Handle mobile viewport changes
        if (this.isMobile) {
            const handleViewportChange = () => {
                // Reset scroll position if viewport changes (orientation, keyboard, etc.)
                setTimeout(scrollToTop, 100);
            };

            window.addEventListener('orientationchange', handleViewportChange);
            window.addEventListener('resize', handleViewportChange);
        }
    }

    setupMobileScrollListeners() {
        // Handle page visibility changes (mobile browser tab switching)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Page became visible, ensure proper scroll position
                setTimeout(() => {
                    if (window.pageYOffset > 0 && !this.isUserScrolling()) {
                        window.scrollTo(0, 0);
                    }
                }, 100);
            }
        });

        // Handle mobile browser navigation (back/forward)
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 0);
        });
    }

    isUserScrolling() {
        // Simple heuristic: if user is in middle of scrolling, don't interfere
        return Date.now() - (this.lastScrollTime || 0) < 1000;
    }

    // Track user scrolling
    trackScrolling() {
        this.lastScrollTime = Date.now();
    }
}

// Initialize mobile handler
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobilePageHandler = new MobilePageHandler();
        
        // Track user scrolling
        let scrollTimer;
        window.addEventListener('scroll', () => {
            if (window.mobilePageHandler) {
                window.mobilePageHandler.trackScrolling();
            }
        }, { passive: true });
    });
} else {
    window.mobilePageHandler = new MobilePageHandler();
}

window.addEventListener('load', () => {
    if (window.mobilePageHandler) {
        window.mobilePageHandler.handleMobileScrollIssues();
    }
});