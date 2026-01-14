console.log("Staff Finance Module Loaded");

// ==========================================
// 1. ADVANCE MODAL LOGIC
// ==========================================

window.openAdvanceModal = () => {
    const lId = getLedgerId();
    if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {}, advance: '', advanceLog: [] };
    if (!state.staffLedgers[lId].advanceLog) state.staffLedgers[lId].advanceLog = [];

    const date = state.currentLedgerDate;
    const modalTitle = document.getElementById('adv-modal-month');
    if(modalTitle) modalTitle.innerText = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    document.getElementById('adv-new-date').value = state.today;
    
    renderAdvanceLog();
    document.getElementById('advance-modal').classList.remove('hidden');
};

window.closeAdvanceModal = () => document.getElementById('advance-modal').classList.add('hidden');

window.renderAdvanceLog = () => {
    const lId = getLedgerId();
    const logs = state.staffLedgers[lId]?.advanceLog || [];
    const tbody = document.getElementById('advance-list-body');
    const emptyMsg = document.getElementById('adv-empty-msg');
    
    if(!tbody) return;
    tbody.innerHTML = '';
    let total = 0;

    if(logs.length === 0) {
        if(emptyMsg) emptyMsg.classList.remove('hidden');
    } else {
        if(emptyMsg) emptyMsg.classList.add('hidden');
        logs.forEach((log, index) => {
            total += Number(log.amount);
            tbody.innerHTML += `
                <tr class="border-b border-slate-50 hover:bg-slate-50">
                    <td class="p-3 text-slate-600">${log.date}</td>
                    <td class="p-3 font-bold text-slate-700">${log.note || '-'}</td>
                    <td class="p-3 text-right font-bold text-red-500">₹${log.amount}</td>
                    <td class="p-3 text-center"><button onclick="deleteAdvanceEntry(${index})" class="text-slate-300 hover:text-red-500 transition"><i class="fa-solid fa-trash"></i></button></td>
                </tr>`;
        });
    }

    const totalEl = document.getElementById('adv-modal-total');
    const inputEl = document.getElementById('ledger-advance');
    
    if(totalEl) totalEl.innerText = `₹ ${total}`;
    if(inputEl) inputEl.value = total;
    
    if(state.staffLedgers[lId]) {
        state.staffLedgers[lId].advance = total; 
        
        // Save
        localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
        if(window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);
    }
};

window.addAdvanceEntry = () => {
    const lId = getLedgerId();
    const date = document.getElementById('adv-new-date').value;
    const amount = document.getElementById('adv-new-amount').value;
    const note = document.getElementById('adv-new-note').value;

    if(!amount || amount <= 0) return alert("Please enter a valid amount");

    if(!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {}, advance: 0, advanceLog: [] };
    if(!state.staffLedgers[lId].advanceLog) state.staffLedgers[lId].advanceLog = [];

    state.staffLedgers[lId].advanceLog.push({ id: Date.now(), date: date || state.today, amount: Number(amount), note: note });
    
    document.getElementById('adv-new-amount').value = '';
    document.getElementById('adv-new-note').value = '';
    document.getElementById('adv-new-amount').focus();
    renderAdvanceLog();
};

window.deleteAdvanceEntry = (index) => {
    const lId = getLedgerId();
    if(state.staffLedgers[lId]?.advanceLog) {
        state.staffLedgers[lId].advanceLog.splice(index, 1);
        renderAdvanceLog();
    }
};

window.saveFinancials = () => {
    const lId = getLedgerId();
    if(!state.staffLedgers[lId]) return;
    const salInput = document.getElementById('ledger-salary');
    if(!salInput.readOnly) state.staffLedgers[lId].salary = salInput.value;
    state.staffLedgers[lId].advance = document.getElementById('ledger-advance').value;
    
    // Save
    localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
    if(window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);
};


// ==========================================
// 2. SALARY SLIP
// ==========================================

