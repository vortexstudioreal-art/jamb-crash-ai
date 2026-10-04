import { describe, it, expect } from 'vitest';
import { collectLessons } from '../../scripts/generate-lessons-migration.mjs';

/**
 * Topics here must match `jamb_syllabus.topic` for subject 'history' in the live
 * database, because the syllabus deep link queries lessons by (subject, topic).
 * Renaming one silently breaks navigation into the lesson.
 */
const SYLLABUS_TOPICS = [
  'Introduction to History',
  'Pre-Colonial Nigerian Societies',
  'The Sokoto Caliphate',
  'European Contact and Slave Trade',
  'British Colonization of Nigeria',
  'Nigerian Nationalism',
  'Post-Independence Nigeria',
  'West African History',
  'Colonialism in West Africa',
  'World History',
];

const SECTION_TYPES = [
  'hook',
  'intuitive_explanation',
  'formal_explanation',
  'formula',
  'worked_example',
  'common_misconception',
  'jamb_insight',
  'memory_hook',
  'reflection',
];

const history = collectLessons()
  .filter((l) => l.subject === 'history')
  .sort((a, b) => a.topic.localeCompare(b.topic));

describe('history lesson seeder', () => {
  it('ships one lesson per history syllabus topic', () => {
    expect(history.map((l) => l.topic).sort()).toEqual([...SYLLABUS_TOPICS].sort());
  });

  it('gives every topic a distinct subtopic', () => {
    const subtopics = history.map((l) => l.subtopic);
    expect(new Set(subtopics).size).toBe(subtopics.length);
  });

  it('numbers sections 1..N with unique ids', () => {
    for (const lesson of history) {
      const sections = lesson.content_sections;
      expect(sections.map((s) => s.order), lesson.topic).toEqual(
        sections.map((_, i) => i + 1)
      );
      const ids = sections.map((s) => s.id);
      expect(new Set(ids).size, lesson.topic).toBe(ids.length);
    }
  });

  it('uses only section types the player understands', () => {
    for (const lesson of history) {
      for (const section of lesson.content_sections) {
        expect(SECTION_TYPES, `${lesson.topic} ${section.id}`).toContain(section.type);
      }
    }
  });

  it('ships three practice questions with valid answers and hints', () => {
    for (const lesson of history) {
      const questions = lesson.practice_questions;
      expect(questions, lesson.topic).toHaveLength(3);
      expect(questions.map((q) => q.difficulty), lesson.topic).toEqual([
        'easy',
        'medium',
        'jamb',
      ]);

      for (const q of questions) {
        expect(q.options.map((o) => o.label), `${lesson.topic}: ${q.question}`).toEqual([
          'A',
          'B',
          'C',
          'D',
        ]);
        expect(['A', 'B', 'C', 'D'], `${lesson.topic}: ${q.question}`).toContain(q.answer);
        expect(q.explanation.length, `${lesson.topic}: ${q.question}`).toBeGreaterThan(20);
        expect(q.hints.length, `${lesson.topic}: ${q.question}`).toBeGreaterThan(0);
      }
    }
  });

  it('points mastery criteria only at sections that exist', () => {
    for (const lesson of history) {
      const ids = new Set(lesson.content_sections.map((s) => s.id));
      for (const id of lesson.mastery_criteria.required_sections) {
        expect(ids.has(id), `${lesson.topic} -> ${id}`).toBe(true);
      }
      expect(lesson.mastery_criteria.min_score, lesson.topic).toBeGreaterThanOrEqual(70);
    }
  });

  it('keeps formula variables free of raw undefined and labels traps', () => {
    for (const lesson of history) {
      const formula = lesson.content_sections.find((s) => s.type === 'formula');
      expect(formula, lesson.topic).toBeDefined();
      expect(formula.content.variables.length, lesson.topic).toBeGreaterThan(0);
      expect(formula.content.when_to_use.length, lesson.topic).toBeGreaterThan(20);
      expect(formula.content.common_traps.length, lesson.topic).toBeGreaterThanOrEqual(3);
      for (const v of formula.content.variables) {
        expect(v.name.length, lesson.topic).toBeGreaterThan(1);
        expect(v.description.length, lesson.topic).toBeGreaterThan(5);
      }
    }
  });

  it('escapes nothing that would break the SQL literal round trip', () => {
    // The generator doubles apostrophes, so the risk is a stray quote in a title
    // that a naive migration author would have left unescaped.
    for (const lesson of history) {
      expect(lesson.title, lesson.topic).not.toMatch(/["`]/);
      expect(JSON.stringify(lesson.content_sections)).not.toContain('undefined');
    }
  });
});
