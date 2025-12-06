import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Share2, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  subject: string;
  userAnswer: string;
}

interface QuizResultsProps {
  results: {
    totalQuestions: number;
    correctAnswers: number;
    timeTaken: number;
    questions: Question[];
  };
  quizType: 'full' | 'mini' | 'demo' | 'subject';
  onRetry: () => void;
  onHome: () => void;
  onUpgrade?: () => void;
}

const getScoreMessage = (percentage: number) => {
  if (percentage >= 80) return { emoji: '🏆', message: "Outstanding! You're JAMB-ready! 🔥", color: 'text-green-500' };
  if (percentage >= 60) return { emoji: '⭐', message: "Great job! Keep pushing for that 300+!", color: 'text-primary' };
  if (percentage >= 40) return { emoji: '💪', message: "Good effort! More practice = more marks!", color: 'text-yellow-500' };
  return { emoji: '📚', message: "Don't give up! Every question teaches you something!", color: 'text-orange-500' };
};

export const QuizResults = ({ results, quizType, onRetry, onHome, onUpgrade }: QuizResultsProps) => {
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  
  const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const scoreInfo = getScoreMessage(percentage);
  const estimatedJambScore = Math.round((percentage / 100) * 400);

  // Trigger confetti for good scores
  useState(() => {
    if (percentage >= 60) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const wrongQuestions = results.questions.filter(q => q.userAnswer !== q.correct_answer);
  const displayQuestions = showAllQuestions ? results.questions : wrongQuestions.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        {/* Score Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-8xl mb-4"
          >
            {scoreInfo.emoji}
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Quiz Complete!
          </h1>
          <p className={`text-xl ${scoreInfo.color}`}>
            {scoreInfo.message}
          </p>
        </motion.div>

        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-4 border border-border text-center"
          >
            <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold text-foreground">
              {results.correctAnswers}/{results.totalQuestions}
            </p>
            <p className="text-sm text-muted-foreground">Correct</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-4 border border-border text-center"
          >
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-bold text-foreground">{percentage}%</p>
            <p className="text-sm text-muted-foreground">Score</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-4 border border-border text-center"
          >
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-bold text-foreground">{formatTime(results.timeTaken)}</p>
            <p className="text-sm text-muted-foreground">Time</p>
          </motion.div>
        </div>

        {/* Estimated JAMB Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary/20 to-green-500/20 rounded-2xl p-6 mb-8 text-center border border-primary/30"
        >
          <p className="text-muted-foreground mb-1">Estimated JAMB Score</p>
          <p className="text-5xl font-bold text-foreground">{estimatedJambScore}/400</p>
          <p className="text-sm text-muted-foreground mt-2">
            Keep practicing to reach 300+! 🎯
          </p>
        </motion.div>

        {/* Demo Upgrade CTA */}
        {quizType === 'demo' && onUpgrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-primary/10 rounded-2xl p-6 mb-8 text-center border border-primary/30"
          >
            <h3 className="text-xl font-bold text-foreground mb-2">
              🔓 Unlock Full Access!
            </h3>
            <p className="text-muted-foreground mb-4">
              Get unlimited quizzes, PDF uploads, personalized study plans, and more!
            </p>
            <Button onClick={onUpgrade} variant="hero" size="lg">
              Choose a Package →
            </Button>
          </motion.div>
        )}

        {/* Questions Review */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              {showAllQuestions ? 'All Questions' : `Questions to Review (${wrongQuestions.length})`}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllQuestions(!showAllQuestions)}
            >
              {showAllQuestions ? 'Show Wrong Only' : 'Show All'}
            </Button>
          </div>

          <div className="space-y-3">
            {displayQuestions.map((q, index) => {
              const isCorrect = q.userAnswer === q.correct_answer;
              const isExpanded = expandedQuestions.includes(q.id);
              
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-card rounded-xl border ${
                    isCorrect ? 'border-green-500/30' : 'border-destructive/30'
                  }`}
                >
                  <button
                    onClick={() => toggleQuestion(q.id)}
                    className="w-full p-4 text-left flex items-start gap-3"
                  >
                    <div className={`mt-1 ${isCorrect ? 'text-green-500' : 'text-destructive'}`}>
                      {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium line-clamp-2">{q.question}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm ${
                          isCorrect ? 'text-green-500' : 'text-destructive'
                        }`}>
                          Your answer: {q.userAnswer || 'Skipped'}
                        </span>
                        {!isCorrect && (
                          <span className="text-sm text-green-500 font-bold">
                            Correct: {q.correct_answer}
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-4 pb-4 border-t border-border mt-2 pt-4"
                    >
                      <div className="space-y-2 mb-4">
                        {['A', 'B', 'C', 'D'].map(letter => {
                          const optionKey = `option_${letter.toLowerCase()}` as keyof Question;
                          const isCorrectAnswer = q.correct_answer === letter;
                          const isUserAnswer = q.userAnswer === letter;
                          const isWrongUserAnswer = isUserAnswer && !isCorrectAnswer;
                          
                          return (
                            <div
                              key={letter}
                              className={`p-3 rounded-lg ${
                                isCorrectAnswer
                                  ? 'bg-green-500/20 border-2 border-green-500'
                                  : isWrongUserAnswer
                                  ? 'bg-destructive/20 border-2 border-destructive line-through'
                                  : 'bg-muted'
                              }`}
                            >
                              <span className={`font-bold mr-2 ${
                                isCorrectAnswer ? 'text-green-500' : isWrongUserAnswer ? 'text-destructive' : ''
                              }`}>
                                {letter}.
                              </span>
                              <span className={isCorrectAnswer ? 'font-bold underline text-green-600' : ''}>
                                {q[optionKey] as string}
                              </span>
                              {isCorrectAnswer && <span className="ml-2">✓</span>}
                            </div>
                          );
                        })}
                      </div>
                      
                      {q.explanation && (
                        <div className="bg-primary/10 rounded-lg p-3">
                          <p className="text-sm font-medium text-primary mb-1">💡 Why this is right:</p>
                          <p className="text-sm text-muted-foreground">{q.explanation}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onHome} variant="outline" className="flex-1">
            <Home className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <Button onClick={onRetry} variant="hero" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" /> Try Another Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};
