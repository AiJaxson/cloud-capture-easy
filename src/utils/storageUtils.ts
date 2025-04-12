
// Mock implementation of storage utilities
// In a real app, these would be implemented with actual Google Drive API

import { toast } from "sonner";

interface StoredRecording {
  id: string;
  name: string;
  timestamp: number;
  url: string;
  storageType: 'local' | 'drive';
}

// Local storage key
const RECORDINGS_STORAGE_KEY = 'cloud-capture-recordings';

// Helper to get recordings from local storage
export const getStoredRecordings = (): StoredRecording[] => {
  try {
    const storedData = localStorage.getItem(RECORDINGS_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Error retrieving recordings:', error);
    return [];
  }
};

// Save recording to local storage
export const saveToLocalStorage = async (blob: Blob, name: string): Promise<StoredRecording> => {
  return new Promise((resolve) => {
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create recording metadata
    const recording: StoredRecording = {
      id: `local-${Date.now()}`,
      name,
      timestamp: Date.now(),
      url,
      storageType: 'local'
    };
    
    // Get existing recordings and add the new one
    const recordings = getStoredRecordings();
    recordings.unshift(recording);
    
    // Save back to localStorage
    localStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(recordings));
    
    // Simulate some processing time
    setTimeout(() => resolve(recording), 800);
  });
};

// Mock Google Drive upload
export const uploadToGoogleDrive = async (blob: Blob, name: string): Promise<StoredRecording> => {
  return new Promise((resolve) => {
    // This would be replaced with actual Google Drive API code
    console.log('Uploading to Google Drive:', name);
    
    // Create recording metadata
    const recording: StoredRecording = {
      id: `drive-${Date.now()}`,
      name,
      timestamp: Date.now(),
      url: URL.createObjectURL(blob), // In real app, this would be a Drive URL
      storageType: 'drive'
    };
    
    // Get existing recordings and add the new one
    const recordings = getStoredRecordings();
    recordings.unshift(recording);
    
    // Save back to localStorage (for demo purposes)
    localStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(recordings));
    
    // Simulate network delay
    setTimeout(() => resolve(recording), 1500);
  });
};

// Delete a recording
export const deleteRecording = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    const recordings = getStoredRecordings();
    const updatedRecordings = recordings.filter(rec => rec.id !== id);
    
    // If we found a recording to delete
    if (recordings.length !== updatedRecordings.length) {
      localStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(updatedRecordings));
      toast("Recording deleted");
    }
    
    resolve();
  });
};

// Update recording metadata
export const updateRecordingName = async (id: string, newName: string): Promise<void> => {
  return new Promise((resolve) => {
    const recordings = getStoredRecordings();
    const updatedRecordings = recordings.map(rec => 
      rec.id === id ? { ...rec, name: newName } : rec
    );
    
    localStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(updatedRecordings));
    resolve();
  });
};
