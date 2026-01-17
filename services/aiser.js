const axios = require('axios'); // Un-comment for real ML API integration

class AIService {

    /**
     * Predict future market price for a crop
     * @param {string} cropType - e.g., 'Wheat', 'Corn', 'Rice'
     * @param {number} currentMarketPrice - Current localized price
     * @returns {Promise<Object>} - { predictedPrice, confidenceScore, trend }
     */
    static async getPricePrediction(cropType, currentMarketPrice) {
        // --- REAL ML IMPLEMENTATION (CONCEPTUAL) ---
        // const response = await axios.post('http://ml-service/predict', { crop: cropType });
        // return response.data;

        // --- HACKATHON MOCK IMPLEMENTATION ---
        console.log(`[AI SERVICE] Generating price prediction for ${cropType}...`);
        
        // Simulate processing delay for realism
        await new Promise(resolve => setTimeout(resolve, 500));

        // Logic: Add random variance (-5% to +15%) to simulate market fluctuation
        const variance = (Math.random() * 0.20) - 0.05; 
        const predictedPrice = Math.round(currentMarketPrice * (1 + variance));
        
        const trends = ['Bullish', 'Bearish', 'Stable'];
        const trend = variance > 0 ? 'Bullish' : (variance < -0.02 ? 'Bearish' : 'Stable');

        return {
            predictedPrice,
            confidenceScore: '87%', // Hardcoded high confidence for demo
            trend,
            currency: 'INR',
            analysisDate: new Date().toISOString()
        };
    }

    /**
     * Forecast market demand
     * @param {string} cropType 
     * @returns {Promise<Object>} - { level: 'High'|'Medium'|'Low', factors: [] }
     */
    static async getDemandForecast(cropType) {
        // Logic: Randomly select demand level based on "seasonality" (simulated)
        const levels = ['High', 'Medium', 'Low'];
        const factorsMap = {
            'High': ['Festive season approaching', 'Low carry-over stock from last year'],
            'Medium': ['Steady industrial consumption', 'Average export demand'],
            'Low': ['Bumper harvest predicted globally', 'Export restrictions in place']
        };

        const randomLevel = levels[Math.floor(Math.random() * levels.length)];

        return {
            level: randomLevel,
            factors: factorsMap[randomLevel],
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Valid for 7 days
        };
    }

    /**
     * Analyze risks (Weather, Pests, Volatility)
     * @param {string} cropType 
     * @param {Object} location - { lat, lng }
     * @returns {Promise<Object>} - { riskScore: 0-100, warnings: [] }
     */
    static async getRiskAnalysis(cropType, location) {
        // Logic: Simulate weather API check
        const isRainySeason = Math.random() > 0.5;
        const riskScore = isRainySeason ? 65 : 20;
        
        const warnings = [];
        if (riskScore > 50) {
            warnings.push('High moisture levels detected - Risk of fungal infection.');
            warnings.push('Price volatility expected due to erratic weather.');
        } else {
            warnings.push('Weather conditions optimal for harvest.');
        }

        return {
            riskScore,
            riskLevel: riskScore > 50 ? 'High' : 'Low',
            warnings,
            mitigationAdvice: riskScore > 50 
                ? 'Recommendation: Apply fungicides and speed up harvest.' 
                : 'Recommendation: Standard storage procedures apply.'
        };
    }

    /**
     * Generate a unified insight report (All-in-one)
     * Used by the main Dashboard to load everything at once
     */
    static async generateFullReport(cropType, currentPrice, location) {
        const priceData = await this.getPricePrediction(cropType, currentPrice);
        const demandData = await this.getDemandForecast(cropType);
        const riskData = await this.getRiskAnalysis(cropType, location);

        return {
            contractId: `AI-REP-${Date.now()}`,
            cropType,
            priceOutlook: priceData,
            demandOutlook: demandData,
            riskAssessment: riskData,
            generatedAt: new Date().toISOString()
        };
    }
}

module.exports = AIService;