import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Key, Users, Package, TrendingUp, Search, Ban, 
  Copy, CheckCircle, XCircle, RefreshCw, Loader2,
  BarChart3, DollarSign, ShoppingCart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { errorLogger } from '@/services/errorLogger';

interface B2BOverview {
  total_buyers: number;
  active_buyers: number;
  total_pins_generated: number;
  total_pins_redeemed: number;
  total_revenue: number;
  pending_orders: number;
}

interface B2BBuyer {
  id: string;
  email: string;
  full_name: string;
  organization_name: string;
  phone_number: string;
  buyer_type: string;
  is_active: boolean;
  created_at: string;
}

interface B2BPin {
  id: string;
  pin_code: string;
  plan_type: string;
  status: string;
  redeemed_by_email: string | null;
  redeemed_at: string | null;
  created_at: string;
  expires_at: string;
}

const planLabels: Record<string, string> = {
  ace_30: 'ACE (30 Days)',
  ace_90: 'ACE (90 Days)',
  scholar_365: 'SCHOLAR (365 Days)',
};

export const B2BManagement = () => {
  const [overview, setOverview] = useState<B2BOverview | null>(null);
  const [buyers, setBuyers] = useState<B2BBuyer[]>([]);
  const [pins, setPins] = useState<B2BPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'buyers' | 'pins'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchOverview(), fetchBuyers(), fetchPins()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('b2b-admin-manage', {
        body: { action: 'get_overview' }
      });
      if (error) throw error;
      setOverview(data.overview);
    } catch (err) {
      errorLogger.error(err, { component: 'B2BManagement', action: 'fetch B2B overview' });
    }
  };

  const fetchBuyers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('b2b-admin-manage', {
        body: { action: 'get_all_buyers' }
      });
      if (error) throw error;
      setBuyers(data.buyers || []);
    } catch (err) {
      errorLogger.error(err, { component: 'B2BManagement', action: 'fetch buyers' });
    }
  };

  const fetchPins = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('b2b-admin-manage', {
        body: { action: 'get_all_pins' }
      });
      if (error) throw error;
      setPins(data.pins || []);
    } catch (err) {
      errorLogger.error(err, { component: 'B2BManagement', action: 'fetch pins' });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleToggleBuyer = async (buyerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('b2b-admin-manage', {
        body: { action: 'toggle_buyer', buyer_id: buyerId, is_active: !currentStatus }
      });
      if (error) throw error;
      toast.success(`Buyer ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchBuyers();
    } catch (err) {
      toast.error('Failed to update buyer');
    }
  };

  const handleRevokePin = async (pinId: string) => {
    try {
      const { error } = await supabase.functions.invoke('b2b-admin-manage', {
        body: { action: 'revoke_pin', pin_id: pinId }
      });
      if (error) throw error;
      toast.success('PIN revoked');
      fetchPins();
    } catch (err) {
      toast.error('Failed to revoke PIN');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const filteredBuyers = buyers.filter(b => 
    b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.organization_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPins = pins.filter(p =>
    p.pin_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.redeemed_by_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeSection === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveSection('overview')}
          className="gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Overview
        </Button>
        <Button
          variant={activeSection === 'buyers' ? 'default' : 'outline'}
          onClick={() => setActiveSection('buyers')}
          className="gap-2"
        >
          <Users className="w-4 h-4" />
          Buyers ({buyers.length})
        </Button>
        <Button
          variant={activeSection === 'pins' ? 'default' : 'outline'}
          onClick={() => setActiveSection('pins')}
          className="gap-2"
        >
          <Key className="w-4 h-4" />
          PINs ({pins.length})
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
          className="ml-auto"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Search */}
      {(activeSection === 'buyers' || activeSection === 'pins') && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeSection}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Overview */}
      {activeSection === 'overview' && overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview.total_buyers}</p>
                  <p className="text-xs text-muted-foreground">Total Buyers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview.active_buyers}</p>
                  <p className="text-xs text-muted-foreground">Active Buyers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview.total_pins_generated}</p>
                  <p className="text-xs text-muted-foreground">PINs Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview.total_pins_redeemed}</p>
                  <p className="text-xs text-muted-foreground">PINs Redeemed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(overview.total_revenue)}</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview.pending_orders}</p>
                  <p className="text-xs text-muted-foreground">Pending Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Buyers List */}
      {activeSection === 'buyers' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Registered Buyers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBuyers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery ? 'No buyers match your search' : 'No buyers registered yet'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredBuyers.map((buyer) => (
                  <div key={buyer.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{buyer.email}</p>
                          <Badge variant={buyer.is_active ? 'default' : 'secondary'}>
                            {buyer.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {buyer.buyer_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {buyer.full_name || 'No name'} {buyer.organization_name ? `- ${buyer.organization_name}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleBuyer(buyer.id, buyer.is_active)}
                      >
                        {buyer.is_active ? (
                          <Ban className="w-4 h-4 text-destructive" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PINs List */}
      {activeSection === 'pins' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Activation PINs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPins.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery ? 'No PINs match your search' : 'No PINs generated yet'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">PIN Code</th>
                      <th className="text-left py-2 text-muted-foreground">Plan</th>
                      <th className="text-left py-2 text-muted-foreground">Status</th>
                      <th className="text-left py-2 text-muted-foreground">Redeemed By</th>
                      <th className="text-left py-2 text-muted-foreground">Expires</th>
                      <th className="text-right py-2 text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPins.map((pin) => (
                      <tr key={pin.id} className="border-b border-border/50">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              {pin.pin_code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(pin.pin_code)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-3">{planLabels[pin.plan_type] || pin.plan_type}</td>
                        <td className="py-3">
                          <Badge variant={
                            pin.status === 'available' ? 'default' :
                            pin.status === 'redeemed' ? 'secondary' : 'destructive'
                          }>
                            {pin.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {pin.redeemed_by_email || '-'}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(pin.expires_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          {pin.status === 'available' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokePin(pin.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
