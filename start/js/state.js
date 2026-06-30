const LOCAL_STORAGE_KEY = 'daily-task-tracker';
let state = { tasks: [] };

function loadFromStorage() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
        try { state = JSON.parse(saved); } catch (e) { console.error('Storage loading error:', e); }
    }
}

function saveToStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}
