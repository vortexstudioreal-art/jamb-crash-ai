import { supabase } from '@/integrations/supabase/client';
import { isMobileApp } from '@/config/admob';
import type { Json } from '@/integrations/supabase/types';

type AdEventType = 'ad_started' | 'ad_completed' | 'ad_failed' | 'reward_claimed';

interface AdAnalyticsEvent {
  eventType: AdEventType;
  featureType: string;
  adSource?: 'admob' | 'simulation';
  durationWatched?: number;
  metadata?: Json;
}

const getPlatform = (): string => {
  if (isMobileApp()) {
    // Check for iOS or Android
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (/android/.test(userAgent)) return 'android';
    return 'mobile';
  }
  return 'web';
};

export const useAdAnalytics = () => {
  const trackAdEvent = async (
    email: string | null,
    event: AdAnalyticsEvent
  ): Promise<void> => {
    if (!email) {
      console.log('[AdAnalytics] No email, skipping tracking');
      return;
    }

    try {
      const { error } = await supabase.from('ad_analytics').insert([{
        email,
        event_type: event.eventType,
        feature_type: event.featureType,
        ad_source: event.adSource || 'simulation',
        platform: getPlatform(),
        duration_watched: event.durationWatched,
        metadata: event.metadata || null,
      }]);

      if (error) {
        console.error('[AdAnalytics] Failed to track event:', error);
      } else {
        console.log('[AdAnalytics] Tracked:', event.eventType, event.featureType);
      }
    } catch (err) {
      console.error('[AdAnalytics] Error tracking event:', err);
    }
  };

  const trackAdStarted = (email: string | null, featureType: string, adSource: 'admob' | 'simulation') => {
    return trackAdEvent(email, {
      eventType: 'ad_started',
      featureType,
      adSource,
    });
  };

  const trackAdCompleted = (
    email: string | null,
    featureType: string,
    adSource: 'admob' | 'simulation',
    durationWatched: number
  ) => {
    return trackAdEvent(email, {
      eventType: 'ad_completed',
      featureType,
      adSource,
      durationWatched,
    });
  };

  const trackAdFailed = (
    email: string | null,
    featureType: string,
    adSource: 'admob' | 'simulation',
    errorMessage?: string
  ) => {
    return trackAdEvent(email, {
      eventType: 'ad_failed',
      featureType,
      adSource,
      metadata: errorMessage ? { error: errorMessage } as Json : undefined,
    });
  };

  const trackRewardClaimed = (
    email: string | null,
    featureType: string,
    adSource: 'admob' | 'simulation',
    durationWatched: number
  ) => {
    return trackAdEvent(email, {
      eventType: 'reward_claimed',
      featureType,
      adSource,
      durationWatched,
    });
  };

  return {
    trackAdEvent,
    trackAdStarted,
    trackAdCompleted,
    trackAdFailed,
    trackRewardClaimed,
  };
};
