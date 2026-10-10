import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Check, Lightbulb, BookOpen,
  Calculator, AlertTriangle, Eye, Brain, Target, FlaskConical,
  Sparkles, Trophy, CheckCircle2, XCircle, Image,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { InteractiveRenderer } from '@/components/interactive/InteractiveRegistry';
import type {
  Lesson, HookContent, IntuitiveExplanationContent,
  FormalExplanationContent, FormulaContent, WorkedExampleContent,
  CommonMisconceptionContent, JambInsightContent, InlinePracticeContent,
  MemoryHookContent,
} from '@/types/lesson';

interface InteractiveLessonProps {
  lesson: Lesson;
  sectionsViewed: string[];
  onSectionComplete: (sectionId: string) => void;
  onLessonComplete?: () => void;
}

// Section type configs
const STEP_ICONS: Record<string, typeof Sparkles> = {
  hook: Sparkles,
  intuitive_explanation: Lightbulb,
  formal_explanation: BookOpen,
  formula: Calculator,
  worked_example: Target,
  common_misconception: AlertTriangle,
  jamb_focus: Eye,
  jamb_insight: Eye,
  practice: FlaskConical,
  inline_practice: FlaskConical,
  memory_hook: Brain,
  reflection: Sparkles,
  interactive: FlaskConical,
  diagram: Image,
  mastery_check: Trophy,
  summary: CheckCircle2,
};

const STEP_COLORS: Record<string, string> = {
  hook: 'from-amber-500 to-orange-500',
  intuitive_explanation: 'from-blue-500 to-cyan-500',
  formal_explanation: 'from-indigo-500 to-blue-500',
  formula: 'from-purple-500 to-violet-500',
  worked_example: 'from-emerald-500 to-green-500',
  common_misconception: 'from-red-500 to-rose-500',
  jamb_focus: 'from-orange-500 to-amber-500',
  jamb_insight: 'from-orange-500 to-amber-500',
  practice: 'from-cyan-500 to-teal-500',
  inline_practice: 'from-cyan-500 to-teal-500',
  memory_hook: 'from-pink-500 to-rose-500',
  reflection: 'from-violet-500 to-purple-500',
  interactive: 'from-green-500 to-emerald-500',
  diagram: 'from-teal-500 to-cyan-500',
  mastery_check: 'from-yellow-500 to-amber-500',
  summary: 'from-green-500 to-teal-500',
};

const STEP_LABELS: Record<string, string> = {
  hook: 'Let\'s Start',
  intuitive_explanation: 'Get the Feel',
  formal_explanation: 'The Science',
  formula: 'Key Formula',
  worked_example: 'Worked Example',
  common_misconception: 'Watch Out!',
  jamb_focus: 'JAMB Tip',
  jamb_insight: 'JAMB Tip',
  practice: 'Quick Check',
  inline_practice: 'Quick Check',
  memory_hook: 'Memory Hook',
  reflection: 'Think About It',
  interactive: 'Try It',
  diagram: 'See It',
  mastery_check: 'Final Check',
  summary: 'Recap',
};

// Individual section renderers
function HookStep({ content }: { content: HookContent }) {
  return (
    <div className="space-y-4">
      <p className="text-lg text-foreground leading-relaxed">{content.text}</p>
      {content.scenario && (
        <div className="p-4 bg-muted/50 rounded-xl border-l-4 border-primary">
          <p className="text-sm text-muted-foreground italic">{content.scenario}</p>
        </div>
      )}
      {content.prediction_prompt && (
        <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Before we continue...</p>
          <p className="text-foreground">{content.prediction_prompt}</p>
        </div>
      )}
    </div>
  );
}

