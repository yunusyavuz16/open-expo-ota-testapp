import { useState, useEffect, useRef } from 'react';
import SelfHostedUpdates, { ReleaseChannel, SelfHostedUpdateConfig, UpdateEvent } from 'open-expo-ota';
import Constants from 'expo-constants';
import otaConfig from '../ota.config.json';

// Get the runtime version from expo config
const runtimeVersion = Constants.expoConfig?.version || '1.0.0';

// Create a custom hook that wraps the SelfHostedUpdates class
export function useAppUpdates() {
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadFinished, setIsDownloadFinished] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [updateManifest, setUpdateManifest] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const clientRef = useRef<SelfHostedUpdates | null>(null);

  useEffect(() => {
    // Initialize the client with our configuration
    if (!clientRef.current) {
      console.log("Initializing OTA client with config:", {
        backendUrl: otaConfig.api,
        appSlug: otaConfig.slug,
        runtimeVersion
      });

      clientRef.current = new SelfHostedUpdates({
        backendUrl: otaConfig.api,
        channel: ReleaseChannel.PRODUCTION,
        appSlug: otaConfig.slug,
        runtimeVersion,
        debug: true,
        checkOnLaunch: true,
        autoInstall: true,
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
          break;

        case 'downloadFinished':
          setIsDownloading(false);
          setIsDownloadFinished(true);
          break;

        case 'installed':
          setIsUpdateAvailable(false);
          setUpdateManifest(null);
          setIsDownloadFinished(false);
          setIsDownloading(false);
          break;
      }
    });

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