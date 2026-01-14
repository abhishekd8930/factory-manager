console.log("Main Controller Loaded");

// --- 1. GLOBAL SHORTCUTS ---

window.handleGlobalKeydown = (e) => {
    // Ignore shortcuts if on login screen
    if (document.getElementById('login-view').classList.contains('hidden') === false) return;
    
    // Tab Switching (Alt + 1-6)
    if (e.altKey) {
        switch(e.key) {
            case '1': switchTab('home'); break;
            case '2': switchTab('dashboard'); break;
            case '3': switchTab('staff'); break;
            case '4': switchTab('attendance'); break;
            case '5': switchTab('history'); break;
            case '6': switchTab('accounts'); break;
            case '7': switchTab('inventory'); break;
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
        if(header) {
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
const performSwitchTab = (id) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => { 
        btn.classList.remove('bg-indigo-50', 'text-indigo-600', 'ring-1', 'ring-indigo-100'); 
        btn.classList.add('text-slate-500'); 
    });
    
    const btnId = 'nav-' + id;
    const btn = document.getElementById(btnId);
    if(btn) {
        btn.classList.remove('text-slate-500');
        btn.classList.add('bg-indigo-50', 'text-indigo-600', 'ring-1', 'ring-indigo-100');
    }
    
    if(id === 'home' && window.renderHome) window.renderHome();
    if(id === 'dashboard' && window.renderCharts) window.renderCharts();
    if(id === 'staff') { 
        if(window.closeLedgerView) window.closeLedgerView(); 
        if(window.renderStaffGrid) window.renderStaffGrid(); 
    }
    if(id === 'attendance') { 
        const attDate = document.getElementById('attendance-date');
        if(attDate && !attDate.value) attDate.value = state.today; 
        
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        document.getElementById('attendance-month').value = `${yyyy}-${mm}`;
        
        const isDaily = document.getElementById('btn-att-daily').classList.contains('bg-white');
        if(isDaily && window.renderAttendanceView) window.renderAttendanceView();
        else if(window.renderAttendanceBook) window.renderAttendanceBook();
    }
    if(id === 'history' && window.renderHistoryPage) window.renderHistoryPage();
    if(id === 'accounts') {
        const transDate = document.getElementById('trans-date');
        if(transDate) transDate.value = state.today;
        if(window.renderAccounts) window.renderAccounts();
    }

    window.closeSidebarOnMobile();
};

// Helper wrapper to save state
window.switchTab = (id) => {
    localStorage.setItem('srf_last_tab', id);
    performSwitchTab(id);
};

// --- 3. SIDEBAR LOGIC ---

window.toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
};

window.closeSidebarOnMobile = () => { 
    if(window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('-translate-x-full'); 
    }
};

// --- 4. SETTINGS MODAL LOGIC ---

window.openSettings = () => {
    document.getElementById('settings-modal').classList.remove('hidden');
    // Add this function to js/main.js
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
        
        // Optional: If using Firebase, wipe that too (be careful!)
        if(window.saveToCloud) {
            window.saveToCloud('staffData', []);
            window.saveToCloud('staffLedgers', {});
            // ... wipe other paths
        }

        alert("System Cleaned! Ready for fresh use.");
        window.location.reload();
    }
};
};

window.closeSettings = () => {
    document.getElementById('settings-modal').classList.add('hidden');
};

const settingsModal = document.getElementById('settings-modal');
if(settingsModal) {
    settingsModal.addEventListener('click', (e) => {
        if(e.target.id === 'settings-modal') {
            window.closeSettings();
        }
    });
}

// --- 5. INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => { 
    const attDate = document.getElementById('attendance-date');
    if(attDate) attDate.value = state.today; 
    
    // RESTORE SESSION
    const lastTab = localStorage.getItem('srf_last_tab') || 'home';
    const lastEmpId = localStorage.getItem('srf_last_emp_id');

    // Use internal function to avoid wiping 'srf_last_emp_id' which switchTab might do indirectly via closeLedgerView
    // Actually, switchTab calls closeLedgerView which removes the ID.
    // FIX: We manually restore tab, THEN if it was staff+ledger, we re-open it.
    
    // 1. Render the basic tab view
    performSwitchTab(lastTab); 

    // 2. If we were deep inside a ledger, restore that specifically
    if (lastTab === 'staff' && lastEmpId) {
        // Wait for grid to render
        setTimeout(() => {
            if(window.openLedger) window.openLedger(lastEmpId, false);
        }, 50);
    }

    if(window.addLedgerRow) window.addLedgerRow(); 
    // In js/main.js inside performSwitchTab(id):

    if(id === 'inventory' && window.renderInventory) window.renderInventory();
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
        if(event.error === 'not-allowed') alert("Please allow Microphone access.");
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
    
    // 2. If we are on the home screen, force a calendar render
    const homeGrid = document.getElementById('home-calendar-grid');
    if (homeGrid && window.renderHome) {
        window.renderHome();
    }
});
// ==========================================
// 3. SYSTEM INITIALIZATION (Race Condition Fix)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Fully Loaded. Initializing App Components...");

    // 1. Force a delay-render for the calendar
    // This solves the issue where the white box exists but dates are missing
    setTimeout(() => {
        if (typeof window.renderHomeCalendar === 'function') {
            console.log("Rendering Calendar...");
            window.renderHomeCalendar();
        }
        
        if (typeof window.renderTodoList === 'function') {
            window.renderTodoList();
        }
        
        if (typeof window.updateGreeting === 'function') {
            window.updateGreeting();
        }
    }, 100); // 100ms delay to ensure HTML paint is complete
});