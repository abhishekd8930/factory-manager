// --- CATALOGUE LOGIC ---

// --- CONFIGURATION ---
const FIXED_FILTERS = {
    fabric: ["Dobby", "Lycra", "Lenin", "Twill"],
    brand: ["Bluecube", "Snowfinch", "D-club", "Aravind"],
    fitting: ["Ankle fit", "Jogger", "Formal"],
    duration: ["This Week", "Last Week", "This Month", "Last Month"]
};

// State
let catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
let activeCatalogueId = null;
let activeFilters = {
    fabric: null,
    pattern: null, // Keeping pattern as dynamic/optional since not in fixed list
    brand: null,
    fitting: null,
    duration: null // New
};

// Lightbox Globals
let featureZoom = 1;
let isDragging = false;
let startX = 0, startY = 0, translateX = 0, translateY = 0;

// Initialize
window.initCatalogue = () => {
    closeCatalogueDetail();
    renderCatalogue();
};

// Render List & Grid
window.renderCatalogue = () => {
    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];

    const grid = document.getElementById('catalogue-grid');
    const emptyState = document.getElementById('catalogue-empty');
    if (!grid || !emptyState) return;

    grid.innerHTML = '';

    if (catalogueItems.length === 0) {
        emptyState.classList.remove('hidden');
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.add('hidden'));
        return;
    } else {
        emptyState.classList.add('hidden');
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('hidden'));
    }

    // Apply Active Filters
    let displayItems = catalogueItems.filter(item => {
        // Fabric: Partial/Includes Match (e.g. "Dobby" matches "Heavy Dobby")
        if (activeFilters.fabric && (!item.fabric || !item.fabric.toLowerCase().includes(activeFilters.fabric.toLowerCase()))) return false;

        // Brand: Exact Match (usually brands are strict, but I'll use includes for flexibility)
        if (activeFilters.brand && (!item.brand || !item.brand.toLowerCase().includes(activeFilters.brand.toLowerCase()))) return false;

        // Fitting: Includes Match
        if (activeFilters.fitting && (!item.fitting || !item.fitting.toLowerCase().includes(activeFilters.fitting.toLowerCase()))) return false;

        // Pattern: Strict (if used)
        if (activeFilters.pattern && item.pattern !== activeFilters.pattern) return false;

        // Duration: Date Logic
        if (activeFilters.duration) {
            const itemDate = new Date(item.date || item.id);
            if (!isInRelativeDateRange(itemDate, activeFilters.duration)) return false;
        }

        return true;
    });

    if (displayItems.length === 0) {
        grid.innerHTML = '<p class="text-center text-slate-500 col-span-full py-12">No items match the current filters.</p>';
        document.getElementById('catalogue-result-count').innerText = "No results found";
    } else {
        const count = displayItems.length;
        document.getElementById('catalogue-result-count').innerText = `${count} result${count === 1 ? '' : 's'} found`;
    }

    displayItems.forEach(item => {
        const card = document.createElement('div');
        card.className = "group relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shadow-sm hover:shadow-xl transition cursor-pointer";
        card.onclick = () => openCatalogueDetail(item.id);

        let dateDisplay = "Unknown Date";
        if (item.date) {
            const d = new Date(item.date);
            dateDisplay = d.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
        } else {
            const d = new Date(item.id);
            dateDisplay = d.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
        }

        card.innerHTML = `
            <img src="${item.src}" class="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt="${item.name}">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-4 group-hover:translate-y-0 transition duration-300">
                <p class="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">${dateDisplay}</p>
                <h3 class="text-xl font-bold leading-tight">${item.name}</h3>
                <div class="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition delay-100 text-xs text-white/80">
                   ${item.fabric ? `<span>${item.fabric}</span>` : ''}
                   ${item.brand ? `<span>• ${item.brand}</span>` : ''}
                </div>
            </div>
            <div class="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition transform translate-x-4 group-hover:translate-x-0">
                <i class="fa-solid fa-arrow-right -rotate-45"></i>
            </div>
        `;
        grid.appendChild(card);
    });

    populateFilters();
};

// --- FILTERING LOGIC ---

