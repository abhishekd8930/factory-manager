console.log("Inventory Module Loaded");

// --- 1. CORE LOGIC ---

window.addInventoryItem = () => {
    const name = document.getElementById('inv-new-name').value.trim();
    const type = document.getElementById('inv-new-type').value; // 'Fabric', 'Trim', 'Packaging'
    const qty = parseFloat(document.getElementById('inv-new-qty').value) || 0;
    const unit = document.getElementById('inv-new-unit').value; // 'Meters', 'Kg', 'Pcs'
    const supplier = document.getElementById('inv-new-supplier').value.trim();

    if (!name) return alert("Please enter an Item Name.");
    if (qty < 0) return alert("Quantity cannot be negative.");

    const newItem = {
        id: Date.now(),
        name: name,
        type: type,
        quantity: qty,
        unit: unit,
        supplier: supplier || 'General Stock',
        lastUpdated: new Date().toISOString()
    };

    // Add to top of list
    state.inventoryData.unshift(newItem);
    window.saveInventory();
    
    // Reset Form
    document.getElementById('inv-new-name').value = '';
    document.getElementById('inv-new-qty').value = '';
    document.getElementById('inv-new-supplier').value = '';
    document.getElementById('inv-new-name').focus();
    
    window.renderInventory();
};

window.updateInventoryStock = (id, delta) => {
    const item = state.inventoryData.find(i => i.id === id);
    if (item) {
        const newQty = parseFloat(prompt(`Current Stock: ${item.quantity} ${item.unit}.\nEnter adjustment amount (e.g. +10 or -5):`));
        if (!isNaN(newQty)) {
            item.quantity += newQty;
            item.lastUpdated = new Date().toISOString();
            window.saveInventory();
            window.renderInventory();
        }
    }
};

window.deleteInventoryItem = (id) => {
    if(confirm("Permanently delete this item from stock?")) {
        state.inventoryData = state.inventoryData.filter(i => i.id !== id);
        window.saveInventory();
        window.renderInventory();
    }
};

window.saveInventory = () => {
    localStorage.setItem('srf_inventory', JSON.stringify(state.inventoryData));
    if (window.saveToCloud) window.saveToCloud('srf_inventory', state.inventoryData);
};

// --- 2. RENDER UI ---

window.renderInventory = () => {
    const listContainer = document.getElementById('inventory-list-body');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (state.inventoryData.length === 0) {
        listContainer.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-400 italic">No items in stock. Add Raw Materials to begin.</td></tr>`;
        return;
    }

    state.inventoryData.forEach(item => {
        // Low Stock Logic: Alert if Fabric < 100m or Buttons < 1000pcs
        let isLow = false;
        if (item.type === 'Fabric' && item.quantity < 100) isLow = true;
        if (item.type === 'Trim' && item.quantity < 500) isLow = true;

        const dateObj = new Date(item.lastUpdated);
        const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 border-b border-slate-100 transition";
        tr.innerHTML = `
            <td class="p-4">
                <p class="font-bold text-slate-700">${item.name}</p>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider">${item.supplier}</p>
            </td>
            <td class="p-4 text-center">
                <span class="px-2 py-1 rounded text-xs font-bold border ${getTypeColor(item.type)}">${item.type}</span>
            </td>
            <td class="p-4 text-right">
                <div class="flex flex-col items-end">
                    <span class="text-lg font-bold ${isLow ? 'text-red-500' : 'text-slate-700'}">${item.quantity} <span class="text-xs font-normal text-slate-400">${item.unit}</span></span>
                    ${isLow ? `<span class="text-[9px] font-bold text-white bg-red-500 px-1.5 rounded animate-pulse">LOW STOCK</span>` : ''}
                </div>
            </td>
            <td class="p-4 text-xs text-slate-400 font-mono text-center">${dateStr}</td>
            <td class="p-4 text-center">
                <button onclick="updateInventoryStock(${item.id})" class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition shadow-sm" title="Adjust Stock">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="deleteInventoryItem(${item.id})" class="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition ml-2" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        listContainer.appendChild(tr);
    });
    
    // Update summary counters if you have them
    updateInventoryStats();
};

function getTypeColor(type) {
    if (type === 'Fabric') return "bg-blue-50 text-blue-600 border-blue-100";
    if (type === 'Trim') return "bg-purple-50 text-purple-600 border-purple-100";
    return "bg-slate-50 text-slate-600 border-slate-200";
}

function updateInventoryStats() {
    const totalItems = state.inventoryData.length;
    const lowStock = state.inventoryData.filter(i => (i.type === 'Fabric' && i.quantity < 100) || (i.type === 'Trim' && i.quantity < 500)).length;
    
    const statEl = document.getElementById('inv-stat-total');
    const lowEl = document.getElementById('inv-stat-low');
    
    if(statEl) statEl.innerText = totalItems;
    if(lowEl) lowEl.innerText = lowStock;
}