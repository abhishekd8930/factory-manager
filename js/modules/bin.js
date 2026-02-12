// js/modules/bin.js
// Recycle Bin Module

const renderBin = () => {
    const binItems = state.deletedItems || [];

    // Group by type
    const staffItems = binItems.filter(item => item.type === 'staff');
    const catalogueItems = binItems.filter(item => item.type === 'catalogue');

    const html = `
    <div id="bin-view" class="fade-in">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-slate-800 mb-2">
                <i class="fa-solid fa-trash-can text-slate-400"></i> Recycle Bin
            </h1>
            <p class="text-slate-500">Items will be permanently deleted after 30 days</p>
        </div>

        ${binItems.length === 0 ? renderEmptyState() : ''}
        
        <!-- Staff Section -->
        ${staffItems.length > 0 ? renderStaffSection(staffItems) : ''}
        
        <!-- Catalogue Section -->
        ${catalogueItems.length > 0 ? renderCatalogueSection(catalogueItems) : ''}
    </div>`;

    document.getElementById('router-outlet').innerHTML = html;
};

function renderEmptyState() {
    return `
    <div class="bg-white rounded-3xl p-16 text-center shadow-sm">
        <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fa-solid fa-trash-can text-slate-300 text-4xl"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">Bin is Empty</h3>
        <p class="text-slate-500 max-w-md mx-auto">Deleted items will appear here and be stored for 30 days before permanent deletion.</p>
    </div>`;
}

function renderStaffSection(staffItems) {
    return `
    <div class="bg-white rounded-3xl p-6 mb-6 shadow-sm">
        <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-users text-indigo-500"></i>
            Staff Members (${staffItems.length})
        </h2>
        <div class="space-y-3">
            ${staffItems.map(item => renderBinCard(item)).join('')}
        </div>
    </div>`;
}

function renderCatalogueSection(catalogueItems) {
    return `
    <div class="bg-white rounded-3xl p-6 mb-6 shadow-sm">
        <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-book-open text-purple-500"></i>
            Catalogue Items (${catalogueItems.length})
        </h2>
        <div class="space-y-3">
            ${catalogueItems.map(item => renderBinCard(item)).join('')}
        </div>
    </div>`;
}

function renderBinCard(item) {
    const daysRemaining = Math.ceil((item.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    const name = item.type === 'staff' ? item.data.name : (item.data.name || item.data.title || item.data.pattern);
    const subtitle = item.type === 'staff' ? item.data.unit : (item.data.fabric ? `${item.data.fabric}${item.data.brand ? ' • ' + item.data.brand : ''}` : (item.data.brand || ''));

    return `
    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
        <div class="flex-1">
            <h3 class="font-bold text-slate-800">${name}</h3>
            <p class="text-sm text-slate-500">${subtitle}</p>
            <p class="text-xs text-slate-400 mt-1">
                <i class="fa-solid fa-clock"></i> ${daysRemaining} days remaining
            </p>
        </div>
        <div class="flex gap-2">
            <button onclick="restoreItem('${item.id}')" class="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition font-medium text-sm">
                <i class="fa-solid fa-rotate-left"></i> Restore
            </button>
            <button onclick="permanentlyDelete('${item.id}', '${name}')" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-sm">
                <i class="fa-solid fa-trash"></i> Delete Now
            </button>
        </div>
    </div>`;
}

// --- RESTORE ITEM ---
window.restoreItem = (binId) => {
    const item = state.deletedItems.find(i => i.id === binId);
    if (!item) {
        alert('Item not found in bin.');
        return;
    }

    const itemName = item.type === 'staff' ? item.data.name : (item.data.name || item.data.title || 'this item');
    if (!confirm(`Restore ${itemName}?`)) {
        return;
    }

    // Move back to original array
    // Move back to original array
    if (item.type === 'staff') {
        // Uniqueness Check
        if (state.staffData.some(existing => existing.id === item.data.id)) {
            console.warn("Item already exists in Staff List. Skipping add.");
        } else {
            state.staffData.push(item.data);
            localStorage.setItem('srf_staff_list', JSON.stringify(state.staffData));
            if (window.saveToCloud) window.saveToCloud('staffData', state.staffData);
            if (window.renderStaffGrid) window.renderStaffGrid();
        }
    } else if (item.type === 'catalogue') {
        if (!state.catalogueItems) state.catalogueItems = [];

        // Uniqueness Check
        if (state.catalogueItems.some(existing => existing.id === item.data.id)) {
            console.warn("Item already exists in Catalogue. Skipping add.");
        } else {
            state.catalogueItems.push(item.data);
            localStorage.setItem('catalogueItems', JSON.stringify(state.catalogueItems));
            if (window.saveToCloud) window.saveToCloud('catalogueItems', state.catalogueItems);
            if (window.renderCatalogue) window.renderCatalogue();
        }
    }

    // Remove from bin
    state.deletedItems = state.deletedItems.filter(i => i.id !== binId);
    localStorage.setItem('srf_deleted_items', JSON.stringify(state.deletedItems));
    if (window.saveToCloud) window.saveToCloud('deletedItems', state.deletedItems);

    // Refresh bin
    renderBin();

    window.addNotification({
        type: 'success',
        title: 'Item Restored',
        message: `${item.type === 'staff' ? item.data.name : item.data.title} has been restored.`
    });
};

// --- PERMANENTLY DELETE ---
window.permanentlyDelete = (binId, name) => {
    if (!confirm(`⚠️ PERMANENT DELETE: ${name}?\n\nThis action CANNOT be undone. The item will be deleted immediately.`)) {
        return;
    }

    state.deletedItems = state.deletedItems.filter(i => i.id !== binId);
    localStorage.setItem('srf_deleted_items', JSON.stringify(state.deletedItems));
    if (window.saveToCloud) window.saveToCloud('deletedItems', state.deletedItems);

    renderBin();

    window.addNotification({
        type: 'warning',
        title: 'Permanently Deleted',
        message: `${name} has been permanently deleted.`
    });
};

window.renderBin = renderBin;