function IntuitiveStep({ content }: { content: IntuitiveExplanationContent }) {
  const [showAnalogy, setShowAnalogy] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-lg text-foreground leading-relaxed">{content.text}</p>
      {content.analogy && (
        <div>
          {!showAnalogy ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalogy(true)}
              className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Show me an analogy
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-blue-500/10 rounded-xl border-l-4 border-blue-500"
            >
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Think of it like this:</p>
              <p className="text-foreground">{content.analogy}</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function FormalStep({ content }: { content: FormalExplanationContent }) {
  return (
    <div className="space-y-4">
      <p className="text-lg text-foreground leading-relaxed">{content.text}</p>
      {content.key_terms && content.key_terms.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Key Terms:</p>
          {content.key_terms.map((term, i) => (
            <div key={i} className="p-3 bg-muted/50 rounded-lg">
              <span className="font-semibold text-foreground">{term.term}</span>
              <span className="text-muted-foreground"> — {term.definition}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormulaStep({ content }: { content: FormulaContent }) {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-purple-500/10 rounded-xl text-center">
        <p className="text-2xl font-mono font-bold text-foreground">{content.formula}</p>
      </div>
      {content.variables && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {content.variables.map((v, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
              <span className="font-mono font-bold text-primary">{v.name}</span>
              <span className="text-sm text-muted-foreground">
                = {v.description}
                {v.unit ? ` (${v.unit})` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
      {content.when_to_use && (
        <div className="p-3 bg-green-500/10 rounded-lg border-l-4 border-green-500">
          <p className="text-sm"><span className="font-medium text-green-600 dark:text-green-400">When to use:</span> {content.when_to_use}</p>
        </div>
      )}
      {content.common_traps && content.common_traps.length > 0 && (
        <div className="p-3 bg-red-500/10 rounded-lg border-l-4 border-red-500">
          <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Common traps:</p>
          <ul className="text-sm space-y-1">
            {content.common_traps.map((trap, i) => (
              <li key={i}>• {trap}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function WorkedExampleStep({ content }: { content: WorkedExampleContent }) {
  const [showSteps, setShowSteps] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  // Two schemas exist in the DB: seeded lessons use scenario + object steps,
  // AI-prompt lessons use problem + string steps. Render whichever is present.
  const problemText = content.scenario || content.problem || '';
  const steps = Array.isArray(content.steps) ? content.steps : [];
  return (
    <div className="space-y-4">
      {problemText ? (
        <div className="p-4 bg-muted/50 rounded-xl">
          <p className="text-sm font-medium text-muted-foreground mb-1">Problem:</p>
          <p className="text-foreground">{problemText}</p>
        </div>
      ) : null}
      {content.given && content.given.length > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-sm font-medium text-muted-foreground mb-1">Given:</p>
          <ul className="text-sm space-y-1">
            {content.given.map((g, i) => (
              <li key={i}>• {g}</li>
            ))}
          </ul>
        </div>
      )}
      {content.principle && (
        <div className="p-3 bg-purple-500/10 rounded-lg border-l-4 border-purple-500">
          <p className="text-sm"><span className="font-medium text-purple-600 dark:text-purple-400">Principle:</span> {content.principle}</p>
        </div>
      )}
      {!showSteps ? (
        <Button variant="outline" onClick={() => setShowSteps(true)}>
          <Target className="w-4 h-4 mr-2" />
          Show me the steps
        </Button>
      ) : steps.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {steps.map((step, i) => {
            const isObj = typeof step === 'object' && step !== null;
            const explanation = isObj
              ? (step as { explanation?: string }).explanation || ''
              : '';
            const calculation = isObj
              ? (step as { calculation?: string; result?: string }).calculation ||
                (step as { result?: string }).result ||
                ''
              : String(step);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  {explanation ? (
                    <p className="text-sm font-medium text-muted-foreground">{explanation}</p>
                  ) : null}
                  {calculation ? (
                    <p className="text-foreground font-mono">{calculation}</p>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
          {content.required ? (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm"><span className="font-medium text-muted-foreground">Required:</span> {content.required}</p>
            </div>
          ) : null}
          {content.explanation ? (
            <div className="p-3 bg-blue-500/10 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm"><span className="font-medium text-blue-600 dark:text-blue-400">Why it works:</span> {content.explanation}</p>
            </div>
          ) : null}
          {!showAnswer ? (
            <Button variant="outline" size="sm" onClick={() => setShowAnswer(true)}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Reveal answer
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-500/10 rounded-xl border border-green-500/20"
            >
              <p className="font-medium text-green-600 dark:text-green-400 mb-1">Answer:</p>
              <p className="text-foreground">{content.answer}</p>
              {content.check && (
                <p className="mt-2 text-sm text-muted-foreground">{content.check}</p>
              )}
            </motion.div>
          )}
        </motion.div>
      ) : null}
    </div>
  );
}

function PracticeStep({ content, onAnswer }: { content: InlinePracticeContent; onAnswer?: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  if (!content.question) return null;

  const optionTexts = content.options?.map(o => o.text || o.label || '') || [];
  // AI-authored lessons vary in case/spacing ("b" vs "B"), so normalize
  // before matching. findIndex returns -1 (not nullish) on no match, which
  // ?? would miss and leave the question unanswerable — fall back to 0.
  const norm = (s: unknown) => String(s ?? '').trim().toUpperCase();
  const found = content.options?.findIndex(o => norm(o.label) === norm(content.answer) || norm(o.text) === norm(content.answer)) ?? -1;
  const correctIndex = found >= 0 ? found : 0;
  const isCorrect = selected === correctIndex;

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    onAnswer?.(isCorrect);
  };

  return (
    <div className="space-y-4">
      <p className="text-lg text-foreground">{content.question}</p>
      <div className="space-y-2">
        {optionTexts.map((opt, i) => (
          <button
            key={i}
            onClick={() => !submitted && setSelected(i)}
            disabled={submitted}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              submitted
                ? i === correctIndex
                  ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                  : i === selected
                    ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400'
                    : 'border-border opacity-50'
                : selected === i
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                submitted && i === correctIndex
                  ? 'bg-green-500 text-white'
                  : submitted && i === selected
                    ? 'bg-red-500 text-white'
                    : 'bg-muted'
              }`}>
                {submitted && i === correctIndex ? (
                  <Check className="w-4 h-4" />
                ) : submitted && i === selected ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </div>
              <span className="text-foreground">{opt}</span>
            </div>
          </button>
        ))}
      </div>
      {!submitted ? (
        <Button onClick={handleSubmit} disabled={selected === null} className="w-full">
          Check Answer
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}
        >
          <p className={`font-medium ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isCorrect ? '✓ Correct!' : '✗ Not quite'}
          </p>
          {content.explanation && (
            <p className="mt-1 text-sm text-muted-foreground">{content.explanation}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

function MisconceptionStep({ content }: { content: CommonMisconceptionContent }) {
  const [showCorrection, setShowCorrection] = useState(false);
  return (
    <div className="space-y-4">
      <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Common Mistake:</p>
        <p className="text-foreground">{content.misconception}</p>
      </div>
      {!showCorrection ? (
        <Button variant="outline" size="sm" onClick={() => setShowCorrection(true)}>
          Show me the right way
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 bg-green-500/10 rounded-xl border border-green-500/20"
        >
          <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Correct:</p>
          <p className="text-foreground">{content.correction}</p>
        </motion.div>
      )}
    </div>
  );
}

function JambFocusStep({ content }: { content: JambInsightContent }) {
  const related = content.related_topics || [];
  return (
    <div className="space-y-4">
      <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
        <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">JAMB Focus</p>
        {content.focus_area && <p className="text-foreground mb-2">{content.focus_area}</p>}
        {content.frequency && <p className="text-sm text-muted-foreground mb-2">Frequency: {content.frequency}</p>}
        {content.trap && (
          <div className="p-3 bg-red-500/10 rounded-lg border-l-4 border-red-500 mb-2">
            <p className="text-sm"><span className="font-medium text-red-600 dark:text-red-400">Trap:</span> {content.trap}</p>
          </div>
        )}
        {content.typical_question && (
          <div className="p-3 bg-background/50 rounded-lg mb-2">
            <p className="text-sm"><span className="font-medium">Typical question:</span> {content.typical_question}</p>
          </div>
        )}
        {content.common_mistakes && content.common_mistakes.length > 0 && (
          <div className="p-3 bg-red-500/10 rounded-lg mb-2">
            <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Common mistakes:</p>
            <ul className="text-sm space-y-1">
              {content.common_mistakes.map((m, i) => (
                <li key={i}>• {m}</li>
              ))}
            </ul>
          </div>
        )}
        {(content.exam_tip || content.tip) && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium text-primary">💡 Tip: {content.exam_tip || content.tip}</p>
          </div>
        )}
        {related.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {related.map((t, i) => (
              <span key={i} className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemoryHookStep({ content }: { content: MemoryHookContent }) {
  return (
    <div className="p-4 bg-pink-500/10 rounded-xl border border-pink-500/20">
      <p className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-2">🧠 Memory Hook</p>
      <p className="text-lg text-foreground italic">{content.text || content.hook || 'Remember this!'}</p>
    </div>
  );
}

function ReflectionStep({ content }: { content: { question?: string; expected_understanding?: string } }) {
  if (!content.question) return null;
  return (
    <div className="space-y-4">
      <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-2">Think About It</p>
        <p className="text-lg text-foreground">{content.question}</p>
      </div>
      {content.expected_understanding && (
        <p className="text-sm text-muted-foreground">{content.expected_understanding}</p>
      )}
    </div>
  );
}

function SummaryStep({ content }: { content: Record<string, unknown> }) {
  const takeaways = (content.key_takeaways as string[]) || [];
  const connections = (content.connections as string[]) || [];
  return (
    <div className="space-y-4">
      {takeaways.length > 0 && (
        <div className="space-y-2">
          {takeaways.map((takeaway, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-foreground">{takeaway}</p>
            </div>
          ))}
        </div>
      )}
      {connections.length > 0 && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium text-muted-foreground mb-1">Up next:</p>
          {connections.map((conn, i) => (
            <p key={i} className="text-sm text-foreground">• {conn}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// Sections that would render empty are dropped entirely so they never
// occupy a step (no blank cards, no question-less "Quick Check" steps,
// no "coming soon" placeholders inside the lesson flow).
export const isSectionRenderable = (s: { type: string; content: unknown }): boolean => {
  const c = (s.content || {}) as Record<string, unknown>;
  switch (s.type) {
    case 'practice':
    case 'inline_practice':
      return typeof c.question === 'string' && c.question.trim().length > 0;
    case 'interactive':
      return typeof (c as { component?: unknown }).component === 'string';
    case 'summary': {
      const takeaways = (c.key_takeaways as unknown[]) || [];
      const connections = (c.connections as unknown[]) || [];
      return takeaways.length > 0 || connections.length > 0;
    }
    case 'diagram':
      return Boolean(c.description || c.caption);
    case 'reflection':
      return typeof c.question === 'string' && (c.question as string).trim().length > 0;
    case 'worked_example': {
      const st = (c as { steps?: unknown }).steps;
      const text = (c as { scenario?: unknown; problem?: unknown }).scenario ??
        (c as { problem?: unknown }).problem;
      return Array.isArray(st) && st.length > 0 && typeof text === 'string' && text.trim().length > 0;
    }
    case 'hook':
    case 'intuitive_explanation':
    case 'formal_explanation':
    case 'formula':
    case 'worked_example':
    case 'common_misconception':
    case 'jamb_focus':
    case 'jamb_insight':
    case 'memory_hook':
      return true;
    default:
      return false;
  }
};

export function InteractiveLesson({
  lesson,
  sectionsViewed,
  onSectionComplete,
  onLessonComplete,
}: InteractiveLessonProps) {
  const sections = useMemo(() =>
    (lesson.content_sections || [])
      .filter(s => s.type !== 'mastery_check' && isSectionRenderable(s))
      .sort((a, b) => a.order - b.order),
    [lesson]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set(sectionsViewed));
  const [direction, setDirection] = useState(1);

  const totalSteps = sections.length;
  const progressPercent = totalSteps > 0 ? (completedSteps.size / totalSteps) * 100 : 0;
  const section = sections[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isStepCompleted = section ? completedSteps.has(section.id) : false;

  const completeCurrentStep = useCallback(() => {
    if (!section) return;
    setCompletedSteps(prev => new Set([...prev, section.id]));
    onSectionComplete(section.id);
  }, [section, onSectionComplete]);

  const handleContinue = () => {
    completeCurrentStep();
    if (isLastStep) {
      onLessonComplete?.();
    } else {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePracticeAnswer = (correct: boolean) => {
    if (correct) completeCurrentStep();
  };

  const renderSection = () => {
    if (!section) return null;
    const content = section.content as unknown as Record<string, unknown>;

    switch (section.type) {
      case 'hook':
        return <HookStep content={content as unknown as HookContent} />;
      case 'intuitive_explanation':
        return <IntuitiveStep content={content as unknown as IntuitiveExplanationContent} />;
      case 'formal_explanation':
        return <FormalStep content={content as unknown as FormalExplanationContent} />;
      case 'formula':
        return <FormulaStep content={content as unknown as FormulaContent} />;
      case 'worked_example':
        return <WorkedExampleStep content={content as unknown as WorkedExampleContent} />;
      case 'practice':
      case 'inline_practice':
        return <PracticeStep content={content as unknown as InlinePracticeContent} onAnswer={handlePracticeAnswer} />;
      case 'common_misconception':
        return <MisconceptionStep content={content as unknown as CommonMisconceptionContent} />;
      case 'jamb_focus':
      case 'jamb_insight':
        return <JambFocusStep content={content as unknown as JambInsightContent} />;
      case 'memory_hook':
        return <MemoryHookStep content={content as unknown as MemoryHookContent} />;
      case 'reflection':
        return <ReflectionStep content={content as unknown as { question?: string; expected_understanding?: string }} />;
      case 'summary':
        return <SummaryStep content={content as Record<string, unknown>} />;
      case 'interactive': {
        const interactiveContent = content as unknown as { component?: string; config?: Record<string, unknown>; instruction?: string };
        if (interactiveContent.component) {
          return (
            <InteractiveRenderer
              component={interactiveContent.component as 'formula_calculator' | 'wave_simulator' | 'motion_simulator' | 'electrolysis_simulator'}
              config={interactiveContent.config || {}}
              instruction={interactiveContent.instruction}
            />
          );
        }
        return <p className="text-muted-foreground">Interactive coming soon</p>;
      }
      case 'diagram': {
        const diagContent = content as unknown as { description?: string; caption?: string };
        return (
          <div className="p-4 bg-muted/50 rounded-xl text-center">
            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-foreground">{diagContent.description}</p>
            {diagContent.caption && <p className="text-sm text-muted-foreground mt-1">{diagContent.caption}</p>}
          </div>
        );
      }
      default:
        // Unknown section type — render nothing instead of leaking
        // debug text ("Section type: …") into the lesson.
        return null;
    }
  };

  const StepIcon = STEP_ICONS[section?.type || 'hook'] || Sparkles;
  const stepColor = STEP_COLORS[section?.type || 'hook'] || 'from-gray-500 to-gray-600';
  const stepLabel = STEP_LABELS[section?.type || 'hook'] || 'Learn';

  if (totalSteps === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No content available for this lesson yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              ← Back
            </button>
            <span className="text-sm font-medium text-muted-foreground">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={section?.id || currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Step label */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stepColor} flex items-center justify-center`}>
                <StepIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stepLabel}</p>
                <h3 className="text-lg font-bold text-foreground">{lesson.topic}</h3>
              </div>
            </div>

            {/* Section content */}
            <div className="mb-8">
              {renderSection()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Continue button */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleContinue}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isStepCompleted ? 'Continue' : isLastStep ? 'Complete Lesson' : 'Continue'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
