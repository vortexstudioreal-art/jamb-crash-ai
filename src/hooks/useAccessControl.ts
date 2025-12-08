import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AccessStatus {
  hasAccess: boolean;
  isAdmin: boolean;
  adminRole: 'owner' | 'collaborator' | null;
  package: string | null;
  expiresAt: Date | null;
  isLoading: boolean;
  userEmail: string | null;
}

const STORAGE_KEY = 'jamb_user_email';

export const useAccessControl = () => {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>({
    hasAccess: false,
    isAdmin: false,
    adminRole: null,
    package: null,
    expiresAt: null,
    isLoading: true,
    userEmail: null,
  });

  const checkAccess = useCallback(async (email: string) => {
    if (!email) {
      setAccessStatus({
        hasAccess: false,
        isAdmin: false,
        adminRole: null,
        package: null,
        expiresAt: null,
        isLoading: false,
        userEmail: null,
      });
      return;
    }

    try {
      // All access checks are done server-side via RPC
      const { data, error } = await supabase.rpc('check_user_access', {
        user_email: email.toLowerCase(),
      });

      if (error) {
        console.error('Error checking access:', error);
        setAccessStatus({
          hasAccess: false,
          isAdmin: false,
          adminRole: null,
          package: null,
          expiresAt: null,
          isLoading: false,
          userEmail: email,
        });
        return;
      }

      if (data && data.length > 0) {
        const result = data[0];
        setAccessStatus({
          hasAccess: result.has_access || false,
          isAdmin: result.is_admin || false,
          adminRole: result.admin_role as 'owner' | 'collaborator' | null,
          package: result.package || null,
          expiresAt: result.expires_at ? new Date(result.expires_at) : null,
          isLoading: false,
          userEmail: email,
        });
      } else {
        setAccessStatus({
          hasAccess: false,
          isAdmin: false,
          adminRole: null,
          package: null,
          expiresAt: null,
          isLoading: false,
          userEmail: email,
        });
      }
    } catch (err) {
      console.error('Access check failed:', err);
      setAccessStatus({
        hasAccess: false,
        isAdmin: false,
        adminRole: null,
        package: null,
        expiresAt: null,
        isLoading: false,
        userEmail: email,
      });
    }
  }, []);

  const setUserEmail = useCallback((email: string) => {
    localStorage.setItem(STORAGE_KEY, email.toLowerCase());
    checkAccess(email);
  }, [checkAccess]);

  const clearUserEmail = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAccessStatus({
      hasAccess: false,
      isAdmin: false,
      adminRole: null,
      package: null,
      expiresAt: null,
      isLoading: false,
      userEmail: null,
    });
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem(STORAGE_KEY);
    if (storedEmail) {
      checkAccess(storedEmail);
    } else {
      setAccessStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [checkAccess]);

  return {
    ...accessStatus,
    setUserEmail,
    clearUserEmail,
    refreshAccess: () => {
      const email = localStorage.getItem(STORAGE_KEY);
      if (email) checkAccess(email);
    },
  };
};
