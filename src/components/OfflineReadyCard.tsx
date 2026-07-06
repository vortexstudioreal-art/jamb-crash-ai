import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, WifiOff, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { downloadAllForOffline } from '@/services/syncService';
import { getStorageInfo, isDataStale } from '@/services/offlineStorage';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

interface OfflineReadyCardProps {
  userEmail: string | null;
  subjects: string[];
}

/**
 * Compact discoverable prompt shown on the Study tab so users actually
 * download their study data before losing connectivity. Auto-hides once
 * they have fresh cached content.
 */
export const OfflineReadyCard = ({ userEmail, subjects }: OfflineReadyCardProps) => {
  const { isOnline } = useOfflineStatus();
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [stale, setStale] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ stage: string; percent: number } | null>(null);

  const refresh = async () => {
    try {
      const info = await getStorageInfo();
      setHasData(
        info.questionsCount > 0 ||
          info.novelsCount > 0 ||
          info.syllabusCount > 0,
      );
      setStale(await isDataStale());
    } catch {
      setHasData(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!userEmail || subjects.length === 0) return null;
  if (hasData === null) return null;
  // Hide when we already have fresh data and we're online
  if (hasData && !stale && isOnline) return null;

  const handleDownload = async () => {
    if (!isOnline) {
      toast.error('Connect to the internet to download study data.');
      return;
    }
    setBusy(true);
    setProgress({ stage: 'Starting…', percent: 0 });
    const result = await downloadAllForOffline(userEmail, subjects, setProgress);
    setBusy(false);
    setProgress(null);
    if (result.success) {
      toast.success('Study data saved. You can now use Jamb Crash offline.');
      refresh();
    } else {
      toast.error(result.error || 'Download failed. Try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          {isOnline ? (
            <Download className="w-5 h-5 text-primary" />
          ) : (
            <WifiOff className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">
              {hasData
                ? stale
                  ? 'Refresh offline study data'
                  : 'Ready for offline'
                : 'Study offline'}
            </h3>
            {hasData && !stale && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/15 rounded-full px-2 py-0.5">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {hasData
              ? 'Your saved questions may be outdated. Refresh so you always have the latest content ready.'
              : 'Download questions, notes and books so you can keep studying even without internet.'}
          </p>

          {progress && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span className="truncate">{progress.stage}</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          <Button
            size="sm"
            onClick={handleDownload}
            disabled={busy || !isOnline}
            className="w-full sm:w-auto"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Downloading…
              </>
            ) : hasData ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh now
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download for offline
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};