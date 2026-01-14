import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
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
import { toast } from 'sonner';

interface LikelyQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
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
  const [chapter, setChapter] = useState<any>(null);
  const [novel, setNovel] = useState<any>(null);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isDarkReading, setIsDarkReading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const saveProgressRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(0);

  const fontSizeClasses = {
    small: 'text-sm leading-relaxed',
    medium: 'text-base leading-relaxed',
    large: 'text-lg leading-loose',
  };

  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
      startTimeRef.current = Date.now();
      
      // Load chapter with novel info
      const { data: chapterData } = await supabase
        .from('novel_chapters')
        .select('*, novel:novels(*)')
        .eq('id', chapterId)
        .single();
      
      if (chapterData) {
        setChapter(chapterData);
        setNovel(chapterData.novel);
        
        // Load all chapters for navigation
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
      
      setLoading(false);
    };
    
    loadChapter();
    
    // Save reading time when leaving
    return () => {
      if (saveProgressRef.current) {
        clearTimeout(saveProgressRef.current);
      }
      // Save accumulated reading time
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (chapter && novel && timeSpent > 5) {
        saveReadingTime(novel.id, timeSpent);
      }
    };
  }, [chapterId, userEmail]);

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
  }, [novel]);

  const saveReadingTime = async (novelId: string, seconds: number) => {
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
  };

  const updateProgress = async (novelId: string, currentChapterId: string, chapterNumber: number, totalChapters: number, additionalTime: number = 0) => {
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
    
    if (error) console.error('Error updating progress:', error);
  };

  const handleBookmark = async () => {
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

  const likelyQuestions: LikelyQuestion[] = chapter?.likely_questions || [];

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
        <p className="text-muted-foreground">Chapter not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
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
          {chapter.content.split('\n\n').map((paragraph: string, index: number) => (
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
          
          <Button
            variant="outline"
            onClick={() => navigateChapter('next')}
            disabled={!hasNext}
            className={isDarkReading ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : ''}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
