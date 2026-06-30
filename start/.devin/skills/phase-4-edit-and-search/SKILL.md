---
name: phase-4-edit-and-search
description: Workshop Phase 4 implementation guide. Add a combined view/edit task modal (read-only for Done tasks), created/last-edited timestamps with relative "time ago" labels, and a delete confirmation dialog (introduces js/utils.js and js/modals.js); AND add header controls for live search (by title/description), priority filtering, and sorting (newest, oldest, highest priority, title A-Z) applied across the board in render(). Use when the request is to edit task details, add a task modal, timestamps, delete confirmation, or to search/filter/sort tasks.
triggers:
  - user
  - model
allowed-tools:
  - read
  - edit
  - grep
  - glob
---

# Phase 4 — Edit & Details Modal + Search, Filter & Sort

This phase does two things together: (A) add a modal to view/edit a task with
timestamps and a delete confirmation, and (B) add live search, a priority filter,
and a sort selector that apply across the board. Assumes the **phase-3 board**
exists.

## Baseline (assumed state)
Phases 1–3 are done: the styled three-column Kanban board with priority badges
and descriptions, saved to `localStorage`.

> **Integration notes (shared with phase 5):**
> - `js/render.js`: you add an edit/view button + a `.task-time` element to each
>   card, and you insert a filter+sort step at the top of `render()`. Keep
>   phase 3's nav arrows and the priority badge.
> - `index.html`: modal markup goes before the scripts; the search/filter/sort
>   controls go inside the existing `.header-controls` (created in phase 2).
> - Load order in `index.html`: `utils.js` right after `state.js`; `modals.js`
>   before `render.js`.

---

# Part A — Edit & Details Modal + Timestamps

Add a modal to view/edit a task, track created/edited times, show relative time
on cards, and confirm deletes.

## A1. `js/utils.js` (new) — time formatting
```js
function formatRelativeTime(timestamp) {
    if (!timestamp) return 'Never';
    const mins = Math.floor((Date.now() - timestamp) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    return new Date(timestamp).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}
function formatFullTime(timestamp) {
    if (!timestamp) return 'Never edited';
    return new Date(timestamp).toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' });
}
```

## A2. `js/modals.js` (new) — open/close + async confirm
```js
function openModal(modalId)  { document.getElementById(modalId).classList.add('active'); }
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (modalId === 'taskModal') editingTaskId = null;
}
// Promise-based confirmation dialog backed by #confirmModal.
function requestConfirmation(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        modal.classList.add('active');
        const yes = document.getElementById('confirmYesBtn');
        const cancel = document.getElementById('confirmCancelBtn');
        const close = document.getElementById('confirmCloseBtn');
        const done = (val) => { modal.classList.remove('active'); cleanup(); resolve(val); };
        const onYes = () => done(true), onNo = () => done(false);
        function cleanup() { yes.removeEventListener('click', onYes); cancel.removeEventListener('click', onNo); close.removeEventListener('click', onNo); }
        yes.addEventListener('click', onYes); cancel.addEventListener('click', onNo); close.addEventListener('click', onNo);
    });
}
```

## A3. `index.html` — modal markup (place before the scripts)
Add a **task modal** (`id="taskModal"`, class `modal-overlay`) with a
`.modal-container` containing:
- header: `<h3 id="taskModalTitle">Task Details</h3>` + a close button
  (`onclick="closeModal('taskModal')"`).
- body: a title input `#taskTitleInput` (min 3/max 40) with counter
  `#taskTitleCounter`; a priority select `#taskPriorityInput`; a description
  textarea `#taskDescInput` (max 150) with counter `#taskDescCounter`; and a
  `.meta-list` with `#taskCreated` and `#taskEdited` values.
- footer: a Close button and `<button id="saveEditBtn">Save Changes</button>`.

Add a **confirm modal** (`id="confirmModal"`, class `modal-overlay`) with
`#confirmModalTitle`, `#confirmModalMessage`, and buttons `#confirmCancelBtn`,
`#confirmCloseBtn`, `#confirmYesBtn`. (See `../.finished/index.html` for the exact
structure.)

Load the new scripts: add `<script src="js/utils.js"></script>` after state and
`<script src="js/modals.js"></script>` before render.

## A4. `js/tasks.js` — edit + confirmed delete
Add a module-level `let editingTaskId = null;` and:
- `openTaskModal(taskId)`: find the task; `editingTaskId = taskId`; fill the
  inputs; set both counters; fill `#taskCreated` (`formatFullTime(createdAt)`) and
  `#taskEdited` (`task.editedAt ? formatFullTime(editedAt) : 'Not edited yet'`).
  If `task.column === 'done'`, set inputs `disabled = true`, title the modal "Task
  Details", and hide `#saveEditBtn`; otherwise "Edit Task" and show Save.
  Then `openModal('taskModal')`. Add aliases `openViewModal = openEditModal = openTaskModal`.
- `saveEditedTask()`: validate (title 3–40, desc ≤150), write `title/desc/priority`,
  set `task.editedAt = Date.now()`, save, `closeModal('taskModal')`, `render()`.
- Update `deleteTask(taskId)` to be `async` and gate on
  `await requestConfirmation('Delete Task', 'Are you sure you want to permanently delete "…"?')`
  before removing.

## A5. `js/render.js` — edit button, timestamp, live refresh
- In the card header, add `<span class="task-time">${formatRelativeTime(task.createdAt)}</span>`.
- In the footer, add a `.card-actions-left` group with an edit/view button:
  ```html
  <button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="Edit Task"><i class="fas fa-pencil-alt"></i></button>
  ```
  For Done tasks, use the expand icon (`fa-expand-alt`) and title "View Task".
