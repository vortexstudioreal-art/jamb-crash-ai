import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TrendingUp, Target, BookOpen, Flame, ChevronRight, Lightbulb, AlertCircle, Play, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  subject: string;
  year: number | null;
}

interface TopicGroup {
  topic: string;
  questions: Question[];
  years: Set<number>;
  frequency: 'very_high' | 'high' | 'medium';
}

const SUBJECT_LABELS: Record<string, string> = {
  english: '📖 English',
  mathematics: '🔢 Mathematics',
  physics: '⚡ Physics',
  chemistry: '🧪 Chemistry',
  biology: '🧬 Biology',
  literature: '📚 Literature',
  government: '🏛️ Government',
  economics: '💹 Economics',
  crs: '✝️ CRS',
  irs: '☪️ IRS',
  geography: '🌍 Geography',
  accounting: '📊 Accounting',
  commerce: '🏪 Commerce',
  agricultural_science: '🌾 Agric Science'
};

// Topic patterns to identify commonly tested areas
const TOPIC_PATTERNS: Record<string, { keywords: string[], label: string }> = {
  // Biology
  'photosynthesis': { keywords: ['photosynthe', 'chlorophyll', 'light reaction', 'calvin cycle', 'chloroplast'], label: '🌱 Photosynthesis' },
  'respiration': { keywords: ['respir', 'glycolysis', 'krebs', 'electron transport', 'atp', 'aerobic', 'anaerobic'], label: '💨 Respiration' },
  'genetics': { keywords: ['gene', 'allele', 'chromosome', 'mendel', 'heredit', 'dna', 'rna', 'mutation'], label: '🧬 Genetics' },
  'ecology': { keywords: ['ecosys', 'food chain', 'food web', 'habitat', 'niche', 'biome', 'population'], label: '🌿 Ecology' },
  'reproduction': { keywords: ['reproduct', 'fertiliz', 'gamete', 'meiosis', 'embryo', 'pollination'], label: '🥚 Reproduction' },
  'cell_biology': { keywords: ['cell membrane', 'mitochondr', 'nucleus', 'organelle', 'cytoplasm', 'mitosis'], label: '🔬 Cell Biology' },
  
  // Chemistry
  'organic_chemistry': { keywords: ['hydrocarbon', 'alkane', 'alkene', 'alcohol', 'ester', 'organic compound'], label: '⚗️ Organic Chemistry' },
  'acid_base': { keywords: ['acid', 'base', 'neutraliz', 'ph', 'buffer', 'titrat'], label: '🧫 Acids & Bases' },
  'redox': { keywords: ['oxidation', 'reduction', 'redox', 'electron transfer', 'oxidizing', 'reducing'], label: '⚡ Redox Reactions' },
  'periodic_table': { keywords: ['periodic', 'element', 'group', 'period', 'atomic number', 'noble gas'], label: '📊 Periodic Table' },
  'chemical_bonding': { keywords: ['ionic bond', 'covalent', 'bond', 'electronegativity', 'metallic bond'], label: '🔗 Chemical Bonding' },
  
  // Physics
  'motion': { keywords: ['velocity', 'acceleration', 'momentum', 'newton', 'force', 'motion', 'kinetic'], label: '🏃 Motion & Forces' },
  'waves': { keywords: ['wave', 'frequency', 'wavelength', 'amplitude', 'sound', 'light wave'], label: '🌊 Waves' },
  'electricity': { keywords: ['electric', 'current', 'voltage', 'resistance', 'ohm', 'circuit'], label: '⚡ Electricity' },
  'optics': { keywords: ['lens', 'mirror', 'reflection', 'refraction', 'light', 'optical'], label: '🔍 Optics' },
  'thermodynamics': { keywords: ['heat', 'temperature', 'thermal', 'entropy', 'enthalpy'], label: '🌡️ Thermodynamics' },
  
  // Mathematics
  'quadratic': { keywords: ['quadratic', 'parabola', 'completing the square', 'discriminant'], label: '📈 Quadratic Equations' },
  'trigonometry': { keywords: ['sine', 'cosine', 'tangent', 'trig', 'angle'], label: '📐 Trigonometry' },
  'calculus': { keywords: ['derivative', 'integral', 'differentiat', 'integrat', 'limit'], label: '∫ Calculus' },
  'probability': { keywords: ['probability', 'combination', 'permutation', 'statistics', 'random'], label: '🎲 Probability' },
  'logarithms': { keywords: ['logarithm', 'log', 'exponential', 'indices'], label: '📊 Logarithms' },
  
  // English
  'tenses': { keywords: ['tense', 'past', 'present', 'future', 'perfect', 'continuous'], label: '⏰ Tenses' },
  'comprehension': { keywords: ['passage', 'comprehension', 'according to', 'the author'], label: '📖 Comprehension' },
  'vocabulary': { keywords: ['synonym', 'antonym', 'meaning of', 'define'], label: '📝 Vocabulary' },
  'grammar': { keywords: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'pronoun'], label: '✍️ Grammar' },
  
  // Economics
  'demand_supply': { keywords: ['demand', 'supply', 'equilibrium', 'price', 'market'], label: '📉 Demand & Supply' },
  'inflation': { keywords: ['inflation', 'deflation', 'money supply', 'monetary'], label: '💰 Inflation' },
  'national_income': { keywords: ['gdp', 'gnp', 'national income', 'gross domestic'], label: '🏦 National Income' },
  
  // Government
  'democracy': { keywords: ['democracy', 'election', 'vote', 'parliament', 'legislature'], label: '🗳️ Democracy' },
  'federalism': { keywords: ['federal', 'federation', 'unitary', 'confederal'], label: '🏛️ Federalism' },
  'constitution': { keywords: ['constitution', 'bill of rights', 'amendment', 'fundamental'], label: '📜 Constitution' },
};

