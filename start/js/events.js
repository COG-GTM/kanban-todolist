function setupEventListeners() {
    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    document.getElementById('todoTitleInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addNewTodo();
    });

    var titleInput = document.getElementById('todoTitleInput');
    var titleCounter = document.getElementById('titleCounter');
    var descInput = document.getElementById('todoDescInput');
    var descCounter = document.getElementById('descCounter');
    var addTodoCard = document.getElementById('addTodoCard');

    titleInput.addEventListener('input', function() {
        titleCounter.textContent = (40 - titleInput.value.length) + ' left';
    });

    descInput.addEventListener('input', function() {
        descCounter.textContent = (150 - descInput.value.length) + ' left';
    });

    titleInput.addEventListener('focus', function() {
        addTodoCard.classList.add('expanded');
    });

    document.addEventListener('click', function(e) {
        if (!addTodoCard.contains(e.target) && !titleInput.value.trim() && !descInput.value.trim()) {
            addTodoCard.classList.remove('expanded');
        }
    });

    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);

    var taskTitleInput = document.getElementById('taskTitleInput');
    var taskTitleCounter = document.getElementById('taskTitleCounter');
    var taskDescInput = document.getElementById('taskDescInput');
    var taskDescCounter = document.getElementById('taskDescCounter');

    taskTitleInput.addEventListener('input', function() {
        taskTitleCounter.textContent = (40 - taskTitleInput.value.length) + ' left';
    });

    taskDescInput.addEventListener('input', function() {
        taskDescCounter.textContent = (150 - taskDescInput.value.length) + ' left';
    });
}
