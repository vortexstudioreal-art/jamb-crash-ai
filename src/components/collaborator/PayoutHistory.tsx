import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, CheckCircle, XCircle, RefreshCw, Banknote, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { errorLogger } from '@/services/errorLogger';

interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
}

interface PayoutHistoryProps {
  userEmail: string;
}

export const PayoutHistory = ({ userEmail }: PayoutHistoryProps) => {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayoutHistory();
  }, [userEmail, fetchPayoutHistory]);

  const fetchPayoutHistory = useCallback(async () => {
    if (!userEmail) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('id, amount, status, requested_at, processed_at, notes')
        .eq('collaborator_email', userEmail)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setPayoutRequests(data || []);
    } catch (error) {
      errorLogger.error(error, { component: 'PayoutHistory', action: 'fetch payout history' });
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-600 border-blue-500/30"><Check className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/20 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (payoutRequests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Banknote className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No payout requests yet</p>
        <p className="text-sm mt-1">Request your first payout when you reach ₦5,000</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Payout History</h3>
        <Button variant="ghost" size="sm" onClick={fetchPayoutHistory}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {payoutRequests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-foreground">
                      {formatCurrency(request.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested: {formatDate(request.requested_at)}
                    </p>
                    {request.processed_at && (
                      <p className="text-xs text-muted-foreground">
                        Processed: {formatDate(request.processed_at)}
                      </p>
                    )}
                    {request.notes && request.status === 'rejected' && (
                      <p className="text-xs text-red-500 mt-1">{request.notes}</p>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
