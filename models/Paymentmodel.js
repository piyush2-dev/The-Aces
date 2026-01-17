
const { db } = require('../config/firebase');

const COLLECTION_NAME = 'payments';

class Payment {
    /**
     * @param {Object} data - Payment transaction details
     */
    constructor(data) {
        // Internal Platform ID for this record
        this.paymentId = data.paymentId || `PAY-${Date.now()}`;
        
        // The Contract being paid for
        this.contractId = data.contractId;
        
        // Financials
        this.amount = data.amount; // In INR/Currency Units
        this.currency = data.currency || "INR";
        
        // Status: 'pending' (Order Created) -> 'paid' (Signature Verified) -> 'failed'
        this.paymentStatus = data.paymentStatus || 'pending';
        
        // Gateway Details
        this.paymentMethod = data.paymentMethod || 'razorpay';
        this.razorpayOrderId = data.razorpayOrderId || null; // The Order ID from Razorpay
        this.transactionId = data.transactionId || null;     // The Payment ID (captured after success)
        
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    /**
     * Convert to Firestore-compatible object
     */
    toFirestore() {
        return {
            paymentId: this.paymentId,
            contractId: this.contractId,
            amount: this.amount,
            currency: this.currency,
            paymentStatus: this.paymentStatus,
            paymentMethod: this.paymentMethod,
            razorpayOrderId: this.razorpayOrderId,
            transactionId: this.transactionId,
            createdAt: this.createdAt
        };
    }

    // =========================================================
    // DATABASE OPERATIONS
    // =========================================================

    /**
     * Create Initial Payment Record (Pending State)
     * Called when the Backend generates a Razorpay Order ID
     */
    static async createOrderRecord(contractId, amount, rzpOrderId) {
        try {
            const payment = new Payment({
                contractId,
                amount,
                razorpayOrderId: rzpOrderId,
                paymentStatus: 'pending'
            });

            const docRef = db.collection(COLLECTION_NAME).doc(payment.paymentId);
            await docRef.set(payment.toFirestore());
            
            console.log(`💳 Payment Record Created: ${payment.paymentId} (Order: ${rzpOrderId})`);
            return payment;
        } catch (error) {
            console.error("❌ Error creating payment record:", error.message);
            throw new Error('Database error logging payment');
        }
    }

    /**
     * Update Payment Status to PAID
     * Called when Backend successfully verifies the Razorpay Signature
     * @param {String} rzpOrderId - Look up record by Razorpay Order ID
     * @param {String} rzpPaymentId - The final transaction ID
     */
    static async markAsPaid(rzpOrderId, rzpPaymentId) {
        try {
            // Find the document with this Order ID
            const snapshot = await db.collection(COLLECTION_NAME)
                .where('razorpayOrderId', '==', rzpOrderId)
                .limit(1)
                .get();

            if (snapshot.empty) {
                console.error(`⚠️ Payment record not found for Order: ${rzpOrderId}`);
                return false;
            }

            const doc = snapshot.docs[0];
            
            // Update status
            await doc.ref.update({
                paymentStatus: 'paid',
                transactionId: rzpPaymentId, // Store the proof of payment
                paidAt: new Date().toISOString()
            });
            
            console.log(`✅ Payment Verified & Recorded: ${doc.id}`);
            return true;
        } catch (error) {
            console.error("❌ Error updating payment status:", error.message);
            return false;
        }
    }
}

module.exports = Payment;