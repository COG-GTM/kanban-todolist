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

            // RULE 1: Tasks must flow chronologically; To Do directly to Done is unauthorized
            if (targetColumn === 'done') {
                if (oldColumn === 'todo') {
                    showToast('Tasks must go through "In Progress" before entering "Done"!', 'warning');
                    return;
                }
                if (!task.completed) {
                    showToast('Task must be checked (completed) in Progress to move to Done!', 'warning');
                    return;
                }
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

        // Toggles checklist completion state triggers (Only valid within In Progress)
        function toggleTaskComplete(taskId) {
            const task = state.tasks.find(t => t.id === taskId);
            if (!task) return;

            if (task.column === 'todo') {
                showToast('You cannot complete tasks in the To Do column.', 'warning');
                return;
            }

            if (task.column === 'progress') {
                task.completed = !task.completed;
                if (task.completed) {
                    task.column = 'done'; // Automatically transition onward to finished column
                    showToast('Task completed! Moved to Done.', 'success');
                }
                saveToStorage();
                render();
            }
        }

        // ==========================================
        // EXTENDED DETAILED VIEW MODAL BINDINGS
        // ==========================================
        function openViewModal(taskId) {
            const task = state.tasks.find(t => t.id === taskId);
            if (!task) return;

            document.getElementById('viewTaskTitleText').textContent = task.title;
            
            const badge = document.getElementById('viewTaskPriorityBadge');
            badge.textContent = task.priority;
            badge.className = `badge-priority ${task.priority}`;
            
            document.getElementById('viewTaskDescText').textContent = task.desc || 'No description provided.';
            document.getElementById('viewTaskCreated').textContent = formatFullTime(task.createdAt);
            document.getElementById('viewTaskEdited').textContent = task.editedAt ? formatFullTime(task.editedAt) : 'Not edited yet';

            openModal('viewModal');
        }

        // ==========================================
        // EDIT ACTION DIALOG TARGET CONTROL HANDLERS
        // ==========================================
        let editingTaskId = null;

        function openEditModal(taskId) {
            const task = state.tasks.find(t => t.id === taskId);
            if (!task) return;

            if (task.column === 'done') {
                showToast('You cannot edit completed tasks.', 'warning');
                return;
            }

            editingTaskId = taskId;
            
            const titleInput = document.getElementById('editTitleInput');
            const descInput = document.getElementById('editDescInput');
            const priorityInput = document.getElementById('editPriorityInput');

            titleInput.value = task.title;
            descInput.value = task.desc || '';
            priorityInput.value = task.priority;

            document.getElementById('editTitleCounter').textContent = `${40 - task.title.length} left`;
            document.getElementById('editDescCounter').textContent = `${150 - (task.desc ? task.desc.length : 0)} left`;

            openModal('editModal');
        }

        function saveEditedTask() {
            if (!editingTaskId) return;

            const task = state.tasks.find(t => t.id === editingTaskId);
            if (!task) return;

            const titleInput = document.getElementById('editTitleInput');
            const descInput = document.getElementById('editDescInput');
            const priorityInput = document.getElementById('editPriorityInput');

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
            closeModal('editModal');
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
