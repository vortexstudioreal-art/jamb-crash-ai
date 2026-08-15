import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Brain, BarChart3, BookOpen, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useJambScorePredictor } from '@/hooks/useJambScorePredictor';

interface QuizAttempt {
  id: string;
  subjects: string[];
  correct_answers: number;
  total_questions: number;
  created_at: string;
  questions_data?: Array<{
    subject?: string;
    userAnswer?: string;
    correct_answer?: string;
    isCorrect?: boolean;
  }>;
}

interface ScorePredictorProps {
  userEmail: string;
  targetScore?: number;
  weakSubject?: string;
  onShowResultCard: (min: number, max: number) => void;
}

export const ScorePredictor = ({ userEmail, targetScore = 300, weakSubject, onShowResultCard }: ScorePredictorProps) => {
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quizData, setQuizData] = useState<QuizAttempt[]>([]);
  const [studyTimeHours, setStudyTimeHours] = useState(0);
  const [readingTopics, setReadingTopics] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  // Use the robust prediction hook
  const prediction = useJambScorePredictor(quizData);

  // Load all study data
  useEffect(() => {
    const loadAllData = async () => {
      // Load ALL quiz data (no limit of 50)
      const { data: quizzes } = await supabase
        .from('quiz_attempts')
        .select('id, subjects, correct_answers, total_questions, created_at, questions_data')
        .eq('email', userEmail)
        .order('created_at', { ascending: false });
      
      if (quizzes) {
        setQuizData(quizzes as QuizAttempt[]);
      }

      // Load counts for display
      const { count: readingCount } = await supabase
        .from('reading_progress')
        .select('*', { count: 'exact', head: true })
        .eq('email', userEmail);
      setReadingTopics(readingCount || 0);

      const { count: fcCount } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('email', userEmail);
      setFlashcardCount(fcCount || 0);

      // Study sessions last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: sessions } = await supabase
        .from('reading_sessions')
        .select('time_spent_seconds')
        .eq('email', userEmail)
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      if (sessions) {
        setSessionCount(sessions.length);
        const totalSeconds = sessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0);
        setStudyTimeHours(Math.round(totalSeconds / 3600));
      }
    };
    loadAllData();
  }, [userEmail]);

  const calculatePrediction = async () => {
    setIsCalculating(true);
    
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setProgress(i);
    }

    // Save to database
    try {
      const weakSubjects = Object.entries(prediction.accuracyBySubject)
        .filter(([, s]) => s.percentage < 45)
        .map(([name]) => name);

      await supabase
        .from('user_progress')
        .upsert({
          email: userEmail,
          target_score: targetScore,
          weak_subject: weakSubjects[0] || weakSubject || null,
          predicted_score_min: prediction.minScore,
          predicted_score_max: prediction.maxScore,
          plan_completed: true,
        }, { onConflict: 'email' });
    } catch (err) {
      console.error('Error saving prediction:', err);
    }

    setIsCalculating(false);
    setShowResults(true);
  };

  // Derive display data from prediction
  const strongSubjects = Object.entries(prediction.accuracyBySubject)
    .filter(([, s]) => s.percentage >= 65)
    .map(([name]) => name);
  const weakSubjects = Object.entries(prediction.accuracyBySubject)
    .filter(([, s]) => s.percentage < 45)
    .map(([name]) => name);

  // Determine trend from last 100 vs overall accuracy
  const recentTrend: 'improving' | 'stable' | 'declining' = 
    prediction.accuracyLast100 > prediction.accuracyOverall + 0.05 ? 'improving' :
    prediction.accuracyLast100 < prediction.accuracyOverall - 0.05 ? 'declining' : 'stable';

  if (showResults) {
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
        <p className="text-muted-foreground mb-2">{prediction.message}</p>
        <p className="text-xs text-muted-foreground mb-6">
          Based on {prediction.totalQuestions} questions answered
        </p>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-6 mb-6"
        >
          <span className="text-5xl font-bold text-primary">{prediction.minScore}</span>
          <span className="text-3xl text-muted-foreground mx-2">–</span>
          <span className="text-5xl font-bold text-primary">{prediction.maxScore}</span>
        </motion.div>

        {/* Core metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-left">
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Accuracy</p>
            <p className="text-sm font-bold text-foreground">{Math.round(prediction.accuracyOverall * 100)}%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Confidence</p>
            <p className="text-sm font-bold text-foreground capitalize">{prediction.confidence}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Questions</p>
            <p className="text-sm font-bold text-foreground">{prediction.totalQuestions}</p>
          </div>
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-left">
          <div className="bg-muted/30 rounded-lg p-2 flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Study Time</p>
              <p className="text-sm font-bold text-foreground">{studyTimeHours}h</p>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Topics</p>
              <p className="text-sm font-bold text-foreground">{readingTopics}</p>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2 flex items-center gap-1">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Flashcards</p>
              <p className="text-sm font-bold text-foreground">{flashcardCount}</p>
            </div>
          </div>
        </div>

        {/* Trend indicator */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Recent Performance Trend</p>
          <p className={`text-lg font-bold ${
            recentTrend === 'improving' ? 'text-green-500' :
            recentTrend === 'declining' ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {recentTrend === 'improving' ? '📈 Improving - Great momentum!' :
             recentTrend === 'declining' ? '📉 Declining - Time to refocus!' : '➡️ Stable - Push for improvement!'}
          </p>
        </div>

        {/* Strong/Weak Subjects */}
        {(strongSubjects.length > 0 || weakSubjects.length > 0) && (
          <div className="mb-6 text-left">
            {strongSubjects.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-green-500 font-medium">💪 Strong Subjects</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {strongSubjects.slice(0, 4).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-green-500/20 text-green-600 rounded text-xs capitalize">
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {weakSubjects.length > 0 && (
              <div>
                <p className="text-xs text-red-500 font-medium">⚠️ Focus Areas</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {weakSubjects.slice(0, 4).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-red-500/20 text-red-600 rounded text-xs capitalize">
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowResults(false)}
            className="flex-1"
          >
            Recalculate
          </Button>
          <Button
            onClick={() => onShowResultCard(prediction.minScore, prediction.maxScore)}
            className="flex-1 gradient-primary text-primary-foreground"
          >
            Share Your Prediction
          </Button>
        </div>
      </motion.div>
    );
  }

  const totalDataPoints = quizData.length + readingTopics + flashcardCount + sessionCount;

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
          <p className="text-sm text-muted-foreground">Based on your real quiz performance</p>
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
            {progress >= 30 && <p className="text-muted-foreground">Evaluating {prediction.totalQuestions} questions...</p>}
            {progress >= 50 && <p className="text-muted-foreground">Calculating subject balance...</p>}
            {progress >= 70 && <p className="text-muted-foreground">Computing consistency score...</p>}
            {progress >= 90 && <p className="text-muted-foreground">Generating prediction...</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Data summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{quizData.length} quizzes ({prediction.totalQuestions} questions)</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{readingTopics} topics read</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="w-3.5 h-3.5" />
              <span>{flashcardCount} flashcards</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{sessionCount} sessions</span>
            </div>
          </div>

          {totalDataPoints === 0 && (
            <p className="text-xs text-yellow-600 bg-yellow-500/10 p-2 rounded">
              ⚠️ Complete quizzes for accurate predictions! The predictor needs your quiz performance data.
            </p>
          )}

          {prediction.totalQuestions > 0 && prediction.totalQuestions < 60 && (
            <p className="text-xs text-blue-600 bg-blue-500/10 p-2 rounded">
              💡 You've answered {prediction.totalQuestions} questions. Answer 60+ for a more reliable prediction.
            </p>
          )}

          {prediction.totalQuestions >= 60 && prediction.confidence !== 'high' && (
            <p className="text-xs text-blue-600 bg-blue-500/10 p-2 rounded">
              💡 Keep practicing! 600+ questions gives high-confidence predictions.
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
