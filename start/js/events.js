function setupEventListeners() {
    const titleInput = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const addTodoCard = document.getElementById('addTodoCard');
    const titleCounter = document.getElementById('titleCounter');
    const descCounter = document.getElementById('descCounter');

    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });

    titleInput.addEventListener('focus', () => {
        addTodoCard.classList.add('expanded');
    });

    document.addEventListener('click', (e) => {
        if (!addTodoCard.contains(e.target)) {
            if (titleInput.value.trim() === '' && descInput.value.trim() === '') {
                addTodoCard.classList.remove('expanded');
            }
        }
    });

    titleInput.addEventListener('input', () => {
        const remaining = 40 - titleInput.value.length;
        titleCounter.textContent = `${remaining} left`;
        titleCounter.style.color = remaining < 10 ? 'var(--priority-high-border)' : 'var(--text-muted)';
    });

    descInput.addEventListener('input', () => {
        const remaining = 150 - descInput.value.length;
        descCounter.textContent = `${remaining} left`;
        descCounter.style.color = remaining < 15 ? 'var(--priority-high-border)' : 'var(--text-muted)';
    });
}
