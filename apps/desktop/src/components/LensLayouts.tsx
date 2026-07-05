import { motion } from "framer-motion";

export interface LensItem {
  id: string;
  kind: string;
  title: string;
  subtitle?: string;
  date?: string;
}

const ACCENTS: Record<string, string> = {
  designer: "var(--accent-designer)",
  founder: "var(--accent-founder)",
  parent: "var(--accent-parent)",
  "memory-keeper": "var(--accent-keeper)",
};

export function DesignerTimeline({ items, lens }: { items: LensItem[]; lens: string }) {
  const accent = ACCENTS[lens];
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          layoutId={`memory-node-${item.id}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="snap-center shrink-0 w-48 p-4 rounded-xl glass"
          style={{ borderTop: `2px solid ${accent}` }}
        >
          <motion.h3 layoutId={`title-${item.id}`} className="font-medium text-sm">
            {item.title}
          </motion.h3>
          <p className="text-xs text-[var(--muted)] mt-1">{item.subtitle}</p>
          <p className="serif text-[10px] text-[var(--muted)] mt-2">{item.date}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function FounderDecisions({ items, lens }: { items: LensItem[]; lens: string }) {
  const accent = ACCENTS[lens];
  return (
    <div className="space-y-3 max-w-lg mx-auto">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          layoutId={`memory-node-${item.id}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4 items-start"
        >
          <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: accent }} />
          <div className="flex-1 p-4 rounded-lg glass">
            <motion.h3 layoutId={`title-${item.id}`} className="font-medium">
              {item.title}
            </motion.h3>
            <p className="text-sm text-[var(--muted)]">{item.subtitle}</p>
            <p className="serif text-xs text-[var(--muted)] mt-1">{item.date}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function ParentCalendar({ items, lens }: { items: LensItem[]; lens: string }) {
  const accent = ACCENTS[lens];
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  return (
    <div className="max-w-md mx-auto">
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map((d) => {
          const hit = items.some((it) => it.date?.endsWith(String(d).padStart(2, "0")));
          return (
            <motion.div
              key={d}
              className="aspect-square rounded-md flex items-center justify-center text-[10px]"
              style={{
                background: hit ? `${accent}33` : "rgba(255,255,255,0.03)",
                border: hit ? `1px solid ${accent}` : "1px solid transparent",
              }}
              animate={hit ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {d}
            </motion.div>
          );
        })}
      </div>
      {items.map((item) => (
        <motion.div key={item.id} layoutId={`memory-node-${item.id}`} className="p-3 rounded-lg glass mb-2">
          <motion.h3 layoutId={`title-${item.id}`} className="text-sm font-medium">
            {item.title}
          </motion.h3>
          <p className="text-xs text-[var(--muted)]">{item.subtitle}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function KeeperEras({ items, lens }: { items: LensItem[]; lens: string }) {
  const accent = ACCENTS[lens];
  return (
    <div className="grid gap-4 max-w-lg mx-auto">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          layoutId={`memory-node-${item.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.12 }}
          className="relative p-6 rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accent}15 0%, transparent 60%)`,
            border: `1px solid ${accent}40`,
          }}
        >
          <motion.div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-30"
            style={{ background: accent }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.h3 layoutId={`title-${item.id}`} className="serif text-xl relative">
            {item.title}
          </motion.h3>
          <p className="text-sm text-[var(--muted)] mt-2 relative">{item.subtitle}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function LensLayout({
  layout,
  items,
  lens,
}: {
  layout: string;
  items: LensItem[];
  lens: string;
}) {
  switch (layout) {
    case "decisions":
      return <FounderDecisions items={items} lens={lens} />;
    case "calendar":
      return <ParentCalendar items={items} lens={lens} />;
    case "eras":
      return <KeeperEras items={items} lens={lens} />;
    default:
      return <DesignerTimeline items={items} lens={lens} />;
  }
}
