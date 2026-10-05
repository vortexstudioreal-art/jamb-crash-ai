import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSeo } from '@/hooks/useSeo';
import { errorLogger } from '@/services/errorLogger';

// Stricter email validation - blocks disposable/fake emails
const emailSchema = z.string()
  .email('Please enter a valid email address')
  .refine((email) => {
    // Block common disposable email domains
    const disposableDomains = [
      'tempmail.com', 'throwaway.com', 'guerrillamail.com', 'mailinator.com',
      'tempail.com', '10minutemail.com', 'fakeinbox.com', 'trashmail.com',
      'yopmail.com', 'getnada.com', 'maildrop.cc', 'dispostable.com',
      'temp-mail.org', 'mohmal.com', 'emailondeck.com', 'sharklasers.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return !disposableDomains.includes(domain);
  }, 'Please use a valid email address (disposable emails not allowed)')
  .refine((email) => {
    // Must have valid TLD (at least 2 chars)
    const tld = email.split('.').pop();
    return tld && tld.length >= 2;
  }, 'Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password';

export default function Auth() {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string; confirmPassword?: string }>({});
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useSeo({
    title: 'Login or Sign Up | Jamb Crash AI',
    description: 'Create your free account to start practicing JAMB past questions, get AI study plans, and track your score prediction.',
    path: '/auth',
  });

  const { signIn, signUp, user, isLoading, isOwner, isAdmin, hasAccess } = useAuth();
  const navigate = useNavigate();

  // Clear invalid sessions on mount to prevent glitches
  useEffect(() => {
    const clearInvalidSession = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error?.message?.includes('Refresh Token Not Found') || 
            error?.message?.includes('Invalid Refresh Token') ||
            error?.message?.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
        }
      } catch (err) {
        errorLogger.error(err, { component: 'Auth', action: 'check session' });
      }
    };
    clearInvalidSession();
  }, []);

  // Check for payment signup flow from state
  useEffect(() => {
    const state = location.state as { flow?: string; plan?: string; returnToPayment?: boolean } | null;
    if (state?.flow === 'signup' || state?.returnToPayment) {
      setView('signup');
    }
  }, [location.state]);

  // Check for password reset token in URL hash, query params, or auth event
  useEffect(() => {
    const initRecoverySession = async () => {
      const hash = window.location.hash;
      const isRecoveryFromHash = hash && hash.includes('access_token') && hash.includes('type=recovery');
      const isRecoveryFromQuery = searchParams.get('recovery') === 'true';
      
      if (isRecoveryFromHash) {
        setView('reset-password');
        
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        if (accessToken && refreshToken) {
          try {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              errorLogger.error(error, { component: 'Auth', action: 'set recovery session' });
              toast.error('Reset link expired. Please request a new one.');
              setView('forgot-password');
            } else {
              // Clear the hash from URL but stay on reset-password view
              window.history.replaceState(null, '', window.location.pathname + '?recovery=true');
            }
          } catch (err) {
            errorLogger.error(err, { component: 'Auth', action: 'session setup' });
            toast.error('Something went wrong. Please try again.');
            setView('forgot-password');
          }
        }
      } else if (isRecoveryFromQuery) {
        // Check if we have a valid session for password reset
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            setView('reset-password');
          } else {
            setView('forgot-password');
            toast.error('Session expired. Please request a new password reset.');
          }
        });
      }
    };

    initRecoverySession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  // Redirect if already logged in (but not during password reset)
  useEffect(() => {
    if (user && !isLoading && view !== 'reset-password') {
      const state = location.state as { plan?: string; returnToPayment?: boolean } | null;
      
      // If user just signed up and needs to pay, redirect to payment flow
      if (state?.returnToPayment && state?.plan) {
        navigate(`/?openPayment=true&plan=${state.plan}`, { replace: true });
        return;
      }
      
      // Admins/owners and paid users go to dashboard
      // They can access admin panel via the gear icon
      if (isOwner || isAdmin || hasAccess) {
        navigate('/?step=dashboard', { replace: true });
        return;
      }
      
      // Regular users - check if this was a trial signup flow
      // They'll be redirected to subject selection via Index.tsx
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate, isOwner, isAdmin, hasAccess, view, location.state]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    if (view !== 'forgot-password') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }
    
    if (view === 'signup' && !fullName.trim()) {
      newErrors.fullName = 'Please enter your name';
    }

    if (view === 'reset-password') {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error('Session expired. Please request a new password reset link.');
        setView('forgot-password');
        setIsSubmitting(false);
        return;
      }
      
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        if (error.message.includes('same as')) {
          toast.error('New password must be different from your current password.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Password updated successfully! Signing you in...');
        // Clear URL params
        window.history.replaceState(null, '', '/auth');
        // Sign out to clear recovery session, then redirect to login
        await supabase.auth.signOut();
        setPassword('');
        setConfirmPassword('');
        setEmail('');
        setView('login');
        toast.success('You can now sign in with your new password!');
      }
    } catch (err) {
      errorLogger.error(err, { component: 'Auth', action: 'password reset' });
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?recovery=true`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset link sent! Check your email inbox.');
        setView('login');
      }
    } catch (err) {
      errorLogger.error(err, { component: 'Auth', action: 'forgot password' });
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (view === 'forgot-password') {
      await handleForgotPassword();
      return;
    }

    if (view === 'reset-password') {
      await handleResetPassword();
      return;
    }
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (view === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back! 🎉');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          const msg = error.message.toLowerCase();
          if (
            msg === 'email_not_confirmed' ||
            msg.includes('email not confirmed') ||
            msg.includes('email confirmation') ||
            msg.includes('not confirmed') ||
            msg.includes('verify')
          ) {
            // Email confirmation is enforced on the project but the
            // auto-confirm step didn't run (function undeployed / project
            // inactive). Don't strand the user on a verification screen —
            // send them to sign-in and let them verify later from Settings.
            toast.success('Account created! Please sign in to continue. 📧 You can verify your email later from Settings.');
            setView('login');
          } else if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
            setView('login');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! Welcome! 🎉');
        }
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'forgot-password':
        return 'Reset Password';
      case 'reset-password':
        return 'Set New Password';
      case 'signup':
        return 'Create Account';
      default:
        return 'Welcome Back!';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'forgot-password':
        return "Enter your email and we'll send you a reset link";
      case 'reset-password':
        return 'Enter your new password below';
      case 'signup':
        return 'Join thousands of students crushing their JAMB goals';
      default:
        return 'Sign in to continue your JAMB preparation';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Jamb Crash AI</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground">
            {getSubtitle()}
          </p>
        </div>

        {/* Progress Indicator - Show for signup flow */}
        {view === 'signup' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between max-w-xs mx-auto">
              {/* Step 1 - Create Account (Active) */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  1
                </div>
                <span className="text-xs mt-1.5 text-primary font-medium">Create Account</span>
              </div>
              
              {/* Connector */}
              <div className="flex-1 h-0.5 bg-border mx-2 mb-5" />
              
              {/* Step 2 - Select Subjects */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm">
                  2
                </div>
                <span className="text-xs mt-1.5 text-muted-foreground">Select Subjects</span>
              </div>
              
              {/* Connector */}
              <div className="flex-1 h-0.5 bg-border mx-2 mb-5" />
              
              {/* Step 3 - Start Learning */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm">
                  3
                </div>
                <span className="text-xs mt-1.5 text-muted-foreground">Start Learning</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form Card */}
        <div className="card-elevated p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                )}
              </div>
            )}
            
            {view !== 'reset-password' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
            )}
            
            {(view !== 'forgot-password') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {view === 'reset-password' ? 'New Password' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={view === 'reset-password' ? 'Enter new password' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {view === 'reset-password' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {view === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot-password');
                    setErrors({});
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gradient-primary text-primary-foreground font-semibold py-6"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {view === 'forgot-password' ? 'Send Reset Link' : 
                   view === 'reset-password' ? 'Update Password' :
                   view === 'login' ? 'Sign In' : 
                   'Create Account'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {(view === 'forgot-password' || view === 'reset-password') ? (
            <button
              type="button"
              onClick={() => {
                setView('login');
                setErrors({});
                setPassword('');
                setConfirmPassword('');
                if (window.location.hash) {
                  window.history.replaceState(null, '', window.location.pathname);
                }
              }}
              className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground mt-6 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          ) : (
            <p className="text-center text-sm text-muted-foreground mt-6">
              {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setView(view === 'login' ? 'signup' : 'login');
                  setErrors({});
                }}
                className="text-primary font-semibold hover:underline"
              >
                {view === 'login' ? 'Sign up' : 'Sign in'}
              </button>
          </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
