function addNewTodo() {
    var input = document.getElementById('todoTitleInput');
    var title = input.value.trim();
    var priorityInput = document.getElementById('todoPriorityInput');
    var descInput = document.getElementById('todoDescInput');
    var priority = priorityInput.value;
    var desc = descInput.value.trim();

    if (title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        return;
    }
    if (desc.length > 150) {
        alert('Description must be 150 characters or less.');
        return;
    }

    var task = {
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        desc: desc,
        priority: priority,
        column: 'todo',
        createdAt: Date.now(),
        editedAt: null,
        completed: false
    };

    state.tasks.push(task);
    saveToStorage();
    input.value = '';
    descInput.value = '';
    priorityInput.value = 'low';
    document.getElementById('titleCounter').textContent = '40 left';
    document.getElementById('descCounter').textContent = '150 left';
    document.getElementById('addTodoCard').classList.remove('expanded');
    render();
}

function moveTask(taskId, targetColumn) {
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task || task.column === targetColumn) return;
    var oldColumn = task.column;

    if (targetColumn === 'done') {
        if (oldColumn === 'todo') {
            alert('Tasks must pass through In Progress before moving to Done.');
            return;
        }
        task.completed = true;
    }
    if (targetColumn === 'todo') task.completed = false;
    if ((oldColumn === 'done' || oldColumn === 'progress') && (targetColumn === 'todo' || targetColumn === 'progress')) task.completed = false;

    task.column = targetColumn;
    saveToStorage();
    render();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(function(t) { return t.id !== taskId; });
    saveToStorage();
    render();
}
