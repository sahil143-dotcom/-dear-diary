from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class ExtractedEntity(BaseModel):
    kind: Literal["person", "project", "place", "theme", "emotion", "commitment"]
    name: str


class IngestEntryRequest(BaseModel):
    text: str
    date: str | None = None
    source: Literal["voice", "quick", "connector", "seed"] = "voice"
    audioPath: str | None = None


class IngestResult(BaseModel):
    entryId: str
    entities: list[ExtractedEntity]
    cogneeDatasetId: str


class MemoryQuery(BaseModel):
    lens: Literal["designer", "founder", "parent", "memory-keeper"]
    question: str
    dateRange: dict[str, str] | None = None


class AgentStep(BaseModel):
    step: str
    label: str
    status: Literal["pending", "running", "done"] = "done"
    meta: dict | None = None


class PatternCard(BaseModel):
    id: str
    title: str
    body: str
    severity: Literal["info", "warn"] | None = None
    contrast: dict[str, str] | None = None


class Citation(BaseModel):
    entryId: str
    date: str
    quote: str
    audioPath: str | None = None


class MemoryAnswer(BaseModel):
    narrative: str
    patternCards: list[PatternCard] = Field(default_factory=list)
    citations: list[Citation] = Field(default_factory=list)
    voiceScript: str
    agentSteps: list[AgentStep] = Field(default_factory=list)


class LensItem(BaseModel):
    id: str
    kind: str
    title: str
    subtitle: str | None = None
    date: str | None = None
    meta: dict | None = None


class LensViewModel(BaseModel):
    lens: str
    layout: Literal["timeline", "decisions", "calendar", "eras"]
    items: list[LensItem]


class SeedLoadRequest(BaseModel):
    profile: str = "maya-30d"


class SeedLoadResponse(BaseModel):
    loaded: int
    dataset: str
    profile: str


class ImproveRequest(BaseModel):
    entryId: str
    signal: Literal["mattered", "noise"]


class ConnectorEvent(BaseModel):
    source: str
    timestamp: str
    type: str
    title: str
    url: str | None = None
    linkedProjects: list[str] = Field(default_factory=list)


class ConnectorIngestRequest(BaseModel):
    events: list[ConnectorEvent]


class HealthResponse(BaseModel):
    ok: bool
    cognee: str
    version: str


class TranscribeResponse(BaseModel):
    text: str
    durationMs: int


class SpeakRequest(BaseModel):
    text: str
    voiceId: str | None = None


class SpeakResponse(BaseModel):
    audioBase64: str
    mimeType: str = "audio/mpeg"
