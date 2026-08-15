import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  subject: string;
  year?: number;
  image_url?: string | null;
}

interface TrialQuizProps {
  subjects: string[];
  onComplete: (results: TrialQuizResults) => void;
  onExit: () => void;
}

export interface TrialQuizResults {
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  questions: Array<Question & { userAnswer: string }>;
  subjects: string[];
}

export const TrialQuiz = ({ subjects, onComplete, onExit }: TrialQuizProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const startTimeRef = useState(() => Date.now())[0];

  // Load 20 questions: 5 English + 5 from each of 3 other subjects
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const allQuestions: Question[] = [];
        const questionsPerSubject = 5;
        
        for (const subject of subjects) {
          const { data, error } = await supabase
            .from('jamb_questions')
            .select('*')
            .eq('subject', subject as Database['public']['Enums']['jamb_subject'])
            .limit(100);
          
          if (!error && data && data.length > 0) {
            // Shuffle and take 5
            const shuffled = [...data].sort(() => Math.random() - 0.5);
            allQuestions.push(...shuffled.slice(0, questionsPerSubject) as Question[]);
          }
        }

        if (allQuestions.length > 0) {
          // Shuffle all questions together
          const shuffled = allQuestions.sort(() => Math.random() - 0.5);
          setQuestions(shuffled.slice(0, 20));
        } else {
          toast.error("No questions available", { description: "Please try again later" });
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        toast.error("Error loading quiz", { description: "Please try again" });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [subjects]);

  // Timer
  useEffect(() => {
    if (isLoading || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const currentQuestion = questions[currentIndex];
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }, 1500);
  };

  const handleSubmit = useCallback(() => {
    const timeTaken = Math.floor((Date.now() - startTimeRef) / 1000);
    let correctCount = 0;
    
    const resultsData = questions.map(q => {
      const userAnswer = answers[q.id] || '';
      if (userAnswer === q.correct_answer) correctCount++;
      return { ...q, userAnswer };
    });

    onComplete({
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeTaken,
      questions: resultsData,
      subjects
    });
  }, [questions, answers, startTimeRef, subjects, onComplete]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Loading your trial quiz...</p>
          <p className="text-sm text-muted-foreground">Preparing 20 questions from your subjects</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-4">No questions available</p>
          <Button onClick={onExit}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correct_answer;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium capitalize">
                {currentQuestion.subject}
              </span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              timeLeft < 300 ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-2xl p-6 border border-border">
                <p className="text-xl font-medium text-foreground leading-relaxed">
                  {currentQuestion.question}
                </p>
                {currentQuestion.image_url && (
                  <div className="mt-4 flex justify-center">
                    <img src={currentQuestion.image_url} alt="Question diagram" className="max-w-full h-auto rounded-lg border border-border" style={{ maxHeight: 300 }} />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((letter) => {
                  const optionKey = `option_${letter.toLowerCase()}` as keyof Question;
                  const optionText = currentQuestion[optionKey] as string;
                  const isSelected = selectedAnswer === letter;
                  const isCorrectAnswer = currentQuestion.correct_answer === letter;
                  
                  let buttonClass = 'bg-card border-border hover:border-primary/50';
                  
                  if (showFeedback) {
                    if (isCorrectAnswer) {
                      buttonClass = 'bg-green-500/20 border-green-500 text-green-400';
                    } else if (isSelected && !isCorrectAnswer) {
                      buttonClass = 'bg-destructive/20 border-destructive text-destructive';
                    }
                  } else if (isSelected) {
                    buttonClass = 'bg-primary/20 border-primary';
                  }

                  return (
                    <motion.button
                      key={letter}
                      whileHover={{ scale: showFeedback ? 1 : 1.01 }}
                      whileTap={{ scale: showFeedback ? 1 : 0.99 }}
                      onClick={() => !showFeedback && handleAnswer(letter)}
                      disabled={showFeedback}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${buttonClass}`}
                    >
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        showFeedback && isCorrectAnswer 
                          ? 'bg-green-500 text-white' 
                          : showFeedback && isSelected && !isCorrectAnswer
                            ? 'bg-destructive text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {showFeedback && isCorrectAnswer && <CheckCircle className="w-5 h-5" />}
                        {showFeedback && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5" />}
                        {!showFeedback && letter}
                      </span>
                      <span className="flex-1 text-foreground">{optionText}</span>
                    </motion.button>
                  );
                })}
              </div>

              {showFeedback && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/10 rounded-xl p-4 border border-primary/20"
                >
                  <p className="text-sm text-foreground">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={onExit}>
            Exit Quiz
          </Button>
          <p className="text-sm text-muted-foreground">
            {Object.keys(answers).length} of {questions.length} answered
          </p>
        </div>
      </div>
    </div>
  );
};
