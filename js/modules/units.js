console.log("Units Module Loaded");

window.renderUnitsView = () => {
    // 1. Calculate Staff Counts
    const staffCounts = {
        Cutting: 0,
        FB: 0,
        Assembly: 0,
        Finishing: 0
    };

    if (state.staffData) {
        state.staffData.forEach(emp => {
            if (emp.unit && staffCounts[emp.unit] !== undefined) {
                staffCounts[emp.unit]++;
            }
        });
    }

    // 2. Calculate Piece Counts (Today)
    const today = new Date().toISOString().split('T')[0];
    const piecesCounts = {
        Cutting: 0,
        FB: 0,
        Assembly: 0,
        Finishing: 0
    };

    if (state.unitPiecesData) {
        state.unitPiecesData.forEach(entry => {
            // Only count today's production for the main dashboard card, or total? 
            // Usually dashboard shows "Today" or "Total". Let's show Today for relevance.
            if (entry.date === today && piecesCounts[entry.unit] !== undefined) {
                piecesCounts[entry.unit] += parseInt(entry.count || 0);
            }
        });
    }

    // 3. Update UI
    setTimeout(() => {
        // Staff Counts
        if (document.getElementById('count-cutting')) document.getElementById('count-cutting').innerText = staffCounts.Cutting;
        if (document.getElementById('count-fb')) document.getElementById('count-fb').innerText = staffCounts.FB;
        if (document.getElementById('count-assembly')) document.getElementById('count-assembly').innerText = staffCounts.Assembly;
        if (document.getElementById('count-finishing')) document.getElementById('count-finishing').innerText = staffCounts.Finishing;

        // Piece Counts
        if (document.getElementById('pcs-cutting')) document.getElementById('pcs-cutting').innerText = piecesCounts.Cutting;
        if (document.getElementById('pcs-fb')) document.getElementById('pcs-fb').innerText = piecesCounts.FB;
        if (document.getElementById('pcs-assembly')) document.getElementById('pcs-assembly').innerText = piecesCounts.Assembly;
        if (document.getElementById('pcs-finishing')) document.getElementById('pcs-finishing').innerText = piecesCounts.Finishing;
    }, 50);
};

window.filterUnit = (unitName) => {
    const panel = document.getElementById('unit-details-panel');
    const title = document.getElementById('selected-unit-title');
    const list = document.getElementById('unit-staff-list');
    const trackingSection = document.getElementById('unit-tracking-section'); // New

    if (!panel || !list) return;

    // Show Panel
    panel.classList.remove('hidden');
    title.innerText = (unitName === 'FB' ? 'Front & Back' : unitName) + ' Unit';

    // Set Unit for Tracking
    if (trackingSection) {
        trackingSection.dataset.unit = unitName;
        renderUnitProductionLog(unitName);
    }

    // Filter Staff
    const staff = state.staffData ? state.staffData.filter(e => e.unit === unitName) : [];

    if (staff.length === 0) {
        list.innerHTML = `<div class="col-span-full text-center text-slate-400 italic py-4">No staff assigned to this unit yet.</div>`;
    } else {
        list.innerHTML = staff.map(emp => `
             <div onclick="window.openLedger('${emp.id}')" class="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex items-center gap-4 group">
                 <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-slate-600 border border-slate-200 group-hover:text-indigo-600 group-hover:border-indigo-200 transition">
                     ${emp.name.charAt(0)}
                 </div>
                 <div>
                     <h4 class="font-bold text-slate-700 group-hover:text-indigo-700 transition phone-masked">${emp.name}</h4>
                     <p class="text-xs text-slate-500">${emp.role}</p>
                 </div>
                 <div class="ml-auto">
                     <i class="fa-solid fa-chevron-right text-slate-300 group-hover:text-indigo-400 text-xs"></i>
                 </div>
             </div>
         `).join('');
    }

    // Scroll to panel
    panel.scrollIntoView({ behavior: 'smooth' });
};

