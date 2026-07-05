# API contract — FastAPI sidecar `:8787`

Base URL: `http://127.0.0.1:8787`  
All JSON unless noted. Types match `packages/shared/src/types.ts`.

---

## Health

### `GET /health`

**Response 200**
```json
{ "ok": true, "cognee": "ready", "version": "0.1.0" }
```

---

## Ingest

### `POST /ingest/entry`

**Request**
```json
{
  "text": "Today I worked on...",
  "date": "2026-07-05",
  "source": "voice",
  "audioPath": "optional/path.webm"
}
```

**Response 200**
```json
{
  "entryId": "ent_abc123",
  "entities": [
    { "kind": "person", "name": "Arjun" },
    { "kind": "project", "name": "Dear Diary" },
    { "kind": "emotion", "name": "stuck" }
  ],
  "cogneeDatasetId": "dear-diary-default"
}
```

---

## Voice

### `POST /voice/transcribe`

**Request:** `multipart/form-data` field `audio` (webm/wav)

**Response 200**
```json
{
  "text": "transcript...",
  "durationMs": 45000
}
```

### `POST /voice/speak`

**Request**
```json
{
  "text": "Four projects. Same shape.",
  "voiceId": "optional-gradium-voice-id"
}
```

**Response 200:** `audio/mpeg` body **OR**
```json
{ "audioBase64": "...", "mimeType": "audio/mpeg" }
```

---

## Query

### `POST /query/memory`

**Request**
```json
{
  "lens": "designer",
  "question": "What do I keep trying and abandoning?",
  "dateRange": { "from": "2026-06-01", "to": "2026-06-30" }
}
```

**Response 200:** `MemoryAnswer`
```json
{
  "narrative": "...",
  "patternCards": [
    {
      "id": "abandon-roguelike",
      "title": "Roguelike",
      "body": "Mentioned 6 times. One README commit.",
      "severity": "warn"
    }
  ],
  "citations": [
    {
      "entryId": "ent_seed_08",
      "date": "2026-06-08",
      "quote": "I'll work on the roguelike this weekend.",
      "audioPath": null
    }
  ],
  "voiceScript": "Four projects. Same shape. You start strong...",
  "agentSteps": [
    { "step": "parse", "label": "Understanding question", "status": "done" },
    { "step": "plan", "label": "Planning graph traversal", "status": "done" },
    { "step": "retrieve", "label": "Fetching project mentions", "status": "done" },
    { "step": "traverse", "label": "Finding abandon patterns", "status": "done" },
    { "step": "synthesize", "label": "Composing answer", "status": "done" }
  ]
}
```

---

### `POST /query/lens-view`

**Request**
```json
{
  "lens": "founder",
  "dateRange": { "from": "2026-06-01", "to": "2026-06-30" }
}
```

**Response 200:** `LensViewModel`
```json
{
  "lens": "founder",
  "layout": "decisions",
  "items": [
    {
      "id": "item_1",
      "kind": "decision",
      "title": "Scope disagreement",
      "subtitle": "Dear Diary lens switch",
      "date": "2026-06-14"
    }
  ]
}
```

---

## Seed

### `POST /seed/load`

**Request**
```json
{ "profile": "maya-30d" }
```

**Response 200**
```json
{
  "loaded": 30,
  "dataset": "dear-diary-default",
  "profile": "maya-30d"
}
```

---

## Feedback

### `POST /improve`

**Request**
```json
{
  "entryId": "ent_abc123",
  "signal": "mattered"
}
```

**Response 200**
```json
{ "ok": true }
```

---

## Connectors (P1)

### `POST /ingest/connector`

**Request**
```json
{
  "events": [
    {
      "source": "github",
      "timestamp": "2026-06-08T18:00:00Z",
      "type": "commit",
      "title": "update README",
      "url": "https://github.com/...",
      "linkedProjects": ["roguelike"]
    }
  ]
}
```

**Response 200**
```json
{ "ingested": 1 }
```

---

## Errors

```json
{
  "error": "human readable",
  "code": "COGNEE_COGNIFY_FAILED"
}
```

HTTP 503 if Cognee not ready (UI shows retry).

---

## Screen → API map

| UI action | Calls |
|-----------|-------|
| Hold orb, release | `POST /voice/transcribe` → `POST /ingest/entry` |
| Tap lens door + question | `POST /query/lens-view` (optional prefetch) → `POST /query/memory` |
| Lens toggle on answer screen | `POST /query/lens-view` |
| Citation tap | local `audioPath` or TTS quote via `/voice/speak` |
| This mattered | `POST /improve` |
| App launch (demo mode) | `POST /seed/load` |
| Play answer | `POST /voice/speak` with `voiceScript` |
