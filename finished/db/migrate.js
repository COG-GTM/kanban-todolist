#!/usr/bin/env node
// ==========================================================================
// Zero-dependency migration runner for the kanban-todolist database.
//
// Applies the plain-SQL migrations in ./migrations against a PostgreSQL
// database by shelling out to `psql` (no node DB driver required, matching
// the rest of this repo's zero-dependency approach).
//
// Usage:
//   DATABASE_URL=postgres://user:pass@host:5432/db node db/migrate.js up
//   DATABASE_URL=postgres://user:pass@host:5432/db node db/migrate.js down   # roll back the last batch
//   DATABASE_URL=postgres://user:pass@host:5432/db node db/migrate.js status
//
// Migration files are named NNNN_name.up.sql / NNNN_name.down.sql. Applied
// versions are tracked in the schema_migrations table.
// ==========================================================================

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const DATABASE_URL = process.env.DATABASE_URL || '';

function fail(msg) {
    console.error('migrate: ' + msg);
    process.exit(1);
}

if (!DATABASE_URL) fail('DATABASE_URL environment variable is required.');

// Run a SQL string through psql; returns trimmed stdout. Exits on error.
function psql(sql, { quiet = false } = {}) {
    const res = spawnSync(
        'psql',
        [DATABASE_URL, '-v', 'ON_ERROR_STOP=1', '-X', '-q', '-t', '-A', '-c', sql],
        { encoding: 'utf8' }
    );
    if (res.error) fail('could not run psql (is it installed and on PATH?): ' + res.error.message);
    if (res.status !== 0) {
        if (!quiet) process.stderr.write(res.stderr || '');
        fail('psql exited with code ' + res.status);
    }
    return (res.stdout || '').trim();
}

// Run a full .sql file through psql.
function psqlFile(file) {
    const res = spawnSync(
        'psql',
        [DATABASE_URL, '-v', 'ON_ERROR_STOP=1', '-X', '-q', '-f', file],
        { encoding: 'utf8' }
    );
    if (res.error) fail('could not run psql: ' + res.error.message);
    if (res.status !== 0) {
        process.stderr.write(res.stderr || '');
        fail('migration failed: ' + path.basename(file));
    }
}

function ensureMigrationsTable() {
    psql(`CREATE TABLE IF NOT EXISTS schema_migrations (
        version    TEXT PRIMARY KEY,
        batch      INTEGER NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );`);
}

// Discover migrations on disk, grouped by version (the NNNN_name prefix).
function discover() {
    if (!fs.existsSync(MIGRATIONS_DIR)) fail('migrations directory not found: ' + MIGRATIONS_DIR);
    const byVersion = new Map();
    for (const f of fs.readdirSync(MIGRATIONS_DIR).sort()) {
        const m = f.match(/^(\d+_[^.]+)\.(up|down)\.sql$/);
        if (!m) continue;
        const [, version, dir] = m;
        if (!byVersion.has(version)) byVersion.set(version, {});
        byVersion.get(version)[dir] = path.join(MIGRATIONS_DIR, f);
    }
    return [...byVersion.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([version, files]) => ({ version, ...files }));
}

function appliedVersions() {
    const out = psql('SELECT version FROM schema_migrations ORDER BY version;');
    return out ? out.split('\n').map((s) => s.trim()).filter(Boolean) : [];
}

function maxBatch() {
    const out = psql('SELECT COALESCE(MAX(batch), 0) FROM schema_migrations;');
    return parseInt(out, 10) || 0;
}

function up() {
    ensureMigrationsTable();
    const applied = new Set(appliedVersions());
    const pending = discover().filter((m) => !applied.has(m.version));
    if (pending.length === 0) {
        console.log('migrate: nothing to do; database is up to date.');
        return;
    }
    const batch = maxBatch() + 1;
    for (const m of pending) {
        if (!m.up) fail('missing .up.sql for ' + m.version);
        console.log('migrate: applying ' + m.version);
        psqlFile(m.up);
        psql(`INSERT INTO schema_migrations (version, batch) VALUES ('${m.version}', ${batch});`);
    }
    console.log(`migrate: applied ${pending.length} migration(s) in batch ${batch}.`);
}

function down() {
    ensureMigrationsTable();
    const batch = maxBatch();
    if (batch === 0) {
        console.log('migrate: nothing to roll back.');
        return;
    }
    const out = psql(`SELECT version FROM schema_migrations WHERE batch = ${batch} ORDER BY version DESC;`);
    const versions = out ? out.split('\n').map((s) => s.trim()).filter(Boolean) : [];
    const onDisk = new Map(discover().map((m) => [m.version, m]));
    for (const version of versions) {
        const m = onDisk.get(version);
        if (!m || !m.down) fail('missing .down.sql for ' + version);
        console.log('migrate: reverting ' + version);
        psqlFile(m.down);
        psql(`DELETE FROM schema_migrations WHERE version = '${version}';`);
    }
    console.log(`migrate: rolled back batch ${batch} (${versions.length} migration(s)).`);
}

function status() {
    ensureMigrationsTable();
    const applied = new Set(appliedVersions());
    console.log('Migration status:');
    for (const m of discover()) {
        console.log(`  [${applied.has(m.version) ? 'x' : ' '}] ${m.version}`);
    }
}

const cmd = process.argv[2] || 'up';
if (cmd === 'up') up();
else if (cmd === 'down') down();
else if (cmd === 'status') status();
else fail(`unknown command '${cmd}'. Use: up | down | status`);
