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
    const sidebar = document.getElementById('sidebar');
    const isHidden = sidebar.classList.contains('-translate-x-full');

    if (isHidden) {
        // Show sidebar - expand to full width on mobile
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.remove('w-20');
        sidebar.classList.add('w-64');
        sidebar.querySelectorAll('.nav-label').forEach(el => el.classList.remove('hidden'));
        sidebar.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('justify-center'));
    } else {
        // Hide sidebar
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('w-64');
        sidebar.classList.add('w-20');
        sidebar.querySelectorAll('.nav-label').forEach(el => el.classList.add('hidden'));
        sidebar.querySelectorAll('.nav-btn').forEach(btn => btn.classList.add('justify-center'));
    }
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
             data-noti-id="${id}"
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

    // Attach passive touch event listeners for swipe-to-dismiss
    list.querySelectorAll('[data-noti-id]').forEach(el => {
        const id = el.dataset.notiId;
        el.addEventListener('touchstart', (e) => handleSwipeStart(e, id), { passive: true });
        el.addEventListener('touchend', (e) => handleSwipeEnd(e, id), { passive: true });
    });
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
    // 1. Close others (Profile)
    window.closeProfile();

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
// --- 4. PROFILE & SETTINGS PANEL LOGIC ---

// ID Card Transformation Logic
const idCardLogic = {
    init: () => {
        const $wrap = document.querySelector(".card-wrapper");
        const $card = document.querySelector("#card");
        const $cardInner = document.querySelector(".card-inner");

        if (!$wrap || !$card || !$cardInner) return;

        // Helper: Clamp value
        const clamp = (value, min = 0, max = 100) => {
            return Math.min(Math.max(value, min), max);
        };

        // Helper: Round to decimal places
        const round = (value, precision = 3) => parseFloat(value.toFixed(precision));

        // 1. Tilt Update Function
        const cardUpdate = (e) => {
            if (e.pointerType === "touch") return;

            const bounds = $card.getBoundingClientRect();

            const relativeX = e.clientX - bounds.left;
            const relativeY = e.clientY - bounds.top;

            const w = bounds.width;
            const h = bounds.height;
            const px = clamp((relativeX / w) * 100, 0, 100);
            const py = clamp((relativeY / h) * 100, 0, 100);

            const centerX = px - 50;
            const centerY = py - 50;

            // Tilt intensity
            const rotateX = -(centerY / 8);
            const rotateY = (centerX / 8);

            $card.style.setProperty("--pointer-x", `${px}%`);
            $card.style.setProperty("--pointer-y", `${py}%`);
            $card.style.setProperty("--rotate-x", `${round(rotateY)}deg`);
            $card.style.setProperty("--rotate-y", `${round(rotateX)}deg`);
            $card.style.setProperty("--card-opacity", "1");
        };

        // 2. Reset Function
        const cardReset = () => {
            $card.style.setProperty("--card-opacity", "0");
            $card.style.setProperty("--rotate-x", "0deg");
            $card.style.setProperty("--rotate-y", "0deg");
            $card.style.setProperty("--pointer-x", "50%");
            $card.style.setProperty("--pointer-y", "50%");
        };

        // 3. Flip Logic
        // Remove existing listener to avoid duplicates if re-initialized
        $wrap.removeEventListener("dblclick", idCardLogic.flipHandler);
        idCardLogic.flipHandler = () => $cardInner.classList.toggle("is-flipped");
        $wrap.addEventListener("dblclick", idCardLogic.flipHandler);

        // Event Listeners for Tilt
        $wrap.removeEventListener("pointermove", idCardLogic.moveHandler);
        $wrap.removeEventListener("pointerleave", idCardLogic.leaveHandler);

        idCardLogic.moveHandler = cardUpdate;
        idCardLogic.leaveHandler = cardReset;

        $wrap.addEventListener("pointermove", cardUpdate);
        $wrap.addEventListener("pointerleave", cardReset);

        // Intro Animation
        setTimeout(() => {
            $card.style.transition = "transform 0.8s ease";
            $card.style.setProperty("--rotate-x", "10deg");
            $card.style.setProperty("--rotate-y", "10deg");
            $card.style.setProperty("--card-opacity", "0.5");

            setTimeout(() => {
                $card.style.transition = "";
                cardReset();
            }, 800);
        }, 300);
    },

    // Stored references for cleanup if needed
    flipHandler: null,
    moveHandler: null,
    leaveHandler: null
};

