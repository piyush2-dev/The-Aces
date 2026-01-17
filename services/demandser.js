

class DemandService {

    /**
     * Get the current demand level for a specific crop
     * @param {string} cropType 
     * @returns {Object} - { level: 'High'|'Medium'|'Low', score: 0-100, reasoning: string }
     */
    static getDemandLevel(cropType) {
        // --- MOCK LOGIC FOR DEMO ---
        // In reality, this would query government export data or local mandi volume.
        
        const staples = ['Rice', 'Wheat', 'Onion', 'Potato'];
        const cashCrops = ['Cotton', 'Sugarcane', 'Soybean'];
        
        // 1. Base Score Calculation
        let baseScore = 50; // Neutral start

        // Staples almost always have consistent demand
        if (staples.includes(cropType)) baseScore += 20;
        
        // 2. Volatility Simulation (Random fluctuation for Hackathon demo)
        // Adds a value between -10 and +20
        const marketFluctuation = Math.floor(Math.random() * 30) - 10;
        const finalScore = Math.min(100, Math.max(0, baseScore + marketFluctuation));

        // 3. Classification
        let level = 'Medium';
        let reasoning = "Stable consumption patterns observed.";

        if (finalScore > 75) {
            level = 'High';
            reasoning = "Shortage detected in local mandis. Buyers are aggressively bidding.";
        } else if (finalScore < 35) {
            level = 'Low';
            reasoning = "Surplus stock from previous harvest is depressing prices.";
        }

        return {
            crop: cropType,
            level,
            demandScore: finalScore, // 0 to 100
            reasoning,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Analyze Seasonal Trends (Future Looking)
     * Helps farmers plan *next* season's crop
     * @param {string} cropType 
     */
    static getSeasonalForecast(cropType) {
        // Simple mock calendar logic
        const currentMonth = new Date().getMonth(); // 0-11
        
        // Example: Wheat is typically harvested in Spring (March/April in India)
        // Demand peaks just before harvest (low stock) or during export windows.
        
        const upcomingTrend = (currentMonth > 8) 
            ? "Rising (Winter Demand)" 
            : "Stable";

        return {
            trend: upcomingTrend,
            peakDemandMonth: "October", // Mock example
            advice: "Hold stock until late Q3 for better pricing."
        };
    }
}

module.exports = DemandService;