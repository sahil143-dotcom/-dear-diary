import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts } from '@/constants/theme';
import { AuroraBackground } from '@/components/AuroraBackground';
import { FilmStrip } from '@/components/FilmStrip';
import { LiquidGlass } from '@/components/LiquidGlass';
import { initSeedIfEmpty, getEntries, type DiaryEntry } from '@/lib/cognee';

const { width, height } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  // FAB pulse animation
  const fabPulse = useSharedValue(0.85);

  useEffect(() => {
    loadEntries();

    // FAB breathing pulse
    fabPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.85, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  async function loadEntries() {
    await initSeedIfEmpty();
    const all = await getEntries();
    setEntries(all.reverse()); // Newest first
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadEntries();
    setRefreshing(false);
  }, []);

  const fabStyle = useAnimatedStyle(() => ({
    opacity: fabPulse.value,
  }));

  function handleCapture() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/capture');
  }

  // Hidden settings: double-tap brand text
  function handleBrandTap() {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 2) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push('/settings');
      setTapCount(0);
    }
    // Reset tap count after 500ms
    setTimeout(() => setTapCount(0), 500);
  }

  function handleEntrySelect(entry: DiaryEntry) {
    Haptics.selectionAsync();
    router.push({
      pathname: "/bloom",
      params: { entryId: entry.entryId },
    });
  }

  return (
    <AuroraBackground intensity={0.12}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.cognee}
            progressBackgroundColor={Colors.bgSurface}
          />
        }
      >
        {/* Brand header */}
        <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
          <Pressable onPress={handleBrandTap}>
            <Text style={styles.brand}>
              Dear Diary<Text style={styles.brandReg}>®</Text>
            </Text>
          </Pressable>
          <Text style={styles.subtitle}>
            {entries.length} memor{entries.length === 1 ? "y" : "ies"} · voice, photos, files
          </Text>
        </Animated.View>

        {/* How it works */}
        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.helpCard}>
          <LiquidGlass style={styles.helpInner}>
            <Text style={styles.helpTitle}>How it works</Text>
            <Text style={styles.helpStep}>1. Tap <Text style={styles.helpEm}>Add memory</Text> — voice, photo, video, or PDF</Text>
            <Text style={styles.helpStep}>2. Cognee builds a searchable memory graph</Text>
            <Text style={styles.helpStep}>3. Use <Text style={styles.helpEm}>Witness</Text> to ask questions about your past</Text>
          </LiquidGlass>
        </Animated.View>

        {/* Hero text */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(800)}
          style={styles.heroWrap}
        >
          <Text style={styles.hero}>
            Your <Text style={styles.heroEm}>memories</Text>, all in one place.
          </Text>
        </Animated.View>

        {/* Film strip timeline */}
        <Animated.View
          entering={FadeIn.delay(400).duration(600)}
          style={styles.timelineWrap}
        >
          <Text style={styles.sectionLabel}>YOUR TIMELINE — swipe to browse</Text>
          <FilmStrip entries={entries} onSelect={handleEntrySelect} />
        </Animated.View>

        {/* Cognee verbs */}
        <Animated.View
          entering={FadeIn.delay(600).duration(600)}
          style={styles.verbsWrap}
        >
          <Text style={styles.verbs}>
            remember · recall · improve · forget
          </Text>
        </Animated.View>

        {/* Navigation row */}
        <Animated.View
          entering={FadeInUp.delay(700).duration(600)}
          style={styles.navRow}
        >
          {[
            { label: "Memory Lab", desc: "Graph & verbs", route: "/memory" },
            { label: "Lenses", desc: "Persona views", route: "/lenses" },
            { label: "Witness", desc: "Ask your graph", route: "/witness" },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route as never);
              }}
            >
              <LiquidGlass style={styles.navCard}>
                <Text style={styles.navLabel}>{item.label}</Text>
                <Text style={styles.navDesc}>{item.desc}</Text>
              </LiquidGlass>
            </Pressable>
          ))}
        </Animated.View>

        {/* Spacer for FAB */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Button — Capture pill */}
      <Animated.View style={[styles.fabWrap, fabStyle]}>
        <Pressable onPress={handleCapture}>
          <LiquidGlass style={styles.fab} shimmer>
            <Text style={styles.fabText}>Add memory</Text>
          </LiquidGlass>
        </Pressable>
      </Animated.View>

      {/* Sponsor line */}
      <Animated.View
        entering={FadeIn.delay(1000).duration(800)}
        style={styles.sponsorWrap}
      >
        <Text style={styles.sponsor}>
          Speechmatics · Cognee Cloud · voice · photos · files
        </Text>
      </Animated.View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 60, paddingBottom: 40 },
  header: {
    paddingHorizontal: 28,
    marginBottom: 8,
  },
  brand: {
    fontFamily: Fonts.display,
    fontSize: 26,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  brandReg: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  helpCard: { paddingHorizontal: 28, marginBottom: 20 },
  helpInner: { padding: 18 },
  helpTitle: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.cognee,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  helpStep: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 4,
  },
  helpEm: { color: Colors.text, fontFamily: Fonts.bodyMedium },
  heroWrap: {
    paddingHorizontal: 28,
    marginTop: 24,
    marginBottom: 32,
  },
  hero: {
    fontFamily: Fonts.display,
    fontSize: 38,
    lineHeight: 44,
    color: Colors.text,
    letterSpacing: -1.5,
  },
  heroEm: {
    fontFamily: Fonts.displayItalic,
    color: Colors.textMuted,
  },
  timelineWrap: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textGhost,
    letterSpacing: 2.5,
    paddingHorizontal: 28,
    marginBottom: 12,
  },
  verbsWrap: {
    paddingHorizontal: 28,
    marginBottom: 24,
  },
  verbs: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textGhost,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 28,
  },
  navCard: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 100,
  },
  navLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.text,
  },
  navDesc: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textGhost,
    marginTop: 2,
  },
  fabWrap: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
  },
  fab: {
    paddingHorizontal: 52,
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 999,
  },
  fabText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  sponsorWrap: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  sponsor: {
    fontFamily: Fonts.body,
    fontSize: 9,
    color: Colors.textGhost,
    letterSpacing: 1,
  },
});
