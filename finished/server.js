// ==========================================================================
// Kanban Todolist — local static server + Devin API proxy
//
// Zero-dependency Node server. It:
//   1. Serves the static app (index.html, css/, js/, assets) from this folder.
//   2. Exposes a small proxy under /api/devin/* that forwards to the Devin v3
//      API, injecting the service-user API key from the DEVIN_API_KEY env var
//      so the key never reaches the browser (and CORS is avoided entirely).
//
// Run:  DEVIN_API_KEY=cog_xxx npm start   (or: node server.js)
// ==========================================================================

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.DEVIN_API_KEY || '';
const DEVIN_HOST = 'api.devin.ai';
const ROOT = __dirname;

// org_id is resolved once from the service-user key via GET /v3/self and cached.
let cachedOrgId = null;

function safeParse(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
}

// Perform an authenticated request against the Devin API.
function devinRequest(method, apiPath, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const opts = {
            host: DEVIN_HOST,
            path: apiPath,
            method: method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            }
        };
        if (data) {
            opts.headers['Content-Type'] = 'application/json';
            opts.headers['Content-Length'] = Buffer.byteLength(data);
        }
        const req = https.request(opts, (res) => {
            let chunks = '';
            res.on('data', (c) => { chunks += c; });
            res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function getOrgId() {
    if (cachedOrgId) return cachedOrgId;
    const r = await devinRequest('GET', '/v3/self');
    if (r.status !== 200) throw new Error(`/v3/self failed (${r.status})`);
    const self = safeParse(r.body);
    if (!self || !self.org_id) throw new Error('Could not resolve org_id from API key');
    cachedOrgId = self.org_id;
    return cachedOrgId;
}

function sendJson(res, status, obj) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
}

function readJsonBody(req) {
    return new Promise((resolve) => {
        let data = '';
        req.on('data', (c) => {
            data += c;
            if (data.length > 1e6) req.destroy();
        });
        req.on('end', () => resolve(data ? safeParse(data) : {}));
    });
}

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function serveStatic(req, res) {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.join(ROOT, path.normalize(urlPath));
    // Prevent path traversal outside the served root.
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(content);
    });
}

async function handleApi(req, res, url) {
    if (!API_KEY) {
        return sendJson(res, 503, { error: 'DEVIN_API_KEY is not configured on the server.' });
    }
    try {
        const orgId = await getOrgId();

        // Create a session.
        if (req.method === 'POST' && url === '/api/devin/sessions') {
            const payload = await readJsonBody(req);
            if (!payload || !payload.prompt || !String(payload.prompt).trim()) {
                return sendJson(res, 400, { error: 'prompt is required' });
            }
            const createBody = { prompt: String(payload.prompt) };
            if (payload.title) createBody.title = String(payload.title);
            createBody.tags = ['kanban-todolist'];
            const r = await devinRequest('POST', `/v3/organizations/${orgId}/sessions`, createBody);
            const parsed = safeParse(r.body);
            if (r.status < 200 || r.status >= 300) {
                return sendJson(res, r.status, { error: (parsed && parsed.detail) || 'Devin API error', detail: parsed });
            }
            return sendJson(res, 200, { session_id: parsed.session_id, url: parsed.url, status: parsed.status });
        }

        // Get a single session's status.
        const m = url.match(/^\/api\/devin\/sessions\/([^/]+)$/);
        if (req.method === 'GET' && m) {
            const sid = decodeURIComponent(m[1]);
            const r = await devinRequest('GET', `/v3/organizations/${orgId}/sessions/${encodeURIComponent(sid)}`);
            const parsed = safeParse(r.body);
            if (r.status < 200 || r.status >= 300) {
                return sendJson(res, r.status, { error: (parsed && parsed.detail) || 'Devin API error' });
            }
            return sendJson(res, 200, {
                session_id: parsed.session_id,
                url: parsed.url,
                status: parsed.status,
                status_detail: parsed.status_detail,
                structured_output: parsed.structured_output
            });
        }

        return sendJson(res, 404, { error: 'Unknown API route' });
    } catch (e) {
        return sendJson(res, 502, { error: 'Proxy error: ' + e.message });
    }
}

const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    if (url.startsWith('/api/devin/')) {
        handleApi(req, res, url);
        return;
    }
    serveStatic(req, res);
});

server.listen(PORT, () => {
    console.log(`kanban-todolist running at http://localhost:${PORT}`);
    if (!API_KEY) {
        console.warn('WARNING: DEVIN_API_KEY not set — /api/devin/* will return 503 and the Devin features will not work.');
    }
});
