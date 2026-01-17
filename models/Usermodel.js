
const { db } = require('../config/firebase'); // Import Firestore instance

const COLLECTION_NAME = 'users';

class User {
    /**
     * @param {Object} data - The user data object
     */
    constructor(data) {
        this.userId = data.userId;        // Unique ID from Firebase Auth
        this.name = data.name;            // Full Name
        this.email = data.email;          // Contact Email
        this.phone = data.phone || "";    // Phone Number (Optional)
        this.role = data.role || "farmer";// Role: 'farmer', 'buyer', or 'admin'
        this.isVerified = data.isVerified || false; // Admin approval status
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    /**
     * Converts the class instance to a plain JavaScript object
     * Firestore cannot save Class instances directly.
     */
    toFirestore() {
        return {
            userId: this.userId,
            name: this.name,
            email: this.email,
            phone: this.phone,
            role: this.role,
            isVerified: this.isVerified,
            createdAt: this.createdAt
        };
    }

    // =========================================================
    // DATABASE OPERATIONS (Static Helper Functions)
    // =========================================================

    /**
     * Create or Overwrite a User in Firestore
     * @param {Object} userData - Raw user data
     * @returns {Object} - The created user object
     */
    static async create(userData) {
        try {
            const user = new User(userData);
            const userRef = db.collection(COLLECTION_NAME).doc(user.userId);
            
            // .set() creates or overwrites the document with the specific ID
            await userRef.set(user.toFirestore());
            
            console.log(`✅ User Created: ${user.name} (${user.role})`);
            return user.toFirestore();
        } catch (error) {
            console.error("❌ Error creating user:", error.message);
            throw new Error('Failed to create user in database');
        }
    }

    /**
     * Fetch a single User by ID
     * @param {String} userId - The Firebase Auth UID
     * @returns {Object|null} - User data or null if not found
     */
    static async findById(userId) {
        try {
            const userRef = db.collection(COLLECTION_NAME).doc(userId);
            const doc = await userRef.get();

            if (!doc.exists) {
                console.warn(`⚠️ User not found: ${userId}`);
                return null;
            }

            return doc.data();
        } catch (error) {
            console.error("❌ Error fetching user:", error.message);
            throw new Error('Database error while fetching user');
        }
    }

    /**
     * (Optional) Update verification status
     * Used by Admins to verify farmers/buyers
     */
    static async verifyUser(userId) {
        try {
            await db.collection(COLLECTION_NAME).doc(userId).update({
                isVerified: true
            });
            return true;
        } catch (error) {
            console.error("❌ Error verifying user:", error.message);
            return false;
        }
    }
}

module.exports = User;