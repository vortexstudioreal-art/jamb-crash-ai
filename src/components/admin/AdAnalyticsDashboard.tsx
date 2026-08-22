import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Play, CheckCircle, XCircle, Gift, RefreshCw, 
  Smartphone, Monitor, Calendar, BarChart3 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { errorLogger } from '@/services/errorLogger';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend,
  CartesianGrid, Tooltip
} from 'recharts';

interface AdStats {
  totalAdsStarted: number;
  totalAdsCompleted: number;
  totalAdsFailed: number;
  totalRewardsClaimed: number;
  completionRate: number;
  avgDurationWatched: number;
}

interface DailyStats {
  date: string;
  started: number;
  completed: number;
  rewards: number;
}

interface PlatformStats {
  platform: string;
  count: number;
}

interface FeatureStats {
  feature: string;
  count: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export const AdAnalyticsDashboard = () => {
  const [stats, setStats] = useState<AdStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [featureStats, setFeatureStats] = useState<FeatureStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    
    const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    try {
      // Fetch all ad analytics within date range
      const { data, error } = await supabase
        .from('ad_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        errorLogger.error(error, { component: 'AdAnalyticsDashboard', action: 'fetch ad analytics' });
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setStats({
          totalAdsStarted: 0,
          totalAdsCompleted: 0,
          totalAdsFailed: 0,
          totalRewardsClaimed: 0,
          completionRate: 0,
          avgDurationWatched: 0,
        });
        setDailyStats([]);
        setPlatformStats([]);
        setFeatureStats([]);
        setLoading(false);
        return;
      }

      // Calculate overall stats
      const started = data.filter(d => d.event_type === 'ad_started').length;
      const completed = data.filter(d => d.event_type === 'ad_completed').length;
      const failed = data.filter(d => d.event_type === 'ad_failed').length;
      const rewards = data.filter(d => d.event_type === 'reward_claimed').length;
      
      const durations = data
        .filter(d => d.duration_watched !== null)
        .map(d => d.duration_watched as number);
      const avgDuration = durations.length > 0 
        ? durations.reduce((a, b) => a + b, 0) / durations.length 
        : 0;

      setStats({
        totalAdsStarted: started,
        totalAdsCompleted: completed,
        totalAdsFailed: failed,
        totalRewardsClaimed: rewards,
        completionRate: started > 0 ? (completed / started) * 100 : 0,
        avgDurationWatched: avgDuration,
      });

      // Calculate daily stats
      const dailyMap = new Map<string, { started: number; completed: number; rewards: number }>();
      
      data.forEach(item => {
        const date = new Date(item.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { started: 0, completed: 0, rewards: 0 });
        }
        
        const current = dailyMap.get(date)!;
        if (item.event_type === 'ad_started') current.started++;
        if (item.event_type === 'ad_completed') current.completed++;
        if (item.event_type === 'reward_claimed') current.rewards++;
      });

      setDailyStats(
        Array.from(dailyMap.entries()).map(([date, stats]) => ({
          date,
          ...stats,
        }))
      );

      // Calculate platform stats
      const platformMap = new Map<string, number>();
      data.forEach(item => {
        const platform = item.platform || 'unknown';
        platformMap.set(platform, (platformMap.get(platform) || 0) + 1);
      });

      setPlatformStats(
        Array.from(platformMap.entries()).map(([platform, count]) => ({
          platform: platform.charAt(0).toUpperCase() + platform.slice(1),
          count,
        }))
      );

      // Calculate feature stats
      const featureMap = new Map<string, number>();
      data.filter(d => d.event_type === 'reward_claimed').forEach(item => {
        const feature = item.feature_type || 'unknown';
        featureMap.set(feature, (featureMap.get(feature) || 0) + 1);
      });

      setFeatureStats(
        Array.from(featureMap.entries())
          .map(([feature, count]) => ({
            feature: feature.replace('_', ' '),
            count,
          }))
          .sort((a, b) => b.count - a.count)
      );

    } catch (err) {
      errorLogger.error(err, { component: 'AdAnalyticsDashboard', action: 'process analytics' });
    }

    setLoading(false);
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const chartConfig = {
    started: {
      label: "Started",
      color: "hsl(var(--primary))",
    },
    completed: {
      label: "Completed",
      color: "hsl(var(--chart-2))",
    },
    rewards: {
      label: "Rewards",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header with date range */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Ad Analytics
          </h2>
          <p className="text-muted-foreground text-sm">
            Track ad engagement and reward claims
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={dateRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={dateRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={dateRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('90d')}
          >
            90 Days
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchAnalytics}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalAdsStarted || 0}</p>
                  <p className="text-xs text-muted-foreground">Ads Started</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalAdsCompleted || 0}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Gift className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalRewardsClaimed || 0}</p>
                  <p className="text-xs text-muted-foreground">Rewards Claimed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.completionRate.toFixed(1) || 0}%</p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                Daily Ad Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyStats.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <BarChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="started" fill="var(--color-started)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rewards" fill="var(--color-rewards)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available for this period
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Platform Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Smartphone className="w-4 h-4" />
                Platform Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {platformStats.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ platform, percent }) => `${platform}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {platformStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No platform data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Feature Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="w-4 h-4" />
              Rewards by Feature
            </CardTitle>
          </CardHeader>
          <CardContent>
            {featureStats.length > 0 ? (
              <div className="space-y-3">
                {featureStats.map((item, index) => (
                  <div key={item.feature} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-muted-foreground capitalize truncate">
                      {item.feature}
                    </div>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / featureStats[0].count) * 100}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <div className="w-12 text-sm font-medium text-right">
                      {item.count}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No reward data available for this period
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Failed Ads Info */}
      {stats && stats.totalAdsFailed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-500">
                <XCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">
                    {stats.totalAdsFailed} Ad{stats.totalAdsFailed !== 1 ? 's' : ''} Failed to Load
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check AdMob configuration and network connectivity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
