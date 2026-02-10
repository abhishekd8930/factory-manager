
import { Templates } from './templates.js';

const ROUTES = {
    '/login': { template: 'login', init: null },
    '/home': { template: 'home', init: 'renderHome' },
    '/catalogue': { template: 'catalogue', init: 'initCatalogue' },
    '/dashboard': { template: 'dashboard', init: 'renderCharts' },
    '/staff': { template: 'staff', init: 'renderStaffGrid' },
    '/attendance': { template: 'attendance', init: 'renderAttendanceView' },
    '/history': { template: 'history', init: 'renderHistoryPage' },
    '/accounts': { template: 'accounts', init: 'renderAccounts' },
    '/inventory': { template: 'inventory', init: 'renderInventory' },
    '/units': { template: 'units', init: 'renderUnitsView' },
    '/settings': { template: 'settings', init: 'renderSettings' }
};

export const Router = {
    init: () => {
        window.addEventListener('hashchange', Router.navigate);
        window.addEventListener('DOMContentLoaded', Router.navigate);
        Router.navigate();
    },

    navigate: () => {
        let hash = window.location.hash.slice(1);
        if (!hash || hash === '/') hash = '/home'; // Default redirection

        // Simple Auth Check Mockup (Replace with actual logic)
        // If we have a 'login-view' template, we likely want to show it if not logged in.
        // Assuming some global state or localStorage token.
        // For now, if hash is /login, we show login.

        const routeConfig = ROUTES[hash];
        if (!routeConfig && hash !== '/login') {
            // Fallback
            window.location.hash = '#/home';
            return;
        }

        const appRoot = document.getElementById('app-root');

        if (hash === '/login') {
            appRoot.innerHTML = Templates.login();
            return;
        }

        // APP VIEW
        // Check if layout exists
        let routerOutlet = document.getElementById('router-outlet');
        if (!routerOutlet) {
            // Render Layout first
            appRoot.innerHTML = Templates.appLayout();
            routerOutlet = document.getElementById('router-outlet');
        }

        // Render Content
        if (routeConfig) {
            routerOutlet.innerHTML = Templates[routeConfig.template]();

            // UI Updates (Sidebar Active State)
            updateActiveNav(hash);

            // Initialize Page Logic
            if (routeConfig.init && typeof window[routeConfig.init] === 'function') {
                // Short delay to ensure DOM is ready inside outlet
                setTimeout(() => window[routeConfig.init](), 0);
            } else if (routeConfig.init) {
                console.warn(`Function window.${routeConfig.init} is not defined.`);
            }
        }
    }
};

function updateActiveNav(hash) {
    // Desktop Sidebar
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-blue-50', 'text-blue-700', 'font-bold');
        btn.classList.add('text-slate-500', 'font-medium');

        // Check if href matches
        if (btn.getAttribute('href') === '#' + hash) {
            btn.classList.remove('text-slate-500', 'font-medium');
            btn.classList.add('bg-blue-50', 'text-blue-700', 'font-bold');
        }
    });

    // Mobile Nav
    document.querySelectorAll('.nav-btn-mobile').forEach(btn => {
        btn.classList.remove('text-blue-700', 'bg-blue-50');
        btn.classList.add('text-slate-400');

        // Check if button ID matches the hash
        const btnId = btn.id; // e.g., mobile-nav-catalogue
        const targetId = 'mobile-nav-' + hash.replace('/', ''); // e.g., mobile-nav-catalogue

        if (btnId === targetId) {
            btn.classList.remove('text-slate-400'); // Remove default
            btn.classList.add('text-blue-700', 'bg-blue-50');
        }
    });
}

// Expose Router to window if needed for external calls (optional)
window.Router = Router;
