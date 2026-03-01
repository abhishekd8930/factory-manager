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
        list = list.filter(e =>
            e.name.toLowerCase().includes(searchVal) ||
            e.role.toLowerCase().includes(searchVal) ||
            e.id.toLowerCase().includes(searchVal)
        );
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
        <tr onclick="window.openStaffProfile('${emp.id}')" class="hover:bg-slate-50 transition group cursor-pointer">
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
            <td class="p-3">
                <span class="text-[10px] bg-slate-100 border border-slate-200 px-2 py-1 rounded-md font-mono text-slate-700 font-bold uppercase tracking-wider whitespace-nowrap">${emp.id}</span>
            </td>
            <td class="p-3 text-center">
                <button onclick="event.stopPropagation(); window.openLedger('${emp.id}')" class="w-8 h-8 rounded-lg bg-${colorClass}-50 text-${colorClass}-600 hover:bg-${colorClass}-100 flex items-center justify-center transition mx-auto" title="Open Ledger">
                    <i class="fa-solid fa-book-open text-xs"></i>
                </button>
            </td>
            <td class="p-3 text-center">
                <button onclick="event.stopPropagation(); deleteStaff(event, '${emp.id}', '${emp.name}')" class="w-6 h-6 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition opacity-0 group-hover:opacity-100 mx-auto" title="Delete">
                    <i class="fa-solid fa-trash-can text-[10px]"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
};

// --- PROFILE SIDE PANEL LOGIC ---

window.openStaffProfile = (empId) => {
    const emp = state.staffData?.find(e => e.id === empId);
    if (!emp) return;

    const panel = document.getElementById('staff-profile-panel');
    const content = document.getElementById('staff-profile-content');
    const tableContainer = document.getElementById('staff-table-container');

    if (!panel || !content || !tableContainer) return;

    // Build Profile HTML
    const colorClass = emp.type === 'timings' ? 'indigo' : 'emerald';
    const initial = emp.name.charAt(0).toUpperCase();

    // Find Auth Credentials (if any)
    const allWorkers = state.workers || {};
    const cred = allWorkers[emp.id];
    let credHtml = `<div class="text-xs text-slate-500 italic mt-2">No login PIN set.</div>`;

    if (cred) {
        credHtml = `
            <div class="mt-3 bg-white border border-slate-200 rounded-lg p-3">
                <div class="text-[10px] font-bold uppercase text-slate-400 mb-1">Login PIN</div>
                <div class="font-mono text-slate-700 tracking-widest">${cred.pin}</div>
            </div>
        `;
    }

    content.innerHTML = `
        <div class="flex flex-col items-center text-center pb-4 border-b border-slate-200">
            <div class="w-20 h-20 rounded-full bg-${colorClass}-100 text-${colorClass}-600 flex items-center justify-center font-bold text-3xl mb-3 shadow-sm border-4 border-white">
                ${initial}
            </div>
            <h3 class="text-lg font-bold text-slate-800">${emp.name}</h3>
            <p class="text-xs font-bold text-${colorClass}-600 uppercase tracking-widest bg-${colorClass}-50 px-2 py-0.5 rounded mt-1">${emp.role}</p>
        </div>

        <div class="py-4 space-y-4">
            <div>
                <div class="text-[10px] font-bold uppercase text-slate-400 mb-1">Employee ID</div>
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-id-badge text-slate-300 w-4"></i>
                    <span class="font-mono text-slate-700 font-bold">${emp.id}</span>
                </div>
            </div>
            
            ${emp.phone ? `
            <div>
                <div class="text-[10px] font-bold uppercase text-slate-400 mb-1">Phone Number</div>
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-phone text-slate-300 w-4"></i>
                    <a href="tel:${emp.phone}" class="text-indigo-600 hover:underline font-medium">${emp.phone}</a>
                </div>
            </div>
            ` : ''}

            ${emp.email ? `
            <div>
                <div class="text-[10px] font-bold uppercase text-slate-400 mb-1">Email Address</div>
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-envelope text-slate-300 w-4"></i>
                    <a href="mailto:${emp.email}" class="text-indigo-600 hover:underline font-medium">${emp.email}</a>
                </div>
            </div>
            ` : ''}

            <div class="flex gap-4">
                <div class="flex-1">
                    <div class="text-[10px] font-bold uppercase text-slate-400 mb-1">Managing Unit</div>
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-industry text-slate-300 w-4"></i>
                        <span class="text-slate-700 font-medium">${emp.unit || 'Not Assigned'}</span>
                    </div>
                </div>
                ${(() => {
            if (emp.type !== 'timings') return '';
            const now = new Date();
            const lid = emp.id + '_' + now.getFullYear() + '_' + (now.getMonth() + 1);
            const ledger = state.staffLedgers && state.staffLedgers[lid];
            const basicSalary = ledger && ledger.salary ? ledger.salary : 0;
            return '<div class="flex-1">' +
                '<div class="text-[10px] font-bold uppercase text-slate-400 mb-1">Basic Salary</div>' +
                '<div class="flex items-center gap-2">' +
                '<i class="fa-solid fa-money-bill-wave text-emerald-500 w-4"></i>' +
                '<span class="text-emerald-700 font-bold">₹' + Number(basicSalary).toLocaleString('en-IN') + '</span>' +
                '</div></div>';
        })()}
            </div>

            <div>
                <div class="text-[10px] font-bold uppercase text-slate-400 mb-1">Payment Basis</div>
                <div class="flex items-center gap-2">
                    <i class="fa-solid ${emp.type === 'timings' ? 'fa-clock' : 'fa-layer-group'} text-slate-300 w-4"></i>
                    <span class="text-slate-700 font-medium">${emp.type === 'timings' ? 'Time-based (Salary)' : 'Piece Work (Contract)'}</span>
                </div>
            </div>
        </div>
        
        <div class="pt-4 border-t border-slate-200">
            <div class="text-[10px] font-bold uppercase text-slate-400 mb-2">Worker Credentials</div>
            ${credHtml}
        </div>
        
        <div class="mt-6">
             <button onclick="window.openLedger('${emp.id}')" class="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2">
                <i class="fa-solid fa-book-open"></i> Open Full Ledger
            </button>
        </div>
    `;

    // Show panel
    panel.classList.remove('hidden');
    panel.classList.add('flex');

    // Highlight active row in table
    const tbody = document.getElementById('staff-table-body');
    if (tbody) {
        Array.from(tbody.children).forEach(tr => tr.classList.remove('bg-indigo-50/50', 'border-l-4', 'border-indigo-500'));
        // We know which row was clicked if we want, but simple implementation:
        // the click handler just fires. To highlight exactly, we'd need to emit the TR element.
    }
};

