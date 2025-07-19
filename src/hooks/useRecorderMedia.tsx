import { useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { RecordingStatus } from '@/types/recorder';

export const useRecorderMedia = (
  setStatus: React.Dispatch<React.SetStateAction<RecordingStatus>>,
  setRecordedBlob: React.Dispatch<React.SetStateAction<Blob | null>>,
  startTimer: () => void,
  stopTimer: () => void
) => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const screenStream = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startMediaRecording = useCallback(async () => {
    try {
      // Request screen stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor"
        },
        audio: true
      });

      // Request microphone stream
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      // Combine screen and microphone streams
      const combinedStream = new MediaStream([
        ...screenStream.getTracks(),
        ...audioStream.getTracks()
      ]);

      screenStream.current = combinedStream;
      recordedChunks.current = [];

      const recorder = new MediaRecorder(combinedStream);

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
        description: "Your screen and microphone are now being recorded"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Failed to start screen and microphone recording",
        variant: "destructive"
      });
      cleanupMediaResources();
      setStatus('idle');
    }
  }, [setStatus, startTimer, stopTimer, toast, setRecordedBlob]);

  const pauseMediaRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause();
      setStatus('paused');
      stopTimer();
      toast({
        title: "Recording paused",
        description: "Recording has been paused"
      });
    }
  }, [setStatus, stopTimer, toast]);

  const resumeMediaRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'paused') {
      mediaRecorder.current.resume();
      setStatus('recording');
      startTimer();
      toast({
        title: "Recording resumed",
        description: "Recording has been resumed"
      });
    }
  }, [setStatus, startTimer, toast]);

  const stopMediaRecording = useCallback(() => {
    if (mediaRecorder.current && (mediaRecorder.current.state === 'recording' || mediaRecorder.current.state === 'paused')) {
      mediaRecorder.current.stop();
      toast({
        title: "Recording finished",
        description: "Your recording has been processed"
      });
    }
  }, [toast]);

  const cleanupMediaResources = useCallback(() => {
    if (screenStream.current) {
      screenStream.current.getTracks().forEach(track => track.stop());
      screenStream.current = null;
    }
    mediaRecorder.current = null;
    recordedChunks.current = [];
  }, []);

  return {
    recordedChunks,
    screenStream,
    startMediaRecording,
    pauseMediaRecording,
    resumeMediaRecording,
    stopMediaRecording,
    cleanupMediaResources
  };
};
