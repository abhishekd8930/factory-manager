// js/auth.js
console.log("Auth Module Loaded");

// --- 1. LOGIN LOGIC ---
window.handleLogin = (e) => {
    e.preventDefault();

    const userIn = document.getElementById('login-user').value.trim();
    const passIn = document.getElementById('login-pass').value.trim();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    const rememberMe = document.getElementById('remember-me')?.checked;

    // 1. Validation
    if (!userIn || !passIn) {
        alert("Please enter both username and password.");
        if (!userIn) document.getElementById('login-user').focus();
        else document.getElementById('login-pass').focus();
        return;
    }

    // Loading State
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Verifying...';
    btn.disabled = true;

    // THE REAL LOGIN
    window.signInWithEmailAndPassword(window.auth, userIn, passIn)
        .then((userCredential) => {
            console.log("Login Success:", userCredential.user.email);

            // 2. Remember Me Logic
            if (rememberMe) {
                localStorage.setItem('srf_remember_user', userIn);
            } else {
                localStorage.removeItem('srf_remember_user');
            }

            btn.classList.add('bg-emerald-500');
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Success';
            // Redirect handled by onAuthStateChanged
        })
        .catch((error) => {
            console.error("Login Failed:", error.code, error.message);

            // Error Animation
            btn.classList.add('bg-red-500', 'animate-shake');
            btn.disabled = false;

            // 3. User-Friendly Error Messages
            let errorMsg = "Invalid Credentials";
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/invalid-email':
                    errorMsg = "User not found";
                    break;
                case 'auth/wrong-password':
                    errorMsg = "Incorrect Password";
                    break;
                case 'auth/too-many-requests':
                    errorMsg = "Too many attempts. Try later.";
                    break;
                case 'auth/network-request-failed':
                    errorMsg = "Network Error. Check internet.";
                    break;
            }
            btn.innerText = errorMsg;

            // Reset Button
            setTimeout(() => {
                btn.classList.remove('bg-red-500', 'animate-shake');
                btn.innerText = originalText;
                if (errorMsg === "Incorrect Password") {
                    document.getElementById('login-pass').value = '';
                    document.getElementById('login-pass').focus();
                } else if (errorMsg === "User not found") {
                    document.getElementById('login-user').select();
                }
            }, 2000);
        });
};

// New: Initialize Login Form (Auto-fill)
window.initLoginForm = () => {
    const savedUser = localStorage.getItem('srf_remember_user');
    if (savedUser) {
        const userInput = document.getElementById('login-user');
        const rememberBox = document.getElementById('remember-me');
        if (userInput) {
            userInput.value = savedUser;
            // Trigger floating label style if needed, or rely on :placeholder-shown logic
        }
        if (rememberBox) rememberBox.checked = true;
    }
};

// --- 1b. GOOGLE SIGN-IN ---
window.signInWithGoogle = () => {
    const provider = new window.GoogleAuthProvider();
    const btn = document.getElementById('btn-google-login');
    if (btn) {
        btn.innerText = "Signing in...";
        btn.disabled = true;
    }

    window.signInWithPopup(window.auth, provider)
        .then((result) => {
            console.log("Google Sign-In Success:", result.user.email);
            // onAuthStateChanged handles redirect
        })
        .catch((error) => {
            console.error("Google Sign-In Failed:", error.code, error.message);
            if (btn) {
                btn.innerText = "Sign in with Google";
                btn.disabled = false;
            }
            if (error.code !== 'auth/popup-closed-by-user') {
                alert("Google Sign-In failed: " + error.message);
            }
        });
};

// --- 1c. APPLE SIGN-IN ---
window.signInWithApple = () => {
    const provider = new window.OAuthProvider('apple.com');
    const btn = document.getElementById('btn-apple-login');
    const originalText = btn.innerText;

    // Show Loading State
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
    btn.disabled = true;

    window.signInWithPopup(window.auth, provider)
        .then((result) => {
            console.log("Apple Sign-In Success:", result.user.email);
            // Result comes with user/credential/etc.
            // On success, onAuthStateChanged will trigger and handle store updates/redirects.
        })
        .catch((error) => {
            console.error("Apple Sign-In Failed:", error.code, error.message);
            // Reset Button
            btn.innerHTML = '<i class="fa-brands fa-apple text-xl relative z-10"></i> <span class="relative z-10">Continue with Apple</span>';
            btn.disabled = false;

            // Helpful error handling
            if (error.code === 'auth/popup-closed-by-user') {
                console.log("User closed the Apple popup");
            } else {
                alert("Apple Sign-In failed: " + error.message);
            }
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
            // Redirect to login route
            window.location.hash = '#/login';
        }
    });
});

// --- 4. VIEW SWITCHER ---
function initAppView() {
    // In SPA mode, we just ensure we are at the home route or dashboard
    if (!window.location.hash || window.location.hash === '#/login') {
        window.location.hash = '#/home';
    }

    // Safety check just in case legacy code calls this
    console.log("App View Initialized via Router");
}

