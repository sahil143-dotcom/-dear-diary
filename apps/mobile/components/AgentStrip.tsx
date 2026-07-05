import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Fonts } from '@/constants/theme';

export function AgentStrip({
  steps,
}: {
  steps: Array<{ label: string; status: string }>;
}) {
  return (
    <View style={styles.wrap}>
      {steps.map((s, i) => (
        <Animated.View
          key={s.label}
          entering={FadeInDown.delay(i * 80)}
          style={styles.chip}
        >
          <View
            style={[
              styles.dot,
              s.status === 'done' ? styles.dotDone : styles.dotPending,
            ]}
          />
          <Text style={styles.label}>{s.label}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.bgGlassBorder,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotDone: { backgroundColor: Colors.cognee },
  dotPending: { backgroundColor: Colors.textMuted },
  label: { color: Colors.textMuted, fontSize: 11, fontFamily: Fonts.body },
});
