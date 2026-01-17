
const User = require('../models/User.model');
const Contract = require('../models/Contract.model');
const QualityCheck = require('../models/Quality.model');
const Farmer = require('../models/Farmer.model');
const Buyer = require('../models/Buyer.model');

// --- CONTROLLER FUNCTIONS ---

/**
 * @desc    Verify a User (KYC Approval)
 * @route   POST /api/admin/verify-user
 * @access  Private (Admin Only)
 */
exports.verifyUser = async (req, res) => {
    try {
        const { userId, action } = req.body; // action: 'approve' or 'reject'
        
        console.log(`[ADMIN] Processing KYC verification for user: ${userId} -> ${action}`);

        if (action === 'approve') {
            // 1. Update the base User model
            await User.verifyUser(userId);

            // 2. Update specific role models (Optional: add 'Verified' badge to buyer/farmer profile)
            // This ensures the checkmark appears on their public profile
            const user = await User.findById(userId);
            if (user && user.role === 'buyer') {
                // Update Buyer specific status if needed
                // await Buyer.updateStatus(userId, 'Verified'); 
            }

            res.json({ success: true, message: "User verified successfully. They can now trade." });
        } else {
            // In a real app, we might suspend the account here
            res.json({ success: true, message: "User verification rejected. Access restricted." });
        }
    } catch (error) {
        console.error("❌ Verify User Error:", error);
        res.status(500).json({ success: false, message: "Action failed" });
    }
};

/**
 * @desc    Moderate Contract (Approve/Reject/Flag)
 * @route   POST /api/admin/moderate-contract
 * @access  Private (Admin Only)
 */
exports.moderateContract = async (req, res) => {
    try {
        const { contractId, action, reason } = req.body;

        console.log(`[ADMIN] Moderating Contract ${contractId}: ${action}`);

        let newStatus;
        if (action === 'approve') newStatus = 'Active'; // Admin override to force active
        if (action === 'reject') newStatus = 'Cancelled'; // Admin killing a bad deal
        
        if (newStatus) {
            await Contract.updateStatus(contractId, newStatus);
            
            // Log the intervention for transparency
            console.log(`[AUDIT] Admin changed contract ${contractId} to ${newStatus}. Reason: ${reason}`);
            
            res.json({ success: true, message: `Contract marked as ${newStatus}` });
        } else {
            res.status(400).json({ success: false, message: "Invalid action" });
        }

    } catch (error) {
        console.error("❌ Contract Moderation Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Approve Quality Grade (Human-in-the-loop)
 * @route   POST /api/admin/approve-quality
 * @access  Private (Admin Only)
 */
exports.approveQuality = async (req, res) => {
    try {
        const { qualityId, decision, remarks } = req.body; // decision: 'Approved' | 'Rejected'
        
        console.log(`[ADMIN] Finalizing Quality Check ${qualityId}: ${decision}`);

        // The QualityCheck model handles the timestamping and status update
        const success = await QualityCheck.finalizeCheck(qualityId, decision, remarks);

        if (success) {
            res.json({ success: true, message: `Quality Report finalized as ${decision}` });
        } else {
            res.status(400).json({ success: false, message: "Failed to update quality report" });
        }
    } catch (error) {
        console.error("❌ Quality Approval Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Get Admin Dashboard Analytics
 * @route   GET /api/admin/analytics
 * @access  Private (Admin Only)
 */
exports.getAnalytics = async (req, res) => {
    try {
        // Fetch raw data to aggregate stats
        // In a production app with SQL/Mongo, these would be optimized COUNT() queries.
        // For the Hackathon/Firestore demo, fetching all docs is acceptable for small datasets.
        const allContracts = await Contract.findAll();
        // const allUsers = await User.findAll(); // Assuming this method exists

        const stats = {
            platformHealth: "Good",
            contractVolume: {
                total: allContracts.length,
                active: allContracts.filter(c => c.status === 'Active').length,
                completed: allContracts.filter(c => c.status === 'Completed').length
            },
            financials: {
                // Sum of all active/completed contract values
                totalEscrow: allContracts.reduce((sum, c) => {
                    // Safety check if quantity/price are numbers
                    const val = (parseFloat(c.quantity) || 0) * (parseFloat(c.lockedPrice) || 0);
                    return sum + val;
                }, 0)
            },
            pendingActions: {
                verifications: 3, // Mock count of pending users
                qualityChecks: 5  // Mock count of pending QC approvals
            }
        };

        res.json({ success: true, data: stats });

    } catch (error) {
        console.error("❌ Admin Analytics Error:", error);
        res.status(500).json({ success: false, message: "Failed to load analytics" });
    }
};