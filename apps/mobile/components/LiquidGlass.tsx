import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

interface LiquidGlassProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  shimmer?: boolean;
}

export function LiquidGlass({
  children,
  style,
  intensity = 30,
  shimmer = false,
}: LiquidGlassProps) {
  const borderOpacity = useSharedValue(0.12);

  useEffect(() => {
    if (shimmer) {
      borderOpacity.value = withRepeat(
        withSequence(
          withTiming(0.25, { duration: 2000 }),
          withTiming(0.08, { duration: 3000 })
        ),
        -1,
        true
      );
    }
  }, [shimmer]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(255,255,255,${borderOpacity.value})`,
  }));

  return (
    <View style={[styles.wrap, style]}>
      <BlurView
        intensity={intensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.border, borderStyle]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: Colors.bgGlass,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.bgGlassBorder,
  },
});
