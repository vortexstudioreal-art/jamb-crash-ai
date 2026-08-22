import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Clock, Check, ChevronRight, ArrowLeft, BookMarked,
  Target, Brain, Play, Pause, RotateCcw, Sparkles, HelpCircle, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFeatureUsage } from '@/hooks/useFeatureUsage';
import { FeatureLimitReached } from '@/components/FeatureLimitReached';
import { StudyContentRenderer } from '@/components/StudyContentRenderer';
import { InteractiveLesson } from '@/components/InteractiveLesson';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import type { Lesson } from '@/types/lesson';
import { errorLogger } from '@/services/errorLogger';

interface SyllabusItem {
  id: string;
  subject: string;
  topic: string;
  subtopic: string | null;
  objectives: string[] | null;
  recommended_content: string | null;
  difficulty_level: string;
  estimated_reading_time: number;
  order_index: number;
  image_url?: string | null;
  reference_materials?: { title: string; author?: string; url?: string }[] | null;
}

interface ReadingProgress {
  syllabus_id: string;
  progress_percent: number;
  times_reviewed: number;
  mastery_level: string;
  last_read_at: string | null;
}

interface TopicQuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface SyllabusReaderProps {
  userEmail: string;
  subjects: string[];
  onBack: () => void;
  initialSubject?: string | null;
  onGenerateFlashcards?: (topic: string, subject: string) => void;
  onStartTopicQuiz?: (questions: TopicQuizQuestion[], topic: string, subject: string) => void;
}

// Prompt injected into every AI content generation call so the model
// always returns structured, textbook-quality study material.
const STUDY_FORMAT_INSTRUCTIONS = `
You are an expert Nigerian JAMB UTME tutor. Write your response as a rich, structured study note following these STRICT formatting rules:

1. Use ## for main section headings (e.g. ## What Is This Topic?)
2. Use ### for sub-headings (e.g. ### Key Concepts)
3. Use * for bullet list items (one space after *)
4. Use 1. 2. 3. for numbered steps or sequences
5. Use **text** for bold/emphasis on key terms
6. Use Formula: <formula here> for any math/science formulas
7. Use Example: <full worked example here> for every major concept
8. Use Note: <important tip or exam trap> for exam tips
9. Use Did You Know: <interesting fact> for motivation/engagement
10. Write in a relatable, encouraging Nigerian-student tone (friendly but academic)
11. Include at least 1 Worked Example and 1 Formula/Note per topic
12. End with a short "## Quick Recap" bullet list of 3-5 key points
13. Do NOT write raw markdown tags as plain text — they will be rendered into rich UI
`.trim();

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

