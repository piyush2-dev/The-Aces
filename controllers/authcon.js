

const { admin } = require('../config/firebase');
const User = require('../models/User.model');
const Farmer = require('../models/Farmer.model');
const Buyer = require('../models/Buyer.model');

// --- CONTROLLER FUNCTIONS ---

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone, locationData } = req.body;

        console.log(`[AUTH] Registering new ${role}: ${email}`);

        // 1. Create User in Firebase Auth (The Identity Provider)
        // In a full client-side app, this usually happens on the frontend.
        // For this backend-driven demo, we create it here.
        let userRecord;
        try {
            userRecord = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: name,
                phoneNumber: phone || undefined // Optional
            });
        } catch (firebaseError) {
            // Handle "Email already exists" gracefully
            if (firebaseError.code === 'auth/email-already-exists') {
                return res.status(409).json({ success: false, message: "Email already registered." });
            }
            throw firebaseError;
        }

        // 2. Create Base User Profile in Firestore (The App Database)
        const newUser = {
            userId: userRecord.uid,
            name,
            email,
            phone,
            role,
            isVerified: role === 'admin' ? true : false, // Auto-verify admins for demo only
            createdAt: new Date().toISOString()
        };

        await User.create(newUser);

        // 3. Create Role-Specific Profile (Farmer vs Buyer)
        if (role === 'farmer') {
            await Farmer.create({
                userId: userRecord.uid,
                farmerId: `FRM-${Date.now()}`,
                farmLocation: locationData || {}, // Lat/Lng from frontend
                trustScore: 50 // Default start
            });
        } else if (role === 'buyer') {
            await Buyer.create({
                userId: userRecord.uid,
                buyerId: `BYR-${Date.now()}`,
                companyName: req.body.companyName || name,
                businessType: req.body.businessType || 'Retailer'
            });
        }

        // 4. Success Response
        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: { uid: userRecord.uid, email, role }
        });

    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ success: false, message: "Registration failed", error: error.message });
    }
};

/**
 * @desc    Login User (Mock/Demo Version)
 * @route   POST /api/auth/login
 * @access  Public
 * * NOTE: In a real Firebase app, login happens on the Frontend (client SDK).
 * * The client gets an ID Token and sends it to the backend.
 * * For this Hackathon API demo, we simulate a login check or verify a passed token.
 */
exports.login = async (req, res) => {
    try {
        // Option A: Client sends a Firebase ID Token (Best Practice)
        const { idToken } = req.body;

        if (idToken) {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const userProfile = await User.findById(decodedToken.uid);
            
            return res.json({
                success: true,
                message: "Login successful (Token Verified)",
                user: userProfile
            });
        }

        // Option B: Mock Login (Username/Pass) for API testing without frontend
        // ⚠️ ONLY FOR DEMO/TESTING. Backend cannot verify password directly with Firebase Admin SDK.
        // We assume successful auth if we find the user in our DB (simulated).
        const { email } = req.body;
        console.log(`[AUTH] Mock Login Attempt for: ${email}`);
        
        // Find user by email (Requires database query, assuming we can search users)
        // Firebase Admin doesn't support searching by email directly in Firestore easily without index.
        // For demo: We fetch the user record from Auth
        const userRecord = await admin.auth().getUserByEmail(email);
        const userProfile = await User.findById(userRecord.uid);

        if (!userProfile) {
            return res.status(404).json({ success: false, message: "User profile not found." });
        }

        res.json({
            success: true,
            message: "Login successful (Mock Mode)",
            token: "mock-jwt-token-xyz", // In real app, issue a JWT here
            user: userProfile
        });

    } catch (error) {
        console.error("❌ Login Error:", error.message);
        res.status(401).json({ success: false, message: "Authentication failed" });
    }
};

/**
 * @desc    Get Current User Profile
 * @route   GET /api/auth/me
 * @access  Private (Requires Token)
 */
exports.getMe = async (req, res) => {
    try {
        // Assumes middleware has attached `req.user`
        const userId = req.user.uid;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};