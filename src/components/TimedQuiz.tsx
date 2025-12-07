import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Pause, Play, Flag, ChevronLeft, ChevronRight, Sparkles, Volume2, VolumeX, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

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
  quizType: 'full' | 'mini' | 'demo' | 'subject' | 'timed-practice';
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

// Original ambient sounds - soft background for studying
const AMBIENT_SOUNDS = {
  rain: {
    url: "https://cdn.pixabay.com/audio/2022/05/13/audio_257112311e.mp3",
    label: "🌧️ Soft Rain"
  },
  library: {
    url: "https://cdn.pixabay.com/audio/2022/03/10/audio_4dedf5bf94.mp3",
    label: "📚 Library"
  },
  lofi: {
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
    label: "🎵 Lo-Fi"
  },
  nature: {
    url: "https://cdn.pixabay.com/audio/2021/08/04/audio_27f54de4e9.mp3",
    label: "🌿 Nature"
  },
  piano: {
    url: "https://cdn.pixabay.com/audio/2022/02/07/audio_b9bd4170e4.mp3",
    label: "🎹 Piano"
  }
};

type AmbientSound = keyof typeof AMBIENT_SOUNDS;

const YEARS = Array.from({ length: 26 }, (_, i) => 2000 + i);

// Time options for timed practice (in minutes)
const TIME_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
];

