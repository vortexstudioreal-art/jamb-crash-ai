import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Pause, Play, Flag, ChevronLeft, ChevronRight, Sparkles, Headphones, BookOpen, GraduationCap, Volume2, VolumeX, Calendar, Music, CloudRain, Coffee, TreePine, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
}

interface TimedQuizProps {
  userEmail: string;
  subjects: string[];
  quizType: 'full' | 'mini' | 'demo' | 'subject';
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
type AmbientSound = 'rain' | 'forest' | 'ocean' | 'coffee';

const MOTIVATIONAL_MESSAGES = [
  "You're crushing this! 💪",
  "Keep going, future uni star! ⭐",
  "That 300+ score is coming! 🎯",
  "You've got this, champ! 🏆",
  "Stay focused, stay winning! 🔥",
];

// Free royalty-free ambient sounds
const AMBIENT_SOUNDS: Record<AmbientSound, { url: string; label: string; icon: typeof CloudRain }> = {
  rain: {
    url: "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3",
    label: "Rain",
    icon: CloudRain
  },
  forest: {
    url: "https://assets.mixkit.co/active_storage/sfx/1224/1224-preview.mp3",
    label: "Forest",
    icon: TreePine
  },
  ocean: {
    url: "https://assets.mixkit.co/active_storage/sfx/1189/1189-preview.mp3",
    label: "Ocean",
    icon: Waves
  },
  coffee: {
    url: "https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3",
    label: "Coffee Shop",
    icon: Coffee
  }
};

const ALL_SUBJECTS = [
  'english', 'mathematics', 'physics', 'chemistry', 'biology',
  'literature', 'government', 'economics', 'crs', 'geography',
  'accounting', 'commerce', 'agricultural_science'
];

const YEARS = Array.from({ length: 26 }, (_, i) => 2000 + i);

export const TimedQuiz = ({ userEmail, subjects, quizType, onComplete, onExit }: TimedQuizProps) => {
  // Quiz config based on type
  const getQuizConfig = () => {
    switch (quizType) {
      case 'full': return { questions: 60, time: 70 * 60, untimed: false }; // 70 minutes
      case 'mini': return { questions: 20, time: 30 * 60, untimed: false }; // 30 minutes
      case 'subject': return { questions: 40, time: 0, untimed: true }; // Untimed practice
      case 'demo': return { questions: 20, time: 30 * 60, untimed: false }; // 30 minutes
      default: return { questions: 60, time: 70 * 60, untimed: false };
    }
  };
  
  const isUntimed = getQuizConfig().untimed;

  const config = getQuizConfig();
  const [totalQuestions, setTotalQuestions] = useState(config.questions);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(config.time);
  
  // Pre-quiz state
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null);
  const [showHeadphoneAdvice, setShowHeadphoneAdvice] = useState(true);
  const [selectedSingleSubject, setSelectedSingleSubject] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  
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
  const [currentSound, setCurrentSound] = useState<AmbientSound>('rain');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio with selected sound
  useEffect(() => {
    const sound = AMBIENT_SOUNDS[currentSound];
    audioRef.current = new Audio(sound.url);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    // If sound was playing, continue with new sound
    if (isSoundPlaying && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentSound]);

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

  // Change ambient sound
  const changeSound = (sound: AmbientSound) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentSound(sound);
    // Will auto-play via useEffect if isSoundPlaying is true
  };

  // Start quiz with selected mode
  const startQuiz = (mode: QuizMode) => {
    if (quizType === 'subject' && !selectedSingleSubject) {
      toast({
        title: "Select a subject",
        description: "Please choose a subject to practice",
        variant: "destructive"
      });
      return;
    }
    
    setQuizMode(mode);
    setShowHeadphoneAdvice(false);
    setTimeLeft(totalTimeSeconds);
    
    // Auto-start ambient sound
    if (audioRef.current) {
      audioRef.current.play().catch((e) => {
        console.log('Auto-play blocked, user can enable manually:', e);
      });
      setIsSoundPlaying(true);
    }
  };

