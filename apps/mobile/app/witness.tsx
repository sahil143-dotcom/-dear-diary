import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts } from '@/constants/theme';
import { AuroraBackground } from '@/components/AuroraBackground';
import { LiquidGlass } from '@/components/LiquidGlass';
import { AgentStrip } from '@/components/AgentStrip';
import { recallMemory, improveMemory, type MemoryAnswer } from '@/lib/cognee';

const QUESTIONS = [
  'What do I keep trying and abandoning?',
  'What did I know about Arjun in March?',
  'Who keeps showing up?',
];

export default function WitnessScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<MemoryAnswer | null>(null);
  const [improved, setImproved] = useState(false);
  const [errorFlash, setErrorFlash] = useState(false);

  async function ask(q: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setAnswer(null);
    setImproved(false);

    try {
      const result = await recallMemory('designer', q);
      setAnswer(result);
    } catch {
      // Silent error: red flash
      setErrorFlash(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(() => setErrorFlash(false), 500);
    }
    setLoading(false);
  }

  return (
    <AuroraBackground intensity={0.08}>
      {/* Error flash overlay */}
      {errorFlash && <View style={styles.errorFlash} />}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <Animated.Text
          entering={FadeInUp.duration(600)}
          style={styles.title}
        >
          Witness the graph
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(100).duration(600)}
          style={styles.sub}
        >
          Multi-step Cognee agent — not single RAG
        </Animated.Text>

        {/* Question chips */}
        <Animated.View
          entering={FadeIn.delay(200).duration(600)}
          style={styles.chips}
        >
          {QUESTIONS.map((q, i) => (
            <Pressable
              key={q}
              onPress={() => ask(q)}
              disabled={loading}
            >
              <Animated.View entering={FadeInUp.delay(250 + i * 80)}>
                <LiquidGlass style={styles.chip}>
                  <Text style={styles.chipText}>{q}</Text>
                </LiquidGlass>
              </Animated.View>
            </Pressable>
          ))}
        </Animated.View>

        {/* Loading state */}
        {loading && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.loadingWrap}
          >
            <ActivityIndicator color={Colors.cognee} size="small" />
            <Text style={styles.loadingText}>
              cognee.recall() traversing…
            </Text>
          </Animated.View>
        )}

        {/* Answer */}
        {answer && !loading && (
          <Animated.View entering={FadeIn.duration(600)}>
            {/* Agent strip */}
            <AgentStrip steps={answer.agentSteps} />

            {/* Answer card */}
            <LiquidGlass style={styles.answerCard}>
              <Text style={styles.narrative}>{answer.narrative}</Text>

              {/* Pattern cards */}
              {answer.patternCards.map((c) => (
                <View key={c.id} style={styles.pattern}>
                  <View style={styles.patternHeader}>
                    <Text style={styles.patternTitle}>{c.title}</Text>
                    {c.severity && (
                      <Text
                        style={[
                          styles.patternSeverity,
                          {
                            color:
                              c.severity === 'warn'
                                ? Colors.emotion
                                : Colors.cognee,
                          },
                        ]}
                      >
                        {c.severity === 'warn' ? '⚠' : 'ℹ'}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.patternBody}>{c.body}</Text>
                </View>
              ))}

              {/* Citations */}
              {answer.citations.map((c) => (
                <View key={c.entryId} style={styles.citation}>
                  <Text style={styles.citeDate}>{c.date}</Text>
                  <Text style={styles.citeQuote}>"{c.quote}"</Text>
                </View>
              ))}

              {/* Voice script */}
              {answer.voiceScript ? (
                <Text style={styles.voiceScript}>
                  "{answer.voiceScript}"
                </Text>
              ) : null}
            </LiquidGlass>

            {/* Improve button */}
            <Pressable
              onPress={async () => {
                Haptics.selectionAsync();
                await improveMemory(
                  answer.citations[0]?.entryId || 'ent_demo'
                );
                setImproved(true);
              }}
            >
              <LiquidGlass style={styles.improveBtn}>
                <Text style={styles.improveText}>
                  {improved
                    ? 'cognee.improve() ✓'
                    : 'This mattered → improve()'}
                </Text>
              </LiquidGlass>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingTop: 56, paddingBottom: 48 },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 12,
  },
  closeText: { color: Colors.textMuted, fontSize: 22 },
  title: {
    fontFamily: Fonts.display,
    fontSize: 28,
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
  chips: { gap: 10, marginBottom: 24 },
  chip: { padding: 16 },
  chipText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.text },
  loadingWrap: { alignItems: 'center', padding: 32, gap: 12 },
  loadingText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.cognee,
  },
  answerCard: { padding: 22, marginTop: 16 },
  narrative: {
    fontFamily: Fonts.display,
    fontSize: 18,
    lineHeight: 28,
    color: Colors.text,
  },
  pattern: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patternTitle: {
    fontFamily: Fonts.bodyMedium,
    color: Colors.text,
    fontSize: 15,
  },
  patternSeverity: { fontSize: 16 },
  patternBody: {
    fontFamily: Fonts.body,
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  citation: {
    marginTop: 18,
    paddingLeft: 14,
    borderLeftWidth: 2,
    borderLeftColor: Colors.designer,
  },
  citeDate: {
    fontFamily: Fonts.display,
    fontSize: 11,
    color: Colors.textMuted,
  },
  citeQuote: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  voiceScript: {
    marginTop: 22,
    fontFamily: Fonts.displayItalic,
    fontSize: 15,
    color: Colors.keeper,
    lineHeight: 24,
  },
  improveBtn: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  improveText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.cognee,
  },
  errorFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,68,68,0.12)',
    zIndex: 100,
    pointerEvents: 'none',
  },
});
