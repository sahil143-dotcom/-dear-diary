import {
  FIXTURE_ABANDON,
  FIXTURE_ARJUN,
  FIXTURE_INGEST,
  FIXTURE_LENS,
} from "./fixtures";
import type { LensId, LensViewModel, MemoryAnswer, IngestResult } from "./types";

const PORTS = [
  import.meta.env.VITE_API_URL,
  "http://127.0.0.1:8787",
  "http://127.0.0.1:8788",
].filter(Boolean) as string[];

let resolvedBase: string | null = null;

async function resolveBase(): Promise<string> {
  if (resolvedBase) return resolvedBase;
  for (const base of PORTS) {
    try {
      const r = await fetch(`${base}/health`, { signal: AbortSignal.timeout(1500) });
      if (r.ok) {
        resolvedBase = base;
        return base;
      }
    } catch {
      /* try next */
    }
  }
  resolvedBase = PORTS[0] ?? "http://127.0.0.1:8787";
  return resolvedBase;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const base = await resolveBase();
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  return res.json();
}

export async function getApiStatus() {
  try {
    const base = await resolveBase();
    const health = await api<{ ok: boolean; cognee: string }>("/health");
    const mem = await api<{ entries: number; verbs: string[] }>("/memory/status");
    return { online: health.ok, base, entries: mem.entries, verbs: mem.verbs };
  } catch {
    return { online: false, base: null, entries: 0, verbs: ["remember", "recall", "improve", "forget"] };
  }
}

export async function seedLoad() {
  try {
    return await api<{ loaded: number }>("/seed/load", {
      method: "POST",
      body: JSON.stringify({ profile: "maya-30d" }),
    });
  } catch {
    return { loaded: 34 };
  }
}

export async function ingestEntry(text: string, source = "voice") {
  try {
    return await api<typeof FIXTURE_INGEST>("/ingest/entry", {
      method: "POST",
      body: JSON.stringify({ text, source }),
    });
  } catch {
    return FIXTURE_INGEST;
  }
}

export async function queryMemory(lens: string, question: string): Promise<MemoryAnswer> {
  const q = question.toLowerCase();
  try {
    return await api<MemoryAnswer>("/query/memory", {
      method: "POST",
      body: JSON.stringify({ lens, question }),
    });
  } catch {
    if (q.includes("arjun")) return FIXTURE_ARJUN;
    return FIXTURE_ABANDON;
  }
}

export async function queryLensView(lens: string): Promise<LensViewModel> {
  try {
    return await api<LensViewModel>("/query/lens-view", {
      method: "POST",
      body: JSON.stringify({ lens, question: "" }),
    });
  } catch {
    return FIXTURE_LENS[lens as LensId] ?? FIXTURE_LENS.designer;
  }
}

export async function improve(entryId: string, signal: "mattered" | "noise") {
  try {
    return await api("/improve", {
      method: "POST",
      body: JSON.stringify({ entryId, signal }),
    });
  } catch {
    return { ok: true };
  }
}

export function resetApiCache() {
  resolvedBase = null;
}
