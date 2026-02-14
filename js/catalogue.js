// --- CATALOGUE LOGIC ---

// 3D VIEWER (Dynamic Import)
window.init3DViewer = null;
window.render3DPattern = null;

(async () => {
    try {
        const module = await import('./modules/pattern-3d.js');
        window.init3DViewer = module.init3DViewer;
        window.render3DPattern = module.render3DPattern;
        console.log("3D Module loaded successfully");
    } catch (e) {
        console.warn("3D Viewer failed to load (Offline or Error):", e);
    }
})();

// --- CONFIGURATION ---
const FIXED_FILTERS = {
    fabric: ["Dobby", "Lycra", "Lenin", "Twill"],
    brand: ["Bluecube", "Snowfinch", "D-club", "Aravind"],
    fitting: ["Ankle fit", "Jogger", "Formal"],
    duration: ["This Week", "Last Week", "This Month", "Last Month"]
};

// State
let catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
let activeCatalogueId = null;
let activeSearchQuery = ""; // New State
let activeFilters = {
    fabric: null,
    pattern: null, // Keeping pattern as dynamic/optional since not in fixed list
    brand: null,
    fitting: null,
    duration: null // New
};

// Lightbox Globals
let featureZoom = 1;
let isDragging = false;
let startX = 0, startY = 0, translateX = 0, translateY = 0;

// Initialize
window.initCatalogue = () => {
    closeCatalogueDetail();
    renderCatalogue();
};

// Render List & Grid
window.renderCatalogue = () => {
    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];

    const grid = document.getElementById('catalogue-grid');
    const emptyState = document.getElementById('catalogue-empty');
    if (!grid || !emptyState) return;

    grid.innerHTML = '';

    if (catalogueItems.length === 0) {
        emptyState.classList.remove('hidden');
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.add('hidden'));
        return;
    } else {
        emptyState.classList.add('hidden');
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('hidden'));
    }

    // Apply Active Filters
    let displayItems = catalogueItems.filter(item => {
        // 1. Search Query Filter (Global substring match)
        if (activeSearchQuery) {
            const query = activeSearchQuery.toLowerCase();

            // Format dates for friendly search
            let dateDisplay = "";
            let dateRaw = "";
            if (item.date) {
                dateRaw = item.date; // YYYY-MM-DD
                const d = new Date(item.date);
                dateDisplay = d.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase();
            } else {
                const d = new Date(item.id);
                dateDisplay = d.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase();
            }

            // Check if ANY field contains the query
            const matches = (
                (item.name && item.name.toLowerCase().includes(query)) ||
                (item.fabric && item.fabric.toLowerCase().includes(query)) ||
                (item.brand && item.brand.toLowerCase().includes(query)) ||
                (item.fitting && item.fitting.toLowerCase().includes(query)) ||
                (item.pattern && item.pattern.toLowerCase().includes(query)) ||
                (dateDisplay.includes(query)) ||
                (dateRaw.includes(query))
            );

            if (!matches) return false;
        }

        // 2. Category Filters
        // Fabric: Partial/Includes Match (e.g. "Dobby" matches "Heavy Dobby")
        if (activeFilters.fabric && (!item.fabric || !item.fabric.toLowerCase().includes(activeFilters.fabric.toLowerCase()))) return false;

        // Brand: Exact Match (usually brands are strict, but I'll use includes for flexibility)
        if (activeFilters.brand && (!item.brand || !item.brand.toLowerCase().includes(activeFilters.brand.toLowerCase()))) return false;

        // Fitting: Includes Match
        if (activeFilters.fitting && (!item.fitting || !item.fitting.toLowerCase().includes(activeFilters.fitting.toLowerCase()))) return false;

        // Pattern: Strict (if used)
        if (activeFilters.pattern && item.pattern !== activeFilters.pattern) return false;

        // Duration: Date Logic
        if (activeFilters.duration) {
            const itemDate = new Date(item.date || item.id);
            if (!isInRelativeDateRange(itemDate, activeFilters.duration)) return false;
        }

        return true;
    });

    if (displayItems.length === 0) {
        grid.innerHTML = '<p class="text-center text-slate-500 col-span-full py-12">No items match the current filters.</p>';
        document.getElementById('catalogue-result-count').innerText = "No results found";
    } else {
        const count = displayItems.length;
        document.getElementById('catalogue-result-count').innerText = `${count} result${count === 1 ? '' : 's'} found`;
    }

    displayItems.forEach(item => {
        const card = document.createElement('div');
        card.className = "group relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shadow-sm hover:shadow-xl transition cursor-pointer";
        card.onclick = () => openCatalogueDetail(item.id);

        let dateDisplay = "Unknown Date";
        if (item.date) {
            const d = new Date(item.date);
            dateDisplay = d.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
        } else {
            const d = new Date(item.id);
            dateDisplay = d.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
        }

        card.innerHTML = `
            <img src="${item.src}" class="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt="${item.name}">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-4 group-hover:translate-y-0 transition duration-300">
                <p class="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">${dateDisplay}</p>
                <h3 class="text-xl font-bold leading-tight">${item.name}</h3>
                <div class="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition delay-100 text-xs text-white/80">
                   ${item.fabric ? `<span>${item.fabric}</span>` : ''}
                   ${item.brand ? `<span>• ${item.brand}</span>` : ''}
                </div>
            </div>
            <div class="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition transform translate-x-4 group-hover:translate-x-0">
                <i class="fa-solid fa-arrow-right -rotate-45"></i>
            </div>
        `;
        grid.appendChild(card);
    });

    populateFilters();
};

