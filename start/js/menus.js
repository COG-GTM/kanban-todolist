// ---- Right-click context menu ----
function showContextMenu(x, y, taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    const menu = document.getElementById('contextMenu');

    const isTodo = task.column === 'todo';
    const isProgress = task.column === 'progress';
    const isDone = task.column === 'done';

    const setItem = (id, disabled, onclick) => {
        const el = document.getElementById(id);
        el.classList.toggle('disabled', disabled);
        el.onclick = disabled ? null : () => { onclick(); hideContextMenu(); };
    };

    setItem('ctxView', false, () => openTaskModal(taskId));
    setItem('ctxEdit', isDone, () => openTaskModal(taskId));
    setItem('ctxMoveTodo', isTodo, () => moveTask(taskId, 'todo'));
    setItem('ctxMoveProgress', isProgress, () => moveTask(taskId, 'progress'));
    setItem('ctxMoveDone', isDone || isTodo, () => moveTask(taskId, 'done'));
    setItem('ctxDelete', false, () => deleteTask(taskId));

    // Devin actions: shown contextually based on session state + config.
    const ctxRunDevin = document.getElementById('ctxRunDevin');
    const ctxOpenDevin = document.getElementById('ctxOpenDevin');
    const ctxDevinDivider = document.getElementById('ctxDevinDivider');
    const canRunDevin = (typeof devinEnabled !== 'undefined' && devinEnabled) && isTodo && !task.devinSessionId;
    const canOpenDevin = Boolean(task.devinSessionId && task.devinSessionUrl);
    ctxRunDevin.style.display = canRunDevin ? 'flex' : 'none';
    ctxOpenDevin.style.display = canOpenDevin ? 'flex' : 'none';
    ctxDevinDivider.style.display = (canRunDevin || canOpenDevin) ? 'block' : 'none';
    ctxRunDevin.onclick = () => { if (canRunDevin) openDevinModal(taskId); hideContextMenu(); };
    ctxOpenDevin.onclick = () => { if (canOpenDevin) openDevinSession(taskId); hideContextMenu(); };

    menu.classList.remove('hidden');
    const rect = menu.getBoundingClientRect();
    const px = Math.min(x, window.innerWidth - rect.width - 8);
    const py = Math.min(y, window.innerHeight - rect.height - 8);
    menu.style.left = `${px}px`;
    menu.style.top = `${py}px`;
}

function hideContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
}

// ---- Clickable priority badge dropdown ----
let badgeMenuTaskId = null;

function openBadgePriorityMenu(event, taskId) {
    event.stopPropagation();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.column === 'done') {
        showToast('Cannot change priority of a completed task.', 'warning');
        return;
    }
    badgeMenuTaskId = taskId;
    const menu = document.getElementById('badgePriorityMenu');
    menu.querySelectorAll('.badge-dropdown-item').forEach(item => {
        item.onclick = (e) => {
            e.stopPropagation();
            changeTaskPriorityDirectly(badgeMenuTaskId, item.getAttribute('data-priority'));
        };
    });
    menu.classList.remove('hidden');

    const rect = event.currentTarget.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 4;
    left = Math.min(left, window.innerWidth - menuRect.width - 8);
    top = Math.min(top, window.innerHeight - menuRect.height - 8);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
}

function hideBadgePriorityMenu() {
    document.getElementById('badgePriorityMenu').classList.add('hidden');
}

function changeTaskPriorityDirectly(taskId, newPriority) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.priority = newPriority;
    task.editedAt = Date.now();
    saveToStorage();
    render();
    showToast(`Priority set to ${newPriority}.`, 'success');
    hideBadgePriorityMenu();
}

document.addEventListener('click', () => {
    hideContextMenu();
    hideBadgePriorityMenu();
});
