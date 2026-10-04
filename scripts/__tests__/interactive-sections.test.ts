import { describe, it, expect } from 'vitest';
import { collectLessons } from '../../scripts/generate-lessons-migration.mjs';

const lessons = collectLessons();
const interactive = lessons.flatMap((l) =>
  l.content_sections
    .filter((s) => s.type === 'interactive')
    .map((s) => ({ lesson: l, section: s }))
);

describe('interactive lesson sections', () => {
  it('uses only component names the renderer knows', () => {
    const known = new Set([
      'formula_calculator',
      'wave_simulator',
      'motion_simulator',
      'electrolysis_simulator',
      'circuit_simulator',
      'charge_explorer',
      'field_line_viewer',
      'graph_explorer',
      'projectile_simulator',
      'pendulum_simulator',
    ]);

    const unknown = interactive
      .map((i) => i.section.content.component)
      .filter((c) => !known.has(c));

    expect(unknown).toEqual([]);
  });

  it('gives every interactive section a prediction prompt and instruction', () => {
    for (const { lesson, section } of interactive) {
      const where = `${lesson.subject}/${lesson.topic}/${section.id}`;
      expect(section.content.instruction?.length, where).toBeGreaterThan(20);
      expect(section.content.prediction_prompt?.length, where).toBeGreaterThan(15);
      expect(section.content.config, where).toBeTypeOf('object');
    }
  });

  it('numbers sections 1..N in every lesson', () => {
    const broken = lessons
      .filter((l) => {
        const orders = l.content_sections.map((s) => s.order);
        return orders.some((o, i) => o !== i + 1);
      })
      .map((l) => `${l.subject}/${l.topic}`);

    expect(broken).toEqual([]);
  });

  it('has unique section ids inside each lesson', () => {
    const broken = lessons
      .filter((l) => new Set(l.content_sections.map((s) => s.id)).size !== l.content_sections.length)
      .map((l) => `${l.subject}/${l.topic}`);

    expect(broken).toEqual([]);
  });

  it('only references mastery sections that exist', () => {
    const broken = lessons
      .filter((l) => l.mastery_criteria?.required_sections)
      .filter((l) => {
        const ids = new Set(l.content_sections.map((s) => s.id));
        return l.mastery_criteria.required_sections.some((id) => !ids.has(id));
      })
      .map((l) => `${l.subject}/${l.topic}`);

    expect(broken).toEqual([]);
  });

  it('covers all ten interactive components across the corpus', () => {
    const used = new Set(interactive.map((i) => i.section.content.component));
    expect(used.size).toBe(10);
  });
});
