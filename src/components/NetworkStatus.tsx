// ============================================================================
// NETWORK STATUS - Offline detection and warning
// ============================================================================

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineWarning(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineWarning(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <Alert variant="destructive" className="fixed top-0 left-0 right-0 z-50 rounded-none">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-2">
        <span>You are offline. Some features may not work.</span>
        {showOfflineWarning && (
          <span className="text-xs opacity-75">
            Changes will be saved when you reconnect.
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default NetworkStatus;
