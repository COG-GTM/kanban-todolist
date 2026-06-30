function render() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (state.tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>No tasks yet. Add one above!</p></div>';
        return;
    }

    state.tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority}`;
        card.setAttribute('data-id', task.id);

        const descHTML = task.desc
            ? `<p class="task-desc-excerpt">${task.desc}</p>`
            : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

        card.innerHTML = `
            <div class="task-header">
                <span class="badge-priority ${task.priority}">${task.priority}</span>
            </div>
            <h4 class="task-title">${task.title}</h4>
            ${descHTML}
            <div class="task-footer">
                <button class="btn-card-action" onclick="deleteTask('${task.id}')" title="Delete Task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;

        taskList.appendChild(card);
    });
}
