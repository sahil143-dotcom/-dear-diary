import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Colors, Fonts } from '@/constants/theme';
import { AuroraBackground } from '@/components/AuroraBackground';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GraphCanvas } from '@/components/GraphCanvas';
import { HeatmapCalendar } from '@/components/HeatmapCalendar';
import {
  forgetAndSeed,
  getEntryCount,
  getEntries,
  getLogs,
  hasCogneeCloud,
  improveMemory,
  type DiaryEntry,
} from '@/lib/cognee';

const VERBS = [
  { id: 'remember', label: 'Save', desc: 'Add voice, photo, video, or file', action: 'capture', icon: '◉' },
  { id: 'recall', label: 'recall()', desc: 'Query graph traversal', action: 'witness', icon: '◎' },
  { id: 'improve', label: 'improve()', desc: 'Strengthen memory', action: 'improve', icon: '◆' },
  { id: 'forget', label: 'forget()', desc: 'Reset and re-seed', action: 'forget', icon: '◇' },
] as const;

export default function MemoryScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [entryCount, setEntryCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [graphActive, setGraphActive] = useState(false);

  async function refresh() {
    setEntryCount(await getEntryCount());
    setLogs(await getLogs());
    const all = await getEntries();
    setEntries(all);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleVerb(action: string) {
    await Haptics.selectionAsync();
    setGraphActive(true);
    if (action === 'capture') router.push('/capture');
    else if (action === 'witness') router.push('/witness');
    else if (action === 'improve') {
      await improveMemory('ent_demo');
      await refresh();
    } else if (action === 'forget') {
      await forgetAndSeed();
      await refresh();
    }
    setTimeout(() => setGraphActive(false), 2000);
  }

  return (
    <AuroraBackground intensity={0.08}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← back</Text>
        </Pressable>

        <Animated.Text entering={FadeInUp.duration(600)} style={styles.title}>
          Cognee Memory Lab
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(100).duration(600)}
          style={styles.sub}
        >
          {hasCogneeCloud()
            ? 'Cognee Cloud connected · 4 memory verbs'
            : 'Local graph · set Cognee API key in .env'}
        </Animated.Text>

        {/* Stats */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <LiquidGlass style={styles.statusBar}>
            <Text style={styles.statusNum}>{entryCount}</Text>
            <Text style={styles.statusLabel}>nodes in memory graph</Text>
          </LiquidGlass>
        </Animated.View>

        {/* 4 verb cards */}
        <Animated.View
          entering={FadeIn.delay(300).duration(600)}
          style={styles.verbGrid}
        >
          {VERBS.map((v, i) => (
            <Pressable
              key={v.id}
              onPress={() => handleVerb(v.action)}
              style={styles.verbWrap}
            >
              <Animated.View entering={FadeInUp.delay(350 + i * 80)}>
                <LiquidGlass style={styles.verbCard} shimmer>
                  <Text style={styles.verbIcon}>{v.icon}</Text>
                  <Text style={styles.verbLabel}>{v.label}</Text>
                  <Text style={styles.verbDesc}>{v.desc}</Text>
                </LiquidGlass>
              </Animated.View>
            </Pressable>
          ))}
        </Animated.View>

        {/* Live graph */}
        <Animated.View entering={FadeIn.delay(500).duration(600)}>
          <LiquidGlass style={styles.graphBox}>
            <Text style={styles.sectionLabel}>LIVE GRAPH</Text>
            <GraphCanvas active={graphActive} />
          </LiquidGlass>
        </Animated.View>

        {/* Emotion heatmap */}
        <Animated.View entering={FadeIn.delay(600).duration(600)}>
          <LiquidGlass style={styles.heatmapBox}>
            <HeatmapCalendar entries={entries} />
          </LiquidGlass>
        </Animated.View>

        {/* Pipeline log */}
        <Animated.View entering={FadeIn.delay(700).duration(600)}>
          <LiquidGlass style={styles.logBox}>
            <Text style={styles.sectionLabel}>PIPELINE LOG</Text>
            {logs.length === 0 ? (
              <Text style={styles.logEmpty}>
                Tap a verb to see Cognee respond…
              </Text>
            ) : (
              logs.map((l, i) => (
                <Text
                  key={i}
                  style={[styles.logLine, i === 0 && styles.logActive]}
                >
                  {l}
                </Text>
              ))
            )}
          </LiquidGlass>
        </Animated.View>
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingTop: 56, paddingBottom: 48 },
  back: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 30,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  sub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 8,
    marginBottom: 24,
  },
  statusBar: {
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  statusNum: {
    fontFamily: Fonts.display,
    fontSize: 32,
    color: Colors.cognee,
  },
  statusLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
  },
  verbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  verbWrap: {
    width: '48%',
    minWidth: 150,
    flexGrow: 1,
  },
  verbCard: {
    padding: 18,
  },
  verbIcon: {
    fontSize: 18,
    color: Colors.cognee,
    marginBottom: 8,
  },
  verbLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.cognee,
  },
  verbDesc: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  graphBox: { padding: 16, marginBottom: 16 },
  heatmapBox: { padding: 16, marginBottom: 16 },
  logBox: { padding: 16 },
  sectionLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textGhost,
    letterSpacing: 2.5,
    marginBottom: 12,
  },
  logEmpty: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
  },
  logLine: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  logActive: { color: Colors.cognee },
});
