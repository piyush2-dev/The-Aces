

const admin = require('firebase-admin');
const config = require('./env'); // Import centralized config if needed

// Check if Firebase is already initialized to prevent errors
if (!admin.apps.length) {
    try {
        // 1. Load Credentials
        // Ideally, these come from your .env file or a service-account.json file
        const serviceAccount = {
            "type": "service_account",
            "project_id": process.env.FIREBASE_PROJECT_ID || "farmotech-demo",
            "private_key_id": process.env.FIREBASE_KEY_ID || "demo-key-id",
            // Handle newlines in private keys properly (common issue in .env files)
            "private_key": (process.env.FIREBASE_PRIVATE_KEY || 
                "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ...\n-----END PRIVATE KEY-----")
                .replace(/\\n/g, '\n'),
            "client_email": process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk@farmotech-demo.iam.gserviceaccount.com",
            "client_id": process.env.FIREBASE_CLIENT_ID || "1234567890",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token"
        };

        // 2. Initialize the App
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        console.log("✅ Firebase Admin SDK Initialized Successfully");

    } catch (error) {
        console.error("❌ Firebase Initialization Error:", error.message);
        console.warn("   -> Ensure FIREBASE_PRIVATE_KEY is set in .env");
    }
}

// 3. Export Services
// These instances can now be used throughout your backend
const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, admin };