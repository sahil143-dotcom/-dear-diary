import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
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
import { LiquidGlass } from '@/components/LiquidGlass';

const { width, height } = Dimensions.get('window');

export default function FocusScreen() {
  const router = useRouter();
  const floatY = useSharedValue(0);
  const floatRotate = useSharedValue(0);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Floating card animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(12, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    floatRotate.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-2, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const cardFloat = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { rotate: `${floatRotate.value}deg` },
    ],
  }));

  function handleTap() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/shatter');
  }

  return (
    <Pressable style={styles.root} onPress={handleTap}>
      {/* Starfield background */}
      {Array.from({ length: 40 }).map((_, i) => (
        <Animated.View
          key={i}
          entering={FadeIn.delay(i * 40).duration(800)}
          style={[
            styles.star,
            {
              left: `${((i * 17 + 5) % 100)}%`,
              top: `${((i * 23 + 11) % 100)}%`,
              opacity: 0.1 + (i % 5) * 0.06,
              width: 1 + (i % 3),
              height: 1 + (i % 3),
            },
          ]}
        />
      ))}

      {/* Floating glass card */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(1000)}
        style={[styles.cardWrap, cardFloat]}
      >
        <LiquidGlass style={styles.glassCard} intensity={40} shimmer>
          <Text style={styles.cardIcon}>✦</Text>
          <Text style={styles.cardText}>
            Point this at what matters most right now.
          </Text>
          <Text style={styles.cardHint}>
            Your memories are about to begin.
          </Text>
        </LiquidGlass>
      </Animated.View>

      {/* Bottom hint */}
      <Animated.View
        entering={FadeIn.delay(1200).duration(800)}
        style={styles.bottomWrap}
      >
        <Text style={styles.tapText}>tap to continue</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgVoid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  cardWrap: {
    width: width * 0.78,
  },
  glassCard: {
    padding: 36,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 28,
    color: Colors.cognee,
    marginBottom: 20,
  },
  cardText: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 34,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  cardHint: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
  bottomWrap: {
    position: 'absolute',
    bottom: 60,
  },
  tapText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textGhost,
    letterSpacing: 1,
  },
});
