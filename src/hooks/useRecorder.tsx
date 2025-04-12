
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRecorderTimer } from "@/hooks/useRecorderTimer";
import { useRecorderMedia } from "@/hooks/useRecorderMedia";
import { useRecorderStorage } from "@/hooks/useRecorderStorage";
import { UseRecorderProps, UseRecorderReturn, RecordingStatus, StorageLocation } from "@/types/recorder";

// Use 'export type' to satisfy isolatedModules requirement
export type { RecordingStatus, StorageLocation } from "@/types/recorder";

export const useRecorder = ({ 
  preferredStorage = 'drive', 
  isOnline,
  driveAuthenticated
}: UseRecorderProps): UseRecorderReturn => {
  const [status, setStatus] = useState('idle' as const);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingName, setRecordingName] = useState("");
  
  const { toast } = useToast();
  
  const { startTimer, stopTimer, cleanupTimer } = useRecorderTimer(setRecordingTime);
  
  const { 
    startMediaRecording, 
    pauseMediaRecording, 
    resumeMediaRecording, 
    stopMediaRecording, 
    cleanupMediaResources,
    screenStream
  } = useRecorderMedia(setStatus, setRecordedBlob, startTimer, stopTimer);
  
  const { saveRecording: saveToStorage } = useRecorderStorage(
    preferredStorage,
    isOnline,
    driveAuthenticated,
    setIsProcessing,
    setRecordingName
  );

  const resetRecording = useCallback(() => {
    setRecordingTime(0);
    setStatus('idle');
    setRecordedBlob(null);
    stopTimer();
    cleanupMediaResources();
  }, [stopTimer, cleanupMediaResources]);

  const startRecording = useCallback(async () => {
    await startMediaRecording();
  }, [startMediaRecording]);

  const pauseRecording = useCallback(() => {
    pauseMediaRecording();
  }, [pauseMediaRecording]);

  const resumeRecording = useCallback(() => {
    resumeMediaRecording();
  }, [resumeMediaRecording]);

  const stopRecording = useCallback(() => {
    stopMediaRecording();
  }, [stopMediaRecording]);

  const saveRecording = useCallback(async (name: string) => {
    await saveToStorage(recordedBlob, name, resetRecording);
  }, [recordedBlob, saveToStorage, resetRecording]);

  // Cleanup function
  useEffect(() => {
    return () => {
      cleanupTimer();
      if (screenStream.current) {
        screenStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cleanupTimer, screenStream]);

  return {
    status,
    recordingTime,
    recordedBlob,
    isProcessing,
    recordingName,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    saveRecording,
    resetRecording,
  };
};
