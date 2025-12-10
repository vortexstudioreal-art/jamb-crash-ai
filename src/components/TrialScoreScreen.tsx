import { motion } from 'framer-motion';
import { Trophy, Target, Clock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrialQuizResults } from './TrialQuiz';

interface TrialScoreScreenProps {
  results: TrialQuizResults;
  onContinue: () => void;
}

export const TrialScoreScreen = ({ results, onContinue }: TrialScoreScreenProps) => {
  const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getMessage = () => {
    if (percentage >= 80) return { emoji: '🏆', text: 'Excellent! You\'re JAMB-ready!' };
    if (percentage >= 60) return { emoji: '⭐', text: 'Great job! Keep practicing!' };
    if (percentage >= 40) return { emoji: '💪', text: 'Good effort! More practice will help!' };
    return { emoji: '📚', text: 'Keep studying! You\'ll get better!' };
  };

  const { emoji, text } = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-7xl mb-4"
            >
              {emoji}
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Trial Quiz Complete!
            </h2>
            <p className="text-muted-foreground">{text}</p>
          </div>

          {/* Score Display */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 mb-6 border border-primary/20">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="text-6xl font-bold text-primary mb-2"
              >
                {results.correctAnswers}/{results.totalQuestions}
              </motion.div>
              <p className="text-lg text-foreground font-medium">
                {percentage}% Score
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-500">{results.correctAnswers}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="bg-destructive/10 rounded-xl p-4 text-center border border-destructive/20">
              <XCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-destructive">{results.totalQuestions - results.correctAnswers}</p>
              <p className="text-xs text-muted-foreground">Wrong</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/20">
              <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{formatTime(results.timeTaken)}</p>
              <p className="text-xs text-muted-foreground">Time</p>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-3 text-center">Subject Breakdown</h3>
            <div className="space-y-2">
              {results.subjects.map(subject => {
                const subjectQuestions = results.questions.filter(q => q.subject === subject);
                const correct = subjectQuestions.filter(q => q.userAnswer === q.correct_answer).length;
                return (
                  <div key={subject} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{subject}</span>
                    <span className={`font-medium ${correct >= 3 ? 'text-green-500' : correct >= 2 ? 'text-yellow-500' : 'text-destructive'}`}>
                      {correct}/5
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trial Dashboard CTA */}
          <div className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
            <p className="text-center text-sm text-foreground">
              🎁 <strong>You have 30 minutes</strong> to explore the Trial Dashboard with limited features!
            </p>
          </div>

          <Button
            onClick={onContinue}
            variant="hero"
            size="xl"
            className="w-full"
          >
            Continue to Trial Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
