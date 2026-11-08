/**
 * Public, crawlable UTME subjects.
 *
 * Shared deliberately between the PastQuestions page (runtime) and the
 * build-time prerenderer (scripts/prerender-public-pages.ts) so the static
 * HTML Google and AdSense review crawl can never drift from what the app
 * actually renders.
 *
 * commerce/accounting are WAEC subjects (never examined by JAMB) and are
 * excluded everywhere else in the app, so they stay out here too.
 */
export const PUBLIC_SUBJECTS = [
  'english', 'mathematics', 'physics', 'chemistry', 'biology',
  'literature', 'government', 'economics', 'crs', 'irs',
  'geography', 'agricultural_science',
] as const;

export type PublicSubject = (typeof PUBLIC_SUBJECTS)[number];

export const SUBJECT_LABELS: Record<string, string> = {
  english: 'English',
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  literature: 'Literature in English',
  government: 'Government',
  economics: 'Economics',
  crs: 'Christian Religious Studies',
  irs: 'Islamic Religious Studies',
  geography: 'Geography',
  agricultural_science: 'Agricultural Science',
};

export const SUBJECT_BLURBS: Record<string, string> = {
  english: 'Comprehension, lexis and structure, oral English and the unseen passage.',
  mathematics: 'Number and numeration, algebra, geometry, trigonometry and statistics.',
  physics: 'Measurements, mechanics, fields, waves, electricity and modern physics.',
  chemistry: 'Atomic structure, bonding, energetics, equilibria and organic chemistry.',
  biology: 'Cell biology, ecology, genetics, physiology and evolution.',
  literature: 'Prose, drama and poetry, including the set texts and unseen extracts.',
  government: 'Constitutional development, political institutions and international relations.',
  economics: 'Microeconomics, macroeconomics, economic development and trade.',
  crs: 'Old and New Testament narratives and Christian doctrine.',
  irs: 'Quranic passages, Hadith and Islamic jurisprudence.',
  geography: 'Physical geography, map work, human geography and Nigerian geography.',
  agricultural_science: 'Crop and animal production, soil science and agricultural economics.',
};
