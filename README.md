# BridgeCall MVP

Browser-based voice calls with live captions + live translation, plus post-call transcript and structured summary.
MVP focus: international recruitment interviews (EU ↔ Asia).

## Prereqs
- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

## Local development

1) Install dependencies:
```bash
pnpm install
```

2) Copy env file:
```bash
cp .env.example .env
```

3) One-command run (infra + apps):
```bash
pnpm dev:local
```

This will start:
- Web app: http://localhost:3000
- API: http://localhost:4000
- Postgres: localhost:5432
- TURN server: localhost:3478

## Useful commands
- Run apps only (assumes Docker services already running):
```bash
pnpm dev
```
- Stop infra:
```bash
docker compose down
```
