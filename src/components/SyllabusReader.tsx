import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Clock, Check, ChevronRight, ArrowLeft, BookMarked,
  Target, Play, Pause, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StudyContentRenderer } from '@/components/StudyContentRenderer';
import { errorLogger } from '@/services/errorLogger';
import { getSyllabus } from '@/services/offlineStorage';
import { JAMB_OFFLINE_SYLLABUS } from '@/data/jambSyllabusData';

interface SyllabusItem {
  id: string;
  subject: string;
  topic: string;
  subtopic: string | null;
  objectives: string[] | null;
  recommended_content: string | null;
  difficulty_level: string | null;
  estimated_reading_time: number | null;
  order_index: number | null;
  image_url?: string | null;
  reference_materials?: unknown;
}

interface ReadingProgress {
  syllabus_id: string;
  progress_percent: number;
  times_reviewed: number;
  mastery_level: string;
  last_read_at: string | null;
}

interface SyllabusReaderProps {
  userEmail: string;
  subjects: string[];
  onBack: () => void;
  initialSubject?: string | null;
  initialTopic?: string | null;
}

// The syllabus is the official JAMB syllabus, read-only. Explanations and
// interactive teaching live in Lessons — no AI generation happens here.

const MASTERY_COLORS: Record<string, string> = {
  not_started: 'bg-muted text-muted-foreground',
  learning: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  reviewing: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  mastered: 'bg-green-500/20 text-green-700 dark:text-green-400',
};

const MASTERY_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  learning: 'Learning',
  reviewing: 'Reviewing',
  mastered: 'Mastered',
};

