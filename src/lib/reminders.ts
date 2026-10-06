import { Capacitor } from '@capacitor/core';
import {
  LocalNotifications,
  type PermissionStatus,
} from '@capacitor/local-notifications';
import { errorLogger } from '@/services/errorLogger';

// Daily study reminder. Native (Android/iOS) fires via the OS scheduler —
// works with the app closed and offline. On web it falls back to the
// plugin's Notification-based implementation (fires while a tab is open).
const REMINDER_ID = 1001;

const MESSAGES = [
  { title: '📚 Study time, Champion!', body: 'Your JAMB score grows a little every day. Open the app and keep the streak alive!' },
  { title: '🎯 Daily grind!', body: 'Top scorers practice every day. Take a quick quiz now — future you says thanks.' },
  { title: '🔥 Keep the streak burning!', body: 'A short study session today beats cramming later. Let’s go!' },
  { title: '🧠 Small steps, big scores!', body: 'Review your weakest topic today and watch your predicted score climb.' },
];

const pickMessage = () => MESSAGES[new Date().getDate() % MESSAGES.length];

export const isReminderSupported = (): boolean => {
  if (Capacitor.isNativePlatform()) return true;
  return typeof Notification !== 'undefined';
};

/** Returns true if we may schedule (prompts only when undetermined). */
export const ensureReminderPermission = async (promptIfNeeded = true): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const current = await LocalNotifications.checkPermissions();
      if (current.display === 'granted') return true;
      if (!promptIfNeeded) return false;
      const req: PermissionStatus = await LocalNotifications.requestPermissions();
      return req.display === 'granted';
    }
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    if (!promptIfNeeded || Notification.permission === 'denied') return false;
    return (await Notification.requestPermission()) === 'granted';
  } catch (err) {
    errorLogger.error(err, { component: 'reminders', action: 'permission' });
    return false;
  }
};

export const scheduleDailyReminder = async (hour: number, minute: number): Promise<boolean> => {
  try {
    const ok = await ensureReminderPermission(true);
    if (!ok) return false;
    const msg = pickMessage();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: msg.title,
          body: msg.body,
          schedule: { on: { hour, minute }, allowWhileIdle: true },
          smallIcon: 'ic_launcher',
          sound: 'default',
        },
      ],
    });
    return true;
  } catch (err) {
    errorLogger.error(err, { component: 'reminders', action: 'schedule' });
    return false;
  }
};

export const cancelDailyReminder = async (): Promise<void> => {
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.some((n) => n.id === REMINDER_ID)) {
      await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    }
  } catch (err) {
    errorLogger.error(err, { component: 'reminders', action: 'cancel' });
  }
};

/** Silent reconcile (no permission prompt): schedule only if already granted. */
export const reconcileReminder = async (
  enabled: boolean,
  hour: number,
  minute: number
): Promise<void> => {
  try {
    if (!enabled) {
      await cancelDailyReminder();
      return;
    }
    const granted = await ensureReminderPermission(false);
    if (!granted) return;
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.some((n) => n.id === REMINDER_ID)) return;
    await scheduleDailyReminder(hour, minute);
  } catch (err) {
    errorLogger.error(err, { component: 'reminders', action: 'reconcile' });
  }
};

export const parseReminderTime = (t: string): { hour: number; minute: number } => {
  const [h, m] = t.split(':').map((x) => parseInt(x, 10));
  return {
    hour: Number.isFinite(h) ? Math.min(23, Math.max(0, h)) : 19,
    minute: Number.isFinite(m) ? Math.min(59, Math.max(0, m)) : 30,
  };
};
