---
name: phase-7-power-interactions
description: Workshop Phase 7 implementation guide. Add drag-and-drop between columns, a right-click context menu, a clickable priority-badge dropdown, toast notifications, a header Actions menu for bulk operations (load sample data, clean done, clean all), and mobile column tabs. Introduces js/toast.js and js/menus.js. Use when the request is for drag-and-drop, context menus, toasts, bulk actions, or mobile tabs.
triggers:
  - user
  - model
allowed-tools:
  - read
  - edit
  - grep
  - glob
---

# Phase 7 — Power Interactions

Add the desktop-grade interaction layer on top of the **phase-4 board**.

> **Integration notes (shared with phases 5 & 6):**
> - `js/render.js`, `js/events.js`, `index.html` are shared — make **additive**
>   changes (new listeners, new markup), don't rewrite phases 5/6 work.
> - Load order in `index.html`: add `<script src="js/toast.js"></script>` early
>   (after utils, before render) and `<script src="js/menus.js"></script>` before
>   `events.js`.
> - **Toasts retrofit:** earlier phases may use `alert()`/`console` for messages
>   (e.g. the `moveTask` rejection, validation errors). Once `showToast` exists,
>   switch those to `showToast(message, type)`.
> - **Confirmation:** bulk delete actions should use `requestConfirmation` if it
>   exists (phase 5); otherwise fall back to `window.confirm`.

## 1. `js/toast.js` (new) — notifications
`showToast(message, type='info')`: create a `.toast .toast-${type}` element with a
FontAwesome icon (`fa-info-circle` / `fa-check-circle` / `fa-exclamation-triangle`
/ `fa-exclamation-circle` for info/success/warning/error) and the message,
append it to `#toastContainer`, add `.show` after ~50ms, then remove after ~3s.
Add `<div class="toast-container" id="toastContainer"></div>` near the end of
`<body>`. Now sprinkle `showToast(...)` calls into add/move/edit/delete/bulk
actions.

## 2. Drag & drop
In `js/render.js`, for cards **not** in Done, set `card.setAttribute('draggable','true')`
and add listeners:
```js
card.addEventListener('dragstart', (e) => { card.classList.add('dragging'); e.dataTransfer.setData('text/plain', task.id); });
card.addEventListener('dragend',   () => card.classList.remove('dragging'));
```
In `js/events.js`, for every `.board-column`:
```js
col.addEventListener('dragover',  (e) => { e.preventDefault(); col.classList.add('drag-over'); });
col.addEventListener('dragleave', ()  => col.classList.remove('drag-over'));
col.addEventListener('drop', (e) => {
    e.preventDefault();
    col.classList.remove('drag-over');
    moveTask(e.dataTransfer.getData('text/plain'), col.getAttribute('data-column'));
});
```
`moveTask` already enforces the workflow rules — dropping To Do → Done is rejected.

## 3. Right-click context menu (`js/menus.js`)
Add markup `<div class="custom-context-menu hidden" id="contextMenu">` with items
(ids in parens): View Details (`ctxView`), Edit Task (`ctxEdit`), a divider, Move
to To Do (`ctxMoveTodo`), Move to Progress (`ctxMoveProgress`), Move to Done
(`ctxMoveDone`), a divider, Delete Task (`ctxDelete`, class `danger`). Use
`.context-menu-item` / `.context-divider`.

Implement:
- `showContextMenu(x, y, taskId)`: position near the cursor (clamp to viewport),
  unhide the menu, enable/disable move items based on the task's current column
  (e.g. To Do disables "Move to To Do" and "Move to Done"; Done disables Edit and
  "Move to Done"), and wire each item's `onclick` to the right action
  (`openViewModal`/`openEditModal` if they exist, `moveTask`, `deleteTask`), each
  calling `hideContextMenu()` after.
- `hideContextMenu()`: add `hidden`.
- In `js/render.js`, add to each card:
  `card.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); showContextMenu(e.clientX, e.clientY, task.id); });`

## 4. Clickable priority badge dropdown (`js/menus.js`)
Add markup `<div class="badge-dropdown-menu hidden" id="badgePriorityMenu">` with
three `.badge-dropdown-item` entries (`data-priority` low/medium/high).
- Make the card badge call `openBadgePriorityMenu(event, '${task.id}')` (update
  the `.badge-priority` in `render.js` to add this `onclick`).