// --- FILTERING LOGIC ---

window.populateFilters = () => {
    // We handle the main fixed filters + Pattern (dynamic)
    const filterTypes = ['fabric', 'brand', 'fitting', 'duration', 'pattern'];

    filterTypes.forEach(type => {
        const dropdown = document.getElementById(`filter-dropdown-${type}`);
        if (!dropdown) return;

        dropdown.innerHTML = '';

        // "All" Option
        const allLi = document.createElement('li');
        const isAllActive = activeFilters[type] === null;
        let label = `All ${type.charAt(0).toUpperCase() + type.slice(1)}s`;
        if (type === 'duration') label = "Any Time";

        allLi.innerHTML = `<button onclick="applyFilter('${type}', null)" class="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm ${isAllActive ? 'font-bold text-indigo-600 bg-indigo-50' : 'text-slate-600'}">${label}</button>`;
        dropdown.appendChild(allLi);

        // Determine Options
        let options = [];
        if (FIXED_FILTERS[type]) {
            options = FIXED_FILTERS[type];
        } else {
            // Fallback for Pattern -> Dynamic
            options = [...new Set(catalogueItems.map(item => item[type]).filter(val => val && val.trim() !== ""))].sort();
        }

        options.forEach(val => {
            const li = document.createElement('li');
            const isActive = activeFilters[type] === val;
            li.innerHTML = `<button onclick="applyFilter('${type}', '${val}')" class="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm ${isActive ? 'font-bold text-indigo-600 bg-indigo-50' : 'text-slate-600'}">${val}</button>`;
            dropdown.appendChild(li);
        });

        // Update Button UI
        const btn = document.getElementById(`filter-btn-${type}`);
        if (btn) {
            if (activeFilters[type]) {
                btn.classList.remove('bg-white', 'text-slate-600', 'border-slate-200');
                btn.classList.add('bg-indigo-50', 'text-indigo-600', 'border-indigo-200');
                btn.innerHTML = `${activeFilters[type]} <i class="fa-solid fa-xmark ml-1 text-xs"></i>`;
                btn.onclick = (e) => {
                    e.stopPropagation();
                    applyFilter(type, null);
                };
            } else {
                btn.classList.remove('bg-indigo-50', 'text-indigo-600', 'border-indigo-200');
                btn.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
                btn.innerHTML = `${type.charAt(0).toUpperCase() + type.slice(1)} <i class="fa-solid fa-caret-down text-xs"></i>`;
                btn.onclick = () => toggleFilterDropdown(type);
            }
        }
    });
};

