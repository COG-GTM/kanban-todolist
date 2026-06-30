function setupEventListeners() {
    const titleInput = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const addCard = document.getElementById('addTodoCard');

    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });

    // Live counters
    titleInput.addEventListener('input', () => {
        document.getElementById('titleCounter').textContent = `${40 - titleInput.value.length} left`;
    });
    descInput.addEventListener('input', () => {
        document.getElementById('descCounter').textContent = `${150 - descInput.value.length} left`;
    });

    // Expand description row on focus; collapse when empty + unfocused
    titleInput.addEventListener('focus', () => addCard.classList.add('expanded'));
    document.addEventListener('click', (e) => {
        if (!addCard.contains(e.target) && !titleInput.value && !descInput.value) {
            addCard.classList.remove('expanded');
        }
    });

    // Search / filter / sort controls
    document.getElementById('searchInput').addEventListener('input', (e) => { state.searchQuery = e.target.value.trim(); render(); });
    document.getElementById('priorityFilter').addEventListener('change', (e) => { state.filterPriority = e.target.value; saveToStorage(); render(); });
    document.getElementById('sortBySelect').addEventListener('change', (e) => { state.sortBy = e.target.value; saveToStorage(); render(); });

    // Edit modal: save + live counters
    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);
    const modalTitle = document.getElementById('taskTitleInput');
    const modalDesc = document.getElementById('taskDescInput');
    modalTitle.addEventListener('input', () => {
        document.getElementById('taskTitleCounter').textContent = `${40 - modalTitle.value.length} left`;
    });
    modalDesc.addEventListener('input', () => {
        document.getElementById('taskDescCounter').textContent = `${150 - modalDesc.value.length} left`;
    });

    // Drag & drop between columns
    document.querySelectorAll('.board-column').forEach(col => {
        col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drag-over'); });
        col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');
            moveTask(e.dataTransfer.getData('text/plain'), col.getAttribute('data-column'));
        });
    });

    // Header Actions menu
    const actionsBtn = document.getElementById('headerActionsBtn');
    const actionsMenu = document.getElementById('headerActionsMenu');
    actionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        actionsMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!actionsMenu.contains(e.target) && e.target !== actionsBtn) actionsMenu.classList.add('hidden');
    });

    document.getElementById('actLoadDemo').addEventListener('click', async () => {
        actionsMenu.classList.add('hidden');
        if (await requestConfirmation('Load Sample Data', 'This replaces all current tasks with the demo set. Continue?')) {
            loadDemoData();
            render();
            showToast('Sample data loaded.', 'success');
        }
    });
    document.getElementById('actCleanDone').addEventListener('click', async () => {
        actionsMenu.classList.add('hidden');
        if (await requestConfirmation('Clean Done', 'Permanently remove all completed tasks?')) {
            state.tasks = state.tasks.filter(t => !t.completed);
            saveToStorage();
            render();
            showToast('Completed tasks cleared.', 'info');
        }
    });
    document.getElementById('actCleanAll').addEventListener('click', async () => {
        actionsMenu.classList.add('hidden');
        if (await requestConfirmation('Clean All', 'Permanently delete EVERY task? This cannot be undone.')) {
            state.tasks = [];
            saveToStorage();
            render();
            showToast('All tasks cleared.', 'info');
        }
    });

    // Mobile column tabs
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            state.activeTab = tab;
            document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
            document.querySelectorAll('.board-column').forEach(col => {
                col.classList.toggle('active-tab', col.getAttribute('data-column') === tab);
            });
        });
    });
}
