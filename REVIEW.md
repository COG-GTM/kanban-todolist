# Review Guidelines

This repository is a **hands-on demo / workshop app**, not production software.
Non-technical participants build it while learning to use Devin. It runs entirely
client-side from `localStorage` with no real backend, authentication, or user
data (the Phase 8 Node server is a thin local-only proxy used for the demo).

When reviewing pull requests in this repo, **skip security-vulnerability and bug
findings — do not raise them:**

- No security / vulnerability findings (e.g. XSS, injection, unsafe `innerHTML`,
  missing input sanitization, insecure or outdated dependencies, secrets
  handling, CSRF, etc.).
- No bug / correctness findings or edge-case nitpicks.

There is nothing sensitive to protect and no production surface to harden here,
so these findings are just noise for this project. Focus only on what the PR
author explicitly asks for.
