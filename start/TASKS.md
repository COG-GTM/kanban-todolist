# Daily Task Tracker — task checklist

Work top to bottom, **one phase at a time**. For each step: copy the **prompt**
into your agent, let it build (it follows the matching skill in `.devin/skills/`),
then **refresh `index.html`** in your browser and tick the box. ✅ Each phase
builds on the one before, so finish them in order.

> Reset the board anytime: run `localStorage.removeItem('daily-task-tracker')` in the
> browser console, then refresh.

---

- [ ] **Phase 1 — Basic To-Do List** · _start here_

  > Build the first version of my Daily Task Tracker: a simple to-do list where I can add a task, see all my tasks listed, delete any task, and have them saved in the browser so they persist after a refresh.

- [ ] **Phase 2 — Visual Design System** · _builds on 1_

  > Give my Daily Task Tracker a polished visual redesign — proper font, a clean color palette, a centered app card with a branded "Daily Task Tracker" header, and nicely styled inputs and task cards — without changing any functionality.

- [ ] **Phase 3 — Priority & Description** · _builds on 2_

  > Let me set a priority (Low/Medium/High) and an optional description when adding a task, and show a color-coded priority badge and the description on each task card.

- [ ] **Phase 4 — Kanban Board & Status** · _builds on 3_

  > Turn my list into a three-column Kanban board (To Do, In Progress, Done) where tasks move between columns through a To Do → In Progress → Done workflow.

- [ ] **Phase 5 — Edit & Details Modal** · _builds on 4_

  > Add an edit/details modal so I can click a card to view or edit its title, priority, and description, with created and last-edited timestamps and a confirmation prompt before deleting.

- [ ] **Phase 6 — Search, Filter & Sort** · _builds on 5_

  > Add header controls to search tasks by text, filter them by priority, and sort them across the board.

- [ ] **Phase 7 — Power Interactions** · _builds on 6_

  > Add power-user interactions: drag-and-drop between columns, a right-click context menu, a clickable priority badge, toast notifications, bulk board actions, and mobile column tabs.

- [ ] **Phase 8 — Run with Devin** · _builds on 7 · final_

  > Add an optional "Run with Devin" integration that starts a real Devin session from a To Do card via a small zero-dependency Node server, moving the task to In Progress and then Done as the session progresses. I'll provide the Devin API key, org ID, and user email — prompt me to enter them as secrets so they're stored securely and never written into the code or committed to the repo.

  > 🔑 **You'll need three secrets for this phase: a Devin API key, an org ID, and a user email. Ask Wes or Sohan for them.** When your agent asks, paste each one in so it can store them securely — don't type them directly into the code.
