import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Share2, RotateCcw, Home, Sparkles, MinusCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { useAiExplanation } from '@/hooks/useAiExplanation';
import { downloadScorecard, shareScorecard, type ScorecardData } from '@/lib/scorecard';
import { stripQuestionHtml } from '@/lib/sanitize';

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
  year?: number;
  image_url?: string | null;
  userAnswer?: string;
}

export interface QuizResultsProps {
  results: {
    totalQuestions: number;
    correctAnswers: number;
    timeTaken: number;
    questions: Question[];
  };
  quizType: 'full' | 'mini' | 'demo' | 'subject' | 'timed-practice';
  userEmail?: string;
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

export const QuizResults = ({ results, quizType, userEmail, onRetry, onHome, onUpgrade }: QuizResultsProps) => {
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [confettiFired, setConfettiFired] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { explanation, isLoading, error, getExplanation, cancel } = useAiExplanation();
  const [aiQuestionId, setAiQuestionId] = useState<string | null>(null);

  // FIXED: Score is based on ACTUAL questions answered, not a progressive total
  const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const scoreInfo = getScoreMessage(percentage);

  // Estimated JAMB score based on THIS quiz performance
  const estimatedJambScore = Math.round((percentage / 100) * 400);

  const wrongCount = results.questions.filter(q => q.userAnswer && q.userAnswer !== q.correct_answer).length;
  const skippedCount = results.questions.filter(q => !q.userAnswer).length;

  // Trigger confetti once per results screen for good scores
  useEffect(() => {
    if (percentage >= 60 && !confettiFired) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setConfettiFired(true);
    }
  }, [percentage, confettiFired]);

  useEffect(() => () => cancel(), [cancel]);

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

  const handleAiExplain = (q: Question) => {
    if (aiQuestionId === q.id && explanation) {
      cancel();
      setAiQuestionId(null);
      return;
    }
    setAiQuestionId(q.id);
    getExplanation({
      id: q.id,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      subject: q.subject,
    });
  };

  const wrongQuestions = results.questions.filter(q => q.userAnswer !== q.correct_answer);
  const displayQuestions = showAllQuestions ? results.questions : wrongQuestions.slice(0, 5);

  const buildScorecardData = (): ScorecardData => ({
    userName: userEmail ? userEmail.split('@')[0] : 'JAMB Candidate',
    title: 'PRACTICE QUIZ RESULT',
    score: estimatedJambScore,
    maxScore: 400,
    bandLabel: scoreInfo.message,
    sections: [],
  });

  const handleShareScorecard = async () => {
    setSharing(true);
    const text = `I scored ${results.correctAnswers}/${results.totalQuestions} (${percentage}%) on Jamb Crash AI — estimated JAMB ${estimatedJambScore}/400!`;
    try {
      await shareScorecard(buildScorecardData(), text);
    } catch {
      // share fallback handled internally
    } finally {
      setSharing(false);
    }
  };

  const getOptionText = (q: Question, letter: string) => {
    const key = `option_${letter.toLowerCase()}` as keyof Question;
    return q[key] as string | undefined;
  };

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

