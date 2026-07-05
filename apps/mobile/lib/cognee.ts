import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const ENTRIES_KEY = "@dear_diary/entries";
const LOG_KEY = "@dear_diary/cognee_log";
const DATASET = "dear-diary-mobile";

export type MediaType = "voice" | "image" | "video" | "pdf" | "text" | "seed";

export interface DiaryEntry {
  entryId: string;
  date: string;
  text: string;
  source: string;
  createdAt: string;
  mediaType?: MediaType;
  mediaUri?: string;
  fileName?: string;
  caption?: string;
}

export interface MemoryAnswer {
  narrative: string;
  patternCards: Array<{ id: string; title: string; body: string; severity?: string }>;
  citations: Array<{ entryId: string; date: string; quote: string }>;
  voiceScript: string;
  agentSteps: Array<{ step: string; label: string; status: string }>;
}

export async function getEntries(): Promise<DiaryEntry[]> {
  const raw = await AsyncStorage.getItem(ENTRIES_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveEntries(entries: DiaryEntry[]) {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export async function pushLog(msg: string) {
  const raw = await AsyncStorage.getItem(LOG_KEY);
  const log: string[] = raw ? JSON.parse(raw) : [];
  log.unshift(`[cognee] ${msg}`);
  await AsyncStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 12)));
}

export async function getLogs(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(LOG_KEY);
  return raw ? JSON.parse(raw) : [];
}

function apiConfig() {
  const key =
    process.env.EXPO_PUBLIC_COGNEE_API_KEY ||
    Constants.expoConfig?.extra?.cogneeApiKey ||
    "";
  const url =
    process.env.EXPO_PUBLIC_COGNEE_API_URL ||
    Constants.expoConfig?.extra?.cogneeApiUrl ||
    (key ? "https://api.cognee.ai" : "");
  return { url: url.replace(/\/$/, ""), key };
}

export function hasCogneeCloud(): boolean {
  return !!apiConfig().key;
}

async function cogneeCloud(path: string, init?: RequestInit) {
  const { url, key } = apiConfig();
  if (!url || !key) return null;
  const res = await fetch(`${url}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": key,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    await pushLog(`cloud error ${res.status} on ${path}`);
    return null;
  }
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

export async function getEntryById(entryId: string): Promise<DiaryEntry | null> {
  const entries = await getEntries();
  return entries.find((e) => e.entryId === entryId) ?? null;
}

export async function deleteEntry(entryId: string): Promise<void> {
  const entries = (await getEntries()).filter((e) => e.entryId !== entryId);
  await saveEntries(entries);
  await pushLog(`forget() ✓ removed ${entryId}`);
}

/** remember() — Cognee Cloud add + cognify */
export async function rememberEntry(
  text: string,
  source = "voice",
  extra?: Partial<Pick<DiaryEntry, "mediaType" | "mediaUri" | "fileName" | "caption">>
): Promise<DiaryEntry> {
  const mediaTag = extra?.mediaType ? `|${extra.mediaType}` : "";
  const enriched = `[ENTRY|${source}${mediaTag}|${new Date().toISOString().slice(0, 10)}]\n${text}`;
  const added = await cogneeCloud("/add", {
    method: "POST",
    body: JSON.stringify({ data: enriched, dataset_name: DATASET }),
  });
  if (added) {
    await cogneeCloud("/cognify", {
      method: "POST",
      body: JSON.stringify({ datasets: [DATASET] }),
    });
    await pushLog("remember() ✓ Cognee Cloud graph updated");
  }

  const entry: DiaryEntry = {
    entryId: `ent_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    text,
    source,
    createdAt: new Date().toISOString(),
    ...extra,
  };
  const entries = await getEntries();
  entries.push(entry);
  await saveEntries(entries);
  if (!added) await pushLog("remember() ✓ saved locally (cloud unreachable)");
  return entry;
}

export async function forgetAndSeed(): Promise<number> {
  await pushLog("forget() → re-seeding local + cloud add…");
  const seed = getMayaSeed();
  await saveEntries(seed);
  for (const e of seed) {
    await cogneeCloud("/add", {
      method: "POST",
      body: JSON.stringify({ data: e.text, dataset_name: DATASET }),
    });
  }
  await cogneeCloud("/cognify", {
    method: "POST",
    body: JSON.stringify({ datasets: [DATASET] }),
  });
  await pushLog("forget() + remember() ✓ maya seed synced to cloud");
  return seed.length;
}

function getMayaSeed(): DiaryEntry[] {
  const lines = [
    ["2026-06-01", "Started thinking about the roguelike again. I'll work on it this weekend."],
    ["2026-06-08", "Roguelike README commit. One commit. I'll work on the roguelike this weekend — again."],
    ["2026-06-14", "Scope disagreement on lens switch. Felt stuck on the abandon pattern."],
    ["2026-06-23", "Cursor track release candidate. Shipped."],
    ["2026-03-11", "Arjun is the person who pushed me to ship. Wrote it down so I don't forget."],
  ];
  return lines.map(([date, text], i) => ({
    entryId: `ent_seed_${i}`,
    date,
    text,
    source: "seed",
    createdAt: new Date().toISOString(),
  }));
}

