/**
 * admin.routes.js - Platform Administration API Endpoints
 * * 🎯 PURPOSE:
 * 1. Absolute Authority: These routes are the control panel for the platform.
 * 2. Gatekeeping: Handles user verification (KYC) and quality assurance approvals.
 * 3. Security: STRICTLY protected. Every route here requires the 'admin' role.
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Middleware: Verify Token & Enforce Admin Role
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// =========================================================
// ADMIN ROUTES
// All routes prefixed with /api/admin
// =========================================================

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get high-level platform analytics (Total Volume, Active Deals, Pending Actions)
 * @access  Private (Admin Only)
 */
router.get(
    '/dashboard', 
    verifyToken, 
    checkRole('admin'), 
    adminController.getAnalytics
);

/**
 * @route   POST /api/admin/verify-user
 * @desc    Approve or Reject a user's KYC verification
 * @access  Private (Admin Only)
 * * TRUST: Only verified users can trade large volumes.
 */
router.post(
    '/verify-user', 
    verifyToken, 
    checkRole('admin'), 
    adminController.verifyUser
);

/**
 * @route   POST /api/admin/approve-contract
 * @desc    Moderate a contract (Approve/Reject/Flag suspicious activity)
 * @access  Private (Admin Only)
 */
router.post(
    '/approve-contract', 
    verifyToken, 
    checkRole('admin'), 
    adminController.moderateContract
);

/**
 * @route   POST /api/admin/verify-quality
 * @desc    Finalize a Quality Check report (Human-in-the-loop approval)
 * @access  Private (Admin Only)
 * * QUALITY: This is the final stamp of approval before funds are released.
 */
router.post(
    '/verify-quality', 
    verifyToken, 
    checkRole('admin'), 
    adminController.approveQuality
);

module.exports = router;