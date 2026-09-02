const DEVIN_API_BASE = '/api/devin';
const DEVIN_POLL_INTERVAL_MS = 8000;

let devinEnabled = false;
let devinPollTimer = null;
let devinKickoffTaskId = null;

async function refreshDevinConfig() {
    try {
        const res = await fetch(`${DEVIN_API_BASE}/config`);
        const config = await res.json();
        if (config.enabled && !devinEnabled) {
            devinEnabled = true;
            render();
        }
    } catch (e) {
        // No server (file://) or the proxy is unreachable — feature stays hidden.
    }
}

function openDevinModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.column !== 'todo' || task.devinSessionId) return;

    devinKickoffTaskId = taskId;
    document.getElementById('devinModalTaskTitle').textContent = task.title;
    document.getElementById('devinPromptInput').value = task.desc
        ? `${task.title}\n\n${task.desc}`
        : task.title;

    openModal('devinModal');
}

function closeDevinModal() {
    devinKickoffTaskId = null;
    closeModal('devinModal');
}

async function confirmDevinKickoff() {
    const taskId = devinKickoffTaskId;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const prompt = document.getElementById('devinPromptInput').value.trim();
    if (!prompt) {
        showToast('A prompt is required to start a Devin session.', 'warning');
        return;
    }

    const kickoffBtn = document.getElementById('devinKickoffBtn');
    kickoffBtn.disabled = true;

    try {
        const res = await fetch(`${DEVIN_API_BASE}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, title: task.title })
        });
        const data = await res.json();

        if (!res.ok) {
            showToast(data.error || 'Could not start the Devin session.', 'error');
            return;
        }

        const liveTask = state.tasks.find(t => t.id === taskId);
        if (!liveTask) {
            showToast('The task was removed before its Devin session started.', 'warning');
            return;
        }

        liveTask.devinSessionId = data.session_id;
        liveTask.devinSessionUrl = data.url;
        liveTask.devinStatus = data.status || 'running';
        liveTask.column = 'progress';
        liveTask.completed = false;

        saveToStorage();
        closeDevinModal();
        render();
        showToast('Devin session started.', 'success');
        startDevinPolling();
    } catch (e) {
        showToast('Could not reach the Devin proxy.', 'error');
    } finally {
        kickoffBtn.disabled = false;
    }
}

function openDevinSession(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || !task.devinSessionUrl) return;
    window.open(task.devinSessionUrl, '_blank', 'noopener');
}

function isDevinComplete(status, detail) {
    return ['exit', 'error', 'suspended'].includes(status) ||
        ['finished', 'waiting_for_user'].includes(detail);
}

function isDevinWorking(task) {
    return Boolean(task.devinSessionId) && !isDevinComplete(task.devinStatus, task.devinStatusDetail);
}

function devinStatusLabel(task) {
    if (!task.devinSessionId) return '';
    if (isDevinWorking(task)) return 'Devin working';
    if (task.devinStatus === 'error') return 'Devin errored';
    if (task.devinStatusDetail === 'waiting_for_user') return 'Devin waiting';
    return 'Devin finished';
}

async function pollDevinSessions() {
    if (!devinEnabled) return;

    const tracked = state.tasks.filter(t => t.devinSessionId && t.column !== 'done');
    if (tracked.length === 0) return;

    let changed = false;

    for (const task of tracked) {
        try {
            const res = await fetch(`${DEVIN_API_BASE}/sessions/${encodeURIComponent(task.devinSessionId)}`);
            if (!res.ok) continue;
            const session = await res.json();

            const status = session.status || task.devinStatus;
            const detail = session.status_enum || session.status_detail || task.devinStatusDetail;
            if (status === task.devinStatus && detail === task.devinStatusDetail) continue;

            task.devinStatus = status;
            task.devinStatusDetail = detail;

            if (isDevinComplete(status, detail) && task.column === 'progress') {
                task.column = 'done';
                task.completed = true;
                showToast(`Devin finished "${task.title}".`, 'success');
            }
            changed = true;
        } catch (e) {
            // Ignore transient polling failures.
        }
    }

    if (changed) {
        saveToStorage();
        render();
    }
}

function startDevinPolling() {
    if (devinPollTimer) return;
    devinPollTimer = setInterval(pollDevinSessions, DEVIN_POLL_INTERVAL_MS);
}