export const SyllabusReader = ({ userEmail, subjects, onBack, initialSubject, initialTopic }: SyllabusReaderProps) => {
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({});
  const [selectedSubject, setSelectedSubject] = useState<string | null>(initialSubject ?? null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<SyllabusItem | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Deep-link to a specific topic when initialTopic is provided
  useEffect(() => {
    if (initialTopic && syllabus.length > 0 && !selectedTopic) {
      const match = syllabus.find(
        t => t.topic.toLowerCase() === initialTopic.toLowerCase() ||
             t.id === initialTopic
      );
      if (match) {
        setSelectedSubject(match.subject.toLowerCase());
        startReading(match);
      }
    }
  }, [initialTopic, syllabus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load syllabus and progress
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      let syllabusData: SyllabusItem[] | null = null;

      // Try Supabase first
      let remoteFailed = false;
      try {
        const { data, error } = await supabase
          .from('jamb_syllabus')
          .select('*')
          .in('subject', subjects.map(s => s.toLowerCase()))
          .order('order_index');

        if (error) {
          remoteFailed = true;
          errorLogger.error(error, { component: 'SyllabusReader', action: 'fetch syllabus' });
        } else if (data && data.length > 0) {
          syllabusData = data;
        }
      } catch (err) {
        remoteFailed = true;
        errorLogger.error(err, { component: 'SyllabusReader', action: 'fetch syllabus' });
      }

      // Fallback to IndexedDB if online query returned nothing
      if (!syllabusData || syllabusData.length === 0) {
        try {
          const cached = await getSyllabus(subjects.map(s => s.toLowerCase()));
          if (cached.length > 0) {
            syllabusData = cached;
          }
        } catch (err) {
          errorLogger.error(err, { component: 'SyllabusReader', action: 'read cached syllabus' });
        }
      }

      // Final fallback: embedded offline syllabus data. This is a tiny
      // placeholder set (18 topics, mostly one per subject), so reaching it
      // means the student sees almost nothing — worth surfacing loudly.
      if (!syllabusData || syllabusData.length === 0) {
        const embedded: SyllabusItem[] = [];
        for (const subject of subjects) {
          const key = subject.toLowerCase().replace(/_/g, ' ');
          const items = JAMB_OFFLINE_SYLLABUS[key] || JAMB_OFFLINE_SYLLABUS[subject.toLowerCase()] || [];
          for (const item of items) {
            embedded.push({
              id: item.id,
              subject: item.subject,
              topic: item.topic,
              subtopic: item.subtopic,
              objectives: item.objectives,
              recommended_content: item.recommended_content,
              difficulty_level: item.difficulty_level,
              estimated_reading_time: item.estimated_reading_time,
              order_index: item.order_index,
            });
          }
        }
        if (embedded.length > 0) {
          syllabusData = embedded;
          toast.error(
            remoteFailed
              ? "Couldn't reach the syllabus. Showing the offline starter topics."
              : 'No syllabus topics found for these subjects.'
          );
        }
      }

      if (syllabusData) {
        setSyllabus(syllabusData);
      }

      // Load user's reading progress
      try {
        const { data: progressData } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('email', userEmail);

        if (progressData) {
          const progressMap: Record<string, ReadingProgress> = {};
          progressData.forEach(p => {
            if (p.syllabus_id) {
              progressMap[p.syllabus_id] = p as ReadingProgress;
            }
          });
          setProgress(progressMap);
        }
      } catch {
        // Offline — progress will be unavailable
      }

      setLoading(false);
    };

    loadData();
  }, [userEmail, subjects]);

  // Reading timer
  useEffect(() => {
    if (isReading) {
      timerRef.current = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isReading]);

  const startReading = async (topic: SyllabusItem) => {
    setSelectedTopic(topic);
    setIsReading(true);
    setReadingTime(0);

    // Create reading session
    const { data } = await supabase
      .from('reading_sessions')
      .insert({
        email: userEmail,
        syllabus_id: topic.id,
        subject: topic.subject,
        topic: topic.topic,
        time_spent_seconds: 0,
      })
      .select('id')
      .single();

    if (data) {
      sessionIdRef.current = data.id;
    }
  };

  const pauseReading = () => {
    setIsReading(false);
    saveReadingProgress();
  };

  const resumeReading = () => {
    setIsReading(true);
  };

  const saveReadingProgress = async () => {
    if (!selectedTopic || !sessionIdRef.current) return;

    // Update session time
    await supabase
      .from('reading_sessions')
      .update({
        time_spent_seconds: readingTime,
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionIdRef.current);

    // Calculate progress percent based on time spent vs estimated
    const estimatedSeconds = (selectedTopic.estimated_reading_time ?? 0) * 60;
    const progressPercent = Math.min(100, Math.round((readingTime / estimatedSeconds) * 100));

    // Determine mastery level
    let masteryLevel = 'learning';
    const existingProgress = progress[selectedTopic.id];
    const timesReviewed = (existingProgress?.times_reviewed || 0) + 1;

    if (progressPercent >= 100) {
      if (timesReviewed >= 3) {
        masteryLevel = 'mastered';
      } else if (timesReviewed >= 2) {
        masteryLevel = 'reviewing';
      }
    }

    // Upsert reading progress
    await supabase
      .from('reading_progress')
      .upsert({
        email: userEmail,
        syllabus_id: selectedTopic.id,
        subject: selectedTopic.subject,
        topic: selectedTopic.topic,
        progress_percent: progressPercent,
        times_reviewed: timesReviewed,
        mastery_level: masteryLevel,
        last_read_at: new Date().toISOString(),
      }, { onConflict: 'email,syllabus_id' });

    // Update local state
    setProgress(prev => ({
      ...prev,
      [selectedTopic.id]: {
        syllabus_id: selectedTopic.id,
        progress_percent: progressPercent,
        times_reviewed: timesReviewed,
        mastery_level: masteryLevel,
        last_read_at: new Date().toISOString(),
      },
    }));
  };

  const completeReading = async () => {
    setIsReading(false);
    await saveReadingProgress();
    toast.success('Great job! Topic completed! 🎉');
    setSelectedTopic(null);
    sessionIdRef.current = null;
    setReadingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Group syllabus by subject
  const syllabusbySubject = syllabus.reduce((acc, item) => {
    if (!acc[item.subject]) acc[item.subject] = [];
    acc[item.subject].push(item);
    return acc;
  }, {} as Record<string, SyllabusItem[]>);

  // Calculate overall progress per subject
  const getSubjectProgress = (subject: string) => {
    const items = syllabusbySubject[subject] || [];
    if (items.length === 0) return 0;
    
    const totalProgress = items.reduce((sum, item) => {
      return sum + (progress[item.id]?.progress_percent || 0);
    }, 0);
    
    return Math.round(totalProgress / items.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading syllabus...</p>
        </div>
      </div>
    );
  }

  // Reading view — official JAMB syllabus content, read-only
  if (selectedTopic) {
    const topicProgress = progress[selectedTopic.id];
    const estimatedMinutes = selectedTopic.estimated_reading_time;

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                if (readingTime > 30) {
                  saveReadingProgress();
                }
                setSelectedTopic(null);
                setIsReading(false);
                setReadingTime(0);
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to topics
            </button>

            {/* Timer */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-mono font-bold">{formatTime(readingTime)}</span>
                <span className="text-xs text-muted-foreground">/ {estimatedMinutes} min</span>
              </div>

              {isReading ? (
                <Button variant="outline" size="sm" onClick={pauseReading}>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button size="sm" onClick={resumeReading}>
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </Button>
              )}
            </div>
          </div>

          {/* Topic content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6 md:p-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge variant="outline" className="mb-2 capitalize">
                  {selectedTopic.subject}
                </Badge>
                <h1 className="text-2xl font-bold text-foreground">{selectedTopic.topic}</h1>
                {selectedTopic.subtopic && (
                  <p className="text-muted-foreground mt-1">{selectedTopic.subtopic}</p>
                )}
              </div>
              {topicProgress && (
                <Badge className={MASTERY_COLORS[topicProgress.mastery_level]}>
                  {MASTERY_LABELS[topicProgress.mastery_level]}
                </Badge>
              )}
            </div>

            {/* Topic image */}
            {selectedTopic.image_url && (
              <div className="mb-6 flex justify-center">
                <img
                  src={selectedTopic.image_url}
                  alt={`${selectedTopic.topic} diagram`}
                  className="max-w-full h-auto rounded-xl border border-border"
                  style={{ maxHeight: 350 }}
                />
              </div>
            )}

            {/* Objectives */}
            {selectedTopic.objectives && selectedTopic.objectives.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  Learning Objectives
                </h3>
                <ul className="space-y-2">
                  {selectedTopic.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Content */}
            {selectedTopic.recommended_content && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Study Notes
                </h3>
                <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
                  <StudyContentRenderer content={selectedTopic.recommended_content} />
                </div>
              </div>
            )}

            {/* Reference Materials */}
            {Array.isArray(selectedTopic.reference_materials) && selectedTopic.reference_materials.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Recommended References
                </h3>
                <div className="space-y-2">
                  {(selectedTopic.reference_materials as { title: string; author?: string; url?: string }[]).map((ref, i) => (
                    <div key={i} className="bg-muted/30 rounded-lg p-3 border border-border/50">
                      <p className="font-medium text-sm text-foreground">{ref.title}</p>
                      {ref.author && <p className="text-xs text-muted-foreground mt-0.5">{ref.author}</p>}
                      {ref.url && (
                        <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                          View resource →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-border">
              <Button onClick={completeReading} className="gradient-primary">
                <Check className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Section list for selected subject
  if (selectedSubject && !selectedSection) {
    const topics = syllabusbySubject[selectedSubject] || [];

    const sections = topics.reduce((acc, topic) => {
      const section = topic.subtopic || 'General';
      if (!acc[section]) acc[section] = [];
      acc[section].push(topic);
      return acc;
    }, {} as Record<string, SyllabusItem[]>);

    const sectionKeys = Object.keys(sections);
    sectionKeys.sort((a, b) => {
      if (a === 'General') return 1;
      if (b === 'General') return -1;
      return a.localeCompare(b);
    });

    const getSectionProgress = (section: string) => {
      const sectionTopics = sections[section];
      if (!sectionTopics.length) return 0;
      const completed = sectionTopics.filter(t => progress[t.id]?.mastery_level === 'mastered').length;
      return Math.round((completed / sectionTopics.length) * 100);
    };

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedSubject(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to subjects
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground capitalize">{selectedSubject}</h1>
            <p className="text-muted-foreground">{sectionKeys.length} sections — {topics.length} topics total</p>
            <div className="mt-4">
              <Progress value={getSubjectProgress(selectedSubject)} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {getSubjectProgress(selectedSubject)}% complete
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {sectionKeys.map((section, index) => {
              const sectionTopics = sections[section];
              const completedCount = sectionTopics.filter(t => progress[t.id]?.mastery_level === 'mastered').length;
              const sectionProgress = getSectionProgress(section);
              return (
                <motion.div
                  key={section}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => setSelectedSection(section)}
                  className="bg-card rounded-2xl border border-border p-5 hover:border-primary/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <BookMarked className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {section}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {completedCount}/{sectionTopics.length} topics mastered
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{sectionProgress}%</div>
                        <div className="text-xs text-muted-foreground">progress</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <Progress value={sectionProgress} className="h-1.5 mt-3" />
                </motion.div>
              );
            })}
          </div>

          {sectionKeys.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No syllabus content available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Content is being prepared for this subject.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Topics list for selected section
  if (selectedSubject && selectedSection) {
    const topics = syllabusbySubject[selectedSubject] || [];
    const sectionTopics = topics.filter(t => (t.subtopic || 'General') === selectedSection);

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedSection(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {selectedSubject} sections
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">{selectedSection}</h1>
            <p className="text-muted-foreground capitalize">{selectedSubject} — {sectionTopics.length} topics in learning order</p>
            <div className="mt-4">
              <Progress value={getSubjectProgress(selectedSubject)} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {getSubjectProgress(selectedSubject)}% complete
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {sectionTopics.map((topic, index) => {
              const topicProgress = progress[topic.id];
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => startReading(topic)}
                  className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        topicProgress?.mastery_level === 'mastered'
                          ? 'bg-green-500/20 text-green-600'
                          : topicProgress?.mastery_level === 'reviewing'
                          ? 'bg-blue-500/20 text-blue-600'
                          : topicProgress?.mastery_level === 'learning'
                          ? 'bg-yellow-500/20 text-yellow-600'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {topic.topic}
                          </h3>
                          {topicProgress && (
                            <Badge className={`text-xs ${MASTERY_COLORS[topicProgress.mastery_level]}`}>
                              {MASTERY_LABELS[topicProgress.mastery_level]}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {topic.estimated_reading_time} min
                          </span>
                          {topicProgress && (
                            <span className="flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" />
                              Reviewed {topicProgress.times_reviewed}x
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {topicProgress && (
                    <Progress value={topicProgress.progress_percent} className="h-1 mt-3" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {sectionTopics.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No topics in this section yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Subject selection view
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-foreground">JAMB Syllabus</h1>
          <p className="text-muted-foreground">Study by topic with reading tracking</p>
        </div>

        <div className="grid gap-4">
          {subjects.map((subject, index) => {
            const subjectKey = subject.toLowerCase();
            const topics = syllabusbySubject[subjectKey] || [];
            const subjectProgress = getSubjectProgress(subjectKey);
            const completedCount = topics.filter(t => 
              progress[t.id]?.mastery_level === 'mastered'
            ).length;

            return (
              <motion.div
                key={subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedSubject(subjectKey)}
                className="bg-card rounded-2xl border border-border p-6 hover:border-primary/50 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground capitalize group-hover:text-primary transition-colors">
                        {subject}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {topics.length > 0 
                          ? `${completedCount}/${topics.length} topics mastered`
                          : 'No content yet'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{subjectProgress}%</div>
                      <div className="text-xs text-muted-foreground">progress</div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <Progress value={subjectProgress} className="h-2 mt-4" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
