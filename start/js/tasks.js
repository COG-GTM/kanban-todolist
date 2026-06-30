function addNewTodo() {
    var input = document.getElementById('todoTitleInput');
    var title = input.value.trim();

    if (!title) {
        input.focus();
        return;
    }

    var task = {
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        createdAt: new Date().toISOString()
    };

    state.tasks.push(task);
    saveToStorage();
    input.value = '';
    render();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(function(t) { return t.id !== taskId; });
    saveToStorage();
    render();
}
