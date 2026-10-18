import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BackButton } from '@/components/BackButton';
import { DashboardHeader } from '@/components/DashboardHeader';
import { loadGameQuestions, gameOptionOf, rememberQuestionIds, type GameQuestion } from '@/lib/gameQuestions';
import { stripQuestionHtml } from '@/lib/sanitize';
import { useFeatureUsage } from '@/hooks/useFeatureUsage';
import { FeatureLimitReached } from '@/components/FeatureLimitReached';

interface TrueFalseRushProps {
  userEmail: string;
  subjects: string[];
  isOwner?: boolean;
  isAdmin?: boolean;
  userRole?: string | null;
  onSignOut: () => void;
  onBack: () => void;
  onUpgradeClick?: (plan?: string) => void;
}

interface Claim {
  question: GameQuestion;
  letter: string;
  text: string;
  isTrue: boolean;
}

type GameState = 'ready' | 'playing' | 'finished';

const GAME_DURATION = 60;
const BEST_KEY = 'jamb_tf_best';

const buildClaim = (q: GameQuestion): Claim => {
  const correct = (q.correct_answer || '').toUpperCase();
  // Half the cards state the truth, half state a lie.
  const isTrue = Math.random() < 0.5;
  const letter = isTrue
    ? correct
    : ['A', 'B', 'C', 'D'].filter((l) => l !== correct)[Math.floor(Math.random() * 3)];
  return { question: q, letter, text: gameOptionOf(q, letter), isTrue };
};

export const TrueFalseRush = ({ userEmail, subjects, isOwner, isAdmin, userRole, onSignOut, onBack, onUpgradeClick }: TrueFalseRushProps) => {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
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

  const loadClaims = useCallback(async () => {
    const pool = await loadGameQuestions(subjects, 60);
    setClaims(pool.map(buildClaim));
  }, [subjects]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const finish = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('finished');
    // Persist the best and refresh the badge from the SAME value. Writing
    // inside setScore's updater and reading in setBest's updater raced, so a
    // fresh personal best could display the previous score.
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
    if (claims.length === 0) {
      await loadClaims();
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
    setStreak(0);
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

  const answer = (saidTrue: boolean) => {
    const claim = claims[currentIndex];
    if (!claim || gameState !== 'playing') return;
    rememberQuestionIds([claim.question.id]);
    const correct = saidTrue === claim.isTrue;
    setLastAnswer(correct ? 'correct' : 'wrong');
    if (correct) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      // Streak bonus: every 5th straight correct earns a bonus point.
      setScore((s) => {
        const next = s + (nextStreak % 5 === 0 ? 2 : 1);
        scoreRef.current = next;
        return next;
      });
    } else {
      setStreak(0);
    }
    setAnswered((a) => a + 1);
    setTimeout(() => {
      setLastAnswer(null);
      if (currentIndex + 1 < claims.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        finish();
      }
    }, 450);
  };

  const restart = () => {
    clearInterval(timerRef.current);
    loadClaims();
    setGameState('ready');
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setStreak(0);
    setAnswered(0);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const current = claims[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={userEmail} isOwner={isOwner || false} isCollaborator={(isAdmin && !isOwner) || false} userRole={(userRole as 'owner' | 'admin' | 'collaborator' | null) || null} onSignOut={onSignOut} />
      <div className="pt-16">
        <BackButton onClick={onBack} />
        <div className="max-w-2xl mx-auto px-4 py-6">
        {gameState === 'ready' && (
          <Card className="mt-4">
            <CardContent className="p-6 text-center">
              <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <X className="w-12 h-12 mx-auto mb-3 text-destructive -mt-10 ml-[55%]" />
              <h2 className="text-2xl font-bold mb-2">True / False Rush</h2>
              <p className="text-muted-foreground mb-4 text-sm">
                A claim appears under each question. Smash TRUE or FALSE — 60 seconds, streaks earn bonus points.
              </p>
              {best > 0 && (
                <p className="text-sm text-primary mb-4">
                  <Trophy className="w-4 h-4 inline mr-1" /> Best: {best}
                </p>
              )}
              <Button onClick={startGame} size="lg" className="w-full" disabled={claims.length === 0}>
                {claims.length === 0 ? 'Loading questions…' : 'Start'}
              </Button>
              {claims.length === 0 && (
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
              {streak >= 2 && <Badge className="bg-orange-500">🔥 {streak}</Badge>}
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
                    <p className="font-medium mb-4">{stripQuestionHtml(current.question.question)}</p>
                    <div className="rounded-xl bg-muted p-4 mb-2">
                      <p className="text-sm text-muted-foreground mb-1">
                        Claim: option {current.letter} says…
                      </p>
                      <p className="font-bold text-lg">“{stripQuestionHtml(current.text)}”</p>
                    </div>
                    {lastAnswer && (
                      <p className={`text-sm font-semibold ${lastAnswer === 'correct' ? 'text-green-500' : 'text-destructive'}`}>
                        {lastAnswer === 'correct'
                          ? 'Correct!'
                          : `Wrong — the answer is ${current.question.correct_answer}. ${stripQuestionHtml(gameOptionOf(current.question, current.question.correct_answer))}`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 h-16 text-lg gap-2" onClick={() => answer(true)} disabled={!!lastAnswer}>
                <Check className="w-6 h-6" /> TRUE
              </Button>
              <Button size="lg" variant="destructive" className="h-16 text-lg gap-2" onClick={() => answer(false)} disabled={!!lastAnswer}>
                <X className="w-6 h-6" /> FALSE
              </Button>
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <Card className="mt-4">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
              <h2 className="text-3xl font-bold mb-1">{score}</h2>
              <p className="text-muted-foreground mb-1 text-sm">
                {answered} claims judged{best > 0 && ` • Best: ${Math.max(best, score)}`}
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
