        // ==========================================
        // MASTER BOARD RENDER ENGINE
        // ==========================================
        function render() {
            const bodyTodo = document.getElementById('bodyTodo');
            const bodyProgress = document.getElementById('bodyProgress');
            const bodyDone = document.getElementById('bodyDone');

            // Hard clean all target columns
            bodyTodo.innerHTML = '';
            bodyProgress.innerHTML = '';
            bodyDone.innerHTML = '';

            let filteredTasks = [...state.tasks];

            // Filter out entities not matching client query criteria
            if (state.searchQuery) {
                const query = state.searchQuery.toLowerCase();
                filteredTasks = filteredTasks.filter(t => 
                    t.title.toLowerCase().includes(query) || 
                    t.desc.toLowerCase().includes(query)
                );
            }

            if (state.filterPriority !== 'all') {
                filteredTasks = filteredTasks.filter(t => t.priority === state.filterPriority);
            }

            // Perform sorting algorithms
            filteredTasks.sort((a, b) => {
                if (state.sortBy === 'date-desc') {
                    return b.createdAt - a.createdAt;
                } else if (state.sortBy === 'date-asc') {
                    return a.createdAt - b.createdAt;
                } else if (state.sortBy === 'priority-desc') {
                    const priorityWeight = { high: 3, medium: 2, low: 1 };
                    return priorityWeight[b.priority] - priorityWeight[a.priority];
                } else if (state.sortBy === 'title-asc') {
                    return a.title.localeCompare(b.title);
                }
                return 0;
            });

            // Map and count rendered arrays
            const counts = { todo: 0, progress: 0, done: 0 };

            filteredTasks.forEach(task => {
                counts[task.column]++;
                const card = createTaskCardDOM(task);
                
                if (task.column === 'todo') {
                    bodyTodo.appendChild(card);
                } else if (task.column === 'progress') {
                    bodyProgress.appendChild(card);
                } else if (task.column === 'done') {
                    bodyDone.appendChild(card);
                }
            });

            // Synchronize counters
            document.getElementById('countTodo').textContent = counts.todo;
            document.getElementById('countProgress').textContent = counts.progress;
            document.getElementById('countDone').textContent = counts.done;

            // Synchronize mobile segmented pills indicators
            document.getElementById('todoTabBadge').textContent = counts.todo;
            document.getElementById('progressTabBadge').textContent = counts.progress;
            document.getElementById('doneTabBadge').textContent = counts.done;

            // Verify if empty illustrations require mounting
            checkEmptyState('todo', bodyTodo, counts.todo);
            checkEmptyState('progress', bodyProgress, counts.progress);
            checkEmptyState('done', bodyDone, counts.done);
        }

        // Mount friendly empty states when search criteria returns null arrays
        function checkEmptyState(columnName, element, count) {
            if (count === 0) {
                let icon = 'fa-clipboard-list';
                let msg = 'No tasks listed here.';
                if (columnName === 'progress') {
                    icon = 'fa-spinner';
                    msg = 'Nothing in progress.';
                } else if (columnName === 'done') {
                    icon = 'fa-check-double';
                    msg = 'No completed tasks yet.';
                }
                element.innerHTML = `
                    <div class="empty-column-placeholder">
                        <i class="fas ${icon}"></i>
                        <p>${msg}</p>
                    </div>
                `;
            }
        }

        // Perform isolated timestamp recalculations to prevent heavy DOM rendering loops
        function renderTimestampsOnly() {
            state.tasks.forEach(task => {
                const badge = document.querySelector(`.task-card[data-id="${task.id}"] .task-time`);
                if (badge) {
                    badge.textContent = formatRelativeTime(task.createdAt);
                }
            });
        }

        // ==========================================
        // CORE TASK CARD DOM GENERATOR
        // ==========================================
        function createTaskCardDOM(task) {
            const card = document.createElement('article');
            card.className = `task-card priority-${task.priority}`;
            card.setAttribute('draggable', task.column !== 'done' ? 'true' : 'false');
            card.setAttribute('data-id', task.id);

            // Set HTML5 dragging listeners
            if (task.column !== 'done') {
                card.addEventListener('dragstart', (e) => {
                    card.classList.add('dragging');
                    e.dataTransfer.setData('text/plain', task.id);
                });
                card.addEventListener('dragend', () => {
                    card.classList.remove('dragging');
                });
            }

            // Custom right-click routing trigger listener
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showContextMenu(e.clientX, e.clientY, task.id);
            });

            const isDone = task.column === 'done';
            const isProgress = task.column === 'progress';
            const isTodo = task.column === 'todo';

            let devinPill = '';
            if (task.devinSessionId) {
                const working = isDevinWorking(task);
                const label = devinStatusLabel(task);
                const labelSlug = label.replace(/\s+/g, '-').toLowerCase();
                const pillIcon = working ? 'fa-spinner fa-spin' : 'fa-robot';
                const workingClass = working ? ' devin-working' : '';
                const clickableClass = task.devinSessionUrl ? ' devin-clickable' : '';
                const pillTitle = task.devinSessionUrl ? 'Open Devin session' : 'Devin session status';
                const clickAttr = task.devinSessionUrl ? ` onclick="openDevinSession('${task.id}')"` : '';
                devinPill = `<span class="devin-status-pill devin-${labelSlug}${workingClass}${clickableClass}" title="${pillTitle}"${clickAttr}><i class="fas ${pillIcon}"></i> ${label}</span>`;
            }

            const headerHTML = `
                <div class="task-header">
                    <span class="badge-priority ${task.priority}" onclick="openBadgePriorityMenu(event, '${task.id}')">${task.priority}</span>
                    ${devinPill}
                    <span class="task-time">${formatRelativeTime(task.createdAt)}</span>
                </div>
            `;

            const descHTML = task.desc 
                ? `<p class="task-desc-excerpt">${task.desc}</p>` 
                : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

            // Directional triggers mapping for small screen touch usability
            let navArrowsHTML = '';
            if (isTodo) {
                navArrowsHTML = `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move to Progress"><i class="fas fa-arrow-right"></i></button>`;
            } else if (isProgress) {
                navArrowsHTML = `
                    <button class="btn-arrow" onclick="moveTask('${task.id}', 'todo')" title="Move back to To Do"><i class="fas fa-arrow-left"></i></button>
                    <button class="btn-arrow" onclick="moveTask('${task.id}', 'done')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>
                `;
            } else if (isDone) {
                navArrowsHTML = `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move back to In Progress"><i class="fas fa-arrow-left"></i></button>`;
            }

            // Edit/details button: opens the combined modal (read-only for Done).
            const editButton = `<button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="${isDone ? 'View Task' : 'Edit Task'}"><i class="fas ${isDone ? 'fa-expand-alt' : 'fa-pencil-alt'}"></i></button>`;

            // Devin button: "Run with Devin" on fresh To Do cards, or "Open Devin
            // session" once a session exists. Both carry a descriptive tooltip.
            let devinButton = '';
            if (devinEnabled && isTodo && !task.devinSessionId) {
                devinButton = `<button class="btn-card-action btn-devin" onclick="openDevinModal('${task.id}')" title="Run with Devin"><i class="fas fa-robot"></i></button>`;
            } else if (task.devinSessionId) {
                devinButton = `<button class="btn-card-action btn-devin-open" onclick="openDevinSession('${task.id}')" title="Open Devin session"><i class="fas fa-arrow-up-right-from-square"></i></button>`;
            }

            const footerHTML = `
                <div class="task-footer">
                    <div class="card-actions-left">
                        ${editButton}
                        ${devinButton}
                    </div>
                    <div class="card-nav-arrows">
                        ${navArrowsHTML}
                    </div>
                </div>
            `;

            card.innerHTML = `
                ${headerHTML}
                <h4 class="task-title">${task.title}</h4>
                ${descHTML}
                ${footerHTML}
            `;

            return card;
        }
