import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Lock, Trophy, BookOpen, Target, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrialQuizResults } from './TrialQuiz';

interface TrialDashboardProps {
  results: TrialQuizResults;
  timeRemaining: number; // in milliseconds
  onUpgrade: () => void;
  onReviewQuestions: () => void;
}

export const TrialDashboard = ({ results, timeRemaining, onUpgrade, onReviewQuestions }: TrialDashboardProps) => {
  const [currentTime, setCurrentTime] = useState(timeRemaining);
  
  useEffect(() => {
    setCurrentTime(timeRemaining);
  }, [timeRemaining]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const progressPercent = Math.max(0, (currentTime / (30 * 60 * 1000)) * 100);

  const lockedFeatures = [
    { name: 'Full 60-Question Quiz', icon: Target },
    { name: 'Practice by Subject & Year', icon: BookOpen },
    { name: 'Unlimited PDF Uploads', icon: Sparkles },
    { name: 'Full Study Plan', icon: Clock },
    { name: 'Study Materials', icon: BookOpen },
    { name: 'WhatsApp Reminders', icon: Sparkles },
    { name: 'Predicted Score', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Trial Timer Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/20 to-yellow-500/20 rounded-2xl p-4 mb-6 border border-primary/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Free Trial Time Remaining</p>
                <p className={`text-2xl font-bold ${currentTime < 5 * 60 * 1000 ? 'text-destructive' : 'text-primary'}`}>
                  {formatTime(currentTime)}
                </p>
              </div>
            </div>
            <Button onClick={onUpgrade} variant="hero">
              Upgrade Now 🚀
            </Button>
          </div>
          <Progress value={progressPercent} className="h-2 mt-3" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            ⚠️ You are using the Free Trial. Upgrade to unlock full access.
          </p>
        </motion.div>

        {/* Score Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 border border-border mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Your Trial Score</h2>
              <p className="text-muted-foreground">From your 20-question trial quiz</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-500/10 rounded-xl p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-500">{results.correctAnswers}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="bg-destructive/10 rounded-xl p-4 text-center">
              <XCircle className="w-6 h-6 text-destructive mx-auto mb-1" />
              <p className="text-2xl font-bold text-destructive">{results.totalQuestions - results.correctAnswers}</p>
              <p className="text-xs text-muted-foreground">Wrong</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-primary">{percentage}%</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
          </div>

          <Button onClick={onReviewQuestions} variant="outline" className="w-full">
            Review Questions & Answers
          </Button>
        </motion.div>

        {/* Available Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 border border-border mb-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Available in Trial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-foreground">View Trial Score</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-foreground">Review Questions</span>
            </div>
          </div>
        </motion.div>

        {/* Locked Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-6 border border-border mb-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            Locked Features (Upgrade to Access)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lockedFeatures.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border opacity-60"
              >
                <Lock className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">{feature.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 border border-primary/30 text-center"
        >
          <h3 className="text-xl font-bold text-foreground mb-2">Ready to Unlock Everything?</h3>
          <p className="text-muted-foreground mb-4">
            Get full access to all quizzes, study materials, and premium features
          </p>
          <Button onClick={onUpgrade} variant="hero" size="xl">
            Upgrade Now — Starting at ₦5,000
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
