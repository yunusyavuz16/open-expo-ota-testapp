import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import SelfHostedUpdates, { SelfHostedUpdateConfig, ReleaseChannel } from 'openexpoota-client';

import { useColorScheme } from '@/hooks/useColorScheme';

// Initialize the updates system
const updatesConfig: SelfHostedUpdateConfig = {
  apiUrl: 'http://localhost:3000',
  appSlug: 'test-expo-app',
  appKey: 'test-app-key',
  channel: ReleaseChannel.DEVELOPMENT,
  checkOnLaunch: true,
  autoInstall: false,
  debug: true
};

// Create the instance
const updates = new SelfHostedUpdates(updatesConfig);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
