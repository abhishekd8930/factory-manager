console.log("Staff Ledger Module Loaded");

// --- MAIN LEDGER ROUTER & RENDER ---

window.openLedger = (empId, restoreSession = false) => {
    alert(`DEBUG: openLedger called for ${empId}`); // Uncomment if needed
    const emp = state.staffData.find(e => e.id === empId);
    if (!emp) {
        alert("DEBUG ERROR: Employee not found in database!");
        return;
    }

    // --- RESTRICTION: UNIT REQUIRED ---
    if (!emp.unit) {
        if (confirm(`⛔ ACCESS DENIED: ${emp.name} is not assigned to a Managing Unit.\n\nOnly staff assigned to a Unit (Cutting, FB, Assembly, Finishing) can access ledgers.\n\nPlease delete and re-add this staff member with a valid Unit assignment.`)) {
            // Optional: Could redirect to edit mode if that existed, but for now we block.
        }
        return;
    }
    // ----------------------------------

    localStorage.setItem('srf_last_emp_id', empId);
    state.currentLedgerEmp = emp;

    if (restoreSession) {
        const savedDate = localStorage.getItem('srf_last_ledger_date');
        if (savedDate) state.currentLedgerDate = new Date(savedDate);
        else state.currentLedgerDate = new Date();
    } else {
        state.currentLedgerDate = new Date();
        localStorage.setItem('srf_last_ledger_date', state.currentLedgerDate.toISOString());
    }

    if (isNaN(state.currentLedgerDate.getTime())) {
        console.error("Invalid Date Detected in openLedger");
        alert("System Error: Invalid Date. Resetting to Today.");
        state.currentLedgerDate = new Date();
        localStorage.setItem('srf_last_ledger_date', state.currentLedgerDate.toISOString());
    }

    // --- NEW: AUTO-CLEANUP LOGIC ---
    // If it's a Piece Work staff, clean up empty rows before showing
    if (emp.type === 'pcs') {
        window.cleanPcsLedger(empId);
    }
    // -------------------------------

    document.getElementById('staff-list-view').classList.add('hidden');
    document.getElementById('staff-ledger-view').classList.remove('hidden');
    document.getElementById('ledger-emp-name').innerText = emp.name;
    document.getElementById('ledger-emp-role').innerText = emp.role;

    // Show Unit Badge (Optional but helpful)
    const unitBadge = document.createElement('span');
    unitBadge.className = 'ml-2 text-xs font-bold text-white bg-indigo-500 px-2 py-0.5 rounded';
    unitBadge.innerText = emp.unit;
    // Clear previous badges if any inside role container? No, just keep it simple.

    const advInput = document.getElementById('ledger-advance');
    if (advInput) {
        advInput.ondblclick = window.openAdvanceModal;
        advInput.setAttribute('title', 'Double-click to view details');
    }

    window.renderLedgerTable();
};

window.closeLedgerView = () => {
    localStorage.removeItem('srf_last_emp_id');
    document.getElementById('staff-ledger-view').classList.add('hidden');
    document.getElementById('staff-list-view').classList.remove('hidden');
    state.currentLedgerEmp = null;
    window.renderStaffGrid();
};

window.changeLedgerMonth = (delta) => {
    state.currentLedgerDate.setMonth(state.currentLedgerDate.getMonth() + delta);
    localStorage.setItem('srf_last_ledger_date', state.currentLedgerDate.toISOString());
    window.renderLedgerTable();
};

window.changeLedgerEmployee = (delta) => {
    if (!state.currentLedgerEmp) return;

    // 1. Get the Type of the currently viewed employee (e.g., 'timings' or 'pcs')
    const currentType = state.currentLedgerEmp.type;

    // 2. Create a filtered list containing ONLY staff of that specific type
    const filteredList = state.staffData
        .filter(e => e.type === currentType)
        .sort((a, b) => a.name.localeCompare(b.name));

    // 3. Find where the current employee is in this specific list
    const idx = filteredList.findIndex(e => e.id === state.currentLedgerEmp.id);

    // 4. Calculate the new index
    let newIdx = idx + delta;

    // Handle Loop (Last -> First, First -> Last)
    if (newIdx < 0) newIdx = filteredList.length - 1;
    if (newIdx >= filteredList.length) newIdx = 0;

    // 5. Open the new ledger
    window.openLedger(filteredList[newIdx].id, true);
};

