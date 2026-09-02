function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const title = input.value.trim();
    if (!title) {
        input.focus();
        return;
    }

    state.tasks.push({
        id: generateTaskId(),
        title: title,
        createdAt: new Date().toISOString()
    });

    saveToStorage();
    input.value = '';
    input.focus();
    render();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}
