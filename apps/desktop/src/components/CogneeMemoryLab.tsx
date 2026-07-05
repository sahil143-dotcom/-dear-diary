import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiStatus, ingestEntry, queryMemory, seedLoad, improve } from "@/lib/api";
import { DEMO_CAPTURE } from "@/lib/fixtures";
import type { MemoryAnswer } from "@/lib/types";

const VERBS = [
  { id: "remember", icon: Brain, label: "remember()", desc: "Ingest → knowledge graph" },
  { id: "recall", icon: Sparkles, label: "recall()", desc: "Graph-vector traversal" },
  { id: "improve", icon: TrendingUp, label: "improve()", desc: "Feedback → memify" },
  { id: "forget", icon: Trash2, label: "forget()", desc: "Surgical prune" },
] as const;

export function CogneeMemoryLab() {
  const [status, setStatus] = useState({ online: false, entries: 0 });
  const [activeVerb, setActiveVerb] = useState<string>("remember");
  const [log, setLog] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);

  const pushLog = useCallback((msg: string) => {
    setLog((prev) => [`[cognee] ${msg}`, ...prev].slice(0, 8));
  }, []);

  useEffect(() => {
    getApiStatus().then((s) => setStatus({ online: s.online, entries: s.entries }));
  }, []);

  async function handleRemember() {
    setActiveVerb("remember");
    setCapturing(true);
    pushLog("remember() → structuring diary entry into graph…");
    const result = await ingestEntry(DEMO_CAPTURE, "voice");
    pushLog(`remember() ✓ entry ${result.entryId} → dataset ${result.cogneeDatasetId}`);
    setCapturing(false);
    const s = await getApiStatus();
    setStatus({ online: s.online, entries: s.entries });
  }

  async function handleRecall() {
    setActiveVerb("recall");
    setCapturing(true);
    pushLog("recall() → auto-routing graph + vector search…");
    await queryMemory("designer", "What do I keep trying and abandoning?");
    pushLog("recall() ✓ pattern cluster retrieved — scroll to Witness");
    setCapturing(false);
    document.getElementById("witness")?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleImprove() {
    setActiveVerb("improve");
    pushLog("improve() → memify enriching graph weights…");
    await improve("ent_demo", "mattered");
    pushLog("improve() ✓ feedback integrated");
  }

  async function handleForget() {
    setActiveVerb("forget");
    pushLog("forget() → pruning dataset…");
    await seedLoad();
    pushLog("forget() + remember() ✓ demo reset complete");
    const s = await getApiStatus();
    setStatus({ online: s.online, entries: s.entries });
  }

  return (
    <section id="memory" className="relative z-10 py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.25em] uppercase text-cognee mb-4">Powered by Cognee</p>
          <h2
            className="text-4xl md:text-6xl tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            The memory graph lives here
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Four verbs. One hybrid graph-vector engine. Your diary never wakes up with amnesia again.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${status.online ? "bg-cognee animate-pulse" : "bg-red-400"}`} />
            {status.online ? `${status.entries} nodes in local Kuzu graph` : "Offline · fixture mode active"}
          </div>
        </div>

        {/* Cognee verb terminal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {VERBS.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                if (v.id === "remember") handleRemember();
                else if (v.id === "recall") handleRecall();
                else if (v.id === "improve") handleImprove();
                else handleForget();
              }}
              className={`liquid-glass rounded-2xl p-6 text-left transition-all hover:scale-[1.02] ${
                activeVerb === v.id ? "ring-1 ring-cognee/50" : ""
              }`}
            >
              <v.icon className="w-5 h-5 text-cognee mb-3" />
              <p className="font-mono text-sm text-foreground">{v.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{v.desc}</p>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Live graph visualization */}
          <div className="liquid-glass rounded-2xl p-6 min-h-[280px] relative overflow-hidden">
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">Live graph activity</p>
            <svg className="w-full h-48" viewBox="0 0 400 180">
              {[
                [80, 90, 200, 60],
                [200, 60, 320, 90],
                [80, 90, 150, 140],
                [200, 60, 200, 120],
                [320, 90, 250, 140],
              ].map(([x1, y1, x2, y2], i) => (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="hsl(160 84% 39%)"
                  strokeWidth="1"
                  className={capturing ? "graph-thread" : ""}
                  opacity="0.5"
                />
              ))}
              {[
                { x: 80, y: 90, label: "Arjun" },
                { x: 200, y: 60, label: "Roguelike" },
                { x: 320, y: 90, label: "Dear Diary" },
                { x: 150, y: 140, label: "Mar 11" },
                { x: 250, y: 140, label: "Abandon" },
              ].map((n) => (
                <g key={n.label}>
                  <circle cx={n.x} cy={n.y} r="8" fill="hsl(160 84% 39% / 0.3)" stroke="hsl(160 84% 39%)" strokeWidth="1" />
                  <text x={n.x} y={n.y + 22} textAnchor="middle" fill="white" fontSize="9" opacity="0.7">{n.label}</text>
                </g>
              ))}
            </svg>
            <AnimatePresence>
              {capturing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                >
                  <p className="font-mono text-sm text-cognee">cognee.remember() running…</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Terminal log */}
          <div className="liquid-glass rounded-2xl p-6 min-h-[280px] font-mono text-xs">
            <p className="text-muted-foreground mb-4 uppercase tracking-wider">Memory pipeline</p>
            {log.length === 0 ? (
              <p className="text-muted-foreground">Click a Cognee verb to see the graph respond…</p>
            ) : (
              log.map((line, i) => (
                <p key={i} className={`mb-2 ${i === 0 ? "text-cognee" : "text-muted-foreground"}`}>
                  {line}
                </p>
              ))
            )}
          </div>
        </div>

        {/* Capture orb */}
        <div className="mt-12 flex flex-col items-center">
          <motion.button
            onClick={handleRemember}
            className="w-32 h-32 rounded-full liquid-glass cognee-pulse flex items-center justify-center text-4xl cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ◉
          </motion.button>
          <p className="text-muted-foreground text-sm mt-4">Hold silence. Speak memory. Cognee structures it.</p>
        </div>
      </div>
    </section>
  );
}

export function CogneeRecallPanel() {
  const [answer, setAnswer] = useState<MemoryAnswer | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask(q: string) {
    setLoading(true);
    setAnswer(null);
    const result = await queryMemory("designer", q);
    setAnswer(result);
    setLoading(false);
  }

  return (
    <section id="witness" className="relative z-10 py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="text-4xl md:text-5xl mb-8"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Ask the graph anything
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            "What do I keep trying and abandoning?",
            "What did I know about Arjun in March?",
            "Who keeps showing up?",
          ].map((q) => (
            <Button key={q} variant="default" size="sm" onClick={() => ask(q)} disabled={loading}>
              {q}
            </Button>
          ))}
        </div>

        {loading && (
          <p className="font-mono text-sm text-cognee animate-pulse">cognee.recall() traversing graph…</p>
        )}

        {answer && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass rounded-2xl p-8 text-left"
          >
            <div className="flex flex-wrap gap-2 mb-6">
              {answer.agentSteps.map((s) => (
                <span key={s.step} className="text-[10px] px-2 py-1 rounded-full bg-cognee/10 text-cognee border border-cognee/20">
                  {s.label}
                </span>
              ))}
            </div>
            <p className="text-lg leading-relaxed mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {answer.narrative}
            </p>
            <div className="grid gap-3">
              {answer.patternCards.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-muted-foreground">{c.body}</p>
                </div>
              ))}
            </div>
            {answer.voiceScript && (
              <p className="mt-6 italic text-muted-foreground">"{answer.voiceScript}"</p>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