window.renderLedgerTable = () => {
    console.log("renderLedgerTable called");
    try {
        const emp = state.currentLedgerEmp;
        console.log("Current Ledger Emp:", emp);

        if (!emp) {
            console.error("No currentLedgerEmp found inside renderLedgerTable");
            return;
        }

        const tableEl = document.getElementById('staff-table');
        console.log("Table Element found:", !!tableEl);

        if (tableEl) {
            tableEl.className = "ledger-table";
            if (tableEl.parentElement) tableEl.parentElement.className = "ledger-scroll-container";
        }

        console.log("Dispatching render based on type:", emp.type);
        if (emp.type === 'timings') renderTimeLedgerTable();
        else renderPcsLedgerTable();
    } catch (err) {
        console.error("CRITICAL ERROR in renderLedgerTable:", err);
        alert("Error showing ledger: " + err.message);
    }
};

// --- VIEW A: TIME-BASED LEDGER ---

window.renderTimeLedgerTable = () => {
    // alert("DEBUG: renderTimeLedgerTable START"); 
    console.log("renderTimeLedgerTable started");
    try {
        const date = state.currentLedgerDate;
        const lId = getLedgerId();
        console.log("Ledger ID:", lId);

        if (!lId) {
            console.error("Invalid Ledger ID");
            alert(`DEBUG ERROR: Ledger ID is null.\nEmp: ${state.currentLedgerEmp ? 'OK' : 'MISSING'}\nDate: ${state.currentLedgerDate}`);
            return;
        }

        if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {}, advance: '' };
        if (!state.staffLedgers[lId].days) state.staffLedgers[lId].days = {};

        const pcsBtn = document.getElementById('pcs-add-row-container');
        const salaryBtn = document.getElementById('salary-calc-btn-container');
        const salaryDiv = document.getElementById('financial-salary-container');

        if (pcsBtn) pcsBtn.classList.add('hidden');
        if (salaryDiv) salaryDiv.style.display = 'block';

        // Ensure button says "Calculate Pay" for Time staff
        if (salaryBtn) {
            salaryBtn.classList.remove('hidden');
            salaryBtn.querySelector('button').innerHTML = `<i class="fa-solid fa-calculator"></i> Calculate Pay`;
        }

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const monthLabel = document.getElementById('ledger-month-label');
        if (!monthLabel) {
            alert("DEBUG ERROR: 'ledger-month-label' element NOT FOUND!");
            return;
        }
        monthLabel.innerText = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        const thead = document.getElementById('ledger-table-head');
        if (thead) {
            thead.innerHTML = `
            <tr>
                <th class="p-3 w-[100px] text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                <th class="p-3 w-[140px] text-left text-xs font-bold text-slate-500 uppercase">Clock In</th>
                <th class="p-3 w-[140px] text-left text-xs font-bold text-slate-500 uppercase">Clock Out</th>
                <th class="p-3 w-[120px] text-center text-xs font-bold text-slate-500 uppercase">Work Hrs</th>
                <th class="p-3 w-[100px] text-center text-xs font-bold text-slate-500 uppercase">OT Hrs</th>
                <th class="p-3 w-[120px] text-center text-xs font-bold text-slate-500 uppercase">Total</th>
            </tr>`;
        } else {
            console.error("ledger-table-head not found!");
        }

        document.getElementById('ledger-hints').innerHTML = `<i class="fa-solid fa-keyboard mr-1"></i> Shortcuts: <strong>D</strong>(Default) • <strong>A/P</strong>(AM/PM) • <strong>L/N/H</strong>(Status)`;
        document.getElementById('salary-label').innerText = 'Basic Salary';
        const salInput = document.getElementById('ledger-salary');
        if (salInput) {
            salInput.readOnly = false;
            salInput.value = state.staffLedgers[lId].salary || '';
        }

        const advInput = document.getElementById('ledger-advance');
        if (advInput) advInput.value = state.staffLedgers[lId].advance || '';

        const tbody = document.getElementById('ledger-table-body');
        if (!tbody) {
            console.error("ledger-table-body NOT FOUND");
            return;
        }
        tbody.innerHTML = '';
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        console.log("Days in Month:", daysInMonth);

        for (let i = 1; i <= daysInMonth; i++) {
            const dayData = state.staffLedgers[lId].days[i] || { in: '', out: '', ot: '', hours: '', status: '' };
            const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
            const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });

            const isWeekend = dayName === 'Sun';
            const isHoliday = dayData.status === 'HOLIDAY';

            let workingDisplay = '-';
            if (dayData.status && ['LEAVE', 'NPL', 'HOLIDAY', 'PAID_LEAVE'].includes(dayData.status)) {
                if (dayData.status === 'HOLIDAY') workingDisplay = 'Holiday';
                else if (dayData.status === 'PAID_LEAVE') workingDisplay = 'Paid Leave';
                else workingDisplay = dayData.status;
            } else if (isWeekend) {
                workingDisplay = 'Sunday';
            } else if (dayData.hours) {
                const calcW = Number(dayData.hours) - Number(dayData.ot || 0);
                workingDisplay = calcW >= 8 ? '1' : calcW.toFixed(1) + ' hrs';
            } else {
                workingDisplay = 'Please fill';
            }

            let otDisplay = '-';
            if ((isWeekend || isHoliday) && dayData.hours) { otDisplay = dayData.hours + ' hrs'; }
            else if (dayData.ot && dayData.ot > 0) { otDisplay = dayData.ot + ' hrs'; }
            else if (['LEAVE', 'NPL'].includes(dayData.status)) { otDisplay = '0'; }

            const isLocked = ['LEAVE', 'NPL', 'PAID_LEAVE'].includes(dayData.status) && !isHoliday;
            const statusClass = workingDisplay === 'Please fill' ? 'text-red-400 italic text-xs' : 'font-bold text-slate-700';

            const tr = document.createElement('tr');
            tr.className = isWeekend ? "bg-slate-50 border-b border-slate-100" : "hover:bg-indigo-50/20 border-b border-slate-100";

            tr.innerHTML = `
                <td class="p-3 border-r border-slate-100 text-slate-600 font-medium">
                    <span class="inline-block w-6 font-bold ${isWeekend ? 'text-red-500' : 'text-slate-800'}">${i}</span>
                    <span class="text-xs uppercase text-slate-400 ml-2">${dayName}</span>
                </td>
                <td class="p-2 border-r border-slate-100">
                    <input type="text" class="text-center time-in text-slate-700" 
                        name="in-${i}"
                        data-day="${i}" value="${isLocked ? '-' : (dayData.in || '')}" 
                        placeholder="${isLocked ? '-' : '09:30 AM'}" 
                        ${isLocked ? 'disabled' : ''} 
                        oninput="quickSave(this)" 
                        onkeydown="handleTimeKey(event, this, 'in')" 
                        onblur="handleBlur(event, this, '${i}')">
                </td>
                <td class="p-2 border-r border-slate-100">
                    <input type="text" class="text-center time-out text-slate-700" 
                        name="out-${i}"
                        data-day="${i}" value="${isLocked ? '-' : (dayData.out || '')}" 
                        placeholder="${isLocked ? '-' : '07:00 PM'}" 
                        ${isLocked ? 'disabled' : ''} 
                        oninput="quickSave(this)" 
                        onkeydown="handleTimeKey(event, this, 'out')" 
                        onblur="handleBlur(event, this, '${i}')">
                </td>
                <td class="p-2 border-r border-slate-100 relative">
                    <input type="text" class="text-center status-input ${statusClass}" 
                        data-day="${i}" value="${workingDisplay}" title="L, N, H, Del" readonly 
                        onkeydown="handleStatusKey(event, this)">
                </td>
                <td class="p-2 border-r border-slate-100 text-center">
                    <span class="font-bold text-indigo-600 ot-cell">${otDisplay}</span>
                </td>
                <td class="p-2 text-center">
                    <span class="font-bold text-slate-800 total-hrs-cell">${isLocked ? '-' : (dayData.hours ? dayData.hours + ' hrs' : '-')}</span>
                </td>
            `;
            tbody.appendChild(tr);
        }
        console.log("renderTimeLedgerTable completed successfully");
    } catch (err) {
        console.error("CRITICAL ERROR in renderTimeLedgerTable:", err);
        alert("Error rendering time ledger: " + err.message);
    }
};

