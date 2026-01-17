
const { db } = require('../config/firebase');

const COLLECTION_NAME = 'quality_checks';

class QualityCheck {
    /**
     * @param {Object} data - Quality assessment details
     */
    constructor(data) {
        this.qualityId = data.qualityId || `QA-${Date.now()}`;
        
        // Link to the specific contract
        this.contractId = data.contractId;
        
        // Assessment Data
        this.qualityScore = data.qualityScore || 0; // e.g., 95 (out of 100)
        this.grade = data.grade || 'Pending'; // 'A', 'B', 'C', 'Rejected'
        
        // Detailed Feedback
        this.remarks = data.remarks || ""; // e.g., "Moisture content slightly high"
        this.parameters = data.parameters || {}; // e.g., { moisture: "12%", size: "Large" }
        
        // Verification Source
        this.verifiedBy = data.verifiedBy || 'AI_System'; // 'AI_System', 'Admin', 'ThirdPartyLab'
        this.verificationStatus = data.verificationStatus || 'Pending'; // 'Pending', 'Approved', 'Rejected'
        
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    /**
     * Convert to Firestore-compatible object
     */
    toFirestore() {
        return {
            qualityId: this.qualityId,
            contractId: this.contractId,
            qualityScore: this.qualityScore,
            grade: this.grade,
            remarks: this.remarks,
            parameters: this.parameters,
            verifiedBy: this.verifiedBy,
            verificationStatus: this.verificationStatus,
            createdAt: this.createdAt
        };
    }

    // =========================================================
    // DATABASE OPERATIONS
    // =========================================================

    /**
     * Submit a Quality Report
     * Can be triggered by an AI visual inspection or a manual admin entry
     */
    static async create(reportData) {
        try {
            const report = new QualityCheck(reportData);
            const docRef = db.collection(COLLECTION_NAME).doc(report.qualityId);
            
            await docRef.set(report.toFirestore());
            
            console.log(`✅ Quality Report Logged: ${report.qualityId} (Grade: ${report.grade})`);
            return report.toFirestore();
        } catch (error) {
            console.error("❌ Error logging quality report:", error.message);
            throw new Error('Database error logging quality check');
        }
    }

    /**
     * Verify/Approve a Report
     * Admin/Lab Partner reviews the AI score and finalizes it
     */
    static async finalizeCheck(qualityId, decision, remarks) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(qualityId);
            
            await docRef.update({
                verificationStatus: decision, // 'Approved' or 'Rejected'
                remarks: remarks,
                verifiedAt: new Date().toISOString()
            });
            
            console.log(`⚖️ QA Decision for ${qualityId}: ${decision}`);
            return true;
        } catch (error) {
            console.error("❌ Error finalizing QA:", error.message);
            return false;
        }
    }

    /**
     * Fetch QA Report for a Contract
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
            throw new Error('Error fetching quality report');
        }
    }
}

module.exports = QualityCheck;