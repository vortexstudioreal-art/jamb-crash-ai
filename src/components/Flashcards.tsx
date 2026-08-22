import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, RotateCcw, Check, X, Sparkles, 
  Brain, Shuffle, ChevronLeft, ChevronRight, Plus, Trash2, Lock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFeatureUsage } from '@/hooks/useFeatureUsage';
import { FeatureLimitReached } from '@/components/FeatureLimitReached';
import { errorLogger } from '@/services/errorLogger';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Flashcard {
  id: string;
  email: string;
  subject: string;
  topic: string | null;
  front: string;
  back: string;
  source_type: string;
  difficulty: string;
  times_reviewed: number;
  times_correct: number;
  mastery_level: string;
}

interface QuizQuestionData {
  userAnswer?: string;
  user_answer?: string;
  selected?: string;
  correctAnswer?: string;
  correct_answer?: string;
  correct?: string;
  question?: string;
  text?: string;
  explanation?: string;
  reason?: string;
  subject?: string;
  topic?: string;
  id?: string;
}

interface FlashcardsProps {
  userEmail: string;
  subjects: string[];
  onBack: () => void;
  initialSubject?: string | null;
}

const MASTERY_COLORS: Record<string, string> = {
  new: 'bg-muted text-muted-foreground',
  learning: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  reviewing: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  mastered: 'bg-green-500/20 text-green-700 dark:text-green-400',
};

