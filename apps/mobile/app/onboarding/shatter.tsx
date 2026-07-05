import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Colors, Fonts } from '@/constants/theme';
import { GlassShatter } from '@/components/GlassShatter';
import { LiquidGlass } from '@/components/LiquidGlass';

const { width, height } = Dimensions.get('window');

export default function ShatterScreen() {
  const router = useRouter();
  const [showCard, setShowCard] = useState(true);
  const [shatter, setShatter] = useState(false);
  const starsOpacity = useSharedValue(0);

  useEffect(() => {
    // Auto-trigger shatter after a beat
    const timer = setTimeout(() => {
      setShatter(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  async function handleShatterComplete() {
    setShowCard(false);

    // Stars emerge from the void
    starsOpacity.value = withDelay(200, withTiming(1, { duration: 1200 }));

    // Mark onboarding complete
    await AsyncStorage.setItem('@dd/onboarded', 'true');

    // Navigate to dashboard
    setTimeout(() => {
      router.replace('/dashboard');
    }, 1800);
  }

  const starsStyle = useAnimatedStyle(() => ({
    opacity: starsOpacity.value,
  }));

  return (
    <View style={styles.root}>
      {/* The glass card that will shatter */}
      {showCard && !shatter && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.cardWrap}>
          <LiquidGlass style={styles.glassCard} intensity={40}>
            <Text style={styles.cardText}>Ready?</Text>
          </LiquidGlass>
        </Animated.View>
      )}

      {/* Glass shatter effect */}
      <GlassShatter shatter={shatter} onComplete={handleShatterComplete} />

      {/* Stars emerging after shatter */}
      <Animated.View
        style={[StyleSheet.absoluteFill, starsStyle]}
        pointerEvents="none"
      >
        {Array.from({ length: 60 }).map((_, i) => (
          <Animated.View
            key={i}
            entering={FadeInUp.delay(200 + i * 30).duration(600)}
            style={[
              styles.star,
              {
                left: `${((i * 17 + 7) % 100)}%`,
                top: `${((i * 23 + 13) % 100)}%`,
                opacity: 0.15 + (i % 5) * 0.08,
                width: 1 + (i % 3),
                height: 1 + (i % 3),
              },
            ]}
          />
        ))}

        {/* Welcome text */}
        <Animated.View
          entering={FadeIn.delay(800).duration(1000)}
          style={styles.welcomeWrap}
        >
          <Text style={styles.welcomeText}>Dear Diary</Text>
          <Text style={styles.welcomeSub}>Your memories begin now.</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgVoid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrap: {
    width: width * 0.6,
  },
  glassCard: {
    padding: 36,
    alignItems: 'center',
  },
  cardText: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.text,
  },
  star: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  welcomeWrap: {
    position: 'absolute',
    bottom: height * 0.3,
    alignSelf: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: Fonts.display,
    fontSize: 36,
    color: Colors.text,
    letterSpacing: -1,
  },
  welcomeSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 12,
  },
});
