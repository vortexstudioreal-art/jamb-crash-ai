import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { downloadAllForOffline, getCachedSubjects } from '@/services/syncService';
import { getQuestionsCount } from '@/services/offlineStorage';
import { withTimeout } from '@/lib/withTimeout';
import { errorLogger } from '@/services/errorLogger';

// Guard against double-runs (React StrictMode + multiple mount points).
let seedInFlight = false;

const SEED_TIMEOUT_MS = 180000;

/**
 * Silently prepares the offline study pack (questions, lessons, syllabus,
 * novels) the first time a signed-in user is online with subjects selected.
 * Re-runs when the subject set changes, and retries automatically when the
 * device comes back online (flaky mobile data used to leave users with an
 * empty offline pack and no second attempt).
 * Never blocks the UI and never runs offline.
 */
export const useAutoOfflineSeed = (userEmail: string | null, subjects: string[]) => {
  const attemptedKey = useRef<string | null>(null);
  const key = subjects.length > 0 ? [...subjects].sort().join(',') : '';

  useEffect(() => {
    if (!userEmail || !key) return;

    let cancelled = false;

    const runSeed = async () => {
      if (cancelled) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;

      const attemptId = `${userEmail}::${key}`;
      if (attemptedKey.current === attemptId || seedInFlight) return;
      attemptedKey.current = attemptId;

      seedInFlight = true;
      try {
        const [count, cached] = await Promise.all([
          getQuestionsCount().catch(() => 0),
          getCachedSubjects().catch(() => null),
        ]);
        // Cached subjects may be a superset (the user studied more subjects
        // before), so only require the current set to be covered.
        const covered =
          Array.isArray(cached) && subjects.every((s) => cached.includes(s));
        // Already seeded for this subject set: nothing to do.
        if (count > 0 && covered) return;

        const result = await withTimeout(
          downloadAllForOffline(userEmail, subjects),
          SEED_TIMEOUT_MS,
          'offline auto-seed'
        );

        if (cancelled) return;

        if (result.success) {
          toast.success('Offline study pack ready — quizzes, lessons and books now work without internet.');
        } else if (result.partial) {
          // Keep most of the pack, but allow another attempt on reconnect.
          attemptedKey.current = null;
          toast.warning('Offline pack partially saved — we will finish it next time you are online.');
        } else {
          attemptedKey.current = null;
        }
      } catch (err) {
        // Silent: offline prep must never interrupt studying. The manual
        // Download Manager / OfflineReadyCard remains as the retry path.
        errorLogger.error(err, { component: 'useAutoOfflineSeed', action: 'auto seed' });
        attemptedKey.current = null;
      } finally {
        seedInFlight = false;
      }
    };

    void runSeed();

    // Retry automatically once connectivity returns.
    window.addEventListener('online', runSeed);
    return () => {
      cancelled = true;
      window.removeEventListener('online', runSeed);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, key]);
};
