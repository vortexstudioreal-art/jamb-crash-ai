import { useCallback, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  type Token,
  type PushNotificationSchema,
} from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { errorLogger } from '@/services/errorLogger';
import { showLocalNotification } from '@/lib/notify';

interface UsePushNotificationsOptions {
  userEmail: string | null;
  /** Only register when the user opted into notifications. */
  enabled: boolean;
}

/**
 * Remote push (Firebase FCM) registration.
 *
 * Native only and requires google-services.json in android/app (otherwise
 * registration fails and we fall back to local daily reminders).
 * Captured FCM tokens are stored in push_tokens for later broadcasts
 * (Firebase console today, server sender when the service-account key lands).
 */
export const usePushNotifications = ({ userEmail, enabled }: UsePushNotificationsOptions) => {
  const doneRef = useRef(false);

  const saveToken = useCallback(async (email: string, token: string) => {
    try {
      const platform = Capacitor.getPlatform();
      await supabase.from('push_tokens').upsert(
        {
          email: email.toLowerCase(),
          token,
          platform,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' }
      );
    } catch (err) {
      errorLogger.error(err, { component: 'usePushNotifications', action: 'save token' });
    }
  }, []);

  const register = useCallback(async () => {
    if (!userEmail || !enabled || doneRef.current) return;
    if (!Capacitor.isNativePlatform()) return;
    try {
      const perm = await PushNotifications.checkPermissions();
      let granted = perm.receive === 'granted';
      if (!granted) {
        const req = await PushNotifications.requestPermissions();
        granted = req.receive === 'granted';
      }
      if (!granted) return;

      await PushNotifications.register();

      await PushNotifications.addListener('registration', (t: Token) => {
        doneRef.current = true;
        void saveToken(userEmail, t.value);
      });

      await PushNotifications.addListener('registrationError', (err) => {
        // No google-services.json / no Firebase = expected on dev builds.
        errorLogger.error(err.error, {
          component: 'usePushNotifications',
          action: 'registration',
        });
      });

      // Foreground push: surface it ourselves (background display is automatic).
      await PushNotifications.addListener(
        'pushNotificationReceived',
        (n: PushNotificationSchema) => {
          void showLocalNotification(n.title || 'Jamb Crash AI', {
            body: n.body,
            tag: n.id,
          });
          toast.info(n.title || 'New notification 📢');
        }
      );
    } catch (err) {
      errorLogger.error(err, { component: 'usePushNotifications', action: 'register' });
    }
  }, [userEmail, enabled, saveToken]);

  useEffect(() => {
    if (userEmail && enabled) {
      void register();
    }
  }, [userEmail, enabled, register]);

  return { register };
};

/** Remove this device's tokens on sign-out so ex-users get nothing. */
export const clearPushTokens = async (email: string): Promise<void> => {
  try {
    await supabase.from('push_tokens').delete().eq('email', email.toLowerCase());
  } catch (err) {
    errorLogger.error(err, { component: 'usePushNotifications', action: 'clear tokens' });
  }
};
