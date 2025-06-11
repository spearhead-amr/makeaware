// widget-timeline.js - Timeline visualization for antibiotic discovery

class TimelineVizHandler {
    constructor() {
        this.container = document.querySelector('#widget-timeline-viz .viz-container');
        this.data = null;
        this.svg = null;
        this.initialized = false;
        
        // Configuration for responsive design
        this.config = {
            margin: { top: 80, right: 0, bottom: 100, left: 0 },
            circleSpacing: 14,
            circleMinDistance: 4,
            yearLabelOffset: 20,
            ageLabelOffset: 80,
            periodTextOffset: 16,
            tooltipOffset: 16,
            periodDescriptionWidth: 0.2
        };
        
        this.breakpoints = {
            mobile: 599,
            tablet: 900,
            desktop: 1200
        };
        
        this.periods = [
            {
                id: 'pre-antibiotic',
                startYear: 1900,
                endYear: 1928
            },
            {
                id: 'golden-age',
                startYear: 1928,
                endYear: 1970
            },
            {
                id: 'follow-on',
                startYear: 1970,
                endYear: 2000
            },
            {
                id: 'discovery-void',
                startYear: 2000,
                endYear: 2030
            }
        ];
        
        this.init();
    }

    async init() {
        if (!this.container) {
            console.error('Widget timeline-viz container not found');
            return;
        }

        try {
            await this.loadData();
            this.setupVisualization();
            this.setupResizeHandler();
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing timeline visualization:', error);
        }
    }

    async loadData() {
        try {
            if (window.fs && window.fs.readFile) {
                const csvText = await window.fs.readFile('MAKEAWAREVisualisationsQ5.csv', { encoding: 'utf8' });
                this.data = d3.csvParse(csvText, d => ({
                    antibiotic: d.Antibiotic,
                    releaseDate: +d.ReleaseDate
                }));
            } else {
                try {
                    this.data = await d3.csv('assets/csv/MAKEAWARE-Visualisations-Q5.csv', d => ({
                        antibiotic: d.Antibiotic,
                        releaseDate: +d.ReleaseDate
                    }));
                } catch (d3Error) {
                    console.log('Trying with fetch...');
                    const response = await fetch('assets/csv/MAKEAWARE-Visualisations-Q5.csv');
                    if (!response.ok) {
                        throw new Error('HTTP error! status: ' + response.status);
                    }
                    const csvText = await response.text();
                    this.data = d3.csvParse(csvText, d => ({
                        antibiotic: d.Antibiotic,
                        releaseDate: +d.ReleaseDate
                    }));
                }
            }

            this.groupedData = d3.group(this.data, d => d.releaseDate);
            console.log('Loaded ' + this.data.length + ' antibiotics');
            
        } catch (error) {
            console.error('Error loading CSV data:', error);
            this.loadFallbackData();
        }
    }

    loadFallbackData() {
        console.log('Loading fallback data...');
        this.data = [
            { antibiotic: "Penicillin", releaseDate: 1928 },
            { antibiotic: "Streptomycin", releaseDate: 1944 },
            { antibiotic: "Chloramphenicol", releaseDate: 1947 },
            { antibiotic: "Tetracycline", releaseDate: 1950 },
            { antibiotic: "Erythromycin", releaseDate: 1952 },
            { antibiotic: "Vancomycin", releaseDate: 1958 }
        ];
        
        this.groupedData = d3.group(this.data, d => d.releaseDate);
        console.log('Loaded ' + this.data.length + ' antibiotics (fallback data)');
    }

    isMobile() {
        return window.innerWidth <= this.breakpoints.mobile;
    }

    getResponsiveCircleSettings(width) {
        const minRadius = 4;
        const maxRadius = 7;
        const minSpacing = 8;
        const maxSpacing = 16;
        
        const radius = Math.max(minRadius, Math.min(maxRadius, width / 200));
        const spacing = minSpacing + ((radius - minRadius) / (maxRadius - minRadius)) * (maxSpacing - minSpacing);
        
        return { radius: radius, spacing: spacing };
    }

