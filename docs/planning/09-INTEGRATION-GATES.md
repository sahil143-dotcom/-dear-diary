# Integration gates

**Branch strategy:** `main` stable · feature branches per stream · merge at gates to `integrate/hour-N`

---

## G0 · Hour 0.5 — Contract freeze

| Check | Owner |
|-------|-------|
| `packages/shared` types committed | S0 |
| OpenAPI stub matches API doc | S0 |
| MSW handlers return fixtures | S0 |
| `.env.example` present | S0 |

**Merge:** all streams can start.

---

## G1 · Hour 4 — Stubs alive

| Check | Owner |
|-------|-------|
| `GET /health` 200 | S1 |
| `POST /ingest/entry` returns stub entities | S1 |
| STT transcribes sample WAV | S3 |
| Tauri app shows orb + fake transcript | S4 |
| Maya days 1–10 JSON written | S6 |

**Demo possible:** orb + fake bloom (no Cognee).

---

## G2 · Hour 8 — Real memory

| Check | Owner |
|-------|-------|
| Cognee cognify on one entry | S1 |
| `POST /seed/load` loads ≥10 entries | S1 + S6 |
| Live mic → ingest → UI bloom | S3 + S4 |
| Maya days 11–30 complete | S6 |

**Demo possible:** real capture + seeded graph (queries may still be stub).

---

## G3 · Hour 12 — First real answer

| Check | Owner |
|-------|-------|
| `POST /query/memory` Q1 returns abandon answer | S2 + S5 |
| Agent strip shows 5+ steps | S2 + S4 |
| Lens fixture JSON in shared package | S5 |
| TTS speaks one sentence | S3 |

**Demo possible:** capture + one pattern (lens switch may be fixture).

---

## G4 · Hour 17 — Lens hero

| Check | Owner |
|-------|-------|
| Lens switch animates 3+ layouts | S4 |
| `/query/lens-view` returns items for each lens | S2 + S5 |
| Same seed data across lenses | S5 |

**Demo possible:** full Beat 3 on stage (pattern may be cached).

---

## G5 · Hour 22 — E2E

| Check | Owner |
|-------|-------|
| MSW disabled — all calls hit localhost:8787 | S4 |
| Beats 2–5 in [90-SECOND-DEMO.md](./90-SECOND-DEMO.md) pass | All |
| Q4 Arjun witness + citation | S2 + S5 |
| p95 query latency < 10s | S1 + S2 |

**Merge to `main` · feature freeze.**

---

## G6 · Hour 26 — Rehearsal

| Check | Owner |
|-------|-------|
| 3 consecutive clean demo runs | S6 |
| Backup video recorded | S6 |
| No P0 bugs open | Lead |

---

## G7 · Hour 29 — Ship

| Check | Owner |
|-------|-------|
| Devpost submitted | Lead |
| Repo README + demo GIF | Lead |
| Dependencies frozen | Lead |

---

## Conflict resolution

| Issue | Rule |
|-------|------|
| API shape change | S0 lead approves; bump `API_VERSION` |
| Seed fact change | S5 + S6 both approve |
| UI blocks on backend | S4 uses fixtures until next gate |
| Behind schedule | Cut P1 per [07-PRIORITIES.md](./07-PRIORITIES.md) |

---

## Daily standup (15 min at H4, H8, H12, H17, H22)

1. Gate status — pass / fail  
2. Blockers on contracts  
3. Cut list if failing next gate  
