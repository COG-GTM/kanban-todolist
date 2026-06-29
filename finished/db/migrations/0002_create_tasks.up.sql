-- Migration 0002 (up): kanban tasks owned by users.
--
-- Mirrors the client-side task shape (title, desc, priority, column/status,
-- completed, created/edited timestamps) and adds a foreign key to `users`.
-- Field limits match the front-end validation in js/tasks.js
-- (title 3-40 chars, description <= 150 chars).

BEGIN;

CREATE TABLE IF NOT EXISTS tasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    title       TEXT NOT NULL
                    CHECK (char_length(title) BETWEEN 3 AND 40),
    description TEXT NOT NULL DEFAULT ''
                    CHECK (char_length(description) <= 150),
    priority    TEXT NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low', 'medium', 'high')),
    -- "column" on the board: To Do / In Progress / Done.
    status      TEXT NOT NULL DEFAULT 'todo'
                    CHECK (status IN ('todo', 'progress', 'done')),
    completed   BOOLEAN NOT NULL DEFAULT FALSE,
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    edited_at   TIMESTAMPTZ,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Relational foreign key: a task belongs to exactly one user. Deleting a
    -- user removes their tasks (and, transitively, their task history).
    CONSTRAINT tasks_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    -- A "done" task must be completed and vice-versa, keeping the board column
    -- and the completed flag consistent.
    CONSTRAINT tasks_done_implies_completed
        CHECK ((status = 'done') = completed)
);

CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks (user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx  ON tasks (user_id, status);

CREATE TRIGGER tasks_set_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMIT;