function identifyTopics(question: Question): string[] {
  const text = `${question.question} ${question.option_a} ${question.option_b} ${question.option_c} ${question.option_d}`.toLowerCase();
  const topics: string[] = [];
  
  for (const [topicKey, { keywords }] of Object.entries(TOPIC_PATTERNS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      topics.push(topicKey);
    }
  }
  
  // If no topic matched, categorize by subject
  if (topics.length === 0) {
    topics.push(`${question.subject}_general`);
  }
  
  return topics;
}

function getFrequencyLevel(count: number): 'very_high' | 'high' | 'medium' {
  if (count >= 15) return 'very_high';
  if (count >= 8) return 'high';
  return 'medium';
}

const FREQUENCY_CONFIG = {
  very_high: { label: 'Very High Yield', color: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30', icon: Flame },
  high: { label: 'High Yield', color: 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30', icon: TrendingUp },
  medium: { label: 'Medium Yield', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30', icon: Target },
};

// Topic Quiz Component
interface TopicQuizProps {
  questions: Question[];
  topicLabel: string;
  subject: string;
  onExit: () => void;
}

const TopicQuiz = ({ questions, topicLabel, subject, onExit }: TopicQuizProps) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [shuffledQuestions] = useState(() => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, Math.min(20, shuffled.length)); // Max 20 questions
  });
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const currentQuestion = shuffledQuestions[currentIndex];
  const progress = ((currentIndex + 1) / shuffledQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    setShowFeedback(currentQuestion.correct_answer);
    
    setTimeout(() => {
      setShowFeedback(null);
      if (currentIndex < shuffledQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 1500);
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    shuffledQuestions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correctCount++;
    });

    // Save quiz attempt
    if (user?.email) {
      try {
        await supabase.from('quiz_attempts').insert({
          email: user.email,
          quiz_type: 'topic-practice',
          subjects: [subject] as any,
          total_questions: shuffledQuestions.length,
          correct_answers: correctCount,
          time_taken_seconds: 0,
          questions_data: shuffledQuestions.map(q => ({
            ...q,
            userAnswer: answers[q.id] || ''
          }))
        });
      } catch (err) {
        console.error('Failed to save quiz:', err);
      }
    }

    setShowResult(true);
  };

  if (showResult) {
    const correctCount = shuffledQuestions.filter(q => answers[q.id] === q.correct_answer).length;
    const percentage = Math.round((correctCount / shuffledQuestions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4"
      >
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              percentage >= 70 ? 'bg-green-500/20' : percentage >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'
            }`}>
              {percentage >= 70 ? (
                <CheckCircle className="h-10 w-10 text-green-500" />
              ) : (
                <Target className="h-10 w-10 text-yellow-500" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">{percentage}% Score</h2>
            <p className="text-muted-foreground mb-4">
              You got {correctCount} out of {shuffledQuestions.length} questions correct on {topicLabel}
            </p>
            <div className="space-y-2">
              <Button onClick={onExit} className="w-full">
                Back to Topics
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={onExit}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit
          </Button>
          <Badge variant="secondary">{currentIndex + 1}/{shuffledQuestions.length}</Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          {topicLabel} • {SUBJECT_LABELS[subject] || subject}
        </p>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-4">
                  {currentQuestion.year && (
                    <Badge variant="outline" className="shrink-0">{currentQuestion.year}</Badge>
                  )}
                  <p className="text-base font-medium">{currentQuestion.question}</p>
                </div>

                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optionKey = `option_${opt.toLowerCase()}` as keyof Question;
                    const isSelected = answers[currentQuestion.id] === opt;
                    const isCorrect = showFeedback === opt;
                    const isWrong = showFeedback && isSelected && !isCorrect;

                    return (
                      <button
                        key={opt}
                        onClick={() => !showFeedback && !answers[currentQuestion.id] && handleAnswer(opt)}
                        disabled={!!showFeedback || !!answers[currentQuestion.id]}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          isCorrect
                            ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-400'
                            : isWrong
                            ? 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-400'
                            : isSelected
                            ? 'bg-primary/10 border-primary'
                            : 'bg-muted/50 border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="font-semibold mr-2">{opt}.</span>
                        {currentQuestion[optionKey] as string}
                      </button>
                    );
                  })}
                </div>

                {showFeedback && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-primary/10 rounded-lg flex items-start gap-2"
                  >
                    <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">{currentQuestion.explanation}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex-1"
          >
            Previous
          </Button>
          {currentIndex === shuffledQuestions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < shuffledQuestions.length}
              className="flex-1"
            >
              Submit ({answeredCount}/{shuffledQuestions.length})
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex(prev => prev + 1)}
              disabled={!answers[currentQuestion.id]}
              className="flex-1"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const HighYieldQuestions = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [activeQuiz, setActiveQuiz] = useState<{
    questions: Question[];
    topicLabel: string;
    subject: string;
  } | null>(null);

  const { data: questions, isLoading, error } = useQuery({
    queryKey: ['high-yield-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jamb_questions')
        .select('*')
        .order('year', { ascending: false });
      
      if (error) throw error;
      return data as Question[];
    }
  });

  const startTopicQuiz = useCallback((group: TopicGroup, subject: string) => {
    const topicLabel = TOPIC_PATTERNS[group.topic]?.label || group.topic.replace('_', ' ');
    if (group.questions.length < 3) {
      toast.error('Not enough questions for this topic');
      return;
    }
    setActiveQuiz({
      questions: group.questions,
      topicLabel,
      subject
    });
  }, []);


  // Group questions by topic
  const topicGroups = useMemo(() => {
    if (!questions) return new Map<string, Map<string, TopicGroup>>();
    
    // Filter by subject if selected
    const filtered = selectedSubject === 'all' 
      ? questions 
      : questions.filter(q => q.subject === selectedSubject);
    
    // Group by subject, then by topic
    const groups = new Map<string, Map<string, TopicGroup>>();
    
    for (const question of filtered) {
      const topics = identifyTopics(question);
      const subjectKey = question.subject;
      
      if (!groups.has(subjectKey)) {
        groups.set(subjectKey, new Map());
      }
      
      const subjectGroups = groups.get(subjectKey)!;
      
      for (const topic of topics) {
        if (!subjectGroups.has(topic)) {
          subjectGroups.set(topic, {
            topic,
            questions: [],
            years: new Set(),
            frequency: 'medium'
          });
        }
        
        const group = subjectGroups.get(topic)!;
        group.questions.push(question);
        if (question.year) group.years.add(question.year);
        group.frequency = getFrequencyLevel(group.questions.length);
      }
    }
    
    // Sort topics by frequency within each subject
    for (const [subject, subjectGroups] of groups) {
      const sorted = new Map([...subjectGroups.entries()].sort((a, b) => 
        b[1].questions.length - a[1].questions.length
      ));
      groups.set(subject, sorted);
    }
    
    return groups;
  }, [questions, selectedSubject]);

  // Filter by frequency
  const filteredGroups = useMemo(() => {
    const result = new Map<string, TopicGroup[]>();
    
    for (const [subject, subjectGroups] of topicGroups) {
      const filtered = [...subjectGroups.values()].filter(group => {
        if (selectedFrequency === 'all') return group.questions.length >= 5; // Minimum threshold
        return group.frequency === selectedFrequency;
      });
      
      if (filtered.length > 0) {
        result.set(subject, filtered);
      }
    }
    
    return result;
  }, [topicGroups, selectedFrequency]);

  // Stats
  const stats = useMemo(() => {
    let totalTopics = 0;
    let totalQuestions = 0;
    const frequencyCounts = { very_high: 0, high: 0, medium: 0 };
    
    for (const groups of filteredGroups.values()) {
      for (const group of groups) {
        totalTopics++;
        totalQuestions += group.questions.length;
        frequencyCounts[group.frequency]++;
      }
    }
    
    return { totalTopics, totalQuestions, frequencyCounts };
  }, [filteredGroups]);

  // Show quiz if active - MUST be after all hooks
  if (activeQuiz) {
    return (
      <TopicQuiz
        questions={activeQuiz.questions}
        topicLabel={activeQuiz.topicLabel}
        subject={activeQuiz.subject}
        onExit={() => setActiveQuiz(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-4 border-destructive">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-destructive">Failed to load questions. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" />
          High-Yield Topics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Topics JAMB loves to test repeatedly
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Frequency</label>
              <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All frequencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  <SelectItem value="very_high">🔥 Very High Yield</SelectItem>
                  <SelectItem value="high">📈 High Yield</SelectItem>
                  <SelectItem value="medium">🎯 Medium Yield</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalTopics}</div>
            <div className="text-xs text-muted-foreground">Topics Found</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.frequencyCounts.very_high}</div>
            <div className="text-xs text-muted-foreground">Very High Yield</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalQuestions}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </CardContent>
        </Card>
      </div>

      {/* Topics by Subject */}
      {filteredGroups.size === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No high-yield topics found with current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {[...filteredGroups.entries()].map(([subject, topics]) => (
            <AccordionItem key={subject} value={subject} className="border rounded-lg bg-card overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">{SUBJECT_LABELS[subject] || subject}</span>
                  <Badge variant="secondary" className="text-xs">
                    {topics.length} topics
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {topics.map((group) => {
                    const config = FREQUENCY_CONFIG[group.frequency];
                    const Icon = config.icon;
                    const topicLabel = TOPIC_PATTERNS[group.topic]?.label || group.topic.replace('_', ' ');
                    
                    return (
                      <Accordion key={group.topic} type="single" collapsible>
                        <AccordionItem value={group.topic} className="border rounded-lg overflow-hidden">
                          <AccordionTrigger className="px-3 py-2 hover:no-underline bg-muted/30">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span className="font-medium text-sm">{topicLabel}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${config.color}`}>
                                  {group.questions.length} Qs
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {group.years.size} years
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-3">
                            {/* Practice Button */}
                            <Button
                              size="sm"
                              className="w-full mb-3 gap-2"
                              onClick={() => startTopicQuiz(group, subject)}
                            >
                              <Play className="h-4 w-4" />
                              Practice {group.questions.length} Questions
                            </Button>

                            <div className="text-xs text-muted-foreground mb-3">
                              Appeared in: {[...group.years].sort((a, b) => b - a).slice(0, 10).join(', ')}
                              {group.years.size > 10 && ` +${group.years.size - 10} more`}
                            </div>
                            <div className="space-y-3">
                              {group.questions.slice(0, 3).map((q, idx) => (
                                <div key={q.id} className="p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-start gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs shrink-0">
                                      {q.year || 'N/A'}
                                    </Badge>
                                    <p className="text-sm">{q.question}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {['A', 'B', 'C', 'D'].map((opt) => {
                                      const isCorrect = q.correct_answer === opt;
                                      const optionKey = `option_${opt.toLowerCase()}` as keyof Question;
                                      return (
                                        <div
                                          key={opt}
                                          className={`p-2 rounded ${
                                            isCorrect 
                                              ? 'bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30' 
                                              : 'bg-background border border-border'
                                          }`}
                                        >
                                          <span className="font-medium">{opt}.</span> {q[optionKey] as string}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {q.explanation && (
                                    <div className="mt-2 p-2 bg-primary/10 rounded text-xs flex items-start gap-2">
                                      <Lightbulb className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                                      <span>{q.explanation}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {group.questions.length > 3 && (
                                <p className="text-xs text-muted-foreground text-center">
                                  +{group.questions.length - 3} more questions available in practice mode
                                </p>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default HighYieldQuestions;
