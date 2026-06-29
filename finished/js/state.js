        // ==========================================
        // LOCAL STORAGE STORAGE KEY & SYSTEM STATE DECLARATIONS
        // ==========================================
        const LOCAL_STORAGE_KEY = 'daily-task-tracker';
        let state = {
            tasks: [],
            filterPriority: 'all',
            sortBy: 'date-desc',
            searchQuery: '',
            activeTab: 'todo' // Active tracked tab on responsive mobile viewports
        };

        // Pre-defined engineering-focused tasks used as seed data on initial
        // initialization. Built via a factory so timestamps are always anchored
        // to "now" — both on first boot and when manually repopulated later.
        function createDemoTasks() {
          return [
            {
                id: 'demo-1',
                title: 'Escape HTML in task text',
                desc: 'Titles and descriptions are injected via innerHTML; sanitize them to prevent HTML/script injection.',
                priority: 'high',
                column: 'todo',
                createdAt: Date.now() - 40 * 60 * 1000, // 40 minutes ago
                editedAt: null,
                completed: false
            },
            {
                id: 'demo-2',
                title: 'Add undo for deleted tasks',
                desc: 'Show a toast with an Undo action after deleting or clearing tasks.',
                priority: 'medium',
                column: 'todo',
                createdAt: Date.now() - 15 * 60 * 1000, // 15 minutes ago
                editedAt: null,
                completed: false
            },
            {
                id: 'demo-3',
                title: 'Improve keyboard accessibility',
                desc: 'Let users move and edit cards with the keyboard, and add ARIA roles for screen readers.',
                priority: 'medium',
                column: 'progress',
                createdAt: Date.now() - 3 * 3600 * 1000, // 3 hours ago
                editedAt: null,
                completed: false
            },
            {
                id: 'demo-4',
                title: 'Add tests for task rules',
                desc: 'There are no tests yet; add unit tests for the move/add/edit task logic.',
                priority: 'medium',
                column: 'progress',
                createdAt: Date.now() - 6 * 3600 * 1000, // 6 hours ago
                editedAt: null,
                completed: false
            },
            {
                id: 'demo-5',
                title: 'Export and import tasks as JSON',
                desc: 'Add backup/restore so the board is not trapped in one browser localStorage.',
                priority: 'low',
                column: 'done',
                createdAt: Date.now() - 25 * 3600 * 1000, // 25 hours ago
                editedAt: Date.now() - 24 * 3600 * 1000, // Edited 24 hours ago
                completed: true
            }
          ];
        }

        // Pull state from browser local persistence tier
        function loadFromStorage() {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                try {
                    state = JSON.parse(saved);
                    // Reset temporary UI search state parameters on boot
                    state.searchQuery = '';
                } catch (e) {
                    console.error("Storage loading error:", e);
                }
            } else {
                state.tasks = createDemoTasks();
                saveToStorage();
            }
        }

        // Wipe existing tasks and repopulate the board with fresh demo data.
        function loadDemoData() {
            state.tasks = createDemoTasks();
            saveToStorage();
        }

        // Persist dynamic app data structures back to localStorage
        function saveToStorage() {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        }
