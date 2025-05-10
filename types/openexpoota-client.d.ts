declare module 'openexpoota-client' {
  import { ReactNode } from 'react';

  export enum ReleaseChannel {
    PRODUCTION = 'production',
    STAGING = 'staging',
    DEVELOPMENT = 'development'
  }

  export interface UpdateEventBase {
    type: string;
  }

  export interface CheckingEvent extends UpdateEventBase {
    type: 'checking';
  }

  export interface UpdateAvailableEvent extends UpdateEventBase {
    type: 'updateAvailable';
    manifest: any;
  }

  export interface UpdateNotAvailableEvent extends UpdateEventBase {
    type: 'updateNotAvailable';
  }

  export interface DownloadStartedEvent extends UpdateEventBase {
    type: 'downloadStarted';
  }

  export interface DownloadFinishedEvent extends UpdateEventBase {
    type: 'downloadFinished';
  }

  export interface DownloadProgressEvent extends UpdateEventBase {
    type: 'downloadProgress';
    progress: number;
  }

  export interface InstalledEvent extends UpdateEventBase {
    type: 'installed';
  }

  export interface ErrorEvent extends UpdateEventBase {
    type: 'error';
    error: Error;
  }

  export type UpdateEvent =
    | CheckingEvent
    | UpdateAvailableEvent
    | UpdateNotAvailableEvent
    | DownloadStartedEvent
    | DownloadFinishedEvent
    | DownloadProgressEvent
    | InstalledEvent
    | ErrorEvent;

  export type UpdateEventListener = (event: UpdateEvent) => void;

  export interface SelfHostedUpdateConfig {
    apiUrl: string;
    appSlug: string;
    appKey: string;
    channel?: ReleaseChannel | string;
    runtimeVersion?: string;
    checkOnLaunch?: boolean;
    autoInstall?: boolean;
    debug?: boolean;
  }

  export interface UpdateInfo {
    channel?: string;
    version?: string;
    runtimeVersion?: string;
    lastCheckDate?: string;
  }

  export interface UpdateContextValue {
    checkForUpdates: () => Promise<void>;
    downloadUpdate: () => Promise<void>;
    applyUpdate: () => void;
    addEventListener: (listener: UpdateEventListener) => () => void;
    currentState: string | null;
    updateInfo: UpdateInfo | null;
  }

  export interface UpdateProviderProps {
    config: SelfHostedUpdateConfig;
    children: ReactNode;
  }

  export function UpdateProvider(props: UpdateProviderProps): JSX.Element;
  export function useUpdates(): UpdateContextValue;

  export default class SelfHostedUpdates {
    constructor(config: SelfHostedUpdateConfig);
    checkForUpdates(): Promise<void>;
    downloadUpdate(): Promise<void>;
    applyUpdate(): void;
    addEventListener(listener: UpdateEventListener): () => void;
  }
}