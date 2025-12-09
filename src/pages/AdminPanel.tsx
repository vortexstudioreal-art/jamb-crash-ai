import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Crown, Users, CreditCard, TrendingUp, Plus, Trash2, ArrowLeft, RefreshCw, Mail,
  CheckCircle, XCircle, AlertCircle, Settings, Send, Key, Activity, Database, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminBadge } from '@/components/AdminBadge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppHealthCheck } from '@/components/AppHealthCheck';
interface Payment {
  id: string;
  email: string;
  amount: number;
  package: string;
  status: string;
  created_at: string;
  access_expires_at: string | null;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface FeatureStatus {
  feature_name: string;
  is_working: boolean;
  notes: string | null;
  last_checked: string;
}

interface Stats {
  totalPayments: number;
  totalRevenue: number;
  activeUsers: number;
  totalAdmins: number;
  totalQuizzes: number;
  totalQuestions: number;
}

const OWNER_EMAIL = 'saeedabdulbasit933@gmail.com';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAdmin, isOwner: authIsOwner, userRole, hasAccess } = useAuth();
  const userEmail = user?.email || null;
  const adminRole = userRole;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [features, setFeatures] = useState<FeatureStatus[]>([]);
  const [questionStats, setQuestionStats] = useState<{ subject: string; count: number; minYear: number; maxYear: number }[]>([]);
  const [stats, setStats] = useState<Stats>({ 
    totalPayments: 0, totalRevenue: 0, activeUsers: 0, totalAdmins: 0, totalQuizzes: 0, totalQuestions: 0 
  });
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [whatsappConfigured, setWhatsappConfigured] = useState<boolean | null>(null);

  const isOwner = authIsOwner || userEmail?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const canEdit = isOwner; // Only owner can edit settings

  useEffect(() => {
    // Wait for loading to complete
    if (isLoading) return;
    
    // Admin users (including bypass users detected in useAccessControl) have access
    if (isAdmin && hasAccess) {
      fetchData();
      return;
    }
    
    // No access - redirect home
    navigate('/');
  }, [isAdmin, isLoading, hasAccess, navigate]);

  const fetchData = async () => {
    setLoadingData(true);
    await Promise.all([
      fetchPayments(), 
      fetchAdmins(), 
      fetchFeatures(), 
      fetchQuizStats(), 
      fetchQuestionCount(),
      fetchQuestionStats(),
      checkEmailConfig(),
      checkWhatsAppConfig()
    ]);
    setLoadingData(false);
  };

  const checkEmailConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { test_mode: true }
      });
      setEmailConfigured(data?.configured || false);
    } catch {
      setEmailConfigured(false);
    }
  };

  const checkWhatsAppConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-reminder', {
        body: { test_mode: true }
      });
      console.log('WhatsApp config check:', data);
      setWhatsappConfigured(data?.configured || false);
    } catch (err) {
      console.error('WhatsApp config check failed:', err);
      setWhatsappConfigured(false);
    }
  };

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching payments:', error);
      return;
    }
    
    setPayments(data || []);
    
    const successfulPayments = (data || []).filter(p => p.status === 'success');
    const activeUsers = successfulPayments.filter(p => 
      p.access_expires_at && new Date(p.access_expires_at) > new Date()
    );
    
    setStats(prev => ({
      ...prev,
      totalPayments: successfulPayments.length,
      totalRevenue: successfulPayments.reduce((sum, p) => sum + p.amount, 0),
      activeUsers: activeUsers.length,
    }));
  };

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching admins:', error);
      return;
    }
    
    setAdmins(data || []);
    setStats(prev => ({ ...prev, totalAdmins: (data || []).length }));
  };

  const fetchFeatures = async () => {
    const { data, error } = await supabase
      .from('feature_status')
      .select('*');
    
    if (error) {
      console.error('Error fetching features:', error);
      return;
    }
    
    setFeatures(data || []);
  };

  const fetchQuizStats = async () => {
    const { count, error } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      setStats(prev => ({ ...prev, totalQuizzes: count || 0 }));
    }
  };

  const fetchQuestionCount = async () => {
    const { count, error } = await supabase
      .from('jamb_questions')
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      setStats(prev => ({ ...prev, totalQuestions: count || 0 }));
    }
  };

  const fetchQuestionStats = async () => {
    // Fetch subject breakdown with years
    const { data, error } = await supabase
      .from('jamb_questions')
      .select('subject, year');
    
    if (!error && data) {
      // Group by subject and calculate stats
      const subjectMap: Record<string, { count: number; years: Set<number> }> = {};
      
      data.forEach((q: any) => {
        if (!subjectMap[q.subject]) {
          subjectMap[q.subject] = { count: 0, years: new Set() };
        }
        subjectMap[q.subject].count++;
        if (q.year) subjectMap[q.subject].years.add(q.year);
      });
      
      const stats = Object.entries(subjectMap).map(([subject, data]) => ({
        subject,
        count: data.count,
        minYear: data.years.size > 0 ? Math.min(...data.years) : 0,
        maxYear: data.years.size > 0 ? Math.max(...data.years) : 0
      })).sort((a, b) => b.count - a.count);
      
      setQuestionStats(stats);
    }
  };

  const toggleFeature = async (featureName: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('feature_status')
      .update({ is_working: !currentStatus, last_checked: new Date().toISOString() })
      .eq('feature_name', featureName);
    
    if (error) {
      toast.error('Failed to update feature');
      return;
    }
    
    toast.success(`Feature ${!currentStatus ? 'enabled' : 'disabled'}`);
    fetchFeatures();
  };

  const testWhatsAppReminder = async () => {
    if (!canEdit) {
      toast.error('Only owner can send test messages');
      return;
    }
    setTestingWhatsApp(true);
    toast.loading('Sending WhatsApp to +2347073996465...', { id: 'whatsapp-test' });
    
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-reminder', {
        body: {
          phone_number: '+2347073996465',
          email: userEmail || OWNER_EMAIL,
          test_mode: false
        }
      });
      
      console.log('WhatsApp test response:', data, error);
      
      if (error) {
        console.error('WhatsApp test error:', error);
        toast.error('Failed to send: ' + error.message, { id: 'whatsapp-test' });
        return;
      }
      
      if (data?.success) {
        toast.success('WhatsApp sent! Check +2347073996465 📱', { id: 'whatsapp-test' });
        setWhatsappConfigured(true);
      } else {
        toast.error(data?.error || 'Failed to send WhatsApp', { id: 'whatsapp-test' });
        if (data?.sandbox_info) {
          toast.info(`Sandbox tip: Text "${data.sandbox_info.join_message}" to ${data.sandbox_info.number}`, { duration: 10000 });
        }
      }
    } catch (error) {
      console.error('WhatsApp test error:', error);
      toast.error('Network error - check console', { id: 'whatsapp-test' });
    } finally {
      setTestingWhatsApp(false);
    }
  };

  const testEmailSend = async () => {
    if (!canEdit) {
      toast.error('Only owner can send test emails');
      return;
    }
    setTestingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          email: OWNER_EMAIL,
          test_mode: false
        }
      });
      
      if (error) {
        console.error('Email test error:', error);
        toast.error('Failed to send email: ' + error.message);
        return;
      }
      
      if (data?.success) {
        toast.success(`Email sent to ${OWNER_EMAIL}! 📧`);
        setEmailConfigured(true);
      } else {
        toast.error(data?.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email test error:', error);
      toast.error('Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  const addCollaborator = async () => {
    if (!canEdit) {
      toast.error('Only owner can add collaborators');
      return;
    }
    if (!newCollaboratorEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCollaboratorEmail)) {
      toast.error('Please enter a valid email');
      return;
    }

    const exists = admins.some(a => a.email.toLowerCase() === newCollaboratorEmail.toLowerCase());
    if (exists) {
      toast.error('This email is already an admin');
      return;
    }

    const { error } = await supabase
      .from('admin_users')
      .insert({ email: newCollaboratorEmail.toLowerCase(), role: 'collaborator' });
    
    if (error) {
      toast.error('Failed to add collaborator');
      console.error(error);
      return;
    }

    toast.success('Collaborator added! 🎉');
    setNewCollaboratorEmail('');
    fetchAdmins();
  };

  const removeAdmin = async (id: string, email: string) => {
    if (!canEdit) {
      toast.error('Only owner can remove admins');
      return;
    }
    if (email === userEmail) {
      toast.error("You can't remove yourself");
      return;
    }

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to remove admin');
      console.error(error);
      return;
    }

    toast.success('Admin removed');
    fetchAdmins();
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getFeatureIcon = (name: string) => {
    switch (name) {
      case 'pdf_upload': return '📄';
      case 'timed_quizzes': return '⏱️';
      case 'whatsapp_reminders': return '📱';
      case 'email_delivery': return '✉️';
      case 'ai_explanations': return '🤖';
      case 'payment_processing': return '💳';
      default: return '⚙️';
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center"
          >
            <Settings className="w-8 h-8 text-primary" />
          </motion.div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
                <AdminBadge role={adminRole} />
              </div>
              <p className="text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="health" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="health" className="gap-2">
              <Zap className="w-4 h-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-2">
              <Database className="w-4 h-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Health Check Tab */}
          <TabsContent value="health">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AppHealthCheck />
            </motion.div>
          </TabsContent>

          {/* Questions Database Tab */}
          <TabsContent value="questions">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Question Database Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-green-500/10 rounded-xl border border-primary/20">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary">{stats.totalQuestions}</p>
                      <p className="text-muted-foreground">Total Questions in Database</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">Subject</th>
                          <th className="text-center py-3 px-2 text-muted-foreground font-medium">Questions</th>
                          <th className="text-center py-3 px-2 text-muted-foreground font-medium">Year Range</th>
                          <th className="text-center py-3 px-2 text-muted-foreground font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questionStats.map((stat) => (
                          <tr key={stat.subject} className="border-b border-border/50 hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <span className="capitalize font-medium text-foreground">
                                {stat.subject.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                                {stat.count}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center text-muted-foreground">
                              {stat.minYear && stat.maxYear ? (
                                <span>{stat.minYear} - {stat.maxYear}</span>
                              ) : (
                                <span className="text-yellow-500">No years</span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {stat.count >= 50 ? (
                                <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded-full text-xs">
                                  ✓ Good
                                </span>
                              ) : stat.count >= 20 ? (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded-full text-xs">
                                  ⚠ Low
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded-full text-xs">
                                  ✗ Needs More
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {questionStats.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-muted-foreground">
                              No questions in database yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">📊 Database Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Subjects</p>
                        <p className="font-bold text-foreground">{questionStats.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Questions</p>
                        <p className="font-bold text-foreground">{stats.totalQuestions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg per Subject</p>
                        <p className="font-bold text-foreground">
                          {questionStats.length > 0 ? Math.round(stats.totalQuestions / questionStats.length) : 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Coverage</p>
                        <p className="font-bold text-green-600">
                          {questionStats.filter(s => s.count >= 50).length}/{questionStats.length} Complete
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4"
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalPayments}</p>
                      <p className="text-xs text-muted-foreground">Payments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.activeUsers}</p>
                      <p className="text-xs text-muted-foreground">Active Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalQuizzes}</p>
                      <p className="text-xs text-muted-foreground">Quizzes Taken</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalAdmins}</p>
                      <p className="text-xs text-muted-foreground">Admins</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border border-green-500/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Database className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{stats.totalQuestions}+</p>
                      <p className="text-xs text-muted-foreground">Questions ✓</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Payments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Recent Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-muted-foreground font-medium">Email</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">Package</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">Amount</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">Expires</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.slice(0, 15).map((payment) => (
                          <tr key={payment.id} className="border-b border-border/50">
                            <td className="py-3 truncate max-w-[150px]">{payment.email}</td>
                            <td className="py-3 capitalize">{payment.package}</td>
                            <td className="py-3">{formatCurrency(payment.amount)}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                payment.status === 'success' 
                                  ? 'bg-green-500/20 text-green-600' 
                                  : 'bg-yellow-500/20 text-yellow-600'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-3 text-muted-foreground">
                              {payment.access_expires_at ? formatDate(payment.access_expires_at) : '-'}
                            </td>
                            <td className="py-3 text-muted-foreground">{formatDate(payment.created_at)}</td>
                          </tr>
                        ))}
                        {payments.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                              No payments yet 📭
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Owner-only notice for collaborators */}
            {!canEdit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="font-semibold text-amber-600">View Only Mode</p>
                    <p className="text-sm text-muted-foreground">Only the owner can change settings</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Admin Management - OWNER ONLY */}
              {isOwner ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-500" />
                        Team Members
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="collaborator@email.com"
                          value={newCollaboratorEmail}
                          onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="icon" onClick={addCollaborator}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {admins.map((admin) => (
                          <div
                            key={admin.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm truncate">{admin.email}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                admin.role === 'owner' 
                                  ? 'bg-amber-500/20 text-amber-600' 
                                  : 'bg-blue-500/20 text-blue-600'
                              }`}>
                                {admin.role}
                              </span>
                            </div>
                            {admin.email !== userEmail && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeAdmin(admin.id, admin.email)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Your Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 rounded-lg bg-muted/50 text-center space-y-2">
                        <AdminBadge role={adminRole} />
                        <p className="text-sm text-muted-foreground mt-2">
                          You have collaborator access. Admin list is only visible to the owner.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* WhatsApp Status & Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="w-5 h-5 text-green-500" />
                      WhatsApp Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* WhatsApp Status */}
                    <div className={`p-4 rounded-lg ${whatsappConfigured ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${whatsappConfigured ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                          {whatsappConfigured ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold ${whatsappConfigured ? 'text-green-600' : 'text-yellow-600'}`}>
                            {whatsappConfigured ? 'Connected & Working' : 'Checking...'}
                          </p>
                          <p className="text-xs text-muted-foreground">Twilio WhatsApp Sandbox (sound-sound)</p>
                        </div>
                      </div>
                    </div>

                    {/* Sandbox Info */}
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs text-blue-600 font-medium">📱 Sandbox Join Code</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Text <code className="bg-muted px-1 rounded">join sound-sound</code> to +14155238886 on WhatsApp
                      </p>
                    </div>

                    {/* Test Number */}
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium text-foreground mb-1">Test Number</p>
                      <code className="text-sm text-primary font-mono">+2347073996465</code>
                    </div>

                    {/* Test Button */}
                    <Button
                      className={`w-full ${canEdit ? 'bg-green-600 hover:bg-green-700' : 'bg-muted'} text-white`}
                      onClick={testWhatsAppReminder}
                      disabled={testingWhatsApp || !canEdit}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {!canEdit ? 'Only owner can test' : testingWhatsApp ? 'Sending...' : 'Send Test Reminder Now'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Email Integration */}
                <Card className="bg-card border-border mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-500" />
                      Email Integration (Resend)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Email Status */}
                    <div className={`p-4 rounded-lg ${emailConfigured ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${emailConfigured ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                          {emailConfigured ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold ${emailConfigured ? 'text-green-600' : 'text-yellow-600'}`}>
                            {emailConfigured ? 'Connected & Working' : emailConfigured === false ? 'Not Configured' : 'Checking...'}
                          </p>
                          <p className="text-xs text-muted-foreground">Resend Email API</p>
                        </div>
                      </div>
                    </div>

                    {/* Test Email */}
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium text-foreground mb-1">Test Email To</p>
                      <code className="text-sm text-primary font-mono">{OWNER_EMAIL}</code>
                    </div>

                    {/* Test Button */}
                    <Button
                      className={`w-full ${canEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-muted'} text-white`}
                      onClick={testEmailSend}
                      disabled={testingEmail || !canEdit}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {!canEdit ? 'Only owner can test' : testingEmail ? 'Sending...' : 'Send Test Email Now'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Other Quick Actions */}
                <Card className="bg-card border-border mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                      <Key className="w-4 h-4 mr-2" />
                      View User Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