window.toggleFilterDropdown = (type) => {
    ['fabric', 'brand', 'fitting', 'duration', 'pattern'].forEach(t => {
        if (t !== type) {
            const d = document.getElementById(`filter-dropdown-${t}`);
            if (d) d.classList.add('hidden');
        }
    });
    const target = document.getElementById(`filter-dropdown-${type}`);
    if (target) target.classList.toggle('hidden');
};

window.applyFilter = (type, value) => {
    activeFilters[type] = value;
    const dropdown = document.getElementById(`filter-dropdown-${type}`);
    if (dropdown) dropdown.classList.add('hidden');
    renderCatalogue();
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.group')) {
        document.querySelectorAll('[id^="filter-dropdown-"]').forEach(el => el.classList.add('hidden'));
    }
});

// Helper: Date Logic
function isInRelativeDateRange(date, range) {
    const now = new Date();
    // Reset hours to compare dates cleanly
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (range === "This Week") {
        // Monday is start
        const day = today.getDay() || 7; // Sunday is 7
        if (day !== 1) today.setHours(-24 * (day - 1)); // Set to Monday
        const startOfWeek = today;
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return d >= startOfWeek && d <= endOfWeek;
    }
    if (range === "Last Week") {
        const day = today.getDay() || 7;
        if (day !== 1) today.setHours(-24 * (day - 1));
        const startOfThisWeek = today;
        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        return d >= startOfLastWeek && d <= endOfLastWeek;
    }
    if (range === "This Month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (range === "Last Month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    }
    return true;
}


// --- SEARCH LOGIC ---
window.handleCatalogueSearch = (query) => {
    activeSearchQuery = query;
    renderCatalogue();
};


// --- DETAIL VIEW LOGIC ---

window.openCatalogueDetail = (id) => {
    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
    const item = catalogueItems.find(i => i.id === id);
    if (!item) return;

    activeCatalogueId = id;

    document.getElementById('catalogue-list-view').classList.add('hidden');
    document.getElementById('catalogue-detail-view').classList.remove('hidden');

    document.getElementById('detail-image').src = item.src;
    document.getElementById('detail-image').onclick = () => openLightbox(item.src);
    renderAdditionalPages(); // Render multi-page gallery
    document.getElementById('detail-title').innerText = item.name;
    document.getElementById('detail-description').value = item.description || "";

    if (item.date) {
        document.getElementById('detail-date').value = item.date;
    } else {
        const d = new Date(item.id);
        const dateString = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        document.getElementById('detail-date').value = dateString;
    }

    document.getElementById('detail-fabric').value = item.fabric || "";
    document.getElementById('detail-brand').value = item.brand || "";
    document.getElementById('detail-fitting').value = item.fitting || "";
    document.getElementById('detail-pattern').value = item.pattern || "";

    const inputs = document.querySelectorAll('#catalogue-detail-view .detail-input');
    inputs.forEach(input => input.disabled = true);
    document.getElementById('save-catalogue-btn').classList.add('hidden');
    document.getElementById('cancel-catalogue-btn').classList.add('hidden');
    document.getElementById('catalogue-settings-menu').classList.add('hidden');

    // Merge Fix: Automatically render ledger and additional pages
    renderCatalogueLedgerTable();
    switchDetailTab('details'); // Ensure we start on the merged tab
};

window.closeCatalogueDetail = () => {
    activeCatalogueId = null;
    document.getElementById('catalogue-detail-view').classList.add('hidden');
    document.getElementById('catalogue-list-view').classList.remove('hidden');
    renderCatalogue();
};

// --- LEDGER LOGIC ---

window.switchDetailTab = (tabName) => {
    // Buttons
    document.getElementById('tab-btn-details').className = tabName === 'details'
        ? "px-6 py-3 font-bold text-indigo-600 border-b-2 border-indigo-600 transition"
        : "px-6 py-3 font-medium text-slate-500 hover:text-slate-800 transition";

    document.getElementById('tab-btn-3d').className = tabName === '3d'
        ? "px-6 py-3 font-bold text-indigo-600 border-b-2 border-indigo-600 transition flex items-center gap-2 text-sm"
        : "px-6 py-3 font-medium text-slate-500 hover:text-slate-800 transition flex items-center gap-2 text-sm";

    // Content
    document.getElementById('tab-content-details').className = tabName === 'details' ? '' : 'hidden';
    document.getElementById('tab-content-3d').className = tabName === '3d' ? '' : 'hidden';

    if (tabName === 'details') {
        renderCatalogueLedgerTable();
    }

    if (tabName === '3d') {
        setTimeout(() => {
            if (window.init3DViewer) window.init3DViewer();
            if (window.render3DPattern) window.render3DPattern("32"); // Default to 32 for now, or fetch from item
        }, 100);
    }
};

