
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { saveToLocalStorage, uploadToGoogleDrive } from "@/utils/storageUtils";
import { StorageLocation } from '@/types/recorder';

export const useRecorderStorage = (
  preferredStorage: StorageLocation,
  isOnline: boolean,
  driveAuthenticated: boolean,
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  setRecordingName: React.Dispatch<React.SetStateAction<string>>
) => {
  const { toast } = useToast();

  const saveRecording = useCallback(async (blob: Blob | null, name: string, onSuccess: () => void) => {
    if (!blob) {
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
        await saveToLocalStorage(blob, name);
        toast({
          title: "Recording saved locally",
          description: `"${name}" has been saved to your device`
        });
      } else {
        await uploadToGoogleDrive(blob, name);
        toast({
          title: "Recording uploaded",
          description: `"${name}" has been uploaded to Google Drive`
        });
      }

      // Reset recording state after successful save
      onSuccess();
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
  }, [isOnline, driveAuthenticated, preferredStorage, toast, setIsProcessing, setRecordingName]);

  return { saveRecording };
};
