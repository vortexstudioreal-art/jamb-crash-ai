import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Bell, CheckCircle, AlertTriangle, ExternalLink, HelpCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface WhatsAppReminderProps {
  userEmail: string;
  isAdmin?: boolean;
  onSetupComplete?: (phoneNumber: string) => void;
}

const SETTINGS_STORAGE_KEY = 'jamb_user_settings';
// Sandbox config fetched from edge function at runtime
const WHATSAPP_SETUP_URL = 'https://wa.me';

export const WhatsAppReminder = ({ userEmail, isAdmin = false, onSetupComplete }: WhatsAppReminderProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [savedNumber, setSavedNumber] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Check if already setup
  useEffect(() => {
    const checkExisting = async () => {
      // Check localStorage first
      const settingsKey = `${SETTINGS_STORAGE_KEY}_${userEmail}`;
      const stored = localStorage.getItem(settingsKey);
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.whatsappEnabled && settings.whatsappNumber) {
          setIsSetup(true);
          setSavedNumber(settings.whatsappNumber);
          return;
        }
      }

      // Check database
      try {
        const { data } = await supabase
          .from('whatsapp_reminders')
          .select('phone_number, is_active')
          .eq('email', userEmail)
          .maybeSingle();
        
        if (data?.is_active) {
          setIsSetup(true);
          setSavedNumber(data.phone_number);
          setPhoneNumber(data.phone_number.replace('+234', ''));
        }
      } catch (err) {
        console.error('Error checking WhatsApp setup:', err);
      }
    };
    
    if (userEmail) checkExisting();
  }, [userEmail]);

  const handleSetup = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);
    const fullNumber = phoneNumber.startsWith('+') ? phoneNumber : `+234${phoneNumber}`;
    
    try {
      // Save to localStorage first (works for all users)
      const settingsKey = `${SETTINGS_STORAGE_KEY}_${userEmail}`;
      const existingSettings = localStorage.getItem(settingsKey);
      const settings = existingSettings ? JSON.parse(existingSettings) : {};
      localStorage.setItem(settingsKey, JSON.stringify({
        ...settings,
        whatsappNumber: fullNumber,
        whatsappEnabled: true
      }));

      // Save to database
      const { data: existing } = await supabase
        .from('whatsapp_reminders')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle();

      let error;
      if (existing) {
        const result = await supabase
          .from('whatsapp_reminders')
          .update({
            phone_number: fullNumber,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', userEmail);
        error = result.error;
      } else {
        const result = await supabase
          .from('whatsapp_reminders')
          .insert({
            email: userEmail,
            phone_number: fullNumber,
            is_active: true,
          });
        error = result.error;
      }

      if (error) throw error;

      setIsSetup(true);
      setSavedNumber(fullNumber);
      onSetupComplete?.(fullNumber);
      toast.success('WhatsApp reminders activated! 🎉');
    } catch (err) {
      console.error('Error setting up WhatsApp:', err);
      // Still mark as setup since localStorage worked
      setIsSetup(true);
      setSavedNumber(fullNumber);
      toast.success('WhatsApp reminders saved locally! 🎉');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSetup) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-elevated p-6 text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-green-500" />
        </motion.div>
        <h3 className="text-lg font-semibold text-foreground mb-2">✅ Reminders Active!</h3>
        <p className="text-muted-foreground text-sm mb-3">
          You'll receive personalized practice questions every morning at 6 AM
        </p>
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <p className="text-sm text-green-600 font-medium">
            📱 WhatsApp: {savedNumber}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            First reminder coming tomorrow! 🎯
          </p>
        </div>

        {/* Send Test Message button */}
        <Button
          variant="outline"
          size="sm"
          className="mt-3 gap-2"
          disabled={isSendingTest}
          onClick={async () => {
            setIsSendingTest(true);
            try {
              const { data, error } = await supabase.functions.invoke('send-whatsapp-reminder', {
                body: { phone_number: savedNumber, email: userEmail }
              });
              if (error) throw error;
              toast.success('Test message sent! Check your WhatsApp 📱');
            } catch (err) {
              toast.error('Failed to send test. Make sure you\'ve joined the sandbox first.');
            } finally {
              setIsSendingTest(false);
            }
          }}
        >
          <Send className="w-3.5 h-3.5" />
          {isSendingTest ? 'Sending...' : 'Send Test Message'}
        </Button>
        
        {/* Important activation notice - always visible */}
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-left">
          <div className="flex gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-amber-600">⚠️ Must Activate First!</p>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Send <strong className="text-foreground">"{SANDBOX_JOIN_MESSAGE}"</strong> to <strong className="text-foreground">{SANDBOX_NUMBER}</strong> on WhatsApp. You must re-do this every 72 hours.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 w-full"
            asChild
          >
            <a 
              href={`https://wa.me/14155238886?text=${encodeURIComponent(SANDBOX_JOIN_MESSAGE)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-3 h-3" />
              Open WhatsApp to Activate
            </a>
          </Button>
        </div>

        {/* Collapsible extra help */}
        <Collapsible open={showHelp} onOpenChange={setShowHelp} className="mt-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <HelpCircle className="w-4 h-4" />
              Not receiving messages?
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-left">
              <div className="flex gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-amber-600">One-time Activation Required</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                You need to activate WhatsApp once by sending a message:
              </p>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Open WhatsApp and send <strong className="text-foreground">"{SANDBOX_JOIN_MESSAGE}"</strong> to <strong className="text-foreground">{SANDBOX_NUMBER}</strong></li>
                <li>Wait for confirmation reply</li>
                <li>Done! You'll now receive daily reminders</li>
              </ol>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 gap-2 w-full"
                asChild
              >
                <a 
                  href={`https://wa.me/14155238886?text=${encodeURIComponent(SANDBOX_JOIN_MESSAGE)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open WhatsApp to Activate
                </a>
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Daily WhatsApp Reminders</h3>
          <p className="text-sm text-muted-foreground">Get personalized questions from YOUR subjects every morning</p>
        </div>
      </div>

      {/* Setup steps info */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border mb-4">
        <p className="text-xs font-medium text-foreground mb-2">📋 How it works:</p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Enter your WhatsApp number below</li>
          <li>After setup, send <strong className="text-foreground">"{SANDBOX_JOIN_MESSAGE}"</strong> to <strong className="text-foreground">{SANDBOX_NUMBER}</strong> on WhatsApp</li>
          <li>Receive personalized JAMB questions daily at 6 AM! 🎉</li>
        </ol>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone" className="text-foreground">WhatsApp Number</Label>
          <div className="flex gap-2 mt-1">
            <div className="flex items-center px-3 bg-muted rounded-l-md border border-r-0 border-input">
              <span className="text-sm text-muted-foreground">+234</span>
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="8012345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              className="rounded-l-none"
            />
          </div>
        </div>

        <Button
          onClick={handleSetup}
          disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Bell className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Setting up...' : 'Activate Daily Reminders'}
        </Button>
      </div>
    </motion.div>
  );
};
