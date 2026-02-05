console.log("Units Module Loaded");

window.renderUnitsView = () => {
    // 1. Calculate Counts
    const counts = {
        Cutting: 0,
        FB: 0,
        Assembly: 0,
        Finishing: 0
    };

    if (state.staffData) {
        state.staffData.forEach(emp => {
            if (emp.unit && counts[emp.unit] !== undefined) {
                counts[emp.unit]++;
            }
        });
    }

    // 2. Update UI
    setTimeout(() => {
        if (document.getElementById('count-cutting')) document.getElementById('count-cutting').innerText = counts.Cutting;
        if (document.getElementById('count-fb')) document.getElementById('count-fb').innerText = counts.FB;
        if (document.getElementById('count-assembly')) document.getElementById('count-assembly').innerText = counts.Assembly;
        if (document.getElementById('count-finishing')) document.getElementById('count-finishing').innerText = counts.Finishing;
    }, 50);
};

window.filterUnit = (unitName) => {
    const panel = document.getElementById('unit-details-panel');
    const title = document.getElementById('selected-unit-title');
    const list = document.getElementById('unit-staff-list');

    if (!panel || !list) return;

    // Show Panel
    panel.classList.remove('hidden');
    title.innerText = (unitName === 'FB' ? 'Front & Back' : unitName) + ' Unit Staff';

    // Filter Staff
    const staff = state.staffData ? state.staffData.filter(e => e.unit === unitName) : [];

    if (staff.length === 0) {
        list.innerHTML = `<div class="col-span-full text-center text-slate-400 italic py-8">No staff assigned to this unit yet.</div>`;
        // Scroll to panel
        panel.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    list.innerHTML = staff.map(emp => `
        <div onclick="window.openLedger('${emp.id}')" class="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex items-center gap-4 group">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-slate-600 border border-slate-200 group-hover:text-indigo-600 group-hover:border-indigo-200 transition">
                ${emp.name.charAt(0)}
            </div>
            <div>
                <h4 class="font-bold text-slate-700 group-hover:text-indigo-700 transition">${emp.name}</h4>
                <p class="text-xs text-slate-500">${emp.role}</p>
            </div>
            <div class="ml-auto">
                <i class="fa-solid fa-chevron-right text-slate-300 group-hover:text-indigo-400 text-xs"></i>
            </div>
        </div>
    `).join('');

    // Scroll to panel
    panel.scrollIntoView({ behavior: 'smooth' });
};

window.closeUnitDetails = () => {
    document.getElementById('unit-details-panel').classList.add('hidden');
};
