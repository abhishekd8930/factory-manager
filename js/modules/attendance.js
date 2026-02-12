console.log("Attendance Module Loaded");

// ==========================================
// 1. MONTHLY BOOK EDIT LOGIC
// ==========================================

let isBookEditMode = false;

window.toggleBookEditMode = () => {
    isBookEditMode = !isBookEditMode;
    const btn = document.getElementById('btn-book-edit');
    if (btn) {
        if (isBookEditMode) {
            btn.className = "w-9 h-9 rounded-lg flex items-center justify-center transition shadow-md bg-indigo-600 text-white border border-indigo-600 ring-2 ring-indigo-200";
        } else {
            btn.className = "w-9 h-9 rounded-lg flex items-center justify-center transition border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-slate-50";
        }
    }
    window.renderAttendanceBook();
};

// --- SINGLE CELL TOGGLE ---
// (Allows changing Sundays/Holidays manually)
window.toggleBookCell = (empId, day) => {
    if (!isBookEditMode) return;
    _applyStatusToDay(empId, day, 'CYCLE');
    window.renderAttendanceBook();
};

// --- FULL MONTH TOGGLE (DOUBLE CLICK NAME) ---
// Toggles between Present and Absent (skips Sundays and Holidays)
window.toggleFullMonth = (empId) => {
    if (!isBookEditMode) return;

    const monthInput = document.getElementById('attendance-month');
    const [yStr, mStr] = monthInput.value.split('-');
    const year = parseInt(yStr);
    const month = parseInt(mStr);
    const daysInMonth = new Date(year, month, 0).getDate();
    const lId = `${empId}_${year}_${month}`;

    if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {} };

    // Check if currently "present" based on Day 1
    const day1Data = state.staffLedgers[lId].days[1] || {};
    const isCurrentlyPresent = day1Data.status === 'PRESENT' || !!day1Data.hours;

    // Toggle: if present → clear (absent), if absent → set present
    const targetAction = isCurrentlyPresent ? 'CLEAR' : 'SET_PRESENT';

    // Apply to all days EXCEPT Sundays and Existing Holidays
    for (let i = 1; i <= daysInMonth; i++) {
        const dateObj = new Date(year, month - 1, i);
        const isSunday = dateObj.getDay() === 0;
        const dayData = state.staffLedgers[lId].days[i] || {};
        const isHoliday = dayData.status === 'HOLIDAY';

        if (isSunday || isHoliday) continue;

        _applyStatusToDay(empId, i, targetAction);
    }

    window.renderAttendanceBook();
};

// --- HELPER: APPLY STATUS LOGIC ---
function _applyStatusToDay(empId, day, action) {
    const monthInput = document.getElementById('attendance-month');
    const [yStr, mStr] = monthInput.value.split('-');
    const year = parseInt(yStr);
    const month = parseInt(mStr);

    const lId = `${empId}_${year}_${month}`;
    if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {} };

    const currentData = state.staffLedgers[lId].days[day] || {};
    const emp = state.staffData.find(e => e.id === empId);
    const isTimeBased = emp && emp.type === 'timings';

    let reqStatus = '';

    if (action === 'CYCLE') {
        let currentStatus = currentData.status || '';
        if (!currentStatus && currentData.hours) currentStatus = 'PRESENT';

        if (!currentStatus) reqStatus = 'PRESENT';
        else if (currentStatus === 'PRESENT') reqStatus = 'NPL';
        else if (currentStatus === 'NPL') reqStatus = 'LEAVE';
        else reqStatus = 'CLEAR';
    } else {
        reqStatus = action.replace('SET_', '');
    }

    // Apply Logic
    currentData.in = ''; currentData.out = ''; currentData.hours = ''; currentData.ot = ''; currentData.status = '';

    if (reqStatus === 'PRESENT') {
        if (isTimeBased) {
            currentData.in = '09:30 AM';
            currentData.out = '06:00 PM';
            currentData.hours = '8.0';
        } else {
            currentData.status = 'PRESENT';
        }
    } else if (reqStatus !== 'CLEAR') {
        currentData.status = reqStatus;
    }

    state.staffLedgers[lId].days[day] = currentData;
    localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
}

// ==========================================
// 2. RENDER MONTHLY BOOK
// ==========================================