// PROFILE PANEL
window.openProfile = () => {
    // 1. Close others
    window.closeNotifications();

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
        email: "admin@factory.com",
        valid: "DEC 2030"
    };

    // Try to find matching staff record
    if (state.staffData) {
        const staffMatch = state.staffData.find(e => e.name.toLowerCase() === ownerName.toLowerCase());
        if (staffMatch) {
            user.name = staffMatch.name;
            user.initials = staffMatch.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            user.role = staffMatch.role;
            user.unit = staffMatch.unit;
            user.id = staffMatch.id || "SRF-001";
            user.email = staffMatch.phone || "No Phone";
        }
    }

    // Auth fallback
    if (window.auth && window.auth.currentUser) {
        user.email = window.auth.currentUser.email;
    }

    // Employee override: use Google profile data or Local Auth data
    if (window.isEmployee && window.isEmployee()) {
        const empName = localStorage.getItem('srf_employee_name');
        const empPhoto = localStorage.getItem('srf_employee_photo');
        const empId = localStorage.getItem('srf_worker_id');
        const empUnit = localStorage.getItem('srf_employee_unit');

        if (empName) {
            user.name = empName;
            user.initials = empName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        }
        if (empId) user.id = empId;
        if (empUnit) user.unit = empUnit;

        user.role = 'Employee';

        if (empPhoto) {
            // Store as avatar override for ID card
            user.photoURL = empPhoto;
        }
    }

    // Update DOM for ID Card
    const els = {
        name: document.getElementById('card-user-name'),
        role: document.getElementById('card-user-role'),
        unit: document.getElementById('card-user-unit'),
        id: document.getElementById('card-user-id'),
        qrText: document.getElementById('card-qr-text'),
        qrImg: document.getElementById('card-qr-img'),
        avatarImg: document.getElementById('card-avatar-img')
    };

    if (els.name) els.name.innerText = user.name;
    if (els.role) els.role.innerText = user.role;
    if (els.unit) els.unit.innerText = user.unit;
    if (els.id) els.id.innerText = user.id;
    if (els.qrText) els.qrText.innerText = `SRF-${user.id}`;

    // Set Avatar
    if (els.avatarImg) {
        if (user.photoURL) {
            els.avatarImg.src = user.photoURL;
        } else {
            els.avatarImg.src = state.config.OWNER_AVATAR || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=90";
        }
    }

    // Generate QR Code
    if (els.qrImg) {
        const qrData = `SRF-AUTH-${user.id}-${user.name.replace(/\s+/g, '-')}`;
        els.qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
    }

    // 4. Show & Animate
    wrapper.classList.remove('hidden');
    setTimeout(() => {
        if (backdrop) backdrop.classList.remove('opacity-0');
        if (panel) panel.classList.remove('translate-x-full');

        // Initialize ID Card Logic after panel is visible
        idCardLogic.init();
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

window.openEditProfile = () => {
    // 1. Close Profile Panel
    window.closeProfile();

    // 2. Get Elements
    const modal = document.getElementById('edit-profile-modal');
    const nameInput = document.getElementById('edit-owner-name');
    const businessInput = document.getElementById('edit-garment-name');
    const previewImg = document.getElementById('edit-avatar-preview');

    // 3. Populate Data
    if (nameInput) nameInput.value = state.config.OWNER_NAME || "";
    if (businessInput) businessInput.value = state.config.GARMENT_NAME || "";

    // Set Preview
    if (previewImg) {
        previewImg.src = state.config.OWNER_AVATAR || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=90";
        previewImg.classList.remove('opacity-50');
    }

    // Reset file input
    const fileInput = document.getElementById('edit-avatar-file');
    if (fileInput) fileInput.value = "";

    // 4. Show Modal
    if (modal) modal.classList.remove('hidden');
};

// New: Handle Image Upload with Client-Side Resize
window.handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 800; // Max width/height
            let width = img.width;
            let height = img.height;

            // Resize logic
            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress as JPEG 0.9
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

            // Update Preview
            const previewImg = document.getElementById('edit-avatar-preview');
            if (previewImg) {
                previewImg.src = dataUrl;
                previewImg.classList.remove('opacity-50');
            }

            // Store temporarily in a global var or on the element
            window.tempAvatarData = dataUrl;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.saveEditProfile = () => {
    const nameInput = document.getElementById('edit-owner-name');
    const businessInput = document.getElementById('edit-garment-name');

    if (nameInput && businessInput) {
        // Update State
        state.config.OWNER_NAME = nameInput.value.trim() || "Administrator";
        state.config.GARMENT_NAME = businessInput.value.trim() || "Factory Manager";

        // Save Avatar if changed
        if (window.tempAvatarData) {
            state.config.OWNER_AVATAR = window.tempAvatarData;
            window.tempAvatarData = null; // Clear temp
        }

        // Persist
        localStorage.setItem('srf_config', JSON.stringify(state.config));

        // Sync (if active)
        // if (window.saveToCloud) window.saveToCloud('config', state.config);

        // Update UI
        if (window.updateGarmentLabel) window.updateGarmentLabel();
        if (window.updateHeaderProfile) window.updateHeaderProfile(); // Sync Header

        // Close Modal
        document.getElementById('edit-profile-modal').classList.add('hidden');


        // Optional: Show Success?
        // Re-open profile to see changes
        setTimeout(() => window.openProfile(), 300);
    }
};

window.openPrivacyModal = () => {
    window.closeProfile();
    const modal = document.getElementById('privacy-modal');
    if (modal) modal.classList.remove('hidden');
};

window.closePrivacyModal = () => {
    const modal = document.getElementById('privacy-modal');
    if (modal) modal.classList.add('hidden');
    // Re-open profile for smooth flow, or just close. Let's just close for now.
    // setTimeout(() => window.openProfile(), 100); 
};

window.openTermsModal = () => {
    window.closeProfile();
    const modal = document.getElementById('terms-modal');
    if (modal) modal.classList.remove('hidden');
};

window.closeTermsModal = () => {
    const modal = document.getElementById('terms-modal');
    if (modal) modal.classList.add('hidden');
};




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

    // 2. Initialize Garment Label
    if (window.updateGarmentLabel) window.updateGarmentLabel();

    // 3. Initialize Header Profile
    if (window.updateHeaderProfile) window.updateHeaderProfile();
});