- `openBadgePriorityMenu(event, taskId)`: block for Done tasks (notify + return),
  position the menu under the badge, unhide it, and wire each item to
  `changeTaskPriorityDirectly(taskId, newPriority)`.
- `changeTaskPriorityDirectly(taskId, p)`: set priority, set `editedAt`, save,
  render, toast.
- `hideBadgePriorityMenu()`: add `hidden`. Hide both menus on any outside click.

## 5. Header Actions menu + bulk operations
In the header, replace the empty actions area with:
```html
<div class="header-actions-dropdown">
    <button id="headerActionsBtn" class="btn-bulk-neutral" title="Board actions"><i class="fas fa-ellipsis-h"></i> Actions</button>
    <div class="header-actions-menu hidden" id="headerActionsMenu">
        <div class="context-menu-item" id="actLoadDemo"><i class="fas fa-wand-magic-sparkles"></i> Load Sample Data</div>
        <div class="context-divider"></div>
        <div class="context-menu-item" id="actCleanDone"><i class="fas fa-check-double"></i> Clean Done</div>
        <div class="context-menu-item danger" id="actCleanAll"><i class="fas fa-trash-alt"></i> Clean All</div>
    </div>
</div>
```
In `js/state.js` add `function loadDemoData() { state.tasks = createDemoTasks(); saveToStorage(); }`.
In `js/events.js`: toggle the menu on button click (and close on outside click), then wire:
- `actLoadDemo` → confirm → `loadDemoData()` + render + toast.
- `actCleanDone` → confirm → remove `t.completed` tasks + save + render + toast.
- `actCleanAll` → confirm → `state.tasks = []` + save + render + toast.

## 6. Mobile tabs
Add `state.activeTab = 'todo'` to state. Add a tabs nav after the add bar:
```html
<nav class="mobile-board-tabs" id="mobileTabs">
    <button class="mobile-tab-btn active" data-tab="todo">To Do <span class="badge" id="todoTabBadge">0</span></button>
    <button class="mobile-tab-btn" data-tab="progress">In Progress <span class="badge" id="progressTabBadge">0</span></button>
    <button class="mobile-tab-btn" data-tab="done">Done <span class="badge" id="doneTabBadge">0</span></button>
</nav>
```
Add `class="active-tab"` to the To Do `.board-column` by default. In `render()`,
also update `#todoTabBadge/#progressTabBadge/#doneTabBadge` with the column
counts. In `events.js`, clicking a tab toggles `.active` on the buttons and
`.active-tab` on the matching `.board-column`, and sets `state.activeTab`.

## 7. `css/styles.css` — append the interaction styles
Match `../.finished/css/styles.css` sections 6 (mobile tabs), 9 (badge dropdown),
10 (context menu), 12 (toasts), the header Actions menu + `.btn-bulk-neutral`,
plus `.task-card.dragging { opacity:0.4; }`, `.board-column.drag-over` (indigo
border + tint), and the section-14 mobile media query (`@media (max-width:768px)`)
that shows `.mobile-board-tabs` and hides non-`active-tab` columns.

## Acceptance criteria
- Cards drag between columns; invalid moves (To Do→Done) are rejected; dragging styles show.
- Right-click opens a context-aware menu; actions work and the menu closes after.
- Clicking a badge changes priority via the dropdown (blocked on Done tasks).
- Actions produce toasts; the Actions menu's bulk ops work with confirmation.
- Narrow windows show mobile tabs that switch the visible column.

## Open the app and verify (quick check, do not skip)
When you finish this phase, **open `start/index.html` and right-click a card to open the context menu** (or drag one card to another column) and confirm it works. That single action is all the on-screen testing you need; correctness is already covered by the acceptance criteria above, so don't run full end-to-end testing. We optimize for speed at every step. While you're there, confirm the colors match the brand palette from the `:root` design tokens (aqua `--primary` with dark text on aqua, and the tri-color title) with no new colors. If you changed the shape of saved data, run `localStorage.removeItem('daily-task-tracker')` in the console and refresh to reseed.
