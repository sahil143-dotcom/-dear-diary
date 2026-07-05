import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInRight, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts } from '@/constants/theme';
import { AuroraBackground } from '@/components/AuroraBackground';
import { LiquidGlass } from '@/components/LiquidGlass';
import { getLensView } from '@/lib/cognee';

const LENSES = [
  { id: 'designer', label: 'Designer', color: Colors.designer, icon: '✦' },
  { id: 'founder', label: 'Founder', color: Colors.founder, icon: '◆' },
  { id: 'parent', label: 'Parent', color: Colors.parent, icon: '♡' },
  { id: 'memory-keeper', label: 'Keeper', color: Colors.keeper, icon: '◎' },
] as const;

const { width } = Dimensions.get('window');

export default function LensesScreen() {
  const router = useRouter();
  const [lens, setLens] = useState<(typeof LENSES)[number]['id']>('designer');
  const [items, setItems] = useState<
    Array<{ id: string; title: string; subtitle?: string; date?: string }>
  >([]);
  const current = LENSES.find((l) => l.id === lens)!;

  useEffect(() => {
    getLensView(lens).then((v) => setItems(v.items || []));
  }, [lens]);

  function handleLensChange(newLens: (typeof LENSES)[number]['id']) {
    Haptics.selectionAsync();
    setLens(newLens);
  }

  return (
    <AuroraBackground intensity={0.08}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← back</Text>
        </Pressable>

        <Animated.Text
          entering={FadeIn.duration(600)}
          style={styles.title}
        >
          Refraction lenses
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(100).duration(600)}
          style={styles.sub}
        >
          Same Cognee graph — four recall geometries
        </Animated.Text>

        {/* Lens tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabs}
          contentContainerStyle={styles.tabsContent}
        >
          {LENSES.map((l) => (
            <Pressable key={l.id} onPress={() => handleLensChange(l.id)}>
              <LiquidGlass
                style={{
                  ...styles.tab,
                  ...(lens === l.id
                    ? { borderColor: l.color, borderWidth: 1 }
                    : {}),
                }}
              >
                <Text style={styles.tabIcon}>{l.icon}</Text>
                <Text
                  style={[
                    styles.tabText,
                    lens === l.id && { color: l.color },
                  ]}
                >
                  {l.label}
                </Text>
              </LiquidGlass>
            </Pressable>
          ))}
        </ScrollView>

        {/* Items */}
        <View style={styles.list}>
          {items.map((item, i) => (
            <Animated.View
              key={`${lens}-${item.id}`}
              entering={FadeInRight.delay(i * 80).duration(400)}
              layout={Layout}
            >
              <LiquidGlass
                style={{
                  ...styles.item,
                  borderLeftColor: current.color,
                  borderLeftWidth: 3,
                }}
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={[styles.itemDate, { color: current.color }]}>
                    {item.date}
                  </Text>
                </View>
                <Text style={styles.itemSub}>{item.subtitle}</Text>
              </LiquidGlass>
            </Animated.View>
          ))}
        </View>

        {/* CTA */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/witness');
          }}
          style={styles.ctaWrap}
        >
          <LiquidGlass style={styles.cta}>
            <Text style={styles.ctaText}>Ask a pattern question →</Text>
          </LiquidGlass>
        </Pressable>
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
  tabs: { marginBottom: 24, maxHeight: 56 },
  tabsContent: { gap: 10 },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabIcon: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  tabText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  list: { gap: 12 },
  item: {
    padding: 18,
    width: width - 48,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  itemDate: {
    fontFamily: Fonts.display,
    fontSize: 12,
  },
  itemSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 6,
  },
  ctaWrap: { marginTop: 28 },
  cta: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: Fonts.bodyMedium,
    color: Colors.designer,
    fontSize: 15,
  },
});
