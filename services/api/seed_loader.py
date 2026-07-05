"""Load Maya 30-day seed into Cognee via remember() + forget() reset."""

from __future__ import annotations

import json
from pathlib import Path

from cognee_client import DEFAULT_USER, _dataset_name, extract_entities_from_text, forget_dataset, remember_entry

SEED_DIR = Path(__file__).resolve().parents[2] / "packages" / "seed" / "maya"


async def load_maya_seed() -> tuple[int, str]:
    try:
        await forget_dataset(user_id=DEFAULT_USER)
    except Exception:
        pass
    loaded = 0
    dataset = _dataset_name(DEFAULT_USER)

    for day_file in sorted(SEED_DIR.glob("day-*.json")):
        data = json.loads(day_file.read_text(encoding="utf-8"))
        entry_id = f"ent_seed_{day_file.stem.split('-')[1]}"
        try:
            await remember_entry(
                data["text"],
                entry_id=entry_id,
                date=data["date"],
                source="seed",
            )
        except Exception:
            # Fallback: populate local index when LLM/cognify unavailable (dev without API key)
            from cognee_client import _load_index, _save_index
            from datetime import datetime, timezone

            index = _load_index()
            index.append(
                {
                    "entryId": entry_id,
                    "date": data["date"],
                    "text": data["text"],
                    "source": "seed",
                    "dataset": dataset,
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                }
            )
            _save_index(index)
        loaded += 1

    return loaded, dataset
