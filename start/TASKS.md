# Daily Task Tracker — task checklist

Work top to bottom. For each step: copy the **prompt** into your agent, let it
build (it follows the matching skill in `.devin/skills/`), then **refresh
`index.html`** in your browser and tick the box. ✅

A few phases can be done in parallel — that's noted next to each.

> Reset the board anytime: run `localStorage.removeItem('daily-task-tracker')` in the
> browser console, then refresh.

---

- [ ] **Phase 1 — Basic To-Do List** · _start here_

  > Build the first version of my Daily Task Tracker: a simple to-do list where I can add a task, see all my tasks listed, delete any task, and have them saved in the browser so they persist after a refresh.

- [ ] **Phase 2 — Visual Design System** · _after 1 · parallel with 3_

  > Give my Daily Task Tracker a polished visual redesign — proper font, a clean color palette, a centered app card with a branded "Daily Task Tracker" header, and nicely styled inputs and task cards — without changing any functionality.

- [ ] **Phase 3 — Priority & Description** · _after 1 · parallel with 2_

  > Let me set a priority (Low/Medium/High) and an optional description when adding a task, and show a color-coded priority badge and the description on each task card.

- [ ] **Phase 4 — Kanban Board & Status** · _after 2 & 3_

  > Turn my list into a three-column Kanban board (To Do, In Progress, Done) where tasks move between columns through a To Do → In Progress → Done workflow.

- [ ] **Phase 5 — Edit & Details Modal** · _after 4 · parallel with 6 & 7_

  > Add an edit/details modal so I can click a card to view or edit its title, priority, and description, with created and last-edited timestamps and a confirmation prompt before deleting.

- [ ] **Phase 6 — Search, Filter & Sort** · _after 4 · parallel with 5 & 7_

  > Add header controls to search tasks by text, filter them by priority, and sort them across the board.

- [ ] **Phase 7 — Power Interactions** · _after 4 · parallel with 5 & 6_

  > Add power-user interactions: drag-and-drop between columns, a right-click context menu, a clickable priority badge, toast notifications, bulk board actions, and mobile column tabs.

- [ ] **Phase 8 — Run with Devin** · _after 5, 6 & 7 · final_

  > Add an optional "Run with Devin" integration that starts a real Devin session from a To Do card via a small zero-dependency Node server, moving the task to In Progress and then Done as the session progresses.
