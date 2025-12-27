import { useFeatureUsage, FeatureType, FEATURE_NAMES } from '@/hooks/useFeatureUsage';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialSystem } from '@/hooks/useTrialSystem';
import { Progress } from '@/components/ui/progress';
import { FileText, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface UsageItemProps {
  feature: FeatureType;
  icon: React.ReactNode;
  colorClass: string;
}

const UsageItem = ({ feature, icon, colorClass }: UsageItemProps) => {
  const { getUsageSummary } = useFeatureUsage();
  const summary = getUsageSummary(feature);
  
  // Don't show for unlimited users
  if (summary.limit === -1) return null;
  
  const totalLimit = summary.limit + summary.bonus;
  const progressValue = totalLimit > 0 ? (summary.used / totalLimit) * 100 : 0;
  const isLow = summary.remaining <= 1 && summary.remaining > 0;
  const isEmpty = summary.remaining === 0;
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-foreground truncate">
            {FEATURE_NAMES[feature]}
          </span>
          <span className={`text-xs font-bold ${isEmpty ? 'text-destructive' : isLow ? 'text-yellow-500' : 'text-muted-foreground'}`}>
            {summary.remaining}/{totalLimit}
          </span>
        </div>
        <Progress 
          value={progressValue} 
          className="h-1.5"
        />
        {summary.bonus > 0 && (
          <span className="text-[10px] text-primary mt-0.5 block">
            +{summary.bonus} bonus
          </span>
        )}
      </div>
    </div>
  );
};

export const UsageLimitIndicator = () => {
  const { userPackage, isAdmin, isOwner, hasAccess, user } = useAuth();
  const { isLoading } = useFeatureUsage();
  
  // Check trial status using database-backed trial system
  const { isTrialActive } = useTrialSystem({
    userEmail: user?.email || null,
    isAdmin: isAdmin || isOwner,
    hasAccess,
  });
  
  // Don't show for Pro/Premium/Admin/Trial users (they have unlimited)
  if (isAdmin || isOwner || userPackage === 'pro' || userPackage === 'premium' || isTrialActive) {
    return null;
  }
  
  if (isLoading) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">Daily Limits</h3>
        <span className="text-xs text-muted-foreground">Resets at midnight</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <UsageItem 
          feature="pdf_upload" 
          icon={<FileText className="w-4 h-4 text-blue-500" />}
          colorClass="bg-blue-500/10"
        />
        <UsageItem 
          feature="flashcard_generation" 
          icon={<Layers className="w-4 h-4 text-orange-500" />}
          colorClass="bg-orange-500/10"
        />
      </div>
    </motion.div>
  );
};
