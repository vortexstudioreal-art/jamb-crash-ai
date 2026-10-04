import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Crown, Medal, Award, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { errorLogger } from '@/services/errorLogger';

interface LeaderboardProps {
  onBack: () => void;
  userEmail?: string;
}

interface LeaderboardEntry {
  id: string;
  user_id: string | null;
  full_name: string;
  total_score: number;
  questions_answered: number;
  average_accuracy: number | null;
  best_quiz_score: number | null;
  rank: number;
  is_placeholder: boolean | null;
}

export const Leaderboard = ({ onBack, userEmail }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_scores'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard_scores')
        .select('id, user_id, full_name, total_score, questions_answered, average_accuracy, best_quiz_score, rank, is_placeholder')
        .order('total_score', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Assign ranks
      const rankedData = (data || []).map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      setEntries(rankedData);

      // Find user's rank by user_id (email no longer exposed for privacy)
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        setCurrentUserId(user.id);
        const userEntry = rankedData.find(e => e.user_id === user.id);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      }
    } catch (error) {
      errorLogger.error(error, { component: 'Leaderboard', action: 'fetch leaderboard' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600',
          border: 'border-yellow-400',
          shadow: 'shadow-yellow-500/30',
          icon: <Crown className="w-8 h-8 text-yellow-900" />,
          label: 'Champion'
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-slate-300 via-gray-400 to-slate-500',
          border: 'border-slate-300',
          shadow: 'shadow-slate-400/30',
          icon: <Medal className="w-7 h-7 text-slate-700" />,
          label: 'Runner-up'
        };
      case 3:
        return {
          bg: 'bg-gradient-to-br from-amber-600 via-orange-700 to-amber-800',
          border: 'border-amber-600',
          shadow: 'shadow-amber-600/30',
          icon: <Award className="w-6 h-6 text-amber-200" />,
          label: 'Bronze'
        };
      default:
        return {
          bg: 'bg-muted',
          border: 'border-border',
          shadow: '',
          icon: null,
          label: ''
        };
    }
  };

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, 10);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Leaderboard
                </h1>
                <p className="text-muted-foreground text-sm">
                  Top 3 win scholarships! 🎓
                </p>
              </div>
            </div>
          </motion.div>

          {/* Scholarship Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-green-500/20 border border-primary/30"
          >
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Scholarship Competition</p>
                <p className="text-sm text-muted-foreground">
                  Top 3 students will receive full admission sponsorship!
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto shrink-0">Coming Soon</Badge>
            </div>
          </motion.div>

          {/* Podium - Top 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-end justify-center gap-2 sm:gap-4">
              {/* 2nd Place - Left, slightly lower */}
              {top3[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center w-[30%] max-w-[120px]"
                >
                  <div className={`w-full aspect-square rounded-2xl ${getPositionStyle(2).bg} ${getPositionStyle(2).border} border-2 flex flex-col items-center justify-center p-2 shadow-lg ${getPositionStyle(2).shadow}`}>
                    {getPositionStyle(2).icon}
                    <span className="text-xs font-bold text-slate-700 mt-1">2nd</span>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-semibold text-foreground text-sm truncate max-w-full">
                      {top3[1].full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{top3[1].total_score} pts</p>
                  </div>
                  {/* Podium stand */}
                  <div className="w-full h-16 bg-gradient-to-t from-slate-400 to-slate-300 rounded-t-lg mt-2" />
                </motion.div>
              )}

              {/* 1st Place - Center, tallest */}
              {top3[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center w-[35%] max-w-[140px] -mt-4"
                >
                  <div className={`w-full aspect-square rounded-2xl ${getPositionStyle(1).bg} ${getPositionStyle(1).border} border-2 flex flex-col items-center justify-center p-3 shadow-xl ${getPositionStyle(1).shadow}`}>
                    {getPositionStyle(1).icon}
                    <span className="text-xs font-bold text-yellow-900 mt-1">Champion</span>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-bold text-foreground truncate max-w-full">
                      {top3[0].full_name}
                    </p>
                    <p className="text-sm text-primary font-semibold">{top3[0].total_score} pts</p>
                  </div>
                  {/* Podium stand - tallest */}
                  <div className="w-full h-24 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg mt-2" />
                </motion.div>
              )}

              {/* 3rd Place - Right, shortest */}
              {top3[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center w-[28%] max-w-[110px]"
                >
                  <div className={`w-full aspect-square rounded-2xl ${getPositionStyle(3).bg} ${getPositionStyle(3).border} border-2 flex flex-col items-center justify-center p-2 shadow-lg ${getPositionStyle(3).shadow}`}>
                    {getPositionStyle(3).icon}
                    <span className="text-xs font-bold text-amber-200 mt-1">3rd</span>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-semibold text-foreground text-sm truncate max-w-full">
                      {top3[2].full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{top3[2].total_score} pts</p>
                  </div>
                  {/* Podium stand - shortest */}
                  <div className="w-full h-12 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg mt-2" />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Rest of the leaderboard (4-10) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="overflow-hidden">
              <div className="divide-y divide-border">
                {rest.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                      entry.user_id && entry.user_id === currentUserId ? 'bg-primary/10' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="font-bold text-foreground">{entry.rank}</span>
                    </div>

                    {/* Name & Stats */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {entry.full_name}
                        {entry.user_id && entry.user_id === currentUserId && (
                          <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.questions_answered} questions • {entry.average_accuracy != null ? `${entry.average_accuracy.toFixed(1)}%` : 'N/A'} accuracy
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground">{entry.total_score}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>

                    {/* Medal */}
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4 text-primary" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* User's rank if not in top 10 */}
          {userEmail && userRank && userRank > 10 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-4"
            >
              <Card className="p-4 bg-primary/10 border-primary/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-bold text-primary">{userRank}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Your Position</p>
                    <p className="text-xs text-muted-foreground">Keep studying to climb the ranks!</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Info Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-xs text-muted-foreground text-center mt-8"
          >
            Scores are based on quiz performance. Take more quizzes to improve your rank!
          </motion.p>
        </div>
      </div>
    </div>
  );
};
