
import React, { useState } from 'react';
import { 
  Pencil, Trash2, ExternalLink, Calendar, 
  HardDrive, Cloud, CheckCircle, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { deleteRecording, updateRecordingName } from '@/utils/storageUtils';

export interface Recording {
  id: string;
  name: string;
  timestamp: number;
  url: string;
  storageType: 'local' | 'drive';
}

interface RecordingsListProps {
  recordings: Recording[];
  onListChange: () => void;
}

const RecordingsList: React.FC<RecordingsListProps> = ({ recordings, onListChange }) => {
  const [editingRecording, setEditingRecording] = useState<Recording | null>(null);
  const [newName, setNewName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await deleteRecording(id);
    setConfirmDeleteId(null);
    onListChange();
  };

  const handleRename = async () => {
    if (editingRecording && newName.trim()) {
      await updateRecordingName(editingRecording.id, newName);
      setEditingRecording(null);
      onListChange();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (recordings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No recordings yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Your saved recordings will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recordings.map(recording => (
        <Card key={recording.id} className="overflow-hidden group">
          <div className="relative h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            {/* Video thumbnail - in a real app, this would be a proper thumbnail */}
            <div className="absolute inset-0 bg-gradient-to-tr from-app-dark-purple/20 to-app-purple/10" />
            <div className="relative z-10 flex flex-col items-center justify-center">
              {recording.storageType === 'local' ? (
                <HardDrive className="h-8 w-8 text-app-gray/70" />
              ) : (
                <Cloud className="h-8 w-8 text-app-blue/70" />
              )}
              <span className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                {recording.storageType === 'local' ? 'Saved Locally' : 'Saved to Drive'}
              </span>
            </div>
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={recording.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/80 hover:bg-white text-app-dark-purple p-1.5 rounded-full inline-block"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex justify-between items-start">
              <div className="truncate pr-4">{recording.name}</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setNewName(recording.name);
                  setEditingRecording(recording);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {formatDate(recording.timestamp)}
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <a 
                href={recording.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-app-blue hover:text-app-blue/80 text-sm font-medium"
              >
                View Recording
              </a>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-7"
                onClick={() => setConfirmDeleteId(recording.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Edit Name Dialog */}
      <Dialog 
        open={editingRecording !== null} 
        onOpenChange={(open) => !open && setEditingRecording(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Recording</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRecording(null)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleRename}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog 
        open={confirmDeleteId !== null} 
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recording</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this recording? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecordingsList;
