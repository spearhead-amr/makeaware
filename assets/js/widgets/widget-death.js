// widget-death.js - Death causes visualization by projected deaths in 2050

class DeathVizHandler {
    constructor() {
        this.container = document.querySelector('#widget-death-viz .viz-container');
        this.data = null;
        this.svg = null;
        this.initialized = false;
        
        // Configuration for the visualization
        this.config = {
            margin: { 
                mobile: { top: 20, right: 0, bottom: 20, left: 0 },
                desktop: { top: 30, right: 0, bottom: 30, left: 0 }
            },
            gap: {
                mobile: 1, // Gap between bars on mobile
                desktop: 1 // Gap between bars on desktop
            },
            borderRadius: 8, // Rounded corners for rectangles
            minBarHeight: 20, // Minimum height to show text (45px)
            textPadding: 8 // Internal padding for text (0.5rem = 8px)
        };
        
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
        
        // Use container dimensions - create 85vh mask
        const containerWidth = this.container.offsetWidth || window.innerWidth - 32;
        const maskHeight = window.innerHeight * 0.85; // 85vh mask (increased from 80vh)
        
        const width = containerWidth;
        const height = maskHeight;
        
        return { width, height, margin: currentMargin, gap: currentGap };
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
        
        // Create SVG with 85vh mask
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '85vh')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('display', 'block');

        // Create main group
        const g = this.svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Calculate proportional heights based on death counts
        const totalDeaths = d3.sum(this.data, d => d.deaths);
        const totalGapSpace = gap * (this.data.length - 1);
        const availableHeight = chartHeight - totalGapSpace;
        
        // Function to get proportional bar height
        const getBarHeight = (deaths) => {
            return (deaths / totalDeaths) * availableHeight;
        };
        
        // Create color scale from black to light gray
        const colorScale = d3.scaleLinear()
            .domain([0, this.data.length - 1])
            .range(['#000000', '#C0C0C0']); // From black to gray
        
        // Calculate cumulative positions for stacking
        let cumulativeY = 0;
        
        // Create bars (horizontal layout with proportional heights)
        const bars = g.selectAll('.death-bar')
            .data(this.data)
            .enter()
            .append('g')
            .attr('class', 'death-bar')
            .attr('transform', (d, i) => {
                const y = cumulativeY;
                cumulativeY += getBarHeight(d.deaths) + gap;
                return `translate(0, ${y})`;
            });

        // Add rectangles with rounded corners (horizontal bars with proportional heights)
        bars.append('rect')
            .attr('class', 'bar-rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', chartWidth) // Full width of container
            .attr('height', d => getBarHeight(d.deaths))
            .attr('rx', this.config.borderRadius)
            .attr('ry', this.config.borderRadius)
            .attr('fill', (d, i) => colorScale(i));

        // Add text labels (name and death count) - top left with padding
        const textGroups = bars.append('g')
            .attr('class', 'bar-text')
            .attr('transform', `translate(${this.config.textPadding}, ${this.config.textPadding})`);

        // Add death cause name
        const nameTexts = textGroups.append('text')
            .attr('class', 'death-name-label')
            .attr('text-anchor', 'start')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '0.8em') // Better vertical alignment
            .style('opacity', d => getBarHeight(d.deaths) > this.config.minBarHeight ? 1 : 0)
            .text(d => d.name);

        // Add death count positioned after each individual name with 1rem spacing
        const self = this; // Store reference to class instance
        textGroups.each(function(d, i) {
            const group = d3.select(this);
            const nameText = group.select('.death-name-label').node();
            
            // Get actual width of this specific name text
            const nameWidth = nameText ? nameText.getBBox().width : 0;
            
            group.append('text')
                .attr('class', 'death-count-label')
                .attr('text-anchor', 'start')
                .attr('x', nameWidth + 20) // Position after name with 1rem spacing
                .attr('y', 0)
                .attr('dy', '1em') // Same baseline alignment as name
                .attr('dominant-baseline', 'alphabetic') // Align to text baseline
                .style('opacity', getBarHeight(d.deaths) > self.config.minBarHeight ? 1 : 0)
                .text(`${self.formatNumber(d.deaths)} Deaths`);
        });
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

/*
window.addEventListener('load', () => {
    window.DeathVizHandler = new DeathVizHandler();
});

if (document.readyState !== 'loading') {
    window.DeathVizHandler = new DeathVizHandler();
}
*/

// Gestione animazione su attivazione widget
window.addEventListener('widgetStateChange', (e) => {
    if (e.detail.widgetId === 'widget-death-viz') {
        const widget = document.getElementById('widget-death-viz');
        if (widget) {
            if (e.detail.isActive) {
                widget.classList.add('expand-bars');
            } else {
                widget.classList.remove('expand-bars');
            }
        }
    }
});