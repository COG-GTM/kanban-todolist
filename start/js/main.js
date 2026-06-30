document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    setupEventListeners();
    render();
    setInterval(renderTimestampsOnly, 30000);

    refreshDevinConfig();
    startDevinPolling();
    pollDevinSessions();
});
