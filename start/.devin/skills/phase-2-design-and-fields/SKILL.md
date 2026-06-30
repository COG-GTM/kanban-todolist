---
name: phase-2-design-and-fields
description: Workshop Phase 2 implementation guide. Apply the polished SaaS visual design system (Plus Jakarta Sans font, FontAwesome, CSS design tokens, centered app-card shell, branded tri-color logo, styled inline add bar and task cards) AND add task priority (low/medium/high) plus an optional description (form controls with character counters, an expanding description row, color-coded priority badges and description text on cards). Use when the request is to restyle/redesign the Daily Task Tracker and/or add priority levels and descriptions to tasks.
triggers:
  - user
  - model
allowed-tools:
  - read
  - edit
  - grep
  - glob
---

# Phase 2 — Visual Design + Priority & Description

This phase does two things together: (A) make the app look like a polished
product, and (B) extend tasks with a **priority** and an optional **description**
surfaced in the add bar and on each card. Do the visual work first, then layer
the new fields on top.

## Baseline (assumed state)
Phase 1 is done: a working single-column list with `#todoTitleInput`,
`#addTodoBtn`, `#taskList`, and the modular `js/` files, saved to `localStorage`.

---

# Part A — Visual Design System

Visual only — don't change add/delete logic, data, or function names. You mainly
rewrite `css/styles.css` and adjust `index.html` markup/classes so the styles
have hooks to attach to.

## A1. `index.html` — add fonts/icons and the app shell

