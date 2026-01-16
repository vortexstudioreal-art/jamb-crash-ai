import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, CloudOff, RefreshCw, Check, Cloud } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OfflineIndicatorProps {
  showAlways?: boolean;
  variant?: 'badge' | 'banner' | 'minimal';
}

export const OfflineIndicator = ({ showAlways = false, variant = 'badge' }: OfflineIndicatorProps) => {
  const { isOnline, pendingSyncCount, isSyncing, triggerSync } = useOfflineStatus();

  // Don't show if online and no pending syncs (unless showAlways)
  if (isOnline && pendingSyncCount === 0 && !showAlways) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-4 left-4 z-50"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-orange-500 text-white p-2 rounded-full shadow-lg">
                    <WifiOff className="w-4 h-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>You're offline. Changes will sync when connected.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'banner') {
    return (
      <AnimatePresence>
        {(!isOnline || pendingSyncCount > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`w-full px-4 py-2 flex items-center justify-center gap-2 text-sm ${
              isOnline 
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
            }`}
          >
            {isOnline ? (
              <>
                <Cloud className="w-4 h-4" />
                <span>{pendingSyncCount} pending sync{pendingSyncCount !== 1 ? 's' : ''}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={triggerSync}
                  disabled={isSyncing}
                  className="ml-2 h-6 px-2"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                </Button>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>You're offline. Changes will be saved locally.</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Default badge variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Badge
              variant="outline"
              className={`cursor-pointer ${
                isOnline 
                  ? pendingSyncCount > 0 
                    ? 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800' 
                    : 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800'
                  : 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800'
              }`}
              onClick={() => isOnline && pendingSyncCount > 0 && triggerSync()}
            >
              {isOnline ? (
                pendingSyncCount > 0 ? (
                  <>
                    {isSyncing ? (
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Cloud className="w-3 h-3 mr-1" />
                    )}
                    {pendingSyncCount} pending
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Synced
                  </>
                )
              ) : (
                <>
                  <CloudOff className="w-3 h-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          {isOnline 
            ? pendingSyncCount > 0 
              ? 'Click to sync pending changes'
              : 'All changes synced'
            : 'Working offline. Changes will sync when back online.'
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
