// Listing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeMaps();
    initializeFilters();
    initializePropertyExpansion();
    initializeSecondExpandButton();

    initializePropertyCards();
    initializeInfiniteScroll();
    initializeSortDropdown();
    
    // Initialize default temperature chart
    setTimeout(() => {
        console.log('Region info panel initialized');
    }, 1000);
});

// Map initialization
let detailMap;
let propertyMarkers = [];
let selectedRegions = [];

function initializeMaps() {
    // Initialize detail map (top map)
    detailMap = L.map('detailMap').setView([43.7696, 11.2558], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(detailMap);

    // Add zoom level handler to manage popup visibility
    detailMap.on('zoomend', function() {
        updateLabelVisibility();
    });

    // Initialize SVG regions map
    initializeSVGRegions();

    // Add property markers to detail map
    addPropertyMarkers();
    
    // Initialize map expand functionality
    initializeMapExpand();
}

function addPropertyMarkers() {
    const properties = document.querySelectorAll('.property-card[data-lat][data-lng]');
    
    properties.forEach(property => {
        const lat = parseFloat(property.dataset.lat);
        const lng = parseFloat(property.dataset.lng);
        const title = property.querySelector('.property-title').textContent;
        const price = property.querySelector('.property-price-main').textContent;
        
        // Create custom marker with label
        const marker = L.marker([lat, lng]).addTo(detailMap);
        
        // Get property image
        const propertyImage = property.querySelector('.property-image img');
        const imageSrc = propertyImage ? propertyImage.src : 'pexels-pixabay-210017.jpg'; // fallback image
        
        // Create property label next to marker with both basic and enhanced content
        const basicContent = `
            <div class="property-label-content">
                <div class="property-label-title">${title}</div>
                <div class="property-label-price">${price}</div>
            </div>
        `;
        
        const enhancedContent = `
            <div class="property-label-content enhanced">
                <div class="popup-image">
                    <img src="${imageSrc}" alt="${title}" />
                </div>
                <div class="popup-content">
                    <div class="property-label-title">${title}</div>
                    <div class="property-label-price">${price}</div>
                </div>
            </div>
        `;
        
        const labelIcon = L.divIcon({
            className: 'property-label',
            html: basicContent,
            iconSize: [200, 50],
            iconAnchor: [0, 25],
            popupAnchor: [100, 0]
        });
        
        // Add label marker slightly offset from the main marker
        const labelMarker = L.marker([lat + 0.001, lng + 0.005], { 
            icon: labelIcon,
            interactive: false
        }).addTo(detailMap);
        
        propertyMarkers.push({marker, labelMarker, lat, lng, element: property});
        
        // Add click event to highlight property card
        marker.on('click', function() {
            highlightProperty(lat, lng);
        });
        
        // Add hover events to switch between basic and enhanced content
        marker.on('mouseover', function() {
            // Update label content to enhanced version
            const labelElement = labelMarker.getElement();
            if (labelElement) {
                // Find the property-label element (it might be the labelElement itself or a child)
                const propertyLabel = labelElement.classList.contains('property-label') 
                    ? labelElement 
                    : labelElement.querySelector('.property-label');
                
                if (propertyLabel) {
                    propertyLabel.innerHTML = enhancedContent;
                    propertyLabel.classList.add('enhanced');
                }
            }
            highlightPropertyCard(property);
        });
        
        marker.on('mouseout', function() {
            // Revert label content to basic version
            const labelElement = labelMarker.getElement();
            if (labelElement) {
                // Find the property-label element (it might be the labelElement itself or a child)
                const propertyLabel = labelElement.classList.contains('property-label') 
                    ? labelElement 
                    : labelElement.querySelector('.property-label');
                
                if (propertyLabel) {
                    propertyLabel.innerHTML = basicContent;
                    propertyLabel.classList.remove('enhanced');
                }
            }
            removePropertyCardHighlight(property);
        });
    });
}

function initializeSVGRegions() {
    const svgElement = document.getElementById('italy-svg-map');
    
    if (!svgElement) {
        console.error('Italy SVG map element not found');
        return;
    }
    
    // More robust SVG loading with multiple fallback methods
    let svgLoadAttempts = 0;
    const maxAttempts = 5;
    
    function attemptSVGAccess() {
        svgLoadAttempts++;
        console.log(`SVG access attempt ${svgLoadAttempts}/${maxAttempts}`);
        
        try {
            // Method 1: Direct SVG element
            if (svgElement.tagName === 'svg') {
                console.log('Processing direct SVG element');
                processSVGRegions(svgElement, svgElement);
                return true;
            }
            
            // Method 2: Check if it's an iframe or object with contentDocument
            if (svgElement.contentDocument) {
                const svgDoc = svgElement.contentDocument;
                const svgRoot = svgDoc.querySelector('svg') || svgDoc.documentElement;
                
                if (svgRoot) {
                    console.log('Accessing SVG via contentDocument');
                    processSVGRegions(svgElement, svgDoc);
                    return true;
                }
            }
            
            // Method 3: Try contentWindow approach
            if (svgElement.contentWindow && svgElement.contentWindow.document) {
                const svgDoc = svgElement.contentWindow.document;
                const svgRoot = svgDoc.querySelector('svg') || svgDoc.documentElement;
                
                if (svgRoot) {
                    console.log('Accessing SVG via contentWindow');
                    processSVGRegions(svgElement, svgDoc);
                    return true;
                }
            }
            
            // Method 4: Try getting SVG data directly from src if possible
            if (svgElement.data || svgElement.src) {
                console.log('Attempting to load SVG via fetch');
                loadSVGViaFetch(svgElement.data || svgElement.src);
                return true;
            }
            
        } catch (error) {
            console.warn(`SVG access attempt ${svgLoadAttempts} failed:`, error);
        }
        
        return false;
    }
    
    // Load SVG via fetch as fallback
    function loadSVGViaFetch(svgUrl) {
        fetch(svgUrl)
            .then(response => response.text())
            .then(svgText => {
                // Create a temporary container to parse the SVG
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = svgText;
                const svgDoc = tempDiv.querySelector('svg');
                
                if (svgDoc) {
                    console.log('SVG loaded successfully via fetch');
                    // Replace the object with the actual SVG
                    svgElement.outerHTML = svgText;
                    
                    // Re-get the element and process it
                    setTimeout(() => {
                        const newSvgElement = document.getElementById('italy-svg-map');
                        if (newSvgElement) {
                            processSVGRegions(newSvgElement, newSvgElement);
                        }
                    }, 100);
                } else {
                    console.error('Failed to parse SVG from fetch response');
                }
            })
            .catch(error => {
                console.error('Failed to fetch SVG:', error);
                // Final fallback - try to access what we have
                tryFinalFallback();
            });
    }
    
    function tryFinalFallback() {
        console.log('Attempting final fallback...');
        // Try to work with whatever element we have
        try {
            processSVGRegions(svgElement, document);
        } catch (error) {
            console.error('All SVG loading methods failed:', error);
        }
    }
    
    // Initial attempt
    if (!attemptSVGAccess()) {
        // Setup event listeners for deferred loading
        svgElement.addEventListener('load', function() {
            console.log('SVG load event fired');
            setTimeout(() => {
                if (!attemptSVGAccess() && svgLoadAttempts < maxAttempts) {
                    setTimeout(attemptSVGAccess, 500);
                }
            }, 100);
        });
        
        svgElement.addEventListener('error', function() {
            console.error('SVG error event fired');
            tryFinalFallback();
        });
        
        // Periodic retry mechanism
        const retryInterval = setInterval(() => {
            if (svgLoadAttempts >= maxAttempts) {
                clearInterval(retryInterval);
                console.warn('Maximum SVG loading attempts reached');
                tryFinalFallback();
                return;
            }
            
            if (attemptSVGAccess()) {
                clearInterval(retryInterval);
            }
        }, 800);
        
        // Final timeout
        setTimeout(() => {
            clearInterval(retryInterval);
            if (svgLoadAttempts < maxAttempts) {
                console.warn('SVG loading timeout reached, attempting final fallback');
                tryFinalFallback();
            }
        }, 5000);
    }
}

function processSVGRegions(svgContainer, svgDoc) {
    try {
        if (!svgDoc) {
            console.error('SVG document is null or undefined');
            return;
        }
        
        // Region mapping from NUTS2 codes to Czech names
        const regionMapping = {
            'ITC1': { name: 'Piemonte', czech: 'Piemont' },
            'ITC2': { name: 'Valle d\'Aosta', czech: 'Aosta' },
            'ITC3': { name: 'Liguria', czech: 'Ligurie' },
            'ITC4': { name: 'Lombardia', czech: 'Lombardie' },
            'ITD1': { name: 'Provincia Autonoma di Bolzano', czech: 'Bolzano' },
            'ITD2': { name: 'Provincia Autonoma di Trento', czech: 'Trento' },
            'ITD3': { name: 'Veneto', czech: 'Benátsko' },
            'ITD4': { name: 'Friuli-Venezia Giulia', czech: 'Friuli' },
            'ITD5': { name: 'Emilia-Romagna', czech: 'Emilia-Romagna' },
            'ITE1': { name: 'Toscana', czech: 'Toskánsko' },
            'ITE2': { name: 'Umbria', czech: 'Umbrie' },
            'ITE3': { name: 'Marche', czech: 'Marche' },
            'ITE4': { name: 'Lazio', czech: 'Lazio' },
            'ITF1': { name: 'Abruzzo', czech: 'Abruzzo' },
            'ITF2': { name: 'Molise', czech: 'Molise' },
            'ITF3': { name: 'Campania', czech: 'Kampánie' },
            'ITF4': { name: 'Puglia', czech: 'Apulie' },
            'ITF5': { name: 'Basilicata', czech: 'Basilicata' },
            'ITF6': { name: 'Calabria', czech: 'Kalábrie' },
            'ITG1': { name: 'Sicilia', czech: 'Sicílie' },
            'ITG2': { name: 'Sardegna', czech: 'Sardinie' }
        };
        
        // Region data with stats and enhanced color data for main regions
        const regionStats = {
            'ITE1': { // Toscana
                seaTemp: '22°C',
                priceLevel: 3,
                distance: '1,240 km',
                temperatures: [8, 10, 14, 17, 22, 26, 29, 29, 25, 19, 13, 9],
                propertyCount: 45,
                avgPrice: 420000
            },
            'ITC4': { // Lombardia
                seaTemp: 'Bez moře',
                priceLevel: 4,
                distance: '890 km',
                temperatures: [4, 7, 12, 16, 21, 25, 28, 27, 23, 17, 10, 5],
                propertyCount: 38,
                avgPrice: 485000
            },
            'ITD3': { // Veneto
                seaTemp: '21°C',
                priceLevel: 3,
                distance: '950 km',
                temperatures: [5, 8, 13, 17, 22, 26, 28, 28, 24, 18, 11, 6],
                propertyCount: 32,
                avgPrice: 365000
            },
            'ITF3': { // Campania
                seaTemp: '24°C',
                priceLevel: 2,
                distance: '1,580 km',
                temperatures: [11, 12, 15, 18, 23, 27, 30, 30, 26, 21, 16, 12],
                propertyCount: 28,
                avgPrice: 285000
            },
            'ITC1': { // Piemonte
                seaTemp: 'Bez moře',
                priceLevel: 3,
                distance: '1,100 km',
                temperatures: [3, 6, 11, 15, 20, 24, 27, 26, 22, 16, 9, 4],
                propertyCount: 22,
                avgPrice: 195000
            },
            'ITC3': { // Liguria
                seaTemp: '20°C',
                priceLevel: 3,
                distance: '1,200 km',
                temperatures: [9, 10, 13, 16, 20, 24, 27, 27, 24, 19, 14, 10],
                propertyCount: 18,
                avgPrice: 445000
            },
            'ITD5': { // Emilia-Romagna
                seaTemp: '22°C',
                priceLevel: 3,
                distance: '1,050 km',
                temperatures: [4, 7, 12, 16, 21, 25, 28, 27, 23, 17, 10, 5],
                propertyCount: 25,
                avgPrice: 325000
            },
            'ITG1': { // Sicilia
                seaTemp: '25°C',
                priceLevel: 2,
                distance: '1,850 km',
                temperatures: [14, 15, 17, 20, 24, 28, 31, 31, 28, 24, 19, 16],
                propertyCount: 35,
                avgPrice: 225000
            },
            'ITG2': { // Sardegna
                seaTemp: '24°C',
                priceLevel: 2,
                distance: '1,650 km',
                temperatures: [12, 13, 15, 18, 22, 26, 29, 29, 26, 22, 17, 14],
                propertyCount: 20,
                avgPrice: 315000
            }
        };

        // Uniform color scheme - no enhanced palette needed
        console.log('Using uniform color scheme for SVG regions');
        
        // Apply uniform color scheme to all regions
        const regionPaths = svgDoc.querySelectorAll('path[data-nuts2]') || [];
        
        // Also try to get any paths we identified during processing
        const allPaths = svgDoc.querySelectorAll('path') || [];
        
        // Combine both sets and remove duplicates
        const pathsToStyle = new Set([...regionPaths, ...allPaths]);
        
        pathsToStyle.forEach(path => {
            // Apply uniform styling to all paths
            path.style.fill = '#e8f5e8';
            path.style.stroke = '#3E6343';
            path.style.strokeWidth = '1';
            path.style.cursor = 'pointer';
            path.style.transition = 'all 0.3s ease';
        });
        
        // Style the SVG with base styles
        if (svgDoc.createElementNS) {
            // Object-based SVG - create style element in SVG document
            const style = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'style');
            style.textContent = `
                path[data-nuts2]:hover {
                    filter: brightness(1.1);
                    stroke-width: 1.5;
                }
                path[data-nuts2].selected {
                    stroke: #2d4a32;
                    stroke-width: 2;
                    filter: brightness(0.8);
                }
            `;
            // Try to append to head, or to SVG root if no head exists
            if (svgDoc.head) {
                svgDoc.head.appendChild(style);
            } else {
                const svgRoot = svgDoc.querySelector('svg') || svgDoc.documentElement;
                if (svgRoot) {
                    svgRoot.insertBefore(style, svgRoot.firstChild);
                }
            }
        } else {
            // Inline SVG - add styles to main document
            let existingStyle = document.getElementById('italy-svg-styles');
            if (!existingStyle) {
                const style = document.createElement('style');
                style.id = 'italy-svg-styles';
                style.textContent = `
                    #italy-svg-map path[data-nuts2]:hover {
                        filter: brightness(1.1);
                        stroke-width: 1.5;
                    }
                    #italy-svg-map path[data-nuts2].selected {
                        stroke: #2d4a32;
                        stroke-width: 2;
                        filter: brightness(0.8);
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Try multiple selectors to find regions
        let regions = null;
        
        // Try different approaches to find the regions
        try {
            regions = svgDoc.querySelectorAll('path[data-nuts2]');
            
            if (!regions || regions.length === 0) {
                // Try without data-nuts2 attribute
                regions = svgDoc.querySelectorAll('path[id]');
                console.log('Trying path[id] selector, found:', regions.length);
            }
            
            if (!regions || regions.length === 0) {
                // Try all paths
                regions = svgDoc.querySelectorAll('path');
                console.log('Trying all paths, found:', regions.length);
            }
            
            if (!regions || regions.length === 0) {
                // Try in the main document if svgDoc doesn't work
                regions = document.querySelectorAll('#italy-svg-map path');
                console.log('Trying main document selector, found:', regions.length);
            }
        } catch (error) {
            console.error('Error querying SVG elements:', error);
            regions = [];
        }
        
        if (!regions || regions.length === 0) {
            console.warn('No regions found in SVG');
            console.log('SVG document:', svgDoc);
            console.log('Available elements:', svgDoc ? svgDoc.children : 'No svgDoc');
            return;
        }
        
        console.log(`Found ${regions.length} regions to process`);
        
        regions.forEach(path => {
            // Try multiple ways to identify the region
            let nuts2 = path ? path.getAttribute('data-nuts2') : null;
            
            // If no data-nuts2, try to map from id attribute
            if (!nuts2 && path) {
                const pathId = path.getAttribute('id') || path.getAttribute('class');
                
                // Try to map common ID patterns to NUTS2 codes
                if (pathId) {
                    const idMapping = {
                        'toscana': 'ITE1',
                        'tuscany': 'ITE1',
                        'lombardia': 'ITC4',
                        'lombardy': 'ITC4',
                        'veneto': 'ITD3',
                        'campania': 'ITF3',
                        'piemonte': 'ITC1',
                        'piedmont': 'ITC1',
                        'liguria': 'ITC3',
                        'emilia-romagna': 'ITD5',
                        'sicilia': 'ITG1',
                        'sicily': 'ITG1',
                        'sardegna': 'ITG2',
                        'sardinia': 'ITG2'
                    };
                    
                    const lowerPathId = pathId.toLowerCase();
                    nuts2 = idMapping[lowerPathId] || 
                           Object.keys(idMapping).find(key => lowerPathId.includes(key)) ? 
                           idMapping[Object.keys(idMapping).find(key => lowerPathId.includes(key))] : null;
                    
                    if (nuts2) {
                        console.log(`Mapped path ID "${pathId}" to NUTS2 "${nuts2}"`);
                        // Add the data-nuts2 attribute for future reference
                        path.setAttribute('data-nuts2', nuts2);
                    }
                }
            }
            
            if (!nuts2) {
                // Skip paths that we can't identify
                return;
            }
            
            const regionInfo = regionMapping[nuts2];
            
            if (regionInfo) {
                // Add tooltip with region name
                path.setAttribute('title', regionInfo.czech);
                
                // Add click handler for region selection
                path.addEventListener('click', function() {
                    const nuts2 = this.getAttribute('data-nuts2');
                    const regionInfo = regionMapping[nuts2];
                    
                    if (!regionInfo) return;
                    
                    const regionData = {
                        name: regionInfo.czech,
                        value: nuts2.toLowerCase(),
                        stats: regionStats[nuts2] || {
                            seaTemp: 'N/A',
                            priceLevel: 2,
                            distance: 'N/A',
                            temperatures: [10, 12, 15, 18, 22, 26, 28, 28, 24, 20, 15, 11]
                        }
                    };
                    
                    toggleRegionSelection(regionData);
                    if (regionStats[nuts2]) {
                        updateRegionInfoPanel(regionData);
                    }
                    
                    // Navigate to region on top map
                    navigateToRegionOnMap(nuts2);
                });
                
                // Add hover handler for region info preview
                path.addEventListener('mouseenter', function() {
                    const nuts2 = this.getAttribute('data-nuts2');
                    const regionInfo = regionMapping[nuts2];
                    
                    if (!regionInfo) return;
                    
                    const regionData = {
                        name: regionInfo.czech,
                        value: nuts2.toLowerCase(),
                        stats: regionStats[nuts2] || {
                            seaTemp: 'N/A',
                            priceLevel: 2,
                            distance: 'N/A',
                            temperatures: [10, 12, 15, 18, 22, 26, 28, 28, 24, 20, 15, 11]
                        }
                    };
                    
                    if (regionStats[nuts2]) {
                        updateRegionInfoPanel(regionData);
                    }
                });
                
                // Add mouseleave handler to reset if no region is selected
                path.addEventListener('mouseleave', function() {
                    // Only reset if no regions are currently selected
                    if (selectedRegions.length === 0) {
                        resetRegionInfoPanel();
                    } else {
                        // Show info for the last selected region
                        const lastSelected = selectedRegions[selectedRegions.length - 1];
                        updateRegionInfoPanel(lastSelected);
                    }
                });
                
                // Store region data
                path.regionData = {
                    name: regionInfo.czech,
                    value: nuts2.toLowerCase(),
                    nuts2: nuts2
                };
            }
        });
        
        console.log('Italy SVG map initialized with', regions.length, 'regions');
    } catch (error) {
        console.error('Error processing SVG regions:', error);
    }
}

function toggleRegionSelection(region) {
    const index = selectedRegions.findIndex(r => r.value === region.value);
    
    if (index > -1) {
        selectedRegions.splice(index, 1);
    } else {
        selectedRegions.push(region);
    }
    
    updateSelectedRegionsDisplay();
    updateRegionPolygons();
}

function updateSelectedRegionsDisplay() {
    const countElement = document.querySelector('.region-count');
    countElement.textContent = `${selectedRegions.length} regionů vybráno`;
}

function updateRegionPolygons() {
    // Update SVG region styles based on selection
    const svgElement = document.getElementById('italy-svg-map');
    let svgDoc;
    
    if (svgElement.tagName === 'svg') {
        svgDoc = svgElement;
    } else {
        svgDoc = svgElement.contentDocument;
    }
    
    if (!svgDoc) return;
    
    const regions = svgDoc.querySelectorAll('path[data-nuts2]');
    
    regions.forEach(path => {
        if (path.regionData) {
            const isSelected = selectedRegions.some(r => r.value === path.regionData.value);
            
            if (isSelected) {
                path.classList.add('selected');
            } else {
                path.classList.remove('selected');
            }
        }
    });
}

function navigateToRegionOnMap(nuts2) {
    // Define region boundaries for zooming
    const regionBounds = {
        'ITE1': { // Toscana
            bounds: [[42.2, 9.6], [44.5, 12.4]],
            center: [43.35, 11.0],
            zoom: 8
        },
        'ITC4': { // Lombardia
            bounds: [[44.5, 8.5], [46.7, 11.2]],
            center: [45.6, 9.85],
            zoom: 8
        },
        'ITD3': { // Veneto
            bounds: [[44.8, 10.5], [46.8, 13.0]],
            center: [45.8, 11.75],
            zoom: 8
        },
        'ITF3': { // Campania
            bounds: [[39.8, 13.7], [41.5, 16.0]],
            center: [40.65, 14.85],
            zoom: 8
        },
        'ITC1': { // Piemonte
            bounds: [[44.0, 6.6], [46.5, 9.0]],
            center: [45.25, 7.8],
            zoom: 8
        },
        'ITC3': { // Liguria
            bounds: [[43.8, 7.4], [44.6, 10.1]],
            center: [44.2, 8.75],
            zoom: 8
        },
        'ITD5': { // Emilia-Romagna
            bounds: [[43.7, 9.2], [45.1, 12.8]],
            center: [44.4, 11.0],
            zoom: 8
        },
        'ITG1': { // Sicilia
            bounds: [[36.6, 12.4], [38.3, 15.7]],
            center: [37.45, 14.05],
            zoom: 8
        },
        'ITG2': { // Sardegna
            bounds: [[38.8, 8.1], [41.3, 9.9]],
            center: [40.05, 9.0],
            zoom: 8
        },
        'ITE4': { // Lazio
            bounds: [[40.8, 11.4], [42.8, 13.8]],
            center: [41.8, 12.6],
            zoom: 8
        },
        'ITF4': { // Puglia
            bounds: [[39.8, 14.9], [42.2, 18.5]],
            center: [41.0, 16.7],
            zoom: 8
        },
        'ITF6': { // Calabria
            bounds: [[37.9, 15.6], [40.1, 17.2]],
            center: [39.0, 16.4],
            zoom: 8
        }
    };
    
    const regionData = regionBounds[nuts2];
    
    if (regionData && detailMap) {
        // Smooth zoom to region
        detailMap.flyTo(regionData.center, regionData.zoom, {
            duration: 1.5,
            easeLinearity: 0.5
        });
        
        console.log(`Navigated to region ${nuts2} on top map`);
    } else {
        console.warn(`No bounds defined for region ${nuts2} or map not initialized`);
    }
}

function updateLabelVisibility() {
    if (!detailMap) return;
    
    const currentZoom = detailMap.getZoom();
    const hideLabelsZoom = 7; // Hide labels when zoom is 7 or less
    
    propertyMarkers.forEach(markerData => {
        if (markerData.labelMarker) {
            if (currentZoom <= hideLabelsZoom) {
                // Hide label marker
                markerData.labelMarker.setOpacity(0);
                const labelElement = markerData.labelMarker.getElement();
                if (labelElement) {
                    labelElement.style.visibility = 'hidden';
                    labelElement.style.pointerEvents = 'none';
                }
            } else {
                // Show label marker
                markerData.labelMarker.setOpacity(1);
                const labelElement = markerData.labelMarker.getElement();
                if (labelElement) {
                    labelElement.style.visibility = 'visible';
                    labelElement.style.pointerEvents = 'auto';
                }
            }
        }
    });
    
    console.log(`Zoom level: ${currentZoom}, Labels ${currentZoom <= hideLabelsZoom ? 'hidden' : 'visible'}`);
}

function initializeMapExpand() {
    const expandBtn = document.querySelector('.expand-map-btn');
    const mapsSection = document.querySelector('.maps-section');
    let isExpanded = false;
    
    if (!expandBtn || !mapsSection) {
        console.error('Map expand elements not found');
        return;
    }
    
    expandBtn.addEventListener('click', function() {
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            // Expand the map
            mapsSection.classList.add('map-expanded');
            expandBtn.classList.add('active');
            expandBtn.title = 'Zmenšit mapu';
            
            // Update the icon to show collapse
            expandBtn.querySelector('svg').innerHTML = `
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            `;
            
            console.log('Map expanded');
        } else {
            // Collapse the map
            mapsSection.classList.remove('map-expanded');
            expandBtn.classList.remove('active');
            expandBtn.title = 'Rozšířit mapu';
            
            // Update the icon to show expand
            expandBtn.querySelector('svg').innerHTML = `
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            `;
            
            console.log('Map collapsed');
        }
        
        // Trigger map resize after the transition
        setTimeout(() => {
            if (detailMap) {
                detailMap.invalidateSize();
                console.log('Map size invalidated');
            }
        }, 300);
    });
}

function highlightProperty(lat, lng) {
    const property = propertyMarkers.find(p => p.lat == lat && p.lng == lng);
    if (property) {
        // Scroll to property card
        property.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight effect
        property.element.classList.add('highlighted');
        setTimeout(() => {
            property.element.classList.remove('highlighted');
        }, 2000);
    }
}

function highlightPropertyCard(cardElement) {
    // Add hover highlight class
    cardElement.classList.add('map-hovered');
    
    // Scroll card into view if it's not visible
    const propertiesSection = document.querySelector('.properties-section');
    const cardRect = cardElement.getBoundingClientRect();
    const sectionRect = propertiesSection.getBoundingClientRect();
    
    // Check if card is not fully visible in the properties section
    if (cardRect.top < sectionRect.top || cardRect.bottom > sectionRect.bottom) {
        cardElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
}

function removePropertyCardHighlight(cardElement) {
    // Remove hover highlight class
    cardElement.classList.remove('map-hovered');
}

// Filter functionality
function initializeFilters() {
    // Property type buttons
    const typeButtons = document.querySelectorAll('.type-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            typeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Region dropdown
    const regionDropdownBtn = document.querySelector('.region-dropdown-btn');
    const regionDropdownMenu = document.querySelector('.region-dropdown-menu');
    const regionOptions = document.querySelectorAll('.region-dropdown-menu .dropdown-option');

    regionDropdownBtn.addEventListener('click', function() {
        const isActive = this.classList.contains('active');
        this.classList.toggle('active');
        regionDropdownMenu.classList.toggle('show');
    });

    regionOptions.forEach(option => {
        option.addEventListener('click', function() {
            const text = this.textContent;
            regionDropdownBtn.querySelector('.dropdown-text').textContent = text;
            regionDropdownBtn.classList.remove('active');
            regionDropdownMenu.classList.remove('show');
            
            // Update selection
            regionOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Room buttons
    const roomButtons = document.querySelectorAll('.room-btn');
    roomButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            roomButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });



    // Clear filters action
    const clearBtn = document.querySelector('.clear-filters-icon');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }

    // Add automatic filtering to all filter controls
    initializeAutomaticFiltering();

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!regionDropdownBtn.contains(e.target) && !regionDropdownMenu.contains(e.target)) {
            regionDropdownBtn.classList.remove('active');
            regionDropdownMenu.classList.remove('show');
        }
    });
}

function initializeAutomaticFiltering() {
    // Add event listeners for automatic filtering
    
    // Property type buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setTimeout(applyFilters, 50); // Small delay to ensure UI updates first
        });
    });
    
    // Room buttons
    document.querySelectorAll('.room-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setTimeout(applyFilters, 50);
        });
    });
    
    // Region dropdown options
    document.querySelectorAll('.dropdown-option').forEach(option => {
        option.addEventListener('click', function() {
            setTimeout(applyFilters, 50);
        });
    });
    
    // Amenity checkboxes
    document.querySelectorAll('.amenity-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            setTimeout(applyFilters, 50);
        });
    });
    
    // Price inputs (with debounce for better performance)
    const priceInputs = document.querySelectorAll('.price-input');
    priceInputs.forEach(input => {
        let timeoutId;
        input.addEventListener('input', function() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(applyFilters, 500); // 500ms debounce for price inputs
        });
    });
    
    // Search input (with debounce)
    const searchInput = document.querySelector('.property-search-input');
    if (searchInput) {
        let searchTimeoutId;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeoutId);
            searchTimeoutId = setTimeout(applyFilters, 300); // 300ms debounce for search
        });
    }
}

function applyFilters() {
    // Get selected filters
    const selectedType = document.querySelector('.type-btn.active')?.dataset.type;
    const selectedRegion = document.querySelector('.region-dropdown-menu .dropdown-option.selected')?.dataset.value;
    const selectedRooms = document.querySelector('.room-btn.active')?.dataset.rooms;
    const selectedAmenities = Array.from(document.querySelectorAll('.amenity-checkbox input:checked')).map(cb => cb.value);
    
    // Get search and price filters
    const searchTerm = document.querySelector('.property-search-input')?.value || '';
    const priceMin = document.querySelector('#priceMin')?.value || '';
    const priceMax = document.querySelector('#priceMax')?.value || '';

    // Filter properties (in real app, this would make API call)
    console.log('Auto-applying filters:', {
        type: selectedType,
        region: selectedRegion,
        rooms: selectedRooms,
        amenities: selectedAmenities,
        search: searchTerm,
        priceRange: { min: priceMin, max: priceMax }
    });

    // Simulate filtering with visual feedback
    const resultsCount = document.querySelector('.results-count');
    const hasActiveFilters = selectedAmenities.length > 0 || 
                           selectedRegion || 
                           searchTerm.length > 0 || 
                           priceMin || 
                           priceMax;
    
    // Update results count based on active filters
    let count = hasActiveFilters ? Math.floor(Math.random() * 40) + 15 : 124;
    resultsCount.textContent = `${count} nemovitostí`;
    
    // Show/hide clear filters button based on active filters
    const clearBtn = document.querySelector('.clear-filters-icon');
    if (clearBtn) {
        if (hasActiveFilters) {
            clearBtn.style.opacity = '1';
            clearBtn.style.visibility = 'visible';
        } else {
            clearBtn.style.opacity = '0.5';
            clearBtn.style.visibility = 'visible';
        }
    }
}

function clearFilters() {
    // Reset all filters
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.type-btn').classList.add('active');
    
    document.querySelector('.region-dropdown-btn .dropdown-text').textContent = 'Vyberte region';
    document.querySelectorAll('.region-dropdown-menu .dropdown-option').forEach(opt => opt.classList.remove('selected'));
    
    document.querySelectorAll('.room-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.room-btn').classList.add('active');
    
    document.querySelectorAll('.amenity-checkbox input').forEach(cb => cb.checked = false);
    
    // Clear search input
    const searchInput = document.querySelector('.property-search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Clear price inputs
    const priceMinInput = document.querySelector('#priceMin');
    const priceMaxInput = document.querySelector('#priceMax');
    if (priceMinInput) priceMinInput.value = '';
    if (priceMaxInput) priceMaxInput.value = '';
    
    // Reset results count
    document.querySelector('.results-count').textContent = '124 nemovitostí';
    
    // Hide clear button
    const clearBtn = document.querySelector('.clear-filters-icon');
    if (clearBtn) {
        clearBtn.style.opacity = '0.5';
    }
    
    console.log('All filters cleared');
}

// Property expansion functionality
function initializePropertyExpansion() {
    const expandBtn = document.querySelector('.expand-properties-btn');
    const propertiesSection = document.querySelector('.properties-section');
    const mapsSection = document.querySelector('.maps-section');

    expandBtn.addEventListener('click', function() {
        toggleExpansion();
    });
}

// Shared expansion toggle function
function toggleExpansion() {
    const propertiesSection = document.querySelector('.properties-section');
    const mapsSection = document.querySelector('.maps-section');
    const expandBtn = document.querySelector('.expand-properties-btn');
    const loadMoreBtn = document.querySelector('.load-more-btn');
    const isExpanded = propertiesSection.classList.contains('expanded');
    
    if (isExpanded) {
        // Collapse
        propertiesSection.classList.remove('expanded');
        mapsSection.classList.remove('collapsed');
        expandBtn.classList.remove('expanded');
        loadMoreBtn.classList.remove('expanded');
        expandBtn.title = 'Rozbalit přes mapy';
        loadMoreBtn.title = 'Rozšířit výběr';
    } else {
        // Expand
        propertiesSection.classList.add('expanded');
        mapsSection.classList.add('collapsed');
        expandBtn.classList.add('expanded');
        loadMoreBtn.classList.add('expanded');
        expandBtn.title = 'Zmenšit zobrazení';
        loadMoreBtn.title = 'Zmenšit zobrazení';
    }
}

// Region info panel functionality

function resetRegionInfoPanel() {
    const regionNameElement = document.querySelector('.selected-region-name');
    const regionSubtitleElement = document.querySelector('.region-info-subtitle');
    const seaTempElement = document.querySelector('.stat-value');
    const priceLevelElement = document.querySelectorAll('.stat-value')[1];
    const distanceElement = document.querySelectorAll('.stat-value')[2];
    const priceDotsContainer = document.querySelector('.price-indicators');
    
    // Reset to default state
    regionNameElement.textContent = 'Vyberte region';
    regionSubtitleElement.textContent = 'Klikněte na region pro zobrazení informací';
    
    // Reset statistics
    seaTempElement.textContent = '--°C';
    priceLevelElement.textContent = '--';
    distanceElement.textContent = '-- km';
    
    // Reset price dots
    const priceDots = priceDotsContainer.querySelectorAll('.price-dot');
    priceDots.forEach((dot) => {
        dot.classList.remove('active');
    });
}

function updateRegionInfoPanel(region) {
    const regionNameElement = document.querySelector('.selected-region-name');
    const regionSubtitleElement = document.querySelector('.region-info-subtitle');
    const seaTempElement = document.querySelector('.stat-value');
    const priceLevelElement = document.querySelectorAll('.stat-value')[1];
    const distanceElement = document.querySelectorAll('.stat-value')[2];
    const priceDotsContainer = document.querySelector('.price-indicators');
    
    // Update region name and subtitle
    regionNameElement.textContent = region.name;
    regionSubtitleElement.textContent = 'Informace o vybraném regionu';
    
    // Update statistics
    seaTempElement.textContent = region.stats.seaTemp + '°C';
    distanceElement.textContent = region.stats.distance + ' km';
    
    // Update price level
    const priceLevel = region.stats.priceLevel;
    const priceLabels = ['Nízká', 'Střední', 'Vysoká', 'Velmi vysoká'];
    priceLevelElement.textContent = priceLabels[priceLevel - 1] || 'Střední';
    
    // Update price dots
    const priceDots = priceDotsContainer.querySelectorAll('.price-dot');
    priceDots.forEach((dot, index) => {
        if (index < priceLevel) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function updateTemperatureChart(temperatures) {
    const canvas = document.getElementById('temperatureChart');
    if (!canvas) {
        console.error('Temperature chart canvas not found');
        return;
    }
    
    console.log('Updating temperature chart with data:', temperatures);
    
    const ctx = canvas.getContext('2d');
    
    // Clear existing chart
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Destroy existing chart if it exists
    if (window.temperatureChart && typeof window.temperatureChart.destroy === 'function') {
        window.temperatureChart.destroy();
    }
    
    try {
        window.temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čec', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'],
                datasets: [{
                    label: 'Teplota (°C)',
                    data: temperatures,
                    borderColor: '#3E6343',
                    backgroundColor: 'rgba(62, 99, 67, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3E6343',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 9
                            }
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            font: {
                                size: 9
                            },
                            callback: function(value) {
                                return value + '°C';
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Temperature chart created successfully');
    } catch (error) {
        console.error('Error creating temperature chart:', error);
    }
}

// Property card interactions
function initializePropertyCards() {
    const propertyCards = document.querySelectorAll('.property-card');
    
    propertyCards.forEach(card => {
        card.addEventListener('click', function() {
            // In real app, this would navigate to property detail page
            console.log('Navigate to property:', this.querySelector('.property-title').textContent);
        });
        
        // Prevent button clicks from triggering card click
        const btn = card.querySelector('.property-btn');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('Property button clicked');
            });
        }
    });
}

// Second expand button functionality (same as main expand button)
function initializeSecondExpandButton() {
    const expandBtn = document.querySelector('.load-more-btn');

    if (expandBtn) {
        expandBtn.addEventListener('click', function() {
            toggleExpansion();
        });
    }
}

// Infinite scroll functionality
let isLoading = false;
let currentPage = 1;
let hasMoreProperties = true;

function initializeInfiniteScroll() {
    const propertiesGrid = document.querySelector('.properties-grid');
    
    propertiesGrid.addEventListener('scroll', function() {
        // Check if user scrolled near the bottom (within 200px)
        if (propertiesGrid.scrollTop + propertiesGrid.clientHeight >= propertiesGrid.scrollHeight - 200) {
            loadMoreProperties();
        }
    });
}

function loadMoreProperties() {
    if (isLoading || !hasMoreProperties) return;
    
    isLoading = true;
    
    // Show loading indicator
    showLoadingIndicator();
    
    // Simulate API call delay
    setTimeout(() => {
        const newProperties = generateNewProperties();
        appendPropertiesToGrid(newProperties);
        
        // Update results count
        const currentCount = parseInt(document.querySelector('.results-count').textContent.replace(' nemovitostí', ''));
        document.querySelector('.results-count').textContent = `${currentCount + newProperties.length} nemovitostí`;
        
        currentPage++;
        
        // Stop loading more after 5 pages (simulate finite data)
        if (currentPage > 5) {
            hasMoreProperties = false;
        }
        
        hideLoadingIndicator();
        isLoading = false;
        
        // Re-initialize property cards for new elements
        initializeNewPropertyCards();
        
        // Update label visibility for new markers based on current zoom
        updateLabelVisibility();
        
    }, 1000); // Simulate network delay
}

function generateNewProperties() {
    const propertyTemplates = [
        {
            image: 'pexels-small-steps-898071686-19990849.jpg',
            title: 'Apartmán s výhledem na moře',
            price: '€380,000',
            location: 'Cinque Terre, Ligurie',
            type: 'Apartmán',
            rooms: '3 pokoje',
            bathrooms: '2 koupelny',
            area: '95 m²',
            region: 'Ligurie',
            lat: 44.1285,
            lng: 9.7073,
            locality: 'sea'
        },
        {
            image: 'pexels-josh-hild-1270765-2422259 (1).jpg',
            title: 'Historická vila v centru města',
            price: '€520,000',
            location: 'Siena, Toskánsko',
            type: 'Vila',
            rooms: '5 pokojů',
            bathrooms: '3 koupelny',
            area: '180 m²',
            region: 'Toskánsko',
            lat: 43.3188,
            lng: 11.3307,
            locality: 'mountains'
        },
        {
            image: 'pexels-mickyiaia34-709478.jpg',
            title: 'Moderní penthouse',
            price: '€650,000',
            location: 'Milano, Lombardie',
            type: 'Penthouse',
            rooms: '4 pokoje',
            bathrooms: '3 koupelny',
            area: '140 m²',
            region: 'Lombardie',
            lat: 45.4642,
            lng: 9.1900,
            locality: 'city'
        },
        {
            image: 'pexels-alexandre-moreira-2527876-32622895.jpg',
            title: 'Rodinný dům s bazénem',
            price: '€420,000',
            location: 'Amalfi, Kampánie',
            type: 'Dům',
            rooms: '4 pokoje',
            bathrooms: '2 koupelny',
            area: '160 m²',
            region: 'Kampánie',
            lat: 40.6340,
            lng: 14.6027,
            locality: 'sea'
        }
    ];
    
    // Return 2-4 random properties
    const count = Math.floor(Math.random() * 3) + 2;
    const selectedProperties = [];
    
    for (let i = 0; i < count; i++) {
        const template = propertyTemplates[Math.floor(Math.random() * propertyTemplates.length)];
        // Add some variation to the price
        const basePrice = parseInt(template.price.replace('€', '').replace(',', ''));
        const variation = Math.floor(Math.random() * 100000) - 50000;
        const newPrice = `€${(basePrice + variation).toLocaleString()}`;
        
        selectedProperties.push({
            ...template,
            price: newPrice,
            // Add slight variation to coordinates
            lat: template.lat + (Math.random() - 0.5) * 0.1,
            lng: template.lng + (Math.random() - 0.5) * 0.1
        });
    }
    
    return selectedProperties;
}

function appendPropertiesToGrid(properties) {
    const propertiesGrid = document.querySelector('.properties-grid');
    
    properties.forEach(property => {
        const propertyCard = createPropertyCard(property);
        propertiesGrid.appendChild(propertyCard);
    });
}

function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.setAttribute('data-lat', property.lat);
    card.setAttribute('data-lng', property.lng);
    
    const localityIcon = getLocalityIcon(property.locality);
    const regionBadgeHtml = `
        <div class="property-badge location ${property.locality}">
            ${localityIcon}
            ${property.region}
        </div>
    `;
    
    card.innerHTML = `
        <div class="property-image">
            <img src="${property.image}" alt="${property.title}">
            ${regionBadgeHtml}
            <div class="property-views">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                <span>${Math.floor(Math.random() * 2000) + 500}</span>
            </div>
            <div class="property-overlay-info">
                <div class="property-price-main">${property.price}</div>
            </div>
        </div>
        <div class="property-content">
            <h3 class="property-title">${property.title}</h3>
            <div class="property-details">
                <div class="detail-item type">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                    <span>${property.type}</span>
                </div>
                <div class="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V6H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
                    </svg>
                    <span>${property.rooms}</span>
                </div>
                <div class="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 10.78V8c0-1.65-1.35-3-3-3h-4c-.77 0-1.47.3-2 .78-.53-.48-1.23-.78-2-.78H6C4.35 5 3 6.35 3 8v2.78c-.61.55-1 1.34-1 2.22v6h2v-2h16v2h2v-6c0-.88-.39-1.67-1-2.22z"/>
                    </svg>
                    <span>${property.bathrooms}</span>
                </div>
                <div class="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>${property.area}</span>
                </div>
            </div>
            <button class="property-btn">Zobrazit detail</button>
        </div>
    `;
    
    return card;
}

function getLocalityIcon(locality) {
    const icons = {
        sea: '<svg class="locality-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>',
        mountains: '<svg class="locality-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/></svg>',
        city: '<svg class="locality-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>'
    };
    return icons[locality] || icons.city;
}

function initializeNewPropertyCards() {
    const newPropertyCards = document.querySelectorAll('.property-card:not([data-initialized])');
    
    newPropertyCards.forEach(card => {
        card.setAttribute('data-initialized', 'true');
        
        card.addEventListener('click', function() {
            console.log('Navigate to property:', this.querySelector('.property-title').textContent);
        });
        
        const btn = card.querySelector('.property-btn');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('Property button clicked');
            });
        }
        
        // Add marker to map for new property
        const lat = parseFloat(card.dataset.lat);
        const lng = parseFloat(card.dataset.lng);
        const title = card.querySelector('.property-title').textContent;
        const price = card.querySelector('.property-price-main').textContent;
        
        // Create custom marker with label
        const marker = L.marker([lat, lng]).addTo(detailMap);
        
        // Get property image
        const propertyImage = card.querySelector('.property-image img');
        const imageSrc = propertyImage ? propertyImage.src : 'pexels-pixabay-210017.jpg'; // fallback image
        
        // Create property label next to marker with both basic and enhanced content
        const basicContent = `
            <div class="property-label-content">
                <div class="property-label-title">${title}</div>
                <div class="property-label-price">${price}</div>
            </div>
        `;
        
        const enhancedContent = `
            <div class="property-label-content enhanced">
                <div class="popup-image">
                    <img src="${imageSrc}" alt="${title}" />
                </div>
                <div class="popup-content">
                    <div class="property-label-title">${title}</div>
                    <div class="property-label-price">${price}</div>
                </div>
            </div>
        `;
        
        const labelIcon = L.divIcon({
            className: 'property-label',
            html: basicContent,
            iconSize: [200, 50],
            iconAnchor: [0, 25],
            popupAnchor: [100, 0]
        });
        
        // Add label marker slightly offset from the main marker
        const labelMarker = L.marker([lat + 0.001, lng + 0.005], { 
            icon: labelIcon,
            interactive: false
        }).addTo(detailMap);
        
        propertyMarkers.push({marker, labelMarker, lat, lng, element: card});
        
        // Add click event to highlight property card
        marker.on('click', function() {
            highlightProperty(lat, lng);
        });
        
        // Add hover events to switch between basic and enhanced content
        marker.on('mouseover', function() {
            // Update label content to enhanced version
            const labelElement = labelMarker.getElement();
            if (labelElement) {
                // Find the property-label element (it might be the labelElement itself or a child)
                const propertyLabel = labelElement.classList.contains('property-label') 
                    ? labelElement 
                    : labelElement.querySelector('.property-label');
                
                if (propertyLabel) {
                    propertyLabel.innerHTML = enhancedContent;
                    propertyLabel.classList.add('enhanced');
                }
            }
            highlightPropertyCard(card);
        });
        
        marker.on('mouseout', function() {
            // Revert label content to basic version
            const labelElement = labelMarker.getElement();
            if (labelElement) {
                // Find the property-label element (it might be the labelElement itself or a child)
                const propertyLabel = labelElement.classList.contains('property-label') 
                    ? labelElement 
                    : labelElement.querySelector('.property-label');
                
                if (propertyLabel) {
                    propertyLabel.innerHTML = basicContent;
                    propertyLabel.classList.remove('enhanced');
                }
            }
            removePropertyCardHighlight(card);
        });
    });
}

function showLoadingIndicator() {
    const propertiesGrid = document.querySelector('.properties-grid');
    
    // Remove existing loading indicator
    const existingLoader = propertiesGrid.querySelector('.loading-indicator');
    if (existingLoader) {
        existingLoader.remove();
    }
    
    const loader = document.createElement('div');
    loader.className = 'loading-indicator';
    loader.innerHTML = `
        <div style="
            grid-column: 1 / -1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px 20px;
            color: #6b7280;
            font-size: 14px;
        ">
            <div style="
                width: 20px;
                height: 20px;
                border: 2px solid #e5e7eb;
                border-top: 2px solid #3E6343;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 12px;
            "></div>
            Načítání dalších nemovitostí...
        </div>
    `;
    
    propertiesGrid.appendChild(loader);
}

function hideLoadingIndicator() {
    const loader = document.querySelector('.loading-indicator');
    if (loader) {
        loader.remove();
    }
}

// Sort dropdown functionality
function initializeSortDropdown() {
    const sortBtn = document.querySelector('.sort-btn');
    const sortDropdownMenu = document.querySelector('.sort-dropdown-menu');
    const sortOptions = document.querySelectorAll('.sort-option');
    const sortText = document.querySelector('.sort-text');
    
    // Toggle dropdown
    sortBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = sortDropdownMenu.classList.contains('show');
        
        if (isOpen) {
            closeSortDropdown();
        } else {
            openSortDropdown();
        }
    });
    
    // Handle sort option selection
    sortOptions.forEach(option => {
        option.addEventListener('click', function() {
            const sortType = this.dataset.sort;
            const sortLabel = this.textContent;
            
            // Update active state
            sortOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Update button text
            sortText.textContent = sortLabel;
            
            // Apply sorting
            applySorting(sortType);
            
            // Close dropdown
            closeSortDropdown();
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.sort-dropdown')) {
            closeSortDropdown();
        }
    });
    
    function openSortDropdown() {
        sortDropdownMenu.classList.add('show');
        sortBtn.classList.add('active');
    }
    
    function closeSortDropdown() {
        sortDropdownMenu.classList.remove('show');
        sortBtn.classList.remove('active');
    }
}

function applySorting(sortType) {
    const propertiesGrid = document.querySelector('.properties-grid');
    const propertyCards = Array.from(propertiesGrid.querySelectorAll('.property-card'));
    
    // Remove loading indicator if present
    const loadingIndicator = propertiesGrid.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
    
    // Sort property cards
    propertyCards.sort((a, b) => {
        switch (sortType) {
            case 'newest':
                // For demo purposes, we'll sort by DOM order (newest first)
                return 0; // Keep original order as "newest"
                
            case 'cheapest':
                const priceA = parsePrice(a.querySelector('.property-price-main').textContent);
                const priceB = parsePrice(b.querySelector('.property-price-main').textContent);
                return priceA - priceB;
                
            case 'expensive':
                const priceA2 = parsePrice(a.querySelector('.property-price-main').textContent);
                const priceB2 = parsePrice(b.querySelector('.property-price-main').textContent);
                return priceB2 - priceA2;
                
            default:
                return 0;
        }
    });
    
    // Re-append sorted cards
    propertyCards.forEach(card => {
        propertiesGrid.appendChild(card);
    });
    
    // Re-add loading indicator if needed
    if (loadingIndicator) {
        propertiesGrid.appendChild(loadingIndicator);
    }
    
    console.log(`Properties sorted by: ${sortType}`);
}

function parsePrice(priceText) {
    // Extract number from price text like "€450,000"
    return parseInt(priceText.replace(/[€,]/g, '')) || 0;
}

// Add highlight effect CSS
const highlightStyle = document.createElement('style');
highlightStyle.textContent = `
    .property-card.highlighted {
        border-color: #3E6343 !important;
        box-shadow: 0 0 20px rgba(62, 99, 67, 0.3) !important;
        transform: scale(1.02);
        transition: all 0.3s ease;
    }
    
    .property-card.map-hovered {
        background: linear-gradient(145deg, #f0f9f1 0%, #e8f5e8 100%) !important;
        border-color: #3E6343 !important;
        transition: all 0.3s ease;
    }
    
    .property-card.map-hovered .property-title {
        color: #2d4a32 !important;
        transition: color 0.3s ease;
    }
    
    .property-card.map-hovered .property-btn {
        background: linear-gradient(145deg, #588C5F 0%, #3E6343 100%) !important;
        transform: translateY(-1px);
        transition: all 0.3s ease;
    }
    
    .map-popup {
        min-width: 200px;
        max-width: 250px;
        padding: 0;
        border-radius: 8px;
        overflow: hidden;
    }
    
    .popup-image {
        width: 100%;
        height: 120px;
        overflow: hidden;
        position: relative;
    }
    
    .popup-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    
    .popup-content {
        padding: 12px;
        text-align: center;
    }
    
    .map-popup h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .popup-price {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 700;
        color: #3E6343;
    }
    
    .popup-btn {
        background: #3E6343;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
    }
    
    .popup-btn:hover {
        background: #2d4a32;
        transform: translateY(-1px);
    }
    
    /* Hover popup specific styling */
    .leaflet-popup.hover-popup .leaflet-popup-content-wrapper {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(62, 99, 67, 0.2);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .leaflet-popup.hover-popup .leaflet-popup-tip {
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(62, 99, 67, 0.2);
        border-top: none;
        border-right: none;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(highlightStyle); 