const KEYBOARD_COLUMN_ORDER = ['todo', 'progress', 'done'];

function focusTaskCard(taskId) {
    const card = document.querySelector(`.task-card[data-id="${taskId}"]`);
    if (card) card.focus();
}

function getColumnCards(column) {
    return Array.from(document.querySelectorAll(`.board-column[data-column="${column}"] .task-card`));
}

function focusSiblingCard(task, offset) {
    const cards = getColumnCards(task.column);
    const index = cards.findIndex(c => c.getAttribute('data-id') === task.id);
    const next = cards[index + offset];
    if (next) next.focus();
}

function focusAdjacentColumnCard(task, direction) {
    const cards = getColumnCards(task.column);
    const index = cards.findIndex(c => c.getAttribute('data-id') === task.id);

    let columnIndex = KEYBOARD_COLUMN_ORDER.indexOf(task.column) + direction;
    while (columnIndex >= 0 && columnIndex < KEYBOARD_COLUMN_ORDER.length) {
        const targetCards = getColumnCards(KEYBOARD_COLUMN_ORDER[columnIndex]);
        if (targetCards.length > 0) {
            targetCards[Math.min(index, targetCards.length - 1)].focus();
            return;
        }
        columnIndex += direction;
    }
}

function moveTaskWithKeyboard(task, direction) {
    const targetColumn = KEYBOARD_COLUMN_ORDER[KEYBOARD_COLUMN_ORDER.indexOf(task.column) + direction];
    if (targetColumn) moveTask(task.id, targetColumn);
}

function handleTaskCardKeydown(event, task) {
    if (event.target !== event.currentTarget) return;

    const movesTask = event.ctrlKey || event.metaKey;

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        if (movesTask) {
            moveTaskWithKeyboard(task, direction);
        } else {
            focusAdjacentColumnCard(task, direction);
        }
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        focusSiblingCard(task, event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openTaskModal(task.id);
    } else if (event.key === 'Delete') {
        event.preventDefault();
        const cards = getColumnCards(task.column);
        const index = cards.findIndex(c => c.getAttribute('data-id') === task.id);
        const neighbor = cards[index + 1] || cards[index - 1];
        const neighborId = neighbor ? neighbor.getAttribute('data-id') : null;
        deleteTask(task.id).then(() => {
            const stillThere = document.querySelector(`.task-card[data-id="${task.id}"]`);
            if (!stillThere && neighborId) focusTaskCard(neighborId);
        });
    } else if (event.key === 'ContextMenu') {
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();
        showContextMenu(rect.left, rect.bottom, task.id, true);
    }
}

function focusMenuItem(menu, offset) {
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]'))
        .filter(item => !item.classList.contains('hidden') && !item.classList.contains('disabled'));
    if (items.length === 0) return;

    const current = items.indexOf(document.activeElement);
    const next = current === -1
        ? (offset > 0 ? 0 : items.length - 1)
        : (current + offset + items.length) % items.length;
    items[next].focus();
}

function setupMenuKeyboardNavigation() {
    document.querySelectorAll('[role="menu"]').forEach(menu => {
        menu.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                focusMenuItem(menu, e.key === 'ArrowDown' ? 1 : -1);
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (document.activeElement.getAttribute('role') === 'menuitem') document.activeElement.click();
            }
        });
    });
}

function closeOnEscape() {
    hideContextMenu();
    hideBadgePriorityMenu();
    closeHeaderActionsMenu();

    if (document.getElementById('confirmModal').classList.contains('active')) {
        document.getElementById('confirmCancelBtn').click();
        return;
    }
    if (document.getElementById('devinModal').classList.contains('active')) {
        closeDevinModal();
        return;
    }
    if (document.getElementById('taskModal').classList.contains('active')) {
        closeModal('taskModal');
    }
}

function closeHeaderActionsMenu() {
    document.getElementById('headerActionsMenu').classList.add('hidden');
    document.getElementById('headerActionsBtn').setAttribute('aria-expanded', 'false');
}

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
        hideContextMenu();
        hideBadgePriorityMenu();
        const opened = headerActionsMenu.classList.toggle('hidden') === false;
        headerActionsBtn.setAttribute('aria-expanded', String(opened));
    });

    document.getElementById('actLoadDemo').addEventListener('click', async () => {
        closeHeaderActionsMenu();
        const ok = await requestConfirmation('Load Sample Data', 'This replaces all current tasks with the sample board. Continue?');
        if (!ok) return;
        loadDemoData();
        render();
        showToast('Sample data loaded.', 'success');
    });

    document.getElementById('actCleanDone').addEventListener('click', async () => {
        closeHeaderActionsMenu();
        const ok = await requestConfirmation('Clean Done', 'Permanently delete every completed task?');
        if (!ok) return;
        state.tasks = state.tasks.filter(t => !t.completed);
        saveToStorage();
        render();
        showToast('Completed tasks removed.', 'success');
    });

    document.getElementById('actCleanAll').addEventListener('click', async () => {
        closeHeaderActionsMenu();
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
        closeHeaderActionsMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOnEscape();
    });

    setupMenuKeyboardNavigation();

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
