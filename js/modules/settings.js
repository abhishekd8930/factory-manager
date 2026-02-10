
export const renderSettings = () => {
    // 1. Populate Configuration Inputs
    const config = state.config || window.CONFIG;

    // Safely populate if elements exist (they should in the new template)
    setVal('set-owner', config.OWNER_NAME);
    setVal('set-ot', config.RATES.OT_PER_HOUR);
    setVal('set-npl', config.RATES.NPL_FINE);
    setVal('set-bonus', config.RATES.ATTENDANCE_BONUS);

    // 2. Attach Event Listeners
    // We can use onchange in HTML or attach here. 
    // HTML onchange="window.handleSettingChange(this)" is easier for the template.
};

// Expose to window for Router
window.renderSettings = renderSettings;

const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
};

window.toggleSettingsSection = (id) => {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    if (el) {
        if (el.classList.contains('hidden')) {
            // Check if we want accordion behavior (close others) or allow multiple open
            // Let's implement strict accordion (close others) for cleaner UI
            ['sec-data', 'sec-config', 'sec-account'].forEach(otherId => {
                if (otherId !== id) {
                    const otherEl = document.getElementById(otherId);
                    const otherIcon = document.getElementById('icon-' + otherId);
                    if (otherEl) otherEl.classList.add('hidden');
                    if (otherIcon) otherIcon.classList.remove('rotate-180');
                }
            });

            el.classList.remove('hidden');
            if (icon) icon.classList.add('rotate-180');
        } else {
            el.classList.add('hidden');
            if (icon) icon.classList.remove('rotate-180');
        }
    }
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
        localStorage.removeItem('srf_config');
        localStorage.removeItem('srf_notifications');

        if (window.saveToCloud) {
            window.saveToCloud('staffData', []);
            window.saveToCloud('staffLedgers', {});
            // ... wipe other paths
        }

        alert("System Cleaned! Ready for fresh use.");
        window.location.reload();
    }
};

window.saveSettingsConfig = () => {
    const newConfig = { ...state.config };

    newConfig.OWNER_NAME = document.getElementById('set-owner').value;
    newConfig.RATES.OT_PER_HOUR = Number(document.getElementById('set-ot').value);
    newConfig.RATES.NPL_FINE = Number(document.getElementById('set-npl').value);
    newConfig.RATES.ATTENDANCE_BONUS = Number(document.getElementById('set-bonus').value);

    // Save
    state.config = newConfig;
    localStorage.setItem('srf_config', JSON.stringify(newConfig));
    if (window.saveToCloud) window.saveToCloud('config', newConfig);

    // Feedback
    const btn = document.getElementById('btn-save-settings');
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-check"></i> Saved`;
        btn.classList.add('bg-emerald-600', 'text-white');
        btn.classList.remove('bg-slate-800');

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('bg-emerald-600', 'text-white');
            btn.classList.add('bg-slate-800');
            cancelEditMode(); // Revert to disabled state
        }, 1500);
    }
};

// --- Secure Edit Mode Logic ---

