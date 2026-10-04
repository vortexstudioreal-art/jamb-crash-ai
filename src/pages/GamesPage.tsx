import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Zap, Flame, Gamepad2, Lock } from 'lucide-react';

import { useEffect } from 'react';
import { useSeo } from '@/hooks/useSeo';

const SpeedRound = lazy(() => import('@/components/SpeedRound').then(m => ({ default: m.SpeedRound })));
const StreakChallenge = lazy(() => import('@/components/StreakChallenge').then(m => ({ default: m.StreakChallenge })));

const LazyFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <div className="h-8 w-48 mx-auto animate-pulse rounded-md bg-muted" />
      <div className="h-64 w-full animate-pulse rounded-md bg-muted" />
    </div>
  </div>
);

type GameMode = 'menu' | 'speed-round' | 'streak';

const GamesPage = () => {
  const { user, isAdmin, isOwner, isLoading } = useAuth();
  const navigate = useNavigate();

  useSeo({
    title: 'Quiz Games | Jamb Crash AI',
    description: 'Play Speed Round and Streak Challenge quiz games to make your JAMB practice fun and fast.',
    path: '/games',
  });

  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [userSubjects, setUserSubjects] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const userEmail = user?.email || '';
  const effectiveOwner = isOwner || false;

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!userEmail) return;
      const { data } = await supabase
        .from('user_subjects')
        .select('subjects')
        .eq('email', userEmail)
        .maybeSingle();
      if (data?.subjects) setUserSubjects(data.subjects as string[]);
    };
    fetchSubjects();
  }, [userEmail]);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.role) setUserRole(data.role);
    };
    fetchRole();
  }, [user?.id]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // The redirect must happen in an effect: calling navigate() during render is
  // a side effect during render, and it also fired before the session resolved,
  // which bounced a logged-in user to /auth on first paint.
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [isLoading, user, navigate]);

  // Wait for auth to settle so we don't flash the game menu at a signed-out user.
  if (isLoading) {
    return <LazyFallback />;
  }

  if (!user) {
    return null;
  }

  const effectiveSubjects = userSubjects.length > 0 ? userSubjects : ['english', 'mathematics'];

  if (gameMode === 'speed-round') {
    return (
      <Suspense fallback={<LazyFallback />}>
        <SpeedRound
          userEmail={userEmail}
          subjects={effectiveSubjects}
          isOwner={effectiveOwner}
          isAdmin={isAdmin}
          userRole={userRole}
          onSignOut={handleSignOut}
          onBack={() => setGameMode('menu')}
        />
      </Suspense>
    );
  }

  if (gameMode === 'streak') {
    return (
      <Suspense fallback={<LazyFallback />}>
        <StreakChallenge
          userEmail={userEmail}
          subjects={effectiveSubjects}
          isOwner={effectiveOwner}
          isAdmin={isAdmin}
          userRole={userRole}
          onSignOut={handleSignOut}
          onBack={() => setGameMode('menu')}
        />
      </Suspense>
    );
  }

  const games = [
    {
      id: 'speed-round' as GameMode,
      title: '⚡ Speed Round',
      description: 'Answer as many questions as you can in 60 seconds!',
      icon: Zap,
      color: 'text-primary',
      borderColor: 'border-primary/30 hover:border-primary',
      bgColor: 'hover:bg-primary/5',
    },
    {
      id: 'streak' as GameMode,
      title: '🔥 Streak Challenge',
      description: "Keep your streak alive! 3 lives, don't break the chain.",
      icon: Flame,
      color: 'text-orange-500',
      borderColor: 'border-orange-500/30 hover:border-orange-500',
      bgColor: 'hover:bg-orange-500/5',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Games</h1>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground mb-6"
        >
          Challenge yourself with fun quiz games to boost your JAMB prep!
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all ${game.borderColor} ${game.bgColor}`}
                onClick={() => setGameMode(game.id)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <game.icon className={`w-12 h-12 ${game.color}`} />
                  <h3 className="font-bold text-lg text-foreground">{game.title}</h3>
                  <p className="text-sm text-muted-foreground">{game.description}</p>
                  <Button variant="outline" className="mt-2">
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Coming Soon</h2>
          <Card className="border-dashed border-muted-foreground/30">
            <CardContent className="p-6 flex items-center gap-4 opacity-50">
              <Lock className="w-8 h-8 text-muted-foreground" />
              <div>
                <h3 className="font-bold text-foreground">More games coming!</h3>
                <p className="text-sm text-muted-foreground">We're building more fun ways to practice. Stay tuned!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default GamesPage;
