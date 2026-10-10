import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Book,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Minus,
  Moon,
  Plus,
  Sun,
  X,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { getCachedChapter, getCachedChaptersByNovel, getCachedNovel, addToSyncQueue } from '@/services/offlineStorage';
import { errorLogger } from '@/services/errorLogger';

interface LikelyQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

/**
 * The extractor stored options as a Record ({A: text}) in some chapters
 * and arrays in others, with answers as letters, indices, or answer text.
 * Normalize everything here so the renderer below can never crash with
 * "k.map is not a function" on malformed rows.
 */
const normalizeLikelyQuestions = (raw: unknown): LikelyQuestion[] => {
  if (!Array.isArray(raw)) return [];
  const out: LikelyQuestion[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const rawOptions = rec.options;
    let options: string[] = [];
    if (Array.isArray(rawOptions)) {
      options = rawOptions.map((o) => String(o ?? ''));
    } else if (rawOptions && typeof rawOptions === 'object') {
      options = Object.entries(rawOptions as Record<string, unknown>)
        .sort(([a], [b]) => String(a).localeCompare(String(b)))
        .map(([, v]) => String(v ?? ''));
    }
    if (options.length === 0) continue;
    const rawCorrect = rec.correct_answer;
    let idx = -1;
    if (typeof rawCorrect === 'number' && Number.isFinite(rawCorrect)) {
      idx = rawCorrect;
    } else if (typeof rawCorrect === 'string') {
      const t = rawCorrect.trim().toUpperCase();
      if (/^[A-D]$/.test(t)) {
        idx = t.charCodeAt(0) - 65;
      } else {
        idx = options.findIndex((o) => o.trim().toLowerCase() === t.toLowerCase());
      }
    }
    out.push({
      question: String(rec.question ?? ''),
      options,
      correct_answer: idx >= 0 && idx < options.length ? idx : -1,
      explanation: typeof rec.explanation === 'string' ? rec.explanation : undefined,
    });
  }
  return out;
};

interface ChapterSummary {
  id: string;
  chapter_number: number;
  title: string;
}

interface NovelReaderProps {
  chapterId: string;
  userEmail: string;
  onBack: () => void;
  onNextChapter?: (chapterId: string) => void;
  onPrevChapter?: (chapterId: string) => void;
}

