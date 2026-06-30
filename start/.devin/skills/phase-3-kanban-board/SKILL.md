---
name: phase-3-kanban-board
description: Workshop Phase 3 implementation guide. Convert the single list into a three-column Kanban board (To Do / In Progress / Done) with per-column counts, empty states, move-arrow buttons, a To Do→In Progress→Done workflow with completion rules, and seeded demo data. Use when the request is to add a Kanban board, columns, or task status/movement.
triggers:
  - user
  - model
allowed-tools:
  - read
  - edit
  - grep
  - glob
---

# Phase 3 — Kanban Board & Status

Replace the single list with a 3-column board and a status workflow. It assumes
phase 2 (design system + priority/description) is in place. If it is missing,
still build the board; just style/skip the missing pieces gracefully.

## Baseline (assumed state)
Working app with `#todoTitleInput`, `#addTodoBtn`, design tokens in
`css/styles.css`, and tasks carrying `priority` + `desc`. Tasks currently render
into a single `#taskList` container.

## 1. `js/state.js` — status fields + demo seed
Task shape becomes:
```js
{ id, title, desc, priority, column, createdAt, editedAt, completed }
```
- `column` is one of `'todo' | 'progress' | 'done'`; new tasks default to `'todo'`.
- `completed` defaults to `false`; `editedAt` defaults to `null`.

Add a demo-seed factory and seed it when storage is empty (replace the
phase-1/empty behavior in `loadFromStorage`):
```js
function createDemoTasks() {
    return [
        { id:'demo-1', title:'Escape HTML in task text', desc:'Sanitize titles/descriptions to prevent injection.', priority:'high',   column:'todo',     createdAt:Date.now()-40*60*1000,   editedAt:null,                  completed:false },
        { id:'demo-2', title:'Add undo for deleted tasks', desc:'Show a toast with an Undo action after deleting.',  priority:'medium', column:'todo',     createdAt:Date.now()-15*60*1000,   editedAt:null,                  completed:false },
        { id:'demo-3', title:'Improve keyboard accessibility', desc:'Move/edit cards via keyboard; add ARIA roles.', priority:'medium', column:'progress', createdAt:Date.now()-3*3600*1000,  editedAt:null,                  completed:false },
        { id:'demo-4', title:'Add tests for task rules', desc:'Unit-test the move/add/edit logic.',                  priority:'medium', column:'progress', createdAt:Date.now()-6*3600*1000,  editedAt:null,                  completed:false },
        { id:'demo-5', title:'Export and import tasks as JSON', desc:'Backup/restore so data is not trapped here.',  priority:'low',    column:'done',     createdAt:Date.now()-25*3600*1000, editedAt:Date.now()-24*3600*1000, completed:true  }
    ];
}
```
In `loadFromStorage()`: when there is no saved state, set
`state.tasks = createDemoTasks()` and `saveToStorage()`.

## 2. `index.html` — replace the list with the board
Remove `#taskList` and add a board (inside a `<main class="board-container">`).
Use these exact ids/classes — they're referenced by later phases:
```html
<main class="board-container">
    <section class="board-column" id="columnTodo" data-column="todo">
        <header class="column-header">
            <div class="column-title-group"><span class="column-dot todo"></span><h3>To Do</h3></div>
            <span class="column-count" id="countTodo">0</span>
        </header>
        <div class="column-body no-scrollbar" id="bodyTodo"></div>
    </section>
    <section class="board-column" id="columnProgress" data-column="progress">
        <header class="column-header">
            <div class="column-title-group"><span class="column-dot progress"></span><h3>In Progress</h3></div>
            <span class="column-count" id="countProgress">0</span>
        </header>
        <div class="column-body no-scrollbar" id="bodyProgress"></div>
    </section>
    <section class="board-column" id="columnDone" data-column="done">
        <header class="column-header">
            <div class="column-title-group"><span class="column-dot done"></span><h3>Done</h3></div>
            <span class="column-count" id="countDone">0</span>
        </header>
        <div class="column-body no-scrollbar" id="bodyDone"></div>
    </section>
</main>
```

## 3. `js/render.js` — fan tasks into columns
Rewrite `render()` to:
- Clear `#bodyTodo`, `#bodyProgress`, `#bodyDone`.
- Iterate `state.tasks`, build a card per task with `createTaskCardDOM(task)`, and
  append it to the body matching `task.column`.
