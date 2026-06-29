-- Migration 0003 (down): drop task history logs.

BEGIN;

DROP TABLE IF EXISTS task_history;

COMMIT;
