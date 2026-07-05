import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts } from '@/constants/theme';
import { AuroraBackground } from '@/components/AuroraBackground';

const SETTINGS = [
  { id: 'dark', icon: '🌙', label: 'Dark Mode' },
  { id: 'lock', icon: '🔒', label: 'Privacy Lock' },
  { id: 'delete', icon: '🗑️', label: 'Delete All' },
  { id: 'mood', icon: '📊', label: 'Mood Map' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [lockEnabled, setLockEnabled] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);

  function handleToggle(id: string, value: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (id === 'dark') {
      setDarkMode(value); // Placebo — always dark
    } else if (id === 'lock') {
      setLockEnabled(value);
    }
  }

  function handlePress(id: string) {
    Haptics.selectionAsync();

    if (id === 'mood') {
      router.push('/memory');
    } else if (id === 'delete') {
      handleDeleteFlow();
    }
  }

  function handleDeleteFlow() {
    if (deleteStep === 0) {
      setDeleteStep(1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (deleteStep === 1) {
      setDeleteStep(2);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      // Step 3: requires a 3-second long-press (shown in UI)
    } else if (deleteStep === 2) {
      Alert.alert(
        'Final Step',
        'Long-press the delete button for 3 seconds to confirm.',
        [{ text: 'Cancel', onPress: () => setDeleteStep(0) }]
      );
    }
  }

  async function executeDelete() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await AsyncStorage.clear();
    await AsyncStorage.setItem('@dd/onboarded', 'true'); // Don't re-show onboarding
    setDeleteStep(0);
    router.replace('/dashboard');
  }

  return (
    <AuroraBackground intensity={0.06}>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← back</Text>
        </Pressable>

        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.iconHeader}
        >
          <Text style={styles.headerIcon}>⚙</Text>
        </Animated.View>

        <View style={styles.list}>
          {SETTINGS.map((item, i) => (
            <Animated.View
              key={item.id}
              entering={FadeInUp.delay(i * 80).duration(400)}
            >
              <Pressable
                style={styles.row}
                onPress={() => handlePress(item.id)}
                onLongPress={
                  item.id === 'delete' && deleteStep === 2
                    ? executeDelete
                    : undefined
                }
                delayLongPress={3000}
              >
                <Text style={styles.icon}>{item.icon}</Text>

                {/* Toggles for dark & lock */}
                {(item.id === 'dark' || item.id === 'lock') && (
                  <Switch
                    value={item.id === 'dark' ? darkMode : lockEnabled}
                    onValueChange={(v) => handleToggle(item.id, v)}
                    trackColor={{
                      false: Colors.bgSurface,
                      true: Colors.cogneeDim,
                    }}
                    thumbColor={
                      (item.id === 'dark' ? darkMode : lockEnabled)
                        ? Colors.cognee
                        : Colors.textGhost
                    }
                  />
                )}

                {/* Delete state indicators */}
                {item.id === 'delete' && deleteStep > 0 && (
                  <View style={styles.deleteIndicator}>
                    {[1, 2, 3].map((step) => (
                      <View
                        key={step}
                        style={[
                          styles.deleteDot,
                          deleteStep >= step && styles.deleteDotActive,
                        ]}
                      />
                    ))}
                  </View>
                )}

                {/* Navigate arrow for mood */}
                {item.id === 'mood' && (
                  <Text style={styles.arrow}>→</Text>
                )}
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={FadeIn.delay(400).duration(600)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>Dear Diary v1.0.0</Text>
          <Text style={styles.footerSub}>
            Speechmatics · Cognee · RAISE 2026
          </Text>
        </Animated.View>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 56,
  },
  back: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    marginBottom: 32,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerIcon: {
    fontSize: 32,
    color: Colors.textGhost,
  },
  list: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  icon: {
    fontSize: 24,
  },
  arrow: {
    fontSize: 18,
    color: Colors.textGhost,
  },
  deleteIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  deleteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.bgGlassBorder,
  },
  deleteDotActive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textGhost,
  },
  footerSub: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textGhost,
    marginTop: 4,
    letterSpacing: 1,
  },
});