// --- GARMENT LABEL LOGIC ---
window.updateGarmentLabel = () => {
    const name = state.config.GARMENT_NAME || "";
    const headerEl = document.getElementById('header-garment-name');
    const sidebarEl = document.getElementById('sidebar-garment-name');

    if (name && name.trim() !== "") {
        // Show
        if (headerEl) {
            headerEl.innerText = name;
            headerEl.classList.remove('hidden');
        }
        if (sidebarEl) {
            sidebarEl.querySelector('span').innerText = name;
            sidebarEl.classList.remove('hidden');
        }
    } else {
        // Hide
        if (headerEl) headerEl.classList.add('hidden');
        if (sidebarEl) sidebarEl.classList.add('hidden');
    }
};

// --- HEADER PROFILE SYNC ---
window.updateHeaderProfile = () => {
    const imgEl = document.getElementById('header-profile-img');
    const initEl = document.getElementById('header-profile-initial');

    if (imgEl && initEl) {
        // Employee override: use Google photo
        const isEmp = window.isEmployee && window.isEmployee();
        const empPhoto = isEmp ? localStorage.getItem('srf_employee_photo') : null;
        const empName = isEmp ? localStorage.getItem('srf_employee_name') : null;

        if (empPhoto) {
            imgEl.src = empPhoto;
            imgEl.classList.remove('hidden');
            initEl.classList.add('hidden');
        } else if (state.config.OWNER_AVATAR) {
            imgEl.src = state.config.OWNER_AVATAR;
            imgEl.classList.remove('hidden');
            initEl.classList.add('hidden');
        } else {
            imgEl.classList.add('hidden');
            initEl.classList.remove('hidden');
            // Update Initial
            const name = (isEmp && empName) ? empName : (state.config.OWNER_NAME || "Manager");
        }
    }
};

// --- GLOBAL SEARCH LOGIC ---
let globalSearchTimeout = null;

