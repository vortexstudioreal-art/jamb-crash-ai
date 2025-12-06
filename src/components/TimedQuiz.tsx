import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Pause, Play, Flag, ChevronLeft, ChevronRight, Sparkles, Headphones, BookOpen, GraduationCap, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

type QuizMode = 'practice' | 'exam';

const MOTIVATIONAL_MESSAGES = [
  "You're crushing this! 💪",
  "Keep going, future uni star! ⭐",
  "That 300+ score is coming! 🎯",
  "You've got this, champ! 🏆",
  "Stay focused, stay winning! 🔥",
];

// Ambient sound URL (royalty-free relaxing study music)
const AMBIENT_SOUND_URL = "https://assets.mixkit.co/sfx/preview/mixkit-relaxing-in-nature-522.mp3";

export const TimedQuiz = ({ userEmail, subjects, quizType, onComplete, onExit }: TimedQuizProps) => {
  const totalQuestions = quizType === 'full' ? 60 : 20;
  const totalTimeSeconds = quizType === 'full' ? 90 * 60 : 30 * 60;
  
  // Pre-quiz state
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null);
  const [showHeadphoneAdvice, setShowHeadphoneAdvice] = useState(true);
  
  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(totalTimeSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationMsg, setMotivationMsg] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<string | null>(null);
  
  // Audio state
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(AMBIENT_SOUND_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle sound toggle
  const toggleSound = () => {
    if (audioRef.current) {
      if (isSoundPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsSoundPlaying(!isSoundPlaying);
    }
  };

  // Start quiz with selected mode
  const startQuiz = (mode: QuizMode) => {
    setQuizMode(mode);
    setShowHeadphoneAdvice(false);
    // Start ambient sound
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
      setIsSoundPlaying(true);
    }
  };

  // Load questions
  useEffect(() => {
    if (!quizMode) return;
    
    const loadQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('jamb_questions')
          .select('*')
          .in('subject', subjects as any)
          .limit(500);

        if (error) throw error;

        if (data && data.length >= totalQuestions) {
          const shuffled = [...data];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          setQuestions(shuffled.slice(0, totalQuestions) as Question[]);
        } else if (data && data.length > 0) {
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          setQuestions(shuffled as Question[]);
        } else {
          toast({
            title: "Not enough questions",
            description: "Loading available questions...",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [subjects, totalQuestions, quizMode]);

  // Timer
  useEffect(() => {
    if (!quizMode || isPaused || isLoading || timeLeft <= 0) return;

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
  }, [quizMode, isPaused, isLoading, timeLeft]);

  // Motivation at milestones
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
    const currentQuestion = questions[currentIndex];
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    // Practice mode: show immediate feedback
    if (quizMode === 'practice') {
      setShowAnswerFeedback(currentQuestion.correct_answer);
      
      // Auto-advance after 2 seconds
      setTimeout(() => {
        setShowAnswerFeedback(null);
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      }, 2000);
    }
  };

  const handleSubmit = useCallback(async () => {
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const timeTaken = totalTimeSeconds - timeLeft;
    let correctCount = 0;
    
    const resultsData = questions.map(q => {
      const userAnswer = answers[q.id] || '';
      if (userAnswer === q.correct_answer) correctCount++;
      return { ...q, userAnswer };
    });

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

  // Get filtered questions by subject
  const filteredQuestions = selectedSubjectFilter === 'all' 
    ? questions 
    : questions.filter(q => q.subject === selectedSubjectFilter);

  const currentQuestionIndex = filteredQuestions.findIndex(q => q.id === questions[currentIndex]?.id);

  // Headphone advice screen
  if (showHeadphoneAdvice && !quizMode) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card rounded-3xl p-8 border border-border shadow-2xl text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-6"
          >
            🎧
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-4 text-foreground">Ready to Focus?</h2>
          
          <p className="text-muted-foreground mb-6">
            For the best experience, we recommend using <span className="text-primary font-semibold">headphones</span>. 
            Relaxing ambient sounds will play to help you concentrate and think clearly! 🧘‍♀️
          </p>

          <div className="bg-primary/10 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-primary font-medium mb-2">
              <Headphones className="w-5 h-5" />
              Ambient study sounds included
            </div>
            <p className="text-sm text-muted-foreground">
              Calming background music to boost your focus
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Choose Your Mode:</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startQuiz('practice')}
                className="p-4 rounded-2xl border-2 border-primary bg-primary/10 hover:bg-primary/20 transition-all"
              >
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-bold text-primary">Practice Mode</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  See answers immediately after each question
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startQuiz('exam')}
                className="p-4 rounded-2xl border-2 border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 transition-all"
              >
                <GraduationCap className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <h4 className="font-bold text-orange-500">Exam Mode</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Like real JAMB - see results only at end
                </p>
              </motion.button>
            </div>
          </div>

          <Button 
            variant="ghost" 
            className="mt-6 text-muted-foreground"
            onClick={onExit}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

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

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-bold mb-2">No questions available</h3>
          <p className="text-muted-foreground mb-4">Please select different subjects or try again later.</p>
          <Button onClick={onExit}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (Object.keys(answers).length / totalQuestions) * 100;
  const isLowTime = timeLeft < 300;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className={`p-4 border-b border-border ${isLowTime ? 'bg-destructive/10' : 'bg-card'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onExit}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Exit
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                quizMode === 'practice' ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-500'
              }`}>
                {quizMode === 'practice' ? '📖 Practice' : '📝 Exam'}
              </span>
              <span className="text-sm text-muted-foreground">
                Q{currentIndex + 1}/{totalQuestions}
              </span>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold ${
            isLowTime ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-primary/10 text-primary'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="hidden sm:flex"
            >
              {isSoundPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span className="hidden sm:inline ml-1">{isPaused ? 'Resume' : 'Pause'}</span>
            </Button>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto mt-3">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {Object.keys(answers).length}/{totalQuestions} answered
          </p>
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="border-b border-border bg-card/50 py-2 px-4 overflow-x-auto">
        <Tabs value={selectedSubjectFilter} onValueChange={setSelectedSubjectFilter} className="max-w-4xl mx-auto">
          <TabsList className="bg-muted/50 h-auto flex-wrap">
            <TabsTrigger value="all" className="text-xs px-3 py-1.5">
              All ({questions.length})
            </TabsTrigger>
            {subjects.map(subject => {
              const count = questions.filter(q => q.subject === subject).length;
              const answered = questions.filter(q => q.subject === subject && answers[q.id]).length;
              return (
                <TabsTrigger 
                  key={subject} 
                  value={subject}
                  className="text-xs px-3 py-1.5 capitalize"
                >
                  {subject} ({answered}/{count})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Motivation popup */}
      <AnimatePresence>
        {showMotivation && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2"
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
              {quizMode === 'practice' && (
                <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                  Learn as you go!
                </span>
              )}
            </div>
            <h3 className="text-lg md:text-xl font-medium text-foreground leading-relaxed">
              {currentQuestion.question}
            </h3>
          </motion.div>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((letter) => {
              const optionKey = `option_${letter.toLowerCase()}` as keyof Question;
              const isSelected = answers[currentQuestion.id] === letter;
              const isCorrect = showAnswerFeedback === letter;
              const isWrong = showAnswerFeedback && isSelected && !isCorrect;
              
              return (
                <motion.button
                  key={letter}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => !showAnswerFeedback && handleAnswer(letter)}
                  disabled={!!showAnswerFeedback}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isCorrect && showAnswerFeedback
                      ? 'border-green-500 bg-green-500/20'
                      : isWrong
                      ? 'border-red-500 bg-red-500/20'
                      : isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isCorrect && showAnswerFeedback
                        ? 'bg-green-500 text-white'
                        : isWrong
                        ? 'bg-red-500 text-white'
                        : isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCorrect && showAnswerFeedback ? <CheckCircle className="w-5 h-5" /> : 
                       isWrong ? <XCircle className="w-5 h-5" /> : letter}
                    </span>
                    <span className="text-foreground">{currentQuestion[optionKey] as string}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Practice mode explanation */}
          {showAnswerFeedback && quizMode === 'practice' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
            >
              <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                <CheckCircle className="w-5 h-5" />
                Correct Answer: {showAnswerFeedback}
              </div>
              {currentQuestion.explanation && (
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">Moving to next question...</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-border bg-card">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0 || !!showAnswerFeedback}
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
                  onClick={() => !showAnswerFeedback && setCurrentIndex(actualIndex)}
                  disabled={!!showAnswerFeedback}
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
            <Button variant="hero" onClick={handleSubmit} disabled={!!showAnswerFeedback}>
              <Flag className="w-4 h-4 mr-1" /> Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
              disabled={!!showAnswerFeedback}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
