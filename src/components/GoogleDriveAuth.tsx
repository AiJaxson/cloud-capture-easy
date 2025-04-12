
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cloud, AlertCircle } from "lucide-react";

// Google API client ID - replace with your own from Google Cloud Console
const GOOGLE_CLIENT_ID = "738779605618-lpeqbphe60duk664mvu2fbfa7hfq8o3c.apps.googleusercontent.com"; // In a production app, this should come from environment variables
const GOOGLE_API_SCOPE = "https://www.googleapis.com/auth/drive.file";

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
  const [authError, setAuthError] = useState<string | null>(null);

  // Load Google API client
  useEffect(() => {
    const loadGoogleApi = () => {
      const script = document.createElement('script');
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => {
        window.gapi.load('client:auth2', initGoogleAuth);
      };
      script.onerror = () => {
        setAuthError("Failed to load Google API");
      };
      document.body.appendChild(script);
    };

    const initGoogleAuth = () => {
      window.gapi.client.init({
        clientId: GOOGLE_CLIENT_ID,
        scope: GOOGLE_API_SCOPE,
        plugin_name: "CloudCapture"
      }).then(() => {
        console.log("Google API client initialized");
      }).catch((error: any) => {
        console.error("Google API initialization error:", error);
        setAuthError("Failed to initialize Google API");
      });
    };

    if (isOpen) {
      loadGoogleApi();
    }
  }, [isOpen]);

  const handleAuth = () => {
    setIsAuthenticating(true);
    setAuthError(null);
    
    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      
      auth2.signIn().then(() => {
        setIsAuthenticating(false);
        // Save auth token for later use
        const authResponse = auth2.currentUser.get().getAuthResponse();
        localStorage.setItem('googleDriveToken', authResponse.access_token);
        localStorage.setItem('googleDriveTokenExpiry', String(authResponse.expires_at));
        
        onAuthenticate();
        onClose();
      }).catch((error: any) => {
        console.error("Google Sign-in error:", error);
        setIsAuthenticating(false);
        setAuthError("Authentication failed. Please try again.");
      });
    } catch (error) {
      console.error("Auth error:", error);
      setIsAuthenticating(false);
      setAuthError("Authentication failed. Please try again.");
    }
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
          
          {authError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 w-full">
              <AlertCircle className="h-4 w-4" />
              {authError}
            </div>
          )}
          
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

// Add TypeScript type definition for the Google API
declare global {
  interface Window {
    gapi: any;
  }
}

export default GoogleDriveAuth;
