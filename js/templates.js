
export const Templates = {
    login: () => `
    <div id="login-view">
        <div class="login-card-container">
        
        <!-- Left Side: Branding & Greeting -->
        <div class="login-left-panel">
            <!-- Decorative Background Elements -->
            <div class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/50 blur-[100px]"></div>
            <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-100/50 blur-[100px]"></div>

            <div class="relative z-10 max-w-lg text-center">
                <div class="flex flex-col items-center justify-center gap-4 mb-8">
                    <img src="assets/images/logo.jpg" alt="Smart Manager Logo" class="w-24 h-24 object-contain drop-shadow-md mix-blend-multiply rounded-3xl">
                    <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Smart Manager</h1>
                </div>

                <div class="mb-6 transform hover:scale-[1.02] transition duration-500 shrink-1 min-h-0">
                    <img src="assets/images/welcome-parrot.jpg" alt="Welcome Team" class="w-full h-auto max-h-[40vh] object-contain rounded-[24px] mix-blend-multiply">
                </div>

                <h2 class="text-3xl font-bold text-slate-800 mb-4">Welcome back!</h2>
                <p class="text-slate-500 text-lg leading-relaxed">
                    Streamline your factory operations, track production, and manage staff efficiently.
                </p>
            </div>

            <!-- Footer Copyright -->
            <div class="absolute bottom-6 text-slate-400 text-xs font-medium">
                © 2026 Sri Raghavendra Fashions
            </div>
        </div>

        <!-- Right Side: Login Form -->
        <div class="login-right-panel">
             <div class="w-full max-w-md">
                <div class="text-center md:text-left mb-10">
                    <!-- Mobile Logo (Visible only on small screens) -->
                    <div class="md:hidden flex items-center justify-center gap-2 mb-6 text-indigo-600">
                        <img src="assets/images/logo.jpg" alt="Logo" class="w-10 h-10 object-contain mix-blend-multiply rounded-xl">
                        <span class="text-xl font-bold text-slate-800">Smart Manager</span>
                    </div>

                    <h2 class="text-slate-900 text-3xl font-bold mb-3">Sign in to your account</h2>
                    <p class="text-slate-500">Please enter your details to continue.</p>
                </div>
            <!-- Role Selection -->
            <div class="flex p-1 bg-slate-100/80 rounded-2xl mb-8 border border-slate-200 relative overflow-hidden">
                <div id="role-highlight" class="absolute top-1 left-1 bottom-1 w-[calc(33.33%-4px)] bg-indigo-600 rounded-xl shadow-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-0"></div>
                
                <button onclick="switchLoginRole('owner', this)" class="role-btn active flex-1 text-center py-2.5 relative z-10 transition-colors text-white font-medium shadow-none" data-role="owner">Owner</button>
                <button onclick="switchLoginRole('manager', this)" class="role-btn flex-1 text-center py-2.5 relative z-10 transition-colors text-slate-500 hover:text-slate-800 font-medium" data-role="manager">Manager</button>
                <button onclick="switchLoginRole('employee', this)" class="role-btn flex-1 text-center py-2.5 relative z-10 transition-colors text-slate-500 hover:text-slate-800 font-medium" data-role="employee">Employee</button>
            </div>

            <!-- Email/Password Form (Owner/Manager) -->
            <div id="email-login-container" class="space-y-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                <form onsubmit="handleLogin(event)" class="space-y-5">
                    
                    <div class="input-group relative">
                        <input type="text" id="login-user" autocomplete="username" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 pt-5 pb-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-transparent peer" placeholder=" " required>
                        <label for="login-user" class="absolute left-4 top-3.5 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-focus:top-1 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-indigo-500 peer-focus:uppercase peer-focus:tracking-wider peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider">Username</label>
                        <i class="fa-solid fa-user absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 peer-focus:text-indigo-500 transition-colors"></i>
                    </div>

                    <div class="input-group relative">
                        <input type="password" id="login-pass" autocomplete="current-password" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 pt-5 pb-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-transparent peer pr-12" placeholder=" " required>
                        <label for="login-pass" class="absolute left-4 top-3.5 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-focus:top-1 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-indigo-500 peer-focus:uppercase peer-focus:tracking-wider peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider">Password</label>
                        <button type="button" onclick="togglePasswordVisibility()" class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer outline-none z-20">
                            <i class="fa-solid fa-eye" id="pass-icon"></i>
                        </button>
                    </div>

                    <div class="flex items-center justify-between text-xs">
                        <label class="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-slate-700">
                            <input type="checkbox" id="remember-me" class="accent-indigo-600 w-3 h-3 rounded custom-checkbox">
                            <span>Remember me</span>
                        </label>
                        <a href="javascript:void(0)" onclick="alert('We will inform owner')" class="text-indigo-600 font-bold hover:text-indigo-700">Forgot Password?</a>
                    </div>
                    
                    <!-- Auto-fill init -->
                    <script>setTimeout(() => window.initLoginForm && window.initLoginForm(), 100);</script>

                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden">
                         <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span class="relative z-10">Sign In</span>
                        <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform relative z-10"></i>
                    </button>
                </form>
            </div>

            <!-- Google Login (Employee) -->
             <div id="google-login-container" class="hidden space-y-6 pt-2 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                  <div class="text-center text-slate-500 text-sm mb-6 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                     Access your workspace securely via Google.
                 </div>
                 <button id="btn-google-login" onclick="signInWithGoogle()" class="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl shadow-sm border border-slate-200 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group">
                     <span class="absolute inset-0 bg-slate-100 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></span>
                     <svg width="20" height="20" viewBox="0 0 48 48" class="relative z-10"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                     <span class="relative z-10">Continue with Google</span>
                 </button>
                 <button id="btn-apple-login" onclick="signInWithApple()" style="background-color: black !important; color: white !important;" class="w-full bg-black hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-sm border border-slate-700 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group">
                     <span class="absolute inset-0 bg-slate-900 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></span>
                     <i class="fa-brands fa-apple text-xl relative z-10"></i>
                     <span class="relative z-10">Continue with Apple</span>
                 </button>
             </div>
            
            <div class="mt-8 text-center">
                <p class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Secured by Google Firebase
                </p>
            </div>

        </div>
    </div>
    </div>
    </div>`,

    appLayout: () => `
    <div id="app-view" class="h-screen flex flex-col overflow-hidden bg-slate-50">
        <!-- TOP HEADER -->
        <header class="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-4 z-[70] relative shadow-sm">
            <div class="flex items-center gap-4">
                <button onclick="toggleDesktopSidebar()" class="text-slate-500 hover:text-indigo-600 transition p-2 rounded-full hover:bg-slate-100 focus:outline-none active:scale-95">
                    <i class="fa-solid fa-bars text-xl"></i>
                </button>
                
                <!-- Logo Moved to Header -->
                <div class="flex items-center gap-3 select-none cursor-pointer" onclick="window.location.hash='#/home'">
                    <img src="assets/images/logo.jpg" alt="App Logo" class="w-9 h-9 rounded-xl shadow-md shadow-indigo-200 object-contain mix-blend-multiply">
                    <div class="flex flex-col">
                        <span class="text-xl font-bold text-slate-800 tracking-tight leading-none">Smart Manager</span>
                        <span id="header-garment-name" class="text-[10px] font-bold text-indigo-500 uppercase tracking-widest hidden"></span>
                    </div>
                </div>
            </div>

            <!-- SEARCH BAR (Using flex-1 to fill space properly) -->
            <div class="hidden md:flex flex-1 max-w-xl mx-8 relative group">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                <input type="text" placeholder="Search orders, staff, or patterns..." 
                    class="w-full bg-slate-100 border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition placeholder-slate-400 text-slate-700 outline-none shadow-sm">
            </div>

            <!-- RIGHT ACTIONS -->
            <div class="flex items-center gap-2 md:gap-4">
                 <!-- Status pill (hidden small mobile) -->
                <div class="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 select-none">
                    <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Online</span>
                </div>

                <div class="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

                <button onclick="window.showNotifications()" class="relative p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition group active:scale-95" title="Notifications">
                    <i class="fa-solid fa-bell text-xl group-hover:animate-swing"></i>
                    <div id="header-noti-badge" class="hidden w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white absolute top-1.5 right-2"></div>
                </button>

                <button onclick="window.openProfile()" class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm hover:scale-105 active:scale-95 transition" title="Profile">
                    ${(window.CONFIG && window.CONFIG.OWNER_NAME) ? window.CONFIG.OWNER_NAME[0].toUpperCase() : 'M'}
                </button>
            </div>
        </header>

        <!-- MAIN LAYOUT (Sidebar + Content) -->
        <div class="flex-1 flex overflow-hidden relative">
            
            <!-- SIDEBAR -->
            <aside id="sidebar" class="w-20 bg-white border-r border-slate-200 h-full flex flex-col z-[60] transition-all duration-300 absolute md:relative -translate-x-full md:translate-x-0">
                <!-- Branding removed from here -->

                <nav class="flex-1 px-2 space-y-2 mt-6 overflow-y-auto custom-scrollbar">
                    <a href="#/home" class="nav-btn w-full text-left p-3 rounded-full transition font-medium flex items-center gap-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 relative group justify-center" id="nav-home">
                        <i class="fa-solid fa-house w-5 text-center"></i> 
                        <div id="nav-home-badge" class="hidden w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white absolute top-3 left-7"></div>
                        <span class="nav-label hidden">Home</span> <span class="nav-label ml-auto text-[10px] opacity-50 hidden">Alt+1</span>
                    </a>
                    
                    <a href="#/catalogue" class="nav-btn w-full text-left p-3 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition font-medium flex items-center gap-3 group justify-center" id="nav-catalogue">
                        <i class="fa-solid fa-book-open w-5 text-center"></i> 
                        <span class="nav-label hidden">Catalogue</span> <span class="nav-label ml-auto text-[10px] opacity-50 hidden">Alt+2</span>
                    </a>
                    
                    <a href="#/units" class="nav-btn w-full text-left p-3 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition font-medium flex items-center gap-3 group justify-center" id="nav-units">
                        <i class="fa-solid fa-sitemap w-5 text-center"></i> 
                        <span class="nav-label hidden">Managing Units</span> <span class="nav-label ml-auto text-[10px] opacity-50 hidden">Alt+3</span>
                    </a>
                    
                    <a href="#/staff" class="nav-btn w-full text-left p-3 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition font-medium flex items-center gap-3 group justify-center" id="nav-staff">
                        <i class="fa-solid fa-users w-5 text-center"></i> 
                        <span class="nav-label hidden">Staff</span> <span class="nav-label ml-auto text-[10px] opacity-50 hidden">Alt+4</span>
                    </a>

                    <a href="#/history" class="nav-btn w-full text-left p-3 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition font-medium flex items-center gap-3 group justify-center" id="nav-history">
                        <i class="fa-solid fa-clock-rotate-left w-5 text-center"></i> 
                        <span class="nav-label hidden">History</span> <span class="nav-label ml-auto text-[10px] opacity-50 hidden">Alt+5</span>
                    </a>
                    
                    <a href="#/dashboard" class="nav-btn w-full text-left p-3 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition font-medium flex items-center gap-3 group justify-center" id="nav-dashboard">
                        <i class="fa-solid fa-chart-pie w-5 text-center"></i> 
                        <span class="nav-label hidden">Analytics</span> <span class="nav-label ml-auto text-[10px] opacity-50 hidden">Alt+6</span>
                    </a>

                    <a href="#/accounts" class="nav-btn w-full text-left p-3 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition font-medium flex items-center gap-3 group justify-center" id="nav-accounts">
                         <i class="fa-solid fa-file-invoice-dollar w-5 text-center"></i>
                         <span class="nav-label hidden">Expenses</span>
                    </a>
                    

                </nav>
                
                <div id="sidebar-garment-name" class="px-1 py-3 text-center border-t border-slate-100 hidden">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block truncate"></span>
                </div>

                <!-- Bottom Status -->
                <div class="p-3 border-t border-slate-100 bg-slate-50/50">
                     <a href="#/settings" class="nav-btn w-full mb-3 text-left p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition font-bold text-sm flex items-center gap-3 group justify-center">
                        <i class="fa-solid fa-gear group-hover:rotate-90 transition duration-500 w-5 text-center"></i>
                        <span class="nav-label flex-1 text-sm hidden">App Settings</span>
                    </a>

                    <!-- Restore Cloud Status -->
                    <div class="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center gap-3 mb-2 justify-center group hover:border-indigo-200 transition">
                        <i id="status-cloud-icon" class="fa-solid fa-cloud text-slate-400 text-lg transition-colors duration-300 group-hover:text-indigo-400"></i>
                        <div class="nav-label flex-1 relative overflow-hidden hidden">
                            <p class="text-[10px] text-slate-400 font-semibold uppercase whitespace-nowrap tracking-wide">System Status</p>
                            <div class="flex items-center gap-2 mt-0.5">
                                <div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" id="status-dot"></div>
                                <span class="text-xs font-bold text-slate-600 whitespace-nowrap truncate" id="status-text">Local Data Active</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Version Info -->
                    <div class="text-[10px] text-slate-400 text-center nav-label font-mono select-none opacity-60">
                        v5.6 • Build 2026
                    </div>
                </div>
            </aside>

            <!-- MAIN CONTENT AREA -->
            <main class="flex-1 h-full overflow-y-auto relative scroll-smooth p-4 pb-24 md:p-8 md:pb-8 custom-scrollbar" onclick="closeSidebarOnMobile()">
                <div id="router-outlet" class="max-w-7xl mx-auto min-h-full"></div>
            </main>
        </div>

        <!-- MOBILE NAV (Bottom - Kept for accessibility on small screens) -->
        <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 pb-safe z[80] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <a href="#/home" id="mobile-nav-home" class="nav-btn-mobile flex flex-col items-center justify-center w-16 p-1 rounded-xl text-slate-400 hover:text-indigo-600 transition active:scale-95">
                <i class="fa-solid fa-house text-xl mb-1"></i>
                <span class="text-[10px] font-bold">Home</span>
            </a>
            <a href="#/catalogue" id="mobile-nav-catalogue" class="nav-btn-mobile flex flex-col items-center justify-center w-16 p-1 rounded-xl text-slate-400 hover:text-indigo-600 transition active:scale-95">
                <i class="fa-solid fa-book-open text-xl mb-1"></i>
                <span class="text-[10px] font-bold">Catalogue</span>
            </a>
            <button onclick="toggleSidebar()" class="nav-btn-mobile flex flex-col items-center justify-center w-16 p-1 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition border border-transparent active:scale-95">
                <i class="fa-solid fa-bars text-xl mb-1"></i>
                <span class="text-[10px] font-bold">Menu</span>
            </button>
            <a href="#/dashboard" id="mobile-nav-dashboard" class="nav-btn-mobile flex flex-col items-center justify-center w-16 p-1 rounded-xl text-slate-400 hover:text-indigo-600 transition active:scale-95">
                <i class="fa-solid fa-chart-pie text-xl mb-1"></i>
                <span class="text-[10px] font-bold">Reports</span>
            </a>
            <a href="#/staff" id="mobile-nav-staff" class="nav-btn-mobile flex flex-col items-center justify-center w-16 p-1 rounded-xl text-slate-400 hover:text-indigo-600 transition active:scale-95">
                <i class="fa-solid fa-users text-xl mb-1"></i>
                <span class="text-[10px] font-bold">Staff</span>
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
                <div class="flex flex-wrap justify-center md:justify-start gap-2">
                    <button onclick="window.openProfile()" class="bg-blue-600 text-white font-medium py-2.5 px-6 rounded-full hover:bg-blue-700 transition inline-block">
                        View Profile
                    </button>
                    <button onclick="window.showNotifications()" class="ml-2 bg-slate-100 text-slate-600 font-medium py-2.5 px-6 rounded-full hover:bg-slate-200 transition inline-block relative">
                        <div id="btn-noti-badge" class="hidden w-3 h-3 bg-red-500 rounded-full border-2 border-slate-100 absolute top-0 right-0"></div>
                        <i class="fa-solid fa-bell mr-2"></i> Notifications
                    </button>
                </div>
            </div>
            <div class="shrink-0">
                <img src="assets/images/welcome-parrot.jpg" alt="Welcome" class="h-40 w-auto object-contain drop-shadow-sm hover:scale-105 transition duration-500 rounded-[32px]">
            </div>
        </div>

        <div class="grid grid-cols-1 gap-8 mb-8">
            <!-- Metrics Section (Scrollable) -->
            <div class="min-w-0">
                <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                    <i class="fa-solid fa-chart-simple text-indigo-500"></i> Snapshots
                </h3>
                <div id="snapshot-container" class="flex overflow-x-auto gap-6 hide-scrollbar snap-x snap-mandatory pb-4">
                    <!-- Staff Card -->
                    <div class="w-full snap-center bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between relative group hover:shadow-md transition" style="width: 100%; flex-shrink: 0;">
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

                    <!-- Production Card -->
                     <div class="w-full snap-center bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between relative group hover:shadow-md transition" style="width: 100%; flex-shrink: 0;">
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

                    <!-- Washing Card -->
                    <div class="w-full snap-center bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between relative group hover:shadow-md transition" style="width: 100%; flex-shrink: 0;">
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
            </div>

            <!-- Recommendation Panel (White Theme) -->
            <div class="flex flex-col">
                <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                    <i class="fa-solid fa-lightbulb text-yellow-500"></i> Smart Recommendations
                </h3>
                <div class="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex-1 flex flex-col relative group hover:shadow-md transition">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Insight Item 1 -->
                        <div class="flex items-start gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                            <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                <i class="fa-solid fa-arrow-trend-up"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800 text-sm mb-0.5">Production Surge</h4>
                                <p class="text-sm text-slate-500 leading-relaxed">
                                    Production is <strong class="text-slate-700">12% higher</strong> than last Tuesday. Team "A" is outperforming targets.
                                </p>
                            </div>
                        </div>

                        <!-- Insight Item 2 -->
                        <div class="flex items-start gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                            <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800 text-sm mb-0.5">Stock Alert</h4>
                                <p class="text-sm text-slate-500 leading-relaxed">
                                    <strong class="text-slate-700">Grey Thread</strong> count is low. Recommend reordering within 2 days to avoid delays.
                                </p>
                            </div>
                        </div>

                         <!-- Insight Item 3 -->
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                <i class="fa-solid fa-cloud-sun"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800 text-sm mb-0.5">Weather Update</h4>
                                <p class="text-sm text-slate-500 leading-relaxed">
                                    Rain expected tomorrow. Ensure outdoor drying area is cleared by 4 PM.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center">
                        <span class="text-xs text-slate-400 font-medium">Updated 5 mins ago</span>
                        <button class="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-4 py-2 rounded-lg transition flex items-center gap-2">
                            View All Insights <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>

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
        <div id="holiday-menu-modal" class="hidden fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onclick="if(event.target===this) closeHolidayMenu()">
            <div class="bg-white p-6 rounded-[32px] shadow-2xl w-full max-w-sm border border-slate-100 relative flex flex-col items-center max-h-[90vh] overflow-y-auto">
                <h4 class="text-2xl font-bold text-slate-800 mb-1" id="holiday-modal-date"></h4>
                <p class="text-slate-400 text-sm mb-6 font-medium uppercase tracking-wider">Owner Actions</p>
                <div id="holiday-action-buttons" class="w-full space-y-3"></div>
                <div id="holiday-grant-form" class="hidden w-full p-4 bg-indigo-50 rounded-xl border border-indigo-100 mt-4">
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
                <h1 class="text-2xl font-normal text-slate-800 mb-6 tracking-tight">
                    Production Catalogue<br>& Specifications
                </h1>
                <p class="text-slate-500 max-w-2xl mx-auto text-xs mb-8 leading-relaxed">
                    Reference guide for manufacturing standards. Access detailed composition, stitching, and finishing specifications to ensure production consistency.
                </p>
                <div class="max-w-2xl mx-auto mb-8 relative">
                    <div class="relative">
                        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                        <input type="text" id="catalogue-search-input" oninput="handleCatalogueSearch(this.value)" placeholder="Search catalog (name, date, fabric...)" class="w-full !bg-white border-2 border-transparent focus:border-indigo-500/20 rounded-full py-4 pl-12 pr-6 text-slate-700 outline-none focus:!ring-4 focus:!ring-indigo-500/10 shadow-sm transition hover:shadow-md text-lg placeholder:text-slate-400">
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
            <input type="file" id="catalogue-page-upload" class="hidden" accept="image/*" onchange="handlePageUpload(this)">
            <h1 id="detail-title" class="text-2xl md:text-3xl font-bold text-slate-800 mb-6 text-center tracking-tight">Item Name</h1>
            <div class="max-w-5xl mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 md:p-8">
                <!-- Tab Headers -->
                <div class="flex border-b border-slate-100 mb-6">
                    <button onclick="switchDetailTab('details')" id="tab-btn-details" class="flex-1 px-6 py-3 font-bold text-indigo-600 border-b-2 border-indigo-600 transition">
                        Catalogue Details
                    </button>
                    <button onclick="switchDetailTab('3d')" id="tab-btn-3d" class="flex-1 px-6 py-3 font-medium text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-2">
                        <i class="fa-solid fa-cube"></i> 3D Pattern
                    </button>
                </div>

                <!-- Tab: Details -->
                <div id="tab-content-details">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 align-top">
                        <!-- Col 1: Image Section (25%) -->
                        <div class="lg:col-span-1">
                            <div class="rounded-2xl overflow-hidden bg-slate-50 h-[300px] flex items-center justify-center border border-slate-100 relative group mb-6">
                                <img id="detail-image" src="" class="max-w-full max-h-full object-contain cursor-pointer" alt="Catalogue Item">
                            </div>

                            <!-- Additional Pages Gallery -->
                            <div id="detail-pages-section" class="border-t border-slate-100 pt-6">
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Additional Pages (<span id="count-additional">0</span>/10)</h3>
                                </div>
                                <div class="flex gap-2 overflow-x-auto pb-2 min-h-[100px]" id="gallery-additional"></div>
                            </div>
                        </div>
                        
                        <!-- Col 2: Details Section (25%) -->
                        <div class="lg:col-span-1 flex flex-col">
                            <div class="flex justify-between items-center mb-4">
                                <h2 class="text-lg font-bold text-slate-800">Product Info</h2>
                                <input type="date" id="detail-date" disabled aria-label="Date" class="detail-input bg-transparent border-none p-0 text-slate-500 font-medium text-xs text-right outline-none focus:ring-0 disabled:text-slate-500 disabled:opacity-100">
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea id="detail-description" disabled class="detail-input w-full h-20 bg-slate-50 border-none rounded-xl p-3 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition disabled:bg-transparent disabled:cursor-default disabled:resize-none" placeholder="Add a description..."></textarea>
                            </div>

                            <div class="grid grid-cols-1 gap-4 mb-6">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fabric</label>
                                    <input type="text" id="detail-fabric" disabled class="detail-input w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition disabled:bg-transparent disabled:cursor-default" placeholder="Fabric">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Brand</label>
                                    <input type="text" id="detail-brand" disabled class="detail-input w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition disabled:bg-transparent disabled:cursor-default" placeholder="Brand">
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
                                    <input type="text" id="detail-pattern" disabled class="detail-input w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition disabled:bg-transparent disabled:cursor-default" placeholder="Pattern">
                                </div>
                            </div>

                            <div class="mt-auto flex flex-col gap-2">
                                <button id="save-catalogue-btn" onclick="saveCatalogueDetail()" class="hidden w-full px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-md">
                                    Save Changes
                                </button>
                                <button id="cancel-catalogue-btn" onclick="cancelEditMode()" class="hidden w-full px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition">
                                    Cancel
                                </button>
                            </div>
                        </div>

                        <!-- Col 3: Ledger Section (50%) -->
                        <div class="lg:col-span-2 flex flex-col border-l border-slate-100 pl-8">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-lg font-bold text-slate-800">Cutting Output</h2>
                                <button onclick="addCatalogueLedgerRow()" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition flex items-center gap-2">
                                    <i class="fa-solid fa-plus"></i> Add Row
                                </button>
                            </div>
                            <div class="overflow-x-auto border rounded-xl border-slate-200">
                                <table class="w-full text-sm text-left">
                                    <thead class="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
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
                                    <tbody id="catalogue-ledger-body" class="text-xs"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
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
        <div class="flex justify-between items-center mb-4 relative z-50">
            <h3 class="text-xl font-bold text-slate-800">Charts</h3>
             <div class="relative">
                <button onclick="toggleChartMenu()" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
                <div id="chart-settings-menu" class="hidden absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                    <button onclick="changeGlobalChartType('line')" class="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 flex items-center gap-3 transition text-sm">
                        <i class="fa-solid fa-chart-line text-indigo-500"></i> Line Chart
                    </button>
                    <button onclick="changeGlobalChartType('bar')" class="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 flex items-center gap-3 transition text-sm">
                        <i class="fa-solid fa-chart-simple text-blue-500"></i> Bar Chart
                    </button>
                    <button onclick="changeGlobalChartType('pie')" class="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 flex items-center gap-3 transition text-sm">
                        <i class="fa-solid fa-chart-pie text-emerald-500"></i> Pie Chart
                    </button>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- PRODUCTION CHART -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-700 flex items-center gap-2">
                        <i class="fa-solid fa-chart-line text-indigo-500"></i> Production Trends
                    </h3>
                    <div class="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
                        <button onclick="updateChartMode('production', 'daily')" id="btn-prod-daily" class="px-3 py-1 rounded-md transition text-slate-500 hover:text-indigo-600">Day</button>
                        <button onclick="updateChartMode('production', 'weekly')" id="btn-prod-weekly" class="px-3 py-1 rounded-md bg-white text-indigo-600 shadow-sm transition">Week</button>
                        <button onclick="updateChartMode('production', 'annual')" id="btn-prod-annual" class="px-3 py-1 rounded-md transition text-slate-500 hover:text-indigo-600">Year</button>
                    </div>
                </div>
                <div class="chart-container h-64 relative">
                    <canvas id="productionChart"></canvas>
                </div>
            </div>

            <!-- WASHING CHART -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-700 flex items-center gap-2">
                        <i class="fa-solid fa-chart-column text-blue-500"></i> Washing Analytics
                    </h3>
                    <div class="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
                        <button onclick="updateChartMode('washing', 'daily')" id="btn-wash-daily" class="px-3 py-1 rounded-md transition text-slate-500 hover:text-blue-600">Day</button>
                        <button onclick="updateChartMode('washing', 'weekly')" id="btn-wash-weekly" class="px-3 py-1 rounded-md bg-white text-blue-600 shadow-sm transition">Week</button>
                        <button onclick="updateChartMode('washing', 'annual')" id="btn-wash-annual" class="px-3 py-1 rounded-md transition text-slate-500 hover:text-blue-600">Year</button>
                    </div>
                </div>
                <div class="chart-container h-64 relative">
                    <canvas id="washingChart"></canvas>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-8">
            <!-- Salary Pie Chart moved to full width or left alongside -->
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
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
            <div class="bg-slate-100 p-6 rounded-2xl border border-slate-200/60">
                <!-- Tab Bar: Sliding Pill + Sort/Search on same row -->
                <div class="flex items-center justify-between mb-4">
                    <!-- Sliding Pill Tabs -->
                    <div class="relative bg-slate-200/80 rounded-full p-0.5 flex" style="min-width: 260px;">
                        <div id="staff-tab-slider" class="absolute top-0.5 left-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] bg-white rounded-full shadow-md transition-all duration-300 ease-out"></div>
                        <button id="staff-tab-timings" onclick="switchStaffType('timings')" class="relative z-10 flex-1 px-5 py-2 rounded-full text-sm font-bold transition-colors duration-200 text-slate-800">
                            <i class="fa-solid fa-user-clock mr-1.5"></i>Time Based
                        </button>
                        <button id="staff-tab-pcs" onclick="switchStaffType('pcs')" class="relative z-10 flex-1 px-5 py-2 rounded-full text-sm font-bold transition-colors duration-200 text-slate-400">
                            <i class="fa-solid fa-layer-group mr-1.5"></i>Piece Work
                        </button>
                    </div>
                    <!-- Count + Sort/Search -->
                    <div class="flex items-center gap-2">
                        <span id="staff-type-count" class="text-xs text-slate-400 font-medium mr-1"></span>
                        <button onclick="toggleSort(state.activeStaffType || 'timings')" class="bg-white w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 shadow-sm transition flex items-center justify-center" title="Sort">
                            <i class="fa-solid fa-arrow-down-a-z" id="sort-icon-timings"></i>
                            <i class="fa-solid fa-arrow-down-a-z hidden" id="sort-icon-pcs"></i>
                        </button>
                        <button onclick="toggleSearch(state.activeStaffType || 'timings')" class="bg-white w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 shadow-sm transition flex items-center justify-center" title="Search">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                </div>
                <div id="search-box-timings" class="hidden mb-3">
                    <input type="text" oninput="handleStaffSearch('timings', this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none" placeholder="Search by name or role...">
                </div>
                <div id="search-box-pcs" class="hidden mb-3">
                    <input type="text" oninput="handleStaffSearch('pcs', this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 outline-none" placeholder="Search by name or role...">
                </div>
                <!-- Staff Table -->
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-50 text-[10px] uppercase text-slate-400 border-b border-slate-100">
                            <tr>
                                <th class="p-3">#</th>
                                <th class="p-3">Name</th>
                                <th class="p-3 hidden sm:table-cell">ID</th>
                                <th class="p-3 text-center">Ledger</th>
                                <th class="p-3 text-center w-10"></th>
                            </tr>
                        </thead>
                        <tbody id="staff-table-body" class="divide-y divide-slate-50">
                        </tbody>
                    </table>
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
        <div id="att-daily-view">
            <!-- Desktop Table (visible on md+) -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden" style="display:none" id="att-desktop-table">
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
            </div>
            <!-- Mobile Table (visible on <md) -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden" style="display:none" id="att-mobile-table">
                <table class="w-full text-xs text-left border-collapse">
                    <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                            <th class="px-3 py-2 border-b border-slate-200">Name</th>
                            <th class="px-2 py-2 border-b border-slate-200 text-center w-10">St</th>
                            <th class="px-2 py-2 border-b border-slate-200 text-center">In</th>
                            <th class="px-2 py-2 border-b border-slate-200 text-center">Out</th>
                        </tr>
                    </thead>
                    <tbody id="attendance-body-mobile" class="divide-y divide-slate-50"></tbody>
                </table>
            </div>
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
                     <span class="text-xs font-bold text-slate-500">Staff: <span id="count-cutting" class="text-slate-700">0</span></span>
                     <span class="text-xs font-bold text-slate-500">Today: <span class="text-indigo-600 text-base" id="pcs-cutting">0</span> Pcs</span>
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
                     <span class="text-xs font-bold text-slate-500">Staff: <span id="count-fb" class="text-slate-700">0</span></span>
                     <span class="text-xs font-bold text-slate-500">Today: <span class="text-emerald-600 text-base" id="pcs-fb">0</span> Pcs</span>
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
                     <span class="text-xs font-bold text-slate-500">Staff: <span id="count-assembly" class="text-slate-700">0</span></span>
                     <span class="text-xs font-bold text-slate-500">Today: <span class="text-blue-600 text-base" id="pcs-assembly">0</span> Pcs</span>
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
                     <span class="text-xs font-bold text-slate-500">Staff: <span id="count-finishing" class="text-slate-700">0</span></span>
                     <span class="text-xs font-bold text-slate-500">Today: <span class="text-orange-600 text-base" id="pcs-finishing">0</span> Pcs</span>
                 </div>
             </div>
         </div>
 
         <!-- Unit Details Section -->
         <div id="unit-details-panel" class="hidden bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden fade-in">
             <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                     <h3 class="text-xl font-bold text-slate-800" id="selected-unit-title">Unit Name</h3>
                     <p class="text-xs text-slate-500">Detailed View & Tracking</p>
                 </div>
                 <button onclick="closeUnitDetails()" class="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition">
                     <i class="fa-solid fa-xmark"></i>
                 </button>
             </div>
             
             <div class="grid grid-cols-1 lg:grid-cols-3">
                 <!-- Staff List -->
                 <div class="lg:col-span-2 p-6 border-r border-slate-100">
                     <h4 class="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Assigned Staff</h4>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="unit-staff-list">
                         <!-- Staff Cards Injected Here -->
                     </div>
                 </div>
                 
                 <!-- Production Tracking -->
                <div class="p-6 bg-slate-50/50" id="unit-tracking-section">
                    <h4 class="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Output Tracking</h4>
                    
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Select Catalogue Item</label>
                        <div class="flex flex-col gap-2">
                            <input list="catalogue-list-options" id="unit-catalogue-input" onchange="updatePiecePreview(this)" placeholder="Search Catalogue..." class="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700">
                            <datalist id="catalogue-list-options">
                                ${(JSON.parse(localStorage.getItem('catalogueItems')) || []).map(item => {
        const total = (item.ledger || []).reduce((sum, row) => sum + (parseInt(row.total) || 0), 0);
        return `<option value="${item.name}" data-id="${item.id}" data-total="${total}">Total Pcs: ${total}</option>`;
    }).join('')}
                            </datalist>
                            <p id="unit-pcs-preview" class="text-xs text-right hidden"></p>
                            <button onclick="addUnitPieces()" class="bg-indigo-600 text-white w-full py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md mt-2">
                                Add to Daily Log
                            </button>
                        </div>
                    </div>

                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Production Log</h4>
                    <div class="max-h-[300px] overflow-y-auto pr-1" id="unit-production-log">
                        <!-- Logs injected here -->
                    </div>
                </div>
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


    settings: () => `
    <div id="settings" class="fade-in max-w-4xl mx-auto">
        <div class="mb-8">
            <h2 class="text-3xl font-bold text-slate-800">System Settings</h2>
            <p class="text-slate-500 mt-1">Manage application configuration and data.</p>
        </div>

        <!-- Section 1: Data Management -->
        <!-- Section 1: Data Management -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4 transition-all duration-300">
            <button onclick="toggleSettingsSection('sec-data')" class="w-full p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition text-left group">
                <h3 class="font-bold text-slate-700 flex items-center gap-2">
                    <i class="fa-solid fa-database text-indigo-500 w-6 text-center"></i> Data Management
                </h3>
                <i id="icon-sec-data" class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-300"></i>
            </button>
            
            <div id="sec-data" class="hidden border-t border-slate-100 bg-white">
                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button id="btn-cloud-backup" onclick="cloudBackup()" class="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition group text-left">
                        <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl group-hover:scale-110 transition">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-700">Cloud Backup</h4>
                            <p class="text-xs text-slate-500">Save snapshot to Firebase</p>
                            <p id="last-backup-time" class="text-[10px] text-slate-400 mt-0.5"></p>
                        </div>
                    </button>

                    <button id="btn-cloud-restore" onclick="cloudRestore()" class="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition group text-left">
                        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition">
                            <i class="fa-solid fa-cloud-arrow-down"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-700">Cloud Restore</h4>
                            <p class="text-xs text-slate-500">Restore from last backup</p>
                        </div>
                    </button>



                    <button onclick="window.location.hash='#/bin'" class="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition group text-left">
                        <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl group-hover:scale-110 transition">
                            <i class="fa-solid fa-trash-can"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-700">Recycle Bin</h4>
                            <p class="text-xs text-slate-500">Restore deleted items</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <!-- Section 2: Configuration -->
        <!-- Section 2: Configuration -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4 transition-all duration-300">
            <button onclick="toggleSettingsSection('sec-config')" class="w-full p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition text-left group">
                <h3 class="font-bold text-slate-700 flex items-center gap-2">
                    <i class="fa-solid fa-sliders text-indigo-500 w-6 text-center"></i> System Configuration
                </h3>
                <i id="icon-sec-config" class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-300"></i>
            </button>

            <div id="sec-config" class="hidden border-t border-slate-100 bg-white"> 
                <div class="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <p class="text-xs text-slate-500">Secure Area: Authentication required to edit.</p>
                    <div class="flex gap-2">
                        <button id="btn-edit-settings" onclick="initiateEdit()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2">
                            <i class="fa-solid fa-lock"></i> Edit
                        </button>
                        <button id="btn-save-settings" onclick="saveSettingsConfig()" class="hidden bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition shadow-lg">
                            <i class="fa-solid fa-check"></i> Save Changes
                        </button>
                        <button id="btn-cancel-edit" onclick="cancelEditMode()" class="hidden bg-white text-slate-500 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition">
                            Cancel
                        </button>
                    </div>
                </div>
                <div class="p-6 space-y-6">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Owner Name</label>
                        <input type="text" id="set-owner" disabled class="w-full md:w-1/2 p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-colors">
                        <p class="text-[10px] text-slate-400 mt-1">Displayed on dashboard and reports.</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">OT Rate (₹/hr)</label>
                            <input type="number" id="set-ot" disabled class="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">NPL Fine (₹)</label>
                            <input type="number" id="set-npl" disabled class="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Attendance Bonus (₹)</label>
                            <input type="number" id="set-bonus" disabled class="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Default In Time</label>
                            <input type="text" id="set-def-in" disabled placeholder="e.g. 09:30 AM" class="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Default Out Time</label>
                            <input type="text" id="set-def-out" disabled placeholder="e.g. 07:00 PM" class="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-colors">
                        </div>
                        <div class="md:col-span-2 lg:col-span-3">
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Garment Name (Optional)</label>
                            <input type="text" id="set-garment-name" disabled placeholder="e.g. Jeans, Pro Club, Winter Collection" class="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-colors">
                            <p class="text-[10px] text-slate-400 mt-1">Appears below the logo and in the sidebar.</p>
                        </div>
                    </div>

                    <!-- CPIN Section (Visible only in Edit Mode) -->
                    <div id="cpin-section" class="hidden pt-6 border-t border-slate-100">
                        <div class="flex justify-between items-center mb-4">
                             <h4 class="font-bold text-slate-700 flex items-center gap-2">
                                <i class="fa-solid fa-key text-indigo-500"></i> CPIN Setup
                            </h4>
                            <div class="flex items-center">
                                <label class="neu-toggle-wrapper cursor-pointer">
                                    <input type="checkbox" id="cpin-toggle" class="neu-toggle-input" onchange="toggleCPIN(this.checked)">
                                    <span class="neu-slider"></span>
                                </label>
                                <span class="ml-3 text-sm font-medium text-slate-700" id="cpin-status-text">Disabled</span>
                            </div>
                        </div>
                        
                        <div id="cpin-forms-container" class="hidden mt-6 animate-fade-in-up">
                            <!-- Form: Set New PIN -->
                            <div id="form-set-cpin" class="hidden bg-white/50 p-6 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm">
                                <div class="flex items-center gap-3 mb-4">
                                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <i class="fa-solid fa-plus"></i>
                                    </div>
                                    <div>
                                        <h5 class="font-bold text-slate-700">Set New PIN</h5>
                                        <p class="text-[10px] text-slate-400">Create a secure 4-6 digit PIN</p>
                                    </div>
                                </div>
                                
                                <form onsubmit="return false;">
                                    <div class="grid grid-cols-2 gap-4 mb-4">
                                         <div class="space-y-1">
                                            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New PIN</label>
                                            <div class="relative">
                                                <i class="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                                                <input type="password" id="new-cpin" autocomplete="new-password" placeholder="••••" maxlength="6" class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-center font-bold tracking-[0.3em] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition bg-white text-slate-700">
                                            </div>
                                         </div>
                                         <div class="space-y-1">
                                            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm</label>
                                            <div class="relative">
                                                <i class="fa-solid fa-check-double absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                                                <input type="password" id="confirm-cpin" autocomplete="new-password" placeholder="••••" maxlength="6" class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-center font-bold tracking-[0.3em] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition bg-white text-slate-700">
                                            </div>
                                         </div>
                                    </div>
                                    <button onclick="saveNewCPIN()" class="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-save"></i> Save Secure PIN
                                    </button>
                                </form>
                            </div>

                            <!-- Form: Reset PIN -->
                            <div id="form-reset-cpin" class="hidden bg-white/50 p-6 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm">
                                <div class="flex items-center gap-3 mb-4">
                                    <div class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <i class="fa-solid fa-rotate"></i>
                                    </div>
                                    <div>
                                        <h5 class="font-bold text-slate-700">Reset PIN</h5>
                                        <p class="text-[10px] text-slate-400">Update your security credentials</p>
                                    </div>
                                </div>

                                <form onsubmit="return false;">
                                    <div class="space-y-4">
                                        <div class="space-y-1">
                                            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current PIN</label>
                                            <div class="relative">
                                                <i class="fa-solid fa-key absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                                                <input type="password" id="old-cpin" autocomplete="current-password" placeholder="Current PIN" maxlength="6" class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-center font-bold tracking-[0.3em] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition bg-white text-slate-700">
                                            </div>
                                        </div>
                                        
                                        <div class="grid grid-cols-2 gap-4">
                                             <div class="space-y-1">
                                                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New PIN</label>
                                                <div class="relative">
                                                    <i class="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                                                    <input type="password" id="reset-new-cpin" autocomplete="new-password" placeholder="••••" maxlength="6" class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-center font-bold tracking-[0.3em] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition bg-white text-slate-700">
                                                </div>
                                             </div>
                                             <div class="space-y-1">
                                                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm</label>
                                                <div class="relative">
                                                    <i class="fa-solid fa-check-double absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                                                    <input type="password" id="reset-confirm-cpin" autocomplete="new-password" placeholder="••••" maxlength="6" class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-center font-bold tracking-[0.3em] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition bg-white text-slate-700">
                                                </div>
                                             </div>
                                        </div>
                                    </div>
                                    <button onclick="resetCPIN()" class="w-full mt-4 bg-slate-800 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-slate-700 transition shadow-lg flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-check"></i> Update PIN
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>



        <!-- Section 4: Account -->

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-20 transition-all duration-300">
            <button onclick="toggleSettingsSection('sec-account')" class="w-full p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition text-left group">
                <h3 class="font-bold text-slate-700 flex items-center gap-2">
                    <i class="fa-solid fa-user-shield text-indigo-500 w-6 text-center"></i> Account Actions
                </h3>
                <i id="icon-sec-account" class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-300"></i>
            </button>
            
            <div id="sec-account" class="hidden border-t border-slate-100 bg-white">
                <div class="p-6">
                     <button onclick="logout()" class="w-full md:w-auto px-6 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition flex items-center justify-center gap-3">
                        <i class="fa-solid fa-power-off"></i> Sign Out
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Password Modal for Secure Edit -->
    <div id="password-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 fade-in">
        <div class="bg-white w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden p-6 text-center relative">
            <button onclick="closePasswordModal()" aria-label="Close" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><i class="fa-solid fa-xmark text-lg"></i></button>

            <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 text-xl">
                <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-800 mb-1">Security Check</h3>
            <p class="text-xs text-slate-500 mb-6">Enter your login password to unlock settings.</p>

            <form onsubmit="event.preventDefault(); verifyPasswordForEdit()">
                <div class="mb-4">
                    <div class="relative">
                        <input type="password" id="secure-edit-pass" autocomplete="current-password"
                            class="w-full text-center text-lg font-bold py-2 border-b-2 border-slate-200 focus:border-indigo-600 outline-none bg-transparent transition-colors pr-10"
                            placeholder="Password">
                        <button type="button" onclick="toggleSecurePasswordVisibility()" class="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition p-2">
                            <i class="fa-solid fa-eye" id="secure-pass-icon"></i>
                        </button>
                    </div>
                    <p id="secure-edit-error" class="text-[10px] text-red-500 mt-2 font-bold hidden"></p>
                </div>

                <button type="submit" id="btn-verify-pass"
                    class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">
                    Verify & Unlock
                </button>
            </form>
        </div>
    </div>
    </div>`
    ,

    bin: () => `<div id="bin-placeholder"></div>`
};
