
const dotenv = require('dotenv');
const path = require('path');

// 1. Load environment variables from .env file
// We assume .env is located in the root folder of the project
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 2. Define Configuration Object
const config = {
    // Server Configuration
    port: process.env.PORT || 3000,
    
    // Database Configuration (MongoDB)
    // Defaulting to local instance for hackathon if cloud URI is missing
    dbUri: process.env.DB_URI || 'mongodb://localhost:27017/farmotech_dev',

    // Authentication Secret (JWT)
    // ⚠️ In production, this must be a long, random string
    jwtSecret: process.env.JWT_SECRET || 'farmotech_hackathon_secret_key_2024',

    // Payment Gateway (Razorpay)
    payment: {
        // It is safe to expose Key ID (Public), but we prefer loading from env
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_S4udspy6Qey72w',
        // 🚨 CRITICAL: Never hardcode the Key Secret here. Must come from .env
        keySecret: process.env.RAZORPAY_KEY_SECRET
    },

    // Integrations
    googleMapsKey: process.env.GOOGLE_MAPS_API_KEY,
    
    // AI Service Endpoint (Python/Flask Service)
    // Defaults to localhost if running the AI model locally
    aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:5000/api/predict'
};

// 3. Validation Logic
// Checks if essential secrets are missing and warns the developer
const requiredVariables = [
    { key: 'RAZORPAY_KEY_SECRET', path: 'payment.keySecret' },
    { key: 'DB_URI', path: 'dbUri' }
];

const missingKeys = requiredVariables.filter(item => {
    // Check if the value exists in our config object
    const value = item.path.split('.').reduce((obj, i) => obj[i], config);
    return !value;
});

if (missingKeys.length > 0) {
    console.warn(`
    ⚠️  WARNING: Missing Critical Environment Variables!
    ---------------------------------------------------
    The following keys are missing in your .env file:
    ${missingKeys.map(k => ` - ${k.key}`).join('\n')}
    
    > Some features (Payments/DB) may crash or fail.
    ---------------------------------------------------
    `);
} else {
    console.log("✅ Environment configuration loaded successfully.");
}

// 4. Export the module
module.exports = config;