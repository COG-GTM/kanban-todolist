        // ==========================================
        // LOCAL STORAGE STORAGE KEY & SYSTEM STATE DECLARATIONS
        // ==========================================
        const LOCAL_STORAGE_KEY = 'todolist';
        let state = {
            tasks: [],
            filterPriority: 'all',
            sortBy: 'date-desc',
            searchQuery: '',
            activeTab: 'todo' // Active tracked tab on responsive mobile viewports
        };

        // Pre-defined engineering-focused tasks used as seed data on initial initialization
        const demoTasks = [
            {
                id: 'demo-1',
                title: 'Set up production CI/CD pipelines',
                desc: 'Configure automated unit testing suite and Docker builds with GitHub Actions workflow steps.',
                priority: 'high',
                column: 'todo',
                createdAt: Date.now() - 40 * 60 * 1000, // 40 minutes ago
                editedAt: null,
                completed: false
            },
            {
                id: 'demo-2',
                title: 'Create initial database migrations',
                desc: 'Design table structures for secure user profiles, task history logs, and relational foreign keys.',
                priority: 'medium',
                column: 'todo',
                createdAt: Date.now() - 15 * 60 * 1000, // 15 minutes ago
                editedAt: null,
                completed: false
            },
            {
                id: 'demo-3',
                title: 'Upgrade JWT security middleware',
                desc: 'Refactor auth controller logic to enable seamless refresh token rotations and blacklists.',
                priority: 'high',
                column: 'progress',
                createdAt: Date.now() - 3 * 3600 * 1000, // 3 hours ago
                editedAt: null,
                completed: false
            },
            {
                id: 'demo-4',
                title: 'Write Jest API integration tests',
                desc: 'Mock payment gateway responses and secure complete checkout payload validations.',
                priority: 'low',
                column: 'progress',
                createdAt: Date.now() - 6 * 3600 * 1000, // 6 hours ago
                editedAt: null,
                completed: false
            },
            {
                id: 'demo-5',
                title: 'Configure initial project repository',
                desc: 'Create boilerplate, strict prettier/eslint configurations, and complete standard environment documentation.',
                priority: 'low',
                column: 'done',
                createdAt: Date.now() - 25 * 3600 * 1000, // 25 hours ago
                editedAt: Date.now() - 24 * 3600 * 1000, // Edited 24 hours ago
                completed: true
            }
        ];

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
                state.tasks = [...demoTasks];
                saveToStorage();
            }
        }

        // Persist dynamic app data structures back to localStorage
        function saveToStorage() {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        }
