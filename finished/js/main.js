        // ==========================================
        // SYSTEM BOOTSTRAP AND LIFECYCLE MANAGEMENT
        // ==========================================
        document.addEventListener('DOMContentLoaded', () => {
            loadFromStorage();
            setupEventListeners();
            render();

            // Keeps card timestamp relative text accurate without forcing database/DOM rebuilds
            setInterval(() => {
                renderTimestampsOnly();
            }, 30000);

            // Begin global polling for any tasks that already have a Devin session
            // (e.g. restored from a previous visit), and poll once immediately.
            startDevinPolling();
            pollDevinSessions();
        });
