/**
 * auth.routes.js - Authentication Endpoints
 * * 🎯 PURPOSE:
 * 1. Entry Point: Defines the API URL structure for user access (e.g., /api/auth/login).
 * 2. Separation: Keeps URL definitions separate from business logic (controller).
 * 3. Security: Uses middleware to protect routes that require a logged-in user.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware'); // Optional: For fetching current user

// =========================================================
// PUBLIC ROUTES (No Token Required)
// =========================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Farmer/Buyer/Admin)
 * @access  Public
 * @body    { name, email, password, role, phone, ... }
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user & return token/profile
 * @access  Public
 * @body    { email, password } OR { idToken }
 */
router.post('/login', authController.login);

// =========================================================
// PROTECTED ROUTES (Token Required)
// =========================================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user's profile
 * @access  Private (Requires valid Bearer Token)
 */
router.get('/me', verifyToken, authController.getMe);

module.exports = router;