window.renderAttendanceBook = () => {
    try {
        const monthInput = document.getElementById('attendance-month');
        if (!monthInput) return;

        // Set Default Month if empty
        if (!monthInput.value) {
            monthInput.value = new Date().toISOString().slice(0, 7);
        }

        if (!monthInput.value) return;

        const [yStr, mStr] = monthInput.value.split('-');
        const year = parseInt(yStr), month = parseInt(mStr);
        const daysInMonth = new Date(year, month, 0).getDate();

        const sortedStaff = [...state.staffData].sort((a, b) => a.name.localeCompare(b.name));
        const timingStaff = sortedStaff.filter(e => e.type !== 'pcs');
        const pcsStaff = sortedStaff.filter(e => e.type === 'pcs');

        // --- BUTTON INJECTION ---
        const controls = document.getElementById('att-monthly-controls');
        if (!controls.classList.contains('flex')) controls.classList.add('flex', 'items-center', 'gap-2');

        if (!document.getElementById('btn-book-edit')) {
            const btn = document.createElement('button');
            btn.id = 'btn-book-edit';
            btn.title = "Enable Quick Edit Mode";
            btn.className = "w-9 h-9 rounded-lg flex items-center justify-center transition border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-slate-50";
            btn.innerHTML = `<i class="fa-solid fa-pen"></i>`;
            btn.onclick = window.toggleBookEditMode;
            controls.prepend(btn);
        }

        const thead = document.getElementById('att-book-head');
        let hHTML = `<tr><th class="p-3 border-b border-r bg-slate-50 border-slate-200 w-40 sticky-col-left z-30">Employee</th>`;
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month - 1, i);
            const isSun = d.getDay() === 0;
            hHTML += `<th class="p-2 border-b border-r border-slate-200 text-center w-10 ${isSun ? 'text-red-500 bg-red-50' : ''}">${i}</th>`;
        }
        hHTML += `<th class="p-3 border-b border-l bg-slate-50 border-slate-200 w-16 text-center font-bold text-slate-700">Total</th></tr>`;
        thead.innerHTML = hHTML;

        const tbody = document.getElementById('att-book-body');
        tbody.innerHTML = '';

        const renderBookRows = (staffList, title, headerClass) => {
            if (staffList.length === 0) return;
            let sepRow = `<tr><td class="p-2 bg-slate-100 ${headerClass} text-xs uppercase sticky-col-left border-b border-slate-200 font-bold">${title}</td>`;
            sepRow += `<td colspan="${daysInMonth + 1}" class="bg-slate-50 border-b border-slate-200"></td></tr>`;
            tbody.innerHTML += sepRow;

            staffList.forEach(emp => {
                const lId = `${emp.id}_${year}_${month}`;
                const ledger = state.staffLedgers[lId] || { days: {} };
                let presentCount = 0;

                // --- NAME CELL LOGIC ---
                let nameAction = '';
                let nameClass = 'bg-white';
                if (isBookEditMode) {
                    nameClass = 'bg-indigo-50/30 cursor-pointer hover:bg-indigo-100 transition select-none';
                    nameAction = `ondblclick="toggleFullMonth('${emp.id}')" title="Double-click to fill Full Month"`;
                }

                let row = `<tr><td class="p-3 border-b border-r border-slate-200 font-bold text-slate-700 sticky-col-left ${nameClass}" ${nameAction}>${emp.name}</td>`;
                // -----------------------

                for (let i = 1; i <= daysInMonth; i++) {
                    const dayData = ledger.days[i] || {};
                    let cellContent = '', cellClass = '';
                    const d = new Date(year, month - 1, i);
                    const isSun = d.getDay() === 0;

                    let titleAttr = '';
                    if (dayData.holidayTitle) titleAttr = `title="${dayData.holidayTitle}"`;

                    if (dayData.status === 'HOLIDAY') { cellContent = 'H'; cellClass = 'bg-purple-100 text-purple-700 font-bold cursor-help'; }
                    else if (dayData.status === 'LEAVE') { cellContent = 'L'; cellClass = 'bg-orange-100 text-orange-700 font-bold'; }
                    else if (dayData.status === 'NPL' || dayData.status === 'ABSENT') { cellContent = 'A'; cellClass = 'bg-red-50 text-red-700 font-bold text-[10px]'; }
                    else if (dayData.hours || dayData.status === 'PRESENT') { cellContent = 'P'; cellClass = 'bg-emerald-50 text-emerald-700 font-bold'; presentCount++; }
                    else if (isSun) { cellContent = 'S'; cellClass = 'text-red-300'; }

                    let clickAction = '';
                    let cursorClass = 'cursor-default';

                    if (isBookEditMode) {
                        cursorClass = 'cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:z-10 relative';
                        clickAction = `onclick="toggleBookCell('${emp.id}', ${i})"`;
                    }

                    row += `<td class="p-2 border-b border-r border-slate-100 text-center text-xs att-cell ${cellClass} ${cursorClass} select-none" ${titleAttr} ${clickAction}>${cellContent}</td>`;
                }
                row += `<td class="p-2 border-b border-l border-slate-200 text-center font-bold text-indigo-600">${presentCount}</td></tr>`;
                tbody.innerHTML += row;
            });
        };
        renderBookRows(timingStaff, 'Time Based Staff', 'text-slate-500');
        renderBookRows(pcsStaff, 'Piece Work Staff', 'text-emerald-600');
    } catch (e) { console.error(e); }
};

