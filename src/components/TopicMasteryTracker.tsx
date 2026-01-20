import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, AlertTriangle, CheckCircle2, TrendingUp, ChevronDown, ChevronUp, BookOpen, Flame, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TopicMasteryTrackerProps {
  userEmail: string;
  refreshTrigger?: number;
}

interface QuestionData {
  id: string;
  question: string;
  subject: string;
  correct_answer: string;
  userAnswer: string;
  topics?: string[];
}

interface TopicStats {
  topic: string;
  subject: string;
  correct: number;
  total: number;
  percentage: number;
  masteryLevel: 'weak' | 'learning' | 'proficient' | 'mastered';
  lastAttempted: Date;
}

interface SubjectTopics {
  subject: string;
  topics: TopicStats[];
  overallMastery: number;
}

// Topic patterns for identifying topics from questions (simplified version)
const TOPIC_KEYWORDS: Record<string, Record<string, string[]>> = {
  english: {
    'Vocabulary': ['synonym', 'antonym', 'meaning', 'nearest', 'opposite', 'word'],
    'Grammar': ['tense', 'verb', 'noun', 'adjective', 'adverb', 'pronoun', 'preposition'],
    'Comprehension': ['passage', 'author', 'context', 'infer', 'implies'],
    'Oral English': ['stress', 'pronunciation', 'syllable', 'vowel', 'consonant'],
    'Sentence Structure': ['sentence', 'clause', 'phrase', 'subject', 'predicate'],
  },
  mathematics: {
    'Algebra': ['equation', 'solve', 'variable', 'expression', 'polynomial', 'quadratic'],
    'Geometry': ['triangle', 'circle', 'angle', 'area', 'perimeter', 'volume'],
    'Trigonometry': ['sin', 'cos', 'tan', 'sine', 'cosine', 'tangent'],
    'Statistics': ['mean', 'median', 'mode', 'probability', 'standard deviation'],
    'Calculus': ['differentiate', 'integrate', 'derivative', 'limit'],
    'Number Theory': ['prime', 'factor', 'multiple', 'divisible', 'integer'],
  },
  physics: {
    'Mechanics': ['force', 'motion', 'velocity', 'acceleration', 'momentum', 'mass'],
    'Waves & Optics': ['wave', 'light', 'lens', 'mirror', 'reflection', 'refraction'],
    'Electricity': ['current', 'voltage', 'resistance', 'circuit', 'capacitor'],
    'Heat & Thermodynamics': ['heat', 'temperature', 'thermal', 'entropy', 'gas law'],
    'Modern Physics': ['quantum', 'atom', 'nuclear', 'radioactive', 'electron'],
  },
  chemistry: {
    'Organic Chemistry': ['alkane', 'alkene', 'benzene', 'carbon', 'hydrocarbon', 'organic'],
    'Inorganic Chemistry': ['metal', 'non-metal', 'periodic table', 'element', 'compound'],
    'Physical Chemistry': ['equilibrium', 'rate', 'kinetics', 'thermochemistry'],
    'Electrochemistry': ['electrolysis', 'electrode', 'redox', 'oxidation', 'reduction'],
    'Atomic Structure': ['atom', 'electron', 'proton', 'neutron', 'orbital'],
  },
  biology: {
    'Cell Biology': ['cell', 'membrane', 'organelle', 'mitosis', 'meiosis'],
    'Genetics': ['gene', 'chromosome', 'DNA', 'heredity', 'mutation', 'allele'],
    'Ecology': ['ecosystem', 'habitat', 'food chain', 'biodiversity', 'environment'],
    'Human Physiology': ['blood', 'heart', 'kidney', 'liver', 'respiration', 'digestion'],
    'Plant Biology': ['photosynthesis', 'plant', 'leaf', 'root', 'stem', 'flower'],
  },
  literature: {
    'Poetry': ['poem', 'stanza', 'rhyme', 'verse', 'meter', 'sonnet'],
    'Prose & Fiction': ['novel', 'story', 'character', 'plot', 'setting', 'theme'],
    'Drama': ['play', 'act', 'scene', 'dialogue', 'tragedy', 'comedy'],
    'Literary Devices': ['metaphor', 'simile', 'irony', 'symbolism', 'personification'],
  },
  government: {
    'Political Systems': ['democracy', 'government', 'constitution', 'parliament'],
    'Public Administration': ['civil service', 'bureaucracy', 'local government'],
    'International Relations': ['foreign policy', 'diplomacy', 'international'],
    'Political Parties': ['party', 'election', 'voting', 'campaign'],
  },
  economics: {
    'Microeconomics': ['demand', 'supply', 'price', 'market', 'consumer'],
    'Macroeconomics': ['GDP', 'inflation', 'unemployment', 'fiscal', 'monetary'],
    'International Trade': ['export', 'import', 'trade', 'tariff', 'exchange rate'],
    'Development Economics': ['development', 'poverty', 'growth', 'industrialization'],
  },
  geography: {
    'Physical Geography': ['climate', 'weather', 'landform', 'erosion', 'river'],
    'Human Geography': ['population', 'urbanization', 'migration', 'settlement'],
    'Map Reading': ['map', 'scale', 'contour', 'bearing', 'coordinate'],
    'Nigerian Geography': ['Nigeria', 'Lagos', 'Niger', 'vegetation'],
  },
  accounting: {
    'Financial Accounting': ['balance sheet', 'income statement', 'ledger', 'journal'],
    'Cost Accounting': ['cost', 'budget', 'variance', 'overhead'],
    'Auditing': ['audit', 'internal control', 'verification'],
  },
  commerce: {
    'Business Organization': ['partnership', 'company', 'sole trader', 'corporation'],
    'Trade': ['wholesale', 'retail', 'commerce', 'distribution'],
    'Banking': ['bank', 'loan', 'credit', 'interest', 'deposit'],
  },
  crs: {
    'Old Testament': ['Moses', 'Abraham', 'David', 'prophet', 'covenant'],
    'New Testament': ['Jesus', 'apostle', 'gospel', 'resurrection', 'salvation'],
    'Christian Ethics': ['ethics', 'moral', 'sin', 'righteousness'],
  },
  irs: {
    'Quran Studies': ['Quran', 'surah', 'ayat', 'revelation'],
    'Hadith': ['hadith', 'sunnah', 'prophet Muhammad'],
    'Islamic History': ['caliphate', 'hijrah', 'jihad'],
  },
  agricultural_science: {
    'Crop Production': ['crop', 'seed', 'fertilizer', 'harvest', 'cultivation'],
    'Animal Husbandry': ['livestock', 'poultry', 'cattle', 'breeding'],
    'Soil Science': ['soil', 'nutrient', 'erosion', 'irrigation'],
    'Farm Management': ['farm', 'profit', 'mechanization', 'marketing'],
  },
};

