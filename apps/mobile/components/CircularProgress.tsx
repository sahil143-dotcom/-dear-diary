import { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  duration?: number; // milliseconds
  running?: boolean;
  onComplete?: () => void;
}

export function CircularProgress({
  size = 60,
  strokeWidth = 3,
  duration = 60000,
  running = false,
  onComplete,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    if (running) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration,
        easing: Easing.linear,
      });
      // Fire onComplete after duration
      const timer = setTimeout(() => onComplete?.(), duration);
      return () => clearTimeout(timer);
    } else {
      progress.value = 0;
    }
  }, [running, duration]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background ring */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.bgGlassBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
      </Svg>

      {/* Progress ring */}
      <Svg
        width={size}
        height={size}
        style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}
      >
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.cognee}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
