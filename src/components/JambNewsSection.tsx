import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink, Clock, AlertCircle, Bell, ChevronRight } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: 'update' | 'deadline' | 'announcement' | 'tips';
  isUrgent?: boolean;
  link?: string;
}

// Static news data - In production, this would come from an API or database
const newsData: NewsItem[] = [
  {
    id: '1',
    title: '2026 UTME Registration Opens Soon',
    summary: 'JAMB announces the commencement of 2026 UTME registration. Candidates should prepare their documents and ensure their NIN is ready.',
    date: '2025-12-28',
    category: 'announcement',
    isUrgent: true,
  },
  {
    id: '2',
    title: 'Updated JAMB Syllabus for 2026',
    summary: 'JAMB has released minor updates to the syllabus for selected subjects. Review the changes to stay prepared.',
    date: '2025-12-20',
    category: 'update',
  },
  {
    id: '3',
    title: 'Mock Exam Date Announced',
    summary: 'The 2026 JAMB Mock examination has been scheduled. Participating in the mock exam is optional but highly recommended.',
    date: '2025-12-15',
    category: 'deadline',
  },
  {
    id: '4',
    title: 'Tips: How to Score 300+ in JAMB',
    summary: 'Expert tips from top scorers on how to prepare effectively and maximize your JAMB score.',
    date: '2025-12-10',
    category: 'tips',
  },
  {
    id: '5',
    title: 'CBT Centers Registration Guidelines',
    summary: 'Guidelines for selecting your preferred CBT center during registration. Choose wisely based on location and facilities.',
    date: '2025-12-05',
    category: 'announcement',
  },
];

const categoryStyles = {
  update: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Update' },
  deadline: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Deadline' },
  announcement: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Announcement' },
  tips: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Tips' },
};

export const JambNewsSection = () => {
  const [showAll, setShowAll] = useState(false);
  const displayedNews = showAll ? newsData : newsData.slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="mb-8"
    >
      <Card className="border-primary/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Newspaper className="w-5 h-5 text-primary" />
            JAMB News & Updates 📰
          </CardTitle>
          <p className="text-sm text-muted-foreground">Stay informed with the latest JAMB announcements</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {displayedNews.map((news, index) => {
              const style = categoryStyles[news.category];
              return (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                    news.isUrgent ? 'border-red-500/30 bg-red-500/5' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="secondary" className={`${style.bg} ${style.text} text-xs`}>
                          {style.label}
                        </Badge>
                        {news.isUrgent && (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(news.date)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1 line-clamp-1">{news.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{news.summary}</p>
                    </div>
                    {news.link && (
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {newsData.length > 3 && (
            <Button
              variant="ghost"
              className="w-full mt-4 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `View All ${newsData.length} Updates`}
              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showAll ? 'rotate-90' : ''}`} />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
