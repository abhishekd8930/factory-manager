console.log("Dashboard Module Loaded");

// --- 1. PRODUCTION LEDGER ---

// NEW: Auto-load draft if it exists
window.addDashboardLedgerRow = () => {
    const draft = JSON.parse(localStorage.getItem('srf_dashboard_draft') || '{}');

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="p-3"><input type="date" class="w-full bg-slate-50 rounded p-1" value="${state.today}"></td>
        <td class="p-3">
            <div class="relative flex items-center">
                <input type="text" class="w-full bg-slate-50 rounded p-1 desc-val pr-8" 
                    placeholder="Details" 
                    value="${draft.desc || ''}" 
                    oninput="saveDashboardDraft(this)"
                    onkeydown="if(event.key === 'Alt') { event.preventDefault(); startVoiceInput(this.nextElementSibling); }">
                <button onclick="startVoiceInput(this)" class="absolute right-2 text-slate-400 hover:text-indigo-600 transition-colors"><i class="fa-solid fa-microphone"></i></button>
            </div>
        </td>
        <td class="p-3"><input type="number" class="w-full bg-indigo-50 text-center rounded p-1 total-val" value="${draft.total || ''}" oninput="updateHUD(); saveDashboardDraft(this)"></td>
        <td class="p-3"><input type="number" class="w-full bg-red-50 text-center rounded p-1 missing-val" value="${draft.missing || ''}" oninput="updateHUD(); saveDashboardDraft(this)"></td>
        <td class="p-3"><button onclick="clearDashboardDraft(this)" class="text-slate-300 hover:text-red-500"><i class="fa-solid fa-trash"></i></button></td>
    `;
    document.getElementById('ledger-body').appendChild(tr);
    updateHUD(); // Recalculate immediately
};

// NEW: Save inputs to temporary storage as you type
window.saveDashboardDraft = (input) => {
    const row = input.closest('tr');
    const draft = {
        desc: row.querySelector('.desc-val').value,
        total: row.querySelector('.total-val').value,
        missing: row.querySelector('.missing-val').value
    };
    localStorage.setItem('srf_dashboard_draft', JSON.stringify(draft));
};

// NEW: Clear draft when deleting or saving
window.clearDashboardDraft = (btn) => {
    localStorage.removeItem('srf_dashboard_draft');
    if (btn) {
        btn.closest('tr').remove();
        updateHUD();
    }
};

window.updateHUD = () => {
    let t = 0, m = 0;
    document.querySelectorAll('.total-val').forEach(i => t += Number(i.value));
    document.querySelectorAll('.missing-val').forEach(i => m += Number(i.value));
    document.getElementById('hud-total-ps').innerText = t;
    document.getElementById('hud-missing-ps').innerText = m;
};

window.saveLedger = () => {
    const rows = document.querySelectorAll('#ledger-body tr');
    let hasData = false;
    rows.forEach(tr => {
        const d = tr.querySelector('input[type="date"]').value;
        const de = tr.querySelector('.desc-val').value;
        const t = Number(tr.querySelector('.total-val').value);
        const m = Number(tr.querySelector('.missing-val').value);

        if (de) {
            state.historyData.push({
                id: Date.now() + Math.random(),
                type: 'production',
                fullDate: d,
                desc: de,
                total: t,
                missing: m,
                createdAt: new Date()
            });
            hasData = true;
        }
    });

    if (hasData) {
        localStorage.setItem('srf_production_history', JSON.stringify(state.historyData));
        if (window.saveToCloud) window.saveToCloud('historyData', state.historyData);
        document.getElementById('ledger-body').innerHTML = '';
        window.addDashboardLedgerRow();
        window.renderCharts();
        alert("Saved Production Log successfully!");
    } else {
        alert("Please enter some data before saving.");
    }
};

// --- 2. WASHING LOGIC ---

window.addWashingRow = () => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="p-3"><input type="date" class="w-full bg-slate-50 rounded p-1" value="${state.today}"></td>
        <td class="p-3"><input type="text" class="w-full bg-slate-50 rounded p-1 washing-desc" placeholder="Washing Details (e.g. Batch A)"></td>
        <td class="p-3"><input type="number" class="w-full bg-blue-50 text-center rounded p-1 washing-pcs" oninput="updateWashingHUD()" placeholder="0"></td>
        <td class="p-3 text-center"><button onclick="this.closest('tr').remove();updateWashingHUD()" class="text-slate-300 hover:text-red-500"><i class="fa-solid fa-trash"></i></button></td>
    `;
    document.getElementById('washing-body').appendChild(tr);
};

window.updateWashingHUD = () => {
    let t = 0;
    document.querySelectorAll('.washing-pcs').forEach(i => t += Number(i.value));
    document.getElementById('hud-washing-total').innerText = t;
};

