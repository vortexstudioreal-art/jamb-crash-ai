import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Pause, Play, Flag, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
}

interface TimedQuizProps {
  userEmail: string;
  subjects: string[];
  quizType: 'full' | 'mini' | 'demo';
  onComplete: (results: QuizResults) => void;
  onExit: () => void;
}

interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  questions: Array<Question & { userAnswer: string }>;
}

const MOTIVATIONAL_MESSAGES = [
  "You're crushing this! 💪",
  "Keep going, future uni star! ⭐",
  "That 300+ score is coming! 🎯",
  "You've got this, champ! 🏆",
  "Stay focused, stay winning! 🔥",
];

// Sample questions for demo (will be replaced with real ones from DB)
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: '1',
    question: 'What is the chemical symbol for water?',
    option_a: 'H2O',
    option_b: 'CO2',
    option_c: 'NaCl',
    option_d: 'O2',
    correct_answer: 'A',
    explanation: 'Water is made of 2 hydrogen atoms and 1 oxygen atom, hence H2O! 💧',
    subject: 'chemistry'
  },
  {
    id: '2',
    question: 'Who wrote "Things Fall Apart"?',
    option_a: 'Wole Soyinka',
    option_b: 'Chinua Achebe',
    option_c: 'Chimamanda Adichie',
    option_d: 'Ben Okri',
    correct_answer: 'B',
    explanation: 'Chinua Achebe wrote this classic Nigerian novel in 1958! 📚',
    subject: 'literature'
  },
  {
    id: '3',
    question: 'What is 15% of 200?',
    option_a: '20',
    option_b: '25',
    option_c: '30',
    option_d: '35',
    correct_answer: 'C',
    explanation: '15% of 200 = (15/100) × 200 = 30. Quick trick: 10% is 20, 5% is 10, so 15% is 30! 🧮',
    subject: 'mathematics'
  },
  // Add more sample questions...
];

export const TimedQuiz = ({ userEmail, subjects, quizType, onComplete, onExit }: TimedQuizProps) => {
  const totalQuestions = quizType === 'full' ? 60 : 20;
  const totalTimeSeconds = quizType === 'full' ? 90 * 60 : 30 * 60; // 90 or 30 minutes
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(totalTimeSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationMsg, setMotivationMsg] = useState('');

  // Load questions - fresh random selection, no repeats
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Fetch MORE questions than needed to ensure variety
        const { data, error } = await supabase
          .from('jamb_questions')
          .select('*')
          .in('subject', subjects as any)
          .limit(500); // Get large pool

        if (error) throw error;

        if (data && data.length >= totalQuestions) {
          // Shuffle using Fisher-Yates for true randomness
          const shuffled = [...data];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          // Take only needed amount - guaranteed no repeats
          setQuestions(shuffled.slice(0, totalQuestions) as Question[]);
        } else if (data && data.length > 0) {
          // Use what we have
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          setQuestions(shuffled as Question[]);
        } else {
          // Fallback to samples
          const shuffled = [...SAMPLE_QUESTIONS].sort(() => Math.random() - 0.5);
          setQuestions(shuffled.slice(0, Math.min(totalQuestions, SAMPLE_QUESTIONS.length)));
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        setQuestions(SAMPLE_QUESTIONS.slice(0, totalQuestions));
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [subjects, totalQuestions]);

  // Timer
  useEffect(() => {
    if (isPaused || isLoading || timeLeft <= 0) return;

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
  }, [isPaused, isLoading, timeLeft]);

  // Show motivation at milestones
  useEffect(() => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount > 0 && answeredCount % 10 === 0) {
      setMotivationMsg(MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]);
      setShowMotivation(true);
      setTimeout(() => setShowMotivation(false), 2000);
    }
  }, [answers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: answer
    }));
  };

  const handleSubmit = useCallback(async () => {
    const timeTaken = totalTimeSeconds - timeLeft;
    let correctCount = 0;
    
    const resultsData = questions.map(q => {
      const userAnswer = answers[q.id] || '';
      if (userAnswer === q.correct_answer) correctCount++;
      return { ...q, userAnswer };
    });

    // Save to database
    try {
      await supabase.from('quiz_attempts').insert({
        email: userEmail,
        quiz_type: quizType,
        subjects: subjects as any,
        total_questions: totalQuestions,
        correct_answers: correctCount,
        time_taken_seconds: timeTaken,
        questions_data: resultsData
      });
    } catch (error) {
      console.error('Error saving quiz:', error);
    }

    onComplete({
      totalQuestions,
      correctAnswers: correctCount,
      timeTaken,
      questions: resultsData
    });
  }, [questions, answers, timeLeft, totalTimeSeconds, userEmail, quizType, subjects, totalQuestions, onComplete]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-6xl"
        >
          📚
        </motion.div>
        <p className="text-xl font-medium ml-4">Loading your questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (Object.keys(answers).length / totalQuestions) * 100;
  const isLowTime = timeLeft < 300; // Less than 5 minutes

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className={`p-4 border-b border-border ${isLowTime ? 'bg-destructive/10' : 'bg-card'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onExit}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Exit
            </Button>
            <div className="text-sm text-muted-foreground">
              Question {currentIndex + 1}/{totalQuestions}
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold ${
            isLowTime ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-primary/10 text-primary'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto mt-3">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {Object.keys(answers).length}/{totalQuestions} answered
          </p>
        </div>
      </div>

      {/* Motivation popup */}
      <AnimatePresence>
        {showMotivation && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {motivationMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-background/95 z-40 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-4"
            >
              ⏸️
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Quiz Paused</h3>
            <p className="text-muted-foreground mb-4">Timer is still running! ⏰</p>
            <Button onClick={() => setIsPaused(false)} variant="hero">
              <Play className="w-4 h-4 mr-2" /> Continue Quiz
            </Button>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl p-6 border border-border mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                {currentQuestion.subject}
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-medium text-foreground leading-relaxed">
              {currentQuestion.question}
            </h3>
          </motion.div>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((letter) => {
              const optionKey = `option_${letter.toLowerCase()}` as keyof Question;
              const isSelected = answers[currentQuestion.id] === letter;
              
              return (
                <motion.button
                  key={letter}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswer(letter)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-foreground">{currentQuestion[optionKey] as string}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-border bg-card">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none">
            {questions.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((q, i) => {
              const actualIndex = Math.max(0, currentIndex - 3) + i;
              const isAnswered = answers[q.id];
              const isCurrent = actualIndex === currentIndex;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(actualIndex)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isAnswered
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {actualIndex + 1}
                </button>
              );
            })}
          </div>

          {currentIndex === totalQuestions - 1 ? (
            <Button variant="hero" onClick={handleSubmit}>
              <Flag className="w-4 h-4 mr-1" /> Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