const identifyTopic = (question: QuestionData): string => {
  const subject = question.subject.toLowerCase();
  const questionText = question.question.toLowerCase();
  
  // First check if question has topics array from database
  if (question.topics && question.topics.length > 0) {
    return question.topics[0];
  }
  
  // Otherwise use keyword matching
  const subjectTopics = TOPIC_KEYWORDS[subject];
  if (!subjectTopics) return 'General';
  
  for (const [topic, keywords] of Object.entries(subjectTopics)) {
    if (keywords.some(keyword => questionText.includes(keyword.toLowerCase()))) {
      return topic;
    }
  }
  
  return 'General';
};

const getMasteryLevel = (percentage: number): TopicStats['masteryLevel'] => {
  if (percentage >= 80) return 'mastered';
  if (percentage >= 60) return 'proficient';
  if (percentage >= 40) return 'learning';
  return 'weak';
};

const getMasteryColor = (level: TopicStats['masteryLevel']) => {
  switch (level) {
    case 'mastered': return 'text-green-500 bg-green-500/10 border-green-500/30';
    case 'proficient': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    case 'learning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    case 'weak': return 'text-red-500 bg-red-500/10 border-red-500/30';
  }
};

const getMasteryIcon = (level: TopicStats['masteryLevel']) => {
  switch (level) {
    case 'mastered': return <Flame className="w-4 h-4" />;
    case 'proficient': return <CheckCircle2 className="w-4 h-4" />;
    case 'learning': return <TrendingUp className="w-4 h-4" />;
    case 'weak': return <AlertTriangle className="w-4 h-4" />;
  }
};

