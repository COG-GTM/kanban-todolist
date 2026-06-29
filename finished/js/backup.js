        // ==========================================
        // BACKUP & RESTORE (JSON EXPORT / IMPORT)
        // ==========================================
        const BACKUP_APP_ID = 'todolist';
        const BACKUP_VERSION = 1;
        const VALID_COLUMNS = ['todo', 'progress', 'done'];
        const VALID_PRIORITIES = ['low', 'medium', 'high'];

        // Serialize the current board to a downloadable JSON backup file
        function exportTasks() {
            if (!state.tasks || state.tasks.length === 0) {
                showToast('There are no tasks to export.', 'warning');
                return;
            }

            const payload = {
                app: BACKUP_APP_ID,
                version: BACKUP_VERSION,
                exportedAt: new Date().toISOString(),
                tasks: state.tasks
            };

            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const link = document.createElement('a');
            link.href = url;
            link.download = `todolist-backup-${stamp}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showToast(`Exported ${state.tasks.length} tasks to JSON.`, 'success');
        }

        // Coerce an arbitrary parsed entry into a valid task entity, or null if unusable
        function normalizeImportedTask(raw) {
            if (!raw || typeof raw !== 'object') return null;

            const title = typeof raw.title === 'string' ? raw.title.trim() : '';
            if (!title) return null;

            const column = VALID_COLUMNS.includes(raw.column) ? raw.column : 'todo';
            const priority = VALID_PRIORITIES.includes(raw.priority) ? raw.priority : 'low';
            const completed = raw.completed === true && column === 'done';

            // Preserve any optional Devin integration fields (devinSessionId, devinSessionUrl, etc.)
            const devinFields = {};
            Object.keys(raw).forEach((key) => {
                if (key.startsWith('devin')) devinFields[key] = raw[key];
            });

            return {
                ...devinFields,
                id: (typeof raw.id === 'string' && raw.id) ? raw.id : 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                title: title,
                desc: typeof raw.desc === 'string' ? raw.desc : '',
                priority: priority,
                column: column,
                createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now(),
                editedAt: Number.isFinite(raw.editedAt) ? raw.editedAt : null,
                completed: completed
            };
        }

        // Parse, validate, and restore a board from a user-selected JSON file
        async function importTasksFromFile(file) {
            if (!file) return;

            let parsed;
            try {
                const text = await file.text();
                parsed = JSON.parse(text);
            } catch (e) {
                showToast('Could not read file: invalid JSON.', 'error');
                return;
            }

            // Accept either a full backup payload or a bare array of tasks
            const rawTasks = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.tasks) ? parsed.tasks : null);
            if (!rawTasks) {
                showToast('Invalid backup file: no tasks found.', 'error');
                return;
            }

            const importedTasks = rawTasks.map(normalizeImportedTask).filter(Boolean);
            if (importedTasks.length === 0) {
                showToast('Backup file contains no valid tasks.', 'error');
                return;
            }

            if (state.tasks.length > 0) {
                const confirmed = await requestConfirmation(
                    'Restore from Backup',
                    `This will replace your current ${state.tasks.length} tasks with ${importedTasks.length} from the backup. Continue?`
                );
                if (!confirmed) return;
            }

            state.tasks = importedTasks;
            saveToStorage();
            render();

            // Resume tracking any imported tasks that carry a Devin session
            if (typeof pollDevinSessions === 'function') {
                pollDevinSessions();
            }

            showToast(`Imported ${importedTasks.length} tasks successfully.`, 'success');
        }