- Track counts per column and write them to `#countTodo/#countProgress/#countDone`.
- For empty columns, render an empty-state placeholder (a `checkEmptyState`
  helper): an icon + message, e.g. To Do → `fa-clipboard-list` "No tasks listed
  here.", In Progress → `fa-spinner` "Nothing in progress.", Done →
  `fa-check-double` "No completed tasks yet." Use `.empty-column-placeholder`.

`createTaskCardDOM(task)` should produce an `<article class="task-card priority-${task.priority}" data-id="${task.id}">` containing:
- header: the `.badge-priority` from phase 2,
- `<h4 class="task-title">`,
- the `.task-desc-excerpt`,
- a footer `<div class="task-footer">` with a `.card-nav-arrows` group of move
  buttons (see below). (The edit button + timestamps are added in phase 4; drag &
  context menu in phase 5 — leave room for them.)

Move arrows by column (`.btn-arrow` calling `moveTask`):
- **todo:** → Progress.
- **progress:** ← To Do, → Done.
- **done:** ← In Progress.
```html
<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move to Progress"><i class="fas fa-arrow-right"></i></button>
```

## 4. `js/tasks.js` — workflow rules
`addNewTodo()`: set `column: 'todo'`, `completed: false`, `editedAt: null` on new tasks.

Add `moveTask(taskId, targetColumn)` enforcing:
```js
function moveTask(taskId, targetColumn) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.column === targetColumn) return;
    const oldColumn = task.column;
    // Must pass through In Progress before Done.
    if (targetColumn === 'done') {
        if (oldColumn === 'todo') { /* reject: notify the user and return */ return; }
        task.completed = true;
    }
    if (targetColumn === 'todo') task.completed = false;
    if ((oldColumn === 'done' || oldColumn === 'progress') && (targetColumn === 'todo' || targetColumn === 'progress')) task.completed = false;
    task.column = targetColumn;
    saveToStorage();
    render();
}
```
(Use `alert()`/`console` for the rejection message for now; phase 5 swaps in toasts.)

## 5. `css/styles.css` — board + card chrome (append)
Match `../.finished/css/styles.css` sections **7 (board grid)** and **8 (task
card)**. Key pieces:
- `.board-container { flex:1; display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding:16px 24px; overflow:hidden; }`
- `.board-column` (slate bg, border, radius 12px, flex column), `.column-header`
  (space-between, bottom border), `.column-dot.todo/.progress/.done` colors
  (`--text-muted` / `#f59e0b` / `#10b981`), `.column-count` pill, `.column-body`
  (flex column, `overflow-y:auto`, gap 10px) + `.no-scrollbar` helper.
- `.task-footer` (space-between, top border), `.card-nav-arrows`, `.btn-arrow`
  (small slate icon button).
- Done column styling: `.board-column.col-done .task-title { text-decoration: line-through; color: var(--text-muted); }` (add `col-done` to the Done column if you use it).
- `.empty-column-placeholder` (centered muted icon + text).

## Acceptance criteria
- Three columns render; tasks appear in their `column`; counts are correct.
- Move arrows advance/retreat tasks; To Do → Done directly is blocked.
- Reaching Done marks `completed: true`; moving back clears it.
- Empty columns show the placeholder; a fresh board shows the seeded demo tasks.
- Column placement and completion persist in `localStorage`.

## Open the app and verify (quick check, do not skip)
**Testing must be extremely minimal and fast: 4 clicks/interactions max.** Do only the one quick check below, then stop. The acceptance criteria above already cover correctness, so don't go further. Speed matters more than coverage here. Don't write a test report or any summary of the check.
When you finish this phase, **open `start/index.html` and move one task forward a column** (click its move arrow once) and confirm it lands in the next column. That single action is all the on-screen testing you need; correctness is already covered by the acceptance criteria above, so don't run full end-to-end testing. We optimize for speed at every step. While you're there, confirm the colors match the brand palette from the `:root` design tokens (aqua `--primary` with dark text on aqua, and the tri-color title) with no new colors. If you changed the shape of saved data, run `localStorage.removeItem('daily-task-tracker')` in the console and refresh to reseed.

> **Builds on the previous phases.** Before starting, refresh `index.html` to confirm the styled cards with priority badges and descriptions (Phase 2) are already in place; after finishing, refresh again and verify the board still shows them.
