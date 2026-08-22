import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseUrl } from '@/integrations/supabase/client';
import { startPeriodicSync, stopPeriodicSync } from '@/services/syncService';
import { errorLogger } from '@/services/errorLogger';

// Package feature limits
export type UserPackage = 'basic' | 'pro' | 'premium' | 'admin' | null;

export interface PackageFeatures {
  maxQuizQuestions: number;
  // Boolean feature flags
  hasFullQuiz: boolean;
  hasMiniQuiz: boolean;
  hasStudyMaterials: boolean;
  hasStudyStats: boolean;
  hasRecentProgress: boolean;
  hasSubjectPerformance: boolean;
  hasPracticeQuiz: boolean; // Mistake-based practice
  hasAiScorePrediction: boolean;
  hasWhatsAppReminders: boolean;
  hasReferralBonus: boolean;
  hasEmailReminder: boolean;
  hasAiStudyTips: boolean;
  hasAdvancedPrediction: boolean;
  // Plan metadata
  studyPlanType: 'basic' | 'full' | 'advanced';
  accessDays: number | 'lifetime';
}

export const PACKAGE_FEATURES: Record<NonNullable<UserPackage>, PackageFeatures> = {
  basic: {
    maxQuizQuestions: 60,
    // Basic gets: Full Quiz, Mini Quiz, Study Materials, Study Stats, Recent Progress, Subject Performance
    hasFullQuiz: true,
    hasMiniQuiz: true,
    hasStudyMaterials: true,
    hasStudyStats: true,
    hasRecentProgress: true,
    hasSubjectPerformance: true,
    // Basic BLOCKED: Practice Quiz, AI Score Prediction, WhatsApp, Refer & Earn
    hasPracticeQuiz: true,
    hasAiScorePrediction: false,
    hasWhatsAppReminders: false,
    hasReferralBonus: false,
    hasEmailReminder: false,
    hasAiStudyTips: false,
    hasAdvancedPrediction: false,
    studyPlanType: 'basic',
    accessDays: 30,
  },
  pro: {
    maxQuizQuestions: 60,
    // Pro gets everything in Basic plus:
    hasFullQuiz: true,
    hasMiniQuiz: true,
    hasStudyMaterials: true,
    hasStudyStats: true,
    hasRecentProgress: true,
    hasSubjectPerformance: true,
    // Pro UNLOCKED: Practice Quiz, Unlimited PDFs, Full Study Plan, AI explanations, flashcards, Email Reminder, AI Tips
    hasPracticeQuiz: true,
    hasAiScorePrediction: true,
    hasWhatsAppReminders: false, // Still blocked
    hasReferralBonus: false, // Still blocked
    hasEmailReminder: true,
    hasAiStudyTips: true,
    hasAdvancedPrediction: false,
    studyPlanType: 'full',
    accessDays: 90,
  },
  premium: {
    maxQuizQuestions: 60,
    // Premium gets everything
    hasFullQuiz: true,
    hasMiniQuiz: true,
    hasStudyMaterials: true,
    hasStudyStats: true,
    hasRecentProgress: true,
    hasSubjectPerformance: true,
    hasPracticeQuiz: true,
    hasAiScorePrediction: true,
    hasWhatsAppReminders: true,
    hasReferralBonus: true,
    hasEmailReminder: true,
    hasAiStudyTips: true,
    hasAdvancedPrediction: true,
    studyPlanType: 'advanced',
    accessDays: 'lifetime',
  },
  admin: {
    maxQuizQuestions: 60,
    hasFullQuiz: true,
    hasMiniQuiz: true,
    hasStudyMaterials: true,
    hasStudyStats: true,
    hasRecentProgress: true,
    hasSubjectPerformance: true,
    hasPracticeQuiz: true,
    hasAiScorePrediction: true,
    hasWhatsAppReminders: true,
    hasReferralBonus: true,
    hasEmailReminder: true,
    hasAiStudyTips: true,
    hasAdvancedPrediction: true,
    studyPlanType: 'advanced',
    accessDays: 'lifetime',
  },
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  userRole: 'owner' | 'admin' | 'collaborator' | null;
  hasAccess: boolean;
  userPackage: UserPackage;
  packageFeatures: PackageFeatures;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAccess: () => Promise<void>;
}

