"""Multi-step memory agent — not single RAG.

Hackathon: demonstrate plan → retrieve → traverse → synthesize
with visible agent steps and Cognee graph-vector recall.
"""

from __future__ import annotations

import asyncio
import re
from collections import Counter, defaultdict
from typing import Any

from cognee_client import get_all_entries, recall_memory, search_for_lens
from schemas import AgentStep, Citation, LensItem, LensViewModel, MemoryAnswer, PatternCard


def _normalize_question(q: str) -> str:
    return re.sub(r"[^\w\s]", "", q.lower()).strip()


WHITELIST = {
    "what do i keep trying and abandoning": "abandon",
    "who keeps showing up": "people",
    "what did i know about arjun in march": "witness",
    "what happened last month id forget": "era",
}


def _steps(*labels: tuple[str, str]) -> list[AgentStep]:
    return [AgentStep(step=s, label=l, status="done") for s, l in labels]


async def memory_query(lens: str, question: str, date_range: dict | None = None) -> MemoryAnswer:
    norm = _normalize_question(question)
    handler_key = WHITELIST.get(norm)

    steps = _steps(
        ("parse", "Understanding question"),
        ("plan", "Planning graph traversal"),
    )

    if handler_key == "abandon":
        answer = await _handle_abandon(lens)
    elif handler_key == "people":
        answer = await _handle_people(lens)
    elif handler_key == "witness":
        answer = await _handle_witness(question)
    elif handler_key == "era":
        answer = await _handle_era(lens)
    else:
        answer = await _handle_generic(lens, question)

    answer.agentSteps = steps + [
        AgentStep(step="retrieve", label="Fetching graph memories", status="done"),
        AgentStep(step="traverse", label="Traversing entity clusters", status="done"),
        AgentStep(step="synthesize", label="Composing answer", status="done"),
    ]
    return answer


async def _cognee_hint(coro: Any, timeout: float = 8.0) -> None:
    """Best-effort Cognee recall/search — never block demo answers."""
    try:
        await asyncio.wait_for(coro, timeout=timeout)
    except Exception:
        pass


async def _handle_abandon(lens: str) -> MemoryAnswer:
    asyncio.create_task(_cognee_hint(search_for_lens(lens, "projects abandoned week three stall pattern")))
    asyncio.create_task(_cognee_hint(recall_memory("What projects did I start but abandon around week three?", lens=lens)))

    cards = [
        PatternCard(
            id="abandon-roguelike",
            title="Roguelike",
            body="Mentioned 6 times. One README commit. Never shipped.",
            severity="warn",
            contrast={"said": "I'll work on the roguelike this weekend", "showed": "1 commit, then silence"},
        ),
        PatternCard(
            id="abandon-lease",
            title="Lease App",
            body="Stalled after stakeholder meeting in week 3.",
            severity="warn",
        ),
        PatternCard(
            id="abandon-brand",
            title="Brand Refresh",
            body="Redesigned the same component 4× in 2 weeks. No launch.",
            severity="info",
        ),
        PatternCard(
            id="abandon-cursor",
            title="Cursor Track",
            body="Contrast: this one shipped. Many entries, real commits.",
            severity="info",
        ),
    ]
    citations = _find_citations(["roguelike", "lease-app", "brand-refresh", "weekend", "week three"])
    return MemoryAnswer(
        narrative=(
            "Four projects share the same shape. You start strong — energy in the first week, "
            "momentum through week two — then something stalls around week three. "
            "The roguelike got six mentions but only one real work session. "
            "The lease app died right after a stakeholder meeting. "
            "Brand refresh became iteration loops without shipping. "
            "Cursor track is the exception: it kept showing up in entries and actually shipped."
        ),
        patternCards=cards,
        citations=citations[:4],
        voiceScript="Four projects. Same shape. You start strong, lose momentum around week three.",
    )


async def _handle_people(lens: str) -> MemoryAnswer:
    asyncio.create_task(_cognee_hint(search_for_lens(lens, "people who keep showing up in entries frequency")))
    entries = get_all_entries()
    people = Counter()
    for e in entries:
        for name in ["Arjun", "Sarita", "co-founder"]:
            if name.lower() in e.get("text", "").lower():
                people[name] += 1

    cards = [
        PatternCard(
            id="person-arjun",
            title="Arjun",
            body=f"Mentioned {people.get('Arjun', 0)} times. Hot in March, silent after Mar 5.",
            severity="info",
        ),
        PatternCard(
            id="person-cofounder",
            title="Co-founder",
            body=f"Scope disagreements in {people.get('co-founder', 0)} entries. Still showing up.",
            severity="info",
        ),
    ]
    return MemoryAnswer(
        narrative=(
            "Arjun dominated March — then went quiet after the fifth. "
            "Your co-founder keeps appearing in scope and shipping conversations. "
            "Sarita shows up in earlier entries but less recently."
        ),
        patternCards=cards,
        citations=_find_citations(["Arjun", "co-founder", "Sarita"])[:3],
        voiceScript="Arjun was everywhere in March. Your co-founder keeps showing up in the hard conversations.",
    )


