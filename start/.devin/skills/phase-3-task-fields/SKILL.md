---
name: phase-3-task-fields
description: Workshop Phase 3 implementation guide. Add priority (low/medium/high) and an optional description to tasks — form controls with character counters, an expanding description row, and color-coded priority badges plus description text on task cards. Use when the request is to add priority levels and/or descriptions to todo tasks.
triggers:
  - user
  - model
allowed-tools:
  - read
  - edit
  - grep
  - glob
---

# Phase 3 — Priority & Description

Extend tasks with a **priority** and an optional **description**, surface them in
the add bar (with counters) and on each task card (badge + description).

## Baseline (assumed state)
Phases 1 and 2 are done: a working, styled single-column list saved to
`localStorage`.

> **Integration notes (shared files):**
> - `index.html` add bar: you add a priority `<select>`, a description
>   `<textarea>`, and counters. Insert them into the existing `.add-todo-card` /
>   `.row-right-group` if phase 2's markup is present; otherwise add them next to
>   the existing `#todoTitleInput` / `#addTodoBtn`.
> - `js/render.js`: you add badge + description markup to each task card. Keep
>   any `.task-card` / `.task-title` classes phase 2 introduced.
> - `css/styles.css`: only **append** the small priority/description rules below;
>   don't remove phase 2's styles. Use the priority `--priority-*` tokens (define
>   them in `:root` if phase 2 hasn't yet).

## 1. `js/state.js` — extend the task shape
Task shape becomes (keep existing field names; add the two new ones):
```js
{ id, title, desc, priority, createdAt }
```
Default `priority: 'low'` and `desc: ''` when creating a task.

## 2. `index.html` — add the fields to the add bar
Inside the add bar's `.row-right-group` (or beside the title input), add:
```html
<span id="titleCounter" class="char-counter">40 left</span>
<div class="priority-select-wrapper">
    <label for="todoPriorityInput">Priority:</label>
    <select id="todoPriorityInput" class="select-filter" style="padding: 4px 6px;">
        <option value="low" selected>Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
    </select>
</div>
```
And add a collapsible description row inside `.add-todo-card`, after `.add-todo-main-row`:
```html
<div class="add-todo-desc-row">
    <textarea id="todoDescInput" class="desc-textarea-field" placeholder="Add description (optional)..." maxlength="150"></textarea>
    <div id="descCounter" class="desc-char-counter">150 left</div>
</div>
```
Set `minlength="3" maxlength="40"` on `#todoTitleInput`.

## 3. `js/tasks.js` — read + validate the new fields
In `addNewTodo()`:
- Read `#todoPriorityInput` (`.value`) and `#todoDescInput` (`.value.trim()`).
- Validate: title length `>= 3` and `<= 40`; description `<= 150`. On failure,
  alert/notify and return (a real toast arrives in phase 7 — `alert()` is fine
  for now, or call `showToast` if it already exists).
- Build the task with `priority` and `desc`, save, render, and reset the inputs
  (set priority back to `low`, clear description, reset both counters).

## 4. `js/render.js` — show badge + description on cards
When building each card:
- Add the priority class to the card: `class="task-card priority-${task.priority}"`.
- In the card header, render a clickable-looking badge:
  ```html
  <span class="badge-priority ${task.priority}">${task.priority}</span>
  ```
- Render the description (with a muted fallback when empty):
  ```html
  <p class="task-desc-excerpt">${task.desc}</p>
  <!-- or, when empty: -->
  <p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>
  ```

## 5. `js/events.js` — counters + expand-on-focus
In `setupEventListeners()`:
- On `#todoTitleInput` `input`: update `#titleCounter` to `${40 - len} left`.
- On `#todoDescInput` `input`: update `#descCounter` to `${150 - len} left`.
- On `#todoTitleInput` `focus`: add the `expanded` class to `#addTodoCard` so the
  description row reveals; collapse it again when the user clicks outside and both
  fields are empty.

## 6. `css/styles.css` — append priority + description styles
Add (only if not already present):
```css
.task-card.priority-low    { border-left: 4px solid var(--priority-low-border); }
.task-card.priority-medium { border-left: 4px solid var(--priority-medium-border); }
.task-card.priority-high   { border-left: 4px solid var(--priority-high-border); }

.badge-priority { font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:6px;
    text-transform:uppercase; letter-spacing:0.2px; cursor:pointer; }
.badge-priority.low    { background:var(--priority-low-bg);    color:var(--priority-low-text); }
.badge-priority.medium { background:var(--priority-medium-bg); color:var(--priority-medium-text); }
.badge-priority.high   { background:var(--priority-high-bg);   color:var(--priority-high-text); }

.task-desc-excerpt { font-size:0.78rem; color:var(--text-secondary); line-height:1.4; word-break:break-word; }
.char-counter, .desc-char-counter { font-size:0.75rem; color:var(--text-muted); font-weight:500; }
```
Also add the expanding description row (collapsed by default, revealed via
`.add-todo-card.expanded`):
```css
.add-todo-desc-row { max-height:0; opacity:0; overflow:hidden;
    transition: max-height 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease; }
.add-todo-card.expanded .add-todo-desc-row { max-height:80px; opacity:1; border-top:1px solid var(--border-color); }
.desc-textarea-field { width:100%; border:none; outline:none; resize:none; padding:10px 12px;
    font-size:0.85rem; background:transparent; color:var(--text-secondary); }
```

## Acceptance criteria
- Priority dropdown + description box exist; counters update live.
- The description row reveals on focus and collapses when empty + unfocused.
- Cards show the correct color-coded badge and the description (or fallback).
- `priority` and `desc` persist in `localStorage` and survive a refresh.
- Title min 3 / max 40 and description max 150 are enforced.

## Open the app and verify (quick check, do not skip)
When you finish this phase, **open `start/index.html` and add one task with a priority set** and confirm its colored badge shows on the card. That single action is all the on-screen testing you need; correctness is already covered by the acceptance criteria above, so don't run full end-to-end testing. We optimize for speed at every step. While you're there, confirm the colors match the brand palette from the `:root` design tokens (aqua `--primary` with dark text on aqua, and the tri-color title) with no new colors. If you changed the shape of saved data, run `localStorage.removeItem('daily-task-tracker')` in the console and refresh to reseed.