        {/* Answer Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-center">
            <p className="text-2xl font-bold text-green-500">{results.correctAnswers}</p>
            <p className="text-xs text-muted-foreground">Correct ✓</p>
          </div>
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{wrongCount}</p>
            <p className="text-xs text-muted-foreground">Wrong ✗</p>
          </div>
          <div className="rounded-xl bg-muted border border-border p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{skippedCount}</p>
            <p className="text-xs text-muted-foreground">Skipped</p>
          </div>
        </motion.div>

        {/* Estimated JAMB Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary/20 to-green-500/20 rounded-2xl p-6 mb-8 text-center border border-primary/30"
        >
          <p className="text-muted-foreground mb-1">Estimated JAMB Score (if you maintain this performance)</p>
          <p className="text-5xl font-bold text-foreground">{estimatedJambScore}/400</p>
          <p className="text-sm text-muted-foreground mt-2">
            Based on {results.correctAnswers} correct out of {results.totalQuestions} questions
          </p>
        </motion.div>

        {/* Share Scorecard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex gap-3 mb-8"
        >
          <Button variant="outline" className="flex-1 gap-2" onClick={handleShareScorecard} disabled={sharing}>
            {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Share Scorecard
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={() => downloadScorecard(buildScorecardData())}>
            <Download className="w-4 h-4" />
            Download
          </Button>
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
              {showAllQuestions ? 'All Questions' : `Wrong Answers (${wrongCount})`}
            </h2>
            {wrongCount > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllQuestions(!showAllQuestions)}
              >
                {showAllQuestions ? 'Show Wrong Only' : 'Show All'}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {displayQuestions.map((q, index) => {
              const isCorrect = q.userAnswer === q.correct_answer;
              const isSkipped = !q.userAnswer;
              const isExpanded = expandedQuestions.includes(q.id);
              const isAiLoading = isLoading && aiQuestionId === q.id;
              const userAnswerText = getOptionText(q, q.userAnswer || '');

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-card rounded-xl border ${
                    isCorrect ? 'border-green-500/30' : isSkipped ? 'border-muted' : 'border-destructive/30'
                  }`}
                >
                  <button
                    onClick={() => toggleQuestion(q.id)}
                    className="w-full p-4 text-left flex items-start gap-3"
                    aria-expanded={isExpanded}
                  >
                    <div className={`mt-1 ${isCorrect ? 'text-green-500' : isSkipped ? 'text-muted-foreground' : 'text-destructive'}`}>
                      {isCorrect ? <CheckCircle className="w-5 h-5" /> : isSkipped ? <MinusCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium line-clamp-2">{stripQuestionHtml(q.question)}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-sm font-medium ${isCorrect ? 'text-green-500' : isSkipped ? 'text-muted-foreground' : 'text-destructive'}`}>
                          {isSkipped ? 'You skipped this question' : `Your answer: ${q.userAnswer}. ${userAnswerText || ''}`}
                        </span>
                        {!isCorrect && !isSkipped && (
                          <span className="text-sm text-green-500 font-bold">
                            Correct: {q.correct_answer}. {getOptionText(q, q.correct_answer) || ''}
                          </span>
                        )}
                      </div>
                      {q.subject && (
                        <span className="inline-block mt-1 text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                          {q.subject.replace('_', ' ')}{q.year ? ` • ${q.year}` : ''}
                        </span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-4 pb-4 border-t border-border mt-2 pt-4"
                    >
                      {q.image_url && (
                        <img
                          src={q.image_url}
                          alt="Question diagram"
                          className="rounded-lg mb-3 max-h-64 w-auto"
                          loading="lazy"
                        />
                      )}

                      <div className="space-y-2 mb-4">
                        {['A', 'B', 'C', 'D'].map(letter => {
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
                                {stripQuestionHtml(q[`option_${letter.toLowerCase()}` as keyof Question] as string)}
                              </span>
                              {isCorrectAnswer && <span className="ml-2">✓ Correct</span>}
                              {isWrongUserAnswer && <span className="ml-2">✗ Your answer</span>}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="bg-primary/10 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-primary mb-1">💡 Why this is right:</p>
                          <p className="text-sm text-muted-foreground">{stripQuestionHtml(q.explanation)}</p>
                        </div>
                      )}

                      {!q.explanation && (
                        <div className="mb-3">
                          {isAiLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              Generating explanation...
                            </div>
                          ) : aiQuestionId === q.id && explanation ? (
                            <div className="bg-primary/10 rounded-lg p-3">
                              <p className="text-sm font-medium text-primary mb-1">💡 AI Explanation:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{explanation}</p>
                            </div>
                          ) : aiQuestionId === q.id && error ? (
                            <p className="text-sm text-destructive">{error}</p>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAiExplain(q)}
                            >
                              <Sparkles className="w-4 h-4 mr-2 text-primary" />
                              Get AI Explanation
                            </Button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {displayQuestions.length === 0 && (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
              <p className="font-semibold text-foreground mb-1">Perfect score!</p>
              <p className="text-sm text-muted-foreground">
                You answered all {results.totalQuestions} questions correctly. Keep it up! 🎉
              </p>
            </div>
          )}
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
