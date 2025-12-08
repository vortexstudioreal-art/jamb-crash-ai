import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PasswordRecoveryHandlerProps {
  children: React.ReactNode;
}

export function PasswordRecoveryHandler({ children }: PasswordRecoveryHandlerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check for recovery token in URL hash (could land on any page)
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    const hasRecoveryParam = searchParams.get('recovery') === 'true';
    
    if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
      // Redirect to auth page with recovery param
      if (location.pathname !== '/auth') {
        navigate('/auth?recovery=true' + hash, { replace: true });
        return;
      }
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Navigate to auth page for password update
        navigate('/auth?recovery=true', { replace: true });
      }
    });

    setIsChecking(false);

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // Don't block rendering while checking
  return <>{children}</>;
}
