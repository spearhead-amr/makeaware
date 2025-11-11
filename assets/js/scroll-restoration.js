/**
 * Scroll Restoration Handler
 * Ensures pages always load at the top, especially on mobile devices
 */

// Disable browser's automatic scroll restoration
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Force scroll to top on page load
function scrollToTop() {
    // Multiple methods to ensure it works across different mobile browsers
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Additional mobile-specific handling
    if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
    }
}

// Execute immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollToTop);
} else {
    scrollToTop();
}

// Also ensure scroll to top after all resources load
window.addEventListener('load', scrollToTop);

// Handle page show events (back/forward navigation)
window.addEventListener('pageshow', function(event) {
    // Force scroll to top on page show, especially for cached pages
    scrollToTop();
});

// Handle beforeunload to reset scroll position
window.addEventListener('beforeunload', function() {
    scrollToTop();
});

// Export for other scripts if needed
window.scrollToTop = scrollToTop;