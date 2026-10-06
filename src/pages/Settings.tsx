import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Crown, Shield, Calendar, Package, ArrowLeft, LogOut, Edit2, Check, X, HelpCircle, FileText, MessageCircle, Moon, Sun, Phone, Bell, Users, Ticket, Lock, Trash2, MailCheck, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminCouponDashboard } from '@/components/AdminCouponDashboard';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { DownloadManager } from '@/components/DownloadManager';
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  parseReminderTime,
} from '@/lib/reminders';
import { useSeo } from '@/hooks/useSeo';
import { errorLogger } from '@/services/errorLogger';
const THEME_STORAGE_KEY = 'jamb_theme';
const SETTINGS_STORAGE_KEY = 'jamb_user_settings';

interface UserSettings {
  fullName: string;
  whatsappNumber: string;
  whatsappEnabled: boolean;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  reminderTime: string;
}

const loadSettings = (email: string): UserSettings => {
  const defaults: UserSettings = { fullName: '', whatsappNumber: '', whatsappEnabled: false, notificationsEnabled: true, emailNotifications: true, reminderTime: '19:30' };
  const stored = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_${email}`);
  if (stored) {
    try {
      return { ...defaults, ...JSON.parse(stored) };
    } catch {
      return defaults;
    }
  }
  return defaults;
};

const saveSettings = (email: string, settings: UserSettings) => {
  localStorage.setItem(`${SETTINGS_STORAGE_KEY}_${email}`, JSON.stringify(settings));
};

export default function Settings() {
  const { user, signOut, hasAccess, isOwner, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();

  useSeo({
    title: 'Settings | Jamb Crash AI',
    description: 'Manage your Jamb Crash AI account, study subjects, notifications, and WhatsApp reminders.',
    path: '/settings',
    noindex: true,
  });

  const [fullName, setFullName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [userSubjects, setUserSubjects] = useState<string[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<{ access_expires_at: string | null; package: string; created_at: string; amount: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('19:30');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // All access checks come from server-side via AuthContext
  const userEmail = user?.email?.toLowerCase() || '';
  const effectiveOwner = isOwner;
  const effectiveAdmin = isAdmin || isOwner;
  const effectiveAccess = hasAccess || isOwner || isAdmin;

  // Load theme from localStorage (dark mode is default)
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    // Default to dark mode
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      // Load settings from localStorage first
      const savedSettings = loadSettings(userEmail);
      setFullName(savedSettings.fullName);
      setWhatsappNumber(savedSettings.whatsappNumber);
      setWhatsappEnabled(savedSettings.whatsappEnabled);
      setNotificationsEnabled(savedSettings.notificationsEnabled ?? true);
      setEmailNotifications(savedSettings.emailNotifications ?? true);
      setReminderTime(savedSettings.reminderTime || '19:30');

      try {
        // Load profile from Supabase (as backup)
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('email', userEmail)
          .maybeSingle();

        if (profile?.full_name && !savedSettings.fullName) {
          setFullName(profile.full_name);
        }

        // Load subjects
        const { data: subjects } = await supabase
          .from('user_subjects')
          .select('subjects')
          .eq('email', userEmail)
          .maybeSingle();

        if (subjects?.subjects) {
          setUserSubjects(subjects.subjects as string[]);
        }

        // Load WhatsApp reminder settings
        const { data: reminder } = await supabase
          .from('whatsapp_reminders')
          .select('phone_number, is_active')
          .eq('email', userEmail)
          .maybeSingle();

        if (reminder) {
          setWhatsappNumber(reminder.phone_number);
          setWhatsappEnabled(reminder.is_active ?? false);
        }

        // Load payment info
        if (!effectiveAdmin) {
          const { data: payment } = await supabase
            .from('payments')
            .select('*')
            .eq('email', userEmail)
            .eq('status', 'success')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (payment) {
            setPaymentInfo(payment);
          }
        }
      } catch (error) {
        errorLogger.error(error, { component: 'Settings', action: 'load user data' });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userEmail, effectiveAdmin]);

  // Email verification status — resolved from the live session, not the
  // cached context user, so "Refresh" picks up a just-clicked email link.
  useEffect(() => {
    const checkVerification = async () => {
      if (!user) {
        setEmailVerified(null);
        return;
      }
      try {
        const { data } = await supabase.auth.getUser();
        const u = data.user ?? user;
        setEmailVerified(Boolean(u?.email_confirmed_at || (u as { confirmed_at?: string })?.confirmed_at));
      } catch {
        const u = user as { email_confirmed_at?: string; confirmed_at?: string };
        setEmailVerified(Boolean(u?.email_confirmed_at || u?.confirmed_at));
      }
    };
    checkVerification();
  }, [user]);

  const handleResendVerification = async () => {
    if (!userEmail) return;
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast.success('Verification email sent! Check your inbox (and spam). 📧');
    } catch (error) {
      errorLogger.error(error, { component: 'Settings', action: 'resend verification' });
      toast.error(error instanceof Error ? error.message : 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleRefreshVerification = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      const u = data.user as unknown as { email_confirmed_at?: string; confirmed_at?: string } | null;
      const verified = Boolean(u?.email_confirmed_at || u?.confirmed_at);
      setEmailVerified(verified);
      toast.success(verified ? 'Email verified! ✅' : 'Still unverified — click the link in your inbox, then refresh again.');
    } catch (error) {
      errorLogger.error(error, { component: 'Settings', action: 'refresh verification' });
      toast.error('Could not refresh status. Check your connection.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    // Save to localStorage for persistence
    const currentSettings = loadSettings(userEmail);
    saveSettings(userEmail, { ...currentSettings, fullName: fullName.trim() });

    // Admin users: just update local state
    if (effectiveAdmin) {
      setIsEditingName(false);
      toast.success('Name saved! ✨');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('email', userEmail);

      if (error) throw error;
      setIsEditingName(false);
      toast.success('Name saved! ✨');
    } catch (error) {
      errorLogger.error(error, { component: 'Settings', action: 'update name' });
      setIsEditingName(false);
      toast.success('Name saved locally! ✨');
    }
  };

  const handleWhatsAppToggle = async (enabled: boolean) => {
    setWhatsappEnabled(enabled);
    const currentSettings = loadSettings(userEmail);
    saveSettings(userEmail, { ...currentSettings, whatsappEnabled: enabled });

    if (userEmail) {
      try {
        await supabase
          .from('whatsapp_reminders')
          .upsert({
            email: userEmail,
            phone_number: whatsappNumber || '',
            is_active: enabled
          }, { onConflict: 'email' });
        
        toast.success(enabled ? 'WhatsApp reminders enabled!' : 'WhatsApp reminders disabled');
      } catch (error) {
        errorLogger.error(error, { component: 'Settings', action: 'update WhatsApp settings' });
      }
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    const currentSettings = loadSettings(userEmail);
    saveSettings(userEmail, { ...currentSettings, notificationsEnabled: enabled });
    if (enabled) {
      const { hour, minute } = parseReminderTime(reminderTime);
      const ok = await scheduleDailyReminder(hour, minute);
      if (ok) {
        toast.success(`Daily reminders on — every day at ${reminderTime} ⏰`);
      } else {
        setNotificationsEnabled(false);
        saveSettings(userEmail, { ...currentSettings, notificationsEnabled: false });
        toast.error('Permission denied. Enable notifications for this app/browser first.');
      }
    } else {
      await cancelDailyReminder();
      toast.success('Notifications disabled');
    }
  };

  const handleReminderTimeChange = async (time: string) => {
    setReminderTime(time);
    const currentSettings = loadSettings(userEmail);
    saveSettings(userEmail, { ...currentSettings, reminderTime: time });
    if (notificationsEnabled) {
      const { hour, minute } = parseReminderTime(time);
      const ok = await scheduleDailyReminder(hour, minute);
      toast.success(ok ? `Reminder moved to ${time} ⏰` : 'Could not reschedule reminder');
    }
  };

  const handleEmailNotificationsToggle = (enabled: boolean) => {
    setEmailNotifications(enabled);
    const currentSettings = loadSettings(userEmail);
    saveSettings(userEmail, { ...currentSettings, emailNotifications: enabled });
    toast.success(enabled ? 'Email notifications enabled' : 'Email notifications disabled');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  const handleBack = () => {
    navigate('/?step=dashboard');
  };

  const getRoleBadge = () => {
    if (effectiveOwner) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black">
          <Crown className="w-3.5 h-3.5" />
          Owner
        </span>
      );
    }
    if (userRole === 'collaborator') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-gray-300 to-slate-400 text-gray-800">
          <Users className="w-3.5 h-3.5" />
          Collaborator
        </span>
      );
    }
    if (effectiveAdmin) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
          <Shield className="w-3.5 h-3.5" />
          Admin
        </span>
      );
    }
    return null;
  };

  const getAccessStatus = () => {
    if (effectiveOwner) {
      return {
        planName: 'Owner',
        status: 'Permanent Access',
        color: 'bg-gradient-to-r from-yellow-400 to-amber-500',
        textColor: 'text-black'
      };
    }
    if (userRole === 'collaborator') {
      return {
        planName: 'Collaborator',
        status: 'Permanent Access',
        color: 'bg-gradient-to-r from-gray-300 to-slate-400',
        textColor: 'text-gray-800'
      };
    }
    if (effectiveAccess && paymentInfo?.access_expires_at) {
      return {
        planName: paymentInfo.package === 'premium' ? 'SCHOLAR' : paymentInfo.package === 'pro' ? 'ACE' : paymentInfo.package || 'SCHOLAR',
        status: 'Active',
        color: 'bg-primary',
        textColor: 'text-primary-foreground'
      };
    }
    if (effectiveAccess) {
      return {
        planName: paymentInfo?.package || 'Active',
        status: 'Active',
        color: 'bg-primary',
        textColor: 'text-primary-foreground'
      };
    }
    return {
      planName: 'Free',
      status: 'No Active Plan',
      color: 'bg-muted',
      textColor: 'text-muted-foreground'
    };
  };

  const accessStatus = getAccessStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with green back button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="shrink-0 text-primary hover:text-primary/80 hover:bg-primary/10 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Profile
                </CardTitle>
                {getRoleBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1"
                    />
                    <Button size="icon" variant="ghost" onClick={handleSaveName} aria-label="Save name">
                      <Check className="w-4 h-4 text-primary" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)} aria-label="Cancel editing name">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-foreground">{fullName || 'Not set'}</p>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)} aria-label="Edit name">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground">{userEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Email Verification Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <MailCheck className="w-5 h-5 text-primary" />
                Email Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">
                    {emailVerified === null
                      ? 'Checking status…'
                      : emailVerified
                        ? 'Your email is verified ✅'
                        : 'Your email is not verified yet'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {emailVerified
                      ? 'You have full access to sign in on any device.'
                      : 'Verify to secure your account and recover access easily.'}
                  </p>
                </div>
                <Badge variant={emailVerified ? 'default' : 'secondary'}>
                  {emailVerified === null ? '…' : emailVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              {!emailVerified && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleResendVerification}
                    disabled={isResending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isResending ? 'Sending…' : 'Resend Verification Email'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={handleRefreshVerification}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Checking…' : "I've Verified — Refresh"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Your Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Your Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground text-lg">
                    {accessStatus.planName}
                  </p>
                <p className="text-sm text-muted-foreground">
                    {effectiveAdmin ? 'Full access to all features' : (paymentInfo ? 'Active subscription' : 'Upgrade to unlock all features')}
                  </p>
                </div>
                <Badge className={`${accessStatus.color} ${accessStatus.textColor}`}>
                  {accessStatus.status}
                </Badge>
              </div>

              {!effectiveAdmin && !effectiveAccess && (
                <Button 
                  onClick={() => navigate('/')} 
                  className="w-full"
                  variant="hero"
                >
                  Upgrade Now 🚀
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral Dashboard - for collaborators only */}
        {userRole === 'collaborator' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
          >
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  My Referral Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminCouponDashboard />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Security Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowChangePassword(true)}>
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                {isDarkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Offline Data Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <DownloadManager userEmail={userEmail} subjects={userSubjects.length > 0 ? userSubjects : ['english', 'mathematics']} />
        </motion.div>

        {/* WhatsApp Reminders Card - Always visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                WhatsApp Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Daily Study Reminders</p>
                  <p className="text-sm text-muted-foreground">Receive study tips via WhatsApp</p>
                </div>
                <Switch checked={whatsappEnabled} onCheckedChange={handleWhatsAppToggle} />
              </div>
              {whatsappNumber && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="text-foreground">{whatsappNumber}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Daily Study Reminder</p>
                  <p className="text-sm text-muted-foreground">A nudge to practice every day — works offline</p>
                </div>
                <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationsToggle} />
              </div>
              {notificationsEnabled && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">Reminder time</p>
                    <p className="text-xs text-muted-foreground">When should we ping you?</p>
                  </div>
                  <Input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => void handleReminderTimeChange(e.target.value)}
                    className="w-28"
                    aria-label="Daily reminder time"
                  />
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive study plan updates via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={handleEmailNotificationsToggle} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subjects Card */}
        {userSubjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Your Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userSubjects.map((subject) => (
                    <Badge key={subject} variant="secondary" className="capitalize">
                      {subject.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Help & Support Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Help & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a 
                href="mailto:support@jamb48hr.com" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Contact Support</p>
                  <p className="text-sm text-muted-foreground">Get help with your account</p>
                </div>
              </a>
              <Separator />
              <a
                href="#"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Terms of Service</p>
                  <p className="text-sm text-muted-foreground">Read our terms</p>
                </div>
              </a>
              <Separator />
              <a
                href="/privacy"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Privacy Policy</p>
                  <p className="text-sm text-muted-foreground">How we protect your data</p>
                </div>
              </a>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-3"
        >
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              try {
                if ('caches' in window) {
                  const keys = await caches.keys();
                  await Promise.all(keys.map((k) => caches.delete(k)));
                }
                if ('serviceWorker' in navigator) {
                  const regs = await navigator.serviceWorker.getRegistrations();
                  await Promise.all(regs.map((r) => r.unregister()));
                }
                toast.success('Offline cache cleared. Reloading...');
                setTimeout(() => window.location.reload(), 600);
              } catch (e) {
                toast.error('Failed to clear cache');
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Offline Cache
          </Button>
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>

        {/* Change Password Modal */}
        <ChangePasswordModal 
          isOpen={showChangePassword} 
          onClose={() => setShowChangePassword(false)} 
        />
      </div>
    </div>
  );
}
