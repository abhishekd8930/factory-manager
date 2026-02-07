console.log("Home Module Loaded");

// --- INITIALIZATION ---
const TODO_STORAGE_KEY = 'srf_owner_todos';

if (!window.state) window.state = {};
if (!window.state.ownerTodos) {
    window.state.ownerTodos = JSON.parse(localStorage.getItem(TODO_STORAGE_KEY) || '[]');
}

// Date State Setup
if (!state.calendarViewDate) state.calendarViewDate = new Date();
if (!state.today) state.today = new Date().toISOString().split('T')[0]; // Safety Fix: Ensure state.today exists
if (!state.selectedTodoDate) state.selectedTodoDate = state.today;

// Migration: Fix old tasks without dates
window.state.ownerTodos = window.state.ownerTodos.map(t => {
    if (!t.date) t.date = state.today;
    return t;
});

// --- MAIN RENDER FUNCTION ---
window.renderHome = () => {
    if (window.updateGreeting) window.updateGreeting();

    const today = new Date();
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    const todayStr = today.toISOString().split('T')[0];
    const yestStr = yest.toISOString().split('T')[0];

    // Stats Logic
    const getStaffCount = (dateObj) => {
        const d = dateObj.getDate();
        const m = dateObj.getMonth() + 1;
        const y = dateObj.getFullYear();
        let count = 0;
        if (state.staffData) {
            state.staffData.forEach(emp => {
                const lId = `${emp.id}_${y}_${m}`;
                if (state.staffLedgers && state.staffLedgers[lId] && state.staffLedgers[lId].days && state.staffLedgers[lId].days[d]) {
                    const dayData = state.staffLedgers[lId].days[d];
                    if (dayData.status === 'PRESENT' || (dayData.hours && parseFloat(dayData.hours) > 0)) {
                        count++;
                    }
                }
            });
        }
        return count;
    };

    const getProdCount = (dateStr) => {
        if (!state.historyData) return 0;
        return state.historyData
            .filter(item => item.fullDate === dateStr && item.type === 'production')
            .reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    };

    const getWashCount = (dateStr) => {
        if (!state.washingData) return 0;
        return state.washingData
            .filter(item => item.fullDate === dateStr)
            .reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    };

    const elStaffT = document.getElementById('stat-staff-today');
    if (elStaffT) {
        const staffToday = getStaffCount(today);
        const staffYest = getStaffCount(yest);
        const prodToday = getProdCount(todayStr);
        const prodYest = getProdCount(yestStr);
        const washToday = getWashCount(todayStr);
        const washYest = getWashCount(yestStr);

        elStaffT.innerText = staffToday;
        document.getElementById('stat-staff-yest').innerText = staffYest;
        document.getElementById('stat-prod-today').innerText = prodToday;
        document.getElementById('stat-prod-yest').innerText = prodYest;
        document.getElementById('stat-wash-today').innerText = washToday;
        document.getElementById('stat-wash-yest').innerText = washYest;

        localUpdateTrend('staff', staffToday, staffYest);
        localUpdateTrend('prod', prodToday, prodYest);
        localUpdateTrend('wash', washToday, washYest);
    }

    // Explicitly call the global render functions
    if (window.renderHomeCalendar) window.renderHomeCalendar();
    if (window.renderTodoList) window.renderTodoList();
};

function localUpdateTrend(type, current, prev) {
    const el = document.getElementById(`trend-${type}`);
    if (!el) return;

    if (current >= prev) {
        const diff = current - prev;
        el.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> ${diff} more than yesterday`;
        el.className = "text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full inline-block mt-2";
    } else {
        const diff = prev - current;
        el.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> ${diff} less than yesterday`;
        el.className = "text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full inline-block mt-2";
    }
}

// --- CALENDAR LOGIC (Navigation + Selection + Holidays) ---

