// js/auth.js
console.log("Auth Module Loaded");

// --- 1. LOGIN LOGIC ---
window.handleLogin = (e) => {
    e.preventDefault(); 

    const userIn = document.getElementById('login-user').value.trim();
    const passIn = document.getElementById('login-pass').value.trim();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;

    // Loading State
    btn.innerText = "Verifying...";
    btn.disabled = true;

    // THE REAL LOGIN
    window.signInWithEmailAndPassword(window.auth, userIn, passIn)
        .then((userCredential) => {
            console.log("Login Success:", userCredential.user.email);
            // We don't need to manually redirect here. 
            // The 'onAuthStateChanged' listener below will handle it.
        })
        .catch((error) => {
            console.error("Login Failed:", error.code, error.message);
            
            // Error Animation
            btn.classList.add('bg-red-500', 'animate-shake');
            btn.innerText = "Invalid Credentials";
            btn.disabled = false;
            
            setTimeout(() => {
                btn.classList.remove('bg-red-500', 'animate-shake');
                btn.innerText = originalText;
            }, 1000);
        });
};

// --- 2. LOGOUT LOGIC ---
window.logout = () => {
    if (confirm("Are you sure you want to sign out?")) {
        window.signOut(window.auth).then(() => {
            console.log("Signed Out");
            window.location.reload(); 
        }).catch((error) => {
            console.error("Sign Out Error", error);
        });
    }
};

// --- 3. REAL-TIME SESSION CHECK ---
// This runs automatically whenever the user's status changes (Login or Logout)
document.addEventListener('firebase-ready', () => {
    window.onAuthStateChanged(window.auth, (user) => {
        if (user) {
            // User is signed in.
            console.log("User is Authenticated:", user.email);
            initAppView();
        } else {
            // User is signed out.
            console.log("User is Guest");
            // Ensure login screen is visible
            document.getElementById('login-view').classList.remove('hidden');
            document.getElementById('app-view').classList.add('hidden');
        }
    });
});

// --- 4. VIEW SWITCHER ---
function initAppView() {
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');

    loginView.classList.add('hidden');
    appView.classList.remove('hidden');

    if (window.renderHome) window.renderHome();
    if (window.updateGreeting) window.updateGreeting();
}

// --- 5. BACKUP DATA UTILITY ---
window.downloadBackup = () => {
    // Collect all data from State
    const backupData = {
        meta: { app: "FactoryManager", version: "6.0 (Secure)", exportDate: new Date().toISOString() },
        data: {
            staff: state.staffData,
            ledgers: state.staffLedgers,
            history: state.historyData,
            washing: state.washingData,
            accounts: state.accountsData,
            todos: state.ownerTodos
        }
    };
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SRF_Backup_${state.today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Password Toggle Helper
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