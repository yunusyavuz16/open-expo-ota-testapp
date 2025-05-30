import { useState, useEffect, useRef } from 'react';
import SelfHostedUpdates, { ReleaseChannel, SelfHostedUpdateConfig, UpdateEvent } from 'open-expo-ota';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import otaConfig from '../ota.config.json';

let appRuntimeVersion: string | undefined;
if (Constants.expoConfig?.runtimeVersion && typeof Constants.expoConfig.runtimeVersion === 'string') {
  appRuntimeVersion = Constants.expoConfig.runtimeVersion;
} else if (Constants.expoConfig?.runtimeVersion && typeof Constants.expoConfig.runtimeVersion === 'object') {
  // If it's an object (like a policy), we can't use it directly here.
  // Log a warning and let the SelfHostedUpdates client use its default (app version).
  console.warn(
    `'Constants.expoConfig.runtimeVersion' is an object (${JSON.stringify(
      Constants.expoConfig.runtimeVersion
    )}), not a string. Falling back to app version for OTA client.`
  );
  appRuntimeVersion = undefined; // Explicitly undefined to let client library handle it
} else {
  appRuntimeVersion = undefined; // Let client library handle it (will use app version or default)
}

// Create a custom hook that wraps the SelfHostedUpdates class
export function useAppUpdates() {
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadFinished, setIsDownloadFinished] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [updateManifest, setUpdateManifest] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const clientRef = useRef<SelfHostedUpdates | null>(null);

  useEffect(() => {
    // Initialize the client with our configuration
    if (!clientRef.current) {
      console.log("Initializing OTA client with config:", {
        backendUrl: otaConfig.api,
        appSlug: otaConfig.slug,
        runtimeVersion: appRuntimeVersion
      });
      console.log("App runtime version:", appRuntimeVersion);
      clientRef.current = new SelfHostedUpdates({
        backendUrl: otaConfig.api,
        channel: ReleaseChannel.DEVELOPMENT,
        appSlug: otaConfig.slug,
        runtimeVersion: appRuntimeVersion,
        debug: true,
        checkOnLaunch: false,
        autoInstall: false,
      });
    }

    // Set up event listener
    const removeListener = clientRef.current.addEventListener((event) => {
      console.log("OTA Event:", event.type, event);

      switch (event.type) {
        case 'checking':
          setIsChecking(true);
          setError(null);
          setErrorMessage(null);
          setIsDownloadFinished(false);
          break;

        case 'updateAvailable':
          setIsChecking(false);
          setIsUpdateAvailable(true);
          setUpdateManifest(event.manifest);
          setIsDownloadFinished(false);
          break;

        case 'updateNotAvailable':
          setIsChecking(false);
          setIsUpdateAvailable(false);
          setIsDownloadFinished(false);
          break;

        case 'error':
          setIsChecking(false);
          setIsDownloading(false);
          setIsDownloadFinished(false);
          setError(event.error);
          setErrorMessage(event.error.message);
          console.error("OTA Error:", event.error);
          break;

        case 'downloadStarted':
          setIsDownloading(true);
          setIsDownloadFinished(false);
          setDownloadProgress(0);
          break;

        case 'downloadProgress':
          if ('progress' in event && typeof event.progress === 'number') {
            setDownloadProgress(event.progress);
          }
          break;

        case 'downloadFinished':
          setIsDownloading(false);
          setIsDownloadFinished(true);
          setDownloadProgress(1);
          break;

        case 'installed':
          setIsUpdateAvailable(false);
          setUpdateManifest(null);
          setIsDownloadFinished(false);
          setIsDownloading(false);
          setDownloadProgress(0);
          break;

        default:
          // Handle updateReady and other events
          if ((event as any).type === 'updateReady' && 'manifest' in event) {
            setIsDownloading(false);
            setIsDownloadFinished(true);
            setUpdateManifest((event as any).manifest);
            setDownloadProgress(1);
            console.log("Update ready for manual installation:", (event as any).manifest);
          }
          break;
      }
    });

    // Check for stored updates
    const checkStoredUpdate = async () => {
      try {
        const storedUpdate = await AsyncStorage.getItem('__EXPO_GO_UPDATE__');
        if (storedUpdate) {
          const updateInfo = JSON.parse(storedUpdate);
          if (updateInfo.type === 'expo-go-update') {
            setIsUpdateAvailable(true);
            setUpdateManifest(updateInfo.manifest);
            setIsDownloadFinished(true);
          }
        }
      } catch (error) {
        console.error('Error checking stored update:', error);
      }
    };

    checkStoredUpdate();

    return () => removeListener();
  }, []);

  // Check for updates
  const checkForUpdates = async () => {
    try {
      if (clientRef.current && !isChecking) {
        console.log("Checking for updates...");
        await clientRef.current.checkForUpdates();
      }
    } catch (err) {
      console.error("Error in checkForUpdates:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  };

  // Download update
  const downloadUpdate = async () => {
    try {
      if (clientRef.current && isUpdateAvailable && !isDownloading) {
        console.log("Downloading update...");
        await clientRef.current.downloadUpdate();
      }
    } catch (err) {
      console.error("Error in downloadUpdate:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  };

  // Apply update
  const applyUpdate = () => {
    try {
      console.log("Applying update...");
      if (clientRef.current) {
        clientRef.current.applyUpdate();
      }
    } catch (err) {
      console.error("Error in applyUpdate:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  };

  // Map the state to match what the UpdatesScreen component expects
  return {
    checkForUpdates,
    downloadUpdate,
    applyUpdate,
    isChecking,
    isDownloading,
    isUpdateAvailable,
    downloadProgress,
    currentState: isDownloadFinished
      ? 'downloadFinished'
      : isUpdateAvailable
        ? 'updateAvailable'
        : isDownloading
          ? 'downloading'
          : 'idle',
    updateInfo: updateManifest
      ? {
          channel: updateManifest.channel,
          version: updateManifest.version,
          runtimeVersion: updateManifest.runtimeVersion,
          lastCheckDate: new Date().toISOString(),
        }
      : null,
    error,
    errorMessage
  };
}