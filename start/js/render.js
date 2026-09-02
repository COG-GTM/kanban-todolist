function render() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (state.tasks.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = '<i class="fas fa-clipboard-list"></i><p>No tasks yet — add your first one above.</p>';
        list.appendChild(empty);
        return;
    }

    state.tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';

        const title = document.createElement('span');
        title.className = 'task-title';
        title.textContent = task.title;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-card-action';
        deleteBtn.title = 'Delete task';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        card.appendChild(title);
        card.appendChild(deleteBtn);
        list.appendChild(card);
    });
}
