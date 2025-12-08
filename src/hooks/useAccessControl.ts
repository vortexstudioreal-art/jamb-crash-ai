import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Bypass emails for immediate access
const OWNER_EMAIL = 'saeedabdulbasit933@gmail.com';
const COLLABORATOR_EMAILS = [
  'loaborejim@gmail.com',
  'favourgoodnews@gmail.com',
  'onuchionwuegbusi@gmail.com',
  'muzzyothman@gmail.com',
  'muzzyothmam@gmail.com'
];
const BYPASS_EMAILS = [OWNER_EMAIL, ...COLLABORATOR_EMAILS];
const BYPASS_STORAGE_KEY = 'jamb_bypass_email';

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

// Helper to get bypass email from localStorage
const getBypassEmail = (): string | null => {
  const stored = localStorage.getItem(BYPASS_STORAGE_KEY);
  if (stored && BYPASS_EMAILS.includes(stored.toLowerCase())) {
    return stored.toLowerCase();
  }
  return null;
};

export const useAccessControl = () => {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(() => {
    // Check for bypass user immediately
    const bypassEmail = getBypassEmail();
    if (bypassEmail) {
      const isOwner = bypassEmail === OWNER_EMAIL;
      return {
        hasAccess: true,
        isAdmin: true,
        adminRole: isOwner ? 'owner' : 'collaborator',
        package: 'permanent',
        expiresAt: null,
        isLoading: false,
        userEmail: bypassEmail,
      };
    }
    return {
      hasAccess: false,
      isAdmin: false,
      adminRole: null,
      package: null,
      expiresAt: null,
      isLoading: true,
      userEmail: null,
    };
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

    // Check if bypass user FIRST - instant access
    const normalizedEmail = email.toLowerCase();
    if (BYPASS_EMAILS.includes(normalizedEmail)) {
      const isOwner = normalizedEmail === OWNER_EMAIL;
      setAccessStatus({
        hasAccess: true,
        isAdmin: true,
        adminRole: isOwner ? 'owner' : 'collaborator',
        package: 'permanent',
        expiresAt: null,
        isLoading: false,
        userEmail: normalizedEmail,
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('check_user_access', {
        user_email: normalizedEmail,
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
    localStorage.removeItem(BYPASS_STORAGE_KEY);
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
    // Check bypass email FIRST
    const bypassEmail = getBypassEmail();
    if (bypassEmail) {
      checkAccess(bypassEmail);
      return;
    }
    
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
      const bypassEmail = getBypassEmail();
      if (bypassEmail) {
        checkAccess(bypassEmail);
        return;
      }
      const email = localStorage.getItem(STORAGE_KEY);
      if (email) checkAccess(email);
    },
  };
};
