// widget-swiss-svg.js - Swiss bacterial resistance visualization using SVG files

class SwissSVGVizHandler {
    constructor() {
        this.container = document.querySelector('#widget-swiss-viz .viz-container');
        this.svgData = [];
        this.years = [2018, 2019, 2020, 2021];
        this.zones = ['North-West', 'West', 'Central-West', 'Geneve-area', 'Central-East', 'South', 'East', 'Nord-East'];
        this.initialized = false;
        
        // Configuration for responsive layout
        this.config = {
            margin: { 
                top: 80, 
                right: 0, // No right margin on desktop - use full width
                bottom: 40, 
                left: 60,
                // Mobile-specific margins
                mobile: {
                    top: 60,
                    right: 0,
                    bottom: 30,
                    left: 30
                },
                // Tablet/responsive margins (horizontal layout)
                tablet: {
                    top: 60,
                    right: 0,
                    bottom: 40,
                    left: 30
                }
            },
            svgSpacing: 20, // Vertical spacing between SVGs (desktop)
            svgSpacingMobile: 30,
            svgSpacingTablet: 20, // Horizontal spacing between SVGs (tablet)
            labelOffset: 20, // Distance of labels from SVG content
            labelOffsetMobile: 15,
            labelOffsetTablet: 25,
            // Responsive SVG dimensions
            tabletSVGHeight: 800, // Fixed height for rotated SVGs
            tabletSVGWidth: 130   // Calculated based on original proportions
        };
        
        this.breakpoints = {
            mobile: 599,
            tablet: 600,  // tablet-v breakpoint
            desktop: 1200
        };
        
        this.init();
    }

    async init() {
        if (!this.container) {
            console.error('Widget swiss-svg-viz container not found');
            return;
        }

        try {
            await this.loadSVGs();
            this.setupVisualization();
            this.setupResizeHandler();
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing swiss SVG visualization:', error);
        }
    }

    async loadSVGs() {
        try {
            // Load all 4 SVG files
            for (const year of this.years) {
                const svgPath = `assets/img/widgets/widget-swiss/widget-swiss-${year}.svg`;
                
                try {
                    let svgContent;
                    
                    // Try window.fs.readFile first (for artifacts)
                    if (window.fs && window.fs.readFile) {
                        svgContent = await window.fs.readFile(svgPath, { encoding: 'utf8' });
                    } else {
                        // Fallback for normal browser
                        const response = await fetch(svgPath);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        svgContent = await response.text();
                    }
                    
                    // Parse SVG content to extract circle positions
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                    const circles = Array.from(svgDoc.querySelectorAll('circle'));
                    
                    // Extract circle data and sort by cx position
                    const circleData = circles.map(circle => ({
                        cx: parseFloat(circle.getAttribute('cx')),
                        cy: parseFloat(circle.getAttribute('cy')),
                        r: parseFloat(circle.getAttribute('r'))
                    })).sort((a, b) => a.cx - b.cx);
                    
                    // Get SVG viewBox for scaling calculations
                    const svgElement = svgDoc.querySelector('svg');
                    const viewBox = svgElement.getAttribute('viewBox');
                    const [viewX, viewY, viewWidth, viewHeight] = viewBox.split(' ').map(Number);
                    
                    this.svgData.push({
                        year,
                        content: svgContent,
                        circles: circleData,
                        viewBox: { x: viewX, y: viewY, width: viewWidth, height: viewHeight },
                        originalWidth: parseFloat(svgElement.getAttribute('width')) || viewWidth,
                        originalHeight: parseFloat(svgElement.getAttribute('height')) || viewHeight
                    });
                    
                } catch (error) {
                    console.error(`Error loading SVG for year ${year}:`, error);
                    // Create fallback data for this year
                    this.createFallbackSVGData(year);
                }
            }
            
            console.log(`Loaded ${this.svgData.length} SVG files`);
            CSVLoadedTrigger(); // call the "components-render.js" file after loading the csv and generated d3 graph
            
        } catch (error) {
            console.error('Error loading SVG data:', error);
            this.loadFallbackData();
        }
    }

