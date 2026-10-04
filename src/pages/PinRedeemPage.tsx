import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, CheckCircle, AlertCircle, Loader2, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PinRedeemPage = () => {
  const [pinParts, setPinParts] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    plan_type?: string;
    access_expires_at?: string;
  } | null>(null);

  const handlePinInput = (index: number, value: string) => {
    // Only allow alphanumeric
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if (cleaned.length <= (index === 0 || index === 1 ? 3 : 4)) {
      const newParts = [...pinParts];
      newParts[index] = cleaned;
      setPinParts(newParts);

      // Auto-advance to next input
      if (cleaned.length === (index === 0 || index === 1 ? 3 : 4) && index < 3) {
        const nextInput = document.getElementById(`pin-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pinParts[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Try to parse as PIN format (XXXX-XXXX-XXXX-XXXX or continuous)
    const parts = pasted.split('-');
    if (parts.length === 4) {
      setPinParts(parts.map(p => p.substring(0, p === parts[0] || p === parts[1] ? 3 : 4)));
    } else if (pasted.length === 15) {
      // Continuous: 3+3+4+4 = 14 chars + possible separator
      setPinParts([
        pasted.substring(0, 3),
        pasted.substring(3, 7),
        pasted.substring(7, 11),
        pasted.substring(11, 15),
      ]);
    }
  };

  const handleRedeem = async () => {
    const fullPin = pinParts.join('-');
    
    if (pinParts.some((p, i) => p.length < (i < 2 ? 3 : 4))) {
      toast.error('Please enter the complete PIN');
      return;
    }

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('b2b-redeem-pin', {
        body: { pin_code: fullPin, email },
      });

      if (error) throw error;

      setResult(data);

      if (data.success) {
        toast.success('PIN activated successfully!');
      } else {
        toast.error(data.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to redeem PIN');
      setResult({
        success: false,
        message: (err instanceof Error && err.message) || 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fullPin = pinParts.join('-');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary/20">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Jamb Crash AI</h1>
          <p className="text-muted-foreground mt-1">Activate your access with a PIN</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Enter Activation PIN
            </CardTitle>
            <CardDescription>
              Enter the PIN you received from your school or reseller
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* PIN Input */}
            <div>
              <label className="text-sm font-medium mb-3 block">PIN Code</label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {pinParts.map((part, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      id={`pin-${i}`}
                      value={part}
                      onChange={(e) => handlePinInput(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="w-16 text-center font-mono text-lg font-bold tracking-wider"
                      maxLength={i < 2 ? 3 : 4}
                      placeholder={i < 2 ? 'XXX' : 'XXXX'}
                    />
                    {i < 3 && <span className="text-muted-foreground font-bold">-</span>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Format: JCA-XXXX-XXXX-XXXX (ACE) or JCS-XXXX-XXXX-XXXX (SCHOLAR)
              </p>
            </div>

            {/* Email Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Your Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This email will be used to access your account
              </p>
            </div>

            {/* Redeem Button */}
            <Button
              onClick={handleRedeem}
              className="w-full"
              size="lg"
              disabled={loading || fullPin.length < 15}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Activate PIN
            </Button>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-xl ${
                    result.success
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-destructive/10 border border-destructive/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${result.success ? 'text-green-700 dark:text-green-400' : 'text-destructive'}`}>
                        {result.message}
                      </p>
                      {result.success && result.plan_type && (
                        <div className="mt-2 space-y-1 text-sm text-green-600 dark:text-green-400">
                          <p>Plan: <span className="font-semibold capitalize">{result.plan_type}</span></p>
                          <p>Valid until: <span className="font-semibold">
                            {new Date(result.access_expires_at!).toLocaleDateString('en-NG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span></p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Help */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Don't have a PIN? Contact your school or reseller.</p>
          <p className="mt-1">
            <a href="/" className="text-primary hover:underline">← Back to Home</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PinRedeemPage;
