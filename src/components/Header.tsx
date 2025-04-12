
import React from 'react';
import { Camera, Cloud, CheckCircle, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isOnline: boolean;
  driveAuthenticated: boolean;
  onAuthClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isOnline, driveAuthenticated, onAuthClick }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <Camera className="h-7 w-7 text-app-purple" />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent app-gradient">CloudCapture</h1>
      </div>
      
      <div className="flex items-center gap-3">
        {isOnline ? (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 gap-1">
            <Cloud className="h-4 w-4 text-green-500" />
            <span>Online</span>
          </div>
        ) : (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 gap-1">
            <CloudOff className="h-4 w-4 text-gray-500" />
            <span>Offline</span>
          </div>
        )}
        
        <Button 
          variant={driveAuthenticated ? "ghost" : "outline"} 
          size="sm"
          onClick={onAuthClick}
          className={driveAuthenticated ? "text-green-600 hover:text-green-700" : ""}
        >
          {driveAuthenticated ? (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Connected to Drive
            </span>
          ) : (
            "Connect to Google Drive"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Header;