// --- 5. CLOUD BACKUP & RESTORE ---
window.cloudBackup = async () => {
    const btn = document.getElementById('btn-cloud-backup');
    const originalHTML = btn ? btn.innerHTML : '';

    try {
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Backing up...';
            btn.disabled = true;
        }

        const snapshot = {
            meta: {
                app: "FactoryManager",
                version: "6.0 (Cloud)",
                backupDate: new Date().toISOString(),
                device: navigator.userAgent.substring(0, 50)
            },
            data: {
                staff: state.staffData,
                ledgers: state.staffLedgers,
                history: state.historyData,
                washing: state.washingData,
                accounts: state.accountsData,
                todos: state.ownerTodos,
                config: state.config,
                notifications: state.notifications,
                inventory: state.inventoryData || [],
                deletedItems: state.deletedItems || []
            }
        };

        await window.saveToCloud('backups/latest', snapshot);

        // Update last backup timestamp display
        const tsEl = document.getElementById('last-backup-time');
        if (tsEl) tsEl.innerText = "Just now";

        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-check text-emerald-500"></i> Backup Saved!';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }, 2000);
        }

    } catch (err) {
        console.error("Cloud Backup Error:", err);
        alert("Cloud Backup failed: " + err.message);
        if (btn) {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    }
};

window.cloudRestore = async () => {
    const btn = document.getElementById('btn-cloud-restore');
    const originalHTML = btn ? btn.innerHTML : '';

    try {
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
            btn.disabled = true;
        }

        const snapshot = await window.loadFromCloud('backups/latest');

        if (!snapshot || !snapshot.meta || snapshot.meta.app !== "FactoryManager") {
            alert("No valid cloud backup found. Please create a backup first.");
            if (btn) { btn.innerHTML = originalHTML; btn.disabled = false; }
            return;
        }

        const backupDate = new Date(snapshot.meta.backupDate).toLocaleString();
        if (!confirm(`Restore backup from:\n${backupDate}\n\n⚠ THIS WILL OVERWRITE ALL CURRENT DATA.\n\nAre you sure?`)) {
            if (btn) { btn.innerHTML = originalHTML; btn.disabled = false; }
            return;
        }

        // Restore to localStorage
        const d = snapshot.data;
        if (d.staff) localStorage.setItem('srf_staff_list', JSON.stringify(d.staff));
        if (d.ledgers) localStorage.setItem('srf_staff_ledgers', JSON.stringify(d.ledgers));
        if (d.history) localStorage.setItem('srf_production_history', JSON.stringify(d.history));
        if (d.washing) localStorage.setItem('srf_washing_history', JSON.stringify(d.washing));
        if (d.accounts) localStorage.setItem('srf_accounts', JSON.stringify(d.accounts));
        if (d.todos) localStorage.setItem('srf_owner_todos', JSON.stringify(d.todos));
        if (d.config) localStorage.setItem('srf_config', JSON.stringify(d.config));
        if (d.notifications) localStorage.setItem('srf_notifications', JSON.stringify(d.notifications));
        if (d.inventory) localStorage.setItem('srf_inventory', JSON.stringify(d.inventory));
        if (d.deletedItems) localStorage.setItem('srf_deleted_items', JSON.stringify(d.deletedItems));

        alert("Restore Successful! The application will now reload.");
        window.location.reload();

    } catch (err) {
        console.error("Cloud Restore Error:", err);
        alert("Cloud Restore failed: " + err.message);
        if (btn) { btn.innerHTML = originalHTML; btn.disabled = false; }
    }
};

// Role Switcher Logic
window.switchLoginRole = (role, btn) => {
    // 1. Update Buttons State
    document.querySelectorAll('[data-role]').forEach(el => {
        el.classList.remove('active');
    });

    if (btn) {
        btn.classList.add('active');
    }

    // 2. Move Highlight
    const highlight = document.getElementById('role-highlight');
    if (highlight) {
        if (role === 'owner') highlight.style.transform = 'translateX(0%)';
        if (role === 'manager') highlight.style.transform = 'translateX(100%)';
        if (role === 'employee') highlight.style.transform = 'translateX(200%)';
    }

    // 3. Toggle Forms
    const emailForm = document.getElementById('email-login-container');
    const googleForm = document.getElementById('google-login-container');
    const appleBtn = document.getElementById('btn-apple-login'); // Apple button is inside google-login-container

    if (role === 'employee') {
        // Show Google, Hide Email
        if (emailForm) emailForm.classList.add('hidden');
        if (googleForm) googleForm.classList.remove('hidden');
    } else {
        // Show Email, Hide Google
        if (emailForm) emailForm.classList.remove('hidden');
        if (googleForm) googleForm.classList.add('hidden');
    }
};

// ... existing togglePasswordVisibility ...
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