import { useState, useEffect, useCallback } from 'react';
import { syncPendingItems } from '@/services/syncService';
import { getSyncQueueCount } from '@/services/offlineStorage';
import { toast } from 'sonner';

interface OfflineStatus {
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
  triggerSync: () => Promise<void>;
}

export const useOfflineStatus = (): OfflineStatus => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  // Update pending sync count
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await getSyncQueueCount();
      setPendingSyncCount(count);
    } catch (error) {
      console.error('Error getting sync queue count:', error);
    }
  }, []);

  // Sync pending items
  const triggerSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const { synced, failed } = await syncPendingItems();
      setLastSyncTime(Date.now());
      await updatePendingCount();

      if (synced > 0) {
        toast.success(`Synced ${synced} item${synced > 1 ? 's' : ''}`);
      }
      if (failed > 0) {
        toast.error(`Failed to sync ${failed} item${failed > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, updatePendingCount]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing data...', { duration: 2000 });
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Data will be saved locally.', { duration: 3000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check
    updatePendingCount();
    if (navigator.onLine) {
      triggerSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync, updatePendingCount]);

  // Periodic sync when online
  useEffect(() => {
    if (!isOnline) return;

    const syncInterval = setInterval(() => {
      if (pendingSyncCount > 0) {
        triggerSync();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(syncInterval);
  }, [isOnline, pendingSyncCount, triggerSync]);

  return {
    isOnline,
    pendingSyncCount,
    isSyncing,
    lastSyncTime,
    triggerSync,
  };
};