window.handleGlobalSearch = (query) => {
    clearTimeout(globalSearchTimeout);

    const resultsContainer = document.getElementById('global-search-results');
    const inputEl = document.getElementById('global-search-input');

    if (!query || query.trim() === '') {
        resultsContainer.classList.add('hidden');
        return;
    }

    // Determine dropdown width based on input
    if (inputEl) {
        // Ensure dropdown matches exactly input container width or preferred width
        resultsContainer.style.width = inputEl.closest('.search-container-solid').offsetWidth + 'px';
    }

    resultsContainer.classList.remove('hidden');

    globalSearchTimeout = setTimeout(() => {
        executeGlobalSearch(query.trim().toLowerCase());
    }, 300); // 300ms debounce
};

function executeGlobalSearch(query) {
    const listEl = document.getElementById('global-search-list');
    let results = [];

    // 1. Search Staff (if allowed)
    if (state.staffData) {
        const staffMatches = state.staffData.filter(s =>
            (s.name && s.name.toLowerCase().includes(query)) ||
            (s.id && s.id.toLowerCase().includes(query)) ||
            (s.phone && s.phone.includes(query)) ||
            (s.role && s.role.toLowerCase().includes(query))
        ).map(s => ({
            type: 'staff',
            id: s.id,
            title: s.name,
            subtitle: `${s.role} • ${s.id}`,
            icon: 'fa-user',
            color: 'text-indigo-500 bg-indigo-50 border-indigo-100',
            data: s
        }));
        results = results.concat(staffMatches);
    }

    // 2. Search Catalogue
    if (state.catalogueItems) {
        const catMatches = state.catalogueItems.filter(c =>
            (c.item_name && c.item_name.toLowerCase().includes(query)) ||
            (c.fabric && c.fabric.toLowerCase().includes(query)) ||
            (c.pattern && c.pattern.toLowerCase().includes(query)) ||
            (c.brand && c.brand.toLowerCase().includes(query))
        ).map(c => ({
            type: 'catalogue',
            id: c.id,
            title: c.item_name,
            subtitle: `${c.pattern || 'No Pattern'} • ${c.fabric || 'No Fabric'}`,
            icon: 'fa-book-open',
            color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
            data: c
        }));
        results = results.concat(catMatches);
    }

    // Limit to top 8 overall results for UI sanity
    results = results.slice(0, 8);

    renderGlobalSearchResults(results, query);
}

function renderGlobalSearchResults(results, query) {
    const listEl = document.getElementById('global-search-list');

    if (results.length === 0) {
        listEl.innerHTML = `
            <div class="px-4 py-8 text-center text-slate-400">
                <i class="fa-solid fa-magnifying-glass text-2xl mb-2 opacity-30"></i>
                <p class="text-xs">No results found for "<span class="font-bold text-slate-500">${query}</span>"</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = results.map(r => `
        <div onclick="navigateFromGlobalSearch('${r.type}', '${r.id}')" 
             class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition border border-transparent hover:border-slate-100 group">
            <div class="w-10 h-10 rounded-xl ${r.color} flex items-center justify-center shrink-0 border">
                <i class="fa-solid ${r.icon} group-hover:scale-110 transition-transform"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-slate-700 text-sm truncate group-hover:text-indigo-600 transition-colors">${r.title}</h4>
                <p class="text-xs text-slate-500 truncate">${r.subtitle}</p>
            </div>
            <i class="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transform duration-200"></i>
        </div>
    `).join('');
}

window.navigateFromGlobalSearch = (type, id) => {
    window.closeGlobalSearch();

    if (type === 'staff') {
        window.switchTab('staff');
        setTimeout(() => {
            if (window.openLedger) {
                // Find matching staff object
                const emp = state.staffData.find(s => s.id === id);
                if (emp) window.openLedger(emp);
            }
        }, 100);
    } else if (type === 'catalogue') {
        window.switchTab('catalogue');
        setTimeout(() => {
            if (window.openCatalogueDetail) window.openCatalogueDetail(id);
        }, 100);
    }
};

window.closeGlobalSearch = () => {
    const resultsContainer = document.getElementById('global-search-results');
    const inputEl = document.getElementById('global-search-input');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    if (inputEl) inputEl.value = '';
};

// Close global search when clicking outside
document.addEventListener('click', (e) => {
    const searchContainer = document.getElementById('global-search-container');
    if (searchContainer && !searchContainer.contains(e.target)) {
        window.closeGlobalSearch();
    }
});

