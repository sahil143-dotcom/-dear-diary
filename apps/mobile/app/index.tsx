import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

const ONBOARDED_KEY = '@dd/onboarded';

export default function Index() {
  const [status, setStatus] = useState<'loading' | 'onboard' | 'dashboard'>(
    'loading'
  );

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY).then((v) => {
      setStatus(v === 'true' ? 'dashboard' : 'onboard');
    });
  }, []);

  if (status === 'loading') {
    return <View style={{ flex: 1, backgroundColor: Colors.bgVoid }} />;
  }

  if (status === 'onboard') {
    return <Redirect href="/onboarding/mirror" />;
  }

  return <Redirect href="/dashboard" />;
}
