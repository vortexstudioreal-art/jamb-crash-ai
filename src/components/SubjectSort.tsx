import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RotateCcw, Trophy, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BackButton } from '@/components/BackButton';
import { DashboardHeader } from '@/components/DashboardHeader';
import { loadGameQuestions, rememberQuestionIds, type GameQuestion, ALL_GAME_SUBJECTS } from '@/lib/gameQuestions';
import { stripQuestionHtml } from '@/lib/sanitize';
import { useFeatureUsage } from '@/hooks/useFeatureUsage';
import { FeatureLimitReached } from '@/components/FeatureLimitReached';

interface SubjectSortProps {
  userEmail: string;
  subjects: string[];
  isOwner?: boolean;
  isAdmin?: boolean;
  userRole?: string | null;
  onSignOut: () => void;
  onBack: () => void;
  onUpgradeClick?: (plan?: string) => void;
}

type GameState = 'ready' | 'playing' | 'finished';

const GAME_DURATION = 60;
const BEST_KEY = 'jamb_subject_sort_best';

const label = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const pickDistractors = (correct: string): string[] => {
  const pool = ALL_GAME_SUBJECTS.filter((s) => s !== correct).sort(() => Math.random() - 0.5);
  return pool.slice(0, 3);
};

export const SubjectSort = ({ userEmail, subjects, isOwner, isAdmin, userRole, onSignOut, onBack, onUpgradeClick }: SubjectSortProps) => {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  // Shuffled 4-way options per question index (stable across re-renders).
  const [optionsByIndex, setOptionsByIndex] = useState<string[][]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<'correct' | 'wrong' | null>(null);
  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem(`${BEST_KEY}_${userEmail}`) || 0);
    } catch {
      return 0;
    }
  });
  const [showQuizLimitModal, setShowQuizLimitModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const scoreRef = useRef(0);
  const { canUseFeature, incrementUsage } = useFeatureUsage();

  const loadRound = useCallback(async () => {
    const pool = await loadGameQuestions(subjects, 60);
    setQuestions(pool);
    setOptionsByIndex(
      pool.map((q) => [q.subject, ...pickDistractors(q.subject)].sort(() => Math.random() - 0.5))
    );
  }, [subjects]);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  const finish = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('finished');
    // Persist the best and refresh the badge from the SAME value: writing
    // inside setScore's updater and reading in setBest's updater raced, so
    // a fresh personal best could display the previous score.
    try {
      const final = scoreRef.current;
      const prev = Number(localStorage.getItem(`${BEST_KEY}_${userEmail}`) || 0);
      if (final > prev) {
        localStorage.setItem(`${BEST_KEY}_${userEmail}`, String(final));
        setBest(final);
      } else {
        setBest(prev);
      }
    } catch {
      // storage blocked: keep the in-memory score only
    }
  }, [userEmail]);

  const startGame = async () => {
    if (questions.length === 0) {
      await loadRound();
    }
    if (!canUseFeature('quick_quiz')) {
      setShowQuizLimitModal(true);
      return;
    }
    const ok = await incrementUsage('quick_quiz');
    if (!ok) {
      setShowQuizLimitModal(true);
      return;
    }
    setGameState('playing');
    setCurrentIndex(0);
    setScore(0);
    scoreRef.current = 0;
    setAnswered(0);
    setTimeLeft(GAME_DURATION);
    setLastAnswer(null);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const answer = (subject: string) => {
    const q = questions[currentIndex];
    if (!q || gameState !== 'playing') return;
    rememberQuestionIds([q.id]);
    const correct = subject === q.subject;
    setLastAnswer(correct ? 'correct' : 'wrong');
    if (correct) {
      scoreRef.current += 1;
      setScore((s) => s + 1);
    }
    setAnswered((a) => a + 1);
    setTimeout(() => {
      setLastAnswer(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        finish();
      }
    }, 450);
  };

  const restart = () => {
    clearInterval(timerRef.current);
    loadRound();
    setGameState('ready');
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setAnswered(0);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const current = questions[currentIndex];
  const options = optionsByIndex[currentIndex] || [];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={userEmail} isOwner={isOwner || false} isCollaborator={(isAdmin && !isOwner) || false} userRole={(userRole as 'owner' | 'admin' | 'collaborator' | null) || null} onSignOut={onSignOut} />
      <div className="pt-16">
        <BackButton onClick={onBack} />
        <div className="max-w-2xl mx-auto px-4 py-6">
          {gameState === 'ready' && (
            <Card className="mt-4">
              <CardContent className="p-6 text-center">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Which Subject?</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  Read each question — answers hidden! Name the subject it belongs to. 60 seconds.
                </p>
                {best > 0 && (
                  <p className="text-sm text-primary mb-4">
                    <Trophy className="w-4 h-4 inline mr-1" /> Best: {best}
                  </p>
                )}
                <Button onClick={startGame} size="lg" className="w-full" disabled={questions.length === 0}>
                  {questions.length === 0 ? 'Loading questions…' : 'Start'}
                </Button>
                {questions.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Connect once so your offline study pack downloads — then this works anywhere.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {gameState === 'playing' && current && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" /> {timeLeft}s
                </Badge>
                <Badge>Score: {score}</Badge>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                >
                  <Card className={lastAnswer === 'correct' ? 'border-green-500' : lastAnswer === 'wrong' ? 'border-destructive' : ''}>
                    <CardContent className="p-6">
                      <p className="font-medium mb-2">{stripQuestionHtml(current.question)}</p>
                      {lastAnswer === 'wrong' && (
                        <p className="text-sm font-semibold text-destructive">
                          That was {label(current.subject)}!
                        </p>
                      )}
                      {lastAnswer === 'correct' && (
                        <p className="text-sm font-semibold text-green-500">Correct!</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {options.map((s) => (
                  <Button
                    key={s}
                    size="lg"
                    variant="outline"
                    className="h-14 capitalize"
                    onClick={() => answer(s)}
                    disabled={!!lastAnswer}
                  >
                    {label(s)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <Card className="mt-4">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
                <h2 className="text-3xl font-bold mb-1">{score}</h2>
                <p className="text-muted-foreground mb-1 text-sm">
                  {answered} sorted{best > 0 && ` • Best: ${Math.max(best, score)}`}
                </p>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1 gap-2" onClick={restart}>
                    <RotateCcw className="w-4 h-4" /> Again
                  </Button>
                  <Button className="flex-1" onClick={onBack}>Menu</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {showQuizLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <FeatureLimitReached
            featureType="quick_quiz"
            onUpgrade={onUpgradeClick}
            onBonusEarned={() => setShowQuizLimitModal(false)}
            className="max-w-md w-full"
          />
        </div>
      )}
    </div>
  );
};
