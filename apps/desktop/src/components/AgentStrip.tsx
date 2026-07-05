import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Step {
  step: string;
  label: string;
  status: "pending" | "running" | "done";
}

interface Props {
  steps: Step[];
  animate?: boolean;
}

export default function AgentStrip({ steps, animate = true }: Props) {
  const [visible, setVisible] = useState<Step[]>(
    animate ? steps.map((s) => ({ ...s, status: "pending" as const })) : steps
  );

  useEffect(() => {
    if (!animate) {
      setVisible(steps);
      return;
    }
    let i = 0;
    const run = () => {
      if (i >= steps.length) return;
      setVisible((prev) =>
        prev.map((s, idx) => {
          if (idx < i) return { ...s, status: "done" };
          if (idx === i) return { ...s, status: "running" };
          return { ...s, status: "pending" };
        })
      );
      setTimeout(() => {
        setVisible((prev) =>
          prev.map((s, idx) => (idx <= i ? { ...s, status: "done" } : s))
        );
        i++;
        setTimeout(run, 400);
      }, 600);
    };
    run();
  }, [steps, animate]);

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {visible.map((s, i) => (
        <motion.div
          key={s.step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-all duration-500 ${
            s.status === "done"
              ? "border-[var(--cognee-glow)]/40 text-[var(--cognee-glow)] bg-[var(--cognee-glow)]/5"
              : s.status === "running"
                ? "border-white/30 text-white bg-white/5 scale-105"
                : "border-white/10 text-[var(--muted)]"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {s.label}
        </motion.div>
      ))}
    </div>
  );
}
