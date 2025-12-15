import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, Brain, BarChart3 } from 'lucide-react';
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
  const [analysisDetails, setAnalysisDetails] = useState<{
    avgScore: number;
    totalQuizzes: number;
    strongSubjects: string[];
    weakSubjects: string[];
    consistency: number;
    recentTrend: 'improving' | 'stable' | 'declining';
  } | null>(null);

  // Load quiz history
  useEffect(() => {
    const loadQuizData = async () => {
      const { data } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
        setQuizData(data as QuizAttempt[]);
      }
    };
    loadQuizData();
  }, [userEmail]);

  const calculatePrediction = async () => {
    setIsCalculating(true);
    
    // Simulate analysis with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setProgress(i);
    }

    // REAL DATA-BASED PREDICTION
    if (quizData.length === 0) {
      // No quiz data - provide baseline prediction based on target
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
        recentTrend: 'stable'
      });
      setIsCalculating(false);
      return;
    }

    // Calculate real metrics from quiz history
    const totalQuizzes = quizData.length;
    const scores = quizData.map(q => (q.correct_answers / q.total_questions) * 100);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Calculate subject-wise performance
    const subjectScores: Record<string, { correct: number; total: number }> = {};
    quizData.forEach(attempt => {
      const subjects = attempt.subjects as string[];
      const scorePerSubject = attempt.correct_answers / subjects.length;
      const totalPerSubject = attempt.total_questions / subjects.length;
      subjects.forEach(s => {
        if (!subjectScores[s]) subjectScores[s] = { correct: 0, total: 0 };
        subjectScores[s].correct += scorePerSubject;
        subjectScores[s].total += totalPerSubject;
      });
    });

    // Identify strong and weak subjects
    const subjectRates = Object.entries(subjectScores).map(([subject, data]) => ({
      subject,
      rate: data.total > 0 ? (data.correct / data.total) * 100 : 0
    })).sort((a, b) => b.rate - a.rate);

    const strongSubjects = subjectRates.filter(s => s.rate >= 70).map(s => s.subject);
    const weakSubjects = subjectRates.filter(s => s.rate < 50).map(s => s.subject);

    // Calculate consistency (standard deviation)
    const mean = avgScore;
    const squaredDiffs = scores.map(score => Math.pow(score - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
    const stdDev = Math.sqrt(avgSquaredDiff);
    const consistency = Math.max(0, 100 - stdDev * 2); // Higher is more consistent

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

    // CALCULATE JAMB SCORE PREDICTION based on real data
    // JAMB is out of 400, with 100 questions (4 subjects x 25 questions each)
    const baseJambScore = (avgScore / 100) * 400;
    
    // Adjust based on factors
    let adjustedScore = baseJambScore;
    
    // Consistency bonus/penalty (-10 to +10)
    adjustedScore += ((consistency - 50) / 50) * 10;
    
    // Trend bonus/penalty
    if (recentTrend === 'improving') adjustedScore += 15;
    else if (recentTrend === 'declining') adjustedScore -= 10;
    
    // Weak subject penalty (each weak subject reduces potential by 5-10 points)
    adjustedScore -= weakSubjects.length * 8;
    
    // Strong subject bonus
    adjustedScore += strongSubjects.length * 5;
    
    // Calculate range based on consistency
    const rangeSize = Math.max(15, 40 - (consistency * 0.3));
    
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
      recentTrend
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
        <p className="text-muted-foreground mb-6">Based on {analysisDetails.totalQuizzes} quizzes analyzed</p>
        
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

        {/* Analysis Details */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Average Quiz Score</p>
            <p className="text-lg font-bold text-foreground">{analysisDetails.avgScore}%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Consistency</p>
            <p className="text-lg font-bold text-foreground">{analysisDetails.consistency}%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Recent Trend</p>
            <p className={`text-lg font-bold ${
              analysisDetails.recentTrend === 'improving' ? 'text-green-500' :
              analysisDetails.recentTrend === 'declining' ? 'text-red-500' : 'text-yellow-500'
            }`}>
              {analysisDetails.recentTrend === 'improving' ? '📈 Improving' :
               analysisDetails.recentTrend === 'declining' ? '📉 Declining' : '➡️ Stable'}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Quizzes Analyzed</p>
            <p className="text-lg font-bold text-foreground">{analysisDetails.totalQuizzes}</p>
          </div>
        </div>

        {/* Strong/Weak Subjects */}
        {(analysisDetails.strongSubjects.length > 0 || analysisDetails.weakSubjects.length > 0) && (
          <div className="mb-6 text-left">
            {analysisDetails.strongSubjects.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-green-500 font-medium">💪 Strong Subjects</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysisDetails.strongSubjects.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-green-500/20 text-green-600 rounded text-xs capitalize">
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {analysisDetails.weakSubjects.length > 0 && (
              <div>
                <p className="text-xs text-red-500 font-medium">⚠️ Needs Work</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysisDetails.weakSubjects.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-red-500/20 text-red-600 rounded text-xs capitalize">
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-6">
          {analysisDetails.recentTrend === 'improving' 
            ? "You're on fire! Keep this momentum going! 🔥" 
            : analysisDetails.recentTrend === 'declining'
            ? "Time to refocus! More practice on weak areas will help 💪"
            : "Consistent effort! Push harder to reach the upper range! ⭐"}
        </p>

        <Button
          onClick={() => onShowResultCard(predictedMin, predictedMax)}
          className="gradient-primary text-primary-foreground"
        >
          Share Your Prediction
        </Button>
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
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">AI Score Predictor</h3>
          <p className="text-sm text-muted-foreground">Based on your real quiz data</p>
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
            {progress >= 20 && <p className="text-muted-foreground">Analyzing {quizData.length} quiz attempts...</p>}
            {progress >= 50 && <p className="text-muted-foreground">Calculating subject performance...</p>}
            {progress >= 80 && <p className="text-muted-foreground">Generating prediction...</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            <span>{quizData.length} quizzes available for analysis</span>
          </div>
          {quizData.length === 0 && (
            <p className="text-xs text-yellow-600 bg-yellow-500/10 p-2 rounded">
              ⚠️ Complete some quizzes first for accurate predictions!
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
