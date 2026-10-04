import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TrendingUp, Target, BookOpen, Flame, Lightbulb, AlertCircle, Play, ArrowLeft, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { shuffleQuestionList } from '@/lib/quizShuffle';
import ReactMarkdown from 'react-markdown';
import { useAiExplanation } from '@/hooks/useAiExplanation';
import { errorLogger } from '@/services/errorLogger';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  subject: string;
  year?: number;
  image_url?: string | null;
  [key: string]: unknown;
}

interface TopicGroup {
  topic: string;
  questions: Question[];
  years: Set<number>;
  frequency: 'very_high' | 'high' | 'medium';
}

const SUBJECT_LABELS: Record<string, string> = {
  english: '📖 English',
  mathematics: '🔢 Mathematics',
  physics: '⚡ Physics',
  chemistry: '🧪 Chemistry',
  biology: '🧬 Biology',
  literature: '📚 Literature',
  government: '🏛️ Government',
  economics: '💹 Economics',
  crs: '✝️ CRS',
  irs: '☪️ IRS',
  geography: '🌍 Geography',
  accounting: '📊 Accounting',
  commerce: '🏪 Commerce',
  agricultural_science: '🌾 Agric Science'
};

// Topic patterns to identify commonly tested areas - now subject-aware
const TOPIC_PATTERNS: Record<string, { keywords: string[], label: string, subjects: string[] }> = {
  // ==================== BIOLOGY ====================
  'photosynthesis': { keywords: ['photosynthe', 'chlorophyll', 'light reaction', 'calvin cycle', 'chloroplast', 'carbon dioxide fixation', 'light-dependent'], label: '🌱 Photosynthesis', subjects: ['biology'] },
  'respiration': { keywords: ['respir', 'glycolysis', 'krebs', 'electron transport', 'atp', 'aerobic', 'anaerobic', 'oxidative phosphorylation', 'breathing'], label: '💨 Respiration', subjects: ['biology'] },
  'genetics': { keywords: ['gene', 'allele', 'chromosome', 'mendel', 'heredit', 'dna', 'rna', 'mutation', 'genotype', 'phenotype', 'dominant', 'recessive', 'punnett', 'crossing over'], label: '🧬 Genetics', subjects: ['biology'] },
  'ecology': { keywords: ['ecosys', 'food chain', 'food web', 'habitat', 'niche', 'biome', 'population dynamics', 'succession', 'symbiosis', 'commensalism', 'parasitism', 'mutualism'], label: '🌿 Ecology', subjects: ['biology', 'agricultural_science'] },
  'reproduction': { keywords: ['reproduct', 'fertiliz', 'gamete', 'meiosis', 'embryo', 'pollination', 'ovary', 'sperm', 'ovum', 'menstrual', 'puberty', 'gestation'], label: '🥚 Reproduction', subjects: ['biology'] },
  'cell_biology': { keywords: ['cell membrane', 'mitochondr', 'nucleus', 'organelle', 'cytoplasm', 'mitosis', 'cell division', 'endoplasmic', 'golgi', 'ribosome', 'lysosome', 'vacuole'], label: '🔬 Cell Biology', subjects: ['biology'] },
  'nervous_system': { keywords: ['nerve', 'neuron', 'synapse', 'reflex', 'brain', 'spinal cord', 'stimulus', 'receptor', 'effector', 'axon', 'dendrite'], label: '🧠 Nervous System', subjects: ['biology'] },
  'circulatory_system': { keywords: ['blood', 'heart', 'artery', 'vein', 'capillary', 'pulse', 'circulation', 'haemoglobin', 'plasma', 'red blood cell', 'white blood cell'], label: '❤️ Circulatory System', subjects: ['biology'] },
  'digestive_system': { keywords: ['digestion', 'enzyme', 'stomach', 'intestine', 'liver', 'pancreas', 'bile', 'absorption', 'peristalsis', 'alimentary'], label: '🍽️ Digestive System', subjects: ['biology'] },
  'excretion': { keywords: ['excret', 'kidney', 'nephron', 'urea', 'urine', 'osmoregulation', 'homeostasis', 'skin', 'sweat', 'lung'], label: '🚰 Excretion', subjects: ['biology'] },
  'skeletal_muscular': { keywords: ['bone', 'skeleton', 'muscle', 'joint', 'cartilage', 'tendon', 'ligament', 'bicep', 'tricep', 'contraction'], label: '🦴 Skeletal & Muscular', subjects: ['biology'] },
  'classification': { keywords: ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species', 'taxonomy', 'binomial', 'vertebrate', 'invertebrate'], label: '📚 Classification', subjects: ['biology'] },
  'plant_biology': { keywords: ['root', 'stem', 'leaf', 'xylem', 'phloem', 'transpiration', 'stomata', 'guard cell', 'meristem', 'tropism', 'germination'], label: '🌳 Plant Biology', subjects: ['biology'] },
  'immunity': { keywords: ['immune', 'antibody', 'antigen', 'vaccine', 'pathogen', 'disease', 'infection', 'immunity', 'lymphocyte', 'phagocyte'], label: '🛡️ Immunity & Disease', subjects: ['biology'] },
  'evolution': { keywords: ['evolution', 'natural selection', 'adaptation', 'darwin', 'fossil', 'speciation', 'variation', 'survival of the fittest'], label: '🦎 Evolution', subjects: ['biology'] },
  
  // ==================== CHEMISTRY ====================
  'organic_chemistry': { keywords: ['hydrocarbon', 'alkane', 'alkene', 'alkyne', 'alcohol', 'ester', 'organic compound', 'benzene', 'polymer', 'isomer', 'homologous', 'functional group', 'carboxylic', 'amine', 'ketone', 'aldehyde'], label: '⚗️ Organic Chemistry', subjects: ['chemistry'] },
  'acid_base': { keywords: ['acid', 'base', 'neutraliz', 'ph', 'buffer', 'titrat', 'alkaline', 'indicator', 'hydroxide', 'hydrogen ion'], label: '🧫 Acids & Bases', subjects: ['chemistry'] },
  'redox': { keywords: ['oxidation', 'reduction', 'redox', 'electron transfer', 'oxidizing', 'reducing', 'oxidation state', 'electrochemical', 'corrosion', 'rusting'], label: '⚡ Redox Reactions', subjects: ['chemistry'] },
  'periodic_table': { keywords: ['periodic table', 'atomic number', 'noble gas', 'transition metal', 'alkali metal', 'halogen', 'group', 'period', 'electron configuration', 'valence'], label: '📊 Periodic Table', subjects: ['chemistry'] },
  'chemical_bonding': { keywords: ['ionic bond', 'covalent bond', 'electronegativity', 'metallic bond', 'hydrogen bond', 'van der waals', 'coordinate bond', 'dative bond', 'bond energy'], label: '🔗 Chemical Bonding', subjects: ['chemistry'] },
  'stoichiometry': { keywords: ['mole', 'molar mass', 'avogadro', 'stoichiometry', 'empirical formula', 'molecular formula', 'limiting reagent', 'percentage yield', 'concentration'], label: '⚖️ Stoichiometry', subjects: ['chemistry'] },
  'atomic_structure': { keywords: ['atom', 'proton', 'neutron', 'electron', 'orbital', 'subshell', 'isotope', 'mass number', 'atomic structure', 'shell'], label: '⚛️ Atomic Structure', subjects: ['chemistry'] },
  'chemical_kinetics': { keywords: ['reaction rate', 'catalyst', 'activation energy', 'collision theory', 'rate constant', 'order of reaction', 'half-life'], label: '⏱️ Chemical Kinetics', subjects: ['chemistry'] },
  'equilibrium': { keywords: ['equilibrium', 'le chatelier', 'reversible', 'forward reaction', 'backward reaction', 'equilibrium constant', 'dynamic equilibrium'], label: '⚖️ Chemical Equilibrium', subjects: ['chemistry'] },
  'electrochemistry': { keywords: ['electrolysis', 'electrode', 'anode', 'cathode', 'electrolyte', 'faraday', 'electroplating', 'galvanic', 'voltaic'], label: '🔋 Electrochemistry', subjects: ['chemistry'] },
  'gas_laws': { keywords: ['gas law', 'boyle', 'charles', 'avogadro', 'ideal gas', 'stp', 'pressure', 'volume', 'kinetic theory'], label: '💨 Gas Laws', subjects: ['chemistry'] },
  'states_matter': { keywords: ['solid', 'liquid', 'gas', 'melting', 'boiling', 'evaporation', 'condensation', 'sublimation', 'phase change'], label: '🧊 States of Matter', subjects: ['chemistry'] },
  'solutions': { keywords: ['solution', 'solute', 'solvent', 'saturated', 'solubility', 'dilute', 'concentrated', 'dissolution', 'suspension', 'colloid'], label: '🥛 Solutions', subjects: ['chemistry'] },
  'metals_extraction': { keywords: ['extraction', 'ore', 'blast furnace', 'smelting', 'refining', 'alloy', 'metallurgy'], label: '⛏️ Metals & Extraction', subjects: ['chemistry'] },
  'environmental_chemistry': { keywords: ['pollution', 'acid rain', 'ozone', 'greenhouse', 'global warming', 'carbon footprint', 'water treatment'], label: '🌍 Environmental Chemistry', subjects: ['chemistry'] },
  
  // ==================== PHYSICS ====================
  'motion': { keywords: ['velocity', 'acceleration', 'momentum', 'newton', 'force', 'kinetic energy', 'projectile', 'speed', 'displacement', 'distance', 'inertia', 'friction'], label: '🏃 Motion & Forces', subjects: ['physics'] },
  'waves': { keywords: ['wave', 'frequency', 'wavelength', 'amplitude', 'sound wave', 'light wave', 'interference', 'diffraction', 'transverse', 'longitudinal', 'period'], label: '🌊 Waves', subjects: ['physics'] },
  'electricity': { keywords: ['electric', 'current', 'voltage', 'resistance', 'ohm', 'circuit', 'capacitor', 'resistor', 'potential difference', 'charge', 'coulomb', 'power'], label: '⚡ Electricity', subjects: ['physics'] },
  'optics': { keywords: ['lens', 'mirror', 'reflection', 'refraction', 'optical', 'prism', 'spectrum', 'focal length', 'convex', 'concave', 'image', 'magnification'], label: '🔍 Optics', subjects: ['physics'] },
  'thermodynamics': { keywords: ['heat', 'temperature', 'thermal', 'entropy', 'enthalpy', 'specific heat', 'conduction', 'convection', 'radiation', 'latent heat'], label: '🌡️ Thermodynamics', subjects: ['physics', 'chemistry'] },
  'magnetism': { keywords: ['magnetic', 'magnet', 'electromagnetic', 'flux', 'induction', 'solenoid', 'magnetic field', 'compass', 'ferromagnetic', 'domain'], label: '🧲 Magnetism', subjects: ['physics'] },
  'nuclear_physics': { keywords: ['radioact', 'nuclear', 'half-life', 'decay', 'alpha', 'beta', 'gamma', 'fission', 'fusion', 'isotope', 'radiation'], label: '☢️ Nuclear Physics', subjects: ['physics'] },
  'work_energy_power': { keywords: ['work', 'energy', 'power', 'joule', 'watt', 'potential energy', 'kinetic energy', 'mechanical advantage', 'efficiency'], label: '💪 Work, Energy & Power', subjects: ['physics'] },
  'simple_machines': { keywords: ['lever', 'pulley', 'inclined plane', 'wedge', 'screw', 'wheel', 'axle', 'machine', 'mechanical advantage'], label: '⚙️ Simple Machines', subjects: ['physics'] },
  'pressure': { keywords: ['pressure', 'pascal', 'atmospheric', 'barometer', 'manometer', 'hydraulic', 'density', 'buoyancy', 'archimedes'], label: '📏 Pressure', subjects: ['physics'] },
  'modern_physics': { keywords: ['quantum', 'photon', 'photoelectric', 'planck', 'einstein', 'relativity', 'wave-particle', 'de broglie'], label: '🔬 Modern Physics', subjects: ['physics'] },
  'circular_motion': { keywords: ['circular motion', 'centripetal', 'centrifugal', 'angular', 'rotational', 'revolution', 'orbit'], label: '🔄 Circular Motion', subjects: ['physics'] },
  'gravitational': { keywords: ['gravity', 'gravitational', 'weight', 'mass', 'free fall', 'acceleration due to gravity', 'satellite', 'orbit'], label: '🌍 Gravitation', subjects: ['physics'] },
  
  // ==================== MATHEMATICS ====================
  'quadratic': { keywords: ['quadratic', 'parabola', 'completing the square', 'discriminant', 'x²', 'roots', 'factorization'], label: '📈 Quadratic Equations', subjects: ['mathematics'] },
  'trigonometry': { keywords: ['sine', 'cosine', 'tangent', 'trig', 'radian', 'sin', 'cos', 'tan', 'pythagoras', 'angle', 'degree', 'hypotenuse', 'opposite', 'adjacent'], label: '📐 Trigonometry', subjects: ['mathematics'] },
  'calculus': { keywords: ['derivative', 'integral', 'differentiat', 'integrat', 'limit', 'dy/dx', 'gradient', 'turning point', 'maximum', 'minimum', 'rate of change'], label: '∫ Calculus', subjects: ['mathematics'] },
  'probability': { keywords: ['probability', 'combination', 'permutation', 'statistics', 'random', 'binomial', 'mean', 'median', 'mode', 'standard deviation', 'variance'], label: '🎲 Probability & Stats', subjects: ['mathematics'] },
  'logarithms': { keywords: ['logarithm', 'log', 'exponential', 'indices', 'ln', 'natural log', 'power', 'exponent'], label: '📊 Logarithms & Indices', subjects: ['mathematics'] },
  'algebra': { keywords: ['simultaneous', 'equation', 'inequality', 'linear equation', 'polynomial', 'expression', 'simplify', 'expand', 'factorize'], label: '🔢 Algebra', subjects: ['mathematics'] },
  'geometry': { keywords: ['triangle', 'circle', 'polygon', 'area', 'perimeter', 'pythagoras', 'congruent', 'similar', 'angle', 'parallel', 'perpendicular'], label: '📏 Geometry', subjects: ['mathematics'] },
  'matrices': { keywords: ['matrix', 'matrices', 'determinant', 'inverse matrix', 'transpose', 'singular', 'identity matrix'], label: '🔲 Matrices', subjects: ['mathematics'] },
  'coordinate_geometry': { keywords: ['coordinate', 'gradient', 'slope', 'midpoint', 'distance formula', 'equation of line', 'intercept', 'x-axis', 'y-axis'], label: '📊 Coordinate Geometry', subjects: ['mathematics'] },
  'sequences_series': { keywords: ['sequence', 'series', 'arithmetic', 'geometric', 'progression', 'nth term', 'sum to n', 'common difference', 'common ratio'], label: '🔢 Sequences & Series', subjects: ['mathematics'] },
  'sets_logic': { keywords: ['set', 'union', 'intersection', 'complement', 'venn diagram', 'subset', 'universal set', 'element'], label: '🔁 Sets & Logic', subjects: ['mathematics'] },
  'surds': { keywords: ['surd', 'radical', 'square root', 'cube root', 'rationalize', 'irrational'], label: '√ Surds', subjects: ['mathematics'] },
  'number_bases': { keywords: ['binary', 'base 2', 'base 10', 'denary', 'octal', 'hexadecimal', 'number base', 'conversion'], label: '🔢 Number Bases', subjects: ['mathematics'] },
  'modular_arithmetic': { keywords: ['modular', 'mod', 'remainder', 'modulo', 'clock arithmetic'], label: '🔄 Modular Arithmetic', subjects: ['mathematics'] },
  'vectors_math': { keywords: ['vector', 'scalar', 'magnitude', 'direction', 'position vector', 'unit vector', 'dot product'], label: '➡️ Vectors', subjects: ['mathematics'] },
  'circle_theorem': { keywords: ['chord', 'tangent', 'secant', 'arc', 'sector', 'segment', 'cyclic quadrilateral', 'circle theorem'], label: '⭕ Circle Theorems', subjects: ['mathematics'] },
  
  // ==================== ENGLISH ====================
  'tenses': { keywords: ['tense', 'past tense', 'present tense', 'future tense', 'perfect tense', 'continuous', 'simple past', 'present perfect', 'past perfect'], label: '⏰ Tenses', subjects: ['english'] },
  'comprehension': { keywords: ['passage', 'comprehension', 'according to the passage', 'the author', 'the writer', 'extract', 'text'], label: '📖 Comprehension', subjects: ['english'] },
  'vocabulary': { keywords: ['synonym', 'antonym', 'meaning of', 'closest in meaning', 'opposite', 'word meaning'], label: '📝 Vocabulary', subjects: ['english'] },
  'grammar': { keywords: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'pronoun', 'clause', 'phrase', 'subject', 'object', 'predicate'], label: '✍️ Grammar', subjects: ['english'] },
  'sentence_structure': { keywords: ['sentence', 'punctuation', 'comma', 'colon', 'semicolon', 'full stop', 'question mark', 'exclamation'], label: '📝 Sentence Structure', subjects: ['english'] },
  'concord': { keywords: ['concord', 'agreement', 'subject-verb', 'singular', 'plural'], label: '🤝 Concord/Agreement', subjects: ['english'] },
  'idioms_expressions': { keywords: ['idiom', 'expression', 'proverb', 'saying', 'figure of speech', 'phrasal verb'], label: '💬 Idioms & Expressions', subjects: ['english'] },
  'speech_types': { keywords: ['direct speech', 'indirect speech', 'reported speech', 'active voice', 'passive voice'], label: '🗣️ Speech Types', subjects: ['english'] },
  'word_formation': { keywords: ['prefix', 'suffix', 'root word', 'word formation', 'derivative'], label: '🔤 Word Formation', subjects: ['english'] },
  'stress_intonation': { keywords: ['stress', 'intonation', 'syllable', 'pronunciation', 'emphatic', 'primary stress', 'secondary stress'], label: '🎵 Stress & Intonation', subjects: ['english'] },
  'lexis_structure': { keywords: ['lexis', 'structure', 'appropriate word', 'fill in', 'complete the sentence'], label: '📋 Lexis & Structure', subjects: ['english'] },
  'register': { keywords: ['formal', 'informal', 'register', 'colloquial', 'slang', 'jargon', 'technical'], label: '📑 Register', subjects: ['english'] },
  
  // ==================== LITERATURE ====================
  'literary_devices': { keywords: ['metaphor', 'simile', 'personification', 'irony', 'symbolism', 'imagery', 'alliteration', 'onomatopoeia', 'hyperbole', 'oxymoron', 'paradox'], label: '🎭 Literary Devices', subjects: ['literature'] },
  'prose_fiction': { keywords: ['novel', 'prose', 'fiction', 'narrative', 'protagonist', 'antagonist', 'plot', 'setting', 'theme', 'conflict', 'resolution', 'flashback'], label: '📖 Prose & Fiction', subjects: ['literature'] },
  'poetry': { keywords: ['poem', 'poet', 'stanza', 'verse', 'rhyme', 'sonnet', 'ballad', 'ode', 'elegy', 'lyric', 'epic', 'free verse', 'rhythm', 'meter'], label: '📜 Poetry', subjects: ['literature'] },
  'drama': { keywords: ['play', 'drama', 'tragedy', 'comedy', 'stage', 'act', 'scene', 'dialogue', 'monologue', 'soliloquy', 'dramatic irony', 'playwright'], label: '🎬 Drama', subjects: ['literature'] },
  'literary_movements': { keywords: ['realism', 'romanticism', 'gothic', 'magic realism', 'modernism', 'post-colonial', 'naturalism', 'classicism'], label: '📚 Literary Movements', subjects: ['literature'] },
  'african_literature': { keywords: ['african', 'nigeria', 'achebe', 'soyinka', 'colonial', 'post-colonial', 'negritude', 'oral tradition'], label: '🌍 African Literature', subjects: ['literature'] },
  'character_analysis': { keywords: ['character', 'characterization', 'trait', 'motivation', 'development', 'flat character', 'round character'], label: '👤 Character Analysis', subjects: ['literature'] },
  'narrative_techniques': { keywords: ['narrator', 'point of view', 'first person', 'third person', 'omniscient', 'stream of consciousness'], label: '📝 Narrative Techniques', subjects: ['literature'] },
  'themes_motifs': { keywords: ['theme', 'motif', 'subject matter', 'central idea', 'moral', 'message'], label: '💡 Themes & Motifs', subjects: ['literature'] },
  
  // ==================== ECONOMICS ====================
  'demand_supply': { keywords: ['demand', 'supply', 'equilibrium', 'market price', 'elasticity', 'demand curve', 'supply curve', 'shortage', 'surplus'], label: '📉 Demand & Supply', subjects: ['economics'] },
  'inflation': { keywords: ['inflation', 'deflation', 'money supply', 'monetary policy', 'price level', 'cost-push', 'demand-pull', 'hyperinflation'], label: '💰 Inflation', subjects: ['economics'] },
  'national_income': { keywords: ['gdp', 'gnp', 'national income', 'gross domestic', 'per capita', 'nnp', 'national product'], label: '🏦 National Income', subjects: ['economics'] },
  'banking': { keywords: ['bank', 'central bank', 'commercial bank', 'interest rate', 'credit', 'deposit', 'loan', 'reserve', 'money creation'], label: '🏛️ Banking', subjects: ['economics', 'commerce'] },
  'trade': { keywords: ['export', 'import', 'trade', 'balance of payment', 'tariff', 'quota', 'protectionism', 'free trade', 'comparative advantage'], label: '🌐 International Trade', subjects: ['economics', 'commerce'] },
  'fiscal_policy': { keywords: ['fiscal', 'taxation', 'government spending', 'budget', 'deficit', 'surplus', 'revenue'], label: '📊 Fiscal Policy', subjects: ['economics'] },
  'market_structures': { keywords: ['monopoly', 'oligopoly', 'perfect competition', 'monopolistic', 'market structure', 'price maker', 'price taker'], label: '🏪 Market Structures', subjects: ['economics'] },
  'factors_production': { keywords: ['factor of production', 'land', 'labour', 'capital', 'entrepreneur', 'rent', 'wages', 'interest', 'profit'], label: '🏭 Factors of Production', subjects: ['economics'] },
  'public_finance': { keywords: ['public finance', 'government revenue', 'public expenditure', 'public debt', 'budget'], label: '🏛️ Public Finance', subjects: ['economics'] },
  'economic_systems': { keywords: ['capitalism', 'socialism', 'mixed economy', 'economic system', 'planned economy', 'market economy'], label: '🌐 Economic Systems', subjects: ['economics'] },
  'unemployment': { keywords: ['unemployment', 'employment', 'jobless', 'labour force', 'underemployment', 'frictional', 'structural', 'cyclical'], label: '👷 Employment', subjects: ['economics'] },
  'economic_development': { keywords: ['development', 'developing country', 'developed', 'economic growth', 'standard of living', 'human development'], label: '📈 Economic Development', subjects: ['economics'] },
  
  // ==================== GOVERNMENT ====================
  'democracy': { keywords: ['democracy', 'election', 'vote', 'parliament', 'legislature', 'franchise', 'suffrage', 'democratic', 'representative'], label: '🗳️ Democracy', subjects: ['government'] },
  'federalism': { keywords: ['federal', 'federation', 'unitary', 'confederal', 'devolution', 'decentralization', 'state government', 'local government'], label: '🏛️ Federalism', subjects: ['government'] },
  'constitution': { keywords: ['constitution', 'bill of rights', 'amendment', 'fundamental rights', 'constitutional', 'rigid', 'flexible', 'written'], label: '📜 Constitution', subjects: ['government'] },
  'political_parties': { keywords: ['political party', 'opposition', 'ruling party', 'multi-party', 'one-party', 'two-party', 'party system'], label: '🎪 Political Parties', subjects: ['government'] },
  'separation_of_powers': { keywords: ['executive', 'judiciary', 'legislature', 'separation of power', 'checks and balances', 'arm of government'], label: '⚖️ Separation of Powers', subjects: ['government'] },
  'nigerian_politics': { keywords: ['nigeria', 'nigerian', 'independence', 'military rule', 'civilian', 'republic', 'coup'], label: '🇳🇬 Nigerian Politics', subjects: ['government'] },
  'public_administration': { keywords: ['civil service', 'bureaucracy', 'public service', 'administration', 'minister', 'permanent secretary'], label: '🏢 Public Administration', subjects: ['government'] },
  'international_relations': { keywords: ['international', 'united nations', 'african union', 'ecowas', 'foreign policy', 'diplomacy', 'treaty'], label: '🌍 International Relations', subjects: ['government'] },
  'pressure_groups': { keywords: ['pressure group', 'interest group', 'lobby', 'civil society', 'ngo', 'trade union'], label: '📢 Pressure Groups', subjects: ['government'] },
  'citizenship': { keywords: ['citizenship', 'citizen', 'naturalization', 'birth', 'nationality', 'rights', 'duties'], label: '🪪 Citizenship', subjects: ['government'] },
  'electoral_system': { keywords: ['electoral', 'voting system', 'first past the post', 'proportional', 'gerrymandering', 'constituency', 'ballot'], label: '🗳️ Electoral System', subjects: ['government'] },
  'rule_of_law': { keywords: ['rule of law', 'supremacy of law', 'equality before law', 'human rights', 'fundamental human rights'], label: '⚖️ Rule of Law', subjects: ['government'] },
  
  // ==================== ACCOUNTING ====================
  'bookkeeping': { keywords: ['ledger', 'journal', 'debit', 'credit', 'trial balance', 'double entry', 'posting', 'folio', 'daybook'], label: '📒 Bookkeeping', subjects: ['accounting'] },
  'financial_statements': { keywords: ['balance sheet', 'income statement', 'profit and loss', 'cash flow', 'statement of financial position', 'trading account'], label: '📊 Financial Statements', subjects: ['accounting'] },
  'depreciation': { keywords: ['depreciation', 'straight line', 'reducing balance', 'asset', 'provision', 'accumulated depreciation', 'disposal'], label: '📉 Depreciation', subjects: ['accounting'] },
  'bank_reconciliation': { keywords: ['bank reconciliation', 'bank statement', 'unpresented cheque', 'uncredited deposit', 'overdraft'], label: '🏦 Bank Reconciliation', subjects: ['accounting'] },
  'control_accounts': { keywords: ['control account', 'sales ledger', 'purchases ledger', 'receivables', 'payables', 'suspense'], label: '📋 Control Accounts', subjects: ['accounting'] },
  'partnership': { keywords: ['partnership', 'partner', 'appropriation', 'capital account', 'current account', 'goodwill', 'profit sharing'], label: '🤝 Partnership Accounts', subjects: ['accounting'] },
  'company_accounts': { keywords: ['share', 'shareholder', 'dividend', 'debenture', 'share capital', 'reserve', 'retained earnings'], label: '🏢 Company Accounts', subjects: ['accounting'] },
  'manufacturing': { keywords: ['manufacturing', 'cost of production', 'prime cost', 'factory overhead', 'work in progress', 'finished goods'], label: '🏭 Manufacturing Accounts', subjects: ['accounting'] },
  'ratio_analysis': { keywords: ['ratio', 'liquidity', 'profitability', 'current ratio', 'acid test', 'gross profit margin', 'return on capital'], label: '📊 Ratio Analysis', subjects: ['accounting'] },
  'errors_correction': { keywords: ['error', 'correction', 'suspense account', 'error of omission', 'error of commission', 'compensating error'], label: '🔧 Errors & Correction', subjects: ['accounting'] },
  'incomplete_records': { keywords: ['incomplete record', 'single entry', 'statement of affairs', 'opening capital', 'closing capital'], label: '📝 Incomplete Records', subjects: ['accounting'] },
  'non_profit': { keywords: ['non-profit', 'club', 'society', 'receipts and payments', 'income and expenditure', 'accumulated fund', 'subscription'], label: '🎗️ Non-Profit Accounts', subjects: ['accounting'] },
  
  // ==================== COMMERCE ====================
  'business_types': { keywords: ['sole proprietor', 'partnership', 'company', 'corporation', 'cooperative', 'joint venture', 'franchise'], label: '🏢 Business Types', subjects: ['commerce'] },
  'insurance': { keywords: ['insurance', 'premium', 'policy', 'indemnity', 'insurable interest', 'subrogation', 'underwriting', 'claim'], label: '🛡️ Insurance', subjects: ['commerce'] },
  'marketing': { keywords: ['marketing', 'advertising', 'promotion', 'distribution', 'consumer', 'market research', 'branding', 'packaging'], label: '📢 Marketing', subjects: ['commerce'] },
  'transportation': { keywords: ['transport', 'road', 'rail', 'sea', 'air', 'pipeline', 'shipping', 'freight', 'cargo'], label: '🚚 Transportation', subjects: ['commerce'] },
  'communication': { keywords: ['communication', 'telecommunication', 'postal', 'courier', 'internet', 'telephone', 'fax'], label: '📱 Communication', subjects: ['commerce'] },
  'warehousing': { keywords: ['warehouse', 'storage', 'bonded warehouse', 'inventory', 'stock', 'distribution center'], label: '🏭 Warehousing', subjects: ['commerce'] },
  'banking_commerce': { keywords: ['bank', 'commercial bank', 'merchant bank', 'savings bank', 'cheque', 'draft', 'letter of credit'], label: '🏦 Banking', subjects: ['commerce'] },
  'stock_exchange': { keywords: ['stock exchange', 'share', 'stock', 'securities', 'broker', 'bull', 'bear', 'dividend'], label: '📈 Stock Exchange', subjects: ['commerce'] },
  'trade_associations': { keywords: ['chamber of commerce', 'trade association', 'manufacturers association', 'employers association'], label: '🤝 Trade Associations', subjects: ['commerce'] },
  'consumer_protection': { keywords: ['consumer protection', 'consumer rights', 'nafdac', 'son', 'quality control', 'warranty'], label: '🛡️ Consumer Protection', subjects: ['commerce'] },
  'foreign_trade': { keywords: ['import', 'export', 'customs', 'tariff', 'quota', 'balance of trade', 'visible trade', 'invisible trade'], label: '🌍 Foreign Trade', subjects: ['commerce'] },
  'retail_wholesale': { keywords: ['retailer', 'wholesaler', 'chain store', 'supermarket', 'department store', 'mall', 'e-commerce'], label: '🏪 Retail & Wholesale', subjects: ['commerce'] },
  
  // ==================== GEOGRAPHY ====================
  'climate': { keywords: ['climate', 'weather', 'rainfall', 'temperature', 'humidity', 'wind', 'season', 'tropical', 'temperate', 'equatorial'], label: '🌤️ Climate & Weather', subjects: ['geography'] },
  'population': { keywords: ['population', 'census', 'migration', 'birth rate', 'death rate', 'density', 'distribution', 'urbanization', 'rural'], label: '👥 Population', subjects: ['geography'] },
  'landforms': { keywords: ['mountain', 'plateau', 'valley', 'plain', 'erosion', 'deposition', 'volcanic', 'fold mountain', 'rift valley'], label: '⛰️ Landforms', subjects: ['geography'] },
  'map_reading': { keywords: ['map', 'scale', 'contour', 'longitude', 'latitude', 'bearing', 'grid reference', 'legend', 'compass'], label: '🗺️ Map Reading', subjects: ['geography'] },
  'agriculture_geo': { keywords: ['agriculture', 'farming', 'crop', 'livestock', 'plantation', 'irrigation', 'subsistence', 'commercial farming'], label: '🌾 Agriculture', subjects: ['geography'] },
  'industries': { keywords: ['industry', 'manufacturing', 'industrial location', 'raw material', 'factory', 'processing'], label: '🏭 Industries', subjects: ['geography'] },
  'water_resources': { keywords: ['river', 'lake', 'ocean', 'water', 'drainage', 'basin', 'tributary', 'waterfall', 'delta', 'estuary'], label: '💧 Water Resources', subjects: ['geography'] },
  'rocks_minerals': { keywords: ['rock', 'mineral', 'igneous', 'sedimentary', 'metamorphic', 'ore', 'mining', 'quarrying'], label: '🪨 Rocks & Minerals', subjects: ['geography'] },
  'vegetation': { keywords: ['vegetation', 'forest', 'savanna', 'rainforest', 'desert', 'mangrove', 'grassland'], label: '🌳 Vegetation', subjects: ['geography'] },
  'transport_geography': { keywords: ['road network', 'railway', 'airport', 'seaport', 'transportation', 'route'], label: '🚂 Transport', subjects: ['geography'] },
  'environmental_issues': { keywords: ['pollution', 'deforestation', 'desertification', 'erosion', 'conservation', 'global warming', 'climate change'], label: '🌍 Environmental Issues', subjects: ['geography'] },
  'settlement': { keywords: ['settlement', 'urban', 'rural', 'village', 'town', 'city', 'site', 'situation'], label: '🏘️ Settlement', subjects: ['geography'] },
  'nigerian_geography': { keywords: ['nigeria', 'niger', 'benue', 'lagos', 'kano', 'jos plateau', 'chad basin'], label: '🇳🇬 Nigerian Geography', subjects: ['geography'] },
  
  // ==================== CRS ====================
  'old_testament': { keywords: ['moses', 'abraham', 'david', 'solomon', 'exodus', 'genesis', 'prophet', 'isaac', 'jacob', 'joseph', 'samuel', 'elijah'], label: '📖 Old Testament', subjects: ['crs'] },
  'new_testament': { keywords: ['jesus', 'apostle', 'gospel', 'paul', 'peter', 'resurrection', 'crucifixion', 'miracle', 'parable', 'disciple'], label: '✝️ New Testament', subjects: ['crs'] },
  'christian_living': { keywords: ['faith', 'prayer', 'worship', 'salvation', 'grace', 'sin', 'repentance', 'forgiveness', 'love', 'charity'], label: '🙏 Christian Living', subjects: ['crs'] },
  'creation': { keywords: ['creation', 'garden of eden', 'adam', 'eve', 'fall of man', 'original sin', 'genesis'], label: '🌍 Creation', subjects: ['crs'] },
  'covenant': { keywords: ['covenant', 'promise', 'abrahamic', 'mosaic', 'davidic', 'new covenant', 'testament'], label: '📜 Covenant', subjects: ['crs'] },
  'ten_commandments': { keywords: ['commandment', 'decalogue', 'law of moses', 'thou shalt', 'sinai'], label: '📋 Ten Commandments', subjects: ['crs'] },
  'church_history': { keywords: ['church', 'early church', 'pentecost', 'persecution', 'reformation', 'denomination'], label: '⛪ Church History', subjects: ['crs'] },
  'kings_judges': { keywords: ['king', 'judge', 'saul', 'david', 'solomon', 'rehoboam', 'jeroboam', 'divided kingdom'], label: '👑 Kings & Judges', subjects: ['crs'] },
  'prophets': { keywords: ['prophet', 'isaiah', 'jeremiah', 'ezekiel', 'daniel', 'hosea', 'amos', 'minor prophet', 'major prophet'], label: '📢 Prophets', subjects: ['crs'] },
  
  // ==================== IRS ====================
  'quran': { keywords: ['quran', 'surah', 'verse', 'ayah', 'revelation', 'juz', 'recitation', 'tafsir'], label: '📖 Quran', subjects: ['irs'] },
  'hadith': { keywords: ['hadith', 'sunnah', 'prophet muhammad', 'bukhari', 'muslim', 'sahih', 'isnad'], label: '📜 Hadith', subjects: ['irs'] },
  'islamic_practices': { keywords: ['salat', 'zakat', 'hajj', 'fasting', 'ramadan', 'pillar', 'shahadah', 'sawm'], label: '🕌 Islamic Practices', subjects: ['irs'] },
  'tawhid': { keywords: ['tawhid', 'monotheism', 'allah', 'shirk', 'oneness', 'unity of god'], label: '☪️ Tawhid', subjects: ['irs'] },
  'seerah': { keywords: ['seerah', 'prophet muhammad', 'makkah', 'madinah', 'hijrah', 'biography', 'companions'], label: '📚 Seerah', subjects: ['irs'] },
  'aqeedah': { keywords: ['aqeedah', 'faith', 'iman', 'belief', 'articles of faith', 'angel', 'qadr'], label: '💫 Aqeedah', subjects: ['irs'] },
  'fiqh': { keywords: ['fiqh', 'jurisprudence', 'halal', 'haram', 'wudu', 'ghusl', 'tahara', 'purity'], label: '⚖️ Fiqh', subjects: ['irs'] },
  'islamic_history': { keywords: ['caliphate', 'caliph', 'umayyad', 'abbasid', 'ottoman', 'islamic civilization', 'khulafa'], label: '🏛️ Islamic History', subjects: ['irs'] },
  'akhlaq': { keywords: ['akhlaq', 'morals', 'ethics', 'character', 'adab', 'manners', 'honesty', 'patience'], label: '💎 Akhlaq (Morals)', subjects: ['irs'] },
  
  // ==================== AGRICULTURAL SCIENCE ====================
  'crop_production': { keywords: ['crop', 'planting', 'harvest', 'irrigation', 'fertilizer', 'soil', 'cultivation', 'seed', 'seedling', 'nursery'], label: '🌾 Crop Production', subjects: ['agricultural_science'] },
  'animal_husbandry': { keywords: ['livestock', 'cattle', 'poultry', 'breeding', 'feed', 'goat', 'sheep', 'pig', 'rabbit', 'rearing'], label: '🐄 Animal Husbandry', subjects: ['agricultural_science'] },
  'farm_management': { keywords: ['farm', 'agriculture', 'farming system', 'mechanization', 'farm record', 'farm account', 'agribusiness'], label: '🚜 Farm Management', subjects: ['agricultural_science'] },
  'soil_science': { keywords: ['soil', 'soil profile', 'soil texture', 'soil structure', 'soil fertility', 'humus', 'loam', 'clay', 'sand'], label: '🌱 Soil Science', subjects: ['agricultural_science'] },
  'pest_diseases': { keywords: ['pest', 'disease', 'weed', 'insect', 'fungus', 'bacteria', 'virus', 'control', 'pesticide', 'herbicide'], label: '🐛 Pests & Diseases', subjects: ['agricultural_science'] },
  'agricultural_tools': { keywords: ['hoe', 'cutlass', 'tractor', 'plough', 'harrow', 'implement', 'machinery', 'tool'], label: '🔧 Agricultural Tools', subjects: ['agricultural_science'] },
  'forestry': { keywords: ['forestry', 'tree', 'timber', 'afforestation', 'deforestation', 'conservation', 'wildlife'], label: '🌲 Forestry', subjects: ['agricultural_science'] },
  'fishery': { keywords: ['fish', 'fishing', 'aquaculture', 'pond', 'fingerling', 'hatchery', 'feed', 'stocking'], label: '🐟 Fishery', subjects: ['agricultural_science'] },
  'agricultural_economics': { keywords: ['agricultural economics', 'market', 'price', 'cooperative', 'credit', 'subsidy'], label: '💰 Agricultural Economics', subjects: ['agricultural_science'] },
  'food_processing': { keywords: ['processing', 'preservation', 'storage', 'drying', 'smoking', 'canning', 'refrigeration'], label: '🍲 Food Processing', subjects: ['agricultural_science'] },
  'genetics_breeding': { keywords: ['breeding', 'hybrid', 'selection', 'genetics', 'crossbreeding', 'pure breed', 'inheritance'], label: '🧬 Genetics & Breeding', subjects: ['agricultural_science'] },
};

