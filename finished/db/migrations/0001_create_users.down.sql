-- Migration 0001 (down): drop secure user profiles.

BEGIN;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
DROP TABLE IF EXISTS users;

-- set_updated_at() is shared by later migrations; only drop it once no table
-- depends on it. It is safe to leave in place, but we drop it here for a clean
-- teardown of the initial schema.
DROP FUNCTION IF EXISTS set_updated_at();

COMMIT;