// REPLACE THE ENTIRE window.calculateSalary FUNCTION WITH THIS:

// js/modules/staff/finance.js

// js/modules/staff/finance.js

window.calculateSalary = () => {
    // START ADDED CODE
    if (!state.currentLedgerEmp) {
        console.warn("No employee selected for salary calculation.");
        return;
    }
    // END ADDED CODE
    const ledgerId = getLedgerId();
    const advInput = document.getElementById('ledger-advance');
    
    // 1. Save Advance if changed
    if (advInput) {
        if (!state.staffLedgers[ledgerId]) state.staffLedgers[ledgerId] = {};
        state.staffLedgers[ledgerId].advance = advInput.value;
        localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
        if(window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);
    }

    const ledgerData = state.staffLedgers[ledgerId] || {};
    const emp = state.currentLedgerEmp;
    const basicMonthlySalary = Number(ledgerData.salary) || 0;
    const advance = Number(ledgerData.advance) || 0;
    
    if(!ledgerData || (!basicMonthlySalary && (!ledgerData.pcsEntries || ledgerData.pcsEntries.length === 0))) { 
        alert("No earnings found. Cannot generate slip."); return; 
    }
    
    const modal = document.getElementById('salary-modal');
    modal.className = "fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-200";
    
    let html = '';
    const dateLabel = document.getElementById('ledger-month-label').innerText;
    const RATES = (window.CONFIG && window.CONFIG.RATES) ? window.CONFIG.RATES : { OT_PER_HOUR: 45, NPL_FINE: 500, ATTENDANCE_BONUS: 600 };
    const OWNER = (window.CONFIG && window.CONFIG.OWNER_NAME) ? window.CONFIG.OWNER_NAME : "Factory Manager";

    // ==========================================
    // 1. TIME-BASED STAFF LOGIC (UNCHANGED)
    // ==========================================
    if (emp.type === 'timings') {
        const date = state.currentLedgerDate; 
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        
        const dailyWage = basicMonthlySalary / daysInMonth; 
        const hourlyWage = dailyWage / 8;

        let fullDays = 0, partialHours = 0, totalOTHours = 0, nplCount = 0, leaveCount = 0, absentDays = 0, unpaidSundays = 0, halfPaidSundays = 0, actualWorkDays = 0, totalSundaysInMonth = 0;
        const dayMap = ledgerData.days || {};

        // Inside js/modules/staff/finance.js

    for(let i = 1; i <= daysInMonth; i++) {
        const dayData = dayMap[i] || {}; 
        const currentDateObj = new Date(date.getFullYear(), date.getMonth(), i);
        const isSunday = currentDateObj.getDay() === 0 || dayData.status === 'SUNDAY'; 
        const isHoliday = dayData.status === 'HOLIDAY';
        
        // 1. CHECK FOR PAID LEAVE
        const isPaidLeave = dayData.status === 'PAID_LEAVE';

        if (isSunday) totalSundaysInMonth++; 

        // 2. HOLIDAY OR PAID LEAVE (Full Pay + OT if they worked)
        if (isHoliday || isPaidLeave) { 
            fullDays++; 
            // Safety: If they physically worked on a Holiday/Paid Leave, add it to OT
            if (dayData.hours) totalOTHours += Number(dayData.hours);
        } 
        // 3. SUNDAY (Base Pay + Full OT if they worked)
        else if (isSunday) {
            // --- YOUR COMPLEX SUNDAY LOOKBACK LOGIC (PRESERVED) ---
            let weekTotalHours = 0, weekWorkDays = 0, hasAnyStatus = false;
            for (let back = 1; back <= 6; back++) {
                const checkDate = i - back;
                if (checkDate < 1) break;
                const prevDayData = dayMap[checkDate];
                if (prevDayData) {
                    if (prevDayData.hours) { weekTotalHours += parseFloat(prevDayData.hours); weekWorkDays++; }
                    if (prevDayData.status || prevDayData.hours || prevDayData.in) { hasAnyStatus = true; }
                }
            }
            // Base Pay Calculation
            if (!hasAnyStatus && i !== 1) { unpaidSundays++; } 
            else if (i === 1 && !dayMap[1]?.hours && !dayMap[2]?.hours) { fullDays++; }
            else {
                const avgHours = weekWorkDays > 0 ? (weekTotalHours / weekWorkDays) : 0;
                if (avgHours > 0 && avgHours < 5) { fullDays += 0.5; halfPaidSundays++; } else { fullDays++; }
            }
            
            // OT Calculation: Any work on Sunday is Pure OT
            if (dayData.hours) { 
                totalOTHours += Number(dayData.hours) || 0; 
                actualWorkDays++; 
            }
        } 
        // 4. NORMAL DAYS
        else {
            if (dayData.status === 'NPL') { nplCount++; absentDays++; } 
            else if (dayData.status === 'LEAVE') { leaveCount++; absentDays++; actualWorkDays++; } 
            else if (dayData.hours) { 
                const totalH = Number(dayData.hours) || 0; 
                const otH = Number(dayData.ot) || 0; 
                
                totalOTHours += otH; 
                
                const normalWork = totalH - otH; 
                if (normalWork >= 8) fullDays++; else partialHours += normalWork; 
                
                actualWorkDays++;
            } else { 
                if (!dayData.in && !dayData.out && !dayData.status && currentDateObj <= new Date()) absentDays++; 
            }
        }
    }
        
        if (actualWorkDays === 0) { fullDays = 0; unpaidSundays = totalSundaysInMonth; halfPaidSundays = 0; }

        const incentive = (absentDays === 0 && nplCount === 0 && leaveCount === 0 && unpaidSundays === 0 && actualWorkDays > 0) ? RATES.ATTENDANCE_BONUS : 0;
        const totalBasic = (fullDays * dailyWage) + (partialHours * hourlyWage);
        const otPay = totalOTHours * RATES.OT_PER_HOUR; 
        const nplFine = nplCount * RATES.NPL_FINE;
        let gross = totalBasic + otPay + incentive; 
        let net = gross - nplFine - advance;
        if (net < 0) net = 0;

        let sundayStatusStr = '';
        if (unpaidSundays > 0) sundayStatusStr += `<span class="text-red-500">${unpaidSundays} Unpaid</span> `;
        if (halfPaidSundays > 0) sundayStatusStr += `<span class="text-yellow-600">${halfPaidSundays} Half-Pay</span>`;
        if (sundayStatusStr === '') sundayStatusStr = '<span class="text-emerald-600">All Paid</span>';

        html = `
        <div class="bg-white p-6 max-w-md mx-auto text-slate-800 font-sans">
            
            <div class="w-full flex justify-end mb-4 no-print">
                <button onclick="window.print()" class="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition flex items-center gap-2">
                    <i class="fa-solid fa-print"></i> Print Slip
                </button>
            </div>

            <div class="text-center border-b-2 border-slate-800 pb-4 mb-4">
                <h2 class="text-2xl font-bold uppercase tracking-widest">Salary Slip</h2>
                <p class="text-slate-500 text-sm font-bold mt-1">${OWNER}</p>
            </div>

    <div class="flex justify-between items-end mb-6 text-sm">
                <div><p class="text-slate-400 text-xs uppercase font-bold">Employee Name</p><p class="text-xl font-bold text-slate-900">${emp.name}</p><p class="text-slate-500">${emp.role}</p></div>
                <div class="text-right"><p class="text-slate-400 text-xs uppercase font-bold">Pay Period</p><p class="font-bold text-slate-700">${dateLabel}</p></div>
            </div>
            <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-6 text-sm">
                <h4 class="font-bold text-slate-400 text-xs uppercase mb-3">Attendance Details</h4>
                <div class="grid grid-cols-2 gap-y-2">
                    <div class="flex justify-between border-r border-slate-200 pr-4"><span>Paid Days</span> <span class="font-bold text-xl text-indigo-700">${fullDays.toFixed(1)}</span></div>
                    <div class="flex justify-between pl-4"><span>OT Hours</span> <span class="font-bold text-indigo-600">${totalOTHours.toFixed(1)}</span></div>
                    <div class="flex justify-between border-r border-slate-200 pr-4"><span>Partial Hrs</span> <span class="font-bold">${partialHours.toFixed(1)}</span></div>
                    <div class="flex justify-between pl-4"><span>Sundays</span> <span class="font-bold text-xs">${sundayStatusStr}</span></div>
                </div>
            </div>
            <table class="w-full text-sm mb-6">
                <tr class="border-b border-slate-100"><td class="py-2 text-slate-600">Basic Salary (Earned)</td><td class="py-2 text-right font-bold text-slate-800">₹ ${totalBasic.toFixed(0)}</td></tr>
                <tr class="border-b border-slate-100"><td class="py-2 text-slate-600">Overtime Pay</td><td class="py-2 text-right font-bold text-emerald-600">+ ₹ ${otPay.toFixed(0)}</td></tr>
                <tr class="border-b border-slate-100"><td class="py-2 text-slate-600">Attendance Bonus</td><td class="py-2 text-right font-bold text-emerald-600">+ ₹ ${incentive}</td></tr>
                <tr class="border-b border-slate-100"><td class="py-2 text-red-500">Less: NPL Fines</td><td class="py-2 text-right font-bold text-red-500">- ₹ ${nplFine}</td></tr>
                <tr class="border-b border-slate-800"><td class="py-2 text-red-500">Less: Advance Taken</td><td class="py-2 text-right font-bold text-red-500">- ₹ ${advance}</td></tr>
                <tr class="text-lg"><td class="py-3 font-bold text-slate-900">Net Payable</td><td class="py-3 text-right font-bold text-indigo-700 text-2xl">₹ ${net.toFixed(0)}</td></tr>
            </table>
            <div class="mt-8 pt-8 border-t border-dashed border-slate-300 text-center"><p class="text-xs text-slate-400 uppercase font-bold">Authorized Signature</p></div>
        </div>`;
    

    } else {
        
        // ==========================================
        // 2. PIECE WORK LOGIC (CONSOLIDATED & PRINT READY)
        // ==========================================
        
        // Step A: Consolidate Duplicates (The "View Bill" Logic)
        const consolidatedData = {};
        
        (ledgerData.pcsEntries || []).forEach(entry => {
            // Clean up the name (remove extra spaces, ignore case)
            const rawName = entry.item || 'Unknown Item';
            const cleanName = rawName.toLowerCase().trim();
            const rate = Number(entry.rate) || 0;
            
            // Create a unique key based on Item Name + Rate
            // Example: "shirt_50"
            const key = `${cleanName}_${rate}`;
            
            if (!consolidatedData[key]) {
                consolidatedData[key] = {
                    displayName: rawName, // We use the first name we find for display
                    rate: rate,
                    quantity: 0,
                    total: 0
                };
            }
            
            // Add to the existing pile instead of creating a new row
            const qty = Number(entry.quantity) || 0;
            consolidatedData[key].quantity += qty;
            consolidatedData[key].total += (qty * rate);
        });

        // Step B: Calculate Financials
        const totalPieceEarnings = Object.values(consolidatedData).reduce((sum, item) => sum + item.total, 0);
        const net = totalPieceEarnings - advance;
        const finalNet = net < 0 ? 0 : net;

        // Step C: Generate Table Rows
        let rowsHtml = '';
        if (Object.keys(consolidatedData).length === 0) {
            rowsHtml = `<tr><td colspan="4" class="p-4 text-center text-slate-400 italic">No work entries found for this month.</td></tr>`;
        } else {
            Object.values(consolidatedData).forEach((r, i) => {
                rowsHtml += `
                <tr class="border-b border-slate-200 text-xs">
                    <td class="py-2 px-3 font-bold text-slate-700 border-r border-slate-100">${i+1}. ${r.displayName}</td>
                    <td class="py-2 px-3 text-center text-slate-600 border-r border-slate-100">${r.quantity}</td>
                    <td class="py-2 px-3 text-center text-slate-600 border-r border-slate-100">₹${r.rate}</td>
                    <td class="py-2 px-3 text-right font-bold text-slate-800">₹${r.total.toLocaleString('en-IN')}</td>
                </tr>`;
            });
        }

        // Step D: Render The Printable Invoice
        html = `
        <div class="w-full max-w-xl mx-auto bg-white p-8 text-slate-800 font-sans shadow-none">
            
            <div class="flex justify-end mb-6 no-print">
                <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition flex items-center gap-2 text-sm">
                    <i class="fa-solid fa-print"></i> Print Statement
                </button>
            </div>

            <div class="text-center border-b-2 border-slate-800 pb-4 mb-6">
                <h1 class="text-3xl font-black uppercase tracking-tight text-slate-900">Sri Raghavendra Fashions</h1>
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Piece-Rate Work Statement</p>
                <div class="text-[10px] text-slate-400 mt-1 flex justify-center gap-2">
                    <span>${dateLabel}</span>
                </div>
            </div>

            <div class="flex justify-between items-end mb-6 text-sm">
                <div>
                    <p class="text-slate-400 text-[10px] uppercase font-bold">Bill To</p>
                    <p class="font-bold text-xl text-slate-900 leading-tight">${emp.name}</p>
                    <p class="text-xs text-slate-500">${emp.role}</p>
                </div>
                <div class="text-right">
                    <div class="bg-slate-100 px-3 py-1 rounded">
                        <p class="text-slate-400 text-[10px] uppercase font-bold">Total Pcs</p>
                        <p class="font-bold text-slate-800">${Object.values(consolidatedData).reduce((s, x) => s + x.quantity, 0)}</p>
                    </div>
                </div>
            </div>
            
            <div class="border border-slate-800 rounded-none mb-6">
                <table class="w-full text-sm text-left">
                    <thead class="bg-slate-800 text-white font-bold text-[10px] uppercase">
                        <tr>
                            <th class="py-2 px-3">Item / Style</th>
                            <th class="py-2 px-3 text-center">Qty</th>
                            <th class="py-2 px-3 text-center">Rate</th>
                            <th class="py-2 px-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>

            <div class="flex justify-end">
                <div class="w-64 space-y-1">
                    <div class="flex justify-between text-sm py-1 border-b border-dashed border-slate-300">
                        <span class="text-slate-500 font-medium">Subtotal</span>
                        <span class="font-bold text-slate-800">₹ ${totalPieceEarnings.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="flex justify-between text-sm py-1 border-b border-dashed border-slate-300">
                        <span class="text-red-500 font-medium">Less: Advance</span>
                        <span class="font-bold text-red-500">- ₹ ${advance.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="bg-slate-800 text-white p-2 flex justify-between items-center mt-2 rounded-sm print:bg-slate-800 print:text-white">
                        <span class="font-bold uppercase text-xs">Net Payable</span>
                        <span class="font-bold text-xl">₹ ${finalNet.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-16 flex justify-between items-center">
                <div class="text-center">
                    <div class="w-32 border-t border-slate-400"></div>
                    <p class="text-[10px] text-slate-400 uppercase font-bold mt-1">Receiver Sign</p>
                </div>
                <div class="text-center">
                    <div class="w-32 border-t border-slate-400"></div>
                    <p class="text-[10px] text-slate-400 uppercase font-bold mt-1">Authorized Sign</p>
                </div>
            </div>
            
            <div class="mt-8 text-center border-t border-slate-100 pt-4">
                <p class="text-[9px] text-slate-400">Generated by Smart Manager v5.5 • ${new Date().toLocaleTimeString()}</p>
            </div>
        </div>`;
    
    }
    // --- NEW: Add Print Button ---
    // We add a specific 'no-print' class so this button doesn't appear on the paper
    const printBtn = `
        <div class="w-full flex justify-end mb-4 no-print">
            <button onclick="window.print()" class="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition flex items-center gap-2">
                <i class="fa-solid fa-print"></i> Print Slip
            </button>
        </div>
    `;

    document.getElementById('salary-modal-content').innerHTML = html; 
    modal.classList.remove('hidden');
};

