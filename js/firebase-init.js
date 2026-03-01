// js/firebase-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, set, get, child, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";

const firebaseConfig = {
    apiKey: window.ENV?.FIREBASE_API_KEY,
    authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN,
    projectId: window.ENV?.FIREBASE_PROJECT_ID,
    storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID,
    appId: window.ENV?.FIREBASE_APP_ID,
    measurementId: window.ENV?.FIREBASE_MEASUREMENT_ID,
    // Updated to Asia-Southeast1 based on Firebase Warning
    databaseURL: window.ENV?.FIREBASE_DATABASE_URL
};

if (!firebaseConfig.apiKey) {
    console.error("Firebase Config Missing! Ensure .env is set and you have run 'npm run build' to generate env-config.js.");
    alert("System Error: Configuration missing. Please contact administrator (or run the build step).");
}

// Initialize App
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app);

// Expose Auth functions to window so other files can use them
window.auth = auth;
window.db = db;
window.dbRef = ref;
window.onValue = onValue;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;
window.GoogleAuthProvider = GoogleAuthProvider;
window.signInWithPopup = signInWithPopup;
window.signInAnonymously = signInAnonymously;

// --- REAL-TIME CONNECTION STATUS MONITOR ---
const connectedRef = ref(db, ".info/connected");
onValue(connectedRef, (snap) => {
    const isConnected = snap.val() === true;
    updateStatusUI(isConnected);
});

function updateStatusUI(online) {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    const icon = document.getElementById('status-cloud-icon');

    if (dot && text) {
        if (online) {
            dot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
            text.innerText = "Cloud Connected";
            text.className = "text-xs font-bold text-emerald-600 transition-colors duration-300";
            if (icon) icon.className = "fa-solid fa-cloud text-emerald-500 text-lg transition-colors duration-300";
        } else {
            dot.className = "w-2 h-2 rounded-full bg-red-500";
            text.innerText = "Offline Mode";
            text.className = "text-xs font-bold text-red-500 transition-colors duration-300";
            if (icon) icon.className = "fa-solid fa-cloud text-red-500 text-lg transition-colors duration-300";
        }
    }
}

// --- HELPER FUNCTIONS ---
window.saveToCloud = (path, data) => {
    return set(ref(db, path), data)
        .then(() => console.log(`Saved: ${path}`))
        .catch((err) => {
            console.error("Save Error:", err);
            throw err; // Re-throw so caller knows it failed
        });
};

window.loadFromCloud = async (path) => {
    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, path));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error("Load Error:", error);
        return null;
    }
};

window.isFirebaseReady = true;
document.dispatchEvent(new Event('firebase-ready'));