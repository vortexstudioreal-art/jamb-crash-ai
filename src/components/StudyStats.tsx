import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Clock, Flame, BookOpen, AlertCircle, Sparkles, RefreshCw, Info, ChevronRight, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useJambScorePredictor } from '@/hooks/useJambScorePredictor';

interface StudyStatsProps {
  userEmail: string;
  refreshTrigger?: number;
  onPracticeSubject?: (subject: string) => void;
}

interface QuizAttempt {
  id: string;
  quiz_type: string;
  subjects: string[];
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number;
  created_at: string;
  questions_data: unknown;
}

export const StudyStats = ({ userEmail, refreshTrigger, onPracticeSubject }: StudyStatsProps) => {
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);

  // Use the new algorithm hook
  const prediction = useJambScorePredictor(quizzes);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(50); // Increased to get more data for algorithm

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Fetch AI-generated tip using the enhanced algorithm data
  const fetchAITip = useCallback(async (quizData: QuizAttempt[]) => {
    if (quizData.length === 0) return;
    
    // Check cache first (cache for 1 hour)
    const cacheKey = `ai_tip_v2_${userEmail}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { tip, timestamp, questionCount } = JSON.parse(cached);
      // Invalidate cache if 25+ more questions answered
      if (Date.now() - timestamp < 60 * 60 * 1000 && 
          Math.abs(prediction.totalQuestions - questionCount) < 25) {
        setAiTip(tip);
        return;
      }
    }

    setLoadingTip(true);
    try {
      // Calculate streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let streak = 0;
      let currentDate = new Date(today);
      const quizDates = new Set(quizData.map(q => new Date(q.created_at).toDateString()));
      while (quizDates.has(currentDate.toDateString())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      // Find weakest subject
      const subjectEntries = Object.entries(prediction.accuracyBySubject);
      const weakSubject = subjectEntries.length > 0
        ? subjectEntries.sort((a, b) => a[1].percentage - b[1].percentage)[0]?.[0]
        : null;

      const performanceData = {
        avgScore: Math.round(prediction.accuracyOverall * 100),
        totalQuizzes: quizData.length,
        totalQuestions: prediction.totalQuestions,
        accuracyLast100: prediction.accuracyLast100,
        consistencyScore: prediction.consistencyScore,
        subjectBalanceScore: prediction.subjectBalanceScore,
        confidence: prediction.confidence,
        minScore: prediction.minScore,
        maxScore: prediction.maxScore,
        studyStreak: streak,
        weakSubject,
        subjectStats: prediction.accuracyBySubject,
      };

      const { data, error } = await supabase.functions.invoke('generate-study-tip', {
        body: { performanceData },
      });

      if (!error && data?.tip) {
        setAiTip(data.tip);
        sessionStorage.setItem(cacheKey, JSON.stringify({
          tip: data.tip,
          timestamp: Date.now(),
          questionCount: prediction.totalQuestions,
        }));
      }
    } catch (error) {
      console.error('Error fetching AI tip:', error);
    } finally {
      setLoadingTip(false);
    }
  }, [userEmail, prediction]);

  // Calculate streak helper
  const calculateStreak = (quizData: QuizAttempt[]) => {
    if (quizData.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDate = new Date(today);
    const quizDates = new Set(quizData.map(q => new Date(q.created_at).toDateString()));
    while (quizDates.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  };

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel('quiz-stats-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_attempts',
          filter: `email=eq.${userEmail}`
        },
        (payload) => {
          console.log('New quiz detected, updating stats:', payload);
          setQuizzes(prev => [payload.new as QuizAttempt, ...prev.slice(0, 49)]);
          sessionStorage.removeItem(`ai_tip_v2_${userEmail}`);
        }
      )
      .subscribe();

    setTipIndex(Math.floor(Math.random() * 5));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail, fetchStats]);

  // Fetch AI tip when quizzes are loaded
  useEffect(() => {
    if (quizzes.length > 0 && !aiTip) {
      fetchAITip(quizzes);
    }
  }, [quizzes, aiTip, fetchAITip]);

  // Refetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchStats();
      sessionStorage.removeItem(`ai_tip_v2_${userEmail}`);
      setAiTip(null);
    }
  }, [refreshTrigger, fetchStats, userEmail]);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-40 bg-muted rounded"></div>
      </div>
    );
  }

  // Calculate stats
  const totalQuizzes = quizzes.length;
  const totalQuestions = prediction.totalQuestions;
  const avgScore = Math.round(prediction.accuracyOverall * 100);
  const totalTimeMinutes = Math.round(quizzes.reduce((sum, q) => sum + (q.time_taken_seconds || 0), 0) / 60);
  const streak = calculateStreak(quizzes);

  // Subject performance from the algorithm
  // Format subject names properly (e.g., "english" -> "English", "crs" -> "CRS")
  const formatSubjectName = (name: string) => {
    const upperCaseSubjects = ['crs', 'irs'];
    if (upperCaseSubjects.includes(name.toLowerCase())) {
      return name.toUpperCase();
    }
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };

  const subjectData = Object.entries(prediction.accuracyBySubject)
    .map(([name, data]) => ({
      name: formatSubjectName(name),
      score: Math.round(data.percentage),
      correct: data.correct,
      total: data.total,
    }))
    .filter(s => s.total > 0)
    .sort((a, b) => a.score - b.score);

  // Daily progress chart
  const dailyData = quizzes
    .slice(0, 7)
    .reverse()
    .map(q => ({
      date: new Date(q.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
      score: Math.round((q.correct_answers / q.total_questions) * 100)
    }));

  // Find weakest and strongest subjects
  const weakestSubject = subjectData[0];
  const strongestSubject = subjectData[subjectData.length - 1];
  const lastQuiz = quizzes[0];

  // Generate personalized AI insight fallback
  const getAIInsight = () => {
    if (totalQuizzes === 0) {
      const startTips = [
        "Ready to crush JAMB? Start your first quiz now and watch your scores climb! 🚀",
        "Your JAMB journey starts here! Take a quiz to get personalized study tips 📚",
        "Champions start somewhere — take your first quiz today! 💪",
        "No stats yet? Complete a quiz and I'll show you exactly where to focus! 🎯",
        "Let's begin! Your first quiz will unlock powerful insights for your prep 🔓"
      ];
      return startTips[tipIndex % startTips.length];
    }

    if (prediction.confidence === 'low') {
      return `Take ${Math.max(0, 60 - totalQuestions)} more questions to unlock accurate predictions! Current range: ${prediction.minScore}-${prediction.maxScore}`;
    }

    if (weakestSubject && weakestSubject.score < 50) {
      return `Focus on ${weakestSubject.name} (${weakestSubject.score}%) - improving here could add 30+ marks to your JAMB score! 🎯`;
    }

    if (avgScore >= 70) {
      return `You're on track for ${prediction.minScore}-${prediction.maxScore}! Keep the momentum going! 🔥`;
    }

    return `Current prediction: ${prediction.minScore}-${prediction.maxScore}. Daily practice will narrow this range and boost your score! 📈`;
  };

  // Get confidence badge color
  const getConfidenceBadgeClass = () => {
    switch (prediction.confidence) {
      case 'high': return 'bg-green-500/20 text-green-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          className="bg-card rounded-xl p-4 border border-border"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Target className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
          <p className="text-sm text-muted-foreground">Avg Score</p>
        </motion.div>
        
        <motion.div 
          className="bg-card rounded-xl p-4 border border-border"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalQuizzes}</p>
          <p className="text-sm text-muted-foreground">Quizzes Done</p>
        </motion.div>
        
        <motion.div 
          className="bg-card rounded-xl p-4 border border-border"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Clock className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalTimeMinutes}m</p>
          <p className="text-sm text-muted-foreground">Study Time</p>
        </motion.div>
        
        <motion.div 
          className="bg-card rounded-xl p-4 border border-border"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Flame className={`w-6 h-6 mb-2 ${streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
          <p className="text-2xl font-bold text-foreground">{streak}</p>
          <p className="text-sm text-muted-foreground">Day Streak 🔥</p>
        </motion.div>
      </div>

      {/* Predicted JAMB Score - Enhanced with new algorithm */}
      {totalQuizzes > 0 && (
        <motion.div 
          className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-5 border border-primary/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 rounded-full p-2">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground">Predicted JAMB Score</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceBadgeClass()}`}>
                  {prediction.confidence.charAt(0).toUpperCase() + prediction.confidence.slice(1)} Confidence
                </span>
              </div>
              <p className="text-3xl font-bold text-primary mt-1">
                {prediction.minScore} - {prediction.maxScore}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {prediction.message} • Based on {prediction.totalQuestions} questions
              </p>
              {prediction.confidence === 'low' && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Take {Math.max(0, 60 - prediction.totalQuestions)} more questions for better accuracy
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Insight */}
      <motion.div 
        className="bg-card rounded-xl p-5 border border-border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-4">
          <div className="bg-primary/20 rounded-full p-2">
            {loadingTip ? (
              <RefreshCw className="w-6 h-6 text-primary animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground flex items-center gap-2">
              AI Study Tip 
              <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full text-primary">
                {aiTip ? 'AI-Powered' : 'Personalized'}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {loadingTip ? 'Generating personalized tip...' : (aiTip || getAIInsight())}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      {totalQuizzes > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Progress Chart */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Progress
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <XAxis dataKey="date" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Performance */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Subject Performance
            </h3>
            {subjectData.length > 0 ? (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} stroke="#888" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#888" fontSize={10} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name, props) => [
                        `${value}% (${props.payload.correct}/${props.payload.total})`, 
                        'Score'
                      ]}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                Complete quizzes to see subject breakdown
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weak Areas Alert */}
      {weakestSubject && weakestSubject.score < 50 && totalQuizzes > 0 && (
        <motion.div 
          className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Weak Area Detected! 📊</p>
              <p className="text-sm text-muted-foreground">
                Your {weakestSubject.name} score is {weakestSubject.score}% ({weakestSubject.correct}/{weakestSubject.total} correct). 
                Focus more practice here to boost your overall JAMB score!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* No Data State */}
      {totalQuizzes === 0 && (
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <span className="text-6xl mb-4 block">📊</span>
          <h3 className="text-xl font-bold text-foreground mb-2">No Stats Yet!</h3>
          <p className="text-muted-foreground">
            Complete your first quiz to see your study progress here!
          </p>
        </div>
      )}
    </motion.div>
  );
};
