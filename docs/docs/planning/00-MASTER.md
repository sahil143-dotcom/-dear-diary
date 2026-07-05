# Dear Diary — Parallel Build Master Plan

**RAISE 2026 · Cursor Track · Desktop (Tauri + React)**

| Locked decision | Choice |
|-----------------|--------|
| Product surface | **Desktop app** (Tauri + React + Framer Motion) |
| Memory | **Cognee local** + Kuzu (`./data/cognee`) |
| Sidecar | **FastAPI** on `127.0.0.1:8787` |
| Voice | **Gradium** STT + TTS |
| Reasoning | **Gemma 4 @ Crusoe** |
| CLI | Dev-only (`seed`, `reset`, `ask`) |
| Cognee Cloud | Backup / optional — **not** hot path for MVP |

---

## Win path (build only these for demo)

1. **Capture** — voice → transcript → day bloom  
2. **Lens switch** — same seed data, 4 geometries (Framer `layoutId`)  
3. **Pattern** — “What do I keep trying and abandoning?”  
4. **Witness** — “What did I know about Arjun in March?” + voice replay  
5. **Seed** — `maya-30d` one-command reset  

Everything else is P1/P2. See [07-PRIORITIES.md](./07-PRIORITIES.md).

---

## Repo layout (create at Hour 0)

```
dear-diary/
├── apps/
│   └── desktop/              # STREAM S4 — Tauri + React
├── packages/
│   ├── shared/               # STREAM S0 — types, constants
│   ├── seed/                 # STREAM S6 — Maya fixtures
│   └── cli/                  # STREAM S6 — seed/reset commands
├── services/
│   └── api/                  # STREAM S1+S2+S3 — FastAPI sidecar
├── docs/planning/            # This folder
├── scripts/
│   ├── dev.sh                # Start sidecar + tauri
│   └── demo-reset.sh
├── .env.example
└── .cursor/rules/dear-diary.mdc
```

---

## Parallel streams

| Stream | Owner | Doc | Hours | Depends on |
|--------|-------|-----|-------|------------|
| **S0** | Lead | [01-STREAM-S0-shared.md](./01-STREAM-S0-shared.md) | 0–4 | — |
| **S1** | Memory | [02-STREAM-S1-memory.md](./02-STREAM-S1-memory.md) | 0–16 | S0 |
| **S2** | Agent | [03-STREAM-S2-agent.md](./03-STREAM-S2-agent.md) | 2–20 | S0, S1 stubs |
| **S3** | Voice | [04-STREAM-S3-voice.md](./04-STREAM-S3-voice.md) | 0–12 | S0 |
| **S4** | Desktop UI | [05-STREAM-S4-desktop-ui.md](./05-STREAM-S4-desktop-ui.md) | 0–28 | S0 (MSW first) |
| **S5** | Lenses | [06-STREAM-S5-lenses-patterns.md](./06-STREAM-S5-lenses-patterns.md) | 8–24 | S0, S2 stubs |
| **S6** | Seed/Demo | [08-STREAM-S6-seed-demo.md](./08-STREAM-S6-seed-demo.md) | 4–30 | S0, S1 |

**Integration:** [09-INTEGRATION-GATES.md](./09-INTEGRATION-GATES.md)

**API contract:** [10-API-CONTRACT.md](./10-API-CONTRACT.md)

---

## Hour timeline (all streams)

| Hour | Milestone |
|------|-----------|
| **0–0.5** | S0: `shared/types` + OpenAPI stub + MSW committed |
| **0–4** | S1: Cognee hello · S3: STT file · S4: Tauri shell · S6: Maya days 1–10 |
| **4** | **G1** — API stub + orb UI + STT from WAV |
| **4–8** | S1: real cognify · S4: day bloom · S6: Maya 11–30 |
| **8** | **G2** — ingest → graph → UI shows entry |
| **8–12** | S2: agent loop · S5: lens templates · S4: agent strip |
| **12** | **G3** — one pattern query end-to-end |
| **12–17** | S4: **lens switch** · S5: pattern + witness |
| **17** | **G4** — lens switch on seed (fixture OK) |
| **17–22** | Swap MSW → real API · S3: TTS replay |
| **22** | **G5** — full demo path live |
| **22–28** | Polish · rehearsal |
| **28–30** | Backup video · freeze deps |

---

## Start commands (after Hour 0 scaffold)

```bash
# Terminal 1 — sidecar
cd services/api && uvicorn main:app --reload --port 8787

# Terminal 2 — desktop
cd apps/desktop && npm run tauri dev

# Terminal 3 — seed (once S1 ready)
cd packages/cli && npm run seed:maya
```

---

## Disqualification guardrails (all streams)

- No Streamlit  
- No free-chat RAG home screen  
- No dashboard as hero (home = **orb**)  
- No therapy / personality / medical framing  
- Agent strip visible on queries (not “basic RAG”)  
- Demo questions **whitelisted** only  

---

## Sponsor one-liner

**Gradium listens · Cognee remembers · Gemma connects the dots · Built in Cursor.**

---

## Next file to read

1. Lead reads **S0** and creates repo scaffold.  
2. Everyone reads **API contract** + their stream doc.  
3. Meet at **G1** (Hour 4) with PRs to `integrate/hour-4`.
