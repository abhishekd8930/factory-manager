// js/modules/worker-admin.js
console.log("Worker Admin Module Loaded");

/**
 * Render the Worker Credentials list in Settings
 */
window.renderWorkerCredentials = async () => {
    const listContainer = document.getElementById('worker-credentials-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div class="text-center p-4 text-slate-400"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';

    try {
        const workers = await window.loadFromCloud('workers');

        if (!workers || Object.keys(workers).length === 0) {
            listContainer.innerHTML = `
                <div class="text-center p-6 text-slate-400">
                    <i class="fa-solid fa-user-slash text-2xl mb-2 opacity-40"></i>
                    <p class="text-sm">No worker credentials found.</p>
                    <p class="text-xs mt-1">Add one using the form above.</p>
                </div>`;
            return;
        }

        let html = '';
        const entries = Object.entries(workers);
        entries.forEach(([id, data]) => {
            html += `
            <div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition group">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                        <i class="fa-solid fa-id-badge"></i>
                    </div>
                    <div>
                        <div class="font-bold text-slate-700 text-sm">${data.name || 'Unknown'}</div>
                        <div class="text-xs text-slate-400 font-mono">${id} · PIN: ${'•'.repeat(String(data.pin || '').length)}</div>
                    </div>
                </div>
                <button onclick="deleteWorkerCredential('${id}')" class="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition" title="Remove">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </div>`;
        });

        listContainer.innerHTML = html;

    } catch (err) {
        console.error("Error loading workers:", err);
        listContainer.innerHTML = '<div class="text-center p-4 text-red-400 text-sm">Error loading credentials.</div>';
    }
};

/**
 * Save a new Worker Credential to Firebase RTDB
 */
window.saveWorkerCredential = async () => {
    const idInput = document.getElementById('wc-id');
    const nameInput = document.getElementById('wc-name');
    const pinInput = document.getElementById('wc-pin');
    const btn = document.getElementById('btn-save-worker');

    const workerId = (idInput?.value || '').trim().toUpperCase();
    const workerName = (nameInput?.value || '').trim();
    const workerPin = (pinInput?.value || '').trim();

    // Validation
    if (!workerId) {
        alert("Employee ID is required. Select an employee from the dropdown or enter manually.");
        idInput?.focus();
        return;
    }
    if (!workerName) {
        alert("Worker name is required.");
        nameInput?.focus();
        return;
    }
    if (!workerPin || workerPin.length < 4 || workerPin.length > 6) {
        alert("PIN must be 4-6 digits.");
        pinInput?.focus();
        return;
    }
    if (!/^\d{4,6}$/.test(workerPin)) {
        alert("PIN must contain only digits (0-9).");
        pinInput?.focus();
        return;
    }

    // Loading
    const originalHTML = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
        btn.disabled = true;
    }

    try {
        // Find matching employee in staffData for extra info
        const matchingStaff = (typeof state !== 'undefined' && state.staffData || [])
            .find(s => (s.empId || '').toUpperCase() === workerId);

        const workerData = {
            name: workerName,
            pin: workerPin,
            unit: matchingStaff?.unit || '',
            role: matchingStaff?.role || '',
            createdAt: new Date().toISOString()
        };

        await window.saveToCloud(`workers/${workerId}`, workerData);

        // Success
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-check text-emerald-500"></i> Saved!';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }, 1500);
        }

        // Clear form
        if (idInput) idInput.value = '';
        if (nameInput) nameInput.value = '';
        if (pinInput) pinInput.value = '';

        // Refresh list
        window.renderWorkerCredentials();

    } catch (err) {
        console.error("Error saving worker:", err);
        alert("Failed to save worker credential: " + err.message);
        if (btn) {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    }
};

/**
 * Delete a Worker Credential
 */
window.deleteWorkerCredential = async (id) => {
    if (!confirm(`Remove login for worker "${id}"? They will no longer be able to sign in.`)) return;

    try {
        // Set to null to delete from RTDB
        await window.saveToCloud(`workers/${id}`, null);
        window.renderWorkerCredentials();
    } catch (err) {
        console.error("Error deleting worker:", err);
        alert("Failed to delete: " + err.message);
    }
};

/**
 * Populate the worker ID dropdown from existing staff
 */
window.populateWorkerIdDropdown = () => {
    const select = document.getElementById('wc-staff-select');
    const idInput = document.getElementById('wc-id');
    const nameInput = document.getElementById('wc-name');
    if (!select) return;

    const staffList = (typeof state !== 'undefined' && state.staffData) || [];

    let options = '<option value="">-- Select from Staff --</option>';
    staffList.forEach(emp => {
        if (emp.empId) {
            options += `<option value="${emp.empId}" data-name="${emp.name || ''}">${emp.empId} — ${emp.name || 'Unknown'}</option>`;
        }
    });
    select.innerHTML = options;

    // On selection, auto-fill ID and Name
    select.onchange = () => {
        const selected = select.options[select.selectedIndex];
        if (selected.value) {
            if (idInput) idInput.value = selected.value;
            if (nameInput) nameInput.value = selected.dataset.name || '';
        }
    };
};
