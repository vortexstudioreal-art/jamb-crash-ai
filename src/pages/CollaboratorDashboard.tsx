import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Users, Ticket, TrendingUp, Banknote, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdminCouponDashboard } from '@/components/AdminCouponDashboard';
import { BankDetailsForm } from '@/components/collaborator/BankDetailsForm';
import { PayoutHistory } from '@/components/collaborator/PayoutHistory';
import { ProfileSettings } from '@/components/collaborator/ProfileSettings';
import { toast } from 'sonner';
import { useSeo } from '@/hooks/useSeo';
import { errorLogger } from '@/services/errorLogger';
interface CollaboratorStats {
  totalEarnings: number;
  pendingPayouts: number;
  usersReferred: number;
  activeCoupons: number;
}

interface BankDetails {
  bank_name: string;
  account_number: string;
  account_name: string;
}

const MINIMUM_PAYOUT = 5000; // ₦5,000 minimum

const CollaboratorDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, roleResolved } = useAuth();

  useSeo({
    title: 'Collaborator Dashboard | Jamb Crash AI',
    description: 'Jamb Crash AI collaborator referral dashboard.',
    path: '/collaborator-dashboard',
    noindex: true,
  });
  const [stats, setStats] = useState<CollaboratorStats>({
    totalEarnings: 0,
    pendingPayouts: 0,
    usersReferred: 0,
    activeCoupons: 0
  });
  const [loading, setLoading] = useState(true);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);

  const userEmail = user?.email || '';

  useEffect(() => {
    // The role lookup resolves asynchronously; until it settles, userRole is
    // null and cannot be distinguished from "not a collaborator".
    if (!roleResolved) return;

    // Only collaborators may use this dashboard.
    if (!user || userRole !== 'collaborator') {
      navigate('/', { replace: true });
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userRole, roleResolved, navigate, userEmail]);

  // Render nothing once we know the user isn't a collaborator (the effect above
  // handles the redirect). While the lookup is still pending we keep showing the
  // normal loading state rather than flashing protected content.
  if (roleResolved && (!user || userRole !== 'collaborator')) {
    return null;
  }

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchBankDetails(),
      checkPendingRequest()
    ]);
    setLoading(false);
  };

  const fetchStats = async () => {
    if (!userEmail) return;

    try {
      // Fetch coupons created by this collaborator
      const { data: coupons } = await supabase
        .from('coupon_codes')
        .select('id, is_active')
        .eq('creator_email', userEmail);

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
      errorLogger.error(error, { component: 'CollaboratorDashboard', action: 'fetch collaborator stats' });
    }
  };

  const fetchBankDetails = async () => {
    if (!userEmail) return;

    try {
      const { data } = await supabase
        .from('collaborator_bank_details')
        .select('bank_name, account_number, account_name')
        .eq('email', userEmail)
        .maybeSingle();

      setBankDetails(data);
    } catch (error) {
      errorLogger.error(error, { component: 'CollaboratorDashboard', action: 'fetch bank details' });
    }
  };

  const checkPendingRequest = async () => {
    if (!userEmail) return;

    try {
      const { data } = await supabase
        .from('payout_requests')
        .select('id')
        .eq('collaborator_email', userEmail)
        .eq('status', 'pending')
        .maybeSingle();

      setHasPendingRequest(!!data);
    } catch (error) {
      errorLogger.error(error, { component: 'CollaboratorDashboard', action: 'check pending request' });
    }
  };

  const requestPayout = async () => {
    if (!userEmail || !bankDetails) {
      toast.error('Please save your bank details first');
      return;
    }

    if (stats.pendingPayouts < MINIMUM_PAYOUT) {
      toast.error(`Minimum payout amount is ₦${MINIMUM_PAYOUT.toLocaleString()}`);
      return;
    }

    if (hasPendingRequest) {
      toast.error('You already have a pending payout request');
      return;
    }

    setRequestingPayout(true);
    try {
      const { error } = await supabase
        .from('payout_requests')
        .insert({
          collaborator_email: userEmail,
          amount: stats.pendingPayouts,
          bank_name: bankDetails.bank_name,
          account_number: bankDetails.account_number,
          account_name: bankDetails.account_name
        });

      if (error) throw error;

      toast.success('Payout request submitted! 🎉');
      setHasPendingRequest(true);
    } catch (error) {
      errorLogger.error(error, { component: 'CollaboratorDashboard', action: 'request payout' });
      toast.error('Failed to submit payout request');
    } finally {
      setRequestingPayout(false);
    }
  };

  const canRequestPayout = stats.pendingPayouts >= MINIMUM_PAYOUT && bankDetails && !hasPendingRequest;

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
            <h1 className="text-2xl font-bold text-foreground">Collaborator Dashboard</h1>
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Bank Details & Payout Request */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Profile Settings - Custom Badge Title */}
            {user?.id && (
              <ProfileSettings userId={user.id} userEmail={userEmail} />
            )}
            
            <BankDetailsForm userEmail={userEmail} onSave={fetchBankDetails} />
            
            {/* Payout Request Card */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Banknote className="w-5 h-5 text-primary" />
                  Request Payout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Available for payout</p>
                  <p className="text-3xl font-bold text-primary">₦{stats.pendingPayouts.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum payout: ₦{MINIMUM_PAYOUT.toLocaleString()}
                  </p>
                </div>

                {hasPendingRequest && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                    <p className="text-sm text-yellow-600">
                      You have a pending payout request
                    </p>
                  </div>
                )}

                {!bankDetails && (
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      Save your bank details above to request a payout
                    </p>
                  </div>
                )}

                <Button
                  onClick={requestPayout}
                  disabled={!canRequestPayout || requestingPayout}
                  className="w-full gap-2"
                  variant="hero"
                >
                  {requestingPayout ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Banknote className="w-4 h-4" />
                  )}
                  Request Payout
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="coupons" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="coupons" className="gap-2">
                  <Ticket className="w-4 h-4" />
                  My Coupons
                </TabsTrigger>
                <TabsTrigger value="payouts" className="gap-2">
                  <Banknote className="w-4 h-4" />
                  Payout History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="coupons">
                <AdminCouponDashboard />
              </TabsContent>

              <TabsContent value="payouts">
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <PayoutHistory userEmail={userEmail} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorDashboard;
