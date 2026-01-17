
const MOCK_STATS = {
    totalUsers: 2845,
    activeContracts: 142,
    pendingActions: 18
};

let verificationRequests = [
    { id: 1, name: "Rahul Singh", email: "rahul.s@email.com", role: "Farmer", doc: "Land_Deed.pdf" },
    { id: 2, name: "AgroCorp Intl", email: "procurement@agro.com", role: "Buyer", doc: "Tax_Reg.pdf" },
    { id: 3, name: "Anita Desai", email: "anita.d@email.com", role: "Farmer", doc: "Identity_Card.pdf" }
];

let contractRequests = [
    { id: "CTR-2024-88", crop: "Wheat", quantity: "100 Tons", value: "$42,000", status: "Escrow Funded" },
    { id: "CTR-2024-91", crop: "Soybean", quantity: "20 Tons", value: "$12,500", status: "Review Terms" },
    { id: "CTR-2024-95", crop: "Maize", quantity: "50 Tons", value: "$28,000", status: "Review Terms" }
];

let qualityChecks = [
    { id: "BATCH-001", farmer: "Ravi Kumar", lab: "SGS Labs", score: "Grade A", confidence: "98%" },
    { id: "BATCH-004", farmer: "Sunita Devi", lab: "Intertek", score: "Grade B", confidence: "85%" },
    { id: "BATCH-007", farmer: "Vikram Seth", lab: "AgriTest", score: "Grade A", confidence: "99%" }
];

// --- 2. INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Admin Panel Loaded");
    
    renderStats();
    renderUserTable();
    renderContractTable();
    renderQualityTable();
});

// --- 3. RENDER FUNCTIONS ---

/**
 * Update the Top Statistics Cards
 */
function renderStats() {
    // In a real app, these would come from an API
    document.querySelector('.card:nth-child(1) .number').innerText = MOCK_STATS.totalUsers.toLocaleString();
    document.querySelector('.card:nth-child(2) .number').innerText = MOCK_STATS.activeContracts;
    
    // Dynamically calculate pending actions
    const totalPending = verificationRequests.length + contractRequests.length + qualityChecks.length;
    document.querySelector('.card:nth-child(3) .number').innerHTML = 
        `${totalPending} <span class="alert-dot"></span>`;
}

/**
 * Render User Verification Table
 */
function renderUserTable() {
    const tableBody = document.querySelector('.table-card:nth-child(1) tbody');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Clear existing rows

    verificationRequests.forEach(user => {
        const row = `
            <tr>
                <td>
                    <div style="font-weight: 600;">${user.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${user.email}</div>
                </td>
                <td>${user.role}</td>
                <td><a href="#" style="color: #3B82F6; text-decoration: underline;">${user.doc}</a></td>
                <td>
                    <div class="action-btns">
                        <button onclick="handleUserAction(${user.id}, 'approve')" class="btn-icon btn-approve" title="Approve">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="handleUserAction(${user.id}, 'reject')" class="btn-icon btn-reject" title="Reject">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    if(verificationRequests.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">No pending verifications.</td></tr>';
    }
}

/**
 * Render Contract Approval Table
 */
function renderContractTable() {
    const tableBody = document.querySelector('.table-card:nth-child(2) tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    contractRequests.forEach(contract => {
        const badgeClass = contract.status === "Escrow Funded" ? "badge-blue" : "badge-pending";
        
        const row = `
            <tr>
                <td>
                    <div style="font-weight: 600;">#${contract.id}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${contract.crop} (${contract.quantity})</div>
                </td>
                <td>${contract.value}</td>
                <td><span class="badge ${badgeClass}">${contract.status}</span></td>
                <td>
                    <div class="action-btns">
                        <button onclick="handleContractAction('${contract.id}', 'approve')" class="btn-icon btn-approve">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="handleContractAction('${contract.id}', 'reject')" class="btn-icon btn-reject">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    if(contractRequests.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">No pending contracts.</td></tr>';
    }
}

/**
 * Render Quality Control Table
 */
function renderQualityTable() {
    // Looking for the table inside the full-width card
    const tableBody = document.querySelector('.table-card.full-width tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    qualityChecks.forEach(batch => {
        const scoreColor = batch.score === 'Grade A' ? 'var(--success)' : 'var(--warning)';
        
        const row = `
            <tr>
                <td>${batch.id}</td>
                <td>${batch.farmer}</td>
                <td>${batch.lab}</td>
                <td><span style="color: ${scoreColor}; font-weight: 700;">${batch.score}</span></td>
                <td>${batch.confidence}</td>
                <td>
                    <div class="action-btns">
                        <button onclick="handleQualityAction('${batch.id}', 'approve')" class="btn-icon btn-approve">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="handleQualityAction('${batch.id}', 'reject')" class="btn-icon btn-reject">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    if(qualityChecks.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">No pending quality checks.</td></tr>';
    }
}

// --- 4. ACTION HANDLERS ---

/**
 * Handle Approve/Reject for Users
 */
function handleUserAction(id, action) {
    if(!confirm(`Are you sure you want to ${action} this user?`)) return;

    // Simulate API delay
    setTimeout(() => {
        // Remove from list
        verificationRequests = verificationRequests.filter(user => user.id !== id);
        
        // Update UI
        if(action === 'approve') {
            MOCK_STATS.totalUsers++;
            alert("User verified successfully!");
        } else {
            alert("User verification rejected.");
        }
        
        renderUserTable();
        renderStats();
    }, 300);
}

/**
 * Handle Approve/Reject for Contracts
 */
function handleContractAction(id, action) {
    if(!confirm(`Confirm ${action} for Contract ${id}?`)) return;

    setTimeout(() => {
        contractRequests = contractRequests.filter(c => c.id !== id);
        
        if(action === 'approve') {
            MOCK_STATS.activeContracts++;
            alert(`Contract ${id} approved and live.`);
        } else {
            alert(`Contract ${id} rejected.`);
        }
        
        renderContractTable();
        renderStats();
    }, 300);
}

/**
 * Handle Quality Checks
 */
function handleQualityAction(id, action) {
    // Direct action for smoother UX
    qualityChecks = qualityChecks.filter(q => q.id !== id);
    
    const message = action === 'approve' 
        ? `Batch ${id} certified successfully.` 
        : `Batch ${id} marked for re-inspection.`;
    
    console.log(message);
    
    // Re-render
    renderQualityTable();
    renderStats();
}