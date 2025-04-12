import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { saveToLocalStorage, uploadToGoogleDrive } from "@/utils/storageUtils";

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';
export type StorageLocation = 'local' | 'drive';

interface UseRecorderProps {
  preferredStorage?: StorageLocation;
  isOnline: boolean;
  driveAuthenticated: boolean;
}

export const useRecorder = ({ 
  preferredStorage = 'drive', 
  isOnline,
  driveAuthenticated
}: UseRecorderProps) => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingName, setRecordingName] = useState("");
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<number | null>(null);
  const screenStream = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();

  const startTimer = useCallback(() => {
    if (timerInterval.current !== null) {
      clearInterval(timerInterval.current);
    }
    
    timerInterval.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerInterval.current !== null) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    setRecordingTime(0);
    setStatus('idle');
    recordedChunks.current = [];
    setRecordedBlob(null);
    stopTimer();

    // Stop all tracks in the stream
    if (screenStream.current) {
      screenStream.current.getTracks().forEach(track => track.stop());
      screenStream.current = null;
    }
    
    mediaRecorder.current = null;
  }, [stopTimer]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor"
        },
        audio: true
      });
      
      screenStream.current = stream;
      recordedChunks.current = [];
      
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { 
          type: 'video/webm' 
        });
        setRecordedBlob(blob);
        setStatus('stopped');
        stopTimer();
      };
      
      mediaRecorder.current = recorder;
      recorder.start();
      setStatus('recording');
      startTimer();
      
      toast({
        title: "Recording started",
        description: "Your screen is now being recorded"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Failed to start screen recording",
        variant: "destructive"
      });
      resetRecording();
    }
  }, [startTimer, stopTimer, toast, resetRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && status === 'recording') {
      mediaRecorder.current.pause();
      setStatus('paused');
      stopTimer();
      toast({
        title: "Recording paused",
        description: "Recording has been paused"
      });
    }
  }, [status, stopTimer, toast]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && status === 'paused') {
      mediaRecorder.current.resume();
      setStatus('recording');
      startTimer();
      toast({
        title: "Recording resumed",
        description: "Recording has been resumed"
      });
    }
  }, [status, startTimer, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && (status === 'recording' || status === 'paused')) {
      mediaRecorder.current.stop();
      // The onstop handler will update the status
      toast({
        title: "Recording finished",
        description: "Your recording has been processed"
      });
    }
  }, [status, toast]);

  const saveRecording = useCallback(async (name: string) => {
    if (!recordedBlob) {
      toast({
        title: "Error",
        description: "No recording to save",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setRecordingName(name);

    try {
      // Determine where to save based on preference and connection
      const actualStorageLocation = !isOnline || !driveAuthenticated || preferredStorage === 'local' 
        ? 'local' 
        : 'drive';

      if (actualStorageLocation === 'local') {
        await saveToLocalStorage(recordedBlob, name);
        toast({
          title: "Recording saved locally",
          description: `"${name}" has been saved to your device`
        });
      } else {
        await uploadToGoogleDrive(recordedBlob, name);
        toast({
          title: "Recording uploaded",
          description: `"${name}" has been uploaded to Google Drive`
        });
      }

      // Reset recording state after successful save
      resetRecording();
    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        title: "Save failed",
        description: "Failed to save recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [recordedBlob, isOnline, driveAuthenticated, preferredStorage, toast, resetRecording]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (screenStream.current) {
        screenStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
