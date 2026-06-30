# AGENTS.md — Daily Task Tracker workshop

This project is a hands-on workshop. You (the agent) help a participant build the
Daily Task Tracker (a Kanban to-do app) from a blank slate up to a polished
product, one phase at a time. The phases are a single checklist in `TASKS.md`.

## THE GOLDEN RULE: always check for a skill first

> **For ANY feature request or task in this project, your FIRST step is to look
> for a matching skill in `.devin/skills/`.**

Each workshop phase has a backing skill (`phase-1-*` … `phase-8-*`) that contains
the precise, authoritative implementation guide for that feature. When a
participant gives you a prompt (usually pasted from `TASKS.md`):

1. **Discover skills.** Read the `SKILL.md` files under `.devin/skills/` directly
   — list `.devin/skills/*/SKILL.md` with your file tools and open the matching
   one. (This always works regardless of your toolset.) If your agent happens to
   have a `skill` tool you may use it instead — `command: "list"`/`"search"` with
   `path: "."`, or invoke a skill by name like `phase-4-kanban-board` — but don't
   depend on it.
2. **Match the request to a skill.** Pick the phase skill whose `description`
   matches what was asked (e.g. "add a Kanban board" → `phase-4-kanban-board`).
3. **Follow that skill precisely.** It is the source of truth: file layout,
   exact element IDs / class names / function names, data shapes, and acceptance
   criteria. Honoring those exact names is what keeps later phases working.
   A skill's specific instructions (e.g. "replace this file") always win over the
   general conventions below.
4. **If NO skill matches the request, build it from scratch** following the
   conventions below. Don't block waiting for a skill that doesn't exist.

## How the workshop is structured

Phases are completed in this order (a few can be done in parallel):

```
        1                 Basic to-do list (foundation)
       / \
      2   3               2: Visual design   3: Priority + description   (parallel)
       \ /
        4                 Kanban board & status workflow (merges 2 + 3)
      / | \
     5  6  7              5: Edit modal   6: Search/filter/sort   7: Power interactions (parallel)
      \ | /
        8                 Run with Devin (final)
```

- A phase that lists "Depends on" must be done after those phases.
- Phases in a parallel group (`{2,3}` and `{5,6,7}`) can be built in any order
  or simultaneously; each skill includes **Integration notes** for the files
  they share (`index.html`, `js/render.js`, `js/events.js`).

## Project conventions

Follow these whenever you implement a phase or build something with no skill:

- **Stack:** plain HTML + CSS + vanilla JavaScript. **No build step, no
  frameworks, no bundlers, no npm dependencies.** A `package.json` ships in the
  blank slate, but it has **zero dependencies** — its only `npm start` script runs
  the zero-dependency Node server that you create in phase 8 (`server.js`). Until
  then, just open `index.html` directly.
- **File layout** (built up progressively to mirror the final app):
  ```
  package.json        # ships in the blank slate; `npm start` runs server.js (phase 8)
  index.html          # markup; links the stylesheet and scripts
  css/styles.css      # all styles
  js/state.js         # app state, demo seed data, localStorage load/save
  js/utils.js         # date/time formatting helpers
  js/toast.js         # toast notifications
  js/modals.js        # modal open/close + async confirmation dialog
  js/render.js        # board render engine + task card DOM generation
  js/tasks.js         # add / move / edit / delete task logic
  js/menus.js         # right-click context menu + priority badge dropdown
  js/events.js        # event listener wiring
  js/devin.js         # optional "Run with Devin" integration
  js/main.js          # bootstrap on DOMContentLoaded
  ```
- **Scripts are classic (non-module) scripts** loaded in dependency order in
  `index.html`, so the app runs by simply opening `index.html` in a browser
  (no server). Functions are plain globals — do not add `import`/`export` or
  `type="module"`.
- **Persistence:** all state lives in `localStorage` under the key `daily-task-tracker`.
- **Fonts/icons** (from phase 2 on): Google Font "Plus Jakarta Sans" and
  FontAwesome 6.4.0, both via CDN `<link>` tags.
- **Match names exactly.** Element IDs, CSS class names, and function names are
  shared across phases. Use the exact identifiers the skills specify; renaming
  them silently breaks a later phase.
- **Keep edits additive.** Prefer adding new CSS blocks, new functions, and new
  `index.html` sections over rewriting existing ones — **unless a skill explicitly
  says to replace something**, in which case the skill's instruction wins (e.g.
  phase 1 replaces the placeholder `index.html`; phase 4 replaces the single list
  with the board).

## How to run / verify

- **Phases 1–7:** open `index.html` directly in a browser (double-click, or
  drag it into a tab). Refresh after each change. State persists in
  `localStorage`; clear it with `localStorage.removeItem('daily-task-tracker')` in the
  console if you want a clean slate.
- **Phase 8 (Devin):** run the Node server with `npm start` from this folder and
  open http://localhost:3000. Without the env vars configured, every other
  feature still works — the Devin button just stays hidden.

## Reference

A complete, working version of the final app lives in `../finished/` (outside
this workshop folder). Treat it as the answer key: consult it if you're stuck,
but build the app here in `start/` by following the tasks and skills.
