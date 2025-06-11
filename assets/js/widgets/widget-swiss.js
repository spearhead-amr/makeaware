// widget-swiss.js - Swiss bacterial resistance visualization by region and year

class SwissVizHandler {
    constructor() {
        this.container = document.querySelector('#widget-swiss-viz .viz-container');
        this.data = null;
        this.svg = null;
        this.initialized = false;
        
        // Configuration for responsive grid layout
        this.config = {
            margin: { 
                top: 60, 
                right: 20, 
                bottom: 40, 
                left: 120,
                // Mobile-specific margins
                mobile: {
                    top: 40,
                    right: 0,
                    bottom: 30,
                    left: 40
                }
            },
            cellPadding: 10,
            maxRadius: 50, // Larger circles for desktop
            maxRadiusMobile: 30, // Bigger circles for mobile
            minRadius: 5,
            minRadiusMobile: 4,
            // Vertical spacing controls
            verticalSpacing: {
                desktop: 0.8, // Increased multiplier for desktop
                mobile: 1.2   // Multiplier for mobile row spacing when text is vertical
            }
        };
        
        this.breakpoints = {
            mobile: 599,
            tablet: 900,
            desktop: 1200
        };
        
        this.init();
    }

    // Swiss-style number formatting with apostrophes
    formatNumber(num) {
        return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }

    async init() {
        if (!this.container) {
            console.error('Widget swiss-viz container not found');
            return;
        }

        try {
            await this.loadData();
            this.setupVisualization();
            this.setupResizeHandler();
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing swiss visualization:', error);
        }
    }

    async loadData() {
        try {
            // Try window.fs.readFile first (for artifacts)
            if (window.fs && window.fs.readFile) {
                const csvText = await window.fs.readFile('MAKEAWARE-Visualisations-Q3.csv', { encoding: 'utf8' });
                this.data = d3.csvParse(csvText, d => ({
                    year: +d.Year,
                    zone: d.SwitzerlandZone,
                    samples: +d.Samples,
                    resistant: +d.Resistant,
                    resistanceRate: (+d.Resistant / +d.Samples) * 100
                }));
            } else {
                // Fallback for normal browser
                try {
                    this.data = await d3.csv('assets/csv/MAKEAWARE-Visualisations-Q3.csv', d => ({
                        year: +d.Year,
                        zone: d.SwitzerlandZone,
                        samples: +d.Samples,
                        resistant: +d.Resistant,
                        resistanceRate: (+d.Resistant / +d.Samples) * 100
                    }));
                } catch (d3Error) {
                    console.log('Trying with fetch...');
                    const response = await fetch('assets/csv/MAKEAWARE-Visualisations-Q3.csv');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const csvText = await response.text();
                    this.data = d3.csvParse(csvText, d => ({
                        year: +d.Year,
                        zone: d.SwitzerlandZone,
                        samples: +d.Samples,
                        resistant: +d.Resistant,
                        resistanceRate: (+d.Resistant / +d.Samples) * 100
                    }));
                }
            }

            // Get unique years (sorted) and zones (preserving CSV order)
            this.years = [...new Set(this.data.map(d => d.year))].sort();
            this.zones = [...new Set(this.data.map(d => d.zone))];
            
            console.log(`Loaded ${this.data.length} data points`);
            console.log(`Years: ${this.years.join(', ')}`);
            console.log(`Zones: ${this.zones.join(', ')}`);
            
        } catch (error) {
            console.error('Error loading CSV data:', error);
            this.loadFallbackData();
        }
    }