window.saveWashingLog = () => {
    const rows = document.querySelectorAll('#washing-body tr');
    let hasData = false;

    rows.forEach(tr => {
        const d = tr.querySelector('input[type="date"]').value;
        const desc = tr.querySelector('.washing-desc').value;
        const pcs = Number(tr.querySelector('.washing-pcs').value);

        if (desc && pcs > 0) {
            if (!state.washingData) state.washingData = [];
            state.washingData.push({
                id: Date.now() + Math.random(),
                type: 'washing',
                fullDate: d,
                desc: desc,
                total: pcs,
                createdAt: new Date()
            });
            hasData = true;
        }
    });

    if (hasData) {
        localStorage.setItem('srf_washing_history', JSON.stringify(state.washingData));
        if (window.saveToCloud) window.saveToCloud('washingData', state.washingData);
        document.getElementById('washing-body').innerHTML = '';
        window.addWashingRow();
        window.renderCharts();
        alert("Washing details saved successfully!");
    } else {
        alert("Please enter details and pieces before saving.");
    }
};

// --- 3. GREETING LOGIC ---
window.updateGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    const name = CONFIG.OWNER_NAME || "Manager";

    let greetingText = "Welcome";
    let icon = "fa-sun";

    if (hour < 12) {
        greetingText = "Good Morning";
        icon = "fa-mug-hot";
    } else if (hour < 18) {
        greetingText = "Good Afternoon";
        icon = "fa-cloud-sun";
    } else {
        greetingText = "Good Evening";
        icon = "fa-moon";
    }

    const msgEl = document.getElementById('greet-msg');
    const nameEl = document.getElementById('greet-name');
    const iconEl = document.getElementById('greet-icon');

    if (msgEl) msgEl.innerText = greetingText + ",";
    if (nameEl) nameEl.innerText = name;
    if (iconEl) iconEl.className = `fa-solid ${icon} text-yellow-400 text-3xl`;

    const dateEl = document.getElementById('home-date');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.innerText = now.toLocaleDateString('en-IN', options);
    }
};

