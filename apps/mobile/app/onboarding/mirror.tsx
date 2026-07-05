import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Fonts } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function MirrorScreen() {
  const router = useRouter();
  const [showText, setShowText] = useState(false);
  const chevronY = useSharedValue(0);

  useEffect(() => {
    // Show text after cinematic delay
    const timer = setTimeout(() => setShowText(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    chevronY.value = withRepeat(
      withTiming(10, { duration: 1200 }),
      -1,
      true
    );
  }, []);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: chevronY.value }],
  }));

  return (
    <Pressable
      style={styles.root}
      onPress={() => router.push('/onboarding/focus')}
    >
      {/* Cinematic dark background with subtle grain */}
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.bgBase} />
        {/* Subtle vignette effect */}
        <View style={styles.vignette} />
        {/* Animated grain dots */}
        {Array.from({ length: 80 }).map((_, i) => (
          <Animated.View
            key={i}
            entering={FadeIn.delay(i * 20).duration(600)}
            style={[
              styles.grainDot,
              {
                left: `${((i * 13 + 7) % 100)}%`,
                top: `${((i * 19 + 3) % 100)}%`,
                opacity: Math.random() * 0.06 + 0.01,
                width: 1 + (i % 2),
                height: 1 + (i % 2),
              },
            ]}
          />
        ))}
      </View>

      {/* Central subtle glow */}
      <Animated.View
        entering={FadeIn.delay(500).duration(2000)}
        style={styles.centerGlow}
      />

      {/* Hook text */}
      {showText && (
        <Animated.View
          entering={FadeIn.duration(1500)}
          style={styles.textWrap}
        >
          <Text style={styles.hookText}>Look at yourself.</Text>
          <Text style={styles.hookEmText}>
            This is the last time you'll see the old you.
          </Text>
        </Animated.View>
      )}

      {/* Tap indicator */}
      <Animated.View style={[styles.chevronWrap, chevronStyle]}>
        <Text style={styles.chevronText}>▲</Text>
        <Text style={styles.tapHint}>tap to continue</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgVoid,
  },
  bgBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bgVoid,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 60,
    borderColor: 'rgba(0,0,0,0.3)',
    borderRadius: 0,
  },
  grainDot: {
    position: 'absolute',
    borderRadius: 1,
    backgroundColor: '#ffffff',
  },
  centerGlow: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.25,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  textWrap: {
    position: 'absolute',
    bottom: 140,
    left: 32,
    right: 32,
  },
  hookText: {
    fontFamily: Fonts.display,
    fontSize: 32,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  hookEmText: {
    fontFamily: Fonts.displayItalic,
    fontSize: 22,
    color: Colors.textMuted,
    marginTop: 12,
    lineHeight: 32,
  },
  chevronWrap: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    alignItems: 'center',
  },
  chevronText: {
    color: Colors.textGhost,
    fontSize: 18,
    transform: [{ rotate: '180deg' }],
  },
  tapHint: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textGhost,
    marginTop: 6,
    letterSpacing: 1,
  },
});