// ==========================================
// 3. PRESERVED DAILY LOGIC
// ==========================================

window.renderAttendanceView = () => {
    const dateInput = document.getElementById('attendance-date');
    const tbody = document.getElementById('attendance-body');
    const mobileBody = document.getElementById('attendance-body-mobile');
    const emptyState = document.getElementById('attendance-empty-state');

    if (!dateInput || !tbody || !emptyState) return;

    // Set Default Date if empty
    if (!dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    tbody.innerHTML = '';
    if (mobileBody) mobileBody.innerHTML = '';

    // Show correct table for screen size
    const desktopTable = document.getElementById('att-desktop-table');
    const mobileTable = document.getElementById('att-mobile-table');
    const isMobile = window.innerWidth < 768;
    if (desktopTable) desktopTable.style.display = isMobile ? 'none' : 'block';
    if (mobileTable) mobileTable.style.display = isMobile ? 'block' : 'none';

    if (!state.staffData) return;

    const sortedStaff = [...state.staffData].sort((a, b) => a.name.localeCompare(b.name));
    const timingStaff = sortedStaff.filter(e => e.type !== 'pcs');
    const pcsStaff = sortedStaff.filter(e => e.type === 'pcs');

    if (timingStaff.length === 0 && pcsStaff.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    const selDate = new Date(dateInput.value);
    if (isNaN(selDate.getTime())) return;

    const day = selDate.getDate();
    const month = selDate.getMonth() + 1;
    const year = selDate.getFullYear();

    // RENDER TIME BASED STAFF
    if (timingStaff.length > 0) {
        tbody.innerHTML += `
            <tr class="bg-slate-100">
                <td colspan="5" class="p-2 pl-4">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-slate-500 text-xs uppercase tracking-wider">Time Based Staff</span>
                        <button onclick="setDefaultsForTimeStaff()" class="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1 rounded-lg border border-indigo-200 transition shadow-sm flex items-center gap-2">
                            <i class="fa-solid fa-clock-rotate-left"></i> Auto-Fill (History)
                        </button>
                    </div>
                </td>
            </tr>`;

        // Mobile section header
        if (mobileBody) {
            mobileBody.innerHTML += `
            <tr class="bg-slate-100">
                <td colspan="4" class="px-3 py-2">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Time Based</span>
                        <button onclick="setDefaultsForTimeStaff()" class="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-200"><i class="fa-solid fa-clock-rotate-left mr-1"></i>Auto-Fill</button>
                    </div>
                </td>
            </tr>`;
        }

        timingStaff.forEach(emp => {
            const lId = `${emp.id}_${year}_${month}`;
            const ledger = state.staffLedgers[lId] || { days: {} };
            const dayData = ledger.days[day] || {};
            const inVal = dayData.in || '';
            const outVal = dayData.out || '';
            const hrs = dayData.hours ? dayData.hours + 'h' : '-';
            const status = dayData.status || '';
            const sel = (val) => status === val ? 'selected' : '';

            const isDisabled = ['LEAVE', 'NPL', 'HOLIDAY'].includes(status);
            const disabledClass = isDisabled ? "bg-slate-100 text-slate-300" : "bg-slate-50 text-slate-700";

            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 border-b border-slate-100">
                    <td class="p-4 font-bold text-slate-700">${emp.name}<br><span class="text-[10px] text-slate-400 font-normal uppercase">${emp.role || 'Staff'}</span></td>
                    
                    <td class="p-4">
                        <select onchange="updateDailyStatus('${emp.id}', this.value)" class="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-bold outline-none focus:border-indigo-500 w-full cursor-pointer">
                            <option value="" ${sel('')}>-- Active (Time) --</option>
                            <option value="LEAVE" class="text-orange-500" ${sel('LEAVE')}>Leave</option>
                            <option value="NPL" class="text-red-700" ${sel('NPL')}>No Pay Leave</option>
                            <option value="HOLIDAY" class="text-purple-600" ${sel('HOLIDAY')}>Holiday</option>
                        </select>
                    </td>

                    <td class="p-4 text-center"><input type="text" class="${disabledClass} border border-slate-200 rounded px-2 py-1 w-24 text-center text-sm outline-none focus:border-indigo-500" placeholder="09:30 AM" value="${inVal}" onchange="updateDailyTime('${emp.id}', 'in', this.value)" ${isDisabled ? 'disabled' : ''}></td>
                    <td class="p-4 text-center"><input type="text" class="${disabledClass} border border-slate-200 rounded px-2 py-1 w-24 text-center text-sm outline-none focus:border-indigo-500" placeholder="07:00 PM" value="${outVal}" onchange="updateDailyTime('${emp.id}', 'out', this.value)" ${isDisabled ? 'disabled' : ''}></td>
                    <td class="p-4 text-center font-bold text-indigo-600"><span data-emp-hours="${emp.id}">${hrs}</span></td>
                </tr>`;

            // Mobile row
            if (mobileBody) {
                const statusLetterMap = { '': 'A', 'LEAVE': 'L', 'NPL': 'N', 'HOLIDAY': 'H', 'PAID_LEAVE': 'PL' };
                const statusColorMap = { '': 'bg-emerald-100 text-emerald-700', 'LEAVE': 'bg-orange-100 text-orange-600', 'NPL': 'bg-red-100 text-red-600', 'HOLIDAY': 'bg-purple-100 text-purple-600', 'PAID_LEAVE': 'bg-blue-100 text-blue-600' };
                const sLetter = statusLetterMap[status] || 'A';
                const sColor = statusColorMap[status] || statusColorMap[''];

                mobileBody.innerHTML += `
                <tr class="border-b border-slate-50">
                    <td class="px-3 py-2">
                        <div class="font-bold text-slate-700 text-xs truncate max-w-[100px]">${emp.name}</div>
                        <div class="text-[9px] text-slate-400">${emp.role || 'Staff'}</div>
                    </td>
                    <td class="px-2 py-2 text-center">
                        <button onclick="cycleAttStatus('${emp.id}','timings')" class="w-7 h-7 rounded-md ${sColor} font-black text-[10px] transition active:scale-90" title="Tap to change">${sLetter}</button>
                    </td>
                    <td class="px-1 py-2 text-center">
                        <input type="text" class="${isDisabled ? 'bg-slate-100 text-slate-300' : 'bg-slate-50 text-slate-700'} border border-slate-200 rounded w-[60px] px-1 py-1 text-[10px] text-center outline-none focus:border-indigo-400" placeholder="9:30A" value="${inVal}" onchange="updateDailyTime('${emp.id}','in',this.value)" ${isDisabled ? 'disabled' : ''}>
                    </td>
                    <td class="px-1 py-2 text-center">
                        <input type="text" class="${isDisabled ? 'bg-slate-100 text-slate-300' : 'bg-slate-50 text-slate-700'} border border-slate-200 rounded w-[60px] px-1 py-1 text-[10px] text-center outline-none focus:border-indigo-400" placeholder="7:00P" value="${outVal}" onchange="updateDailyTime('${emp.id}','out',this.value)" ${isDisabled ? 'disabled' : ''}>
                    </td>
                </tr>`;
            }
        });
    }

    // RENDER PIECE WORK STAFF
    if (pcsStaff.length > 0) {
        tbody.innerHTML += `
            <tr class="bg-slate-100">
                <td colspan="5" class="p-2 pl-4">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-emerald-600 text-xs uppercase tracking-wider">Piece Work Staff</span>
                        <button onclick="markAllPcsPresent()" class="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-200 transition shadow-sm flex items-center gap-2">
                            <i class="fa-solid fa-check-double"></i> All Present
                        </button>
                    </div>
                </td>
            </tr>`;

        // Mobile section header for pcs
        if (mobileBody) {
            mobileBody.innerHTML += `
            <tr class="bg-slate-100">
                <td colspan="4" class="px-3 py-2">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-emerald-600 text-[10px] uppercase tracking-wider">Piece Work</span>
                        <button onclick="markAllPcsPresent()" class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200"><i class="fa-solid fa-check-double mr-1"></i>All Present</button>
                    </div>
                </td>
            </tr>`;
        }

        pcsStaff.forEach(emp => {
            const lId = `${emp.id}_${year}_${month}`;
            const ledger = state.staffLedgers[lId] || { days: {} };
            const days = ledger.days || {};
            const dayData = days[day] || {};
            const status = dayData.status || '';
            const sel = (val) => status === val ? 'selected' : '';

            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 border-b border-slate-100">
                    <td class="p-4 font-bold text-slate-700">${emp.name}<br><span class="text-[10px] text-slate-400 font-normal uppercase">${emp.role || 'Staff'}</span></td>
                    <td class="p-4">
                        <select onchange="updateDailyStatus('${emp.id}', this.value)" data-emp="${emp.id}" class="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-bold outline-none focus:border-emerald-500 w-full cursor-pointer">
                            <option value="" ${sel('')}>-- Select --</option>
                            <option value="PRESENT" class="text-emerald-600" ${sel('PRESENT')}>Present</option>
                            <option value="LEAVE" class="text-orange-500" ${sel('LEAVE')}>Leave</option>
                            <option value="NPL" class="text-red-700" ${sel('NPL')}>No Pay Leave</option>
                            <option value="HOLIDAY" class="text-purple-600" ${sel('HOLIDAY')}>Holiday</option>
                        </select>
                    </td>
                    <td class="p-4 text-center text-slate-300">-</td>
                    <td class="p-4 text-center text-slate-300">-</td>
                    <td class="p-4 text-center text-slate-300">-</td>
                </tr>`;

            // Mobile row for pcs
            if (mobileBody) {
                const pcsLetterMap = { '': '-', 'PRESENT': 'P', 'LEAVE': 'L', 'NPL': 'N', 'HOLIDAY': 'H' };
                const pcsColorMap = { '': 'bg-slate-100 text-slate-400', 'PRESENT': 'bg-emerald-100 text-emerald-700', 'LEAVE': 'bg-orange-100 text-orange-600', 'NPL': 'bg-red-100 text-red-600', 'HOLIDAY': 'bg-purple-100 text-purple-600' };
                const pLetter = pcsLetterMap[status] || '-';
                const pColor = pcsColorMap[status] || pcsColorMap[''];

                mobileBody.innerHTML += `
                <tr class="border-b border-slate-50">
                    <td class="px-3 py-2">
                        <div class="font-bold text-slate-700 text-xs truncate max-w-[100px]">${emp.name}</div>
                        <div class="text-[9px] text-slate-400">${emp.role || 'Staff'}</div>
                    </td>
                    <td class="px-2 py-2 text-center">
                        <button onclick="cycleAttStatus('${emp.id}','pcs')" class="w-7 h-7 rounded-md ${pColor} font-black text-[10px] transition active:scale-90" title="Tap to change">${pLetter}</button>
                    </td>
                    <td class="px-1 py-2 text-center text-slate-300">-</td>
                    <td class="px-1 py-2 text-center text-slate-300">-</td>
                </tr>`;
            }
        });
    }
};

window.setDefaultsForTimeStaff = () => {
    const dateInput = document.getElementById('attendance-date');
    if (!dateInput || !dateInput.value) return alert("Please select a date first.");

    const selDate = new Date(dateInput.value);
    const targetDay = selDate.getDate();
    const targetMonth = selDate.getMonth() + 1;
    const targetYear = selDate.getFullYear();

    const timingStaff = state.staffData.filter(e => e.type !== 'pcs');
    let updateCount = 0;

    timingStaff.forEach(emp => {
        const lId = `${emp.id}_${targetYear}_${targetMonth}`;
        if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {} };

        // Skip if already filled
        const currentDayData = state.staffLedgers[lId].days[targetDay] || {};
        if (currentDayData.in || currentDayData.out) return;

        // --- SMART ANALYSIS (60 Days Lookback) ---
        const historyCounts = {};
        let maxCount = 0;
        let bestPattern = null;

        // Iterate back 60 days
        for (let i = 1; i <= 60; i++) {
            const d = new Date(selDate);
            d.setDate(selDate.getDate() - i); // Go back i days

            const checkDay = d.getDate();
            const checkMonth = d.getMonth() + 1;
            const checkYear = d.getFullYear();
            const checkLId = `${emp.id}_${checkYear}_${checkMonth}`;

            const ledger = state.staffLedgers[checkLId];
            if (ledger && ledger.days && ledger.days[checkDay]) {
                const dayData = ledger.days[checkDay];
                // Check if valid timing exists
                if (dayData.in && dayData.out && !['ABSENT', 'LEAVE', 'NPL', 'HOLIDAY'].includes(dayData.status)) {
                    const pattern = `${dayData.in.trim()}|${dayData.out.trim()}`;

                    if (!historyCounts[pattern]) historyCounts[pattern] = 0;
                    historyCounts[pattern]++;

                    if (historyCounts[pattern] > maxCount) {
                        maxCount = historyCounts[pattern];
                        bestPattern = pattern;
                    }
                }
            }
        }

        // --- DECISION ---
        // Use pattern if it appeared at least twice (checking "2-days minimum" rule)
        if (bestPattern && maxCount >= 2) {
            const [foundIn, foundOut] = bestPattern.split('|');

            currentDayData.in = foundIn;
            currentDayData.out = foundOut;
            currentDayData.status = '';

            // Calculate Hours
            if (typeof parseTime12h === 'function') {
                const startObj = parseTime12h(foundIn, 'in');
                const endObj = parseTime12h(foundOut, 'out');
                if (startObj && endObj) {
                    const totalMins = (endObj.mins - startObj.mins) - 30; // 30 mins break
                    const totalHrs = totalMins / 60;
                    let otHrs = 0;
                    if (totalHrs > 8) otHrs = totalHrs - 8;
                    currentDayData.hours = totalHrs.toFixed(1);
                    currentDayData.ot = otHrs > 0 ? otHrs.toFixed(1) : '';
                }
            }

            state.staffLedgers[lId].days[targetDay] = currentDayData;
            updateCount++;
        }
    });

    if (updateCount > 0) {
        localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
        if (window.saveToCloud) window.saveToCloud('srf_staff_ledgers', state.staffLedgers); // Auto-sync
        window.renderAttendanceView();
        console.log(`Smart Auto-filled ${updateCount} staff based on 60-day history.`);
    } else {
        alert("No consistent timing patterns found in the last 60 days.");
    }
};

window.markAllPcsPresent = () => {
    const dateInput = document.getElementById('attendance-date');
    if (!dateInput || !dateInput.value) return alert("Please select a date first.");
    if (!confirm("Mark ALL Piece Work staff as PRESENT?")) return;
    const selDate = new Date(dateInput.value);
    const day = selDate.getDate();
    const month = selDate.getMonth() + 1;
    const year = selDate.getFullYear();
    const pcsStaff = state.staffData.filter(e => e.type === 'pcs');
    pcsStaff.forEach(emp => {
        const lId = `${emp.id}_${year}_${month}`;
        if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {} };
        const currentDayData = state.staffLedgers[lId].days[day] || {};
        currentDayData.status = 'PRESENT';
        state.staffLedgers[lId].days[day] = currentDayData;
    });
    localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
    window.renderAttendanceView();
};