export const Flashcards = ({ userEmail, subjects, onBack, initialSubject }: FlashcardsProps) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(initialSubject ?? null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'study' | 'browse'>('browse');
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [showLimitReached, setShowLimitReached] = useState(false);
  
  // Feature usage limits
  const { canUseFeature, incrementUsage, getRemainingUses, refreshUsage } = useFeatureUsage();

  const loadFlashcards = useCallback(async () => {
    setLoading(true);
    
    let query = supabase
      .from('flashcards')
      .select('*')
      .eq('email', userEmail)
      .order('next_review_at', { ascending: true, nullsFirst: true });

    if (selectedSubject) {
      query = query.eq('subject', selectedSubject);
    } else {
      query = query.in('subject', subjects.map(s => s.toLowerCase()));
    }

    if (selectedTopic) {
      query = query.eq('topic', selectedTopic);
    }

    const { data } = await query;
    
    if (data) {
      // Shuffle cards for variety
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setFlashcards(shuffled as Flashcard[]);
    }
    
    setLoading(false);
  }, [userEmail, selectedSubject, selectedTopic, subjects]);

  // Load flashcards
  useEffect(() => {
    loadFlashcards();
  }, [userEmail, subjects, selectedSubject, selectedTopic, loadFlashcards]);

  // Group flashcards by topic for browse mode
  const flashcardsByTopic = flashcards.reduce((acc, card) => {
    const topicKey = card.topic || 'General';
    if (!acc[topicKey]) acc[topicKey] = [];
    acc[topicKey].push(card);
    return acc;
  }, {} as Record<string, Flashcard[]>);

  const topicList = Object.keys(flashcardsByTopic).sort();

  const startTopicStudy = (topic: string) => {
    setSelectedTopic(topic);
    setViewMode('study');
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0 });
  };

  const exitStudyMode = () => {
    setViewMode('browse');
    setSelectedTopic(null);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleBonusEarned = async () => {
    await refreshUsage();
    setShowLimitReached(false);
    toast.success('Bonus use earned! You can now generate flashcards.');
  };

  const generateFlashcards = async () => {
    // Check feature usage limit
    if (!canUseFeature('flashcard_generation')) {
      setShowLimitReached(true);
      return;
    }
    
    setGenerating(true);
    toast.info('Generating flashcards from your quiz mistakes...');

    try {
      // Get user's quiz attempts to find mistakes
      const { data: quizData } = await supabase
        .from('quiz_attempts')
        .select('questions_data, subjects')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!quizData || quizData.length === 0) {
        toast.error('No quiz data found. Take some quizzes first!');
        setGenerating(false);
        return;
      }

      // Get existing flashcard fronts to avoid duplicates
      const { data: existingCards } = await supabase
        .from('flashcards')
        .select('front')
        .eq('email', userEmail);
      
      const existingFronts = new Set((existingCards || []).map(c => c.front));

      // Extract incorrect answers and create flashcards
      const newFlashcards: Omit<Flashcard, 'id'>[] = [];
      
      quizData.forEach(attempt => {
        const questions = attempt.questions_data as QuizQuestionData[] | null;
        if (!questions || !Array.isArray(questions)) return;

        questions.forEach(q => {
          // Check for mistakes - handle different data structures
          const userAnswer = q.userAnswer || q.user_answer || q.selected;
          const correctAnswer = q.correctAnswer || q.correct_answer || q.correct;
          const questionText = q.question || q.text || '';
          const explanation = q.explanation || q.reason || '';
          const topic = q.topic || 'Quiz Mistakes';
          const subject = q.subject || (attempt.subjects as string[])?.[0] || 'general';

          if (userAnswer && correctAnswer && userAnswer !== correctAnswer && questionText) {
            const front = `[${topic}] ${questionText}`;
            
            // Skip if already exists
            if (existingFronts.has(front)) return;
            
            newFlashcards.push({
              email: userEmail,
              subject: subject.toLowerCase(),
              topic: topic,
              front: front,
              back: `✅ Correct Answer: ${correctAnswer}\n\n${explanation || 'Review this topic in your study materials.'}`,
              source_type: 'mistake',
              difficulty: 'medium',
              times_reviewed: 0,
              times_correct: 0,
              mastery_level: 'new',
            });
          }
        });
      });

      if (newFlashcards.length === 0) {
        toast.info('No new mistakes found - you\'re doing great! 🎉');
        setGenerating(false);
        return;
      }

      // Insert flashcards
      const { error } = await supabase
        .from('flashcards')
        .insert(newFlashcards.slice(0, 20));

      if (error) throw error;

      // Increment usage after successful generation
      await incrementUsage('flashcard_generation');
      
      toast.success(`Generated ${Math.min(newFlashcards.length, 20)} flashcards from your mistakes!`);
      loadFlashcards();
    } catch (error) {
      errorLogger.error(error, { component: 'Flashcards', action: 'generate flashcards' });
      toast.error('Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const deleteFlashcard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id)
        .eq('email', userEmail);

      if (error) throw error;

      setFlashcards(prev => prev.filter(f => f.id !== id));
      toast.success('Flashcard deleted!');
      
      // Adjust current index if needed
      if (currentIndex >= flashcards.length - 1 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    } catch (error) {
      errorLogger.error(error, { component: 'Flashcards', action: 'delete flashcard' });
      toast.error('Failed to delete flashcard');
    }
  };

  const deleteTopicFlashcards = async (topic: string) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('email', userEmail)
        .eq('topic', topic);

      if (error) throw error;

      setFlashcards(prev => prev.filter(f => f.topic !== topic));
      toast.success(`Deleted all flashcards for "${topic}"!`);
    } catch (error) {
      errorLogger.error(error, { component: 'Flashcards', action: 'delete topic flashcards' });
      toast.error('Failed to delete flashcards');
    }
  };

  const handleAnswer = async (correct: boolean) => {
    const card = flashcards[currentIndex];
    if (!card) return;

    // Update session stats
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    // Calculate new mastery level
    const timesReviewed = card.times_reviewed + 1;
    const timesCorrect = card.times_correct + (correct ? 1 : 0);
    const accuracy = timesCorrect / timesReviewed;

    let masteryLevel = 'learning';
    if (timesReviewed >= 5 && accuracy >= 0.9) {
      masteryLevel = 'mastered';
    } else if (timesReviewed >= 3 && accuracy >= 0.7) {
      masteryLevel = 'reviewing';
    }

    // Calculate next review time (spaced repetition)
    const hoursUntilReview = correct ? Math.pow(2, timesCorrect) * 4 : 1;
    const nextReview = new Date(Date.now() + hoursUntilReview * 60 * 60 * 1000);

    // Update in database
    await supabase
      .from('flashcards')
      .update({
        times_reviewed: timesReviewed,
        times_correct: timesCorrect,
        mastery_level: masteryLevel,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: nextReview.toISOString(),
      })
      .eq('id', card.id);

    // Update local state
    setFlashcards(prev => prev.map(f => 
      f.id === card.id 
        ? { ...f, times_reviewed: timesReviewed, times_correct: timesCorrect, mastery_level: masteryLevel }
        : f
    ));

    // Move to next card
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        toast.success('Session complete! 🎉');
      }
    }, 300);
  };

  const shuffleCards = () => {
    setFlashcards(prev => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0 });
    toast.success('Cards shuffled!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

  // Browse mode - show topics with flashcard counts
  if (viewMode === 'browse' && !selectedTopic) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateFlashcards}
              disabled={generating}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {generating ? 'Generating...' : 'Generate from Mistakes'}
            </Button>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">📚 My Flashcards</h1>
          <p className="text-muted-foreground mb-6">
            {flashcards.length} cards across {topicList.length} topics
          </p>

          {/* Show limit reached component if daily limit is hit */}
          {showLimitReached && (
            <FeatureLimitReached
              featureType="flashcard_generation"
              onBonusEarned={handleBonusEarned}
              className="mb-6"
            />
          )}

          {/* Subject filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge 
              variant={selectedSubject === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedSubject(null)}
            >
              All Subjects
            </Badge>
            {subjects.map(subject => (
              <Badge 
                key={subject}
                variant={selectedSubject === subject.toLowerCase() ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedSubject(subject.toLowerCase())}
              >
                {subject}
              </Badge>
            ))}
          </div>

          {/* Topics list */}
          {topicList.length > 0 ? (
            <div className="space-y-3">
              {topicList.map(topic => {
                const cards = flashcardsByTopic[topic];
                const masteredCount = cards.filter(c => c.mastery_level === 'mastered').length;
                const progressPercent = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;
                
                return (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => startTopicStudy(topic)}
                      >
                        <h3 className="font-semibold text-foreground">{topic}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {cards.length} card{cards.length !== 1 ? 's' : ''}
                          </span>
                          <span className="text-sm text-green-500">
                            {masteredCount} mastered
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16">
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Topic Flashcards?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete all {cards.length} flashcards for "{topic}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => deleteTopicFlashcards(topic)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <ChevronRight 
                          className="w-5 h-5 text-muted-foreground cursor-pointer" 
                          onClick={() => startTopicStudy(topic)}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No Flashcards Yet</h3>
              <p className="text-muted-foreground mb-6">
                Generate flashcards from the Syllabus Reader or from your quiz mistakes!
              </p>
              <Button onClick={generateFlashcards} disabled={generating}>
                <Sparkles className="w-4 h-4 mr-2" />
                {generating ? 'Generating...' : 'Generate from Mistakes'}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Study mode
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={exitStudyMode}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Topics
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={shuffleCards}>
              <Shuffle className="w-4 h-4 mr-1" />
              Shuffle
            </Button>
          </div>
        </div>

        {/* Topic title */}
        {selectedTopic && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">{selectedTopic}</h2>
            <p className="text-muted-foreground text-sm">{flashcards.length} flashcards</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-500">✓ {sessionStats.correct}</span>
            <span className="text-red-500">✗ {sessionStats.incorrect}</span>
          </div>
        </div>

        <Progress value={progress} className="h-2 mb-6" />

        {/* Flashcard */}
        {currentCard ? (
          <div className="perspective-1000">
            <motion.div
              className="relative w-full aspect-[3/2] cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Front */}
              <div 
                className={`absolute inset-0 bg-card rounded-2xl border-2 border-border p-6 flex flex-col items-center justify-center backface-hidden shadow-lg ${isFlipped ? 'invisible' : ''}`}
              >
                <Badge className={`mb-4 ${MASTERY_COLORS[currentCard.mastery_level]}`}>
                  {currentCard.mastery_level}
                </Badge>
                <Badge variant="outline" className="mb-4 capitalize">
                  {currentCard.subject}
                </Badge>
                <p className="text-lg md:text-xl text-center font-medium text-foreground">
                  {currentCard.front}
                </p>
                <p className="text-sm text-muted-foreground mt-4">Tap to reveal answer</p>
              </div>

              {/* Back */}
              <div 
                className={`absolute inset-0 bg-primary/5 rounded-2xl border-2 border-primary p-6 flex flex-col items-center justify-center backface-hidden shadow-lg ${!isFlipped ? 'invisible' : ''}`}
                style={{ transform: 'rotateY(180deg)' }}
              >
                <p className="text-lg md:text-xl text-center text-foreground whitespace-pre-wrap">
                  {currentCard.back}
                </p>
              </div>
            </motion.div>

            {/* Answer buttons */}
            <AnimatePresence>
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex justify-center gap-4 mt-6"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 max-w-[150px] border-red-500 text-red-500 hover:bg-red-500/10"
                    onClick={() => handleAnswer(false)}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Wrong
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 max-w-[150px] bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleAnswer(true)}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Correct
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation and Delete */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex(prev => prev - 1);
                  setIsFlipped(false);
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this flashcard?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this flashcard. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => deleteFlashcard(currentCard.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button
                variant="ghost"
                size="icon"
                disabled={currentIndex === flashcards.length - 1}
                onClick={() => {
                  setCurrentIndex(prev => prev + 1);
                  setIsFlipped(false);
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Flashcards Yet</h3>
            <p className="text-muted-foreground mb-6">
              Take some quizzes first, then generate flashcards from your mistakes!
            </p>
            <Button onClick={generateFlashcards} disabled={generating}>
              <Sparkles className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Generate Flashcards'}
            </Button>
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};