// --- 4. CHARTS & RENDER ---
window.renderCharts = () => {
    if (document.getElementById('greet-name')) window.updateGreeting();

    if (!state.washingData || state.washingData.length === 0) {
        state.washingData = JSON.parse(localStorage.getItem('srf_washing_history') || '[]');
    }

    // --- DATA PREPARATION ---
    // --- STATE & CONFIG ---
    if (!state.chartModes) state.chartModes = { production: 'weekly', washing: 'weekly' };

    // --- HELPER: Update Mode & Re-render ---
    window.updateChartMode = (type, mode) => {
        state.chartModes[type] = mode;

        // Update Button Styles
        ['daily', 'weekly', 'annual'].forEach(m => {
            const btn = document.getElementById(`btn-${type === 'production' ? 'prod' : 'wash'}-${m}`);
            if (btn) {
                if (m === mode) {
                    btn.className = "px-3 py-1 rounded-md bg-white shadow-sm transition " + (type === 'production' ? 'text-indigo-600' : 'text-blue-600');
                } else {
                    btn.className = "px-3 py-1 rounded-md transition text-slate-500 " + (type === 'production' ? 'hover:text-indigo-600' : 'hover:text-blue-600');
                }
            }
        });

        window.renderCharts();
    };


    // --- HELPER: Toggle Menu ---
    window.toggleChartMenu = () => {
        const menu = document.getElementById('chart-settings-menu');
        if (menu) menu.classList.toggle('hidden');
    };

    // --- HELPER: Change Global Chart Type ---
    window.changeGlobalChartType = (type) => {
        state.chartTypePreference = type;

        if (type === 'pie') {
            // Auto-switch to annual view for both charts
            state.chartModes.production = 'annual';
            state.chartModes.washing = 'annual';

            // Helper to update buttons visual state
            const updateButtons = (chartType) => {
                ['daily', 'weekly', 'annual'].forEach(m => {
                    const btn = document.getElementById(`btn-${chartType === 'production' ? 'prod' : 'wash'}-${m}`);
                    if (btn) {
                        if (m === 'annual') {
                            btn.className = "px-3 py-1 rounded-md bg-white shadow-sm transition " + (chartType === 'production' ? 'text-indigo-600' : 'text-blue-600');
                        } else {
                            btn.className = "px-3 py-1 rounded-md transition text-slate-500 " + (chartType === 'production' ? 'hover:text-indigo-600' : 'hover:text-blue-600');
                        }
                    }
                });
            };

            updateButtons('production');
            updateButtons('washing');
        }

        window.toggleChartMenu();
        window.renderCharts();
    };

    // --- DATA PREPARATION ---
    const now = new Date();
    const currentMonth_Index = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth_Index + 1, 0).getDate();

    // Arrays for different views
    const prodDataVals = {
        daily: new Array(daysInMonth).fill(0),
        weekly: new Array(4).fill(0),
        annual: new Array(12).fill(0)
    };
    const washDataVals = {
        daily: new Array(daysInMonth).fill(0),
        weekly: new Array(4).fill(0),
        annual: new Array(12).fill(0)
    };

    const fiscalYearStart = (currentMonth_Index >= 3) ? currentYear : currentYear - 1;

    // --- PROCESS PRODUCTION DATA ---
    state.historyData.forEach(d => {
        if (d.type && d.type !== 'production') return;
        const dt = new Date(d.fullDate);
        const m = dt.getMonth();
        const y = dt.getFullYear();
        const day = dt.getDate();
        const total = Number(d.total || 0);

        // 1. Annual (Fiscal Year)
        const dataFiscalYear = (m >= 3) ? y : y - 1;
        if (dataFiscalYear === fiscalYearStart) {
            prodDataVals.annual[(m + 9) % 12] += total;
        }

        // 2. Weekly & Daily (Current Month Only)
        if (y === currentYear && m === currentMonth_Index) {
            // Weekly
            let weekIdx = Math.floor((day - 1) / 7);
            if (weekIdx > 3) weekIdx = 3;
            prodDataVals.weekly[weekIdx] += total;

            // Daily
            prodDataVals.daily[day - 1] += total;
        }
    });

    // --- PROCESS WASHING DATA ---
    if (state.washingData && Array.isArray(state.washingData)) {
        state.washingData.forEach(d => {
            if (!d.fullDate) return;
            const dt = new Date(d.fullDate);
            const m = dt.getMonth();
            const y = dt.getFullYear();
            const day = dt.getDate();
            const total = Number(d.total || 0);

            // 1. Annual
            const dataFiscalYear = (m >= 3) ? y : y - 1;
            if (dataFiscalYear === fiscalYearStart) {
                washDataVals.annual[(m + 9) % 12] += total;
            }

            // 2. Weekly & Daily
            if (y === currentYear && m === currentMonth_Index) {
                let weekIdx = Math.floor((day - 1) / 7);
                if (weekIdx > 3) weekIdx = 3;
                washDataVals.weekly[weekIdx] += total;
                washDataVals.daily[day - 1] += total;
            }
        });
    }

    // --- DETERMINE CHART TYPE BASED ON CONSTRAINTS ---
    const getChartType = (mode) => {
        const pref = state.chartTypePreference || 'line'; // Default to line

        // Constraint 1: Daily reports cannot be Bar (force Line)
        if (mode === 'daily' && pref === 'bar') return 'line';

        // Constraint 2: Pie chart only for Annual (force Line for others)
        if (pref === 'pie' && mode !== 'annual') return 'line';

        return pref;
    };

    // --- RENDER CHART 1: PRODUCTION ---
    const ctx1 = document.getElementById('productionChart');
    if (window.prodChartInstance) window.prodChartInstance.destroy();
    if (ctx1) {
        let labels, data;
        const mode = state.chartModes.production;
        const chartType = getChartType(mode);

        if (mode === 'daily') {
            labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            data = prodDataVals.daily;
        } else if (mode === 'weekly') {
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4+'];
            data = prodDataVals.weekly;
        } else {
            labels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
            data = prodDataVals.annual;
        }

        window.prodChartInstance = new Chart(ctx1, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Production',
                    data: data,
                    backgroundColor: chartType === 'pie' ? [
                        '#ef4444', // Red
                        '#3b82f6', // Blue
                        '#eab308', // Yellow
                        '#22c55e', // Green
                        '#a855f7', // Purple
                        '#f97316', // Orange
                        '#ec4899', // Pink
                        '#06b6d4', // Cyan
                        '#84cc16', // Lime
                        '#6366f1', // Indigo
                        '#f43f5e', // Rose
                        '#14b8a6'  // Teal
                    ] : (chartType === 'bar' ? '#6366f1' : 'rgba(99, 102, 241, 0.1)'),
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    borderRadius: 4,
                    tension: 0.3,
                    fill: chartType === 'line',
                    pointBackgroundColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: chartType === 'pie' } },
                scales: {
                    x: { grid: { display: false }, display: chartType !== 'pie' },
                    y: { border: { display: false }, beginAtZero: true, display: chartType !== 'pie' }
                }
            }
        });
    }

    // --- RENDER CHART 2: WASHING ---
    const ctx2 = document.getElementById('washingChart');
    if (window.washChartInstance) window.washChartInstance.destroy();
    if (ctx2) {
        let labels, data;
        const mode = state.chartModes.washing;
        const chartType = getChartType(mode);

        if (mode === 'daily') {
            labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            data = washDataVals.daily;
        } else if (mode === 'weekly') {
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4+'];
            data = washDataVals.weekly;
        } else {
            labels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
            data = washDataVals.annual;
        }

        window.washChartInstance = new Chart(ctx2, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Washing',
                    data: data,
                    backgroundColor: chartType === 'pie' ? [
                        '#ef4444', // Red
                        '#3b82f6', // Blue
                        '#eab308', // Yellow
                        '#22c55e', // Green
                        '#a855f7', // Purple
                        '#f97316', // Orange
                        '#ec4899', // Pink
                        '#06b6d4', // Cyan
                        '#84cc16', // Lime
                        '#6366f1', // Indigo
                        '#f43f5e', // Rose
                        '#14b8a6'  // Teal
                    ] : '#3b82f6',
                    borderRadius: 4,
                    barPercentage: mode === 'daily' ? 0.8 : 0.6,
                    // Line chart props if fallback
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: chartType === 'line',
                    pointBackgroundColor: '#fff'

                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: chartType === 'pie' } },
                scales: {
                    x: { grid: { display: false }, display: chartType !== 'pie' },
                    y: { border: { display: false }, beginAtZero: true, display: chartType !== 'pie' }
                }
            }
        });
    }

    // --- CHART 4: SALARY DISTRIBUTION PIE CHART ---
    // Change: Type 'pie' (Circle) instead of 'doughnut'
    const ctx4 = document.getElementById('salaryPieChart');
    if (window.chart4) window.chart4.destroy();
    if (ctx4) {
        const m = currentMonth_Index + 1;
        const y = currentYear;
        const daysInMonth = new Date(y, m, 0).getDate();

        let tTime = 0, tFB = 0, tAssembly = 0;

        const RATES = (window.CONFIG && window.CONFIG.RATES) ? window.CONFIG.RATES : { OT_PER_HOUR: 45, NPL_FINE: 500, ATTENDANCE_BONUS: 600 };

        state.staffData.forEach(emp => {
            const lId = `${emp.id}_${y}_${m}`;
            const ledger = state.staffLedgers[lId] || { days: {}, salary: 0, advance: 0, pcsEntries: [] };
            const advance = parseFloat(ledger.advance) || 0;
            let earned = 0;

            if (emp.type === 'timings') {
                const basicSalary = parseFloat(ledger.salary) || 0;
                const dailyWage = basicSalary / 30;
                const hourlyWage = dailyWage / 8;
                let fullDays = 0, partialHours = 0, totalOTHours = 0, nplCount = 0, leaveCount = 0, absentDays = 0;
                const dayMap = ledger.days || {};

                for (let i = 1; i <= daysInMonth; i++) {
                    const d = dayMap[i] || {};
                    const dObj = new Date(y, m - 1, i);
                    const isSun = dObj.getDay() === 0 || d.status === 'SUNDAY';
                    const isHol = d.status === 'HOLIDAY';

                    if (isSun || isHol) { fullDays++; if (d.hours) totalOTHours += Number(d.hours); }
                    else {
                        if (d.status === 'NPL') { nplCount++; absentDays++; }
                        else if (d.status === 'LEAVE') { leaveCount++; absentDays++; }
                        else if (d.hours) {
                            const h = Number(d.hours);
                            const ot = Number(d.ot) || 0;
                            totalOTHours += ot;
                            const normal = h - ot;
                            if (normal >= 8) fullDays++; else partialHours += normal;
                        } else { if (!d.in && !d.out && !d.status) absentDays++; }
                    }
                }
                const incentive = (absentDays === 0 && nplCount === 0 && leaveCount === 0) ? RATES.ATTENDANCE_BONUS : 0;
                earned = (fullDays * dailyWage) + (partialHours * hourlyWage) + (totalOTHours * RATES.OT_PER_HOUR) + incentive - (nplCount * RATES.NPL_FINE);
            } else {
                (ledger.pcsEntries || []).forEach(row => earned += Number(row.total || 0));
            }

            const net = Math.max(0, earned - advance);

            if (emp.type === 'timings') {
                tTime += net;
            } else {
                const role = (emp.role || '').toLowerCase();
                if (role.includes('front') || role.includes('back')) tFB += net;
                else tAssembly += net;
            }
        });

        window.chart4 = new Chart(ctx4, {
            type: 'pie', // Changed to PIE (Circle)
            data: {
                labels: ['Time Based', 'Front & Back', 'Assembly'],
                datasets: [{
                    data: [Math.round(tTime), Math.round(tFB), Math.round(tAssembly)],
                    backgroundColor: ['#4f46e5', '#10b981', '#2563eb'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                if (label) label += ': ';
                                if (context.parsed !== null) label += '₹' + context.parsed.toLocaleString('en-IN');
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    const washingBody = document.getElementById('washing-body');
    if (washingBody && washingBody.children.length === 0) {
        window.addWashingRow();
    }
};