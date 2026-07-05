import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bgVoid },
        animation: 'fade',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="mirror" />
      <Stack.Screen name="focus" />
      <Stack.Screen name="shatter" />
    </Stack>
  );
}
