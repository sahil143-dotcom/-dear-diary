import { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface GlassShatterProps {
  shatter: boolean;
  onComplete?: () => void;
}

interface Shard {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rotation: number;
}

function generateShards(count: number): Shard[] {
  const cx = width / 2;
  const cy = height / 2;
  const shards: Shard[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 200 + Math.random() * 400;
    shards.push({
      id: i,
      x: cx + (Math.random() - 0.5) * 80,
      y: cy + (Math.random() - 0.5) * 60,
      w: 20 + Math.random() * 40,
      h: 15 + Math.random() * 30,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: Math.random() * 720 - 360,
    });
  }
  return shards;
}

function ShardPiece({
  shard,
  shatter,
  delay,
}: {
  shard: Shard;
  shatter: boolean;
  delay: number;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (shatter) {
      translateX.value = withDelay(
        delay,
        withSpring(shard.vx, { damping: 12, stiffness: 80 })
      );
      translateY.value = withDelay(
        delay,
        withSpring(shard.vy + 200, { damping: 12, stiffness: 80 })
      );
      rotate.value = withDelay(
        delay,
        withSpring(shard.rotation, { damping: 8 })
      );
      opacity.value = withDelay(delay + 400, withTiming(0, { duration: 300 }));
      scale.value = withDelay(delay + 300, withTiming(0.3, { duration: 400 }));
    }
  }, [shatter]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.shard,
        {
          left: shard.x,
          top: shard.y,
          width: shard.w,
          height: shard.h,
        },
        style,
      ]}
    />
  );
}

export function GlassShatter({ shatter, onComplete }: GlassShatterProps) {
  const shards = useMemo(() => generateShards(14), []);
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    if (shatter) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      bgOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
      // Fire onComplete after all shards have faded
      const timer = setTimeout(() => onComplete?.(), 1200);
      return () => clearTimeout(timer);
    }
  }, [shatter]);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  if (!shatter) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {shards.map((shard, i) => (
        <ShardPiece
          key={shard.id}
          shard={shard}
          shatter={shatter}
          delay={i * 15}
        />
      ))}

      {/* Fade to dark */}
      <Animated.View style={[styles.fadeOverlay, bgStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  shard: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  fadeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bgDeep,
  },
});
