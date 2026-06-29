-- Migration 0002 (down): drop kanban tasks.

BEGIN;

DROP TRIGGER IF EXISTS tasks_set_updated_at ON tasks;
DROP TABLE IF EXISTS tasks;

COMMIT;
