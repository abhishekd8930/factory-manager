// js/firebase-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, set, get, child, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyDeAvREXEottX1_jyFV2sCamSHW7DgW6AE",
    authDomain: "smart-manager-by-abhi.firebaseapp.com",
    projectId: "smart-manager-by-abhi",
    storageBucket: "smart-manager-by-abhi.firebasestorage.app",
    messagingSenderId: "382205577494",
    appId: "1:382205577494:web:a99580da8b60ba945e6837",
    measurementId: "G-E9FG4W9LHT",
    // Updated to Asia-Southeast1 based on Firebase Warning
    databaseURL: "https://smart-manager-by-abhi-default-rtdb.asia-southeast1.firebasedatabase.app"
};

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
    set(ref(db, path), data)
        .then(() => console.log(`Saved: ${path}`))
        .catch((err) => console.error("Save Error:", err));
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