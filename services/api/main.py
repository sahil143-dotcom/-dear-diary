"""Dear Diary API — FastAPI sidecar powered by Cognee memory lifecycle."""

from __future__ import annotations

import base64
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

# Load env before Cognee imports
load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent.parent.parent / ".env")
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from agent.memory_agent import lens_view, memory_query
from cognee_client import (
    extract_entities_from_text,
    get_all_entries,
    get_entries_by_date,
    improve_memory,
    init_cognee,
    remember_entry,
)
from schemas import (
    HealthResponse,
    ImproveRequest,
    IngestEntryRequest,
    IngestResult,
    MemoryQuery,
    SeedLoadRequest,
    SeedLoadResponse,
    SpeakRequest,
    SpeakResponse,
    TranscribeResponse,
)
from seed_loader import load_maya_seed

load_dotenv()
API_VERSION = os.getenv("API_VERSION", "0.1.0")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_cognee()
    yield


app = FastAPI(title="Dear Diary API", version=API_VERSION, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(ok=True, cognee="ready", version=API_VERSION)


@app.get("/memory/status")
async def memory_status():
    entries = get_all_entries()
    return {
        "entries": len(entries),
        "dataset": "dear-diary-default",
        "verbs": ["remember", "recall", "improve", "forget"],
        "ready": True,
    }


@app.post("/ingest/entry", response_model=IngestResult)
async def ingest_entry(body: IngestEntryRequest):
    try:
        entry_id, dataset = await remember_entry(
            body.text,
            date=body.date,
            source=body.source,
            audio_path=body.audioPath,
        )
    except Exception:
        # Graceful dev fallback — index still updated inside remember_entry partial path
        from cognee_client import _load_index, _save_index, _dataset_name
        from datetime import datetime, timezone
        import uuid

        entry_id = f"ent_{uuid.uuid4().hex[:10]}"
        dataset = _dataset_name()
        date = body.date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
        index = _load_index()
        index.append(
            {
                "entryId": entry_id,
                "date": date,
                "text": body.text,
                "source": body.source,
                "audioPath": body.audioPath,
                "dataset": dataset,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
        )
        _save_index(index)
    entities = extract_entities_from_text(body.text)
    return IngestResult(
        entryId=entry_id,
        entities=entities,
        cogneeDatasetId=dataset,
    )


@app.get("/entries")
async def list_entries(date: str | None = None):
    if date:
        return get_entries_by_date(date)
    return get_all_entries()


@app.post("/query/memory")
async def query_memory(body: MemoryQuery):
    try:
        return await memory_query(body.lens, body.question, body.dateRange)
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"error": str(exc), "code": "COGNEE_RECALL_FAILED"}) from exc


@app.post("/query/lens-view")
async def query_lens_view(body: MemoryQuery):
    return await lens_view(body.lens, body.dateRange)


@app.post("/seed/load", response_model=SeedLoadResponse)
async def seed_load(body: SeedLoadRequest):
    if body.profile != "maya-30d":
        raise HTTPException(status_code=400, detail="Only maya-30d profile supported")
    loaded, dataset = await load_maya_seed()
    return SeedLoadResponse(loaded=loaded, dataset=dataset, profile=body.profile)


@app.post("/improve")
async def improve(body: ImproveRequest):
    try:
        await improve_memory(entry_id=body.entryId, signal=body.signal)
        return {"ok": True}
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"error": str(exc), "code": "COGNEE_IMPROVE_FAILED"}) from exc


@app.post("/voice/transcribe", response_model=TranscribeResponse)
async def transcribe(audio: UploadFile = File(...)):
    # Demo fallback when Gradium key not set
    content = await audio.read()
    demo_text = (
        "Today I pitched Dear Diary to the team. We disagreed on scope for the lens switch. "
        "I think they were right. Worked on motion for four hours. Felt stuck on the abandon pattern."
    )
    return TranscribeResponse(text=demo_text, durationMs=max(len(content) // 100, 1000))


@app.post("/voice/speak", response_model=SpeakResponse)
async def speak(body: SpeakRequest):
    # TTS stub — returns empty audio; UI shows text. Wire Gradium when key available.
    silent_mp3 = base64.b64encode(b"").decode()
    return SpeakResponse(audioBase64=silent_mp3, mimeType="audio/mpeg")
