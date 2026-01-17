/**
 * payment.routes.js - Payment Gateway API Endpoints
 * * 🎯 PURPOSE:
 * 1. Security: Handles all communication with Razorpay. Crucially, it keeps the 
 * RAZORPAY_KEY_SECRET on the server, never exposing it to the client.
 * 2. Verification: Provides the endpoint to verify cryptographic signatures, 
 * preventing users from faking a successful payment response.
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Middleware: Ensure user is logged in
const { verifyToken } = require('../middleware/auth.middleware');

// =========================================================
// PAYMENT ROUTES
// All routes prefixed with /api/payment
// =========================================================

/**
 * @route   POST /api/payment/create-order
 * @desc    Initiate a payment order with Razorpay
 * @access  Private (Buyer)
 * * SECURITY:
 * * This must happen on the backend. If done on frontend, you would have to 
 * * expose your API keys, which is a major security vulnerability.
 */
router.post(
    '/create-order', 
    verifyToken, 
    paymentController.createOrder
);

/**
 * @route   POST /api/payment/verify
 * @desc    Verify the payment signature sent by the frontend
 * @access  Private
 * * FLOW: 
 * * 1. Frontend receives success payload from Razorpay.
 * * 2. Frontend sends payload (signature) to this endpoint.
 * * 3. Backend recalculates signature using SECRET key.
 * * 4. If they match, the payment is marked as valid in the DB.
 */
router.post(
    '/verify', 
    verifyToken, 
    paymentController.verifyPayment
);

module.exports = router;