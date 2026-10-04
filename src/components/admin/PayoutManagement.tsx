import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Clock, CheckCircle, XCircle, RefreshCw, 
  Banknote, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { errorLogger } from '@/services/errorLogger';

interface PayoutRequest {
  id: string;
  collaborator_email: string;
  amount: number;
  status: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  requested_at: string | null;
  processed_at: string | null;
  processed_by: string | null;
  notes: string | null;
}

interface PayoutManagementProps {
  isOwner: boolean;
  userEmail: string;
}

export const PayoutManagement = ({ isOwner, userEmail }: PayoutManagementProps) => {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPayoutRequests();
  }, []);

  const fetchPayoutRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setPayoutRequests(data || []);
    } catch (error) {
      errorLogger.error(error, { component: 'PayoutManagement', action: 'fetch payout requests' });
      toast.error('Failed to fetch payout requests');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (request: PayoutRequest) => {
    if (!isOwner) {
      toast.error('Only owner can process payouts');
      return;
    }

    setProcessingId(request.id);
    try {
      // Update payout request status
      const { error: payoutError } = await supabase
        .from('payout_requests')
        .update({
          status: 'paid',
          processed_at: new Date().toISOString(),
          processed_by: userEmail
        })
        .eq('id', request.id);

      if (payoutError) throw payoutError;

      // Get collaborator's coupons
      const { data: coupons } = await supabase
        .from('coupon_codes')
        .select('id')
        .eq('creator_email', request.collaborator_email);

      if (coupons && coupons.length > 0) {
        const couponIds = coupons.map(c => c.id);
        
        // Mark coupon_usage as paid for this collaborator's unpaid earnings
        const { error: usageError } = await supabase
          .from('coupon_usage')
          .update({
            is_paid_out: true,
            paid_out_at: new Date().toISOString()
          })
          .in('coupon_id', couponIds)
          .eq('is_paid_out', false);

        if (usageError) {
          errorLogger.error(usageError, { component: 'PayoutManagement', action: 'update coupon usage' });
        }
      }

      toast.success('Payout marked as paid! 💰');
      await fetchPayoutRequests();
    } catch (error) {
      errorLogger.error(error, { component: 'PayoutManagement', action: 'mark payout as paid' });
      toast.error('Failed to process payout');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (request: PayoutRequest) => {
    setSelectedRequest(request);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const rejectPayout = async () => {
    if (!selectedRequest || !isOwner) return;

    setProcessingId(selectedRequest.id);
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: userEmail,
          notes: rejectReason || 'Request rejected by admin'
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast.success('Payout request rejected');
      setRejectDialogOpen(false);
      await fetchPayoutRequests();
    } catch (error) {
      errorLogger.error(error, { component: 'PayoutManagement', action: 'reject payout' });
      toast.error('Failed to reject payout');
    } finally {
      setProcessingId(null);
    }
  };

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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Stats
  const pendingRequests = payoutRequests.filter(r => r.status === 'pending');
  const totalPending = pendingRequests.reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = payoutRequests.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPending)}</p>
                <p className="text-xs text-muted-foreground">Pending Amount</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPaid)}</p>
                <p className="text-xs text-muted-foreground">Total Paid Out</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Requests Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Payout Requests
            </CardTitle>
            <Button variant="outline" size="icon" onClick={fetchPayoutRequests}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payoutRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Banknote className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payout requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Collaborator</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Bank Details</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Requested</th>
                    {isOwner && <th className="text-right py-3 px-2 text-muted-foreground font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {payoutRequests.map((request) => (
                    <motion.tr 
                      key={request.id} 
                      className="border-b border-border/50 hover:bg-muted/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="py-3 px-2">
                        <p className="font-medium text-foreground">{request.collaborator_email}</p>
                      </td>
                      <td className="py-3 px-2">
                        <p className="font-bold text-primary">{formatCurrency(request.amount)}</p>
                      </td>
                      <td className="py-3 px-2">
                        {request.bank_name ? (
                          <div className="text-xs">
                            <p className="font-medium text-foreground">{request.bank_name}</p>
                            <p className="text-muted-foreground">{request.account_number}</p>
                            <p className="text-muted-foreground">{request.account_name}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No bank details</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {getStatusBadge(request.status)}
                        {request.notes && request.status === 'rejected' && (
                          <p className="text-xs text-red-500 mt-1">{request.notes}</p>
                        )}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground text-xs">
                        {formatDate(request.requested_at || '')}
                      </td>
                      {isOwner && (
                        <td className="py-3 px-2 text-right">
                          {request.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                onClick={() => markAsPaid(request)}
                                disabled={processingId === request.id}
                              >
                                {processingId === request.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-3 h-3" />
                                    Mark Paid
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                onClick={() => openRejectDialog(request)}
                                disabled={processingId === request.id}
                              >
                                <X className="w-3 h-3" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this payout request? The collaborator will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={rejectPayout}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
