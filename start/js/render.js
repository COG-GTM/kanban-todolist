function render() {
    const bodyTodo = document.getElementById('bodyTodo');
    const bodyProgress = document.getElementById('bodyProgress');
    const bodyDone = document.getElementById('bodyDone');

    bodyTodo.innerHTML = '';
    bodyProgress.innerHTML = '';
    bodyDone.innerHTML = '';

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
        if (state.sortBy === 'date-asc')  return a.createdAt - b.createdAt;
        if (state.sortBy === 'priority-desc') {
            const w = { high: 3, medium: 2, low: 1 };
            return w[b.priority] - w[a.priority];
        }
        if (state.sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
    });

    const counts = { todo: 0, progress: 0, done: 0 };

    filteredTasks.forEach(task => {
        counts[task.column]++;
        const card = createTaskCardDOM(task);
        if (task.column === 'todo') bodyTodo.appendChild(card);
        else if (task.column === 'progress') bodyProgress.appendChild(card);
        else if (task.column === 'done') bodyDone.appendChild(card);
    });

    document.getElementById('countTodo').textContent = counts.todo;
    document.getElementById('countProgress').textContent = counts.progress;
    document.getElementById('countDone').textContent = counts.done;

    const todoBadge = document.getElementById('todoTabBadge');
    if (todoBadge) todoBadge.textContent = counts.todo;
    const progressBadge = document.getElementById('progressTabBadge');
    if (progressBadge) progressBadge.textContent = counts.progress;
    const doneBadge = document.getElementById('doneTabBadge');
    if (doneBadge) doneBadge.textContent = counts.done;

    checkEmptyState('todo', bodyTodo, counts.todo);
    checkEmptyState('progress', bodyProgress, counts.progress);
    checkEmptyState('done', bodyDone, counts.done);
}

function checkEmptyState(columnName, element, count) {
    if (count > 0) return;
    let icon = 'fa-clipboard-list';
    let msg = 'No tasks listed here.';
    if (columnName === 'progress') { icon = 'fa-spinner'; msg = 'Nothing in progress.'; }
    else if (columnName === 'done') { icon = 'fa-check-double'; msg = 'No completed tasks yet.'; }
    element.innerHTML = `
        <div class="empty-column-placeholder">
            <i class="fas ${icon}"></i>
            <p>${msg}</p>
        </div>`;
}

function createTaskCardDOM(task) {
    const card = document.createElement('article');
    card.className = `task-card priority-${task.priority}`;
    card.setAttribute('data-id', task.id);

    const isDone = task.column === 'done';
    const isProgress = task.column === 'progress';
    const isTodo = task.column === 'todo';

    if (!isDone) {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => { card.classList.add('dragging'); e.dataTransfer.setData('text/plain', task.id); });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
    }
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, task.id);
    });

    const descHTML = task.desc
        ? `<p class="task-desc-excerpt">${task.desc}</p>`
        : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

    let navArrowsHTML = '';
    if (isTodo) {
        navArrowsHTML = `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move to Progress"><i class="fas fa-arrow-right"></i></button>`;
    } else if (isProgress) {
        navArrowsHTML = `
            <button class="btn-arrow" onclick="moveTask('${task.id}', 'todo')" title="Move back to To Do"><i class="fas fa-arrow-left"></i></button>
            <button class="btn-arrow" onclick="moveTask('${task.id}', 'done')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>`;
    } else if (isDone) {
        navArrowsHTML = `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move back to In Progress"><i class="fas fa-arrow-left"></i></button>`;
    }

    const editBtnHTML = isDone
        ? `<button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="View Task"><i class="fas fa-expand-alt"></i></button>`
        : `<button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="Edit Task"><i class="fas fa-pencil-alt"></i></button>`;

    let devinPill = '';
    if (task.devinSessionId) {
        const working = isDevinWorking(task);
        const label = devinStatusLabel(task);
        const labelSlug = label.replace(/\s+/g, '-').toLowerCase();
        const pillIcon = working ? 'fa-spinner fa-spin' : 'fa-robot';
        const workingClass = working ? ' devin-working' : '';
        const clickableClass = task.devinSessionUrl ? ' devin-clickable' : '';
        const pillTitle = task.devinSessionUrl ? 'Open Devin session' : 'Devin session status';
        const clickAttr = task.devinSessionUrl ? ` onclick="openDevinSession('${task.id}')"` : '';
        devinPill = `<span class="devin-status-pill devin-${labelSlug}${workingClass}${clickableClass}" title="${pillTitle}"${clickAttr}><i class="fas ${pillIcon}"></i> ${label}</span>`;
    }

    let devinButton = '';
    if (typeof devinEnabled !== 'undefined' && devinEnabled && isTodo && !task.devinSessionId) {
        devinButton = `<button class="btn-card-action btn-devin" onclick="openDevinModal('${task.id}')" title="Run with Devin"><i class="fas fa-robot"></i></button>`;
    } else if (task.devinSessionId) {
        devinButton = `<button class="btn-card-action btn-devin-open" onclick="openDevinSession('${task.id}')" title="Open Devin session"><i class="fas fa-arrow-up-right-from-square"></i></button>`;
    }

    card.innerHTML = `
        <div class="task-header">
            <span class="badge-priority ${task.priority}" onclick="openBadgePriorityMenu(event, '${task.id}')" title="Change priority">${task.priority}</span>
            ${devinPill}
            <span class="task-time">${formatRelativeTime(task.createdAt)}</span>
        </div>
        <h4 class="task-title">${task.title}</h4>
        ${descHTML}
        <div class="task-footer">
            <div class="card-actions-left">
                ${editBtnHTML}
                ${devinButton}
                <button class="btn-card-action" onclick="deleteTask('${task.id}')" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="card-nav-arrows">${navArrowsHTML}</div>
        </div>
    `;
    return card;
}

function renderTimestampsOnly() {
    document.querySelectorAll('.task-card').forEach(card => {
        const task = state.tasks.find(t => t.id === card.getAttribute('data-id'));
        const timeEl = card.querySelector('.task-time');
        if (task && timeEl) timeEl.textContent = formatRelativeTime(task.createdAt);
    });
}
