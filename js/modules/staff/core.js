console.log("Staff Core Module Loaded");

// --- HELPER FUNCTIONS ---

window.getLedgerId = () => {
    if (!state.currentLedgerEmp || !state.currentLedgerDate) return null;
    const date = state.currentLedgerDate;
    return `${state.currentLedgerEmp.id}_${date.getFullYear()}_${date.getMonth() + 1}`;
};

window.saveDayData = (day, data) => {
    const lId = getLedgerId();
    if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {} };
    if (!state.staffLedgers[lId].days) state.staffLedgers[lId].days = {}; 
    
    // Merge data to preserve other keys
    state.staffLedgers[lId].days[day] = { ...state.staffLedgers[lId].days[day], ...data };
    
    // 1. Save Local
    localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
    
    // 2. Save Cloud
    if(window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);
};

window.moveFocusToNextInput = (currentInput) => {
    const allInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([disabled])'));
    const index = allInputs.indexOf(currentInput);
    if (index > -1 && index < allInputs.length - 1) {
        allInputs[index + 1].focus();
    }
};

