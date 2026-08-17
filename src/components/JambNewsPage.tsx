import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, RefreshCw, Newspaper, AlertCircle, Globe, Clock, Sparkles, Bell, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface NewsItem {
  title: string;
  link: string | null;
  date: string;
  summary: string | null;
}

interface JambNewsPageProps {
  onBack: () => void;
}

// Other reliable JAMB news sources
const RELIABLE_SOURCES = [
  { name: 'JAMB Official Website', url: 'https://www.jamb.gov.ng', description: 'Official JAMB portal' },
  { name: 'MySchool JAMB News', url: 'https://myschool.ng/news/category/jamb', description: 'Latest JAMB updates' },
  { name: 'NigeriaSchoolsInfo', url: 'https://nigeriaschoolsinfo.com.ng/category/jamb', description: 'JAMB news & guides' },
];

export const JambNewsPage = ({ onBack }: JambNewsPageProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [sendingNotification, setSendingNotification] = useState<number | null>(null);
  const { isAdmin, isOwner } = useAuth();

  const canSendNotifications = isAdmin && isOwner;

  const sendNotificationFromNews = async (newsItem: NewsItem, index: number) => {
    setSendingNotification(index);
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          title: `🚨 ${newsItem.title}`,
          message: newsItem.summary || `New JAMB update: ${newsItem.title}. Check the JAMB News section for details.`,
          type: 'info',
          is_global: true,
          link: newsItem.link,
        });

      if (error) throw error;
      toast.success('Notification sent to all users! 📢');
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error('Failed to send notification');
    } finally {
      setSendingNotification(null);
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('jamb-news');

      if (fnError) {
        throw fnError;
      }

      if (data?.success && data?.items) {
        setNews(data.items);
        setLastFetched(new Date());
        if (data.items.length === 0) {
          toast.info('No news items found. Check the official sources below.');
        }
      } else {
        setError(data?.error || 'Failed to fetch news');
        setNews([]);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Could not load news. Please try the official sources below.');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-primary/10 pt-20 pb-12 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"
              >
                <Newspaper className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  JAMB News & Updates
                </h1>
                <p className="text-muted-foreground">
                  Stay informed with the latest JAMB announcements
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={fetchNews}
              disabled={loading}
              className="gap-2 bg-background"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {lastFetched && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              Last updated: {lastFetched.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-2 h-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="font-medium text-destructive">Unable to load news</p>
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
            </motion.div>
          )}

          {/* News Items */}
          {!loading && news.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 mb-8"
            >
              {news.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-lg transition-all hover:border-primary/30 group">
                    <div className="flex gap-4">
                      {/* Accent bar */}
                      <div className={`w-1.5 rounded-full shrink-0 ${index === 0 ? 'bg-gradient-to-b from-cyan-500 to-blue-500' : 'bg-muted-foreground/20'}`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {index === 0 && (
                                <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/30 text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Latest
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {item.date}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                            {item.summary && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.summary}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {canSendNotifications && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendNotificationFromNews(item, index)}
                                disabled={sendingNotification === index}
                                className="opacity-60 hover:opacity-100 transition-opacity text-primary"
                                title="Send as notification to all users"
                              >
                                {sendingNotification === index ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            {item.link && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="opacity-60 group-hover:opacity-100 transition-opacity"
                              >
                                <a href={item.link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && news.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border"
            >
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">
                No news available at the moment
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Check the official sources below for updates
              </p>
              <Button variant="outline" onClick={fetchNews}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </motion.div>
          )}

          {/* Reliable Sources Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Official & Reliable Sources
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {RELIABLE_SOURCES.map((source, index) => (
                <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col h-full">
                    <h3 className="font-medium text-foreground mb-1">{source.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 flex-1">{source.description}</p>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-muted-foreground text-center mt-8"
          >
            News is fetched from official JAMB website. Always verify important information on{' '}
            <a 
              href="https://www.jamb.gov.ng" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.jamb.gov.ng
            </a>
          </motion.p>
        </div>
      </div>
    </div>
  );
};
