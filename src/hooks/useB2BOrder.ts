import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BulkPrice {
  id: string;
  plan_type: string;
  min_quantity: number;
  discount_percent: number;
  unit_price: number;
  is_active: boolean;
}

export interface B2BOrder {
  id: string;
  buyer_id: string;
  plan_type: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total_amount: number;
  status: string;
  paystack_reference: string | null;
  created_at: string;
}

export interface B2BPIN {
  id: string;
  pin_code: string;
  plan_type: string;
  status: 'available' | 'redeemed' | 'expired' | 'revoked';
  redeemed_by_email: string | null;
  redeemed_at: string | null;
  access_expires_at: string | null;
  created_at: string;
}

export function useB2BOrder() {
  const [prices, setPrices] = useState<BulkPrice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    const { data } = await supabase
      .from('b2b_pin_bulk_prices')
      .select('*')
      .order('plan_type')
      .order('min_quantity');

    if (data) setPrices(data);
  };

  const calculatePrice = (planType: string, quantity: number) => {
    const tier = prices
      .filter(p => p.plan_type === planType && p.is_active && quantity >= p.min_quantity)
      .sort((a, b) => b.min_quantity - a.min_quantity)[0];

    if (!tier) return null;

    return {
      unit_price: tier.unit_price,
      discount_percent: tier.discount_percent,
      total_amount: tier.unit_price * quantity,
    };
  };

  const initializeOrder = async (planType: string, quantity: number, notes?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('b2b-initialize-order', {
        body: { plan_type: planType, quantity, notes },
      });

      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  };

  const verifyOrder = async (reference: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('b2b-verify-order', {
        body: { reference },
      });

      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  };

  const getPins = async (orderId?: string, status?: string) => {
    const { data, error } = await supabase.functions.invoke('b2b-get-pins', {
      method: 'POST',
      body: { order_id: orderId, status },
    });

    if (error) throw error;
    return data;
  };

  const exportPinsCsv = async (orderId?: string) => {
    // `supabase.functions.url` is protected, so build the URL the same way
    // the rest of the app does.
    let url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/b2b-get-pins?format=csv`;
    if (orderId) url += `&order_id=${orderId}`;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `pins-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  return {
    prices,
    loading,
    calculatePrice,
    initializeOrder,
    verifyOrder,
    getPins,
    exportPinsCsv,
    fetchPrices,
  };
}
