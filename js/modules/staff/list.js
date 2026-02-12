console.log("Staff List Module Loaded");

// --- 1. SEARCH & SORT STATE ---

window.toggleSort = (type) => {
    const key = type === 'timings' ? 'sortTimings' : 'sortPcs';
    const currentMode = state[key] || 'alpha_asc';

    let nextMode = 'alpha_asc';
    if (currentMode === 'alpha_asc') nextMode = 'alpha_desc';
    else if (currentMode === 'alpha_desc') nextMode = 'pay_high';
    else if (currentMode === 'pay_high') nextMode = 'pay_low';
    else nextMode = 'alpha_asc';

    state[key] = nextMode;

    const icon = document.getElementById(`sort-icon-${type}`);
    if (icon) {
        icon.className = "";
        if (nextMode === 'alpha_asc') icon.className = "fa-solid fa-arrow-down-a-z";
        else if (nextMode === 'alpha_desc') icon.className = "fa-solid fa-arrow-up-a-z";
        else if (nextMode === 'pay_high') icon.className = "fa-solid fa-arrow-down-9-1 text-emerald-600";
        else if (nextMode === 'pay_low') icon.className = "fa-solid fa-arrow-up-1-9 text-red-400";
    }

    window.renderStaffGrid();
};

window.toggleSearch = (type) => {
    const box = document.getElementById(`search-box-${type}`);
    box.classList.toggle('hidden');
    if (!box.classList.contains('hidden')) {
        box.querySelector('input').focus();
    }
};

window.handleStaffSearch = (type, val) => {
    if (type === 'timings') state.searchTimings = val.toLowerCase();
    else state.searchPcs = val.toLowerCase();
    window.renderStaffGrid();
};

// --- 2. RENDER TABLE ---

// Active staff type state
if (!state.activeStaffType) state.activeStaffType = 'timings';

window.switchStaffType = (type) => {
    state.activeStaffType = type;

    // Slide the pill indicator
    const slider = document.getElementById('staff-tab-slider');
    const timTab = document.getElementById('staff-tab-timings');
    const pcsTab = document.getElementById('staff-tab-pcs');

    if (slider && timTab && pcsTab) {
        if (type === 'timings') {
            slider.style.left = '2px';
            timTab.className = 'relative z-10 flex-1 px-5 py-2 rounded-full text-sm font-bold transition-colors duration-200 text-slate-800';
            pcsTab.className = 'relative z-10 flex-1 px-5 py-2 rounded-full text-sm font-bold transition-colors duration-200 text-slate-400';
        } else {
            slider.style.left = 'calc(50% + 0px)';
            pcsTab.className = 'relative z-10 flex-1 px-5 py-2 rounded-full text-sm font-bold transition-colors duration-200 text-slate-800';
            timTab.className = 'relative z-10 flex-1 px-5 py-2 rounded-full text-sm font-bold transition-colors duration-200 text-slate-400';
        }
    }

    // Toggle search boxes
    const searchTimings = document.getElementById('search-box-timings');
    const searchPcs = document.getElementById('search-box-pcs');
    if (searchTimings) searchTimings.classList.add('hidden');
    if (searchPcs) searchPcs.classList.add('hidden');

    window.renderStaffGrid();
};

