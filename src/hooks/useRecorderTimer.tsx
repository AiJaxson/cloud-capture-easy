
import { useCallback, useRef } from 'react';

export const useRecorderTimer = (
  setRecordingTime: React.Dispatch<React.SetStateAction<number>>
) => {
  const timerInterval = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (timerInterval.current !== null) {
      clearInterval(timerInterval.current);
    }
    
    timerInterval.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, [setRecordingTime]);

  const stopTimer = useCallback(() => {
    if (timerInterval.current !== null) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  }, []);

  // Cleanup function
  const cleanupTimer = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  }, []);

  return { startTimer, stopTimer, cleanupTimer };
};
