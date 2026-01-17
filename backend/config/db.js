

const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Singleton Pattern: Prevent multiple initializations
if (!admin.apps.length) {
    try {
        // 1. Construct Service Account Credentials
        // In a real production app, these come strictly from .env
        // For this Hackathon/Demo, we provide fallbacks or specific formatting handling
        
        const privateKey = process.env.FIREBASE_PRIVATE_KEY 
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') // Fix newlines if loaded from .env
            : undefined;

        // Configuration Object
        const serviceAccount = {
            "type": "service_account",
            "project_id": process.env.FIREBASE_PROJECT_ID || "farmotech-hackathon-demo",
            "private_key_id": process.env.FIREBASE_KEY_ID || "demo-key-id-123",
            "private_key": privateKey, // e.g. "-----BEGIN PRIVATE KEY-----..."
            "client_email": process.env.FIREBASE_CLIENT_EMAIL || "admin@farmotech.iam.gserviceaccount.com"
        };

        // 2. Validate Critical Keys before initializing
        // This prevents the server from crashing hard if keys are missing in the demo
        if (!serviceAccount.privateKey) {
            console.warn(`
            ⚠️  FIREBASE WARNING: Missing 'FIREBASE_PRIVATE_KEY' in .env
            -----------------------------------------------------------
            > Authentication and Database features will likely fail.
            > For the Hackathon Demo, ensure you have set up a Firebase project 
            > and downloaded the Service Account JSON.
            -----------------------------------------------------------
            `);
            // Optional: You might return here or let it throw an error depending on preference
        } else {
            // 3. Initialize the App
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                // databaseURL: "https://your-project.firebaseio.com" // Optional for Firestore
            });
            
            console.log("✅ Firebase Admin SDK Initialized Successfully");
        }

    } catch (error) {
        console.error("❌ Firebase Initialization Error:", error.message);
        console.warn("   -> Ensure your .env file has the correct Service Account details.");
    }
}

// 4. Export Services
// We export these instances so other parts of the backend (like routes) can use them.
const db = admin.firestore(); // Database instance
const auth = admin.auth();    // Authentication instance

module.exports = { db, auth, admin };