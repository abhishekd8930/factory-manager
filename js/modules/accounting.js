console.log("Accounting Module Loaded");

// --- 1. UI INTERACTION ---

// Toggles the Credit/Debit button styles
window.setTransType = (type) => {
    // Update hidden input
    document.getElementById('trans-type').value = type;
    
    const btnC = document.getElementById('btn-credit');
    const btnD = document.getElementById('btn-debit');
    
    // Toggle Classes
    if(type === 'credit') {
        btnC.className = "flex-1 py-2 rounded-lg border border-emerald-500 bg-emerald-50 text-emerald-600 font-bold shadow-inner transition";
        btnD.className = "flex-1 py-2 rounded-lg border border-slate-200 text-slate-400 font-bold hover:bg-slate-50 transition";
    } else {
        btnC.className = "flex-1 py-2 rounded-lg border border-slate-200 text-slate-400 font-bold hover:bg-slate-50 transition";
        btnD.className = "flex-1 py-2 rounded-lg border border-red-500 bg-red-50 text-red-600 font-bold shadow-inner transition";
    }
};

// --- 2. DATA MANAGEMENT ---

window.addTransaction = () => {
    // Get Inputs
    const dateInput = document.getElementById('trans-date');
    const descInput = document.getElementById('trans-desc');
    const typeInput = document.getElementById('trans-type');
    const amtInput = document.getElementById('trans-amt');

    const date = dateInput.value || state.today;
    const desc = descInput.value.trim();
    const type = typeInput.value;
    const amt = parseFloat(amtInput.value);

    // Validation
    if(!desc) return alert("Please enter a description.");
    if(!amt || amt <= 0) return alert("Please enter a valid amount.");

    // Create Entry Object
    const newTrans = { 
        id: Date.now(), 
        date: date, 
        desc: desc, 
        type: type, 
        amt: amt 
    };

    // Add to State (Newest first)
    state.accountsData.unshift(newTrans);
    
    // Save to LocalStorage
    localStorage.setItem('srf_accounts', JSON.stringify(state.accountsData));
    if(window.saveToCloud) window.saveToCloud('srf_accounts', state.accountsData);

    // Reset Form
    descInput.value = '';
    amtInput.value = '';
    descInput.focus();

    // Refresh View
    window.renderAccounts();
};

window.deleteTrans = (id) => {
    if(!confirm("Are you sure you want to delete this transaction?")) return;
    
    // Filter out the deleted item
    state.accountsData = state.accountsData.filter(i => i.id !== id);
    
    // Save Update
    localStorage.setItem('srf_accounts', JSON.stringify(state.accountsData));
    if(window.saveToCloud) window.saveToCloud('srf_accounts', state.accountsData);
    
    // Refresh View
    window.renderAccounts();
};

// --- 3. RENDER LOGIC ---

window.renderAccounts = () => {
    const tbody = document.getElementById('acc-table-body');
    const balanceEl = document.getElementById('acc-balance');
    
    if(!tbody || !balanceEl) return;

    tbody.innerHTML = '';
    let totalBalance = 0;

    // 1. Calculate Total Balance first
    // We iterate through all data to get the precise sum
    state.accountsData.forEach(item => {
        if(item.type === 'credit') {
            totalBalance += Number(item.amt);
        } else {
            totalBalance -= Number(item.amt);
        }
    });

    // 2. Render Table (Limit to last 50 for performance if needed, currently showing all)
    // Data is already sorted new -> old because we used unshift()
    
    if(state.accountsData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="p-8 text-center text-slate-400 italic">
                    No transactions found. Add one to start tracking.
                </td>
            </tr>`;
    } else {
        state.accountsData.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50 transition border-b border-slate-50";
            
            const isCredit = item.type === 'credit';
            const colorClass = isCredit ? 'text-emerald-600' : 'text-red-500';
            const sign = isCredit ? '+' : '-';
            
            // Format Date (YYYY-MM-DD to DD/MM)
            const dateObj = new Date(item.date);
            const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });

            tr.innerHTML = `
                <td class="p-4 text-slate-500 font-mono text-xs whitespace-nowrap">${dateStr}</td>
                <td class="p-4 font-bold text-slate-700 break-words max-w-xs">${item.desc}</td>
                <td class="p-4 text-right font-bold ${colorClass} whitespace-nowrap">
                    ${sign} ₹${item.amt.toFixed(2)}
                </td>
                <td class="p-4 text-center">
                    <button onclick="deleteTrans(${item.id})" class="text-slate-300 hover:text-red-500 transition p-1" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 3. Update Balance Display
    balanceEl.innerText = `₹ ${totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    
    // Dynamic Color for Balance
    if (totalBalance >= 0) {
        balanceEl.className = "text-3xl font-bold text-slate-800";
    } else {
        balanceEl.className = "text-3xl font-bold text-red-500";
    }
};