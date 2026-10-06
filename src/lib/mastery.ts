// Shared topic-mastery engine.
//
// Used by TopicMasteryTracker (Study tab) and MasteryOverview (Home tab).
// Fixes vs the old inline implementation:
//  - word-boundary keyword matching ('sin' no longer matches 'business',
//    'cell' no longer matches 'excellent')
//  - scored classification (most distinct keyword hits wins) instead of
//    first-match-wins, so generic keywords can't swallow every question
//  - time-decayed accuracy (recent attempts weigh more than old ones)
//  - minimum-sample confidence (1/1 is no longer "mastered")
//  - per-topic trend (improving / stable / declining)

export type MasteryLevel = 'weak' | 'learning' | 'proficient' | 'mastered';
export type MasteryTrend = 'improving' | 'stable' | 'declining';

export interface MasterySample {
  subject: string;
  text: string;
  storedTopics?: string[];
  correct: boolean;
  /** ISO timestamp of the attempt */
  at: string;
}

export interface TopicMastery {
  topic: string;
  subject: string;
  /** Time-decayed weighted counts (drive percentage + level) */
  correctW: number;
  totalW: number;
  /** Raw sample count (drives confidence) */
  samples: number;
  rawCorrect: number;
  rawTotal: number;
  percentage: number;
  level: MasteryLevel;
  lowData: boolean;
  trend: MasteryTrend;
  lastAttempted: string;
  isHighWeight: boolean;
}

export interface SubjectMastery {
  subject: string;
  topics: TopicMastery[];
  overall: number;
  weakest?: TopicMastery;
}

// Topics known to carry high frequency / weight in JAMB UTME exams
export const HIGH_WEIGHT_TOPICS: Record<string, string[]> = {
  english: ['Vocabulary', 'Grammar', 'Oral English', 'Sentence Structure', 'Comprehension'],
  mathematics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Calculus'],
  physics: ['Mechanics', 'Waves & Optics', 'Electricity', 'Heat & Thermodynamics'],
  chemistry: ['Organic Chemistry', 'Physical Chemistry', 'Electrochemistry', 'Atomic Structure'],
  biology: ['Genetics', 'Cell Biology', 'Human Physiology', 'Ecology'],
  literature: ['Prose & Fiction', 'Poetry', 'Literary Devices'],
  government: ['Political Systems', 'Public Administration'],
  economics: ['Microeconomics', 'Macroeconomics', 'International Trade'],
};

