import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, Loader2, ArrowLeft, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password';
type SignupFlow = 'normal' | 'trial';

export default function Auth() {
  const [view, setView] = useState<AuthView>('login');
  const [signupFlow, setSignupFlow] = useState<SignupFlow>('normal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string; confirmPassword?: string }>({});
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const { signIn, signUp, user, isLoading, isOwner, isAdmin, hasAccess } = useAuth();
  const navigate = useNavigate();

  // Check for trial signup flow from state
  useEffect(() => {
    const state = location.state as { flow?: string; returnTo?: string } | null;
    if (state?.flow === 'trial') {
      setView('signup');
      setSignupFlow('trial');
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
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Failed to set recovery session:', error);
            toast.error('Reset link expired. Please request a new one.');
            setView('forgot-password');
          }
        }
      } else if (isRecoveryFromQuery) {
        setView('reset-password');
      }
    };

    initRecoverySession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  // Redirect if already logged in (but not during password reset)
  useEffect(() => {
    if (user && !isLoading && view !== 'reset-password') {
      // Admins and owners go to admin panel
      if (isOwner || isAdmin) {
        navigate('/admin', { replace: true });
        return;
      }
      
      // Paid users go to dashboard
      if (hasAccess) {
        navigate('/?step=dashboard', { replace: true });
        return;
      }
      
      // Regular users - check if this was a trial signup flow
      // They'll be redirected to subject selection via Index.tsx
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate, isOwner, isAdmin, hasAccess, view]);

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
        toast.error(error.message);
      } else {
        toast.success('Password updated successfully! You can now sign in.');
        window.history.replaceState(null, '', window.location.pathname);
        await supabase.auth.signOut();
        setView('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
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
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
            setView('login');
          } else {
            toast.error(error.message);
          }
        } else {
          if (signupFlow === 'trial') {
            toast.success('Account created! Starting your free trial... 🎉');
          } else {
            toast.success('Account created! Welcome to JAMB Crash! 🎉');
          }
        }
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (view === 'signup' && signupFlow === 'trial') {
      return 'Start Your Free Trial';
    }
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
    if (view === 'signup' && signupFlow === 'trial') {
      return 'Create an account to get 30 minutes of Premium access FREE';
    }
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
            {signupFlow === 'trial' && view === 'signup' ? (
              <>
                <Gift className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">30-Min Free Trial</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">JAMB 48-Hour Crash</span>
              </>
            )}
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground">
            {getSubtitle()}
          </p>
        </div>

        {/* Trial Benefits Banner */}
        {view === 'signup' && signupFlow === 'trial' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-green-500/20 border border-primary/30"
          >
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              What you get FREE:
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Full Premium access for 30 minutes</li>
              <li>✓ All quiz modes and study materials</li>
              <li>✓ AI-powered explanations & flashcards</li>
              <li>✓ No payment required to start</li>
            </ul>
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
                   signupFlow === 'trial' ? 'Start Free Trial' : 'Create Account'}
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
                  setSignupFlow('normal');
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
