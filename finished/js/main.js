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
        });
