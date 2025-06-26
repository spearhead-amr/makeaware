// widget-timeline.js - Timeline visualization for antibiotic discovery

class TimelineVizHandler {
    constructor() {
        this.container = document.querySelector('#widget-timeline-viz .viz-container');
        this.widgetElement = document.getElementById('widget-timeline-viz');
        this.data = null;
        this.svg = null;
        this.initialized = false;
        
        // Configuration for responsive design
        this.config = {
            margin: { top: 80, right: 0, bottom: 100, left: 0 },
            desktopHorizontalMargin: 16, // 1rem = 16px typically
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
        
        // Track active popup and widget state
        this.activePopupId = null;
        this.isWidgetActive = false;
        this.scrollHandler = null;
        this.lastPopupChangeTime = 0;
        this.popupChangeDelay = 500; // 500ms delay between popup changes
        
        this.mobileCircles = [];
        this.mobileLabels = [];
        this.activeMobileIndex = 0;
        this.lastMobileScroll = 0;
         // pixel di scroll per avanzare di uno (modificabile)
        
        // Variabili per scroll step dinamico
        this.mobileScrollStepPxMax = 8; // px se solo 1 cerchio in riga
        this.mobileScrollStepPxMin = 1;  // px se riga più affollata
        
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
            this.setupWidgetStateWatcher();
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
            CSVLoadedTrigger(); // call the "components-render.js" file after loading the csv and generated d3 graph

            
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

    isDesktop() {
        return window.innerWidth >= this.breakpoints.desktop;
    }

    getResponsiveCircleSettings(width) {
        const minRadius = 4;
        const maxRadius = 6;
        const minSpacing = 8;
        const maxSpacing = 16;
        
        const radius = Math.max(minRadius, Math.min(maxRadius, width / 200));
        const spacing = minSpacing + ((radius - minRadius) / (maxRadius - minRadius)) * (maxSpacing - minSpacing);
        
        return { radius: radius, spacing: spacing };
    }

    calculateDimensions() {
        const containerWidth = this.container.offsetWidth || window.innerWidth - 40;
        const isMobile = this.isMobile();
        const isDesktop = this.isDesktop();
        
        if (isMobile) {
            const width = containerWidth;
            const height = 1800;
            return { width, height, isMobile, isDesktop };
        } else {
            // For desktop, reduce width to account for horizontal margins
            let width = containerWidth;
            if (isDesktop) {
                width = containerWidth - (this.config.desktopHorizontalMargin * 2);
            }
            const height = 600;
            return { width, height, isMobile, isDesktop };
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
            .attr('viewBox', '0 0 ' + (dimensions.width + (dimensions.isDesktop ? this.config.desktopHorizontalMargin * 2 : 0)) + ' ' + dimensions.height)
            .style('display', 'block');

        // For desktop, translate the main group to center with margins
        const translateX = dimensions.isDesktop ? this.config.desktopHorizontalMargin : 0;
        const g = this.svg.append('g')
            .attr('transform', 'translate(' + (this.config.margin.left + translateX) + ',' + this.config.margin.top + ')');

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

        // Create period titles and descriptions
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

        const requiredHeight = maxContentBottom + this.config.margin.bottom + 40;
        const currentHeight = height + this.config.margin.top + this.config.margin.bottom;
        
        if (requiredHeight > currentHeight) {
            const newTotalHeight = requiredHeight;
            this.svg.attr('height', newTotalHeight)
                   .attr('viewBox', '0 0 ' + (width + (this.isDesktop() ? this.config.desktopHorizontalMargin * 2 : 0)) + ' ' + newTotalHeight);
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
                    this.addHoverEffects(circle, g, x, globalHighestY, antibiotic.releaseDate, antibiotic.antibiotic);
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
        
        const tempText = g.append('text')
            .attr('class', 'timeline-period-title')
            .style('opacity', 0);
        
        words.forEach((word, wordIndex) => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            tempText.text(testLine);
            const textWidth = tempText.node().getBBox().width;
            
            if (textWidth > maxWidth && currentLine !== '') {
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
        
        if (currentLine) {
            textElement.append('tspan')
                .attr('x', x)
                .attr('dy', lineCount === 0 ? 0 : '1.4em')
                .text(currentLine);
            lineCount++;
        }
        
        tempText.remove();
        
        const lineHeight = 20;
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
            
            const tempText = g.append('text')
                .attr('class', 'timeline-period-description')
                .style('opacity', 0);
            
            words.forEach((word, wordIndex) => {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                tempText.text(testLine);
                const textWidth = tempText.node().getBBox().width;
                
                if (textWidth > maxWidth && currentLine !== '') {
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
            
            if (currentLine) {
                textElement.append('tspan')
                    .attr('x', x)
                    .attr('dy', lineCount === 0 ? 0 : '1.4em')
                    .text(currentLine);
                lineCount++;
            }
            
            tempText.remove();
            
            const lineHeight = 18;
            const paragraphHeight = lineCount * lineHeight;
            const paragraphSpacing = 24;
            
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
                '1928 Alexander Fleming discovered Penicillin, which is the first antibiotic discovered.',
                '1940 Penicillin resistance was identified, before it was approved for the clinical trial.',
                'Beginning of Fourties Selman Walksman started classical screening programmes for detection of new antibiotics.'
            ],
            'follow-on': [
                'This period refers to the introduction of medications that are similar to a pre-existing drugs, differing for some aspects but used for the same therapeutic purposes',
                '1970-1980 Over 60 antibiotics are realised on the market.'
            ],
            'discovery-void': [
                '2001 WHO declears AMR "a global pubblic health concern".',
                'Since 2017 only 12 antibiotics have been approved, 10 of which belong to existing mechanisms of antimicrobial resistance (AMR).'
            ]
        };
        return descriptions[periodId] || [];
    }

    addHoverEffects(circle, g, x, highestY, releaseDate, antibioticName) {
        let tooltip = null;

        circle
            .on('mouseenter', function(event, d) {
                d3.select(this).classed('hovered', true);

                // Create tooltip with "Year — Name" format
                const tooltipText = releaseDate + ' — ' + antibioticName;
                
                tooltip = g.append('text')
                    .attr('class', 'antibiotic-tooltip')
                    .attr('x', x)
                    .attr('y', highestY - 16)
                    .attr('text-anchor', 'middle')
                    .text(tooltipText);
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
        // Add regular year markers (every 10 years)
        const years = d3.range(1900, 2031, 10);
        g.selectAll('.year-label')
            .data(years)
            .enter()
            .append('text')
            .attr('class', 'timeline-year-label')
            .attr('x', yearLabelX)
            .attr('y', d => {
                const y = yearScale(d);
                return y;
            })
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'middle')
            .text(d => d);
        // --- Nuova logica: highlight e testo solo per il cerchio attivo, ordine per data crescente ---
        this.mobileCircles = [];
        this.mobileLabels = [];
        // Ordina i dati per releaseDate crescente (data min -> max)
        let sortedData = this.data.slice().sort((a, b) => a.releaseDate - b.releaseDate || a.antibiotic.localeCompare(b.antibiotic));
        // List of popup triggers (real and virtual years)
        // Add a virtual trigger before 1900 to hide all popups when highlight is before the timeline
        const popupTriggers = [
            { year: 1890, popupId: null }, // virtual: before timeline, no popup
            { year: 1900, popupId: 'timeline-popup1' },
            { year: 1909, popupId: 'timeline-popup2' },
            { year: 1914, popupId: 'timeline-popup3' },
            { year: 1928, popupId: 'timeline-popup4' },
            { year: 1940, popupId: 'timeline-popup5' },
            { year: 1943, popupId: 'timeline-popup6' },
            { year: 1960, popupId: 'timeline-popup7' },
            { year: 1970, popupId: 'timeline-popup8' },
            { year: 2001, popupId: 'timeline-popup9' },
            { year: 2017, popupId: 'timeline-popup10' }
        ];
        // Find all real years already present in the data
        const realYears = new Set(sortedData.map(d => d.releaseDate));
        // Add virtual dots for triggers that do not already have a real dot
        popupTriggers.forEach(trigger => {
            if (!realYears.has(trigger.year)) {
                sortedData.push({ antibiotic: null, releaseDate: trigger.year, isVirtual: true });
            }
        });
        // Re-sort the sequence including virtual dots
        sortedData = sortedData.sort((a, b) => a.releaseDate - b.releaseDate || (a.antibiotic || '').localeCompare(b.antibiotic || ''));
        // Group by Y (releaseDate)
        const yMap = new Map();
        sortedData.forEach((antibiotic, i) => {
            const y = yearScale(antibiotic.releaseDate);
            if (!yMap.has(y)) yMap.set(y, []);
            yMap.get(y).push({ ...antibiotic, i });
        });
        // Compute the max X for each row (for label alignment)
        const rowMaxX = new Map();
        yMap.forEach((row, y) => {
            rowMaxX.set(y, circlesStartX + ((row.length - 1) * (circleSettings.radius * 2 + this.config.circleMinDistance)));
        });
        // Create circles and labels for each antibiotic or virtual dot
        sortedData.forEach((antibiotic, i) => {
            const y = yearScale(antibiotic.releaseDate);
            // Find the index in the row for this dot
            const row = yMap.get(y);
            const idx = row.findIndex(d => d.antibiotic === antibiotic.antibiotic && d.isVirtual === antibiotic.isVirtual);
            const x = circlesStartX + (idx * (circleSettings.radius * 2 + this.config.circleMinDistance));
            // Create the circle
            // If it's a virtual dot, add the 'virtual' class so it can be hidden via CSS
            const circle = g.append('circle')
                .attr('class', 'antibiotic-circle' + (antibiotic.isVirtual ? ' virtual' : ''))
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', circleSettings.radius)
                .classed('active', i === 0);
            this.mobileCircles.push(circle);
            // Label: only if not virtual
            if (!antibiotic.isVirtual) {
                // Create label with "Year — Name" format for mobile too
                const labelText = antibiotic.releaseDate + ' — ' + antibiotic.antibiotic;
                
                const label = g.append('text')
                    .attr('class', 'mobile-antibiotic-name')
                    .attr('x', rowMaxX.get(y) + circleSettings.radius + 10)
                    .attr('y', y + 4)
                    .attr('text-anchor', 'start')
                    .style('opacity', i === 0 ? 1 : 0)
                    .text(labelText);
                this.mobileLabels.push(label);
            } else {
                // Virtual dot: no label, but keep a placeholder for highlight logic
                this.mobileLabels.push({ style: () => {} });
            }
        });
        this.activeMobileIndex = 0;
        this.lastMobileScroll = window.pageYOffset || document.documentElement.scrollTop;
        // Highlight order: increasing date (including virtual dots)
        this._mobileOrder = sortedData.map((d, i) => ({ ...d, i }));
    }

    setupWidgetStateWatcher() {
        // Watch for widget state changes to enable/disable mobile scroll handler
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const wasActive = this.isWidgetActive;
                    this.isWidgetActive = this.widgetElement && this.widgetElement.classList.contains('active');
                    
                    // Only setup/teardown scroll handler when state actually changes
                    if (wasActive !== this.isWidgetActive) {
                        if (this.isWidgetActive && this.isMobile()) {
                            this.setupMobileScrollHandler();
                        } else {
                            this.teardownMobileScrollHandler();
                        }
                    }
                }
            });
        });

        if (this.widgetElement) {
            observer.observe(this.widgetElement, { attributes: true });
        }
        
        // Initial state check
        this.isWidgetActive = this.widgetElement && this.widgetElement.classList.contains('active');
    }

    setupMobileScrollHandler() {
        this.teardownMobileScrollHandler();
        // Use the same popupTriggers array as in setupMobileVisualization
        const popupTriggers = [
            { year: 1890, popupId: null }, // virtual: before timeline, no popup
            { year: 1900, popupId: 'timeline-popup1' },
            { year: 1909, popupId: 'timeline-popup2' },
            { year: 1914, popupId: 'timeline-popup3' },
            { year: 1928, popupId: 'timeline-popup4' },
            { year: 1940, popupId: 'timeline-popup5' },
            { year: 1943, popupId: 'timeline-popup6' },
            { year: 1960, popupId: 'timeline-popup7' },
            { year: 1970, popupId: 'timeline-popup8' },
            { year: 2001, popupId: 'timeline-popup9' },
            { year: 2017, popupId: 'timeline-popup10' }
        ];
        // Function to find the active popup given the current year
        function getActivePopup(year) {
            let lastPopup = null;
            for (let i = 0; i < popupTriggers.length; i++) {
                if (year < popupTriggers[i].year) break;
                lastPopup = popupTriggers[i].popupId;
            }
            return lastPopup;
        }
        this.scrollHandler = () => {
            // If the widget is not active (overlay closed or user is exiting), always hide any popup
            if (!this.isWidgetActive) {
                this.hideCurrentPopup();
                return;
            }
            if (!this.isMobile() || !this.mobileCircles || this.mobileCircles.length === 0) return;
            const scrollContainer = this.widgetElement.querySelector('.frame') || window;
            const scrollTop = scrollContainer.scrollTop !== undefined ? scrollContainer.scrollTop : window.pageYOffset || document.documentElement.scrollTop;
            const delta = scrollTop - this.lastMobileScroll;
            // Local density for dynamic step (as before)
            const allCy = this.mobileCircles.map(c => parseFloat(c.attr('cy')));
            const currentCy = allCy[this.activeMobileIndex];
            let localCount = 1;
            for (let i = 0; i < allCy.length; i++) {
                if (i !== this.activeMobileIndex && Math.abs(allCy[i] - currentCy) < 20) {
                    localCount++;
                }
            }
            let maxLocalCount = 1;
            for (let i = 0; i < allCy.length; i++) {
                let count = 1;
                for (let j = 0; j < allCy.length; j++) {
                    if (i !== j && Math.abs(allCy[j] - allCy[i]) < 20) {
                        count++;
                    }
                }
                if (count > maxLocalCount) maxLocalCount = count;
            }
            let stepPx = this.mobileScrollStepPxMax;
            if (maxLocalCount > 1) {
                stepPx = this.mobileScrollStepPxMax - (this.mobileScrollStepPxMax - this.mobileScrollStepPxMin) * ((localCount - 1) / (maxLocalCount - 1));
            }
            let step = Math.floor(Math.abs(delta) / stepPx);
            if (step < 1) return;
            const dir = delta > 0 ? 1 : -1;
            let newIndex = this.activeMobileIndex + dir * step;
            newIndex = Math.max(0, Math.min(this.mobileCircles.length - 1, newIndex));
            if (newIndex !== this.activeMobileIndex) {
                this.mobileCircles[this.activeMobileIndex].classed('active', false);
                this.mobileLabels[this.activeMobileIndex].style('opacity', 0);
                this.mobileCircles[newIndex].classed('active', true);
                this.mobileLabels[newIndex].style('opacity', 1);
                this.activeMobileIndex = newIndex;
            }
            this.lastMobileScroll = scrollTop;
            // --- Popup logic: stays active until the next trigger ---
            const currentData = this._mobileOrder[this.activeMobileIndex];
            const currentYear = currentData.releaseDate;
            // If scrolling up before the first trigger, hide the first popup (so intro title is visible)
            if (currentYear < popupTriggers[0].year) {
                this.hideCurrentPopup();
                return;
            }
            const popupToShow = getActivePopup(currentYear);
            if (popupToShow !== this.activePopupId) {
                if (popupToShow) {
                    this.showPopup(popupToShow);
                } else {
                    this.hideCurrentPopup();
                }
            }
        };
        const scrollContainer = this.widgetElement.querySelector('.frame') || window;
        scrollContainer.addEventListener('scroll', this.scrollHandler, { passive: true });
    }

    teardownMobileScrollHandler() {
        if (this.scrollHandler) {
            const scrollContainer = this.widgetElement.querySelector('.frame') || window;
            scrollContainer.removeEventListener('scroll', this.scrollHandler);
            this.scrollHandler = null;
        }
        
        // Reset popup change timing when tearing down
        this.lastPopupChangeTime = 0;
        
        // Hide any active popup when tearing down
        this.hideCurrentPopup();
    }

    showPopup(popupId) {
        // Hide current popup first
        this.hideCurrentPopup();
        
        // Show new popup
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.classList.add('visible');
            this.activePopupId = popupId;
        }
    }
    
    hideCurrentPopup() {
        if (this.activePopupId) {
            const currentPopup = document.getElementById(this.activePopupId);
            if (currentPopup) {
                currentPopup.classList.remove('visible');
            }
            this.activePopupId = null;
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
                    
                    // Teardown mobile handler if switching from mobile to desktop
                    const wasMobile = lastWidth <= this.breakpoints.mobile;
                    const isMobile = currentWidth <= this.breakpoints.mobile;
                    
                    if (wasMobile && !isMobile) {
                        this.teardownMobileScrollHandler();
                    } else if (!wasMobile && isMobile && this.isWidgetActive) {
                        this.setupMobileScrollHandler();
                    }
                    
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

// Global initialization
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
    if (!window.timelineVizHandler) {
        window.timelineVizHandler = new TimelineVizHandler();
    }
});

if (document.readyState !== 'loading' && !window.timelineVizHandler) {
    window.timelineVizHandler = new TimelineVizHandler();
}