window.renderUnitProductionLog = (unitName) => {
    const logContainer = document.getElementById('unit-production-log');
    if (!logContainer) return;

    // Filter logs for this unit, sort by date desc
    const logs = (state.unitPiecesData || [])
        .filter(entry => entry.unit === unitName)
        .sort((a, b) => new Date(b.date) - new Date(a.date) || b.timestamp - a.timestamp); // Sort by date desc, then timestamp

    if (logs.length === 0) {
        logContainer.innerHTML = `<div class="text-center text-slate-400 italic py-4">No production records found.</div>`;
        return;
    }

    logContainer.innerHTML = logs.map(log => `
          <div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
              <div>
                  <p class="text-xs font-bold text-slate-700">${new Date(log.date).toLocaleDateString()}</p>
                  <p class="text-[10px] text-slate-400">${new Date(log.timestamp).toLocaleTimeString()}</p>
                  ${log.catalogueName ? `<p class="text-[10px] text-indigo-500 font-bold mt-0.5"><i class="fa-solid fa-tag mr-1"></i>${log.catalogueName}</p>` : ''}
              </div>
              <div class="flex items-center gap-4">
                  <span class="font-bold text-indigo-600">${log.count} Pcs</span>
                  <button onclick="deleteUnitLog('${log.id}')" class="text-slate-300 hover:text-red-500 transition"><i class="fa-solid fa-trash"></i></button>
              </div>
          </div>
      `).join('');
};

window.updatePiecePreview = (input) => {
    const val = input.value;
    const datalist = document.getElementById('catalogue-list-options');
    const options = datalist ? Array.from(datalist.options) : [];
    const selectedOption = options.find(opt => opt.value === val);
    const preview = document.getElementById('unit-pcs-preview');

    if (selectedOption) {
        const total = selectedOption.dataset.total;
        if (preview) {
            preview.innerHTML = `Total Pieces: <span class="font-bold text-indigo-600">${total}</span>`;
            preview.classList.remove('hidden');
        }
        input.dataset.selectedId = selectedOption.dataset.id;
        input.dataset.selectedTotal = total;
    } else {
        if (preview) preview.classList.add('hidden');
        input.dataset.selectedId = "";
        input.dataset.selectedTotal = "";
    }
};

window.addUnitPieces = () => {
    const trackingSection = document.getElementById('unit-tracking-section');
    const unitName = trackingSection ? trackingSection.dataset.unit : null;
    const input = document.getElementById('unit-catalogue-input');

    if (!unitName || !input) return;

    // Validate Selection
    const catalogueId = input.dataset.selectedId;
    const count = parseInt(input.dataset.selectedTotal);
    const catalogueName = input.value;

    if (!catalogueId || isNaN(count) || count <= 0) {
        alert("Please select a valid catalogue item from the list.");
        return;
    }

    const newEntry = {
        id: Date.now().toString(),
        unit: unitName,
        count: count,
        catalogueId: catalogueId, // Link
        catalogueName: catalogueName, // Snapshot
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        addedBy: 'Manager'
    };

    if (!state.unitPiecesData) state.unitPiecesData = [];
    state.unitPiecesData.push(newEntry);

    // Save & Sync
    localStorage.setItem('srf_unit_pieces', JSON.stringify(state.unitPiecesData));
    if (window.saveToCloud) window.saveToCloud('unitPiecesData', state.unitPiecesData);

    // Update UI
    input.value = '';
    input.dataset.selectedId = "";
    input.dataset.selectedTotal = "";
    document.getElementById('unit-pcs-preview').classList.add('hidden');

    renderUnitProductionLog(unitName);
    renderUnitsView(); // Update main card counts
};

window.deleteUnitLog = (id) => {
    if (!confirm("Are you sure you want to delete this specific entry?")) return;

    state.unitPiecesData = state.unitPiecesData.filter(item => item.id !== id);

    // Save & Sync
    localStorage.setItem('srf_unit_pieces', JSON.stringify(state.unitPiecesData));
    if (window.saveToCloud) window.saveToCloud('unitPiecesData', state.unitPiecesData);

    // Update UI
    const trackingSection = document.getElementById('unit-tracking-section');
    const unitName = trackingSection ? trackingSection.dataset.unit : null;
    if (unitName) renderUnitProductionLog(unitName);
    renderUnitsView();
};

window.closeUnitDetails = () => {
    document.getElementById('unit-details-panel').classList.add('hidden');
};