window.renderCatalogueLedgerTable = () => {
    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
    const item = catalogueItems.find(i => i.id === activeCatalogueId);
    if (!item) return;

    // Ensure at least one row exists
    if (!item.ledger || item.ledger.length === 0) {
        addCatalogueLedgerRow();
        return; // addLedgerRow will trigger re-render
    }

    const tbody = document.getElementById('catalogue-ledger-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const ledger = item.ledger;

    ledger.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-100 last:border-0 hover:bg-slate-50";
        // Check if this is the last row for Enter key logic on specific fields if needed, 
        // but user asked "at the end", implying anywhere or specifically last row. 
        // We'll apply to all rows for consistency or just check in the handler.

        tr.innerHTML = `
            <td class="p-2"><input type="number" value="${row.slNo || ''}" onchange="updateLedgerRow(${index}, 'slNo', this.value)" onkeydown="handleLedgerKeydown(event, ${index}, 'slNo')" class="w-full text-center bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-md py-1" placeholder="#"></td>
            <td class="p-2"><input type="number" step="0.01" value="${row.meters || ''}" onchange="updateLedgerRow(${index}, 'meters', this.value)" onkeydown="handleLedgerKeydown(event, ${index}, 'meters')" class="w-full text-center bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-md py-1" placeholder="0.0"></td>
            
            <td class="p-2 border-l border-slate-100"><input type="number" value="${row.s30 || ''}" onchange="updateLedgerRow(${index}, 's30', this.value)" onkeydown="handleLedgerKeydown(event, ${index}, 's30')" class="w-full text-center bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-md py-1 font-medium text-slate-600" placeholder="-"></td>
            <td class="p-2"><input type="number" value="${row.s32 || ''}" onchange="updateLedgerRow(${index}, 's32', this.value)" onkeydown="handleLedgerKeydown(event, ${index}, 's32')" class="w-full text-center bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-md py-1 font-medium text-slate-600" placeholder="-"></td>
            <td class="p-2"><input type="number" value="${row.s34 || ''}" onchange="updateLedgerRow(${index}, 's34', this.value)" onkeydown="handleLedgerKeydown(event, ${index}, 's34')" class="w-full text-center bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-md py-1 font-medium text-slate-600" placeholder="-"></td>
            <td class="p-2"><input type="number" value="${row.s36 || ''}" onchange="updateLedgerRow(${index}, 's36', this.value)" onkeydown="handleLedgerKeydown(event, ${index}, 's36')" class="w-full text-center bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-md py-1 font-medium text-slate-600" placeholder="-"></td>
            
            <td class="p-2 text-center font-bold text-indigo-600 border-l border-slate-100">${row.total || 0}</td>
            <td class="p-2 text-center">
                <button onclick="deleteLedgerRow(${index})" class="text-slate-300 hover:text-red-500 transition"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.handleLedgerKeydown = (e, index, field) => {
    if (e.key === 'Enter') {
        // 1. Force save the current input value first
        //    (The onchange event happens on blur, so we must manually save here)
        updateLedgerRow(index, field, e.target.value);

        catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
        const item = catalogueItems.find(i => i.id === activeCatalogueId);
        if (!item || !item.ledger) return;

        // Only add if it's the last row
        if (index === item.ledger.length - 1) {
            addCatalogueLedgerRow();
        }
    }
};

window.addCatalogueLedgerRow = () => {
    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
    const idx = catalogueItems.findIndex(i => i.id === activeCatalogueId);
    if (idx === -1) return;

    if (!catalogueItems[idx].ledger) catalogueItems[idx].ledger = [];

    // Auto-increment Sl No prediction
    const lastSl = catalogueItems[idx].ledger.length > 0 ? parseInt(catalogueItems[idx].ledger[catalogueItems[idx].ledger.length - 1].slNo) : 0;

    catalogueItems[idx].ledger.push({
        slNo: lastSl ? lastSl + 1 : 1,
        meters: '',
        s30: '', s32: '', s34: '', s36: '',
        total: 0
    });

    localStorage.setItem('catalogueItems', JSON.stringify(catalogueItems));
    if (window.saveToCloud) window.saveToCloud('catalogueItems', catalogueItems);
    renderCatalogueLedgerTable();

    // Focus new row
    setTimeout(() => {
        const tbody = document.getElementById('catalogue-ledger-body');
        if (tbody && tbody.lastElementChild) {
            const firstInput = tbody.lastElementChild.querySelector('input');
            if (firstInput) {
                firstInput.focus();
                firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, 50);
};

window.updateLedgerRow = (rowIndex, field, value) => {
    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
    const idx = catalogueItems.findIndex(i => i.id === activeCatalogueId);
    if (idx === -1) return;

    let row = catalogueItems[idx].ledger[rowIndex];
    row[field] = value;

    // Recalculate Total
    let newTotal = row.total || 0;
    if (['s30', 's32', 's34', 's36'].includes(field)) {
        const s30 = parseInt(row.s30) || 0;
        const s32 = parseInt(row.s32) || 0;
        const s34 = parseInt(row.s34) || 0;
        const s36 = parseInt(row.s36) || 0;
        newTotal = s30 + s32 + s34 + s36;
        row.total = newTotal;
    }

    localStorage.setItem('catalogueItems', JSON.stringify(catalogueItems));
    if (window.saveToCloud) window.saveToCloud('catalogueItems', catalogueItems);

    // OPTIMIZATION: Do NOT re-render the whole table. 
    // Just update the total cell if needed.
    if (['s30', 's32', 's34', 's36'].includes(field)) {
        const tbody = document.getElementById('catalogue-ledger-body');
        if (tbody && tbody.children[rowIndex]) {
            // The total cell is the 7th cell (index 6)
            const totalCell = tbody.children[rowIndex].children[6];
            if (totalCell) totalCell.innerText = newTotal;
        }
    }
};

window.deleteLedgerRow = (rowIndex) => {
    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
    const idx = catalogueItems.findIndex(i => i.id === activeCatalogueId);
    if (idx === -1) return;

    catalogueItems[idx].ledger.splice(rowIndex, 1);
    localStorage.setItem('catalogueItems', JSON.stringify(catalogueItems));
    if (window.saveToCloud) window.saveToCloud('catalogueItems', catalogueItems);
    renderCatalogueLedgerTable();
};

// --- SETTINGS & EDITING ---

window.toggleCatalogueSettings = () => {
    const menu = document.getElementById('catalogue-settings-menu');
    menu.classList.toggle('hidden');
};

window.enableEditMode = () => {
    const inputs = document.querySelectorAll('#catalogue-detail-view .detail-input');
    inputs.forEach(input => input.disabled = false);

    document.getElementById('save-catalogue-btn').classList.remove('hidden');
    document.getElementById('cancel-catalogue-btn').classList.remove('hidden'); // Show Cancel
    document.getElementById('detail-description').focus();
    document.getElementById('catalogue-settings-menu').classList.add('hidden');
};

window.cancelEditMode = () => {
    // Reload items to revert changes
    openCatalogueDetail(activeCatalogueId);
    // Buttons hidden by openCatalogueDetail logic implicitly, but explicit validation:
    // openCatalogueDetail resets everything including hiding buttons.
};

window.renameCatalogueItem = () => {
    const newName = prompt("Enter new name:");
    if (newName) {
        updateItem(activeCatalogueId, { name: newName });
        document.getElementById('detail-title').innerText = newName;
    }
    document.getElementById('catalogue-settings-menu').classList.add('hidden');
};

window.saveCatalogueDetail = () => {
    const changes = {
        description: document.getElementById('detail-description').value,
        fabric: document.getElementById('detail-fabric').value,
        brand: document.getElementById('detail-brand').value,
        fitting: document.getElementById('detail-fitting').value,
        pattern: document.getElementById('detail-pattern').value,
        date: document.getElementById('detail-date').value
    };

    // Validation
    if (!changes.fabric || !changes.brand || !changes.fitting || !changes.pattern) {
        alert("Please fill in all product details (Fabric, Brand, Fitting, Pattern) before saving.");
        return;
    }

    updateItem(activeCatalogueId, changes);

    const inputs = document.querySelectorAll('#catalogue-detail-view .detail-input');
    inputs.forEach(input => input.disabled = true);
    document.getElementById('save-catalogue-btn').classList.add('hidden');
    document.getElementById('cancel-catalogue-btn').classList.add('hidden');
};

window.deleteActiveCatalogueItem = () => {
    if (!confirm("⚠ Move this item to Recycle Bin?\n\nIt will be permanently deleted after 30 days unless restored.")) return;

    // 1. Find the item
    const item = catalogueItems.find(i => i.id === activeCatalogueId);
    if (!item) return;

    // 2. Create deleted item entry
    const deletedItem = {
        id: `deleted_${Date.now()}_${activeCatalogueId}`,
        type: 'catalogue',
        data: item,
        deletedAt: Date.now(),
        deletedBy: window.auth?.currentUser?.email || 'Unknown',
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    };

    // 3. Add to deletedItems (bin)
    state.deletedItems.push(deletedItem);
    localStorage.setItem('srf_deleted_items', JSON.stringify(state.deletedItems));
    if (window.saveToCloud) window.saveToCloud('deletedItems', state.deletedItems);

    // 4. Remove from catalogueItems
    catalogueItems = catalogueItems.filter(i => i.id !== activeCatalogueId);
    localStorage.setItem('catalogueItems', JSON.stringify(catalogueItems));
    if (window.saveToCloud) window.saveToCloud('catalogueItems', catalogueItems);

    // 5. Close detail and refresh
    closeCatalogueDetail();

    // 6. Notify
    if (window.addNotification) {
        window.addNotification({
            type: 'info',
            title: 'Moved to Bin',
            message: `${item.name} moved to Recycle Bin. Can be restored within 30 days.`
        });
    }
};

function updateItem(id, updates) {
    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
    const idx = catalogueItems.findIndex(i => i.id === id);
    if (idx !== -1) {
        catalogueItems[idx] = { ...catalogueItems[idx], ...updates };
        localStorage.setItem('catalogueItems', JSON.stringify(catalogueItems));
        if (window.saveToCloud) window.saveToCloud('catalogueItems', catalogueItems);
    }
}


// --- UPLOAD LOGIC ---
window.handleCatalogueUpload = (input) => {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 5000000) {
            alert("File too large! Please upload images under 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const newItem = {
                id: Date.now(),
                name: file.name,
                src: e.target.result,
                description: "",
                fabric: "",
                brand: "",
                pattern: "",
                fitting: "",
                date: new Date().toISOString().split('T')[0]
            };

            catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
            catalogueItems.unshift(newItem);
            localStorage.setItem('catalogueItems', JSON.stringify(catalogueItems));
            if (window.saveToCloud) window.saveToCloud('catalogueItems', catalogueItems);

            // Notification: Item Added
            if (window.addNotification) {
                window.addNotification({
                    type: 'action',
                    title: 'New Catalogue Item',
                    msg: `Item "${newItem.name}" added. Please update dispatch date.`,
                    link: newItem.id
                });
            }

            renderCatalogue();

            // Auto-open and Edit
            openCatalogueDetail(newItem.id);
            enableEditMode();
        };
        reader.readAsDataURL(file);
    }
    input.value = '';
};


// --- LIGHTBOX LOGIC ---

window.openLightbox = (src) => {
    const lightbox = document.getElementById('catalogue-lightbox');
    const img = document.getElementById('lightbox-image');

    img.src = src;
    lightbox.classList.remove('hidden');
    requestAnimationFrame(() => {
        lightbox.classList.remove('opacity-0');
    });

    featureZoom = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
};

window.closeLightbox = () => {
    const lightbox = document.getElementById('catalogue-lightbox');
    lightbox.classList.add('opacity-0');
    setTimeout(() => {
        lightbox.classList.add('hidden');
    }, 300);
};

window.catalogueZoom = (delta) => {
    featureZoom += delta;
    if (featureZoom < 0.5) featureZoom = 0.5;
    if (featureZoom > 4) featureZoom = 4;

    document.getElementById('lightbox-zoom-level').innerText = Math.round(featureZoom * 100) + '%';
    updateTransform();
};

function updateTransform() {
    const img = document.getElementById('lightbox-image');
    if (img) img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${featureZoom})`;
}

// Drag Logic
window.startDrag = (e) => {
    if (featureZoom <= 1) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
};

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
}

function endDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
}

// --- MULTI-PAGE CATALOGUE LOGIC ---
window.triggerAddPage = () => {
    document.getElementById('catalogue-page-upload').click();
    document.getElementById('catalogue-settings-menu').classList.add('hidden');
};

window.handlePageUpload = (input) => {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 5000000) {
            alert("File too large! Max 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target.result;
            addPageToItem(src);
        };
        reader.readAsDataURL(file);
    }
    input.value = ''; // Reset
};

function addPageToItem(src) {
    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
    const idx = catalogueItems.findIndex(i => i.id === activeCatalogueId);
    if (idx === -1) return;

    const item = catalogueItems[idx];

    // Migrate or init array
    if (!item.additionalPages) {
        item.additionalPages = [...(item.frontPages || []), ...(item.backPages || [])];
        delete item.frontPages;
        delete item.backPages;
    }

    if (item.additionalPages.length >= 10) {
        alert("Maximum 10 additional pages allowed.");
        return;
    }

    item.additionalPages.push(src);
    catalogueItems[idx] = item;

    localStorage.setItem('catalogueItems', JSON.stringify(catalogueItems));
    if (window.saveToCloud) window.saveToCloud('catalogueItems', catalogueItems);

    renderAdditionalPages();
    alert("Page added successfully!");
}

