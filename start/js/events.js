function setupEventListeners() {
    const titleInput = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const addTodoCard = document.getElementById('addTodoCard');
    const titleCounter = document.getElementById('titleCounter');
    const descCounter = document.getElementById('descCounter');

    // Expand description row on title focus
    titleInput.addEventListener('focus', () => {
        addTodoCard.classList.add('expanded');
    });

    // Collapse when clicking outside if both fields are empty
    document.addEventListener('click', (e) => {
        if (!addTodoCard.contains(e.target)) {
            if (titleInput.value.trim() === '' && descInput.value.trim() === '') {
                addTodoCard.classList.remove('expanded');
            }
        }
    });

    // Title character counter
    titleInput.addEventListener('input', () => {
        const remaining = 40 - titleInput.value.length;
        titleCounter.textContent = `${remaining} left`;
        if (remaining < 10) {
            titleCounter.style.color = 'var(--priority-high-border)';
        } else {
            titleCounter.style.color = 'var(--text-muted)';
        }
    });

    // Description character counter
    descInput.addEventListener('input', () => {
        const remaining = 150 - descInput.value.length;
        descCounter.textContent = `${remaining} left`;
        if (remaining < 15) {
            descCounter.style.color = 'var(--priority-high-border)';
        } else {
            descCounter.style.color = 'var(--text-muted)';
        }
    });

    // Submission triggers
    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });
}
