import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const OWNER_EMAIL = 'saeedabdulbasit933@gmail.com';
const COLLABORATOR_EMAIL = 'muzzyothmam@gmail.com';
const BYPASS_EMAILS = [OWNER_EMAIL, COLLABORATOR_EMAIL];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  
  const { signIn, signUp, user, isLoading } = useAuth();
  const navigate = useNavigate();

  const normalizedEmail = email.toLowerCase().trim();
  const isOwnerEmail = normalizedEmail === OWNER_EMAIL;
  const isCollaboratorEmail = normalizedEmail === COLLABORATOR_EMAIL;
  const isBypassEmail = BYPASS_EMAILS.includes(normalizedEmail);

  // Redirect if already logged in - use replace to prevent back button returning here
  useEffect(() => {
    if (user && !isLoading) {
      // Always go to main page, which will redirect to dashboard if they have access
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    // Bypass emails don't need password validation
    if (!isBypassEmail) {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }
    
    if (!isLogin && !fullName.trim()) {
      newErrors.fullName = 'Please enter your name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const BYPASS_PASSWORD = 'BypassSecure2024!@#';

  const handleBypassLogin = async () => {
    const targetEmail = normalizedEmail;
    const roleLabel = isOwnerEmail ? 'Owner' : 'Collaborator';
    const emoji = isOwnerEmail ? '👑' : '🛡️';
    
    // Step 1: Try to sign in with bypass password
    const { error: signInError } = await signIn(targetEmail, BYPASS_PASSWORD);
    
    if (!signInError) {
      toast.success(`Welcome back, ${roleLabel}! ${emoji}`, { duration: 3000 });
      navigate('/', { replace: true });
      return;
    }
    
    // Step 2: If login fails, try to create the account
    const { error: signUpError } = await signUp(targetEmail, BYPASS_PASSWORD, roleLabel);
    
    if (!signUpError) {
      // Account created, now sign in
      const { error: finalSignInError } = await signIn(targetEmail, BYPASS_PASSWORD);
      if (!finalSignInError) {
        toast.success(`${roleLabel} account activated! Welcome! ${emoji}`, { duration: 3000 });
        navigate('/', { replace: true });
        return;
      }
    }
    
    // Step 3: If signup says already registered, the password might be different
    if (signUpError?.message?.includes('already registered')) {
      // Force navigation - the app will recognize the email
      toast.success(`${roleLabel} verified! Redirecting... ${emoji}`, { duration: 2000 });
      navigate('/', { replace: true });
      return;
    }
    
    toast.error(`${roleLabel} login issue. Please try again.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Special bypass handling - instant login for owner/collaborator
      if (isBypassEmail && isLogin) {
        await handleBypassLogin();
        return;
      }

      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back! 🎉');
          navigate('/', { replace: true });
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
            setIsLogin(true);
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! Welcome to JAMB Crash! 🎉');
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
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
            <span className="text-sm font-semibold text-primary">JAMB 48-Hour Crash</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin 
              ? 'Sign in to continue your JAMB preparation' 
              : 'Join thousands of students crushing their JAMB goals'}
          </p>
        </div>

        {/* Form Card */}
        <div className="card-elevated p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
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
            
            {/* Hide password field for bypass emails - show special message instead */}
            {isBypassEmail && isLogin ? (
              <div className={`bg-gradient-to-r ${isOwnerEmail ? 'from-yellow-500/10 to-amber-500/10 border-yellow-500/30' : 'from-gray-400/10 to-slate-400/10 border-gray-400/30'} border rounded-lg p-4`}>
                <div className={`flex items-center gap-2 ${isOwnerEmail ? 'text-yellow-600' : 'text-gray-600'}`}>
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">
                    {isOwnerEmail ? '👑 Owner Detected!' : '🛡️ Collaborator Detected!'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Sign In" for instant access - no password needed.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gradient-primary text-primary-foreground font-semibold py-6"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>


          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
