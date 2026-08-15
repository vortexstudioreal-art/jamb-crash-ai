import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface B2BBuyer {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  organization: string | null;
  buyer_type: 'school' | 'teacher' | 'reseller';
  phone: string | null;
  is_active: boolean;
  total_purchased: number;
  total_redeemed: number;
  created_at: string;
  updated_at: string;
}

export function useB2BBuyer() {
  const { user } = useAuth();
  const [buyer, setBuyer] = useState<B2BBuyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const fetchBuyer = async () => {
      const { data, error: fetchError } = await supabase
        .from('b2b_buyers')
        .select('*')
        .eq('email', user.email!)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setBuyer(data);
      }
      setLoading(false);
    };

    fetchBuyer();
  }, [user?.email]);

  const registerBuyer = async (data: {
    full_name: string;
    organization?: string;
    buyer_type: 'school' | 'teacher' | 'reseller';
    phone?: string;
  }) => {
    if (!user) throw new Error('Not authenticated');

    const { data: result, error } = await supabase.functions.invoke('b2b-register-buyer', {
      body: data,
    });

    if (error) throw error;
    if (result.buyer) {
      setBuyer(result.buyer);
    }
    return result;
  };

  return { buyer, loading, error, registerBuyer };
}
