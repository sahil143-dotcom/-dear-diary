import { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface SparkAnimationProps {
  visible: boolean;
  onComplete?: () => void;
}

/**
 * White-gold spark that shoots from center to the top-left corner
 * (where the timeline lives), signaling "new memory captured."
 */
export function SparkAnimation({ visible, onComplete }: SparkAnimationProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const trailOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Start at center
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 0;
      opacity.value = 0;

      // Appear
      scale.value = withTiming(1.5, { duration: 150 });
      opacity.value = withTiming(1, { duration: 100 });

      // Trail
      trailOpacity.value = withDelay(100, withTiming(0.6, { duration: 200 }));

      // Shoot to top-left
      translateX.value = withDelay(
        200,
        withTiming(-width * 0.35, {
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
      translateY.value = withDelay(
        200,
        withTiming(-height * 0.35, {
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );

      // Fade out at destination
      scale.value = withDelay(600, withTiming(0.3, { duration: 200 }));
      opacity.value = withDelay(
        650,
        withTiming(0, { duration: 150 }, () => {
          if (onComplete) runOnJS(onComplete)();
        })
      );
      trailOpacity.value = withDelay(500, withTiming(0, { duration: 300 }));
    }
  }, [visible]);

  const sparkStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const trailStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value * 0.7 },
      { translateY: translateY.value * 0.7 },
    ],
    opacity: trailOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Trail */}
      <Animated.View style={[styles.trail, trailStyle]} />

      {/* Main spark */}
      <Animated.View style={[styles.spark, sparkStyle]}>
        <View style={styles.sparkCore} />
        <View style={styles.sparkGlow} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  spark: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.spark,
  },
  sparkGlow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.sparkGold,
    opacity: 0.4,
  },
  trail: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.sparkGold,
    opacity: 0.3,
  },
});
