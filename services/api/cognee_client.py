"""Dear Diary — Cognee memory client.

Hackathon requirement: use the full Cognee memory lifecycle:
  remember() → recall() → improve() → forget()

This module wraps all four verbs plus lens-specific graph-vector retrieval.
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import cognee
from dotenv import load_dotenv

load_dotenv()

DATA_PATH = Path(os.getenv("COGNEE_DATA_PATH", "./data/cognee"))
DATASET_PREFIX = os.getenv("COGNEE_DATASET_PREFIX", "dear-diary")
DEFAULT_USER = "default"
SESSION_ID = "dear-diary-session"

# Local entry index (metadata Cognee doesn't expose cleanly for date filtering)
ENTRY_INDEX_PATH = DATA_PATH / "entry_index.json"

# Lens → Cognee search strategy (graph-vector hybrid per lens)
LENS_SEARCH_MAP: dict[str, str] = {
    "designer": "GRAPH_COMPLETION",
    "founder": "GRAPH_COMPLETION",
    "parent": "RAG_COMPLETION",
    "memory-keeper": "CHUNKS",
}

LENS_RECALL_AUGMENT: dict[str, str] = {
    "designer": "Focus on design iterations, projects, creative patterns, and abandon cycles.",
    "founder": "Focus on decisions, people, scope disagreements, and commitments.",
    "parent": "Focus on family moments, children, and home life visibility.",
    "memory-keeper": "Focus on sensory memories, eras, and temporal clusters.",
}


def _dataset_name(user_id: str = DEFAULT_USER) -> str:
    return f"{DATASET_PREFIX}-{user_id}"


def _ensure_data_dir() -> None:
    DATA_PATH.mkdir(parents=True, exist_ok=True)
    if not ENTRY_INDEX_PATH.exists():
        ENTRY_INDEX_PATH.write_text("[]", encoding="utf-8")


def _load_index() -> list[dict[str, Any]]:
    _ensure_data_dir()
    try:
        return json.loads(ENTRY_INDEX_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def _save_index(entries: list[dict[str, Any]]) -> None:
    _ensure_data_dir()
    ENTRY_INDEX_PATH.write_text(json.dumps(entries, indent=2), encoding="utf-8")


def _entry_prefix(entry_id: str, date: str, source: str) -> str:
    return f"[ENTRY:{entry_id}|DATE:{date}|SOURCE:{source}]"


async def init_cognee() -> None:
    """Configure local Cognee storage (Kuzu graph + LanceDB vectors)."""
    _ensure_data_dir()
    os.environ.setdefault("SYSTEM_ROOT_DIRECTORY", str(DATA_PATH.resolve()))
    os.environ.setdefault("GRAPH_DATABASE_PROVIDER", os.getenv("COGNEE_DB", "kuzu"))


async def remember_entry(
    text: str,
    *,
    entry_id: str | None = None,
    date: str | None = None,
    source: str = "voice",
    audio_path: str | None = None,
    user_id: str = DEFAULT_USER,
) -> tuple[str, str]:
    """remember() — ingest diary text into the knowledge graph."""
    entry_id = entry_id or f"ent_{uuid.uuid4().hex[:10]}"
    date = date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    dataset = _dataset_name(user_id)

    enriched = (
        f"{_entry_prefix(entry_id, date, source)}\n"
        f"Diary entry for {date}:\n{text}\n"
    )
    if audio_path:
        enriched += f"\nAudio recording: {audio_path}"

    await _remember(enriched, dataset)
    await _remember(
        f"Latest entry {entry_id} on {date}: {text[:200]}",
        dataset,
        session_id=SESSION_ID,
    )

    index = _load_index()
    index.append(
        {
            "entryId": entry_id,
            "date": date,
            "text": text,
            "source": source,
            "audioPath": audio_path,
            "dataset": dataset,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
    )
    _save_index(index)
    return entry_id, dataset


async def _remember(text: str, dataset: str, session_id: str | None = None) -> None:
    """Call remember() with fallbacks to add+cognify for older Cognee versions."""
    try:
        if session_id:
            await cognee.remember(text, session_id=session_id, dataset_name=dataset)
        else:
            await cognee.remember(text, dataset_name=dataset)
        return
    except TypeError:
        pass
    try:
        await cognee.add(text, dataset_name=dataset)
        await cognee.cognify(datasets=[dataset])
    except Exception:
        await cognee.add(text, dataset_name=dataset)


async def recall_memory(
    question: str,
    *,
    lens: str = "designer",
    user_id: str = DEFAULT_USER,
    session_first: bool = True,
) -> list[Any]:
    """recall() — auto-routed graph-vector retrieval."""
    dataset = _dataset_name(user_id)
    augment = LENS_RECALL_AUGMENT.get(lens, "")
    query = f"{question}\n\nContext lens: {lens}. {augment}"

    if session_first:
        session_results = await _recall(query, dataset, session_id=SESSION_ID)
        if session_results:
            return _normalize_results(session_results)

    return _normalize_results(await _recall(query, dataset))


async def _recall(query: str, dataset: str, session_id: str | None = None) -> Any:
    try:
        if session_id:
            return await cognee.recall(query, session_id=session_id, dataset_name=dataset)
        return await cognee.recall(query, dataset_name=dataset)
    except (TypeError, AttributeError):
        return await cognee.search(query_text=query, datasets=[dataset])


async def search_for_lens(
    lens: str,
    question: str,
    *,
    user_id: str = DEFAULT_USER,
) -> list[dict[str, Any]]:
    """Deep search using lens-specific graph-vector strategy."""
    dataset = _dataset_name(user_id)
    augment = LENS_RECALL_AUGMENT.get(lens, "")
    query = f"{question}\n\n{lens} lens: {augment}"

    try:
        from cognee.modules.search.types import SearchType

        search_type_name = LENS_SEARCH_MAP.get(lens, "GRAPH_COMPLETION")
        search_type = getattr(SearchType, search_type_name, SearchType.GRAPH_COMPLETION)
        raw = await cognee.search(
            query_text=query,
            datasets=[dataset],
            query_type=search_type,
        )
    except (ImportError, AttributeError, TypeError):
        raw = await cognee.recall(query, dataset_name=dataset)

    return _normalize_results(raw)


async def improve_memory(
    *,
    entry_id: str | None = None,
    signal: str = "mattered",
    user_id: str = DEFAULT_USER,
) -> None:
    """improve() / memify — enrich graph from user feedback."""
    dataset = _dataset_name(user_id)
    feedback = (
        f"User feedback on entry {entry_id or 'unknown'}: "
        f"signal={signal}. "
        f"{'This memory mattered — increase relevance weight.' if signal == 'mattered' else 'This was noise — decrease relevance weight.'}"
    )
    await _remember(feedback, dataset, session_id=SESSION_ID)
    try:
        await cognee.improve(datasets=[dataset])
    except TypeError:
        try:
            await cognee.improve()
        except Exception:
            pass


async def forget_dataset(*, user_id: str = DEFAULT_USER) -> None:
    """forget() — wipe dataset for demo reset."""
    dataset = _dataset_name(user_id)
    try:
        await cognee.forget(dataset=dataset)
    except TypeError:
        try:
            await cognee.forget(datasets=[dataset])
        except Exception:
            try:
                from cognee.api.v1.prune import prune

                await prune.prune_data([dataset])
            except Exception:
                pass
    _save_index([])


def extract_entities_from_text(text: str) -> list[dict[str, str]]:
    """Lightweight entity extraction for UI bloom (Cognee cognify runs async)."""
    entities: list[dict[str, str]] = []
    patterns = [
        (r"\b(Arjun|Sarita|co-founder)\b", "person"),
        (r"\b(roguelike|lease-app|brand-refresh|cursor-track|Dear Diary)\b", "project"),
        (r"\b(stuck|proud|exhausted|hopeful|anxious)\b", "emotion"),
        (r"\b(ship Friday|this weekend)\b", "commitment"),
    ]
    seen: set[str] = set()
    for pattern, kind in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            name = match.group(1)
            key = f"{kind}:{name.lower()}"
            if key not in seen:
                seen.add(key)
                entities.append({"kind": kind, "name": name})
    return entities


def get_entries_by_date(date: str) -> list[dict[str, Any]]:
    return [e for e in _load_index() if e.get("date") == date]


def get_all_entries() -> list[dict[str, Any]]:
    return _load_index()


def _normalize_results(raw: Any) -> list[dict[str, Any]]:
    if raw is None:
        return []
    if isinstance(raw, str):
        return [{"text": raw, "score": 1.0}]
    if isinstance(raw, dict):
        return [raw]
    if isinstance(raw, list):
        out: list[dict[str, Any]] = []
        for item in raw:
            if isinstance(item, str):
                out.append({"text": item})
            elif isinstance(item, dict):
                out.append(item)
            else:
                out.append({"text": str(item)})
        return out
    return [{"text": str(raw)}]


def run_async(coro: Any) -> Any:
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor() as pool:
                return pool.submit(asyncio.run, coro).result()
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)