export const TopicMasteryTracker = ({ userEmail, refreshTrigger }: TopicMasteryTrackerProps) => {
  const [loading, setLoading] = useState(true);
  const [subjectTopics, setSubjectTopics] = useState<SubjectTopics[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [showWeakOnly, setShowWeakOnly] = useState(false);

  const fetchTopicData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('questions_data, created_at')
        .eq('email', userEmail)
        .not('questions_data', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Process all questions
      const topicMap = new Map<string, TopicStats>();
      
      data?.forEach(attempt => {
        const questions = attempt.questions_data as unknown as QuestionData[] | null;
        if (!questions || !Array.isArray(questions)) return;
        
        questions.forEach(q => {
          const topic = identifyTopic(q);
          const subject = q.subject.toLowerCase();
          const key = `${subject}:${topic}`;
          const isCorrect = q.userAnswer === q.correct_answer;
          
          if (!topicMap.has(key)) {
            topicMap.set(key, {
              topic,
              subject,
              correct: 0,
              total: 0,
              percentage: 0,
              masteryLevel: 'weak',
              lastAttempted: new Date(attempt.created_at),
            });
          }
          
          const stats = topicMap.get(key)!;
          stats.total++;
          if (isCorrect) stats.correct++;
          stats.percentage = Math.round((stats.correct / stats.total) * 100);
          stats.masteryLevel = getMasteryLevel(stats.percentage);
        });
      });

      // Group by subject
      const subjectMap = new Map<string, TopicStats[]>();
      topicMap.forEach(stats => {
        if (!subjectMap.has(stats.subject)) {
          subjectMap.set(stats.subject, []);
        }
        subjectMap.get(stats.subject)!.push(stats);
      });

      // Calculate overall mastery per subject
      const result: SubjectTopics[] = [];
      subjectMap.forEach((topics, subject) => {
        const totalCorrect = topics.reduce((sum, t) => sum + t.correct, 0);
        const totalQuestions = topics.reduce((sum, t) => sum + t.total, 0);
        const overallMastery = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        
        // Sort topics by mastery (weak first)
        topics.sort((a, b) => a.percentage - b.percentage);
        
        result.push({
          subject,
          topics,
          overallMastery,
        });
      });

      // Sort subjects by overall mastery (weak first)
      result.sort((a, b) => a.overallMastery - b.overallMastery);
      
      setSubjectTopics(result);
    } catch (error) {
      console.error('Error fetching topic data:', error);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchTopicData();
  }, [fetchTopicData, refreshTrigger]);

  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }
      return next;
    });
  };

  const formatSubjectName = (name: string) => {
    const upperCaseSubjects = ['crs', 'irs'];
    if (upperCaseSubjects.includes(name.toLowerCase())) {
      return name.toUpperCase();
    }
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };

  // Calculate stats
  const { totalTopics, weakTopics, masteredTopics } = useMemo(() => {
    let total = 0, weak = 0, mastered = 0;
    subjectTopics.forEach(s => {
      s.topics.forEach(t => {
        total++;
        if (t.masteryLevel === 'weak') weak++;
        if (t.masteryLevel === 'mastered') mastered++;
      });
    });
    return { totalTopics: total, weakTopics: weak, masteredTopics: mastered };
  }, [subjectTopics]);

  const filteredSubjects = useMemo(() => {
    if (!showWeakOnly) return subjectTopics;
    return subjectTopics
      .map(s => ({
        ...s,
        topics: s.topics.filter(t => t.masteryLevel === 'weak' || t.masteryLevel === 'learning'),
      }))
      .filter(s => s.topics.length > 0);
  }, [subjectTopics, showWeakOnly]);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-16 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (subjectTopics.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 border border-border text-center"
      >
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-2">No Topic Data Yet</h3>
        <p className="text-sm text-muted-foreground">
          Complete some quizzes to see your topic mastery breakdown
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 border border-border"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 rounded-full p-2">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Topic Mastery Tracker</h3>
            <p className="text-xs text-muted-foreground">
              {totalTopics} topics tracked • {weakTopics} need work • {masteredTopics} mastered
            </p>
          </div>
        </div>
        <Button
          variant={showWeakOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowWeakOnly(!showWeakOnly)}
          className="text-xs"
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          {showWeakOnly ? 'Show All' : 'Weak Areas'}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-red-500/10 rounded-lg p-3 text-center border border-red-500/20">
          <p className="text-2xl font-bold text-red-500">{weakTopics}</p>
          <p className="text-xs text-red-500/80">Weak</p>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-3 text-center border border-yellow-500/20">
          <p className="text-2xl font-bold text-yellow-500">
            {subjectTopics.reduce((sum, s) => sum + s.topics.filter(t => t.masteryLevel === 'learning').length, 0)}
          </p>
          <p className="text-xs text-yellow-500/80">Learning</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-3 text-center border border-green-500/20">
          <p className="text-2xl font-bold text-green-500">{masteredTopics}</p>
          <p className="text-xs text-green-500/80">Mastered</p>
        </div>
      </div>

      {/* Subject Accordions */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredSubjects.map(subjectData => (
            <motion.div
              key={subjectData.subject}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleSubject(subjectData.subject)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">
                    {formatSubjectName(subjectData.subject)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {subjectData.topics.length} topics
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={subjectData.overallMastery} 
                      className="w-20 h-2"
                    />
                    <span className="text-sm font-medium text-muted-foreground w-10">
                      {subjectData.overallMastery}%
                    </span>
                  </div>
                  {expandedSubjects.has(subjectData.subject) ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {expandedSubjects.has(subjectData.subject) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 space-y-3 bg-muted/30">
                      {subjectData.topics.map(topic => (
                        <div
                          key={`${subjectData.subject}-${topic.topic}`}
                          className={`flex items-center justify-between p-3 rounded-lg border ${getMasteryColor(topic.masteryLevel)}`}
                        >
                          <div className="flex items-center gap-3">
                            {getMasteryIcon(topic.masteryLevel)}
                            <div>
                              <p className="font-medium text-sm">{topic.topic}</p>
                              <p className="text-xs opacity-80">
                                {topic.correct}/{topic.total} correct
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={topic.percentage} 
                              className="w-16 h-2"
                            />
                            <span className="text-sm font-bold w-10 text-right">
                              {topic.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Weak Areas Call to Action */}
      {weakTopics > 0 && !showWeakOnly && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/30"
        >
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-medium text-orange-500 text-sm">
                Focus Tip: {weakTopics} weak {weakTopics === 1 ? 'topic' : 'topics'} detected
              </p>
              <p className="text-xs text-orange-500/80 mt-1">
                Improving weak topics can boost your JAMB score by 30+ marks. 
                Click "Weak Areas" to see what needs attention.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
