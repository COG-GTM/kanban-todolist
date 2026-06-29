        // ==========================================
        // ADD NEW TASK CORE ALGORITHM
        // ==========================================
        function addNewTodo() {
            const titleInput = document.getElementById('todoTitleInput');
            const descInput = document.getElementById('todoDescInput');
            const priorityInput = document.getElementById('todoPriorityInput');
            
            const title = titleInput.value.trim();
            const desc = descInput.value.trim();
            const priority = priorityInput.value;

            // Strict Schema Field Validation Guardrails
            if (title.length < 3) {
                showToast('Task title must be at least 3 characters long!', 'error');
                return;
            }
            if (title.length > 40) {
                showToast('Task title cannot exceed 40 characters!', 'error');
                return;
            }
            if (desc.length > 150) {
                showToast('Description cannot exceed 150 characters!', 'error');
                return;
            }

            // Create new standardized structural task entity
            const newTask = {
                id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                title: title,
                desc: desc || '',
                priority: priority,
                column: 'todo',
                createdAt: Date.now(),
                editedAt: null,
                completed: false
            };

            state.tasks.push(newTask);
            saveToStorage();
            
            // Clean interface properties
            titleInput.value = '';
            descInput.value = '';
            priorityInput.value = 'low';
            
            document.getElementById('titleCounter').textContent = '40 left';
            document.getElementById('descCounter').textContent = '150 left';
            
            document.getElementById('addTodoCard').classList.remove('expanded');
            
            render();
            showToast('New todo added successfully.', 'success');
        }

        // ==========================================
        // ARCHITECTURAL TASK MOVEMENT ENGINE & RULES
        // ==========================================
        function moveTask(taskId, targetColumn) {
            const task = state.tasks.find(t => t.id === taskId);
            if (!task) return;

            const oldColumn = task.column;
            if (oldColumn === targetColumn) return;

            // RULE 1: Tasks must flow chronologically; To Do directly to Done is unauthorized.
            // Moving from In Progress to Done is allowed and marks the task complete.
            if (targetColumn === 'done') {
                if (oldColumn === 'todo') {
                    showToast('Tasks must go through "In Progress" before entering "Done"!', 'warning');
                    return;
                }
                task.completed = true;
            }

            // RULE 2: Tasks residing inside the initial To Do column cannot be marked completed
            if (targetColumn === 'todo') {
                task.completed = false; 
            }

            // RULE 3: Tasks shifted backward are fully reset and ticks cleared
            if ((oldColumn === 'done' || oldColumn === 'progress') && (targetColumn === 'todo' || targetColumn === 'progress')) {
                task.completed = false;
            }

            task.column = targetColumn;
            saveToStorage();
            render();
            showToast(`Task moved to "${targetColumn.toUpperCase()}" list.`, 'info');
        }

        // ==========================================
        // COMBINED TASK DETAILS / EDIT MODAL BINDINGS
        // A single modal both displays task metadata and allows editing. For
        // completed (Done) tasks the inputs are read-only and Save is hidden.
        // ==========================================
        let editingTaskId = null;

        function openTaskModal(taskId) {
            const task = state.tasks.find(t => t.id === taskId);
            if (!task) return;

            editingTaskId = taskId;
            const readOnly = task.column === 'done';

            const titleInput = document.getElementById('taskTitleInput');
            const descInput = document.getElementById('taskDescInput');
            const priorityInput = document.getElementById('taskPriorityInput');

            titleInput.value = task.title;
            descInput.value = task.desc || '';
            priorityInput.value = task.priority;

            titleInput.disabled = readOnly;
            descInput.disabled = readOnly;
            priorityInput.disabled = readOnly;

            document.getElementById('taskTitleCounter').textContent = `${40 - task.title.length} left`;
            document.getElementById('taskDescCounter').textContent = `${150 - (task.desc ? task.desc.length : 0)} left`;

            document.getElementById('taskCreated').textContent = formatFullTime(task.createdAt);
            document.getElementById('taskEdited').textContent = task.editedAt ? formatFullTime(task.editedAt) : 'Not edited yet';

            document.getElementById('taskModalTitle').textContent = readOnly ? 'Task Details' : 'Edit Task';
            document.getElementById('saveEditBtn').style.display = readOnly ? 'none' : '';

            openModal('taskModal');
        }

        // Backwards-compatible aliases — both the "view" and "edit" card actions
        // and context-menu entries now open the same combined modal.
        const openViewModal = openTaskModal;
        const openEditModal = openTaskModal;

        function saveEditedTask() {
            if (!editingTaskId) return;

            const task = state.tasks.find(t => t.id === editingTaskId);
            if (!task) return;

            const titleInput = document.getElementById('taskTitleInput');
            const descInput = document.getElementById('taskDescInput');
            const priorityInput = document.getElementById('taskPriorityInput');

            const title = titleInput.value.trim();
            const desc = descInput.value.trim();
            const priority = priorityInput.value;

            if (title.length < 3) {
                showToast('Task title must be at least 3 characters long!', 'error');
                return;
            }
            if (title.length > 40) {
                showToast('Task title cannot exceed 40 characters!', 'error');
                return;
            }
            if (desc.length > 150) {
                showToast('Description cannot exceed 150 characters!', 'error');
                return;
            }

            task.title = title;
            task.desc = desc;
            task.priority = priority;
            task.editedAt = Date.now(); // Log edit operation time for validation views

            saveToStorage();
            closeModal('taskModal');
            render();
            showToast('Task updated successfully.', 'success');
            editingTaskId = null;
        }

        async function deleteTask(taskId) {
            const task = state.tasks.find(t => t.id === taskId);
            if (!task) return;

            const confirmed = await requestConfirmation(
                'Delete Task',
                `Are you sure you want to permanently delete "${task.title}"?`
            );
            if (confirmed) {
                state.tasks = state.tasks.filter(t => t.id !== taskId);
                saveToStorage();
                render();
                showToast('Task deleted successfully.', 'success');
            }
        }
