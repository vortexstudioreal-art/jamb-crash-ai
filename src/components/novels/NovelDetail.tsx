import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Book, BookOpen, Check, Clock, Play, Star, User, WifiOff, FileText, Download, ExternalLink, Lock, Maximize2, Minimize2, ZoomIn, ZoomOut, Moon, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { getCachedNovel, getCachedChaptersByNovel } from '@/services/offlineStorage';

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  estimated_reading_time: number;
}

interface NovelDetailProps {
  novelId: string;
  userEmail: string;
  onBack: () => void;
  onStartReading: (chapterId: string) => void;
}

export const NovelDetail = ({ novelId, userEmail, onBack, onStartReading }: NovelDetailProps) => {
  const [novel, setNovel] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [nightMode, setNightMode] = useState(false);

  useEffect(() => {
    if (!focusMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusMode(false);
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(200, z + 10));
      if (e.key === '-') setZoom((z) => Math.max(50, z - 10));
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [focusMode]);

  useEffect(() => {
    const checkAccess = async () => {
      if (!userEmail) return;
      const { data } = await supabase.rpc('check_user_access', { user_email: userEmail });
      if (data && data[0]) setHasAccess(!!data[0].has_access);
    };
    checkAccess();
  }, [userEmail]);

  useEffect(() => {
    const loadPdf = async () => {
      if (!novel) return;
      if (novel.full_book_pdf_url) {
        setPdfUrl(novel.full_book_pdf_url);
        return;
      }
      if (novel.full_book_pdf_path) {
        setPdfLoading(true);
        const { data, error } = await supabase.storage
          .from('book-pdfs')
          .createSignedUrl(novel.full_book_pdf_path, 60 * 60);
        if (!error && data?.signedUrl) setPdfUrl(data.signedUrl);
        setPdfLoading(false);
      }
    };
    loadPdf();
  }, [novel]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Try network first
        const { data: novelData, error: novelError } = await supabase
          .from('novels')
          .select('*')
          .eq('id', novelId)
          .single();
        
        if (novelError) throw novelError;
        if (novelData) setNovel(novelData);
        
        const { data: chaptersData } = await supabase
          .from('novel_chapters')
          .select('id, chapter_number, title, estimated_reading_time')
          .eq('novel_id', novelId)
          .order('chapter_number');
        
        if (chaptersData) setChapters(chaptersData);
        
        const { data: progressData } = await supabase
          .from('user_novel_progress')
          .select('*, current_chapter:novel_chapters(chapter_number)')
          .eq('novel_id', novelId)
          .eq('email', userEmail)
          .maybeSingle();
        
        if (progressData) setProgress(progressData);
      } catch {
        // Fallback to cache
        console.log('[Offline] Loading novel detail from cache');
        setIsOffline(true);
        
        const cachedNovel = await getCachedNovel(novelId);
        if (cachedNovel) {
          setNovel(cachedNovel);
        }
        
        const cachedChapters = await getCachedChaptersByNovel(novelId);
        if (cachedChapters.length > 0) {
          setChapters(
            cachedChapters
              .map(ch => ({
                id: ch.id,
                chapter_number: ch.chapter_number,
                title: ch.title,
                estimated_reading_time: ch.estimated_reading_time || 5,
              }))
              .sort((a, b) => a.chapter_number - b.chapter_number)
          );
        }
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [novelId, userEmail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="text-center py-12">
        <Book className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Novel not available</h3>
        <p className="text-muted-foreground mb-1">
          {navigator.onLine 
            ? "This novel couldn't be loaded." 
            : "This novel hasn't been cached for offline reading."}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {!navigator.onLine && "Open it once while online to cache it."}
        </p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const currentChapterNumber = progress?.current_chapter?.chapter_number || 0;
  const totalReadingTime = chapters.reduce((acc, ch) => acc + ch.estimated_reading_time, 0);
  
  const handleStartReading = () => {
    const startChapter = progress?.current_chapter_id || chapters[0]?.id;
    if (startChapter) {
      onStartReading(startChapter);
    }
  };

  const hasFullBook = !!(novel?.full_book_pdf_url || novel?.full_book_pdf_path);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {isOffline && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 mb-4 text-center">
          <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            Offline mode — reading from cache
          </p>
        </div>
      )}

      <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
      </Button>
      
      {/* Novel Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 mb-8"
      >
        <div className="w-full md:w-48 h-64 rounded-xl bg-gradient-to-br from-primary/20 to-accent overflow-hidden flex-shrink-0">
          {novel.cover_image_url ? (
            <img 
              src={novel.cover_image_url} 
              alt={novel.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Book className="w-20 h-20 text-primary/40" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {novel.year === 2025 && (
              <Badge className="bg-primary text-primary-foreground">NEW 2025</Badge>
            )}
            {novel.is_premium && (
              <Badge variant="secondary">
                <Star className="w-3 h-3 mr-1" /> Premium
              </Badge>
            )}
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{novel.title}</h1>
          
          <p className="flex items-center gap-2 text-muted-foreground mb-4">
            <User className="w-4 h-4" />
            {novel.author}
          </p>
          
          <p className="text-muted-foreground mb-4 line-clamp-3">{novel.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {chapters.length} chapters
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              ~{totalReadingTime} min read
            </span>
          </div>
          
          {progress && progress.progress_percent > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Your Progress</span>
                <span className="text-primary font-medium">{progress.progress_percent}%</span>
              </div>
              <Progress value={progress.progress_percent} className="h-2" />
              {currentChapterNumber > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Currently on Chapter {currentChapterNumber}
                </p>
              )}
            </div>
          )}
          
          <Button 
            onClick={handleStartReading}
            className="gradient-primary text-primary-foreground"
            size="lg"
            disabled={chapters.length === 0}
          >
            <Play className="w-4 h-4 mr-2" />
            {progress?.progress_percent > 0 ? 'Continue Reading' : 'Start Reading'}
          </Button>
        </div>
      </motion.div>
      
      {/* Tabs: Study Guide | Full Book */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="guide">
              <BookOpen className="w-4 h-4 mr-2" />
              Study Guide
            </TabsTrigger>
            <TabsTrigger value="fullbook">
              <FileText className="w-4 h-4 mr-2" />
              Full Book
              {hasFullBook && <Badge variant="secondary" className="ml-2 h-5 text-xs">PDF</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guide">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Table of Contents
            </h2>
            <ScrollArea className="h-[400px] rounded-lg border bg-card p-4">
          {chapters.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No chapters available yet
            </p>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => {
                const isCompleted = currentChapterNumber > chapter.chapter_number;
                const isCurrent = currentChapterNumber === chapter.chapter_number;
                
                return (
                  <motion.div
                    key={chapter.id}
                    whileHover={{ x: 4 }}
                    onClick={() => onStartReading(chapter.id)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      isCurrent 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted 
                          ? 'bg-primary text-primary-foreground' 
                          : isCurrent
                          ? 'bg-primary/20 text-primary border border-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : chapter.chapter_number}
                      </div>
                      <div>
                        <p className={`font-medium ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                          {chapter.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ~{chapter.estimated_reading_time} min read
                        </p>
                      </div>
                    </div>
                    
                    {isCurrent && (
                      <Badge variant="outline" className="text-primary border-primary">
                        Continue
                      </Badge>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="fullbook">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Full Book (PDF)
            </h2>

            {!hasFullBook ? (
              <div className="rounded-lg border bg-card p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-foreground font-medium mb-1">Full book PDF not available yet</p>
                <p className="text-sm text-muted-foreground">
                  We're working on adding the complete book. For now, use the Study Guide.
                </p>
              </div>
            ) : !hasAccess ? (
              <div className="rounded-lg border bg-card p-8 text-center">
                <Lock className="w-12 h-12 mx-auto text-primary mb-3" />
                <p className="text-foreground font-medium mb-1">Premium content</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Upgrade to read the full book PDF.
                </p>
                <Button onClick={onBack} variant="outline">Back</Button>
              </div>
            ) : pdfLoading ? (
              <div className="rounded-lg border bg-card p-8 text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : pdfUrl ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                    className="gradient-primary text-primary-foreground"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in new tab
                  </Button>
                  <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
                <div className="rounded-lg border bg-card overflow-hidden h-[600px]">
                  <iframe
                    src={pdfUrl}
                    title={`${novel.title} — Full Book`}
                    className="w-full h-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Trouble viewing? Tap "Open in new tab" — works best on mobile.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">Could not load PDF.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};