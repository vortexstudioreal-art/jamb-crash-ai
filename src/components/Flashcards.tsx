import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, RotateCcw, Check, X, Sparkles, 
  Brain, Shuffle, ChevronLeft, ChevronRight, Plus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface FlashcardsProps {
  userEmail: string;
  subjects: string[];
  onBack: () => void;
}

const MASTERY_COLORS: Record<string, string> = {
  new: 'bg-muted text-muted-foreground',
  learning: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  reviewing: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  mastered: 'bg-green-500/20 text-green-700 dark:text-green-400',
};

export const Flashcards = ({ userEmail, subjects, onBack }: FlashcardsProps) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  // Load flashcards
  useEffect(() => {
    loadFlashcards();
  }, [userEmail, subjects, selectedSubject]);

  const loadFlashcards = async () => {
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

    const { data } = await query;
    
    if (data) {
      // Shuffle cards for variety
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setFlashcards(shuffled as Flashcard[]);
    }
    
    setLoading(false);
  };

  const generateFlashcards = async () => {
    setGenerating(true);
    toast.info('Generating flashcards from your quiz mistakes and weak topics...');

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

      // Extract incorrect answers and create flashcards
      const newFlashcards: Omit<Flashcard, 'id'>[] = [];
      
      quizData.forEach(attempt => {
        const questions = attempt.questions_data as any[];
        if (!questions) return;

        questions.forEach(q => {
          if (q.userAnswer !== q.correctAnswer) {
            // Create flashcard from mistake
            newFlashcards.push({
              email: userEmail,
              subject: q.subject || (attempt.subjects as string[])?.[0] || 'general',
              topic: q.topic || null,
              front: q.question,
              back: `Answer: ${q.correctAnswer}\n\n${q.explanation || 'Review this topic in your study materials.'}`,
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
        toast.info('No mistakes found - you\'re doing great! 🎉');
        setGenerating(false);
        return;
      }

      // Insert flashcards (avoid duplicates)
      const { error } = await supabase
        .from('flashcards')
        .insert(newFlashcards.slice(0, 20) as any); // Limit to 20

      if (error) throw error;

      toast.success(`Generated ${Math.min(newFlashcards.length, 20)} flashcards from your mistakes!`);
      loadFlashcards();
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error('Failed to generate flashcards');
    } finally {
      setGenerating(false);
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={shuffleCards}>
              <Shuffle className="w-4 h-4 mr-1" />
              Shuffle
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateFlashcards}
              disabled={generating}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>

        {/* Subject filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge 
            variant={selectedSubject === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedSubject(null)}
          >
            All
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

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-6">
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
