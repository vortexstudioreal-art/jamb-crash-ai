import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Flame,
  Zap,
  Search,
  Sparkles,
  Play,
  Filter,
  X,
  ArrowRight,
  ShieldAlert,
  Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { errorLogger } from '@/services/errorLogger';
import {
  computeMastery,
  type MasteryTrend,
  type MasterySample,
} from '@/lib/mastery';

interface TopicMasteryTrackerProps {
  userEmail: string;
  refreshTrigger?: number;
  allowedSubjects?: string[];
  onStartPracticeTopic?: (subject: string, topic?: string) => void;
  onGoToSyllabusTopic?: (subject: string, topic: string) => void;
}

interface QuestionData {
  id: string;
  question: string;
  subject: string;
  correct_answer: string;
  userAnswer: string;
  topics?: string[];
}

export interface TopicStats {
  topic: string;
  subject: string;
  correct: number;
  total: number;
  percentage: number;
  masteryLevel: 'weak' | 'learning' | 'proficient' | 'mastered';
  lastAttempted: Date;
  isHighWeight?: boolean;
  aiTip?: string;
  samples: number;
  lowData: boolean;
  trend: MasteryTrend;
}

interface SubjectTopics {
  subject: string;
  topics: TopicStats[];
  overallMastery: number;
}

const getAiRecommendation = (topic: string, level: TopicStats['masteryLevel']): string => {
  if (level === 'weak') {
    return `Critical area! Review fundamentals & attempt 15 targeted practice questions for ${topic}.`;
  }
  if (level === 'learning') {
    return `On the right track. Solve 10 speed questions to lock in formulas & key concepts for ${topic}.`;
  }
  if (level === 'proficient') {
    return `Solid understanding. Take a past paper quiz to push your score past 80%.`;
  }
  return `Mastered! Keep it fresh with a quick flashcard review before exam day.`;
};

