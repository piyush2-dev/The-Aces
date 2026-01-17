/**
 * buyer.routes.js - Buyer & Marketplace API Endpoints
 * * 🎯 PURPOSE:
 * 1. Marketplace Access: Allows buyers to browse 'Draft' contracts (The Open Market).
 * 2. Purchasing: Handles the 'Accept Contract' action which locks the price and assigns the buyer.
 * 3. Security: Restricted strictly to users with the 'buyer' role.
 */

const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyer.controller');

// Middleware: Verify Token & Check if User is a Buyer
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// =========================================================
// BUYER ROUTES
// All routes prefixed with /api/buyer
// =========================================================

/**
 * @route   POST /api/buyer/profile
 * @desc    Initialize buyer profile (Company Name, Business Type)
 * @access  Private (Buyer)
 */
router.post(
    '/profile', 
    verifyToken, 
    checkRole('buyer'), 
    buyerController.createProfile
);

/**
 * @route   GET /api/buyer/dashboard
 * @desc    Get purchase stats, active deliveries, and spending history
 * @access  Private (Buyer)
 */
router.get(
    '/dashboard', 
    verifyToken, 
    checkRole('buyer'), 
    buyerController.getDashboard
);

/**
 * @route   GET /api/buyer/marketplace
 * @desc    Get all available 'Draft' contracts (The "Contracts" list)
 * @access  Private (Buyer)
 */
router.get(
    '/marketplace', 
    verifyToken, 
    checkRole('buyer'), 
    buyerController.getMarketplace
);

/**
 * @route   POST /api/buyer/contract/:contractId/accept
 * @desc    Accept a contract, lock the price, and move to 'Active' status
 * @access  Private (Buyer)
 * * FLOW: User clicks "Buy Now" -> This route fires -> Contract updates -> Payment flow starts.
 */
router.post(
    '/contract/:contractId/accept', 
    verifyToken, 
    checkRole('buyer'), 
    buyerController.acceptContract
);

module.exports = router;