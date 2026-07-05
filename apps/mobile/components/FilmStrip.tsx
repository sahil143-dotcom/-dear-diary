import { View, Text, StyleSheet, Dimensions, Pressable, Image } from "react-native";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";
import { Colors, Fonts } from "@/constants/theme";
import { LiquidGlass } from "./LiquidGlass";
import type { DiaryEntry } from "@/lib/cognee";
import { MEDIA_ICONS, MEDIA_LABELS, type MediaType } from "@/lib/media";

const SLIVER_WIDTH = 140;
const SLIVER_HEIGHT = 200;

const ENTITY_COLORS: Record<string, string> = {
  person: Colors.person,
  project: Colors.project,
  emotion: Colors.emotion,
  theme: Colors.theme,
};

interface FilmStripProps {
  entries: DiaryEntry[];
  onSelect?: (entry: DiaryEntry) => void;
  highlightId?: string;
}

function detectEntityType(text: string): string {
  const lower = text.toLowerCase();
  if (/arjun|team|co-founder|friend|partner/i.test(lower)) return "person";
  if (/roguelike|diary|cursor|app|project|build/i.test(lower)) return "project";
  if (/stuck|frustrated|worried|afraid|happy|joy|sad/i.test(lower)) return "emotion";
  return "theme";
}

function getMediaType(entry: DiaryEntry): MediaType {
  if (entry.mediaType) return entry.mediaType;
  if (entry.source === "voice") return "voice";
  if (entry.source === "seed") return "text";
  return "text";
}

function MiniWaveform() {
  const bars = [0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3];
  return (
    <View style={waveStyles.row}>
      {bars.map((h, i) => (
        <View key={i} style={[waveStyles.bar, { height: 12 * h, opacity: 0.3 + h * 0.4 }]} />
      ))}
    </View>
  );
}

const waveStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 2, alignItems: "flex-end", height: 14 },
  bar: { width: 3, borderRadius: 1.5, backgroundColor: Colors.cognee },
});

export function FilmStrip({ entries, onSelect, highlightId }: FilmStripProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No memories yet</Text>
        <Text style={styles.emptyHint}>Tap Add memory to capture voice, photos, or files</Text>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
      decelerationRate="fast"
      snapToInterval={SLIVER_WIDTH + 12}
      entering={FadeIn.duration(600)}
    >
      {entries.map((entry, i) => {
        const entityType = detectEntityType(entry.text);
        const edgeColor = ENTITY_COLORS[entityType] || Colors.textMuted;
        const isHighlighted = entry.entryId === highlightId;
        const mediaType = getMediaType(entry);
        const isVoice = mediaType === "voice";

        return (
          <Animated.View key={entry.entryId} entering={FadeInRight.delay(i * 60).duration(400)}>
            <Pressable onPress={() => onSelect?.(entry)}>
              <LiquidGlass
                style={{
                  ...styles.sliver,
                  ...(isHighlighted ? styles.sliverHighlight : {}),
                }}
              >
                <View style={[styles.edge, { backgroundColor: edgeColor }]} />

                <View style={styles.typeRow}>
                  <Text style={styles.typeIcon}>{MEDIA_ICONS[mediaType]}</Text>
                  <Text style={styles.typeLabel}>{MEDIA_LABELS[mediaType]}</Text>
                </View>

                {entry.mediaUri && mediaType === "image" ? (
                  <Image source={{ uri: entry.mediaUri }} style={styles.thumb} />
                ) : (
                  <Text style={styles.preview} numberOfLines={3}>
                    {entry.text}
                  </Text>
                )}

                <View style={styles.footer}>
                  {isVoice ? <MiniWaveform /> : <View style={styles.dot} />}
                  <Text style={styles.date}>{entry.date?.slice(5) || "—"}</Text>
                </View>
              </LiquidGlass>
            </Pressable>
          </Animated.View>
        );
      })}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { paddingHorizontal: 24, paddingVertical: 12, gap: 12 },
  sliver: {
    width: SLIVER_WIDTH,
    height: SLIVER_HEIGHT,
    padding: 12,
    paddingLeft: 16,
    justifyContent: "space-between",
  },
  sliverHighlight: {
    borderWidth: 1,
    borderColor: Colors.sparkGold,
    shadowColor: Colors.sparkGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  edge: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 1.5,
  },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  typeIcon: { fontSize: 12 },
  typeLabel: {
    fontFamily: Fonts.body,
    fontSize: 9,
    color: Colors.textGhost,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  preview: {
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.text,
    flex: 1,
    marginTop: 4,
  },
  thumb: {
    flex: 1,
    marginTop: 4,
    borderRadius: 8,
    backgroundColor: Colors.bgSurface,
  },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.cognee, opacity: 0.5 },
  date: { fontFamily: Fonts.body, fontSize: 9, color: Colors.textGhost },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { fontFamily: Fonts.display, fontSize: 18, color: Colors.textMuted },
  emptyHint: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textGhost,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
