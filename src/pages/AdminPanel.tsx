import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Plus, 
  Trash2, 
  ArrowLeft,
  RefreshCw,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminBadge } from '@/components/AdminBadge';
import { useAccessControl } from '@/hooks/useAccessControl';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface Stats {
  totalPayments: number;
  totalRevenue: number;
  activeUsers: number;
  totalAdmins: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { hasAccess, isAdmin, adminRole, isLoading, userEmail } = useAccessControl();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPayments: 0, totalRevenue: 0, activeUsers: 0, totalAdmins: 0 });
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  const isOwner = adminRole === 'owner';

  useEffect(() => {
    if (!isLoading && (!isAdmin || !hasAccess)) {
      navigate('/');
      return;
    }
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, isLoading, hasAccess, navigate]);

  const fetchData = async () => {
    setLoadingData(true);
    await Promise.all([fetchPayments(), fetchAdmins()]);
    setLoadingData(false);
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

  const addCollaborator = async () => {
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

    toast.success('Collaborator added!');
    setNewCollaboratorEmail('');
    fetchAdmins();
  };

  const removeAdmin = async (id: string, email: string) => {
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

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
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

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalPayments}</p>
                  <p className="text-xs text-muted-foreground">Total Payments</p>
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
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
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
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Admin Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isOwner && (
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
                )}
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
                      {isOwner && admin.email !== userEmail && (
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

          {/* Recent Payments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
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
                        <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.slice(0, 10).map((payment) => (
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
                          <td className="py-3 text-muted-foreground">{formatDate(payment.created_at)}</td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No payments yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
