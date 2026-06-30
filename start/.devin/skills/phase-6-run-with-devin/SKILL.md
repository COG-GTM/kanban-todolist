---
name: phase-6-run-with-devin
description: Workshop Phase 6 implementation guide. Add the optional "Run with Devin" integration — a zero-dependency Node server (server.js + package.json + .env.example) that proxies the Devin API server-side, plus js/devin.js with a kickoff modal, card buttons, status pills, and global polling that auto-moves tasks to Done. Use when the request is to integrate Devin sessions / the "Run with Devin" feature.
triggers:
  - user
  - model
allowed-tools:
  - read
  - edit
  - grep
  - glob
  - exec
permissions:
  allow:
    - Exec(node)
    - Exec(npm)
---

# Phase 6 — Run with Devin

Add the optional Devin integration on top of the finished board (phases 4+5).
The key requirement: **the Devin API key stays server-side**, and the whole app
must keep working when the server/Devin isn't configured (the Devin UI just hides).

## Architecture
The browser can't call the Devin API directly (it needs a secret key + CORS). So
a tiny Node server serves the static app **and** proxies `/api/devin/*` to the
Devin API, injecting the key from env vars. The frontend (`js/devin.js`) only ever
talks to that local proxy.

## 1. `server.js` (new) — zero-dependency static server + Devin proxy
Use only Node built-ins (`http`, `https`, `fs`, `path`). Requirements:
- Load `.env` (use `process.loadEnvFile` when available, else a tiny parser; real
  env vars win). Read `DEVIN_API_KEY`, `DEVIN_ORG_ID`, `DEVIN_USER_EMAIL`,
  optional `PORT` (default 3000). `DEVIN_HOST = 'api.devin.ai'`.
- `devinEnabled()` → `Boolean(API_KEY && ORG_ID && USER_EMAIL)`.
- Serve static files from this folder with a small MIME map; default `/` →
  `index.html`; block path traversal outside the root.
- Endpoints under `/api/devin`:
  - `GET /api/devin/config` → `{ enabled: devinEnabled() }` (always; never leaks
    the key/org/email).
  - If not enabled, all other `/api/devin/*` return `503` with an explanatory error.
  - `POST /api/devin/sessions` → require `{ prompt }`; resolve the user id for
    `DEVIN_USER_EMAIL` (cache it) and create a session:
    ```js
    // resolve once:
    // GET https://api.devin.ai/v3beta1/organizations/{ORG_ID}/members/users?email={USER_EMAIL}
    // create:
    // POST https://api.devin.ai/v3/organizations/{ORG_ID}/sessions
    //   body: { prompt, create_as_user_id: userId, title?, tags: ['daily-task-tracker'] }
    //   headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
    ```
    Respond `{ session_id, url, status }`.
  - `GET /api/devin/sessions/:id` →
    `GET https://api.devin.ai/v3/organizations/{ORG_ID}/sessions/{id}` and return
    the session JSON.

See `../.finished/server.js` for the full, exact implementation — match it.

## 2. `package.json` (already present)
`package.json` already ships in the project root (it was created with the blank
slate). Don't recreate it — just confirm it has the start script and Node engine:
```json
{
  "name": "daily-task-tracker",
  "version": "1.0.0",
  "private": true,
  "scripts": { "start": "node server.js" },
  "engines": { "node": ">=18" }
}
```
The `start` script points at the `server.js` you create in step 1, so `npm start`
becomes runnable once this phase is done.

## 3. `.env.example` (new)
Document the four vars with comments:
```
DEVIN_API_KEY=cog_your_api_key_here
DEVIN_ORG_ID=org-your_org_id_here
DEVIN_USER_EMAIL=you@yourcompany.com
PORT=3000
```
(Do **not** create a real `.env` or commit secrets.)

> **Getting the secrets from the participant.** You need three values to enable
> the integration: `DEVIN_API_KEY`, `DEVIN_ORG_ID`, and `DEVIN_USER_EMAIL`. Do
> **not** invent or hardcode them. Ask the participant to provide them (they can
> get them from **Wes or Sohan**), and prompt them to hand the values over as
> **secrets** so they're stored securely rather than typed into the chat or code.
> Put them only in a local, git-ignored `.env` (never commit it). If they don't
> have the secrets yet, build everything else — the app fully works with the
> Devin UI hidden — and they can drop the secrets in later.

## 4. `js/devin.js` (new) — frontend integration (talks only to the local proxy)
- Constants: `DEVIN_API_BASE = '/api/devin'`, `DEVIN_POLL_INTERVAL_MS = 8000`, a
  module flag `let devinEnabled = false`, `let devinPollTimer = null`,
  `let devinKickoffTaskId = null`.
