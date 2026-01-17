
const Buyer = require('../models/Buyer.model');
const Contract = require('../models/Contract.model');
// const Delivery = require('../models/Delivery.model'); // For tracking

// --- CONTROLLER FUNCTIONS ---

/**
 * @desc    Create/Update Buyer Profile
 * @route   POST /api/buyer/profile
 * @access  Private (Buyer Role)
 */
exports.createProfile = async (req, res) => {
    try {
        const userId = req.user.uid; // From Auth Middleware

        const profileData = {
            userId,
            ...req.body // Company Name, Business Type, etc.
        };

        const buyer = await Buyer.create(profileData);

        res.status(201).json({
            success: true,
            message: "Buyer profile initialized",
            data: buyer
        });
    } catch (error) {
        console.error("❌ Create Buyer Profile Error:", error);
        res.status(500).json({ success: false, message: "Failed to create profile" });
    }
};

/**
 * @desc    Get Marketplace (Available Contracts)
 * @route   GET /api/buyer/marketplace
 * @access  Private
 */
exports.getMarketplace = async (req, res) => {
    try {
        // Fetch all contracts that are currently 'Draft' (i.e., looking for a buyer)
        // This acts as the "Open Market" view
        const availableContracts = await Contract.findAll({ status: 'Draft' });

        res.json({
            success: true,
            count: availableContracts.length,
            data: availableContracts
        });
    } catch (error) {
        console.error("❌ Marketplace Error:", error);
        res.status(500).json({ success: false, message: "Failed to load marketplace" });
    }
};

/**
 * @desc    Accept a Contract (Lock the Deal)
 * @route   POST /api/buyer/contract/:contractId/accept
 * @access  Private (Buyer Role)
 */
exports.acceptContract = async (req, res) => {
    try {
        const { contractId } = req.params;
        const buyerId = req.user.uid;

        // 1. Validation: Ensure buyer is verified (Optional Rule)
        // const buyerProfile = await Buyer.findByUserId(buyerId);
        // if (buyerProfile.verifiedStatus !== 'Verified') return res.status(403)...

        // 2. Update Contract Status
        // * CRITICAL: This transitions the contract from 'Open Market' to 'Legally Binding'
        const success = await Contract.updateStatus(contractId, 'Active', buyerId);

        if (success) {
            // 3. Record the Purchase (Update Buyer Stats)
            // This builds the buyer's reputation score
            // In a real app, verify payment confirmation first
            await Buyer.recordPurchase(buyerId, 0); // Increment count

            res.json({ 
                success: true, 
                message: "Contract Accepted! Funds held in Escrow.",
                contractId: contractId 
            });
        } else {
            res.status(400).json({ success: false, message: "Failed to accept contract. It may be taken." });
        }

    } catch (error) {
        console.error("❌ Acceptance Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Get Buyer Dashboard Stats
 * @route   GET /api/buyer/dashboard
 * @access  Private
 */
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.uid;

        // 1. Fetch Buyer Profile
        const profile = await Buyer.findByUserId(userId);
        
        // 2. Fetch My Contracts (Active & Completed)
        // Note: We need a query method for finding by *buyerId* specifically
        // Using generic findAll and filtering in memory for the Hackathon demo
        const allContracts = await Contract.findAll(); 
        const myContracts = allContracts.filter(c => c.buyerId === userId);

        // 3. Calculate Stats
        const activeDeals = myContracts.filter(c => c.status === 'Active');
        const pastPurchases = myContracts.filter(c => c.status === 'Completed');
        
        // Mocking logistics data for the demo
        const activeDeliveries = activeDeals.length; 

        res.json({
            success: true,
            data: {
                profile: {
                    company: profile?.companyName || "Unknown",
                    type: profile?.businessType,
                    status: profile?.verifiedStatus
                },
                stats: {
                    activeContracts: activeDeals.length,
                    totalPurchases: pastPurchases.length,
                    pendingDeliveries: activeDeliveries
                },
                recentActivity: activeDeals.slice(0, 5)
            }
        });

    } catch (error) {
        console.error("❌ Buyer Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Failed to load dashboard" });
    }
};