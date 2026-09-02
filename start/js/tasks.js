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
        column: 'todo',
        createdAt: Date.now(),
        editedAt: null,
        completed: false
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

function moveTask(taskId, targetColumn) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.column === targetColumn) return;

    const oldColumn = task.column;

    if (targetColumn === 'done') {
        if (oldColumn === 'todo') {
            alert('Tasks must go through "In Progress" before entering "Done"!');
            return;
        }
        task.completed = true;
    }
    if (targetColumn === 'todo' || targetColumn === 'progress') {
        task.completed = false;
    }

    task.column = targetColumn;
    saveToStorage();
    render();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}
