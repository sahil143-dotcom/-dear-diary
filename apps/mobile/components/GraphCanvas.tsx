import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '@/constants/theme';

const NODES = [
  { x: 50, y: 60, label: 'Arjun', color: Colors.person },
  { x: 150, y: 35, label: 'Roguelike', color: Colors.project },
  { x: 260, y: 70, label: 'Diary', color: Colors.project },
  { x: 110, y: 120, label: 'Mar 11', color: Colors.theme },
  { x: 210, y: 130, label: 'Pattern', color: Colors.emotion },
  { x: 300, y: 110, label: 'Stuck', color: Colors.emotion },
  { x: 80, y: 160, label: 'Ship', color: Colors.cognee },
];

const EDGES = [
  [0, 1],
  [1, 2],
  [0, 3],
  [2, 4],
  [1, 4],
  [4, 5],
  [0, 6],
  [3, 6],
];

export function GraphCanvas({ active }: { active?: boolean }) {
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={190} viewBox="0 0 340 190">
        {EDGES.map(([a, b], i) => (
          <Line
            key={i}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke={active ? Colors.cognee : Colors.bgGlassBorder}
            strokeWidth={active ? 1.5 : 0.8}
            opacity={active ? 0.6 : 0.25}
          />
        ))}
        {NODES.map((n) => (
          <Circle
            key={n.label}
            cx={n.x}
            cy={n.y}
            r={active ? 7 : 5}
            fill={active ? `${n.color}55` : `${n.color}22`}
            stroke={n.color}
            strokeWidth={active ? 1.5 : 0.8}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 200 },
});