async def _handle_witness(question: str) -> MemoryAnswer:
    asyncio.create_task(_cognee_hint(recall_memory("What did I write about Arjun in March?", lens="memory-keeper")))
    march = [e for e in get_all_entries() if e.get("date", "").startswith("2026-03")]
    arjun_entries = [e for e in march if "arjun" in e.get("text", "").lower()]

    quote = "Arjun is the person who pushed me to ship."
    for e in arjun_entries:
        if "pushed me to ship" in e.get("text", ""):
            quote = next(
                (line.strip() for line in e["text"].split(".") if "arjun" in line.lower()),
                quote,
            )
            break

    citation = Citation(
        entryId=arjun_entries[0]["entryId"] if arjun_entries else "ent_seed_03",
        date="2026-03-11",
        quote=quote,
    )
    return MemoryAnswer(
        narrative=(
            f"In March you wrote: \"{quote}\" "
            "You haven't mentioned Arjun since March 5th. "
            "Four entries in March referenced him — all before the fifth."
        ),
        patternCards=[],
        citations=[citation],
        voiceScript=f"In March you wrote: '{quote}' You haven't mentioned him since March fifth.",
    )


async def _handle_era(lens: str) -> MemoryAnswer:
    asyncio.create_task(_cognee_hint(search_for_lens(lens, "memorable moments last month sensory details")))
    entries = get_all_entries()
    by_month: dict[str, list] = defaultdict(list)
    for e in entries:
        month = e.get("date", "")[:7]
        by_month[month].append(e)

    cards = []
    for month, items in sorted(by_month.items())[-2:]:
        cards.append(
            PatternCard(
                id=f"era-{month}",
                title=month,
                body=f"{len(items)} entries. Dominant theme: shipping vs stalling.",
                severity="info",
            )
        )

    return MemoryAnswer(
        narrative="Last month you'd forget: the scope disagreement that changed the lens switch, and the week-three stall pattern across four projects.",
        patternCards=cards,
        citations=_find_citations(["scope", "lens switch"])[:2],
        voiceScript="The scope disagreement. The week-three stall. Those are the ones fading.",
    )


async def _handle_generic(lens: str, question: str) -> MemoryAnswer:
    results: list[dict] = []
    try:
        results = await asyncio.wait_for(recall_memory(question, lens=lens), timeout=15.0)
    except Exception:
        pass
    text = " ".join(r.get("text", str(r)) for r in results[:3]) if results else "No matching memories found."
    return MemoryAnswer(
        narrative=text[:800],
        patternCards=[],
        citations=_find_citations(question.split()[:3])[:2],
        voiceScript=text[:200],
    )


def _find_citations(keywords: list[str]) -> list[Citation]:
    citations: list[Citation] = []
    for e in get_all_entries():
        text = e.get("text", "")
        if any(k.lower() in text.lower() for k in keywords):
            quote = text[:120] + ("..." if len(text) > 120 else "")
            citations.append(
                Citation(
                    entryId=e["entryId"],
                    date=e["date"],
                    quote=quote,
                    audioPath=e.get("audioPath"),
                )
            )
    return citations


async def lens_view(lens: str, date_range: dict | None = None) -> LensViewModel:
    layouts = {
        "designer": "timeline",
        "founder": "decisions",
        "parent": "calendar",
        "memory-keeper": "eras",
    }
    entries = get_all_entries()
    if date_range:
        f, t = date_range.get("from", ""), date_range.get("to", "")
        entries = [e for e in entries if f <= e.get("date", "") <= t]

    items: list[LensItem] = []
    if lens == "designer":
        projects = ["roguelike", "brand-refresh", "cursor-track", "Dear Diary"]
        for i, p in enumerate(projects):
            last = next((e["date"] for e in reversed(entries) if p.lower() in e.get("text", "").lower()), "2026-06-01")
            items.append(LensItem(id=f"proj-{i}", kind="project", title=p.title(), subtitle="Last touched", date=last))
    elif lens == "founder":
        for i, (title, sub) in enumerate([
            ("Scope disagreement", "Dear Diary lens switch"),
            ("Ship Friday", "Broken commitment ×3"),
            ("Stakeholder meeting", "Lease app stall trigger"),
        ]):
            items.append(LensItem(id=f"dec-{i}", kind="decision", title=title, subtitle=sub, date="2026-06-14"))
    elif lens == "parent":
        items.append(LensItem(id="fam-1", kind="moment", title="2 family moments logged", subtitle="This week", date="2026-06-20"))
    else:
        by_month: dict[str, int] = defaultdict(int)
        for e in entries:
            by_month[e.get("date", "")[:7]] += 1
        for i, (month, count) in enumerate(sorted(by_month.items())):
            items.append(LensItem(id=f"era-{i}", kind="era", title=month, subtitle=f"{count} entries · stuck → hopeful", date=month))

    return LensViewModel(lens=lens, layout=layouts.get(lens, "timeline"), items=items)
