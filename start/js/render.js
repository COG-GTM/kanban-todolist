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

    checkEmptyState('todo', bodyTodo, counts.todo);
    checkEmptyState('progress', bodyProgress, counts.progress);
    checkEmptyState('done', bodyDone, counts.done);
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
        <div class="empty-column-placeholder">
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

    const isTodo = task.column === 'todo';
    const isProgress = task.column === 'progress';
    const isDone = task.column === 'done';

    const descHTML = task.desc
        ? `<p class="task-desc-excerpt">${escapeHtml(task.desc)}</p>`
        : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

    let navArrowsHTML = '';
    if (isTodo) {
        navArrowsHTML = `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move to Progress"><i class="fas fa-arrow-right"></i></button>`;
    } else if (isProgress) {
        navArrowsHTML = `
            <button class="btn-arrow" onclick="moveTask('${task.id}', 'todo')" title="Move back to To Do"><i class="fas fa-arrow-left"></i></button>
            <button class="btn-arrow" onclick="moveTask('${task.id}', 'done')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>
        `;
    } else if (isDone) {
        navArrowsHTML = `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move back to In Progress"><i class="fas fa-arrow-left"></i></button>`;
    }

    const editButton = `<button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="${isDone ? 'View Task' : 'Edit Task'}"><i class="fas ${isDone ? 'fa-expand-alt' : 'fa-pencil-alt'}"></i></button>`;

    card.innerHTML = `
        <div class="task-header">
            <span class="badge-priority ${task.priority}">${task.priority}</span>
            <span class="task-time">${formatRelativeTime(task.createdAt)}</span>
        </div>
        <h4 class="task-title">${escapeHtml(task.title)}</h4>
        ${descHTML}
        <div class="task-footer">
            <div class="card-actions-left">
                ${editButton}
                <button class="btn-card-action" onclick="deleteTask('${task.id}')" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="card-nav-arrows">
                ${navArrowsHTML}
            </div>
        </div>
    `;

    return card;
}
