console.log("State Module Loaded");

const state = {
    today: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
    historyDate: new Date(),

    // LOAD FROM LOCAL STORAGE (Instant)
    historyData: JSON.parse(localStorage.getItem('srf_production_history')) || [],
    staffData: JSON.parse(localStorage.getItem('srf_staff_list')) || [],
    staffLedgers: JSON.parse(localStorage.getItem('srf_staff_ledgers')) || {},
    accountsData: JSON.parse(localStorage.getItem('srf_accounts')) || [],
    washingData: JSON.parse(localStorage.getItem('srf_washing_history')) || [],
    ownerTodos: JSON.parse(localStorage.getItem('srf_owner_todos') || '[]'),
    inventoryData: JSON.parse(localStorage.getItem('srf_inventory')) || [],

    // UI STATE
    selectedCalendarDate: null,
    currentLedgerEmp: null,
    currentLedgerDate: new Date(),
    sortTimings: 'alpha',
    sortPcs: 'alpha',
    searchTimings: '',
    searchPcs: '',

    // DYNAMIC CONFIG
    config: JSON.parse(localStorage.getItem('srf_config')) || DEFAULT_CONFIG,

    // NOTIFICATIONS (Persistent)
    notifications: JSON.parse(localStorage.getItem('srf_notifications')) || []
};

// --- HELPER: ADD NOTIFICATION ---
window.addNotification = (notification) => {
    // Add timestamp if missing
    if (!notification.time) notification.time = new Date().toISOString();
    if (!notification.id) notification.id = Date.now().toString();

    // Default to unread
    if (notification.read === undefined) notification.read = false;

    // Add to state
    state.notifications.unshift(notification);

    // Limit to 50
    if (state.notifications.length > 50) state.notifications.pop();

    // Persist
    localStorage.setItem('srf_notifications', JSON.stringify(state.notifications));

    // Sync
    if (window.saveToCloud) window.saveToCloud('notifications', state.notifications);

    // Update UI if notification modal is open (or just to show badge if we had one)
    if (window.renderNotifications) window.renderNotifications();
    if (window.updateNotificationBadge) window.updateNotificationBadge();
};

// Expose CONFIG globally for backward compatibility
Object.defineProperty(window, 'CONFIG', {
    get: () => state.config
});

// --- CLOUD SYNCHRONIZATION ---

// DEPRECATED: Old One-time Sync
// window.initializeData = ... (Removed)

window.setupRealTimeSync = () => {
    if (!window.onValue || !window.dbRef || !window.db) {
        console.log("Firebase not ready. Using Offline Data.");
        return;
    }

    console.log("Initializing Real-Time Sync...");

    // Helper: Sync Helper
    const syncNode = (path, stateKey, localKey, isObject = false) => {
        const ref = window.dbRef(window.db, path);
        window.onValue(ref, (snapshot) => {
            const val = snapshot.val();
            if (val) {
                // Determine Clean Data
                let cleanData;
                if (isObject) {
                    cleanData = val;
                } else {
                    cleanData = Array.isArray(val) ? val : Object.values(val);
                }

                // Update State
                state[stateKey] = cleanData;
                localStorage.setItem(localKey, JSON.stringify(cleanData));
                console.log(`[Sync] Updated ${stateKey}`);

                // Refresh UI
                refreshUI(stateKey);
            }
        });
    };

    // 1. Sync Lists
    syncNode('staffData', 'staffData', 'srf_staff_list');
    syncNode('historyData', 'historyData', 'srf_production_history');
    syncNode('washingData', 'washingData', 'srf_washing_history');
    syncNode('accountsData', 'accountsData', 'srf_accounts');
    syncNode('ownerTodos', 'ownerTodos', 'srf_owner_todos');
    syncNode('notifications', 'notifications', 'srf_notifications');
    syncNode('inventoryData', 'inventoryData', 'srf_inventory');
    syncNode('catalogueItems', 'catalogueItems', 'catalogueItems'); // NEW

    // 2. Sync Ledgers (Object Mode)
    syncNode('staffLedgers', 'staffLedgers', 'srf_staff_ledgers', true);
};

function refreshUI(key) {
    if (key === 'staffData' && window.renderStaffGrid) window.renderStaffGrid(); // Refresh Staff List
    if (key === 'historyData' && window.renderHistoryPage) window.renderHistoryPage();
    if (key === 'washingData' && window.renderDashboard) window.renderDashboard();
    if (key === 'accountsData' && window.renderAccounts) window.renderAccounts();
    if (key === 'ownerTodos' && window.renderHome) window.renderHome(); // Home has Todos
    if (key === 'notifications' && window.renderNotifications) window.renderNotifications();

    // Catalogue & Ledgers
    if (key === 'catalogueItems' && window.renderCatalogue) window.renderCatalogue();
    if (key === 'staffLedgers' || key === 'catalogueItems') {
        // If a ledger is open, re-render it
        if (state.currentLedgerEmp && window.renderLedgerTable) window.renderLedgerTable();
        // Specifically for Catalogue Ledger
        if (window.activeCatalogueId && window.renderLedgerTable) window.renderLedgerTable(); // Catalogue ledger needs this
    }

    // Charts rely on multiple data sources
    if (window.renderCharts) window.renderCharts();
    if (window.updateNotificationBadge) window.updateNotificationBadge();
}

const startSync = () => {
    if (window.hasSynced) return;
    window.hasSynced = true;
    window.setupRealTimeSync();
};

if (window.isFirebaseReady) {
    startSync();
} else {
    document.addEventListener('firebase-ready', startSync);
}