// GeoVision Main JavaScript
// Initialize map and application state

let map;
let currentMode = '2D';
let selectedLocation = null;
let activeLayers = {
    faultLines: false,
    floodZones: false,
    infrastructure: false
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeEventListeners();
    loadInitialData();
});

// Initialize Leaflet Map
function initializeMap() {
    // Create map centered on Philippines (can be changed to any location)
    map = L.map('map').setView([12.8797, 121.7740], 6);

    // Add base tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add click event to map
    map.on('click', function(e) {
        handleMapClick(e.latlng);
    });

    // Add zoom event for dynamic building generation
    map.on('zoomend', function() {
        handleZoomChange();
    });
}

// Initialize all event listeners
function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch(searchInput.value);
        }
    });

    // 2D/3D mode toggle
    document.getElementById('toggle2D3D').addEventListener('click', toggleMapMode);

    // Risk layer toggle
    document.getElementById('enableRiskLayers').addEventListener('change', function(e) {
        toggleRiskLayers(e.target.checked);
    });

    // Layer control buttons
    document.getElementById('toggleFaultLines').addEventListener('click', function() {
        toggleLayer('faultLines', this);
    });
    document.getElementById('toggleFloodZones').addEventListener('click', function() {
        toggleLayer('floodZones', this);
    });
    document.getElementById('toggleInfrastructure').addEventListener('click', function() {
        toggleLayer('infrastructure', this);
    });

    // Close data section
    document.getElementById('closeDataSection').addEventListener('click', function() {
        document.querySelector('.data-section').style.display = 'none';
    });

    // AI Chat functionality
    document.getElementById('aiSend').addEventListener('click', sendAIMessage);
    document.getElementById('aiInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendAIMessage();
        }
    });

    // Expand AI to full screen
    document.getElementById('expandAI').addEventListener('click', openAIModal);

    // Modal AI functionality
    document.getElementById('closeModal').addEventListener('click', closeAIModal);
    document.getElementById('modalAiSend').addEventListener('click', sendModalAIMessage);
    document.getElementById('modalAiInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendModalAIMessage();
        }
    });

    // Close modal on background click
    document.getElementById('aiModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAIModal();
        }
    });
}

// Load initial data
function loadInitialData() {
    // This would typically load from a backend API
    console.log('GeoVision initialized');
}

// Handle map clicks
function handleMapClick(latlng) {
    selectedLocation = latlng;
    
    // Show loading
    showLoading();

    // Simulate API call to get location data
    setTimeout(() => {
        const locationData = generateLocationData(latlng);
        displayLocationData(locationData);
        addMarker(latlng, locationData);
        hideLoading();
    }, 800);
}

// Generate mock location data (would come from backend in production)
function generateLocationData(latlng) {
    const lat = latlng.lat.toFixed(4);
    const lng = latlng.lng.toFixed(4);
    
    return {
        coordinates: `${lat}, ${lng}`,
        population: Math.floor(Math.random() * 500000) + 10000,
        elevation: Math.floor(Math.random() * 500) + 10,
        floodRisk: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
        earthquakeRisk: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
        landslideRisk: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
        infrastructureCondition: ['Poor', 'Fair', 'Good'][Math.floor(Math.random() * 3)],
        nearestFaultLine: (Math.random() * 50).toFixed(1) + ' km',
        nearestVolcano: (Math.random() * 100).toFixed(1) + ' km'
    };
}

// Display location data in side panel
function displayLocationData(data) {
    const dataSection = document.querySelector('.data-section');
    const locationDataDiv = document.getElementById('locationData');
    
    dataSection.style.display = 'block';
    
    const riskColor = {
        'Low': 'green',
        'Moderate': 'yellow',
        'High': 'red'
    };
    
    locationDataDiv.innerHTML = `
        <div class="data-item">
            <div class="data-label">Coordinates</div>
            <div class="data-value">${data.coordinates}</div>
        </div>
        <div class="data-item">
            <div class="data-label">Population Estimate</div>
            <div class="data-value">${data.population.toLocaleString()} people</div>
        </div>
        <div class="data-item">
            <div class="data-label">Elevation</div>
            <div class="data-value">${data.elevation}m above sea level</div>
        </div>
        <div class="data-item">
            <div class="data-label">Flood Risk</div>
            <div class="data-value" style="color: ${riskColor[data.floodRisk] === 'green' ? '#27ae60' : riskColor[data.floodRisk] === 'yellow' ? '#f39c12' : '#e74c3c'}">${data.floodRisk}</div>
        </div>
        <div class="data-item">
            <div class="data-label">Earthquake Risk</div>
            <div class="data-value" style="color: ${riskColor[data.earthquakeRisk] === 'green' ? '#27ae60' : riskColor[data.earthquakeRisk] === 'yellow' ? '#f39c12' : '#e74c3c'}">${data.earthquakeRisk}</div>
        </div>
        <div class="data-item">
            <div class="data-label">Landslide Risk</div>
            <div class="data-value" style="color: ${riskColor[data.landslideRisk] === 'green' ? '#27ae60' : riskColor[data.landslideRisk] === 'yellow' ? '#f39c12' : '#e74c3c'}">${data.landslideRisk}</div>
        </div>
        <div class="data-item">
            <div class="data-label">Infrastructure Condition</div>
            <div class="data-value">${data.infrastructureCondition}</div>
        </div>
        <div class="data-item">
            <div class="data-label">Nearest Fault Line</div>
            <div class="data-value">${data.nearestFaultLine}</div>
        </div>
        <div class="data-item">
            <div class="data-label">Nearest Volcano</div>
            <div class="data-value">${data.nearestVolcano}</div>
        </div>
    `;
}

