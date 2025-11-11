/**
 * Resource Loader - Handles CSS and font loading coordination
 * Prevents FOUC by waiting for all critical resources to load
 */

class ResourceLoader {
  constructor() {
    this.cssLoaded = false;
    this.fontsLoaded = false;
    this.resourcesReady = false;
  }

  // Check if CSS is loaded
  checkCSSLoaded() {
    return new Promise((resolve) => {
      const styleSheets = document.styleSheets;
      let pendingStyleSheets = 0;
      
      // Count loaded stylesheets
      for (let i = 0; i < styleSheets.length; i++) {
        const sheet = styleSheets[i];
        try {
          // Try to access cssRules to check if loaded
          if (sheet.cssRules || sheet.rules) {
            continue; // Already loaded
          } else {
            pendingStyleSheets++;
          }
        } catch (e) {
          // Cross-origin or loading stylesheet
          pendingStyleSheets++;
        }
      }

      if (pendingStyleSheets === 0) {
        this.cssLoaded = true;
        resolve();
      } else {
        // Wait a bit and check again
        setTimeout(() => this.checkCSSLoaded().then(resolve), 50);
      }
    });
  }

  // Check if fonts are loaded using modern Font Loading API
  checkFontsLoaded() {
    return new Promise((resolve) => {
      if ('fonts' in document) {
        // Use the Font Loading API
        document.fonts.ready.then(() => {
          this.fontsLoaded = true;
          resolve();
        }).catch(() => {
          // Fallback if font loading fails
          console.warn('Font loading API failed, proceeding without font check');
          this.fontsLoaded = true;
          resolve();
        });
      } else {
        // Fallback for older browsers - wait a bit and assume loaded
        setTimeout(() => {
          this.fontsLoaded = true;
          resolve();
        }, 1000);
      }
    });
  }

  // Wait for both CSS and fonts to be ready
  async waitForResources() {
    if (this.resourcesReady) return;

    try {
      // Wait for both CSS and fonts in parallel
      await Promise.all([
        this.checkCSSLoaded(),
        this.checkFontsLoaded()
      ]);

      this.resourcesReady = true;
      this.showContent();
    } catch (error) {
      console.warn('Resource loading failed:', error);
      // Show content anyway to prevent indefinite loading
      this.showContent();
    }
  }

  // Show content smoothly
  showContent() {
    document.body.classList.add('fonts-loaded');
    
    // Dispatch custom event for other scripts that might need this
    const event = new CustomEvent('resourcesLoaded', {
      detail: {
        cssLoaded: this.cssLoaded,
        fontsLoaded: this.fontsLoaded
      }
    });
    document.dispatchEvent(event);
  }

  // Initialize the resource loader
  init() {
    // Start checking resources as soon as DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.waitForResources();
      });
    } else {
      this.waitForResources();
    }
  }
}

// Create and initialize resource loader
const resourceLoader = new ResourceLoader();
resourceLoader.init();

// Export for other modules if needed
window.ResourceLoader = ResourceLoader;
window.resourceLoader = resourceLoader;
