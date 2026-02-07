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
            case '2': window.location.hash = '#/catalogue'; break;
            case '3': window.location.hash = '#/units'; break;
            case '4': window.location.hash = '#/staff'; break;
            case '5': window.location.hash = '#/history'; break;
            case '6': window.location.hash = '#/dashboard'; break;
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
    if (activeTab === 'dashboard') window.addDashboardLedgerRow();
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
    const sidebar = document.getElementById('sidebar');
    const labels = document.querySelectorAll('.nav-label');

    // Toggle Width
    if (sidebar.classList.contains('w-64')) {
        // COLLAPSE
        sidebar.classList.remove('w-64');
        sidebar.classList.add('w-20');

        // Hide Text
        labels.forEach(el => el.classList.add('hidden'));

        // Adjust elements for centered icons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.add('justify-center');
        });

    } else {
        // EXPAND
        sidebar.classList.remove('w-20');
        sidebar.classList.add('w-64');

        // Show Text
        labels.forEach(el => el.classList.remove('hidden'));

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

// --- NOTIFICATIONS LOGIC ---
window.renderNotifications = () => {
    const list = document.getElementById('notification-list');
    if (!list) return;

    if (!state.notifications || state.notifications.length === 0) {
        list.innerHTML = `<div class="text-center py-8 text-slate-400 italic">No new notifications</div>`;
        return;
    }

    list.innerHTML = state.notifications.map(n => {
        let icon = 'fa-circle-info';
        let color = 'text-blue-500 bg-blue-50';

        if (n.type === 'alert') { icon = 'fa-triangle-exclamation'; color = 'text-amber-500 bg-amber-50'; }
        if (n.type === 'success') { icon = 'fa-check'; color = 'text-emerald-500 bg-emerald-50'; }
        if (n.type === 'action') { icon = 'fa-bell'; color = 'text-indigo-500 bg-indigo-50'; }

        const timeDiff = getTimeDifference(new Date(n.time));
        const id = n.id || Date.now(); // Fallback

        return `
        <div class="relative flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group cursor-pointer overflow-hidden touch-pan-y" 
             onclick="handleNotificationClick('${n.link || ''}')"
             ontouchstart="handleSwipeStart(event, '${id}')"
             ontouchend="handleSwipeEnd(event, '${id}')"
             id="noti-${id}">
             
            <div class="w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-slate-700 text-sm truncate pr-6">${n.title}</h4>
                <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">${n.msg}</p>
                <p class="text-[10px] text-slate-400 mt-1 font-medium">${timeDiff}</p>
            </div>
            
            <!-- Hover Delete Button (Desktop) -->
            <button onclick="deleteNotification(event, '${id}')" class="absolute top-2 right-2 p-2 rounded-full bg-white/80 shadow-sm opacity-0 group-hover:opacity-100 transition duration-200 text-slate-400 hover:text-red-500 hover:bg-slate-100 transform active:scale-95">
                <i class="fa-solid fa-xmark text-sm"></i>
            </button>
        </div>`;
    }).join('');
};

// Swipe Logic Globals
let touchStartX = 0;

window.handleSwipeStart = (e, id) => {
    touchStartX = e.changedTouches[0].screenX;
};

window.handleSwipeEnd = (e, id) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;

    // Swipe Right or Left (> 50px)
    if (Math.abs(diff) > 50) {
        // Animate out
        const el = document.getElementById(`noti-${id}`);
        if (el) {
            el.style.transition = 'transform 0.2s, opacity 0.2s';
            el.style.transform = `translateX(${diff > 0 ? '100%' : '-100%'})`;
            el.style.opacity = '0';
            setTimeout(() => deleteNotification(null, id), 200);
        }
    }
};

window.deleteNotification = (e, id) => {
    if (e) e.stopPropagation();

    state.notifications = state.notifications.filter(n => n.id !== id);
    localStorage.setItem('srf_notifications', JSON.stringify(state.notifications));
    if (window.saveToCloud) window.saveToCloud('notifications', state.notifications);

    if (state.notifications.length === 0) window.updateNotificationBadge();

    // Re-render
    window.renderNotifications();
};

window.clearAllNotifications = () => {
    if (confirm("Delete all notifications?")) {
        state.notifications = [];
        localStorage.setItem('srf_notifications', '[]');
        if (window.saveToCloud) window.saveToCloud('notifications', []);

        window.updateNotificationBadge();
        window.renderNotifications();
    }
};

// --- NOTIFICATION HELPERS ---

window.updateNotificationBadge = () => {
    const hasUnread = state.notifications.some(n => !n.read);
    const homeBadge = document.getElementById('nav-home-badge');
    const btnBadge = document.getElementById('btn-noti-badge');
    const headerBadge = document.getElementById('header-noti-badge');

    if (hasUnread) {
        if (homeBadge) homeBadge.classList.remove('hidden');
        if (btnBadge) btnBadge.classList.remove('hidden');
        if (headerBadge) headerBadge.classList.remove('hidden');
    } else {
        if (homeBadge) homeBadge.classList.add('hidden');
        if (btnBadge) btnBadge.classList.add('hidden');
        if (headerBadge) headerBadge.classList.add('hidden');
    }
};