// Add marker to map
function addMarker(latlng, data) {
    const marker = L.marker(latlng).addTo(map);
    
    marker.bindPopup(`
        <strong>Location Selected</strong><br>
        ${data.coordinates}<br>
        Population: ${data.population.toLocaleString()}<br>
        Flood Risk: ${data.floodRisk}
    `);
    
    marker.openPopup();
}

// Handle search
function handleSearch(query) {
    if (!query.trim()) return;
    
    showLoading();
    
    // In production, this would use a geocoding API
    // For now, simulate search
    console.log('Searching for:', query);
    
    // Example: Philippines locations
    const locations = {
        'manila': [14.5995, 120.9842],
        'quezon city': [14.6760, 121.0437],
        'camarines norte': [14.1337, 122.7598],
        'cebu': [10.3157, 123.8854],
        'davao': [7.1907, 125.4553]
    };
    
    const location = locations[query.toLowerCase()];
    
    setTimeout(() => {
        if (location) {
            map.setView(location, 12);
            handleMapClick(L.latLng(location[0], location[1]));
        } else {
            alert('Location not found. Try: Manila, Quezon City, Camarines Norte, Cebu, or Davao');
        }
        hideLoading();
    }, 500);
}

// Toggle 2D/3D mode
function toggleMapMode() {
    const button = document.getElementById('toggle2D3D');
    
    if (currentMode === '2D') {
        currentMode = '3D';
        button.textContent = '2D Mode';
        // In production, this would switch to a 3D rendering engine
        console.log('Switched to 3D mode');
        alert('3D mode would be activated here. In production, this would use a 3D mapping engine like Cesium or MapBox GL JS.');
    } else {
        currentMode = '2D';
        button.textContent = '3D Mode';
        console.log('Switched to 2D mode');
    }
}

// Toggle risk layers
function toggleRiskLayers(enabled) {
    console.log('Risk layers:', enabled ? 'Enabled' : 'Disabled');
    // In production, this would show/hide risk overlay layers
}

// Toggle individual layers
function toggleLayer(layerName, button) {
    activeLayers[layerName] = !activeLayers[layerName];
    button.classList.toggle('active');
    
    console.log(`${layerName}:`, activeLayers[layerName] ? 'Enabled' : 'Disabled');
    
    // In production, this would add/remove actual map layers
    if (activeLayers[layerName]) {
        simulateLayerData(layerName);
    }
}

// Simulate layer data
function simulateLayerData(layerName) {
    const messages = {
        faultLines: 'Fault lines layer activated. Red lines indicate active fault lines.',
        floodZones: 'Flood zones layer activated. Blue areas indicate flood-prone regions.',
        infrastructure: 'Infrastructure layer activated. Showing roads, bridges, and utilities.'
    };
    
    console.log(messages[layerName]);
}

// Handle zoom changes for dynamic building generation
function handleZoomChange() {
    const zoomLevel = map.getZoom();
    
    // At zoom level 16+, show building footprints (in production)
    if (zoomLevel >= 16) {
        console.log('High zoom level - showing detailed building data');
        // This would trigger 3D building generation in production
    }
}

// AI Chat functionality
function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatContainer = document.getElementById('aiChat');
    
    // Add user message
    addChatMessage(chatContainer, message, 'user');
    
    // Clear input
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addChatMessage(chatContainer, response, 'ai');
    }, 1000);
}

// Modal AI functionality
function sendModalAIMessage() {
    const input = document.getElementById('modalAiInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatContainer = document.getElementById('modalChat');
    
    // Add user message
    addChatMessage(chatContainer, message, 'user');
    
    // Clear input
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addChatMessage(chatContainer, response, 'ai');
    }, 1000);
}

