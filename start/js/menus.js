function hideContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
}

function hideBadgePriorityMenu() {
    document.getElementById('badgePriorityMenu').classList.add('hidden');
}

function showContextMenu(x, y, taskId, focusFirstItem) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    hideBadgePriorityMenu();

    const menu = document.getElementById('contextMenu');
    const isDone = task.column === 'done';

    const view = document.getElementById('ctxView');
    const edit = document.getElementById('ctxEdit');
    const moveTodo = document.getElementById('ctxMoveTodo');
    const moveProgress = document.getElementById('ctxMoveProgress');
    const moveDone = document.getElementById('ctxMoveDone');
    const del = document.getElementById('ctxDelete');
    const runDevin = document.getElementById('ctxRunDevin');
    const openDevin = document.getElementById('ctxOpenDevin');
    const devinDivider = document.getElementById('ctxDevinDivider');

    const setDisabled = (el, disabled) => el.classList.toggle('disabled', disabled);

    setDisabled(edit, isDone);
    setDisabled(moveTodo, task.column === 'todo');
    setDisabled(moveProgress, task.column === 'progress');
    setDisabled(moveDone, isDone || task.column === 'todo');

    const run = (action) => (e) => {
        if (e.currentTarget.classList.contains('disabled')) return;
        hideContextMenu();
        focusTaskCard(taskId);
        action();
    };

    view.onclick = run(() => openViewModal(taskId));
    edit.onclick = run(() => openEditModal(taskId));
    moveTodo.onclick = run(() => moveTask(taskId, 'todo'));
    moveProgress.onclick = run(() => moveTask(taskId, 'progress'));
    moveDone.onclick = run(() => moveTask(taskId, 'done'));
    del.onclick = run(() => deleteTask(taskId));

    const canRunDevin = devinEnabled && task.column === 'todo' && !task.devinSessionId;
    const canOpenDevin = Boolean(task.devinSessionUrl);
    runDevin.classList.toggle('hidden', !canRunDevin);
    openDevin.classList.toggle('hidden', !canOpenDevin);
    devinDivider.classList.toggle('hidden', !canRunDevin && !canOpenDevin);
    runDevin.onclick = run(() => openDevinModal(taskId));
    openDevin.onclick = run(() => openDevinSession(taskId));

    menu.classList.remove('hidden');
    const maxX = window.innerWidth - menu.offsetWidth - 8;
    const maxY = window.innerHeight - menu.offsetHeight - 8;
    menu.style.left = `${Math.min(x, maxX)}px`;
    menu.style.top = `${Math.min(y, maxY)}px`;

    if (focusFirstItem) focusMenuItem(menu, 1);
}

function handleBadgePriorityKeydown(event, taskId) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openBadgePriorityMenu(event, taskId, true);
}

function openBadgePriorityMenu(event, taskId, focusFirstItem) {
    event.stopPropagation();

    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.column === 'done') {
        hideBadgePriorityMenu();
        showToast('Completed tasks cannot change priority.', 'warning');
        return;
    }

    hideContextMenu();

    const menu = document.getElementById('badgePriorityMenu');
    menu.classList.remove('hidden');

    const rect = event.currentTarget.getBoundingClientRect();
    const maxX = window.innerWidth - menu.offsetWidth - 8;
    const maxY = window.innerHeight - menu.offsetHeight - 8;
    const below = rect.bottom + 6;
    const above = rect.top - menu.offsetHeight - 6;
    menu.style.left = `${Math.max(8, Math.min(rect.left, maxX))}px`;
    menu.style.top = `${below <= maxY ? below : Math.max(8, above)}px`;

    menu.querySelectorAll('.badge-dropdown-item').forEach(item => {
        item.onclick = (e) => {
            e.stopPropagation();
            hideBadgePriorityMenu();
            focusTaskCard(taskId);
            changeTaskPriorityDirectly(taskId, item.getAttribute('data-priority'));
        };
    });

    if (focusFirstItem) focusMenuItem(menu, 1);
}

function changeTaskPriorityDirectly(taskId, newPriority) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.priority === newPriority) return;

    task.priority = newPriority;
    task.editedAt = Date.now();
    saveToStorage();
    render();
    showToast(`Priority set to ${newPriority}.`, 'success');
}
