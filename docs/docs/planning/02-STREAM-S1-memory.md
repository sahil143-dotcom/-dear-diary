# STREAM S1 — Memory / Cognee local sidecar (Python · Hour 0–16)

**Goal:** FastAPI service that ingests diary text, runs Cognee `add` + `cognify`, and exposes search for the agent.

**Owner:** Backend / Python person  
**Folder:** `services/api/`  
**Port:** `8787`

---

## Dependencies

- S0 types mirrored as Pydantic models in `services/api/schemas.py`
- S6 seed script calls your endpoints (coordinate on dataset naming)

---

## Environment

```bash
COGNEE_DATA_PATH=./data/cognee
COGNEE_DB=kuzu
COGNEE_DATASET_PREFIX=dear-diary
API_PORT=8787
```

---

## Task list

### S1-01 · Hour 0–2 — Bootstrap
- [ ] `services/api/pyproject.toml` — fastapi, uvicorn, cognee, pydantic
- [ ] `main.py` with `GET /health`
- [ ] Cognee init — verify `add` + `cognify` on one test string
- [ ] Log graph DB path on startup

**Done when:** `curl localhost:8787/health` → `{"ok":true}` and one test entry in Kuzu.

### S1-02 · Hour 2–4 — Ingest
- [ ] `POST /ingest/entry` body: `{ text, date?, source?, audioPath? }`
- [ ] Dataset name: `dear-diary-{userId}` (use `default` for hackathon)
- [ ] Call `cognee.add(text, dataset_name=...)`
- [ ] Call `cognee.cognify()` async or sync (document choice)
- [ ] Return `IngestResult` with entryId + entities (from cognify metadata or Gemma extract via S2 hook)

**Stub OK until Hour 4:** return fake entities; real cognify by Hour 8.

### S1-03 · Hour 4–8 — Search wrappers
- [ ] `cognee_search(query, search_type, dataset, filters?)` helper
- [ ] Map lens → Cognee search types:
  - designer → INSIGHTS
  - founder → SUMMARIES
  - parent → RAG (family keywords in query augmentation)
  - memory-keeper → CHUNKS + temporal sort
- [ ] `GET /entries?date=YYYY-MM-DD` — list from local index or cognee metadata

### S1-04 · Hour 8–10 — Seed endpoint
- [ ] `POST /seed/load` body: `{ profile: "maya-30d" }`
- [ ] Wipe dataset + bulk add 30 entries from `packages/seed/maya/`
- [ ] Run cognify batch (or per-entry if faster to debug)
- [ ] Return `{ loaded: 30, dataset: "..." }`

### S1-05 · Hour 10–12 — Improve / feedback
- [ ] `POST /improve` body: `{ entryId, signal: "mattered" | "noise" }`
- [ ] Wire to Cognee feedback if available; else store sidecar JSON metadata

### S1-06 · Hour 12–16 — Connector ingest (P1)
- [ ] `POST /ingest/connector` body: `{ events: ConnectorEvent[] }`
- [ ] Store as structured add() payloads with `source: github|calendar`
- [ ] Enable S2 contrast step

---

## File structure

```
services/api/
├── main.py
├── schemas.py          # Pydantic mirrors shared types
├── cognee_client.py    # add, cognify, search, seed
├── routes/
│   ├── health.py
│   ├── ingest.py
│   ├── query.py        # delegates to S2 agent after Hour 8
│   └── seed.py
└── data/cognee/        # gitignore
```

---

## Cognee usage pattern

```python
# cognee_client.py — reference implementation sketch

async def remember_entry(text: str, meta: dict) -> str:
    dataset = f"{PREFIX}-default"
    await cognee.add(text, dataset_name=dataset)
    await cognee.cognify(datasets=[dataset])
    entry_id = meta.get("id") or generate_id()
    return entry_id

async def search_for_lens(lens: str, question: str) -> list[dict]:
    search_type = LENS_SEARCH_MAP[lens]
    results = await cognee.search(
        query_text=question,
        datasets=[f"{PREFIX}-default"],
        query_type=search_type,
    )
    return normalize_results(results)
```

Adjust to actual Cognee API from your installed version / docs.

---

## Integration points

| Gate | S1 delivers |
|------|-------------|
| G1 (H4) | `/health` + stub `/ingest/entry` |
| G2 (H8) | Real cognify + `/seed/load` works |
| G3 (H12) | Search returns Arjun + abandon clusters for S2 |
| G5 (H22) | Stable under 3 concurrent queries |

---

## Do NOT

- Expose Cognee directly to Tauri frontend
- Block S4 on real cognify before Hour 4 (stub entities)
- Build admin dashboard routes

---

## Definition of done

- [ ] `demo-reset.sh` loads maya-30d in < 60s
- [ ] Ingest + search stable for demo questions Q1–Q4
- [ ] Data persists in `./data/cognee` across restarts
