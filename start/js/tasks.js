var editingTaskId = null;

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

function openTaskModal(taskId) {
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;
    editingTaskId = taskId;

    var titleInput = document.getElementById('taskTitleInput');
    var priorityInput = document.getElementById('taskPriorityInput');
    var descInput = document.getElementById('taskDescInput');
    var saveBtn = document.getElementById('saveEditBtn');

    titleInput.value = task.title;
    priorityInput.value = task.priority;
    descInput.value = task.desc || '';

    document.getElementById('taskTitleCounter').textContent = (40 - task.title.length) + ' left';
    document.getElementById('taskDescCounter').textContent = (150 - (task.desc || '').length) + ' left';

    document.getElementById('taskCreated').textContent = formatFullTime(task.createdAt);
    document.getElementById('taskEdited').textContent = task.editedAt ? formatFullTime(task.editedAt) : 'Not edited yet';

    if (task.column === 'done') {
        titleInput.disabled = true;
        priorityInput.disabled = true;
        descInput.disabled = true;
        document.getElementById('taskModalTitle').textContent = 'Task Details';
        saveBtn.style.display = 'none';
    } else {
        titleInput.disabled = false;
        priorityInput.disabled = false;
        descInput.disabled = false;
        document.getElementById('taskModalTitle').textContent = 'Edit Task';
        saveBtn.style.display = '';
    }

    openModal('taskModal');
}

var openViewModal = openTaskModal;
var openEditModal = openTaskModal;

function saveEditedTask() {
    if (!editingTaskId) return;
    var task = state.tasks.find(function(t) { return t.id === editingTaskId; });
    if (!task) return;

    var title = document.getElementById('taskTitleInput').value.trim();
    var desc = document.getElementById('taskDescInput').value.trim();
    var priority = document.getElementById('taskPriorityInput').value;

    if (title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        return;
    }
    if (desc.length > 150) {
        alert('Description must be 150 characters or less.');
        return;
    }

    task.title = title;
    task.desc = desc;
    task.priority = priority;
    task.editedAt = Date.now();
    saveToStorage();
    closeModal('taskModal');
    render();
}

async function deleteTask(taskId) {
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;
    var confirmed = await requestConfirmation('Delete Task', 'Are you sure you want to permanently delete "' + task.title + '"?');
    if (!confirmed) return;
    state.tasks = state.tasks.filter(function(t) { return t.id !== taskId; });
    saveToStorage();
    render();
}