    calculateDimensions() {
        const containerWidth = this.container.offsetWidth || window.innerWidth - 40;
        const isMobile = this.isMobile();
        
        if (isMobile) {
            const width = containerWidth;
            const height = 1800;
            return { width, height, isMobile };
        } else {
            const width = containerWidth;
            // Calculate dynamic height based on content - will be updated after rendering
            const height = 600; // Initial height, will be adjusted
            return { width, height, isMobile };
        }
    }

    setupVisualization() {
        if (!this.data || this.data.length === 0) {
            console.error('No data available for visualization');
            return;
        }

        this.container.innerHTML = '';

        const dimensions = this.calculateDimensions();
        
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', dimensions.height)
            .attr('viewBox', '0 0 ' + dimensions.width + ' ' + dimensions.height)
            .style('display', 'block');

        const g = this.svg.append('g')
            .attr('transform', 'translate(' + this.config.margin.left + ',' + this.config.margin.top + ')');

        const availableWidth = dimensions.width - this.config.margin.left - this.config.margin.right;
        const availableHeight = dimensions.height - this.config.margin.top - this.config.margin.bottom;

        if (dimensions.isMobile) {
            this.setupMobileVisualization(g, availableWidth, availableHeight);
        } else {
            this.setupDesktopVisualization(g, availableWidth, availableHeight);
        }
    }

    setupDesktopVisualization(g, width, height) {
        const timelineY = height / 2;
        const circleSettings = this.getResponsiveCircleSettings(width);
        
        const yearScale = d3.scaleLinear()
            .domain([1900, 2030])
            .range([0, width]);

        let maxStackHeight = 0;
        this.groupedData.forEach((antibiotics, year) => {
            if (antibiotics.length > maxStackHeight) {
                maxStackHeight = antibiotics.length;
            }
        });
        const globalHighestY = timelineY - circleSettings.spacing - ((maxStackHeight - 1) * circleSettings.spacing);

        const years = d3.range(1900, 2031, 10);
        g.selectAll('.year-label')
            .data(years)
            .enter()
            .append('text')
            .attr('class', 'timeline-year-label')
            .attr('x', d => yearScale(d))
            .attr('y', timelineY + this.config.yearLabelOffset)
            .attr('text-anchor', 'middle')
            .text(d => d);

        // Add period separators
        this.periods.forEach((period, index) => {
            const x = yearScale(period.startYear);
            
            g.append('line')
                .attr('class', 'period-separator')
                .attr('x1', x)
                .attr('y1', timelineY + this.config.yearLabelOffset + 16)
                .attr('x2', x)
                .attr('y2', timelineY + this.config.ageLabelOffset + 250);
        });

        // First pass: create all titles and calculate their heights
        const titleInfos = [];
        let maxTitleHeight = 0;
        
        this.periods.forEach((period, index) => {
            const x = yearScale(period.startYear);
            const textX = x + this.config.periodTextOffset;
            const descriptionWidth = width * this.config.periodDescriptionWidth;
            
            const titleInfo = this.createPeriodTitle(
                g,
                this.getPeriodTitle(period.id),
                textX,
                timelineY + this.config.ageLabelOffset,
                descriptionWidth
            );
            
            titleInfos.push({
                period: period,
                x: textX,
                titleHeight: titleInfo.height,
                descriptionWidth: descriptionWidth
            });
            
            if (titleInfo.height > maxTitleHeight) {
                maxTitleHeight = titleInfo.height;
            }
        });
        
        // Second pass: create all descriptions aligned to the same baseline and calculate total content height
        const descriptionStartY = timelineY + this.config.ageLabelOffset + maxTitleHeight + 10;
        let maxContentBottom = descriptionStartY;
        
        titleInfos.forEach((titleInfo) => {
            const contentBottom = this.createPeriodDescriptions(
                g,
                this.getPeriodDescriptions(titleInfo.period.id),
                titleInfo.x,
                descriptionStartY,
                titleInfo.descriptionWidth
            );
            
            if (contentBottom > maxContentBottom) {
                maxContentBottom = contentBottom;
            }
        });

        // Calculate required height including margins
        const requiredHeight = maxContentBottom + this.config.margin.bottom + 40; // Extra padding
        const currentHeight = height + this.config.margin.top + this.config.margin.bottom;
        
        // Update SVG height if content requires more space
        if (requiredHeight > currentHeight) {
            const newTotalHeight = requiredHeight;
            this.svg.attr('height', newTotalHeight)
                   .attr('viewBox', '0 0 ' + width + ' ' + newTotalHeight);
        }

        // Add antibiotic circles with hover effects
        this.groupedData.forEach((antibiotics, year) => {
            const x = yearScale(year);
            
            antibiotics.forEach((antibiotic, index) => {
                const y = timelineY - circleSettings.spacing - (index * circleSettings.spacing);
                
                const circle = g.append('circle')
                    .attr('class', 'antibiotic-circle')
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', circleSettings.radius)
                    .datum(antibiotic);

                if (!this.isMobile()) {
                    this.addHoverEffects(circle, g, x, globalHighestY, antibiotic.antibiotic);
                }
            });
        });
    }

