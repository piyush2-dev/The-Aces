/**
 * farmer.routes.js - Farmer API Endpoints
 * * 🎯 PURPOSE:
 * 1. Role Protection: Uses middleware to ensure ONLY users with role='farmer' can access these routes.
 * 2. Workflow: Maps the journey from Profile Creation -> Dashboard View -> Crop Updates.
 * 3. Organization: Keeps farmer-specific URLs grouped under /api/farmer.
 */

const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmer.controller');

// Middleware for security (Token + Role Check)
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// =========================================================
// FARMER ROUTES
// All routes here are prefixed with /api/farmer
// =========================================================

/**
 * @route   POST /api/farmer/profile
 * @desc    Create or update the initial farmer profile (Location, Crops)
 * @access  Private (Farmer only)
 */
router.post(
    '/profile', 
    verifyToken, 
    checkRole('farmer'), 
    farmerController.createProfile
);

/**
 * @route   GET /api/farmer/dashboard
 * @desc    Get aggregated stats (Revenue, Active Contracts, Trust Score)
 * @access  Private (Farmer only)
 * * FLOW: Frontend calls this immediately after login to populate the main screen.
 */
router.get(
    '/dashboard', 
    verifyToken, 
    checkRole('farmer'), 
    farmerController.getDashboard
);

/**
 * @route   GET /api/farmer/contracts
 * @desc    Fetch list of all contracts belonging to this farmer
 * @access  Private (Farmer only)
 */
router.get(
    '/contracts', 
    verifyToken, 
    checkRole('farmer'), 
    farmerController.getMyContracts
);

/**
 * @route   PUT /api/farmer/crop/:cropId
 * @desc    Update crop status (e.g., "Sown" -> "Harvested")
 * @access  Private (Farmer only)
 * * TRANSPARENCY: This update is immediately visible to the Buyer.
 */
router.put(
    '/crop/:cropId', 
    verifyToken, 
    checkRole('farmer'), 
    farmerController.updateCropStatus
);

module.exports = router;