window.renderStaffGrid = () => {
    const tableBody = document.getElementById('staff-table-body');
    if (!tableBody) return;
    if (!state.staffData) return;

    const type = state.activeStaffType || 'timings';

    // Helper to calculate pay for sorting
    const getPay = (emp) => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const lId = `${emp.id}_${year}_${month}`;
        const ledger = state.staffLedgers[lId];

        if (!ledger) return 0;

        if (emp.type === 'timings') {
            return Number(ledger.salary) || 0;
        } else {
            if (ledger.pcsEntries) {
                return ledger.pcsEntries.reduce((sum, row) => sum + (Number(row.total) || 0), 0);
            }
            return 0;
        }
    };

    const sortKey = type === 'timings' ? 'sortTimings' : 'sortPcs';
    const searchVal = type === 'timings' ? (state.searchTimings || '') : (state.searchPcs || '');

    let list = state.staffData.filter(e => e.type === type);

    if (searchVal) {
        list = list.filter(e => e.name.toLowerCase().includes(searchVal) || e.role.toLowerCase().includes(searchVal));
    }

    const sortMode = state[sortKey] || 'alpha_asc';
    list.sort((a, b) => {
        if (sortMode === 'alpha_asc') return a.name.localeCompare(b.name);
        if (sortMode === 'alpha_desc') return b.name.localeCompare(a.name);
        if (sortMode === 'pay_high') return getPay(b) - getPay(a);
        if (sortMode === 'pay_low') return getPay(a) - getPay(b);
        return 0;
    });

    // Update count
    const countEl = document.getElementById('staff-type-count');
    if (countEl) countEl.textContent = `${list.length} employee${list.length !== 1 ? 's' : ''}`;

    if (list.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-400 text-sm italic">No staff found.</td></tr>`;
        return;
    }

    const colorClass = type === 'timings' ? 'indigo' : 'emerald';

    tableBody.innerHTML = list.map((emp, i) => {
        let payBadge = '';
        if (sortMode === 'pay_high' || sortMode === 'pay_low') {
            payBadge = `<span class="ml-2 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">₹${getPay(emp)}</span>`;
        }

        return `
        <tr class="hover:bg-slate-50 transition group">
            <td class="p-3 text-slate-400 text-xs font-mono">${i + 1}</td>
            <td class="p-3">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-${colorClass}-100 text-${colorClass}-600 flex items-center justify-center font-bold text-xs shrink-0">
                        ${emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="min-w-0">
                        <div class="font-bold text-slate-800 text-sm truncate">${emp.name}${payBadge}</div>
                        <div class="text-[10px] text-slate-400 truncate">${emp.role}</div>
                    </div>
                </div>
            </td>
            <td class="p-3 hidden sm:table-cell">
                <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-500">${emp.id}</span>
            </td>
            <td class="p-3 text-center">
                <button onclick="window.openLedger('${emp.id}')" class="w-8 h-8 rounded-lg bg-${colorClass}-50 text-${colorClass}-600 hover:bg-${colorClass}-100 flex items-center justify-center transition mx-auto" title="Open Ledger">
                    <i class="fa-solid fa-book-open text-xs"></i>
                </button>
            </td>
            <td class="p-3 text-center">
                <button onclick="deleteStaff(event, '${emp.id}', '${emp.name}')" class="w-6 h-6 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition opacity-0 group-hover:opacity-100 mx-auto" title="Delete">
                    <i class="fa-solid fa-trash-can text-[10px]"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
};

// --- 3. ADD STAFF LOGIC ---

window.toggleAddStaffModal = () => {
    const modal = document.getElementById('add-staff-modal');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        document.getElementById('new-staff-name').value = '';
        document.getElementById('new-staff-phone').value = '';
        document.getElementById('new-staff-type').value = 'timings';
        if (window.updateRoleOptions) window.updateRoleOptions();
        document.getElementById('new-staff-name').focus();
    } else {
        modal.classList.add('hidden');
    }
};

window.updateRoleOptions = () => {
    const type = document.getElementById('new-staff-type').value;
    const roleSelect = document.getElementById('new-staff-role');
    const customInput = document.getElementById('new-staff-role-custom');

    if (!roleSelect) return;

    roleSelect.innerHTML = '';
    customInput.classList.add('hidden');

    let roles = [];
    if (type === 'timings') {
        roles = ['Helper', 'Supervisor', 'Manager', 'Entrepreneur', 'Cutting Master', 'Part-time Worker', 'Other'];
    } else {
        roles = [
            'Overlock Operator',
            'Front',
            'Back',
            'Five-thread Operator',
            'Double Needle Operator',
            'Belt & Label',
            'Button & Kaja',
            'Bartack',
            'Other'
        ];
    }

    roles.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.innerText = r;
        roleSelect.appendChild(opt);
    });
};

window.checkCustomRole = () => {
    const val = document.getElementById('new-staff-role').value;
    const customInput = document.getElementById('new-staff-role-custom');
    if (val === 'Other') {
        customInput.classList.remove('hidden');
        customInput.focus();
    } else {
        customInput.classList.add('hidden');
    }
};

window.saveNewStaff = () => {
    const name = document.getElementById('new-staff-name').value.trim();
    const phone = document.getElementById('new-staff-phone').value.trim();
    const type = document.getElementById('new-staff-type').value;
    const unit = document.getElementById('new-staff-unit').value;
    let role = document.getElementById('new-staff-role').value;

    if (role === 'Other') {
        role = document.getElementById('new-staff-role-custom').value.trim();
    }

    if (!name) return alert("Please enter a name.");
    if (!unit) return alert("Please select a Managing Unit.");
    if (!role) return alert("Please enter a role.");

    const newEmp = {
        id: Date.now().toString(),
        name: name,
        phone: phone,
        type: type,
        unit: unit,
        role: role,
        joined: new Date().toISOString()
    };

    state.staffData.push(newEmp);

    localStorage.setItem('srf_staff_list', JSON.stringify(state.staffData));
    if (window.saveToCloud) window.saveToCloud('staffData', state.staffData);

    window.toggleAddStaffModal();
    window.renderStaffGrid();

    // Auto-open ledger (Unit check will pass since we just assigned it)
    if (confirm("Employee Added! Open their ledger now?")) {
        window.openLedger(newEmp.id);
    }
};

// --- DELETE STAFF LOGIC ---

window.deleteStaff = (e, id, name) => {
    // 1. STOP the click from bubbling up to the card (Prevent Ledger Opening)
    e.stopPropagation();

    // 2. Confirmation
    if (!confirm(`⚠ Move ${name} to Recycle Bin?\n\nThey will be permanently deleted after 30 days unless restored.`)) {
        return;
    }

    // 3. Find the employee
    const emp = state.staffData.find(e => e.id === id);
    if (!emp) return;

    // 4. Create deleted item entry
    const deletedItem = {
        id: `deleted_${Date.now()}_${id}`,
        type: 'staff',
        data: emp,
        deletedAt: Date.now(),
        deletedBy: window.auth?.currentUser?.email || 'Unknown',
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    };

    // 5. Add to deletedItems
    state.deletedItems.push(deletedItem);
    localStorage.setItem('srf_deleted_items', JSON.stringify(state.deletedItems));
    if (window.saveToCloud) window.saveToCloud('deletedItems', state.deletedItems);

    // 6. Remove from staffData
    state.staffData = state.staffData.filter(emp => emp.id !== id);
    localStorage.setItem('srf_staff_list', JSON.stringify(state.staffData));
    if (window.saveToCloud) window.saveToCloud('staffData', state.staffData);

    // 7. Refresh Grid
    window.renderStaffGrid();

    // 8. Notify
    window.addNotification({
        type: 'info',
        title: 'Moved to Bin',
        message: `${name} moved to Recycle Bin. Can be restored within 30 days.`
    });
};