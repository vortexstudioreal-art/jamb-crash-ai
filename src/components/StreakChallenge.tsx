import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Heart, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { DashboardHeader } from '@/components/DashboardHeader';
import { supabase } from '@/integrations/supabase/client';

interface StreakChallengeProps {
  userEmail: string;
  subjects: string[];
  isOwner?: boolean;
  isAdmin?: boolean;
  userRole?: string | null;
  onSignOut: () => void;
  onBack: () => void;
}

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  subject: string;
  explanation?: string;
}

type GameState = 'ready' | 'playing' | 'gameover';

const BEST_STREAK_KEY = 'jamb_best_streak';

export const StreakChallenge = ({ userEmail, subjects, isOwner, isAdmin, userRole, onSignOut, onBack }: StreakChallengeProps) => {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    const stored = localStorage.getItem(`${BEST_STREAK_KEY}_${userEmail}`);
    return stored ? parseInt(stored) : 0;
  });
  const [lives, setLives] = useState(3);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    const { data } = await supabase
      .from('jamb_questions')
      .select('id, question, option_a, option_b, option_c, option_d, correct_answer, subject, explanation')
      .in('subject', subjects as any)
      .limit(200);

    if (data) {
      setQuestions(data.sort(() => Math.random() - 0.5) as Question[]);
    }
  }, [subjects]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const startGame = () => {
    setGameState('playing');
    setCurrentIndex(0);
    setStreak(0);
    setLives(3);
    setShowExplanation(false);
    setSelectedAnswer(null);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    const q = questions[currentIndex];
    if (!q) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === q.correct_answer;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        localStorage.setItem(`${BEST_STREAK_KEY}_${userEmail}`, String(newStreak));
      }
      setTimeout(() => {
        setSelectedAnswer(null);
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setGameState('gameover');
        }
      }, 500);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setShowExplanation(true);

      if (newLives <= 0) {
        setTimeout(() => setGameState('gameover'), 2000);
      }
    }
  };

  const continueAfterWrong = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    setStreak(0);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setGameState('gameover');
    }
  };

  const restart = () => {
    loadQuestions();
    setGameState('ready');
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={userEmail} isOwner={isOwner || false} isCollaborator={(isAdmin && !isOwner) || false} userRole={(userRole as any) || null} onSignOut={onSignOut} />
      <div className="pt-16">
        <BackButton onClick={onBack} />
        <div className="max-w-2xl mx-auto px-4 py-6">
          {gameState === 'ready' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
                <Flame className="w-10 h-10 text-orange-500" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">🔥 Streak Challenge</h1>
              <p className="text-muted-foreground mb-2">How many correct answers in a row can you get?</p>
              <p className="text-sm text-muted-foreground mb-2">You have 3 lives. Wrong answer resets your streak!</p>
              {bestStreak > 0 && (
                <p className="text-sm text-primary font-medium mb-6">
                  <Trophy className="w-4 h-4 inline mr-1" /> Your best: {bestStreak} streak
                </p>
              )}
              <Button size="lg" onClick={startGame} disabled={questions.length === 0} className="text-lg px-8 bg-orange-500 hover:bg-orange-600">
                {questions.length === 0 ? 'Loading...' : 'Start Challenge! 🔥'}
              </Button>
            </motion.div>
          )}

          {gameState === 'playing' && currentQ && (
            <div>
              {/* Status bar */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Flame className={`w-6 h-6 ${streak >= 5 ? 'text-orange-500 animate-pulse' : 'text-muted-foreground'}`} />
                  <span className="text-2xl font-bold text-foreground">{streak}</span>
                  <span className="text-sm text-muted-foreground">streak</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <Heart key={i} className={`w-6 h-6 ${i <= lives ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={currentQ.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                  <Card className={`mb-4 ${selectedAnswer ? (selectedAnswer === currentQ.correct_answer ? 'border-green-500' : 'border-destructive') : ''}`}>
                    <CardContent className="pt-4">
                      <Badge variant="secondary" className="mb-3 capitalize text-xs">{currentQ.subject.replace('_', ' ')}</Badge>
                      <p className="text-foreground font-medium mb-4 text-sm leading-relaxed">{currentQ.question}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {['A', 'B', 'C', 'D'].map(opt => {
                          const isSelected = selectedAnswer === opt;
                          const isCorrectOpt = opt === currentQ.correct_answer;
                          let extraClass = '';
                          if (selectedAnswer) {
                            if (isCorrectOpt) extraClass = 'border-green-500 bg-green-500/10';
                            else if (isSelected) extraClass = 'border-destructive bg-destructive/10';
                          }
                          return (
                            <Button
                              key={opt}
                              variant="outline"
                              className={`justify-start text-left h-auto py-3 px-4 ${extraClass}`}
                              onClick={() => handleAnswer(opt)}
                              disabled={!!selectedAnswer}
                            >
                              <span className="font-bold mr-2 text-primary">{opt}.</span>
                              <span className="text-sm">{currentQ[`option_${opt.toLowerCase()}` as keyof Question]}</span>
                            </Button>
                          );
                        })}
                      </div>

                      {showExplanation && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 mb-3">
                            <p className="text-sm text-foreground">
                              <strong>Correct answer: {currentQ.correct_answer}</strong>
                            </p>
                            {currentQ.explanation && (
                              <p className="text-sm text-muted-foreground mt-1">{currentQ.explanation}</p>
                            )}
                          </div>
                          {lives > 0 ? (
                            <Button onClick={continueAfterWrong} className="w-full">Continue (streak reset)</Button>
                          ) : (
                            <p className="text-center text-destructive font-medium">No lives left! Game over...</p>
                          )}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {gameState === 'gameover' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="text-6xl mb-4">{streak >= 20 ? '🏆' : streak >= 10 ? '🔥' : streak >= 5 ? '⭐' : '💪'}</div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Game Over!</h2>
              <div className="text-5xl font-bold text-orange-500 mb-2">{streak}</div>
              <p className="text-muted-foreground mb-1">Final Streak</p>
              <p className="text-sm text-primary mb-8">Best ever: {bestStreak} 🏆</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={restart} className="gap-2 bg-orange-500 hover:bg-orange-600">
                  <RotateCcw className="w-4 h-4" /> Try Again
                </Button>
                <Button variant="outline" onClick={onBack}>Back to Dashboard</Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
