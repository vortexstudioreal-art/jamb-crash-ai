import { useMemo } from 'react';

interface QuizAttempt {
  id: string;
  subjects: string[];
  total_questions: number;
  correct_answers: number;
  created_at: string;
  questions_data?: Array<{
    subject?: string;
    userAnswer?: string;
    correct_answer?: string;
    isCorrect?: boolean;
  }>;
}

interface PredictionResult {
  minScore: number;
  maxScore: number;
  baseScore: number;
  confidence: 'low' | 'medium' | 'high';
  confidenceValue: number;
  consistencyScore: number;
  subjectBalanceScore: number;
  performanceScore: number;
  totalQuestions: number;
  accuracyOverall: number;
  accuracyLast100: number;
  accuracyBySubject: Record<string, { correct: number; total: number; percentage: number }>;
  shouldUpdate: boolean;
  message: string;
}

const QUESTIONS_PER_UPDATE = 25;
const MAX_QUESTIONS_FOR_CONFIDENCE = 600;

export const useJambScorePredictor = (quizzes: QuizAttempt[]): PredictionResult => {
  return useMemo(() => {
    // Calculate total questions answered
    const totalQuestions = quizzes.reduce((sum, q) => sum + q.total_questions, 0);
    const totalCorrect = quizzes.reduce((sum, q) => sum + q.correct_answers, 0);
    
    // Overall accuracy
    const accuracyOverall = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
    
    // Last 100 questions accuracy
    let last100Correct = 0;
    let last100Total = 0;
    const sortedQuizzes = [...quizzes].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    for (const quiz of sortedQuizzes) {
      if (last100Total >= 100) break;
      const remaining = 100 - last100Total;
      const questionsToCount = Math.min(quiz.total_questions, remaining);
      const ratio = questionsToCount / quiz.total_questions;
      last100Correct += Math.round(quiz.correct_answers * ratio);
      last100Total += questionsToCount;
    }
    
    const accuracyLast100 = last100Total > 0 ? last100Correct / last100Total : accuracyOverall;
    
    // Calculate accuracy by subject
    const subjectStats: Record<string, { correct: number; total: number }> = {};
    
    for (const quiz of quizzes) {
      // If we have questions_data, use it for accurate per-question tracking
      if (quiz.questions_data && Array.isArray(quiz.questions_data)) {
        for (const q of quiz.questions_data) {
          const subject = q.subject || quiz.subjects[0];
          if (!subjectStats[subject]) {
            subjectStats[subject] = { correct: 0, total: 0 };
          }
          subjectStats[subject].total += 1;
          // Check both isCorrect flag and userAnswer vs correct_answer comparison
          const isCorrect = q.isCorrect === true || 
            (q.userAnswer && q.correct_answer && (q.userAnswer || '').toUpperCase() === (q.correct_answer || '').toUpperCase());
          if (isCorrect) {
            subjectStats[subject].correct += 1;
          }
        }
      } else {
        // Fallback: distribute evenly across subjects
        const questionsPerSubject = Math.floor(quiz.total_questions / quiz.subjects.length);
        const correctPerSubject = Math.floor(quiz.correct_answers / quiz.subjects.length);
        
        for (const subject of quiz.subjects) {
          if (!subjectStats[subject]) {
            subjectStats[subject] = { correct: 0, total: 0 };
          }
          subjectStats[subject].total += questionsPerSubject;
          subjectStats[subject].correct += correctPerSubject;
        }
      }
    }
    
    const accuracyBySubject: Record<string, { correct: number; total: number; percentage: number }> = {};
    for (const [subject, stats] of Object.entries(subjectStats)) {
      accuracyBySubject[subject] = {
        ...stats,
        percentage: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
      };
    }
    
    // 1. CONFIDENCE SCORE (controls prediction width)
    // 60 questions → 0.1, 300 questions → 0.5, 600+ questions → 1.0
    const confidenceValue = Math.min(totalQuestions / MAX_QUESTIONS_FOR_CONFIDENCE, 1);
    const confidence: 'low' | 'medium' | 'high' = 
      confidenceValue < 0.35 ? 'low' : 
      confidenceValue < 0.7 ? 'medium' : 'high';
    
    // 2. CONSISTENCY SCORE (penalizes wild swings)
    // Range: 0.4 – 1.0
    const rawConsistency = 1 - Math.abs(accuracyLast100 - accuracyOverall);
    const consistencyScore = Math.max(0.4, Math.min(1, rawConsistency));
    
    // 3. SUBJECT BALANCE SCORE
    // JAMB = 4 subjects, if one is trash, score should suffer
    const subjectScores = Object.values(accuracyBySubject).map(s => s.percentage / 100);
    const avgSubjectScore = subjectScores.length > 0 
      ? subjectScores.reduce((a, b) => a + b, 0) / subjectScores.length 
      : accuracyOverall;
    const maxSubjectScore = subjectScores.length > 0 ? Math.max(...subjectScores) : 1;
    const subjectBalanceScore = maxSubjectScore > 0 
      ? Math.max(0.5, Math.min(1, avgSubjectScore / maxSubjectScore))
      : 0.5;
    
    // 4. WEIGHTED PERFORMANCE SCORE (CORE LOGIC)
    // This replaces simple "70% = 280" calculation
    const performanceScore = 
      (0.45 * accuracyLast100) +
      (0.25 * accuracyOverall) +
      (0.20 * consistencyScore) +
      (0.10 * subjectBalanceScore);
    
    // 5. BASE JAMB SCORE (out of 400)
    const baseScore = Math.round(performanceScore * 400);
    
    // 6. SCORE RANGE (wider for low confidence)
    // Early users = wide range, Serious users = tight range
    const rangeWidth = (1 - confidenceValue) * 120;
    const minScore = Math.max(160, Math.round(baseScore - rangeWidth));
    const maxScore = Math.min(350, Math.round(baseScore + rangeWidth));
    
    // 7. Should update? Only after every 25-30 questions
    const lastUpdateThreshold = Math.floor(totalQuestions / QUESTIONS_PER_UPDATE) * QUESTIONS_PER_UPDATE;
    const shouldUpdate = totalQuestions >= QUESTIONS_PER_UPDATE && 
      (totalQuestions % QUESTIONS_PER_UPDATE < 5 || totalQuestions === lastUpdateThreshold);
    
    // 8. Generate message based on confidence
    let message = '';
    if (totalQuestions < 30) {
      message = 'Take more quizzes for accurate prediction';
    } else if (confidence === 'low') {
      message = 'Prediction improves as you practice more';
    } else if (confidence === 'medium') {
      message = 'Based on your recent performance';
    } else {
      message = 'High confidence prediction';
    }
    
    return {
      minScore,
      maxScore,
      baseScore,
      confidence,
      confidenceValue,
      consistencyScore,
      subjectBalanceScore,
      performanceScore,
      totalQuestions,
      accuracyOverall,
      accuracyLast100,
      accuracyBySubject,
      shouldUpdate,
      message
    };
  }, [quizzes]);
};
