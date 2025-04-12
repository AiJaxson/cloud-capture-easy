
import React, { useState } from 'react';
import { 
  Play, Pause, Stop, Disc, Save, RotateCcw, 
  CheckCircle, X, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RecordingStatus } from '@/hooks/useRecorder';

interface RecordingControlsProps {
  status: RecordingStatus;
  recordingTime: number;
  isProcessing: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSave: (name: string) => void;
  onCancel: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  status,
  recordingTime,
  isProcessing,
  onStart,
  onPause,
  onResume,
  onStop,
  onSave,
  onCancel
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [recordingName, setRecordingName] = useState("");

  // Format seconds as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleSave = () => {
    if (!recordingName.trim()) {
      setRecordingName(`Recording ${new Date().toLocaleString()}`);
    }
    onSave(recordingName.trim() || `Recording ${new Date().toLocaleString()}`);
    setShowSaveDialog(false);
  };

  return (
    <>
      <div className="flex flex-col items-center pt-4 pb-8">
        {status === 'idle' && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-40 w-40 rounded-full bg-app-light-purple/20 flex items-center justify-center">
              <Button 
                onClick={onStart}
                className="h-24 w-24 rounded-full bg-app-purple hover:bg-app-purple/90 text-white recording-button"
              >
                <Play className="h-10 w-10" />
              </Button>
            </div>
            <p className="text-lg font-medium text-app-purple">Click to Start Recording</p>
          </div>
        )}
        
        {(status === 'recording' || status === 'paused') && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl font-bold text-app-purple">
              {formatTime(recordingTime)}
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              {status === 'recording' ? (
                <Button 
                  onClick={onPause}
                  className="h-12 w-12 rounded-full bg-amber-500 hover:bg-amber-600 recording-button"
                >
                  <Pause className="h-6 w-6 text-white" />
                </Button>
              ) : (
                <Button 
                  onClick={onResume}
                  className="h-12 w-12 rounded-full bg-app-purple hover:bg-app-purple/90 recording-button"
                >
                  <Play className="h-6 w-6 text-white" />
                </Button>
              )}
              
              <Button 
                onClick={onStop}
                className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 recording-button"
              >
                <Stop className="h-7 w-7 text-white" />
              </Button>
              
              {status === 'recording' && (
                <div className="ml-2 flex items-center gap-2">
                  <Disc className="h-5 w-5 text-red-500 recording-indicator" />
                  <span className="text-sm font-medium">Recording</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {status === 'stopped' && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-2xl font-medium text-gray-700 dark:text-gray-300">
              Recording complete - {formatTime(recordingTime)}
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              <Button 
                onClick={() => setShowSaveDialog(true)}
                disabled={isProcessing}
                className="bg-app-purple hover:bg-app-purple/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Recording
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Discard & Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save your recording</DialogTitle>
            <DialogDescription>
              Give your recording a name to save it.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="recording-name">Recording Name</Label>
            <Input
              id="recording-name"
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              placeholder="My Screen Recording"
              className="mt-2"
              autoFocus
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Save Recording
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecordingControls;
