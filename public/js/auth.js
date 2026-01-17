// --- CONFIGURATION ---
const REDIRECT_URLS = {
    farmer: 'farmer.html', // Redirect for Farmers
    buyer: 'buyer.html',   // Redirect for Buyers
    admin: 'admin.html'    // Redirect for Admins
};

/**
 * Handle User Login
 * @param {string} role - 'farmer', 'buyer', or 'admin'
 */
function loginUser(role) {
    console.log(`Attempting login for role: ${role}`);

    // 1. Get Input Values
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // 2. Clear previous errors (if you had an error display element)
    // resetErrorMessages(); 

    // 3. Validation
    if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    // 4. UI Loading State
    const originalBtnText = loginBtn.innerText;
    loginBtn.innerText = "Verifying...";
    loginBtn.disabled = true;
    loginBtn.style.opacity = "0.7";

    // 5. Simulate Backend API Call (1.5 seconds delay)
    setTimeout(() => {
        // --- DEMO LOGIC: Accept any valid format for hackathon ---
        // In a real app, you would fetch('/api/login') here.
        
        const isSuccess = true; // Force success for demo

        if (isSuccess) {
            console.log("Login successful!");
            
            // Store session info (Optional for demo persistence)
            sessionStorage.setItem('userRole', role);
            sessionStorage.setItem('userEmail', email);

            // Redirect based on role
            const targetUrl = REDIRECT_URLS[role.toLowerCase()] || 'index.html';
            window.location.href = targetUrl;
        } else {
            // Error Handling
            console.error("Login failed.");
            alert("Invalid credentials. Please try again.");
            
            // Reset Button
            loginBtn.innerText = originalBtnText;
            loginBtn.disabled = false;
            loginBtn.style.opacity = "1";
        }

    }, 1500);
}

/**
 * Handle User Registration
 * @param {string} role - 'farmer', 'buyer', or 'admin'
 */
function registerUser(role) {
    console.log(`Registering new ${role}`);
    
    // For this hackathon demo, we'll just redirect registration 
    // attempts back to the login success flow or a signup form.
    
    const email = document.getElementById('email').value;
    
    if(!email) {
        alert("Please enter your email to sign up.");
        return;
    }

    alert(`Welcome to FarmoTech! Account created for ${role}. Redirecting...`);
    
    // Simulate auto-login after register
    loginUser(role);
}

/**
 * Helper: Simple Email Regex Validation
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// --- EVENT LISTENER SETUP ---
// This ensures the script runs after HTML loads
document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.querySelector('.login-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop page reload

            // Find currently active role from the Tabs in login.html
            // Assuming the active tab has class="active" and data-role attribute
            const activeTab = document.querySelector('.role-tabs .tab-btn.active');
            const role = activeTab ? activeTab.getAttribute('data-role') : 'farmer'; // Default to farmer

            loginUser(role);
        });
    }
});