    createPeriodTitle(g, text, x, y, maxWidth) {
        const textElement = g.append('text')
            .attr('class', 'timeline-period-title')
            .attr('x', x)
            .attr('y', y)
            .attr('text-anchor', 'start');
        
        const words = text.split(' ');
        let currentLine = '';
        let lineCount = 0;
        
        // Create a temporary text element to measure text width
        const tempText = g.append('text')
            .attr('class', 'timeline-period-title')
            .style('opacity', 0);
        
        words.forEach((word, wordIndex) => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            tempText.text(testLine);
            const textWidth = tempText.node().getBBox().width;
            
            if (textWidth > maxWidth && currentLine !== '') {
                // Add current line
                textElement.append('tspan')
                    .attr('x', x)
                    .attr('dy', lineCount === 0 ? 0 : '1.4em')
                    .text(currentLine);
                
                currentLine = word;
                lineCount++;
            } else {
                currentLine = testLine;
            }
        });
        
        // Add the last line
        if (currentLine) {
            textElement.append('tspan')
                .attr('x', x)
                .attr('dy', lineCount === 0 ? 0 : '1.4em')
                .text(currentLine);
            lineCount++;
        }
        
        tempText.remove();
        
        // Calculate total height (number of lines * line height)
        const lineHeight = 20; // Approximate line height in pixels
        const totalHeight = lineCount * lineHeight;
        
