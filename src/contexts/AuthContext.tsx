import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  userRole: 'owner' | 'admin' | 'collaborator' | null;
  hasAccess: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAccess: () => Promise<void>;
}

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
      } else {
        setHasAccess(false);
        setIsAdmin(false);
        setUserRole(null);
        setIsOwner(false);
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
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
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
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setHasAccess(false);
    setIsAdmin(false);
    setUserRole(null);
    setIsOwner(false);
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
