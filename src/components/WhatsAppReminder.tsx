import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Bell, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WhatsAppReminderProps {
  userEmail: string;
}

export const WhatsAppReminder = ({ userEmail }: WhatsAppReminderProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetup, setIsSetup] = useState(false);

  const handleSetup = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('whatsapp_reminders')
        .upsert({
          email: userEmail,
          phone_number: phoneNumber.startsWith('+') ? phoneNumber : `+234${phoneNumber}`,
          is_active: true,
        }, { onConflict: 'email' });

      if (error) throw error;

      setIsSetup(true);
      toast.success('WhatsApp reminders activated!');
    } catch (err) {
      console.error('Error setting up WhatsApp:', err);
      toast.error('Failed to setup reminders');
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
          You'll receive your timetable + 3 practice questions every morning at 6 AM
        </p>
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <p className="text-sm text-green-600 font-medium">
            📱 WhatsApp: +234{phoneNumber}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            First reminder coming tomorrow! 🎯
          </p>
        </div>
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
          <p className="text-sm text-muted-foreground">Get your timetable + 3 questions every morning</p>
        </div>
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