    loadFallbackData() {
        console.log('Loading fallback data...');
        // Use sample of the actual data structure
        this.data = [
            { year: 2018, zone: "Central-East", samples: 236830, resistant: 38157, resistanceRate: 16.1 },
            { year: 2019, zone: "Central-East", samples: 233322, resistant: 37953, resistanceRate: 16.3 },
            { year: 2020, zone: "Central-East", samples: 248922, resistant: 41435, resistanceRate: 16.6 },
            { year: 2021, zone: "Central-East", samples: 140989, resistant: 23322, resistanceRate: 16.5 },
            { year: 2018, zone: "Central-West", samples: 675824, resistant: 106708, resistanceRate: 15.8 },
            { year: 2019, zone: "Central-West", samples: 778599, resistant: 120985, resistanceRate: 15.5 },
            { year: 2020, zone: "Central-West", samples: 750240, resistant: 111915, resistanceRate: 14.9 },
            { year: 2021, zone: "Central-West", samples: 464962, resistant: 66895, resistanceRate: 14.4 }
        ];
        
        this.years = [2018, 2019, 2020, 2021];
        this.zones = ["Central-East", "Central-West"];
        
        console.log(`Loaded ${this.data.length} data points (fallback)`);
    }

    isMobile() {
        return window.innerWidth <= this.breakpoints.mobile;
    }

    calculateDimensions() {
        const containerWidth = this.container.offsetWidth || window.innerWidth;
        const isMobile = this.isMobile();
        
        let rows, cols, rowLabels, colLabels;
        
        // Get appropriate margins based on device
        const margin = isMobile ? this.config.margin.mobile : this.config.margin;
        
        if (isMobile) {
            // Mobile: years horizontal (cols), zones vertical (rows)
            rows = this.zones.length;
            cols = this.years.length;
            rowLabels = this.zones;
            colLabels = this.years;
        } else {
            // Desktop: zones horizontal (cols), years vertical (rows)
            rows = this.years.length;
            cols = this.zones.length;
            rowLabels = this.years;
            colLabels = this.zones;
        }
        
        // Calculate cell dimensions to fill available space
        const availableWidth = containerWidth - margin.left - margin.right;
        let cellWidth, cellHeight;
        
        // Make cells fill the available width completely
        cellWidth = availableWidth / cols;
        
        if (isMobile) {
            // Mobile: base height on width but apply mobile spacing multiplier
            cellHeight = Math.max(80, cellWidth * 0.8) * this.config.verticalSpacing.mobile;
        } else {
            // Desktop: larger base height with desktop spacing multiplier
            cellHeight = Math.max(120, cellWidth * 0.9) * this.config.verticalSpacing.desktop;
        }
        
        const width = containerWidth;
        const height = margin.top + (rows * cellHeight) + margin.bottom;
        
        return { 
            width, 
            height, 
            rows, 
            cols, 
            cellWidth, 
            cellHeight, 
            rowLabels, 
            colLabels,
            isMobile,
            margin
        };
    }

