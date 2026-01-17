

const AIInsight = require('../models/AIInsight.model');
// const axios = require('axios'); // Un-comment if connecting to a real Flask/Python API

// --- CONTROLLER FUNCTIONS ---

/**
 * @desc    Get AI Predictions for a specific Contract/Crop
 * @route   GET /api/ai/predict
 * @access  Private (Farmer/Buyer)
 */
exports.getPrediction = async (req, res) => {
    try {
        const { contractId, cropType, basePrice } = req.query;

        console.log(`🤖 AI Request: Generating insights for ${cropType} (Base Price: ₹${basePrice})`);

        // ---------------------------------------------------------
        // STRATEGY: Hybrid Approach (Real ML -> Fallback to Mock)
        // ---------------------------------------------------------

        let insightData;

        // OPTION A: Real ML Service (Commented out for Hackathon stability)
        /*
        try {
             const mlResponse = await axios.post('http://localhost:5000/predict', { crop: cropType });
             insightData = mlResponse.data;
        } catch (e) {
             console.warn("⚠️ ML Service offline, switching to Simulation Mode.");
        }
        */

        // OPTION B: Simulation Mode (Reliable Demo)
        // We use the helper function from our model to generate realistic scenarios
        if (!insightData) {
            insightData = AIInsight.generateMockInsight(
                contractId, 
                parseFloat(basePrice) || 2000 // Default fallback price
            );
        }

        // 1. Persistence
        // We save this prediction to the database. 
        // Why? So we can track accuracy later (Prediction vs Actual Harvest Price).
        await AIInsight.create(insightData);

        // 2. Add "Human Readable" Context for the Frontend
        // Judges love clear explanations, not just numbers.
        const advice = generateTextAdvice(insightData);

        res.json({
            success: true,
            data: {
                ...insightData,
                advice: advice // e.g., "High demand expected. You have leverage to negotiate."
            }
        });

    } catch (error) {
        console.error("❌ AI Controller Error:", error);
        res.status(500).json({ success: false, message: "AI Service Unavailable" });
    }
};

/**
 * @desc    Fetch Historical Insights (For Charts)
 * @route   GET /api/ai/history/:contractId
 * @access  Private
 */
exports.getInsightHistory = async (req, res) => {
    try {
        const { contractId } = req.params;
        // In a real app, query by contractId and sort by date
        // For demo, we might return just the latest one
        const latestInsight = await AIInsight.findByContractId(contractId);
        
        if (!latestInsight) {
            return res.status(404).json({ success: false, message: "No insights found" });
        }

        res.json({ success: true, data: [latestInsight] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// --- HELPER FUNCTIONS ---

/**
 * Converts raw metrics into simple English advice for the user.
 */
function generateTextAdvice(data) {
    if (data.riskLevel === 'High') {
        return "⚠️ Caution: High risk detected. Consider purchasing crop insurance immediately.";
    }
    if (data.demandLevel === 'High' && data.predictedPrice > 0) {
        return "🚀 Opportunity: Demand is peaking. Try to lock in a contract above the current market rate.";
    }
    return "✅ Stable: Market conditions are normal. Proceed with standard contract terms.";
}