window.changeCalendarMonth = (delta) => {
    const newDate = new Date(state.calendarViewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    state.calendarViewDate = newDate;
    window.renderHomeCalendar();
};

window.selectTodoDate = (dateStr) => {
    state.selectedTodoDate = dateStr;
    window.renderHomeCalendar();
    window.renderTodoList();
};

// IMPORTANT: Attached to 'window' to be accessible globally
window.renderHomeCalendar = () => {
    const calendarGrid = document.getElementById('home-calendar-grid');
    const calendarTitle = document.getElementById('home-calendar-title');

    // CRITICAL FIX: If element not found, stop immediately to prevent errors
    if (!calendarGrid) return;

    const viewDate = state.calendarViewDate || new Date();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (calendarTitle) {
        calendarTitle.className = "flex justify-between items-center w-full";
        calendarTitle.innerHTML = `
            <button onclick="changeCalendarMonth(-1)" class="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 transition"><i class="fa-solid fa-chevron-left"></i></button>
            <span class="text-lg font-bold text-slate-800">${monthNames[month]} ${year}</span>
            <button onclick="changeCalendarMonth(1)" class="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 transition"><i class="fa-solid fa-chevron-right"></i></button>
        `;
    }

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '';

    for (let i = 0; i < firstDay; i++) { html += `<div class="h-10"></div>`; }

    for (let i = 1; i <= daysInMonth; i++) {
        const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        const isToday = (currentDateStr === state.today);
        const isSelected = (currentDateStr === state.selectedTodoDate);
        const dayOfWeek = new Date(year, month, i).getDay();
        const isSunday = (dayOfWeek === 0);

        let hasHoliday = false;
        let holidayTitle = "";

        // Safety Check: Only check holidays if staff data is actually loaded
        if (state.staffData && state.staffData.length > 0) {
            const firstEmpId = state.staffData[0].id;
            const lId = `${firstEmpId}_${year}_${month + 1}`;

            if (state.staffLedgers && state.staffLedgers[lId] && state.staffLedgers[lId].days) {
                const dayData = state.staffLedgers[lId].days[i];
                if (dayData?.status === 'HOLIDAY' || dayData?.status === 'NPL' || dayData?.status === 'PAID_LEAVE') {
                    hasHoliday = true;
                    if (dayData.status === 'PAID_LEAVE') holidayTitle = dayData.holidayTitle || 'Paid Leave';
                    else holidayTitle = dayData.holidayTitle || 'Holiday';
                }
            }
        }

        let classes = `h-10 flex flex-col items-center justify-center rounded-lg text-sm font-medium transition cursor-pointer relative group select-none`;

        if (isSelected) {
            classes += " bg-indigo-600 text-white font-bold shadow-md transform scale-105 z-10";
        } else if (isToday) {
            classes += " bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold";
        } else if (hasHoliday) {
            classes += " bg-purple-50 text-purple-600 border border-purple-100 font-bold";
        } else if (isSunday) {
            classes += " text-red-500 bg-red-50/50 hover:bg-red-50";
        } else {
            classes += " text-slate-600 hover:bg-slate-100";
        }

        html += `<div class="${classes}" 
                    onclick="selectTodoDate('${currentDateStr}')" 
                    ondblclick="openHolidayMenu('${currentDateStr}')"
                    title="Click for Tasks, Double-Click for Holiday">
                    <span class="leading-none">${i}</span>
                    ${hasHoliday ? `<span class="text-[7px] uppercase tracking-tighter leading-none absolute bottom-0.5 truncate w-full px-1">${holidayTitle.substring(0, 8)}</span>` : ''}
                </div>`;
    }

    calendarGrid.innerHTML = html;
};

// --- TO-DO LIST LOGIC ---

window.saveTodoItem = () => {
    const input = document.getElementById('todo-input');
    const task = input.value.trim();
    if (task) {
        window.state.ownerTodos.push({
            id: Date.now(),
            text: task,
            completed: false,
            starred: false,
            date: state.selectedTodoDate
        });
        saveTodos();
        input.value = '';
        input.focus();
    }
};

window.handleTodoKey = (e) => {
    if (e.key === 'Enter') window.saveTodoItem();
};

window.toggleTodoCompleted = (id) => {
    const item = window.state.ownerTodos.find(t => t.id === id);
    if (item) {
        item.completed = !item.completed;
        saveTodos();
    }
};

window.toggleTodoStar = (id) => {
    const item = window.state.ownerTodos.find(t => t.id === id);
    if (item) {
        item.starred = !item.starred;
        saveTodos();
    }
};

window.deleteTodoItem = (id) => {
    window.state.ownerTodos = window.state.ownerTodos.filter(t => t.id !== id);
    saveTodos();
};

function saveTodos() {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(window.state.ownerTodos));
    if (window.saveToCloud) window.saveToCloud('ownerTodos', window.state.ownerTodos);
    window.renderTodoList();
}

