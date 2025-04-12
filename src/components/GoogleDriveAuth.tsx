
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cloud, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
  const [domainOrigin, setDomainOrigin] = useState<string>("");
  const [isInvalidOrigin, setIsInvalidOrigin] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load Google API client
  useEffect(() => {
    if (isOpen) {
      // Get current domain for instructions
      const currentDomain = window.location.origin;
      setDomainOrigin(currentDomain);
      setIsLoading(true);
      
      const loadGoogleApi = () => {
        const script = document.createElement('script');
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => {
          window.gapi.load('client:auth2', initGoogleAuth);
        };
        script.onerror = () => {
          setAuthError("Failed to load Google API");
          setIsLoading(false);
        };
        document.body.appendChild(script);
      };

      loadGoogleApi();
    }
  }, [isOpen]);

  const initGoogleAuth = () => {
    setIsLoading(true);
    window.gapi.client.init({
      clientId: GOOGLE_CLIENT_ID,
      scope: GOOGLE_API_SCOPE,
      plugin_name: "CloudCapture"
    }).then(() => {
      console.log("Google API client initialized successfully");
      setIsInvalidOrigin(false);
      setIsInitialized(true);
      setIsLoading(false);
    }).catch((error: any) => {
      console.error("Google API initialization error:", error);
      setIsLoading(false);
      
      // Capture full error details
      let errorMessage = "Unknown initialization error";
      if (error) {
        errorMessage = JSON.stringify(error, null, 2);
        setErrorDetails(errorMessage);
      }
      
      // Check if this is an invalid origin error
      if (error?.error === 'idpiframe_initialization_failed' &&
          error?.details?.includes('Not a valid origin for the client')) {
        setIsInvalidOrigin(true);
      } else {
        setAuthError("Failed to initialize Google API. Check console for details.");
      }
    });
  };

  const handleRetry = () => {
    setAuthError(null);
    setIsInvalidOrigin(false);
    setErrorDetails("");
    initGoogleAuth();
  };

  const handleAuth = () => {
    if (!isInitialized) {
      toast.error("Google API not initialized. Please try again.");
      return;
    }
    
    setIsAuthenticating(true);
    setAuthError(null);
    
    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      
      auth2.signIn({
        prompt: 'consent' // Force the consent screen to ensure fresh permissions
      }).then((googleUser) => {
        setIsAuthenticating(false);
        // Save auth token for later use
        const authResponse = googleUser.getAuthResponse();
        localStorage.setItem('googleDriveToken', authResponse.access_token);
        localStorage.setItem('googleDriveTokenExpiry', String(authResponse.expires_at));
        
        toast.success("Successfully connected to Google Drive");
        onAuthenticate();
        onClose();
      }).catch((error: any) => {
        console.error("Google Sign-in error:", error);
        setIsAuthenticating(false);
        
        if (error?.error === 'popup_closed_by_user') {
          setAuthError("Sign-in popup was closed. Please try again.");
        } else {
          setAuthError(`Authentication failed: ${error?.error || "Unknown error"}`);
        }
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
          <DialogDescription>
            Upload recordings directly to your Google Drive account
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full">
            <Cloud className="h-12 w-12 text-blue-500" />
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Initializing Google API...</span>
            </div>
          )}
          
          {isInvalidOrigin ? (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-4">
                <p><strong>Domain not authorized</strong> in your Google Cloud Console.</p>
                <p>Please add this domain to the authorized JavaScript origins in your Google Cloud project:</p>
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block overflow-x-auto">
                  {domainOrigin}
                </code>
                <div className="text-sm">
                  <p className="font-medium">Steps to fix:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      Google Cloud Console <ExternalLink className="h-3 w-3 ml-1" />
                    </a></li>
                    <li>Select your project</li>
                    <li>Edit the OAuth 2.0 Client ID named "Web client"</li>
                    <li>Add the above URL to "Authorized JavaScript origins"</li>
                    <li>Make sure to click Save and wait a few minutes for changes to propagate</li>
                    <li>Clear your browser cache and refresh this page</li>
                  </ol>
                </div>
                
                <div className="mt-2">
                  <Button onClick={handleRetry} size="sm" variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" /> Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Save recordings to Google Drive</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Connect your Google Drive account to automatically upload and store your recordings in the cloud.
              </p>
            </div>
          )}
          
          {authError && !isInvalidOrigin && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex flex-col w-full">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
              
              {errorDetails && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer font-medium">Technical Details</summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded overflow-x-auto max-h-32 whitespace-pre-wrap">
                    {errorDetails}
                  </pre>
                </details>
              )}
              
              <div className="mt-3">
                <Button onClick={handleRetry} size="sm" variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" /> Retry Connection
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-3 pt-4 w-full">
            {!isInvalidOrigin && !authError && (
              <Button 
                onClick={handleAuth} 
                disabled={isAuthenticating || isLoading || !isInitialized}
                className="w-full"
              >
                {isAuthenticating ? "Connecting..." : "Connect to Google Drive"}
              </Button>
            )}
            
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
