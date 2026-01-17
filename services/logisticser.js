
class LogisticsService {

    /**
     * Calculate Distance and ETA between two points
     * Uses Haversine formula approximation for demo purposes
     * @param {Object} origin - { lat, lng }
     * @param {Object} destination - { lat, lng }
     * @returns {Object} - { distanceKm, estimatedHours, arrivalDate }
     */
    static calculateETA(origin, destination) {
        // 1. Calculate rough distance (Haversine formula simplified)
        // Earth Radius = 6371 km
        const R = 6371; 
        const dLat = this._deg2rad(destination.lat - origin.lat); 
        const dLon = this._deg2rad(destination.lng - origin.lng); 
        
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this._deg2rad(origin.lat)) * Math.cos(this._deg2rad(destination.lat)) * Math.sin(dLon/2) * Math.sin(dLon/2);
            
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distanceKm = Math.round(R * c);

        // 2. Estimate Time
        // Average Truck Speed in India approx 40 km/h (conservative estimate due to traffic/roads)
        const avgSpeed = 40; 
        const driveTimeHours = distanceKm / avgSpeed;
        
        // Add 2 hours for loading/unloading buffer
        const totalHours = Math.round(driveTimeHours + 2);

        // 3. Calculate Arrival Date
        const arrivalDate = new Date();
        arrivalDate.setHours(arrivalDate.getHours() + totalHours);

        return {
            distanceKm,
            estimatedHours: totalHours,
            arrivalDate: arrivalDate.toISOString(),
            routePolyline: "mock_encoded_polyline_string_for_demo" // Google Maps normally provides this
        };
    }

    /**
     * Check if a delivery is delayed based on current time vs promised time
     * @param {string} promisedDateISO 
     * @returns {Object} - { isDelayed, delayHours, status }
     */
    static checkDeliveryDelay(promisedDateISO) {
        const promised = new Date(promisedDateISO);
        const now = new Date();

        // Calculate difference in hours
        const diffMs = now - promised;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours > 0) {
            return {
                isDelayed: true,
                delayHours: diffHours,
                status: 'DELAYED',
                message: `⚠️ Shipment is running ${diffHours} hours late.`
            };
        }

        return {
            isDelayed: false,
            delayHours: 0,
            status: 'ON_TIME',
            message: "✅ Shipment is on schedule."
        };
    }

    // --- HELPER FUNCTIONS ---

    static _deg2rad(deg) {
        return deg * (Math.PI/180);
    }
}

module.exports = LogisticsService;