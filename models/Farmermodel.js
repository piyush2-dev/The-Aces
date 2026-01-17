
const { db, admin } = require('../config/firebase');

const COLLECTION_NAME = 'farmers';

class Farmer {
    /**
     * @param {Object} data - The farmer profile data
     */
    constructor(data) {
        // Unique ID for the farmer profile (can be same as userId or distinct)
        this.farmerId = data.farmerId;
        
        // Link to the base User document (Foreign Key concept)
        this.userId = data.userId;
        
        // Geolocation for Logistics & Maps
        this.farmLocation = {
            lat: data.farmLocation?.lat || 0,
            lng: data.farmLocation?.lng || 0,
            address: data.farmLocation?.address || "Unknown"
        };

        // Agricultural Data
        this.cropsGrown = Array.isArray(data.cropsGrown) ? data.cropsGrown : [];
        this.landSize = data.landSize || 0; // In Acres/Hectares

        // Credibility Metrics (AI/System Calculated)
        this.trustScore = data.trustScore || 50; // Starts at average (0-100)
        this.totalContracts = data.totalContracts || 0;
        
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    /**
     * Convert to Firestore-compatible object
     */
    toFirestore() {
        return {
            farmerId: this.farmerId,
            userId: this.userId,
            farmLocation: this.farmLocation,
            cropsGrown: this.cropsGrown,
            landSize: this.landSize,
            trustScore: this.trustScore,
            totalContracts: this.totalContracts,
            createdAt: this.createdAt
        };
    }

    // =========================================================
    // DATABASE OPERATIONS
    // =========================================================

    /**
     * Create a Farmer Profile
     * usually called immediately after User.create()
     */
    static async create(profileData) {
        try {
            const farmer = new Farmer(profileData);
            
            // Use userId as the document ID for 1:1 mapping simplicity
            // or use a separate UUID if one user can have multiple farm profiles
            const docRef = db.collection(COLLECTION_NAME).doc(farmer.userId);
            
            await docRef.set(farmer.toFirestore());
            
            console.log(`✅ Farmer Profile Created for User: ${farmer.userId}`);
            return farmer.toFirestore();
        } catch (error) {
            console.error("❌ Error creating farmer profile:", error.message);
            throw new Error('Database error creating farmer profile');
        }
    }

    /**
     * Fetch Farmer Profile by User ID
     */
    static async findByUserId(userId) {
        try {
            const doc = await db.collection(COLLECTION_NAME).doc(userId).get();
            if (!doc.exists) return null;
            return doc.data();
        } catch (error) {
            throw new Error('Error fetching farmer profile');
        }
    }

    /**
     * Update Trust Score & Contract Count
     * Called when a contract is successfully completed
     * @param {String} userId 
     * @param {Number} scoreDelta - Points to add/remove (e.g., +5 for success, -10 for default)
     */
    static async updateCredibility(userId, scoreDelta) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(userId);
            
            // Use Firestore atomic increment transaction
            await docRef.update({
                trustScore: admin.firestore.FieldValue.increment(scoreDelta),
                totalContracts: admin.firestore.FieldValue.increment(1) // Always increments on completion
            });
            
            console.log(`📈 Trust Score Updated for ${userId}`);
            return true;
        } catch (error) {
            console.error("❌ Error updating credibility:", error.message);
            return false;
        }
    }
}

module.exports = Farmer;