
// Storage utilities for local storage and Google Drive

import { toast } from "sonner";

export interface StoredRecording {
  id: string;
  name: string;
  timestamp: number;
  url: string;
  storageType: 'local' | 'drive';
  driveFileId?: string; // Google Drive file ID for drive uploads
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

// Check if user is authenticated with Google Drive
export const isGoogleDriveAuthenticated = (): boolean => {
  const token = localStorage.getItem('googleDriveToken');
  const expiryStr = localStorage.getItem('googleDriveTokenExpiry');
  
  if (!token || !expiryStr) return false;
  
  // Check if token is expired
  const expiry = parseInt(expiryStr);
  const now = Date.now();
  
  return now < expiry;
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

// Upload to Google Drive
export const uploadToGoogleDrive = async (blob: Blob, name: string): Promise<StoredRecording> => {
  // Check if we have a valid token
  if (!isGoogleDriveAuthenticated()) {
    throw new Error("Not authenticated with Google Drive");
  }

  try {
    const accessToken = localStorage.getItem('googleDriveToken');
    
    // First, create a multipart request to upload the file
    const metadata = {
      name: `${name}.webm`, // Add extension
      mimeType: 'video/webm',
    };
    
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);
    
    // Upload file to Drive API
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });
    
    if (!response.ok) {
      throw new Error(`Google Drive upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('File uploaded to Google Drive:', data);
    
    // Create recording metadata with Drive file ID
    const recording: StoredRecording = {
      id: `drive-${Date.now()}`,
      name,
      timestamp: Date.now(),
      url: URL.createObjectURL(blob), // Local URL for preview
      storageType: 'drive',
      driveFileId: data.id
    };
    
    // Get existing recordings and add the new one
    const recordings = getStoredRecordings();
    recordings.unshift(recording);
    
    // Save back to localStorage
    localStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(recordings));
    
    return recording;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

// Delete a recording
export const deleteRecording = async (id: string): Promise<void> => {
  const recordings = getStoredRecordings();
  const recordingToDelete = recordings.find(rec => rec.id === id);
  
  if (!recordingToDelete) {
    return;
  }
  
  // If it's a Google Drive file, delete from Drive as well
  if (recordingToDelete.storageType === 'drive' && recordingToDelete.driveFileId) {
    try {
      const accessToken = localStorage.getItem('googleDriveToken');
      
      if (isGoogleDriveAuthenticated()) {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${recordingToDelete.driveFileId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        });
        
        if (!response.ok) {
          console.error('Failed to delete file from Google Drive');
        }
      }
    } catch (error) {
      console.error('Error deleting from Google Drive:', error);
    }
  }
  
  // Remove from local recordings list
  const updatedRecordings = recordings.filter(rec => rec.id !== id);
  localStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(updatedRecordings));
  toast("Recording deleted");
};

// Update recording metadata
export const updateRecordingName = async (id: string, newName: string): Promise<void> => {
  const recordings = getStoredRecordings();
  const recordingToUpdate = recordings.find(rec => rec.id === id);
  
  if (!recordingToUpdate) {
    return;
  }
  
  // If it's a Google Drive file, update name on Drive as well
  if (recordingToUpdate.storageType === 'drive' && recordingToUpdate.driveFileId) {
    try {
      const accessToken = localStorage.getItem('googleDriveToken');
      
      if (isGoogleDriveAuthenticated()) {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${recordingToUpdate.driveFileId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: `${newName}.webm`
          })
        });
        
        if (!response.ok) {
          console.error('Failed to update file name on Google Drive');
        }
      }
    } catch (error) {
      console.error('Error updating name on Google Drive:', error);
    }
  }
  
  // Update in local recordings list
  const updatedRecordings = recordings.map(rec => 
    rec.id === id ? { ...rec, name: newName } : rec
  );
  
  localStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(updatedRecordings));
};

// Check Google Drive authentication status
export const checkGoogleDriveAuth = async (): Promise<boolean> => {
  return isGoogleDriveAuthenticated();
};
