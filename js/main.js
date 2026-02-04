console.log("Main Controller Loaded");

// --- 1. GLOBAL SHORTCUTS ---

window.handleGlobalKeydown = (e) => {
    // Ignore shortcuts if on login screen
    // Ignore shortcuts if on login screen
    const loginView = document.getElementById('login-view');
    if (loginView && !loginView.classList.contains('hidden')) return;

    // Tab Switching (Alt + 1-6)
    if (e.altKey) {
        switch (e.key) {
            case '1': window.location.hash = '#/home'; break;
            case '2': window.location.hash = '#/dashboard'; break;
            case '3': window.location.hash = '#/staff'; break;
            case '4': window.location.hash = '#/attendance'; break;
            case '5': window.location.hash = '#/history'; break;
            case '6': window.location.hash = '#/accounts'; break;
            case '7': window.location.hash = '#/inventory'; break;
            case '8': window.location.hash = '#/catalogue'; break;
            case 'n': case 'N': e.preventDefault(); handleAddShortcut(); break;
        }
    }

    // Save Action (Ctrl + S)
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSaveShortcut();
    }

    // Enter Key Navigation (Skip inputs in tables)
    if (e.key === 'Enter' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        const activeEl = document.activeElement;
        if (activeEl.tagName === 'INPUT' && activeEl.closest('table')) {
            if (activeEl.classList.contains('time-in') || activeEl.classList.contains('time-out')) return;
            e.preventDefault();
            moveFocusToNextInput(activeEl);
        }
    }
};

function handleAddShortcut() {
    const activeTab = document.querySelector('.tab-content.active').id;
    if (activeTab === 'dashboard') window.addLedgerRow();
    if (activeTab === 'staff') {
        if (!document.getElementById('staff-ledger-view').classList.contains('hidden')) {
            if (state.currentLedgerEmp?.type === 'pcs') window.addPcsRow();
        } else {
            window.toggleAddStaffModal();
        }
    }
}

function handleSaveShortcut() {
    const activeTab = document.querySelector('.tab-content.active').id;
    if (activeTab === 'dashboard') window.saveLedger();
    if (activeTab === 'staff') {
        window.saveFinancials();
        const header = document.getElementById('financial-salary-container')?.parentElement;
        if (header) {
            header.classList.add('bg-emerald-100');
            setTimeout(() => header.classList.remove('bg-emerald-100'), 300);
        }
    }
    if (activeTab === 'accounts') window.addTransaction();
}

function moveFocusToNextInput(currentInput) {
    const allInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([disabled])'));
    const index = allInputs.indexOf(currentInput);
    if (index > -1 && index < allInputs.length - 1) {
        allInputs[index + 1].focus();
    }
}

// --- 2. NAVIGATION LOGIC ---

// Define the core switch function first
// Define the core switch function first
// 2. NAVIGATION LOGIC (SPA Adapter)

window.switchTab = (id) => {
    // Compatibility wrapper for legacy calls
    window.location.hash = '#/' + id;
};

// performSwitchTab is removed as Router handles rendering.


// --- 3. SIDEBAR LOGIC ---

window.toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
};

window.toggleDesktopSidebar = () => {
    console.log("Toggle Sidebar Clicked");
    const sidebar = document.getElementById('sidebar');
    const labels = document.querySelectorAll('.nav-label');
    const logoText = document.getElementById('sidebar-logo-text');

    // Toggle Width
    if (sidebar.classList.contains('w-64')) {
        // COLLAPSE
        console.log("Collapsing sidebar...");
        sidebar.classList.remove('w-64');
        sidebar.classList.add('w-20');

        // Hide Text
        labels.forEach(el => el.classList.add('hidden'));
        if (logoText) logoText.closest('div').classList.add('hidden'); // Hide the wrapper div

        // Adjust elements for centered icons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.add('justify-center');
        });

    } else {
        // EXPAND
        console.log("Expanding sidebar...");
        sidebar.classList.remove('w-20');
        sidebar.classList.add('w-64');

        // Show Text
        labels.forEach(el => el.classList.remove('hidden'));
        if (logoText) logoText.closest('div').classList.remove('hidden');

        // Restore elements
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('justify-center');
        });
    }
};

window.closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('-translate-x-full');
    }
};

// --- 4. SETTINGS MODAL LOGIC ---

// --- 4. SETTINGS MODAL LOGIC ---

// --- 4. SECURE CONTROL PANEL LOGIC ---

// Helper to open PIN modal
window.openControlPanel = () => {
    // Check if CPIN exists in config
    const hasPin = window.CONFIG && window.CONFIG.CPIN;

    document.getElementById('cpin-modal').classList.remove('hidden');
    document.getElementById('cpin-input').value = '';
    document.getElementById('cpin-input').focus();

    if (!hasPin) {
        // SET NEW PIN MODE
        document.getElementById('cpin-title').innerText = "Set CPIN";
        document.getElementById('cpin-desc').innerText = "Create a 6-digit PIN for future access.";
        state.cpinMode = 'SET';
    } else {
        // AUTH MODE
        document.getElementById('cpin-title').innerText = "Security Check";
        document.getElementById('cpin-desc').innerText = "Enter CPIN to access protected settings.";
        state.cpinMode = 'AUTH';
    }
};

