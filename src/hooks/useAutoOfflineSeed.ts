import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { downloadAllForOffline, getCachedSubjects } from '@/services/syncService';
import { getQuestionsCount } from '@/services/offlineStorage';
import { withTimeout } from '@/lib/withTimeout';
import { errorLogger } from '@/services/errorLogger';

// Guard against double-runs (React StrictMode + multiple mount points).
let seedInFlight = false;

/**
 * Silently prepares the offline study pack (questions, lessons, syllabus,
 * novels) the first time a signed-in user is online with subjects selected.
 * Re-runs when the subject set changes so new subjects get cached too.
 * Never blocks the UI and never runs offline.
 */
export const useAutoOfflineSeed = (userEmail: string | null, subjects: string[]) => {
  const attemptedKey = useRef<string | null>(null);
  const key = subjects.length > 0 ? [...subjects].sort().join(',') : '';

  useEffect(() => {
    if (!userEmail || !key) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    if (attemptedKey.current === `${userEmail}::${key}` || seedInFlight) return;
    attemptedKey.current = `${userEmail}::${key}`;

    (async () => {
      seedInFlight = true;
      try {
        const [count, cached] = await Promise.all([
          getQuestionsCount().catch(() => 0),
          getCachedSubjects().catch(() => null),
        ]);
        const sameSubjects =
          Array.isArray(cached) &&
          cached.length === subjects.length &&
          cached.every((s) => subjects.includes(s));
        // Already seeded for this exact subject set: nothing to do.
        if (count > 0 && sameSubjects) return;

        const result = await withTimeout(
          downloadAllForOffline(userEmail, subjects),
          120000,
          'offline auto-seed'
        );
        if (result.success) {
          toast.success('Offline study pack ready — quizzes, lessons and books now work without internet.');
        }
      } catch (err) {
        // Silent: offline prep must never interrupt studying. The manual
        // Download Manager / OfflineReadyCard remains as the retry path.
        errorLogger.error(err, { component: 'useAutoOfflineSeed', action: 'auto seed' });
        attemptedKey.current = null;
      } finally {
        seedInFlight = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, key]);
};
