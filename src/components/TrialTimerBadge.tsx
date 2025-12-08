import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

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
          : 'bg-card border border-border text-foreground'
      }`}
    >
      <Clock className={`w-4 h-4 ${isLow ? 'animate-spin' : ''}`} />
      <span className="font-mono font-bold text-sm">
        {formattedTime}
      </span>
      <span className="text-xs opacity-75">
        free trial
      </span>
    </motion.div>
  );
};