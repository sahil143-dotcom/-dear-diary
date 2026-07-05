import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
} from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bgDeep }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bgDeep },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'none' }} />
        <Stack.Screen name="dashboard" options={{ animation: 'fade' }} />
        <Stack.Screen name="capture" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="bloom"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="memory"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="lenses"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen name="witness" options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="settings"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