window.closeCPINModal = () => {
    document.getElementById('cpin-modal').classList.add('hidden');
};

window.submitCPIN = () => {
    const input = document.getElementById('cpin-input').value;

    if (input.length !== 6) {
        alert("Please enter a valid 6-digit PIN.");
        return;
    }

    if (state.cpinMode === 'SET') {
        // Save New PIN
        const newConfig = { ...window.CONFIG, CPIN: input };
        state.config = newConfig;
        localStorage.setItem('srf_config', JSON.stringify(newConfig));

        // Open Panel
        window.closeCPINModal();
        window.openRealControlPanel();
        alert("CPIN Set Successfully!");
    } else {
        // Validate PIN
        if (window.CONFIG.CPIN === input) {
            window.closeCPINModal();
            window.openRealControlPanel();
        } else {
            alert("Incorrect PIN. Please try again.");
            document.getElementById('cpin-input').value = '';
        }
    }
};

window.handleForgotCPIN = () => {
    const confirmReset = confirm("⚠ FORGOT PIN?\n\nTo regain access, you must RESET All Settings (Owner Name, Rates, etc).\nThis will NOT delete staff/production data.\n\nProceed to Reset Settings?");
    if (confirmReset) {
        localStorage.removeItem('srf_config');
        state.config = DEFAULT_CONFIG;
        alert("Settings have been reset to default. You can now access Control Panel without a PIN.");
        window.location.reload();
    }
};

window.openRealControlPanel = () => {
    document.getElementById('settings-modal').classList.add('hidden'); // Close main settings
    document.getElementById('control-panel-modal').classList.remove('hidden');

    // Load Config Data
    const conf = window.CONFIG;
    if (conf) {
        if (document.getElementById('conf-owner')) document.getElementById('conf-owner').value = conf.OWNER_NAME || '';
        if (document.getElementById('conf-ot')) document.getElementById('conf-ot').value = conf.RATES?.OT_PER_HOUR || '';
        if (document.getElementById('conf-npl')) document.getElementById('conf-npl').value = conf.RATES?.NPL_FINE || '';
        if (document.getElementById('conf-bonus')) document.getElementById('conf-bonus').value = conf.RATES?.ATTENDANCE_BONUS || '';
    }
};

window.closeRealControlPanel = () => {
    document.getElementById('control-panel-modal').classList.add('hidden');
    // Re-open settings modal just in case user wants to go back? 
    // Usually better to just close or go back to settings. Let's go back to settings.
    document.getElementById('settings-modal').classList.remove('hidden');

    // Reset Edit Mode
    const inputs = ['conf-owner', 'conf-ot', 'conf-npl', 'conf-bonus'];
    document.getElementById('btn-config-save').classList.add('hidden');
    document.getElementById('btn-config-edit').innerText = 'EDIT';
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = true;
            el.classList.remove('border-indigo-500', 'bg-indigo-50', 'bg-white');
            el.classList.add('bg-transparent'); // Restore transparent look
        }
    });
};

window.resetCPINonly = () => {
    if (confirm("Are you sure you want to REMOVE the PIN security?")) {
        const newConfig = { ...window.CONFIG };
        delete newConfig.CPIN;
        state.config = newConfig;
        localStorage.setItem('srf_config', JSON.stringify(newConfig));
        alert("PIN Removed. Access is now open.");
        window.closeRealControlPanel();
    }
};

// --- END SECURE CONTROL PANEL LOGIC ---

window.openSettings = () => {
    document.getElementById('settings-modal').classList.remove('hidden');

    // NEW: Load Config Data into Inputs
    const conf = window.CONFIG;
    if (conf) {
        if (document.getElementById('conf-owner')) document.getElementById('conf-owner').value = conf.OWNER_NAME || '';
        if (document.getElementById('conf-ot')) document.getElementById('conf-ot').value = conf.RATES?.OT_PER_HOUR || '';
        if (document.getElementById('conf-npl')) document.getElementById('conf-npl').value = conf.RATES?.NPL_FINE || '';
        if (document.getElementById('conf-bonus')) document.getElementById('conf-bonus').value = conf.RATES?.ATTENDANCE_BONUS || '';
    }
};

window.closeSettings = () => {
    document.getElementById('settings-modal').classList.add('hidden');
    // turn editing off when closing
    const inputs = ['conf-owner', 'conf-ot', 'conf-npl', 'conf-bonus'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = true;
            el.classList.remove('border-indigo-500', 'bg-indigo-50');
            el.classList.add('border-slate-200');
        }
    });
    document.getElementById('btn-config-save').classList.add('hidden');
    document.getElementById('btn-config-edit').innerText = 'EDIT';
};

