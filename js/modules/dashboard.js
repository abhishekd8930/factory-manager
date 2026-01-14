console.log("Dashboard Module Loaded");

// --- 1. PRODUCTION LEDGER ---

// NEW: Auto-load draft if it exists
window.addLedgerRow = () => { 
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
    if(btn) {
        btn.closest('tr').remove();
        updateHUD();
    }
};

window.updateHUD = () => { 
    let t=0, m=0; 
    document.querySelectorAll('.total-val').forEach(i => t+=Number(i.value)); 
    document.querySelectorAll('.missing-val').forEach(i => m+=Number(i.value)); 
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
        if(window.saveToCloud) window.saveToCloud('srf_production_history', state.historyData);
        document.getElementById('ledger-body').innerHTML = '';
        window.addLedgerRow();
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
            if(!state.washingData) state.washingData = []; 
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
        if(window.saveToCloud) window.saveToCloud('srf_washing_history', state.washingData);
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

    if(msgEl) msgEl.innerText = greetingText + ",";
    if(nameEl) nameEl.innerText = name;
    if(iconEl) iconEl.className = `fa-solid ${icon} text-yellow-400 text-3xl`;

    const dateEl = document.getElementById('home-date');
    if(dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.innerText = now.toLocaleDateString('en-IN', options);
    }
};

