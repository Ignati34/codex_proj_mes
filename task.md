# TASKS.md — BridgeCall MVP build queue

This file defines the task sequence Codex should implement.  
Work in order. Each task must be complete and tested before moving on.

---

## Phase 0 — Repo scaffold (Day 1)

Plan: Scaffold pnpm workspaces, create minimal web/api/shared apps, add Docker Compose for Postgres + coturn, and document one-command local run in README.

### T0.1 Create monorepo structure
- /apps/web (Next.js TS)
- /apps/api (Fastify TS)
- /packages/shared (types, zod schemas)
- Root tooling:
  - pnpm workspaces
  - eslint + prettier
  - tsconfig base
  - dotenv handling

Acceptance:
- `pnpm i` and `pnpm -r dev` start web+api.

### T0.2 Docker Compose for local infra
Services:
- Postgres
- coturn (TURN)
- (optional) pgadmin

Acceptance:
- `docker compose up -d` brings services up.
- API can connect to Postgres.

---

## Phase 1 — Auth & accounts (Day 2)

### T1.1 Database schema + migrations
Tables:
- users
- sessions
- participants
- transcripts
- summaries
- usage_events

Acceptance:
- migrations run from scratch.

### T1.2 Magic link auth
Endpoints:
- POST /auth/magic-link  {email}
- GET /auth/verify?token=...
- Session cookie (httpOnly) for API auth.

Web:
- Sign-in page
- Verify redirect

Acceptance:
- user can sign in/out.
- protected dashboard requires auth.

---

## Phase 2 — Sessions & links (Day 3)

### T2.1 Create session
API:
- POST /sessions {lang_owner, lang_guest, summary_type, ttl_hours}
- token generation + expires_at

Web:
- Create Session page
- Copy link button

Acceptance:
- session appears in dashboard list.

### T2.2 Guest join endpoint
- GET /join/:token returns minimal session info + join allowed/denied
- enforce TTL/expired rules

Acceptance:
- expired token blocked with friendly UI.

---

## Phase 3 — WebRTC signaling + call room (Day 4–5)

### T3.1 WebSocket signaling channel
WS:
- /ws/session/:id (auth for owner) + /ws/join/:token (guest)
Events:
- join, offer, answer, ice, leave

Acceptance:
- P2P audio call works between two browsers on same network.

### T3.2 TURN fallback
- configure STUN/TURN for ICE servers in web
- document how to run coturn in dev

Acceptance:
- call works across NAT scenarios (basic manual test).

---

## Phase 4 — Live captions & translation (Day 6–7)

### T4.1 Streaming audio capture client-side
- capture mic audio
- send audio frames to API via WS (separate channel) OR WebRTC data channel
- implement backpressure and reconnect

Acceptance:
- server receives audio stream and can return mock captions.

### T4.2 STT provider integration (streaming)
- Implement STTProvider interface
- For MVP: pick one provider and integrate
- Store transcript segments incrementally

Acceptance:
- captions appear in UI while talking.
- transcript saved.

### T4.3 Translation provider integration (streaming)
- Translate each final segment (or partials if supported)
- Send translated captions to the other side

Acceptance:
- both sides see translated text.

Note:
- Keep provider API keys in env vars.
- Add a "mock provider" for tests.

---

## Phase 5 — Post-call artifacts (Day 8)

### T5.1 End call workflow
API:
- POST /sessions/:id/end
- mark ended_at
- finalize transcript

Web:
- End button → redirect to results page

Acceptance:
- session status changes and results page loads.

### T5.2 Summary generator
- SummaryProvider interface
- Implement Recruitment summary JSON schema
- Save to summaries table
- Display in UI

Acceptance:
- structured summary visible.

### T5.3 Export PDF
- PDF generation server-side from transcript + summary
- Store file reference (S3 optional; local filesystem acceptable for MVP dev)
- Download link in UI

Acceptance:
- PDF downloads and is readable.

---

## Phase 6 — Retention, delete-now, usage metering (Day 9)

### T6.1 Delete-now
API:
- DELETE /sessions/:id
- hard delete transcript, summary, exports
- keep minimal usage record if required OR delete all (choose one and document)

Acceptance:
- session disappears; artifacts gone.

### T6.2 Retention job
- cron-like job in API (or separate worker)
- delete expired sessions and old artifacts based on plan retention

Acceptance:
- items older than retention removed automatically (test with time travel).

### T6.3 Usage events
- Log minutes of call + minutes STT + minutes translate
- Simple endpoint GET /me/usage?from&to

Acceptance:
- dashboard shows usage totals.

---

## Phase 7 — Hardening & demo readiness (Day 10)

### T7.1 Error handling and UX polish
- Clear states: connecting, reconnecting, mic blocked, expired link
- Accessibility basics

### T7.2 Tests & CI
- Add CI workflow: lint + typecheck + tests
- Add minimal integration test for create->join->end->artifacts

### T7.3 README
- one-command local setup
- env vars list
- how to run TURN
- demo instructions (2 browsers)

Acceptance:
- a non-developer can follow README and run demo locally.

---

## Milestone: MVP Demo
Definition:
- recruiter signs in
- creates link (choose languages)
- guest joins
- audio + live translation works
- transcript + recruitment summary generated
- export PDF
- delete-now