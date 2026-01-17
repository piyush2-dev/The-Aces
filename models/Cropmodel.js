
const { db } = require('../config/firebase');

const COLLECTION_NAME = 'crops';

class Crop {
    /**
     * @param {Object} data - Crop lifecycle details
     */
    constructor(data) {
        this.cropId = data.cropId || `CROP-${Date.now()}`;
        
        // Link to the financial agreement
        this.contractId = data.contractId; 
        
        // Crop Details
        this.cropName = data.cropName; // e.g., "Basmati Rice"
        
        // Timeline
        this.sowingDate = data.sowingDate || new Date().toISOString().split('T')[0];
        this.expectedHarvestDate = data.expectedHarvestDate;
        
        // Lifecycle Status: 'Sown', 'Germinating', 'Flowering', 'Ready for Harvest', 'Harvested'
        this.cropStatus = data.cropStatus || 'Sown';
        
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    /**
     * Convert to Firestore-compatible object
     */
    toFirestore() {
        return {
            cropId: this.cropId,
            contractId: this.contractId,
            cropName: this.cropName,
            sowingDate: this.sowingDate,
            expectedHarvestDate: this.expectedHarvestDate,
            cropStatus: this.cropStatus,
            createdAt: this.createdAt
        };
    }

    // =========================================================
    // DATABASE OPERATIONS
    // =========================================================

    /**
     * Register a New Crop Cycle
     * Usually called when the Contract status becomes 'Active'
     */
    static async create(cropData) {
        try {
            const crop = new Crop(cropData);
            const docRef = db.collection(COLLECTION_NAME).doc(crop.cropId);
            
            await docRef.set(crop.toFirestore());
            
            console.log(`🌱 Crop Tracking Started: ${crop.cropName} (Contract: ${crop.contractId})`);
            return crop.toFirestore();
        } catch (error) {
            console.error("❌ Error registering crop:", error.message);
            throw new Error('Database error registering crop');
        }
    }

    /**
     * Update Crop Status
     * Farmer calls this to update the Buyer on progress
     * @param {String} cropId 
     * @param {String} newStatus - e.g., 'Flowering'
     */
    static async updateStatus(cropId, newStatus) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(cropId);
            
            await docRef.update({
                cropStatus: newStatus,
                lastUpdated: new Date().toISOString()
            });
            
            console.log(`🔄 Crop ${cropId} status updated to ${newStatus}`);
            return true;
        } catch (error) {
            console.error("❌ Error updating crop status:", error.message);
            return false;
        }
    }

    /**
     * Find Crop Details by Contract ID
     * Used by the Buyer Dashboard to see the status of their contract
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
            throw new Error('Error fetching crop details');
        }
    }
}

module.exports = Crop;