  // Load questions
  useEffect(() => {
    if (!quizMode) return;
    
    const loadQuestions = async () => {
      try {
        let query = supabase.from('jamb_questions').select('*');
        
        if (quizType === 'subject' && selectedSingleSubject) {
          query = query.eq('subject', selectedSingleSubject as any);
        } else {
          query = query.in('subject', subjects as any);
        }
        
        if (selectedYear !== 'all') {
          query = query.eq('year', parseInt(selectedYear));
        }
        
        const { data, error } = await query.limit(500);

        if (error) throw error;

        if (data && data.length >= totalQuestions) {
          // Fisher-Yates shuffle for true randomness
          const shuffled = [...data];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          setQuestions(shuffled.slice(0, totalQuestions) as Question[]);
        } else if (data && data.length > 0) {
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          setQuestions(shuffled as Question[]);
          setTotalQuestions(shuffled.length);
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
  }, [subjects, totalQuestions, quizMode, quizType, selectedSingleSubject, selectedYear]);

  // Timer (skip for untimed mode)
  useEffect(() => {
    if (!quizMode || isPaused || isLoading || isUntimed) return;
    if (timeLeft <= 0) return;

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
  }, [quizMode, isPaused, isLoading, timeLeft, isUntimed]);

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

    if (quizMode === 'practice') {
      setShowAnswerFeedback(currentQuestion.correct_answer);
      
      setTimeout(() => {
        setShowAnswerFeedback(null);
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      }, 2500);
    }
  };

  const handleSubmit = useCallback(async () => {
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
        subjects: (quizType === 'subject' ? [selectedSingleSubject] : subjects) as any,
        total_questions: questions.length,
        correct_answers: correctCount,
        time_taken_seconds: timeTaken,
        questions_data: resultsData
      });
    } catch (error) {
      console.error('Error saving quiz:', error);
    }

    onComplete({
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeTaken,
      questions: resultsData
    });
  }, [questions, answers, timeLeft, totalTimeSeconds, userEmail, quizType, subjects, selectedSingleSubject, onComplete]);

  // Get filtered questions by subject
  const filteredQuestions = selectedSubjectFilter === 'all' 
    ? questions 
    : questions.filter(q => q.subject === selectedSubjectFilter);

  // Headphone advice screen with subject/year picker for subject mode
  if (showHeadphoneAdvice && !quizMode) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-card rounded-3xl p-6 md:p-8 border border-border shadow-2xl"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl md:text-6xl mb-4 text-center"
          >
            🎧
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground text-center">Ready to Focus?</h2>
          
          <p className="text-muted-foreground mb-6 text-center text-sm md:text-base">
            Use <span className="text-primary font-semibold">headphones</span> for relaxing ambient sounds to help you concentrate! 🧘‍♀️
          </p>

          {/* Subject picker for "Practice by Subject" mode */}
          {quizType === 'subject' && (
            <div className="bg-primary/5 rounded-2xl p-4 mb-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Choose Your Subject & Year
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Subject</label>
                  <Select value={selectedSingleSubject} onValueChange={setSelectedSingleSubject}>
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue placeholder="Select a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_SUBJECTS.map(subject => (
                        <SelectItem key={subject} value={subject} className="capitalize text-base py-3">
                          {subject.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Year (Optional)
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-base py-3">All Years (2000-2025)</SelectItem>
                      {YEARS.map(year => (
                        <SelectItem key={year} value={year.toString()} className="text-base py-3">
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                40 questions • Untimed • Instant feedback
              </p>
            </div>
          )}

          {/* Quiz info for other modes */}
          {quizType !== 'subject' && (
            <div className="bg-primary/10 rounded-2xl p-4 mb-6 text-center">
              <div className="flex items-center justify-center gap-2 text-primary font-medium mb-1">
                <Headphones className="w-5 h-5" />
                Ambient study sounds included
              </div>
              <p className="text-sm text-muted-foreground">
                {quizType === 'full' ? '60 questions • 70 minutes' : 
                 quizType === 'mini' ? '20 questions • 30 minutes' : 
                 '20 questions • 30 minutes'}
              </p>
            </div>
          )}

          {/* For subject mode - auto start practice mode */}
          {quizType === 'subject' ? (
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startQuiz('practice')}
                disabled={!selectedSingleSubject}
                className="w-full p-6 rounded-2xl border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                <h4 className="font-bold text-purple-600 text-xl">Start Practice</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  40 questions • Untimed • See answers instantly
                </p>
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground text-center">Choose Your Mode:</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startQuiz('practice')}
                  className="p-5 rounded-2xl border-2 border-primary bg-primary/10 hover:bg-primary/20 transition-all"
                >
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <h4 className="font-bold text-primary text-lg">Practice</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    See answers after each question
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startQuiz('exam')}
                  className="p-5 rounded-2xl border-2 border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 transition-all"
                >
                  <GraduationCap className="w-10 h-10 mx-auto mb-3 text-orange-500" />
                  <h4 className="font-bold text-orange-500 text-lg">Exam</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Like real JAMB CBT
                  </p>
                </motion.button>
              </div>
            </div>
          )}

          <Button 
            variant="ghost" 
            className="mt-6 text-muted-foreground w-full"
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
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center flex-col gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-7xl"
        >
          📚
        </motion.div>
        <p className="text-xl font-medium">Loading your questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-7xl mb-4">😕</div>
          <h3 className="text-2xl font-bold mb-2">No questions available</h3>
          <p className="text-muted-foreground mb-6">Please select a different subject or year and try again.</p>
          <Button onClick={onExit} size="lg">Go Back</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (Object.keys(answers).length / questions.length) * 100;
  const isLowTime = timeLeft < 300;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Clean Header with Big Timer */}
      <div className={`p-4 md:p-6 border-b border-border ${isLowTime ? 'bg-destructive/10' : 'bg-card'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Top row: Exit, Timer, Sound */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={onExit} className="text-muted-foreground">
              <ChevronLeft className="w-5 h-5 mr-1" /> Exit
            </Button>
            
            {/* Big Timer - Center (or Untimed badge for subject mode) */}
            {isUntimed ? (
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-lg bg-purple-500/10 text-purple-600">
                <Sparkles className="w-6 h-6" />
                Practice Mode ✨
              </div>
            ) : (
              <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-mono text-2xl md:text-3xl font-bold ${
                isLowTime ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-primary/10 text-primary'
              }`}>
                <Clock className="w-6 h-6 md:w-8 md:h-8" />
                {formatTime(timeLeft)}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {/* Sound Selector Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={isSoundPlaying ? "default" : "ghost"}
                    size="icon"
                    className={`h-10 w-10 ${isSoundPlaying ? 'bg-primary/20 text-primary hover:bg-primary/30' : ''}`}
                  >
                    {isSoundPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="end">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Ambient Sound</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSound}
                        className="h-8 px-2"
                      >
                        {isSoundPlaying ? 'Mute' : 'Play'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.entries(AMBIENT_SOUNDS) as [AmbientSound, typeof AMBIENT_SOUNDS[AmbientSound]][]).map(([key, sound]) => {
                        const Icon = sound.icon;
                        const isActive = currentSound === key;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              changeSound(key);
                              if (!isSoundPlaying) {
                                toggleSound();
                              }
                            }}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                              isActive 
                                ? 'border-primary bg-primary/10 text-primary' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{sound.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      🎧 Volume at 30% for focus
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsPaused(!isPaused)}
                className="h-10 w-10"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          
          {/* Question counter & mode badge */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              quizMode === 'practice' ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-500'
            }`}>
              {quizMode === 'practice' ? '📖 Practice Mode' : '📝 Exam Mode'}
            </span>
            <span className="text-lg font-bold text-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          
          {/* Progress bar */}
          <Progress value={progress} className="h-3 rounded-full" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {Object.keys(answers).length} of {questions.length} answered
          </p>
        </div>
      </div>

      {/* Subject Filter Tabs - Only show for multi-subject quizzes */}
      {quizType !== 'subject' && subjects.length > 1 && (
        <div className="border-b border-border bg-card/50 py-3 px-4 overflow-x-auto">
          <Tabs value={selectedSubjectFilter} onValueChange={setSelectedSubjectFilter} className="max-w-4xl mx-auto">
            <TabsList className="bg-muted/50 h-auto flex-wrap gap-1">
              <TabsTrigger value="all" className="text-sm px-4 py-2">
                All ({questions.length})
              </TabsTrigger>
              {subjects.map(subject => {
                const count = questions.filter(q => q.subject === subject).length;
                const answered = questions.filter(q => q.subject === subject && answers[q.id]).length;
                return (
                  <TabsTrigger 
                    key={subject} 
                    value={subject}
                    className="text-sm px-4 py-2 capitalize"
                  >
                    {subject.replace('_', ' ')} ({answered}/{count})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Motivation popup */}
      <AnimatePresence>
        {showMotivation && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-32 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2"
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
              className="text-7xl mb-6"
            >
              ⏸️
            </motion.div>
            <h3 className="text-3xl font-bold mb-3">Quiz Paused</h3>
            <p className="text-muted-foreground mb-6 text-lg">Timer is still running! ⏰</p>
            <Button onClick={() => setIsPaused(false)} variant="hero" size="lg">
              <Play className="w-5 h-5 mr-2" /> Continue Quiz
            </Button>
          </div>
        </div>
      )}

      {/* Question - Spacious Layout */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-3xl p-6 md:p-8 border border-border mb-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold capitalize">
                {currentQuestion.subject.replace('_', ' ')}
              </span>
              {currentQuestion.year && (
                <span className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                  {currentQuestion.year}
                </span>
              )}
              {quizMode === 'practice' && (
                <span className="px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full text-xs font-medium ml-auto">
                  ✨ Learn as you go
                </span>
              )}
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
              {currentQuestion.question}
            </h3>
          </motion.div>

          {/* Answer Options - Bigger & More Spacious */}
          <div className="space-y-4">
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
                  className={`w-full p-5 md:p-6 rounded-2xl border-2 text-left transition-all ${
                    isCorrect && showAnswerFeedback
                      ? 'border-green-500 bg-green-500/20'
                      : isWrong
                      ? 'border-red-500 bg-red-500/20'
                      : isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 bg-card hover:bg-card/80'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      isCorrect && showAnswerFeedback
                        ? 'bg-green-500 text-white'
                        : isWrong
                        ? 'bg-red-500 text-white'
                        : isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCorrect && showAnswerFeedback ? <CheckCircle className="w-6 h-6" /> : 
                       isWrong ? <XCircle className="w-6 h-6" /> : letter}
                    </span>
                    <span className="text-foreground text-base md:text-lg leading-relaxed">
                      {currentQuestion[optionKey] as string}
                    </span>
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
              className="mt-6 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl"
            >
              <div className="flex items-center gap-2 text-green-600 font-bold text-lg mb-3">
                <CheckCircle className="w-6 h-6" />
                Correct Answer: {showAnswerFeedback}
              </div>
              {currentQuestion.explanation && (
                <p className="text-muted-foreground text-base leading-relaxed">{currentQuestion.explanation}</p>
              )}
              <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Moving to next question...
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation - Clean & Spacious */}
      <div className="p-4 md:p-6 border-t border-border bg-card">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0 || !!showAnswerFeedback}
            className="px-6"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Previous
          </Button>

          {/* Question dots */}
          <div className="hidden md:flex gap-1.5 overflow-x-auto max-w-md">
            {questions.slice(Math.max(0, currentIndex - 4), currentIndex + 5).map((q, i) => {
              const actualIndex = Math.max(0, currentIndex - 4) + i;
              const isAnswered = answers[q.id];
              const isCurrent = actualIndex === currentIndex;
              
              return (
                <button
                  key={q.id}
                  onClick={() => !showAnswerFeedback && setCurrentIndex(actualIndex)}
                  disabled={!!showAnswerFeedback}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground scale-110'
                      : isAnswered
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {actualIndex + 1}
                </button>
              );
            })}
          </div>

          {currentIndex === questions.length - 1 ? (
            <Button variant="hero" size="lg" onClick={handleSubmit} disabled={!!showAnswerFeedback} className="px-6">
              <Flag className="w-5 h-5 mr-2" /> Submit Quiz
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={!!showAnswerFeedback}
              className="px-6"
            >
              Next <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