// Topic keywords mapping for automatic topic classification
export const TOPIC_KEYWORDS: Record<string, Record<string, string[]>> = {
  english: {
    'Vocabulary': ['synonym', 'antonym', 'nearest in meaning', 'opposite in meaning'],
    'Grammar': ['tense', 'verb', 'noun', 'adjective', 'adverb', 'pronoun', 'preposition'],
    'Comprehension': ['passage', 'author', 'infer', 'implies', 'conveyed'],
    'Oral English': ['stress', 'pronunciation', 'syllable', 'vowel', 'consonant'],
    'Sentence Structure': ['clause', 'phrase', 'predicate', 'gap'],
  },
  mathematics: {
    'Algebra': ['equation', 'solve', 'variable', 'expression', 'polynomial', 'quadratic'],
    'Geometry': ['triangle', 'circle', 'angle', 'area', 'perimeter', 'volume'],
    'Trigonometry': ['sine', 'cosine', 'tangent', 'trigonometric'],
    'Statistics': ['mean', 'median', 'mode', 'probability', 'standard deviation'],
    'Calculus': ['differentiate', 'integrate', 'derivative', 'limit'],
    'Number Theory': ['prime', 'factor', 'multiple', 'divisible', 'integer'],
  },
  physics: {
    'Mechanics': ['force', 'motion', 'velocity', 'acceleration', 'momentum', 'newton'],
    'Waves & Optics': ['wave', 'light', 'lens', 'mirror', 'reflection', 'refraction'],
    'Electricity': ['current', 'voltage', 'resistance', 'circuit', 'capacitor'],
    'Heat & Thermodynamics': ['heat', 'temperature', 'thermal', 'entropy', 'gas law'],
    'Modern Physics': ['quantum', 'nuclear', 'radioactive', 'photoelectric'],
  },
  chemistry: {
    'Organic Chemistry': ['alkane', 'alkene', 'benzene', 'hydrocarbon', 'organic', 'alcohol', 'ester'],
    'Inorganic Chemistry': ['periodic table', 'element', 'compound', 'salt', 'metal'],
    'Physical Chemistry': ['equilibrium', 'kinetics', 'thermochemistry', 'mole'],
    'Electrochemistry': ['electrolysis', 'electrode', 'redox', 'oxidation', 'reduction'],
    'Atomic Structure': ['orbital', 'proton', 'neutron', 'isotope', 'quantum number'],
  },
  biology: {
    'Cell Biology': ['membrane', 'organelle', 'mitosis', 'meiosis', 'cytoplasm'],
    'Genetics': ['gene', 'chromosome', 'DNA', 'heredity', 'mutation', 'allele'],
    'Ecology': ['ecosystem', 'habitat', 'food chain', 'biodiversity', 'succession'],
    'Human Physiology': ['blood', 'heart', 'kidney', 'liver', 'respiration', 'digestion', 'hormone'],
    'Plant Biology': ['photosynthesis', 'xylem', 'phloem', 'germination', 'tropism'],
  },
  literature: {
    'Poetry': ['poem', 'stanza', 'rhyme', 'verse', 'meter', 'sonnet'],
    'Prose & Fiction': ['novel', 'character', 'plot', 'setting', 'narrator'],
    'Drama': ['play', 'act', 'scene', 'dialogue', 'tragedy', 'comedy'],
    'Literary Devices': ['metaphor', 'simile', 'irony', 'symbolism', 'personification'],
  },
  government: {
    'Political Systems': ['democracy', 'military rule', 'parliament', 'federalism', 'republic'],
    'Public Administration': ['civil service', 'bureaucracy', 'local government', 'commission'],
    'International Relations': ['foreign policy', 'diplomacy', 'international', 'AU', 'ECOWAS', 'UN'],
    'Political Parties': ['party', 'election', 'voting', 'campaign', 'electorate'],
  },
  economics: {
    'Microeconomics': ['demand', 'supply', 'price', 'market', 'consumer', 'utility'],
    'Macroeconomics': ['GDP', 'inflation', 'unemployment', 'fiscal', 'monetary'],
    'International Trade': ['export', 'import', 'tariff', 'exchange rate', 'balance of payment'],
    'Development Economics': ['development', 'poverty', 'growth', 'industrialization'],
  },
  geography: {
    'Physical Geography': ['climate', 'weather', 'landform', 'erosion', 'river'],
    'Human Geography': ['population', 'urbanization', 'migration', 'settlement'],
    'Map Reading': ['map', 'scale', 'contour', 'bearing', 'coordinate'],
    'Nigerian Geography': ['Nigeria', 'Lagos', 'vegetation', 'savanna'],
  },
  accounting: {
    'Financial Accounting': ['balance sheet', 'income statement', 'ledger', 'journal'],
    'Cost Accounting': ['cost', 'budget', 'variance', 'overhead'],
    'Auditing': ['audit', 'internal control', 'verification'],
  },
  commerce: {
    'Business Organization': ['partnership', 'company', 'sole trader', 'corporation'],
    'Trade': ['wholesale', 'retail', 'distribution', 'trade discount'],
    'Banking': ['bank', 'loan', 'credit', 'interest', 'deposit'],
  },
  crs: {
    'Old Testament': ['Moses', 'Abraham', 'David', 'prophet', 'covenant'],
    'New Testament': ['Jesus', 'apostle', 'gospel', 'resurrection', 'salvation'],
    'Christian Ethics': ['ethics', 'moral', 'righteousness'],
  },
  irs: {
    'Quran Studies': ['Quran', 'surah', 'ayat', 'revelation'],
    'Hadith': ['hadith', 'sunnah'],
    'Islamic History': ['caliphate', 'hijrah', 'Muhammad'],
  },
  agricultural_science: {
    'Crop Production': ['crop', 'seed', 'fertilizer', 'harvest', 'cultivation'],
    'Animal Husbandry': ['livestock', 'poultry', 'cattle', 'breeding'],
    'Soil Science': ['soil', 'nutrient', 'irrigation', 'loam'],
    'Farm Management': ['farm', 'profit', 'mechanization'],
  },
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Scored classification: most distinct keyword hits wins, ties broken by longest hit. */
export const classifyTopic = (
  text: string,
  subject: string,
  storedTopics?: string[]
): string => {
  if (storedTopics && storedTopics.length > 0 && storedTopics[0]) {
    return storedTopics[0];
  }
  const subjectTopics = TOPIC_KEYWORDS[subject.toLowerCase()];
  if (!subjectTopics) return 'General Concepts';

  const lower = text.toLowerCase();
  let best: string | null = null;
  let bestHits = 0;
  let bestLen = 0;

  for (const [topic, keywords] of Object.entries(subjectTopics)) {
    let hits = 0;
    let longest = 0;
    for (const kw of keywords) {
      const re = new RegExp(`\\b${escapeRegExp(kw.toLowerCase())}\\b`);
      if (re.test(lower)) {
        hits++;
        longest = Math.max(longest, kw.length);
      }
    }
    if (hits > bestHits || (hits === bestHits && hits > 0 && longest > bestLen)) {
      best = topic;
      bestHits = hits;
      bestLen = longest;
    }
  }

  return best ?? 'General Concepts';
};

const levelFor = (percentage: number): MasteryLevel => {
  if (percentage >= 80) return 'mastered';
  if (percentage >= 60) return 'proficient';
  if (percentage >= 40) return 'learning';
  return 'weak';
};

const MIN_SAMPLES = 3;
const DECAY_DAYS = 30;

export const computeMastery = (
  samples: MasterySample[],
  allowedSubjects?: string[],
  nowMs: number = Date.now()
): SubjectMastery[] => {
  const allowed = allowedSubjects?.map((s) => s.toLowerCase());
  const groups = new Map<string, { subject: string; topic: string; items: MasterySample[] }>();

  for (const s of samples) {
    const subj = (s.subject || '').toLowerCase();
    if (!subj) continue;
    if (allowed && allowed.length > 0 && !allowed.includes(subj)) continue;
    const topic = classifyTopic(s.text, subj, s.storedTopics);
    const key = `${subj}::${topic}`;
    if (!groups.has(key)) groups.set(key, { subject: subj, topic, items: [] });
    groups.get(key)!.items.push(s);
  }

  const bySubject = new Map<string, TopicMastery[]>();

  for (const { subject, topic, items } of groups.values()) {
    const withAge = items.map((s) => {
      const t = new Date(s.at).getTime();
      const daysAgo = Number.isFinite(t) ? Math.max(0, (nowMs - t) / 86400000) : 9999;
      return { s, w: Math.exp(-daysAgo / DECAY_DAYS) };
    });

    let correctW = 0;
    let totalW = 0;
    let rawCorrect = 0;
    for (const { s, w } of withAge) {
      totalW += w;
      if (s.correct) {
        correctW += w;
        rawCorrect++;
      }
    }
    const percentage = totalW > 0 ? Math.round((correctW / totalW) * 100) : 0;

    // Confidence: thin samples can't claim mastery
    let level = levelFor(percentage);
    const lowData = items.length < MIN_SAMPLES;
    if (lowData && (level === 'mastered' || level === 'proficient')) {
      level = 'learning';
    }

    // Trend: recent half vs older half (weighted)
    let trend: MasteryTrend = 'stable';
    if (withAge.length >= 4) {
      const sorted = [...withAge].sort(
        (a, b) => new Date(a.s.at).getTime() - new Date(b.s.at).getTime()
      );
      const half = Math.floor(sorted.length / 2);
      const acc = (arr: typeof sorted) => {
        let c = 0, t = 0;
        for (const { s, w } of arr) {
          t += w;
          if (s.correct) c += w;
        }
        return t > 0 ? (c / t) * 100 : 0;
      };
      const diff = acc(sorted.slice(half)) - acc(sorted.slice(0, half));
      if (diff > 10) trend = 'improving';
      else if (diff < -10) trend = 'declining';
    }

    const highWeightList = HIGH_WEIGHT_TOPICS[subject] || [];
    const lastAttempted = items
      .map((s) => s.at)
      .sort()
      .at(-1)!;

    const tm: TopicMastery = {
      topic,
      subject,
      correctW,
      totalW,
      samples: items.length,
      rawCorrect,
      rawTotal: items.length,
      percentage,
      level,
      lowData,
      trend,
      lastAttempted,
      isHighWeight: highWeightList.some((hw) => hw.toLowerCase() === topic.toLowerCase()),
    };
    if (!bySubject.has(subject)) bySubject.set(subject, []);
    bySubject.get(subject)!.push(tm);
  }

  const result: SubjectMastery[] = [];
  for (const [subject, topics] of bySubject) {
    topics.sort((a, b) => a.percentage - b.percentage);
    let c = 0, t = 0;
    for (const tp of topics) {
      c += tp.correctW;
      t += tp.totalW;
    }
    const weakest = topics[0];
    result.push({
      subject,
      topics,
      overall: t > 0 ? Math.round((c / t) * 100) : 0,
      weakest,
    });
  }
  result.sort((a, b) => a.overall - b.overall);
  return result;
};
