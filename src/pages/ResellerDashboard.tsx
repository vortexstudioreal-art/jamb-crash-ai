import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Package, CheckCircle, Clock, Copy, Download, 
   Key, CreditCard, BarChart3,   
    UserCheck,  Loader2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { errorLogger } from '@/services/errorLogger';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useB2BBuyer } from '@/hooks/useB2BBuyer';
import { useB2BOrder, type B2BPIN } from '@/hooks/useB2BOrder';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type View = 'dashboard' | 'register' | 'purchase' | 'pins' | 'orders';

interface ResellerStats {
  total_pins_purchased: number;
  total_pins_redeemed: number;
  total_pins_available: number;
  total_spent: number;
  active_orders: number;
  recent_redemptions: Redemption[];
}

interface Redemption {
  pin_code: string;
  plan_type: string;
  redeemed_by_email: string | null;
  redeemed_at: string | null;
}

const planColors: Record<string, string> = {
  ace_30: 'bg-blue-500/20 text-blue-500',
  ace_90: 'bg-purple-500/20 text-purple-500',
  scholar_365: 'bg-amber-500/20 text-amber-500',
};

const planLabels: Record<string, string> = {
  ace_30: 'ACE (30 Days)',
  ace_90: 'ACE (90 Days)',
  scholar_365: 'SCHOLAR (365 Days)',
};

const statusColors: Record<string, string> = {
  available: 'bg-green-500/20 text-green-500',
  redeemed: 'bg-blue-500/20 text-blue-500',
  expired: 'bg-gray-500/20 text-gray-500',
  revoked: 'bg-red-500/20 text-red-500',
};

