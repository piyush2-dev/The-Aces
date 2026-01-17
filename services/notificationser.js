

class NotificationService {

    /**
     * Internal helper to simulate sending a message
     * In Production: This would call `twilio.messages.create()` or `mailer.send()`
     */
    static async _simulateSend(userId, type, message) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));

        const timestamp = new Date().toLocaleTimeString();
        
        // Visual logging for the Demo (So judges can see it happening)
        console.log(`\n============== 🔔 NOTIFICATION SENT ==============`);
        console.log(`TO: User [${userId}]`);
        console.log(`TYPE: ${type}`);
        console.log(`MSG: "${message}"`);
        console.log(`TIME: ${timestamp}`);
        console.log(`==================================================\n`);

        return true;
    }

    /**
     * Notify user about Contract Status changes
     * @param {string} userId - Recipient ID
     * @param {string} contractId - Contract Reference
     * @param {string} status - New Status (e.g., 'Active', 'Completed')
     */
    static async sendContractUpdate(userId, contractId, status) {
        let message = '';
        
        switch (status) {
            case 'Active':
                message = `✅ Good News! Contract ${contractId} has been accepted. Payment is secured in Escrow.`;
                break;
            case 'Completed':
                message = `🎉 Success! Contract ${contractId} is complete. Funds have been released to your wallet.`;
                break;
            case 'Cancelled':
                message = `❌ Alert: Contract ${contractId} was cancelled. Please check the dashboard for details.`;
                break;
            default:
                message = `ℹ️ Update: Contract ${contractId} is now ${status}.`;
        }

        return this._simulateSend(userId, 'CONTRACT_UPDATE', message);
    }

    /**
     * Notify about Payment Events
     * @param {string} userId 
     * @param {number} amount 
     * @param {string} type - 'Credit' or 'Debit'
     */
    static async sendPaymentAlert(userId, amount, type) {
        const emoji = type === 'Credit' ? '💰' : '💸';
        const message = `${emoji} Payment Alert: ₹${amount} has been ${type === 'Credit' ? 'credited to' : 'debited from'} your account.`;
        
        return this._simulateSend(userId, 'PAYMENT_ALERT', message);
    }

    /**
     * High Priority AI Risk Alert
     * @param {string} userId 
     * @param {string} crop 
     * @param {string} riskFactor - e.g., 'Heavy Rain'
     */
    static async sendRiskAlert(userId, crop, riskFactor) {
        const message = `⚠️ URGENT: High risk of '${riskFactor}' detected for your ${crop} crop. Please view the app for mitigation advice.`;
        
        return this._simulateSend(userId, 'RISK_WARNING', message);
    }

    /**
     * Logistics Update
     * @param {string} userId 
     * @param {string} location 
     */
    static async sendDeliveryUpdate(userId, location) {
        const message = `🚚 Logistics Update: Your shipment has reached ${location}.`;
        return this._simulateSend(userId, 'DELIVERY_TRACKING', message);
    }
}

module.exports = NotificationService;