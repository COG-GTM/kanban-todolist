document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    document.getElementById('priorityFilter').value = state.filterPriority;
    document.getElementById('sortBySelect').value = state.sortBy;
    setupEventListeners();
    render();
    setInterval(renderTimestampsOnly, 30000);
});
