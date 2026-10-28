# Personal AI Assistant — Safe Implementation Plan

## Goal

Evolve this demo into a personal AI assistant while keeping the existing airline demo working until the replacement is reviewed and tested.

## Audit findings (read-only review)

- The repository is a public fork of the OpenAI Customer Service Agents demo.
- The application currently imports airline-specific agents and context from `python-backend/airline/`.
- The FastAPI backend exposes ChatKit routes, a health endpoint, and a local-development CORS origin.
- `MemoryStore` stores threads, items, and attachments in process memory. State is lost when the server restarts and is not shared between multiple server workers.
- The UI is a Next.js app; its `dev` script starts both the UI and Python backend.
- GitHub Actions currently has no workflow runs visible in the repository's Actions API. This does not prove the code fails; CI coverage should be added and executed.
- This was a repository-level audit only. No runtime tests, deployment checks, secrets scans, or production environment checks were performed.

## Safe change policy

1. Work on `feature/personal-ai-assistant-foundation`, not `main`.
2. Do not add, print, commit, or modify API keys, tokens, credentials, or deployment secrets.
3. Do not change production deployments, environment settings, or external services.
4. Keep changes reviewable and open a pull request before merging.
5. Require explicit user confirmation before enabling tools that send messages, spend money, delete data, publish content, or modify external accounts.

## Proposed architecture

- **Assistant core:** a general-purpose assistant with clear instructions and a narrow set of approved tools.
- **Specialists:** optional task-specific agents for coding/repository work, research, study support, and project planning. Add them only when there is a concrete use case.
- **Memory:** start with explicit, user-controlled preferences and project notes. Do not treat process-local memory as durable storage. Choose a persistent store only after privacy, retention, and access-control requirements are decided.
- **Tool safety:** read-only by default; validate tool arguments; use human approval for consequential actions.
- **Interface:** reuse the existing ChatKit UI and backend transport where practical, while separating assistant behavior from the airline demo.
- **Observability:** redact secrets and sensitive user data from logs; add tests and health checks before deployment.

## Implementation sequence

### Phase 1 — Foundation (this branch)
- Record the audit and architecture plan.
- Add a minimal general-purpose assistant module behind a separate import path.
- Add tests for the assistant's configuration and safe defaults where the existing environment permits.
- Keep existing airline routes and agents unchanged.

### Phase 2 — Integration
- Add a separate assistant endpoint or an explicit assistant mode after reviewing the current ChatKit event flow.
- Add tests for input validation, failures, and tool approval boundaries.
- Keep the airline demo available until the new path passes tests.

### Phase 3 — Persistence and memory
- Select a durable store, define retention/deletion behavior, and add per-user access controls before storing personal data.

### Phase 4 — Deployment readiness
- Add CI checks, dependency/build verification, deployment documentation, and environment-variable validation.
- Deploy only after explicit approval and a separate review of target environment and secrets.

## Acceptance criteria

- Existing airline demo imports and routes remain unchanged in the foundation phase.
- No secrets or production settings are added or changed.
- New behavior has automated tests.
- External side effects require explicit approval.
- All changes are reviewed in a pull request before merging.
