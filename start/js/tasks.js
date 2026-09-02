function addNewTodo() {
    const titleInput = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const priorityInput = document.getElementById('todoPriorityInput');

    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const priority = priorityInput.value;

    if (title.length < 3) {
        alert('Task title must be at least 3 characters long!');
        titleInput.focus();
        return;
    }
    if (title.length > 40) {
        alert('Task title cannot exceed 40 characters!');
        return;
    }
    if (desc.length > 150) {
        alert('Description cannot exceed 150 characters!');
        return;
    }

    state.tasks.push({
        id: generateTaskId(),
        title: title,
        desc: desc || '',
        priority: priority,
        createdAt: Date.now()
    });

    saveToStorage();

    titleInput.value = '';
    descInput.value = '';
    priorityInput.value = 'low';
    document.getElementById('titleCounter').textContent = '40 left';
    document.getElementById('descCounter').textContent = '150 left';
    document.getElementById('addTodoCard').classList.remove('expanded');

    render();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}
