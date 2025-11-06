// widget-death.js - Death causes visualization with interactive scaling

class DeathVizHandler {
    constructor() {
        this.container = document.querySelector('#widget-death-viz .viz-container');
        this.data = null;
        this.svg = null;
        this.initialized = false;
        this.bars = null;
        this.g = null;
        
        // Configuration for the visualization
        this.config = {
            margin: { 
                mobile: { top: 20, right: 0, bottom: 140, left: 0 },
                desktop: { top: 30, right: 0, bottom: 60, left: 0 }
            },
            gap: {
                mobile: 1, // Gap between bars on mobile
                desktop: 1 // Gap between bars on desktop
            },
            borderRadius: 8, // Rounded corners for rectangles
            minBarHeight: 28, // Minimum height to show text (increased to ensure text visibility)
            textPadding: 8 // Internal padding for text (0.5rem = 8px)
        };
        
        // Scaling state
        this.baseHeights = []; // Store original calculated heights
        this.currentScale = 1.0;
        this.maxScale = 1.0; // Will be calculated based on smallest bar
        this.expansionHeight = 0; // Additional height needed for full expansion
        
        this.init();
    }

    // Swiss-style number formatting with apostrophes as thousands separators
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }

    async init() {
        if (!this.container) {
            console.error('Widget death-viz container not found');
            return;
        }

        try {
            await this.loadData();
            this.setupVisualization();
            this.setupResizeHandler();
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing death visualization:', error);
        }
    }

    async loadData() {
        try {
            // Try window.fs.readFile first (for artifacts)
            if (window.fs && window.fs.readFile) {
                const csvText = await window.fs.readFile('MAKEAWARE-Visualisations-Q4.csv', { encoding: 'utf8' });
                this.data = d3.csvParse(csvText, d => ({
                    name: d.Name,
                    deaths: +d.NumberOfDeaths
                }));
            } else {
                // Fallback for normal browser
                try {
                    this.data = await d3.csv('assets/csv/MAKEAWARE-Visualisations-Q4.csv', d => ({
                        name: d.Name,
                        deaths: +d.NumberOfDeaths
                    }));
                } catch (d3Error) {
                    console.log('Trying with fetch...');
                    const response = await fetch('assets/csv/MAKEAWARE-Visualisations-Q4.csv');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const csvText = await response.text();
                    this.data = d3.csvParse(csvText, d => ({
                        name: d.Name,
                        deaths: +d.NumberOfDeaths
                    }));
                }
            }

            // Data is already sorted by deaths (highest to lowest)
            console.log(`Loaded ${this.data.length} death causes`);
            CSVLoadedTrigger(); // call the "components-render.js" file after loading the csv and generated d3 graph
            
        } catch (error) {
            console.error('Error loading CSV data:', error);
            this.loadFallbackData();
        }
    }

    loadFallbackData() {
        console.log('Loading fallback data...');
        this.data = [
            { name: "Antimicrobial Resistance", deaths: 10001000 },
            { name: "Cancer", deaths: 8200000 },
            { name: "Diabetes", deaths: 1500000 },
            { name: "Diarrheal Disease", deaths: 1400000 },
            { name: "Road Traffic Accidents", deaths: 1200000 },
            { name: "Measles", deaths: 130000 },
            { name: "Cholera", deaths: 120000 },
            { name: "Tetanus", deaths: 60000 }
        ];
        
        console.log(`Loaded ${this.data.length} death causes (fallback data)`);
    }

    calculateDimensions() {
        // Determine if mobile or desktop
        const isMobile = window.innerWidth <= 768;
        const currentMargin = isMobile ? this.config.margin.mobile : this.config.margin.desktop;
        const currentGap = isMobile ? this.config.gap.mobile : this.config.gap.desktop;
        
        // Use container dimensions - create mask height
        const containerWidth = this.container.offsetWidth || window.innerWidth - 32;
        const maskHeight = window.innerHeight * 0.80; // 80vh mask height
        
        const width = containerWidth;
        const height = maskHeight;
        
        return { width, height, margin: currentMargin, gap: currentGap };
    }

    calculateScalingParameters() {
        if (!this.baseHeights || this.baseHeights.length === 0) return;
        
        // Find the smallest base height
        const smallestHeight = Math.min(...this.baseHeights);
        
        // Calculate the scale factor needed for the smallest bar to reach minimum height
        // Increase scale factor significantly for more dramatic expansion with less scroll
        const baseScale = Math.max(1.0, this.config.minBarHeight / smallestHeight);
        this.maxScale = baseScale * 1.2; // Keep original baseScale multiplier
        
        // Calculate additional height needed for full expansion
        // Since we reach full scaling at 25% of progress (progress * 4.0), 
        // we only need 25% of the original expansion height
        const scaledTotalHeight = this.baseHeights.reduce((sum, height) => sum + (height * this.maxScale), 0);
        const gapTotal = (this.data.length - 1) * this.calculateDimensions().gap;
        const baseVisibleHeight = this.calculateDimensions().height - this.calculateDimensions().margin.top - this.calculateDimensions().margin.bottom;
        
        const fullExpansionHeight = Math.max(0, scaledTotalHeight + gapTotal - baseVisibleHeight);
        this.expansionHeight = fullExpansionHeight * 0.05; //how much to scroll before passing to the next widget
        
        console.log(`Scaling: min height=${smallestHeight}px, base scale=${baseScale.toFixed(2)}, max scale=${this.maxScale.toFixed(2)}, expansion height=${this.expansionHeight}px (reduced from ${fullExpansionHeight}px)`);
    }

    getExpansionHeight() {
        // Return the additional height needed for this widget's scroll range
        return this.expansionHeight;
    }

    setupVisualization() {
        if (!this.data || this.data.length === 0) {
            console.error('No data available for visualization');
            return;
        }

        // Clear existing container
        this.container.innerHTML = '';

        const dimensions = this.calculateDimensions();
        const { width, height, margin, gap } = dimensions;
        
        // Calculate available space for bars
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Create SVG with mask height
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '80vh')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('display', 'block')
            .style('overflow', 'hidden'); // Ensure clipping

        // Create main group
        this.g = this.svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Calculate proportional heights based on death counts
        const totalDeaths = d3.sum(this.data, d => d.deaths);
        const totalGapSpace = gap * (this.data.length - 1);
        const availableHeight = chartHeight - totalGapSpace;
        
        // Calculate base heights that ensure all bars fit in the initial view
        // Scale down if necessary to fit all bars in the mask
        let baseHeights = this.data.map(d => (d.deaths / totalDeaths) * availableHeight);
        const totalBaseHeight = baseHeights.reduce((sum, h) => sum + h, 0) + totalGapSpace;
        
        // If total height exceeds available space, scale down proportionally
        if (totalBaseHeight > chartHeight) {
            const scaleDown = chartHeight / totalBaseHeight;
            baseHeights = baseHeights.map(h => h * scaleDown);
        }
        
        // Store the calculated base heights
        this.baseHeights = baseHeights;
        
        // Calculate scaling parameters
        this.calculateScalingParameters();
        
        // Create color scale from black to light gray
        const colorScale = d3.scaleLinear()
            .domain([0, this.data.length - 1])
            .range(['#000000', '#C0C0C0']); // From black to gray
        
        // Create bars (horizontal layout with proportional heights)
        this.bars = this.g.selectAll('.death-bar')
            .data(this.data)
            .enter()
            .append('g')
            .attr('class', 'death-bar');

        // Add rectangles with rounded corners (horizontal bars with proportional heights)
        this.bars.append('rect')
            .attr('class', 'bar-rect')
            .attr('x', 0)
            .attr('width', chartWidth) // Full width of container
            .attr('rx', this.config.borderRadius)
            .attr('ry', this.config.borderRadius)
            .attr('fill', (d, i) => colorScale(i));

        // Add text groups
        const textGroups = this.bars.append('g')
            .attr('class', 'bar-text')
            .attr('transform', `translate(${this.config.textPadding}, ${this.config.textPadding})`);

        // Add death cause name
        textGroups.append('text')
            .attr('class', 'death-name-label')
            .attr('text-anchor', 'start')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '0.8em')
            .text(d => d.name);

        // Add death count positioned after each individual name with spacing
        const self = this;
        textGroups.each(function(d, i) {
            const group = d3.select(this);
            const nameText = group.select('.death-name-label').node();
            
            // Get actual width of this specific name text
            const nameWidth = nameText ? nameText.getBBox().width : 0;
            
            group.append('text')
                .attr('class', 'death-count-label')
                .attr('text-anchor', 'start')
                .attr('x', nameWidth + 20) // Position after name with spacing
                .attr('y', 0)
                .attr('dy', '1em')
                .attr('dominant-baseline', 'alphabetic')
                .text(`${self.formatNumber(d.deaths)} Deaths`);
        });

        // Initial render with scale 1.0
        this.updateScale(1.0);
    }

    updateScale(scale) {
        if (!this.bars || !this.baseHeights) return;
        
        this.currentScale = Math.min(Math.max(scale, 1.0), this.maxScale);
        
        const dimensions = this.calculateDimensions();
        const gap = dimensions.gap;
        const chartHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
        
        // Calculate scaled heights
        const scaledHeights = this.baseHeights.map(h => h * this.currentScale);
        const totalScaledHeight = scaledHeights.reduce((sum, h) => sum + h, 0) + gap * (this.data.length - 1);
        
        // Position bars so the bottom bar is always aligned to the bottom of the mask
        // This ensures all bars are visible initially and grow upward
        let currentY = chartHeight - scaledHeights[scaledHeights.length - 1]; // Start with bottom bar at bottom
        
        // Calculate positions from bottom to top
        const positions = [];
        for (let i = this.data.length - 1; i >= 0; i--) {
            positions[i] = {
                y: currentY,
                height: scaledHeights[i]
            };
            if (i > 0) {
                currentY -= (scaledHeights[i - 1] + gap); // Move up by next bar height + gap
            }
        }
        
        // Update rectangles
        this.bars.select('.bar-rect')
            .attr('y', (d, i) => positions[i].y)
            .attr('height', (d, i) => positions[i].height);
        
        // Update text positions and visibility
        this.bars.select('.bar-text')
            .attr('transform', (d, i) => `translate(${this.config.textPadding}, ${positions[i].y + this.config.textPadding})`)
            .style('opacity', (d, i) => positions[i].height >= this.config.minBarHeight ? 1 : 0);
    }

    // Method called by widget-overlay when scroll progress changes
    setScrollProgress(progress) {
        // Make scaling more aggressive - multiply progress by 4x to reach full scale faster
        let aggressiveProgress = Math.min(1.0, progress * 4.0);
        
        // Apply ease-in at the beginning for smoother start
        // Use quadratic ease-in for the first 30% of the progress
        if (aggressiveProgress <= 0.7) {
            const normalizedProgress = aggressiveProgress / 0.7; // 0-1 range for first 30%
            const easedProgress = normalizedProgress * normalizedProgress; // quadratic ease-in
            aggressiveProgress = easedProgress * 0.7; // scale back to 0-0.3 range
        }
        
        const targetScale = 1.0 + (this.maxScale - 1.0) * aggressiveProgress;
        this.updateScale(targetScale);
    }

    setupResizeHandler() {
        let resizeTimeout;
        let lastWidth = window.innerWidth;
        
        window.addEventListener('resize', () => {
            // Only rebuild if width actually changed
            const currentWidth = window.innerWidth;
            if (Math.abs(currentWidth - lastWidth) < 10) {
                return;
            }
            
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.initialized) {
                    lastWidth = currentWidth;
                    this.setupVisualization();
                }
            }, 250);
        });
    }

    // Method to refresh when widget becomes visible
    refresh() {
        if (this.initialized && this.data) {
            this.setupVisualization();
        }
    }
}

// Initialize when DOM is ready
function runWidgetDeath() {
    // Load D3.js if not already loaded
    if (typeof d3 === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
        script.onload = () => {
            window.deathVizHandler = new DeathVizHandler();
        };
        document.head.appendChild(script);
    } else {
        window.deathVizHandler = new DeathVizHandler();
    }
}

runWidgetDeath();

// Expose globally for control from widget overlay handler
window.DeathVizHandler = DeathVizHandler;