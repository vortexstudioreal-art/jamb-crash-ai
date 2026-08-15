import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Ticket, 
  TrendingUp, 
  Users, 
  Copy, 
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface CouponCode {
  id: string;
  code: string;
  discount_amount: number;
  discount_percentage: number | null;
  is_active: boolean;
  times_used: number;
  created_at: string;
  expiry_date: string | null;
  usage_limit: number | null;
  coupon_type: string | null;
}

interface CouponUsage {
  id: string;
  used_by_email: string;
  amount_paid: number;
  discount_applied: number;
  creator_earning: number;
  is_paid_out: boolean;
  created_at: string;
}

export const AdminCouponDashboard = () => {
  const { user, isAdmin, isOwner, userRole } = useAuth();
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [usageData, setUsageData] = useState<CouponUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Only show for collaborators (content creators) - they see their personal earnings dashboard
  // Owners and admins have full access via CouponManager instead
  const isContentCreator = userRole === 'collaborator';

  useEffect(() => {
    if (user?.email && isContentCreator) {
      fetchMyCoupons();
    }
  }, [user?.email, isContentCreator, fetchMyCoupons]);

  const fetchMyCoupons = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      // Fetch coupons created by this admin
      const { data: couponData, error: couponError } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('creator_email', user.email)
        .order('created_at', { ascending: false });

      if (couponError) throw couponError;
      setCoupons(couponData || []);

      // Fetch usage for these coupons
      if (couponData && couponData.length > 0) {
        const couponIds = couponData.map(c => c.id);
        const { data: usageResult, error: usageError } = await supabase
          .from('coupon_usage')
          .select('*')
          .in('coupon_id', couponIds)
          .order('created_at', { ascending: false });

        if (usageError) throw usageError;
        setUsageData(usageResult || []);
      }
    } catch (error) {
      console.error('Error fetching coupon data:', error);
      setCoupons([]);
      setUsageData([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  // Calculate stats
  const totalEarnings = usageData.reduce((sum, u) => sum + u.creator_earning, 0);
  const pendingEarnings = usageData
    .filter(u => !u.is_paid_out)
    .reduce((sum, u) => sum + u.creator_earning, 0);
  const totalUsers = new Set(usageData.map(u => u.used_by_email)).size;
  const activeCoupons = coupons.filter(c => c.is_active).length;

  if (!isContentCreator) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Coupon Dashboard</h2>
          <p className="text-muted-foreground">Track your referral coupons and earnings</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Content Creator
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                <p className="text-xl font-bold text-foreground">₦{totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Payout</p>
                <p className="text-xl font-bold text-foreground">₦{pendingEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Users Referred</p>
                <p className="text-xl font-bold text-foreground">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Ticket className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Coupons</p>
                <p className="text-xl font-bold text-foreground">{activeCoupons}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Coupons and Usage */}
      <Tabs defaultValue="coupons" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="coupons">My Coupons ({coupons.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({usageData.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4 mt-4">
          {coupons.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No coupons found</p>
                <p className="text-sm">Contact the owner to create a coupon for you</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className={coupon.is_active ? '' : 'opacity-60'}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${coupon.is_active ? 'bg-green-500/20' : 'bg-muted'}`}>
                          {coupon.is_active ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="font-mono font-bold text-foreground">{coupon.code}</code>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => copyCode(coupon.code)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              ₦{coupon.discount_amount} off
                            </Badge>
                            {coupon.discount_percentage && (
                              <Badge variant="outline" className="text-xs">
                                {coupon.discount_percentage}%
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              Used {coupon.times_used || 0} times
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {coupon.expiry_date && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expires {new Date(coupon.expiry_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4 mt-4">
          {usageData.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No users have used your coupons yet</p>
                <p className="text-sm">Share your coupon codes to start earning</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {usageData.map((usage) => (
                <Card key={usage.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{usage.used_by_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(usage.created_at).toLocaleDateString()} at{' '}
                          {new Date(usage.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-500">+₦{usage.creator_earning.toLocaleString()}</p>
                        <Badge variant={usage.is_paid_out ? 'default' : 'outline'} className="text-xs">
                          {usage.is_paid_out ? 'Paid' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