// --- 4. CHARTS & RENDER ---
window.renderCharts = () => {
    if(document.getElementById('greet-name')) window.updateGreeting();

    if(!state.washingData || state.washingData.length === 0) {
        state.washingData = JSON.parse(localStorage.getItem('srf_washing_history') || '[]');
    }

    // --- DATA PREPARATION ---
    const monthlyProd = new Array(12).fill(0); 
    const weeklyProd = new Array(4).fill(0);
    const weeklyWash = new Array(4).fill(0); 
    
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const currentYear = now.getFullYear();
    const fiscalYearStart = (currentMonthIndex >= 3) ? currentYear : currentYear - 1;

    // Production Data
    state.historyData.forEach(d => {
        if (d.type && d.type !== 'production') return;
        const dt = new Date(d.fullDate);
        const m = dt.getMonth();
        const y = dt.getFullYear();
        const dataFiscalYear = (m >= 3) ? y : y - 1;
        
        if(dataFiscalYear === fiscalYearStart) {
            monthlyProd[(m + 9) % 12] += Number(d.total||0);
        }
        if(y === currentYear && m === currentMonthIndex) {
            const day = dt.getDate();
            let weekIdx = Math.floor((day - 1) / 7);
            if (weekIdx > 3) weekIdx = 3;
            if (weekIdx >= 0) weeklyProd[weekIdx] += Number(d.total||0);
        }
    });

    // Washing Data (Processing for THIS MONTH only)
    if(state.washingData && Array.isArray(state.washingData)) {
        state.washingData.forEach(d => {
            if(!d.fullDate) return; 
            const dt = new Date(d.fullDate);
            const m = dt.getMonth();
            const y = dt.getFullYear();
            
            if(y === currentYear && m === currentMonthIndex) {
                const day = dt.getDate();
                let weekIdx = Math.floor((day - 1) / 7);
                if (weekIdx > 3) weekIdx = 3;
                if (weekIdx >= 0) weeklyWash[weekIdx] += Number(d.total||0);
            }
        });
    }

    // --- CHART 1: PRODUCTION (ANNUAL) ---
    const ctx1 = document.getElementById('revenueChart');
    if(window.chart1) window.chart1.destroy();
    if(ctx1) {
        window.chart1 = new Chart(ctx1, { 
            type: 'bar', 
            data: { 
                labels: ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'], 
                datasets: [{ label: `Production`, data: monthlyProd, backgroundColor: '#6366f1', borderRadius: 4 }] 
            }, 
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: {display: true} }, scales: { x: {grid: {display: false}}, y: {border: {display: false}} } } 
        });
    }
    
    // --- CHART 2: PRODUCTION (WEEKLY) ---
    const ctx2 = document.getElementById('weeklyChart');
    if(window.chart2) window.chart2.destroy();
    if(ctx2) {
        window.chart2 = new Chart(ctx2, { 
            type: 'line', 
            data: { 
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], 
                datasets: [{ label: 'This Month', data: weeklyProd, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.4, fill: true, pointBackgroundColor: '#fff', pointBorderColor: '#10b981', pointBorderWidth: 2 }] 
            }, 
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: {display: false} }, scales: { x: {grid: {display: false}}, y: {border: {display: false}, beginAtZero: true} } } 
        });
    }

    // --- CHART 3: WASHING (MONTHLY/WEEKLY) ---
    // Change: Thinner Bars (barPercentage)
    const ctx3 = document.getElementById('washingChart');
    if(window.chart3) window.chart3.destroy();
    if(ctx3) {
        window.chart3 = new Chart(ctx3, { 
            type: 'bar', 
            data: { 
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], 
                datasets: [{ 
                    label: `Washed Pcs`, 
                    data: weeklyWash, 
                    backgroundColor: '#3b82f6', 
                    borderRadius: 4,
                    barPercentage: 0.5 // Thinner bars
                }] 
            }, 
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: {display: false} }, 
                scales: { x: {grid: {display: false}}, y: {border: {display: false}, beginAtZero: true} } 
            } 
        });
    }

    // --- CHART 4: SALARY DISTRIBUTION PIE CHART ---
    // Change: Type 'pie' (Circle) instead of 'doughnut'
    const ctx4 = document.getElementById('salaryPieChart');
    if(window.chart4) window.chart4.destroy();
    if(ctx4) {
        const m = currentMonthIndex + 1; 
        const y = currentYear;
        const daysInMonth = new Date(y, m, 0).getDate();
        
        let tTime = 0, tFB = 0, tAssembly = 0;
        
        const RATES = (window.CONFIG && window.CONFIG.RATES) ? window.CONFIG.RATES : { OT_PER_HOUR: 45, NPL_FINE: 500, ATTENDANCE_BONUS: 600 };

        state.staffData.forEach(emp => {
            const lId = `${emp.id}_${y}_${m}`;
            const ledger = state.staffLedgers[lId] || { days: {}, salary: 0, advance: 0, pcsEntries: [] };
            const advance = parseFloat(ledger.advance) || 0;
            let earned = 0;

            if(emp.type === 'timings') {
                const basicSalary = parseFloat(ledger.salary) || 0;
                const dailyWage = basicSalary / 30;
                const hourlyWage = dailyWage / 8;
                let fullDays = 0, partialHours = 0, totalOTHours = 0, nplCount = 0, leaveCount = 0, absentDays = 0;
                const dayMap = ledger.days || {};

                for(let i=1; i<=daysInMonth; i++) {
                    const d = dayMap[i] || {}; 
                    const dObj = new Date(y, m-1, i);
                    const isSun = dObj.getDay() === 0 || d.status === 'SUNDAY';
                    const isHol = d.status === 'HOLIDAY';

                    if(isSun || isHol) { fullDays++; if(d.hours) totalOTHours += Number(d.hours); } 
                    else {
                        if (d.status === 'NPL') { nplCount++; absentDays++; }
                        else if (d.status === 'LEAVE') { leaveCount++; absentDays++; }
                        else if (d.hours) {
                            const h = Number(d.hours);
                            const ot = Number(d.ot) || 0;
                            totalOTHours += ot;
                            const normal = h - ot;
                            if(normal >= 8) fullDays++; else partialHours += normal;
                        } else { if (!d.in && !d.out && !d.status) absentDays++; }
                    }
                }
                const incentive = (absentDays===0 && nplCount===0 && leaveCount===0) ? RATES.ATTENDANCE_BONUS : 0;
                earned = (fullDays * dailyWage) + (partialHours * hourlyWage) + (totalOTHours * RATES.OT_PER_HOUR) + incentive - (nplCount * RATES.NPL_FINE);
            } else {
                (ledger.pcsEntries || []).forEach(row => earned += Number(row.total || 0));
            }

            const net = Math.max(0, earned - advance);

            if(emp.type === 'timings') {
                tTime += net;
            } else {
                const role = (emp.role || '').toLowerCase();
                if(role.includes('front') || role.includes('back')) tFB += net;
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
                            label: function(context) {
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
    if(washingBody && washingBody.children.length === 0) {
        window.addWashingRow();
    }
};