import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Copy, DollarSign, Users, CheckCircle, Clock, Ticket, Tag, Shield, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { errorLogger } from '@/services/errorLogger';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type CouponType = 'public' | 'admin_referral' | 'internal';

interface CouponCode {
  id: string;
  code: string;
  creator_email: string;
  discount_amount: number;
  discount_percentage: number | null;
  coupon_type: CouponType;
  is_active: boolean;
  times_used: number | null;
  usage_limit: number | null;
  expiry_date: string | null;
  created_at: string;
}

interface CouponUsage {
  id: string;
  coupon_id: string;
  used_by_email: string;
  amount_paid: number;
  discount_applied: number;
  creator_earning: number;
  commission_percentage: number | null;
  commission_payable: boolean | null;
  is_paid_out: boolean;
  created_at: string;
}

const COUPON_TYPE_CONFIG = {
  public: {
    label: 'Public Discount',
    description: '5% discount, no commission',
    color: 'bg-blue-500',
    icon: Tag,
    defaultDiscount: 5,
    commission: 0,
  },
  admin_referral: {
    label: 'Admin Referral',
    description: '5% discount + 10% commission',
    color: 'bg-green-500',
    icon: Users,
    defaultDiscount: 5,
    commission: 10,
  },
  internal: {
    label: 'Internal/Testing',
    description: '50-100% discount, hidden from users',
    color: 'bg-purple-500',
    icon: Shield,
    defaultDiscount: 100,
    commission: 0,
  },
};

