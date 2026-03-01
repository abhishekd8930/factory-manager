// js/worker-auth.js
console.log("Worker Auth Module Loaded");

/**
 * Handle Employee Login via ID + PIN
 * Verifies against Firebase RTDB at /workers/{normalizedId}
 */
window.handleWorkerLogin = async (e) => {
    e.preventDefault();

    const idInput = document.getElementById('worker-id');
    const pinInput = document.getElementById('worker-pin');
    const btn = document.getElementById('btn-worker-login');
    const originalText = btn ? btn.innerText : 'Clock In';

    const workerId = (idInput?.value || '').trim().toUpperCase();
    const workerPin = (pinInput?.value || '').trim();

    // Validation
    if (!workerId || !workerPin) {
        alert("Please enter both Employee ID and PIN.");
        if (!workerId) idInput?.focus();
        else pinInput?.focus();
        return;
    }

    if (workerPin.length < 4 || workerPin.length > 6) {
        alert("PIN must be 4-6 digits.");
        pinInput?.focus();
        return;
    }

    // Loading state
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Verifying...';
        btn.disabled = true;
    }

    try {
        // Fetch worker data from Firebase RTDB
        const workerData = await window.loadFromCloud(`workers/${workerId}`);

        if (!workerData) {
            throw { code: 'worker/not-found', message: 'Employee ID not found' };
        }

        // Verify PIN
        if (String(workerData.pin) !== String(workerPin)) {
            throw { code: 'worker/wrong-pin', message: 'Incorrect PIN' };
        }

        // Success! Set employee role
        localStorage.setItem('srf_user_role', 'employee');
        if (typeof state !== 'undefined') state.userRole = 'employee';

        // Store worker info for employee workspace/greeting
        localStorage.setItem('srf_employee_name', workerData.name || workerId);
        localStorage.setItem('srf_worker_id', workerId);
        if (workerData.unit) localStorage.setItem('srf_employee_unit', workerData.unit);
        if (workerData.role) localStorage.setItem('srf_employee_role', workerData.role);

        // Success animation
        if (btn) {
            btn.classList.add('bg-emerald-500');
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Welcome!';
        }

        // Sign in anonymously to trigger onAuthStateChanged -> initAppView
        if (window.signInAnonymously && window.auth) {
            await window.signInAnonymously(window.auth);
        } else {
            // Fallback: directly navigate
            setTimeout(() => {
                window.location.hash = '#/home';
                window.location.reload();
            }, 500);
        }

    } catch (error) {
        console.error("Worker Login Failed:", error);

        if (btn) {
            btn.classList.add('bg-red-500', 'animate-shake');
            btn.disabled = false;
        }

        let errorMsg = "Login Failed";
        if (error.code === 'worker/not-found') {
            errorMsg = "ID Not Found";
        } else if (error.code === 'worker/wrong-pin') {
            errorMsg = "Wrong PIN";
        } else {
            errorMsg = "Network Error";
        }

        if (btn) btn.innerText = errorMsg;

        // Reset after 2s
        setTimeout(() => {
            if (btn) {
                btn.classList.remove('bg-red-500', 'animate-shake');
                btn.innerText = originalText;
                btn.disabled = false;
            }
            if (error.code === 'worker/wrong-pin') {
                pinInput.value = '';
                pinInput.focus();
            } else if (error.code === 'worker/not-found') {
                idInput.select();
            }
        }, 2000);
    }
};