export const SyllabusReader = ({ userEmail, subjects, onBack, initialSubject, onGenerateFlashcards, onStartTopicQuiz }: SyllabusReaderProps) => {
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({});
  const [selectedSubject, setSelectedSubject] = useState<string | null>(initialSubject ?? null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<SyllabusItem | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [summarizedExplanation, setSummarizedExplanation] = useState<string | null>(null);
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);
  const [explanationMode, setExplanationMode] = useState<'normal' | 'summarized' | 'expanded'>('normal');
  const [generatingContent, setGeneratingContent] = useState<string | null>(null);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [topicQuizQuestions, setTopicQuizQuestions] = useState<TopicQuizQuestion[] | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showQuizFeedback, setShowQuizFeedback] = useState<number | null>(null);
  const [showLimitReached, setShowLimitReached] = useState(false);
  const [structuredLesson, setStructuredLesson] = useState<Lesson | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const autoGeneratedRef = useRef<Set<string>>(new Set());
  
  // Feature usage limits
  const { canUseFeature, incrementUsage, refreshUsage } = useFeatureUsage();
  
  // Lesson progress for structured lessons
  const lessonId = structuredLesson?.id || null;
  const lessonProgress = useLessonProgress(lessonId, userEmail);

  // Load syllabus and progress
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load syllabus for user's subjects
      const { data: syllabusData } = await supabase
        .from('jamb_syllabus')
        .select('*')
        .in('subject', subjects.map(s => s.toLowerCase()))
        .order('order_index');

      if (syllabusData) {
        setSyllabus(syllabusData);
      }

      // Load user's reading progress
      const { data: progressData } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('email', userEmail);

      if (progressData) {
        const progressMap: Record<string, ReadingProgress> = {};
        progressData.forEach(p => {
          progressMap[p.syllabus_id] = p as ReadingProgress;
        });
        setProgress(progressMap);
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

  // Fetch structured lesson when topic is selected
  useEffect(() => {
    if (!selectedTopic) {
      setStructuredLesson(null);
      return;
    }

    const fetchLesson = async () => {
      setLoadingLesson(true);
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('subject', selectedTopic.subject.toLowerCase())
          .eq('topic', selectedTopic.topic)
          .eq('status', 'published')
          .maybeSingle();

        if (!error && data) {
          setStructuredLesson(data as Lesson);
        } else {
          setStructuredLesson(null);
        }
      } catch {
        setStructuredLesson(null);
      } finally {
        setLoadingLesson(false);
      }
    };

    fetchLesson();
  }, [selectedTopic]);

  const startReading = async (topic: SyllabusItem) => {
    setSelectedTopic(topic);
    setIsReading(true);
    setReadingTime(0);
    setAiExplanation(null);
    setSummarizedExplanation(null);
    setExpandedExplanation(null);
    setExplanationMode('normal');

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

    // Auto-generate AI explanation if no recommended_content exists and not already generated
    if (!topic.recommended_content && !autoGeneratedRef.current.has(topic.id)) {
      autoGeneratedRef.current.add(topic.id);
      setAutoGenerating(true);
      try {
        const { data: aiData, error } = await supabase.functions.invoke('generate-topic-content', {
          body: {
            topic: topic.topic,
            subject: topic.subject,
            type: 'explanation',
            additionalPrompt: STUDY_FORMAT_INSTRUCTIONS,
          }
        });

        if (!error && aiData?.content) {
          setAiExplanation(aiData.content);
          // Cache locally so it loads instantly next time
          try {
            localStorage.setItem(`syllabus_ai_${topic.id}_explanation`, aiData.content);
          } catch {
            // localStorage unavailable — cache skipped, DB copy below
          }
          // Save to database for future use
          await supabase
            .from('jamb_syllabus')
            .update({ recommended_content: aiData.content })
            .eq('id', topic.id);
        }
      } catch (err) {
        errorLogger.error(err, { component: 'SyllabusReader', action: 'auto-generation' });
      } finally {
        setAutoGenerating(false);
      }
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
    const estimatedSeconds = selectedTopic.estimated_reading_time * 60;
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
    setAiExplanation(null);
  };

  const handleBonusEarned = async () => {
    await refreshUsage();
    setShowLimitReached(false);
    toast.success('Bonus use earned! You can now generate AI content.');
  };

  const generateAIContent = async (type: 'explanation' | 'flashcards' | 'quiz' | 'summarize' | 'expand') => {
    if (!selectedTopic) return;
    
    // Check feature usage limit for AI explanation types
    if (['explanation', 'summarize', 'expand'].includes(type)) {
      if (!canUseFeature('syllabus_ai_explanation')) {
        setShowLimitReached(true);
        return;
      }
    }

    // Check local cache first for explanation types
    if (type === 'explanation') {
      const cached = localStorage.getItem(`syllabus_ai_${selectedTopic.id}_explanation`);
      if (cached) {
        setAiExplanation(cached);
        setExplanationMode('normal');
        toast.success('Loaded from cache ⚡');
        return;
      }
    }
    if (type === 'summarize' && summarizedExplanation) {
      setExplanationMode('summarized');
      return;
    }
    if (type === 'expand' && expandedExplanation) {
      setExplanationMode('expanded');
      return;
    }
    
    setGeneratingContent(type);
    
    try {
      // For summarize/expand, use existing content
      let requestBody: {
        topic: string;
        subject: string;
        type: string;
        additionalPrompt?: string;
      } = {
        topic: selectedTopic.topic,
        subject: selectedTopic.subject,
        type: type === 'summarize' || type === 'expand' ? 'explanation' : type
      };

      // Add context for summarize/expand
      if (type === 'summarize') {
        const currentContent = aiExplanation || selectedTopic.recommended_content;
        requestBody = {
          ...requestBody,
          type: 'explanation',
          additionalPrompt: `${STUDY_FORMAT_INSTRUCTIONS}\n\nNow create a concise 3-5 bullet point summary of: ${selectedTopic.topic}. Cover only the most important exam-focused points. Use the bullet list format (* item).`
        };
      } else if (type === 'expand') {
        const currentContent = aiExplanation || selectedTopic.recommended_content;
        requestBody = {
          ...requestBody,
          type: 'explanation',
          additionalPrompt: `${STUDY_FORMAT_INSTRUCTIONS}\n\nProvide a DEEP DIVE explanation of "${selectedTopic.topic}" for JAMB ${selectedTopic.subject}. Include multiple worked examples, common exam traps, formulas, and a practice question at the end. Build on this base: ${currentContent?.substring(0, 300)}`
        };
      } else if (type === 'explanation') {
        requestBody.additionalPrompt = STUDY_FORMAT_INSTRUCTIONS;
      }

      const { data, error } = await supabase.functions.invoke('generate-topic-content', {
        body: requestBody
      });

      if (error || !data?.content) {
        if (type === 'explanation') {
          const fallback = `## ${selectedTopic.topic}\n\n### Study Tips\n- Review JAMB past questions on this topic\n- Practice with our quiz feature\n- Discuss with your study group\n\n> AI explanations are temporarily unavailable. Please try again later.`;
          setAiExplanation(fallback);
          setExplanationMode('normal');
          toast.info('AI temporarily unavailable — showing study tips');
        } else {
          toast.error('Failed to generate content. Please try again.');
        }
        return;
      }

      if (type === 'explanation') {
        setAiExplanation(data.content);
        setExplanationMode('normal');
        // Persist to local cache so it loads instantly next time
        try { localStorage.setItem(`syllabus_ai_${selectedTopic.id}_explanation`, data.content); } catch { /* cache optional */ }
        await incrementUsage('syllabus_ai_explanation');
        toast.success('AI explanation generated!');
      } else if (type === 'summarize') {
        setSummarizedExplanation(data.content);
        setExplanationMode('summarized');
        try { localStorage.setItem(`syllabus_ai_${selectedTopic.id}_summary`, data.content); } catch { /* cache optional */ }
        await incrementUsage('syllabus_ai_explanation');
        toast.success('Summary generated!');
      } else if (type === 'expand') {
        setExpandedExplanation(data.content);
        setExplanationMode('expanded');
        try { localStorage.setItem(`syllabus_ai_${selectedTopic.id}_expanded`, data.content); } catch { /* cache optional */ }
        await incrementUsage('syllabus_ai_explanation');
        toast.success('Detailed explanation generated!');
      } else if (type === 'flashcards') {
        try {
          const jsonMatch = data.content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const flashcards = JSON.parse(jsonMatch[0]);
            for (const card of flashcards) {
              await supabase.from('flashcards').insert({
                email: userEmail,
                subject: selectedTopic.subject,
                topic: selectedTopic.topic,
                front: `[${selectedTopic.topic}] ${card.front}`,
                back: card.back,
                source_type: 'ai',
                source_id: selectedTopic.id
              });
            }
            toast.success(`Generated ${flashcards.length} flashcards for "${selectedTopic.topic}"!`);
            if (onGenerateFlashcards) {
              onGenerateFlashcards(selectedTopic.topic, selectedTopic.subject);
            }
          }
        } catch (e) {
          toast.error('Failed to parse flashcards');
        }
      } else if (type === 'quiz') {
        try {
          const jsonMatch = data.content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const questions: TopicQuizQuestion[] = JSON.parse(jsonMatch[0]);
            setTopicQuizQuestions(questions);
            setCurrentQuizIndex(0);
            setQuizAnswers({});
            setShowQuizFeedback(null);
            toast.success(`Starting quiz on "${selectedTopic.topic}"!`);
          }
        } catch (e) {
          toast.error('Failed to parse quiz questions');
        }
      }
    } catch (error: unknown) {
      errorLogger.error(error, { component: 'SyllabusReader', action: 'generate content' });
      if (type === 'explanation') {
        if (selectedTopic.recommended_content) {
          setAiExplanation(selectedTopic.recommended_content);
          setExplanationMode('normal');
          toast.info('Using cached content (AI unavailable)');
        } else {
          const fallback = `## ${selectedTopic.topic}\n\n### Study Tips\n- Review JAMB past questions on this topic\n- Practice with our quiz feature\n- Discuss with your study group\n\n> AI explanations are temporarily unavailable. Please try again later.`;
          setAiExplanation(fallback);
          setExplanationMode('normal');
          toast.info('AI temporarily unavailable');
        }
      } else {
        toast.error('Failed to generate content. Please try again.');
      }
    } finally {
      setGeneratingContent(null);
    }
  };

  const getDisplayedExplanation = () => {
    switch (explanationMode) {
      case 'summarized':
        return summarizedExplanation;
      case 'expanded':
        return expandedExplanation;
      default:
        return aiExplanation;
    }
  };

  const handleQuizAnswer = (answer: string) => {
    if (!topicQuizQuestions || showQuizFeedback !== null) return;
    
    const currentQ = topicQuizQuestions[currentQuizIndex];
    setQuizAnswers(prev => ({ ...prev, [currentQuizIndex]: answer }));
    setShowQuizFeedback(currentQuizIndex);
  };

  const nextQuizQuestion = () => {
    if (!topicQuizQuestions) return;
    
    if (currentQuizIndex < topicQuizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setShowQuizFeedback(null);
    } else {
      // Quiz complete
      const correct = Object.entries(quizAnswers).filter(([idx, ans]) => {
        return topicQuizQuestions[parseInt(idx)]?.correct === ans;
      }).length;
      toast.success(`Quiz complete! You got ${correct}/${topicQuizQuestions.length} correct!`);
      setTopicQuizQuestions(null);
      setQuizAnswers({});
      setShowQuizFeedback(null);
    }
  };

  const closeTopicQuiz = () => {
    setTopicQuizQuestions(null);
    setQuizAnswers({});
    setShowQuizFeedback(null);
    setCurrentQuizIndex(0);
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

  // Reading view
  if (selectedTopic) {
    const topicProgress = progress[selectedTopic.id];
    const estimatedMinutes = selectedTopic.estimated_reading_time;

    // If we have a structured lesson, render it via LessonRenderer
    if (structuredLesson && !loadingLesson) {
      return (
        <div className="min-h-screen bg-background p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setSelectedTopic(null);
                  setStructuredLesson(null);
                }}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to topics
              </button>
            </div>

            {/* Structured Lesson */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <InteractiveLesson
                lesson={structuredLesson}
                sectionsViewed={lessonProgress.progress?.sections_viewed || []}
                onSectionComplete={(sectionId) => lessonProgress.markSectionViewed(sectionId)}
              />
            </motion.div>
          </div>
        </div>
      );
    }

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
            {(selectedTopic.recommended_content || autoGenerating) && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Study Notes
                  {autoGenerating && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating...
                    </span>
                  )}
                </h3>
                <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
                  <StudyContentRenderer content={selectedTopic.recommended_content || ''} />
                </div>
              </div>
            )}

            {/* Show limit reached component if daily limit is hit */}
            {showLimitReached && (
              <FeatureLimitReached
                featureType="syllabus_ai_explanation"
                onBonusEarned={handleBonusEarned}
                className="mb-6"
              />
            )}

            {/* AI Content Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <Button
                variant="outline"
                onClick={() => generateAIContent('explanation')}
                disabled={generatingContent !== null}
                className="h-auto py-3"
              >
                {generatingContent === 'explanation' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                )}
                <div className="text-left">
                  <div className="font-medium text-sm">AI Explanation</div>
                  <div className="text-xs text-muted-foreground">Simple breakdown</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => generateAIContent('flashcards')}
                disabled={generatingContent !== null}
                className="h-auto py-3"
              >
                {generatingContent === 'flashcards' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2 text-purple-500" />
                )}
                <div className="text-left">
                  <div className="font-medium text-sm">Generate Flashcards</div>
                  <div className="text-xs text-muted-foreground">Create study cards</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => generateAIContent('quiz')}
                disabled={generatingContent !== null}
                className="h-auto py-3"
              >
                {generatingContent === 'quiz' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <HelpCircle className="w-4 h-4 mr-2 text-blue-500" />
                )}
                <div className="text-left">
                  <div className="font-medium text-sm">Quick Quiz</div>
                  <div className="text-xs text-muted-foreground">Test knowledge</div>
                </div>
              </Button>
            </div>

            {/* AI Explanation Display */}
            <AnimatePresence>
              {(aiExplanation || autoGenerating) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      AI Explanation
                      {explanationMode === 'summarized' && <Badge variant="secondary" className="text-xs">Summary</Badge>}
                      {explanationMode === 'expanded' && <Badge variant="secondary" className="text-xs">Detailed</Badge>}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (explanationMode === 'summarized') {
                            setExplanationMode('normal');
                          } else {
                            generateAIContent('summarize');
                          }
                        }}
                        disabled={generatingContent !== null}
                        className="text-xs h-7 px-2"
                      >
                        {generatingContent === 'summarize' ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : null}
                        {explanationMode === 'summarized' ? 'Show Full' : 'Summarize'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (explanationMode === 'expanded') {
                            setExplanationMode('normal');
                          } else {
                            generateAIContent('expand');
                          }
                        }}
                        disabled={generatingContent !== null}
                        className="text-xs h-7 px-2"
                      >
                        {generatingContent === 'expand' ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : null}
                        {explanationMode === 'expanded' ? 'Show Normal' : 'Explain More'}
                      </Button>
                    </div>
                  </div>
                  {autoGenerating ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                      <span className="text-muted-foreground">Generating AI explanation...</span>
                    </div>
                  ) : (
                    <StudyContentRenderer content={getDisplayedExplanation() || ''} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Topic Quiz Display */}
            <AnimatePresence>
              {topicQuizQuestions && topicQuizQuestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-xl p-5 border border-blue-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-500" />
                      Quick Quiz: {selectedTopic.topic}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {currentQuizIndex + 1}/{topicQuizQuestions.length}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={closeTopicQuiz}>
                        ✕
                      </Button>
                    </div>
                  </div>

                  <p className="text-foreground font-medium mb-4">
                    {topicQuizQuestions[currentQuizIndex].question}
                  </p>

                  <div className="space-y-2">
                    {topicQuizQuestions[currentQuizIndex].options.map((option, idx) => {
                      const optionLetter = String.fromCharCode(65 + idx);
                      const isSelected = quizAnswers[currentQuizIndex] === optionLetter;
                      const isCorrect = topicQuizQuestions[currentQuizIndex].correct === optionLetter;
                      const showFeedback = showQuizFeedback === currentQuizIndex;

                      return (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(optionLetter)}
                          disabled={showFeedback}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            showFeedback && isCorrect
                              ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-400'
                              : showFeedback && isSelected && !isCorrect
                              ? 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-400'
                              : isSelected
                              ? 'bg-primary/20 border-primary'
                              : 'bg-muted/50 border-border hover:border-primary/50'
                          }`}
                        >
                          <span className="font-bold mr-2">{optionLetter}.</span>
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {showQuizFeedback !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <div className={`p-3 rounded-lg ${
                        quizAnswers[currentQuizIndex] === topicQuizQuestions[currentQuizIndex].correct
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-red-500/10 border border-red-500/30'
                      }`}>
                        <p className="text-sm font-medium mb-1">
                          {quizAnswers[currentQuizIndex] === topicQuizQuestions[currentQuizIndex].correct
                            ? '✅ Correct!'
                            : `❌ Wrong! The answer is ${topicQuizQuestions[currentQuizIndex].correct}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {topicQuizQuestions[currentQuizIndex].explanation}
                        </p>
                      </div>
                      <Button onClick={nextQuizQuestion} className="mt-3 w-full">
                        {currentQuizIndex < topicQuizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reference Materials */}
            {selectedTopic.reference_materials && selectedTopic.reference_materials.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Recommended References
                </h3>
                <div className="space-y-2">
                  {selectedTopic.reference_materials.map((ref, i) => (
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
              
              {onGenerateFlashcards && (
                <Button 
                  variant="outline" 
                  onClick={() => onGenerateFlashcards(selectedTopic.topic, selectedTopic.subject)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Flashcards
                </Button>
              )}
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