        return { element: textElement, height: totalHeight };
    }

    createPeriodDescriptions(g, paragraphs, x, y, maxWidth) {
        let currentY = y;
        
        paragraphs.forEach((paragraph, paragraphIndex) => {
            if (paragraph.trim() === '') return;
            
            const textElement = g.append('text')
                .attr('class', 'timeline-period-description')
                .attr('x', x)
                .attr('y', currentY)
                .attr('text-anchor', 'start');
            
            const words = paragraph.trim().split(' ');
            let currentLine = '';
            let lineCount = 0;
            
            // Create a temporary text element to measure text width
            const tempText = g.append('text')
                .attr('class', 'timeline-period-description')
                .style('opacity', 0);
            
            words.forEach((word, wordIndex) => {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                tempText.text(testLine);
                const textWidth = tempText.node().getBBox().width;
                
                if (textWidth > maxWidth && currentLine !== '') {
                    // Add current line
                    textElement.append('tspan')
                        .attr('x', x)
                        .attr('dy', lineCount === 0 ? 0 : '1.4em')
                        .text(currentLine);
                    
                    currentLine = word;
                    lineCount++;
                } else {
                    currentLine = testLine;
                }
            });
            
            // Add the last line
            if (currentLine) {
                textElement.append('tspan')
                    .attr('x', x)
                    .attr('dy', lineCount === 0 ? 0 : '1.4em')
                    .text(currentLine);
                lineCount++;
            }
            
            tempText.remove();
            
            // Update currentY for next paragraph with spacing
            const lineHeight = 18; // Approximate line height for descriptions
            const paragraphHeight = lineCount * lineHeight;
            const paragraphSpacing = 24; // Space between paragraphs
            
            currentY += paragraphHeight + paragraphSpacing;
        });
        
        return currentY;
    }

    getPeriodTitle(periodId) {
        const titles = {
            'pre-antibiotic': 'PRE-ANTIBIOTIC ERA',
            'golden-age': 'GOLDEN AGE',
            'follow-on': '"FOLLOW-ON" DRUG PERIOD',
            'discovery-void': 'DISCOVERY VOID/POST ANTIBIOTIC ERA'
        };
        return titles[periodId] || '';
    }

    getPeriodDescriptions(periodId) {
        const descriptions = {
            'pre-antibiotic': [
                '1900 One of the main cause of death were attributable to infectious diseases.',
                '1909 Paul Ehrlich team discovered Salvarsan, which was active against syphilis.',
                '1914-1918 During the WWI infectious diseases caused more deaths than the battle wounds.'
            ],
            'golden-age': [
                '1928 Alexander Fleming discovered Penicillin, which is the first antibiotic discovered.'
            ],
            'follow-on': [
                'This period refers to the introduction of medications that are similar to pre-existing drugs.'
            ],
            'discovery-void': [
                '2000 WHO declares AMR "a global public health concern".'
            ]
        };
        return descriptions[periodId] || [];
    }

    getPeriodDescription(periodId) {
        const descriptions = {
            'pre-antibiotic': '1900 One of the main cause of death were attributable to infectious diseases.</br></br>1909 Paul Ehrlich team discovered Salvarsan, which was active against syphilis.</br>1914-1918 During the WWI infectious diseases caused more deaths than the battle wounds.',
            'golden-age': '1928 Alexander Fleming discovered Penicillin, which is the first antibiotic discovered.',
            'follow-on': 'This period refers to the introduction of medications that are similar to pre-existing drugs.',
            'discovery-void': '2000 WHO declares AMR "a global public health concern".'
        };
        return descriptions[periodId] || '';
    }

    addHoverEffects(circle, g, x, highestY, antibioticName) {
        let tooltip = null;

        circle
            .on('mouseenter', function(event, d) {
                d3.select(this).classed('hovered', true);

                tooltip = g.append('text')
                    .attr('class', 'antibiotic-tooltip')
                    .attr('x', x)
                    .attr('y', highestY - 16)
                    .attr('text-anchor', 'start')
                    .text(antibioticName);
            })
            .on('mouseleave', function(event, d) {
                d3.select(this).classed('hovered', false);

                if (tooltip) {
                    tooltip.remove();
                    tooltip = null;
                }
            });
    }

    setupMobileVisualization(g, width, height) {
        const yearLabelX = 0;
        const circlesStartX = 60;
        const circleSettings = this.getResponsiveCircleSettings(width);
        
        const yearScale = d3.scaleLinear()
            .domain([1900, 2030])
            .range([0, height - 300]);

        const years = d3.range(1900, 2031, 10);
        g.selectAll('.year-label')
            .data(years)
            .enter()
            .append('text')
            .attr('class', 'timeline-year-label')
            .attr('x', yearLabelX)
            .attr('y', d => yearScale(d))
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'middle')
            .text(d => d);

        this.groupedData.forEach((antibiotics, year) => {
            const y = yearScale(year);
            
            antibiotics.forEach((antibiotic, index) => {
                const x = circlesStartX + (index * (circleSettings.radius * 2 + this.config.circleMinDistance));
                
                g.append('circle')
                    .attr('class', 'antibiotic-circle')
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', circleSettings.radius);
            });
        });
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

    refresh() {
        if (this.initialized && this.data) {
            this.setupVisualization();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof d3 === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
        script.onload = () => {
            window.timelineVizHandler = new TimelineVizHandler();
        };
        document.head.appendChild(script);
    } else {
        window.timelineVizHandler = new TimelineVizHandler();
    }
});

window.TimelineVizHandler = TimelineVizHandler;

window.addEventListener('load', () => {
    window.timelineVizHandler = new TimelineVizHandler();
});

if (document.readyState !== 'loading') {
    window.timelineVizHandler = new TimelineVizHandler();
}