    createFallbackSVGData(year) {
        // Create basic fallback SVG data with approximate circle positions
        const fallbackCircles = [
            { cx: 56, cy: 65, r: 22 },
            { cx: 256, cy: 65, r: 19 },
            { cx: 456, cy: 65, r: 26 },
            { cx: 655, cy: 65, r: 19 },
            { cx: 856, cy: 65, r: 17 },
            { cx: 1055, cy: 65, r: 14 },
            { cx: 1256, cy: 65, r: 16 },
            { cx: 1456, cy: 65, r: 23 }
        ];
        
        const fallbackSVG = `
            <svg width="1511" height="130" viewBox="0 0 1511 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,65 L1511,65" stroke="black" stroke-width="2" fill="none"/>
                ${fallbackCircles.map(c => `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="black"/>`).join('')}
            </svg>
        `;
        
        this.svgData.push({
            year,
            content: fallbackSVG,
            circles: fallbackCircles,
            viewBox: { x: 0, y: 0, width: 1511, height: 130 },
            originalWidth: 1511,
            originalHeight: 130
        });
    }

    loadFallbackData() {
        console.log('Loading fallback SVG data...');
        this.years.forEach(year => this.createFallbackSVGData(year));
    }

    isMobile() {
        return window.innerWidth <= this.breakpoints.mobile;
    }

    isTabletV() {
        return window.innerWidth >= this.breakpoints.tablet && window.innerWidth < this.breakpoints.desktop;
    }

    isDesktop() {
        return window.innerWidth >= this.breakpoints.desktop;
    }

    // Responsive horizontal layout activates for tablet-v and below (≤900px)
    needsHorizontalLayout() {
        return window.innerWidth < 900; // tablet-h breakpoint from responsive.styl
    }

    calculateDimensions() {
        const containerWidth = this.container.offsetWidth || window.innerWidth;
        const isMobile = this.isMobile();
        const isTabletV = this.isTabletV();
        const needsHorizontal = this.needsHorizontalLayout();
        
        if (needsHorizontal) {
            // Horizontal rotated layout for tablet-v and mobile
            return this.calculateHorizontalDimensions(containerWidth, isMobile, isTabletV);
        } else {
            // Original vertical layout for desktop and tablet-h
            return this.calculateVerticalDimensions(containerWidth);
        }
    }

    calculateVerticalDimensions(containerWidth) {
        // Original vertical layout for desktop and tablet-h
        const margin = this.config.margin;
        const svgSpacing = this.config.svgSpacing;
        const labelOffset = this.config.labelOffset;
        
        const availableWidth = containerWidth - margin.left - margin.right;
        const maxSVGWidth = Math.max(...this.svgData.map(d => d.viewBox.width));
        
        // Desktop: stretch to fill full available width
        const scale = availableWidth / maxSVGWidth;
        
        const scaledSVGHeight = this.svgData[0]?.viewBox.height * scale || 130 * scale;
        const totalSVGHeight = (scaledSVGHeight + svgSpacing) * this.years.length - svgSpacing;
        const height = margin.top + totalSVGHeight + margin.bottom;
        
        return { 
            width: containerWidth, 
            height, 
            availableWidth,
            scale,
            scaledSVGHeight,
            svgSpacing,
            labelOffset,
            isMobile: false,
            isTabletV: false,
            needsHorizontal: false,
            margin,
            layout: 'vertical'
        };
    }

