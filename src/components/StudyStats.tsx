import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Calendar, Flame, BookOpen, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface StudyStatsProps {
  userEmail: string;
}

interface QuizAttempt {
  id: string;
  quiz_type: string;
  subjects: string[];
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number;
  created_at: string;
}

export const StudyStats = ({ userEmail }: StudyStatsProps) => {
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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
    };

    fetchStats();
  }, [userEmail]);

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

  // Calculate streak
  const calculateStreak = () => {
    if (quizzes.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    const quizDates = new Set(
      quizzes.map(q => new Date(q.created_at).toDateString())
    );

    while (quizDates.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const streak = calculateStreak();

  // Subject performance
  const subjectPerformance: Record<string, { correct: number; total: number }> = {};
  quizzes.forEach(quiz => {
    quiz.subjects.forEach(subject => {
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { correct: 0, total: 0 };
      }
      // Approximate per-subject stats
      const perSubject = quiz.total_questions / quiz.subjects.length;
      subjectPerformance[subject].total += perSubject;
      subjectPerformance[subject].correct += (quiz.correct_answers / quiz.total_questions) * perSubject;
    });
  });

  const subjectData = Object.entries(subjectPerformance)
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      score: Math.round((data.correct / data.total) * 100) || 0
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

  // Find weakest subject
  const weakestSubject = subjectData[0];

  // AI Insight
  const getAIInsight = () => {
    if (totalQuizzes === 0) {
      return "Start your first quiz to get personalized insights! 📚";
    }
    if (weakestSubject && weakestSubject.score < 50) {
      return `You need more practice in ${weakestSubject.name} — try 20 questions today! 💪`;
    }
    if (avgScore >= 70) {
      return "You're doing great! Keep up the momentum for that 300+! 🔥";
    }
    return "Consistent practice is key. Aim for at least one quiz daily! 🎯";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <Target className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
          <p className="text-sm text-muted-foreground">Avg Score</p>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border">
          <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalQuizzes}</p>
          <p className="text-sm text-muted-foreground">Quizzes Done</p>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border">
          <Clock className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalTimeMinutes}m</p>
          <p className="text-sm text-muted-foreground">Study Time</p>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border">
          <Flame className={`w-6 h-6 mb-2 ${streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
          <p className="text-2xl font-bold text-foreground">{streak}</p>
          <p className="text-sm text-muted-foreground">Day Streak 🔥</p>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="font-medium text-foreground">AI Study Tip</p>
            <p className="text-sm text-muted-foreground">{getAIInsight()}</p>
          </div>
        </div>
      </div>

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
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
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
                  <Tooltip />
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
      {weakestSubject && weakestSubject.score < 50 && (
        <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Weak Area Detected! 📊</p>
              <p className="text-sm text-muted-foreground">
                Your {weakestSubject.name} score is {weakestSubject.score}%. 
                Focus more practice here to boost your overall JAMB score!
              </p>
            </div>
          </div>
        </div>
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