// Add chat message
function addChatMessage(container, message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'user' ? 'ai-message user-message' : 'ai-message ai-response';
    
    const p = document.createElement('p');
    p.textContent = message;
    messageDiv.appendChild(p);
    
    container.appendChild(messageDiv);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Generate AI response (would use actual AI API in production)
function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword-based responses
    if (lowerMessage.includes('population') || lowerMessage.includes('people')) {
        if (selectedLocation) {
            return `Based on current data, the selected location has an estimated population of ${Math.floor(Math.random() * 500000) + 10000} people. This includes both urban and rural areas within the vicinity.`;
        }
        return 'Please select a location on the map to get population information.';
    }
    
    if (lowerMessage.includes('disaster') || lowerMessage.includes('risk')) {
        return 'The main disaster risks in this region include flooding during typhoon season (June-November), moderate earthquake risk due to proximity to fault lines, and occasional landslides in elevated areas. I recommend checking the risk layers for detailed information.';
    }
    
    if (lowerMessage.includes('infrastructure')) {
        return 'The infrastructure in this area includes road networks, drainage systems, and utilities. Based on recent assessments, priority improvements are needed in drainage capacity and flood management systems. Would you like more details on specific infrastructure types?';
    }
    
    if (lowerMessage.includes('weather') || lowerMessage.includes('forecast')) {
        return 'Current weather conditions show partly cloudy skies with temperatures around 28°C. The forecast for the next 7 days indicates possible rain showers with a 60% chance of precipitation. This may affect ongoing construction projects in low-lying areas.';
    }
    
    if (lowerMessage.includes('camarines norte')) {
        return 'Camarines Norte is a province in the Bicol Region of the Philippines. Key concerns include flood management in coastal areas, typhoon preparedness, and infrastructure development. The region experiences an average of 2-3 major typhoons per year. Current priority projects include drainage system improvements and evacuation route establishment.';
    }
    
    // Default response
    return 'I can help you analyze location-specific data, disaster risks, population information, infrastructure conditions, and provide recommendations for urban planning and disaster preparedness. What would you like to know more about?';
}

// Open AI modal
function openAIModal() {
    const modal = document.getElementById('aiModal');
    modal.classList.remove('hidden');
}

// Close AI modal
function closeAIModal() {
    const modal = document.getElementById('aiModal');
    modal.classList.add('hidden');
}

// Show loading indicator
function showLoading() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
}

// Hide loading indicator
function hideLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
}

// Additional utility functions for production implementation

// Fetch location data from API
async function fetchLocationData(latlng) {
    // In production, this would call your backend API
    // const response = await fetch(`/api/location?lat=${latlng.lat}&lng=${latlng.lng}`);
    // return await response.json();
    return generateLocationData(latlng);
}

// Fetch weather data
async function fetchWeatherData(latlng) {
    // In production, integrate with weather API
    // const response = await fetch(`/api/weather?lat=${latlng.lat}&lng=${latlng.lng}`);
    // return await response.json();
}

// Fetch disaster monitoring data
async function fetchDisasterData() {
    // In production, integrate with PHIVOLCS and other agencies
    // const response = await fetch('/api/disasters');
    // return await response.json();
}

// Generate 3D building models
function generate3DBuildings(bounds) {
    // In production, use OSM data and AI to generate 3D models
    console.log('Generating 3D buildings for bounds:', bounds);
}

// Detect infrastructure from satellite imagery
function detectInfrastructure(bounds) {
    // In production, use computer vision API
    console.log('Detecting infrastructure in bounds:', bounds);
}

// Motion and change detection
function detectChanges(location, timeRange) {
    // In production, compare satellite imagery over time
    console.log('Detecting changes at:', location, 'over:', timeRange);
}

// Generate solutions and budgets
function generateSolutions(locationData) {
    // In production, use AI to analyze and propose solutions
    console.log('Generating solutions for:', locationData);
    
    return {
        solutions: [
            {
                title: 'Drainage System Improvement',
                description: 'Install new drainage channels and upgrade existing systems',
                budget: 15000000,
                priority: 'High',
                feasibility: 'High'
            },
            {
                title: 'Flood Barrier Construction',
                description: 'Build protective barriers in flood-prone areas',
                budget: 25000000,
                priority: 'Medium',
                feasibility: 'Medium'
            }
        ]
    };
}

// Calculate opportunity score
function calculateOpportunityScore(location, solution) {
    // In production, use weighted algorithm
    const communityNeed = Math.random() * 100;
    const riskSeverity = Math.random() * 100;
    const feasibility = Math.random() * 100;
    const costEffectiveness = Math.random() * 100;
    
    return ((communityNeed + riskSeverity + feasibility + costEffectiveness) / 4).toFixed(1);
}

console.log('GeoVision platform loaded successfully');
