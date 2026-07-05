# Parallel kickoff — who starts what (Minute 0)

Assign names in the blank columns. Everyone reads [10-API-CONTRACT.md](./10-API-CONTRACT.md) before coding.

---

## Team of 4 (recommended)

| Person | Stream | First 2 hours |
|--------|--------|---------------|
| **A** | S0 + lead | Repo scaffold, types, MSW, `.cursor/rules` |
| **B** | S1 | `services/api` FastAPI + Cognee hello world |
| **C** | S4 + S3 UI | Tauri app + orb + MSW wired |
| **D** | S6 + S5 content | Maya day 1–5 JSON + narrative checklist |

**Hour 2:** B exposes `/health`, C shows orb, D writes days 6–10, A finishes fixtures.

**Hour 4:** Gate G1 — merge to `integrate/hour-4`.

Then:
- **B → S2** agent (same person as S1 ideal)
- **C → S3** mic integration
- **D → S5** fixtures + whitelist facts
- **A** integration + gate enforcement

---

## Team of 3

| Person | Streams |
|--------|---------|
| A | S0, S1, S2 (backend) |
| B | S4, S3 (frontend + voice UX) |
| C | S6, S5 (seed + lens content) |

A stubs API first 4h so B uses MSW then real API.

---

## Team of 2

| Person | Streams |
|--------|---------|
| A | S0, S1, S2, S6 |
| B | S4, S3, S5 fixtures consumption |

Cut: Parent lens UI, force graph, connectors, voice clone.

---

## Solo

| Hours | Focus |
|-------|-------|
| 0–8 | S0 + S1 + S4 orb + S6 seed 30 entries |
| 8–16 | S2 whitelist handlers only (no generic agent) + lens switch with fixtures |
| 16–22 | S3 STT + TTS + wire E2E |
| 22–30 | Polish + rehearsal |

Solo uses **hardcoded whitelist answers** + real Cognee ingest. Agent strip animates fake steps with real final answer.

---

## Communication

- **Contract changes:** only Lead, post in chat + update `10-API-CONTRACT.md`
- **Seed fact changes:** S5 + S6 must both ack
- **Blocked > 30 min:** switch to fixture, unblock other stream

---

## Branches

```
main
├── stream/s0-shared
├── stream/s1-memory
├── stream/s4-desktop
├── stream/s6-seed
└── integrate/hour-4   ← merge target at each gate
```

---

## Minute 0 commands (Lead)

```bash
cd C:\Users\arjun\Desktop\RAISE
mkdir -p apps/desktop services/api packages/shared packages/seed packages/cli scripts
cp .env.example .env
# Open 5 Cursor windows or 5 terminals — one per stream doc
```

Share in team chat:
1. Link to `docs/planning/00-MASTER.md`
2. Assigned stream doc per person
3. Next gate time (Hour 4)
