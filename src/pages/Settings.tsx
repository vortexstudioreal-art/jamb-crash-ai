import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Crown, Shield, Calendar, Package, ArrowLeft, LogOut, Edit2, Check, X, HelpCircle, FileText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminBadge } from '@/components/AdminBadge';

const OWNER_EMAIL = 'saeedabdulbasit933@gmail.com';
const COLLABORATOR_EMAILS = [
  'loaborejim@gmail.com',
  'favourgoodnews@gmail.com',
  'onuchionwuegbusi@gmail.com',
  'muzzyothman@gmail.com',
  'muzzyothmam@gmail.com'
];
const BYPASS_EMAILS = [OWNER_EMAIL, ...COLLABORATOR_EMAILS];
const BYPASS_STORAGE_KEY = 'jamb_bypass_email';

const getBypassEmail = (): string | null => {
  const stored = localStorage.getItem(BYPASS_STORAGE_KEY);
  if (stored && BYPASS_EMAILS.includes(stored.toLowerCase())) {
    return stored.toLowerCase();
  }
  return null;
};

export default function Settings() {
  const { user, signOut, hasAccess, isOwner, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [userSubjects, setUserSubjects] = useState<string[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bypassEmail = getBypassEmail();
  const userEmail = user?.email?.toLowerCase() || bypassEmail || '';
  const isBypassOwner = userEmail === OWNER_EMAIL;
  const isBypassCollaborator = COLLABORATOR_EMAILS.includes(userEmail);
  const isBypassUser = isBypassOwner || isBypassCollaborator;

  const effectiveOwner = isOwner || isBypassOwner;
  const effectiveAdmin = isAdmin || isBypassUser;
  const effectiveAccess = hasAccess || isBypassUser;

  useEffect(() => {
    const loadUserData = async () => {
      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      try {
        // Load profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('email', userEmail)
          .maybeSingle();

        if (profile?.full_name) {
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

        // Load payment info (skip for bypass users)
        if (!isBypassUser) {
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
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userEmail, isBypassUser]);

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    // Bypass users: just update local state
    if (isBypassUser) {
      setIsEditingName(false);
      toast.success('Name updated! ✨');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('email', userEmail);

      if (error) throw error;
      setIsEditingName(false);
      toast.success('Name updated! ✨');
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error('Failed to update name');
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem(BYPASS_STORAGE_KEY);
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  const getRoleBadge = () => {
    if (effectiveOwner) {
      return <AdminBadge role="owner" />;
    }
    if (isBypassCollaborator) {
      return <AdminBadge role="collaborator" />;
    }
    if (effectiveAdmin) {
      return <AdminBadge role="admin" />;
    }
    return null;
  };

  const getAccessStatus = () => {
    if (isBypassUser) {
      return {
        status: 'Permanent Access',
        color: 'bg-gradient-to-r from-yellow-400 to-amber-500',
        textColor: 'text-black'
      };
    }
    if (effectiveAccess && paymentInfo?.access_expires_at) {
      const expiresAt = new Date(paymentInfo.access_expires_at);
      const now = new Date();
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        status: `${daysLeft} days remaining`,
        color: daysLeft > 7 ? 'bg-primary' : 'bg-orange-500',
        textColor: 'text-primary-foreground'
      };
    }
    if (effectiveAccess) {
      return {
        status: 'Active',
        color: 'bg-primary',
        textColor: 'text-primary-foreground'
      };
    }
    return {
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
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
                    <Button size="icon" variant="ghost" onClick={handleSaveName}>
                      <Check className="w-4 h-4 text-primary" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-foreground">{fullName || 'Not set'}</p>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)}>
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

        {/* Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
                  <p className="font-semibold text-foreground">
                    {isBypassUser ? (effectiveOwner ? 'Owner' : 'Collaborator') : (paymentInfo?.package || 'Free')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isBypassUser ? 'Full access to all features' : (paymentInfo ? `Purchased on ${new Date(paymentInfo.created_at).toLocaleDateString()}` : 'Upgrade to unlock all features')}
                  </p>
                </div>
                <Badge className={`${accessStatus.color} ${accessStatus.textColor}`}>
                  {accessStatus.status}
                </Badge>
              </div>

              {!isBypassUser && !effectiveAccess && (
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

        {/* Subjects Card */}
        {userSubjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
                href="#" 
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
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
