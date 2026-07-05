import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { DEMO_CAPTURE } from "../lib/fixtures";
import { ingestEntry } from "../lib/api";

interface Props {
  onComplete: (text: string, entities: Array<{ kind: string; name: string }>) => void;
  accent?: string;
}

type Phase = "idle" | "listening" | "remember" | "done";

export default function CaptureOrb({ onComplete, accent = "#7eb8da" }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [ripples, setRipples] = useState(0);

  async function capture() {
    setPhase("listening");
    setRipples((r) => r + 1);
    await new Promise((r) => setTimeout(r, 1400));
    setPhase("remember");
    const result = await ingestEntry(DEMO_CAPTURE, "voice");
    await new Promise((r) => setTimeout(r, 800));
    setPhase("done");
    setTimeout(() => onComplete(DEMO_CAPTURE, result.entities), 600);
  }

  const labels: Record<Phase, string> = {
    idle: "Hold to speak your day into memory",
    listening: "Gradium listens…",
    remember: "cognee.remember() → building graph",
    done: "Memory crystallized",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      <motion.p
        className="serif text-2xl text-[var(--muted)] mb-16"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        |
      </motion.p>

      <div className="relative">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`ring-${ripples}-${i}`}
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: `${accent}40` }}
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={phase === "listening" ? { scale: 2.5, opacity: 0 } : {}}
            transition={{ duration: 1.5, delay: i * 0.3, repeat: phase === "listening" ? Infinity : 0 }}
          />
        ))}

        <motion.button
          onMouseDown={() => phase === "idle" && setPhase("listening")}
          onMouseUp={capture}
          onMouseLeave={() => phase === "listening" && capture()}
          onTouchStart={() => phase === "idle" && setPhase("listening")}
          onTouchEnd={capture}
          animate={{
            scale: phase === "listening" ? 1.12 : 1,
            boxShadow:
              phase === "remember"
                ? "0 0 80px var(--cognee-glow)66"
                : `0 0 60px ${accent}33`,
          }}
          className="relative w-44 h-44 rounded-full flex items-center justify-center cursor-pointer select-none"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${accent}33, var(--surface) 70%)`,
            border: `2px solid ${accent}66`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-5xl"
            >
              {phase === "idle" ? "◉" : phase === "listening" ? "●" : phase === "remember" ? "◈" : "✦"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 text-sm text-[var(--muted)] text-center max-w-xs"
      >
        {labels[phase]}
      </motion.p>
    </div>
  );
}
