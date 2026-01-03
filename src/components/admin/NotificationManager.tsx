import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Trash2, Edit2, Send, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  type: string;
  is_global: boolean;
  target_email: string | null;
  created_by_email: string | null;
  created_at: string;
  expires_at: string | null;
}

export const NotificationManager = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState('info');
  const [isGlobal, setIsGlobal] = useState(true);
  const [targetEmail, setTargetEmail] = useState('');

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      return;
    }

    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setLink('');
    setType('info');
    setIsGlobal(true);
    setTargetEmail('');
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    const notificationData = {
      title: title.trim(),
      message: message.trim(),
      link: link.trim() || null,
      type,
      is_global: isGlobal,
      target_email: isGlobal ? null : targetEmail.trim() || null,
      created_by_email: user?.email || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from('notifications')
        .update(notificationData)
        .eq('id', editingId);

      if (error) {
        console.error('Error updating notification:', error);
        toast.error('Failed to update notification');
        return;
      }

      toast.success('Notification updated!');
    } else {
      const { error } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (error) {
        console.error('Error creating notification:', error);
        toast.error('Failed to create notification');
        return;
      }

      toast.success('Notification sent! 🔔');
    }

    resetForm();
    fetchNotifications();
  };

  const handleEdit = (notification: Notification) => {
    setEditingId(notification.id);
    setTitle(notification.title);
    setMessage(notification.message);
    setLink(notification.link || '');
    setType(notification.type);
    setIsGlobal(notification.is_global);
    setTargetEmail(notification.target_email || '');
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
      return;
    }

    toast.success('Notification deleted');
    fetchNotifications();
  };

  const getTypeColor = (notifType: string) => {
    switch (notifType) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-destructive';
      default: return 'bg-primary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground mt-2">Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notification Manager
          </h2>
          <p className="text-muted-foreground">Send notifications to all users or specific individuals</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Notification
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{editingId ? 'Edit Notification' : 'Create New Notification'}</span>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Notification title..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Write your notification message..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">ℹ️ Info</SelectItem>
                      <SelectItem value="success">✅ Success</SelectItem>
                      <SelectItem value="warning">⚠️ Warning</SelectItem>
                      <SelectItem value="error">❌ Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="link">Link (optional)</Label>
                  <Input
                    id="link"
                    placeholder="https://..."
                    value={link}
                    onChange={e => setLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label>Send to all users</Label>
                  <p className="text-xs text-muted-foreground">
                    {isGlobal ? 'Everyone will see this notification' : 'Only the specified user'}
                  </p>
                </div>
                <Switch checked={isGlobal} onCheckedChange={setIsGlobal} />
              </div>

              {!isGlobal && (
                <div>
                  <Label htmlFor="targetEmail">Target User Email</Label>
                  <Input
                    id="targetEmail"
                    type="email"
                    placeholder="user@example.com"
                    value={targetEmail}
                    onChange={e => setTargetEmail(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="gap-2">
                  <Send className="w-4 h-4" />
                  {editingId ? 'Update' : 'Send Notification'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${getTypeColor(notification.type)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground truncate">{notification.title}</h4>
                      {notification.is_global ? (
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">Global</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                          To: {notification.target_email}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      {notification.created_by_email && ` • by ${notification.created_by_email}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(notification)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
