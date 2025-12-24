import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface NovelProgressProps {
  userEmail: string;
}

export const NovelProgress = ({ userEmail }: NovelProgressProps) => {
  const [stats, setStats] = useState({
    totalNovels: 0,
    inProgress: 0,
    completed: 0,
    totalReadingTime: 0,
  });
  const [recentlyRead, setRecentlyRead] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      
      // Get user progress
      const { data: progressData } = await supabase
        .from('user_novel_progress')
        .select('*, novel:novels(title, author, total_chapters)')
        .eq('email', userEmail)
        .order('last_read_at', { ascending: false });
      
      if (progressData) {
        const completed = progressData.filter(p => p.is_completed).length;
        const inProgress = progressData.filter(p => !p.is_completed && p.progress_percent > 0).length;
        const totalTime = progressData.reduce((acc, p) => acc + (p.total_time_spent_seconds || 0), 0);
        
        setStats({
          totalNovels: progressData.length,
          inProgress,
          completed,
          totalReadingTime: Math.round(totalTime / 60), // Convert to minutes
        });
        
        setRecentlyRead(progressData.slice(0, 3));
      }
      
      setLoading(false);
    };
    
    loadStats();
  }, [userEmail]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5 text-primary" />
          Your Reading Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-3 rounded-lg bg-muted/50"
          >
            <Book className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-foreground">{stats.totalNovels}</p>
            <p className="text-xs text-muted-foreground">Books Started</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center p-3 rounded-lg bg-muted/50"
          >
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center p-3 rounded-lg bg-muted/50"
          >
            <BookOpen className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center p-3 rounded-lg bg-muted/50"
          >
            <Clock className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <p className="text-2xl font-bold text-foreground">{stats.totalReadingTime}</p>
            <p className="text-xs text-muted-foreground">Minutes Read</p>
          </motion.div>
        </div>
        
        {/* Recently Read */}
        {recentlyRead.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Recently Read</h3>
            <div className="space-y-3">
              {recentlyRead.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Book className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {item.novel?.title || 'Unknown'}
                    </p>
                    <Progress value={item.progress_percent} className="h-1.5 mt-1" />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.progress_percent}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {stats.totalNovels === 0 && (
          <p className="text-center text-muted-foreground py-4">
            You haven't started reading any novels yet. 
            <br />
            <span className="text-sm">Explore the library to begin!</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};
