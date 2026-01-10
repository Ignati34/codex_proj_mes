# AGENTS.md — BridgeCall MVP

Codex: follow these instructions for any work in this repository.  
Scope: entire repo.

## Product goal (MVP)
Build **BridgeCall**: browser-based voice calls with **live captions + live translation**, plus **post-call transcript and structured summary**.

Primary vertical for MVP: **international recruitment interviews** (Poland/Germany hiring from India/Bangladesh/Vietnam).  
Secondary vertical: **legal consultations**.

We do **not** build a general messenger.

## Non-goals (explicitly out of scope)
- No PSTN / DID phone numbers.
- No “change number during the call”.
- No claims or features intended to evade lawful tracing or investigation.
- No mobile apps.
- No video calls.
- No 10+ languages (MVP is limited to a small set).

## UX principles
- Recruiter/Consultant signs in via **email magic link**.
- Guest joins by **link** without account/app install.
- Call room shows:
  - live captions (original)
  - live translation (target)
- After call: transcript + structured summary + export PDF + delete-now.

## MVP language set
Required UI + pipeline support for:
- English (en)
- Polish (pl)
- German (de)
- Hindi (hi)
- Bengali (bn)
- Vietnamese (vi)

## Data minimization & retention
- Store only what is required to deliver artifacts:
  - transcript segments
  - summary JSON
  - usage counters
- Retention policy:
  - Starter: 7 days
  - Pro: 30 days
- Provide "Delete now" for a session: removes transcript + summary + exports.

## Security and privacy
- TLS everywhere.
- WebRTC uses DTLS-SRTP (default).
- Guest links use long random tokens + TTL.
- Do not log transcript text or audio in server logs.
- Logs may include anonymous technical metadata (latency, error codes, session ids).

## Technical architecture (MVP)
### Frontend
- Next.js (App Router), TypeScript
- Pages:
  - Landing (minimal)
  - Auth (magic link verify)
  - Dashboard (sessions list)
  - Create Session
  - Call Room (/call/[token])
  - Session Result (/sessions/[id])

### Backend
- Node.js + TypeScript + Fastify
- REST API + WebSocket for signaling/captions stream
- Postgres via Prisma (preferred) or Drizzle (acceptable)

### WebRTC
- MVP: P2P with TURN fallback
- Use STUN/TURN (coturn) in dev via Docker Compose

### AI pipeline (MVP)
- Streaming STT → streaming translation → captions to both clients.
- Summary generated after call ends from transcript.

For MVP, implement AI providers behind interfaces so providers can be swapped.
- STTProvider: stream(audio) -> partial/final segments
- TranslateProvider: translate(text, src, dst) -> partial/final
- SummaryProvider: summarize(transcript, template) -> JSON

## Structured summary schema (Recruitment)
Implement and persist summary JSON with fields:
- position: { title, country_of_employment, start_date? }
- confirmations: array of { topic, confirmed, notes }
  Topics: duties, salary, hours, accommodation, documents, next_steps
- risk_level: low|medium|high
- recommendation: proceed|clarify|reject
- freeform_summary: string

## Repo rules
- Keep commits/PRs small, testable, and explained.
- Add/maintain README with local dev instructions.
- Every feature must include:
  - tests (unit/integration where applicable)
  - types
  - lint clean
- Use env vars for secrets; never hardcode keys.
- Add Docker Compose for local Postgres + coturn.

## Definition of Done (MVP)
A recruiter can:
1) Sign in via magic link  
2) Create a session link with language pair  
3) Guest joins call via link  
4) Both hear audio and see live captions + translation  
5) Recruiter ends call  
6) Transcript + structured summary appear  
7) Export PDF works  
8) Delete-now deletes session artifacts  
9) Retention job deletes expired data automatically

## How to work (Codex guidance)
- Before coding: write a short plan in the PR description or in TASKS.md section being worked.
- Prefer the simplest implementation that satisfies the MVP.
- If uncertain, implement a stub with a clean interface and TODO markers, plus tests for the interface.
