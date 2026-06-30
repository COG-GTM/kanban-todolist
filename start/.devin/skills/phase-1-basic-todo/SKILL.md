---
name: phase-1-basic-todo
description: Workshop Phase 1 implementation guide. Scaffold the basic to-do list — a single-column list with add, delete, and localStorage persistence — using the project's modular HTML/CSS/JS file layout. Use when the request is to build the first/basic version of the todo app (add tasks, list them, delete them, save them).
triggers:
  - user
  - model
allowed-tools:
  - read
  - edit
  - grep
  - glob
---

# Phase 1 — Basic To-Do List

You are implementing the **foundation** of the workshop app. Everything later
builds on the file layout, identifiers, and `localStorage` contract you set up
here, so match the names below **exactly**.

## Baseline (assumed state)
The project is the blank slate: `index.html` shows a placeholder; there is no
`css/` or `js/` yet. You will create the real app structure.

## What to build
A single-column to-do list with:
- a title input + **Add** button (Enter also adds),
- a list of task rows (title + delete button),
- persistence to `localStorage` under the key `daily-task-tracker`.

Keep the layout simple, but **apply the brand color scheme from the start** (see
`css/styles.css` below). **Phase 2 replaces the CSS entirely** with the full
design system, so don't invest in polish beyond getting the brand colors in.

## Files to create

Create this exact structure (classic, non-module scripts):

```
index.html
css/styles.css
js/state.js
js/render.js
js/tasks.js
js/events.js
js/main.js
```

### `index.html`
Replace the placeholder file. Requirements:
- `<title>Daily Task Tracker</title>`, `<meta charset>` and viewport meta.
- Link `css/styles.css` in `<head>`.
- A container with a "Daily Task Tracker" logo/heading, an add-task row, and a list:
  - Logo/heading: render the three title words in separate spans so each can be
    colored (these exact class names carry forward into phase 2):
    `<h1 class="logo"><span class="todo-text">Daily</span> <span class="list-text">Task</span> <span class="accent-text">Tracker</span></h1>`
  - Title input: `<input type="text" id="todoTitleInput" placeholder="Add a new todo task..." maxlength="40">`
  - Add button: `<button id="addTodoBtn">Add</button>`
  - List container: `<div id="taskList"></div>`
- At the end of `<body>`, load scripts **in this order**:
  ```html
  <script src="js/state.js"></script>
  <script src="js/render.js"></script>
  <script src="js/tasks.js"></script>
  <script src="js/events.js"></script>
  <script src="js/main.js"></script>
  ```

> Note: `#taskList` is a phase-1-only container; phase 4 replaces it with the
> three-column Kanban board. The `#todoTitleInput` and `#addTodoBtn` IDs persist.

### `js/state.js` — state + persistence (the contract every phase reuses)
Define globals (no modules):
```js
const LOCAL_STORAGE_KEY = 'daily-task-tracker';
let state = { tasks: [] };

function loadFromStorage() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
        try { state = JSON.parse(saved); } catch (e) { console.error('Storage loading error:', e); }
    }
}

function saveToStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}
```
Use this **task shape** (later phases add fields — keep these names):
```js
{ id, title, createdAt }
```
Generate ids like: `'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000)`.

### `js/tasks.js` — add & delete
- `addNewTodo()`: read `#todoTitleInput`, `trim()` it, and **reject
  empty/whitespace-only titles** — just return and leave focus in the input (no
  task added). (The 3–40 character title rules arrive in phase 3; keep phase 1's
  guard to "non-empty" only.) Otherwise push a task built with the shape above,
  `saveToStorage()`, clear the input, then call `render()`.
- `deleteTask(taskId)`: `state.tasks = state.tasks.filter(t => t.id !== taskId)`,
  `saveToStorage()`, `render()`. (Plain delete — the confirmation dialog arrives
  in a later phase.)

### `js/render.js` — render the list
- `render()`: clear `#taskList` (`innerHTML = ''`), then for each task in
  `state.tasks` create a row element showing the title and a delete button wired
  to `deleteTask(task.id)`.
- Show a friendly empty message when there are no tasks.

> **Which names matter:** only `#todoTitleInput`, `#addTodoBtn`, and `#taskList`
> are load-bearing for later phases — use those exactly. The task-row markup and
> its classes here are throwaway (phase 4 replaces `#taskList` with the Kanban
> board), so name them however you like. Inline `onclick` handlers that call
> globals — e.g. `onclick="deleteTask('${task.id}')"` — are the project's
> established pattern and are used throughout the later phases, so they're fine
> here (task ids are app-generated, not user input).

### `js/events.js` — wiring
```js
function setupEventListeners() {
    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    document.getElementById('todoTitleInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });
}
```

### `js/main.js` — bootstrap
```js
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    setupEventListeners();
    render();
});
```

### `css/styles.css` — minimal baseline, with the brand colors
Keep the layout simple, but **apply the brand color scheme now** (phase 2 later
expands these into the full token set). Suggested starting point:
```css
:root {
    --primary: #00f2ea;          /* bright aqua, the brand primary */
    --primary-hover: #00cbc4;
    --primary-contrast: #00332f; /* dark text for use on aqua fills */
    --accent: #ff0050;           /* pink, used ONLY in the title's last word */
}
* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
body { background: #f8fafc; color: #0f172a; padding: 40px 16px; }

/* Tri-color brand title: Daily = black, Task = slightly darker aqua, Tracker = pink */
.logo .todo-text   { color: #000000; }
.logo .list-text   { color: #00d6cf; }
.logo .accent-text { color: var(--accent); }

/* Aqua Add button with dark text for legibility */
#addTodoBtn { background: var(--primary); color: var(--primary-contrast); border: none; cursor: pointer; }
#addTodoBtn:hover { background: var(--primary-hover); }
```
Add simple styling for a centered container, the input + button row, and task
rows (a bordered/rounded row with the title on the left and the delete button on
the right). Don't over-style; phase 2 owns the full design system. Just make sure
the brand colors above are in place.

## Acceptance criteria
- Adding a task (button or Enter) shows it in the list and clears the input.
- Deleting removes the task.
- Reloading the page preserves tasks (stored under `localStorage` key `daily-task-tracker`).
- Opening `index.html` directly in a browser works with no server/build step.
- The modular file layout and the exact identifiers above are in place.
- The brand colors are applied: a tri-color "Daily Task Tracker" title (black /
  darker aqua / pink) and an aqua **Add** button with dark text.

## Open the app and verify (quick check, do not skip)
When you finish this phase, **open `start/index.html` and add one task** (type a title, click Add) and confirm it appears in the list. That single action is all the on-screen testing you need; the detailed correctness is already covered by the acceptance criteria above, so don't run full end-to-end testing. We optimize for speed at every step. If you changed the shape of saved data, run `localStorage.removeItem('daily-task-tracker')` in the console and refresh to reseed.