    setupVisualization() {
        if (!this.data || this.data.length === 0) {
            console.error('No data available for visualization');
            return;
        }

        // Clear existing container
        this.container.innerHTML = '';

        const dimensions = this.calculateDimensions();
        
        // Create SVG
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', dimensions.height)
            .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
            .style('display', 'block');

        // Create main group with responsive margins
        const g = this.svg.append('g')
            .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

        // Create scale for circle radii based on device
        const maxSamples = d3.max(this.data, d => d.samples);
        const maxResistant = d3.max(this.data, d => d.resistant);
        const maxValue = Math.max(maxSamples, maxResistant);
        
        const maxRadius = dimensions.isMobile ? this.config.maxRadiusMobile : this.config.maxRadius;
        const minRadius = dimensions.isMobile ? this.config.minRadiusMobile : this.config.minRadius;
        
        const radiusScale = d3.scaleSqrt()
            .domain([0, maxValue])
            .range([minRadius, maxRadius]);

        // Add column headers (top)
        g.selectAll('.col-header')
            .data(dimensions.colLabels)
            .enter()
            .append('text')
            .attr('class', 'col-header')
            .attr('x', (d, i) => i * dimensions.cellWidth + dimensions.cellWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .text(d => this.formatLabel(d));

        // Add row headers (left) - rotate zone names on mobile only
        g.selectAll('.row-header')
            .data(dimensions.rowLabels)
            .enter()
            .append('text')
            .attr('class', 'row-header')
            .attr('x', -20)
            .attr('y', (d, i) => i * dimensions.cellHeight + dimensions.cellHeight / 2)
            .attr('text-anchor', (d, i) => {
                // Center text anchor for rotated mobile text
                if (dimensions.isMobile && typeof d === 'string' && this.zones.includes(d)) {
                    return 'middle';
                }
                return 'end';
            })
            .attr('dy', (d, i) => {
                // Adjust vertical alignment for rotated text
                if (dimensions.isMobile && typeof d === 'string' && this.zones.includes(d)) {
                    return '0.35em';
                }
                return '0.35em';
            })
            .attr('transform', (d, i) => {
                // Rotate zone names vertically ONLY on mobile when zones are row labels
                if (dimensions.isMobile && typeof d === 'string' && this.zones.includes(d)) {
                    const x = -20;
                    const y = i * dimensions.cellHeight + dimensions.cellHeight / 2;
                    return `rotate(-90, ${x}, ${y})`;
                }
                return '';
            })
            .text(d => this.formatLabel(d));

        // Create grid data with positions
        const gridData = [];
        
        for (let row = 0; row < dimensions.rows; row++) {
            for (let col = 0; col < dimensions.cols; col++) {
                const year = dimensions.isMobile ? dimensions.colLabels[col] : dimensions.rowLabels[row];
                const zone = dimensions.isMobile ? dimensions.rowLabels[row] : dimensions.colLabels[col];
                
                const dataPoint = this.data.find(d => d.year === year && d.zone === zone);
                
                if (dataPoint) {
                    const cellData = {
                        ...dataPoint,
                        row,
                        col,
                        x: col * dimensions.cellWidth + dimensions.cellWidth / 2,
                        y: row * dimensions.cellHeight + dimensions.cellHeight / 2,
                        samplesRadius: radiusScale(dataPoint.samples),
                        resistantRadius: radiusScale(dataPoint.resistant)
                    };
                    
                    gridData.push(cellData);
                }
            }
        }

        // Create individual circles
        const cellGroups = g.selectAll('.cell-group')
            .data(gridData)
            .enter()
            .append('g')
            .attr('class', 'cell-group')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // Outer circle (samples) - stroke only
        cellGroups.append('circle')
            .attr('class', 'samples-circle')
            .attr('r', d => d.samplesRadius);

        // Inner circle (resistant) - filled
        cellGroups.append('circle')
            .attr('class', 'resistant-circle')
            .attr('r', d => d.resistantRadius);
    }

    formatLabel(label) {
        // Format labels for display
        if (typeof label === 'string') {
            // Replace hyphens with spaces and capitalize
            return label.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        return label;
    }

    setupResizeHandler() {
        let resizeTimeout;
        let lastWidth = window.innerWidth;
        
        window.addEventListener('resize', () => {
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

    // Method to update vertical spacing (useful for fine-tuning)
    updateVerticalSpacing(mobileSpacing, desktopSpacing) {
        this.config.verticalSpacing.mobile = mobileSpacing || this.config.verticalSpacing.mobile;
        this.config.verticalSpacing.desktop = desktopSpacing || this.config.verticalSpacing.desktop;
        
        if (this.initialized) {
            this.setupVisualization();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load D3.js if not already loaded
    if (typeof d3 === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
        script.onload = () => {
            window.swissVizHandler = new SwissVizHandler();
        };
        document.head.appendChild(script);
    } else {
        window.swissVizHandler = new SwissVizHandler();
    }
});

// Expose globally for control from widget overlay handler
window.SwissVizHandler = SwissVizHandler;

if (document.readyState !== 'loading') {
    window.SwissVizHandler = new SwissVizHandler();
}