In `<head>`, set `<title>Daily Task Tracker</title>` and add (before `css/styles.css`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

Restructure `<body>` into the app shell (keep the existing IDs):
- Outer container: `<div class="app-card" id="appCard"> … </div>`
- Header with logo:
  ```html
  <header class="app-header">
      <div class="logo"><span class="todo-text">Daily</span> <span class="list-text">Task</span> <span class="accent-text">Tracker</span></div>
      <div class="header-controls"><!-- search/filter/sort land here in phase 4 --></div>
  </header>
  ```
- The add bar, wrapped so it can become the inline creator:
  ```html
  <section class="add-todo-wrapper">
      <div class="add-todo-card" id="addTodoCard">
          <div class="add-todo-main-row">
              <input type="text" id="todoTitleInput" class="title-input-field" placeholder="Add a new todo task..." maxlength="40">
              <div class="row-right-group">
                  <button id="addTodoBtn" class="btn-add-submit"><i class="fas fa-plus"></i> Add</button>
              </div>
          </div>
      </div>
  </section>
  ```
- Keep the list container `<div id="taskList"></div>` (phase 3 replaces it with
  the board). You may wrap it in a `<main>` for layout.

## A2. `css/styles.css` — the design system (rewrite this file)

Start with the **design tokens**. Include this `:root` block verbatim — these
variables are referenced by every later phase:

```css
:root {
    /* Surfaces */
    --bg-main: #f8fafc;
    --bg-card: #ffffff;
    --border-color: #e2e8f0;
    --border-focus: #00f2ea;
    /* Typography (slate scale) */
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
    /* Brand: aqua base. The pink accent is used ONLY in the app-title's last word. */
    --primary: #00f2ea;
    --primary-hover: #00cbc4;
    --primary-light: #e0fffe;
    --primary-contrast: #00332f; /* dark text for use on the light aqua primary */
    --accent: #ff0050;
    --accent-hover: #cc0040;
    /* Priority colors (used by the badges in Part B) */
    --priority-low-bg: #f0fdf4;   --priority-low-text: #16a34a;   --priority-low-border: #10b981;
    --priority-medium-bg: #fffbeb; --priority-medium-text: #d97706; --priority-medium-border: #f59e0b;
    --priority-high-bg: #fef2f2;  --priority-high-text: #dc2626;  --priority-high-border: #f43f5e;
    /* Elevation */
    --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05);
    /* Motion */
    --transition-smooth: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

Then implement these pieces precisely (consult `../.finished/css/styles.css`
sections 2–5 and 8 for exact values — match them):

- **Global reset:** `* { box-sizing:border-box; margin:0; padding:0; font-family:'Plus Jakarta Sans', sans-serif; }` with font smoothing.
- **`body`:** flex column, centered horizontally, `background: var(--bg-main)`,
  `color: var(--text-primary)`, full-height (`100dvh`), padded.
- **`.app-card`:** max-width ~1080px, `flex:1`, white background, 1px border,
  `border-radius:16px`, `box-shadow: var(--shadow-lg)`, flex column, `overflow:hidden`.
- **`.app-header`:** padded, bottom border, flex space-between, wraps.
- **`.logo`:** ~1.5rem, weight 800, letter-spacing -0.5px. The title is three
  words, each its own color: `.todo-text` ("Daily") is black `#000000`,
  `.list-text` ("Task") is a slightly darker aqua `#00d6cf`, and `.accent-text`
  ("Tracker") is the pink `var(--accent)`. This tri-color brand title is the
  only place the pink accent appears.
- **Inline add bar** (`.add-todo-wrapper`, `.add-todo-card`, `.add-todo-main-row`,
  `.title-input-field`, `.row-right-group`, `.btn-add-submit`): a white rounded
  card on a slate strip; borderless title input that flexes to fill; an aqua
  `.btn-add-submit` (`var(--primary)` background with **dark** `var(--primary-contrast)`
  text for legibility, hover `--primary-hover`).
  Add `:focus-within` glow on `.add-todo-card`.
- **Task cards:** style each list item as a `.task-card` — white, 1px border,
  `border-radius:10px`, `padding:12px`, `--shadow-sm`, hover raises to
  `--shadow-md`. Title as `.task-title` (weight 600). Style the delete control as
  a small subtle icon button (e.g. `.btn-card-action`).
- **Utilities:** add `.hidden { display:none !important; }`.

## A3. `js/render.js` — only if needed for styling hooks
You may update `render()` so each task row uses `class="task-card"` and the title
uses `class="task-title"`, and render the delete button as an icon
(`<i class="fas fa-trash-alt"></i>`). Do **not** change the add/delete logic or
the `localStorage` contract.

---

# Part B — Priority & Description

Now extend tasks with a **priority** and an optional **description**, surfaced in
the add bar (with counters) and on each task card (badge + description). Only
**append** the new CSS rules below; don't remove Part A's styles.

## B1. `js/state.js` — extend the task shape
Task shape becomes (keep existing field names; add the two new ones):
```js
{ id, title, desc, priority, createdAt }
```
Default `priority: 'low'` and `desc: ''` when creating a task.

## B2. `index.html` — add the fields to the add bar
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

## B3. `js/tasks.js` — read + validate the new fields
In `addNewTodo()`:
- Read `#todoPriorityInput` (`.value`) and `#todoDescInput` (`.value.trim()`).
- Validate: title length `>= 3` and `<= 40`; description `<= 150`. On failure,
  alert/notify and return (a real toast arrives in phase 5 — `alert()` is fine
  for now, or call `showToast` if it already exists).
- Build the task with `priority` and `desc`, save, render, and reset the inputs
  (set priority back to `low`, clear description, reset both counters).

## B4. `js/render.js` — show badge + description on cards
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

## B5. `js/events.js` — counters + expand-on-focus
In `setupEventListeners()`:
- On `#todoTitleInput` `input`: update `#titleCounter` to `${40 - len} left`.
- On `#todoDescInput` `input`: update `#descCounter` to `${150 - len} left`.
- On `#todoTitleInput` `focus`: add the `expanded` class to `#addTodoCard` so the
  description row reveals; collapse it again when the user clicks outside and both
  fields are empty.

## B6. `css/styles.css` — append priority + description styles
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
- App is centered in a rounded white `.app-card` with the tri-color logo header.
- Plus Jakarta Sans + FontAwesome load and render.
- The `:root` design tokens exist and are used (no hard-coded duplicate colors).
- Add bar and task cards look polished; **add / delete / persistence still work**.
- Priority dropdown + description box exist; counters update live.
- The description row reveals on focus and collapses when empty + unfocused.
- Cards show the correct color-coded badge and the description (or fallback).
- `priority` and `desc` persist in `localStorage` and survive a refresh.
- Title min 3 / max 40 and description max 150 are enforced.
- Opening `index.html` directly in a browser still works (no build step).

## Open the app and verify (quick check, do not skip)
**Testing must be extremely minimal and fast: 4 clicks/interactions max.** Do only the one quick check below, then stop. The acceptance criteria above already cover correctness, so don't go further. Speed matters more than coverage here. Don't write a test report or any summary of the check.
When you finish this phase, **open `start/index.html` and add one task with a priority set** and confirm the new design renders and its colored badge shows on the card. That single action is all the on-screen testing you need; correctness is already covered by the acceptance criteria above, so don't run full end-to-end testing. We optimize for speed at every step. While you're there, confirm the colors match the brand palette from the `:root` design tokens (aqua `--primary` with dark text on aqua, and the tri-color title) with no new colors. If you changed the shape of saved data, run `localStorage.removeItem('daily-task-tracker')` in the console and refresh to reseed.
