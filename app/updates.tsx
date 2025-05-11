import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import SelfHostedUpdates, {
  UpdateEvent,
  UpdateEventListener,
  ReleaseChannel
} from 'open-expo-ota';

export default function UpdatesScreen() {
  const [status, setStatus] = useState<string>('Idle');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    // Initialize the updates client
    const updatesClient = new SelfHostedUpdates({
      backendUrl: 'http://localhost:3000/api',
      appSlug: 'test-app',
      runtimeVersion: '1.1.0',
      channel: ReleaseChannel.PRODUCTION,
      checkOnLaunch: false, // We'll manually check for updates
      autoInstall: false,   // We'll manually install updates
      debug: true           // Enable debug logs
    });

    // Event listener
    const listener: UpdateEventListener = (event: UpdateEvent) => {
      const timestamp = new Date().toLocaleTimeString();
      const eventLog = `[${timestamp}] ${event.type}`;

      setEvents(prev => [...prev, eventLog]);

      switch (event.type) {
        case 'checking':
          setStatus('Checking');
          setMessage('Checking for updates...');
          setLoading(true);
          break;
        case 'updateAvailable':
          setStatus('Available');
          setMessage(`Update available: ${event.manifest.version}`);
          setLoading(false);
          break;
        case 'updateNotAvailable':
          setStatus('Up to date');
          setMessage('No updates available');
          setLoading(false);
          break;
        case 'downloadStarted':
          setStatus('Downloading');
          setMessage('Downloading update...');
          setLoading(true);
          break;
        case 'downloadFinished':
          setStatus('Downloaded');
          setMessage('Update downloaded successfully');
          setLoading(false);
          break;
        case 'installed':
          setStatus('Installed');
          setMessage('Update installed successfully');
          setLoading(false);
          break;
        case 'error':
          setStatus('Error');
          setMessage(`Error: ${event.error.message}`);
          setLoading(false);
          break;
      }
    };

    // Register listener
    const unsubscribe = updatesClient.addEventListener(listener);

    // Save the client to window for debugging
    // @ts-ignore
    global.updatesClient = updatesClient;

    // Clean up
    return () => {
      unsubscribe();
      // @ts-ignore
      delete global.updatesClient;
    };
  }, []);

  const checkForUpdates = async () => {
    try {
      // @ts-ignore
      await global.updatesClient.checkForUpdates();
    } catch (error) {
      setStatus('Error');
      setMessage(`Error checking for updates: ${error.message}`);
    }
  };

  const downloadUpdate = async () => {
    try {
      // @ts-ignore
      await global.updatesClient.downloadUpdate();
    } catch (error) {
      setStatus('Error');
      setMessage(`Error downloading update: ${error.message}`);
    }
  };

  const applyUpdate = () => {
    try {
      // @ts-ignore
      global.updatesClient.applyUpdate();
    } catch (error) {
      setStatus('Error');
      setMessage(`Error applying update: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'OTA Updates' }} />

      <View style={styles.statusContainer}>
        <Text style={styles.title}>Update Status</Text>
        <Text style={styles.status}>{status}</Text>
        {loading && <ActivityIndicator style={styles.loader} size="small" />}
        <Text style={styles.message}>{message}</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Check for Updates" onPress={checkForUpdates} />
        <View style={styles.buttonSpacer} />
        <Button
          title="Download Update"
          onPress={downloadUpdate}
          disabled={status !== 'Available'}
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Apply Update"
          onPress={applyUpdate}
          disabled={status !== 'Downloaded'}
        />
      </View>

      <View style={styles.eventsContainer}>
        <Text style={styles.title}>Event Log</Text>
        <ScrollView style={styles.events}>
          {events.map((event, index) => (
            <Text key={index} style={styles.eventLog}>{event}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  statusContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  status: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c7be5',
    marginBottom: 5,
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  loader: {
    marginVertical: 10,
  },
  actions: {
    marginBottom: 20,
  },
  buttonSpacer: {
    height: 10,
  },
  eventsContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  events: {
    flex: 1,
  },
  eventLog: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 4,
  },
});