    calculateHorizontalDimensions(containerWidth, isMobile, isTabletV) {
        // Horizontal rotated layout for tablet-v and mobile
        const margin = isMobile ? this.config.margin.mobile : this.config.margin.tablet;
        const svgSpacing = this.config.svgSpacingTablet;
        const labelOffset = isMobile ? this.config.labelOffsetMobile : this.config.labelOffsetTablet;
        
        // Available space for all SVGs horizontally
        const availableWidth = containerWidth - margin.left - margin.right;
        const totalSpacing = svgSpacing * (this.years.length - 1);
        const availableWidthForSVGs = availableWidth - totalSpacing;
        
        // Fixed height for rotated SVGs
        const svgHeight = this.config.tabletSVGHeight;
        
        // Calculate width for each SVG (they will be rotated)
        const svgWidth = availableWidthForSVGs / this.years.length;
        
        // Since SVGs are rotated 90 degrees, the scale is based on height fitting the original width
        const originalSVGWidth = this.svgData[0]?.viewBox.width || 1511;
        const scale = svgHeight / originalSVGWidth;
        
        // Total height includes margin, SVG height, and label space
        const height = margin.top + svgHeight + margin.bottom;
        
        return {
            width: containerWidth,
            height,
            availableWidth,
            availableWidthForSVGs,
            svgWidth,
            svgHeight,
            scale,
            svgSpacing,
            labelOffset,
            isMobile,
            isTabletV,
            needsHorizontal: true,
            margin,
            layout: 'horizontal'
        };
    }

    setupVisualization() {
        if (!this.svgData || this.svgData.length === 0) {
            console.error('No SVG data available for visualization');
            return;
        }

        // Clear existing container
        this.container.innerHTML = '';

        const dimensions = this.calculateDimensions();
        
        if (dimensions.needsHorizontal) {
            // Horizontal rotated layout for tablet-v and mobile
            this.setupHorizontalVisualization(dimensions);
        } else {
            // Original vertical layout for desktop and tablet-h
            this.setupVerticalVisualization(dimensions);
        }
    }

    setupVerticalVisualization(dimensions) {
        // Original vertical layout for desktop and tablet-h
        const mainSvg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', dimensions.height)
            .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
            .style('display', 'block');

        const g = mainSvg.append('g')
            .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

        // Add zone labels at the top (based on first SVG's circle positions)
        if (this.svgData.length > 0) {
            const firstSVG = this.svgData[0];
            
            g.selectAll('.zone-header')
                .data(this.zones)
                .enter()
                .append('text')
                .attr('class', 'zone-header')
                .attr('x', (d, i) => {
                    const circle = firstSVG.circles[i];
                    return circle ? circle.cx * dimensions.scale : 0;
                })
                .attr('y', -dimensions.labelOffset)
                .attr('text-anchor', 'middle')
                .text(d => d)
                
        }

        // Create groups for each year's SVG
        this.svgData.forEach((svgData, index) => {
            const yPosition = index * (dimensions.scaledSVGHeight + dimensions.svgSpacing);
            
            const yearGroup = g.append('g')
                .attr('transform', `translate(0, ${yPosition})`);
            
            // Add year label on the left
            yearGroup.append('text')
                .attr('class', 'year-label')
                .attr('x', -dimensions.labelOffset)
                .attr('y', dimensions.scaledSVGHeight / 2)
                .attr('text-anchor', 'end')
                .attr('dy', '0.35em')
                .text(svgData.year)
          
            
            // Add the SVG content
            const svgContainer = yearGroup.append('g')
                .attr('transform', `scale(${dimensions.scale})`);
            
            this.insertSVGContent(svgContainer, svgData);
        });

        // Apply styles to labels
        mainSvg.selectAll('.zone-header, .year-label')
            .classed('sans-scheme', true);
    }