window.populateFilters = () => {
    // We handle the main fixed filters + Pattern (dynamic)
    const filterTypes = ['fabric', 'brand', 'fitting', 'duration', 'pattern'];

    filterTypes.forEach(type => {
        const dropdown = document.getElementById(`filter-dropdown-${type}`);
        if (!dropdown) return;

        dropdown.innerHTML = '';

        // "All" Option
        const allLi = document.createElement('li');
        const isAllActive = activeFilters[type] === null;
        let label = `All ${type.charAt(0).toUpperCase() + type.slice(1)}s`;
        if (type === 'duration') label = "Any Time";

        allLi.innerHTML = `<button onclick="applyFilter('${type}', null)" class="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm ${isAllActive ? 'font-bold text-indigo-600 bg-indigo-50' : 'text-slate-600'}">${label}</button>`;
        dropdown.appendChild(allLi);

        // Determine Options
        let options = [];
        if (FIXED_FILTERS[type]) {
            options = FIXED_FILTERS[type];
        } else {
            // Fallback for Pattern -> Dynamic
            options = [...new Set(catalogueItems.map(item => item[type]).filter(val => val && val.trim() !== ""))].sort();
        }

        options.forEach(val => {
            const li = document.createElement('li');
            const isActive = activeFilters[type] === val;
            li.innerHTML = `<button onclick="applyFilter('${type}', '${val}')" class="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm ${isActive ? 'font-bold text-indigo-600 bg-indigo-50' : 'text-slate-600'}">${val}</button>`;
            dropdown.appendChild(li);
        });

        // Update Button UI
        const btn = document.getElementById(`filter-btn-${type}`);
        if (btn) {
            if (activeFilters[type]) {
                btn.classList.remove('bg-white', 'text-slate-600', 'border-slate-200');
                btn.classList.add('bg-indigo-50', 'text-indigo-600', 'border-indigo-200');
                btn.innerHTML = `${activeFilters[type]} <i class="fa-solid fa-xmark ml-1 text-xs"></i>`;
                btn.onclick = (e) => {
                    e.stopPropagation();
                    applyFilter(type, null);
                };
            } else {
                btn.classList.remove('bg-indigo-50', 'text-indigo-600', 'border-indigo-200');
                btn.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
                btn.innerHTML = `${type.charAt(0).toUpperCase() + type.slice(1)} <i class="fa-solid fa-caret-down text-xs"></i>`;
                btn.onclick = () => toggleFilterDropdown(type);
            }
        }
    });
};

window.toggleFilterDropdown = (type) => {
    ['fabric', 'brand', 'fitting', 'duration', 'pattern'].forEach(t => {
        if (t !== type) {
            const d = document.getElementById(`filter-dropdown-${t}`);
            if (d) d.classList.add('hidden');
        }
    });
    const target = document.getElementById(`filter-dropdown-${type}`);
    if (target) target.classList.toggle('hidden');
};

window.applyFilter = (type, value) => {
    activeFilters[type] = value;
    const dropdown = document.getElementById(`filter-dropdown-${type}`);
    if (dropdown) dropdown.classList.add('hidden');
    renderCatalogue();
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.group')) {
        document.querySelectorAll('[id^="filter-dropdown-"]').forEach(el => el.classList.add('hidden'));
    }
});

// Helper: Date Logic
function isInRelativeDateRange(date, range) {
    const now = new Date();
    // Reset hours to compare dates cleanly
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (range === "This Week") {
        // Monday is start
        const day = today.getDay() || 7; // Sunday is 7
        if (day !== 1) today.setHours(-24 * (day - 1)); // Set to Monday
        const startOfWeek = today;
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return d >= startOfWeek && d <= endOfWeek;
    }
    if (range === "Last Week") {
        const day = today.getDay() || 7;
        if (day !== 1) today.setHours(-24 * (day - 1));
        const startOfThisWeek = today;
        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        return d >= startOfLastWeek && d <= endOfLastWeek;
    }
    if (range === "This Month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (range === "Last Month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    }
    return true;
}


// --- DETAIL VIEW LOGIC ---

window.openCatalogueDetail = (id) => {
    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
    const item = catalogueItems.find(i => i.id === id);
    if (!item) return;

    activeCatalogueId = id;

    document.getElementById('catalogue-list-view').classList.add('hidden');
    document.getElementById('catalogue-detail-view').classList.remove('hidden');

    document.getElementById('detail-image').src = item.src;
    document.getElementById('detail-image').onclick = () => openLightbox(item.src);
    document.getElementById('detail-title').innerText = item.name;
    document.getElementById('detail-description').value = item.description || "";

    if (item.date) {
        document.getElementById('detail-date').value = item.date;
    } else {
        const d = new Date(item.id);
        const dateString = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        document.getElementById('detail-date').value = dateString;
    }

    document.getElementById('detail-fabric').value = item.fabric || "";
    document.getElementById('detail-brand').value = item.brand || "";
    document.getElementById('detail-fitting').value = item.fitting || "";
    document.getElementById('detail-pattern').value = item.pattern || "";

    const inputs = document.querySelectorAll('#catalogue-detail-view .detail-input');
    inputs.forEach(input => input.disabled = true);
    document.getElementById('save-catalogue-btn').classList.add('hidden');
    document.getElementById('catalogue-settings-menu').classList.add('hidden');
};

