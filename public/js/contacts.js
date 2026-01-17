
const DEFAULT_CONTRACTS = [
    {
        id: "CTR-2024-001",
        crop: "Organic Wheat",
        farmerName: "Rajesh Patel",
        buyerName: "WholeFoods Corp",
        quantity: 50, // Tons
        pricePerTon: 420, // USD or Local Currency
        qualityStandard: "Grade A",
        deliveryDate: "2024-10-15",
        status: "Active",
        createdDate: "2024-08-01"
    },
    {
        id: "CTR-2024-002",
        crop: "Yellow Maize",
        farmerName: "Sarah Jenkins",
        buyerName: "AgriProcess Ltd",
        quantity: 120,
        pricePerTon: 250,
        qualityStandard: "Grade B+",
        deliveryDate: "2024-09-20",
        status: "Completed",
        createdDate: "2024-07-15"
    },
    {
        id: "CTR-2024-003",
        crop: "Soybeans",
        farmerName: "Amit Singh",
        buyerName: "Pending...",
        quantity: 30,
        pricePerTon: 550,
        qualityStandard: "Grade A",
        deliveryDate: "2024-11-01",
        status: "Draft", // Not yet accepted by a buyer
        createdDate: "2024-08-10"
    }
];

// Initialize Data Store (SessionStorage for persistence across reloads)
if (!sessionStorage.getItem('farmoContracts')) {
    console.log("Initializing Default Contracts DB...");
    sessionStorage.setItem('farmoContracts', JSON.stringify(DEFAULT_CONTRACTS));
}

// --- 2. CONTRACT SERVICE (API Simulation) ---

const ContractService = {
    
    /**
     * Fetch all contracts (optionally filtered by role/user)
     */
    getAll: function() {
        return JSON.parse(sessionStorage.getItem('farmoContracts') || "[]");
    },

    /**
     * Get a specific contract by ID
     */
    getById: function(id) {
        const contracts = this.getAll();
        return contracts.find(c => c.id === id);
    },

    /**
     * Create a new Digital Contract
     * @param {Object} details - { crop, quantity, price, quality, date }
     */
    create: function(details) {
        const contracts = this.getAll();
        
        const newContract = {
            id: `CTR-2024-${Math.floor(100 + Math.random() * 900)}`, // Random ID
            crop: details.crop,
            farmerName: "Current User", // In a real app, from auth session
            buyerName: "Pending...",
            quantity: details.quantity,
            pricePerTon: details.price,
            qualityStandard: details.quality || "Standard",
            deliveryDate: details.date,
            status: "Draft", // Starts as Draft/Open
            createdDate: new Date().toISOString().split('T')[0]
        };

        contracts.unshift(newContract); // Add to top
        sessionStorage.setItem('farmoContracts', JSON.stringify(contracts));
        
        console.log("New Contract Minted:", newContract);
        return newContract;
    },

    /**
     * Update Contract Status (e.g., when Buyer accepts or delivery is done)
     * @param {String} id - Contract ID
     * @param {String} newStatus - 'Active', 'Completed', 'Cancelled'
     * @param {String} buyerName - Optional, if a buyer is accepting
     */
    updateStatus: function(id, newStatus, buyerName = null) {
        let contracts = this.getAll();
        const index = contracts.findIndex(c => c.id === id);

        if (index !== -1) {
            contracts[index].status = newStatus;
            if (buyerName) {
                contracts[index].buyerName = buyerName;
            }
            sessionStorage.setItem('farmoContracts', JSON.stringify(contracts));
            console.log(`Contract ${id} updated to ${newStatus}`);
            return true;
        }
        return false;
    }
};

// --- 3. UI RENDERING HELPERS ---

/**
 * Renders contracts into a table based on the user view (Farmer/Buyer).
 * @param {String} tableBodyId - ID of the <tbody> element
 * @param {String} viewType - 'farmer' or 'buyer'
 */
function renderContractsToTable(tableBodyId, viewType) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return; // Exit if table not found on this page

    const contracts = ContractService.getAll();
    tableBody.innerHTML = ''; // Clear existing

    contracts.forEach(contract => {
        // Filter logic: In a real app, Farmers only see their own, Buyers see open ones.
        // For Hackathon demo: Show relevant statuses.
        
        let rowHtml = '';
        const statusBadge = getStatusBadge(contract.status);

        if (viewType === 'farmer') {
            // Farmer View Columns: Crop | Qty | Price | Buyer | Status
            rowHtml = `
                <tr>
                    <td style="font-weight:600">${contract.crop}</td>
                    <td>${contract.quantity} Tons</td>
                    <td>$${contract.pricePerTon}/ton</td>
                    <td>${contract.buyerName}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        } else if (viewType === 'buyer') {
            // Buyer View Columns: Crop | Farmer | Qty | Price | Quality | Action
            // Buyers typically see 'Draft' contracts as 'Available'
            if (contract.status === 'Draft' || contract.status === 'Active') {
                rowHtml = `
                    <tr>
                        <td style="font-weight:600">${contract.crop}</td>
                        <td>${contract.farmerName}</td>
                        <td>${contract.quantity} Tons</td>
                        <td>$${contract.pricePerTon}</td>
                        <td>${contract.qualityStandard}</td>
                        <td>
                            ${contract.status === 'Draft' 
                                ? `<button onclick="acceptContract('${contract.id}')" class="btn btn-sm btn-primary">Accept</button>` 
                                : `<span class="text-muted">Owned</span>`}
                        </td>
                    </tr>
                `;
            }
        }

        if (rowHtml) tableBody.innerHTML += rowHtml;
    });
}

/**
 * Helper to generate HTML badges for status
 */
function getStatusBadge(status) {
    let className = 'badge-neutral';
    if (status === 'Active') className = 'badge-success';
    if (status === 'Draft') className = 'badge-warning';
    if (status === 'Completed') className = 'badge-info';
    
    return `<span class="badge ${className}">${status}</span>`;
}

// --- 4. GLOBAL ACTION HANDLERS ---

// Attached to window so buttons can call them directly
window.acceptContract = function(id) {
    if (confirm("Confirm acceptance of this contract? This initiates the legal agreement.")) {
        ContractService.updateStatus(id, "Active", "Current Buyer");
        alert("Contract Accepted! Funds are now in Escrow.");
        location.reload(); // Refresh to show updated status
    }
};

window.createNewContractUI = function() {
    // Simple prompt-based creation for demo speed
    const crop = prompt("Crop Name:", "Rice");
    if (!crop) return;
    const qty = prompt("Quantity (Tons):", "10");
    const price = prompt("Price per Ton ($):", "350");

    ContractService.create({
        crop: crop,
        quantity: qty,
        price: price,
        quality: "Standard",
        date: "2024-12-01"
    });
    
    alert("Contract Created Successfully!");
    location.reload();
};

// Auto-run render if specific tables exist
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on farmer page (using ID from farmer.html dashboard if it exists)
    // Note: You might need to add id="farmer-contract-table" to your farmer.html table body
    renderContractsToTable('farmer-contract-table', 'farmer');
    
    // Check if we are on buyer page
    renderContractsToTable('buyer-contract-table', 'buyer');
});