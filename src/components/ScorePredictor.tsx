import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, Brain, BarChart3, BookOpen, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface QuizAttempt {
  id: string;
  subjects: string[];
  correct_answers: number;
  total_questions: number;
  time_taken_seconds: number;
  created_at: string;
  questions_data?: any;
}

interface ReadingProgress {
  subject: string;
  progress_percent: number;
  mastery_level: string;
}

interface FlashcardData {
  subject: string;
  times_correct: number;
  times_reviewed: number;
  mastery_level: string;
}

interface StudySession {
  subject: string;
  time_spent_seconds: number;
  created_at: string;
}

interface ScorePredictorProps {
  userEmail: string;
  targetScore?: number;
  weakSubject?: string;
  onShowResultCard: (min: number, max: number) => void;
}

export const ScorePredictor = ({ userEmail, targetScore = 300, weakSubject, onShowResultCard }: ScorePredictorProps) => {
  const [predictedMin, setPredictedMin] = useState<number | null>(null);
  const [predictedMax, setPredictedMax] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quizData, setQuizData] = useState<QuizAttempt[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [flashcardData, setFlashcardData] = useState<FlashcardData[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [analysisDetails, setAnalysisDetails] = useState<{
    avgScore: number;
    totalQuizzes: number;
    strongSubjects: string[];
    weakSubjects: string[];
    consistency: number;
    recentTrend: 'improving' | 'stable' | 'declining';
    totalStudyTime: number;
    readingCompletion: number;
    flashcardMastery: number;
  } | null>(null);

  // Load all study data
  useEffect(() => {
    const loadAllData = async () => {
      // Load quiz data
      const { data: quizzes } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (quizzes) {
        setQuizData(quizzes as QuizAttempt[]);
      }

      // Load reading progress
      const { data: reading } = await supabase
        .from('reading_progress')
        .select('subject, progress_percent, mastery_level')
        .eq('email', userEmail);
      
      if (reading) {
        setReadingProgress(reading as ReadingProgress[]);
      }

      // Load flashcard data
      const { data: flashcards } = await supabase
        .from('flashcards')
        .select('subject, times_correct, times_reviewed, mastery_level')
        .eq('email', userEmail);
      
      if (flashcards) {
        setFlashcardData(flashcards as FlashcardData[]);
      }

      // Load study sessions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: sessions } = await supabase
        .from('reading_sessions')
        .select('subject, time_spent_seconds, created_at')
        .eq('email', userEmail)
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      if (sessions) {
        setStudySessions(sessions as StudySession[]);
      }
    };
    loadAllData();
  }, [userEmail]);

  const calculatePrediction = async () => {
    setIsCalculating(true);
    
    // Simulate analysis with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setProgress(i);
    }

    // Calculate total study time
    const totalStudyTime = studySessions.reduce((sum, s) => sum + s.time_spent_seconds, 0);
    const totalStudyHours = Math.round(totalStudyTime / 3600);

    // Calculate reading completion average
    const readingCompletion = readingProgress.length > 0
      ? Math.round(readingProgress.reduce((sum, r) => sum + (r.progress_percent || 0), 0) / readingProgress.length)
      : 0;

    // Calculate flashcard mastery
    const flashcardMastery = flashcardData.length > 0
      ? Math.round((flashcardData.filter(f => f.mastery_level === 'mastered' || f.mastery_level === 'learning').length / flashcardData.length) * 100)
      : 0;

    // REAL DATA-BASED PREDICTION
    if (quizData.length === 0 && readingProgress.length === 0 && flashcardData.length === 0) {
      // No data - provide baseline prediction based on target
      const baseVariance = 30;
      const min = Math.max(180, targetScore - baseVariance - 20);
      const max = Math.min(400, targetScore + baseVariance);
      setPredictedMin(min);
      setPredictedMax(max);
      setAnalysisDetails({
        avgScore: 0,
        totalQuizzes: 0,
        strongSubjects: [],
        weakSubjects: weakSubject ? [weakSubject] : [],
        consistency: 0,
        recentTrend: 'stable',
        totalStudyTime: totalStudyHours,
        readingCompletion,
        flashcardMastery
      });
      setIsCalculating(false);
      return;
    }

    // Calculate real metrics from quiz history
    const totalQuizzes = quizData.length;
    const scores = quizData.map(q => (q.correct_answers / q.total_questions) * 100);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    // Calculate subject-wise performance from quizzes
    const subjectScores: Record<string, { correct: number; total: number; readingPct: number; flashcardRate: number }> = {};
    
    quizData.forEach(attempt => {
      const subjects = attempt.subjects as string[];
      const scorePerSubject = attempt.correct_answers / subjects.length;
      const totalPerSubject = attempt.total_questions / subjects.length;
      subjects.forEach(s => {
        if (!subjectScores[s]) subjectScores[s] = { correct: 0, total: 0, readingPct: 0, flashcardRate: 0 };
        subjectScores[s].correct += scorePerSubject;
        subjectScores[s].total += totalPerSubject;
      });
    });

    // Enhance with reading progress data
    readingProgress.forEach(rp => {
      const subject = rp.subject.toLowerCase();
      if (subjectScores[subject]) {
        subjectScores[subject].readingPct = rp.progress_percent || 0;
      } else {
        subjectScores[subject] = { correct: 0, total: 0, readingPct: rp.progress_percent || 0, flashcardRate: 0 };
      }
    });

    // Enhance with flashcard mastery data
    const flashcardBySubject: Record<string, { correct: number; reviewed: number }> = {};
    flashcardData.forEach(fc => {
      const subject = fc.subject.toLowerCase();
      if (!flashcardBySubject[subject]) flashcardBySubject[subject] = { correct: 0, reviewed: 0 };
      flashcardBySubject[subject].correct += fc.times_correct || 0;
      flashcardBySubject[subject].reviewed += fc.times_reviewed || 0;
    });

    Object.entries(flashcardBySubject).forEach(([subject, data]) => {
      const rate = data.reviewed > 0 ? (data.correct / data.reviewed) * 100 : 0;
      if (subjectScores[subject]) {
        subjectScores[subject].flashcardRate = rate;
      } else {
        subjectScores[subject] = { correct: 0, total: 0, readingPct: 0, flashcardRate: rate };
      }
    });

    // Calculate composite subject scores (weighted: quiz 50%, reading 25%, flashcards 25%)
    const subjectRates = Object.entries(subjectScores).map(([subject, data]) => {
      const quizRate = data.total > 0 ? (data.correct / data.total) * 100 : 50;
      const compositeRate = (quizRate * 0.5) + (data.readingPct * 0.25) + (data.flashcardRate * 0.25);
      return { subject, rate: compositeRate, quizRate };
    }).sort((a, b) => b.rate - a.rate);

    const strongSubjects = subjectRates.filter(s => s.rate >= 65).map(s => s.subject);
    const weakSubjects = subjectRates.filter(s => s.rate < 45).map(s => s.subject);

    // Calculate consistency (standard deviation)
    const mean = avgScore || 50;
    const squaredDiffs = scores.length > 0 ? scores.map(score => Math.pow(score - mean, 2)) : [0];
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / Math.max(1, squaredDiffs.length);
    const stdDev = Math.sqrt(avgSquaredDiff);
    const consistency = Math.max(0, 100 - stdDev * 2);

    // Calculate recent trend (last 5 vs previous 5)
    let recentTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (quizData.length >= 4) {
      const recent = quizData.slice(0, Math.min(5, quizData.length));
      const older = quizData.slice(Math.min(5, quizData.length), Math.min(10, quizData.length));
      
      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, q) => sum + (q.correct_answers / q.total_questions) * 100, 0) / recent.length;
        const olderAvg = older.reduce((sum, q) => sum + (q.correct_answers / q.total_questions) * 100, 0) / older.length;
        
        if (recentAvg > olderAvg + 5) recentTrend = 'improving';
        else if (recentAvg < olderAvg - 5) recentTrend = 'declining';
      }
    }

    // CALCULATE JAMB SCORE PREDICTION (enhanced algorithm)
    // Base score from quiz performance
    const baseJambScore = avgScore > 0 ? (avgScore / 100) * 400 : 200;
    
    let adjustedScore = baseJambScore;
    
    // Consistency bonus/penalty (-15 to +15)
    adjustedScore += ((consistency - 50) / 50) * 15;
    
    // Trend bonus/penalty
    if (recentTrend === 'improving') adjustedScore += 20;
    else if (recentTrend === 'declining') adjustedScore -= 12;
    
    // Study dedication bonus (up to +25 for 50+ hours)
    const studyBonus = Math.min(25, totalStudyHours * 0.5);
    adjustedScore += studyBonus;
    
    // Reading completion bonus (up to +15)
    adjustedScore += (readingCompletion / 100) * 15;
    
    // Flashcard mastery bonus (up to +15)
    adjustedScore += (flashcardMastery / 100) * 15;
    
    // Weak subject penalty
    adjustedScore -= weakSubjects.length * 10;
    
    // Strong subject bonus
    adjustedScore += strongSubjects.length * 8;
    
    // Quiz volume confidence bonus (more quizzes = more accurate prediction)
    const volumeBonus = Math.min(10, totalQuizzes * 0.5);
    adjustedScore += volumeBonus;
    
    // Calculate range based on data quality
    const dataQuality = Math.min(100, (totalQuizzes * 5) + (readingProgress.length * 3) + (flashcardData.length * 0.5));
    const rangeSize = Math.max(10, 50 - (dataQuality * 0.35) - (consistency * 0.1));
    
    const min = Math.max(180, Math.round(adjustedScore - rangeSize));
    const max = Math.min(400, Math.round(adjustedScore + rangeSize));
    
    setPredictedMin(min);
    setPredictedMax(max);
    setAnalysisDetails({
      avgScore: Math.round(avgScore),
      totalQuizzes,
      strongSubjects,
      weakSubjects,
      consistency: Math.round(consistency),
      recentTrend,
      totalStudyTime: totalStudyHours,
      readingCompletion,
      flashcardMastery
    });

    // Save to database
    try {
      await supabase
        .from('user_progress')
        .upsert({
          email: userEmail,
          target_score: targetScore,
          weak_subject: weakSubjects[0] || weakSubject,
          predicted_score_min: min,
          predicted_score_max: max,
          plan_completed: true,
        }, { onConflict: 'email' });
    } catch (err) {
      console.error('Error saving prediction:', err);
    }

    setIsCalculating(false);
  };

  if (predictedMin && predictedMax && analysisDetails) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-elevated p-8 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">Your Predicted JAMB Score</h2>
        <p className="text-muted-foreground mb-6">Based on comprehensive study analysis</p>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-6 mb-6"
        >
          <span className="text-5xl font-bold text-primary">{predictedMin}</span>
          <span className="text-3xl text-muted-foreground mx-2">–</span>
          <span className="text-5xl font-bold text-primary">{predictedMax}</span>
        </motion.div>

        {/* Analysis Details - Enhanced Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-left">
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Quiz Score</p>
            <p className="text-sm font-bold text-foreground">{analysisDetails.avgScore}%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Consistency</p>
            <p className="text-sm font-bold text-foreground">{analysisDetails.consistency}%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Quizzes</p>
            <p className="text-sm font-bold text-foreground">{analysisDetails.totalQuizzes}</p>
          </div>
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-left">
          <div className="bg-blue-500/10 rounded-lg p-2 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-500" />
            <div>
              <p className="text-[10px] text-muted-foreground">Study Time</p>
              <p className="text-sm font-bold text-blue-600">{analysisDetails.totalStudyTime}h</p>
            </div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-2 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-purple-500" />
            <div>
              <p className="text-[10px] text-muted-foreground">Reading</p>
              <p className="text-sm font-bold text-purple-600">{analysisDetails.readingCompletion}%</p>
            </div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-2 flex items-center gap-1">
            <Zap className="w-3 h-3 text-orange-500" />
            <div>
              <p className="text-[10px] text-muted-foreground">Flashcards</p>
              <p className="text-sm font-bold text-orange-600">{analysisDetails.flashcardMastery}%</p>
            </div>
          </div>
        </div>

        {/* Trend indicator */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Recent Performance Trend</p>
          <p className={`text-lg font-bold ${
            analysisDetails.recentTrend === 'improving' ? 'text-green-500' :
            analysisDetails.recentTrend === 'declining' ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {analysisDetails.recentTrend === 'improving' ? '📈 Improving - Great momentum!' :
             analysisDetails.recentTrend === 'declining' ? '📉 Declining - Time to refocus!' : '➡️ Stable - Push for improvement!'}
          </p>
        </div>

        {/* Strong/Weak Subjects */}
        {(analysisDetails.strongSubjects.length > 0 || analysisDetails.weakSubjects.length > 0) && (
          <div className="mb-6 text-left">
            {analysisDetails.strongSubjects.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-green-500 font-medium">💪 Strong Subjects</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysisDetails.strongSubjects.slice(0, 4).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-green-500/20 text-green-600 rounded text-xs capitalize">
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {analysisDetails.weakSubjects.length > 0 && (
              <div>
                <p className="text-xs text-red-500 font-medium">⚠️ Focus Areas</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysisDetails.weakSubjects.slice(0, 4).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-red-500/20 text-red-600 rounded text-xs capitalize">
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={() => onShowResultCard(predictedMin, predictedMax)}
          className="gradient-primary text-primary-foreground"
        >
          Share Your Prediction
        </Button>
      </motion.div>
    );
  }

  // Calculate total data points available
  const totalDataPoints = quizData.length + readingProgress.length + flashcardData.length + studySessions.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">AI Score Predictor</h3>
          <p className="text-sm text-muted-foreground">Comprehensive study analysis</p>
        </div>
      </div>

      {isCalculating ? (
        <div className="space-y-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-center space-y-1">
            {progress >= 10 && <p className="text-muted-foreground">Analyzing {quizData.length} quiz attempts...</p>}
            {progress >= 30 && <p className="text-muted-foreground">Processing {readingProgress.length} reading topics...</p>}
            {progress >= 50 && <p className="text-muted-foreground">Evaluating {flashcardData.length} flashcard performances...</p>}
            {progress >= 70 && <p className="text-muted-foreground">Calculating study dedication...</p>}
            {progress >= 90 && <p className="text-muted-foreground">Generating prediction...</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Data summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{quizData.length} quizzes</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{readingProgress.length} topics read</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="w-3.5 h-3.5" />
              <span>{flashcardData.length} flashcards</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{studySessions.length} sessions</span>
            </div>
          </div>

          {totalDataPoints === 0 && (
            <p className="text-xs text-yellow-600 bg-yellow-500/10 p-2 rounded">
              ⚠️ Complete quizzes, read topics, or practice flashcards for accurate predictions!
            </p>
          )}

          {totalDataPoints > 0 && totalDataPoints < 10 && (
            <p className="text-xs text-blue-600 bg-blue-500/10 p-2 rounded">
              💡 More study data = More accurate predictions. Keep learning!
            </p>
          )}

          <Button onClick={calculatePrediction} className="w-full gradient-primary text-primary-foreground">
            <TrendingUp className="w-4 h-4 mr-2" />
            Calculate My Predicted Score
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ScorePredictor;
