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

/**
 * How many explained questions a subject needs before its page is published
 * (indexed, linked from the subject index and included in the sitemap).
 *
 * A page carrying a handful of questions is a thin page: it is not useful on
 * its own and it is exactly the "low value content" pattern AdSense rejects.
 * Subjects below the threshold still get a page with the editorial guide and an
 * honest note about what is not published yet, but the page is noindexed and
 * left out of the sitemap until the backfill catches up.
 *
 * Shared with scripts/prerender-public-pages.ts so the static HTML, the runtime
 * page and the sitemap cannot disagree about what is published.
 */
export const MIN_PUBLISHED_QUESTIONS = 25;

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

/**
 * Editorial introductions for each subject page.
 *
 * These are written for this site, not lifted from a syllabus or another
 * question bank. They exist because a page of past questions on its own is
 * replicated exam material; the value a reader gets is knowing what the paper
 * tests, which traps recur, and how to work the page rather than read it.
 */
export interface SubjectGuide {
  heading: string;
  paragraphs: string[];
  /** Three or four short "what to watch for" points. */
  traps: string[];
}

export const SUBJECT_GUIDES: Record<string, SubjectGuide> = {
  english: {
    heading: 'What the English paper actually tests',
    paragraphs: [
      'English is the one paper every candidate sits, and it is marked out of 100 like the other three. The questions divide into comprehension on an unseen passage, lexis and structure (vocabulary, grammar, concord, idioms), and oral forms — vowel sounds, stress and intonation. The comprehension passage carries the most marks per question set, and it is where careful readers separate themselves: most of its questions ask what the passage implies, not what it states.',
      'The fastest way to gain marks here is not to memorise rules but to read the options against the passage. A distractor usually repeats a phrase from the text while reversing its meaning, so matching words is a trap. For lexis and structure, work from the sentence as a whole: subject-verb agreement and tense sequence resolve most items once you identify the true subject.',
    ],
    traps: [
      'Choosing an option because it repeats words from the passage — the commonest comprehension trap.',
      'Treating "oral English" as spelling; it tests sounds and stress, and the written form often misleads.',
      'Ignoring register: an option can be grammatical but wrong for the tone of the sentence.',
    ],
  },
  mathematics: {
    heading: 'What the Mathematics paper actually tests',
    paragraphs: [
      'The Mathematics paper rewards accuracy under time pressure more than raw knowledge. Number and numeration, algebra, geometry and trigonometry, statistics and probability, and introductory calculus all appear, and the paper expects you to choose a method quickly rather than derive one. Most items are one or two steps; the difficulty is recognising which two.',
      'Work this page with a pen. Reading a solution creates the feeling of understanding without the recall that the exam demands. When you miss a question, write down the topic and the step that failed — a sign error in indices or a misread angle is a different problem from not knowing the formula, and they need different revision.',
    ],
    traps: [
      'Answering the question asked in the working rather than the one printed — units and rounding are common losses.',
      'Skipping the diagram in geometry; a rough sketch exposes most wrong options immediately.',
      'Forgetting that calculators are not allowed, so estimation has to be reliable.',
    ],
  },
  physics: {
    heading: 'What the Physics paper actually tests',
    paragraphs: [
      'Physics questions are built around relationships: what happens to one quantity when another changes. The paper covers measurement and units, mechanics, fields, waves, electricity and modern physics, and it expects you to reason with definitions and formulae rather than recall paragraphs. A large share of items can be answered by checking dimensions or by eliminating options with impossible units.',
      'Graphs carry a disproportionate number of marks. Know what the gradient and the area under each common graph represent — velocity-time, force-extension, current-voltage — because the question often asks for the physical meaning rather than a number. Sign conventions in electricity and optics are the other reliable source of lost marks.',
    ],
    traps: [
      'Using the wrong unit prefix (milli against micro) and losing an otherwise correct calculation.',
      'Reading a gradient when the question asks for the area, or the reverse.',
      'Treating "resistance" and "resistivity" as interchangeable; the paper tests the distinction.',
    ],
  },
  chemistry: {
    heading: 'What the Chemistry paper actually tests',
    paragraphs: [
      'Chemistry is the most calculation-heavy of the science papers and the most terminology-sensitive. Expect atomic structure and periodicity, bonding, stoichiometry and the mole, energetics, equilibria, acids and bases, electrochemistry, and organic functional groups. The mole concept underlies a large block of questions, so fluency there pays across the whole paper.',
      'Organic chemistry is mostly pattern recognition: identify the functional group, then recall its reactions. Qualitative analysis questions ask you to interpret an observation, not to memorise a table, so practise reading tests as evidence. Where a question gives a reaction scheme, count atoms before choosing — balancing is often the whole question in disguise.',
    ],
    traps: [
      'Confusing the terms in a test-tube result (effervescence against precipitation, for example).',
      'Forgetting that standard conditions and state symbols change the answer in energetics.',
      'Naming a compound from its structure without applying IUPAC numbering rules.',
    ],
  },
  biology: {
    heading: 'What the Biology paper actually tests',
    paragraphs: [
      'Biology rewards precise vocabulary and the ability to read a diagram. The paper moves through cell biology, nutrition, transport, respiration, excretion, coordination, reproduction, genetics, ecology and evolution. Many questions present an experiment or an unfamiliar organism and ask you to apply a principle you already know, so memorising definitions alone is not enough.',
      'Genetics and ecology are where most candidates lose the most marks, and both are learnable: genetics because the ratio patterns repeat, ecology because the terminology (population, community, ecosystem, niche) is tested precisely. Draw the crosses and the food webs rather than doing them in your head — the paper usually gives you enough information to work them out.',
    ],
    traps: [
      'Using everyday meanings for technical terms such as "population" or "adaptation".',
      'Answering from the diagram\'s appearance instead of the process it represents.',
      'Mixing up analogous and homologous structures in evolution questions.',
    ],
  },
  literature: {
    heading: 'What the Literature in English paper actually tests',
    paragraphs: [
      'Literature asks whether you have read the texts and whether you can talk about how they work. Expect questions on the set prose, drama and poetry, plus unseen passages where you must identify tone, form and effect. The paper tests literary terms in use, not as definitions: you are usually asked which device is at work in a quoted line, and why it matters.',
      'Quotation is the difference between a safe answer and a guess. Learn a handful of short, load-bearing quotations from each set text — a line that establishes character, theme or turning point — rather than long passages you may misremember. For unseen poetry, read for the shift in tone; most questions turn on it.',
    ],
    traps: [
      'Choosing a device because it is listed in the options rather than because the line demonstrates it.',
      'Confusing the author with the narrator or the poet with the speaker.',
      'Summarising plot when the question asks about effect or technique.',
    ],
  },
  government: {
    heading: 'What the Government paper actually tests',
    paragraphs: [
      'Government is a paper about institutions, processes and precedent, with a strong Nigerian focus. It covers constitutional development, federalism, the separation of powers, the executive, legislature and judiciary, political parties and elections, public administration, foreign policy and international organisations. Dates and document names matter, but the questions usually test why a provision exists rather than when it was written.',
      'The reliable way to prepare is to build a timeline of Nigerian constitutional development and attach one distinctive feature to each milestone. For comparative questions on presidential and parliamentary systems, learn the consequences of each structure — who can be removed, by whom, and how — rather than a list of differences.',
    ],
    traps: [
      'Mixing the 1963 republican constitution with the 1979 presidential one.',
      'Treating "separation of powers" and "checks and balances" as the same idea.',
      'Assuming international organisations have enforcement powers they do not have.',
    ],
  },
  economics: {
    heading: 'What the Economics paper actually tests',
    paragraphs: [
      'Economics combines definitions, diagrams and small calculations. The paper covers scarcity and choice, demand and supply, elasticity, production and costs, market structures, money and banking, national income, inflation and unemployment, international trade and development. Marks are lost less often to hard theory than to imprecise language — "demand" and "quantity demanded" are not the same thing.',
      'Practise the diagrams until they are automatic, including the direction of every shift and what stays on each axis. Elasticity and the multiplier are the calculation questions that recur; both are quick marks once the formula is secure. For development questions, Nigerian examples are usually the intended answer.',
    ],
    traps: [
      'Moving the demand curve when the question describes a price change (that is a movement along it).',
      'Confusing a shift in supply with a change in quantity supplied.',
      'Using "economic growth" and "economic development" interchangeably.',
    ],
  },
  crs: {
    heading: 'What the CRS paper actually tests',
    paragraphs: [
      'Christian Religious Studies tests knowledge of the biblical text and the ability to draw a lesson from it. Questions cover the Old Testament, the New Testament, the life and teaching of Jesus, the early church and Christian living, and they usually name a book or a passage. You are expected to know the context — who is speaking, to whom, and why it matters — not just the verse.',
      'Learn passages by theme rather than in isolation: forgiveness, covenant, faith, judgement and service recur across both testaments, and examiners build comparisons from them. Where a question asks for a "lesson", the correct option is the one supported by the passage, not the most pious-sounding statement.',
    ],
    traps: [
      'Attributing a quotation to the wrong book or speaker.',
      'Choosing a moral-sounding option that the passage does not actually support.',
      'Confusing parallel accounts of the same event in different gospels.',
    ],
  },
  irs: {
    heading: 'What the IRS paper actually tests',
    paragraphs: [
      'Islamic Religious Studies covers the Qur\'an, the Hadith, Tawhid, Fiqh, the pillars of Islam and Islamic history. Questions are often precise about Arabic terms and about the circumstances of revelation, so a general understanding is not enough: you need the specific term, ruling or event the question names.',
      'Build a vocabulary list of the technical terms as you work through this page — each one you meet is likely to reappear. For Fiqh questions, check the condition attached to the ruling; examiners frequently test the exception rather than the rule. For history, keep the sequence of the caliphates clear.',
    ],
    traps: [
      'Confusing similar Arabic terms (for example sadaqah and zakah).',
      'Applying a ruling without checking the condition that makes it apply.',
      'Mixing the order of the rightly guided caliphs.',
    ],
  },
  geography: {
    heading: 'What the Geography paper actually tests',
    paragraphs: [
      'Geography splits into physical geography, human geography and map work, with a strong emphasis on Nigeria and West Africa. Expect questions on the earth and its representation, climate and vegetation, landforms, population, settlement, agriculture, industry and transport. Map reading is a fixed block of marks and is the most improvable part of the paper.',
      'Map work rewards practice with a real topographic sheet: scale, bearing, gradient, cross-sections and settlement patterns. Physical geography rewards diagram literacy — a labelled sketch of a landform answers more questions than a paragraph of description. Link each process to a Nigerian example, because that is usually how the option set is built.',
    ],
    traps: [
      'Calculating gradient without converting both measurements to the same unit.',
      'Confusing weather with climate, or a process with its landform.',
      'Ignoring the map extract because the question "looks" theoretical.',
    ],
  },
  agricultural_science: {
    heading: 'What the Agricultural Science paper actually tests',
    paragraphs: [
      'Agricultural Science is a practical paper. It covers soil science, crop production, animal husbandry, farm management, pests and diseases, agricultural economics and extension. Questions frequently describe a farm situation and ask for the appropriate practice, so the correct answer is usually the one a working farmer would choose rather than the most technical-sounding option.',
      'Learn the cycles — nutrient, nitrogen, crop rotation, oestrus and breeding — because they generate many questions and are easy to confuse when learned as lists. For farm management, be comfortable with simple records and profit calculations; for crop and animal production, know the reason behind each practice, not just its name.',
    ],
    traps: [
      'Choosing a control method that is effective but illegal or uneconomic in the situation described.',
      'Mixing up the stages of the oestrus cycle or the meaning of terms such as "flushing".',
      'Forgetting that soil texture and structure are different properties.',
    ],
  },
};

