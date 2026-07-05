import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Share,
  Image,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors, Fonts } from "@/constants/theme";
import { LiquidGlass } from "@/components/LiquidGlass";
import {
  improveMemory,
  deleteEntry,
  getEntryById,
  type DiaryEntry,
} from "@/lib/cognee";
import { MEDIA_ICONS, MEDIA_LABELS } from "@/lib/media";

const ENTITY_COLORS: Record<string, string> = {
  person: Colors.person,
  project: Colors.project,
  emotion: Colors.emotion,
  theme: Colors.theme,
};

function extractEntities(text: string) {
  const found: Array<{ kind: string; name: string }> = [];
  const patterns: Array<[RegExp, string]> = [
    [/\b(Arjun|Maya|team|co-founder|friend|partner|family)\b/gi, "person"],
    [/\b(Dear Diary|roguelike|cursor|lens switch|project|app|build)\b/gi, "project"],
    [/\b(stuck|frustrated|angry|happy|excited|hopeful|worried|afraid|joy|sad)\b/gi, "emotion"],
    [/\b(abandon|pattern|shipping|growth|change|routine)\b/gi, "theme"],
  ];
  for (const [regex, kind] of patterns) {
    const matches = text.match(regex);
    if (matches) {
      const unique = [...new Set(matches.map((m) => m.toLowerCase()))];
      unique.forEach((m) =>
        found.push({ kind, name: m.charAt(0).toUpperCase() + m.slice(1) })
      );
    }
  }
  return found;
}

