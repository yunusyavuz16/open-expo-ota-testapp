import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useAppUpdates } from '../../hooks/useAppUpdates';
import Constants from 'expo-constants';

export default function UpdatesScreen() {
  const isExpoGo = Constants.appOwnership === 'expo';
  const {
    checkForUpdates,
    downloadUpdate,
    applyUpdate,
    currentState,
    updateInfo,
    isChecking,
    isDownloading,
    downloadProgress,
    error,
    errorMessage
  } = useAppUpdates();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>OTA Updates</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.subtitle}>PROMOTED STAGING → DEVELOPMENT — S22</Text>
        <Text style={styles.statusText}>Current State: {currentState || 'idle'}</Text>

        {isExpoGo && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>🚀 Running in Expo Go</Text>
            <Text style={styles.infoText}>
              OTA updates are simulated for testing. Install a release build to exercise expo-updates.
            </Text>
          </View>
        )}

        {isChecking && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3498db" />
            <Text style={styles.loadingText}>Checking for updates...</Text>
          </View>
        )}

        {isDownloading && (
          <View style={styles.downloadContainer}>
            <Text style={styles.downloadTitle}>📥 Downloading Update</Text>
            <Text style={styles.downloadText}>
              Progress: {Math.round((downloadProgress || 0) * 100)}%
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${(downloadProgress || 0) * 100}%` }
                ]}
              />
            </View>
            <ActivityIndicator size="small" color="#27ae60" style={{ marginTop: 10 }} />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{errorMessage || error.message}</Text>
          </View>
        )}

        {updateInfo && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Channel: {updateInfo.channel || '-'}</Text>
            <Text style={styles.infoText}>Version: {updateInfo.version || '-'}</Text>
            <Text style={styles.infoText}>Runtime: {updateInfo.runtimeVersion || '-'}</Text>
            {updateInfo.lastCheckDate && (
              <Text style={styles.infoText}>
                Last Check: {new Date(updateInfo.lastCheckDate).toLocaleString()}
              </Text>
            )}
          </View>
        )}

        {currentState === 'downloadFinished' && (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>✅ Update Downloaded</Text>
            <Text style={styles.successText}>
              The update is ready. Press Apply Update to reload the app with the new bundle.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.configContainer}>
        <Text style={styles.subtitle}>Configuration</Text>
        <Text style={styles.infoText}>App Slug: test-app-1747315674782</Text>
        <Text style={styles.infoText}>API URL: http://localhost:3000/api</Text>
        <Text style={styles.infoText}>Runtime Version: {
          typeof Constants.expoConfig?.runtimeVersion === 'string'
            ? Constants.expoConfig.runtimeVersion
            : Constants.expoConfig?.version || '1.0.0'
        }</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => checkForUpdates()}>
          <Text style={styles.buttonText}>Check for Updates</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            (currentState !== 'updateAvailable' || isDownloading) && styles.buttonDisabled
          ]}
          onPress={() => downloadUpdate()}
          disabled={currentState !== 'updateAvailable' || isDownloading}>
          <Text style={styles.buttonText}>
            {isDownloading
              ? `Downloading... ${Math.round((downloadProgress || 0) * 100)}%`
              : 'Download Update'
            }
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, currentState !== 'downloadFinished' && styles.buttonDisabled]}
          onPress={() => applyUpdate()}
          disabled={currentState !== 'downloadFinished'}>
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
  configContainer: {
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
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#3498db',
  },
  errorContainer: {
    backgroundColor: '#ffeeee',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  errorTitle: {
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
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
  successContainer: {
    backgroundColor: '#dff0d8',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  successTitle: {
    color: '#3c763d',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  successText: {
    color: '#3c763d',
    fontSize: 14,
  },
  downloadContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  downloadText: {
    fontSize: 14,
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 5,
  },
});