window.updateDailyStatus = (empId, status) => {
    try {
        const dateInput = document.getElementById('attendance-date');
        if (!dateInput || !dateInput.value) return;
        const selDate = new Date(dateInput.value);
        const day = selDate.getDate();
        const month = selDate.getMonth() + 1;
        const year = selDate.getFullYear();
        const lId = `${empId}_${year}_${month}`;
        if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {} };
        const currentDayData = state.staffLedgers[lId].days[day] || {};
        currentDayData.status = status;
        if (['LEAVE', 'NPL', 'HOLIDAY'].includes(status)) { currentDayData.in = ''; currentDayData.out = ''; currentDayData.hours = ''; currentDayData.ot = ''; }
        state.staffLedgers[lId].days[day] = currentDayData;
        localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
        if (window.saveToCloud) window.saveToCloud('srf_staff_ledgers', state.staffLedgers);
        window.renderAttendanceView();
    } catch (e) { console.error(e); }
};

// Mobile: tap to cycle status
window.cycleAttStatus = (empId, type) => {
    const dateInput = document.getElementById('attendance-date');
    if (!dateInput || !dateInput.value) return;
    const selDate = new Date(dateInput.value);
    const day = selDate.getDate();
    const month = selDate.getMonth() + 1;
    const year = selDate.getFullYear();
    const lId = `${empId}_${year}_${month}`;

    if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {} };
    if (!state.staffLedgers[lId].days) state.staffLedgers[lId].days = {};
    const currentDayData = state.staffLedgers[lId].days[day] || {};
    const current = currentDayData.status || '';

    let cycle;
    if (type === 'timings') {
        cycle = ['', 'LEAVE', 'NPL', 'HOLIDAY'];
    } else {
        cycle = ['', 'PRESENT', 'LEAVE', 'NPL', 'HOLIDAY'];
    }

    const idx = cycle.indexOf(current);
    const next = cycle[(idx + 1) % cycle.length];

    updateDailyStatus(empId, next);
};

