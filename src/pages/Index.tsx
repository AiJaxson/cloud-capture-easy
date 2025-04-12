
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useRecorder } from '@/hooks/useRecorder';
import { getStoredRecordings } from '@/utils/storageUtils';
import { Recording } from '@/components/RecordingsList';

import Header from '@/components/Header';
import RecordingControls from '@/components/RecordingControls';
import RecordingsList from '@/components/RecordingsList';
import GoogleDriveAuth from '@/components/GoogleDriveAuth';

const Index = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [driveAuthenticated, setDriveAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeTab, setActiveTab] = useState('record');
  
  const { toast } = useToast();

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're online",
        description: "Uploads to Google Drive are now available"
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Recordings will be saved locally",
        variant: "destructive"
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Load recordings from storage
  const loadRecordings = () => {
    const storedRecordings = getStoredRecordings();
    setRecordings(storedRecordings);
  };

  useEffect(() => {
    loadRecordings();
  }, []);

  const recorder = useRecorder({
    isOnline,
    driveAuthenticated,
    preferredStorage: driveAuthenticated ? 'drive' : 'local'
  });

  const handleAuthClick = () => {
    if (driveAuthenticated) {
      // Already authenticated, could show account details or disconnect options
      toast({
        title: "Already connected",
        description: "Your Google Drive account is connected"
      });
    } else {
      setShowAuthDialog(true);
    }
  };

  const handleSaveRecording = (name: string) => {
    recorder.saveRecording(name);
    // Switch to recordings tab after saving
    setTimeout(() => {
      setActiveTab('recordings');
      loadRecordings();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header 
        isOnline={isOnline} 
        driveAuthenticated={driveAuthenticated} 
        onAuthClick={handleAuthClick} 
      />
      
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="record">Record</TabsTrigger>
            <TabsTrigger value="recordings">My Recordings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="record" className="flex-1 flex flex-col">
            <div className="glass-card p-8 mx-auto max-w-2xl w-full mt-4 flex-1 flex flex-col">
              <h2 className="text-2xl font-semibold text-center mb-6 text-app-dark-purple">
                {recorder.status === 'idle' ? 'Start a New Recording' : 
                 recorder.status === 'stopped' ? 'Recording Complete' : 
                 'Recording in Progress'}
              </h2>
              
              <div className="flex-1 flex items-center justify-center">
                <RecordingControls
                  status={recorder.status}
                  recordingTime={recorder.recordingTime}
                  isProcessing={recorder.isProcessing}
                  onStart={recorder.startRecording}
                  onPause={recorder.pauseRecording}
                  onResume={recorder.resumeRecording}
                  onStop={recorder.stopRecording}
                  onSave={handleSaveRecording}
                  onCancel={recorder.resetRecording}
                />
              </div>
              
              {recorder.status === 'idle' && (
                <div className="mt-6 text-sm text-center text-gray-500">
                  {isOnline && driveAuthenticated ? (
                    <p>Recordings will be saved to Google Drive</p>
                  ) : (
                    <p>Recordings will be saved locally</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="recordings" className="flex-1">
            <div className="glass-card p-6 mx-auto w-full mt-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-app-dark-purple">My Recordings</h2>
                <span className="text-sm text-gray-500">
                  {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
                </span>
              </div>
              
              <RecordingsList 
                recordings={recordings} 
                onListChange={loadRecordings} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <GoogleDriveAuth 
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onAuthenticate={() => setDriveAuthenticated(true)}
      />
    </div>
  );
};

export default Index;
