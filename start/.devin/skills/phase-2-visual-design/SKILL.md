---
name: phase-2-visual-design
description: Workshop Phase 2 implementation guide. Apply the polished SaaS visual design system — Plus Jakarta Sans font, FontAwesome, CSS design tokens (custom properties), the centered app-card shell, branded header/logo, styled inline add bar, and task cards. Use when the request is to restyle/redesign the Daily Task Tracker's look without changing behavior.
triggers:
  - user
  - model
allowed-tools:
  - read
  - edit
  - grep
  - glob
---

# Phase 2 — Visual Design System

Make the app look like a polished product. This phase is **visual only** — do not
change any logic, data, or function names. You mainly rewrite `css/styles.css`
and adjust `index.html` markup/classes so the styles have hooks to attach to.

## Baseline (assumed state)
Phase 1 is done: a working single-column list with `#todoTitleInput`,
`#addTodoBtn`, `#taskList`, and the modular `js/` files.

> **Heads up:** Phase 3 (the next phase) will add a priority `<select>` +
> description `<textarea>` to the add bar and badges/descriptions on cards. Style
> defensively so your layout looks right with just a title input now and still
> holds up once those elements are added in the next phase.

## 1. `index.html` — add fonts/icons and the app shell

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
      <div class="header-controls"><!-- search/filter/sort land here in phase 6 --></div>
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
- Keep the list container `<div id="taskList"></div>` (phase 4 replaces it with
  the board). You may wrap it in a `<main>` for layout.

## 2. `css/styles.css` — the design system (rewrite this file)

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
    /* Priority colors (used by phase 3+) */
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

## 3. `js/render.js` — only if needed for styling hooks
You may update `render()` so each task row uses `class="task-card"` and the title
uses `class="task-title"`, and render the delete button as an icon
(`<i class="fas fa-trash-alt"></i>`). Do **not** change the add/delete logic or
the `localStorage` contract.

## Acceptance criteria
- App is centered in a rounded white `.app-card` with the **todo**list logo header.
- Plus Jakarta Sans + FontAwesome load and render.
- The `:root` design tokens exist and are used (no hard-coded duplicate colors).
- Add bar and task cards look polished; **add / delete / persistence are unchanged**.
- Opening `index.html` directly in a browser still works (no build step).

## Open the app and verify (quick check, do not skip)
When you finish this phase, **open `start/index.html` and glance at the styled add bar and one task card** to confirm the new design renders. That single look is all the on-screen testing you need; correctness is already covered by the acceptance criteria above, so don't run full end-to-end testing. We optimize for speed at every step. While you're there, confirm the colors match the brand palette from the `:root` design tokens (aqua `--primary` with dark text on aqua, and the tri-color title) with no new colors. If you changed the shape of saved data, run `localStorage.removeItem('daily-task-tracker')` in the console and refresh to reseed.
