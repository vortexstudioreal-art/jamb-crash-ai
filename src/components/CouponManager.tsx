import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Copy, DollarSign, Users, CheckCircle, Clock, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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

interface CouponCode {
  id: string;
  code: string;
  creator_email: string;
  discount_amount: number;
  is_active: boolean;
  created_at: string;
}

interface CouponUsage {
  id: string;
  coupon_id: string;
  used_by_email: string;
  amount_paid: number;
  discount_applied: number;
  creator_earning: number;
  is_paid_out: boolean;
  created_at: string;
}

export const CouponManager = () => {
  const { isOwner, user } = useAuth();
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [usage, setUsage] = useState<CouponUsage[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newCreatorEmail, setNewCreatorEmail] = useState('');
  const [discountAmount, setDiscountAmount] = useState(1000);
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
      setCoupons(data);
    }
    setLoading(false);
  };

  const fetchUsage = async () => {
    const { data, error } = await supabase
      .from('coupon_usage')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setUsage(data);
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
        is_active: true
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('This coupon code already exists');
      } else {
        toast.error('Failed to create coupon');
      }
      return;
    }

    toast.success(`Coupon ${codeToCreate} created! 🎉`);
    setNewCode('');
    setNewCreatorEmail('');
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
    if (coupon) {
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
                <p className="text-sm text-muted-foreground">Total Earnings</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <label className="text-sm text-muted-foreground mb-1 block">Discount (₦)</label>
                <Input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={createCoupon} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Coupon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : coupons.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No coupons created yet</p>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => {
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
                        <p className="text-sm text-muted-foreground">
                          Created by: <span className="text-foreground">{coupon.creator_email}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Discount: <span className="text-primary font-semibold">₦{coupon.discount_amount.toLocaleString()}</span>
                          {' • '}
                          Used: <span className="text-foreground">{couponUsage.length}x</span>
                          {' • '}
                          Earned: <span className="text-green-500 font-semibold">₦{earnings.toLocaleString()}</span>
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

      {/* Earnings by Creator */}
      {Object.keys(earningsByCreator).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              Referral Earnings
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
                      {data.count} referrals
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">₦{data.total.toLocaleString()}</p>
                    {data.unpaid > 0 && (
                      <p className="text-sm text-yellow-500">₦{data.unpaid.toLocaleString()} unpaid</p>
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
                return (
                  <div 
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg text-sm"
                  >
                    <div>
                      <span className="font-mono font-semibold">{coupon?.code || 'Unknown'}</span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span>{u.used_by_email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-green-500">+₦{u.creator_earning.toLocaleString()}</span>
                      {u.is_paid_out ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : isOwner ? (
                        <Button size="sm" variant="outline" onClick={() => markAsPaid(u.id)}>
                          Mark Paid
                        </Button>
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
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
