import type { Database } from '@/integrations/supabase/types';

export type MockSubject = Database['public']['Enums']['jamb_subject'];

export interface MockQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  subject: string;
  year?: number;
  explanation?: string;
  image_url?: string | null;
}

export interface MockSection {
  key: string;
  title: string;
  subject: string;
  questionCount: number;
  minutes: number;
}

export interface MockSectionResult {
  key: string;
  title: string;
  subject: string;
  correct: number;
  total: number;
  score: number;
  timeTakenSec: number;
}

export interface MockResults {
  totalScore: number;
  maxScore: number;
  sections: MockSectionResult[];
  timeTakenSec: number;
}

export const MOCK_ENGLISH_MINUTES = 60;
export const MOCK_SUBJECT_MINUTES = 50;

export const buildMockSections = (subjects: string[]): MockSection[] => {
  const sections: MockSection[] = [
    {
      key: 'english',
      title: 'Use of English',
      subject: 'english',
      questionCount: 60,
      minutes: MOCK_ENGLISH_MINUTES,
    },
  ];
  subjects.slice(0, 3).forEach((subject, i) => {
    sections.push({
      key: subject,
      title: subject.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      subject,
      questionCount: 40,
      minutes: MOCK_SUBJECT_MINUTES,
    });
  });
  return sections;
};

export const shuffleMockQuestions = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const gradeMock = (
  sections: MockSection[],
  sectionQuestions: MockQuestion[][],
  sectionAnswers: Record<string, Record<string, string>>,
  sectionTimes: Record<string, number>,
): MockResults => {
  const sectionResults: MockSectionResult[] = sections.map((section, idx) => {
    const questions = sectionQuestions[idx];
    const answers = sectionAnswers[section.key] || {};
    const correct = questions.filter((q) => answers[q.id] === q.correct_answer).length;
    return {
      key: section.key,
      title: section.title,
      subject: section.subject,
      correct,
      total: questions.length,
      score: Math.round((correct / Math.max(questions.length, 1)) * 100),
      timeTakenSec: sectionTimes[section.key] || 0,
    };
  });

  // JAMB 400-mark grading: Use of English + best 3 subject scores
  const english = sectionResults.find((s) => s.key === 'english');
  const subjects = sectionResults.filter((s) => s.key !== 'english');
  const bestSubjects = [...subjects].sort((a, b) => b.score - a.score).slice(0, 3);

  let totalScore = 0;
  if (english) totalScore += english.score;
  bestSubjects.forEach((s) => (totalScore += s.score));

  return {
    totalScore,
    maxScore: 400,
    sections: sectionResults,
    timeTakenSec: Object.values(sectionTimes).reduce((a, b) => a + b, 0),
  };
};

export const scoreBand = (score: number): { label: string; color: string; advice: string } => {
  if (score >= 320) return { label: 'Outstanding 🏆', color: 'text-emerald-500', advice: 'You are in elite territory — competitive courses like Medicine, Law and Engineering are within reach. Keep polishing weak areas!' };
  if (score >= 280) return { label: 'Excellent ⭐', color: 'text-green-500', advice: 'Strong performance! You should confidently aim for courses like Nursing, Computer Science or Accountancy.' };
  if (score >= 250) return { label: 'Very Good 👍', color: 'text-blue-500', advice: 'Solid score. Push past 280 to unlock the most competitive courses. Focus on your weakest section.' };
  if (score >= 200) return { label: 'Good 💪', color: 'text-yellow-500', advice: 'Above the general cut-off line, but top courses need more. Review the questions you missed and retake.' };
  return { label: 'Keep Going 🚀', color: 'text-orange-500', advice: 'Every master was once a beginner. Review your mistakes, study the explanations, and try again — your score will climb!' };
};