export const TopicMasteryTracker = ({ 
  userEmail, 
  refreshTrigger, 
  allowedSubjects,
  onStartPracticeTopic,
  onGoToSyllabusTopic
}: TopicMasteryTrackerProps) => {
  const [loading, setLoading] = useState(true);
  const [subjectTopics, setSubjectTopics] = useState<SubjectTopics[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [selectedSubjectTab, setSelectedSubjectTab] = useState<string>('all');
  const [masteryFilter, setMasteryFilter] = useState<'all' | 'weak' | 'learning' | 'mastered' | 'high_weight'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

      const samples: MasterySample[] = [];
      data?.forEach(attempt => {
        const questions = attempt.questions_data as unknown as QuestionData[] | null;
        if (!questions || !Array.isArray(questions)) return;
        questions.forEach(q => {
          samples.push({
            subject: q.subject || '',
            text: q.question || '',
            storedTopics: q.topics,
            correct: q.userAnswer === q.correct_answer,
            at: attempt.created_at || new Date().toISOString(),
          });
        });
      });

      const computed = computeMastery(samples, allowedSubjects);
      const result: SubjectTopics[] = computed.map(s => ({
        subject: s.subject,
        overallMastery: s.overall,
        topics: s.topics.map(t => ({
          topic: t.topic,
          subject: t.subject,
          correct: t.rawCorrect,
          total: t.rawTotal,
          percentage: t.percentage,
          masteryLevel: t.level as TopicStats['masteryLevel'],
          lastAttempted: new Date(t.lastAttempted),
          isHighWeight: t.isHighWeight,
          aiTip: t.lowData
            ? `Early days — answer ${Math.max(1, 3 - t.samples)}+ more ${t.topic} questions to confirm your level.`
            : getAiRecommendation(t.topic, t.level),
          samples: t.samples,
          lowData: t.lowData,
          trend: t.trend,
        })),
      }));

      setSubjectTopics(result);
      
      // Auto-expand subjects on initial load
      if (result.length > 0) {
        setExpandedSubjects(new Set(result.map(r => r.subject)));
      }
    } catch (error) {
      errorLogger.error(error, { component: 'TopicMasteryTracker', action: 'fetch topic data' });
    } finally {
      setLoading(false);
    }
  }, [userEmail, allowedSubjects]);

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

  // Aggregated Stats
  const { totalTopics, weakTopics, learningTopics, masteredTopics, overallReadinessPercent, topWeakTopics } = useMemo(() => {
    let total = 0, weak = 0, learning = 0, mastered = 0, totalCorrect = 0, totalQuestions = 0;
    const allTopicsList: TopicStats[] = [];

    subjectTopics.forEach(s => {
      s.topics.forEach(t => {
        total++;
        totalCorrect += t.correct;
        totalQuestions += t.total;
        allTopicsList.push(t);

        if (t.masteryLevel === 'weak') weak++;
        else if (t.masteryLevel === 'learning' || t.masteryLevel === 'proficient') learning++;
        else if (t.masteryLevel === 'mastered') mastered++;
      });
    });

    const readiness = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    // Sort weak topics by total questions attempted & lowest score
    const topWeak = [...allTopicsList]
      .filter(t => t.masteryLevel === 'weak' || t.masteryLevel === 'learning')
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3);

    return { 
      totalTopics: total, 
      weakTopics: weak, 
      learningTopics: learning,
      masteredTopics: mastered,
      overallReadinessPercent: readiness,
      topWeakTopics: topWeak,
    };
  }, [subjectTopics]);

  // Filtered Subject Topics list based on tabs, search and filter chips
  const filteredSubjects = useMemo(() => {
    let list = subjectTopics;
    
    // Filter by subject tab
    if (selectedSubjectTab !== 'all') {
      list = list.filter(s => s.subject === selectedSubjectTab);
    }

    return list.map(s => {
      let topics = s.topics;

      // Filter by mastery level chip
      if (masteryFilter === 'weak') {
        topics = topics.filter(t => t.masteryLevel === 'weak');
      } else if (masteryFilter === 'learning') {
        topics = topics.filter(t => t.masteryLevel === 'learning' || t.masteryLevel === 'proficient');
      } else if (masteryFilter === 'mastered') {
        topics = topics.filter(t => t.masteryLevel === 'mastered');
      } else if (masteryFilter === 'high_weight') {
        topics = topics.filter(t => t.isHighWeight);
      }

      // Filter by Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        topics = topics.filter(t => 
          t.topic.toLowerCase().includes(query) || 
          t.subject.toLowerCase().includes(query)
        );
      }

      return {
        ...s,
        topics,
      };
    }).filter(s => s.topics.length > 0);
  }, [subjectTopics, selectedSubjectTab, masteryFilter, searchQuery]);

  if (loading) {
    return (
      <div className="bg-card rounded-3xl p-6 border border-border/60 shadow-xl space-y-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 bg-muted rounded-2xl"></div>
          <div className="h-20 bg-muted rounded-2xl"></div>
          <div className="h-20 bg-muted rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (subjectTopics.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-3xl p-8 border border-border/60 text-center shadow-xl relative overflow-hidden"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Topic Mastery Data Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Complete practice quizzes or full mock exams to unlock your topic-by-topic mastery breakdown and high-yield study insights!
        </p>
        {onStartPracticeTopic && (
          <Button 
            onClick={() => onStartPracticeTopic('all')}
            className="gradient-primary text-primary-foreground font-bold shadow-lg hover:shadow-primary/25"
          >
            <Play className="w-4 h-4 mr-2" />
            Take First Practice Quiz
          </Button>
        )}
      </motion.div>
    );
  }

  // Calculate SVG stroke parameters for circular gauge
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallReadinessPercent / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-3xl p-5 md:p-7 border border-border/80 shadow-2xl space-y-6 relative overflow-hidden"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER & READINESS RING GAUGE */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/20 border border-primary/20">
        <div className="flex items-center gap-5 w-full md:w-auto">
          {/* Circular SVG Gauge */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 84 84">
              {/* Background circle */}
              <circle
                cx="42"
                cy="42"
                r={radius}
                className="stroke-muted/40"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Progress stroke */}
              <circle
                cx="42"
                cy="42"
                r={radius}
                className="stroke-primary transition-all duration-1000 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-foreground leading-none">
                {overallReadinessPercent}%
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-0.5">
                Ready
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-black text-foreground tracking-tight">
                JAMB Topic Mastery
              </h3>
              <Badge variant="outline" className="border-primary/40 text-primary font-bold bg-primary/10 text-xs px-2.5 py-0.5">
                <Award className="w-3 h-3 mr-1" />
                {overallReadinessPercent >= 75 ? '300+ Score Target' : overallReadinessPercent >= 55 ? '250+ On Track' : 'Building Base'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tracking <span className="font-bold text-foreground">{totalTopics}</span> core topics across your subjects
            </p>
          </div>
        </div>

        {/* Action button header */}
        {topWeakTopics.length > 0 && onStartPracticeTopic && (
          <Button
            size="sm"
            onClick={() => onStartPracticeTopic(topWeakTopics[0].subject, topWeakTopics[0].topic)}
            className="w-full md:w-auto gradient-primary text-primary-foreground font-extrabold shadow-md hover:shadow-primary/30"
          >
            <Zap className="w-4 h-4 mr-2" />
            Fix Weakest Topic ({topWeakTopics[0].topic})
          </Button>
        )}
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20 text-center relative overflow-hidden">
          <div className="flex items-center justify-between text-red-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Weak</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-red-500">{weakTopics}</p>
          <p className="text-[11px] text-red-500/80 font-medium">Needs Attention (&lt;40%)</p>
        </div>

        <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20 text-center relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-amber-500">{learningTopics}</p>
          <p className="text-[11px] text-amber-500/80 font-medium font-medium">Building Skill (40-79%)</p>
        </div>

        <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 text-center relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Mastered</span>
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-emerald-500">{masteredTopics}</p>
          <p className="text-[11px] text-emerald-500/80 font-medium">Exam Ready (80%+)</p>
        </div>

        <div className="bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20 text-center relative overflow-hidden">
          <div className="flex items-center justify-between text-purple-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">High UTME Weight</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-purple-500">
            {subjectTopics.reduce((sum, s) => sum + s.topics.filter(t => t.isHighWeight).length, 0)}
          </p>
          <p className="text-[11px] text-purple-500/80 font-medium">Frequent Exam Qs</p>
        </div>
      </div>

      {/* TOP WEAK TOPICS REMEDIAL BOOSTER BANNER */}
      {topWeakTopics.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-red-500/15 via-amber-500/10 to-transparent border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground flex items-center gap-2">
                Recommended Remedial Focus
                <Badge variant="secondary" className="bg-red-500/20 text-red-500 text-[10px] uppercase font-bold border-none">
                  High Priority
                </Badge>
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {topWeakTopics.map((t) => (
                  <span 
                    key={`${t.subject}-${t.topic}`}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-background/80 border border-border font-semibold text-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="capitalize text-muted-foreground">{formatSubjectName(t.subject)}:</span>
                    <span className="text-foreground">{t.topic}</span>
                    <span className="text-[10px] text-red-500 font-bold ml-1">({t.percentage}%)</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {onStartPracticeTopic && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStartPracticeTopic(topWeakTopics[0].subject, topWeakTopics[0].topic)}
              className="w-full md:w-auto border-red-500/40 text-red-500 hover:bg-red-500/10 font-bold shrink-0 text-xs"
            >
              Start 10-Q Target Remedial <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </motion.div>
      )}

      {/* SUBJECT PILL TABS & FILTER BAR */}
      <div className="space-y-3 pt-2">
        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSubjectTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedSubjectTab === 'all'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            All Subjects ({subjectTopics.length})
          </button>
          {subjectTopics.map((s) => (
            <button
              key={s.subject}
              onClick={() => setSelectedSubjectTab(s.subject)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                selectedSubjectTab === s.subject
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{formatSubjectName(s.subject)}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                selectedSubjectTab === s.subject
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-background/80 text-foreground'
              }`}>
                {s.overallMastery}%
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics by keyword (e.g. Algebra, Organic, Mechanics)..."
              className="pl-9 pr-8 text-xs h-9 bg-muted/40 rounded-xl border-border/80 focus:ring-primary"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setMasteryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                masteryFilter === 'all'
                  ? 'bg-foreground text-background font-black'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setMasteryFilter('weak')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                masteryFilter === 'weak'
                  ? 'bg-red-500 text-white font-black'
                  : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Weak
            </button>
            <button
              onClick={() => setMasteryFilter('learning')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                masteryFilter === 'learning'
                  ? 'bg-amber-500 text-white font-black'
                  : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              In Progress
            </button>
            <button
              onClick={() => setMasteryFilter('mastered')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                masteryFilter === 'mastered'
                  ? 'bg-emerald-500 text-white font-black'
                  : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
              }`}
            >
              <Flame className="w-3 h-3" />
              Mastered
            </button>
            <button
              onClick={() => setMasteryFilter('high_weight')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                masteryFilter === 'high_weight'
                  ? 'bg-purple-500 text-white font-black'
                  : 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              🔥 UTME High Weight
            </button>
          </div>
        </div>
      </div>

      {/* SUBJECT ACCORDIONS & TOPIC LIST */}
      <div className="space-y-4 pt-1">
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed border-border">
            <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-foreground">No matching topics found</p>
            <p className="text-xs text-muted-foreground mt-1">Try clearing your search query or filter chips</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setMasteryFilter('all');
                setSelectedSubjectTab('all');
              }}
              className="mt-3 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredSubjects.map(subjectData => (
              <motion.div
                key={subjectData.subject}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="border border-border/80 rounded-2xl overflow-hidden bg-card/60 shadow-sm"
              >
                {/* Subject Accordion Header */}
                <button
                  onClick={() => toggleSubject(subjectData.subject)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase">
                      {subjectData.subject.substring(0, 2)}
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-foreground text-sm md:text-base">
                        {formatSubjectName(subjectData.subject)}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {subjectData.topics.length} topics tracked
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 md:w-28 h-2.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${
                            subjectData.overallMastery >= 80 ? 'bg-emerald-500' :
                            subjectData.overallMastery >= 60 ? 'bg-primary' :
                            subjectData.overallMastery >= 40 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${subjectData.overallMastery}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-foreground w-10 text-right">
                        {subjectData.overallMastery}%
                      </span>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground">
                      {expandedSubjects.has(subjectData.subject) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Topic Rows */}
                <AnimatePresence>
                  {expandedSubjects.has(subjectData.subject) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-border/60 bg-muted/20"
                    >
                      <div className="p-3 md:p-4 space-y-3">
                        {subjectData.topics.map(topic => {
                          const isWeak = topic.masteryLevel === 'weak';
                          const isLearning = topic.masteryLevel === 'learning' || topic.masteryLevel === 'proficient';
                          const isMastered = topic.masteryLevel === 'mastered';

                          return (
                            <div
                              key={`${subjectData.subject}-${topic.topic}`}
                              className={`p-3.5 rounded-xl border transition-all ${
                                isWeak ? 'bg-red-500/5 border-red-500/25 hover:border-red-500/40' :
                                isLearning ? 'bg-amber-500/5 border-amber-500/25 hover:border-amber-500/40' :
                                'bg-emerald-500/5 border-emerald-500/25 hover:border-emerald-500/40'
                              }`}
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                {/* Topic Info */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {isWeak && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                                    {isLearning && <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />}
                                    {isMastered && <Flame className="w-4 h-4 text-emerald-500 shrink-0" />}
                                    
                                    <h5 className="font-bold text-sm text-foreground">
                                      {topic.topic}
                                    </h5>

                                    {topic.isHighWeight && (
                                      <Badge variant="secondary" className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] font-extrabold px-2 py-0">
                                        🔥 UTME High Weight
                                      </Badge>
                                    )}

                                    <Badge 
                                      variant="outline" 
                                      className={`text-[10px] font-bold capitalize border-none ${
                                        isWeak ? 'bg-red-500/20 text-red-500' :
                                        isLearning ? 'bg-amber-500/20 text-amber-500' :
                                        'bg-emerald-500/20 text-emerald-500'
                                      }`}
                                    >
                                      {topic.masteryLevel}
                                    </Badge>
                                  </div>

                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-semibold text-foreground">{topic.correct}</span> of <span className="font-semibold text-foreground">{topic.total}</span> questions answered correctly
                                  </p>
                                </div>

                                {/* Progress & Action Button */}
                                <div className="flex items-center gap-3 justify-between md:justify-end">
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 md:w-32 h-2.5 bg-muted/80 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          isMastered ? 'bg-emerald-500' :
                                          isLearning ? 'bg-amber-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${topic.percentage}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-black text-foreground w-10 text-right">
                                      {topic.percentage}%
                                    </span>
                                  </div>

                                  {onStartPracticeTopic && (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => onStartPracticeTopic(subjectData.subject, topic.topic)}
                                      className="h-8 px-3 text-xs font-extrabold shrink-0 bg-background hover:bg-primary hover:text-primary-foreground border border-border shadow-xs transition-colors"
                                    >
                                      Practice 🎯
                                    </Button>
                                  )}
                                  {onGoToSyllabusTopic && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => onGoToSyllabusTopic(subjectData.subject, topic.topic)}
                                      className="h-8 px-3 text-xs font-extrabold shrink-0 text-primary hover:bg-primary/10 transition-colors"
                                    >
                                      Study 📖
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* AI Contextual Recommendation */}
                              {topic.aiTip && (
                                <div className="mt-2.5 pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span>{topic.aiTip}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};