window.updateDailyTime = (empId, type, val) => {
    try {
        const dateInput = document.getElementById('attendance-date');
        if (!dateInput || !dateInput.value) return;
        const selDate = new Date(dateInput.value);
        const day = selDate.getDate();
        const month = selDate.getMonth() + 1;
        const year = selDate.getFullYear();
        const lId = `${empId}_${year}_${month}`;
        if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {} };
        const dayData = state.staffLedgers[lId].days[day] || {};
        let formattedVal = val;
        if (val && typeof parseTime12h === 'function') {
            const parsed = parseTime12h(val, type);
            if (parsed) {
                formattedVal = parsed.formatted;
                const inputs = document.querySelectorAll('input[onchange*="' + empId + '"]');
                inputs.forEach(inp => { if (inp.getAttribute('onchange').includes(`'${type}'`)) { inp.value = formattedVal; } });
            }
        }
        dayData[type] = formattedVal;
        if (val && ['LEAVE', 'NPL'].includes(dayData.status)) { dayData.status = ''; }
        if (dayData.in && dayData.out) {
            if (typeof parseTime12h === 'function') {
                const startObj = parseTime12h(dayData.in, 'in');
                const endObj = parseTime12h(dayData.out, 'out');
                if (startObj && endObj) {
                    const totalMins = (endObj.mins - startObj.mins) - 30;
                    const totalHrs = totalMins / 60;
                    let otHrs = 0;
                    if (totalHrs > 8) otHrs = totalHrs - 8;
                    dayData.hours = totalHrs.toFixed(1);
                    dayData.ot = otHrs > 0 ? otHrs.toFixed(1) : '';
                }
            }
        }
        state.staffLedgers[lId].days[day] = dayData;
        localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
        const hoursCell = document.querySelector(`span[data-emp-hours="${empId}"]`);
        if (hoursCell) hoursCell.innerText = (dayData.hours || '-') + (dayData.hours ? 'h' : '');
    } catch (e) { console.error(e); }
};

