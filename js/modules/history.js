console.log("History Module Loaded");

// --- 1. NAVIGATION & FILTERING (Your Existing Logic) ---

window.changePage = (d) => {
    const searchVal = document.getElementById('history-search').value;
    // Only allow month navigation if not searching
    if (!searchVal) {
        state.historyDate.setMonth(state.historyDate.getMonth() - d);
        window.renderHistoryPage();
    }
};

window.renderHistoryPage = () => {
    const searchInput = document.getElementById('history-search');
    if (!searchInput) return; // Exit if history view is not active
    const s = searchInput.value.toLowerCase().trim();
    const monthLabel = document.getElementById('history-month-label');
    const pageContent = document.getElementById('history-page-content');
    const controls = document.getElementById('history-controls');

    // Ensure data sources exist (Default to empty array if state is not yet loaded)
    const prodDataSrc = state.historyData || [];
    const washingDataSrc = state.washingData || [];

    let prodData = [];
    let washData = [];

    // --- A. FILTER LOGIC ---
    if (s) {
        // Search Mode
        monthLabel.innerText = "Search Results";
        controls.classList.add('opacity-40', 'pointer-events-none');

        // Filter Production Logs
        prodData = prodDataSrc.filter(i => {
            const dateStr = (i.fullDate || '').toLowerCase();
            const descStr = (i.desc || '').toLowerCase();
            const totalStr = String(i.total || '').toLowerCase();
            return dateStr.includes(s) || descStr.includes(s) || totalStr.includes(s);
        });

        // Filter Washing Logs
        washData = washingDataSrc.filter(i => {
            const dateStr = (i.fullDate || '').toLowerCase();
            const descStr = (i.desc || '').toLowerCase();
            return dateStr.includes(s) || descStr.includes(s);
        });

    } else {
        // Month View Mode
        const m = state.historyDate.getMonth();
        const y = state.historyDate.getFullYear();
        monthLabel.innerText = new Date(y, m).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        controls.classList.remove('opacity-40', 'pointer-events-none');

        // Filter by Date
        prodData = prodDataSrc.filter(i => { const d = new Date(i.fullDate); return d.getMonth() === m && d.getFullYear() === y; });
        washData = washingDataSrc.filter(i => { const d = new Date(i.fullDate); return d.getMonth() === m && d.getFullYear() === y; });
    }

    // --- B. CALCULATE TOTALS ---
    // Sort Newest -> Oldest
    prodData.sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));
    washData.sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));

    const sumTotal = prodData.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const sumMissing = prodData.reduce((acc, curr) => acc + (Number(curr.missing) || 0), 0);
    const sumWashing = washData.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

    // --- C. RENDER HTML ---
    let html = '';

    // 1. SUMMARY CARDS
    html += `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border-b border-slate-200">
        
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div class="absolute right-0 top-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-2 -mt-2 transition group-hover:scale-110"></div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider relative z-10">Total Production</p>
            <p class="text-2xl font-bold text-indigo-600 relative z-10">${sumTotal.toLocaleString()} <span class="text-sm text-slate-400 font-medium">Pcs</span></p>
        </div>

        <div class="bg-white p-4 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden group">
            <div class="absolute right-0 top-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-2 -mt-2 transition group-hover:scale-110"></div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider relative z-10">Total Washing</p>
            <p class="text-2xl font-bold text-blue-600 relative z-10">${sumWashing.toLocaleString()} <span class="text-sm text-slate-400 font-medium">Pcs</span></p>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div class="absolute right-0 top-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-2 -mt-2 transition group-hover:scale-110"></div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider relative z-10">Total Missing</p>
            <p class="text-2xl font-bold text-red-500 relative z-10">${sumMissing.toLocaleString()} <span class="text-sm text-slate-400 font-medium">Pcs</span></p>
        </div>

    </div>`;

    // 2. PRODUCTION TABLE
    html += `<div class="p-4 bg-slate-50 border-b border-slate-200"><h3 class="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><i class="fa-solid fa-layer-group"></i> Production Logs</h3></div>`;

    if (prodData.length > 0) {
        html += `<div class="overflow-x-auto"><table class="w-full text-sm text-left border-collapse">
        <thead class="text-slate-500 bg-white border-b">
            <tr>
                <th class="p-4 font-semibold w-32">Date</th>
                <th class="p-4 font-semibold">Item / Description</th>
                <th class="p-4 font-semibold text-center w-24">Missing</th>
                <th class="p-4 font-semibold text-right w-24">Total Pcs</th>
            </tr>
        </thead>
        <tbody>`;

        html += prodData.map(r => `
            <tr class="border-b hover:bg-slate-50 transition border-slate-100">
                <td class="p-4 whitespace-nowrap text-slate-500 font-medium text-xs">${r.fullDate}</td>
                <td class="p-4 font-bold text-slate-700">${r.desc}</td>
                <td class="p-4 text-center font-bold ${r.missing > 0 ? 'text-red-500' : 'text-slate-300'}">${r.missing || '-'}</td>
                <td class="p-4 text-right text-indigo-600 font-bold text-base">${r.total}</td>
            </tr>`).join('');

        html += `</tbody></table></div>`;
    } else {
        html += `<div class="p-8 text-center text-slate-400 text-sm italic">No production records found for this period.</div>`;
    }

    // 3. WASHING TABLE
    html += `<div class="p-4 bg-blue-50/50 border-t border-b border-blue-100 mt-0"><h3 class="text-xs font-bold text-blue-500 uppercase flex items-center gap-2"><i class="fa-solid fa-soap"></i> Washing Archive</h3></div>`;

    if (washData.length > 0) {
        html += `<div class="overflow-x-auto"><table class="w-full text-sm text-left border-collapse">
        <thead class="text-slate-500 bg-white border-b">
            <tr>
                <th class="p-4 font-semibold w-32">Date</th>
                <th class="p-4 font-semibold">Details / Batch</th>
                <th class="p-4 font-semibold text-right w-24">Washed Pcs</th>
            </tr>
        </thead>
        <tbody>`;

        html += washData.map(r => `
            <tr class="border-b hover:bg-blue-50/30 transition border-slate-100">
                <td class="p-4 whitespace-nowrap text-slate-500 font-medium text-xs">${r.fullDate}</td>
                <td class="p-4 font-bold text-slate-700">${r.desc}</td>
                <td class="p-4 text-right text-blue-600 font-bold text-base">${r.total}</td>
            </tr>`).join('');

        html += `</tbody></table></div>`;
    } else {
        html += `<div class="p-8 text-center text-slate-400 text-sm italic">No washing records found for this period.</div>`;
    }

    pageContent.innerHTML = html;
};