    setupHorizontalVisualization(dimensions) {
        // Horizontal layout with rotated SVGs for tablet-v and mobile
        const mainSvg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', dimensions.height)
            .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
            .style('display', 'block')
            .classed('horizontal-layout', true);

        const g = mainSvg.append('g')
            .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

        // Add year labels at the top (centered above each rotated SVG)
        const yearLabelsGroup = g.append('g').attr('class', 'year-labels-group');
        
        yearLabelsGroup.selectAll('.year-header')
            .data(this.years)
            .enter()
            .append('text')
            .attr('class', 'year-header')
            .attr('x', (d, i) => {
                return i * (dimensions.svgWidth + dimensions.svgSpacing) + dimensions.svgWidth / 2;
            })
            .attr('y', -dimensions.labelOffset)
            .attr('text-anchor', 'middle')
            .text(d => d)
          

        // Add zone labels on the left (rotated -90 degrees, aligned with circles)
        if (this.svgData.length > 0) {
            const firstSVG = this.svgData[0];
            
            const zoneLabelsGroup = g.append('g').attr('class', 'zone-labels-group');
            
            zoneLabelsGroup.selectAll('.zone-label')
                .data(this.zones)
                .enter()
                .append('text')
                .attr('class', 'zone-label')
                .attr('x', -dimensions.labelOffset)
                .attr('y', (d, i) => {
                    const circle = firstSVG.circles[i];
                    if (!circle) return 0;
                    // Since SVG is rotated 90 degrees, cx becomes y position
                    return circle.cx * dimensions.scale;
                })
                .attr('text-anchor', 'middle')
                .attr('transform', (d, i) => {
                    const circle = firstSVG.circles[i];
                    if (!circle) return '';
                    const y = circle.cx * dimensions.scale;
                    return `rotate(-90, ${-dimensions.labelOffset}, ${y})`;
                })
                .text(d => d)
        }

        // Create groups for each year's SVG (arranged horizontally)
        this.svgData.forEach((svgData, index) => {
            const xPosition = index * (dimensions.svgWidth + dimensions.svgSpacing);
            
            const yearGroup = g.append('g')
                .attr('class', 'svg-year-group')
                .attr('transform', `translate(${xPosition}, 0)`);
            
            // Create container for rotated SVG
            const rotatedContainer = yearGroup.append('g')
                .attr('class', 'rotated-svg-container')
                .attr('transform', `
                    translate(${dimensions.svgWidth / 2}, ${dimensions.svgHeight / 2}) 
                    rotate(90) 
                    scale(${dimensions.scale}) 
                    translate(${-svgData.viewBox.width / 2}, ${-svgData.viewBox.height / 2})
                `);
            
            this.insertSVGContent(rotatedContainer, svgData);
        });

        // Apply styles to labels
        mainSvg.selectAll('.year-header, .zone-label')
            .classed('sans-scheme', true);
    }

    insertSVGContent(container, svgData) {
        // Parse and insert SVG content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgData.content;
        const svgElement = tempDiv.querySelector('svg');
        
        if (svgElement) {
            // Copy all child elements from the loaded SVG
            Array.from(svgElement.children).forEach(child => {
                const clonedChild = child.cloneNode(true);
                
                // Convert to D3 selection and append
                const d3Child = d3.select(document.importNode(clonedChild, true));
                container.node().appendChild(d3Child.node());
            });
        }
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
        if (this.initialized && this.svgData.length > 0) {
            this.setupVisualization();
        }
    }

    // Method to update spacing (useful for fine-tuning)
    updateSpacing(svgSpacing, svgSpacingMobile, svgSpacingTablet) {
        this.config.svgSpacing = svgSpacing || this.config.svgSpacing;
        this.config.svgSpacingMobile = svgSpacingMobile || this.config.svgSpacingMobile;
        this.config.svgSpacingTablet = svgSpacingTablet || this.config.svgSpacingTablet;
        
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
            window.swissSVGVizHandler = new SwissSVGVizHandler();
        };
        document.head.appendChild(script);
    } else {
        window.swissSVGVizHandler = new SwissSVGVizHandler();
    }
});

// Expose globally for control from widget overlay handler
window.SwissSVGVizHandler = SwissSVGVizHandler;

window.swissSVGVizHandler = new SwissSVGVizHandler();