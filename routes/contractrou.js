/**
 * contract.routes.js - Contract Lifecycle API Endpoints
 * * 🎯 PURPOSE:
 * 1. Agreement Creation: Handles the initial drafting of contracts where terms are set.
 * 2. Price Locking: The 'Create' endpoint is critical because it establishes the 'lockedPrice',
 * protecting the farmer from future market volatility.
 * 3. Visibility: Allows farmers and buyers to fetch their specific active/past agreements.
 */

const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');

// Middleware: Ensure user is logged in
const { verifyToken } = require('../middleware/auth.middleware');

// =========================================================
// CONTRACT ROUTES
// All routes prefixed with /api/contracts
// =========================================================

/**
 * @route   POST /api/contracts
 * @desc    Create a new Digital Contract
 * @access  Private (Farmer or Buyer)
 * * 🔒 PRICE LOCKING MOMENT:
 * * When this endpoint is hit, the 'lockedPrice' sent in the body is saved.
 * * This value becomes immutable (cannot be changed) even if market prices drop later.
 */
router.post(
    '/', 
    verifyToken, 
    contractController.createContract
);

/**
 * @route   GET /api/contracts
 * @desc    Get all contracts for the logged-in user
 * @access  Private
 * * NOTE: The controller automatically filters this based on the User's Role.
 * * - Farmers see contracts where they are the seller.
 * * - Buyers see contracts where they are the purchaser.
 */
router.get(
    '/', 
    verifyToken, 
    contractController.getContracts
);

/**
 * @route   GET /api/contracts/:id
 * @desc    Get details of a specific contract
 * @access  Private
 */
router.get(
    '/:id', 
    verifyToken, 
    contractController.getContractById
);

/**
 * @route   PUT /api/contracts/:id/status
 * @desc    Manually update contract status (Active/Completed/Cancelled)
 * @access  Private (System/Admin/Automated Logic)
 * * USAGE: Used when a specific milestone is hit (e.g., Logistics confirms delivery).
 */
router.put(
    '/:id/status', 
    verifyToken, 
    contractController.updateStatus
);

module.exports = router;