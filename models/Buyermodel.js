
const { db } = require('../config/firebase');

const COLLECTION_NAME = 'buyers';

class Buyer {
    /**
     * @param {Object} data - The buyer profile data
     */
    constructor(data) {
        // Unique ID (often maps to userId)
        this.buyerId = data.buyerId;
        
        // Link to the base User document
        this.userId = data.userId;

        // Corporate Details
        this.companyName = data.companyName || "Independent Buyer";
        this.businessType = data.businessType || "Retailer"; // e.g., 'Wholesaler', 'Processor', 'Retailer'
        this.registrationNumber = data.registrationNumber || ""; // Tax ID / GST

        // Reliability Metrics
        this.verifiedStatus = data.verifiedStatus || "Pending"; // 'Pending', 'Verified', 'Rejected'
        this.totalPurchases = data.totalPurchases || 0; // Total value or count of contracts fulfilled
        
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    /**
     * Convert to Firestore-compatible object
     */
    toFirestore() {
        return {
            buyerId: this.buyerId,
            userId: this.userId,
            companyName: this.companyName,
            businessType: this.businessType,
            registrationNumber: this.registrationNumber,
            verifiedStatus: this.verifiedStatus,
            totalPurchases: this.totalPurchases,
            createdAt: this.createdAt
        };
    }

    // =========================================================
    // DATABASE OPERATIONS
    // =========================================================

    /**
     * Create a Buyer Profile
     */
    static async create(profileData) {
        try {
            const buyer = new Buyer(profileData);
            
            // Storing under userId allows easy 1:1 retrieval
            const docRef = db.collection(COLLECTION_NAME).doc(buyer.userId);
            
            await docRef.set(buyer.toFirestore());
            
            console.log(`✅ Buyer Profile Created: ${buyer.companyName}`);
            return buyer.toFirestore();
        } catch (error) {
            console.error("❌ Error creating buyer profile:", error.message);
            throw new Error('Database error creating buyer profile');
        }
    }

    /**
     * Fetch Buyer Profile by User ID
     */
    static async findByUserId(userId) {
        try {
            const doc = await db.collection(COLLECTION_NAME).doc(userId).get();
            if (!doc.exists) return null;
            return doc.data();
        } catch (error) {
            console.error("❌ Error fetching buyer:", error.message);
            throw new Error('Error fetching buyer profile');
        }
    }

    /**
     * Increment Purchase History
     * Called when a contract is paid/completed
     */
    static async recordPurchase(userId, contractValue) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(userId);
            // Increment total purchases (could be count or value)
            await docRef.update({
                totalPurchases: require('firebase-admin').firestore.FieldValue.increment(1)
            });
            return true;
        } catch (error) {
            console.error("❌ Error recording purchase:", error.message);
            return false;
        }
    }
}

module.exports = Buyer;