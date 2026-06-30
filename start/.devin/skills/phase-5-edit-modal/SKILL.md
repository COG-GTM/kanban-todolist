---
name: phase-5-edit-modal
description: Workshop Phase 5 implementation guide. Add a combined view/edit task modal (read-only for Done tasks), created/last-edited timestamps with relative "time ago" labels, and a confirmation dialog for deletes. Introduces js/utils.js (time formatting) and js/modals.js (open/close + async confirm). Use when the request is to edit task details, add a task modal, timestamps, or delete confirmation.
triggers:
  - user
  - model
allowed-tools:
  - read
  - edit
  - grep
  - glob
---

# Phase 5 — Edit & Details Modal + Timestamps

Add a modal to view/edit a task, track created/edited times, show relative time
on cards, and confirm deletes. Assumes the **phase-4 board** exists.

> **Integration notes (shared with phases 6 & 7):**
> - `js/render.js`: you add an edit/view button to the card footer's
>   `.card-actions-left` and a `.task-time` element to the card header. Keep
>   phase 4's nav arrows and phase 3's badge.
> - `js/events.js` / `index.html` / `js/main.js`: additive wiring only.
> - Load order in `index.html`: `utils.js` right after `state.js`; `modals.js`
>   before `render.js`.

## 1. `js/utils.js` (new) — time formatting
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

## 2. `js/modals.js` (new) — open/close + async confirm
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

## 3. `index.html` — modal markup (place before the scripts)
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

## 4. `js/tasks.js` — edit + confirmed delete
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

## 5. `js/render.js` — edit button, timestamp, live refresh
- In the card header, add `<span class="task-time">${formatRelativeTime(task.createdAt)}</span>`.
- In the footer, add a `.card-actions-left` group with an edit/view button:
  ```html
  <button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="Edit Task"><i class="fas fa-pencil-alt"></i></button>
  ```
  For Done tasks, use the expand icon (`fa-expand-alt`) and title "View Task".
- Add `renderTimestampsOnly()` that updates each card's `.task-time` text without
  a full re-render.

## 6. `js/events.js` + `js/main.js`
- Wire `#saveEditBtn` → `saveEditedTask`; update `#taskTitleCounter` /
  `#taskDescCounter` on input.
- In `main.js`, add `setInterval(renderTimestampsOnly, 30000);`.

## 7. `css/styles.css` — modal + form styles (append)
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

## Acceptance criteria
- Clicking a card's edit button opens a prefilled modal; saving updates the card
  and sets `editedAt`.
- Done tasks open read-only with Save hidden.
- Modal shows created/last-edited times; cards show a relative time that refreshes.
- Deleting prompts a confirmation dialog and only deletes on confirm.

## Open the app and verify (quick check, do not skip)
When you finish this phase, **open `start/index.html` and click one card to open the edit modal** and confirm it shows the task's details. That single action is all the on-screen testing you need; correctness is already covered by the acceptance criteria above, so don't run full end-to-end testing. We optimize for speed at every step. While you're there, confirm the colors match the brand palette from the `:root` design tokens (aqua `--primary` with dark text on aqua, and the tri-color title) with no new colors. If you changed the shape of saved data, run `localStorage.removeItem('daily-task-tracker')` in the console and refresh to reseed.