const ResellerDashboard = () => {
  const { user } = useAuth();
  const { buyer, loading: buyerLoading, registerBuyer } = useB2BBuyer();
  const { prices, loading: orderLoading, calculatePrice, initializeOrder, verifyOrder, getPins, exportPinsCsv } = useB2BOrder();
  
  const [view, setView] = useState<View>('dashboard');
  const [pins, setPins] = useState<B2BPIN[]>([]);
  const [stats, setStats] = useState<ResellerStats | null>(null);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  
  // Purchase flow state
  const [selectedPlan, setSelectedPlan] = useState('ace_90');
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [pendingReference, setPendingReference] = useState<string | null>(null);

  // Register form
  const [regForm, setRegForm] = useState({
    full_name: user?.user_metadata?.full_name || '',
    organization: '',
    buyer_type: 'reseller' as 'school' | 'teacher' | 'reseller',
    phone: '',
  });

  const loadStats = useCallback(async () => {
    try {
      const result = await getPins();
      setPins(result.pins || []);
      setStats(result.stats || null);
    } catch (err) {
      errorLogger.error(err, { component: 'ResellerDashboard', action: 'load stats' });
    }
  }, [getPins]);

  useEffect(() => {
    if (buyer && view === 'dashboard') {
      loadStats();
    }
  }, [buyer, view, loadStats]);

  const handleRegister = async () => {
    if (!regForm.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }
    try {
      await registerBuyer(regForm);
      toast.success('Registration successful!');
      setView('dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const handlePurchase = async () => {
    try {
      const result = await initializeOrder(selectedPlan, quantity, notes);
      if (result.authorization_url) {
        // Keep the reference: the buyer needs it to verify (Paystack's
        // new-tab flow never shows our reference back to them).
        setPendingReference(result.reference || null);
        window.open(result.authorization_url, '_blank');
        setShowPayment(true);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to initialize order');
    }
  };

  const handleVerifyPayment = async (reference: string) => {
    try {
      const result = await verifyOrder(reference);
      if (result.success) {
        toast.success(`Generated ${result.pins?.length || 0} PINs!`);
        setShowPayment(false);
        setPendingReference(null);
        loadStats();
        setView('pins');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2000);
    toast.success('PIN copied!');
  };

  const pricing = calculatePrice(selectedPlan, quantity);

  // Loading state
  if (buyerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Registration view
  if (!buyer || view === 'register') {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Register as a B2B Buyer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  value={regForm.full_name}
                  onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Buyer Type *</label>
                <Select value={regForm.buyer_type} onValueChange={(v) => setRegForm({ ...regForm, buyer_type: v as 'school' | 'teacher' | 'reseller' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reseller">Individual Reseller</SelectItem>
                    <SelectItem value="school">School / Institution</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Organization (optional)</label>
                <Input
                  value={regForm.organization}
                  onChange={(e) => setRegForm({ ...regForm, organization: e.target.value })}
                  placeholder="School or company name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone (optional)</label>
                <Input
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <Button onClick={handleRegister} className="w-full" disabled={orderLoading}>
                {orderLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                Register
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Reseller Portal</h1>
              <p className="text-xs text-muted-foreground">{buyer.organization || buyer.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setView('register')}>
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total_pins_purchased || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Purchased</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total_pins_redeemed || 0}</p>
                  <p className="text-xs text-muted-foreground">Redeemed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total_pins_available || 0}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₦{(stats?.total_spent || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={() => setView('purchase')} className="gap-2">
            <ShoppingCart className="w-4 h-4" /> Buy PINs
          </Button>
          <Button variant="outline" onClick={() => setView('pins')} className="gap-2">
            <Key className="w-4 h-4" /> My PINs
          </Button>
          <Button variant="outline" onClick={() => exportPinsCsv()} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        {/* Purchase View */}
        {view === 'purchase' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Buy Activation PINs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Select Plan</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['ace_30', 'ace_90', 'scholar_365'].map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setSelectedPlan(plan)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedPlan === plan
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className="font-bold">{planLabels[plan]}</p>
                        <p className="text-2xl font-bold text-primary">₦{(prices.find(p => p.plan_type === plan && p.min_quantity === 1)?.unit_price || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">per PIN</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-32"
                  />
                  <div className="flex gap-2 mt-2">
                    {[10, 25, 50, 100].map((q) => (
                      <Button
                        key={q}
                        variant={quantity === q ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuantity(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Discount Tiers */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm font-medium mb-2">Bulk Discount Tiers</p>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className={`p-2 rounded ${quantity >= 1 ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                      <p className="font-bold">1-9 PINs</p>
                      <p>0% off</p>
                    </div>
                    <div className={`p-2 rounded ${quantity >= 10 ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                      <p className="font-bold">10+ PINs</p>
                      <p>10% off</p>
                    </div>
                    <div className={`p-2 rounded ${quantity >= 50 ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                      <p className="font-bold">50+ PINs</p>
                      <p>20% off</p>
                    </div>
                    <div className={`p-2 rounded ${quantity >= 100 ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                      <p className="font-bold">100+ PINs</p>
                      <p>30% off</p>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                {pricing && (
                  <div className="border rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Unit Price</span>
                      <span>₦{pricing.unit_price.toLocaleString()}</span>
                    </div>
                    {pricing.discount_percent > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Bulk Discount ({pricing.discount_percent}%)</span>
                        <span>-₦{((pricing.unit_price * quantity * pricing.discount_percent) / 100).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span className="text-primary">₦{pricing.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Order notes..."
                  />
                </div>

                <Button onClick={handlePurchase} className="w-full" size="lg" disabled={orderLoading || !pricing}>
                  {orderLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Pay ₦{pricing?.total_amount.toLocaleString() || 0}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* PINs View */}
        {view === 'pins' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  My PINs ({pins.length})
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportPinsCsv()}>
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </CardHeader>
              <CardContent>
                {pins.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No PINs yet. Buy your first batch!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {pins.map((pin) => (
                      <div
                        key={pin.id}
                        className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-mono font-bold text-sm">{pin.pin_code}</div>
                          <Badge className={planColors[pin.plan_type]}>
                            {planLabels[pin.plan_type]}
                          </Badge>
                          <Badge className={statusColors[pin.status]}>
                            {pin.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {pin.redeemed_by_email && (
                            <span className="text-xs text-muted-foreground">{pin.redeemed_by_email}</span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyPin(pin.pin_code)}
                          >
                            {copiedPin === pin.pin_code ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Activity */}
        {view === 'dashboard' && stats && stats.recent_redemptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Redemptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.recent_redemptions.map((r: Redemption, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{r.pin_code}</span>
                      <Badge className={planColors[r.plan_type]}>{planLabels[r.plan_type]}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{r.redeemed_by_email || 'Not redeemed'}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.redeemed_at ? new Date(r.redeemed_at).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Complete your payment in the Paystack window, then click Verify.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {pendingReference && (
              <p className="text-xs text-muted-foreground break-all">
                Order reference: <span className="font-mono font-bold text-foreground">{pendingReference}</span>
              </p>
            )}
            <Input
              placeholder="Enter payment reference"
              id="payment-reference"
              defaultValue={pendingReference || ''}
            />
            <Button
              onClick={() => {
                const ref = (document.getElementById('payment-reference') as HTMLInputElement)?.value;
                if (ref) handleVerifyPayment(ref);
              }}
              className="w-full"
            >
              Verify Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResellerDashboard;
