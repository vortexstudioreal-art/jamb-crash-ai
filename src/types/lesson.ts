// Lesson schema types — matches the JSON schema from Document 1

export type SectionType =
  | 'hook'
  | 'intuitive_explanation'
  | 'formal_explanation'
  | 'formula'
  | 'diagram'
  | 'interactive'
  | 'worked_example'
  | 'common_misconception'
  // Legacy section types (used by existing seed data)
  | 'jamb_insight'
  | 'inline_practice'
  // Current section types (used by generate-topic-content prompt)
  | 'jamb_focus'
  | 'practice'
  | 'summary'
  | 'mastery_check'
  | 'memory_hook'
  | 'reflection';

export type LessonStatus = 'draft' | 'review' | 'approved' | 'published';
export type MasteryLevel = 'not_started' | 'learning' | 'reviewing' | 'mastered';
export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard';
export type PracticeDifficulty = 'easy' | 'medium' | 'jamb';

// Interactive component names — AI can only reference these
export type InteractiveComponentName =
  | 'motion_simulator'
  | 'wave_simulator'
  | 'electrolysis_simulator'
  | 'circuit_simulator'
  | 'projectile_simulator'
  | 'pendulum_simulator'
  | 'formula_calculator'
  | 'graph_explorer'
  | 'charge_explorer'
  | 'field_line_viewer';

// Section content types
export interface HookContent {
  text: string;
  scenario?: string;
  prediction_prompt?: string;
}

export interface IntuitiveExplanationContent {
  text: string;
  analogy?: string;
}

export interface FormalExplanationContent {
  text: string;
  key_terms?: Array<{ term: string; definition: string }>;
}

export interface FormulaContent {
  formula: string;
  variables: Array<{
    name: string;
    description: string;
    unit: string;
  }>;
  when_to_use?: string;
  common_traps?: string[];
  units_note?: string;
}

export interface DiagramContent {
  description: string;
  image_url?: string;
  labels?: Array<{ text: string; x: number; y: number }>;
  caption?: string;
}

export interface InteractiveContent {
  component: InteractiveComponentName;
  config: Record<string, unknown>;
  instruction?: string;
  prediction_prompt?: string;
}

export interface WorkedExampleContent {
  scenario: string;
  given?: string[];
  required?: string;
  principle?: string;
  steps: Array<{
    explanation: string;
    calculation: string;
    result?: string;
  }>;
  answer: string;
  check?: string;
}

export interface CommonMisconceptionContent {
  // Current schema (generate-topic-content prompt)
  misconception?: string;
  correction?: string;
  why_confusing?: string;
  // Legacy schema (seeded lessons)
  mistake?: string;
  why_wrong?: string;
  correct_model?: string;
}

export interface JambInsightContent {
  // Legacy schema (seeded lessons, type: "jamb_insight")
  focus_area?: string;
  trap?: string;
  tip?: string;
  related_topics?: string[];
  // Current schema (generate-topic-content prompt, type: "jamb_focus")
  frequency?: string;
  typical_question?: string;
  common_mistakes?: string[];
  exam_tip?: string;
}

export interface InlinePracticeContent {
  question: string;
  options: Array<{ label: string; text: string }>;
  answer: string;
  explanation: string;
  hints?: string[];
}

export interface MemoryHookContent {
  text?: string;
  /** Legacy field name for the hook text */
  hook?: string;
  hook_type?: 'mnemonic' | 'analogy' | 'story' | 'visualization';
}

export interface ReflectionContent {
  question: string;
  expected_understanding?: string;
}

// Union type for all section content
export type SectionContent =
  | HookContent
  | IntuitiveExplanationContent
  | FormalExplanationContent
  | FormulaContent
  | DiagramContent
  | InteractiveContent
  | WorkedExampleContent
  | CommonMisconceptionContent
  | JambInsightContent
  | InlinePracticeContent
  | MemoryHookContent
  | ReflectionContent;

// A single content section within a lesson
export interface ContentSection {
  id: string;
  type: SectionType;
  order: number;
  content: SectionContent;
}

// Practice question in the mastery bank
export interface PracticeQuestion {
  difficulty: PracticeDifficulty;
  question: string;
  options: Array<{ label: string; text: string }>;
  answer: string;
  explanation: string;
  hints?: string[];
  jamb_focus?: string;
}

// Mastery criteria for a lesson
export interface MasteryCriteria {
  min_score: number;
  required_sections: string[]; // section IDs
}

// The full lesson object
export interface Lesson {
  id: string;
  subject: string;
  topic: string;
  subtopic: string;
  title: string;
  learning_objectives: string[];
  difficulty_level: DifficultyLevel;
  estimated_minutes: number;
  content_sections: ContentSection[];
  practice_questions: PracticeQuestion[];
  mastery_criteria: MasteryCriteria;
  version: number;
  status: LessonStatus;
  created_at: string;
  updated_at: string;
}

// Lesson progress for a student
export interface LessonProgress {
  id: string;
  email: string;
  lesson_id: string;
  sections_viewed: string[]; // section IDs
  predictions: Array<{
    section_id: string;
    predicted_answer: string;
    correct: boolean;
    timestamp: string;
  }>;
  practice_attempts: Array<{
    question_idx: number;
    answer: string;
    correct: boolean;
    hints_used: number;
  }>;
  practice_score: number;
  mastery_level: MasteryLevel;
  mastery_score: number;
  time_spent_seconds: number;
  last_accessed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Props for interactive components
export interface InteractiveProps {
  config: Record<string, unknown>;
  onPrediction?: (prediction: string) => void;
  onInteraction?: (data: Record<string, unknown>) => void;
}
