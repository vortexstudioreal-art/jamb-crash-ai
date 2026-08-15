import { useEffect } from 'react';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = () => {
  useEffect(() => {
    const initPushNotifications = async () => {
      try {
        const permStatus = await PushNotifications.requestPermissions();
        if (permStatus.receive === 'granted') {
          await PushNotifications.register();
        }
      } catch (error) {
        // Silent fail on web or if Capacitor not available
      }
    };

    initPushNotifications();

    const registrationListener = PushNotifications.addListener(
      'registration',
      async (token: Token) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.auth.updateUser({
              data: { push_token: token.value },
            });
          }
        } catch {
          // Silent fail
        }
      }
    );

    const registrationErrorListener = PushNotifications.addListener(
      'registrationError',
      () => {}
    );

    const pushNotificationReceivedListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        toast.info(notification.title || 'New Notification');
      }
    );

    const pushNotificationActionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      () => {}
    );

    return () => {
      registrationListener.then((l) => l.remove());
      registrationErrorListener.then((l) => l.remove());
      pushNotificationReceivedListener.then((l) => l.remove());
      pushNotificationActionListener.then((l) => l.remove());
    };
  }, []);
};
