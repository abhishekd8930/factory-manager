console.log("Staff Finance Module Loaded");

const API_BASE = 'http://localhost:8000';

// ==========================================
// 1. ADVANCE MODAL LOGIC
// ==========================================

window.openAdvanceModal = () => {
    const lId = getLedgerId();
    if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {}, advance: '', advanceLog: [] };
    if (!state.staffLedgers[lId].advanceLog) state.staffLedgers[lId].advanceLog = [];

    const date = state.currentLedgerDate;
    const modalTitle = document.getElementById('adv-modal-month');
    if (modalTitle) modalTitle.innerText = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    document.getElementById('adv-new-date').value = state.today;

    renderAdvanceLog();

    const addContainer = document.getElementById('adv-add-container');
    if (addContainer) {
        if (window.canEdit()) addContainer.classList.remove('hidden');
        else addContainer.classList.add('hidden');
    }

    document.getElementById('advance-modal').classList.remove('hidden');
};

window.closeAdvanceModal = () => document.getElementById('advance-modal').classList.add('hidden');

window.renderAdvanceLog = () => {
    const lId = getLedgerId();
    const logs = state.staffLedgers[lId]?.advanceLog || [];
    const tbody = document.getElementById('advance-list-body');
    const emptyMsg = document.getElementById('adv-empty-msg');

    if (!tbody) return;
    tbody.innerHTML = '';
    let total = 0;

    if (logs.length === 0) {
        if (emptyMsg) emptyMsg.classList.remove('hidden');
    } else {
        if (emptyMsg) emptyMsg.classList.add('hidden');
        logs.forEach((log, index) => {
            total += Number(log.amount);
            tbody.innerHTML += `
                <tr class="border-b border-slate-50 hover:bg-slate-50">
                    <td class="p-3 text-slate-600">${log.date}</td>
                    <td class="p-3 font-bold text-slate-700">${log.note || '-'}</td>
                    <td class="p-3 text-right font-bold text-red-500">₹${log.amount}</td>
                    <td class="p-3 text-center">
                        ${window.canEdit() ? `<button onclick="deleteAdvanceEntry(${index})" class="text-slate-300 hover:text-red-500 transition"><i class="fa-solid fa-trash"></i></button>` : ''}
                    </td>
                </tr>`;
        });
    }

    const totalEl = document.getElementById('adv-modal-total');
    const inputEl = document.getElementById('ledger-advance');

    if (totalEl) totalEl.innerText = `₹ ${total}`;
    if (inputEl) inputEl.value = total;

    if (state.staffLedgers[lId]) {
        state.staffLedgers[lId].advance = total;

        // Save
        localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
        if (window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);
    }
};

window.addAdvanceEntry = () => {
    if (!window.canEdit()) return;
    const lId = getLedgerId();
    const date = document.getElementById('adv-new-date').value;
    const amount = document.getElementById('adv-new-amount').value;
    const note = document.getElementById('adv-new-note').value;

    if (!amount || amount <= 0) return alert("Please enter a valid amount");

    if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {}, advance: 0, advanceLog: [] };
    if (!state.staffLedgers[lId].advanceLog) state.staffLedgers[lId].advanceLog = [];

    state.staffLedgers[lId].advanceLog.push({ id: Date.now(), date: date || state.today, amount: Number(amount), note: note });

    document.getElementById('adv-new-amount').value = '';
    document.getElementById('adv-new-note').value = '';
    document.getElementById('adv-new-amount').focus();
    renderAdvanceLog();
};

window.deleteAdvanceEntry = (index) => {
    if (!window.canEdit()) return;
    const lId = getLedgerId();
    if (state.staffLedgers[lId]?.advanceLog) {
        state.staffLedgers[lId].advanceLog.splice(index, 1);
        renderAdvanceLog();
    }
};

window.saveFinancials = () => {
    if (!window.canEdit()) return;
    const lId = getLedgerId();
    if (!state.staffLedgers[lId]) return;
    const salInput = document.getElementById('ledger-salary');
    if (!salInput.readOnly) state.staffLedgers[lId].salary = salInput.value;
    state.staffLedgers[lId].advance = document.getElementById('ledger-advance').value;

    // Save
    localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
    if (window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);
};


// ==========================================
// 2. SALARY SLIP (via FastAPI Backend)
// ==========================================