const defaultFeatures: PackageFeatures = {
  maxQuizQuestions: 20,
  hasFullQuiz: false,
  hasMiniQuiz: true,
  hasStudyMaterials: false,
  hasStudyStats: false,
  hasRecentProgress: false,
  hasSubjectPerformance: false,
  hasPracticeQuiz: false,
  hasAiScorePrediction: false,
  hasWhatsAppReminders: false,
  hasReferralBonus: false,
  hasEmailReminder: false,
  hasAiStudyTips: false,
  hasAdvancedPrediction: false,
  studyPlanType: 'basic',
  accessDays: 0,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'collaborator' | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [userPackage, setUserPackage] = useState<UserPackage>(null);

  // Derive package features from userPackage
  const packageFeatures: PackageFeatures = userPackage 
    ? PACKAGE_FEATURES[userPackage] 
    : defaultFeatures;

  // Restore cached access state for offline support
  // Only cache non-sensitive fields (hasAccess, userPackage) - never trust cached admin/owner status
  const restoreCachedAccess = (email: string) => {
    try {
      const cached = localStorage.getItem(`jamb_access_${email}`);
      if (cached) {
        const data = JSON.parse(cached);
        setHasAccess(data.hasAccess || false);
        // Never restore admin/owner from cache - only server can determine these
        setIsAdmin(false);
        setUserRole(null);
        setIsOwner(false);
        setUserPackage(data.userPackage || 'basic');
        return true;
      }
    } catch (e) {
      errorLogger.error(e, { component: 'AuthContext', action: 'restoreCachedAccess' });
    }
    return false;
  };

  const cacheAccessState = (email: string, accessData: { hasAccess: boolean; isAdmin: boolean; userRole: string | null; isOwner: boolean; userPackage: UserPackage }) => {
    try {
      localStorage.setItem(`jamb_access_${email}`, JSON.stringify(accessData));
    } catch (e) {
      errorLogger.error(e, { component: 'AuthContext', action: 'cacheAccessState' });
    }
  };

  const checkUserAccess = async (email: string) => {
    // Offline: skip the network RPC entirely and use the cached snapshot so
    // ProtectedRoute / Index don't strand the user on landing.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      restoreCachedAccess(email.toLowerCase());
      return;
    }
    try {
      const { data, error } = await supabase.rpc('check_user_access', {
        user_email: email.toLowerCase(),
      });

      if (error) {
        errorLogger.error(error, { component: 'AuthContext', action: 'checkUserAccess' });
        if (navigator.onLine) {
          setUserPackage('basic');
        } else {
          restoreCachedAccess(email.toLowerCase());
        }
        return;
      }

      if (data && data.length > 0) {
        const result = data[0];
        const accessState = {
          hasAccess: result.has_access || false,
          isAdmin: result.is_admin || false,
          userRole: (result.admin_role as 'owner' | 'admin' | 'collaborator' | null),
          isOwner: result.admin_role === 'owner',
          userPackage: null as UserPackage,
        };

        // Determine package
        if (accessState.userRole === 'owner' || accessState.userRole === 'admin' || accessState.userRole === 'collaborator') {
          accessState.userPackage = 'admin';
        } else if (result.package) {
          const pkgName = result.package.toLowerCase();
          if (pkgName === 'basic') accessState.userPackage = 'basic';
          else if (pkgName === 'pro' || pkgName === 'standard') accessState.userPackage = 'pro';
          else if (pkgName === 'premium' || pkgName === 'ultimate') accessState.userPackage = 'premium';
        }

        setHasAccess(accessState.hasAccess);
        setIsAdmin(accessState.isAdmin);
        setUserRole(accessState.userRole);
        setIsOwner(accessState.isOwner);
        setUserPackage(accessState.userPackage);

        // Cache for offline use
        cacheAccessState(email.toLowerCase(), accessState);
      } else {
        // No payment/role record found — treat as free basic user
        setHasAccess(false);
        setIsAdmin(false);
        setUserRole(null);
        setIsOwner(false);
        setUserPackage('basic');
      }
    } catch (err) {
      errorLogger.error(err, { component: 'AuthContext', action: 'checkUserAccess' });
      if (navigator.onLine) {
        setUserPackage('basic');
      } else {
        restoreCachedAccess(email.toLowerCase());
      }
    }
  };

  const refreshAccess = async () => {
    if (user?.email) {
      await checkUserAccess(user.email);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Cache session for offline use
        if (session) {
          try {
            localStorage.setItem('jamb_supabase_session', JSON.stringify(session));
          } catch (e) {
            errorLogger.error(e, { component: 'AuthContext', action: 'cacheSessionOnAuthChange' });
          }
        } else {
          try {
            localStorage.removeItem('jamb_supabase_session');
          } catch (e) {
            // ignore
          }
        }
        
        // Defer access check to avoid deadlock
        if (session?.user?.email) {
          setTimeout(() => {
            checkUserAccess(session.user.email!);
          }, 0);
        } else {
          setHasAccess(false);
          setIsAdmin(false);
          setUserRole(null);
          setIsOwner(false);
          setUserPackage(null);
        }
        
        setIsLoading(false);
      }
    );

    // Offline fast-path: restore cached session immediately
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      try {
        const cachedSession = localStorage.getItem('jamb_supabase_session');
        if (cachedSession) {
          const parsed = JSON.parse(cachedSession);
          setSession(parsed);
          setUser(parsed?.user ?? null);
          if (parsed?.user?.email) {
            restoreCachedAccess(parsed.user.email.toLowerCase());
          }
        }
      } catch (e) {
        errorLogger.error(e, { component: 'AuthContext', action: 'restoreCachedSession' });
      }
      setIsLoading(false);
      return;
    }

    // THEN check for existing session (and clear invalid tokens)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // Clear stale/invalid sessions automatically
      if (error) {
        const errorMsg = error.message?.toLowerCase() || '';
        if (
          errorMsg.includes('refresh token') || 
          errorMsg.includes('invalid') ||
          errorMsg.includes('not found')
        ) {
          supabase.auth.signOut();
          setIsLoading(false);
          return;
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Cache session for offline use
      if (session) {
        try {
          localStorage.setItem('jamb_supabase_session', JSON.stringify(session));
        } catch (e) {
          errorLogger.error(e, { component: 'AuthContext', action: 'cacheSessionOnGetSession' });
        }
      }
      
      if (session?.user?.email) {
        checkUserAccess(session.user.email);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start/stop periodic sync based on user session
  useEffect(() => {
    if (user) {
      startPeriodicSync(5 * 60 * 1000, (result) => {
      });
    } else {
      stopPeriodicSync();
    }

    return () => stopPeriodicSync();
  }, [user]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (!error && data?.user) {
      // Auto-confirm via edge function (best effort)
      try {
        await fetch(`${supabaseUrl}/functions/v1/auto-confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch {
        // Edge function not deployed yet
      }

      // Also try RPC directly (in case migration is applied)
      try {
        await supabase.rpc('confirm_user_email', { user_email: email });
      } catch {
        // RPC not available yet
      }

      // Try signing in — if it fails, email confirmation is still on
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        return { error: new Error('email_not_confirmed') };
      }
    }
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Clear trial data and cached access from localStorage
    const email = user?.email?.toLowerCase();
    localStorage.removeItem('jamb_trial_start');
    localStorage.removeItem('jamb_trial_subjects');
    localStorage.removeItem('jamb_user_email');
    localStorage.removeItem('jamb_supabase_session');
    if (email) {
      localStorage.removeItem(`jamb_access_${email}`);
      localStorage.removeItem(`jamb_subjects_${email}`);
    }
    
    // Use local scope to avoid issues with stale refresh tokens
    await supabase.auth.signOut({ scope: 'local' });
    
    // Immediately clear all state
    setUser(null);
    setSession(null);
    setHasAccess(false);
    setIsAdmin(false);
    setUserRole(null);
    setIsOwner(false);
    setUserPackage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isOwner,
        isAdmin,
        userRole,
        hasAccess,
        userPackage,
        packageFeatures,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
