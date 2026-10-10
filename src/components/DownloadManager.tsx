import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Trash2, RefreshCw, CheckCircle, 
  HardDrive, Cloud, FileQuestion, BookOpen, Layers, Book 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { downloadAllForOffline, shouldRefreshOfflineData } from '@/services/syncService';
import { getStorageInfo, clearAllData, isDataStale } from '@/services/offlineStorage';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { toast } from 'sonner';

interface DownloadManagerProps {
  userEmail: string;
  subjects: string[];
}

export const DownloadManager = ({ userEmail, subjects }: DownloadManagerProps) => {
  const { isOnline } = useOfflineStatus();
  const [storageInfo, setStorageInfo] = useState<{
    questionsCount: number;
    flashcardsCount: number;
    syllabusCount: number;
    pendingSyncCount: number;
    novelsCount: number;
    novelChaptersCount: number;
    lastSync: number | null;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ stage: string; percent: number } | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  const loadStorageInfo = async () => {
    const info = await getStorageInfo();
    setStorageInfo(info);
    
    const stale = await isDataStale();
    const shouldRefresh = await shouldRefreshOfflineData();
    setNeedsRefresh(stale || shouldRefresh);
  };

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const handleDownload = async () => {
    if (!isOnline) {
      toast.error('You need to be online to download data');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress({ stage: 'Starting...', percent: 0 });

    const result = await downloadAllForOffline(userEmail, subjects, (progress) => {
      setDownloadProgress(progress);
    });

    setIsDownloading(false);
    setDownloadProgress(null);

    if (result.success) {
      toast.success('All data downloaded for offline use! 📱');
      await loadStorageInfo();
      setNeedsRefresh(false);
    } else {
      toast.error(result.error || 'Failed to download data');
    }
  };

  const handleClearData = async () => {
    const pending = storageInfo?.pendingSyncCount || 0;
    const warning = pending > 0
      ? `You have ${pending} unsynced change${pending === 1 ? '' : 's'} that will be LOST. Clear all offline data anyway?`
      : 'Are you sure you want to clear all offline data? This cannot be undone.';
    if (!confirm(warning)) {
      return;
    }

    setIsClearing(true);
    try {
      await clearAllData();
      toast.success('Offline data cleared');
      await loadStorageInfo();
    } catch (error) {
      toast.error('Failed to clear data');
    } finally {
      setIsClearing(false);
    }
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const hasData = storageInfo && (
    storageInfo.questionsCount > 0 || 
    storageInfo.flashcardsCount > 0 || 
    storageInfo.syllabusCount > 0 ||
    storageInfo.novelsCount > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-primary" />
          Offline Data
        </CardTitle>
        <CardDescription>
          Download study materials for offline access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Stats */}
        {storageInfo && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <FileQuestion className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{storageInfo.questionsCount}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Layers className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{storageInfo.flashcardsCount}</p>
              <p className="text-xs text-muted-foreground">Flashcards</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <BookOpen className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{storageInfo.syllabusCount}</p>
              <p className="text-xs text-muted-foreground">Topics</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Book className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{storageInfo.novelsCount}</p>
              <p className="text-xs text-muted-foreground">Books</p>
            </div>
          </div>
        )}

        {/* Last sync info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last downloaded:</span>
          <Badge variant="outline" className="font-normal">
            {formatLastSync(storageInfo?.lastSync || null)}
          </Badge>
        </div>

        {/* Refresh needed alert */}
        {hasData && needsRefresh && (
          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>
              Your offline data may be outdated. Consider refreshing for the latest content.
            </AlertDescription>
          </Alert>
        )}

        {/* Download progress */}
        {isDownloading && downloadProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span>{downloadProgress.stage}</span>
              <span>{downloadProgress.percent}%</span>
            </div>
            <Progress value={downloadProgress.percent} className="h-2" />
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            disabled={!isOnline || isDownloading}
            className="flex-1"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : hasData ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download for Offline
              </>
            )}
          </Button>

          {hasData && (
            <Button
              variant="outline"
              onClick={handleClearData}
              disabled={isClearing}
            >
              {isClearing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Pending syncs */}
        {storageInfo && storageInfo.pendingSyncCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
            <Cloud className="w-4 h-4" />
            <span>{storageInfo.pendingSyncCount} changes waiting to sync</span>
          </div>
        )}

        {/* Offline indicator */}
        {!isOnline && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>You can study offline with downloaded data</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