window.calculateSalary = async () => {
    if (!state.currentLedgerEmp) {
        console.warn("No employee selected for salary calculation.");
        return;
    }

    const ledgerId = getLedgerId();
    const advInput = document.getElementById('ledger-advance');

    // Save Advance if changed (ONLY IF CAN EDIT)
    if (advInput && window.canEdit()) {
        if (!state.staffLedgers[ledgerId]) state.staffLedgers[ledgerId] = {};
        state.staffLedgers[ledgerId].advance = advInput.value;
        localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
        if (window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);
    }

    const ledgerData = state.staffLedgers[ledgerId] || {};
    const emp = state.currentLedgerEmp;
    const basicMonthlySalary = Number(ledgerData.salary) || 0;
    const advance = Number(ledgerData.advance) || 0;

    if (!ledgerData || (!basicMonthlySalary && (!ledgerData.pcsEntries || ledgerData.pcsEntries.length === 0))) {
        alert("No earnings found. Cannot generate slip."); return;
    }

    const modal = document.getElementById('salary-modal');
    modal.className = "fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-200";
    document.getElementById('salary-modal-content').innerHTML = `<div class="flex items-center justify-center p-12"><i class="fa-solid fa-spinner fa-spin text-3xl text-indigo-500"></i><span class="ml-3 text-slate-500 font-bold">Calculating...</span></div>`;
    modal.classList.remove('hidden');

    const dateLabel = document.getElementById('ledger-month-label').innerText;
    const RATES = (window.CONFIG && window.CONFIG.RATES) ? window.CONFIG.RATES : { OT_PER_HOUR: 45, NPL_FINE: 500, ATTENDANCE_BONUS: 600 };
    const OWNER = (window.CONFIG && window.CONFIG.OWNER_NAME) ? window.CONFIG.OWNER_NAME : "Factory Manager";

    let html = '';

    try {
        if (emp.type === 'timings') {
            // ==========================================
            // CALL PYTHON API FOR TIME-BASED SALARY
            // ==========================================
            const apiDate = state.currentLedgerDate;
            const res = await fetch(`${API_BASE}/api/calculate-salary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_name: emp.name,
                    employee_role: emp.role || '',
                    salary: basicMonthlySalary,
                    advance: advance,
                    days: ledgerData.days || {},
                    year: apiDate.getFullYear(),
                    month: apiDate.getMonth() + 1,
                    rates: {
                        OT_PER_HOUR: RATES.OT_PER_HOUR,
                        NPL_FINE: RATES.NPL_FINE,
                        ATTENDANCE_BONUS: RATES.ATTENDANCE_BONUS
                    },
                    owner_name: OWNER
                })
            });

            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const d = await res.json();

            // Build Sunday status HTML
            let sundayStatusStr = '';
            if (d.unpaid_sundays > 0) sundayStatusStr += `<span class="text-red-500">${d.unpaid_sundays} Unpaid</span> `;
            if (d.half_paid_sundays > 0) sundayStatusStr += `<span class="text-yellow-600">${d.half_paid_sundays} Half-Pay</span>`;
            if (sundayStatusStr === '') sundayStatusStr = '<span class="text-emerald-600">All Paid</span>';

            html = `
            <div class="bg-white p-6 max-w-md mx-auto text-slate-800 font-sans">
                <div class="w-full flex justify-end gap-3 mb-4 no-print">
                    <button onclick="shareSalarySlip()" class="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-emerald-700 transition flex items-center gap-2"><i class="fa-solid fa-share-nodes"></i> Share</button>
                    <button onclick="window.print()" class="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition flex items-center gap-2"><i class="fa-solid fa-print"></i> Print Slip</button>
                </div>
                <div class="text-center border-b-2 border-slate-800 pb-4 mb-4">
                    <h2 class="text-2xl font-bold uppercase tracking-widest">Salary Slip</h2>
                    <p class="text-slate-500 text-sm font-bold mt-1">${d.owner_name}</p>
                </div>
                <div class="flex justify-between items-end mb-6 text-sm">
                    <div><p class="text-slate-400 text-xs uppercase font-bold">Employee Name</p><p class="text-xl font-bold text-slate-900">${d.employee_name}</p><p class="text-slate-500">${d.employee_role}</p></div>
                    <div class="text-right"><p class="text-slate-400 text-xs uppercase font-bold">Pay Period</p><p class="font-bold text-slate-700">${dateLabel}</p></div>
                </div>
                <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-6 text-sm">
                    <h4 class="font-bold text-slate-400 text-xs uppercase mb-3">Attendance Details</h4>
                    <div class="grid grid-cols-2 gap-y-2">
                        <div class="flex justify-between border-r border-slate-200 pr-4"><span>Paid Days</span> <span class="font-bold text-xl text-indigo-700">${d.full_days.toFixed(1)}</span></div>
                        <div class="flex justify-between pl-4"><span>OT Hours</span> <span class="font-bold text-indigo-600">${d.total_ot_hours.toFixed(1)}</span></div>
                        <div class="flex justify-between border-r border-slate-200 pr-4"><span>Partial Hrs</span> <span class="font-bold">${d.partial_hours.toFixed(1)}</span></div>
                        <div class="flex justify-between pl-4"><span>Sundays</span> <span class="font-bold text-xs">${sundayStatusStr}</span></div>
                    </div>
                </div>
                <table class="w-full text-sm mb-6">
                    <tr class="border-b border-slate-100"><td class="py-2 text-slate-600">Basic Salary (Earned)</td><td class="py-2 text-right font-bold text-slate-800">₹ ${Math.round(d.basic_earned)}</td></tr>
                    <tr class="border-b border-slate-100"><td class="py-2 text-slate-600">Overtime Pay</td><td class="py-2 text-right font-bold text-emerald-600">+ ₹ ${Math.round(d.ot_pay)}</td></tr>
                    <tr class="border-b border-slate-100"><td class="py-2 text-slate-600">Attendance Bonus</td><td class="py-2 text-right font-bold text-emerald-600">+ ₹ ${d.incentive}</td></tr>
                    <tr class="border-b border-slate-100"><td class="py-2 text-red-500">Less: NPL Fines</td><td class="py-2 text-right font-bold text-red-500">- ₹ ${d.npl_fine}</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-2 text-red-500">Less: Advance Taken</td><td class="py-2 text-right font-bold text-red-500">- ₹ ${d.advance}</td></tr>
                    <tr class="text-lg"><td class="py-3 font-bold text-slate-900">Net Payable</td><td class="py-3 text-right font-bold text-indigo-700 text-2xl">₹ ${Math.round(d.net)}</td></tr>
                </table>
                <div class="mt-8 pt-8 border-t border-dashed border-slate-300 text-center"><p class="text-xs text-slate-400 uppercase font-bold">Authorized Signature</p></div>
            </div>`;

        } else {
            // ==========================================
            // CALL PYTHON API FOR PIECE-RATE BILLING
            // ==========================================
            const res = await fetch(`${API_BASE}/api/calculate-piecerate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_name: emp.name,
                    employee_role: emp.role || '',
                    advance: advance,
                    pcs_entries: ledgerData.pcsEntries || [],
                    owner_name: OWNER,
                    date_label: dateLabel
                })
            });

            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const d = await res.json();

            let rowsHtml = '';
            if (d.consolidated_items.length === 0) {
                rowsHtml = `<tr><td colspan="4" class="p-4 text-center text-slate-400 italic">No work entries found for this month.</td></tr>`;
            } else {
                d.consolidated_items.forEach((r, i) => {
                    rowsHtml += `
                    <tr class="border-b border-slate-200 text-xs">
                        <td class="py-2 px-3 font-bold text-slate-700 border-r border-slate-100">${i + 1}. ${r.display_name}</td>
                        <td class="py-2 px-3 text-center text-slate-600 border-r border-slate-100">${r.quantity}</td>
                        <td class="py-2 px-3 text-center text-slate-600 border-r border-slate-100">₹${r.rate}</td>
                        <td class="py-2 px-3 text-right font-bold text-slate-800">₹${r.total.toLocaleString('en-IN')}</td>
                    </tr>`;
                });
            }

            html = `
            <div class="w-full max-w-xl mx-auto bg-white p-8 text-slate-800 font-sans shadow-none">
                <div class="flex justify-end gap-3 mb-6 no-print">
                    <button onclick="shareSalarySlip()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition flex items-center gap-2 text-sm"><i class="fa-solid fa-share-nodes"></i> Share</button>
                    <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition flex items-center gap-2 text-sm"><i class="fa-solid fa-print"></i> Print Statement</button>
                </div>
                <div class="text-center border-b-2 border-slate-800 pb-4 mb-6">
                    <h1 class="text-3xl font-black uppercase tracking-tight text-slate-900">Sri Raghavendra Fashions</h1>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Piece-Rate Work Statement</p>
                    <div class="text-[10px] text-slate-400 mt-1 flex justify-center gap-2"><span>${dateLabel}</span></div>
                </div>
                <div class="flex justify-between items-end mb-6 text-sm">
                    <div>
                        <p class="text-slate-400 text-[10px] uppercase font-bold">Bill To</p>
                        <p class="font-bold text-xl text-slate-900 leading-tight">${d.employee_name}</p>
                        <p class="text-xs text-slate-500">${d.employee_role}</p>
                    </div>
                    <div class="text-right">
                        <div class="bg-slate-100 px-3 py-1 rounded">
                            <p class="text-slate-400 text-[10px] uppercase font-bold">Total Pcs</p>
                            <p class="font-bold text-slate-800">${d.total_quantity}</p>
                        </div>
                    </div>
                </div>
                <div class="border border-slate-800 rounded-none mb-6">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-800 text-white font-bold text-[10px] uppercase">
                            <tr><th class="py-2 px-3">Item / Style</th><th class="py-2 px-3 text-center">Qty</th><th class="py-2 px-3 text-center">Rate</th><th class="py-2 px-3 text-right">Total</th></tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">${rowsHtml}</tbody>
                    </table>
                </div>
                <div class="flex justify-end">
                    <div class="w-64 space-y-1">
                        <div class="flex justify-between text-sm py-1 border-b border-dashed border-slate-300"><span class="text-slate-500 font-medium">Subtotal</span><span class="font-bold text-slate-800">₹ ${d.total_piece_earnings.toLocaleString('en-IN')}</span></div>
                        <div class="flex justify-between text-sm py-1 border-b border-dashed border-slate-300"><span class="text-red-500 font-medium">Less: Advance</span><span class="font-bold text-red-500">- ₹ ${d.advance.toLocaleString('en-IN')}</span></div>
                        <div class="bg-slate-800 text-white p-2 flex justify-between items-center mt-2 rounded-sm print:bg-slate-800 print:text-white">
                            <span class="font-bold uppercase text-xs">Net Payable</span>
                            <span class="font-bold text-xl">₹ ${d.net.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
                <div class="mt-16 flex justify-between items-center">
                    <div class="text-center"><div class="w-32 border-t border-slate-400"></div><p class="text-[10px] text-slate-400 uppercase font-bold mt-1">Receiver Sign</p></div>
                    <div class="text-center"><div class="w-32 border-t border-slate-400"></div><p class="text-[10px] text-slate-400 uppercase font-bold mt-1">Authorized Sign</p></div>
                </div>
                <div class="mt-8 text-center border-t border-slate-100 pt-4"><p class="text-[9px] text-slate-400">Generated by Smart Manager v5.5 • ${new Date().toLocaleTimeString()}</p></div>
            </div>`;
        }
    } catch (err) {
        console.error('Salary API Error:', err);
        html = `<div class="p-8 text-center"><i class="fa-solid fa-triangle-exclamation text-4xl text-red-400 mb-4"></i><p class="text-red-500 font-bold">Failed to calculate salary</p><p class="text-slate-400 text-sm mt-2">${err.message}</p><p class="text-slate-400 text-xs mt-1">Ensure the Python API server is running on port 8000.</p></div>`;
    }

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

