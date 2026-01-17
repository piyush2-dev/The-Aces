
const Contract = require('../models/Contract.model');

// --- CONTROLLER FUNCTIONS ---

/**
 * @desc    Create a New Digital Contract
 * @route   POST /api/contracts
 * @access  Private (Farmer or Buyer)
 */
exports.createContract = async (req, res) => {
    try {
        const userId = req.user.uid; // From Auth Middleware
        const role = req.user.role;

        console.log(`[CONTRACT] Creation request from ${role}: ${userId}`);

        // Construct contract data
        // Logic: If a Farmer creates it, they are the seller (farmerId). 
        // If a Buyer creates it (Open Bid), they are the purchaser (buyerId).
        const contractData = {
            contractId: `CTR-${Date.now()}`, // Unique Reference
            farmerId: role === 'farmer' ? userId : null,
            buyerId: role === 'buyer' ? userId : null, // If null, it goes to the "Open Marketplace"
            
            // Core Terms
            cropType: req.body.cropType,
            quantity: req.body.quantity,
            qualityStandard: req.body.qualityStandard || "Standard FAQ",
            
            // 🔒 PRICE LOCKING LOGIC
            // This is the most important field. It guarantees the rate.
            lockedPrice: req.body.price, 
            
            deliveryDate: req.body.deliveryDate,
            status: 'Draft', // Always starts as Draft until accepted/paid
            createdAt: new Date().toISOString()
        };

        const newContract = await Contract.create(contractData);

        res.status(201).json({
            success: true,
            message: "Contract created successfully. Terms are now locked.",
            contract: newContract
        });

    } catch (error) {
        console.error("❌ Create Contract Error:", error);
        res.status(500).json({ success: false, message: "Failed to create contract" });
    }
};

/**
 * @desc    Get Contracts (Filtered by User Role)
 * @route   GET /api/contracts
 * @access  Private
 */
exports.getContracts = async (req, res) => {
    try {
        const userId = req.user.uid;
        const role = req.user.role;
        
        // Filter logic based on who is asking
        let filters = {};

        if (role === 'farmer') {
            // Farmers see contracts they are producing
            filters.farmerId = userId;
        } else if (role === 'buyer') {
            // Buyers see contracts they have purchased
            // Note: To see "Available" contracts, they use the Marketplace endpoint in buyer.controller.js
            filters.buyerId = userId;
        } else if (role === 'admin') {
            // Admins see everything
            filters = {}; 
        }

        console.log(`[CONTRACT] Fetching for ${role} with filters:`, filters);

        const contracts = await Contract.findAll(filters);

        res.json({
            success: true,
            count: contracts.length,
            data: contracts
        });

    } catch (error) {
        console.error("❌ Fetch Contracts Error:", error);
        res.status(500).json({ success: false, message: "Error fetching contracts" });
    }
};

/**
 * @desc    Get Single Contract Details
 * @route   GET /api/contracts/:id
 * @access  Private
 */
exports.getContractById = async (req, res) => {
    try {
        // In a real app with Firestore, we'd use a findById model method.
        // Reusing findAll for Hackathon simplicity if findById isn't in model yet.
        const allContracts = await Contract.findAll();
        const contract = allContracts.find(c => c.contractId === req.params.id);

        if (!contract) {
            return res.status(404).json({ success: false, message: "Contract not found" });
        }

        res.json({ success: true, data: contract });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc    Update Contract Status (Manual Override)
 * @route   PUT /api/contracts/:id/status
 * @access  Private (Usually Admin or System Internal)
 * * NOTE: Normal status changes happen via Payment (Active) or Delivery (Completed) controllers.
 * * This endpoint is for manual overrides or specific workflow steps.
 */
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Active', 'Completed', 'Cancelled'

        console.log(`[CONTRACT] Status Update: ${id} -> ${status}`);

        // Validate Status Transitions (Simple State Machine)
        // e.g., Cannot go from 'Draft' to 'Completed' without 'Active'
        // For Hackathon demo, we allow flexible transitions.

        const success = await Contract.updateStatus(id, status);

        if (success) {
            res.json({ success: true, message: `Contract status updated to ${status}` });
        } else {
            res.status(400).json({ success: false, message: "Failed to update status" });
        }

    } catch (error) {
        console.error("❌ Status Update Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};