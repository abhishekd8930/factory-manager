// js/pwa.js

// 1. Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('[PWA] Service Worker registration failed:', error);
            });
    });
}

// 2. Custom Install Button Logic
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    // Show the custom install UI
    const installUI = document.getElementById('pwa-install-container');
    if (installUI) {
        installUI.classList.remove('hidden');
        // Basic text animation class
        installUI.classList.add('animate-fade-in');
    }
});

function handleInstallClick() {
    const installUI = document.getElementById('pwa-install-container');

    if (!deferredPrompt) {
        return;
    }

    // Show the native install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('[PWA] User accepted the install prompt');
        } else {
            console.log('[PWA] User dismissed the install prompt');
        }
        // We've used the prompt, and can't use it again, discard it
        deferredPrompt = null;
        if (installUI) {
            installUI.classList.add('hidden');
        }
    });
}

// Attach the click handler if button exists
document.addEventListener('DOMContentLoaded', () => {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', handleInstallClick);
    }

    // Optional close button logic to dismiss the banner
    const closeBtn = document.getElementById('pwa-install-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('pwa-install-container').classList.add('hidden');
            // Normally you might want to save user preference to localStorage here
            // to prevent pestering them.
        });
    }
});
