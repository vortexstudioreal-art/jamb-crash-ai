import { supabase } from '@/integrations/supabase/client';

export type FunnelEvent =
  | 'signup'
  | 'subjects_selected'
  | 'quiz_started'
  | 'paywall_seen'
  | 'checkout_started'
  | 'paid';

/** Fire-and-forget funnel logging. Never throws, never blocks UI. */
export const trackFunnel = (
  email: string | null | undefined,
  event: FunnelEvent,
  meta?: Record<string, string | number | boolean | null | undefined>
): void => {
  if (!email) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  void supabase
    .from('funnel_events')
    .insert({ email: email.toLowerCase(), event, meta: meta ?? null })
    .then(({ error }) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.debug('[funnel]', event, error.message);
      }
    });
};