window.toggleSecurePasswordVisibility = () => {
    const input = document.getElementById('secure-edit-pass');
    const icon = document.getElementById('secure-pass-icon');
    if (!input || !icon) return;

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

window.renderCPINState = () => {
    const cpin = localStorage.getItem('srf_cpin');
    const isEnabled = localStorage.getItem('srf_cpin_enabled') === 'true';

    // Toggle Switch
    const toggle = document.getElementById('cpin-toggle');
    const statusText = document.getElementById('cpin-status-text');
    const formsContainer = document.getElementById('cpin-forms-container');
    const setForm = document.getElementById('form-set-cpin');
    const resetForm = document.getElementById('form-reset-cpin');

    if (toggle) toggle.checked = isEnabled;
    if (statusText) statusText.innerText = isEnabled ? "Enabled" : "Disabled";

    if (!isEnabled) {
        if (formsContainer) formsContainer.classList.add('hidden');
        return;
    }

    if (formsContainer) formsContainer.classList.remove('hidden');

    if (!cpin) {
        // State: Enabled but not set -> Show Set Form
        if (setForm) setForm.classList.remove('hidden');
        if (resetForm) resetForm.classList.add('hidden');
    } else {
        // State: Enabled and set -> Show Reset Form
        if (setForm) setForm.classList.add('hidden');
        if (resetForm) resetForm.classList.remove('hidden');
    }
};

window.toggleCPIN = (isChecked) => {
    localStorage.setItem('srf_cpin_enabled', isChecked);
    renderCPINState();
};

window.saveNewCPIN = () => {
    const p1 = document.getElementById('new-cpin').value;
    const p2 = document.getElementById('confirm-cpin').value;

    if (!p1 || p1.length < 4) {
        alert("PIN must be at least 4 digits.");
        return;
    }

    if (p1 !== p2) {
        alert("PINs do not match!");
        return;
    }

    localStorage.setItem('srf_cpin', p1);
    alert("CPIN Set Successfully!");

    // Clear inputs
    document.getElementById('new-cpin').value = '';
    document.getElementById('confirm-cpin').value = '';

    renderCPINState();
};

window.resetCPIN = () => {
    const oldPin = document.getElementById('old-cpin').value;
    const newPin = document.getElementById('reset-new-cpin').value;
    const confirmPin = document.getElementById('reset-confirm-cpin').value;
    const storedPin = localStorage.getItem('srf_cpin');

    if (oldPin !== storedPin) {
        alert("Incorrect Current PIN.");
        return;
    }

    if (!newPin || newPin.length < 4) {
        alert("New PIN must be at least 4 digits.");
        return;
    }

    if (newPin !== confirmPin) {
        alert("New PINs do not match!");
        return;
    }

    localStorage.setItem('srf_cpin', newPin);
    alert("CPIN Updated Successfully!");

    // Clear inputs
    document.getElementById('old-cpin').value = '';
    document.getElementById('reset-new-cpin').value = '';
    document.getElementById('reset-confirm-cpin').value = '';

    renderCPINState();
};

window.initiateEdit = () => {
    document.getElementById('password-modal').classList.remove('hidden');
    document.getElementById('secure-edit-pass').value = '';
    document.getElementById('secure-edit-error').classList.add('hidden');
    setTimeout(() => document.getElementById('secure-edit-pass').focus(), 100);
};

window.closePasswordModal = () => {
    document.getElementById('password-modal').classList.add('hidden');
};

window.verifyPasswordForEdit = () => {
    const pass = document.getElementById('secure-edit-pass').value;
    const errorEl = document.getElementById('secure-edit-error');
    const btn = document.getElementById('btn-verify-pass');

    if (!pass) return;

    // 1. Check CPIN First (Local Override)
    const storedCPIN = localStorage.getItem('srf_cpin');
    const isCPINEnabled = localStorage.getItem('srf_cpin_enabled') === 'true';

    if (isCPINEnabled && storedCPIN && pass === storedCPIN) {
        closePasswordModal();
        enableEditMode();
        btn.innerText = "Verify & Unlock"; // Reset text
        btn.disabled = false;
        return;
    }

    // Loading State
    const originalText = btn.innerText;
    btn.innerText = "Verifying...";
    btn.disabled = true;

    // Verify with Firebase
    const user = window.auth.currentUser;
    if (!user || !user.email) {
        errorEl.innerText = "Session Error. Please re-login.";
        errorEl.classList.remove('hidden');
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }

    window.signInWithEmailAndPassword(window.auth, user.email, pass)
        .then(() => {
            // Success
            closePasswordModal();
            enableEditMode();
            btn.innerText = originalText;
            btn.disabled = false;
        })
        .catch((error) => {
            console.error("Verification Failed", error);
            errorEl.innerText = "Incorrect Password";
            errorEl.classList.remove('hidden');
            btn.classList.add('bg-red-500');
            setTimeout(() => btn.classList.remove('bg-red-500'), 500);
            btn.innerText = originalText;
            btn.disabled = false;
        });
};

const enableEditMode = () => {
    // Show/Hide Buttons
    document.getElementById('btn-edit-settings').classList.add('hidden');
    document.getElementById('btn-save-settings').classList.remove('hidden');
    document.getElementById('btn-cancel-edit').classList.remove('hidden');

    // Enable Inputs with visual cues
    ['set-owner', 'set-ot', 'set-npl', 'set-bonus'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = false;
            el.classList.add('bg-white', 'border-indigo-500', 'ring-1', 'ring-indigo-500');
            el.classList.remove('bg-slate-50', 'border-slate-200');
        }
    });

    // Show CPIN Section
    const cpinSection = document.getElementById('cpin-section');
    if (cpinSection) {
        cpinSection.classList.remove('hidden');
        cpinSection.classList.add('animate-fade-in-up');

        renderCPINState();
    }
};

window.cancelEditMode = () => {
    // Revert Buttons
    document.getElementById('btn-edit-settings').classList.remove('hidden');
    document.getElementById('btn-save-settings').classList.add('hidden');
    document.getElementById('btn-cancel-edit').classList.add('hidden');

    // Disable Inputs
    ['set-owner', 'set-ot', 'set-npl', 'set-bonus'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = true;
            el.classList.add('bg-slate-50', 'border-slate-200');
            el.classList.remove('bg-white', 'border-indigo-500', 'ring-1', 'ring-indigo-500');

            // Reset values to current config (in case of cancel)
            if (state.config) { // Safety check
                if (id === 'set-owner') el.value = state.config.OWNER_NAME;
                if (id === 'set-ot') el.value = state.config.RATES.OT_PER_HOUR;
                if (id === 'set-npl') el.value = state.config.RATES.NPL_FINE;
                if (id === 'set-bonus') el.value = state.config.RATES.ATTENDANCE_BONUS;
            }
        }
    });

    // Hide CPIN Section
    const cpinSection = document.getElementById('cpin-section');
    if (cpinSection) cpinSection.classList.add('hidden');
};
