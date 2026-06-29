-- Migration 0001 (up): secure user profiles
--
-- Establishes the `users` table that owns every task and history record.
-- Security notes:
--   * Only a password *hash* is ever stored (never plaintext); the column is
--     named accordingly and sized for modern algorithms (bcrypt/argon2/scrypt).
--   * Email and username are normalised to lower case via CHECK constraints so
--     uniqueness is case-insensitive and cannot be bypassed by casing.
--   * `failed_login_attempts` / `locked_until` support brute-force lockout.

BEGIN;

-- pgcrypto provides gen_random_uuid() for UUID primary keys.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                 TEXT NOT NULL,
    username              TEXT NOT NULL,
    -- Hash + algorithm metadata. Never store the raw password.
    password_hash         TEXT NOT NULL,
    password_algo         TEXT NOT NULL DEFAULT 'argon2id',
    full_name             TEXT,
    avatar_url            TEXT,
    role                  TEXT NOT NULL DEFAULT 'member'
                              CHECK (role IN ('member', 'admin')),
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified_at     TIMESTAMPTZ,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0
                              CHECK (failed_login_attempts >= 0),
    locked_until          TIMESTAMPTZ,
    last_login_at         TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Normalise identifiers to lower case so uniqueness is case-insensitive.
    CONSTRAINT users_email_lowercase    CHECK (email = lower(email)),
    CONSTRAINT users_username_lowercase CHECK (username = lower(username)),
    CONSTRAINT users_email_format       CHECK (email LIKE '%_@_%.__%'),
    CONSTRAINT users_username_length    CHECK (char_length(username) BETWEEN 3 AND 32)
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_key    ON users (email);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users (username);

-- Keep updated_at in sync on every UPDATE.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMIT;
