function createTaskCardDOM(task) {
    var article = document.createElement('article');
    article.className = 'task-card priority-' + task.priority;
    article.setAttribute('data-id', task.id);

    var descHtml = task.desc
        ? '<p class="task-desc-excerpt">' + task.desc + '</p>'
        : '<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>';

    var arrowsHtml = '';
    if (task.column === 'todo') {
        arrowsHtml = '<div class="card-nav-arrows">' +
            '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'progress\')" title="Move to In Progress"><i class="fas fa-arrow-right"></i></button>' +
            '</div>';
    } else if (task.column === 'progress') {
        arrowsHtml = '<div class="card-nav-arrows">' +
            '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'todo\')" title="Move to To Do"><i class="fas fa-arrow-left"></i></button>' +
            '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'done\')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>' +
            '</div>';
    } else if (task.column === 'done') {
        arrowsHtml = '<div class="card-nav-arrows">' +
            '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'progress\')" title="Move to In Progress"><i class="fas fa-arrow-left"></i></button>' +
            '</div>';
    }

    var editIcon = task.column === 'done' ? 'fa-expand-alt' : 'fa-pencil-alt';
    var editTitle = task.column === 'done' ? 'View Task' : 'Edit Task';

    article.innerHTML =
        '<div class="task-header">' +
            '<span class="badge-priority ' + task.priority + '">' + task.priority + '</span>' +
            '<span class="task-time">' + formatRelativeTime(task.createdAt) + '</span>' +
        '</div>' +
        '<h4 class="task-title">' + task.title + '</h4>' +
        descHtml +
        '<div class="task-footer">' +
            '<div class="card-actions-left">' +
                '<button class="btn-card-action" onclick="openTaskModal(\'' + task.id + '\')" title="' + editTitle + '"><i class="fas ' + editIcon + '"></i></button>' +
                '<button class="btn-card-action" onclick="deleteTask(\'' + task.id + '\')" title="Delete task"><i class="fas fa-trash-alt"></i></button>' +
            '</div>' +
            arrowsHtml +
        '</div>';

    return article;
}

function checkEmptyState(bodyEl, column) {
    if (bodyEl.children.length > 0) return;
    var placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    if (column === 'todo') {
        placeholder.innerHTML = '<i class="fas fa-clipboard-list"></i><p>No tasks listed here.</p>';
    } else if (column === 'progress') {
        placeholder.innerHTML = '<i class="fas fa-spinner"></i><p>Nothing in progress.</p>';
    } else {
        placeholder.innerHTML = '<i class="fas fa-check-double"></i><p>No completed tasks yet.</p>';
    }
    bodyEl.appendChild(placeholder);
}

function render() {
    var bodyTodo = document.getElementById('bodyTodo');
    var bodyProgress = document.getElementById('bodyProgress');
    var bodyDone = document.getElementById('bodyDone');

    bodyTodo.innerHTML = '';
    bodyProgress.innerHTML = '';
    bodyDone.innerHTML = '';

    var counts = { todo: 0, progress: 0, done: 0 };

    state.tasks.forEach(function(task) {
        var card = createTaskCardDOM(task);
        if (task.column === 'todo') {
            bodyTodo.appendChild(card);
            counts.todo++;
        } else if (task.column === 'progress') {
            bodyProgress.appendChild(card);
            counts.progress++;
        } else if (task.column === 'done') {
            bodyDone.appendChild(card);
            counts.done++;
        }
    });

    document.getElementById('countTodo').textContent = counts.todo;
    document.getElementById('countProgress').textContent = counts.progress;
    document.getElementById('countDone').textContent = counts.done;

    checkEmptyState(bodyTodo, 'todo');
    checkEmptyState(bodyProgress, 'progress');
    checkEmptyState(bodyDone, 'done');
}

function renderTimestampsOnly() {
    state.tasks.forEach(function(task) {
        var card = document.querySelector('.task-card[data-id="' + task.id + '"]');
        if (!card) return;
        var timeEl = card.querySelector('.task-time');
        if (timeEl) timeEl.textContent = formatRelativeTime(task.createdAt);
    });
}
