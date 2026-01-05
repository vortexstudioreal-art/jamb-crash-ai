import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Users, Ticket, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdminCouponDashboard } from '@/components/AdminCouponDashboard';

interface CollaboratorStats {
  totalEarnings: number;
  pendingPayouts: number;
  usersReferred: number;
  activeCoupons: number;
}

const CollaboratorDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [stats, setStats] = useState<CollaboratorStats>({
    totalEarnings: 0,
    pendingPayouts: 0,
    usersReferred: 0,
    activeCoupons: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not a collaborator
    if (userRole && userRole !== 'collaborator') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      if (!user?.email) return;

      try {
        // Fetch coupons created by this collaborator
        const { data: coupons } = await supabase
          .from('coupon_codes')
          .select('id, is_active')
          .eq('creator_email', user.email);

        const activeCoupons = coupons?.filter(c => c.is_active).length || 0;
        const couponIds = coupons?.map(c => c.id) || [];

        // Fetch usage stats for their coupons
        let totalEarnings = 0;
        let pendingPayouts = 0;
        let usersReferred = 0;

        if (couponIds.length > 0) {
          const { data: usage } = await supabase
            .from('coupon_usage')
            .select('creator_earning, is_paid_out, used_by_email')
            .in('coupon_id', couponIds);

          if (usage) {
            totalEarnings = usage.reduce((sum, u) => sum + (u.creator_earning || 0), 0);
            pendingPayouts = usage.filter(u => !u.is_paid_out).reduce((sum, u) => sum + (u.creator_earning || 0), 0);
            usersReferred = new Set(usage.map(u => u.used_by_email)).size;
          }
        }

        setStats({
          totalEarnings,
          pendingPayouts,
          usersReferred,
          activeCoupons
        });
      } catch (error) {
        console.error('Error fetching collaborator stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, userRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Content Creator Dashboard</h1>
            <p className="text-muted-foreground">Manage your coupons and track earnings</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">₦{stats.totalEarnings.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Pending Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">₦{stats.pendingPayouts.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users Referred
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stats.usersReferred}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Active Coupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stats.activeCoupons}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coupon Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdminCouponDashboard />
        </motion.div>
      </div>
    </div>
  );
};

export default CollaboratorDashboard;
