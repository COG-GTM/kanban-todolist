document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    document.getElementById('priorityFilter').value = state.filterPriority;
    document.getElementById('sortBySelect').value = state.sortBy;
    document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === state.activeTab));
    document.querySelectorAll('.board-column').forEach(col => col.classList.toggle('active-tab', col.getAttribute('data-column') === state.activeTab));
    setupEventListeners();
    render();
    setInterval(renderTimestampsOnly, 30000);
    refreshDevinConfig().then(() => {
        startDevinPolling();
        pollDevinSessions();
    });
});
