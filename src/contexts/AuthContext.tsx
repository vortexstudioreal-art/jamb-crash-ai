import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  const checkUserAccess = async (email: string) => {
    try {
      const { data, error } = await supabase.rpc('check_user_access', {
        user_email: email.toLowerCase(),
      });

      if (error) {
        console.error('Error checking access:', error);
        return;
      }

      if (data && data.length > 0) {
        const result = data[0];
        setHasAccess(result.has_access || false);
        setIsAdmin(result.is_admin || false);
        
        const role = result.admin_role as 'owner' | 'admin' | 'collaborator' | null;
        setUserRole(role);
        setIsOwner(role === 'owner');

        // Determine package - admins/owners get premium
        if (role === 'owner' || role === 'admin' || role === 'collaborator') {
          setUserPackage('admin');
        } else if (result.package) {
          // Map database package names to our package types
          const pkgName = result.package.toLowerCase();
          if (pkgName === 'basic') setUserPackage('basic');
          else if (pkgName === 'pro' || pkgName === 'standard') setUserPackage('pro');
          else if (pkgName === 'premium' || pkgName === 'ultimate') setUserPackage('premium');
          else setUserPackage(null);
        } else {
          setUserPackage(null);
        }
      } else {
        setHasAccess(false);
        setIsAdmin(false);
        setUserRole(null);
        setIsOwner(false);
        setUserPackage(null);
      }
    } catch (err) {
      console.error('Access check failed:', err);
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
          console.log('Invalid session detected, signing out...');
          supabase.auth.signOut();
          setIsLoading(false);
          return;
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        checkUserAccess(session.user.email);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
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
    // Clear trial data from localStorage first
    localStorage.removeItem('jamb_trial_start');
    localStorage.removeItem('jamb_trial_subjects');
    localStorage.removeItem('jamb_user_email');
    
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
