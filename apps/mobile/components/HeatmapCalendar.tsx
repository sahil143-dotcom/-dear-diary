import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import type { DiaryEntry } from '@/lib/cognee';

interface HeatmapCalendarProps {
  entries: DiaryEntry[];
  onDayPress?: (date: string) => void;
}

const EMOTION_KEYWORDS: Array<{ pattern: RegExp; color: string }> = [
  { pattern: /happy|joy|excited|great|wonderful|amazing|shipped/i, color: Colors.cognee },
  { pattern: /stuck|frustrated|angry|annoyed|disagree/i, color: Colors.emotion },
  { pattern: /hopeful|curious|thinking|wonder/i, color: Colors.founder },
  { pattern: /sad|miss|lonely|worried/i, color: Colors.parent },
  { pattern: /work|build|code|design|project/i, color: Colors.designer },
];

function getEmotionColor(text: string): string {
  for (const { pattern, color } of EMOTION_KEYWORDS) {
    if (pattern.test(text)) return color;
  }
  return Colors.textGhost;
}

function getLast30Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function HeatmapCalendar({ entries, onDayPress }: HeatmapCalendarProps) {
  const days = getLast30Days();
  const dayMap = new Map<string, DiaryEntry[]>();

  for (const entry of entries) {
    const date = entry.date || entry.createdAt?.slice(0, 10);
    if (date) {
      if (!dayMap.has(date)) dayMap.set(date, []);
      dayMap.get(date)!.push(entry);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>MOOD MAP — LAST 30 DAYS</Text>
      <View style={styles.grid}>
        {days.map((date) => {
          const dayEntries = dayMap.get(date) || [];
          const hasEntries = dayEntries.length > 0;
          const combinedText = dayEntries.map((e) => e.text).join(' ');
          const color = hasEntries ? getEmotionColor(combinedText) : Colors.textGhost;
          const dayNum = parseInt(date.slice(-2), 10);

          return (
            <Pressable
              key={date}
              onPress={() => hasEntries && onDayPress?.(date)}
              style={styles.cellWrap}
            >
              <View
                style={[
                  styles.cell,
                  {
                    backgroundColor: hasEntries ? `${color}30` : Colors.bgSurface,
                    borderColor: hasEntries ? `${color}60` : 'transparent',
                    borderWidth: hasEntries ? 1 : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayNum,
                    { color: hasEntries ? color : Colors.textGhost },
                  ]}
                >
                  {dayNum}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cellWrap: {},
  cell: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontFamily: Fonts.body,
    fontSize: 11,
  },
});