function identifyTopics(question: Question): string[] {
  // Include explanation for better matching context
  const text = `${question.question} ${question.option_a} ${question.option_b} ${question.option_c} ${question.option_d} ${question.explanation || ''}`.toLowerCase();
  const matchedTopics: { key: string; score: number }[] = [];
  
  for (const [topicKey, { keywords, subjects }] of Object.entries(TOPIC_PATTERNS)) {
    // Only match if the topic applies to this subject
    if (!subjects.includes(question.subject)) continue;
    
    // Count how many keywords match for better scoring
    let matchCount = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matchCount++;
      }
    }
    
    if (matchCount > 0) {
      matchedTopics.push({ key: topicKey, score: matchCount });
    }
  }
  
  // Sort by match score (most relevant first), take top 2
  if (matchedTopics.length > 0) {
    matchedTopics.sort((a, b) => b.score - a.score);
    return matchedTopics.slice(0, 2).map(t => t.key);
  }
  
  // If no topic matched, categorize by subject
  return [`${question.subject}_general`];
}

function getFrequencyLevel(count: number): 'very_high' | 'high' | 'medium' {
  if (count >= 15) return 'very_high';
  if (count >= 8) return 'high';
  return 'medium';
}

const FREQUENCY_CONFIG = {
  very_high: { label: 'Very High Yield', color: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30', icon: Flame },
  high: { label: 'High Yield', color: 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30', icon: TrendingUp },
  medium: { label: 'Medium Yield', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30', icon: Target },
};

// Topic Quiz Component
interface TopicQuizProps {
  questions: Question[];
  topicLabel: string;
  subject: string;
  onExit: () => void;
}

const TopicQuiz = ({ questions, topicLabel, subject, onExit }: TopicQuizProps) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [shuffledQuestions] = useState(() => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffleQuestionList(shuffled.slice(0, Math.min(20, shuffled.length))); // Max 20, options randomised
  });
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const currentQuestion = shuffledQuestions[currentIndex];
  const progress = ((currentIndex + 1) / shuffledQuestions.length) * 100;

  // AI explanation hook
  const {
    explanation: aiExplanation,
    isLoading: isAiLoading,
    error: aiError,
    getExplanation: fetchAiExplanation,
    cancel: cancelAi,
  } = useAiExplanation();

  // Reset AI explanation when moving to a new question
  useEffect(() => {
    cancelAi();
  }, [currentQuestion, cancelAi]);
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    setShowFeedback(currentQuestion.correct_answer);
    
    setTimeout(() => {
      setShowFeedback(null);
      if (currentIndex < shuffledQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 1500);
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    shuffledQuestions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correctCount++;
    });

    // Save quiz attempt
    if (user?.email) {
      try {
        await supabase.from('quiz_attempts').insert({
          email: user.email,
          quiz_type: 'topic-practice',
          subjects: [subject] as Database['public']['Enums']['jamb_subject'][],
          total_questions: shuffledQuestions.length,
          correct_answers: correctCount,
          time_taken_seconds: 0,
          questions_data: shuffledQuestions.map(q => ({
            ...q,
            userAnswer: answers[q.id] || ''
          }))
        });
      } catch (err) {
        errorLogger.error(err, { component: 'HighYieldQuestions', action: 'save quiz' });
      }
    }

    setShowResult(true);
  };

  if (showResult) {
    const correctCount = shuffledQuestions.filter(q => answers[q.id] === q.correct_answer).length;
    const percentage = Math.round((correctCount / shuffledQuestions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4"
      >
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              percentage >= 70 ? 'bg-green-500/20' : percentage >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'
            }`}>
              {percentage >= 70 ? (
                <CheckCircle className="h-10 w-10 text-green-500" />
              ) : (
                <Target className="h-10 w-10 text-yellow-500" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">{percentage}% Score</h2>
            <p className="text-muted-foreground mb-4">
              You got {correctCount} out of {shuffledQuestions.length} questions correct on {topicLabel}
            </p>
            <div className="space-y-2">
              <Button onClick={onExit} className="w-full">
                Back to Topics
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={onExit}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit
          </Button>
          <Badge variant="secondary">{currentIndex + 1}/{shuffledQuestions.length}</Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          {topicLabel} • {SUBJECT_LABELS[subject] || subject}
        </p>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-4">
                  {currentQuestion.year && (
                    <Badge variant="outline" className="shrink-0">{currentQuestion.year}</Badge>
                  )}
                  <div className="flex-1">
                    <p className="text-base font-medium">{currentQuestion.question}</p>
                    {currentQuestion.image_url && (
                      <div className="mt-3 flex justify-center">
                        <img src={currentQuestion.image_url} alt="Question diagram" className="max-w-full h-auto rounded-lg border border-border" style={{ maxHeight: 250 }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optionKey = `option_${opt.toLowerCase()}` as keyof Question;
                    const isSelected = answers[currentQuestion.id] === opt;
                    const isCorrect = showFeedback === opt;
                    const isWrong = showFeedback && isSelected && !isCorrect;

                    return (
                      <button
                        key={opt}
                        onClick={() => !showFeedback && !answers[currentQuestion.id] && handleAnswer(opt)}
                        disabled={!!showFeedback || !!answers[currentQuestion.id]}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          isCorrect
                            ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-400'
                            : isWrong
                            ? 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-400'
                            : isSelected
                            ? 'bg-primary/10 border-primary'
                            : 'bg-muted/50 border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="font-semibold mr-2">{opt}.</span>
                        {currentQuestion[optionKey] as string}
                      </button>
                    );
                  })}
                </div>

                {showFeedback && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-primary/10 rounded-lg flex items-start gap-2"
                  >
                    <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">{currentQuestion.explanation}</p>
                  </motion.div>
                )}
                {/* AI Explanation Section */}
                <div className="border-t border-primary/20 pt-3 mt-4">
                  {aiExplanation ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-primary flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                        AI Detailed Explanation
                      </p>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                        <ReactMarkdown>{aiExplanation}</ReactMarkdown>
                      </div>
                    </div>
                  ) : aiError ? (
                    <div className="text-destructive text-xs py-1">
                      Failed to load AI explanation. {aiError}
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() =>
                          fetchAiExplanation({
                            question: currentQuestion.question,
                            option_a: currentQuestion.option_a,
                            option_b: currentQuestion.option_b,
                            option_c: currentQuestion.option_c,
                            option_d: currentQuestion.option_d,
                            correct_answer: currentQuestion.correct_answer,
                            subject: currentQuestion.subject,
                          })
                        }
                        className="text-primary text-xs h-auto p-0 ml-2 animate-pulse"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs bg-transparent border-primary/30 hover:bg-primary/10 text-primary dark:text-primary-foreground gap-1.5"
                      disabled={isAiLoading}
                      onClick={() =>
                        fetchAiExplanation({
                          question: currentQuestion.question,
                          option_a: currentQuestion.option_a,
                          option_b: currentQuestion.option_b,
                          option_c: currentQuestion.option_c,
                          option_d: currentQuestion.option_d,
                          correct_answer: currentQuestion.correct_answer,
                          subject: currentQuestion.subject,
                        })
                      }
                    >
                      {isAiLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Generating AI Explanation...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                          Explain with AI
                        </>
                      )}
                    </Button>
                  )}
                </div>              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex-1"
          >
            Previous
          </Button>
          {currentIndex === shuffledQuestions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < shuffledQuestions.length}
              className="flex-1"
            >
              Submit ({answeredCount}/{shuffledQuestions.length})
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex(prev => prev + 1)}
              disabled={!answers[currentQuestion.id]}
              className="flex-1"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const HighYieldQuestions = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [activeQuiz, setActiveQuiz] = useState<{
    questions: Question[];
    topicLabel: string;
    subject: string;
  } | null>(null);

  const { data: questions, isLoading, error } = useQuery({
    queryKey: ['high-yield-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jamb_questions')
        .select('*')
        .order('year', { ascending: false });
      
      if (error) throw error;
      return data as Question[];
    }
  });

  const startTopicQuiz = useCallback((group: TopicGroup, subject: string) => {
    const topicLabel = TOPIC_PATTERNS[group.topic]?.label || group.topic.replace('_', ' ');
    if (group.questions.length < 3) {
      toast.error('Not enough questions for this topic');
      return;
    }
    setActiveQuiz({
      questions: group.questions,
      topicLabel,
      subject
    });
  }, []);


  // Group questions by topic
  const topicGroups = useMemo(() => {
    if (!questions) return new Map<string, Map<string, TopicGroup>>();
    
    // Filter by subject if selected
    const filtered = selectedSubject === 'all' 
      ? questions 
      : questions.filter(q => q.subject === selectedSubject);
    
    // Group by subject, then by topic
    const groups = new Map<string, Map<string, TopicGroup>>();
    
    for (const question of filtered) {
      const topics = identifyTopics(question);
      const subjectKey = question.subject;
      
      if (!groups.has(subjectKey)) {
        groups.set(subjectKey, new Map());
      }
      
      const subjectGroups = groups.get(subjectKey)!;
      
      for (const topic of topics) {
        if (!subjectGroups.has(topic)) {
          subjectGroups.set(topic, {
            topic,
            questions: [],
            years: new Set(),
            frequency: 'medium'
          });
        }
        
        const group = subjectGroups.get(topic)!;
        group.questions.push(question);
        if (question.year) group.years.add(question.year);
        group.frequency = getFrequencyLevel(group.questions.length);
      }
    }
    
    // Sort topics by frequency within each subject
    for (const [subject, subjectGroups] of groups) {
      const sorted = new Map([...subjectGroups.entries()].sort((a, b) => 
        b[1].questions.length - a[1].questions.length
      ));
      groups.set(subject, sorted);
    }
    
    return groups;
  }, [questions, selectedSubject]);

  // Filter by frequency
  const filteredGroups = useMemo(() => {
    const result = new Map<string, TopicGroup[]>();
    
    for (const [subject, subjectGroups] of topicGroups) {
      const filtered = [...subjectGroups.values()].filter(group => {
        if (selectedFrequency === 'all') return group.questions.length >= 5; // Minimum threshold
        return group.frequency === selectedFrequency;
      });
      
      if (filtered.length > 0) {
        result.set(subject, filtered);
      }
    }
    
    return result;
  }, [topicGroups, selectedFrequency]);

  // Stats
  const stats = useMemo(() => {
    let totalTopics = 0;
    let totalQuestions = 0;
    const frequencyCounts = { very_high: 0, high: 0, medium: 0 };
    
    for (const groups of filteredGroups.values()) {
      for (const group of groups) {
        totalTopics++;
        totalQuestions += group.questions.length;
        frequencyCounts[group.frequency]++;
      }
    }
    
    return { totalTopics, totalQuestions, frequencyCounts };
  }, [filteredGroups]);

  // Show quiz if active - MUST be after all hooks
  if (activeQuiz) {
    return (
      <TopicQuiz
        questions={activeQuiz.questions}
        topicLabel={activeQuiz.topicLabel}
        subject={activeQuiz.subject}
        onExit={() => setActiveQuiz(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-4 border-destructive">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-destructive">Failed to load questions. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" />
          High-Yield Topics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Topics JAMB loves to test repeatedly
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Frequency</label>
              <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All frequencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  <SelectItem value="very_high">🔥 Very High Yield</SelectItem>
                  <SelectItem value="high">📈 High Yield</SelectItem>
                  <SelectItem value="medium">🎯 Medium Yield</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalTopics}</div>
            <div className="text-xs text-muted-foreground">Topics Found</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.frequencyCounts.very_high}</div>
            <div className="text-xs text-muted-foreground">Very High Yield</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalQuestions}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </CardContent>
        </Card>
      </div>

      {/* Topics by Subject */}
      {filteredGroups.size === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No high-yield topics found with current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {[...filteredGroups.entries()].map(([subject, topics]) => (
            <AccordionItem key={subject} value={subject} className="border rounded-lg bg-card overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">{SUBJECT_LABELS[subject] || subject}</span>
                  <Badge variant="secondary" className="text-xs">
                    {topics.length} topics
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {topics.map((group) => {
                    const config = FREQUENCY_CONFIG[group.frequency];
                    const Icon = config.icon;
                    const topicLabel = TOPIC_PATTERNS[group.topic]?.label || group.topic.replace('_', ' ');
                    
                    return (
                      <Accordion key={group.topic} type="single" collapsible>
                        <AccordionItem value={group.topic} className="border rounded-lg overflow-hidden">
                          <AccordionTrigger className="px-3 py-2 hover:no-underline bg-muted/30">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span className="font-medium text-sm">{topicLabel}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${config.color}`}>
                                  {group.questions.length} Qs
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {group.years.size} years
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-3">
                            {/* Practice Button */}
                            <Button
                              size="sm"
                              className="w-full mb-3 gap-2"
                              onClick={() => startTopicQuiz(group, subject)}
                            >
                              <Play className="h-4 w-4" />
                              Practice {group.questions.length} Questions
                            </Button>

                            <div className="text-xs text-muted-foreground mb-3">
                              Appeared in: {[...group.years].sort((a, b) => b - a).slice(0, 10).join(', ')}
                              {group.years.size > 10 && ` +${group.years.size - 10} more`}
                            </div>
                            <div className="space-y-3">
                              {group.questions.slice(0, 3).map((q) => (
                                <div key={q.id} className="p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-start gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs shrink-0">
                                      {q.year || 'N/A'}
                                    </Badge>
                                    <p className="text-sm">{q.question}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {['A', 'B', 'C', 'D'].map((opt) => {
                                      const isCorrect = q.correct_answer === opt;
                                      const optionKey = `option_${opt.toLowerCase()}` as keyof Question;
                                      return (
                                        <div
                                          key={opt}
                                          className={`p-2 rounded ${
                                            isCorrect 
                                              ? 'bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30' 
                                              : 'bg-background border border-border'
                                          }`}
                                        >
                                          <span className="font-medium">{opt}.</span> {q[optionKey] as string}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {q.explanation && (
                                    <div className="mt-2 p-2 bg-primary/10 rounded text-xs flex items-start gap-2">
                                      <Lightbulb className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                                      <span>{q.explanation}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {group.questions.length > 3 && (
                                <p className="text-xs text-muted-foreground text-center">
                                  +{group.questions.length - 3} more questions available in practice mode
                                </p>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default HighYieldQuestions;
