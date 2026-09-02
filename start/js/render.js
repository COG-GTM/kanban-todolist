function getVisibleTasks() {
    let filteredTasks = [...state.tasks];

    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        filteredTasks = filteredTasks.filter(t =>
            t.title.toLowerCase().includes(q) || (t.desc || '').toLowerCase().includes(q));
    }
    if (state.filterPriority !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.priority === state.filterPriority);
    }

    filteredTasks.sort((a, b) => {
        if (state.sortBy === 'date-desc') return b.createdAt - a.createdAt;
        if (state.sortBy === 'date-asc') return a.createdAt - b.createdAt;
        if (state.sortBy === 'priority-desc') {
            const w = { high: 3, medium: 2, low: 1 };
            return w[b.priority] - w[a.priority];
        }
        if (state.sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
    });

    return filteredTasks;
}

function render() {
    const focusedTaskId = document.activeElement
        && document.activeElement.closest
        && document.activeElement.closest('.task-card')
        ? document.activeElement.closest('.task-card').getAttribute('data-id')
        : null;

    const bodyTodo = document.getElementById('bodyTodo');
    const bodyProgress = document.getElementById('bodyProgress');
    const bodyDone = document.getElementById('bodyDone');

    bodyTodo.innerHTML = '';
    bodyProgress.innerHTML = '';
    bodyDone.innerHTML = '';

    const counts = { todo: 0, progress: 0, done: 0 };

    getVisibleTasks().forEach(task => {
        counts[task.column]++;
        const card = createTaskCardDOM(task);

        if (task.column === 'todo') {
            bodyTodo.appendChild(card);
        } else if (task.column === 'progress') {
            bodyProgress.appendChild(card);
        } else if (task.column === 'done') {
            bodyDone.appendChild(card);
        }
    });

    document.getElementById('countTodo').textContent = counts.todo;
    document.getElementById('countProgress').textContent = counts.progress;
    document.getElementById('countDone').textContent = counts.done;

    document.getElementById('todoTabBadge').textContent = counts.todo;
    document.getElementById('progressTabBadge').textContent = counts.progress;
    document.getElementById('doneTabBadge').textContent = counts.done;

    checkEmptyState('todo', bodyTodo, counts.todo);
    checkEmptyState('progress', bodyProgress, counts.progress);
    checkEmptyState('done', bodyDone, counts.done);

    if (focusedTaskId) focusTaskCard(focusedTaskId);
}

function checkEmptyState(columnName, element, count) {
    if (count > 0) return;

    let icon = 'fa-clipboard-list';
    let msg = 'No tasks listed here.';
    if (columnName === 'progress') {
        icon = 'fa-spinner';
        msg = 'Nothing in progress.';
    } else if (columnName === 'done') {
        icon = 'fa-check-double';
        msg = 'No completed tasks yet.';
    }

    element.innerHTML = `
        <div class="empty-column-placeholder" role="presentation">
            <i class="fas ${icon}"></i>
            <p>${msg}</p>
        </div>
    `;
}

function renderTimestampsOnly() {
    state.tasks.forEach(task => {
        const badge = document.querySelector(`.task-card[data-id="${task.id}"] .task-time`);
        if (badge) {
            badge.textContent = formatRelativeTime(task.createdAt);
        }
    });
}

function createTaskCardDOM(task) {
    const card = document.createElement('article');
    card.className = `task-card priority-${task.priority}`;
    card.setAttribute('data-id', task.id);
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${task.title}. ${task.priority} priority. Column: ${COLUMN_LABELS[task.column]}.`);
    card.setAttribute('aria-describedby', 'boardKeyboardHelp');

    const isTodo = task.column === 'todo';
    const isProgress = task.column === 'progress';
    const isDone = task.column === 'done';

    const descHTML = task.desc
        ? `<p class="task-desc-excerpt">${escapeHtml(task.desc)}</p>`
        : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

    let navArrowsHTML = '';
    if (isTodo) {
        navArrowsHTML = `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move to Progress" aria-label="Move to In Progress"><i class="fas fa-arrow-right"></i></button>`;
    } else if (isProgress) {
        navArrowsHTML = `
            <button class="btn-arrow" onclick="moveTask('${task.id}', 'todo')" title="Move back to To Do" aria-label="Move back to To Do"><i class="fas fa-arrow-left"></i></button>
            <button class="btn-arrow" onclick="moveTask('${task.id}', 'done')" title="Move to Done" aria-label="Move to Done"><i class="fas fa-arrow-right"></i></button>
        `;
    } else if (isDone) {
        navArrowsHTML = `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move back to In Progress" aria-label="Move back to In Progress"><i class="fas fa-arrow-left"></i></button>`;
    }

    let devinButton = '';
    if (devinEnabled) {
        if (task.devinSessionId) {
            devinButton = `<button class="btn-card-action btn-devin-open" onclick="openDevinSession('${task.id}')" title="Open Devin session" aria-label="Open Devin session"><i class="fas fa-arrow-up-right-from-square"></i></button>`;
        } else if (isTodo) {
            devinButton = `<button class="btn-card-action btn-devin" onclick="openDevinModal('${task.id}')" title="Run with Devin" aria-label="Run with Devin"><i class="fas fa-robot"></i></button>`;
        }
    }

    let devinPill = '';
    if (task.devinSessionId) {
        const working = isDevinWorking(task);
        const stateClass = working
            ? 'devin-working'
            : (task.devinStatus === 'error' || task.devinStatus === 'suspended'
                ? 'devin-error'
                : (task.devinStatusDetail === 'waiting_for_user' ? 'devin-waiting' : 'devin-finished'));
        const clickAttrs = task.devinSessionUrl
            ? ` devin-clickable" onclick="openDevinSession('${task.id}')"`
            : '"';
        const icon = working ? 'fa-spinner' : 'fa-robot';
        devinPill = `<span class="devin-status-pill ${stateClass}${clickAttrs}><i class="fas ${icon}"></i> ${escapeHtml(devinStatusLabel(task))}</span>`;
    }

    const editButton = `<button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="${isDone ? 'View Task' : 'Edit Task'}" aria-label="${isDone ? 'View task' : 'Edit task'}"><i class="fas ${isDone ? 'fa-expand-alt' : 'fa-pencil-alt'}"></i></button>`;

    card.innerHTML = `
        <div class="task-header">
            <span class="badge-priority ${task.priority}" role="button" tabindex="0" aria-haspopup="menu" aria-label="Priority ${task.priority}. Change priority" onclick="openBadgePriorityMenu(event, '${task.id}')" onkeydown="handleBadgePriorityKeydown(event, '${task.id}')">${task.priority}</span>
            ${devinPill}
            <span class="task-time">${formatRelativeTime(task.createdAt)}</span>
        </div>
        <h4 class="task-title">${escapeHtml(task.title)}</h4>
        ${descHTML}
        <div class="task-footer">
            <div class="card-actions-left">
                ${editButton}
                ${devinButton}
                <button class="btn-card-action" onclick="deleteTask('${task.id}')" title="Delete Task" aria-label="Delete task"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="card-nav-arrows">
                ${navArrowsHTML}
            </div>
        </div>
    `;

    if (!isDone) {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', task.id);
        });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
    }

    card.addEventListener('keydown', (e) => handleTaskCardKeydown(e, task));

    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, task.id);
    });

    return card;
}
