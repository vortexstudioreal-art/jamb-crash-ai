import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BackButton } from '@/components/BackButton';
import { DashboardHeader } from '@/components/DashboardHeader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SpeedRoundProps {
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
}

type GameState = 'ready' | 'playing' | 'finished';

const GAME_DURATION = 60;

export const SpeedRound = ({ userEmail, subjects, isOwner, isAdmin, userRole, onSignOut, onBack }: SpeedRoundProps) => {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<'correct' | 'wrong' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const loadQuestions = useCallback(async () => {
    const { data } = await supabase
      .from('jamb_questions')
      .select('id, question, option_a, option_b, option_c, option_d, correct_answer, subject')
      .in('subject', subjects as any)
      .limit(100);

    if (data) {
      // Shuffle
      const shuffled = data.sort(() => Math.random() - 0.5);
      setQuestions(shuffled as Question[]);
    }
  }, [subjects]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const startGame = () => {
    setGameState('playing');
    setCurrentIndex(0);
    setScore(0);
    setAnswered(0);
    setTimeLeft(GAME_DURATION);
    setLastAnswer(null);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (answer: string) => {
    const q = questions[currentIndex];
    if (!q) return;

    const isCorrect = answer === q.correct_answer;
    setLastAnswer(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore(prev => prev + 1);
    setAnswered(prev => prev + 1);

    setTimeout(() => {
      setLastAnswer(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        clearInterval(timerRef.current);
        setGameState('finished');
      }
    }, 300);
  };

  const restart = () => {
    clearInterval(timerRef.current);
    loadQuestions();
    setGameState('ready');
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setAnswered(0);
    setCurrentIndex(0);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={userEmail} isOwner={isOwner || false} isCollaborator={(isAdmin && !isOwner) || false} userRole={(userRole as any) || null} onSignOut={onSignOut} />
      <div className="pt-16">
        <BackButton onClick={onBack} />
        <div className="max-w-2xl mx-auto px-4 py-6">
          {gameState === 'ready' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">⚡ Speed Round</h1>
              <p className="text-muted-foreground mb-2">Answer as many questions as possible in 60 seconds!</p>
              <p className="text-sm text-muted-foreground mb-8">Questions from: {subjects.map(s => s.replace('_', ' ')).join(', ')}</p>
              <Button size="lg" onClick={startGame} disabled={questions.length === 0} className="text-lg px-8">
                {questions.length === 0 ? 'Loading...' : 'Start! 🚀'}
              </Button>
            </motion.div>
          )}

          {gameState === 'playing' && currentQ && (
            <div>
              {/* Timer bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`} />
                    <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-destructive' : 'text-foreground'}`}>{timeLeft}s</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Score: <strong className="text-primary">{score}</strong></span>
                    <span className="text-sm text-muted-foreground">#{answered + 1}</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${timeLeft <= 10 ? 'bg-destructive' : 'bg-primary'}`}
                    animate={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div key={currentQ.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.2 }}>
                  <Card className={`mb-4 ${lastAnswer === 'correct' ? 'border-green-500' : lastAnswer === 'wrong' ? 'border-destructive' : ''}`}>
                    <CardContent className="pt-4">
                      <Badge variant="secondary" className="mb-3 capitalize text-xs">{currentQ.subject.replace('_', ' ')}</Badge>
                      <p className="text-foreground font-medium mb-4 text-sm leading-relaxed">{currentQ.question}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <Button
                            key={opt}
                            variant="outline"
                            className="justify-start text-left h-auto py-3 px-4"
                            onClick={() => handleAnswer(opt)}
                          >
                            <span className="font-bold mr-2 text-primary">{opt}.</span>
                            <span className="text-sm">{currentQ[`option_${opt.toLowerCase()}` as keyof Question]}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="text-6xl mb-4">{score >= 15 ? '🏆' : score >= 10 ? '⭐' : score >= 5 ? '👍' : '💪'}</div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Time's Up!</h2>
              <div className="text-5xl font-bold text-primary mb-4">{score}/{answered}</div>
              <p className="text-muted-foreground mb-2">
                {score >= 15 ? 'Incredible! You\'re a speed machine!' : score >= 10 ? 'Great job! Keep it up!' : score >= 5 ? 'Nice try! Practice makes perfect!' : 'Keep pushing! You\'ll get faster!'}
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                {answered} questions in 60 seconds • {Math.round((score / Math.max(answered, 1)) * 100)}% accuracy
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={restart} className="gap-2">
                  <RotateCcw className="w-4 h-4" /> Play Again
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
