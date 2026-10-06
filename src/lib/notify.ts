// Safe browser notifications.
//
// `new Notification()` throws "Illegal constructor" on mobile Chrome —
// there, notifications must go through the service worker registration.
// This helper tries the service worker first, falls back to the
// constructor, and never throws (a reminder is never worth a crash).

export const showLocalNotification = async (
  title: string,
  options?: NotificationOptions & { tag?: string }
): Promise<void> => {
  try {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, options);
        return;
      } catch {
        // Fall through to the constructor (desktop browsers)
      }
    }
    new Notification(title, options);
  } catch {
    // Notifications are best-effort — never crash the app over them.
  }
};

export const isNotificationGranted = (): boolean =>
  typeof Notification !== 'undefined' && Notification.permission === 'granted';
