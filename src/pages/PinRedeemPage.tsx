import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, CheckCircle, AlertCircle, Loader2, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PinRedeemPage = () => {
  const [pinCode, setPinCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    plan_type?: string;
    access_expires_at?: string;
  } | null>(null);

  const handlePinChange = (value: string) => {
    // B2B PINs are 4-segment (JCA-XXXX-XXXX-XXXX / JCS-XXXX-XXXX-XXXX);
    // legacy 3-segment codes are still accepted. Normalize to uppercase,
    // stripping spaces so pasted values work.
    const cleaned = value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    setPinCode(cleaned);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    setPinCode(pasted);
  };

  // Accepts 4-segment B2B PINs (XXX-XXXX-XXXX-XXXX) and legacy
  // 3-segment codes (XXX-XXXX-XXXX), with or without hyphens.
  const normalizePin = (raw: string): string | null => {
    const alnum = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (/^[A-Z]{3}[A-Z0-9]{12}$/.test(alnum)) {
      return `${alnum.substring(0, 3)}-${alnum.substring(3, 7)}-${alnum.substring(7, 11)}-${alnum.substring(11, 15)}`;
    }
    if (/^[A-Z]{3}[A-Z0-9]{8}$/.test(alnum)) {
      return `${alnum.substring(0, 3)}-${alnum.substring(3, 7)}-${alnum.substring(7, 11)}`;
    }
    return null;
  };

  const isPinValid = normalizePin(pinCode) !== null;

  const handleRedeem = async () => {
    const normalizedPin = normalizePin(pinCode);

    if (!normalizedPin) {
      toast.error('Invalid PIN format. Expected: JCA-XXXX-XXXX-XXXX');
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
        body: { pin_code: normalizedPin, email },
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
              <Input
                value={pinCode}
                onChange={(e) => handlePinChange(e.target.value)}
                onPaste={handlePaste}
                className="w-full text-center font-mono text-lg font-bold tracking-wider"
                placeholder="JCB-XXXX-XXXX"
                maxLength={14}
              />
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
              disabled={loading || !isPinValid || !email.includes('@')}
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
