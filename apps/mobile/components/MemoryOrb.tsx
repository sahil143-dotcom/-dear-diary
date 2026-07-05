import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";

export function MemoryOrb({
  size = 160,
  active = false,
  recording = false,
}: {
  size?: number;
  active?: boolean;
  recording?: boolean;
}) {
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(recording ? 1.15 : 1.06, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    glow.value = withRepeat(
      withTiming(recording ? 0.9 : 0.5, { duration: 1200 }),
      -1,
      true
    );
  }, [recording]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: glow.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              width: size + i * 40,
              height: size + i * 40,
              borderRadius: (size + i * 40) / 2,
              borderColor: recording ? Colors.emotion : Colors.cognee,
              opacity: active ? 0.3 - i * 0.08 : 0.1,
            },
          ]}
        />
      ))}
      <Animated.View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: recording ? Colors.emotion : Colors.designer,
          },
          orbStyle,
        ]}
      >
        <View style={[styles.inner, { borderRadius: size / 2 }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  ring: {
    position: "absolute",
    borderWidth: 1,
  },
  orb: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,26,46,0.8)",
  },
  inner: {
    width: "70%",
    height: "70%",
    backgroundColor: "rgba(0,197,134,0.08)",
  },
});