function getTimeDifference(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

window.showNotifications = () => {
    // 1. Close Settings if open (Exclusive Toggle)
    window.closeSettings();

    // 2. Prepare Notification Panel
    const wrapper = document.getElementById('notification-modal');
    const panel = document.getElementById('notification-panel');
    const backdrop = document.getElementById('notification-backdrop');

    // Mark all as read logic remains
    state.notifications.forEach(n => n.read = true);
    localStorage.setItem('srf_notifications', JSON.stringify(state.notifications));
    if (window.saveToCloud) window.saveToCloud('notifications', state.notifications);
    window.updateNotificationBadge();
    window.renderNotifications();

    // 3. Show & Animate
    wrapper.classList.remove('hidden');
    // Small delay to ensure display:block applies before transition
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('translate-x-full');
    }, 10);
};

window.closeNotifications = () => {
    const wrapper = document.getElementById('notification-modal');
    const panel = document.getElementById('notification-panel');
    const backdrop = document.getElementById('notification-backdrop');

    // 1. Start Exit Animation
    if (panel) panel.classList.add('translate-x-full');
    if (backdrop) backdrop.classList.add('opacity-0');

    // 2. Hide after transition
    setTimeout(() => {
        if (wrapper) wrapper.classList.add('hidden');
    }, 300);
};

window.handleNotificationClick = (linkId) => {
    if (!linkId) return;
    window.closeNotifications();
    window.location.hash = '#/catalogue';
    setTimeout(() => {
        if (window.openCatalogueDetail) window.openCatalogueDetail(Number(linkId));
    }, 300); // Wait for panel to close
};

// --- 4. PROFILE & SETTINGS PANEL LOGIC ---

// PROFILE PANEL
window.openProfile = () => {
    // 1. Close others
    window.closeNotifications();
    window.closeSettings();

    // 2. Prepare Panel
    const wrapper = document.getElementById('profile-panel');
    const panel = document.getElementById('profile-panel-content');
    const backdrop = document.getElementById('profile-backdrop');

    // 3. Populate Profile Data
    const ownerName = window.CONFIG?.OWNER_NAME || "Administrator";
    let user = {
        name: ownerName,
        initials: ownerName.charAt(0).toUpperCase(),
        role: "Administrator",
        unit: "Head Office",
        id: "OWNER-001",
        email: "admin@factory.com"
    };

    // Try to find matching staff record
    if (state.staffData) {
        const staffMatch = state.staffData.find(e => e.name.toLowerCase() === ownerName.toLowerCase());
        if (staffMatch) {
            user.name = staffMatch.name;
            user.initials = staffMatch.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            user.role = staffMatch.role;
            user.unit = staffMatch.unit;
            user.id = staffMatch.id;
            user.email = staffMatch.phone || "No Phone";
        }
    }

    // Auth fallback
    if (window.auth && window.auth.currentUser) {
        user.email = window.auth.currentUser.email;
    }

    // Update DOM
    const els = {
        avatar: document.getElementById('profile-avatar'),
        name: document.getElementById('profile-name'),
        role: document.getElementById('profile-role'),
        unit: document.getElementById('profile-unit'),
        id: document.getElementById('profile-id'),
        email: document.getElementById('profile-email')
    };

    if (els.name) els.name.innerText = user.name;
    if (els.role) els.role.innerText = user.role;
    if (els.unit) els.unit.innerText = user.unit;
    if (els.id) els.id.innerText = user.id;
    if (els.email) els.email.innerText = user.email;
    if (els.avatar) {
        els.avatar.innerHTML = `
            <div class="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-3xl font-bold text-slate-500 border border-slate-200">
                ${user.initials}
            </div>
        `;
    }

    // 4. Show & Animate
    wrapper.classList.remove('hidden');
    setTimeout(() => {
        if (backdrop) backdrop.classList.remove('opacity-0');
        if (panel) panel.classList.remove('translate-x-full');
    }, 10);
};

window.closeProfile = () => {
    const wrapper = document.getElementById('profile-panel');
    const panel = document.getElementById('profile-panel-content');
    const backdrop = document.getElementById('profile-backdrop');

    if (panel) panel.classList.add('translate-x-full');
    if (backdrop) backdrop.classList.add('opacity-0');

    setTimeout(() => {
        if (wrapper) wrapper.classList.add('hidden');
    }, 300);
};

// SETTINGS PANEL
window.openSettings = () => {
    // 1. Close others
    window.closeNotifications();
    window.closeProfile();

    // 2. Prepare Settings Panel
    const wrapper = document.getElementById('settings-modal');
    const panel = document.getElementById('settings-panel');
    const backdrop = document.getElementById('settings-backdrop');

    // 3. Show & Animate
    wrapper.classList.remove('hidden');
    setTimeout(() => {
        if (backdrop) backdrop.classList.remove('opacity-0');
        if (panel) panel.classList.remove('-translate-x-full');
    }, 10);
};

window.closeSettings = () => {
    const wrapper = document.getElementById('settings-modal');
    const panel = document.getElementById('settings-panel');
    const backdrop = document.getElementById('settings-backdrop');

    // 1. Start Exit Animation
    if (panel) panel.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('opacity-0');

    // 2. Hide after transition
    setTimeout(() => {
        if (wrapper) wrapper.classList.add('hidden');

        // Reset Edit Mode (Logic from before)
        const inputs = ['conf-owner', 'conf-ot', 'conf-npl', 'conf-bonus'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.disabled = true;
                el.classList.remove('border-indigo-500', 'bg-indigo-50');
                el.classList.add('border-slate-200');
            }
        });
        const saveBtn = document.getElementById('btn-config-save');
        if (saveBtn) saveBtn.classList.add('hidden');
        const editBtn = document.getElementById('btn-config-edit');
        if (editBtn) editBtn.innerText = 'EDIT';

    }, 300);
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
