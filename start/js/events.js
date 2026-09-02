function setupEventListeners() {
    const titleInput = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const addTodoCard = document.getElementById('addTodoCard');
    const titleCounter = document.getElementById('titleCounter');
    const descCounter = document.getElementById('descCounter');

    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });

    titleInput.addEventListener('focus', () => {
        addTodoCard.classList.add('expanded');
    });

    document.addEventListener('click', (e) => {
        if (!addTodoCard.contains(e.target)) {
            if (titleInput.value.trim() === '' && descInput.value.trim() === '') {
                addTodoCard.classList.remove('expanded');
            }
        }
    });

    titleInput.addEventListener('input', () => {
        const remaining = 40 - titleInput.value.length;
        titleCounter.textContent = `${remaining} left`;
        titleCounter.style.color = remaining < 10 ? 'var(--priority-high-border)' : 'var(--text-muted)';
    });

    descInput.addEventListener('input', () => {
        const remaining = 150 - descInput.value.length;
        descCounter.textContent = `${remaining} left`;
        descCounter.style.color = remaining < 15 ? 'var(--priority-high-border)' : 'var(--text-muted)';
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        render();
    });

    document.getElementById('priorityFilter').addEventListener('change', (e) => {
        state.filterPriority = e.target.value;
        saveToStorage();
        render();
    });

    document.getElementById('sortBySelect').addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        saveToStorage();
        render();
    });

    document.querySelectorAll('.board-column').forEach(col => {
        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.classList.add('drag-over');
        });
        col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');
            moveTask(e.dataTransfer.getData('text/plain'), col.getAttribute('data-column'));
        });
    });

    const headerActionsBtn = document.getElementById('headerActionsBtn');
    const headerActionsMenu = document.getElementById('headerActionsMenu');

    headerActionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        headerActionsMenu.classList.toggle('hidden');
    });

    document.getElementById('actLoadDemo').addEventListener('click', async () => {
        headerActionsMenu.classList.add('hidden');
        const ok = await requestConfirmation('Load Sample Data', 'This replaces all current tasks with the sample board. Continue?');
        if (!ok) return;
        loadDemoData();
        render();
        showToast('Sample data loaded.', 'success');
    });

    document.getElementById('actCleanDone').addEventListener('click', async () => {
        headerActionsMenu.classList.add('hidden');
        const ok = await requestConfirmation('Clean Done', 'Permanently delete every completed task?');
        if (!ok) return;
        state.tasks = state.tasks.filter(t => !t.completed);
        saveToStorage();
        render();
        showToast('Completed tasks removed.', 'success');
    });

    document.getElementById('actCleanAll').addEventListener('click', async () => {
        headerActionsMenu.classList.add('hidden');
        const ok = await requestConfirmation('Clean All', 'Permanently delete every task on the board?');
        if (!ok) return;
        state.tasks = [];
        saveToStorage();
        render();
        showToast('Board cleared.', 'success');
    });

    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            state.activeTab = tab;
            saveToStorage();
            document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
            document.querySelectorAll('.board-column').forEach(col => {
                col.classList.toggle('active-tab', col.getAttribute('data-column') === tab);
            });
        });
    });

    document.addEventListener('click', () => {
        hideContextMenu();
        hideBadgePriorityMenu();
        headerActionsMenu.classList.add('hidden');
    });

    const modalTitleInput = document.getElementById('taskTitleInput');
    const modalDescInput = document.getElementById('taskDescInput');

    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);

    modalTitleInput.addEventListener('input', () => {
        document.getElementById('taskTitleCounter').textContent = `${40 - modalTitleInput.value.length} left`;
    });

    modalDescInput.addEventListener('input', () => {
        document.getElementById('taskDescCounter').textContent = `${150 - modalDescInput.value.length} left`;
    });
}