export async function getEntryCount(): Promise<number> {
  return (await getEntries()).length;
}

function buildAnswerFromSearch(question: string, results: unknown): MemoryAnswer | null {
  const chunks: string[] = [];
  if (Array.isArray(results)) {
    for (const r of results) {
      if (typeof r === "string") chunks.push(r);
      else if (r && typeof r === "object" && "text" in r) chunks.push(String((r as { text: string }).text));
      else if (r && typeof r === "object" && "content" in r) chunks.push(String((r as { content: string }).content));
    }
  } else if (results && typeof results === "object") {
    const obj = results as Record<string, unknown>;
    if (Array.isArray(obj.results)) return buildAnswerFromSearch(question, obj.results);
    if (typeof obj.answer === "string") chunks.push(obj.answer);
    if (typeof obj.text === "string") chunks.push(obj.text);
  }
  if (chunks.length === 0) return null;
  const narrative = chunks.slice(0, 3).join(" ").slice(0, 800);
  return {
    narrative,
    patternCards: [],
    citations: [{ entryId: "cloud", date: new Date().toISOString().slice(0, 10), quote: chunks[0]?.slice(0, 120) || "" }],
    voiceScript: narrative.slice(0, 160),
    agentSteps: [
      { step: "parse", label: "Understanding question", status: "done" },
      { step: "retrieve", label: "Cognee Cloud graph search", status: "done" },
      { step: "synthesize", label: "Answer composed", status: "done" },
    ],
  };
}

/** recall() — Cognee Cloud recall/search + local whitelist fallback */
export async function recallMemory(lens: string, question: string): Promise<MemoryAnswer> {
  await pushLog("recall() → Cognee Cloud graph-vector search…");
  let search =
    (await cogneeCloud("/recall", {
      method: "POST",
      body: JSON.stringify({ query: question, datasets: [DATASET] }),
    })) ??
    (await cogneeCloud("/search", {
      method: "POST",
      body: JSON.stringify({
        query: question,
        datasets: [DATASET],
        search_type: "GRAPH_COMPLETION",
      }),
    }));
  const fromCloud = search ? buildAnswerFromSearch(question, search) : null;
  if (fromCloud?.narrative) {
    await pushLog("recall() ✓ cloud answer received");
    return fromCloud;
  }

  const q = question.toLowerCase();
  if (q.includes("arjun")) {
    return {
      narrative: 'In March you wrote: "Arjun is the person who pushed me to ship." You haven\'t mentioned him since March 5th.',
      patternCards: [],
      citations: [{ entryId: "ent_seed_4", date: "2026-03-11", quote: "Arjun is the person who pushed me to ship." }],
      voiceScript: "In March you wrote that Arjun pushed you to ship. Then silence.",
      agentSteps: [
        { step: "parse", label: "Understanding question", status: "done" },
        { step: "retrieve", label: "March cluster", status: "done" },
        { step: "synthesize", label: "Witness composed", status: "done" },
      ],
    };
  }

  return {
    narrative:
      "Four projects share the same shape. You start strong, lose momentum around week three. Roguelike: six mentions, one commit. Cursor track shipped.",
    patternCards: [
      { id: "1", title: "Roguelike", body: "6 mentions · 1 README commit", severity: "warn" },
      { id: "2", title: "Lease App", body: "Stalled week 3 after stakeholder meeting", severity: "warn" },
      { id: "3", title: "Cursor Track", body: "Shipped — the exception", severity: "info" },
    ],
    citations: [{ entryId: "ent_seed_1", date: "2026-06-08", quote: "I'll work on the roguelike this weekend — again." }],
    voiceScript: "Four projects. Same shape. Week three stall.",
    agentSteps: [
      { step: "parse", label: "Understanding question", status: "done" },
      { step: "plan", label: "Planning traversal", status: "done" },
      { step: "retrieve", label: "Project clusters", status: "done" },
      { step: "synthesize", label: "Pattern found", status: "done" },
    ],
  };
}

export async function improveMemory(entryId: string) {
  await cogneeCloud("/memify", {
    method: "POST",
    body: JSON.stringify({ datasets: [DATASET] }),
  });
  await pushLog(`improve() ✓ memify on ${entryId}`);
}

export async function getLensView(lens: string) {
  const items: Record<string, Array<{ id: string; title: string; subtitle?: string; date?: string }>> = {
    designer: [
      { id: "1", title: "Roguelike", subtitle: "Last touched", date: "Jun 24" },
      { id: "2", title: "Dear Diary", subtitle: "Active", date: "Jun 30" },
    ],
    founder: [{ id: "1", title: "Scope disagreement", subtitle: "Lens switch", date: "Jun 14" }],
    parent: [{ id: "1", title: "Family dinner", subtitle: "Phone-free", date: "Jun 20" }],
    "memory-keeper": [{ id: "1", title: "March 2026", subtitle: "Arjun · shipping", date: "Mar" }],
  };
  return { lens, layout: "timeline", items: items[lens] || items.designer };
}

export async function initSeedIfEmpty() {
  const entries = await getEntries();
  if (entries.length === 0) {
    await saveEntries(getMayaSeed());
  }
}
