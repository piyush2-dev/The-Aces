/**
 * delivery.routes.js - Logistics & GPS Tracking Endpoints
 * * 🎯 PURPOSE:
 * 1. Tracking: Allows the frontend to fetch the current location of goods using the Contract ID.
 * 2. Updates: Receives GPS pings (from a driver app or IoT device) to update the database.
 * 3. Visibility: Powers the Google Maps visualization on the dashboard.
 */

const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');

// Middleware: Verify Token
const { verifyToken } = require('../middleware/auth.middleware');

// =========================================================
// DELIVERY ROUTES
// All routes prefixed with /api/delivery
// =========================================================

/**
 * @route   POST /api/delivery
 * @desc    Start a new delivery dispatch
 * @access  Private (Farmer/Logistics)
 */
router.post(
    '/', 
    verifyToken, 
    deliveryController.startDelivery
);

/**
 * @route   GET /api/delivery/status/:contractId
 * @desc    Get current location and status for a specific contract
 * @access  Private
 * * USED BY: Google Maps Component on the Frontend to plot the marker.
 */
router.get(
    '/status/:contractId', 
    verifyToken, 
    deliveryController.getDeliveryStatus
);

/**
 * @route   PUT /api/delivery/:deliveryId
 * @desc    Update current GPS location and delivery status
 * @access  Private (Driver/IoT)
 * * NOTE: We use PUT (Idempotent) instead of POST for updates, following REST best practices.
 * * Payload: { lat: 28.7, lng: 77.1, status: 'In Transit' }
 */
router.put(
    '/:deliveryId', 
    verifyToken, 
    deliveryController.updateLocation
);

/**
 * @route   POST /api/delivery/:deliveryId/complete
 * @desc    Mark delivery as 'Delivered' (Final Step)
 * @access  Private
 */
router.post(
    '/:deliveryId/complete', 
    verifyToken, 
    deliveryController.completeDelivery
);

module.exports = router;