window.switchAttView = (view) => {
    const btnDaily = document.getElementById('btn-att-daily');
    const btnMonthly = document.getElementById('btn-att-monthly');
    const viewDaily = document.getElementById('att-daily-view');
    const viewMonthly = document.getElementById('att-monthly-view');
    const ctrlDaily = document.getElementById('att-daily-controls');
    const ctrlMonthly = document.getElementById('att-monthly-controls');

    if (view === 'daily') {
        btnDaily.className = "px-4 py-1.5 rounded-md text-sm font-bold shadow-sm bg-white text-indigo-600 transition";
        btnMonthly.className = "px-4 py-1.5 rounded-md text-sm font-bold text-slate-500 hover:text-slate-700 transition";
        viewDaily.classList.remove('hidden');
        viewMonthly.classList.add('hidden');
        ctrlDaily.classList.remove('hidden');
        ctrlMonthly.classList.add('hidden');
        window.renderAttendanceView();

        // Reset Edit Mode when leaving view
        isBookEditMode = false;
    } else {
        btnMonthly.className = "px-4 py-1.5 rounded-md text-sm font-bold shadow-sm bg-white text-indigo-600 transition";
        btnDaily.className = "px-4 py-1.5 rounded-md text-sm font-bold text-slate-500 hover:text-slate-700 transition";
        viewMonthly.classList.remove('hidden');
        viewDaily.classList.add('hidden');
        ctrlMonthly.classList.remove('hidden');
        ctrlDaily.classList.add('hidden');
        window.renderAttendanceBook();
    }
};