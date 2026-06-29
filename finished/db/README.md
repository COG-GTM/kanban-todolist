# Database migrations

Initial PostgreSQL schema for the kanban-todolist. The app today persists state
in the browser (`localStorage`); these migrations define the server-side schema
that a future multi-user backend would use to store the same data durably.

## Schema overview

```
users ──< tasks ──< task_history
  │                     │
  └─────────────────────┘  (task_history.actor_id → users.id)
```

| Table          | Purpose                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `users`        | Secure user profiles. Stores only password **hashes**, supports email   |
|                | verification and brute-force lockout. Case-insensitive unique email/username. |
| `tasks`        | Kanban cards owned by a user. Mirrors the client task shape (title,     |
|                | description, priority, status/column, completed, timestamps).           |
| `task_history` | Append-only audit log of task changes (created/updated/moved/…), with   |
|                | old→new field diffs and a full JSONB snapshot per event.                |

### Foreign keys

- `tasks.user_id → users.id` — `ON DELETE CASCADE` (deleting a user removes their tasks).
- `task_history.task_id → tasks.id` — `ON DELETE CASCADE` (history dies with its task).
- `task_history.actor_id → users.id` — `ON DELETE SET NULL` (keep the audit row even if the actor is removed).

## Files

Each migration is a pair of plain-SQL files so it can be applied with any tool
(or by hand) and rolled back deterministically:

```
migrations/
  0001_create_users.up.sql        0001_create_users.down.sql
  0002_create_tasks.up.sql        0002_create_tasks.down.sql
  0003_create_task_history.up.sql 0003_create_task_history.down.sql
```

## Running

A small zero-dependency runner (`migrate.js`) applies them via `psql`:

```bash
export DATABASE_URL=postgres://user:pass@localhost:5432/kanban
node db/migrate.js up        # apply all pending migrations
node db/migrate.js status    # list applied / pending migrations
node db/migrate.js down      # roll back the most recent batch
```

Applied versions are tracked in a `schema_migrations` table. The runner requires
the `psql` client to be installed and on `PATH`; the SQL files themselves are
plain PostgreSQL and can be applied with any other migration tool if preferred.
