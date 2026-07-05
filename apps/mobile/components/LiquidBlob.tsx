import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

interface LiquidBlobProps {
  size?: number;
  intensity?: number; // 0-1, driven by audio metering
  recording?: boolean;
  color?: string;
}

/**
 * Liquid Blob — morphing voice visualizer.
 * Uses 5 overlapping animated circles with different phases
 * to create an organic, undulating blob appearance.
 * The `intensity` prop drives how aggressively the blob morphs.
 */
export function LiquidBlob({
  size = 180,
  intensity = 0,
  recording = false,
  color = Colors.cognee,
}: LiquidBlobProps) {
  const time = useSharedValue(0);
  const breathe = useSharedValue(1);

  useEffect(() => {
    // Continuous rotation/morphing
    time.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
    // Breathing pulse
    breathe.value = withRepeat(
      withSequence(
        withTiming(recording ? 1.12 : 1.04, {
          duration: recording ? 600 : 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: recording ? 600 : 1500,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, [recording]);

  const blobLayers = BLOB_CONFIGS.map((cfg, i) => {
    const animStyle = useAnimatedStyle(() => {
      const intensityScale = 1 + intensity * cfg.intensityMult;
      const angle = (time.value + cfg.phaseOffset) * (Math.PI / 180);
      const wobbleX = Math.sin(angle * cfg.freqX) * cfg.amplitude * (1 + intensity * 2);
      const wobbleY = Math.cos(angle * cfg.freqY) * cfg.amplitude * (1 + intensity * 2);

      return {
        transform: [
          { translateX: wobbleX },
          { translateY: wobbleY },
          { scaleX: breathe.value * intensityScale * cfg.scaleX },
          { scaleY: breathe.value * intensityScale * cfg.scaleY },
          { rotate: `${time.value * cfg.rotateSpeed}deg` },
        ],
        opacity: interpolate(
          intensity,
          [0, 0.3, 1],
          [cfg.baseOpacity, cfg.baseOpacity * 1.5, cfg.baseOpacity * 2.5]
        ),
      };
    });

    return (
      <Animated.View
        key={i}
        style={[
          styles.blob,
          {
            width: size * cfg.sizeMult,
            height: size * cfg.sizeMult * cfg.aspect,
            borderRadius: (size * cfg.sizeMult) / 2,
            backgroundColor: i === 0 ? color : `${color}${cfg.alphaHex}`,
          },
          animStyle,
        ]}
      />
    );
  });

  // Outer glow rings
  const ringStyles = [0, 1, 2].map((i) => {
    const ringAnim = useAnimatedStyle(() => {
      const ringScale = breathe.value * (1 + i * 0.15);
      return {
        transform: [{ scale: ringScale }],
        opacity: interpolate(
          intensity,
          [0, 0.5, 1],
          [0.05 - i * 0.01, 0.15 - i * 0.03, 0.3 - i * 0.06]
        ),
      };
    });

    return (
      <Animated.View
        key={`ring-${i}`}
        style={[
          styles.ring,
          {
            width: size + i * 44,
            height: size + i * 44,
            borderRadius: (size + i * 44) / 2,
            borderColor: recording ? Colors.emotion : color,
          },
          ringAnim,
        ]}
      />
    );
  });

  return (
    <View style={[styles.container, { width: size * 1.6, height: size * 1.6 }]}>
      {ringStyles}
      {blobLayers}
      {/* Center glow */}
      <View
        style={[
          styles.centerGlow,
          {
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: size * 0.2,
            backgroundColor: `${color}15`,
          },
        ]}
      />
    </View>
  );
}

const BLOB_CONFIGS = [
  {
    sizeMult: 0.95,
    aspect: 0.9,
    scaleX: 1,
    scaleY: 1,
    phaseOffset: 0,
    freqX: 1.5,
    freqY: 2.0,
    amplitude: 6,
    rotateSpeed: 0.05,
    baseOpacity: 0.12,
    intensityMult: 0.1,
    alphaHex: '20',
  },
  {
    sizeMult: 0.82,
    aspect: 1.05,
    scaleX: 1.05,
    scaleY: 0.95,
    phaseOffset: 72,
    freqX: 2.0,
    freqY: 1.3,
    amplitude: 10,
    rotateSpeed: -0.08,
    baseOpacity: 0.1,
    intensityMult: 0.15,
    alphaHex: '1a',
  },
  {
    sizeMult: 0.88,
    aspect: 0.95,
    scaleX: 0.95,
    scaleY: 1.08,
    phaseOffset: 144,
    freqX: 1.8,
    freqY: 2.5,
    amplitude: 8,
    rotateSpeed: 0.06,
    baseOpacity: 0.08,
    intensityMult: 0.2,
    alphaHex: '15',
  },
  {
    sizeMult: 0.7,
    aspect: 1.0,
    scaleX: 1.1,
    scaleY: 0.9,
    phaseOffset: 216,
    freqX: 2.3,
    freqY: 1.7,
    amplitude: 12,
    rotateSpeed: -0.04,
    baseOpacity: 0.15,
    intensityMult: 0.25,
    alphaHex: '25',
  },
  {
    sizeMult: 0.6,
    aspect: 1.1,
    scaleX: 1.0,
    scaleY: 1.0,
    phaseOffset: 288,
    freqX: 1.2,
    freqY: 2.8,
    amplitude: 5,
    rotateSpeed: 0.1,
    baseOpacity: 0.2,
    intensityMult: 0.12,
    alphaHex: '33',
  },
];

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  centerGlow: {
    position: 'absolute',
  },
});
