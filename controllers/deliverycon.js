
const Delivery = require('../models/Delivery.model');
const Contract = require('../models/Contract.model');

// --- CONTROLLER FUNCTIONS ---

/**
 * @desc    Initiate a Delivery (Dispatch)
 * @route   POST /api/delivery
 * @access  Private (Farmer or Logistics Partner)
 */
exports.startDelivery = async (req, res) => {
    try {
        const { contractId, farmLocation, buyerLocation, estimatedTime } = req.body;

        console.log(`🚚 Dispatching Delivery for Contract: ${contractId}`);

        // 1. Create the Delivery Record
        const deliveryData = {
            contractId,
            farmLocation,   // { lat: ..., lng: ..., address: ... }
            buyerLocation,  // { lat: ..., lng: ..., address: ... }
            currentLocation: farmLocation, // Starts at the farm
            estimatedDeliveryTime: estimatedTime,
            deliveryStatus: 'Dispatched'
        };

        const newDelivery = await Delivery.create(deliveryData);

        // 2. Update Contract Status (Optional but recommended)
        // Helps the UI show "In Transit" instead of just "Active"
        // await Contract.updateStatus(contractId, 'In Transit'); 

        res.status(201).json({
            success: true,
            message: "Delivery started. Tracking is now active.",
            data: newDelivery
        });

    } catch (error) {
        console.error("❌ Start Delivery Error:", error);
        res.status(500).json({ success: false, message: "Failed to initiate delivery" });
    }
};

/**
 * @desc    Update Location & Status
 * @route   PUT /api/delivery/:deliveryId
 * @access  Private (Driver App / IoT Sensor)
 * * NOTE: In a real IoT scenario, this endpoint receives pings from a GPS device every 5 mins.
 */
exports.updateLocation = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { lat, lng, status, estimatedTime } = req.body;

        // Construct update object dynamically
        const updates = {
            currentLocation: { lat, lng },
            lastUpdated: new Date().toISOString()
        };
        
        if (status) updates.deliveryStatus = status; // e.g., 'Arrived at Warehouse'
        if (estimatedTime) updates.estimatedDeliveryTime = estimatedTime;

        // Update Database
        const success = await Delivery.updateProgress(deliveryId, updates);

        if (success) {
            // Trigger WebSocket event here for real-time frontend update (Advanced)
            // io.emit('delivery_update', { deliveryId, ...updates });
            
            res.json({ success: true, message: "Location updated successfully" });
        } else {
            res.status(400).json({ success: false, message: "Failed to update delivery" });
        }

    } catch (error) {
        console.error("❌ Location Update Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Get Delivery Details for Map View
 * @route   GET /api/delivery/contract/:contractId
 * @access  Private (Buyer/Farmer)
 */
exports.getDeliveryStatus = async (req, res) => {
    try {
        const { contractId } = req.params;
        
        const delivery = await Delivery.findByContractId(contractId);
        
        if (!delivery) {
            return res.status(404).json({ success: false, message: "No active delivery found for this contract." });
        }

        res.json({
            success: true,
            data: delivery
        });

    } catch (error) {
        console.error("❌ Fetch Delivery Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Mark as Delivered (Finalize)
 * @route   POST /api/delivery/:deliveryId/complete
 * @access  Private (Buyer or Driver with Proof)
 */
exports.completeDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        
        // 1. Update Delivery Status
        await Delivery.updateProgress(deliveryId, { deliveryStatus: 'Delivered' });

        // 2. Fetch contract ID associated with this delivery to update contract
        // (Implementation depends on if you pass contractId in body or fetch from DB)
        
        res.json({ success: true, message: "Delivery marked as complete." });

    } catch (error) {
        res.status(500).json({ success: false, message: "Action failed" });
    }
};