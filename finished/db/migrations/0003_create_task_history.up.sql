-- Migration 0003 (up): task history logs (audit trail).
--
-- Append-only log of every meaningful change to a task: creation, edits,
-- column moves, priority changes, completion and deletion. Each row records
-- who acted, what changed (old -> new), and when.

BEGIN;

CREATE TABLE IF NOT EXISTS task_history (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    task_id     UUID NOT NULL,
    actor_id    UUID,
    action      TEXT NOT NULL
                    CHECK (action IN (
                        'created', 'updated', 'moved',
                        'priority_changed', 'completed', 'reopened', 'deleted'
                    )),
    -- Field-level diff. NULL when not applicable (e.g. 'created'/'deleted').
    field       TEXT,
    old_value   TEXT,
    new_value   TEXT,
    -- Full snapshot of the task at the time of the event, for forensic replay.
    snapshot    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- A history row belongs to one task; removing the task removes its log.
    CONSTRAINT task_history_task_id_fkey
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,

    -- The acting user. Keep the audit row even if the user is later deleted
    -- (set actor_id NULL rather than cascading the delete).
    CONSTRAINT task_history_actor_id_fkey
        FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS task_history_task_id_idx
    ON task_history (task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS task_history_actor_id_idx
    ON task_history (actor_id);

COMMIT;
