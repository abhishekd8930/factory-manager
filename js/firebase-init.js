// js/firebase-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
// ADDED 'onValue' to the imports below
import { getDatabase, ref, set, get, child, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmWoGK5SDReHxxcQrzbCxMycqEJGUak5U",
  authDomain: "studio-9111487366-92e93.firebaseapp.com",
  databaseURL: "https://studio-9111487366-92e93-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "studio-9111487366-92e93",
  storageBucket: "studio-9111487366-92e93.firebasestorage.app",
  messagingSenderId: "279210394974",
  appId: "1:279210394974:web:fc469a01c8636feacdbbcf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- REAL-TIME CONNECTION STATUS MONITOR ---
const connectedRef = ref(db, ".info/connected");

onValue(connectedRef, (snap) => {
  const isConnected = snap.val() === true;
  updateStatusUI(isConnected);
});

function updateStatusUI(online) {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    
    // Only run if elements exist (e.g. might not exist on login screen)
    if (dot && text) {
        if (online) {
            dot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
            text.innerText = "Cloud Connected";
            text.className = "text-xs font-bold text-emerald-600 transition-colors duration-300";
            console.log("System Status: ONLINE");
        } else {
            dot.className = "w-2 h-2 rounded-full bg-red-500";
            text.innerText = "Offline Mode";
            text.className = "text-xs font-bold text-red-500 transition-colors duration-300";
            console.log("System Status: OFFLINE");
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

// Signal Ready
window.isFirebaseReady = true;
document.dispatchEvent(new Event('firebase-ready'));