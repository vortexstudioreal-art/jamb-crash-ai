import { motion } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';

interface TrialTimerBadgeProps {
  formattedTime: string;
  isLow?: boolean;
}

export const TrialTimerBadge = ({ formattedTime, isLow = false }: TrialTimerBadgeProps) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`fixed bottom-4 left-4 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 ${
        isLow 
          ? 'bg-red-500 text-white animate-pulse' 
          : 'bg-primary/90 text-primary-foreground border border-primary'
      }`}
    >
      {isLow ? (
        <Clock className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      <span className="font-mono font-bold text-sm">
        {formattedTime}
      </span>
      <span className="text-xs opacity-90 font-medium">
        ACE Trial 🔥
      </span>
    </motion.div>
  );
};