window.closeStaffProfile = () => {
    const panel = document.getElementById('staff-profile-panel');
    if (panel) {
        panel.classList.add('hidden');
        panel.classList.remove('flex');
    }

    // Remove active highlights
    const tbody = document.getElementById('staff-table-body');
    if (tbody) {
        Array.from(tbody.children).forEach(tr => tr.classList.remove('bg-indigo-50/50', 'border-l-4', 'border-indigo-500'));
    }
};

// --- 3. ADD STAFF LOGIC ---

window.toggleAddStaffModal = () => {
    const modal = document.getElementById('add-staff-modal');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        document.getElementById('new-staff-id').value = '';
        document.getElementById('new-staff-name').value = '';
        document.getElementById('new-staff-phone').value = '';
        document.getElementById('new-staff-type').value = 'timings';
        document.getElementById('new-staff-unit').value = '';
        if (window.updateRoleOptions) window.updateRoleOptions();
        if (window.generateEmployeeId) window.generateEmployeeId();
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

window.generateEmployeeId = () => {
    const type = document.getElementById('new-staff-type').value;
    const unit = document.getElementById('new-staff-unit').value || '';
    let role = document.getElementById('new-staff-role').value || '';
    if (role === 'Other') {
        role = document.getElementById('new-staff-role-custom').value.trim();
    }

    const idInput = document.getElementById('new-staff-id');
    if (!idInput) return;

    if (!unit || !role) {
        idInput.value = '';
        return;
    }

    // 1. Type: T or P
    const pType = type === 'timings' ? 'T' : 'P';

    // 2. Unit: C, F, A, F
    let pUnit = 'X';
    if (unit === 'Cutting') pUnit = 'C';
    else if (unit === 'FB') pUnit = 'F';
    else if (unit === 'Assembly') pUnit = 'A';
    else if (unit === 'Finishing') pUnit = 'F';

    // 3. Role: First letter
    let pRole = role.charAt(0).toUpperCase();
    if (!pRole || !/[A-Z]/.test(pRole)) pRole = 'X'; // fallback if not a letter

    const prefix = `${pType}${pUnit}${pRole} -`;

    // 4. Find max number for this prefix
    let maxNum = 0;
    if (state.staffData) {
        state.staffData.forEach(emp => {
            if (emp.id && emp.id.startsWith(prefix)) {
                const numParts = emp.id.split('-');
                if (numParts.length === 2) {
                    const num = parseInt(numParts[1], 10);
                    if (!isNaN(num) && num > maxNum) {
                        maxNum = num;
                    }
                }
            }
        });
    }

    const nextNumStr = String(maxNum + 1).padStart(3, '0');
    idInput.value = `${prefix}${nextNumStr} `;
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

    const finalId = document.getElementById('new-staff-id').value;
    if (!finalId) return alert("Employee ID could not be generated. Please ensure all form fields are filled.");

    const newEmp = {
        id: finalId,
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
    if (!confirm(`⚠ Move ${name} to Recycle Bin ?\n\nThey will be permanently deleted after 30 days unless restored.`)) {
        return;
    }

    // 3. Find the employee
    const emp = state.staffData.find(e => e.id === id);
    if (!emp) return;

    // 4. Create deleted item entry
    const deletedItem = {
        id: `deleted_${Date.now()}_${id} `,
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
        message: `${name} moved to Recycle Bin.Can be restored within 30 days.`
    });
};