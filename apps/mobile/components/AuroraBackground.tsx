import { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  FadeIn,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface AuroraBackgroundProps {
  children: React.ReactNode;
  intensity?: number; // 0-1, controls aurora visibility
  showStars?: boolean;
}

export function AuroraBackground({
  children,
  intensity = 0.15,
  showStars = true,
}: AuroraBackgroundProps) {
  const drift1X = useSharedValue(0);
  const drift1Y = useSharedValue(0);
  const drift2X = useSharedValue(0);
  const drift2Y = useSharedValue(0);
  const auroraOpacity = useSharedValue(intensity);

  useEffect(() => {
    // Slow drifting aurora movement
    drift1X.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 20000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-20, { duration: 25000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    drift1Y.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 18000, easing: Easing.inOut(Easing.ease) }),
        withTiming(25, { duration: 22000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    drift2X.value = withRepeat(
      withSequence(
        withTiming(-25, { duration: 22000, easing: Easing.inOut(Easing.ease) }),
        withTiming(35, { duration: 28000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    drift2Y.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 24000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-15, { duration: 19000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    auroraOpacity.value = withRepeat(
      withSequence(
        withTiming(intensity * 1.3, { duration: 8000 }),
        withTiming(intensity * 0.7, { duration: 10000 })
      ),
      -1,
      true
    );
  }, [intensity]);

  const aurora1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift1X.value },
      { translateY: drift1Y.value },
    ],
    opacity: auroraOpacity.value,
  }));

  const aurora2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift2X.value },
      { translateY: drift2Y.value },
    ],
    opacity: auroraOpacity.value * 0.8,
  }));

  return (
    <View style={styles.root}>
      {/* Base background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.bgDeep }]} />

      {/* Aurora layer 1 — navy to violet */}
      <Animated.View style={[styles.aurora, aurora1Style]}>
        <LinearGradient
          colors={[Colors.auroraNavy, 'transparent']}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Aurora layer 2 — violet accent */}
      <Animated.View style={[styles.aurora2, aurora2Style]}>
        <LinearGradient
          colors={[Colors.auroraViolet, 'transparent']}
          start={{ x: 0.7, y: 0.2 }}
          end={{ x: 0.2, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Star field */}
      {showStars &&
        STARS.map((star, i) => (
          <Animated.View
            key={i}
            entering={FadeIn.delay(i * 25).duration(800)}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity: star.opacity,
              },
            ]}
          />
        ))}

      {/* Content */}
      {children}
    </View>
  );
}

// Pre-computed star positions for consistent rendering
const STARS = Array.from({ length: 50 }, (_, i) => ({
  x: `${((i * 17 + 7) % 100)}%` as const,
  y: `${((i * 23 + 13) % 100)}%` as const,
  size: 1 + (i % 3),
  opacity: 0.15 + (i % 5) * 0.08,
}));

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  aurora: {
    position: 'absolute',
    top: -height * 0.3,
    left: -width * 0.3,
    width: width * 1.6,
    height: height * 0.8,
    borderRadius: width * 0.4,
  },
  aurora2: {
    position: 'absolute',
    top: height * 0.2,
    right: -width * 0.3,
    width: width * 1.4,
    height: height * 0.7,
    borderRadius: width * 0.35,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
  },
});
