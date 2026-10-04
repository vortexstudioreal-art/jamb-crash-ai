import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, CheckCircle2, Loader2, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const DISMISS_KEY = 'jamb_offline_ready_dismissed';
const READY_KEY = 'jamb_offline_ready_v1';

type Step = {
  id: 'online' | 'sw' | 'cached';
  label: string;
  done: boolean;
};

/**
 * Tiny on-screen checklist that walks users through enabling offline mode.
 * Step 1: confirm they're online.
 * Step 2: wait for the service worker to activate.
 * Step 3: confirm the app shell + assets are cached → "You're offline-ready".
 * Persists across reloads so it doesn't pester users.
 */
export const OfflineReadyChecklist = () => {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [swReady, setSwReady] = useState(false);
  const [cacheReady, setCacheReady] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === '1',
  );
  const [alreadyReady] = useState(
    () => localStorage.getItem(READY_KEY) === '1',
  );

  // Track online/offline
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  // Watch for the service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let cancelled = false;
    navigator.serviceWorker.ready
      .then(() => {
        if (cancelled) return;
        // Require the SW to actually control this page, otherwise the next
        // hard refresh while offline will hit the network and fail.
        if (navigator.serviceWorker.controller) {
          setSwReady(true);
        } else {
          const onCtrl = () => setSwReady(true);
          navigator.serviceWorker.addEventListener(
            'controllerchange',
            onCtrl,
            { once: true },
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Check the cache storage for our precached shell
  useEffect(() => {
    if (!swReady || !('caches' in window)) return;
    let cancelled = false;
    const check = async () => {
      try {
        const keys = await caches.keys();
        const interesting = keys.filter(
          (k) =>
            k.includes('precache') ||
            k.includes('workbox') ||
            k.includes('pages-cache') ||
            k.includes('static-assets-cache'),
        );
        let count = 0;
        for (const name of interesting) {
          const cache = await caches.open(name);
          const entries = await cache.keys();
          count += entries.length;
        }
        if (!cancelled && count > 5) {
          setCacheReady(true);
          localStorage.setItem(READY_KEY, '1');
        }
      } catch {
        // ignore
      }
    };
    check();
    const id = setInterval(check, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [swReady]);

  // Don't render in unsupported environments
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator)) return null;
  if (dismissed) return null;

  // If everything is already ready from a previous visit, show a one-shot
  // success toast then hide forever.
  const allDone = online && swReady && cacheReady;

  const steps: Step[] = [
    { id: 'online', label: 'Connect to the internet', done: online },
    { id: 'sw', label: 'Install offline engine', done: swReady },
    { id: 'cached', label: 'Cache the app for offline use', done: cacheReady },
  ];

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  // If user has previously been ready and we just confirmed it again silently,
  // hide the card without showing the big banner.
  if (alreadyReady && allDone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-sm"
      >
        <Card className="border-primary/20 bg-card/95 backdrop-blur shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                {allDone ? (
                  <ShieldCheck className="w-5 h-5 text-primary" />
                ) : online ? (
                  <Wifi className="w-5 h-5 text-primary" />
                ) : (
                  <WifiOff className="w-5 h-5 text-orange-500" />
                )}
                <h3 className="font-semibold text-foreground">
                  {allDone ? "You're offline-ready" : 'Set up offline mode'}
                </h3>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 -mr-1"
                onClick={handleDismiss}
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {allDone ? (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  The app shell, quizzes you download, and your session are
                  saved on this device. You can use Jamb Crash without internet.
                </p>
                <Button size="sm" className="w-full" onClick={handleDismiss}>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Got it
                </Button>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  Finish these steps once with internet so the app keeps
                  working when you're offline.
                </p>
                <ul className="space-y-2">
                  {steps.map((s, i) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {s.done ? (
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : i === steps.findIndex((x) => !x.done) ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span
                        className={
                          s.done
                            ? 'text-foreground line-through decoration-primary/40'
                            : 'text-muted-foreground'
                        }
                      >
                        {s.label}
                      </span>
                    </li>
                  ))}
                </ul>
                {!online && (
                  <p className="text-xs text-orange-500 mt-3">
                    You're offline. Reconnect once to finish setup.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};