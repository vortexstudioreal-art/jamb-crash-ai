import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Flame, BookOpen, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface StudyStatsProps {
  userEmail: string;
  refreshTrigger?: number; // Optional trigger to force refresh
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

interface AITipResponse {
  tip: string;
  predictedScore?: {
    min: number;
    max: number;
    likely: number;
  } | null;
}

export const StudyStats = ({ userEmail, refreshTrigger }: StudyStatsProps) => {
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [predictedScore, setPredictedScore] = useState<AITipResponse['predictedScore']>(null);
  const [loadingTip, setLoadingTip] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Fetch AI-generated tip
  const fetchAITip = useCallback(async (quizData: QuizAttempt[]) => {
    if (quizData.length === 0) return;
    
    // Check cache first (cache for 1 hour)
    const cacheKey = `ai_tip_${userEmail}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { tip, predictedScore: ps, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 60 * 60 * 1000) { // 1 hour
        setAiTip(tip);
        setPredictedScore(ps);
        return;
      }
    }

    setLoadingTip(true);
    try {
      // Calculate stats for AI
      const totalQuestions = quizData.reduce((sum, q) => sum + q.total_questions, 0);
      const totalCorrect = quizData.reduce((sum, q) => sum + q.correct_answers, 0);
      const avgScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      const totalTimeMinutes = Math.round(quizData.reduce((sum, q) => sum + (q.time_taken_seconds || 0), 0) / 60);
      
      // Calculate subject performance
      const subjectPerf: Record<string, { correct: number; total: number }> = {};
      quizData.forEach(quiz => {
        quiz.subjects.forEach(subject => {
          if (!subjectPerf[subject]) subjectPerf[subject] = { correct: 0, total: 0 };
          const perSubject = quiz.total_questions / quiz.subjects.length;
          subjectPerf[subject].total += perSubject;
          subjectPerf[subject].correct += (quiz.correct_answers / quiz.total_questions) * perSubject;
        });
      });

      const subjectScores = Object.entries(subjectPerf)
        .map(([name, data]) => ({ name, score: Math.round((data.correct / data.total) * 100) }))
        .sort((a, b) => a.score - b.score);

      const weakest = subjectScores[0];
      const strongest = subjectScores[subjectScores.length - 1];
      const lastQuiz = quizData[0];
      const predictedJAMB = Math.round((avgScore / 100) * 400);

      const studyData = {
        avgScore,
        totalQuizzes: quizData.length,
        weakestSubject: weakest?.name || null,
        weakestScore: weakest?.score || null,
        strongestSubject: strongest?.name || null,
        strongestScore: strongest?.score || null,
        streak: calculateStreak(quizData),
        totalTimeMinutes,
        lastQuizScore: lastQuiz ? Math.round((lastQuiz.correct_answers / lastQuiz.total_questions) * 100) : null,
        predictedJAMB,
      };

      const { data, error } = await supabase.functions.invoke('generate-study-tip', {
        body: { studyData },
      });

      if (!error && data?.tip) {
        setAiTip(data.tip);
        setPredictedScore(data.predictedScore);
        
        // Cache the response
        sessionStorage.setItem(cacheKey, JSON.stringify({
          tip: data.tip,
          predictedScore: data.predictedScore,
          timestamp: Date.now(),
        }));
      }
    } catch (error) {
      console.error('Error fetching AI tip:', error);
    } finally {
      setLoadingTip(false);
    }
  }, [userEmail]);

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

    // Subscribe to real-time updates for quiz_attempts
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
          setQuizzes(prev => [payload.new as QuizAttempt, ...prev.slice(0, 29)]);
          // Clear cached tip to get fresh one
          sessionStorage.removeItem(`ai_tip_${userEmail}`);
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
      sessionStorage.removeItem(`ai_tip_${userEmail}`);
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
  const totalQuestions = quizzes.reduce((sum, q) => sum + q.total_questions, 0);
  const totalCorrect = quizzes.reduce((sum, q) => sum + q.correct_answers, 0);
  const avgScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalTimeMinutes = Math.round(quizzes.reduce((sum, q) => sum + (q.time_taken_seconds || 0), 0) / 60);

  // Calculate streak using the helper defined above
  const streak = calculateStreak(quizzes);

  // Subject performance with detailed tracking from questions_data
  const subjectPerformance: Record<string, { correct: number; total: number; attempts: number }> = {};
  quizzes.forEach(quiz => {
    // Try to get per-question data for accurate subject tracking
    const questionsData = quiz.questions_data as any[] | null;
    
    if (questionsData && Array.isArray(questionsData)) {
      // Count per-subject from actual question data
      questionsData.forEach(q => {
        const subject = q.subject as string;
        if (!subject) return;
        
        if (!subjectPerformance[subject]) {
          subjectPerformance[subject] = { correct: 0, total: 0, attempts: 0 };
        }
        subjectPerformance[subject].total += 1;
        // Check if user answered correctly
        if (q.userAnswer && q.userAnswer === q.correct_answer) {
          subjectPerformance[subject].correct += 1;
        }
      });
      
      // Track attempt count
      quiz.subjects.forEach(subject => {
        if (subjectPerformance[subject]) {
          subjectPerformance[subject].attempts += 1;
        }
      });
    } else {
      // Fallback: distribute evenly if no questions_data
      quiz.subjects.forEach(subject => {
        if (!subjectPerformance[subject]) {
          subjectPerformance[subject] = { correct: 0, total: 0, attempts: 0 };
        }
        const perSubject = quiz.total_questions / quiz.subjects.length;
        subjectPerformance[subject].total += perSubject;
        subjectPerformance[subject].correct += (quiz.correct_answers / quiz.total_questions) * perSubject;
        subjectPerformance[subject].attempts++;
      });
    }
  });

  const subjectData = Object.entries(subjectPerformance)
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      score: Math.round((data.correct / data.total) * 100) || 0,
      correct: Math.round(data.correct),
      total: Math.round(data.total),
      attempts: data.attempts
    }))
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

  // Calculate predicted JAMB score
  const predictedJAMB = Math.round((avgScore / 100) * 400);

  // Generate personalized AI insight
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

    // If there's a recent quiz (last 24 hours), give specific feedback
    if (lastQuiz) {
      const lastQuizScore = Math.round((lastQuiz.correct_answers / lastQuiz.total_questions) * 100);
      const hoursAgo = (Date.now() - new Date(lastQuiz.created_at).getTime()) / (1000 * 60 * 60);
      
      if (hoursAgo < 1) {
        if (lastQuizScore >= 80) {
          return `Amazing! You just scored ${lastQuizScore}%! You're on track for ${predictedJAMB}+ 🔥`;
        } else if (lastQuizScore >= 60) {
          return `Good effort! ${lastQuizScore}% is solid. ${weakestSubject ? `Focus on ${weakestSubject.name} next!` : 'Keep practicing!'} 💪`;
        } else {
          return `${lastQuizScore}% — don't worry! ${weakestSubject ? `Practice more ${weakestSubject.name} to improve fast!` : 'Every quiz makes you stronger!'} 📈`;
        }
      }
    }

    // Weak subject specific tips
    if (weakestSubject && weakestSubject.score < 50) {
      const weakTips = [
        `You got ${weakestSubject.correct}/${weakestSubject.total} in ${weakestSubject.name} — practice 20 questions today to hit 280+! 🔥`,
        `${weakestSubject.name} needs attention (${weakestSubject.score}%) — one focused session could add 30+ marks! 📊`,
        `Your ${weakestSubject.name} score is ${weakestSubject.score}%. Master it and watch your JAMB score jump! 🎯`,
        `Focus area: ${weakestSubject.name} at ${weakestSubject.score}%. Daily practice here = faster improvement! 💡`,
        `${weakestSubject.name} is pulling you back. Let's turn your weakness into a strength! 💪`
      ];
      return weakTips[tipIndex % weakTips.length];
    }

    // Good performance tips
    if (avgScore >= 70) {
      const strongTips = [
        `You're killing it! ${avgScore}% average = predicted ${predictedJAMB} JAMB score! 🔥`,
        `${strongestSubject?.name} is your superpower at ${strongestSubject?.score}%! Keep the momentum! 🚀`,
        `Consistent ${avgScore}%! You're on track for 300+. Don't slow down now! 💪`,
        `${streak} day streak + ${avgScore}% average = JAMB success incoming! 🎯`,
        `Amazing progress! Your ${totalQuizzes} quizzes are paying off. Keep it up! ⭐`
      ];
      return strongTips[tipIndex % strongTips.length];
    }

    // General improvement tips
    const generalTips = [
      `${totalQuizzes} quizzes done! Aim for 1 more today to boost your ${avgScore}% average 📈`,
      `Current: ${avgScore}%. Target: 70%+. You're ${70 - avgScore}% away — you've got this! 💪`,
      `Daily practice = steady gains. Your ${streak || 0} day streak is building success! 🔥`,
      `${totalTimeMinutes} mins studied! Consistent effort wins the JAMB race 🏆`,
      `Keep going! Every quiz gets you closer to that 300+ score! 🎯`
    ];
    return generalTips[tipIndex % generalTips.length];
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

      {/* AI Insight - Enhanced with real AI */}
      <motion.div 
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-5 border border-primary/30"
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
            {(predictedScore || predictedJAMB > 0) && totalQuizzes > 0 && (
              <p className="text-xs text-primary mt-2 font-medium">
                📊 Predicted JAMB Score: {predictedScore 
                  ? `${predictedScore.min}-${predictedScore.max} (most likely: ${predictedScore.likely})`
                  : `${predictedJAMB}/400`
                }
              </p>
            )}
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
                    formatter={(value) => [`${value}%`, 'Score']}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
