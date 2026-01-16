import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Pause, Play, Flag, ChevronLeft, ChevronRight, Sparkles, Volume2, VolumeX, Timer, Settings2, Calculator, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { JambCalculator } from '@/components/JambCalculator';
import { getQuestions, saveQuestions, addToSyncQueue } from '@/services/offlineStorage';

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

// Ambient sounds - verified working URLs
const AMBIENT_SOUNDS = {
  rain: {
    url: "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3",
    label: "🌧️ Gentle Rain"
  },
  birds: {
    url: "https://assets.mixkit.co/active_storage/sfx/2433/2433-preview.mp3",
    label: "🐦 Morning Birds"
  },
  ocean: {
    url: "https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3",
    label: "🌊 Ocean Waves"
  },
  forest: {
    url: "https://assets.mixkit.co/active_storage/sfx/2500/2500-preview.mp3",
    label: "🌲 Forest Ambience"
  },
  fire: {
    url: "https://assets.mixkit.co/active_storage/sfx/100/100-preview.mp3",
    label: "🔥 Crackling Fire"
  },
  thinking: {
    url: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
    label: "🧠 Thinking Tones"
  },
  piano: {
    url: "https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3",
    label: "🎹 Soft Piano"
  },
  whitenoise: {
    url: "https://assets.mixkit.co/active_storage/sfx/2499/2499-preview.mp3",
    label: "📻 White Noise"
  },
  lofi: {
    url: "https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3",
    label: "🎧 Lo-Fi Beats"
  },
  night: {
    url: "https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3",
    label: "🌙 Night Crickets"
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

// Question count options
const QUESTION_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 50, 60];

export const TimedQuiz = ({ userEmail, subjects, quizType, onComplete, onExit }: TimedQuizProps) => {
  // Quiz config based on type
  const getQuizConfig = () => {
    switch (quizType) {
      case 'full': return { questions: 60, time: 70 * 60, untimed: false };
      case 'mini': return { questions: 20, time: 30 * 60, untimed: false };
      case 'subject': return { questions: 40, time: 30 * 60, untimed: false };
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
  
  // Multi-subject selection with per-subject year selection
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectYears, setSubjectYears] = useState<Record<string, { start: number; end: number }>>({});
  
  // Custom question count
  const [customQuestionCount, setCustomQuestionCount] = useState(20);
  
  // Timed practice duration
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  
  // Previously answered question IDs to avoid repetition
  const [previouslyAnsweredIds, setPreviouslyAnsweredIds] = useState<Set<string>>(new Set());
  
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
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Audio state - muted by default
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<AmbientSound>('rain');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load previously answered questions to avoid repetition
  useEffect(() => {
    const loadPreviousQuestions = async () => {
      const { data } = await supabase
        .from('quiz_attempts')
        .select('questions_data')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        const ids = new Set<string>();
        data.forEach(attempt => {
          if (attempt.questions_data && Array.isArray(attempt.questions_data)) {
            attempt.questions_data.forEach((q: any) => {
              if (q.id && q.userAnswer === q.correct_answer) {
                // Only exclude questions user got right
                ids.add(q.id);
              }
            });
          }
        });
        setPreviouslyAnsweredIds(ids);
      }
    };
    loadPreviousQuestions();
  }, [userEmail]);

  // Initialize and manage audio
  useEffect(() => {
    if (showSetup) return;
    
    const sound = AMBIENT_SOUNDS[currentSound];
    const audio = new Audio();
    audio.src = sound.url;
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = 'auto';
    audioRef.current = audio;
    
    const handleCanPlay = () => {
      if (isSoundPlaying && audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.log('Audio play failed:', err.message);
        });
      }
    };
    
    audio.addEventListener('canplaythrough', handleCanPlay);
    
    if (isSoundPlaying) {
      audio.play().catch((err) => {
        console.log('Initial audio play failed:', err.message);
      });
    }
    
    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [currentSound, showSetup]);

  useEffect(() => {
    if (!audioRef.current || showSetup) return;
    
    if (isSoundPlaying) {
      audioRef.current.play().catch(console.log);
    } else {
      audioRef.current.pause();
    }
  }, [isSoundPlaying, showSetup]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const toggleSound = () => {
    setIsSoundPlaying(prev => !prev);
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
        // Remove subject and its year config
        const newYears = { ...subjectYears };
        delete newYears[subject];
        setSubjectYears(newYears);
        return prev.filter(s => s !== subject);
      }
      // Add subject with default year range
      setSubjectYears(prev => ({
        ...prev,
        [subject]: { start: 2000, end: 2025 }
      }));
      return [...prev, subject];
    });
  };

  // Update year for a specific subject
  const updateSubjectYear = (subject: string, type: 'start' | 'end', year: number) => {
    setSubjectYears(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [type]: year
      }
    }));
  };

  // Start quiz
  const startQuiz = (mode: QuizMode) => {
    if ((quizType === 'subject' || quizType === 'timed-practice') && selectedSubjects.length === 0) {
      toast({
        title: "Select at least one subject",
        description: "Please choose subjects to practice",
        variant: "destructive"
      });
      return;
    }
    
    // Set custom question count and time
    if (quizType === 'subject' || quizType === 'timed-practice') {
      setTotalQuestions(customQuestionCount);
      setTotalTimeSeconds(selectedDuration * 60);
      setTimeLeft(selectedDuration * 60);
    }
    
    setQuizMode(mode);
    setShowSetup(false);
  };

  // Load questions with year filtering and anti-repetition
  useEffect(() => {
    if (!quizMode) return;
    
    const loadQuestions = async () => {
      try {
        const subjectsToUse = (quizType === 'subject' || quizType === 'timed-practice') && selectedSubjects.length > 0
          ? selectedSubjects
          : subjects;
        
        let allQuestions: Question[] = [];
        const isOnline = navigator.onLine;
        
        // Try to load from Supabase if online
        if (isOnline) {
          // For practice mode, load per-subject with year filters
          if ((quizType === 'subject' || quizType === 'timed-practice') && Object.keys(subjectYears).length > 0) {
            for (const subject of subjectsToUse) {
              const yearConfig = subjectYears[subject] || { start: 2000, end: 2025 };
              
              const { data, error } = await supabase
                .from('jamb_questions')
                .select('*')
                .eq('subject', subject as any)
                .gte('year', yearConfig.start)
                .lte('year', yearConfig.end)
                .limit(200);
              
              if (!error && data) {
                allQuestions.push(...(data as Question[]));
              }
            }
          } else {
            // Standard query
            const { data, error } = await supabase
              .from('jamb_questions')
              .select('*')
              .in('subject', subjectsToUse as any)
              .limit(500);
            
            if (!error && data) {
              allQuestions = data as Question[];
              // Cache questions for offline use
              await saveQuestions(data as Question[]);
            }
          }
        }
        
        // Fallback to offline cache if no questions loaded
        if (allQuestions.length === 0) {
          const cachedQuestions = await getQuestions(subjectsToUse);
          if (cachedQuestions.length > 0) {
            allQuestions = cachedQuestions;
            if (!isOnline) {
              toast({
                title: "Offline Mode",
                description: "Using cached questions",
              });
            }
          }
        }

        // Filter out previously answered questions (unless not enough remain)
        let filteredQuestions = allQuestions.filter(q => !previouslyAnsweredIds.has(q.id));
        
        // If not enough questions after filtering, include some previously answered
        if (filteredQuestions.length < totalQuestions) {
          const previouslyAnswered = allQuestions.filter(q => previouslyAnsweredIds.has(q.id));
          // Shuffle and add some back
          const shuffledPrevious = previouslyAnswered.sort(() => Math.random() - 0.5);
          filteredQuestions.push(...shuffledPrevious.slice(0, totalQuestions - filteredQuestions.length));
        }

        if (filteredQuestions.length >= totalQuestions) {
          // Fisher-Yates shuffle for true randomness
          const shuffled = [...filteredQuestions];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          setQuestions(shuffled.slice(0, totalQuestions));
        } else if (filteredQuestions.length > 0) {
          const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
          setQuestions(shuffled);
          setTotalQuestions(shuffled.length);
          toast({
            title: `Only ${shuffled.length} questions available`,
            description: "Continuing with available questions",
          });
        } else {
          toast({
            title: "No questions found",
            description: "Try different subjects or year range",
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
  }, [subjects, totalQuestions, quizMode, quizType, selectedSubjects, subjectYears, previouslyAnsweredIds]);

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

    const subjectsUsed = ((quizType === 'subject' || quizType === 'timed-practice') && selectedSubjects.length > 0 
      ? selectedSubjects 
      : subjects) as any;

    try {
      const quizData = {
        email: userEmail,
        quiz_type: quizType,
        subjects: subjectsUsed,
        total_questions: questions.length,
        correct_answers: correctCount,
        time_taken_seconds: timeTaken,
        questions_data: resultsData
      };

      // Step 1: Save quiz attempt (critical - must succeed)
      if (navigator.onLine) {
        const { error: quizError } = await supabase.from('quiz_attempts').insert(quizData);
        if (quizError) throw quizError;
        
        // Step 2: Update leaderboard asynchronously (fire-and-forget)
        // This runs in the background and doesn't block the UI
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        fetch(`${supabaseUrl}/functions/v1/update-leaderboard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({
            userEmail,
            correctCount,
            totalQuestions: questions.length,
            timeTaken,
            totalTimeSeconds
          })
        }).then(res => res.json()).then(data => {
          if (data.pointsEarned > 0) {
            toast({
              title: `+${data.pointsEarned} leaderboard points earned!`,
              description: `${correctCount}/${questions.length} correct answers`
            });
          }
        }).catch(err => {
          console.log('Leaderboard update queued for later:', err);
        });
      } else {
        // Queue for sync when back online
        await addToSyncQueue('quiz_attempt', quizData);
        toast({
          title: "Saved Offline",
          description: "Your quiz will sync when you're back online",
        });
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      // Even if save fails, still show results to user
    }

    // Immediately show results - don't wait for leaderboard
    onComplete({
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeTaken,
      questions: resultsData
    });
  }, [questions, answers, timeLeft, totalTimeSeconds, userEmail, quizType, subjects, selectedSubjects, onComplete]);

  // Setup screen
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
            {isPracticeMode ? 'Select subjects, years, and settings' : 'Choose your quiz mode'}
          </p>

          {/* Subject selection with per-subject year picker */}
          {isPracticeMode && (
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Subjects & Years ({selectedSubjects.length} selected)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {subjects.map(subject => (
                  <div key={subject} className="space-y-2">
                    <label
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
                      <span className="capitalize flex-1">{subject.replace('_', ' ')}</span>
                    </label>
                    
                    {/* Per-subject year selection */}
                    {selectedSubjects.includes(subject) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="ml-6 flex items-center gap-2 text-xs"
                      >
                        <span className="text-muted-foreground">Year:</span>
                        <select
                          value={subjectYears[subject]?.start || 2000}
                          onChange={(e) => updateSubjectYear(subject, 'start', parseInt(e.target.value))}
                          className="p-1 rounded border border-border bg-background text-xs"
                        >
                          {YEARS.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        <span className="text-muted-foreground">to</span>
                        <select
                          value={subjectYears[subject]?.end || 2025}
                          onChange={(e) => updateSubjectYear(subject, 'end', parseInt(e.target.value))}
                          className="p-1 rounded border border-border bg-background text-xs"
                        >
                          {YEARS.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question count selection */}
          {isPracticeMode && (
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Number of Questions
              </label>
              <div className="grid grid-cols-5 gap-2">
                {QUESTION_OPTIONS.slice(0, 5).map(count => (
                  <button
                    key={count}
                    onClick={() => setCustomQuestionCount(count)}
                    className={`p-2 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                      customQuestionCount === count
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {QUESTION_OPTIONS.slice(5).map(count => (
                  <button
                    key={count}
                    onClick={() => setCustomQuestionCount(count)}
                    className={`p-2 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                      customQuestionCount === count
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time selection */}
          {isPracticeMode && (
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Time Limit
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
          <p className="text-muted-foreground mb-4">Try selecting different subjects or year range.</p>
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
          
          {/* Compact Timer */}
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
          
          {/* Sound Controls */}
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 ${isSoundPlaying ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {isSoundPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
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
            {/* Calculator Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCalculator(true)}
              className="h-8 px-2 text-muted-foreground hover:text-primary"
              title="Calculator"
            >
              <Calculator className="w-4 h-4" />
            </Button>
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
        
        {/* Calculator */}
        <JambCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
        
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

      {/* Question Content */}
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

          {/* Answer Options */}
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

      {/* Navigation Footer */}
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

          {/* Question dots */}
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