- `refreshDevinConfig()`: `fetch('/api/devin/config')`; if `enabled` flips true,
  set the flag and `render()` (so the Devin controls appear). Failures are
  swallowed (file:// / no server) → feature stays hidden.
- `openDevinModal(taskId)` / `closeDevinModal()`: open `#devinModal`, seed
  `#devinPromptInput` from the task title/description, show the task title in
  `#devinModalTaskTitle`. Only allow on To Do tasks without an existing session.
- `confirmDevinKickoff()`: POST `/api/devin/sessions` with `{ prompt, title }`; on
  success store `task.devinSessionId`, `task.devinSessionUrl`, `task.devinStatus`,
  move the task to `progress`, save, render, toast, and start polling.
- `openDevinSession(taskId)`: `window.open(task.devinSessionUrl, '_blank', 'noopener')`.
- Status helpers: `devinStatusLabel(task)`, `isDevinWorking(task)`, and
  `isDevinComplete(status, detail)` — a session is complete on status `exit` /
  `error` / `suspended`, or detail `finished` / `waiting_for_user`.
- `pollDevinSessions()`: for each task with a session not yet in Done, GET its
  status; when complete and still in `progress`, set `completed=true`,
  `column='done'`, toast, and re-render. `startDevinPolling()` sets the interval
  (idempotent).

Match `../.finished/js/devin.js` for exact behavior.

## 5. `index.html`
- Add the **Devin kickoff modal** `id="devinModal"` (`.modal-overlay`) with
  `#devinModalTaskTitle`, a `#devinPromptInput` textarea, and a
  `#devinKickoffBtn` (onclick `confirmDevinKickoff()`).
- Add Devin items to the context menu: a divider `#ctxDevinDivider`, plus
  `#ctxRunDevin` ("Run with Devin") and `#ctxOpenDevin` ("Open Devin session").
- Load `<script src="js/devin.js"></script>` after `events.js` and before `main.js`.

## 6. `js/render.js` — card button + status pill
- When `devinEnabled` and the task is To Do without a session, add a
  `.btn-card-action.btn-devin` (robot icon) → `openDevinModal`. If the task has a
  session, show `.btn-card-action.btn-devin-open` → `openDevinSession`.
- If `task.devinSessionId`, render a `.devin-status-pill` in the card header
  showing `devinStatusLabel(task)` (spinner + `.devin-working` while active;
  clickable to open the session when a URL exists).

## 7. `js/menus.js` + `js/main.js`
- In `showContextMenu`, show `#ctxRunDevin` only when `devinEnabled` && To Do &&
  no session; show `#ctxOpenDevin` when the task has a session URL; toggle
  `#ctxDevinDivider` accordingly; wire their `onclick`s.
- In `main.js` bootstrap, call `refreshDevinConfig()`, `startDevinPolling()`, and
  `pollDevinSessions()`.

## 8. `css/styles.css` — append
Add `.devin-status-pill` (+ state variants `devin-finished`/`devin-complete`,
`devin-error`/`devin-suspended`, `devin-waiting`/`devin-blocked`, plus
`.devin-working` pulse animation and `.devin-clickable`) and
`.btn-card-action.btn-devin` / `.btn-devin-open`. Also style `#devinPromptInput`
(`resize: vertical`). See `../.finished/css/styles.css`.

## Verify
- `node -c server.js` parses with no syntax error.
- `npm start` (no env) serves http://localhost:3000; `/api/devin/config` returns
  `{ "enabled": false }`; the board works and the Devin UI is hidden.
- With all three env vars set, To Do cards show the robot button and a session can
  be created (don't hardcode any secrets — read from env/.env only).

## Acceptance criteria
- The app runs both by opening `index.html` (Devin hidden) and via `npm start`.
- The API key never reaches the client; `/api/devin/config` only exposes `enabled`.
- Starting a session moves the task to In Progress with a pill; completion
  auto-moves it to Done; "Open Devin session" works.

## Open the app and verify (quick check, do not skip)
**Testing must be extremely minimal and fast: 4 clicks/interactions max.** Do only the one quick check below, then stop. The acceptance criteria above already cover correctness, so don't go further. Speed matters more than coverage here. Don't write a test report or any summary of the check.
Phase 6 needs the local server. From `start/`, run `npm start`, open **http://localhost:3000** (opening `index.html` as a `file://` will not reach the `/api/devin` proxy), and do one quick check: confirm the board renders and, with a valid `.env` (copy `.env.example`), the robot “Run with Devin” button appears on a To Do card. That single check is all the on-screen testing you need; correctness is already covered by the acceptance criteria above, so don't run full end-to-end testing. We optimize for speed at every step. The colors should still match the brand palette (aqua `--primary`, tri-color title) with no new colors.
