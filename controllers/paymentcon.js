
const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config/env');
const Payment = require('../models/Payment.model');
const Contract = require('../models/Contract.model');

// Initialize Razorpay Instance with Credentials from .env
const razorpay = new Razorpay({
    key_id: config.payment.keyId,
    key_secret: config.payment.keySecret
});

// --- CONTROLLER FUNCTIONS ---

/**
 * @desc    Create a New Payment Order
 * @route   POST /api/payment/create-order
 * @access  Private (Buyer)
 * * FLOW: Frontend requests payment -> Backend asks Razorpay -> Razorpay gives Order ID -> Backend logs it -> Returns ID to Frontend.
 */
exports.createOrder = async (req, res) => {
    try {
        const { contractId, amount } = req.body;

        console.log(`[PAYMENT] Initiating order for Contract: ${contractId}, Amount: ${amount}`);

        // 1. Construct Options for Razorpay
        // Note: Razorpay expects amount in the smallest currency unit (paise for INR). 
        // Example: ₹500.00 = 50000 paise.
        const options = {
            amount: Math.round(amount * 100), 
            currency: "INR",
            receipt: `rcpt_${contractId}_${Date.now().toString().slice(-8)}`,
            payment_capture: 1 // Auto-capture payment on success
        };

        // 2. Call Razorpay API
        const order = await razorpay.orders.create(options);

        // 3. Log the "Pending" transaction in our database
        // This ensures we have a record even if the user closes the browser before paying
        await Payment.createOrderRecord(contractId, amount, order.id);

        // 4. Send Order Details to Frontend
        res.json({
            success: true,
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            key_id: config.payment.keyId, // Safe to send Public Key
            // NEVER send key_secret here!
        });

    } catch (error) {
        console.error("❌ Razorpay Order Error:", error);
        res.status(500).json({ success: false, message: "Failed to initiate payment gateway." });
    }
};

/**
 * @desc    Verify Payment Signature (Critical Security Step)
 * @route   POST /api/payment/verify
 * @access  Private
 * * FLOW: User pays on Frontend -> Razorpay returns Signature -> Frontend sends to Backend -> Backend verifies -> DB Updated.
 */
exports.verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            contractId 
        } = req.body;

        console.log(`[PAYMENT] Verifying Transaction: ${razorpay_payment_id}`);

        // 1. Reconstruct the Signature locally using our Secret Key
        // Formula: HMAC_SHA256(order_id + "|" + payment_id, secret)
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        
        const expectedSignature = crypto
            .createHmac('sha256', config.payment.keySecret)
            .update(body.toString())
            .digest('hex');

        // 2. Compare Signatures
        if (expectedSignature === razorpay_signature) {
            
            console.log("✅ Signature Matched! Payment is authentic.");

            // 3. Update Payment Record to 'Paid'
            await Payment.markAsPaid(razorpay_order_id, razorpay_payment_id);
            
            // 4. Activate the Contract
            // This is the business logic trigger: Money received -> Contract becomes binding.
            await Contract.updateStatus(contractId, 'Active');

            res.json({ 
                success: true, 
                message: "Payment Verified. Contract is now Active." 
            });

        } else {
            // Signature mismatch means someone tried to tamper with the response
            console.warn("⚠️ SECURITY ALERT: Invalid Signature detected!");
            res.status(400).json({ success: false, message: "Security Error: Invalid Signature" });
        }

    } catch (error) {
        console.error("❌ Verification Logic Error:", error);
        res.status(500).json({ success: false, message: "Server error during verification." });
    }
};