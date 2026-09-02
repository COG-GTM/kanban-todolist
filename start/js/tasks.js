let editingTaskId = null;

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
    const titleCounter = document.getElementById('titleCounter');
    const descCounter = document.getElementById('descCounter');
    titleCounter.textContent = '40 left';
    titleCounter.style.color = 'var(--text-muted)';
    descCounter.textContent = '150 left';
    descCounter.style.color = 'var(--text-muted)';
    document.getElementById('addTodoCard').classList.remove('expanded');
    titleInput.focus();

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

function openTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;

    const titleInput = document.getElementById('taskTitleInput');
    const descInput = document.getElementById('taskDescInput');
    const priorityInput = document.getElementById('taskPriorityInput');

    titleInput.value = task.title;
    descInput.value = task.desc || '';
    priorityInput.value = task.priority;

    document.getElementById('taskTitleCounter').textContent = `${40 - titleInput.value.length} left`;
    document.getElementById('taskDescCounter').textContent = `${150 - descInput.value.length} left`;

    document.getElementById('taskCreated').textContent = formatFullTime(task.createdAt);
    document.getElementById('taskEdited').textContent = task.editedAt ? formatFullTime(task.editedAt) : 'Not edited yet';

    const isDone = task.column === 'done';
    titleInput.disabled = isDone;
    descInput.disabled = isDone;
    priorityInput.disabled = isDone;
    document.getElementById('taskModalTitle').textContent = isDone ? 'Task Details' : 'Edit Task';
    document.getElementById('saveEditBtn').style.display = isDone ? 'none' : 'flex';

    openModal('taskModal');
}

const openViewModal = openTaskModal;
const openEditModal = openTaskModal;

function saveEditedTask() {
    const task = state.tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const title = document.getElementById('taskTitleInput').value.trim();
    const desc = document.getElementById('taskDescInput').value.trim();
    const priority = document.getElementById('taskPriorityInput').value;

    if (title.length < 3) {
        alert('Task title must be at least 3 characters long!');
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

    task.title = title;
    task.desc = desc;
    task.priority = priority;
    task.editedAt = Date.now();

    saveToStorage();
    closeModal('taskModal');
    render();
}

async function deleteTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const confirmed = await requestConfirmation('Delete Task', `Are you sure you want to permanently delete "${task.title}"?`);
    if (!confirmed) return;

    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}
