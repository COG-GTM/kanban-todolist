const LOCAL_STORAGE_KEY = 'daily-task-tracker';
let state = { tasks: [], filterPriority: 'all', sortBy: 'date-desc', searchQuery: '' };

function createDemoTasks() {
    return [
        { id: 'demo-1', title: 'Escape HTML in task text', desc: 'Sanitize titles/descriptions to prevent injection.', priority: 'high', column: 'todo', createdAt: Date.now() - 40 * 60 * 1000, editedAt: null, completed: false },
        { id: 'demo-2', title: 'Add undo for deleted tasks', desc: 'Show a toast with an Undo action after deleting.', priority: 'medium', column: 'todo', createdAt: Date.now() - 15 * 60 * 1000, editedAt: null, completed: false },
        { id: 'demo-3', title: 'Improve keyboard accessibility', desc: 'Move/edit cards via keyboard; add ARIA roles.', priority: 'medium', column: 'progress', createdAt: Date.now() - 3 * 3600 * 1000, editedAt: null, completed: false },
        { id: 'demo-4', title: 'Add tests for task rules', desc: 'Unit-test the move/add/edit logic.', priority: 'medium', column: 'progress', createdAt: Date.now() - 6 * 3600 * 1000, editedAt: null, completed: false },
        { id: 'demo-5', title: 'Export and import tasks as JSON', desc: 'Backup/restore so data is not trapped here.', priority: 'low', column: 'done', createdAt: Date.now() - 25 * 3600 * 1000, editedAt: Date.now() - 24 * 3600 * 1000, completed: true }
    ];
}

function normalizeTask(task) {
    return {
        ...task,
        desc: task.desc || '',
        priority: task.priority || 'low',
        column: task.column || 'todo',
        createdAt: typeof task.createdAt === 'string' ? new Date(task.createdAt).getTime() : task.createdAt,
        editedAt: task.editedAt || null,
        completed: task.completed === true
    };
}

function loadFromStorage() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
        try {
            state = JSON.parse(saved);
        } catch (e) {
            console.error('Storage loading error:', e);
            return;
        }
        state.tasks = (state.tasks || []).map(normalizeTask);
        state.filterPriority = state.filterPriority || 'all';
        state.sortBy = state.sortBy || 'date-desc';
        state.searchQuery = '';
        saveToStorage();
        return;
    }
    state.tasks = createDemoTasks();
    saveToStorage();
}

function saveToStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

function generateTaskId() {
    return 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}
