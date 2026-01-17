
// --- 1. CORE DEPENDENCIES ---
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto'); // For Payment Verification

// Load environment variables from .env file
dotenv.config();

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// --- 2. MIDDLEWARE CONFIGURATION ---
app.use(cors()); // Allow Frontend to access Backend
app.use(express.json()); // Parse JSON bodies
app.use(express.static('public')); // Serve the Frontend files (HTML/CSS/JS)

// --- 3. RAZORPAY CONFIGURATION (Sensitive) ---
// Note: Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are in your .env file
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_S4udspy6Qey72w', // Fallback for demo
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_KEY_HERE'
});

// =========================================================================
// SECTION: ROUTE DEFINITIONS (Modular Logic)
// In production, these would be in separate files inside a /routes folder.
// =========================================================================

/**
 * 🔐 AUTH ROUTES
 * Handles: Login, Register (Mock)
 */
const config = require('./config/env');

// Usage example:
console.log(`Server running on port ${config.port}`);
// config.payment.keySecret is now available securelyconst authRouter = express.Router();

authRouter.post('/login', (req, res) => {
    const { role, email, password } = req.body;
    console.log(`[AUTH] Login attempt: ${email} as ${role}`);
    
    // Mock Validation
    if (password === '123456') {
        res.json({ success: true, message: "Login Successful", token: "mock-jwt-token" });
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
});

const { auth, db } = require('./config/firebase');

// Example: Verify a token sent from Frontend
app.post('/api/verify-token', async (req, res) => {
    const idToken = req.body.token;
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        res.json({ uid: decodedToken.uid, email: decodedToken.email });
    } catch (error) {
        res.status(401).send("Unauthorized");
    }
});
// Mount Auth
app.use('/api/auth', authRouter);


/**
 * 📜 CONTRACT ROUTES
 * Handles: Creating and Fetching Contracts
 */
const contractRouter = express.Router();

// Mock Database for Contracts
let contractsDB = [
    { id: "CTR-001", crop: "Wheat", status: "Active", price: 50000 }
];

contractRouter.get('/', (req, res) => {
    res.json(contractsDB); // Return all contracts
});

contractRouter.post('/create', (req, res) => {
    const newContract = {
        id: `CTR-${Date.now()}`,
        ...req.body,
        status: "Draft",
        createdAt: new Date()
    };
    contractsDB.push(newContract);
    console.log(`[CONTRACT] Created: ${newContract.id}`);
    res.json({ success: true, contract: newContract });
});
// Mount Contracts
app.use('/api/contracts', contractRouter);


/**
 * 💰 PAYMENT ROUTES (Razorpay Integration)
 * Handles: Create Order, Verify Signature
 * ⚠️ SECURITY CRITICAL SECTION
 */
const paymentRouter = express.Router();

// 1. Create Order (Called when user clicks "Pay")
paymentRouter.post('/create-order', async (req, res) => {
    try {
        const { amount, contractId } = req.body;
        console.log(`[PAYMENT] Creating order for ${contractId}, Amount: ${amount}`);

        const options = {
            amount: amount * 100, // Razorpay takes amount in paise (₹1 = 100 paise)
            currency: "INR",
            receipt: `receipt_${contractId.substring(0, 10)}`,
            payment_capture: 1 // Auto capture
        };

        // Call Razorpay API
        const order = await razorpay.orders.create(options);
        
        // Return Order ID to Frontend
        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount
        });

    } catch (error) {
        console.error("[PAYMENT] Create Order Failed:", error);
        res.status(500).json({ success: false, message: "Order creation failed" });
    }
});

// 2. Verify Payment (Called after payment success on frontend)
paymentRouter.post('/verify', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, contractId } = req.body;
    
    console.log(`[PAYMENT] Verifying: ${razorpay_payment_id}`);

    // Create HMAC SHA256 signature using the Secret Key
    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_KEY_HERE')
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

    if (generated_signature === razorpay_signature) {
        // Signature Match = Authenticated
        console.log(`[PAYMENT] Verified! Contract ${contractId} Secured.`);
        
        // Update Contract Status in DB (Mock)
        const contract = contractsDB.find(c => c.id === contractId);
        if(contract) contract.status = "Secured";

        res.json({ success: true, message: "Payment Verified" });
    } else {
        // Signature Mismatch = Potential Fraud
        console.error("[PAYMENT] Signature Verification Failed!");
        res.status(400).json({ success: false, message: "Invalid Signature" });
    }
});
// Mount Payments
app.use('/api/payment', paymentRouter);


/**
 * 🤖 AI ROUTES (Mock / Demo)
 * Handles: Price Prediction, Risk Analysis
 */
const aiRouter = express.Router();

aiRouter.get('/predict-price', (req, res) => {
    // Simulate AI Processing Time
    const { crop } = req.query;
    
    // Mock AI Logic
    const basePrice = 2000;
    const volatility = Math.floor(Math.random() * 500);
    const predicted = basePrice + volatility;

    res.json({
        crop: crop,
        predicted_price: predicted,
        confidence: "94%",
        trend: "Upward"
    });
});
// Mount AI
app.use('/api/ai', aiRouter);


/**
 * 🛠️ ADMIN ROUTES
 * Handles: Verifications
 */
const adminRouter = express.Router();

adminRouter.post('/verify-user', (req, res) => {
    const { userId, action } = req.body; // action: 'approve' or 'reject'
    console.log(`[ADMIN] User ${userId} was ${action}ed`);
    res.json({ success: true, newStatus: action === 'approve' ? 'Verified' : 'Rejected' });
});
// Mount Admin
app.use('/api/admin', adminRouter);


// =========================================================================
// SECTION: SERVER STARTUP
// =========================================================================

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Listening
app.listen(PORT, () => {
    console.log(`
    =============================================
    🚀 FarmoTech Backend Running on Port ${PORT}
    =============================================
    - Frontend: http://localhost:${PORT}
    - API Auth: http://localhost:${PORT}/api/auth
    - API Pay : http://localhost:${PORT}/api/payment
    - API AI  : http://localhost:${PORT}/api/ai
    =============================================
    `);
});