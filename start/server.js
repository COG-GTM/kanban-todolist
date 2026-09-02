const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DEVIN_HOST = 'api.devin.ai';

loadEnv();

const API_KEY = process.env.DEVIN_API_KEY;
const ORG_ID = process.env.DEVIN_ORG_ID;
const USER_EMAIL = process.env.DEVIN_USER_EMAIL;
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const MAX_UPSTREAM_BYTES = 5 * 1024 * 1024;

let cachedUserId = null;

function loadEnv() {
    const envPath = path.join(ROOT, '.env');
    if (!fs.existsSync(envPath)) return;

    if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
        return;
    }

    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eq = trimmed.indexOf('=');
        if (eq === -1) return;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        if (!(key in process.env)) process.env[key] = value;
    });
}

function devinEnabled() {
    return Boolean(API_KEY && ORG_ID && USER_EMAIL);
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body)
    });
    res.end(body);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', chunk => {
            raw += chunk;
            if (raw.length > 1e6) {
                reject(new Error('Request body too large'));
                req.destroy();
            }
        });
        req.on('end', () => {
            if (!raw) return resolve({});
            try {
                resolve(JSON.parse(raw));
            } catch (e) {
                reject(new Error('Invalid JSON body'));
            }
        });
        req.on('error', reject);
    });
}

function devinRequest(method, requestPath, body) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const headers = { Authorization: `Bearer ${API_KEY}` };
        if (payload) {
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = https.request({ host: DEVIN_HOST, method, path: requestPath, headers }, apiRes => {
            let raw = '';
            apiRes.on('data', chunk => {
                raw += chunk;
                if (raw.length > MAX_UPSTREAM_BYTES) {
                    apiRes.destroy();
                    reject(new Error('Devin API response was too large.'));
                }
            });
            apiRes.on('end', () => {
                let parsed = null;
                try {
                    parsed = raw ? JSON.parse(raw) : null;
                } catch (e) {
                    parsed = { raw };
                }
                resolve({ statusCode: apiRes.statusCode, body: parsed });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function resolveUserId() {
    if (cachedUserId) return cachedUserId;

    const requestPath = `/v3beta1/organizations/${encodeURIComponent(ORG_ID)}/members/users?email=${encodeURIComponent(USER_EMAIL)}`;
    const { statusCode, body } = await devinRequest('GET', requestPath);
    if (statusCode < 200 || statusCode >= 300) {
        throw new Error(`Could not resolve Devin user for ${USER_EMAIL} (status ${statusCode})`);
    }

    const users = Array.isArray(body) ? body : (body && (body.items || body.users || body.data || body.members)) || [];
    const user = Array.isArray(users)
        ? users.find(u => u.email && u.email.toLowerCase() === USER_EMAIL.toLowerCase()) || users[0]
        : users;
    const userId = user && (user.user_id || user.id);
    if (!userId) throw new Error(`No Devin user found for ${USER_EMAIL}`);

    cachedUserId = userId;
    return cachedUserId;
}

async function handleDevinApi(req, res, pathname) {
    if (pathname === '/api/devin/config') {
        sendJson(res, 200, { enabled: devinEnabled() });
        return;
    }

    if (!devinEnabled()) {
        sendJson(res, 503, {
            error: 'Devin integration is not configured. Set DEVIN_API_KEY, DEVIN_ORG_ID and DEVIN_USER_EMAIL (see .env.example).'
        });
        return;
    }

    if (pathname === '/api/devin/sessions' && req.method === 'POST') {
        const body = await readBody(req);
        if (!body.prompt) {
            sendJson(res, 400, { error: 'A prompt is required to start a Devin session.' });
            return;
        }

        const userId = await resolveUserId();
        const created = await devinRequest('POST', `/v3/organizations/${encodeURIComponent(ORG_ID)}/sessions`, {
            prompt: body.prompt,
            create_as_user_id: userId,
            title: body.title,
            tags: ['daily-task-tracker']
        });

        if (created.statusCode < 200 || created.statusCode >= 300) {
            sendJson(res, created.statusCode, { error: 'Devin API rejected the session request.', details: created.body });
            return;
        }

        const session = created.body || {};
        sendJson(res, 200, {
            session_id: session.session_id || session.id,
            url: session.url || session.session_url,
            status: session.status
        });
        return;
    }

    const sessionMatch = pathname.match(/^\/api\/devin\/sessions\/([^/]+)$/);
    if (sessionMatch && req.method === 'GET') {
        const sessionId = encodeURIComponent(decodeURIComponent(sessionMatch[1]));
        const result = await devinRequest('GET', `/v3/organizations/${encodeURIComponent(ORG_ID)}/sessions/${sessionId}`);
        sendJson(res, result.statusCode, result.body || {});
        return;
    }

    sendJson(res, 404, { error: 'Unknown Devin endpoint.' });
}

function serveStatic(req, res, pathname) {
    const relativePath = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
    const filePath = path.resolve(ROOT, relativePath);

    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (statErr, stats) => {
        if (statErr || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found');
            return;
        }
        readAndSend(res, filePath);
    });
}

function readAndSend(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, `http://localhost:${PORT}`).pathname;

    if (pathname.startsWith('/api/devin')) {
        handleDevinApi(req, res, pathname).catch(err => {
            sendJson(res, 500, { error: err.message });
        });
        return;
    }

    serveStatic(req, res, pathname);
});

server.listen(PORT, HOST, () => {
    console.log(`Daily Task Tracker running at http://${HOST}:${PORT}`);
    console.log(devinEnabled()
        ? 'Devin integration: enabled'
        : 'Devin integration: disabled (copy .env.example to .env to enable)');
});