export default function BloomScreen() {
  const { text: paramText = "", entryId = "" } = useLocalSearchParams<{
    text: string;
    entryId: string;
  }>();
  const router = useRouter();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [reflection, setReflection] = useState("");
  const [showReflect, setShowReflect] = useState(false);
  const [improved, setImproved] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const deleteTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (entryId) {
      getEntryById(String(entryId)).then(setEntry);
    }
  }, [entryId]);

  const text = entry?.text || String(paramText);
  const mediaType = entry?.mediaType || (entry?.source === "voice" ? "voice" : undefined);
  const entities = extractEntities(text);
  const today = entry?.date || new Date().toISOString().slice(0, 10);
  const primaryEntity = entities[0];
  const typeLabel = mediaType ? MEDIA_LABELS[mediaType] : "Memory";
  const title = primaryEntity
    ? `${typeLabel} · ${primaryEntity.name}`
    : `${typeLabel} · ${today}`;

  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: `${title}\n\n"${String(text).slice(0, 200)}"\n\n— Dear Diary`,
    });
  }

  async function submitReflection() {
    if (reflection.trim()) {
      await improveMemory(String(entryId));
      setImproved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowReflect(false);
  }

  function startDelete() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDeleteProgress(0);
    let prog = 0;
    deleteTimer.current = setInterval(() => {
      prog += 3;
      setDeleteProgress(prog);
      if (prog >= 100) {
        if (deleteTimer.current) clearInterval(deleteTimer.current);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        if (entryId) deleteEntry(String(entryId));
        router.replace("/dashboard");
      }
    }, 100);
  }

  function cancelDelete() {
    if (deleteTimer.current) clearInterval(deleteTimer.current);
    setDeleteProgress(0);
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.Text entering={FadeInUp.duration(600)} style={styles.date}>
          {today} · {mediaType ? `${MEDIA_ICONS[mediaType]} ${MEDIA_LABELS[mediaType]}` : "Saved"}
        </Animated.Text>

        <Animated.Text entering={FadeInUp.delay(100).duration(600)} style={styles.title}>
          {title}
        </Animated.Text>

        {/* Media preview */}
        {entry?.mediaUri && entry.mediaType === "image" && (
          <Animated.View entering={FadeIn.delay(150)}>
            <Image source={{ uri: entry.mediaUri }} style={styles.mediaPreview} resizeMode="cover" />
          </Animated.View>
        )}
        {entry?.mediaUri && entry.mediaType === "video" && (
          <Animated.View entering={FadeIn.delay(150)}>
            <Video
              source={{ uri: entry.mediaUri }}
              style={styles.mediaPreview}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            />
          </Animated.View>
        )}
        {entry?.mediaType === "pdf" && (
          <LiquidGlass style={styles.fileBadge}>
            <Text style={styles.fileBadgeText}>📄 {entry.fileName || "Document attached"}</Text>
          </LiquidGlass>
        )}

        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.entityRow}>
          {entities.map((e, i) => (
            <View
              key={`${e.name}-${i}`}
              style={[
                styles.chip,
                {
                  borderColor: ENTITY_COLORS[e.kind] || Colors.textMuted,
                  backgroundColor: `${ENTITY_COLORS[e.kind] || Colors.textMuted}15`,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: ENTITY_COLORS[e.kind] || Colors.text }]}>
                #{e.name}
              </Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(600)}>
          <LiquidGlass style={styles.card}>
            <Text style={styles.cardLabel}>What Cognee remembers</Text>
            <Text style={styles.prose}>{text}</Text>
          </LiquidGlass>
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(600).duration(400)} style={styles.cogneeStatus}>
          ✓ Saved to your memory graph — ask Witness to recall this later
        </Animated.Text>

        {showReflect && (
          <Animated.View entering={FadeIn.duration(300)}>
            <LiquidGlass style={styles.reflectCard}>
              <Text style={styles.reflectLabel}>What's your one realization?</Text>
              <TextInput
                style={styles.reflectInput}
                placeholder="One sentence..."
                placeholderTextColor={Colors.textGhost}
                value={reflection}
                onChangeText={setReflection}
                onSubmitEditing={submitReflection}
                returnKeyType="done"
                maxLength={140}
              />
            </LiquidGlass>
          </Animated.View>
        )}

        {improved && (
          <Text style={styles.improvedText}>✓ Memory strengthened with Cognee improve()</Text>
        )}

        <Animated.View entering={FadeInUp.delay(700).duration(600)} style={styles.actions}>
          <Pressable onPressIn={startDelete} onPressOut={cancelDelete} style={styles.actionBtn}>
            <View style={[styles.deleteProgress, { width: `${deleteProgress}%` }]} />
            <Text style={styles.actionLabel}>Delete</Text>
          </Pressable>
          <Pressable onPress={handleShare} style={styles.actionBtn}>
            <Text style={styles.actionLabel}>Share</Text>
          </Pressable>
          <Pressable onPress={() => setShowReflect(true)} style={styles.actionBtn}>
            <Text style={styles.actionLabel}>Reflect</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(900).duration(600)} style={styles.navWrap}>
          <Pressable onPress={() => router.push("/witness")}>
            <LiquidGlass style={styles.navGlass}>
              <Text style={styles.navText}>Ask the graph a question →</Text>
            </LiquidGlass>
          </Pressable>
          <Pressable onPress={() => router.replace("/dashboard")}>
            <Text style={styles.navLink}>← Back to home</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgDeep },
  content: { padding: 28, paddingTop: 72, paddingBottom: 48 },
  date: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textGhost, letterSpacing: 0.5 },
  title: {
    fontFamily: Fonts.display,
    fontSize: 26,
    color: Colors.text,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  mediaPreview: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginTop: 16,
    backgroundColor: Colors.bgSurface,
  },
  fileBadge: { padding: 16, marginTop: 16, alignItems: "center" },
  fileBadgeText: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.text },
  entityRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 20, marginBottom: 24 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  chipText: { fontFamily: Fonts.bodyMedium, fontSize: 12 },
  card: { padding: 24 },
  cardLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  prose: { fontFamily: Fonts.display, fontSize: 19, lineHeight: 30, color: Colors.text },
  cogneeStatus: {
    marginTop: 16,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.cognee,
    lineHeight: 18,
  },
  reflectCard: { padding: 20, marginTop: 16 },
  reflectLabel: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textMuted, marginBottom: 10 },
  reflectInput: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgGlassBorder,
    paddingVertical: 8,
  },
  improvedText: { marginTop: 8, fontFamily: Fonts.body, fontSize: 12, color: Colors.cognee },
  actions: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 32 },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.bgGlassBorder,
    overflow: "hidden",
    minWidth: 90,
    alignItems: "center",
  },
  deleteProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.dangerDim,
    borderRadius: 999,
  },
  actionLabel: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.text },
  navWrap: { marginTop: 32, gap: 14 },
  navGlass: { paddingVertical: 16, alignItems: "center" },
  navText: { fontFamily: Fonts.bodyMedium, color: Colors.designer, fontSize: 15 },
  navLink: { textAlign: "center", color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 14 },
});
