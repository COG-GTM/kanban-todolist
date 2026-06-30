function setupEventListeners() {
    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    document.getElementById('todoTitleInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });

    const titleInput = document.getElementById('todoTitleInput');
    const titleCounter = document.getElementById('titleCounter');
    const descInput = document.getElementById('todoDescInput');
    const descCounter = document.getElementById('descCounter');
    const addTodoCard = document.getElementById('addTodoCard');

    titleInput.addEventListener('input', () => {
        titleCounter.textContent = `${40 - titleInput.value.length} left`;
    });

    descInput.addEventListener('input', () => {
        descCounter.textContent = `${150 - descInput.value.length} left`;
    });

    titleInput.addEventListener('focus', () => {
        addTodoCard.classList.add('expanded');
    });

    document.addEventListener('click', (e) => {
        if (!addTodoCard.contains(e.target) && !titleInput.value.trim() && !descInput.value.trim()) {
            addTodoCard.classList.remove('expanded');
        }
    });
}
