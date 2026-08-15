import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  type: string;
  created_at: string;
  is_read: boolean;
}

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return;

    // Fetch notifications
    const { data: notifs, error: notifsError } = await supabase
      .from('notifications')
      .select('*')
      .or(`is_global.eq.true,target_email.eq.${user.email}`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (notifsError) {
      console.error('Error fetching notifications:', notifsError);
      return;
    }

    // Fetch read status
    const { data: reads } = await supabase
      .from('user_notification_reads')
      .select('notification_id')
      .eq('email', user.email);

    const readIds = new Set(reads?.map(r => r.notification_id) || []);

    const enrichedNotifs = (notifs || []).map(n => ({
      ...n,
      is_read: readIds.has(n.id)
    }));

    setNotifications(enrichedNotifs);
    setUnreadCount(enrichedNotifs.filter(n => !n.is_read).length);
  }, [user?.email]);

  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    if (!user?.email) return;

    await supabase
      .from('user_notification_reads')
      .insert({ email: user.email, notification_id: notificationId });

    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user?.email) return;

    const unreadNotifs = notifications.filter(n => !n.is_read);
    
    for (const notif of unreadNotifs) {
      await supabase
        .from('user_notification_reads')
        .insert({ email: user.email, notification_id: notif.id })
        .select();
    }

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-muted-foreground hover:text-foreground"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      )}
    </div>
  );
};