export const TimedQuiz = ({ userEmail, subjects, quizType, onComplete, onExit }: TimedQuizProps) => {
  // Quiz config based on type - subject practice is now unified with timed practice
  const getQuizConfig = () => {
    switch (quizType) {
      case 'full': return { questions: 60, time: 70 * 60, untimed: false };
      case 'mini': return { questions: 20, time: 30 * 60, untimed: false };
      case 'subject': return { questions: 40, time: 30 * 60, untimed: false }; // Now timed too
      case 'timed-practice': return { questions: 40, time: 30 * 60, untimed: false };
      case 'demo': return { questions: 20, time: 30 * 60, untimed: false };
      default: return { questions: 60, time: 70 * 60, untimed: false };
    }
  };
  
  const config = getQuizConfig();
  const [totalQuestions, setTotalQuestions] = useState(config.questions);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(config.time);
  const isUntimed = config.untimed;
  
  // Pre-quiz state
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  
  // Multi-subject selection for "Practice by Subject"
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<Record<string, string>>({});
  
  // Timed practice duration
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  
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
  const [currentSound, setCurrentSound] = useState<AmbientSound>('lofi');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    const sound = AMBIENT_SOUNDS[currentSound];
    audioRef.current = new Audio(sound.url);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.15; // Lower volume for less distraction
    
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

  const changeSound = (sound: AmbientSound) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentSound(sound);
  };

  // Toggle subject selection
  const toggleSubjectSelection = (subject: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      }
      return [...prev, subject];
    });
  };

  // Start quiz
  const startQuiz = (mode: QuizMode) => {
    if (quizType === 'subject' && selectedSubjects.length === 0) {
      toast({
        title: "Select at least one subject",
        description: "Please choose subjects to practice",
        variant: "destructive"
      });
      return;
    }
    
    // Set time for timed practice
    if (quizType === 'timed-practice') {
      setTotalTimeSeconds(selectedDuration * 60);
      setTimeLeft(selectedDuration * 60);
    }
    
    setQuizMode(mode);
    setShowSetup(false);
    
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
        let query = supabase.from('jamb_questions').select('*');
        
        // Use selected subjects for practice mode, otherwise use provided subjects
        const subjectsToUse = (quizType === 'subject' || quizType === 'timed-practice') && selectedSubjects.length > 0
          ? selectedSubjects
          : subjects;
        
        query = query.in('subject', subjectsToUse as any);
        
        const { data, error } = await query.limit(500);

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
  }, [subjects, totalQuestions, quizMode, quizType, selectedSubjects]);

  // Timer
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
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      }, 2000);
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
        subjects: ((quizType === 'subject' || quizType === 'timed-practice') && selectedSubjects.length > 0 
          ? selectedSubjects 
          : subjects) as any,
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
  }, [questions, answers, timeLeft, totalTimeSeconds, userEmail, quizType, subjects, selectedSubjects, onComplete]);

  // Unified setup screen - combines subject + year + time selection
  if (showSetup && !quizMode) {
    const isPracticeMode = quizType === 'subject' || quizType === 'timed-practice';
    
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-card rounded-2xl p-5 border border-border shadow-xl my-8"
        >
          <h2 className="text-xl font-bold mb-1 text-foreground text-center">
            {isPracticeMode ? '📚 Practice Quiz' : 
             quizType === 'full' ? '📝 Full Quiz (60 Qs)' : '⚡ Mini Quiz (20 Qs)'}
          </h2>
          
          <p className="text-muted-foreground mb-4 text-center text-sm">
            {isPracticeMode ? 'Select subjects, years, and time' : 'Choose your quiz mode'}
          </p>

          {/* Subject selection for practice modes - shows user's subjects only */}
          {isPracticeMode && (
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Subjects ({selectedSubjects.length} selected)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {subjects.map(subject => (
                  <label
                    key={subject}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                      selectedSubjects.includes(subject)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedSubjects.includes(subject)}
                      onCheckedChange={() => toggleSubjectSelection(subject)}
                    />
                    <span className="capitalize">{subject.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Year selection for practice modes */}
          {isPracticeMode && (
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Year Range (optional)
              </label>
              <div className="flex gap-2 items-center">
                <select
                  value={selectedYears.start || '2000'}
                  onChange={(e) => setSelectedYears(prev => ({ ...prev, start: e.target.value }))}
                  className="flex-1 p-2 rounded-lg border border-border bg-background text-sm"
                >
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <span className="text-muted-foreground">to</span>
                <select
                  value={selectedYears.end || '2025'}
                  onChange={(e) => setSelectedYears(prev => ({ ...prev, end: e.target.value }))}
                  className="flex-1 p-2 rounded-lg border border-border bg-background text-sm"
                >
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Time selection for practice modes */}
          {isPracticeMode && (
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Practice Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_OPTIONS.slice(0, 4).map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDuration(option.value)}
                    className={`p-2 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                      selectedDuration === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {TIME_OPTIONS.slice(4).map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDuration(option.value)}
                    className={`p-2 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                      selectedDuration === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quiz mode selection */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => startQuiz('practice')}
              disabled={isPracticeMode && selectedSubjects.length === 0}
              className="p-3 rounded-xl border-2 border-primary bg-primary/10 hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <div className="text-xl mb-1">📖</div>
              <h4 className="font-bold text-primary text-sm">Practice</h4>
              <p className="text-xs text-muted-foreground">See answers after each</p>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => startQuiz('exam')}
              disabled={isPracticeMode && selectedSubjects.length === 0}
              className="p-3 rounded-xl border-2 border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 transition-all disabled:opacity-50"
            >
              <div className="text-xl mb-1">🎓</div>
              <h4 className="font-bold text-orange-500 text-sm">Exam</h4>
              <p className="text-xs text-muted-foreground">Like real JAMB</p>
            </motion.button>
          </div>

          <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={onExit}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
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
          className="text-6xl"
        >
          📚
        </motion.div>
        <p className="text-lg font-medium">Loading questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-bold mb-2">No questions available</h3>
          <p className="text-muted-foreground mb-4">Try selecting different subjects.</p>
          <Button onClick={onExit}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (Object.keys(answers).length / questions.length) * 100;
  const isLowTime = timeLeft < 300;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Minimal Header */}
      <div className={`px-4 py-3 border-b border-border ${isLowTime ? 'bg-destructive/10' : 'bg-card'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Exit button */}
          <Button variant="ghost" size="sm" onClick={onExit} className="text-muted-foreground h-8 px-2">
            <ChevronLeft className="w-4 h-4" /> Exit
          </Button>
          
          {/* Compact Timer or Mode Badge */}
          {isUntimed ? (
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
              Practice ✨
            </Badge>
          ) : (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-bold ${
              isLowTime ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-primary/10 text-primary'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeLeft)}
            </div>
          )}
          
          {/* Sound Controls with selector */}
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 ${isSoundPlaying ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {isSoundPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-xs ml-1 hidden sm:inline">{AMBIENT_SOUNDS[currentSound].label}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">🎵 Background Sound</p>
                  {(Object.keys(AMBIENT_SOUNDS) as AmbientSound[]).map((sound) => (
                    <button
                      key={sound}
                      onClick={() => {
                        changeSound(sound);
                        if (!isSoundPlaying) toggleSound();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        currentSound === sound
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {AMBIENT_SOUNDS[sound].label}
                    </button>
                  ))}
                  <div className="border-t border-border mt-2 pt-2">
                    <button
                      onClick={toggleSound}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted"
                    >
                      {isSoundPlaying ? '🔇 Turn Off' : '🔊 Turn On'}
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="h-8 w-8 p-0"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-2">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {currentIndex + 1}/{questions.length} • {Object.keys(answers).length} answered
          </p>
        </div>
      </div>

      {/* Motivation popup */}
      <AnimatePresence>
        {showMotivation && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg z-50 text-sm"
          >
            {motivationMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-background/95 z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏸️</div>
            <h3 className="text-2xl font-bold mb-2">Paused</h3>
            {!isUntimed && <p className="text-muted-foreground mb-4">Timer still running ⏰</p>}
            <Button onClick={() => setIsPaused(false)} variant="hero">
              <Play className="w-4 h-4 mr-2" /> Continue
            </Button>
          </div>
        </div>
      )}

      {/* Question Content - Clean and Spacious */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {/* Question Card */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-xl p-5 border border-border mb-4"
          >
            <div className="flex items-center gap-2 mb-3 text-xs">
              <Badge variant="secondary" className="capitalize">
                {currentQuestion.subject.replace('_', ' ')}
              </Badge>
              {currentQuestion.year && (
                <Badge variant="outline">{currentQuestion.year}</Badge>
              )}
              {quizMode === 'practice' && (
                <Badge className="bg-green-500/10 text-green-600 ml-auto">Learn mode</Badge>
              )}
            </div>
            <p className="text-lg font-medium text-foreground leading-relaxed">
              {currentQuestion.question}
            </p>
          </motion.div>

          {/* Answer Options - Clean Layout */}
          <div className="space-y-2.5">
            {['A', 'B', 'C', 'D'].map((letter) => {
              const optionKey = `option_${letter.toLowerCase()}` as keyof Question;
              const isSelected = answers[currentQuestion.id] === letter;
              const isCorrect = showAnswerFeedback === letter;
              const isWrong = showAnswerFeedback && isSelected && !isCorrect;
              
              return (
                <motion.button
                  key={letter}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => !showAnswerFeedback && handleAnswer(letter)}
                  disabled={!!showAnswerFeedback}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isCorrect && showAnswerFeedback
                      ? 'border-green-500 bg-green-500/10'
                      : isWrong
                      ? 'border-red-500 bg-red-500/10'
                      : isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      isCorrect && showAnswerFeedback
                        ? 'bg-green-500 text-white'
                        : isWrong
                        ? 'bg-red-500 text-white'
                        : isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCorrect && showAnswerFeedback ? <CheckCircle className="w-4 h-4" /> : 
                       isWrong ? <XCircle className="w-4 h-4" /> : letter}
                    </span>
                    <span className="text-foreground text-sm leading-relaxed">
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
            >
              <p className="text-green-600 font-medium text-sm mb-1">
                ✓ Correct: {showAnswerFeedback}
              </p>
              {currentQuestion.explanation && (
                <p className="text-muted-foreground text-sm">{currentQuestion.explanation}</p>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation - Minimal Footer */}
      <div className="p-3 border-t border-border bg-card">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0 || !!showAnswerFeedback}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </Button>

          {/* Question dots - compact */}
          <div className="hidden sm:flex gap-1 overflow-x-auto max-w-xs">
            {questions.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((q, i) => {
              const actualIndex = Math.max(0, currentIndex - 3) + i;
              const isAnswered = answers[q.id];
              const isCurrent = actualIndex === currentIndex;
              
              return (
                <button
                  key={q.id}
                  onClick={() => !showAnswerFeedback && setCurrentIndex(actualIndex)}
                  disabled={!!showAnswerFeedback}
                  className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
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

          {currentIndex === questions.length - 1 ? (
            <Button size="sm" onClick={handleSubmit} disabled={!!showAnswerFeedback} className="bg-primary">
              <Flag className="w-4 h-4 mr-1" /> Submit
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={!!showAnswerFeedback}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
