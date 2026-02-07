
export const Templates = {
    login: () => `
    <div id="login-view" class="h-screen w-full flex items-center justify-center login-bg fixed inset-0 z-50">
        <div class="glass-card p-8 md:p-10 w-full max-w-[400px] mx-4 relative z-10 fade-in border-t border-white/20">
            <div class="text-center mb-8">
                <div class="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl ring-4 ring-white/5 text-white text-3xl backdrop-blur-md">
                    <i class="fa-solid fa-user-shield"></i>
                </div>
                <h2 class="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-2">Welcome to</h2>
                <h3 class="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                    Sri Raghavendra Fashions<br>
                </h3>
            </div>
            <form onsubmit="handleLogin(event)" class="space-y-5">
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fa-solid fa-user text-indigo-200/50 group-focus-within:text-white transition-colors"></i>
                    </div>
                    <input type="text" id="login-user" autocomplete="username" class="w-full bg-black/20 text-white placeholder-white/40 rounded-xl py-3.5 pl-12 pr-4 border border-white/10 focus:border-white/30 focus:bg-black/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" placeholder="Username">
                </div>
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fa-solid fa-lock text-indigo-200/50 group-focus-within:text-white transition-colors"></i>
                    </div>
                    <input type="password" id="login-pass" autocomplete="current-password" class="w-full bg-black/20 text-white placeholder-white/40 rounded-xl py-3.5 pl-12 pr-12 border border-white/10 focus:border-white/30 focus:bg-black/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" placeholder="Password">
                    <button type="button" onclick="togglePasswordVisibility()" class="absolute inset-y-0 right-0 pr-4 flex items-center text-indigo-200/50 hover:text-white transition-colors cursor-pointer outline-none">
                        <i class="fa-solid fa-eye" id="pass-icon"></i>
                    </button>
                </div>
                <button type="submit" class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/30 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
                    <span>Access Dashboard</span>
                    <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </button>
            </form>
            <div class="text-center mt-8 space-y-2">
                <p class="text-indigo-200/40 text-[10px] uppercase tracking-widest">gifted by abhishek • Protected</p>
            </div>
        </div>
    </div>`,

    appLayout: () => `
    <div id="app-view" class="h-screen flex overflow-hidden bg-slate-50">
        <aside id="sidebar" class="w-64 bg-white border-r border-slate-200 h-full flex flex-col z-[60] transition-transform duration-300 absolute md:relative -translate-x-full md:translate-x-0">
            <div class="p-4 pl-6 flex items-center gap-3">
                <div class="text-2xl text-slate-600 cursor-pointer hover:text-blue-600 transition" onclick="toggleDesktopSidebar()">
                    <i class="fa-solid fa-bars"></i>
                </div>
                <div class="flex items-center gap-2">
                    <span id="sidebar-logo-text" class="text-xl font-bold text-slate-700">SmartManager</span>
                </div>
            </div>
            <nav class="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
                <a href="#/home" class="nav-btn w-full text-left p-3 rounded-full transition font-medium flex items-center gap-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 relative" id="nav-home">
                    <i class="fa-solid fa-house w-5"></i> 
                    <div id="nav-home-badge" class="hidden w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white absolute top-3 left-7"></div>
                    <span class="nav-label">Home</span> <span class="nav-label ml-auto text-[10px] opacity-50">Alt+1</span>
                </a>
                <a href="#/catalogue" class="nav-btn w-full text-left p-3 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition font-medium flex items-center gap-3" id="nav-catalogue">
                    <i class="fa-solid fa-book-open w-5"></i> <span class="nav-label">Catalogue</span> <span class="nav-label ml-auto text-[10px] opacity-50">Alt+2</span>
                </a>
                <a href="#/units" class="nav-btn w-full text-left p-3 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition font-medium flex items-center gap-3" id="nav-units">
                    <i class="fa-solid fa-sitemap w-5"></i> <span class="nav-label">Managing Units</span> <span class="nav-label ml-auto text-[10px] opacity-50">Alt+3</span>
                </a>
                <a href="#/staff" class="nav-btn w-full text-left p-3 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition font-medium flex items-center gap-3" id="nav-staff">
                    <i class="fa-solid fa-users w-5"></i> <span class="nav-label">Staff</span> <span class="nav-label ml-auto text-[10px] opacity-50">Alt+4</span>
                </a>
                <a href="#/history" class="nav-btn w-full text-left p-3 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition font-medium flex items-center gap-3" id="nav-history">
                    <i class="fa-solid fa-clock-rotate-left w-5"></i> <span class="nav-label">History</span> <span class="nav-label ml-auto text-[10px] opacity-50">Alt+5</span>
                </a>
                <a href="#/dashboard" class="nav-btn w-full text-left p-3 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition font-medium flex items-center gap-3" id="nav-dashboard">
                    <i class="fa-solid fa-chart-pie w-5"></i> <span class="nav-label">Analytics</span> <span class="nav-label ml-auto text-[10px] opacity-50">Alt+6</span>
                </a>
            </nav>
            <div class="p-4 border-t border-slate-100 bg-slate-50/50">
                <button onclick="openSettings()" class="nav-btn w-full mb-4 text-left p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition font-bold text-sm flex items-center gap-3 group">
                    <i class="fa-solid fa-gear group-hover:rotate-90 transition duration-500 w-5"></i>
                    <span class="nav-label flex-1">Settings</span>
                    <i class="nav-label fa-solid fa-chevron-right text-xs opacity-30"></i>
                </button>
                <div class="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center gap-3 justify-center">
                    <i id="status-cloud-icon" class="fa-solid fa-cloud text-slate-400 text-lg transition-colors duration-300"></i>
                    <div class="nav-label flex-1 relative overflow-hidden">
                        <p class="text-xs text-slate-400 font-semibold uppercase whitespace-nowrap">System Status</p>
                        <div class="flex items-center gap-2 mt-1">
                            <div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" id="status-dot"></div>
                            <span class="text-xs font-bold text-slate-600 whitespace-nowrap truncate" id="status-text">Local Data Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>

        <main class="flex-1 h-full overflow-y-auto relative scroll-smooth p-4 pb-24 md:p-8 md:pb-8" onclick="closeSidebarOnMobile()">
            <div id="router-outlet"></div>
        </main>

        <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 pb-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <a href="#/home" id="mobile-nav-home" class="nav-btn-mobile flex flex-col items-center justify-center w-16 p-1 rounded-xl text-slate-400 hover:text-indigo-600 transition">
                <i class="fa-solid fa-house text-xl mb-1"></i>
                <span class="text-[10px] font-bold">Home</span>
            </a>
            <a href="#/dashboard" id="mobile-nav-dashboard" class="nav-btn-mobile flex flex-col items-center justify-center w-16 p-1 rounded-xl text-slate-400 hover:text-indigo-600 transition">
                <i class="fa-solid fa-chart-pie text-xl mb-1"></i>
                <span class="text-[10px] font-bold">Stats</span>
            </a>
            <button onclick="toggleSidebar()" class="nav-btn-mobile flex flex-col items-center justify-center w-16 p-1 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition border border-transparent active:scale-95">
                <i class="fa-solid fa-bars text-xl mb-1"></i>
                <span class="text-[10px] font-bold">Menu</span>
            </button>
            <a href="#/staff" id="mobile-nav-staff" class="nav-btn-mobile flex flex-col items-center justify-center w-16 p-1 rounded-xl text-slate-400 hover:text-indigo-600 transition">
                <i class="fa-solid fa-users text-xl mb-1"></i>
                <span class="text-[10px] font-bold">Staff</span>
            </a>
            <a href="#/attendance" id="mobile-nav-attendance" class="nav-btn-mobile flex flex-col items-center justify-center w-16 p-1 rounded-xl text-slate-400 hover:text-indigo-600 transition">
                <i class="fa-solid fa-calendar-check text-xl mb-1"></i>
                <span class="text-[10px] font-bold">Attn.</span>
            </a>
        </div>
    </div>`,

    home: () => `
    <div id="home" class="fade-in relative">
        <div class="mb-8 bg-white p-8 rounded-[32px] shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            <div class="relative z-10 text-center md:text-left flex-1">
                <h1 class="text-3xl font-normal text-slate-800 mb-2">
                    <span id="greet-msg">Hello,</span> <span id="greet-name" class="font-bold">Manager</span>
                </h1>
                <p class="text-slate-500 max-w-lg mb-6">Start now to set your priorities and progress toward your goals with a clear, structured plan.</p>
                <button onclick="window.openSettings()" class="bg-blue-600 text-white font-medium py-2.5 px-6 rounded-full hover:bg-blue-700 transition inline-block">
                    View Profile
                </button>
                <button onclick="window.showNotifications()" class="ml-2 bg-slate-100 text-slate-600 font-medium py-2.5 px-6 rounded-full hover:bg-slate-200 transition inline-block relative">
                    <div id="btn-noti-badge" class="hidden w-3 h-3 bg-red-500 rounded-full border-2 border-slate-100 absolute top-0 right-0"></div>
                    <i class="fa-solid fa-bell mr-2"></i> Notifications
                </button>
            </div>
            <div class="shrink-0">
                <img src="assets/images/welcome-parrot.jpg" alt="Welcome" class="h-40 w-auto object-contain drop-shadow-sm hover:scale-105 transition duration-500">
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between h-full relative group hover:shadow-md transition">
                <div>
                    <span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-3 inline-block">
                        <i class="fa-solid fa-users text-slate-400 mr-1"></i> Staff
                    </span>
                    <h3 class="text-xl font-bold text-slate-800 mb-1 leading-tight">Staff Attendance</h3>
                    <p class="text-slate-500 text-sm mb-4">Live tracking of active workers.</p>
                    <div class="flex items-baseline gap-1">
                        <span class="text-4xl font-normal text-slate-800" id="stat-staff-today">0</span>
                        <span class="text-sm text-slate-500">Active</span>
                    </div>
                    <div id="trend-staff" class="min-h-[20px]"></div>
                </div>
                <div class="mt-6 flex justify-between items-center border-t border-slate-50 pt-4">
                    <div class="text-xs text-slate-400">Yesterday: <span id="stat-staff-yest" class="font-bold text-slate-600">0</span></div>
                    <a href="#/staff" class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition">
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
            <div class="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between h-full relative group hover:shadow-md transition">
                <div>
                    <span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-3 inline-block">
                        <i class="fa-solid fa-layer-group text-slate-400 mr-1"></i> Output
                    </span>
                    <h3 class="text-xl font-bold text-slate-800 mb-1 leading-tight">Production Output</h3>
                    <p class="text-slate-500 text-sm mb-4">Daily finished pieces count.</p>
                    <div class="flex items-baseline gap-1">
                        <span class="text-4xl font-normal text-slate-800" id="stat-prod-today">0</span>
                        <span class="text-sm text-slate-500">Pcs</span>
                    </div>
                    <div id="trend-prod" class="min-h-[20px]"></div>
                </div>
                <div class="mt-6 flex justify-between items-center border-t border-slate-50 pt-4">
                    <div class="text-xs text-slate-400">Yesterday: <span id="stat-prod-yest" class="font-bold text-slate-600">0</span></div>
                    <a href="#/dashboard" class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition">
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
            <div class="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between h-full relative group hover:shadow-md transition">
                <div>
                    <span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-3 inline-block">
                        <i class="fa-solid fa-soap text-slate-400 mr-1"></i> Washing
                    </span>
                    <h3 class="text-xl font-bold text-slate-800 mb-1 leading-tight">Washing Output</h3>
                    <p class="text-slate-500 text-sm mb-4">Items returned from washing.</p>
                    <div class="flex items-baseline gap-1">
                        <span class="text-4xl font-normal text-slate-800" id="stat-wash-today">0</span>
                        <span class="text-sm text-slate-500">Pcs</span>
                    </div>
                    <div id="trend-wash" class="min-h-[20px]"></div>
                </div>
                <div class="mt-6 flex justify-between items-center border-t border-slate-50 pt-4">
                    <div class="text-xs text-slate-400">Yesterday: <span id="stat-wash-yest" class="font-bold text-slate-600">0</span></div>
                    <a href="#/dashboard" class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition">
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col relative" id="todo-block">
                <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">Daily To-Do List</h3>
                <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 shrink-0">
                    <label for="todo-input" class="block text-xs font-bold text-blue-600 uppercase mb-1">New Task / Reminder</label>
                    <div class="flex gap-2">
                        <input type="text" id="todo-input" onkeydown="if(event.key === 'Enter') saveTodoItem()" placeholder="e.g. 9:00 AM: Dispatch X item" class="w-full p-3 border rounded-lg outline-none focus:border-blue-500 bg-white text-sm">
                        <button onclick="saveTodoItem()" class="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition shadow-md shrink-0">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto min-h-[150px] max-h-[300px] pr-2">
                    <ul id="todo-list" class="space-y-3"></ul>
                    <div id="todo-empty" class="text-center p-10 text-slate-400 text-sm hidden">
                        <i class="fa-solid fa-check-double text-4xl mb-3 opacity-20"></i>
                        <p>All clear! Add a new task to begin planning your day.</p>
                    </div>
                </div>
            </div>
            <div class="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col relative">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-slate-800" id="home-calendar-title">Calendar</h3>
                    <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <div class="grid grid-cols-7 text-center mb-2">
                    <div class="text-[10px] font-bold text-red-400 uppercase">Su</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Mo</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Tu</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">We</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Th</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Fr</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Sa</div>
                </div>
                <div class="grid grid-cols-7 gap-1 text-center" id="home-calendar-grid"></div>
            </div>
        </div>
        <div id="holiday-menu-modal" class="hidden fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div class="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-sm border border-slate-100 relative animate-fade-in-up flex flex-col items-center">
                <h4 class="text-2xl font-bold text-slate-800 mb-1" id="holiday-modal-date"></h4>
                <p class="text-slate-400 text-sm mb-6 font-medium uppercase tracking-wider">Owner Actions</p>
                <div id="holiday-action-buttons" class="w-full space-y-3"></div>
                <div id="holiday-grant-form" class="hidden w-full p-4 bg-indigo-50 rounded-xl border border-indigo-100 mt-4 animate-fade-in-up">
                    <label class="block text-xs font-bold text-indigo-600 uppercase mb-1">Title</label>
                    <input type="text" id="holiday-title-input" class="w-full p-2 border rounded-lg bg-white text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Dasara">
                    <label class="block text-xs font-bold text-indigo-600 uppercase mb-1">Type</label>
                    <select id="holiday-type-select" class="w-full p-2 border rounded-lg bg-white text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="HOLIDAY">Holiday</option>
                        <option value="PAID_LEAVE">No Work (Paid)</option>
                    </select>
                    <button onclick="saveHolidayAnnouncement()" class="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition shadow-md">Save Changes</button>
                </div>
                <button onclick="closeHolidayMenu()" class="mt-6 text-slate-400 font-bold hover:text-slate-600 transition text-sm flex items-center gap-2">
                    <i class="fa-solid fa-xmark"></i> Close
                </button>
            </div>
        </div>
    </div>`,

    // ... I will add other templates in subsequent tool calls or all here if I can fit it.
    // I'll add Catalogue and Dashboard now.
    catalogue: () => `
    <div id="catalogue" class="fade-in max-w-7xl mx-auto">
        <div id="catalogue-list-view">
            <div class="text-center mb-12 mt-8">
                <h1 class="text-4xl md:text-5xl font-normal text-slate-800 mb-6 tracking-tight">
                    Production Catalogue<br>& Specifications
                </h1>
                <p class="text-slate-500 max-w-2xl mx-auto text-lg mb-8 leading-relaxed">
                    Reference guide for manufacturing standards. Access detailed composition, stitching, and finishing specifications to ensure production consistency.
                </p>
                <div class="max-w-2xl mx-auto mb-8 relative">
                    <div class="relative">
                        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                        <input type="text" id="catalogue-search-input" oninput="handleCatalogueSearch(this.value)" placeholder="Search catalog (name, date, fabric...)" class="w-full bg-slate-100 border-none rounded-full py-4 pl-12 pr-6 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition hover:bg-white hover:shadow-md">
                        <button class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2">
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
                <div class="flex flex-wrap justify-center gap-3 relative z-40">
                    <div class="relative group">
                        <button id="filter-btn-fabric" onclick="toggleFilterDropdown('fabric')" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition">
                            Fabric <i class="fa-solid fa-caret-down text-xs"></i>
                        </button>
                        <ul id="filter-dropdown-fabric" class="hidden absolute top-12 left-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-60 overflow-y-auto"></ul>
                    </div>
                    <div class="relative group">
                        <button id="filter-btn-pattern" onclick="toggleFilterDropdown('pattern')" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition">
                            Pattern <i class="fa-solid fa-caret-down text-xs"></i>
                        </button>
                        <ul id="filter-dropdown-pattern" class="hidden absolute top-12 left-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-60 overflow-y-auto"></ul>
                    </div>
                    <div class="relative group">
                        <button id="filter-btn-brand" onclick="toggleFilterDropdown('brand')" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition">
                            Brand <i class="fa-solid fa-caret-down text-xs"></i>
                        </button>
                        <ul id="filter-dropdown-brand" class="hidden absolute top-12 left-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-60 overflow-y-auto"></ul>
                    </div>
                    <div class="relative group">
                        <button id="filter-btn-fitting" onclick="toggleFilterDropdown('fitting')" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition">
                            Fitting <i class="fa-solid fa-caret-down text-xs"></i>
                        </button>
                        <ul id="filter-dropdown-fitting" class="hidden absolute top-12 left-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-60 overflow-y-auto"></ul>
                    </div>
                     <div class="relative group">
                        <button id="filter-btn-duration" onclick="toggleFilterDropdown('duration')" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition">
                            Duration <i class="fa-solid fa-caret-down text-xs"></i>
                        </button>
                        <ul id="filter-dropdown-duration" class="hidden absolute top-12 left-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-60 overflow-y-auto"></ul>
                    </div>
                </div>
                <div id="catalogue-result-count" class="mt-8 text-left text-slate-500 font-medium"></div>
            </div>
            <div class="flex justify-between items-center max-w-7xl mx-auto mb-6 px-2">
                <h2 class="text-2xl font-bold text-slate-800">My Catalogue</h2>
                <button onclick="document.getElementById('catalogue-upload').click()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg transition flex items-center gap-2">
                    <i class="fa-solid fa-cloud-arrow-up"></i> Upload Image
                </button>
                <input type="file" id="catalogue-upload" class="hidden" accept="image/*" onchange="handleCatalogueUpload(this)">
            </div>
            <div id="catalogue-empty" class="text-center py-20 hidden">
                <div class="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fa-regular fa-images text-4xl text-indigo-300"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">No images yet</h3>
                <p class="text-slate-500 max-w-md mx-auto mb-8">Upload images of your products or designs to build your visual catalogue.</p>
            </div>
            <div id="catalogue-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"></div>
        </div>
        <div id="catalogue-detail-view" class="hidden min-h-screen flex flex-col pb-20">
            <div class="flex items-center justify-between mb-2 pt-4 relative z-10">
                <button onclick="closeCatalogueDetail()" class="text-slate-500 hover:text-slate-800 transition flex items-center gap-2 font-medium">
                    <i class="fa-solid fa-arrow-left"></i> Back to Catalog
                </button>
                <div class="relative">
                    <button onclick="toggleCatalogueSettings()" class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <div id="catalogue-settings-menu" class="hidden absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                        <button onclick="enableEditMode()" class="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 flex items-center gap-3 transition text-sm">
                            <i class="fa-solid fa-pen-to-square"></i> Edit Details
                        </button>
                        <button onclick="triggerAddPage()" class="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 flex items-center gap-3 transition text-sm">
                            <i class="fa-solid fa-file-circle-plus"></i> Add Page
                        </button>
                        <button onclick="renameCatalogueItem()" class="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 flex items-center gap-3 transition text-sm">
                            <i class="fa-solid fa-pen"></i> Rename
                        </button>
                        <button onclick="deleteActiveCatalogueItem()" class="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-3 transition text-sm">
                            <i class="fa-solid fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
            <h1 id="detail-title" class="text-2xl md:text-3xl font-bold text-slate-800 mb-6 text-center tracking-tight">Item Name</h1>
            <div class="max-w-5xl mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 md:p-8">
                <!-- Tab Headers -->
                <div class="flex border-b border-slate-100 mb-6">
                    <button onclick="switchDetailTab('details')" id="tab-btn-details" class="px-6 py-3 font-bold text-indigo-600 border-b-2 border-indigo-600 transition">
                        Details
                    </button>
                    <button onclick="switchDetailTab('ledger')" id="tab-btn-ledger" class="px-6 py-3 font-medium text-slate-500 hover:text-slate-800 transition">
                        Cutting Ledger
                    </button>
                    <button onclick="switchDetailTab('3d')" id="tab-btn-3d" class="px-6 py-3 font-medium text-slate-500 hover:text-slate-800 transition flex items-center gap-2">
                        <i class="fa-solid fa-cube"></i> 3D Pattern
                    </button>
                </div>

                <!-- Tab: Details -->
                <div id="tab-content-details">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 align-top">
                        <!-- Image Section -->
                        <div class="rounded-2xl overflow-hidden bg-slate-50 h-[400px] flex items-center justify-center border border-slate-100 relative group">
                            <img id="detail-image" src="" class="max-w-full max-h-full object-contain" alt="Catalogue Item">
                        </div>
                        
                        <!-- Form Section -->
                        <div class="flex flex-col">
                            <div class="flex justify-between items-center mb-4">
                                <h2 class="text-xl font-bold text-slate-800">Details</h2>
                                <div class="w-full max-w-[140px]">
                                    <input type="date" id="detail-date" disabled aria-label="Date" class="detail-input w-full bg-transparent border-none p-0 text-slate-500 font-medium text-sm text-right outline-none focus:ring-0 disabled:text-slate-500 disabled:opacity-100">
                                </div>
                            </div>
                            
                            <div class="mb-6">
                                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea id="detail-description" disabled class="detail-input w-full h-24 bg-slate-50 border-none rounded-xl p-3 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition disabled:bg-transparent disabled:cursor-default disabled:resize-none" placeholder="Add a description..."></textarea>
                            </div>

                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fabric</label>
                                    <input type="text" id="detail-fabric" disabled class="detail-input w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition disabled:bg-transparent disabled:cursor-default" placeholder="e.g. Cotton">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Brand</label>
                                    <input type="text" id="detail-brand" disabled class="detail-input w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition disabled:bg-transparent disabled:cursor-default" placeholder="e.g. Levi's">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fitting</label>
                                    <select id="detail-fitting" disabled aria-label="Fitting" class="detail-input w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition appearance-none disabled:bg-transparent disabled:cursor-default">
                                        <option value="">Select...</option>
                                        <option value="Regular">Regular</option>
                                        <option value="Slim">Slim</option>
                                        <option value="Loose">Loose</option>
                                        <option value="Oversized">Oversized</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pattern</label>
                                    <input type="text" id="detail-pattern" disabled class="detail-input w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition disabled:bg-transparent disabled:cursor-default" placeholder="e.g. Solid">
                                </div>
                            </div>

                            <div class="mt-auto flex justify-end gap-3">
                                <button id="cancel-catalogue-btn" onclick="cancelEditMode()" class="hidden px-6 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-bold hover:bg-slate-200 transition shadow-sm animate-fade-in-up">
                                    Cancel
                                </button>
                                <button id="save-catalogue-btn" onclick="saveCatalogueDetail()" class="hidden px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 transition shadow-md animate-fade-in-up">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Additional Pages Gallery -->
                    <div id="detail-pages-section" class="mt-8 border-t border-slate-100 pt-6">
                        <h3 class="font-bold text-slate-800 mb-4">Additional Pages</h3>
                        
                        <!-- Front Pages -->
                        <div class="mb-6">
                            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Front View Pages (<span id="count-front">0</span>/5)</h4>
                            <div class="flex gap-4 overflow-x-auto pb-2" id="gallery-front"></div>
                        </div>

                        <!-- Back Pages -->
                        <div>
                            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Back View Pages (<span id="count-back">0</span>/5)</h4>
                            <div class="flex gap-4 overflow-x-auto pb-2" id="gallery-back"></div>
                        </div>
                    </div>

                    <!-- Hidden Input for Page Upload -->
                    <input type="file" id="catalogue-page-upload" class="hidden" accept="image/*" onchange="handlePageUpload(this)">
                </div>

                <!-- Tab: Cutting Ledger -->
                <div id="tab-content-ledger" class="hidden">
                     <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold text-slate-800">Cutting Output</h2>
                    </div>
                     <div class="overflow-x-auto border rounded-xl border-slate-200 mb-4">
                        <table class="w-full text-sm text-left">
                            <thead class="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                                <tr>
                                    <th class="p-3 w-16 text-center">Sl No</th>
                                    <th class="p-3 w-24 text-center">Meters</th>
                                    <th class="p-3 w-16 text-center border-l border-slate-200">30</th>
                                    <th class="p-3 w-16 text-center">32</th>
                                    <th class="p-3 w-16 text-center">34</th>
                                    <th class="p-3 w-16 text-center">36</th>
                                    <th class="p-3 w-20 text-center font-bold text-slate-700 border-l border-slate-200">Total</th>
                                    <th class="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody id="catalogue-ledger-body"></tbody>
                        </table>
                    </div>
                    <button onclick="addCatalogueLedgerRow()" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition flex items-center gap-2">
                        <i class="fa-solid fa-plus"></i> Add Row
                    </button>
                </div>

                <!-- Tab: 3D Pattern View -->
                <div id="tab-content-3d" class="hidden">
                    <div class="flex flex-col md:flex-row gap-6 h-[500px]">
                        <!-- Controls -->
                        <div class="w-full md:w-56 bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col gap-4">
                            <h3 class="font-bold text-slate-700 mb-2">Pattern Options</h3>
                            
                            <label class="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition">
                                <input type="checkbox" id="chk-3d-flap" onchange="update3DScene()" class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500">
                                <span class="text-sm font-medium text-slate-700">Box Flap</span>
                            </label>

                            <label class="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition">
                                <input type="checkbox" id="chk-3d-box" onchange="update3DScene()" class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500">
                                <span class="text-sm font-medium text-slate-700">Box Style</span>
                            </label>

                            <div class="mt-auto">
                                <p class="text-xs text-slate-400">
                                    <i class="fa-solid fa-mouse me-1"></i> left click to rotate<br>
                                    <i class="fa-solid fa-computer-mouse me-1"></i> scroll to zoom
                                </p>
                            </div>
                        </div>

                        <!-- Canvas -->
                        <div class="flex-1 bg-slate-900 rounded-xl overflow-hidden relative shadow-inner" id="pattern-canvas-container">
                            <div id="pattern-canvas" class="w-full h-full"></div>
                            <div class="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                                Three.js Viewer
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    dashboard: () => `
    <div id="dashboard" class="fade-in max-w-7xl mx-auto">
        <div class="mb-8 flex justify-between items-center">
            <div>
                <h2 class="text-3xl font-bold text-slate-800">Analytics & Logs</h2>
                <p class="text-slate-500 mt-1">Detailed charts and production history.</p>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-700 flex items-center gap-2">
                        <i class="fa-solid fa-chart-column text-indigo-500"></i> Annual Production
                    </h3>
                </div>
                <div class="chart-container h-64"><canvas id="revenueChart"></canvas></div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-700 flex items-center gap-2">
                        <i class="fa-solid fa-chart-line text-emerald-500"></i> Weekly Analytics
                    </h3>
                </div>
                <div class="chart-container h-64"><canvas id="weeklyChart"></canvas></div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-8">
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 class="font-bold text-slate-700 mb-4">Washing Output (This Month)</h3>
                <div class="h-64">
                    <canvas id="washingChart"></canvas>
                </div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 class="font-bold text-slate-700 mb-4">Salary Distribution</h3>
                <div class="h-64 flex justify-center">
                    <canvas id="salaryPieChart"></canvas>
                </div>
            </div>
        </div>
        <div class="glass-panel rounded-2xl p-1 shadow-sm mb-10">
            <div class="bg-white rounded-xl p-6 border border-slate-100">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-slate-800">Daily Production Log</h3>
                    <div class="flex gap-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <div class="px-4 border-r border-slate-200 text-center">
                            <p class="text-[10px] uppercase font-bold text-slate-400">Total Ps</p>
                            <p class="text-xl font-bold text-indigo-600" id="hud-total-ps">0</p>
                        </div>
                        <div class="px-4 text-center">
                            <p class="text-[10px] uppercase font-bold text-slate-400">Missing</p>
                            <p class="text-xl font-bold text-red-500" id="hud-missing-ps">0</p>
                        </div>
                    </div>
                </div>
                <table class="w-full text-sm text-left whitespace-nowrap mb-4" id="daily-log-table">
                    <thead class="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                        <tr>
                            <th class="p-3 w-40">Date</th>
                            <th class="p-3">Details (Alt for Voice)</th>
                            <th class="p-3 w-24">Total</th>
                            <th class="p-3 w-24">Missing</th>
                            <th class="p-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody id="ledger-body"></tbody>
                </table>
                <div class="flex gap-3">
                    <button onclick="addDashboardLedgerRow()" class="bg-white border border-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition"><i class="fa-solid fa-plus"></i> Add (Alt+N)</button>
                    <div class="flex-1"></div>
                    <button onclick="saveLedger()" class="bg-slate-800 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2 hover:bg-slate-700 transition"><i class="fa-solid fa-cloud-arrow-up"></i> Save (Ctrl+S)</button>
                </div>
            </div>
        </div>
        <div class="glass-panel rounded-2xl p-1 shadow-sm mb-10">
            <div class="bg-white rounded-xl p-6 border border-slate-100">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-soap text-blue-400"></i> Washing Details
                    </h3>
                    <div class="bg-blue-50 p-2 rounded-lg border border-blue-100 px-4 text-center">
                        <p class="text-[10px] uppercase font-bold text-slate-400">Total Washing Pcs</p>
                        <p class="text-xl font-bold text-blue-600" id="hud-washing-total">0</p>
                    </div>
                </div>
                <table class="w-full text-sm text-left whitespace-nowrap mb-4">
                    <thead class="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                        <tr>
                            <th class="p-3 w-40">Date</th>
                            <th class="p-3">Details / Batch No</th>
                            <th class="p-3 w-32 text-center">No. of Pcs</th>
                            <th class="p-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody id="washing-body"></tbody>
                </table>
                <div class="flex gap-3">
                    <button onclick="addWashingRow()" class="bg-white border border-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition">
                        <i class="fa-solid fa-plus"></i> Add Row
                    </button>
                    <div class="flex-1"></div>
                    <button onclick="saveWashingLog()" class="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2 hover:bg-blue-700 transition">
                        <i class="fa-solid fa-save"></i> Save Washing
                    </button>
                </div>
            </div>
        </div>
    </div>`,

    staff: () => `
    <div id="staff" class="fade-in max-w-7xl mx-auto">
        <div id="staff-list-view">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-3xl font-bold text-slate-800">Staff Management</h2>
                    <p class="text-slate-500 mt-1">Select an employee to view their ledger.</p>
                </div>
                <div class="flex gap-3">
                    <a href="#/attendance" class="bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center gap-2">
                        <i class="fa-solid fa-clipboard-user"></i> Attendance
                    </a>
                    <button onclick="toggleAddStaffModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium shadow-lg transition flex items-center gap-2">
                        <i class="fa-solid fa-user-plus"></i> Add Employee
                    </button>
                    <button onclick="toggleDetailsModal()" class="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg font-medium shadow-md transition flex items-center gap-2" title="Wage Summary">
                        <i class="fa-solid fa-circle-info text-xl"></i>
                    </button>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-slate-100 p-6 rounded-2xl border border-slate-200/60 flex flex-col h-full">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-slate-700 flex items-center gap-2">
                            <i class="fa-solid fa-user-clock text-indigo-500"></i> Time Based Staff
                        </h3>
                        <div class="flex gap-2">
                            <button onclick="toggleSort('timings')" class="bg-white w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 shadow-sm transition flex items-center justify-center" title="Sort">
                                <i class="fa-solid fa-arrow-down-a-z" id="sort-icon-timings"></i>
                            </button>
                            <button onclick="toggleSearch('timings')" class="bg-white w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 shadow-sm transition flex items-center justify-center" title="Search">
                                <i class="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </div>
                    </div>
                    <div id="search-box-timings" class="hidden mb-4">
                        <input type="text" oninput="handleStaffSearch('timings', this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" placeholder="Search by name...">
                    </div>
                    <div class="grid grid-cols-1 gap-4 overflow-y-auto max-h-[500px]" id="staff-grid-timings">
                    </div>
                </div>
                <div class="bg-slate-100 p-6 rounded-2xl border border-slate-200/60 flex flex-col h-full">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-slate-700 flex items-center gap-2">
                            <i class="fa-solid fa-user-tag text-emerald-500"></i> Piece Work Staff
                        </h3>
                        <div class="flex gap-2">
                            <button onclick="toggleSort('pcs')" class="bg-white w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 shadow-sm transition flex items-center justify-center" title="Sort">
                                <i class="fa-solid fa-arrow-down-a-z" id="sort-icon-pcs"></i>
                            </button>
                            <button onclick="toggleSearch('pcs')" class="bg-white w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 shadow-sm transition flex items-center justify-center" title="Search">
                                <i class="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </div>
                    </div>
                    <div id="search-box-pcs" class="hidden mb-4">
                        <input type="text" oninput="handleStaffSearch('pcs', this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 outline-none" placeholder="Search by name...">
                    </div>
                    <div class="grid grid-cols-1 gap-4 overflow-y-auto max-h-[500px]" id="staff-grid-pcs"></div>
                </div>
            </div>
        </div>
        <div id="staff-ledger-view" class="hidden">
            <div class="flex items-center gap-4 mb-6">
                <button onclick="closeLedgerView()" class="bg-white border border-slate-300 text-slate-600 w-10 h-10 rounded-full hover:bg-slate-50 transition shadow-sm flex items-center justify-center" title="Back (Esc)"><i class="fa-solid fa-arrow-left"></i></button>
                <div class="flex items-center gap-3">
                    <button onclick="changeLedgerEmployee(-1)" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition"><i class="fa-solid fa-chevron-left"></i></button>
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800" id="ledger-emp-name">Employee Name</h2>
                        <p class="text-sm text-slate-500" id="ledger-emp-role">Role</p>
                    </div>
                    <button onclick="changeLedgerEmployee(1)" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
                <div class="flex-1"></div>
                <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                    <button onclick="changeLedgerMonth(-1)" class="text-slate-400 hover:text-indigo-600"><i class="fa-solid fa-chevron-left"></i></button>
                    <span id="ledger-month-label" class="text-sm font-bold text-slate-800 min-w-[120px] text-center uppercase">--</span>
                    <button onclick="changeLedgerMonth(1)" class="text-slate-400 hover:text-indigo-600"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap gap-6 items-center justify-between">
                    <div class="flex gap-6">
                        <div id="financial-salary-container">
                            <label class="block text-[10px] font-bold text-slate-400 uppercase" id="salary-label">Basic Salary</label>
                            <div class="flex items-center text-slate-700 font-bold"><span>₹</span><input type="number" id="ledger-salary" onchange="saveFinancials()" class="bg-transparent border-b border-slate-300 w-24 focus:border-indigo-500 outline-none px-1" placeholder="0"></div>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase">Advance Taken</label>
                            <div class="flex items-center text-red-600 font-bold"><span>₹</span><input type="number" id="ledger-advance" onchange="saveFinancials()" class="bg-transparent border-b border-red-200 w-24 focus:border-red-500 outline-none px-1" placeholder="0"></div>
                        </div>
                    </div>
                    <div id="salary-calc-btn-container">
                        <button onclick="calculateSalary()" class="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-slate-700 transition flex items-center gap-2"><i class="fa-solid fa-calculator"></i> Calculate Pay</button>
                    </div>
                    <div class="text-xs text-slate-500 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100" id="ledger-hints"></div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm border-collapse" id="staff-table">
                        <thead id="ledger-table-head"></thead>
                        <tbody id="ledger-table-body" class="divide-y divide-slate-100"></tbody>
                    </table>
                    <div id="pcs-add-row-container" class="p-3 text-center border-t border-slate-100 hidden">
                        <button onclick="addPcsRow()" class="text-emerald-600 font-bold text-sm hover:underline flex items-center justify-center gap-2 w-full py-2 hover:bg-emerald-50/50 rounded-lg transition"><i class="fa-solid fa-plus"></i> Add Row (Alt+N / Enter at end)</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`,

    attendance: () => `
    <div id="attendance" class="fade-in max-w-full mx-auto px-4">
        <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 class="text-3xl font-bold text-slate-800">Attendance Register</h2>
                <p class="text-slate-500 mt-1">Manage daily logs or view monthly consolidated book.</p>
            </div>
            <div class="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <div class="flex bg-slate-100 p-1 rounded-lg">
                    <button onclick="switchAttView('daily')" id="btn-att-daily" class="px-4 py-1.5 rounded-md text-sm font-bold shadow-sm bg-white text-indigo-600 transition">Daily</button>
                    <button onclick="switchAttView('monthly')" id="btn-att-monthly" class="px-4 py-1.5 rounded-md text-sm font-bold text-slate-500 hover:text-slate-700 transition">Monthly Book</button>
                </div>
                <div id="att-daily-controls">
                    <input type="date" id="attendance-date" class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" onchange="renderAttendanceView()">
                </div>
                <div id="att-monthly-controls" class="hidden">
                    <input type="month" id="attendance-month" class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" onchange="renderAttendanceBook()">
                </div>
            </div>
        </div>
        <div id="att-daily-view" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table class="w-full text-sm text-left border-collapse">
                <thead class="bg-slate-50 text-slate-600 font-bold uppercase text-xs">
                    <tr>
                        <th class="p-4 border-b border-slate-200">Employee</th>
                        <th class="p-4 border-b border-slate-200 w-48">Status / Action</th>
                        <th class="p-4 border-b border-slate-200 w-32 text-center">Clock In</th>
                        <th class="p-4 border-b border-slate-200 w-32 text-center">Clock Out</th>
                        <th class="p-4 border-b border-slate-200 w-24 text-center">Hours</th>
                    </tr>
                </thead>
                <tbody id="attendance-body" class="divide-y divide-slate-100"></tbody>
            </table>
            <div id="attendance-empty-state" class="hidden p-10 text-center text-slate-400">
                <i class="fa-solid fa-users-slash text-4xl mb-3 opacity-20"></i>
                <p>No employees found.</p>
            </div>
        </div>
        <div id="att-monthly-view" class="hidden bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-left border-collapse whitespace-nowrap">
                    <thead class="bg-slate-50 text-slate-600 font-bold uppercase" id="att-book-head"></thead>
                    <tbody id="att-book-body" class="divide-y divide-slate-100"></tbody>
                </table>
            </div>
        </div>
    </div>`,

    history: () => `
    <div id="history" class="fade-in max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-slate-800">History Archives</h2>
            <div class="flex items-center gap-4 bg-white px-4 py-2 rounded-full border" id="history-controls">
                <button onclick="changePage(1)"><i class="fa-solid fa-chevron-left"></i></button><span id="history-month-label" class="text-sm font-bold">--</span><button onclick="changePage(-1)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
        <div class="mb-4 relative max-w-md">
            <div class="relative"><input type="text" id="history-search" oninput="renderHistoryPage()" placeholder="Search..." class="w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"><i class="fa-solid fa-magnifying-glass absolute left-3 top-3.5 text-slate-400"></i></div>
        </div>
        <div class="glass-panel rounded-lg min-h-[500px] overflow-hidden">
            <div id="history-page-content"></div>
        </div>
    </div>`,

    accounts: () => `
    <div id="accounts" class="fade-in max-w-7xl mx-auto">
        <div class="mb-8 flex justify-between items-center">
            <div>
                <h2 class="text-3xl font-bold text-slate-800">Cash Book</h2>
                <p class="text-slate-500 mt-1">Track factory income and expenses.</p>
            </div>
            <div class="text-right">
                <p class="text-xs uppercase font-bold text-slate-400">Current Balance</p>
                <p class="text-3xl font-bold text-slate-800" id="acc-balance">₹ 0.00</p>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                <h3 class="font-bold text-slate-700 mb-4">New Transaction</h3>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                <div class="flex gap-2 mb-4">
                    <button onclick="setTransType('credit')" id="btn-credit" class="flex-1 py-2 rounded-lg border border-emerald-500 text-emerald-600 font-bold hover:bg-emerald-50 active-type">Credit (+)</button>
                    <button onclick="setTransType('debit')" id="btn-debit" class="flex-1 py-2 rounded-lg border border-slate-200 text-slate-400 font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200">Debit (-)</button>
                </div>
                <input type="hidden" id="trans-type" value="credit">
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                <input type="date" id="trans-date" class="w-full mb-3 p-2 border rounded-lg outline-none focus:border-indigo-500">
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <input type="text" id="trans-desc" placeholder="e.g. Fabric from Surat" class="w-full mb-3 p-2 border rounded-lg outline-none focus:border-indigo-500">
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                <input type="number" id="trans-amt" placeholder="0.00" class="w-full mb-6 p-2 border rounded-lg outline-none focus:border-indigo-500 text-lg font-bold">
                <button onclick="addTransaction()" class="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition shadow-lg">Save Entry</button>
            </div>
            <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div class="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-600 flex justify-between">
                    <span>Recent Transactions</span>
                </div>
                <div class="overflow-y-auto flex-1 max-h-[600px]">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-white text-slate-400 font-bold text-xs uppercase sticky top-0 shadow-sm">
                            <tr>
                                <th class="p-4">Date</th>
                                <th class="p-4">Description</th>
                                <th class="p-4 text-right">Amount</th>
                                <th class="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody id="acc-table-body" class="divide-y divide-slate-50"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`,

    units: () => `
    <div id="units" class="fade-in max-w-7xl mx-auto">
        <div class="mb-8">
            <h2 class="text-3xl font-bold text-slate-800">Managing Units</h2>
            <p class="text-slate-500 mt-1">Overview of factory production units and assigned staff.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Cutting Unit -->
            <div onclick="window.filterUnit('Cutting')" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition cursor-pointer group">
                <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                    <i class="fa-solid fa-scissors"></i>
                </div>
                <h3 class="font-bold text-slate-700 text-lg">Cutting Unit</h3>
                <p class="text-xs text-slate-400 mt-1">Fabric & Pattern Cutting</p>
                <div class="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span class="text-xs font-bold text-slate-500">Staff Count</span>
                    <span class="text-lg font-bold text-indigo-600" id="count-cutting">0</span>
                </div>
            </div>

            <!-- FB Unit -->
            <div onclick="window.filterUnit('FB')" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition cursor-pointer group">
                <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                    <i class="fa-solid fa-vest"></i>
                </div>
                <h3 class="font-bold text-slate-700 text-lg">Front & Back</h3>
                <p class="text-xs text-slate-400 mt-1">Stitching Operations</p>
                <div class="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span class="text-xs font-bold text-slate-500">Staff Count</span>
                    <span class="text-lg font-bold text-emerald-600" id="count-fb">0</span>
                </div>
            </div>

            <!-- Assembly Unit -->
            <div onclick="window.filterUnit('Assembly')" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition cursor-pointer group">
                <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                    <i class="fa-solid fa-people-group"></i>
                </div>
                <h3 class="font-bold text-slate-700 text-lg">Assembly Unit</h3>
                <p class="text-xs text-slate-400 mt-1">Final Assembly</p>
                <div class="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span class="text-xs font-bold text-slate-500">Staff Count</span>
                    <span class="text-lg font-bold text-blue-600" id="count-assembly">0</span>
                </div>
            </div>

            <!-- Finishing Unit -->
            <div onclick="window.filterUnit('Finishing')" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-200 transition cursor-pointer group">
                <div class="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                    <i class="fa-solid fa-shirt"></i>
                </div>
                <h3 class="font-bold text-slate-700 text-lg">Finishing Unit</h3>
                <p class="text-xs text-slate-400 mt-1">Ironing & Packing</p>
                <div class="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span class="text-xs font-bold text-slate-500">Staff Count</span>
                    <span class="text-lg font-bold text-orange-600" id="count-finishing">0</span>
                </div>
            </div>
        </div>

        <!-- Unit Details Section -->
        <div id="unit-details-panel" class="hidden bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden fade-in">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                    <h3 class="text-xl font-bold text-slate-800" id="selected-unit-title">Unit Name</h3>
                    <p class="text-xs text-slate-500">Assigned Employees</p>
                </div>
                <button onclick="closeUnitDetails()" class="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="unit-staff-list">
                <!-- Staff Cards Injected Here -->
            </div>
        </div>
    </div>`,

    inventory: () => `
    <div id="inventory" class="fade-in max-w-7xl mx-auto">
        <div class="mb-8 flex justify-between items-center">
            <div>
                <h2 class="text-3xl font-bold text-slate-800">Store Inventory</h2>
                <p class="text-slate-500 mt-1">Track Raw Materials (Fabric, Trims, Packaging)</p>
            </div>
            <div class="flex gap-4">
                <div class="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                    <p class="text-[10px] uppercase font-bold text-slate-400">Total Items</p>
                    <p class="text-xl font-bold text-slate-800" id="inv-stat-total">0</p>
                </div>
                <div class="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                    <p class="text-[10px] uppercase font-bold text-slate-400">Low Stock</p>
                    <p class="text-xl font-bold text-red-500" id="inv-stat-low">0</p>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-4">
                <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-plus-circle text-indigo-500"></i> Add Stock
                </h3>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Item Name</label>
                <input type="text" id="inv-new-name" placeholder="e.g. Denim Navy Roll #402" class="w-full mb-3 p-2 border rounded-lg outline-none focus:border-indigo-500">
                <div class="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                        <select id="inv-new-type" class="w-full p-2 border rounded-lg outline-none focus:border-indigo-500 bg-white">
                            <option value="Fabric">Fabric</option>
                            <option value="Trim">Trim/Accessory</option>
                            <option value="Packaging">Packaging</option>
                            <option value="Machine">Machine Part</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Supplier</label>
                        <input type="text" id="inv-new-supplier" placeholder="e.g. Surat Tex" class="w-full p-2 border rounded-lg outline-none focus:border-indigo-500">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                        <input type="number" id="inv-new-qty" placeholder="0" class="w-full p-2 border rounded-lg outline-none focus:border-indigo-500 font-bold">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Unit</label>
                        <select id="inv-new-unit" class="w-full p-2 border rounded-lg outline-none focus:border-indigo-500 bg-white">
                            <option value="Meters">Meters</option>
                            <option value="Kg">Kg</option>
                            <option value="Pcs">Pcs</option>
                            <option value="Rolls">Rolls</option>
                        </select>
                    </div>
                </div>
                <button onclick="addInventoryItem()" class="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition shadow-lg">
                    Add to Inventory
                </button>
            </div>
            <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                <div class="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-600 flex justify-between">
                    <span>Current Stock</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-white text-slate-400 font-bold text-xs uppercase sticky top-0 shadow-sm z-10">
                            <tr>
                                <th class="p-4">Item Details</th>
                                <th class="p-4 text-center">Type</th>
                                <th class="p-4 text-right">Available Qty</th>
                                <th class="p-4 text-center">Last Updated</th>
                                <th class="p-4 w-24 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="inventory-list-body" class="divide-y divide-slate-50">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`,
};