// IMPORTANT: Attached to 'window'
window.renderTodoList = () => {
    const listEl = document.getElementById('todo-list');
    const emptyEl = document.getElementById('todo-empty');
    const inputEl = document.getElementById('todo-input');

    if (inputEl && !inputEl.onkeydown) inputEl.onkeydown = window.handleTodoKey;
    if (!listEl) return;

    const viewDate = state.selectedTodoDate;
    const isViewingToday = (viewDate === state.today);

    const visibleTodos = window.state.ownerTodos.filter(t => {
        if (t.date === viewDate) return true;
        if (isViewingToday && t.date < state.today && !t.completed) return true;
        return false;
    });

    let score = 0;
    if (isViewingToday) {
        visibleTodos.forEach(t => {
            if (t.completed) score += (t.starred ? 10 : 5);
        });
    }

    const todoHeader = inputEl ? inputEl.closest('.bg-white').querySelector('h3') : null;
    if (todoHeader) {
        let scoreBox = document.getElementById('todo-score-box');
        if (!scoreBox) {
            const container = document.createElement('div');
            container.className = "flex items-center justify-between w-full";
            const titleSpan = document.createElement('span');
            titleSpan.id = 'todo-header-title';
            titleSpan.className = "flex items-center gap-2";

            scoreBox = document.createElement('span');
            scoreBox.id = 'todo-score-box';
            scoreBox.className = "ml-auto bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm transition-all";

            container.appendChild(titleSpan);
            container.appendChild(scoreBox);
            todoHeader.innerHTML = '';
            todoHeader.appendChild(container);
        }

        const dateObj = new Date(viewDate);
        const dateNice = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

        document.getElementById('todo-header-title').innerHTML = `<i class="fa-solid fa-list-check text-indigo-500"></i> ${isViewingToday ? "Today's Tasks" : dateNice}`;
        scoreBox.innerHTML = `<i class="fa-solid fa-trophy text-yellow-300 mr-1"></i> ${score} pts`;
        inputEl.placeholder = isViewingToday ? "Add a new task..." : `Add task for ${dateNice}...`;
    }

    visibleTodos.sort((a, b) => {
        if (a.starred !== b.starred) return b.starred ? 1 : -1;
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.id - a.id;
    });

    if (visibleTodos.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) {
            emptyEl.classList.remove('hidden');
            emptyEl.innerText = isViewingToday ? "No tasks for today." : "No tasks for this date.";
        }
        return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    listEl.innerHTML = visibleTodos.map(item => {
        const starClass = item.starred ? "text-yellow-400 fa-solid" : "text-slate-300 fa-regular hover:text-yellow-400";
        const rowBg = item.starred ? "bg-yellow-50/50 border-yellow-100" : (item.completed ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-slate-100");
        const points = item.starred ? 10 : 5;
        const isOverdue = item.date < state.today && !item.completed;

        return `
        <li class="flex items-center justify-between p-3 mb-2 rounded-lg border transition ${rowBg}">
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <button onclick="toggleTodoStar(${item.id})" class="focus:outline-none transition transform hover:scale-110" title="${item.starred ? 'Unmark' : 'Mark Important'}">
                    <i class="${starClass} fa-star text-lg"></i>
                </button>

                <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleTodoCompleted(${item.id})" 
                    class="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer">
                
                <div class="flex flex-col min-w-0">
                    <span class="text-sm font-medium truncate ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}">
                        ${item.text}
                    </span>
                    ${isOverdue ? `<span class="text-[9px] text-red-500 font-bold uppercase tracking-wide">Overdue (${item.date})</span>` : ''}
                </div>
                
                ${item.completed ? `<span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">+${points}</span>` : ''}
            </div>

            <button onclick="deleteTodoItem(${item.id})" class="ml-2 text-slate-300 hover:text-red-500 transition p-1.5 rounded-md hover:bg-red-50">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </li>
    `}).join('');
};

// --- HOLIDAY MODAL FUNCTIONS ---

window.openHolidayMenu = (dateStr) => {
    window.state.selectedCalendarDate = dateStr;
    const dateObj = new Date(dateStr);
    const dateReadable = dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    document.getElementById('holiday-modal-date').innerText = dateReadable;
    const modal = document.getElementById('holiday-menu-modal');
    const btnContainer = document.getElementById('holiday-action-buttons');
    const form = document.getElementById('holiday-grant-form');

    modal.classList.remove('hidden');
    btnContainer.classList.remove('hidden');
    form.classList.add('hidden');

    let existingHoliday = null;
    const d = dateObj.getDate();
    const m = dateObj.getMonth() + 1;
    const y = dateObj.getFullYear();

    if (state.staffData && state.staffData.length > 0) {
        const firstEmpId = state.staffData[0].id;
        const lId = `${firstEmpId}_${y}_${m}`;
        // Safe Access using optional chaining
        if (state.staffLedgers[lId] && state.staffLedgers[lId].days) {
            const dayData = state.staffLedgers[lId].days[d];
            if (dayData && ['HOLIDAY', 'NPL', 'PAID_LEAVE'].includes(dayData.status)) {
                existingHoliday = dayData;
            }
        }
    }

    if (existingHoliday) {
        let statusText = existingHoliday.holidayTitle || "Holiday";
        let statusSub = "Paid";

        if (existingHoliday.status === 'NPL') {
            statusText = "No Pay Leave";
            statusSub = "Salary Deducted";
        } else if (existingHoliday.status === 'PAID_LEAVE') {
            statusText = "Factory Closed";
            statusSub = "Paid Leave";
        }

        btnContainer.innerHTML = `
            <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center mb-2">
                <p class="text-[10px] text-yellow-700 font-bold uppercase tracking-wider mb-1">Current Status</p>
                <p class="font-bold text-slate-800 text-lg">${statusText}</p>
                <p class="text-xs text-slate-500">${statusSub}</p>
            </div>
            <button onclick="toggleHolidayGrantForm(true)" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center justify-center gap-2">
                <i class="fa-solid fa-pen-to-square"></i> Modify
            </button>
            <button onclick="deleteHolidayAnnouncement()" class="w-full bg-white text-red-500 border border-red-100 py-3 rounded-xl font-bold hover:bg-red-50 transition shadow-sm flex items-center justify-center gap-2">
                <i class="fa-solid fa-trash-can"></i> Delete
            </button>
        `;
        document.getElementById('holiday-title-input').value = existingHoliday.holidayTitle || '';
        document.getElementById('holiday-type-select').value = existingHoliday.status;
    } else {
        btnContainer.innerHTML = `
            <button onclick="toggleHolidayGrantForm(false)" class="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg flex items-center justify-center gap-3">
                <i class="fa-solid fa-umbrella-beach"></i> Grant Holiday / Leave
            </button>
        `;
        document.getElementById('holiday-title-input').value = '';
    }
};

window.closeHolidayMenu = () => {
    document.getElementById('holiday-menu-modal').classList.add('hidden');
    window.state.selectedCalendarDate = null;
};

window.toggleHolidayGrantForm = (isModify) => {
    const form = document.getElementById('holiday-grant-form');
    const btns = document.getElementById('holiday-action-buttons');
    btns.classList.add('hidden');
    form.classList.remove('hidden');
    document.getElementById('holiday-title-input').focus();
};

window.saveHolidayAnnouncement = () => {
    const dateStr = window.state.selectedCalendarDate;
    const title = document.getElementById('holiday-title-input').value.trim();
    const statusType = document.getElementById('holiday-type-select').value;

    if (!dateStr) return alert("Error: No date selected.");
    if (!title) return alert("Please enter a title.");

    const selDate = new Date(dateStr);
    const d = selDate.getDate();
    const m = selDate.getMonth() + 1;
    const y = selDate.getFullYear();

    let count = 0;
    state.staffData.forEach(emp => {
        const lId = `${emp.id}_${y}_${m}`;
        if (!state.staffLedgers[lId]) state.staffLedgers[lId] = { days: {} };
        if (!state.staffLedgers[lId].days[d]) state.staffLedgers[lId].days[d] = {};

        state.staffLedgers[lId].days[d].status = statusType;
        state.staffLedgers[lId].days[d].holidayTitle = title;
        state.staffLedgers[lId].days[d].in = '';
        state.staffLedgers[lId].days[d].out = '';
        state.staffLedgers[lId].days[d].hours = '';
        state.staffLedgers[lId].days[d].ot = '';
        count++;
    });

    localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
    if (window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);

    closeHolidayMenu();
    window.renderHomeCalendar();
    if (document.getElementById('attendance').classList.contains('active')) {
        window.renderAttendanceView();
    }
};

window.deleteHolidayAnnouncement = () => {
    const dateStr = window.state.selectedCalendarDate;
    if (!confirm(`Are you sure you want to REMOVE the status on ${dateStr}?`)) return;

    const selDate = new Date(dateStr);
    const d = selDate.getDate();
    const m = selDate.getMonth() + 1;
    const y = selDate.getFullYear();

    state.staffData.forEach(emp => {
        const lId = `${emp.id}_${y}_${m}`;
        if (state.staffLedgers[lId] && state.staffLedgers[lId].days[d]) {
            const dayData = state.staffLedgers[lId].days[d];
            if (['HOLIDAY', 'NPL', 'PAID_LEAVE'].includes(dayData.status)) {
                dayData.status = '';
                dayData.holidayTitle = '';
                // Optional: clear times just in case
                dayData.in = '';
                dayData.out = '';
                dayData.hours = '';
            }
        }
    });

    localStorage.setItem('srf_staff_ledgers', JSON.stringify(state.staffLedgers));
    if (window.saveToCloud) window.saveToCloud('staffLedgers', state.staffLedgers);

    closeHolidayMenu();
    window.renderHomeCalendar();
    if (document.getElementById('attendance').classList.contains('active')) {
        window.renderAttendanceView();
        if (window.renderAttendanceBook) window.renderAttendanceBook();
    }
};