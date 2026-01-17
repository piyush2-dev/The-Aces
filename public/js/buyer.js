

// --- 1. MOCK DATA ---

let buyerStats = {
    available: 142,
    accepted: 28,
    deliveries: 12
};

// Available Contracts in the Marketplace
let marketplaceData = [
    { 
        id: "CTR-8821", 
        crop: "Premium Wheat", 
        farmer: "Ravi Kumar", 
        img: "#ddd", 
        quantity: "50 Tons", 
        price: 42000, // Total price for demo logic
        date: "Oct 15, 2024", 
        quality: "A+ (98%)",
        qualityColor: "#16A34A"
    },
    { 
        id: "CTR-9102", 
        crop: "Yellow Maize", 
        farmer: "Sarah Jenkins", 
        img: "#bbb", 
        quantity: "120 Tons", 
        price: 25000, 
        date: "Sep 30, 2024", 
        quality: "A (92%)",
        qualityColor: "#16A34A"
    },
    { 
        id: "CTR-9943", 
        crop: "Soybeans", 
        farmer: "Amit Singh", 
        img: "#999", 
        quantity: "30 Tons", 
        price: 55000, 
        date: "Nov 01, 2024", 
        quality: "B+ (88%)",
        qualityColor: "#D97706"
    }
];

// Active Deliveries (Logistics)
let logisticsData = [
    {
        id: "LOG-101",
        contractRef: "Contract #8821 - Wheat",
        status: "In Transit",
        statusColor: "var(--accent-blue)",
        from: "Punjab Farms",
        to: "Central Warehouse A",
        progress: 75,
        eta: "4 Hours",
        mapIcon: "fas fa-truck-moving"
    },
    {
        id: "LOG-102",
        contractRef: "Contract #9102 - Tomatoes",
        status: "Quality Check",
        statusColor: "#D97706",
        from: "Local Collection Center",
        to: "Processing Gate 2",
        progress: 95,
        eta: "Verifying",
        mapIcon: "fas fa-clipboard-check"
    }
];

// --- 2. INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Buyer Dashboard Loaded");
    
    updateStatsUI();
    renderMarketplace();
    renderLogistics();
});

// --- 3. RENDER FUNCTIONS ---

/**
 * Updates the top KPI cards
 */
function updateStatsUI() {
    document.querySelector('.kpi-card:nth-child(1) h3').innerText = buyerStats.available;
    document.querySelector('.kpi-card:nth-child(2) h3').innerText = buyerStats.accepted;
    document.querySelector('.kpi-card:nth-child(3) h3').innerText = buyerStats.deliveries;
}

/**
 * Renders the Marketplace Table
 */
function renderMarketplace() {
    const tableBody = document.querySelector('.data-table-container tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    marketplaceData.forEach(item => {
        const row = `
            <tr id="row-${item.id}">
                <td style="font-weight: 600; color: var(--primary-dark);">${item.crop}</td>
                <td>
                    <div class="farmer-profile">
                        <div class="farmer-img" style="background: ${item.img};"></div> 
                        <span>${item.farmer}</span>
                    </div>
                </td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toLocaleString()}</td>
                <td>${item.date}</td>
                <td><span style="color: ${item.qualityColor}; font-weight:600;">${item.quality}</span></td>
                <td style="text-align: right;">
                    <button onclick="viewContract('${item.id}')" class="btn-action btn-view">View</button>
                    <button onclick="initiateAcceptance('${item.id}', ${item.price})" class="btn-action btn-accept">Accept & Pay</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    if (marketplaceData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">No contracts available matching your filters.</td></tr>';
    }
}

/**
 * Renders Logistics Cards
 */
function renderLogistics() {
    const grid = document.querySelector('.logistics-grid');
    if (!grid) return;

    grid.innerHTML = '';

    logisticsData.forEach(item => {
        const card = `
            <div class="logistics-card">
                <div class="delivery-item">
                    <div class="map-placeholder"><i class="${item.mapIcon}"></i></div>
                    <div class="delivery-info">
                        <div class="delivery-meta">
                            <span>${item.contractRef}</span>
                            <span style="color: ${item.statusColor};">${item.status}</span>
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">From: ${item.from} &rarr; To: ${item.to}</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${item.progress}%; background-color: ${item.statusColor}"></div>
                        </div>
                        <p style="font-size: 0.8rem; text-align: right;">${item.progress === 100 ? 'Completed' : 'ETA: ' + item.eta}</p>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// --- 4. ACTIONS ---

/**
 * Handle "View" Button Click
 */
function viewContract(id) {
    alert(`Showing details for contract ${id}\n\n(This would open a modal with full PDF contract in production)`);
}

/**
 * Handle "Accept & Pay" Button Click
 * Integrates with payment.js
 */
function initiateAcceptance(contractId, amount) {
    if(!confirm(`Do you want to accept contract ${contractId} and proceed to payment of ₹${amount}?`)) return;

    console.log(`Initiating payment for ${contractId}`);
    
    // 1. Check if payment.js is loaded
    if (typeof makePayment === "function") {
        // 2. Call the payment function from payment.js
        makePayment(contractId, amount);

        // 3. For Demo Purposes: Simulate success callback (Since we don't have a real backend to update UI)
        // In reality, payment.js handles the alert, and we would listen for an event or reload.
        // Here we act as if payment succeeded to show UI update.
        setTimeout(() => {
            simulateContractMove(contractId);
        }, 5000); // Wait 5s to simulate user completing payment
    } else {
        alert("Payment Gateway Error: Module not loaded.");
    }
}

/**
 * Helper: Moves contract from Available to Accepted (Visual Demo)
 */
function simulateContractMove(id) {
    // Find item
    const index = marketplaceData.findIndex(c => c.id === id);
    if(index > -1) {
        // Remove from UI
        const row = document.getElementById(`row-${id}`);
        if(row) row.style.opacity = '0.5';
        
        // Update Stats
        buyerStats.available--;
        buyerStats.accepted++;
        updateStatsUI();
        
        console.log(`Contract ${id} moved to Accepted.`);
    }
}