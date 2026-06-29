        // ==========================================
        // DIRECT BADGE ACCESS PRIORITY DROPDOWN CONTROL
        // ==========================================
        let badgeActiveTaskId = null;

        function openBadgePriorityMenu(event, taskId) {
            event.stopPropagation();
            event.preventDefault();

            const task = state.tasks.find(t => t.id === taskId);
            if (!task) return;

            if (task.column === 'done') {
                showToast('You cannot change priority of completed tasks.', 'warning');
                return;
            }

            badgeActiveTaskId = taskId;
            const menu = document.getElementById('badgePriorityMenu');
            menu.classList.remove('hidden');

            const rect = event.currentTarget.getBoundingClientRect();
            menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
            menu.style.left = `${rect.left + window.scrollX}px`;

            const items = menu.querySelectorAll('.badge-dropdown-item');
            items.forEach(item => {
                item.onclick = (e) => {
                    e.stopPropagation();
                    const newPriority = item.getAttribute('data-priority');
                    changeTaskPriorityDirectly(badgeActiveTaskId, newPriority);
                    hideBadgePriorityMenu();
                };
            });
        }

        function changeTaskPriorityDirectly(taskId, newPriority) {
            const task = state.tasks.find(t => t.id === taskId);
            if (!task) return;

            if (task.priority === newPriority) return;

            task.priority = newPriority;
            task.editedAt = Date.now();
            saveToStorage();
            render();
            showToast(`Priority changed to ${newPriority.toUpperCase()}.`, 'success');
        }

        function hideBadgePriorityMenu() {
            document.getElementById('badgePriorityMenu').classList.add('hidden');
            badgeActiveTaskId = null;
        }

        // ==========================================
        // RIGHT-CLICK CUSTOM SYSTEM CONTEXT MENU ROUTINES
        // ==========================================
        let contextActiveTaskId = null;

        function showContextMenu(clientX, clientY, taskId) {
            contextActiveTaskId = taskId;
            const menu = document.getElementById('contextMenu');
            const task = state.tasks.find(t => t.id === taskId);
            if (!task) return;

            menu.classList.remove('hidden');

            const menuWidth = 160;
            const menuHeight = 220;
            let posX = clientX;
            let posY = clientY;

            // Collision checks to keep menu nested inside bounds of viewport
            if (clientX + menuWidth > window.innerWidth) {
                posX = clientX - menuWidth;
            }
            if (clientY + menuHeight > window.innerHeight) {
                posY = clientY - menuHeight;
            }

            menu.style.top = `${posY + window.scrollY}px`;
            menu.style.left = `${posX + window.scrollX}px`;

            const isDone = task.column === 'done';
            const isTodo = task.column === 'todo';
            const isProgress = task.column === 'progress';

            const ctxEdit = document.getElementById('ctxEdit');
            const ctxMoveTodo = document.getElementById('ctxMoveTodo');
            const ctxMoveProgress = document.getElementById('ctxMoveProgress');
            const ctxMoveDone = document.getElementById('ctxMoveDone');

            if (isDone) {
                ctxEdit.classList.add('disabled');
                ctxMoveTodo.classList.remove('disabled');
                ctxMoveProgress.classList.remove('disabled');
                ctxMoveDone.classList.add('disabled');
            } else {
                ctxEdit.classList.remove('disabled');
                
                if (isTodo) {
                    ctxMoveTodo.classList.add('disabled');
                    ctxMoveProgress.classList.remove('disabled');
                    ctxMoveDone.classList.add('disabled'); 
                } else if (isProgress) {
                    ctxMoveTodo.classList.remove('disabled');
                    ctxMoveProgress.classList.add('disabled');
                    if (task.completed) {
                        ctxMoveDone.classList.remove('disabled');
                    } else {
                        ctxMoveDone.classList.add('disabled');
                    }
                }
            }

            // Route execution targets dynamically on event mapping trigger
            document.getElementById('ctxView').onclick = () => { openViewModal(taskId); hideContextMenu(); };
            ctxEdit.onclick = () => { if (!isDone) openEditModal(taskId); hideContextMenu(); };
            ctxMoveTodo.onclick = () => { moveTask(taskId, 'todo'); hideContextMenu(); };
            ctxMoveProgress.onclick = () => { moveTask(taskId, 'progress'); hideContextMenu(); };
            ctxMoveDone.onclick = () => { 
                if (isProgress && !task.completed) {
                    showToast('Tick the task first in order to move to Done!', 'warning');
                } else {
                    moveTask(taskId, 'done'); 
                }
                hideContextMenu(); 
            };
            document.getElementById('ctxDelete').onclick = () => { deleteTask(taskId); hideContextMenu(); };
        }

        function hideContextMenu() {
            document.getElementById('contextMenu').classList.add('hidden');
            contextActiveTaskId = null;
        }