// --- SHARE SALARY SLIP AS IMAGE ---
window.shareSalarySlip = async () => {
    const content = document.getElementById('salary-modal-content');
    if (!content) return alert("No salary slip to share.");

    try {
        // Hide buttons before capture
        const noPrintEls = content.querySelectorAll('.no-print');
        noPrintEls.forEach(el => el.style.display = 'none');

        // Use html-to-image (supports modern CSS like oklch)
        const dataUrl = await htmlToImage.toPng(content, {
            backgroundColor: '#ffffff',
            quality: 1,
            pixelRatio: 2,
            skipFonts: true // Skip external fonts to avoid CORS issues
        });

        // Restore buttons
        noPrintEls.forEach(el => el.style.display = '');

        // Convert data URL to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        const empName = state.currentLedgerEmp?.name || 'Employee';
        const fileName = `Salary_Slip_${empName.replace(/\s+/g, '_')}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        // Try Web Share API (works on mobile / supported browsers)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: `Salary Slip - ${empName}`,
                text: `Salary slip for ${empName}`,
                files: [file]
            });
        } else {
            // Fallback: Download the image
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Share Error:', err);
            alert('Failed to share: ' + err.message);
        }
    }
};

// ==========================================
// 3. WAGE SUMMARY MODAL (UPDATED GROUPS)
// ==========================================

window.toggleDetailsModal = () => {
    const modal = document.getElementById('details-modal');
    if (!modal) return;

    if (modal.classList.contains('hidden')) {
        modal.className = "fixed inset-0 bg-slate-900/80 z-[105] flex items-center justify-center backdrop-blur-sm p-4 transition-opacity";
        modal.classList.remove('hidden');

        const mInput = document.getElementById('details-month');
        if (mInput && !mInput.value) {
            const now = new Date();
            mInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        window.renderDetailsSummary();
    } else {
        modal.classList.add('hidden');
    }
};

window.renderDetailsSummary = async () => {
    try {
        const mInput = document.getElementById('details-month');
        if (!mInput || !mInput.value) return;

        const [yStr, mStr] = mInput.value.split('-');
        const year = parseInt(yStr);
        const month = parseInt(mStr);
        const container = document.getElementById('details-modal-content');
        container.innerHTML = `<div class="flex items-center justify-center p-12"><i class="fa-solid fa-spinner fa-spin text-3xl text-indigo-500"></i><span class="ml-3 text-slate-500 font-bold">Loading Summary...</span></div>`;

        const RATES = (window.CONFIG && window.CONFIG.RATES) ? window.CONFIG.RATES : { OT_PER_HOUR: 45, NPL_FINE: 500, ATTENDANCE_BONUS: 600 };

        // Build employee data for API
        const employees = state.staffData.map(emp => {
            const lId = `${emp.id}_${year}_${month}`;
            const ledger = state.staffLedgers[lId] || { days: {}, salary: 0, advance: 0, pcsEntries: [] };
            return {
                id: String(emp.id),
                name: emp.name,
                role: emp.role || '',
                type: emp.type || 'timings',
                salary: parseFloat(ledger.salary) || 0,
                advance: parseFloat(ledger.advance) || 0,
                days: ledger.days || {},
                pcs_entries: ledger.pcsEntries || []
            };
        });

        const res = await fetch(`${API_BASE}/api/wage-summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                year: year,
                month: month,
                employees: employees,
                rates: {
                    OT_PER_HOUR: RATES.OT_PER_HOUR,
                    NPL_FINE: RATES.NPL_FINE,
                    ATTENDANCE_BONUS: RATES.ATTENDANCE_BONUS
                }
            })
        });

        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();

        // Render from API response
        let html = '';
        let hasPiecework = false;

        data.groups.forEach(group => {
            if (group.title !== 'Based on Timings') hasPiecework = true;

            if (hasPiecework && group.title === 'Front & Back') {
                html += `<div class="mt-8 mb-4 px-2 border-b-2 border-dashed border-slate-200 pb-1">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Based on Piecework</span>
                         </div>`;
            }

            let rows = group.employees.map(e => `
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td class="p-3 font-medium text-slate-700">${e.name}<br><span class="text-[10px] text-slate-400 uppercase">${e.role}</span></td>
                    <td class="p-3 text-right font-bold text-slate-600">₹${e.earned.toLocaleString('en-IN')}</td>
                    <td class="p-3 text-right text-red-500">-₹${e.advance.toLocaleString('en-IN')}</td>
                    <td class="p-3 text-right font-bold ${group.color_class}">₹${e.net.toLocaleString('en-IN')}</td>
                </tr>`).join('');

            html += `
            <div class="mb-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                    <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500">${group.title}</h4>
                    <span class="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">Count: ${group.count}</span>
                </div>
                <table class="w-full text-sm text-left">
                    <thead class="bg-white text-[10px] uppercase text-slate-400 border-b border-slate-100">
                        <tr><th class="p-3">Staff</th><th class="p-3 text-right">Earned</th><th class="p-3 text-right">Adv</th><th class="p-3 text-right">Net Pay</th></tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">${rows}</tbody>
                    <tfoot class="bg-slate-50/50">
                        <tr>
                            <td colspan="3" class="p-3 text-right font-bold text-slate-500 text-xs uppercase">Subtotal</td>
                            <td class="p-3 text-right font-bold text-slate-800 text-base">₹${group.subtotal.toLocaleString('en-IN')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>`;
        });

        if (html === '') html = `<div class="p-8 text-center text-slate-400 italic">No staff found for this month.</div>`;

        container.innerHTML = html;
        document.getElementById('details-grand-total').innerText = `₹ ${Math.round(data.grand_total).toLocaleString('en-IN')}`;

    } catch (e) {
        console.error("Wage Summary Error:", e);
        const container = document.getElementById('details-modal-content');
        if (container) container.innerHTML = `<div class="p-8 text-center"><i class="fa-solid fa-triangle-exclamation text-4xl text-red-400 mb-4"></i><p class="text-red-500 font-bold">Failed to load wage summary</p><p class="text-slate-400 text-sm mt-2">${e.message}</p><p class="text-slate-400 text-xs mt-1">Ensure the Python API server is running on port 8000.</p></div>`;
    }
};