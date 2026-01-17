
// Mock Base Prices (In INR per Quintal)
// In production, these would fetch from an external API (e.g., e-NAM or Gov Mandi APIs)
const MARKET_RATES = {
    'Wheat': 2125,
    'Rice': 2060,
    'Corn': 1960,
    'Soybean': 4600,
    'Cotton': 6380,
    'Potato': 1200
};

class PricingService {

    /**
     * Calculate the suggested 'Fair Price' for a contract
     * Used when a farmer is creating a Draft contract
     * @param {string} cropType 
     * @param {number} quantity - Amount in Tons
     * @returns {Object} - Breakdown of the calculation
     */
    static getSuggestedPrice(cropType, quantity) {
        // Convert Tons to Quintals (1 Ton = 10 Quintals)
        const quantityInQuintals = quantity * 10;
        
        const baseRate = MARKET_RATES[cropType] || 2000; // Default fallback
        
        // Add a small "Premium" (5%) for quality assurance promised by the platform
        const premiumRate = Math.round(baseRate * 1.05);
        const totalValue = premiumRate * quantityInQuintals;

        return {
            crop: cropType,
            marketRatePerQuintal: baseRate,
            suggestedRatePerQuintal: premiumRate,
            totalContractValue: totalValue,
            currency: 'INR',
            note: 'Includes 5% quality premium'
        };
    }

    /**
     * Validate a User-Proposed Price
     * Ensures the Buyer isn't undercutting the Farmer (Exploitation Check)
     * @param {string} cropType 
     * @param {number} proposedPricePerQuintal 
     * @returns {Object} - { isValid: boolean, message: string }
     */
    static validatePriceRange(cropType, proposedPricePerQuintal) {
        const baseRate = MARKET_RATES[cropType] || 2000;
        
        // Rule: Price cannot be lower than 10% below market rate (Safety Net)
        const minimumAcceptable = baseRate * 0.90;
        
        // Rule: Price cannot be absurdly high (Anti-Money Laundering basic check)
        const maximumAcceptable = baseRate * 2.5;

        if (proposedPricePerQuintal < minimumAcceptable) {
            return {
                isValid: false,
                message: `⚠️ Unfair Price: ₹${proposedPricePerQuintal} is too low. Market rate is ₹${baseRate}. System minimum is ₹${Math.round(minimumAcceptable)}.`
            };
        }

        if (proposedPricePerQuintal > maximumAcceptable) {
            return {
                isValid: false,
                message: `⚠️ Price Flagged: Offer is suspiciously high above market averages.`
            };
        }

        return { isValid: true, message: "Price is within fair range." };
    }

    /**
     * The "Locking" Logic
     * Finalizes the price before contract creation
     */
    static finalizeLockPrice(cropType, agreedPrice) {
        return {
            amount: agreedPrice,
            lockedAt: new Date().toISOString(),
            lockId: `LCK-${Math.floor(Math.random() * 100000)}`, // Unique ID for the price lock event
            status: 'IMMUTABLE'
        };
    }
}

module.exports = PricingService;