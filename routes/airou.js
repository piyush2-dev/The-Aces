/**
 * ai.routes.js - AI & Predictive Analytics Endpoints
 * * 🎯 PURPOSE:
 * 1. Forecasting: Exposes endpoints for Price, Demand, and Risk analysis.
 * 2. Decision Support: These routes feed the "AI Advisor" cards on the frontend.
 * 3. Simplicity: While distinct endpoints are provided for clarity, they share the same
 * underlying logic (or mock generator) for this Hackathon demo.
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Middleware: Verify Token
const { verifyToken } = require('../middleware/auth.middleware');

// =========================================================
// AI ROUTES
// All routes prefixed with /api/ai
// =========================================================

/**
 * @route   GET /api/ai/price-prediction
 * @desc    Get projected market rates for a specific crop
 * @access  Private
 * @query   ?crop=Wheat&location=Punjab
 */
router.get(
    '/price-prediction', 
    verifyToken, 
    aiController.getPrediction
);

/**
 * @route   GET /api/ai/demand-forecast
 * @desc    Get High/Medium/Low demand indicators
 * @access  Private
 * * DEMO NOTE: Returns mock trend analysis based on seasonality logic.
 */
router.get(
    '/demand-forecast', 
    verifyToken, 
    aiController.getPrediction
);

/**
 * @route   GET /api/ai/risk-analysis
 * @desc    Get weather and pest risk assessment
 * @access  Private
 * * DEMO NOTE: Simulates external data API calls (OpenWeather/AgroMonitoring).
 */
router.get(
    '/risk-analysis', 
    verifyToken, 
    aiController.getPrediction
);

/**
 * @route   GET /api/ai/history/:contractId
 * @desc    Get past predictions vs actuals (for accuracy charts)
 * @access  Private
 */
router.get(
    '/history/:contractId', 
    verifyToken, 
    aiController.getInsightHistory
);

module.exports = router;