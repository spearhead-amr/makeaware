// world-viz.js - World bacterial resistance visualization

class WorldVizHandler {
    constructor() {
        this.container = document.querySelector('#widget-world-viz .viz-container');
        this.data = null;
        this.svg = null;
        this.initialized = false;
        this.activeCountry = null;
        
        // Mobile-first grid configuration with adjusted spacing
        this.config = {
            margin: { top: 0, right: 0, bottom: 40, left: 0 }, // Increased side margins
            cellHeight: 50, 
            maxRadius: 30, 
            minRadius: 3,
            columnsMobile: 3,
            columnsTablet: 6,
            columnsDesktop: 10,
            textSpacing: 50
        };
        
        this.breakpoints = {
            mobile: 599,
            tablet: 900,
            desktop: 1200
        };
        
        this.init();
    }

    // Swiss-style number formatting with apostrophes as thousands separators
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }

    async init() {
        if (!this.container) {
            console.error('Widget world-viz container not found');
            return;
        }

        try {
            await this.loadData();
            this.setupVisualization();
            this.setupResizeHandler();
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing world visualization:', error);
        }
    }

    async loadData() {
        try {
            // Try window.fs.readFile first (for artifacts)
            if (window.fs && window.fs.readFile) {
                const csvText = await window.fs.readFile('MAKEAWARE-Visualisations-Q2.csv', { encoding: 'utf8' });
                this.data = d3.csvParse(csvText, d => ({
                    country: d.Country,
                    samplesTaken: +d.SamplesTaken,
                    resistantBacteria: +d.ResistantBacteria,
                    resistanceRate: (+d.ResistantBacteria / +d.SamplesTaken) * 100
                }));
            } else {
                // Fallback for normal browser
                try {
                    this.data = await d3.csv('assets/csv/MAKEAWARE-Visualisations-Q2.csv', d => ({
                        country: d.Country,
                        samplesTaken: +d.SamplesTaken,
                        resistantBacteria: +d.ResistantBacteria,
                        resistanceRate: (+d.ResistantBacteria / +d.SamplesTaken) * 100
                    }));
                } catch (d3Error) {
                    console.log('Trying with fetch...');
                    const response = await fetch('assets/csv/MAKEAWARE-Visualisations-Q2.csv');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const csvText = await response.text();
                    this.data = d3.csvParse(csvText, d => ({
                        country: d.Country,
                        samplesTaken: +d.SamplesTaken,
                        resistantBacteria: +d.ResistantBacteria,
                        resistanceRate: (+d.ResistantBacteria / +d.SamplesTaken) * 100
                    }));
                }
            }

            // Sort data by resistant bacteria count (highest to lowest)
            this.data.sort((a, b) => b.resistantBacteria - a.resistantBacteria);
            console.log(`Loaded ${this.data.length} countries`);
            CSVLoadedTrigger(); // call the "components-render.js" file after loading the csv and generated d3 graph
            
        } catch (error) {
            console.error('Error loading CSV data:', error);
            this.loadFallbackData();
        }
    }

    loadFallbackData() {
        console.log('Loading fallback data...');
        this.data = [
            { country: "India", samplesTaken: 15759, resistantBacteria: 5474, resistanceRate: 34.7 },
            { country: "United States", samplesTaken: 27577, resistantBacteria: 2561, resistanceRate: 9.3 },
            { country: "Brazil", samplesTaken: 10307, resistantBacteria: 2418, resistanceRate: 23.5 },
            { country: "Italy", samplesTaken: 10545, resistantBacteria: 2004, resistanceRate: 19.0 },
            { country: "Spain", samplesTaken: 12545, resistantBacteria: 1630, resistanceRate: 13.0 },
            { country: "Mexico", samplesTaken: 7394, resistantBacteria: 1547, resistanceRate: 20.9 },
            { country: "China", samplesTaken: 7061, resistantBacteria: 1537, resistanceRate: 21.8 },
            { country: "Nigeria", samplesTaken: 4819, resistantBacteria: 1329, resistanceRate: 27.6 },
            { country: "Greece", samplesTaken: 4836, resistantBacteria: 1321, resistanceRate: 27.3 },
            { country: "Thailand", samplesTaken: 7233, resistantBacteria: 1290, resistanceRate: 17.8 },
            { country: "Turkey", samplesTaken: 4992, resistantBacteria: 1281, resistanceRate: 25.7 },
            { country: "Argentina", samplesTaken: 4819, resistantBacteria: 1203, resistanceRate: 25.0 },
            { country: "South Africa", samplesTaken: 5982, resistantBacteria: 1175, resistanceRate: 19.6 },
            { country: "France", samplesTaken: 11390, resistantBacteria: 1174, resistanceRate: 10.3 },
            { country: "South Korea", samplesTaken: 7153, resistantBacteria: 1172, resistanceRate: 16.4 },
            { country: "Ukraine", samplesTaken: 3607, resistantBacteria: 1132, resistanceRate: 31.4 },
            { country: "Croatia", samplesTaken: 5305, resistantBacteria: 1128, resistanceRate: 21.3 },
            { country: "Guatemala", samplesTaken: 3861, resistantBacteria: 950, resistanceRate: 24.6 },
            { country: "Romania", samplesTaken: 3366, resistantBacteria: 917, resistanceRate: 27.2 },
            { country: "Germany", samplesTaken: 10572, resistantBacteria: 914, resistanceRate: 8.6 },
            { country: "Switzerland", samplesTaken: 1958, resistantBacteria: 158, resistanceRate: 8.1 },
            { country: "Netherlands", samplesTaken: 1580, resistantBacteria: 103, resistanceRate: 6.5 },
            { country: "Denmark", samplesTaken: 978, resistantBacteria: 70, resistanceRate: 7.2 },
            { country: "Sweden", samplesTaken: 937, resistantBacteria: 44, resistanceRate: 4.7 },
            { country: "Finland", samplesTaken: 929, resistantBacteria: 34, resistanceRate: 3.7 }
        ];
        
        console.log(`Loaded ${this.data.length} countries (fallback data)`);
    }

    getCurrentColumns() {
        const width = window.innerWidth;
        if (width <= this.breakpoints.mobile) return this.config.columnsMobile;
        if (width <= this.breakpoints.tablet) return this.config.columnsTablet;
        return this.config.columnsDesktop;
    }

    calculateDimensions() {
        const columns = this.getCurrentColumns();
        const rows = Math.ceil(this.data.length / columns);
        
        // Use container width with responsive adjustments
        const containerWidth = this.container.offsetWidth || window.innerWidth - 32;
        const availableWidth = containerWidth - this.config.margin.left - this.config.margin.right;
        
        // Calculate cell width based on available space
        const cellWidth = Math.floor(availableWidth / columns);
        
        // Calculate total height including space for text below circles
        const cellHeight = this.config.cellHeight + this.config.textSpacing;
        
        const width = containerWidth;
        const height = (rows * cellHeight) + this.config.margin.top + this.config.margin.bottom;
        
        // Update config with new dimensions
        this.config.cellWidth = cellWidth;
        this.config.cellHeight = cellHeight;
        
        return { width, height, columns, rows };
    }

    setupVisualization() {
        if (!this.data || this.data.length === 0) {
            console.error('No data available for visualization');
            return;
        }

        // Clear existing container
        this.container.innerHTML = '';

        const dimensions = this.calculateDimensions();
        
        // Create SVG that uses full container width
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', dimensions.height)
            .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
            .style('display', 'block');

        // Create main group
        const g = this.svg.append('g')
            .attr('transform', `translate(${this.config.margin.left},${this.config.margin.top})`);

        // Single scale for both radii - use max value between samples and resistant
        const maxValue = Math.max(
            d3.max(this.data, d => d.samplesTaken),
            d3.max(this.data, d => d.resistantBacteria)
        );
        
        const radiusScale = d3.scaleSqrt()
            .domain([0, maxValue])
            .range([this.config.minRadius, this.config.maxRadius]);

        // Check if country is Switzerland for highlighting
        const isSwitzerlandHighlighted = (country) => {
            return country.toLowerCase() === 'switzerland';
        };

        // Create groups for each country
        const countryGroups = g.selectAll('.country-group')
            .data(this.data)
            .enter()
            .append('g')
            .attr('class', 'country-group')
            .attr('transform', (d, i) => {
                const col = i % dimensions.columns;
                const row = Math.floor(i / dimensions.columns);
                const x = col * this.config.cellWidth + this.config.cellWidth / 2;
                const y = row * this.config.cellHeight + this.config.maxRadius + 10;
                return `translate(${x},${y})`;
            });

        // Outer circle (outline) - Samples Taken
        countryGroups.append('circle')
            .attr('class', 'samples-circle')
            .attr('r', d => radiusScale(d.samplesTaken));

        // Inner circle (filled) - Resistant Bacteria
        countryGroups.append('circle')
            .attr('class', d => isSwitzerlandHighlighted(d.country) ? 'resistant-circle switzerland' : 'resistant-circle')
            .attr('r', d => radiusScale(d.resistantBacteria));

        // Country name text - centered with circle
        countryGroups.append('text')
            .attr('class', 'country-label')
            .attr('y', d => this.config.maxRadius + 15)
            .attr('text-anchor', 'middle')
            .text(d => this.formatCountryName(d.country));

        // Resistant bacteria data text (initially hidden, shown on hover/click) - centered with 0.5rem spacing from samples
        countryGroups.append('text')
            .attr('class', 'country-resistant')
            .attr('y', d => this.config.maxRadius + 15 + 16) // 0.5rem (8px) spacing from samples text
            .attr('text-anchor', 'middle') // Changed to center
            .attr('x', 0) // Centered on the circle
            .style('opacity', 0)
            .text(d => `Resistant bacteria: ${this.formatNumber(d.resistantBacteria)}`);

        // Samples data text (initially hidden, shown on hover/click) - centered under country name with 1rem spacing
        countryGroups.append('text')
            .attr('class', 'country-samples')
            .attr('y', d => this.config.maxRadius + 15 + 16 + 16) // 1rem (16px) spacing from country name
            .attr('text-anchor', 'middle') // Changed to center
            .attr('x', 0) // Centered on the circle
            .style('opacity', 0)
            .text(d => `Samples: ${this.formatNumber(d.samplesTaken)}`);

        // Add interaction handlers
        this.addInteractions(countryGroups);
    }

    formatCountryName(countryName) {
        // Capitalize first letter of each word
        return countryName.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    addInteractions(selection) {
        const self = this;

        selection
            .on('mouseenter click', function(event, d) {
                // Reset previous active country
                if (self.activeCountry && self.activeCountry !== this) {
                    d3.select(self.activeCountry)
                        .select('.resistant-circle')
                        .style('fill', null); // Reset to CSS color

                    d3.select(self.activeCountry)
                        .classed('active', false);
                    
                    d3.select(self.activeCountry)
                        .select('.country-samples')
                        .style('opacity', 0);
                        
                    d3.select(self.activeCountry)
                        .select('.country-resistant')
                        .style('opacity', 0);
                }

                // Set new active country
                self.activeCountry = this;

                // Change circle color to brand-pink
                d3.select(this)
                    .classed('active', true);

                d3.select(this)
                    .select('.country-resistant')
                    .style('opacity', 1);

                // Show data texts
                d3.select(this)
                    .select('.country-samples')
                    .style('opacity', 1);
                    
                
            })
            .on('mouseleave', function(event, d) {
                // Only reset if mouse leaves and we're not in "clicked" state
                // For now, we'll keep the selection until another country is selected
                // This provides better mobile experience
            });

        // Click outside to deselect
        this.svg.on('click', function(event) {
            if (event.target === this && self.activeCountry) {
                d3.select(self.activeCountry)
                    .classed('active', false);                   
                
                d3.select(self.activeCountry)
                    .select('.country-samples')
                    .style('opacity', 0);
                    
                d3.select(self.activeCountry)
                    .select('.country-resistant')
                    .style('opacity', 0);
                
            }
        });
    }

    setupResizeHandler() {
        let resizeTimeout;
        let lastWidth = window.innerWidth;
        
        window.addEventListener('resize', () => {
            // Only rebuild if width actually changed (avoid mobile scroll issues)
            const currentWidth = window.innerWidth;
            if (Math.abs(currentWidth - lastWidth) < 10) {
                return; // Ignore small width changes that can happen during scroll on mobile
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

// Expose globally for control from widget overlay handler
window.WorldVizHandler = WorldVizHandler;

window.worldVizHandler = new WorldVizHandler();