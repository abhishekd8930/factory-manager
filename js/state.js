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

window.initializeData = async () => {
    if (!window.loadFromCloud) {
        console.log("Firebase not configured. Using Offline Data.");
        return;
    }

    console.log("Syncing data...");

    // Helper: Deep Merge to prevent overwriting local work
    // If local has data for Employee A, and Cloud has data for Employee B, keep BOTH.
    const safeSyncLedgers = async () => {
        const cloudData = await window.loadFromCloud('staffLedgers');
        if (cloudData) {
            // MERGE Logic: 
            // 1. Take Cloud Data
            // 2. Overwrite with Local Data (Priority to recent unsaved edits)
            // Note: In a real app, we'd check timestamps. For this project, we prioritize preserving local inputs.

            // Actually, safest is: Take Local, fill gaps with Cloud.
            // But if Cloud has new data from another device, we want that too.

            // STRATEGY: We assume 'staffLedgers' is an object keyed by "ID_YEAR_MONTH".
            // We merge the keys.
            const merged = { ...cloudData, ...state.staffLedgers };

            state.staffLedgers = merged;
            localStorage.setItem('srf_staff_ledgers', JSON.stringify(merged));
        }
    };

    const syncArray = async (key, localKey, stateKey) => {
        const cloudData = await window.loadFromCloud(key);
        if (cloudData) {
            // For Arrays (Lists), we usually trust the cloud, 
            // UNLESS local has more items (recently added).
            // Simple approach: Trust Cloud for lists to ensure consistency across devices.

            let cleanData = Array.isArray(cloudData) ? cloudData : Object.values(cloudData);
            state[stateKey] = cleanData;
            localStorage.setItem(localKey, JSON.stringify(cleanData));
        }
    };

    // 1. Sync Lists (Trust Cloud)
    await syncArray('staffData', 'srf_staff_list', 'staffData');
    await syncArray('historyData', 'srf_production_history', 'historyData');
    await syncArray('washingData', 'srf_washing_history', 'washingData');
    await syncArray('accountsData', 'srf_accounts', 'accountsData');
    await syncArray('accountsData', 'srf_accounts', 'accountsData');
    await syncArray('ownerTodos', 'srf_owner_todos', 'ownerTodos');
    await syncArray('notifications', 'srf_notifications', 'notifications');

    // 2. Sync Ledgers (Smart Merge)
    await safeSyncLedgers();

    console.log("Sync Complete. Refreshing UI...");

    // Refresh UI
    if (window.renderStaffGrid) window.renderStaffGrid();
    if (window.renderCharts) window.renderCharts();
    if (window.renderAccounts) window.renderAccounts();
    if (window.renderHome) window.renderHome();
    if (window.renderAttendanceView) window.renderAttendanceView(); // Fix: Ensure attendance renders
    if (window.updateNotificationBadge) window.updateNotificationBadge();

    if (window.loadFromCloud) await syncArray('inventoryData', 'srf_inventory', 'inventoryData');
    // If a ledger is currently open, re-render it to show merged data
    if (state.currentLedgerEmp && window.renderLedgerTable) {
        window.renderLedgerTable();
    }
};

const startSync = () => {
    if (window.hasSynced) return;
    window.hasSynced = true;
    window.initializeData();
};

if (window.isFirebaseReady) {
    startSync();
} else {
    document.addEventListener('firebase-ready', startSync);
}