- Add `renderTimestampsOnly()` that updates each card's `.task-time` text without
  a full re-render.

## A6. `js/events.js` + `js/main.js`
- Wire `#saveEditBtn` → `saveEditedTask`; update `#taskTitleCounter` /
  `#taskDescCounter` on input.
- In `main.js`, add `setInterval(renderTimestampsOnly, 30000);`.

## A7. `css/styles.css` — modal + form styles (append)
Match `../.finished/css/styles.css` section **11** plus `.btn-card-action`:
- `.modal-overlay` (fixed, slate backdrop, `backdrop-filter:blur(2px)`,
  `opacity:0; pointer-events:none`) and `.modal-overlay.active` (visible). Scale
  the `.modal-container` from 0.95 → 1 on `.active`.
- `.modal-header`, `.modal-body`, `.modal-footer`, `.btn-modal-close`.
- `.form-group`, `.form-input`, `.form-textarea` (focus glow), `.meta-list`,
  `.meta-item`, `.meta-label`, `.meta-value`.
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`.
- `.btn-card-action` (26×26 transparent icon button, hover slate) and `.task-time`
  (0.7rem muted, nowrap).

---

# Part B — Search, Filter & Sort

Add live search, a priority filter, and a sort selector that apply across the
board.

## B1. `index.html` — header controls
Inside `.header-controls`, add:
```html
<div class="search-wrapper">
    <i class="fas fa-search"></i>
    <input type="text" id="searchInput" class="search-input" placeholder="Search tasks...">
</div>
<select id="priorityFilter" class="select-filter">
    <option value="all">All Priorities</option>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
</select>
<select id="sortBySelect" class="select-filter">
    <option value="date-desc">Newest First</option>
    <option value="date-asc">Oldest First</option>
    <option value="priority-desc">Highest Priority</option>
    <option value="title-asc">Title (A-Z)</option>
</select>
```

## B2. `js/state.js` — control state
Add to `state`: `filterPriority: 'all'`, `sortBy: 'date-desc'`, `searchQuery: ''`.
In `loadFromStorage()`, after parsing saved state, force `state.searchQuery = ''`
so search always starts empty on boot.

## B3. `js/render.js` — filter + sort pipeline
At the very start of `render()` (before splitting into columns):
```js
let filteredTasks = [...state.tasks];
if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(t =>
        t.title.toLowerCase().includes(q) || (t.desc || '').toLowerCase().includes(q));
}
if (state.filterPriority !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.priority === state.filterPriority);
}
filteredTasks.sort((a, b) => {
    if (state.sortBy === 'date-desc') return b.createdAt - a.createdAt;
    if (state.sortBy === 'date-asc')  return a.createdAt - b.createdAt;
    if (state.sortBy === 'priority-desc') {
        const w = { high: 3, medium: 2, low: 1 };
        return w[b.priority] - w[a.priority];
    }
    if (state.sortBy === 'title-asc') return a.title.localeCompare(b.title);
    return 0;
});
```
Then iterate `filteredTasks` (instead of `state.tasks`) when building cards and
counting per column, so search/filter affect both the cards shown and the counts.

## B4. `js/events.js` — wire the controls
In `setupEventListeners()`:
```js
document.getElementById('searchInput').addEventListener('input', (e) => { state.searchQuery = e.target.value.trim(); render(); });
document.getElementById('priorityFilter').addEventListener('change', (e) => { state.filterPriority = e.target.value; render(); });
document.getElementById('sortBySelect').addEventListener('change', (e) => { state.sortBy = e.target.value; render(); });
```

## B5. `css/styles.css` — control styles (append, if missing)
Match `../.finished/css/styles.css` section 4:
- `.search-wrapper` (relative) with an absolutely-positioned `i` icon; `.search-input`
  (padded-left for the icon, rounded, ~160px, widening + aqua glow on `:focus`).
- `.select-filter` (rounded select, slate text, aqua border on `:focus`) — it
  may already exist from the priority dropdown in phase 2; reuse it.

## Acceptance criteria
- Clicking a card's edit button opens a prefilled modal; saving updates the card
  and sets `editedAt`.
- Done tasks open read-only with Save hidden.
- Modal shows created/last-edited times; cards show a relative time that refreshes.
- Deleting prompts a confirmation dialog and only deletes on confirm.
- Search filters cards live by title or description; clearing it restores all.
- Priority filter limits visible tasks; "All Priorities" shows everything.
- Each sort option reorders cards correctly within columns.
- Column counts reflect the filtered/searched set.
- Filter + sort selections persist; the search box is empty after every reload.

## Open the app and verify (quick check, do not skip)
**Testing must be extremely minimal and fast: 4 clicks/interactions max.** Do only the one quick check below, then stop. The acceptance criteria above already cover correctness, so don't go further. Speed matters more than coverage here. Don't write a test report or any summary of the check.
When you finish this phase, **open `start/index.html`, click one card to open the edit modal, then type one word in the search box** and confirm the modal shows details and the board filters. That is all the on-screen testing you need; correctness is already covered by the acceptance criteria above, so don't run full end-to-end testing. We optimize for speed at every step. While you're there, confirm the colors match the brand palette from the `:root` design tokens (aqua `--primary` with dark text on aqua, and the tri-color title) with no new colors. If you changed the shape of saved data, run `localStorage.removeItem('daily-task-tracker')` in the console and refresh to reseed.