export const NovelReader = ({ 
  chapterId, 
  userEmail, 
  onBack,
  onNextChapter,
  onPrevChapter 
}: NovelReaderProps) => {
  const [chapter, setChapter] = useState<(Database['public']['Tables']['novel_chapters']['Row'] & { novel?: Database['public']['Tables']['novels']['Row'] | null }) | null>(null);
  const [novel, setNovel] = useState<Database['public']['Tables']['novels']['Row'] | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isDarkReading, setIsDarkReading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  const fontSizeClasses = {
    small: 'text-sm leading-relaxed',
    medium: 'text-base leading-relaxed',
    large: 'text-lg leading-loose',
  };

  const updateProgress = useCallback(async (novelId: string, currentChapterId: string, chapterNumber: number, totalChapters: number, additionalTime: number = 0) => {
    const progressPercent = Math.round((chapterNumber / totalChapters) * 100);
    const isCompleted = chapterNumber >= totalChapters;
    
    const { data: existingProgress } = await supabase
      .from('user_novel_progress')
      .select('total_time_spent_seconds')
      .eq('email', userEmail)
      .eq('novel_id', novelId)
      .maybeSingle();

    const currentTime = existingProgress?.total_time_spent_seconds || 0;
    
    const { error } = await supabase
      .from('user_novel_progress')
      .upsert({
        email: userEmail,
        novel_id: novelId,
        current_chapter_id: currentChapterId,
        progress_percent: progressPercent,
        is_completed: isCompleted,
        total_time_spent_seconds: currentTime + additionalTime,
        last_read_at: new Date().toISOString(),
      }, {
        onConflict: 'email,novel_id'
      });
    
    if (error) errorLogger.error(error, { component: 'NovelReader', action: 'update progress' });
  }, [userEmail]);

  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
      startTimeRef.current = Date.now();
      
      try {
        // Try network first
        const { data: chapterData, error } = await supabase
          .from('novel_chapters')
          .select('*, novel:novels(*)')
          .eq('id', chapterId)
          .single();
        
        if (error) throw error;
        
        if (chapterData) {
          setChapter(chapterData);
          setNovel(chapterData.novel);
          
          const { data: chaptersData } = await supabase
            .from('novel_chapters')
            .select('id, chapter_number, title')
            .eq('novel_id', chapterData.novel_id)
            .order('chapter_number');
          
          if (chaptersData) setAllChapters(chaptersData);
          
          // Check if bookmarked
          const { data: bookmark } = await supabase
            .from('user_bookmarks')
            .select('id')
            .eq('chapter_id', chapterId)
            .eq('email', userEmail)
            .maybeSingle();
          
          setIsBookmarked(!!bookmark);
          
          // Update progress
          await updateProgress(chapterData.novel_id, chapterId, chapterData.chapter_number, chaptersData?.length || 1, 0);
        }
      } catch {
        const cachedChapter = await getCachedChapter(chapterId);
        if (cachedChapter) {
          setChapter(cachedChapter);
          
          const cachedNovel = await getCachedNovel(cachedChapter.novel_id);
          if (cachedNovel) setNovel(cachedNovel);
          
          const cachedChapters = await getCachedChaptersByNovel(cachedChapter.novel_id);
          setAllChapters(
            cachedChapters
              .map(ch => ({ id: ch.id, chapter_number: ch.chapter_number, title: ch.title }))
              .sort((a, b) => a.chapter_number - b.chapter_number)
          );
        }
      }
      
      setLoading(false);
    };
    
    loadChapter();
  }, [chapterId, userEmail, updateProgress]);

  const saveReadingTime = useCallback(async (novelId: string, seconds: number) => {
    // Offline: queue a time delta instead of dropping it. The sync worker
    // merges it onto the server row when connectivity returns.
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const ch = chapterRef.current;
      const nv = novelRef.current;
      if (ch && nv && seconds > 0) {
        const total = allChaptersRef.current.length || 1;
        await addToSyncQueue('novel_progress', {
          email: userEmail,
          novel_id: novelId,
          current_chapter_id: ch.id,
          chapter_number: ch.chapter_number,
          total_chapters: total,
          time_delta_seconds: Math.round(seconds),
        }).catch((e) => errorLogger.error(e, { component: 'NovelReader', action: 'queue offline progress' }));
      }
      return;
    }
    const { data: existingProgress } = await supabase
      .from('user_novel_progress')
      .select('total_time_spent_seconds')
      .eq('email', userEmail)
      .eq('novel_id', novelId)
      .maybeSingle();

    const currentTime = existingProgress?.total_time_spent_seconds || 0;
    
    await supabase
      .from('user_novel_progress')
      .update({
        total_time_spent_seconds: currentTime + seconds,
        last_read_at: new Date().toISOString(),
      })
      .eq('email', userEmail)
      .eq('novel_id', novelId);
  }, [userEmail]);

  // Flush reading time on unmount — reads latest values via refs so this
  // effect never needs chapter/novel/saveReadingTime in its deps
  const chapterRef = useRef(chapter);
  useEffect(() => {
    chapterRef.current = chapter;
  }, [chapter]);
  const novelRef = useRef(novel);
  useEffect(() => {
    novelRef.current = novel;
  }, [novel]);
  const allChaptersRef = useRef(allChapters);
  useEffect(() => {
    allChaptersRef.current = allChapters;
  }, [allChapters]);
  const saveReadingTimeRef = useRef(saveReadingTime);
  useEffect(() => {
    saveReadingTimeRef.current = saveReadingTime;
  }, [saveReadingTime]);
  useEffect(() => {
    return () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const currentChapter = chapterRef.current;
      const currentNovel = novelRef.current;
      if (currentChapter && currentNovel && timeSpent > 5) {
        saveReadingTimeRef.current(currentNovel.id, timeSpent);
      }
    };
  }, []);

  // Auto-save reading time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (novel) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent > 10) {
          saveReadingTime(novel.id, timeSpent);
          startTimeRef.current = Date.now(); // Reset timer
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [novel, saveReadingTime]);

  const handleBookmark = async () => {
    if (!novel) return;
    if (isBookmarked) {
      // Remove bookmark
      await supabase
        .from('user_bookmarks')
        .delete()
        .eq('chapter_id', chapterId)
        .eq('email', userEmail);
      
      setIsBookmarked(false);
      toast.success('Bookmark removed');
    } else {
      // Add bookmark
      const scrollPosition = contentRef.current?.scrollTop || 0;
      
      await supabase
        .from('user_bookmarks')
        .insert({
          email: userEmail,
          novel_id: novel.id,
          chapter_id: chapterId,
          scroll_position: scrollPosition,
        });
      
      setIsBookmarked(true);
      toast.success('Chapter bookmarked!');
    }
  };

  const navigateChapter = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = allChapters.findIndex(ch => ch.id === chapterId);
    if (direction === 'prev' && currentIndex > 0) {
      const prevChapter = allChapters[currentIndex - 1];
      onPrevChapter?.(prevChapter.id);
    } else if (direction === 'next' && currentIndex < allChapters.length - 1) {
      const nextChapter = allChapters[currentIndex + 1];
      onNextChapter?.(nextChapter.id);
    }
  }, [allChapters, chapterId, onNextChapter, onPrevChapter]);

  const currentIndex = allChapters.findIndex(ch => ch.id === chapterId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allChapters.length - 1;

  const likelyQuestions: LikelyQuestion[] = normalizeLikelyQuestions(chapter?.likely_questions);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correct = likelyQuestions.filter((q, i) => selectedAnswers[i] === q.correct_answer).length;
    toast.success(`You got ${correct} out of ${likelyQuestions.length} correct!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="text-center py-12">
        <Book className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Chapter not available</h3>
        <p className="text-muted-foreground mb-1">
          {navigator.onLine
            ? "This chapter couldn't be loaded."
            : "This chapter hasn't been cached for offline reading."}
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

  return (
    <div className={`min-h-screen transition-colors ${isDarkReading ? 'bg-zinc-900' : 'bg-background'}`}>
      {/* Top Bar */}
      <div className={`sticky top-0 z-50 border-b ${
        isDarkReading 
          ? 'bg-zinc-900/95 border-zinc-800 backdrop-blur' 
          : 'bg-background/95 border-border backdrop-blur'
      }`}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className={isDarkReading ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : ''}
          >
            <X className="w-4 h-4 mr-2" /> Close
          </Button>
          
          <div className="flex items-center gap-2">
            {/* Font Size */}
            <div className="flex items-center gap-1 border rounded-lg px-2 py-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setFontSize(fontSize === 'large' ? 'medium' : fontSize === 'medium' ? 'small' : 'small')}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className={`text-xs w-8 text-center ${isDarkReading ? 'text-zinc-400' : 'text-muted-foreground'}`}>
                {fontSize.charAt(0).toUpperCase()}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setFontSize(fontSize === 'small' ? 'medium' : fontSize === 'medium' ? 'large' : 'large')}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Dark Mode Toggle */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsDarkReading(!isDarkReading)}
              className={isDarkReading ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : ''}
            >
              {isDarkReading ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            {/* Bookmark */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBookmark}
              className={isDarkReading ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : ''}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-primary" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="max-w-3xl mx-auto px-4 py-8"
      >
        {/* Chapter Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <p className={`text-sm mb-2 ${isDarkReading ? 'text-zinc-500' : 'text-muted-foreground'}`}>
            {novel?.title}
          </p>
          <h1 className={`text-2xl font-bold mb-2 ${isDarkReading ? 'text-zinc-100' : 'text-foreground'}`}>
            Chapter {chapter.chapter_number}: {chapter.title}
          </h1>
          <p className={`text-sm ${isDarkReading ? 'text-zinc-500' : 'text-muted-foreground'}`}>
            ~{chapter.estimated_reading_time} min read
          </p>
        </motion.div>

        {/* Chapter Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`prose max-w-none ${fontSizeClasses[fontSize]} ${
            isDarkReading 
              ? 'prose-invert prose-p:text-zinc-300 prose-headings:text-zinc-100' 
              : ''
          }`}
        >
          {(chapter.content || '').split('\n\n').map((paragraph: string, index: number) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </motion.div>

        {/* Likely Questions Section */}
        {likelyQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <Card className={isDarkReading ? 'bg-zinc-800/50 border-zinc-700' : ''}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDarkReading ? 'text-zinc-100' : ''}`}>
                  📝 Likely JAMB Questions
                </CardTitle>
                <p className={`text-sm ${isDarkReading ? 'text-zinc-400' : 'text-muted-foreground'}`}>
                  Test your understanding with these practice questions
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {likelyQuestions.map((question, qIndex) => (
                  <div key={qIndex} className="space-y-3">
                    <p className={`font-medium ${isDarkReading ? 'text-zinc-200' : 'text-foreground'}`}>
                      {qIndex + 1}. {question.question}
                    </p>
                    
                    <RadioGroup
                      value={selectedAnswers[qIndex]?.toString()}
                      onValueChange={(value) => handleAnswerSelect(qIndex, parseInt(value))}
                      disabled={showResults}
                    >
                      {question.options.map((option, oIndex) => {
                        const isCorrect = oIndex === question.correct_answer;
                        const isSelected = selectedAnswers[qIndex] === oIndex;
                        
                        return (
                          <div 
                            key={oIndex}
                            className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                              showResults
                                ? isCorrect
                                  ? 'bg-green-500/10 border border-green-500/30'
                                  : isSelected
                                  ? 'bg-red-500/10 border border-red-500/30'
                                  : ''
                                : ''
                            }`}
                          >
                            <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                            <Label 
                              htmlFor={`q${qIndex}-o${oIndex}`}
                              className={`flex-1 cursor-pointer ${isDarkReading ? 'text-zinc-300' : ''}`}
                            >
                              {option}
                            </Label>
                            {showResults && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                            {showResults && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        );
                      })}
                    </RadioGroup>
                    
                    {showResults && question.explanation && (
                      <p className={`text-sm p-3 rounded-lg ${
                        isDarkReading ? 'bg-zinc-700/50 text-zinc-300' : 'bg-muted text-muted-foreground'
                      }`}>
                        💡 {question.explanation}
                      </p>
                    )}
                  </div>
                ))}
                
                {!showResults && Object.keys(selectedAnswers).length > 0 && (
                  <Button 
                    onClick={checkAnswers}
                    className="w-full gradient-primary text-primary-foreground"
                  >
                    Check Answers
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Chapter Navigation */}
        <div className="mt-12 flex items-center justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={() => navigateChapter('prev')}
            disabled={!hasPrev}
            className={isDarkReading ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : ''}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <span className={`text-sm ${isDarkReading ? 'text-zinc-500' : 'text-muted-foreground'}`}>
            {chapter.chapter_number} / {allChapters.length}
          </span>
          
          {hasNext ? (
            <Button
              variant="outline"
              onClick={() => navigateChapter('next')}
              className={isDarkReading ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : ''}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={async () => {
                if (!novel) return;
                // Mark as completed
                await supabase
                  .from('user_novel_progress')
                  .upsert({
                    email: userEmail,
                    novel_id: novel.id,
                    current_chapter_id: chapterId,
                    progress_percent: 100,
                    is_completed: true,
                    last_read_at: new Date().toISOString(),
                  }, {
                    onConflict: 'email,novel_id'
                  });
                toast.success('🎉 Congratulations! You completed this novel!');
                onBack();
              }}
              className="gradient-primary text-primary-foreground"
            >
              Complete Novel ✓
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
