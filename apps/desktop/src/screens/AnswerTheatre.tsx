import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AgentStrip from "../components/AgentStrip";
import { improve, queryMemory } from "../lib/api";
import type { MemoryAnswer } from "../lib/types";
import { FIXTURE_ABANDON } from "../lib/fixtures";

interface Answer extends MemoryAnswer {}

export default function AnswerTheatre() {
  const [params] = useSearchParams();
  const lens = params.get("lens") ?? "designer";
  const question = params.get("q") ?? "What do I keep trying and abandoning?";
  const navigate = useNavigate();

  const [phase, setPhase] = useState<"thinking" | "revealed">("thinking");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [activeCitation, setActiveCitation] = useState<string | null>(null);
  const [improved, setImproved] = useState(false);

  useEffect(() => {
    setPhase("thinking");
    setAnswer(null);
    const t = setTimeout(async () => {
      const result = await queryMemory(lens, question);
      setAnswer(result);
      setPhase("revealed");
    }, 100);
    return () => clearTimeout(t);
  }, [lens, question]);

  const steps =
    answer?.agentSteps ??
    FIXTURE_ABANDON.agentSteps.map((s) => ({ ...s, status: "pending" as const }));

  return (
    <div className="min-h-screen py-16 px-4 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-[var(--muted)] text-sm mb-8 hover:text-white transition"
      >
        ← back
      </button>

      <motion.p
        className="serif text-[var(--muted)] text-sm mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {question}
      </motion.p>

      <div className="mb-10">
        <AgentStrip steps={steps} animate={phase === "thinking"} />
      </div>

      {phase === "thinking" && (
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center text-[var(--muted)] text-sm cognee-verb"
        >
          cognee.recall() → graph traversal in progress…
        </motion.p>
      )}

      {phase === "revealed" && answer && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.p className="text-lg leading-relaxed mb-8 serif">{answer.narrative}</motion.p>

          {answer.patternCards.length > 0 && (
            <div className="grid gap-3 mb-8">
              {answer.patternCards.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl glass"
                  style={{
                    borderLeft: `3px solid ${c.severity === "warn" ? "var(--entity-emotion)" : "var(--entity-project)"}`,
                  }}
                >
                  <h4 className="font-semibold">{c.title}</h4>
                  <p className="text-sm text-[var(--muted)] mt-1">{c.body}</p>
                </motion.div>
              ))}
            </div>
          )}

          {answer.citations.map((c) => (
            <motion.button
              key={c.entryId}
              onClick={() => setActiveCitation(c.entryId)}
              className={`block w-full text-left mb-3 p-4 rounded-lg border transition ${
                activeCitation === c.entryId
                  ? "border-[var(--accent-designer)] bg-[var(--accent-designer)]/10"
                  : "border-white/10 glass"
              }`}
            >
              <span className="serif text-xs text-[var(--muted)]">{c.date}</span>
              <p className="text-sm mt-1 italic">"{c.quote}"</p>
            </motion.button>
          ))}

          {answer.voiceScript && (
            <motion.div
              className="mt-8 p-4 rounded-xl glass border border-[var(--accent-keeper)]/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-[var(--accent-keeper)] mb-2 uppercase tracking-wider">
                Voice script · Gradium
              </p>
              <p className="italic text-[var(--accent-keeper)]">"{answer.voiceScript}"</p>
            </motion.div>
          )}

          <div className="flex gap-3 mt-8">
            <button
              onClick={async () => {
                await improve(answer.citations[0]?.entryId ?? "ent_demo", "mattered");
                setImproved(true);
              }}
              disabled={improved}
              className="px-4 py-2 rounded-full text-xs border border-[var(--cognee-glow)]/40 text-[var(--cognee-glow)] disabled:opacity-50"
            >
              {improved ? "cognee.improve() ✓" : "This mattered → improve()"}
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-full text-xs text-[var(--muted)] border border-white/10"
            >
              Return to orb
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
