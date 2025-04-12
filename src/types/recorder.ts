
export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';
export type StorageLocation = 'local' | 'drive';

export interface RecorderState {
  status: RecordingStatus;
  recordingTime: number;
  recordedBlob: Blob | null;
  isProcessing: boolean;
  recordingName: string;
}

export interface UseRecorderProps {
  preferredStorage?: StorageLocation;
  isOnline: boolean;
  driveAuthenticated: boolean;
}

export interface UseRecorderReturn {
  status: RecordingStatus;
  recordingTime: number;
  recordedBlob: Blob | null;
  isProcessing: boolean;
  recordingName: string;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  saveRecording: (name: string) => Promise<void>;
  resetRecording: () => void;
}
