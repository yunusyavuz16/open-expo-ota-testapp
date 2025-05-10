import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ScrollView, Alert } from 'react-native';
import SelfHostedUpdates, { ReleaseChannel } from 'openexpoota-client';
import Constants from 'expo-constants';

// Initialize the updates system
const updates = new SelfHostedUpdates({
  apiUrl: 'http://localhost:3000',
  appSlug: 'test-expo-app',
  appKey: 'test-app-key',
  channel: ReleaseChannel.DEVELOPMENT,
  checkOnLaunch: false, // We'll handle checking manually
  autoInstall: false,
  debug: true
});

export default function UpdatesScreen() {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  // Set up event listener
  useEffect(() => {
    const removeListener = updates.addEventListener((event) => {
      console.log('Update event:', event.type);

      switch (event.type) {
        case 'checking':
          setIsChecking(true);
          setError(null);
          break;

        case 'updateAvailable':
          setIsChecking(false);
          setIsUpdateAvailable(true);
          setUpdateInfo(event.manifest);
          setLastCheckTime(new Date());
          break;

        case 'updateNotAvailable':
          setIsChecking(false);
          setIsUpdateAvailable(false);
          setLastCheckTime(new Date());
          Alert.alert('No Updates', 'Your app is up to date!');
          break;

        case 'error':
          setIsChecking(false);
          setError(event.error);
          Alert.alert('Error', `Failed to check for updates: ${event.error.message}`);
          break;

        case 'downloadStarted':
          setProgress(0);
          break;

        case 'downloadProgress':
          if (event.progress !== undefined) {
            setProgress(event.progress);
          }
          break;

        case 'downloadFinished':
          setProgress(1);
          Alert.alert('Ready to Install', 'Update is ready to install!');
          break;

        case 'installed':
          setIsUpdateAvailable(false);
          setUpdateInfo(null);
          setProgress(null);
          break;
      }
    });

    // Clean up the listener when component unmounts
    return () => removeListener();
  }, []);

  // Check for updates
  const checkForUpdates = async () => {
    try {
      await updates.checkForUpdates();
    } catch (err) {
      console.error('Failed to check for updates:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Download update
  const downloadUpdate = async () => {
    try {
      await updates.downloadUpdate();
    } catch (err) {
      console.error('Failed to download update:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Apply update
  const applyUpdate = () => {
    try {
      updates.applyUpdate();
    } catch (err) {
      console.error('Failed to apply update:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>OTA Updates</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>App Version: {Constants.expoConfig?.version || '1.0.0'}</Text>
        <Text style={styles.infoText}>Platform: {Constants.platform?.ios ? 'iOS' : 'Android'}</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.subtitle}>Update Status</Text>
        <Text style={styles.statusText}>Status: {
          isChecking ? 'Checking...' :
          isUpdateAvailable ? 'Update Available!' :
          'Up to date'
        }</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Error: {error.message}</Text>
          </View>
        )}

        {updateInfo && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Channel: {updateInfo.channel || '-'}</Text>
            <Text style={styles.infoText}>Version: {updateInfo.version || '-'}</Text>
            <Text style={styles.infoText}>Runtime: {updateInfo.runtimeVersion || '-'}</Text>
          </View>
        )}

        {progress !== null && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Downloading: {Math.round(progress * 100)}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          </View>
        )}

        {lastCheckTime && (
          <Text style={styles.infoText}>
            Last Check: {lastCheckTime.toLocaleString()}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={checkForUpdates}
          disabled={isChecking}>
          <Text style={styles.buttonText}>Check for Updates</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !isUpdateAvailable && styles.buttonDisabled]}
          onPress={downloadUpdate}
          disabled={!isUpdateAvailable || progress !== null}>
          <Text style={styles.buttonText}>Download Update</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, progress !== 1 && styles.buttonDisabled]}
          onPress={applyUpdate}
          disabled={progress !== 1}>
          <Text style={styles.buttonText}>Apply Update</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginVertical: 10,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  progress: {
    height: 10,
    backgroundColor: '#4caf50',
    borderRadius: 5,
  },
});