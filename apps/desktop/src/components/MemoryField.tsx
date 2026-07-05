import { motion } from "framer-motion";
import { useMemo } from "react";

export default function MemoryField({ accent = "#7eb8da" }: { accent?: string }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
      })),
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${accent}18 0%, transparent 70%)`,
        }}
      />
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
          }}
          animate={{ opacity: [0.1, 0.7, 0.1], scale: [1, 1.4, 1] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
        />
      ))}
      {/* Memory threads */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
        <motion.line
          x1="20%" y1="30%" x2="70%" y2="60%"
          stroke={accent}
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.line
          x1="60%" y1="20%" x2="40%" y2="80%"
          stroke={accent}
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
        />
      </svg>
    </div>
  );
}
