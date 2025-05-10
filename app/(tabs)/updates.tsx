import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import { useUpdates } from 'openexpoota-client';

export default function UpdatesScreen() {
  const {
    checkForUpdates,
    downloadUpdate,
    applyUpdate,
    currentState,
    updateInfo
  } = useUpdates();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>OTA Updates</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.subtitle}>Update Status</Text>
        <Text style={styles.statusText}>Current State: {currentState || 'idle'}</Text>
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
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => checkForUpdates()}>
          <Text style={styles.buttonText}>Check for Updates</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, currentState !== 'updateAvailable' && styles.buttonDisabled]}
          onPress={() => downloadUpdate()}
          disabled={currentState !== 'updateAvailable'}>
          <Text style={styles.buttonText}>Download Update</Text>
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
});