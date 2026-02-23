import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Book, Search, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { NovelCard } from './NovelCard';
import { NovelProgress } from './NovelProgress';
import { supabase } from '@/integrations/supabase/client';
import { saveNovels, getCachedNovels, saveNovelChapters } from '@/services/offlineStorage';

interface Novel {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_image_url: string | null;
  category: string;
  total_chapters: number;
  year: number | null;
  is_premium: boolean;
}

interface NovelBrowserProps {
  userEmail: string;
  onBack: () => void;
  onSelectNovel: (novelId: string) => void;
}

const categories = [
  { value: 'all', label: 'All' },
  { value: 'general_reading', label: 'General Reading' },
  { value: 'african_prose', label: 'African Prose' },
  { value: 'non_african_prose', label: 'Non-African Prose' },
  { value: 'african_drama', label: 'African Drama' },
  { value: 'non_african_drama', label: 'Non-African Drama' },
  { value: 'african_poetry', label: 'African Poetry' },
  { value: 'non_african_poetry', label: 'Non-African Poetry' },
];

export const NovelBrowser = ({ userEmail, onBack, onSelectNovel }: NovelBrowserProps) => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [filteredNovels, setFilteredNovels] = useState<Novel[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const loadNovels = async () => {
      setLoading(true);
      
      try {
        // Try loading from network first
        const { data: novelsData, error } = await supabase
          .from('novels')
          .select('*')
          .order('year', { ascending: false })
          .order('title');
        
        if (novelsData && !error) {
          setNovels(novelsData);
          setFilteredNovels(novelsData);
          
          // Cache novels for offline use
          await saveNovels(novelsData);
          
          // Pre-cache all chapters in background
          cacheAllChapters(novelsData.map(n => n.id));
        } else {
          throw new Error('Network fetch failed');
        }
        
        // Load user progress
        const { data: progressData } = await supabase
          .from('user_novel_progress')
          .select('novel_id, progress_percent')
          .eq('email', userEmail);
        
        if (progressData) {
          const progressMap: Record<string, number> = {};
          progressData.forEach(p => {
            progressMap[p.novel_id] = p.progress_percent;
          });
          setUserProgress(progressMap);
        }
      } catch {
        // Fallback to cached data
        console.log('[Offline] Loading novels from cache');
        setIsOffline(true);
        const cachedNovels = await getCachedNovels();
        if (cachedNovels.length > 0) {
          const mapped = cachedNovels.map(n => ({
            ...n,
            total_chapters: n.total_chapters || 0,
            is_premium: n.is_premium || false,
          })) as Novel[];
          setNovels(mapped);
          setFilteredNovels(mapped);
        }
      }
      
      setLoading(false);
    };
    
    loadNovels();
  }, [userEmail]);

  // Pre-cache chapters in background
  const cacheAllChapters = async (novelIds: string[]) => {
    try {
      const { data: chapters } = await supabase
        .from('novel_chapters')
        .select('id, novel_id, chapter_number, title, content, estimated_reading_time, word_count, likely_questions')
        .in('novel_id', novelIds);
      
      if (chapters && chapters.length > 0) {
        await saveNovelChapters(chapters);
        console.log(`[Offline] Cached ${chapters.length} novel chapters`);
      }
    } catch (err) {
      console.error('Failed to cache novel chapters:', err);
    }
  };

  useEffect(() => {
    let filtered = novels;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.author.toLowerCase().includes(query)
      );
    }
    
    setFilteredNovels(filtered);
  }, [novels, selectedCategory, searchQuery]);

  const inProgressNovels = novels.filter(n => {
    const progress = userProgress[n.id];
    return progress && progress > 0 && progress < 100;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Offline indicator */}
      {isOffline && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center">
          <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            Offline mode — showing cached novels
          </p>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Book className="w-5 h-5 text-primary" />
                  JAMB Literary Texts
                </h1>
                <p className="text-sm text-muted-foreground">2025/2026 JAMB Literature-in-English Syllabus</p>
              </div>
            </div>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <ScrollArea className="w-full whitespace-nowrap">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="inline-flex h-9 bg-muted/50">
                {categories.map(cat => (
                  <TabsTrigger 
                    key={cat.value} 
                    value={cat.value}
                    className="text-xs px-3"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <NovelProgress userEmail={userEmail} />
            </motion.div>

            {inProgressNovels.length > 0 && selectedCategory === 'all' && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <h2 className="text-lg font-bold text-foreground mb-4">📚 Continue Reading</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {inProgressNovels.slice(0, 4).map(novel => (
                    <NovelCard
                      key={novel.id}
                      id={novel.id}
                      title={novel.title}
                      author={novel.author}
                      coverImageUrl={novel.cover_image_url || undefined}
                      category={novel.category}
                      totalChapters={novel.total_chapters}
                      year={novel.year || undefined}
                      isPremium={novel.is_premium}
                      progress={userProgress[novel.id]}
                      onClick={() => onSelectNovel(novel.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-bold text-foreground mb-4">
                {selectedCategory === 'all' ? '📖 All Literary Texts' : `📖 ${categories.find(c => c.value === selectedCategory)?.label}`}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredNovels.length} {filteredNovels.length === 1 ? 'book' : 'books'})
                </span>
              </h2>
              
              {filteredNovels.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl">
                  <Book className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No novels found</p>
                  {searchQuery && (
                    <Button 
                      variant="link" 
                      onClick={() => setSearchQuery('')}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredNovels.map((novel, index) => (
                    <motion.div
                      key={novel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NovelCard
                        id={novel.id}
                        title={novel.title}
                        author={novel.author}
                        coverImageUrl={novel.cover_image_url || undefined}
                        category={novel.category}
                        totalChapters={novel.total_chapters}
                        year={novel.year || undefined}
                        isPremium={novel.is_premium}
                        progress={userProgress[novel.id]}
                        onClick={() => onSelectNovel(novel.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};