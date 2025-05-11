import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import SelfHostedUpdates, { SelfHostedUpdateConfig, ReleaseChannel } from 'open-expo-ota';
import { useColorScheme } from '../hooks/useColorScheme';

// Initialize the updates system
const updatesConfig: SelfHostedUpdateConfig = {
  backendUrl: 'http://localhost:3000/api',
  appSlug: 'test-app',
  channel: ReleaseChannel.PRODUCTION,
  checkOnLaunch: false, // We'll handle this manually in the UpdatesScreen
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
        <Stack.Screen name="updates" options={{ title: 'OTA Updates' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