// --- VIEW B: PIECE-WORK LEDGER (DYNAMIC ROWS) ---

window.renderPcsLedgerTable = () => {
    console.log("renderPcsLedgerTable started");
    try {
        const date = state.currentLedgerDate;
        const lId = getLedgerId();
        console.log("Ledger ID:", lId);

        if (!lId) {
            console.error("Invalid Ledger ID");
            alert(`DEBUG ERROR (PCS): Ledger ID is null.\nEmp: ${state.currentLedgerEmp ? 'OK' : 'MISSING'}\nDate: ${state.currentLedgerDate}`);
            return;
        }

        if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {}, advance: '', pcsEntries: [] };
        if (!state.staffLedgers[lId].pcsEntries) state.staffLedgers[lId].pcsEntries = [];

        // --- FIX: START WITH 1 ROW IF EMPTY ---
        if (state.staffLedgers[lId].pcsEntries.length === 0) {
            state.staffLedgers[lId].pcsEntries.push({ item: '', style: '', fabric: '', quantity: '', rate: '', total: 0 });
        }

        // Toggle Buttons
        const pcsBtn = document.getElementById('pcs-add-row-container');
        const salaryBtn = document.getElementById('salary-calc-btn-container');

        if (pcsBtn) pcsBtn.classList.remove('hidden');

        // SHOW the button, but change text to "View Bill"
        if (salaryBtn) {
            salaryBtn.classList.remove('hidden');
            salaryBtn.querySelector('button').innerHTML = `<i class="fa-solid fa-file-invoice"></i> View Bill`;
        }

        document.getElementById('ledger-hints').innerHTML = `<i class="fa-solid fa-calculator mr-1"></i> Enter on last cell adds row`;

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const monthLabel = document.getElementById('ledger-month-label');
        if (!monthLabel) {
            alert("DEBUG ERROR (PCS): 'ledger-month-label' element NOT FOUND!");
            return;
        }
        monthLabel.innerText = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        // FIXED WIDTH COLUMNS
        const thead = document.getElementById('ledger-table-head');
        if (thead) {
            thead.innerHTML = `
            <tr>
                <th class="p-3 w-[60px] text-center text-xs font-bold text-slate-500 uppercase">No.</th>
                <th class="p-3 w-[150px] text-left text-xs font-bold text-slate-500 uppercase">Item</th>
                <th class="p-3 w-[120px] text-left text-xs font-bold text-slate-500 uppercase">Style</th>
                <th class="p-3 w-[120px] text-left text-xs font-bold text-slate-500 uppercase">Fabric</th>
                <th class="p-3 w-[100px] text-center text-xs font-bold text-slate-500 uppercase">Qty</th>
                <th class="p-3 w-[100px] text-center text-xs font-bold text-slate-500 uppercase">Rate</th>
                <th class="p-3 w-[120px] text-right text-xs font-bold text-slate-500 uppercase">Total</th>
                <th class="p-3 w-[50px]"></th>
            </tr>`;
        }

        const lData = state.staffLedgers[lId];
        let totalEarnings = 0;
        if (lData.pcsEntries) {
            lData.pcsEntries.forEach(row => totalEarnings += Number(row.total || 0));
        }

        document.getElementById('salary-label').innerText = 'Total Earnings';
        const salInput = document.getElementById('ledger-salary');
        if (salInput) {
            salInput.value = totalEarnings;
            salInput.readOnly = true;
        }

        const advInput = document.getElementById('ledger-advance');
        if (advInput) advInput.value = lData.advance || '';

        const tbody = document.getElementById('ledger-table-body');
        if (!tbody) {
            console.error("ledger-table-body NOT FOUND");
            return;
        }
        tbody.innerHTML = '';

        lData.pcsEntries.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-emerald-50/20 border-b border-slate-100";
            tr.innerHTML = `
                <td class="p-3 border-r border-slate-100 text-slate-600 font-medium text-center">
                    <span class="inline-block font-bold text-slate-800">${index + 1}</span>
                </td>
                <td class="p-2 border-r border-slate-100"><input type="text" name="pcs-item-${index}" class="pcs-item text-slate-700" data-index="${index}" value="${row.item || ''}" placeholder="Item" onchange="updatePcsRow(this)"></td>
                <td class="p-2 border-r border-slate-100"><input type="text" name="pcs-style-${index}" class="pcs-style text-slate-700" data-index="${index}" value="${row.style || ''}" placeholder="Style" onchange="updatePcsRow(this)"></td>
                <td class="p-2 border-r border-slate-100"><input type="text" name="pcs-fabric-${index}" class="pcs-fabric text-slate-700" data-index="${index}" value="${row.fabric || ''}" placeholder="Fabric" onchange="updatePcsRow(this)"></td>
                <td class="p-2 border-r border-slate-100"><input type="number" name="pcs-qty-${index}" class="text-center pcs-qty text-slate-700" data-index="${index}" value="${row.quantity || ''}" placeholder="0" oninput="updatePcsRow(this)"></td>
                <td class="p-2 border-r border-slate-100"><input type="number" name="pcs-rate-${index}" step="0.1" class="text-center pcs-rate text-slate-700" data-index="${index}" value="${row.rate || ''}" placeholder="0" oninput="updatePcsRow(this)" onkeydown="handlePcsEnter(event, this)"></td>
                <td class="p-2 text-right"><span class="font-bold text-emerald-600 pcs-total">${row.total || 0}</span></td>
                <td class="p-2 text-center">
                    <button onclick="deletePcsRow(${index})" class="text-slate-300 hover:text-red-500 transition"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        console.log("renderPcsLedgerTable completed successfully");
    } catch (err) {
        console.error("CRITICAL ERROR in renderPcsLedgerTable:", err);
        alert("Error rendering piece work ledger: " + err.message);
    }
};

// --- EVENTS ---

window.handleBlur = (e, input, day) => {
    updateRowCalculations(day);
    if (window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);
};

window.handleTimeKey = (e, input, type) => {
    if (['d', 'D'].includes(e.key)) { e.preventDefault(); input.value = type === 'in' ? '09:30 AM' : '07:00 PM'; updateRowCalculations(input.dataset.day); return; }
    if (['a', 'A'].includes(e.key)) { e.preventDefault(); input.value = input.value.toUpperCase().replace('PM', 'AM'); if (!input.value.includes('AM')) input.value += ' AM'; updateRowCalculations(input.dataset.day); return; }
    if (['p', 'P'].includes(e.key)) { e.preventDefault(); input.value = input.value.toUpperCase().replace('AM', 'PM'); if (!input.value.includes('PM')) input.value += ' PM'; updateRowCalculations(input.dataset.day); return; }

    if (e.key === 'Enter') {
        e.preventDefault();
        if (input.value && !input.value.includes(':')) {
            const p = window.parseTime12h(input.value, type);
            if (p) input.value = p.formatted;
        }
        if (!input.value) input.value = type === 'in' ? '09:30 AM' : '07:00 PM';
        updateRowCalculations(input.dataset.day);

        if (window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);

        if (type === 'in') input.closest('tr').querySelector('.time-out').focus();
        else {
            const allInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([disabled])'));
            const index = allInputs.indexOf(input);
            if (index > -1 && index < allInputs.length - 1) allInputs[index + 1].focus();
        }
    }
};

window.handleStatusKey = (e, input) => {
    const day = input.dataset.day;
    const key = e.key.toUpperCase();
    if (['L', 'N', 'H', 'BACKSPACE', 'DELETE'].includes(key)) {
        e.preventDefault();
        let status = '';
        if (key === 'L') status = 'LEAVE';
        else if (key === 'N') status = 'NPL';
        else if (key === 'H') status = 'HOLIDAY';

        saveDayData(day, { status, in: '', out: '', ot: '', hours: '' });
        renderTimeLedgerTable();
        setTimeout(() => {
            const newInput = document.querySelector(`.status-input[data-day="${day}"]`);
            if (newInput) newInput.focus();
        }, 0);
    }
};

window.updateRowCalculations = (day) => {
    const row = document.querySelector(`input[data-day="${day}"]`).closest('tr');
    const inVal = row.querySelector('.time-in').value;
    const outVal = row.querySelector('.time-out').value;

    const startObj = window.parseTime12h(inVal, 'in');
    const endObj = window.parseTime12h(outVal, 'out');

    if (!startObj || !endObj) {
        saveDayData(day, { in: inVal, out: outVal });
        return;
    }

    if (window.calculateWorkHours) {
        const result = window.calculateWorkHours(inVal, outVal);
        saveDayData(day, { in: startObj.formatted, out: endObj.formatted, hours: result.hours, ot: result.ot, status: '' });

        const worked = Number(result.hours) - Number(result.ot || 0);
        row.querySelector('.ot-cell').innerText = result.ot > 0 ? result.ot + ' hrs' : '-';
        row.querySelector('.total-hrs-cell').innerText = result.hours + ' hrs';
        row.querySelector('.status-input').value = worked >= 8 ? '1' : worked.toFixed(1) + ' hrs';
    } else {
        saveDayData(day, { in: inVal, out: outVal });
    }
};

// --- EVENTS: PIECE WORK ---

window.addPcsRow = () => {
    const lId = getLedgerId();
    if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {}, pcsEntries: [] };
    state.staffLedgers[lId].pcsEntries.push({ item: '', style: '', fabric: '', quantity: '', rate: '', total: 0 });

    localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
    if (window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);

    renderPcsLedgerTable();

    // Auto-scroll to bottom and focus
    setTimeout(() => {
        const tableContainer = document.querySelector('.ledger-scroll-container');
        if (tableContainer) tableContainer.scrollTop = tableContainer.scrollHeight;

        const rows = document.querySelectorAll('#ledger-table-body tr');
        rows[rows.length - 1]?.querySelector('input').focus();
    }, 50);
};

window.updatePcsRow = (input) => {
    const index = input.dataset.index;
    const row = input.closest('tr');
    const item = row.querySelector('.pcs-item').value;
    const style = row.querySelector('.pcs-style').value;
    const fabric = row.querySelector('.pcs-fabric').value;
    const quantity = parseFloat(row.querySelector('.pcs-qty').value) || 0;
    const rate = parseFloat(row.querySelector('.pcs-rate').value) || 0; // <--- Fix: Keeps 2.5 as 2.5
    const total = quantity * rate;

    row.querySelector('.pcs-total').innerText = total;

    const lId = getLedgerId();
    state.staffLedgers[lId].pcsEntries[index] = { item, style, fabric, quantity, rate, total };

    let sum = 0;
    state.staffLedgers[lId].pcsEntries.forEach(r => sum += Number(r.total || 0));
    document.getElementById('ledger-salary').value = sum;
    state.staffLedgers[lId].salary = sum;

    localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
    if (window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);
};

window.handlePcsEnter = (e, input) => {
    if (e.key === 'Enter') {
        const index = parseInt(input.dataset.index);
        const lId = getLedgerId();
        if (index === state.staffLedgers[lId].pcsEntries.length - 1) {
            addPcsRow();
        } else {
            const allInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([disabled])'));
            const idx = allInputs.indexOf(input);
            if (idx > -1 && idx < allInputs.length - 1) allInputs[idx + 1].focus();
        }
    }
};

window.deletePcsRow = (index) => {
    const lId = getLedgerId();
    state.staffLedgers[lId].pcsEntries.splice(index, 1);

    localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
    if (window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);

    renderPcsLedgerTable();
};

window.quickSave = (input) => {
    const day = input.dataset.day;
    const lId = getLedgerId();
    if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {} };
    if (!state.staffLedgers[lId].days[day]) state.staffLedgers[lId].days[day] = {};

    if (input.classList.contains('time-in')) state.staffLedgers[lId].days[day].in = input.value;
    if (input.classList.contains('time-out')) state.staffLedgers[lId].days[day].out = input.value;

    localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
};

// --- HELPER: CLEANUP EMPTY ROWS ---
// Removes rows that have no Item, Style, Fabric, Qty, or Rate
window.cleanPcsLedger = (empId) => {
    const date = state.currentLedgerDate;
    if (!date) return;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const lId = `${empId}_${year}_${month}`;

    if (!state.staffLedgers[lId] || !state.staffLedgers[lId].pcsEntries) return;

    // Filter: Keep row ONLY if it has some data
    const cleanEntries = state.staffLedgers[lId].pcsEntries.filter(row => {
        const hasText = (row.item && row.item.trim().length > 0) ||
            (row.style && row.style.trim().length > 0) ||
            (row.fabric && row.fabric.trim().length > 0);
        const hasNum = (row.quantity && row.quantity > 0) || (row.rate && row.rate > 0);

        return hasText || hasNum; // Keep if it has text OR numbers
    });

    // Always ensure at least ONE row exists for data entry
    if (cleanEntries.length === 0) {
        cleanEntries.push({ item: '', style: '', fabric: '', quantity: '', rate: '', total: 0 });
    }

    state.staffLedgers[lId].pcsEntries = cleanEntries;

    // Update LocalStorage immediately
    localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
};