window.toggleConfigEdit = () => {
    const inputs = ['conf-owner', 'conf-ot', 'conf-npl', 'conf-bonus'];
    const btn = document.getElementById('btn-config-edit');
    const saveBtn = document.getElementById('btn-config-save');
    const isEditing = btn.innerText === 'CANCEL';

    if (isEditing) {
        // Cancel Editing
        btn.innerText = 'EDIT';
        saveBtn.classList.add('hidden');
        inputs.forEach(id => {
            const el = document.getElementById(id);
            el.disabled = true;
            el.classList.remove('border-indigo-500', 'bg-indigo-50');
        });
        window.openSettings(); // Reload values
    } else {
        // Start Editing
        btn.innerText = 'CANCEL';
        saveBtn.classList.remove('hidden');
        inputs.forEach(id => {
            const el = document.getElementById(id);
            el.disabled = false;
            el.classList.add('border-indigo-500', 'bg-indigo-50');
        });
    }
};

window.saveConfig = () => {
    const newConfig = { ...window.CONFIG };

    newConfig.OWNER_NAME = document.getElementById('conf-owner').value;
    newConfig.RATES.OT_PER_HOUR = Number(document.getElementById('conf-ot').value);
    newConfig.RATES.NPL_FINE = Number(document.getElementById('conf-npl').value);
    newConfig.RATES.ATTENDANCE_BONUS = Number(document.getElementById('conf-bonus').value);

    // Save to State & LocalStorage
    state.config = newConfig;
    localStorage.setItem('srf_config', JSON.stringify(newConfig));

    // Update UI immediately
    if (window.updateGreeting) window.updateGreeting();

    alert("Settings Saved!");
    window.closeSettings();
};

window.factoryReset = () => {
    const code = prompt("⚠ WARNING: This will wipe ALL data to start fresh.\nType 'RESET' to confirm:");

    if (code === 'RESET') {
        // Clear all App Data keys
        localStorage.removeItem('srf_staff_list');
        localStorage.removeItem('srf_staff_ledgers');
        localStorage.removeItem('srf_production_history');
        localStorage.removeItem('srf_washing_history');
        localStorage.removeItem('srf_accounts');
        localStorage.removeItem('srf_owner_todos');
        localStorage.removeItem('srf_config'); // Clear custom config too

        // Optional: If using Firebase, wipe that too (be careful!)
        if (window.saveToCloud) {
            window.saveToCloud('staffData', []);
            window.saveToCloud('staffLedgers', {});
            // ... wipe other paths
        }

        alert("System Cleaned! Ready for fresh use.");
        window.location.reload();
    }
};

const settingsModal = document.getElementById('settings-modal');
if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
        if (e.target.id === 'settings-modal') {
            window.closeSettings();
        }
    });
}

// --- 5. INITIALIZATION ---

// --- 5. INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // Legacy initialization moved to Router or handled by view rendering.
    // Keeping auth check if needed
    if (window.checkLogin) {
        window.checkLogin();
    }
});

// ==========================================
// VOICE INPUT CONTROLLER
// ==========================================

window.startVoiceInput = (triggerElement) => {
    // 1. Check Browser Support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
        return;
    }

    // 2. Identify Elements (Button vs Input)
    // The Dashboard button is passed as 'this'. The input is its previous sibling.
    let inputField, btn;

    // Handle case where user clicked the ICON <i> inside the button
    if (triggerElement.tagName === 'I') {
        btn = triggerElement.closest('button');
    } else {
        btn = triggerElement;
    }

    // Locate the input field (it is inside the same parent div)
    inputField = btn.previousElementSibling;

    if (!inputField || inputField.tagName !== 'INPUT') {
        console.error("Voice Error: Could not find input field.");
        return;
    }

    // 3. Setup Recognition
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Optimized for Indian English
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // 4. Visual Feedback (Recording State)
    const originalIcon = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-circle-dot text-red-600 animate-pulse"></i>`; // Recording Dot
    btn.classList.add('bg-red-50');

    // 5. Events
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;

        // Auto-Capitalize first letter
        const cleanText = transcript.charAt(0).toUpperCase() + transcript.slice(1);

        // Smart Append: If text exists, add space. If empty, just add text.
        if (inputField.value) {
            inputField.value += ' ' + cleanText;
        } else {
            inputField.value = cleanText;
        }

        // Trigger 'input' event so the 'Save Draft' logic in Dashboard works
        inputField.dispatchEvent(new Event('input'));

        resetUI();
    };

    recognition.onerror = (event) => {
        console.warn("Voice Error:", event.error);
        if (event.error === 'not-allowed') alert("Please allow Microphone access.");
        resetUI();
    };

    recognition.onend = () => {
        resetUI();
    };

    function resetUI() {
        btn.innerHTML = `<i class="fa-solid fa-microphone"></i>`;
        btn.classList.remove('bg-red-50');
    }

    // 6. Start
    recognition.start();
};

// Force the app to wait for the HTML to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing App...");

    // 1. Check if user is logged in
    if (window.checkLogin) {
        window.checkLogin();
    }
});
