        // ==========================================
        // GLOBAL EVENT DELEGATIONS & REGISTER EVENTS
        // ==========================================
        let dragSrcId = null;

        function setupEventListeners() {
            const titleInput = document.getElementById('todoTitleInput');
            const descInput = document.getElementById('todoDescInput');
            const addTodoCard = document.getElementById('addTodoCard');
            const titleCounter = document.getElementById('titleCounter');
            const descCounter = document.getElementById('descCounter');

            // Expand metadata textarea area when title field gains user focus
            titleInput.addEventListener('focus', () => {
                addTodoCard.classList.add('expanded');
            });

            // Compact input area back down if clicked externally and forms are clean
            document.addEventListener('click', (e) => {
                if (!addTodoCard.contains(e.target)) {
                    if (titleInput.value.trim() === '' && descInput.value.trim() === '') {
                        addTodoCard.classList.remove('expanded');
                    }
                }
                hideContextMenu();
                hideBadgePriorityMenu();
            });

            // Track remaining title characters dynamically
            titleInput.addEventListener('input', () => {
                const remaining = 40 - titleInput.value.length;
                titleCounter.textContent = `${remaining} left`;
                if (remaining < 10) {
                    titleCounter.style.color = 'var(--priority-high-border)';
                } else {
                    titleCounter.style.color = 'var(--text-muted)';
                }
            });

            // Track remaining description characters dynamically
            descInput.addEventListener('input', () => {
                const remaining = 150 - descInput.value.length;
                descCounter.textContent = `${remaining} left`;
                if (remaining < 15) {
                    descCounter.style.color = 'var(--priority-high-border)';
                } else {
                    descCounter.style.color = 'var(--text-muted)';
                }
            });

            // Submission triggers
            document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
            titleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addNewTodo();
            });

            // Real-time filtering search updates
            document.getElementById('searchInput').addEventListener('input', (e) => {
                state.searchQuery = e.target.value.trim();
                render();
            });

            document.getElementById('priorityFilter').addEventListener('change', (e) => {
                state.filterPriority = e.target.value;
                render();
            });

            document.getElementById('sortBySelect').addEventListener('change', (e) => {
                state.sortBy = e.target.value;
                render();
            });

            // Header "Actions" dropdown — toggles the bulk-operations menu.
            const headerActionsBtn = document.getElementById('headerActionsBtn');
            const headerActionsMenu = document.getElementById('headerActionsMenu');
            headerActionsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                headerActionsMenu.classList.toggle('hidden');
            });
            // Close the dropdown when clicking anywhere outside of it.
            document.addEventListener('click', (e) => {
                if (!headerActionsMenu.contains(e.target) && e.target !== headerActionsBtn) {
                    headerActionsMenu.classList.add('hidden');
                }
            });

            // Bulk operation triggers (inside the header Actions dropdown)
            document.getElementById('actLoadDemo').addEventListener('click', async () => {
                headerActionsMenu.classList.add('hidden');
                const confirmed = await requestConfirmation(
                    'Load Sample Data',
                    'This will delete all existing tasks and replace them with sample data. Continue?'
                );
                if (confirmed) {
                    loadDemoData();
                    render();
                    showToast('Board repopulated with sample data.', 'success');
                }
            });

            document.getElementById('actCleanDone').addEventListener('click', async () => {
                headerActionsMenu.classList.add('hidden');
                const completedCount = state.tasks.filter(t => t.completed).length;
                if (completedCount === 0) {
                    showToast('There are no completed tasks to clear.', 'warning');
                    return;
                }
                const confirmed = await requestConfirmation(
                    'Clean Done Tasks',
                    `Are you sure you want to permanently delete all ${completedCount} completed tasks?`
                );
                if (confirmed) {
                    state.tasks = state.tasks.filter(t => !t.completed);
                    saveToStorage();
                    render();
                    showToast('Completed tasks cleared successfully.', 'success');
                }
            });

            document.getElementById('actCleanAll').addEventListener('click', async () => {
                headerActionsMenu.classList.add('hidden');
                if (state.tasks.length === 0) {
                    showToast('There are no tasks to clear.', 'warning');
                    return;
                }
                const confirmed = await requestConfirmation(
                    'Clean All Tasks',
                    'Are you sure you want to completely erase all tasks from all lists?'
                );
                if (confirmed) {
                    state.tasks = [];
                    saveToStorage();
                    render();
                    showToast('All tasks cleared successfully.', 'success');
                }
            });

            // Mobile segmented Navigation button mapping
            const mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
            mobileTabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    mobileTabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    const tabName = btn.getAttribute('data-tab');
                    state.activeTab = tabName;
                    
                    document.querySelectorAll('.board-column').forEach(col => {
                        col.classList.remove('active-tab');
                    });
                    
                    if (tabName === 'todo') {
                        document.getElementById('columnTodo').classList.add('active-tab');
                    } else if (tabName === 'progress') {
                        document.getElementById('columnProgress').classList.add('active-tab');
                    } else if (tabName === 'done') {
                        document.getElementById('columnDone').classList.add('active-tab');
                    }
                });
            });

            document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);

            // Synchronize task modal inputs character counters dynamically
            const editTitleInput = document.getElementById('taskTitleInput');
            const editTitleCounter = document.getElementById('taskTitleCounter');
            editTitleInput.addEventListener('input', () => {
                editTitleCounter.textContent = `${40 - editTitleInput.value.length} left`;
            });

            const editDescInput = document.getElementById('taskDescInput');
            const editDescCounter = document.getElementById('taskDescCounter');
            editDescInput.addEventListener('input', () => {
                editDescCounter.textContent = `${150 - editDescInput.value.length} left`;
            });

            // Map Native HTML5 Drag and Drop zones
            const columns = document.querySelectorAll('.board-column');
            columns.forEach(col => {
                col.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    col.classList.add('drag-over');
                });
                col.addEventListener('dragleave', () => {
                    col.classList.remove('drag-over');
                });
                col.addEventListener('drop', (e) => {
                    e.preventDefault();
                    col.classList.remove('drag-over');
                    const taskId = e.dataTransfer.getData('text/plain');
                    const targetColumn = col.getAttribute('data-column');
                    moveTask(taskId, targetColumn);
                });
            });
        }