export const CouponManager = () => {
  const { isOwner, user } = useAuth();
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [usage, setUsage] = useState<CouponUsage[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newCreatorEmail, setNewCreatorEmail] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(5);
  const [discountAmount, setDiscountAmount] = useState(1000);
  const [couponType, setCouponType] = useState<CouponType>('admin_referral');
  const [usageLimit, setUsageLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
    fetchUsage();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupon_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setCoupons(data as CouponCode[]);
    }
    setLoading(false);
  };

  const fetchUsage = async () => {
    const { data, error } = await supabase
      .from('coupon_usage')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setUsage(data as CouponUsage[]);
    }
  };

  const createCoupon = async () => {
    if (!isOwner) {
      toast.error('Only owner can create coupons');
      return;
    }

    if (!newCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    const codeToCreate = newCode.toUpperCase().replace(/\s/g, '-');
    const creatorEmail = newCreatorEmail.trim() || user?.email || '';

    const { error } = await supabase
      .from('coupon_codes')
      .insert({
        code: codeToCreate,
        creator_email: creatorEmail,
        discount_amount: discountAmount,
        discount_percentage: discountPercentage,
        coupon_type: couponType,
        usage_limit: usageLimit,
        is_active: true
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('This coupon code already exists');
      } else {
        errorLogger.error(error, { component: 'CouponManager', action: 'create coupon' });
        toast.error('Failed to create coupon');
      }
      return;
    }

    toast.success(`${COUPON_TYPE_CONFIG[couponType].label} coupon "${codeToCreate}" created! 🎉`);
    setNewCode('');
    setNewCreatorEmail('');
    setDiscountPercentage(5);
    setDiscountAmount(1000);
    setUsageLimit(null);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string, code: string) => {
    if (!isOwner) {
      toast.error('Only owner can delete coupons');
      return;
    }

    const { error } = await supabase
      .from('coupon_codes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete coupon');
      return;
    }

    toast.success(`Coupon ${code} deleted`);
    fetchCoupons();
  };

  const toggleCoupon = async (id: string, currentStatus: boolean) => {
    if (!isOwner) {
      toast.error('Only owner can modify coupons');
      return;
    }

    const { error } = await supabase
      .from('coupon_codes')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update coupon');
      return;
    }

    toast.success(currentStatus ? 'Coupon deactivated' : 'Coupon activated');
    fetchCoupons();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied! 📋');
  };

  const markAsPaid = async (usageId: string) => {
    if (!isOwner) {
      toast.error('Only owner can mark payouts');
      return;
    }

    const { error } = await supabase
      .from('coupon_usage')
      .update({ is_paid_out: true, paid_out_at: new Date().toISOString() })
      .eq('id', usageId);

    if (error) {
      toast.error('Failed to update payout status');
      return;
    }

    toast.success('Marked as paid! ✅');
    fetchUsage();
  };

  // Calculate earnings per creator
  const earningsByCreator = usage.reduce((acc, u) => {
    const coupon = coupons.find(c => c.id === u.coupon_id);
    if (coupon && coupon.coupon_type === 'admin_referral') {
      if (!acc[coupon.creator_email]) {
        acc[coupon.creator_email] = { total: 0, unpaid: 0, count: 0 };
      }
      acc[coupon.creator_email].total += u.creator_earning;
      acc[coupon.creator_email].count++;
      if (!u.is_paid_out) {
        acc[coupon.creator_email].unpaid += u.creator_earning;
      }
    }
    return acc;
  }, {} as Record<string, { total: number; unpaid: number; count: number }>);

  const totalEarnings = usage.reduce((sum, u) => sum + u.creator_earning, 0);
  const unpaidEarnings = usage.filter(u => !u.is_paid_out).reduce((sum, u) => sum + u.creator_earning, 0);

  // Group coupons by type
  const publicCoupons = coupons.filter(c => c.coupon_type === 'public');
  const adminReferralCoupons = coupons.filter(c => c.coupon_type === 'admin_referral');
  const internalCoupons = coupons.filter(c => c.coupon_type === 'internal');

  const getCouponTypeConfig = (type: CouponType) => COUPON_TYPE_CONFIG[type] || COUPON_TYPE_CONFIG.admin_referral;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-green-500/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">{coupons.length}</p>
                <p className="text-sm text-muted-foreground">Total Coupons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-500">{usage.length}</p>
                <p className="text-sm text-muted-foreground">Times Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-500">₦{totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Commissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">₦{unpaidEarnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Unpaid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Coupon Section - Owner Only */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Create New Coupon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Coupon Type</label>
                <Select value={couponType} onValueChange={(v) => {
                  setCouponType(v as CouponType);
                  setDiscountPercentage(COUPON_TYPE_CONFIG[v as CouponType].defaultDiscount);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COUPON_TYPE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="w-4 h-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {COUPON_TYPE_CONFIG[couponType].description}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Coupon Code</label>
                <Input
                  placeholder="VIP-JOHN"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Creator Email</label>
                <Input
                  placeholder="admin@example.com"
                  value={newCreatorEmail}
                  onChange={(e) => setNewCreatorEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Discount %</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Fixed Discount (₦)</label>
                <Input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={createCoupon} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coupons List by Type */}
      {[
        { type: 'admin_referral' as CouponType, coupons: adminReferralCoupons, title: 'Admin Referral Coupons' },
        { type: 'public' as CouponType, coupons: publicCoupons, title: 'Public Discount Coupons' },
        { type: 'internal' as CouponType, coupons: internalCoupons, title: 'Internal/Testing Coupons' },
      ].map(({ type, coupons: typeCoupons, title }) => {
        const config = getCouponTypeConfig(type);
        return (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <config.icon className="w-5 h-5" />
                {title}
                <Badge variant="outline" className="ml-2">{typeCoupons.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : typeCoupons.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No {type.replace('_', ' ')} coupons</p>
              ) : (
                <div className="space-y-3">
                  {typeCoupons.map((coupon) => {
                    const couponUsage = usage.filter(u => u.coupon_id === coupon.id);
                    const earnings = couponUsage.reduce((sum, u) => sum + u.creator_earning, 0);
                    
                    return (
                      <motion.div
                        key={coupon.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center justify-between p-4 rounded-xl border ${
                          coupon.is_active 
                            ? 'bg-green-500/5 border-green-500/20' 
                            : 'bg-muted/50 border-border'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="font-mono font-bold text-lg bg-primary/10 px-3 py-1 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                            onClick={() => copyCode(coupon.code)}
                          >
                            {coupon.code}
                            <Copy className="w-3 h-3 inline ml-2 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={config.color}>
                                {config.label}
                              </Badge>
                              {coupon.discount_percentage && (
                                <Badge variant="outline">
                                  <Percent className="w-3 h-3 mr-1" />
                                  {coupon.discount_percentage}% off
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              By: <span className="text-foreground">{coupon.creator_email}</span>
                              {' • '}
                              Used: <span className="text-foreground">{coupon.times_used || 0}x</span>
                              {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                              {type === 'admin_referral' && (
                                <>
                                  {' • '}
                                  Earned: <span className="text-green-500 font-semibold">₦{earnings.toLocaleString()}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant={coupon.is_active ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleCoupon(coupon.id, coupon.is_active)}
                            disabled={!isOwner}
                          >
                            {coupon.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          
                          {isOwner && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the coupon "{coupon.code}" and all its usage history.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteCoupon(coupon.id, coupon.code)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Earnings by Creator - Only for admin_referral */}
      {Object.keys(earningsByCreator).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              Referral Commissions by Creator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(earningsByCreator).map(([email, data]) => (
                <div 
                  key={email}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
                >
                  <div>
                    <p className="font-medium">{email}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.count} successful referrals
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">₦{data.total.toLocaleString()}</p>
                    {data.unpaid > 0 && (
                      <p className="text-sm text-yellow-500">₦{data.unpaid.toLocaleString()} pending</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Usage */}
      {usage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Coupon Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usage.slice(0, 10).map((u) => {
                const coupon = coupons.find(c => c.id === u.coupon_id);
                const config = getCouponTypeConfig(coupon?.coupon_type || 'admin_referral');
                return (
                  <div 
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className={config.color} variant="outline">
                        {coupon?.code || 'Unknown'}
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <span>{u.used_by_email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {u.creator_earning > 0 && (
                        <span className="text-green-500">+₦{u.creator_earning.toLocaleString()}</span>
                      )}
                      {u.is_paid_out ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : u.creator_earning > 0 && isOwner ? (
                        <Button size="sm" variant="outline" onClick={() => markAsPaid(u.id)}>
                          Mark Paid
                        </Button>
                      ) : u.creator_earning > 0 ? (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
