

const { db } = require('../config/firebase');

const COLLECTION_NAME = 'deliveries';

class Delivery {
    /**
     * @param {Object} data - Logistics details
     */
    constructor(data) {
        this.deliveryId = data.deliveryId || `DEL-${Date.now()}`;
        
        // Link to the specific contract
        this.contractId = data.contractId;
        
        // Geolocation Data (Matches Google Maps API format)
        this.farmLocation = {
            lat: data.farmLocation?.lat,
            lng: data.farmLocation?.lng,
            address: data.farmLocation?.address
        };
        
        this.buyerLocation = {
            lat: data.buyerLocation?.lat,
            lng: data.buyerLocation?.lng,
            address: data.buyerLocation?.address
        };
        
        // Status: 'Pending', 'Dispatched', 'In Transit', 'Delivered'
        this.deliveryStatus = data.deliveryStatus || 'Pending';
        
        // Logistics Metadata
        this.estimatedDeliveryTime = data.estimatedDeliveryTime; // e.g. "4 Hours" or ISO Date
        this.currentLocation = data.currentLocation || this.farmLocation; // Updates during transit
        
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    /**
     * Convert to Firestore-compatible object
     */
    toFirestore() {
        return {
            deliveryId: this.deliveryId,
            contractId: this.contractId,
            farmLocation: this.farmLocation,
            buyerLocation: this.buyerLocation,
            deliveryStatus: this.deliveryStatus,
            estimatedDeliveryTime: this.estimatedDeliveryTime,
            currentLocation: this.currentLocation,
            createdAt: this.createdAt
        };
    }

    // =========================================================
    // DATABASE OPERATIONS
    // =========================================================

    /**
     * Initiate a Delivery
     * Called when the Farmer/Logistics partner clicks "Start Delivery"
     */
    static async create(deliveryData) {
        try {
            const delivery = new Delivery(deliveryData);
            const docRef = db.collection(COLLECTION_NAME).doc(delivery.deliveryId);
            
            await docRef.set(delivery.toFirestore());
            
            console.log(`🚚 Delivery Started: ${delivery.deliveryId}`);
            return delivery.toFirestore();
        } catch (error) {
            console.error("❌ Error initiating delivery:", error.message);
            throw new Error('Database error starting delivery');
        }
    }

    /**
     * Update Location / Status
     * Can be called automatically by GPS trackers or manually by the driver
     * @param {String} deliveryId 
     * @param {Object} updates - { status: 'In Transit', currentLocation: {lat, lng} }
     */
    static async updateProgress(deliveryId, updates) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(deliveryId);
            
            // Add a timestamp for this specific update
            updates.lastUpdated = new Date().toISOString();
            
            await docRef.update(updates);
            
            console.log(`📍 Delivery ${deliveryId} updated: ${updates.deliveryStatus || 'Location Update'}`);
            return true;
        } catch (error) {
            console.error("❌ Error updating delivery:", error.message);
            return false;
        }
    }

    /**
     * Fetch Delivery Details
     * Used by the 'maps.js' frontend to draw the route
     */
    static async findByContractId(contractId) {
        try {
            const snapshot = await db.collection(COLLECTION_NAME)
                .where('contractId', '==', contractId)
                .limit(1)
                .get();

            if (snapshot.empty) return null;
            return snapshot.docs[0].data();
        } catch (error) {
            throw new Error('Error fetching delivery details');
        }
    }
}

module.exports = Delivery;