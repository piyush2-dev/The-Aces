

const Farmer = require('../models/Farmer.model');
const Contract = require('../models/Contract.model');
const Crop = require('../models/Crop.model');
// const Payment = require('../models/Payment.model'); // Optional integration

// --- CONTROLLER FUNCTIONS ---

/**
 * @desc    Create or Update Farmer Profile
 * @route   POST /api/farmer/profile
 * @access  Private (Farmer Role)
 */
exports.createProfile = async (req, res) => {
    try {
        // req.user comes from your auth middleware (e.g., verifyToken)
        const userId = req.user.uid; 
        
        const profileData = {
            userId,
            ...req.body // Spread farmLocation, cropsGrown from request
        };

        const farmer = await Farmer.create(profileData);

        res.status(201).json({
            success: true,
            message: "Farmer profile created successfully",
            data: farmer
        });
    } catch (error) {
        console.error("❌ Create Profile Error:", error);
        res.status(500).json({ success: false, message: "Failed to create profile" });
    }
};

/**
 * @desc    Get Farmer Dashboard Data (Stats + Active Contracts)
 * @route   GET /api/farmer/dashboard
 * @access  Private (Farmer Role)
 */
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        // 1. Fetch Farmer Profile
        const profile = await Farmer.findByUserId(userId);
        if (!profile) {
            // If profile doesn't exist, prompt frontend to show "Complete Profile" screen
            return res.status(404).json({ success: false, message: "Farmer profile not found" });
        }

        // 2. Fetch All Contracts for this Farmer
        // Using the generic findAll method from Contract.model.js
        const allContracts = await Contract.findAll({ farmerId: userId });

        // 3. Calculate Dashboard Stats (Business Logic)
        const activeContracts = allContracts.filter(c => c.status === 'Active');
        const completedContracts = allContracts.filter(c => c.status === 'Completed');
        const pendingContracts = allContracts.filter(c => c.status === 'Draft');
        
        // Simple Revenue Calculation (Mock logic for Hackathon)
        // In a real app, you would sum up verified Payment records
        const totalRevenue = completedContracts.reduce((sum, c) => sum + (c.quantity * c.lockedPrice), 0);

        // 4. Construct Unified Response
        const dashboardData = {
            profile: {
                trustScore: profile.trustScore,
                location: profile.farmLocation,
                totalContracts: profile.totalContracts
            },
            stats: {
                active: activeContracts.length,
                pending: pendingContracts.length,
                completed: completedContracts.length,
                totalRevenue: totalRevenue
            },
            recentContracts: activeContracts.slice(0, 5) // Show top 5 active contracts
        };

        res.json({ success: true, data: dashboardData });

    } catch (error) {
        console.error("❌ Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Failed to load dashboard" });
    }
};

/**
 * @desc    Get All Contracts for this Farmer
 * @route   GET /api/farmer/contracts
 * @access  Private
 */
exports.getMyContracts = async (req, res) => {
    try {
        const userId = req.user.uid;
        const contracts = await Contract.findAll({ farmerId: userId });
        res.json({ success: true, count: contracts.length, data: contracts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error fetching contracts" });
    }
};

/**
 * @desc    Update Crop Status (Transparency Feature)
 * @route   PUT /api/farmer/crop/:cropId
 * @access  Private
 */
exports.updateCropStatus = async (req, res) => {
    try {
        const { cropId } = req.params;
        const { status } = req.body; // e.g., "Sown", "Flowering", "Ready for Harvest"

        // 1. Update the Crop Model
        // This update will be visible to the Buyer immediately
        const success = await Crop.updateStatus(cropId, status);

        if (success) {
            res.json({ success: true, message: `Crop status updated to ${status}` });
        } else {
            res.status(400).json({ success: false, message: "Failed to update status" });
        }

    } catch (error) {
        console.error("❌ Update Crop Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};