window.renderAdditionalPages = () => {
    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
    const item = catalogueItems.find(i => i.id === activeCatalogueId);
    const gallery = document.getElementById('gallery-additional');

    if (!item || !gallery) return;

    // Migrate if needed
    let pages = item.additionalPages;
    if (!pages) {
        pages = [...(item.frontPages || []), ...(item.backPages || [])];
        // Note: we don't save the migration here to avoid writing on every render, 
        // but we treat them as one list UI-wise.
    }

    gallery.innerHTML = '';
    const countSpan = document.getElementById('count-additional');
    if (countSpan) countSpan.innerText = pages.length;

    pages.forEach((src, index) => {
        const div = document.createElement('div');
        div.className = "w-24 h-24 flex-shrink-0 relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm transition hover:shadow-md";
        div.innerHTML = `
            <img src="${src}" class="w-full h-full object-cover cursor-pointer hover:scale-105 transition duration-500" onclick="openLightbox('${src}')">
            <button onclick="deleteCataloguePage(${index})" class="absolute top-1 right-1 bg-red-500/90 backdrop-blur-sm text-white w-6 h-6 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg transform hover:scale-110">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        gallery.appendChild(div);
    });

    if (pages.length === 0) {
        gallery.innerHTML = `
            <div class="w-full flex flex-col items-center justify-center text-slate-400 py-4 dashed-border rounded-xl">
                <i class="fa-regular fa-image mb-2 text-xl opacity-30"></i>
                <p class="text-[10px] font-medium uppercase tracking-widest">No additional pages</p>
            </div>`;
    }
};

window.deleteCataloguePage = (index) => {
    if (!confirm("Delete this page?")) return;

    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
    const idx = catalogueItems.findIndex(i => i.id === activeCatalogueId);
    if (idx === -1) return;

    const item = catalogueItems[idx];

    // Ensure migration state before delete
    if (!item.additionalPages) {
        item.additionalPages = [...(item.frontPages || []), ...(item.backPages || [])];
        delete item.frontPages;
        delete item.backPages;
    }

    item.additionalPages.splice(index, 1);

    localStorage.setItem('catalogueItems', JSON.stringify(catalogueItems));
    if (window.saveToCloud) window.saveToCloud('catalogueItems', catalogueItems);
    renderAdditionalPages();
};
