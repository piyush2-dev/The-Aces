// Global variables for map instances
let map;
let directionsService;
let directionsRenderer;

// Default Center (India)
const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

/**
 * 1. Initialize the Google Map
 * This function is called automatically by the Google Maps script callback.
 */
function initMap() {
    console.log("Initializing FarmoTech Logistics Map...");

    try {
        // Create the map centered on India
        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 5,
            center: INDIA_CENTER,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            // Minimal UI controls for cleaner look
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false
        });

        // Initialize Directions Service (For Route Tracking)
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true, // We will use our own custom markers
            polylineOptions: {
                strokeColor: "#2E7D32", // FarmoTech Green Route
                strokeWeight: 5
            }
        });

    } catch (error) {
        console.error("FarmoTech Map Error: Failed to initialize map.", error);
    }
}

/**
 * 2. Add a Farmer Location Marker
 * Uses a Green marker to represent production source.
 */
function addFarmMarker(lat, lng, farmerName) {
    if (!isValidCoordinate(lat, lng)) return;

    const position = { lat: lat, lng: lng };
    
    // Create marker
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: `Farmer: ${farmerName}`,
        animation: google.maps.Animation.DROP,
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" // Green for Agriculture
        }
    });

    // Add click listener for info window
    addInfoWindow(marker, `<strong>Farmer: ${farmerName}</strong><br>Production Site`);
    
    // Center map on this marker
    map.panTo(position);
    map.setZoom(8);
}

/**
 * 3. Add a Buyer/Warehouse Location Marker
 * Uses a Blue marker to represent destination.
 */
function addBuyerMarker(lat, lng, buyerName) {
    if (!isValidCoordinate(lat, lng)) return;

    const position = { lat: lat, lng: lng };

    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: `Buyer: ${buyerName}`,
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" // Blue for Commercial
        }
    });

    addInfoWindow(marker, `<strong>Buyer: ${buyerName}</strong><br>Logistics Hub`);
}

/**
 * 4. Track Delivery (Draw Route)
 * Calculates route between Farmer (Origin) and Buyer (Destination).
 */
function trackDelivery(farmLat, farmLng, buyerLat, buyerLng) {
    if (!isValidCoordinate(farmLat, farmLng) || !isValidCoordinate(buyerLat, buyerLng)) {
        console.warn("Invalid coordinates for route tracking.");
        return;
    }

    const origin = { lat: farmLat, lng: farmLng };
    const destination = { lat: buyerLat, lng: buyerLng };

    const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
    };

    console.log("Calculating Logistics Route...");

    directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            // 1. Render the path on the map
            directionsRenderer.setDirections(result);
            
            // 2. Extract Data (Distance & Time)
            const leg = result.routes[0].legs[0];
            const distance = leg.distance.text;
            const duration = leg.duration.text;
            
            console.log(`Route Found: ${distance}, ETA: ${duration}`);

            // 3. Optional: Update UI if elements exist
            updateLogisticsUI(distance, duration);
            
        } else {
            console.error("Directions request failed due to " + status);
            alert("Could not calculate delivery route. Check console.");
        }
    });
}

/**
 * Helper: Add Info Window to Marker
 */
function addInfoWindow(marker, contentString) {
    const infoWindow = new google.maps.InfoWindow({
        content: contentString
    });

    marker.addListener("click", () => {
        infoWindow.open(map, marker);
    });
}

/**
 * Helper: Validate Coordinates
 */
function isValidCoordinate(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        console.error("Invalid coordinates provided:", lat, lng);
        return false;
    }
    return true;
}

/**
 * Helper: Update Logistics UI Elements (if present)
 */
function updateLogisticsUI(distance, duration) {
    const distEl = document.getElementById("logistics-distance");
    const timeEl = document.getElementById("logistics-time");
    
    if (distEl) distEl.innerText = distance;
    if (timeEl) timeEl.innerText = duration;
}

// Export functions for module usage (optional) or global access
window.initMap = initMap;
window.addFarmMarker = addFarmMarker;
window.addBuyerMarker = addBuyerMarker;
window.trackDelivery = trackDelivery;