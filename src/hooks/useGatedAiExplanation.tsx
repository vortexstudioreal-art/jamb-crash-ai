import { useCallback, useRef, useState } from 'react';
import { FeatureLimitReached } from '@/components/FeatureLimitReached';
import {
  useAiExplanation,
  isExplanationCached,
  type UseAiExplanationProps,
} from '@/hooks/useAiExplanation';
import { useFeatureUsage } from '@/hooks/useFeatureUsage';

/**
 * AI explanations that respect the shared daily Groq quota.
 *
 * - Device-cached explanations are always free (never touch quota).
 * - Fresh calls require a remaining `syllabus_ai_explanation` use
 *   (5/day free, unlimited paid, +bonus via watch-ad).
 * - Only successful fresh calls increment usage — failures and cache
 *   hits cost the user nothing.
 * - When capped, `limitModal` renders the watch-ad / upgrade path and
 *   auto-retries the pending question after a bonus is earned.
 */
export const useGatedAiExplanation = (onUpgrade?: (plan: string) => void) => {
  const ai = useAiExplanation();
  const { canUseFeature, incrementUsage, getRemainingUses } = useFeatureUsage();
  const [limitOpen, setLimitOpen] = useState(false);
  const pendingRef = useRef<UseAiExplanationProps | null>(null);

  const explain = useCallback(
    async (q: UseAiExplanationProps) => {
      if (!isExplanationCached(q.id) && !canUseFeature('syllabus_ai_explanation')) {
        pendingRef.current = q;
        setLimitOpen(true);
        return;
      }
      const outcome = await ai.getExplanation(q);
      if (outcome === 'fresh') {
        await incrementUsage('syllabus_ai_explanation');
      }
    },
    // getExplanation is a stable useCallback; the lint rule can't see that
    // through the hook boundary, so depend on the stable pieces instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canUseFeature, incrementUsage]
  );

  const handleBonusEarned = useCallback(() => {
    setLimitOpen(false);
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) void explain(pending);
  }, [explain]);

  const limitModal = limitOpen ? (
    <FeatureLimitReached
      featureType="syllabus_ai_explanation"
      onBonusEarned={handleBonusEarned}
      onUpgrade={onUpgrade}
    />
  ) : null;

  return {
    explanation: ai.explanation,
    isLoading: ai.isLoading,
    error: ai.error,
    cancel: ai.cancel,
    explain,
    limitModal,
    closeLimit: () => setLimitOpen(false),
    remaining: getRemainingUses('syllabus_ai_explanation'),
  };
};
