import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { errorLogger } from '@/services/errorLogger';
import type { LessonProgress } from '@/types/lesson';

interface UseLessonProgressReturn {
  progress: LessonProgress | null;
  loading: boolean;
  markSectionViewed: (sectionId: string) => Promise<void>;
  submitPrediction: (sectionId: string, prediction: string, correct: boolean) => Promise<void>;
  submitPracticeAttempt: (questionIdx: number, answer: string, correct: boolean, hintsUsed: number) => Promise<void>;
  calculateMastery: (requiredSections: string[], minScore: number) => number;
  refresh: () => Promise<void>;
}

export function useLessonProgress(
  lessonId: string | null,
  userEmail: string | null
): UseLessonProgressReturn {
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!lessonId || !userEmail) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('email', userEmail)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create new progress record
        const { data: newData, error: insertError } = await supabase
          .from('lesson_progress')
          .insert({
            lesson_id: lessonId,
            email: userEmail,
            sections_viewed: [],
            predictions: [],
            practice_attempts: [],
            practice_score: 0,
            mastery_level: 'not_started',
            mastery_score: 0,
            time_spent_seconds: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setProgress(newData as LessonProgress);
      } else {
        setProgress(data as LessonProgress);
      }
    } catch (err) {
      errorLogger.error(err, { component: 'useLessonProgress', action: 'fetch lesson progress' });
    } finally {
      setLoading(false);
    }
  }, [lessonId, userEmail]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const markSectionViewed = useCallback(async (sectionId: string) => {
    if (!progress || !userEmail) return;

    const viewed = progress.sections_viewed || [];
    if (viewed.includes(sectionId)) return;

    const updated = [...viewed, sectionId];

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .update({
          sections_viewed: updated,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', progress.id);

      if (error) throw error;
      setProgress((prev) => prev ? { ...prev, sections_viewed: updated } : prev);
    } catch (err) {
      errorLogger.error(err, { component: 'useLessonProgress', action: 'mark section viewed' });
    }
  }, [progress, userEmail]);

  const submitPrediction = useCallback(async (
    sectionId: string,
    prediction: string,
    correct: boolean
  ) => {
    if (!progress) return;

    const predictions = [
      ...(progress.predictions || []),
      {
        section_id: sectionId,
        predicted_answer: prediction,
        correct,
        timestamp: new Date().toISOString(),
      },
    ];

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .update({ predictions })
        .eq('id', progress.id);

      if (error) throw error;
      setProgress((prev) => prev ? { ...prev, predictions } : prev);
    } catch (err) {
      errorLogger.error(err, { component: 'useLessonProgress', action: 'submit prediction' });
    }
  }, [progress]);

  const submitPracticeAttempt = useCallback(async (
    questionIdx: number,
    answer: string,
    correct: boolean,
    hintsUsed: number
  ) => {
    if (!progress) return;

    const attempts = [
      ...(progress.practice_attempts || []),
      {
        question_idx: questionIdx,
        answer,
        correct,
        hints_used: hintsUsed,
      },
    ];

    // Calculate practice score
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.correct).length;
    const practiceScore = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .update({
          practice_attempts: attempts,
          practice_score: practiceScore,
        })
        .eq('id', progress.id);

      if (error) throw error;
      setProgress((prev) => prev ? {
        ...prev,
        practice_attempts: attempts,
        practice_score: practiceScore,
      } : prev);
    } catch (err) {
      errorLogger.error(err, { component: 'useLessonProgress', action: 'submit practice attempt' });
    }
  }, [progress]);

  const calculateMastery = useCallback((
    requiredSections: string[],
    _minScore: number
  ): number => {
    if (!progress) return 0;

    // Section completion: 40% weight
    const viewed = progress.sections_viewed || [];
    const sectionsComplete = requiredSections.filter((id) => viewed.includes(id)).length;
    const sectionRatio = requiredSections.length > 0 ? sectionsComplete / requiredSections.length : 0;
    const sectionScore = sectionRatio * 40;

    // Practice performance: 60% weight
    const practiceScore = (progress.practice_score || 0) * 0.6;

    return Math.round(sectionScore + practiceScore);
  }, [progress]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    markSectionViewed,
    submitPrediction,
    submitPracticeAttempt,
    calculateMastery,
    refresh,
  };
}
