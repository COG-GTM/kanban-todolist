document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    setupEventListeners();
    render();
    setInterval(renderTimestampsOnly, 30000);
});
