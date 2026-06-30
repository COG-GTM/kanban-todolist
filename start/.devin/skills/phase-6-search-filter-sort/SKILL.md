---
name: phase-6-search-filter-sort
description: Workshop Phase 6 implementation guide. Add header controls for live search (by title/description), priority filtering (all/low/medium/high), and sorting (newest, oldest, highest priority, title A-Z), applied across the Kanban board in render(). Use when the request is to search, filter, or sort tasks.
triggers:
  - user
  - model
allowed-tools:
  - read
  - edit
  - grep
  - glob
---

# Phase 6 — Search, Filter & Sort

Add live search, a priority filter, and a sort selector that apply across the
board. Assumes the **phase-4 board** exists.

> **Integration notes (shared with phases 5 & 7):**
> - `index.html`: add the controls inside the existing `.header-controls` in the
>   header (created in phase 2). Don't remove other controls that may be there.
> - `js/render.js`: insert a filter+sort step at the **top** of `render()` before
>   tasks are fanned into columns; keep the per-column counting/empty-state logic.
> - `js/state.js` / `js/events.js`: additive.

## 1. `index.html` — header controls
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

## 2. `js/state.js` — control state
Add to `state`: `filterPriority: 'all'`, `sortBy: 'date-desc'`, `searchQuery: ''`.
In `loadFromStorage()`, after parsing saved state, force `state.searchQuery = ''`
so search always starts empty on boot.

## 3. `js/render.js` — filter + sort pipeline
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

## 4. `js/events.js` — wire the controls
In `setupEventListeners()`:
```js
document.getElementById('searchInput').addEventListener('input', (e) => { state.searchQuery = e.target.value.trim(); render(); });
document.getElementById('priorityFilter').addEventListener('change', (e) => { state.filterPriority = e.target.value; render(); });
document.getElementById('sortBySelect').addEventListener('change', (e) => { state.sortBy = e.target.value; render(); });
```

## 5. `css/styles.css` — control styles (append, if missing)
Match `../.finished/css/styles.css` section 4:
- `.search-wrapper` (relative) with an absolutely-positioned `i` icon; `.search-input`
  (padded-left for the icon, rounded, ~160px, widening + indigo glow on `:focus`).
- `.select-filter` (rounded select, slate text, indigo border on `:focus`) — it
  may already exist from phase 3's priority dropdown; reuse it.

## Acceptance criteria
- Search filters cards live by title or description; clearing it restores all.
- Priority filter limits visible tasks; "All Priorities" shows everything.
- Each sort option reorders cards correctly within columns.
- Column counts reflect the filtered/searched set.
- Filter + sort selections persist; the search box is empty after every reload.

## Open the app and verify (quick check, do not skip)
When you finish this phase, **open `start/index.html` and type one word in the search box** and confirm the board filters to matching tasks. That single action is all the on-screen testing you need; correctness is already covered by the acceptance criteria above, so don't run full end-to-end testing. We optimize for speed at every step. While you're there, confirm the colors match the brand palette from the `:root` design tokens (aqua `--primary` with dark text on aqua, and the tri-color title) with no new colors. If you changed the shape of saved data, run `localStorage.removeItem('daily-task-tracker')` in the console and refresh to reseed.
