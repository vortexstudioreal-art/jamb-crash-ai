import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrialTimerProps {
  formattedTime: string;
  timeRemaining: number;
}

export const TrialTimer = ({ formattedTime, timeRemaining }: TrialTimerProps) => {
  const isLowTime = timeRemaining < 5 * 60 * 1000; // Less than 5 minutes
  const isCritical = timeRemaining < 2 * 60 * 1000; // Less than 2 minutes

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
        isCritical 
          ? 'bg-red-500/20 border border-red-500/50' 
          : isLowTime 
            ? 'bg-yellow-500/20 border border-yellow-500/50'
            : 'bg-primary/20 border border-primary/50'
      }`}
    >
      <div className="flex items-center gap-1">
        <Crown className="w-4 h-4 text-yellow-500" />
        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
          TRIAL
        </Badge>
      </div>
      
      <div className="flex items-center gap-1">
        {isCritical && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </motion.div>
        )}
        <Clock className={`w-4 h-4 ${
          isCritical ? 'text-red-500' : isLowTime ? 'text-yellow-500' : 'text-primary'
        }`} />
        <span className={`font-mono font-bold text-sm ${
          isCritical ? 'text-red-500' : isLowTime ? 'text-yellow-500' : 'text-primary'
        }`}>
          {formattedTime}
        </span>
      </div>
    </motion.div>
  );
};
