function render() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (state.tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">No tasks yet. Add one above!</div>';
        return;
    }

    state.tasks.forEach(task => {
        const row = document.createElement('div');
        row.className = `task-card priority-${task.priority || 'low'}`;
        const descHtml = task.desc
            ? `<p class="task-desc-excerpt">${task.desc}</p>`
            : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;
        row.innerHTML = `
            <div class="task-card-content">
                <div class="task-card-header">
                    <span class="task-title">${task.title}</span>
                    <span class="badge-priority ${task.priority || 'low'}">${task.priority || 'low'}</span>
                </div>
                ${descHtml}
            </div>
            <button class="btn-card-action" onclick="deleteTask('${task.id}')"><i class="fas fa-trash-alt"></i></button>
        `;
        taskList.appendChild(row);
    });
}