// --- ENSURE CLOSE FUNCTION EXISTS ---
window.closeSalaryModal = () => {
    const modal = document.getElementById('salary-modal');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('opacity-0');
    }, 200);
};

// ==========================================
// 3. WAGE SUMMARY MODAL (UPDATED GROUPS)
// ==========================================

window.toggleDetailsModal = () => {
    const modal = document.getElementById('details-modal');
    if(!modal) return;

    if(modal.classList.contains('hidden')) {
        modal.className = "fixed inset-0 bg-slate-900/80 z-[105] flex items-center justify-center backdrop-blur-sm p-4 transition-opacity";
        modal.classList.remove('hidden');
        
        const mInput = document.getElementById('details-month');
        if(mInput && !mInput.value) {
            const now = new Date();
            mInput.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        }
        window.renderDetailsSummary();
    } else {
        modal.classList.add('hidden');
    }
};

window.renderDetailsSummary = () => {
    try {
        const mInput = document.getElementById('details-month');
        if(!mInput || !mInput.value) return;
        
        const [yStr, mStr] = mInput.value.split('-');
        const year = parseInt(yStr);
        const month = parseInt(mStr);
        const daysInMonth = new Date(year, month, 0).getDate();
        const container = document.getElementById('details-modal-content');
        
        const timeStaff = [];
        const frontBackStaff = [];
        const assemblyStaff = [];

        state.staffData.forEach(emp => {
            if(emp.type === 'timings') {
                timeStaff.push(emp);
            } else {
                const role = (emp.role || '').toLowerCase();
                if(role.includes('front') || role.includes('back')) {
                    frontBackStaff.push(emp);
                } else {
                    assemblyStaff.push(emp);
                }
            }
        });

        const RATES = (window.CONFIG && window.CONFIG.RATES) ? window.CONFIG.RATES : { OT_PER_HOUR: 45, NPL_FINE: 500, ATTENDANCE_BONUS: 600 };

        const calculateRow = (emp) => {
            const lId = `${emp.id}_${year}_${month}`;
            const ledger = state.staffLedgers[lId] || { days: {}, salary: 0, advance: 0, pcsEntries: [] };
            const dayMap = ledger.days || {}; 
            const advance = parseFloat(ledger.advance) || 0;
            let earned = 0;

            if(emp.type === 'timings') {
                const basicSalary = parseFloat(ledger.salary) || 0;
                const dailyWage = basicSalary / 30;
                const hourlyWage = dailyWage / 8;
                let fullDays = 0, partialHours = 0, totalOTHours = 0, nplCount = 0, leaveCount = 0, absentDays = 0;

                for(let i=1; i<=daysInMonth; i++) {
                    const d = dayMap[i] || {}; 
                    const dObj = new Date(year, month-1, i);
                    const isSun = dObj.getDay() === 0 || d.status === 'SUNDAY';
                    const isHol = d.status === 'HOLIDAY';
                // NEW: Check for Paid Leave
                    const isPaidLeave = d.status === 'PAID_LEAVE';

                    if(isSun || isHol || isPaidLeave) { // <--- ADD isPaidLeave HERE
                    fullDays++;
                    if(d.hours) totalOTHours += Number(d.hours);
                    } else {
                        if (d.status === 'NPL') { nplCount++; absentDays++; }
                        else if (d.status === 'LEAVE') { leaveCount++; absentDays++; }
                        else if (d.hours) {
                            const h = Number(d.hours);
                            const ot = Number(d.ot) || 0;
                            totalOTHours += ot;
                            const normal = h - ot;
                            if(normal >= 8) fullDays++; else partialHours += normal;
                        } else {
                            if (!d.in && !d.out && !d.status) absentDays++;
                        }
                    }
                }
                const incentive = (absentDays===0 && nplCount===0 && leaveCount===0) ? RATES.ATTENDANCE_BONUS : 0;
                earned = (fullDays * dailyWage) + (partialHours * hourlyWage) + (totalOTHours * RATES.OT_PER_HOUR) + incentive - (nplCount * RATES.NPL_FINE);
            } else {
                (ledger.pcsEntries || []).forEach(row => earned += Number(row.total || 0));
            }

            const net = earned - advance;
            return { name: emp.name, role: emp.role, earned: Math.round(earned), advance: Math.round(advance), net: Math.round(net) };
        };

        let grandTotal = 0;

        const renderTable = (title, staffList, colorClass) => {
            if(staffList.length === 0) return '';
            
            let sectionTotal = 0;
            let rows = staffList.map(emp => {
                const data = calculateRow(emp);
                sectionTotal += data.net;
                grandTotal += data.net;
                return `
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td class="p-3 font-medium text-slate-700">${data.name}<br><span class="text-[10px] text-slate-400 uppercase">${data.role}</span></td>
                    <td class="p-3 text-right font-bold text-slate-600">₹${data.earned.toLocaleString('en-IN')}</td>
                    <td class="p-3 text-right text-red-500">-₹${data.advance.toLocaleString('en-IN')}</td>
                    <td class="p-3 text-right font-bold ${colorClass}">₹${data.net.toLocaleString('en-IN')}</td>
                </tr>`;
            }).join('');

            return `
            <div class="mb-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                    <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500">${title}</h4>
                    <span class="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">Count: ${staffList.length}</span>
                </div>
                <table class="w-full text-sm text-left">
                    <thead class="bg-white text-[10px] uppercase text-slate-400 border-b border-slate-100">
                        <tr><th class="p-3">Staff</th><th class="p-3 text-right">Earned</th><th class="p-3 text-right">Adv</th><th class="p-3 text-right">Net Pay</th></tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        ${rows}
                    </tbody>
                    <tfoot class="bg-slate-50/50">
                        <tr>
                            <td colspan="3" class="p-3 text-right font-bold text-slate-500 text-xs uppercase">Subtotal</td>
                            <td class="p-3 text-right font-bold text-slate-800 text-base">₹${sectionTotal.toLocaleString('en-IN')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>`;
        };

        let html = '';
        html += renderTable('Based on Timings', timeStaff, 'text-indigo-600');
        
        if(frontBackStaff.length > 0 || assemblyStaff.length > 0) {
            html += `<div class="mt-8 mb-4 px-2 border-b-2 border-dashed border-slate-200 pb-1">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Based on Piecework</span>
                     </div>`;
        }
        html += renderTable('Front & Back', frontBackStaff, 'text-emerald-600');
        html += renderTable('Assembly', assemblyStaff, 'text-blue-600');

        if(html === '') html = `<div class="p-8 text-center text-slate-400 italic">No staff found for this month.</div>`;

        container.innerHTML = html;
        document.getElementById('details-grand-total').innerText = `₹ ${Math.round(grandTotal).toLocaleString('en-IN')}`;
    
    } catch(e) {
        console.error("Wage Summary Error:", e);
        alert("Error loading Wage Summary. Check console for details.");
    }
};