
const { db } = require('../config/firebase');

const COLLECTION_NAME = 'contracts';

class Contract {
    /**
     * @param {Object} data - Contract details
     */
    constructor(data) {
        this.contractId = data.contractId || `CTR-${Date.now()}`;
        
        // Relationship Fields
        this.farmerId = data.farmerId; // Reference to Farmer
        this.buyerId = data.buyerId || null; // Null if created as an open bid
        
        // Agreement Terms
        this.cropType = data.cropType;
        this.quantity = data.quantity; // e.g., "10 Tons"
        this.qualityStandard = data.qualityStandard || "Standard Grade"; // e.g., "Grade A", "Organic"
        
        // Financials
        this.lockedPrice = data.lockedPrice; // The guaranteed price per unit
        
        // Logistics
        this.deliveryDate = data.deliveryDate;
        
        // Lifecycle: 'Draft' -> 'Active' (Signed/Paid) -> 'Completed' (Delivered)
        this.status = data.status || 'Draft'; 
        
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    /**
     * Convert to Firestore-compatible object
     */
    toFirestore() {
        return {
            contractId: this.contractId,
            farmerId: this.farmerId,
            buyerId: this.buyerId,
            cropType: this.cropType,
            quantity: this.quantity,
            qualityStandard: this.qualityStandard,
            lockedPrice: this.lockedPrice,
            deliveryDate: this.deliveryDate,
            status: this.status,
            createdAt: this.createdAt
        };
    }

    // =========================================================
    // DATABASE OPERATIONS
    // =========================================================

    /**
     * Create a New Contract
     * @param {Object} contractData 
     */
    static async create(contractData) {
        try {
            const contract = new Contract(contractData);
            const docRef = db.collection(COLLECTION_NAME).doc(contract.contractId);
            
            await docRef.set(contract.toFirestore());
            
            console.log(`✅ Contract Created: ${contract.contractId} for ${contract.cropType}`);
            return contract.toFirestore();
        } catch (error) {
            console.error("❌ Error creating contract:", error.message);
            throw new Error('Database error creating contract');
        }
    }

    /**
     * Fetch All Contracts (with optional filters)
     * Useful for the Marketplace view
     */
    static async findAll(filters = {}) {
        try {
            let query = db.collection(COLLECTION_NAME);
            
            // Example Filter: Get all 'Draft' contracts for marketplace
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }
            // Example Filter: Get contracts for specific farmer
            if (filters.farmerId) {
                query = query.where('farmerId', '==', filters.farmerId);
            }

            const snapshot = await query.get();
            if (snapshot.empty) return [];

            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            throw new Error('Error fetching contracts');
        }
    }

    /**
     * Update Contract Status
     * Used when a Buyer accepts a contract or Farmer delivers goods
     * @param {String} contractId 
     * @param {String} newStatus - 'Active' | 'Completed' | 'Cancelled'
     * @param {String} buyerId - (Optional) Update buyer if status becomes Active
     */
    static async updateStatus(contractId, newStatus, buyerId = null) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(contractId);
            
            const updates = { status: newStatus };
            if (buyerId) updates.buyerId = buyerId;
            
            await docRef.update(updates);
            
            console.log(`🔄 Contract ${contractId} updated to ${newStatus}`);
            return true;
        } catch (error) {
            console.error("❌ Error updating contract:", error.message);
            return false;
        }
    }
}

module.exports = Contract;