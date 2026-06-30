        // ==========================================
        // DEVIN SESSION INTEGRATION
        // Talks to the local backend proxy (server.js), which forwards to the
        // Devin API using the server-side service key. Requires the app to be
        // served via `npm start` — when opened over file:// these calls no-op.
        // ==========================================
        const DEVIN_API_BASE = '/api/devin';
        const DEVIN_POLL_INTERVAL_MS = 8000;

        let devinKickoffTaskId = null; // task currently shown in the kickoff modal
        let devinPollTimer = null;
        // Whether the backend is configured to create Devin sessions (org + user
        // email + key). Until confirmed enabled, the "Run with Devin" UI stays hidden.
        let devinEnabled = false;

        // Ask the backend whether Devin sessions are configured. When enabled,
        // re-render so the "Run with Devin" controls appear. Safe to call when
        // opened via file:// — the failed fetch just leaves the feature hidden.
        async function refreshDevinConfig() {
            try {
                const res = await fetch(`${DEVIN_API_BASE}/config`);
                if (!res.ok) return;
                const data = await res.json();
                const next = Boolean(data && data.enabled);
                if (next !== devinEnabled) {
                    devinEnabled = next;
                    render();
                }
            } catch (e) {
                // No backend / not configured — leave Devin features hidden.
            }
        }

        // Open the "Run with Devin" modal (To Do tasks only).
        function openDevinModal(taskId) {
            if (!devinEnabled) {
                showToast('Devin is not configured on the server.', 'warning');
                return;
            }
            const task = state.tasks.find(t => t.id === taskId);
            if (!task) return;
            if (task.column !== 'todo') {
                showToast('Devin sessions can only be started from To Do tasks.', 'warning');
                return;
            }
            if (task.devinSessionId) {
                showToast('This task already has a Devin session.', 'warning');
                return;
            }

            devinKickoffTaskId = taskId;
            document.getElementById('devinModalTaskTitle').textContent = task.title;

            const promptInput = document.getElementById('devinPromptInput');
            // Seed the prompt from the task's title/description as a helpful starting point.
            promptInput.value = task.desc ? `${task.title}\n\n${task.desc}` : task.title;

            const btn = document.getElementById('devinKickoffBtn');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-rocket"></i> Start Devin Session';

            openModal('devinModal');
            promptInput.focus();
        }

        function closeDevinModal() {
            closeModal('devinModal');
            devinKickoffTaskId = null;
        }

        // Confirm + create a Devin session for the active task.
        async function confirmDevinKickoff() {
            if (!devinKickoffTaskId) return;
            const task = state.tasks.find(t => t.id === devinKickoffTaskId);
            if (!task) return;

            const promptInput = document.getElementById('devinPromptInput');
            const prompt = promptInput.value.trim();
            if (prompt.length < 5) {
                showToast('Please describe what Devin should do (min 5 characters).', 'error');
                return;
            }

            const btn = document.getElementById('devinKickoffBtn');
            const originalLabel = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';

            try {
                const res = await fetch(`${DEVIN_API_BASE}/sessions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: prompt, title: task.title })
                });
                const data = await res.json().catch(() => null);
                if (!res.ok || !data || !data.session_id) {
                    const msg = (data && data.error) ? data.error : `Request failed (${res.status})`;
                    throw new Error(msg);
                }

                // Persist the session reference on the task.
                task.devinSessionId = data.session_id;
                task.devinSessionUrl = data.url;
                task.devinStatus = data.status || 'running';
                task.devinStatusDetail = null;
                task.devinPrompt = prompt;
                task.devinStartedAt = Date.now();

                // Move the task into In Progress.
                task.column = 'progress';
                task.completed = false;

                saveToStorage();
                closeDevinModal();
                render();
                showToast('Devin session started — task moved to In Progress.', 'success');

                startDevinPolling();
                pollDevinSessions(); // immediate first poll
            } catch (err) {
                showToast(`Failed to start Devin session: ${err.message}`, 'error');
                btn.disabled = false;
                btn.innerHTML = originalLabel;
            }
        }

        // Open the associated Devin session in a new tab.
        function openDevinSession(taskId) {
            const task = state.tasks.find(t => t.id === taskId);
            if (!task || !task.devinSessionUrl) return;
            window.open(task.devinSessionUrl, '_blank', 'noopener');
        }

        // Human-friendly label for a task's current Devin status.
        function devinStatusLabel(task) {
            const detail = task.devinStatusDetail;
            const status = task.devinStatus || 'running';
            if (detail === 'finished' || status === 'exit') return 'finished';
            if (detail === 'waiting_for_user') return 'complete';
            if (detail === 'blocked') return 'blocked';
            if (status === 'error') return 'error';
            if (status === 'suspended') return 'suspended';
            // Any other (non-terminal) state means Devin is actively working.
            return 'in Devin';
        }

        // Whether Devin is actively working on this task (running, not yet in a
        // terminal/idle state). Drives the loading animation on the status pill.
        function isDevinWorking(task) {
            const label = devinStatusLabel(task);
            return !['finished', 'complete', 'error', 'suspended', 'waiting', 'blocked'].includes(label);
        }

        // A session counts as complete once it reaches a terminal status. Per the
        // Devin API, terminal statuses are "exit" (completed), "error" and
        // "suspended"; "finished" as a status_detail also indicates the agent is done.
        // We also treat "waiting_for_user" as complete: once Devin is waiting on
        // input we consider the task done and move it to Done.
        function isDevinComplete(status, detail) {
            return status === 'exit' || status === 'error' || status === 'suspended'
                || detail === 'finished' || detail === 'waiting_for_user';
        }

        // GLOBAL poll across every task that has an active Devin session.
        async function pollDevinSessions() {
            const tracked = state.tasks.filter(t => t.devinSessionId && t.column !== 'done');
            if (tracked.length === 0) return;

            let changed = false;
            for (const task of tracked) {
                try {
                    const res = await fetch(`${DEVIN_API_BASE}/sessions/${encodeURIComponent(task.devinSessionId)}`);
                    if (!res.ok) continue;
                    const data = await res.json();

                    if (data.status && data.status !== task.devinStatus) {
                        task.devinStatus = data.status;
                        changed = true;
                    }
                    if (data.status_detail !== undefined && data.status_detail !== task.devinStatusDetail) {
                        task.devinStatusDetail = data.status_detail;
                        changed = true;
                    }

                    if (isDevinComplete(data.status, data.status_detail) && task.column === 'progress') {
                        task.completed = true;
                        task.column = 'done';
                        task.editedAt = Date.now();
                        changed = true;
                        showToast(`Devin finished "${task.title}" — moved to Done.`, 'success');
                    }
                } catch (e) {
                    // Backend unreachable (e.g. opened via file://) — skip this round silently.
                }
            }

            if (changed) {
                saveToStorage();
                render();
            }
        }

        // Start the global poller (idempotent).
        function startDevinPolling() {
            if (devinPollTimer) return;
            devinPollTimer = setInterval(pollDevinSessions, DEVIN_POLL_INTERVAL_MS);
        }
