import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, Target, BookOpen, Calculator, Image, FlaskConical,
  AlertTriangle, Eye, HelpCircle, Brain, ArrowRight, CheckCircle2,
  ChevronDown, ChevronUp, Sparkles, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InteractiveRenderer } from '@/components/interactive/InteractiveRegistry';
import type {
  Lesson, ContentSection, HookContent, IntuitiveExplanationContent,
  FormalExplanationContent, FormulaContent, DiagramContent,
  InteractiveContent, WorkedExampleContent, CommonMisconceptionContent,
  JambInsightContent, InlinePracticeContent, MemoryHookContent,
  ReflectionContent,
} from '@/types/lesson';

interface LessonRendererProps {
  lesson: Lesson;
  sectionsViewed: string[];
  onSectionComplete: (sectionId: string) => void;
  onPrediction?: (sectionId: string, prediction: string) => void;
}

// Section type configs — dark mode compatible
const SECTION_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bgColor: string; accentBorder: string }> = {
  hook: { icon: <Sparkles className="w-5 h-5" />, label: "Discover", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", accentBorder: "border-l-amber-500" },
  intuitive_explanation: { icon: <Lightbulb className="w-5 h-5" />, label: "Intuition", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", accentBorder: "border-l-blue-500" },
  formal_explanation: { icon: <BookOpen className="w-5 h-5" />, label: "Formal", color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800", accentBorder: "border-l-indigo-500" },
  formula: { icon: <Calculator className="w-5 h-5" />, label: "Formula", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800", accentBorder: "border-l-purple-500" },
  diagram: { icon: <Image className="w-5 h-5" />, label: "Visual", color: "text-teal-600 dark:text-teal-400", bgColor: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800", accentBorder: "border-l-teal-500" },
  interactive: { icon: <FlaskConical className="w-5 h-5" />, label: "Explore", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800", accentBorder: "border-l-green-500" },
  worked_example: { icon: <Calculator className="w-5 h-5" />, label: "Example", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", accentBorder: "border-l-emerald-500" },
  common_misconception: { icon: <AlertTriangle className="w-5 h-5" />, label: "Watch Out", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800", accentBorder: "border-l-red-500" },
  jamb_insight: { icon: <Eye className="w-5 h-5" />, label: "JAMB Focus", color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800", accentBorder: "border-l-orange-500" },
  inline_practice: { icon: <HelpCircle className="w-5 h-5" />, label: "Practice", color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800", accentBorder: "border-l-cyan-500" },
  memory_hook: { icon: <Brain className="w-5 h-5" />, label: "Remember", color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800", accentBorder: "border-l-pink-500" },
  reflection: { icon: <Target className="w-5 h-5" />, label: "Reflect", color: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800", accentBorder: "border-l-violet-500" },
};

// Individual section renderers — dark mode compatible
function HookSection({ content }: { content: HookContent }) {
  return (
    <div>
      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{content.text}</p>
      {content.scenario && (
        <p className="mt-3 text-gray-600 dark:text-gray-400 italic">{content.scenario}</p>
      )}
    </div>
  );
}

function IntuitiveExplanationSection({ content }: { content: IntuitiveExplanationContent }) {
  return (
    <div>
      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{content.text}</p>
      {content.analogy && (
        <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-400 dark:border-blue-500">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Think of it like this:</div>
          <p className="text-blue-700 dark:text-blue-400 text-sm">{content.analogy}</p>
        </div>
      )}
    </div>
  );
}

function FormalExplanationSection({ content }: { content: FormalExplanationContent }) {
  return (
    <div>
      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{content.text}</p>
      {content.key_terms && content.key_terms.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Key Terms:</div>
          {content.key_terms.map((term, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="font-medium text-indigo-700 dark:text-indigo-400 min-w-[120px]">{term.term}</span>
              <span className="text-gray-600 dark:text-gray-400">— {term.definition}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormulaSection({ content }: { content: FormulaContent }) {
  return (
    <div>
      <div className="text-center mb-4">
        <span className="text-2xl font-mono font-bold text-gray-800 dark:text-gray-100">{content.formula}</span>
      </div>
      
      <div className="space-y-2 mb-4">
        {content.variables.map((v, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="font-mono font-semibold text-purple-700 dark:text-purple-400 min-w-[24px]">{v.name}</span>
            <span className="text-gray-600 dark:text-gray-400">= {v.description}</span>
            <span className="text-gray-500 dark:text-gray-500">({v.unit})</span>
          </div>
        ))}
      </div>

      {content.when_to_use && (
        <div className="p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg mb-3">
          <div className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">When to use:</div>
          <p className="text-sm text-purple-700 dark:text-purple-400">{content.when_to_use}</p>
        </div>
      )}

      {content.common_traps && content.common_traps.length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-lg border-l-4 border-red-400 dark:border-red-500">
          <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Common traps:</div>
          <ul className="list-disc list-inside space-y-1">
            {content.common_traps.map((trap, i) => (
              <li key={i} className="text-sm text-red-700 dark:text-red-400">{trap}</li>
            ))}
          </ul>
        </div>
      )}

      {content.units_note && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border-l-4 border-amber-400 dark:border-amber-500">
          <div className="text-sm text-amber-800 dark:text-amber-300">{content.units_note}</div>
        </div>
      )}
    </div>
  );
}

function DiagramSection({ content }: { content: DiagramContent }) {
  return (
    <div>
      <p className="text-gray-700 dark:text-gray-300 mb-3">{content.description}</p>
      {content.image_url && (
        <div className="flex justify-center">
          <img src={content.image_url} alt={content.description} className="max-w-full h-auto rounded-lg" />
        </div>
      )}
      {content.caption && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 italic">{content.caption}</p>
      )}
    </div>
  );
}

function InteractiveSection({ content }: { content: InteractiveContent }) {
  return (
    <InteractiveRenderer
      component={content.component}
      config={content.config}
      instruction={content.instruction}
      prediction_prompt={content.prediction_prompt}
    />
  );
}

function WorkedExampleSection({ content }: { content: WorkedExampleContent }) {
  const [showSteps, setShowSteps] = useState(true);

  return (
    <div>
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Problem:</div>
        <p className="text-gray-800 dark:text-gray-200">{content.scenario}</p>
      </div>

      {content.given && content.given.length > 0 && (
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Given:</div>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
            {content.given.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </div>
      )}

      {content.required && (
        <div className="mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Required: </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{content.required}</span>
        </div>
      )}

      {content.principle && (
        <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
          <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">Principle:</div>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{content.principle}</p>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSteps(!showSteps)}
        className="mb-2"
      >
        {showSteps ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
        {showSteps ? 'Hide' : 'Show'} Steps
      </Button>

      <AnimatePresence>
        {showSteps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {content.steps.map((step, i) => (
              <div key={i} className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{step.explanation}</p>
                  <p className="font-mono text-sm text-gray-800 dark:text-gray-200 mt-1">{step.calculation}</p>
                  {step.result && (
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">= {step.result}</p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
        <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">Answer:</div>
        <p className="font-semibold text-emerald-800 dark:text-emerald-300">{content.answer}</p>
      </div>

      {content.check && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-600 dark:text-gray-400 italic">
          ✓ Sanity check: {content.check}
        </div>
      )}
    </div>
  );
}

function CommonMisconceptionSection({ content }: { content: CommonMisconceptionContent }) {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-red-100 dark:bg-red-950/40 rounded-lg border-l-4 border-red-400 dark:border-red-500">
        <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Common mistake:</div>
        <p className="text-red-700 dark:text-red-400">{content.mistake}</p>
      </div>
      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
        <div className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Why this is wrong:</div>
        <p className="text-amber-700 dark:text-amber-400 text-sm">{content.why_wrong}</p>
      </div>
      <div className="p-3 bg-green-50 dark:bg-green-950/40 rounded-lg border-l-4 border-green-400 dark:border-green-500">
        <div className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Correct thinking:</div>
        <p className="text-green-700 dark:text-green-400 text-sm">{content.correct_model}</p>
      </div>
    </div>
  );
}

function JambInsightSection({ content }: { content: JambInsightContent }) {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-orange-50 dark:bg-orange-950/40 rounded-lg">
        <div className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">JAMB Focus:</div>
        <p className="text-orange-700 dark:text-orange-400 text-sm">{content.focus_area}</p>
      </div>
      {content.trap && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-lg border-l-4 border-red-400 dark:border-red-500">
          <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Trap:</div>
          <p className="text-red-700 dark:text-red-400 text-sm">{content.trap}</p>
        </div>
      )}
      {content.tip && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border-l-4 border-blue-400 dark:border-blue-500">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Tip:</div>
          <p className="text-blue-700 dark:text-blue-400 text-sm">{content.tip}</p>
        </div>
      )}
      {content.related_topics && content.related_topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Related:</span>
          {content.related_topics.map((t, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function InlinePracticeSection({ content }: { content: InlinePracticeContent }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(0);
  const isCorrect = selected === content.answer;
  const hasAnswered = selected !== null;

  return (
    <div className="space-y-3">
      <p className="font-medium text-gray-800 dark:text-gray-200">{content.question}</p>
      
      <div className="grid grid-cols-1 gap-2">
        {content.options.map((opt) => {
          const isSelected = selected === opt.label;
          const isAnswer = opt.label === content.answer;
          let borderColor = 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600';
          if (hasAnswered) {
            if (isAnswer) borderColor = 'border-green-500 bg-green-50 dark:bg-green-950/40';
            else if (isSelected && !isCorrect) borderColor = 'border-red-500 bg-red-50 dark:bg-red-950/40';
          }
          
          return (
            <button
              key={opt.label}
              onClick={() => !hasAnswered && setSelected(opt.label)}
              disabled={hasAnswered}
              className={`p-3 rounded-lg border-2 text-left transition-all ${borderColor} ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className="font-medium mr-2">{opt.label}.</span>
              {opt.text}
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800'}`}
        >
          <div className="flex items-center gap-2 mb-1">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <RotateCcw className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <span className={`font-medium ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
              {isCorrect ? 'Correct!' : 'Not quite.'}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{content.explanation}</p>
        </motion.div>
      )}

      {content.hints && content.hints.length > 0 && !hasAnswered && (
        <div>
          {showHints < content.hints.length && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHints((h) => h + 1)}
              className="text-sm"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Hint {showHints + 1}/{content.hints.length}
            </Button>
          )}
          {content.hints.slice(0, showHints).map((hint, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded text-sm text-amber-700 dark:text-amber-400 mt-1"
            >
              💡 {hint}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function MemoryHookSection({ content }: { content: MemoryHookContent }) {
  return (
    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/40 dark:to-purple-950/40 rounded-lg border border-pink-200 dark:border-pink-800">
      <div className="flex items-start gap-2">
        <Brain className="w-5 h-5 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5" />
        <div>
          {content.hook_type && (
            <Badge variant="secondary" className="mb-2 text-xs">{content.hook_type}</Badge>
          )}
          <p className="text-gray-800 dark:text-gray-200 italic">{content.text}</p>
        </div>
      </div>
    </div>
  );
}

function ReflectionSection({ content }: { content: ReflectionContent }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="space-y-3">
      <div className="p-4 bg-violet-50 dark:bg-violet-950/40 rounded-lg border border-violet-200 dark:border-violet-800">
        <div className="flex items-start gap-2">
          <Target className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-violet-800 dark:text-violet-300 mb-1">Self-check:</div>
            <p className="text-violet-700 dark:text-violet-400">{content.question}</p>
          </div>
        </div>
      </div>

      {!showAnswer ? (
        <Button variant="outline" size="sm" onClick={() => setShowAnswer(true)}>
          Show expected understanding
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300"
        >
          {content.expected_understanding}
        </motion.div>
      )}
    </div>
  );
}

// Section renderer map
const SECTION_RENDERERS: Record<string, React.ComponentType<{ content: any }>> = {
  hook: HookSection,
  intuitive_explanation: IntuitiveExplanationSection,
  formal_explanation: FormalExplanationSection,
  formula: FormulaSection,
  diagram: DiagramSection,
  interactive: InteractiveSection,
  worked_example: WorkedExampleSection,
  common_misconception: CommonMisconceptionSection,
  jamb_insight: JambInsightSection,
  inline_practice: InlinePracticeSection,
  memory_hook: MemoryHookSection,
  reflection: ReflectionSection,
};

export function LessonRenderer({
  lesson,
  sectionsViewed,
  onSectionComplete,
}: LessonRendererProps) {
  const sortedSections = [...lesson.content_sections].sort((a, b) => a.order - b.order);
  const totalSections = sortedSections.length;
  const viewedCount = sortedSections.filter((s) => sectionsViewed.includes(s.id)).length;
  const progressPercent = totalSections > 0 ? Math.round((viewedCount / totalSections) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sticky Progress Bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border py-2 mb-4 -mx-4 px-4 md:-mx-8 md:px-8">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">{viewedCount}/{totalSections} sections</span>
          <span className="text-xs font-medium text-primary">{progressPercent}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Lesson Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs capitalize">{lesson.subject}</Badge>
          <Badge variant="secondary" className="text-xs">{lesson.difficulty_level}</Badge>
          <span className="text-sm text-muted-foreground">~{lesson.estimated_minutes} min</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
      </div>

      {/* Learning Objectives */}
      {lesson.learning_objectives.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-800 dark:text-blue-300">By the end of this lesson, you will be able to:</span>
          </div>
          <ul className="space-y-1">
            {lesson.learning_objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400">
                <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content Sections */}
      <div className="space-y-4">
        {sortedSections.map((section, index) => {
          const config = SECTION_CONFIG[section.type] || SECTION_CONFIG.hook;
          const Renderer = SECTION_RENDERERS[section.type];
          const isViewed = sectionsViewed.includes(section.id);

          if (!Renderer) return null;

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative rounded-xl border-l-4 border-r border-t border-b p-4 transition-all ${config.accentBorder} ${
                isViewed
                  ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20'
                  : `${config.bgColor} border-r-current`
              }`}
              onViewportEnter={() => {
                if (!isViewed) onSectionComplete(section.id);
              }}
            >
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className={config.color}>{config.icon}</span>
                <span className={`text-sm font-semibold ${config.color}`}>
                  {index + 1}. {config.label}
                </span>
                {isViewed && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 ml-auto" />
                )}
              </div>

              {/* Section Content */}
              <Renderer content={section.content} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
