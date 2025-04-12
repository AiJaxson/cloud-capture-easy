
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cloud, AlertCircle } from "lucide-react";

interface GoogleDriveAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: () => void;
}

const GoogleDriveAuth: React.FC<GoogleDriveAuthProps> = ({
  isOpen,
  onClose,
  onAuthenticate
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuth = () => {
    setIsAuthenticating(true);
    // This would be replaced with actual Google Drive API authentication
    setTimeout(() => {
      setIsAuthenticating(false);
      onAuthenticate();
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to Google Drive</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full">
            <Cloud className="h-12 w-12 text-blue-500" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Save recordings to Google Drive</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Connect your Google Drive account to automatically upload and store your recordings in the cloud.
            </p>
          </div>
          
          <div className="flex flex-col space-y-3 pt-4 w-full">
            <Button 
              onClick={handleAuth} 
              disabled={isAuthenticating}
              className="w-full"
            >
              {isAuthenticating ? "Connecting..." : "Connect to Google Drive"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Continue without Google Drive
            </Button>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>You can connect Google Drive later from settings</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleDriveAuth;
