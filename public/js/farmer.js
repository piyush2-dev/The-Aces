const farmerStats = {
    activeContracts: 3,
    pendingPayments: 4500, // In USD/INR
    cropStatus: "Healthy"
};

// List of recent contracts
const myContracts = [
    { 
        id: "CTR-001", 
        crop: "Organic Wheat", 
        quantity: "5 Tons", 
        price: "$420/ton", 
        buyer: "WholeFoods Corp", 
        status: "Active",
        statusClass: "status-active"
    },
    { 
        id: "CTR-002", 
        crop: "Carrots", 
        quantity: "2 Tons", 
        price: "$150/ton", 
        buyer: "Fresh Markets", 
        status: "Pending Payment",
        statusClass: "status-pending"
    },
    { 
        id: "CTR-003", 
        crop: "Maize", 
        quantity: "10 Tons", 
        price: "$300/ton", 
        buyer: "AgriProcess Ltd", 
        status: "Completed",
        statusClass: "status-completed"
    }
];

// --- 2. AI INSIGHTS (Simulating Machine Learning Model) ---
// In a real app, this would come from a Python/Flask ML backend
const aiInsights = {
    predictedPrice: "$435/ton",
    marketDemand: "High",
    confidenceScore: "94%"
};

// --- 3. INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Farmer Dashboard Loaded");
    
    renderDashboardStats();
    renderContractTable();
    setupEventListeners();
    
    // Simulate loading AI insights after a slight delay
    setTimeout(showAIAlert, 2000); 
});

// --- 4. RENDER FUNCTIONS ---

/**
 * Updates the top statistic cards
 */
function renderDashboardStats() {
    // Select cards based on order (Assumes standard layout)
    const statCards = document.querySelectorAll('.stat-info h3');
    
    if (statCards.length >= 3) {
        statCards[0].innerText = farmerStats.activeContracts;
        statCards[1].innerText = `$${farmerStats.pendingPayments.toLocaleString()}`;
        statCards[2].innerText = farmerStats.cropStatus;
    }
}

/**
 * Populates the Recent Contracts Table
 */
function renderContractTable() {
    const tableBody = document.querySelector('table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Clear loading/static content

    myContracts.forEach(contract => {
        // Icon selection based on crop
        let icon = 'fa-seedling';
        let color = '#2E7D32';
        
        if (contract.crop.includes('Wheat')) { icon = 'fa-wheat'; color = '#E6B325'; }
        if (contract.crop.includes('Carrot')) { icon = 'fa-carrot'; color = '#FF7043'; }
        if (contract.crop.includes('Maize')) { icon = 'fa-corn'; color = '#FDD835'; } // Note: fa-corn might need FontAwesome Pro, fallback to generic if needed

        const row = `
            <tr>
                <td style="font-weight: 600;">
                    <i class="fas ${icon}" style="color: ${color}; margin-right: 8px;"></i> 
                    ${contract.crop}
                </td>
                <td>${contract.quantity}</td>
                <td>${contract.price}</td>
                <td>${contract.buyer}</td>
                <td><span class="status-badge ${contract.statusClass}">${contract.status}</span></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

/**
 * Shows a toast/alert with AI predictions (Demo Feature)
 */
function showAIAlert() {
    // Create a temporary alert div for the demo
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-info reveal-on-scroll is-visible';
    alertDiv.style.position = 'fixed';
    alertDiv.style.bottom = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1000';
    alertDiv.style.maxWidth = '300px';
    alertDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    
    alertDiv.innerHTML = `
        <i class="fas fa-robot alert-icon"></i>
        <div class="alert-content">
            <span class="alert-title">AI Market Insight</span>
            Demand for <strong>Wheat</strong> is <strong>${aiInsights.marketDemand}</strong>. 
            Recommended lock-in price: <strong>${aiInsights.predictedPrice}</strong>.
        </div>
        <button onclick="this.parentElement.remove()" style="background:none; border:none; position:absolute; top:5px; right:5px; cursor:pointer;">&times;</button>
    `;
    
    document.body.appendChild(alertDiv);
}

// --- 5. ACTION FUNCTIONS ---

function setupEventListeners() {
    const createBtn = document.querySelector('.btn-create');
    
    if (createBtn) {
        createBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleCreateContract();
        });
    }
}

/**
 * Handle "Create New Contract" Flow
 */
function handleCreateContract() {
    // In a real app, this opens a form modal.
    // For the hackathon, we simulate the input flow.
    
    const crop = prompt("Enter Crop Name (e.g., Rice, Wheat):", "Rice");
    if (!crop) return;

    const qty = prompt("Enter Quantity (in Tons):", "10");
    if (!qty) return;

    const price = prompt("Enter Expected Price per Ton ($):", "400");
    if (!price) return;

    // AI Validation Simulation
    if (parseInt(price) > 500) {
        const confirmHigh = confirm(`⚠️ AI Alert: Your price ($${price}) is 20% higher than market average. This might reduce buyer interest. Continue?`);
        if (!confirmHigh) return;
    }

    // Add new contract to list (Local only)
    const newContract = {
        id: `CTR-${Math.floor(Math.random() * 1000)}`,
        crop: crop,
        quantity: `${qty} Tons`,
        price: `$${price}/ton`,
        buyer: "Waiting for Buyer...",
        status: "Active", // Usually starts as 'Open'
        statusClass: "status-active"
    };

    myContracts.unshift(newContract); // Add to top
    farmerStats.activeContracts++;
    
    // Update UI
    renderDashboardStats();
    renderContractTable();
    
    alert("Contract created successfully! It is now visible to buyers.");
}