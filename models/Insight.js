
const { db } = require('../config/firebase');

const COLLECTION_NAME = 'ai_insights';

class AIInsight {
    /**
     * @param {Object} data - AI Prediction details
     */
    constructor(data) {
        this.insightId = data.insightId || `AI-${Date.now()}`;
        
        // Context: Which contract/crop is this prediction for?
        this.contractId = data.contractId; 
        
        // Predictive Metrics
        this.predictedPrice = data.predictedPrice || 0; // Predicted market price at harvest
        this.demandLevel = data.demandLevel || 'Medium'; // 'High', 'Medium', 'Low'
        this.riskLevel = data.riskLevel || 'Low'; // 'Low', 'Moderate', 'Critical'
        
        // Metadata
        this.aiModelVersion = data.aiModelVersion || 'v1.0-demo'; // Track which model generated this
        this.confidenceScore = data.confidenceScore || '85%'; // How sure is the AI?
        
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    /**
     * Convert to Firestore-compatible object
     */
    toFirestore() {
        return {
            insightId: this.insightId,
            contractId: this.contractId,
            predictedPrice: this.predictedPrice,
            demandLevel: this.demandLevel,
            riskLevel: this.riskLevel,
            aiModelVersion: this.aiModelVersion,
            confidenceScore: this.confidenceScore,
            createdAt: this.createdAt
        };
    }

    // =========================================================
    // DATABASE OPERATIONS
    // =========================================================

    /**
     * Store an AI Prediction
     * Called by the Python/Flask AI service or the Node.js mock generator
     */
    static async create(insightData) {
        try {
            const insight = new AIInsight(insightData);
            const docRef = db.collection(COLLECTION_NAME).doc(insight.insightId);
            
            await docRef.set(insight.toFirestore());
            
            console.log(`🤖 AI Insight Generated: ${insight.insightId} (Risk: ${insight.riskLevel})`);
            return insight.toFirestore();
        } catch (error) {
            console.error("❌ Error storing AI insight:", error.message);
            throw new Error('Database error storing insight');
        }
    }

    /**
     * Fetch Insight for a specific Contract
     * Used to display the "AI Advice" card on the frontend
     */
    static async findByContractId(contractId) {
        try {
            const snapshot = await db.collection(COLLECTION_NAME)
                .where('contractId', '==', contractId)
                .orderBy('createdAt', 'desc') // Get the latest prediction
                .limit(1)
                .get();

            if (snapshot.empty) return null;
            return snapshot.docs[0].data();
        } catch (error) {
            throw new Error('Error fetching AI insight');
        }
    }

    /**
     * 🧪 HACKATHON HELPER: Generate Mock Insight
     * Generates realistic-looking data if the Python AI service is offline
     */
    static generateMockInsight(contractId, basePrice) {
        const demandOptions = ['Low', 'Medium', 'High'];
        const riskOptions = ['Low', 'Moderate', 'High'];
        
        // Simple random logic for demo variance
        const randomDemand = demandOptions[Math.floor(Math.random() * demandOptions.length)];
        const randomRisk = riskOptions[Math.floor(Math.random() * riskOptions.length)];
        const predicted = basePrice * (1 + (Math.random() * 0.2 - 0.1)); // +/- 10% variance

        return new AIInsight({
            contractId: contractId,
            predictedPrice: Math.round(predicted),
            demandLevel: randomDemand,
            riskLevel: randomRisk,
            aiModelVersion: 'v1.0-mock-generator'
        });
    }
}

module.exports = AIInsight;