# Daily Task Tracker — build it from 0 to 1

A guided, hands-on workshop. You start with a blank screen and, phase by phase,
build a polished **Daily Task Tracker** (a Kanban board) — finishing with an optional "Run with
Devin" integration. You drive an AI coding agent; the agent does the building by
following a backing **skill** for each phase.

## How it works

1. Open `index.html` in your browser. Right now it's just a placeholder — that's
   your **0**.
2. Open **`tasks.html`** in your browser — it's the whole workshop as an
   interactive checklist (or see `TASKS.md` for the markdown version).
3. Copy the **prompt** for the next unchecked phase and give it to your agent.
4. The agent reads `AGENTS.md`, finds the matching skill in `.devin/skills/`, and
   builds the feature.
5. **Refresh `index.html`**, watch your app level up, and tick the box in `tasks.html`. ✅
6. Repeat down the checklist until you reach the finished product.

## The phases

The copy-paste prompts and checkboxes live in [`TASKS.md`](TASKS.md). Work
through them **one at a time, in order** — each phase builds on the one before:

```
  1  Basic to-do list
  2  Visual design
  3  Priority + description
  4  Kanban board & status
  5  Edit modal
  6  Search / filter / sort
  7  Power interactions
  8  Run with Devin
```

| # | Phase | Build |
|---|-------|-------|
| 1 | Basic To-Do List | Add / list / delete tasks, saved in your browser |
| 2 | Visual Design System | Fonts, colors, the polished card UI |
| 3 | Priority & Description | Priority levels + descriptions on tasks |
| 4 | Kanban Board & Status | Three columns: To Do / In Progress / Done |
| 5 | Edit & Details Modal | Click a card to view/edit; timestamps |
| 6 | Search, Filter & Sort | Find and organize tasks |
| 7 | Power Interactions | Drag & drop, right-click menu, toasts, bulk actions |
| 8 | Run with Devin | Kick off a real Devin session from a card |

## Tips

- **Refresh after every phase.** The app is plain HTML/CSS/JS with no build step —
  just open `index.html`. A `package.json` is already included (zero dependencies);
  its `npm start` command only does something once phase 8 adds `server.js`.
- **Stuck or want to reset the data?** Open the browser console and run
  `localStorage.removeItem('daily-task-tracker')`, then refresh.
- **Peek at the answer key.** A complete reference build lives in `../.finished/`.
- **Let the agent route itself.** You generally don't need to tell the agent
  which file to edit — paste the phase's prompt from `TASKS.md` and let
  `AGENTS.md` + the skills do the rest.

Have fun, and watch your blank screen turn into a real product. 🚀