// ===============================================
// 2. FIREBASE DATABASE CONNECTION (NEW ADDITION)
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // We add a small delay to ensure Firebase (in main.js) has initialized
    setTimeout(() => {
        if (window.database) {
            console.log("History Module: Connecting to Firebase Database...");
            const db = window.database;

            // --- LISTENER 1: Sync Production Data ---
            db.ref('historyData').on('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    // Update the global state
                    window.state.historyData = data;

                    // Backup to LocalStorage (so it works offline next time)
                    localStorage.setItem('srf_production_history', JSON.stringify(data));

                    // If the user is currently looking at the History page, Refresh it automatically
                    if (document.getElementById('history-page-content')) {
                        window.renderHistoryPage();
                    }
                }
            });

            // --- LISTENER 2: Sync Washing Data ---
            db.ref('washingData').on('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    // Update the global state
                    window.state.washingData = data;

                    // Backup to LocalStorage
                    localStorage.setItem('srf_washing_history', JSON.stringify(data));

                    // Refresh if viewing history
                    if (document.getElementById('history-page-content')) {
                        window.renderHistoryPage();
                    }
                }
            });

            console.log("History Module: Database Connected.");
        } else {
            console.warn("History Module: Firebase not detected. Using Local Data.");
        }
    }, 2000); // 2 second delay to wait for App Init
});