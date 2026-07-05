# Dear Diary

Voice-first memory layer for your life — RAISE 2026 hackathon build.

## Planning docs (start here)

| Doc | Purpose |
|-----|---------|
| [docs/planning/00-MASTER.md](./docs/planning/00-MASTER.md) | Overview, repo layout, timeline |
| [docs/planning/01-STREAM-S0-shared.md](./docs/planning/01-STREAM-S0-shared.md) | Types, MSW, contracts — **start Hour 0** |
| [docs/planning/02-STREAM-S1-memory.md](./docs/planning/02-STREAM-S1-memory.md) | Cognee local + FastAPI |
| [docs/planning/03-STREAM-S2-agent.md](./docs/planning/03-STREAM-S2-agent.md) | Memory agent + Gemma |
| [docs/planning/04-STREAM-S3-voice.md](./docs/planning/04-STREAM-S3-voice.md) | Gradium + mic capture |
| [docs/planning/05-STREAM-S4-desktop-ui.md](./docs/planning/05-STREAM-S4-desktop-ui.md) | Tauri + Framer Motion UI |
| [docs/planning/06-STREAM-S5-lenses-patterns.md](./docs/planning/06-STREAM-S5-lenses-patterns.md) | Lenses + patterns |
| [docs/planning/08-STREAM-S6-seed-demo.md](./docs/planning/08-STREAM-S6-seed-demo.md) | Maya seed + demo ops |
| [docs/planning/09-INTEGRATION-GATES.md](./docs/planning/09-INTEGRATION-GATES.md) | Merge checkpoints |
| [docs/planning/10-API-CONTRACT.md](./docs/planning/10-API-CONTRACT.md) | HTTP API |
| [docs/planning/90-SECOND-DEMO.md](./docs/planning/90-SECOND-DEMO.md) | Stage script |

## Stack

- **Desktop:** Tauri + React + Framer Motion
- **Sidecar:** FastAPI + Cognee (Kuzu, local)
- **Voice:** Gradium STT/TTS
- **Reasoning:** Gemma 4 @ Crusoe
- **Build:** Cursor

## Parallel kickoff

1. Lead executes **S0** → commit scaffold + fixtures  
2. Assign streams S1–S6 from planning docs  
3. Meet **Gate G1** at Hour 4  

```bash
cp .env.example .env
# fill keys, then follow 00-MASTER.md
```
