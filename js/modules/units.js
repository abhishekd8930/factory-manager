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
        if (window.renderUnitProblems) renderUnitProblems(unitName);
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

// --- Catalogue Selection Modal Logic ---

window.openUnitCatalogueSelection = () => {
    const staffView = document.getElementById('unit-staff-view');
    const catalogueView = document.getElementById('unit-catalogue-view');
    const grid = document.getElementById('unit-catalogue-grid');
    const header = document.getElementById('unit-section-header');

    if (!staffView || !catalogueView || !grid) return;

    // Toggle Views
    staffView.classList.add('hidden');
    catalogueView.classList.remove('hidden');

    // Update Header
    if (header) header.innerText = "Select Item to Add";

    // Get catalogues
    let catalogues = JSON.parse(localStorage.getItem('catalogueItems')) || [];

    // Filter out finished items
    // Logic: If total pieces in 'Finishing' unit >= Total Ledger Pieces, hide it.
    catalogues = catalogues.filter(item => {
        const totalPlanned = (item.ledger || []).reduce((sum, row) => sum + (parseInt(row.total) || 0), 0);
        if (totalPlanned === 0) return true; // Show if no plan yet

        const totalFinished = (state.unitPiecesData || [])
            .filter(log => log.unit === 'Finishing' && log.catalogueId === item.id)
            .reduce((sum, log) => sum + (parseInt(log.count) || 0), 0);

        return totalFinished < totalPlanned;
    });

    if (catalogues.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center text-slate-400 italic py-8">No available items (All finished).</div>`;
    } else {
        grid.innerHTML = catalogues.map(item => {
            const totalPcs = (item.ledger || []).reduce((sum, row) => sum + (parseInt(row.total) || 0), 0);
            return `
                <div onclick="selectCatalogueItemForLog('${item.id}', '${item.name}', ${totalPcs})" 
                     class="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-indigo-500 hover:shadow-md transition group relative">
                    <div class="h-16 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                        ${item.src
                    ? `<img src="${item.src}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="${item.name}">`
                    : `<div class="flex flex-col items-center justify-center text-slate-300">
                                 <i class="fa-regular fa-image text-lg mb-0.5"></i>
                                 <span class="text-[8px] uppercase font-bold">No Image</span>
                               </div>`
                }
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
                    </div>
                    <div class="p-3">
                        <h4 class="text-slate-700 font-bold text-sm truncate">${item.name}</h4>
                        <div class="flex justify-between items-center mt-1">
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${item.brand || '-'}</span>
                            <span class="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded">${totalPcs} Pcs</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
};

window.closeCatalogueSelectionPanel = () => {
    const staffView = document.getElementById('unit-staff-view');
    const catalogueView = document.getElementById('unit-catalogue-view');
    const header = document.getElementById('unit-section-header');

    if (staffView && catalogueView) {
        catalogueView.classList.add('hidden');
        staffView.classList.remove('hidden');

        // Reset Header
        if (header) header.innerText = "Assigned Staff";
    }
};

window.selectCatalogueItemForLog = (id, name, total) => {
    const trackingSection = document.getElementById('unit-tracking-section');
    const unitName = trackingSection ? trackingSection.dataset.unit : null;

    if (!unitName) return;

    if (confirm(`Add "${name}" (${total} Pcs) to ${unitName} production log?`)) {
        const newEntry = {
            id: Date.now().toString(),
            unit: unitName,
            count: parseInt(total) || 0,
            catalogueId: id,
            catalogueName: name,
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
        renderUnitProductionLog(unitName);
        renderUnitsView(); // Update main card counts

        // Return to staff view
        closeCatalogueSelectionPanel();
    }
};

// --- PROBLEM PANEL LOGIC ---

window.renderUnitProblems = (unitName) => {
    const list = document.getElementById('unit-problems-list');
    if (!list) return;

    const allProblems = JSON.parse(localStorage.getItem('srf_unit_problems')) || [];
    const unitProblems = allProblems.filter(p => p.unit === unitName && p.status === 'open').sort((a, b) => b.timestamp - a.timestamp);

    if (unitProblems.length === 0) {
        list.innerHTML = `<p class="text-center text-slate-400 italic text-sm py-8">No issues reported.</p>`;
    } else {
        list.innerHTML = unitProblems.map(p => `
            <div class="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex justify-between items-start">
                <div>
                    <p class="text-sm text-slate-700 font-medium">${p.description}</p>
                    <div class="flex items-center gap-2 mt-2">
                        <span class="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold uppercase">${p.reportedBy}</span>
                        <span class="text-[10px] text-slate-400">${new Date(p.timestamp).toLocaleDateString()} ${new Date(p.timestamp).toLocaleTimeString()}</span>
                    </div>
                </div>
                <button onclick="resolveUnitProblem('${p.id}')" class="text-slate-300 hover:text-green-600 transition" title="Resolve Issue">
                    <i class="fa-solid fa-check-circle text-lg"></i>
                </button>
            </div>
        `).join('');
    }
};

window.reportUnitProblem = () => {
    const trackingSection = document.getElementById('unit-tracking-section');
    const unitName = trackingSection ? trackingSection.dataset.unit : null;
    const input = document.getElementById('unit-problem-input');

    if (!unitName || !input || !input.value.trim()) {
        alert("Please select a unit and describe the problem.");
        return;
    }

    const newProblem = {
        id: Date.now().toString(),
        unit: unitName,
        description: input.value.trim(),
        reportedBy: (window.auth?.currentUser?.email || 'Employee').split('@')[0],
        timestamp: Date.now(),
        status: 'open'
    };

    const problems = JSON.parse(localStorage.getItem('srf_unit_problems')) || [];
    problems.push(newProblem);

    // Save & Sync
    localStorage.setItem('srf_unit_problems', JSON.stringify(problems));
    if (window.saveToCloud) window.saveToCloud('unitProblems', problems);

    // Update UI
    input.value = '';
    renderUnitProblems(unitName);
};

window.resolveUnitProblem = (id) => {
    if (!confirm("Mark this issue as resolved?")) return;

    let problems = JSON.parse(localStorage.getItem('srf_unit_problems')) || [];
    const idx = problems.findIndex(p => p.id === id);

    if (idx !== -1) {
        problems[idx].status = 'resolved';
        problems[idx].resolvedAt = Date.now();
        problems[idx].resolvedBy = window.auth?.currentUser?.email || 'Manager';

        // Save & Sync
        localStorage.setItem('srf_unit_problems', JSON.stringify(problems));
        if (window.saveToCloud) window.saveToCloud('unitProblems', problems);

        const trackingSection = document.getElementById('unit-tracking-section');
        const unitName = trackingSection ? trackingSection.dataset.unit : null;
        if (unitName) renderUnitProblems(unitName);
    }
};
