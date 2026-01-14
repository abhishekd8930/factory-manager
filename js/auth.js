console.log("Auth Module Loaded");

// --- 1. LOGIN LOGIC ---

window.handleLogin = (e) => {
    e.preventDefault(); // Stop form from refreshing page

    const userIn = document.getElementById('login-user').value.trim();
    const passIn = document.getElementById('login-pass').value.trim();

    // Check against Config
    if (userIn === CONFIG.AUTH.USER && passIn === CONFIG.AUTH.PASS) {
        
        // 1. Create Session Object
        const session = {
            loggedIn: true,
            timestamp: Date.now(),
            user: userIn
        };

        // 2. Save to LocalStorage
        localStorage.setItem('srf_session', JSON.stringify(session));

        // 3. Launch App
        initAppView();

    } else {
        // Error Animation
        const btn = e.target.querySelector('button');
        const originalText = btn.innerText;
        
        btn.classList.add('bg-red-500', 'animate-shake');
        btn.innerText = "Invalid Credentials";
        
        setTimeout(() => {
            btn.classList.remove('bg-red-500', 'animate-shake');
            btn.innerText = originalText;
        }, 1000);
    }
};

// --- 2. LOGOUT LOGIC ---

window.logout = () => {
    if (confirm("Are you sure you want to sign out?")) {
        localStorage.removeItem('srf_session');
        window.location.reload(); // Refresh to clear state
    }
};

// --- 3. SESSION CHECK (Runs on Load) ---

window.checkSession = () => {
    const sessionStr = localStorage.getItem('srf_session');
    
    if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const now = Date.now();
        
        // Check if session is expired (Configured in config.js, usually 12 hours)
        if (now - session.timestamp < CONFIG.AUTH.SESSION_EXPIRY_MS) {
            // Valid Session -> Skip Login Screen
            initAppView();
        } else {
            // Expired -> Clear it
            localStorage.removeItem('srf_session');
        }
    }
};

// --- 4. VIEW SWITCHER ---

function initAppView() {
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');

    // Hide Login, Show App
    loginView.classList.add('hidden');
    appView.classList.remove('hidden');

    // Trigger Initial Renders
    // We check if functions exist to avoid errors if modules load out of order
    if (window.renderHome) window.renderHome();
    if (window.updateGreeting) window.updateGreeting();
    
    console.log("System Initialized");
}

// --- 5. BACKUP DATA UTILITY ---

window.downloadBackup = () => {
    // Collect all data from State
    const backupData = {
        meta: {
            app: "FactoryManager",
            version: "5.5",
            exportDate: new Date().toISOString()
        },
        data: {
            staff: state.staffData,
            ledgers: state.staffLedgers,
            history: state.historyData,
            washing: state.washingData,
            accounts: state.accountsData,
            todos: state.ownerTodos
        }
    };

    // Convert to JSON String
    const dataStr = JSON.stringify(backupData, null, 2);
    
    // Create Blob (Virtual File)
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Create Link & Click it
    const a = document.createElement('a');
    a.href = url;
    a.download = `SRF_Backup_${state.today}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Run check immediately when script loads
// REPLACE THIS:
// window.checkSession();

// WITH THIS:
document.addEventListener('DOMContentLoaded', () => {
    // We wait 50ms just to be safe that main.js is parsed
    setTimeout(window.checkSession, 50); 
});

// js/auth.js

// ... existing code ...

// NEW: Toggle Password Visibility
window.togglePasswordVisibility = () => {
    const input = document.getElementById('login-pass');
    const icon = document.getElementById('pass-icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};