window.closeCatalogueDetail = () => {
    activeCatalogueId = null;
    document.getElementById('catalogue-detail-view').classList.add('hidden');
    document.getElementById('catalogue-list-view').classList.remove('hidden');
    renderCatalogue();
};

// --- SETTINGS & EDITING ---

window.toggleCatalogueSettings = () => {
    const menu = document.getElementById('catalogue-settings-menu');
    menu.classList.toggle('hidden');
};

window.enableEditMode = () => {
    const inputs = document.querySelectorAll('#catalogue-detail-view .detail-input');
    inputs.forEach(input => input.disabled = false);

    document.getElementById('save-catalogue-btn').classList.remove('hidden');
    document.getElementById('detail-fabric').focus();
    document.getElementById('catalogue-settings-menu').classList.add('hidden');
};

window.renameCatalogueItem = () => {
    const newName = prompt("Enter new name:");
    if (newName) {
        updateItem(activeCatalogueId, { name: newName });
        document.getElementById('detail-title').innerText = newName;
    }
    document.getElementById('catalogue-settings-menu').classList.add('hidden');
};

window.saveCatalogueDetail = () => {
    const changes = {
        description: document.getElementById('detail-description').value,
        fabric: document.getElementById('detail-fabric').value,
        brand: document.getElementById('detail-brand').value,
        fitting: document.getElementById('detail-fitting').value,
        pattern: document.getElementById('detail-pattern').value,
        date: document.getElementById('detail-date').value
    };
    updateItem(activeCatalogueId, changes);

    const inputs = document.querySelectorAll('#catalogue-detail-view .detail-input');
    inputs.forEach(input => input.disabled = true);
    document.getElementById('save-catalogue-btn').classList.add('hidden');
};

window.deleteActiveCatalogueItem = () => {
    if (confirm("Are you sure you want to delete this Catalogue item?")) {
        catalogueItems = catalogueItems.filter(i => i.id !== activeCatalogueId);
        localStorage.setItem('catalogueItems', JSON.stringify(catalogueItems));
        closeCatalogueDetail();
    }
};

function updateItem(id, updates) {
    catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
    const idx = catalogueItems.findIndex(i => i.id === id);
    if (idx !== -1) {
        catalogueItems[idx] = { ...catalogueItems[idx], ...updates };
        localStorage.setItem('catalogueItems', JSON.stringify(catalogueItems));
    }
}


// --- UPLOAD LOGIC ---
window.handleCatalogueUpload = (input) => {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 5000000) {
            alert("File too large! Please upload images under 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const newItem = {
                id: Date.now(),
                name: file.name,
                src: e.target.result,
                description: "",
                fabric: "",
                brand: "",
                pattern: "",
                fitting: "",
                date: new Date().toISOString().split('T')[0]
            };

            catalogueItems = JSON.parse(localStorage.getItem('catalogueItems')) || [];
            catalogueItems.unshift(newItem);
            localStorage.setItem('catalogueItems', JSON.stringify(catalogueItems));
            renderCatalogue();
        };
        reader.readAsDataURL(file);
    }
    input.value = '';
};


// --- LIGHTBOX LOGIC ---

window.openLightbox = (src) => {
    const lightbox = document.getElementById('catalogue-lightbox');
    const img = document.getElementById('lightbox-image');

    img.src = src;
    lightbox.classList.remove('hidden');
    requestAnimationFrame(() => {
        lightbox.classList.remove('opacity-0');
    });

    featureZoom = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
};

window.closeLightbox = () => {
    const lightbox = document.getElementById('catalogue-lightbox');
    lightbox.classList.add('opacity-0');
    setTimeout(() => {
        lightbox.classList.add('hidden');
    }, 300);
};

window.catalogueZoom = (delta) => {
    featureZoom += delta;
    if (featureZoom < 0.5) featureZoom = 0.5;
    if (featureZoom > 4) featureZoom = 4;

    document.getElementById('lightbox-zoom-level').innerText = Math.round(featureZoom * 100) + '%';
    updateTransform();
};

function updateTransform() {
    const img = document.getElementById('lightbox-image');
    if (img) img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${featureZoom})`;
}

// Drag Logic
window.startDrag = (e) => {
    if (featureZoom <= 1) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
};

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
}

function endDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
}
