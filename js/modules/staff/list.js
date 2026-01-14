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
    if(icon) {
        icon.className = ""; 
        if(nextMode === 'alpha_asc') icon.className = "fa-solid fa-arrow-down-a-z";
        else if(nextMode === 'alpha_desc') icon.className = "fa-solid fa-arrow-up-a-z";
        else if(nextMode === 'pay_high') icon.className = "fa-solid fa-arrow-down-9-1 text-emerald-600"; 
        else if(nextMode === 'pay_low') icon.className = "fa-solid fa-arrow-up-1-9 text-red-400"; 
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

// --- 2. RENDER GRID ---

window.renderStaffGrid = () => {
    const timingsContainer = document.getElementById('staff-grid-timings');
    const pcsContainer = document.getElementById('staff-grid-pcs');
    
    if (!timingsContainer || !pcsContainer) return;
    if (!state.staffData) return; 

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

    const processList = (type, sortKey, searchVal) => {
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
        
        return list;
    };

    const timingsList = processList('timings', 'sortTimings', state.searchTimings || '');
    const pcsList = processList('pcs', 'sortPcs', state.searchPcs || '');

    const generateCard = (emp) => {
        let earningsBadge = '';
        const sortKey = emp.type === 'timings' ? 'sortTimings' : 'sortPcs';
        const currentMode = state[sortKey];
        
        if (currentMode === 'pay_high' || currentMode === 'pay_low') {
            const pay = getPay(emp);
            earningsBadge = `<div class="absolute top-2 right-2 bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">₹${pay}</div>`;
        }

        return `
    <div onclick="window.openLedger('${emp.id}')" 
         class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group relative overflow-hidden">
        
        ${earningsBadge}
        
        <div class="absolute top-0 right-0 w-12 h-12 bg-slate-50 rounded-bl-full -mr-6 -mt-6 transition group-hover:bg-indigo-50 -z-10"></div>
        
        <div class="flex items-center gap-3 relative z-10 mt-1">
            <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-200 group-hover:border-indigo-200 group-hover:text-indigo-600 transition shrink-0">
                ${emp.name.charAt(0).toUpperCase()}
            </div>
            <div class="min-w-0">
                <h4 class="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition leading-tight truncate">${emp.name}</h4>
                <p class="text-[10px] text-slate-500 mt-0.5 truncate">${emp.role}</p>
            </div>
        </div>
        
        <div class="mt-2 flex justify-between items-center relative z-10">
            <span class="text-[9px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-slate-400 font-mono tracking-tighter">
                ${emp.phone || 'No Phone'}
            </span>

            <button onclick="deleteStaff(event, '${emp.id}', '${emp.name}')" 
                    class="w-6 h-6 rounded-full bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 border border-slate-100 flex items-center justify-center transition opacity-0 group-hover:opacity-100 shadow-sm"
                    title="Delete Employee">
                <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
        </div>
    </div>
    `;
    };

    // --- TIMINGS SECTION (Render) ---
    if (timingsList.length > 0) {
        timingsContainer.innerHTML = timingsList.map(generateCard).join('');
    } else {
        timingsContainer.innerHTML = `<div class="text-center p-4 text-slate-400 text-xs italic col-span-full">No staff found.</div>`;
    }

    // --- PIECE WORK SECTION (Render & Icon Update) ---
    // Update the Header Icon Here using DOM manipulation before rendering cards
    const pcsHeader = document.getElementById('staff-grid-pcs')?.previousElementSibling?.querySelector('h3');
    if(pcsHeader) {
        // Updated to use 'fa-layer-group' (Stacks of Pants) instead of 'fa-shirt'
        pcsHeader.innerHTML = `<i class="fa-solid fa-layer-group text-emerald-500"></i> Piece Work Staff`;
    }

    if (pcsList.length > 0) {
        pcsContainer.innerHTML = pcsList.map(generateCard).join('');
    } else {
        pcsContainer.innerHTML = `<div class="text-center p-4 text-slate-400 text-xs italic col-span-full">No staff found.</div>`;
    }
};

// --- 3. ADD STAFF LOGIC ---

window.toggleAddStaffModal = () => {
    const modal = document.getElementById('add-staff-modal');
    if(modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        document.getElementById('new-staff-name').value = '';
        document.getElementById('new-staff-phone').value = '';
        document.getElementById('new-staff-type').value = 'timings';
        if(window.updateRoleOptions) window.updateRoleOptions();
        document.getElementById('new-staff-name').focus();
    } else {
        modal.classList.add('hidden');
    }
};

window.updateRoleOptions = () => {
    const type = document.getElementById('new-staff-type').value;
    const roleSelect = document.getElementById('new-staff-role');
    const customInput = document.getElementById('new-staff-role-custom');
    
    if(!roleSelect) return;

    roleSelect.innerHTML = '';
    customInput.classList.add('hidden');
    
    let roles = [];
    if(type === 'timings') {
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
    if(val === 'Other') {
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
    let role = document.getElementById('new-staff-role').value;
    
    if(role === 'Other') {
        role = document.getElementById('new-staff-role-custom').value.trim();
    }
    
    if(!name) return alert("Please enter a name.");
    if(!role) return alert("Please enter a role.");
    
    const newEmp = {
        id: Date.now().toString(),
        name: name,
        phone: phone,
        type: type,
        role: role,
        joined: new Date().toISOString()
    };
    
    state.staffData.push(newEmp);
    
    localStorage.setItem('srf_staff_list', JSON.stringify(state.staffData));
    if(window.saveToCloud) window.saveToCloud('staffData', state.staffData);
    
    window.toggleAddStaffModal();
    window.renderStaffGrid();
    
    if(confirm("Employee Added! Open their ledger now?")) {
        window.openLedger(newEmp.id);
    }
};

// --- DELETE STAFF LOGIC ---

window.deleteStaff = (e, id, name) => {
    // 1. STOP the click from bubbling up to the card (Prevent Ledger Opening)
    e.stopPropagation();

    // 2. Confirmation
    if(!confirm(`⚠ WARNING: Are you sure you want to remove ${name}?\n\nThis will hide them from the list, but their ledger history will remain in the database.`)) {
        return;
    }

    // 3. Remove from State
    state.staffData = state.staffData.filter(emp => emp.id !== id);

    // 4. Save to Storage
    localStorage.setItem('srf_staff_list', JSON.stringify(state.staffData));
    
    // 5. Sync to Cloud
    if(window.saveToCloud) window.saveToCloud('staffData', state.staffData);

    // 6. Refresh Grid
    window.renderStaffGrid();
};