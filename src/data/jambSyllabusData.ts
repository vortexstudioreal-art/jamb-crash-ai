export interface OfflineSyllabusItem {
  id: string;
  subject: string;
  topic: string;
  subtopic: string | null;
  objectives: string[];
  recommended_content: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  estimated_reading_time: number; // in minutes
  order_index: number;
  diagram_url?: string;
  diagram_title?: string;
  diagram_svg?: string;
  key_formulas?: string[];
  exam_tips?: string[];
}

export const JAMB_OFFLINE_SYLLABUS: Record<string, OfflineSyllabusItem[]> = {
  english: [
    {
      id: 'eng_vocab_01',
      subject: 'english',
      topic: 'Vocabulary',
      subtopic: 'Synonyms and Antonyms',
      difficulty_level: 'medium',
      estimated_reading_time: 15,
      order_index: 1,
      objectives: [
        'Identify exact and near synonyms in given sentences',
        'Recognize antonyms in context and avoid common distractor traps',
        'Analyze contextual vocabulary usage in UTME passages'
      ],
      recommended_content: `### JAMB Use of English: Synonyms & Antonyms
Word meanings are heavily context-dependent in JAMB UTME. Always replace the underlined word with the options to see which maintains identical grammatical & semantic meaning.

#### Key Principles:
1. **Context over Dictionary Definition**: Words have primary and secondary meanings. Pick the meaning intended in the passage.
2. **Grammatical Class Alignment**: A verb must be replaced by a verb, an adjective by an adjective.
3. **Tone & Register**: Formal terms require formal equivalents (e.g. *frugal* vs *stingy*).

#### Common High-Frequency Words in JAMB:
- **Ebullient**: Exuberant, enthusiastic (Antonym: Apathetic)
- **Fastidious**: Meticulous, hard to please (Antonym: Careless)
- **Ephemeral**: Short-lived, transient (Antonym: Eternal)
- **Taciturn**: Reserved, quiet (Antonym: Talkative, Loquacious)`,
      exam_tips: [
        'Watch out for double negatives in antonym questions.',
        'Never pick a synonym when the question explicitly asks for the opposite in meaning.'
      ]
    },
    {
      id: 'eng_gram_02',
      subject: 'english',
      topic: 'Grammar',
      subtopic: 'Concord and Tenses',
      difficulty_level: 'medium',
      estimated_reading_time: 20,
      order_index: 2,
      objectives: [
        'Apply subject-verb agreement rules correctly',
        'Master complex concord rules (neither/nor, along with, as well as)',
        'Identify tense sequence errors in prose'
      ],
      recommended_content: `### Concord (Subject-Verb Agreement)
The verb in a sentence must agree in number and person with its subject.

#### Essential Rules for UTME:
1. **Parenthetical Expressions**: Words like *together with, as well as, along with, in addition to* do NOT make a singular subject plural.
   - *Example*: The Principal, as well as the teachers, **is** coming (not *are*).
2. **Correlative Conjunctions (*Either...or / Neither...nor*)**: The verb agrees with the subject closest to it.
   - *Example*: Neither the teacher nor the students **were** present.
3. **Indefinite Pronouns**: *Everyone, somebody, nobody, each, every* take singular verbs.
   - *Example*: Each of the candidates **has** a slip.`,
      key_formulas: [
        'Subject (Singular) + as well as + Noun = Singular Verb',
        'Neither A nor B = Verb agrees with B'
      ],
      exam_tips: [
        'Identify the true subject before choosing singular or plural verbs.'
      ]
    },
    {
      id: 'eng_oral_03',
      subject: 'english',
      topic: 'Oral English',
      subtopic: 'Vowels, Consonants & Stress Pattern',
      difficulty_level: 'hard',
      estimated_reading_time: 25,
      order_index: 3,
      objectives: [
        'Distinguish long and short vowel sounds (/iː/ vs /ɪ/, /uː/ vs /ʊ/)',
        'Identify primary stress placement on multisyllabic words',
        'Recognize silent letters and phonetic transcriptions'
      ],
      recommended_content: `### Oral English & Phonetics
Oral English carries 15-20 questions in JAMB UTME.

#### Primary Stress Rules:
1. **Nouns vs Verbs**: 2-syllable nouns usually have stress on the 1st syllable (*CON-duct*), while 2-syllable verbs have stress on the 2nd (*con-DUCT*).
2. **Suffix Rules**:
   - Words ending in **-tion, -sion, -ic** have stress on the syllable right BEFORE the suffix: *edu-CA-tion*, *scien-TI-fic*.
   - Words ending in **-ate, -fy, -ty** have stress on the 3rd syllable from the end: *CON-gratulate*, *pho-TO-graphy*.`,
      exam_tips: [
        'Pronounce the words aloud silently in your mind, stressing capital syllables.'
      ]
    }
  ],

  mathematics: [
    {
      id: 'math_alg_01',
      subject: 'mathematics',
      topic: 'Algebra',
      subtopic: 'Quadratic Equations & Polynomials',
      difficulty_level: 'medium',
      estimated_reading_time: 20,
      order_index: 1,
      objectives: [
        'Solve quadratic equations by factorization, completing the square, and formula',
        'Apply sum and product of roots (α + β = -b/a, αβ = c/a)',
        'Use the Remainder and Factor theorems'
      ],
      recommended_content: `### Quadratic Equations & Roots
General quadratic form: ax² + bx + c = 0

#### Key Formulae:
1. **Quadratic Formula**: x = [-b ± √(b² - 4ac)] / (2a)
2. **Discriminant (Δ = b² - 4ac)**:
   - Δ > 0: Two real & distinct roots
   - Δ = 0: Two equal/repeated real roots
   - Δ < 0: Complex/imaginary roots
3. **Sum and Product of Roots**:
   - Sum (α + β) = -b/a
   - Product (αβ) = c/a
   - Equation: x² - (α + β)x + αβ = 0`,
      key_formulas: [
        'x = (-b ± √(b² - 4ac)) / (2a)',
        'Sum (α + β) = -b / a',
        'Product (αβ) = c / a'
      ],
      diagram_title: 'Quadratic Parabola Curves & Discriminant Δ',
      diagram_svg: `<svg viewBox="0 0 300 160" className="w-full h-40 bg-muted/30 rounded-xl p-2">
        <line x1="20" y1="130" x2="280" y2="130" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
        <line x1="40" y1="10" x2="40" y2="150" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
        <path d="M 60 20 Q 140 160 220 20" fill="none" stroke="#22c55e" strokeWidth="3"/>
        <circle cx="95" cy="130" r="5" fill="#ef4444"/>
        <circle cx="185" cy="130" r="5" fill="#ef4444"/>
        <text x="100" y="120" fill="currentColor" fontSize="12" fontWeight="bold">Root α</text>
        <text x="190" y="120" fill="currentColor" fontSize="12" fontWeight="bold">Root β</text>
        <text x="140" y="30" fill="#22c55e" fontSize="12" fontWeight="bold">Δ &gt; 0 (2 Real Roots)</text>
      </svg>`,
      exam_tips: [
        'When given a quadratic with unknown coefficients, use sum (α+β) and product (αβ) equations first.'
      ]
    },
    {
      id: 'math_trig_02',
      subject: 'mathematics',
      topic: 'Trigonometry',
      subtopic: 'Sine & Cosine Rules, Identities',
      difficulty_level: 'hard',
      estimated_reading_time: 25,
      order_index: 2,
      objectives: [
        'Apply Sine Rule (a/sinA = b/sinB = c/sinC) to non-right angled triangles',
        'Apply Cosine Rule (a² = b² + c² - 2bc cosA)',
        'Solve trigonometric identities (sin²θ + cos²θ = 1)'
      ],
      recommended_content: `### Trigonometry in Non-Right Triangles

#### 1. Sine Rule:
Use when you have 2 angles and 1 side, or 2 sides and an opposite angle:
a / sin(A) = b / sin(B) = c / sin(C)

#### 2. Cosine Rule:
Use when you have 3 sides, or 2 sides and the included angle:
a² = b² + c² - 2bc cos(A)
cos(A) = (b² + c² - a²) / (2bc)

#### Fundamental Identities:
- sin²(θ) + cos²(θ) = 1
- 1 + tan²(θ) = sec²(θ)
- tan(θ) = sin(θ) / cos(θ)`,
      key_formulas: [
        'a / sin A = b / sin B = c / sin C',
        'a² = b² + c² - 2bc cos A',
        'sin² θ + cos² θ = 1'
      ],
      diagram_title: 'Triangle Geometry for Sine & Cosine Rules',
      diagram_svg: `<svg viewBox="0 0 300 160" className="w-full h-40 bg-muted/30 rounded-xl p-2">
        <polygon points="40,130 260,130 180,30" fill="none" stroke="#3b82f6" strokeWidth="3"/>
        <text x="30" y="145" fill="currentColor" fontSize="14" fontWeight="bold">A</text>
        <text x="265" y="145" fill="currentColor" fontSize="14" fontWeight="bold">B</text>
        <text x="180" y="20" fill="currentColor" fontSize="14" fontWeight="bold">C</text>
        <text x="120" y="70" fill="#3b82f6" fontSize="12" fontWeight="bold">b</text>
        <text x="230" y="80" fill="#3b82f6" fontSize="12" fontWeight="bold">a</text>
        <text x="150" y="145" fill="#3b82f6" fontSize="12" fontWeight="bold">c</text>
      </svg>`
    }
  ],

  physics: [
    {
      id: 'phy_mech_01',
      subject: 'physics',
      topic: 'Mechanics',
      subtopic: 'Newtonian Laws, Projectile Motion & Momentum',
      difficulty_level: 'hard',
      estimated_reading_time: 30,
      order_index: 1,
      objectives: [
        'Solve equations of motion under constant acceleration',
        'Calculate range, maximum height, and time of flight for projectiles',
        'Apply Conservation of Linear Momentum (m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂)'
      ],
      recommended_content: `### Projectile Motion Equations
A projectile launched with initial velocity u at angle θ to the horizontal:

#### Key Formulae:
1. **Time of Flight (T)**: T = (2u sin θ) / g
2. **Maximum Height (H)**: H = (u² sin² θ) / (2g)
3. **Horizontal Range (R)**: R = (u² sin 2θ) / g
   - Maximum range occurs at θ = 45°.

#### Conservation of Linear Momentum:
Total momentum before collision = Total momentum after collision
m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂
For inelastic collisions (stick together): m₁u₁ + m₂u₂ = (m₁ + m₂)V`,
      key_formulas: [
        'T = (2u sin θ) / g',
        'H = (u² sin² θ) / (2g)',
        'R = (u² sin 2θ) / g',
        'p = mv'
      ],
      diagram_title: 'Projectile Trajectory & Parameters',
      diagram_svg: `<svg viewBox="0 0 300 160" className="w-full h-40 bg-muted/30 rounded-xl p-2">
        <line x1="30" y1="130" x2="270" y2="130" stroke="currentColor" strokeWidth="2"/>
        <path d="M 30 130 Q 150 -20 270 130" fill="none" stroke="#eab308" strokeWidth="3" strokeDasharray="5,5"/>
        <line x1="150" y1="130" x2="150" y2="35" stroke="#ef4444" strokeWidth="2" strokeDasharray="2,2"/>
        <text x="155" y="80" fill="#ef4444" fontSize="12" fontWeight="bold">Max Height (H)</text>
        <text x="130" y="148" fill="#eab308" fontSize="12" fontWeight="bold">Total Range (R)</text>
        <text x="35" y="110" fill="currentColor" fontSize="12" fontWeight="bold">θ</text>
      </svg>`
    },
    {
      id: 'phy_elec_02',
      subject: 'physics',
      topic: 'Electricity',
      subtopic: "Ohm's Law, Resistors & Capacitors",
      difficulty_level: 'medium',
      estimated_reading_time: 20,
      order_index: 2,
      objectives: [
        'Calculate equivalent resistance in series and parallel circuits',
        'Apply Ohm’s Law (V = IR) and Electrical Power (P = IV = I²R = V²/R)',
        'Calculate energy stored in capacitors (E = ½CV²)'
      ],
      recommended_content: `### Electric Circuits & Components

#### Resistors:
- **Series**: R_total = R₁ + R₂ + R₃
- **Parallel**: 1 / R_total = 1/R₁ + 1/R₂ + 1/R₃

#### Capacitors (Opposite of Resistors):
- **Series**: 1 / C_total = 1/C₁ + 1/C₂
- **Parallel**: C_total = C₁ + C₂ + C₃

#### Electrical Power & Energy:
- Power: P = VI = I²R = V² / R (in Watts)
- Energy: E = P × t = V I t (in Joules)`,
      key_formulas: [
        'V = I × R',
        'P = V × I = I²R = V² / R',
        'E = ½ C V²'
      ],
      diagram_title: 'Resistors in Series vs Parallel Circuit Diagram',
      diagram_svg: `<svg viewBox="0 0 300 160" className="w-full h-40 bg-muted/30 rounded-xl p-2">
        <rect x="30" y="30" width="240" height="100" fill="none" stroke="currentColor" strokeWidth="2" rx="10"/>
        <rect x="80" y="20" width="50" height="20" fill="#3b82f6" rx="4"/>
        <rect x="170" y="20" width="50" height="20" fill="#3b82f6" rx="4"/>
        <text x="95" y="35" fill="#ffffff" fontSize="10" fontWeight="bold">R1</text>
        <text x="185" y="35" fill="#ffffff" fontSize="10" fontWeight="bold">R2</text>
        <circle cx="150" cy="130" r="12" fill="#22c55e"/>
        <text x="145" y="135" fill="#ffffff" fontSize="12" fontWeight="bold">V</text>
      </svg>`
    }
  ],

  chemistry: [
    {
      id: 'chem_org_01',
      subject: 'chemistry',
      topic: 'Organic Chemistry',
      subtopic: 'Hydrocarbons, Alkanes, Alkenes & Functional Groups',
      difficulty_level: 'hard',
      estimated_reading_time: 30,
      order_index: 1,
      objectives: [
        'Identify IUPAC nomenclature for organic compounds',
        'Distinguish structural, positional, and geometric isomerism',
        'Understand substitution vs addition reactions'
      ],
      recommended_content: `### IUPAC Organic Nomenclature & Reactions

#### Hydrocarbon Families:
1. **Alkanes (C_n H_{2n+2})**: Saturated, undergo substitution reactions with halogens (UV light).
2. **Alkenes (C_n H_{2n})**: Unsaturated with C=C double bond, undergo addition reactions (bromine water test: turns colorless).
3. **Alkynes (C_n H_{2n-2})**: Unsaturated with triple bond.

#### Key Functional Groups:
- **Alcohols (-OH)**: Primary, secondary, tertiary. Esterification with alkanoic acids.
- **Alkanoic Acids (-COOH)**: Weak acids, turn blue litmus paper red.
- **Esters (-COOR)**: Sweet fruity smell, used as flavorings & perfumes.`,
      key_formulas: [
        'Alkanes: C_n H_{2n+2}',
        'Alkenes: C_n H_{2n}',
        'Alkynes: C_n H_{2n-2}',
        'Esterification: Acid + Alcohol -> Ester + Water'
      ],
      diagram_title: 'Functional Group Structural Diagram',
      diagram_svg: `<svg viewBox="0 0 300 160" className="w-full h-40 bg-muted/30 rounded-xl p-2">
        <text x="20" y="30" fill="#22c55e" fontSize="14" fontWeight="bold">Alkane: C-C</text>
        <text x="160" y="30" fill="#3b82f6" fontSize="14" fontWeight="bold">Alkene: C=C</text>
        <text x="20" y="90" fill="#eab308" fontSize="14" fontWeight="bold">Alcohol: R-OH</text>
        <text x="160" y="90" fill="#ef4444" fontSize="14" fontWeight="bold">Carboxylic: R-COOH</text>
        <text x="20" y="140" fill="#a855f7" fontSize="14" fontWeight="bold">Ester: R-COO-R' (Fruity Scent)</text>
      </svg>`
    }
  ],

  biology: [
    {
      id: 'bio_gen_01',
      subject: 'biology',
      topic: 'Genetics',
      subtopic: 'Mendelian Inheritance, Monohybrid & Dihybrid Crosses',
      difficulty_level: 'hard',
      estimated_reading_time: 25,
      order_index: 1,
      objectives: [
        'Apply Mendel’s 1st and 2nd laws of inheritance',
        'Solve Punnett square monohybrid cross ratio (3:1 phenotypic, 1:2:1 genotypic)',
        'Understand sex-linked traits (hemophilia, color blindness, sickle cell anemia)'
      ],
      recommended_content: `### Genetics & Mendelian Inheritance

#### Mendel's Laws:
1. **Law of Segregation**: Alleles separate during gamete formation.
2. **Law of Independent Assortment**: Genes for different traits segregate independently.

#### Monohybrid Cross (Tt × Tt):
- **Genotypic Ratio**: 1 TT : 2 Tt : 1 tt
- **Phenotypic Ratio**: 3 Tall : 1 Short (3 : 1)

#### Sex-Linked Conditions:
- Genes carried on X chromosome.
- Females (XX) can be carriers (X^H X^h), while Males (XY) express the trait if present on their single X (X^h Y).`,
      key_formulas: [
        'Monohybrid Phenotypic Ratio = 3 : 1',
        'Monohybrid Genotypic Ratio = 1 : 2 : 1',
        'Dihybrid Phenotypic Ratio = 9 : 3 : 3 : 1'
      ],
      diagram_title: 'Punnett Square Diagram (Monohybrid Cross Tt × Tt)',
      diagram_svg: `<svg viewBox="0 0 300 160" className="w-full h-40 bg-muted/30 rounded-xl p-2">
        <rect x="80" y="20" width="140" height="120" fill="none" stroke="currentColor" strokeWidth="2"/>
        <line x1="150" y1="20" x2="150" y2="140" stroke="currentColor" strokeWidth="2"/>
        <line x1="80" y1="80" x2="220" y2="80" stroke="currentColor" strokeWidth="2"/>
        <text x="105" y="60" fill="#22c55e" fontSize="16" fontWeight="bold">TT</text>
        <text x="175" y="60" fill="#3b82f6" fontSize="16" fontWeight="bold">Tt</text>
        <text x="105" y="120" fill="#3b82f6" fontSize="16" fontWeight="bold">Tt</text>
        <text x="175" y="120" fill="#ef4444" fontSize="16" fontWeight="bold">tt</text>
        <text x="30" y="150" fill="currentColor" fontSize="11">Ratio: 3 Tall : 1 Short</text>
      </svg>`
    }
  ],

  economics: [
    {
      id: 'econ_micro_01',
      subject: 'economics',
      topic: 'Microeconomics',
      subtopic: 'Demand, Supply & Price Equilibrium',
      difficulty_level: 'medium',
      estimated_reading_time: 20,
      order_index: 1,
      objectives: [
        'Apply First Law of Demand & Supply',
        'Calculate Price Elasticity of Demand (PED = %ΔQ / %ΔP)',
        'Identify market equilibrium and price control impacts (ceilings vs floors)'
      ],
      recommended_content: `### Demand, Supply & Market Equilibrium

#### Elasticity Formulae:
- **Price Elasticity of Demand (PED)** = (% Change in Quantity Demanded) / (% Change in Price)
  - |PED| > 1: Elastic Demand
  - |PED| < 1: Inelastic Demand
  - |PED| = 1: Unitary Elasticity

#### Price Controls in Nigeria:
- **Price Ceiling (Maximum Price)**: Set BELOW equilibrium to protect consumers. Causes shortage & black markets.
- **Price Floor (Minimum Price)**: Set ABOVE equilibrium to protect producers (e.g. minimum wage). Causes surplus.`,
      key_formulas: [
        'PED = (% Change in Q) / (% Change in P)',
        'Equilibrium: Quantity Demanded (Qd) = Quantity Supplied (Qs)'
      ],
      diagram_title: 'Demand & Supply Equilibrium Curve',
      diagram_svg: `<svg viewBox="0 0 300 160" className="w-full h-40 bg-muted/30 rounded-xl p-2">
        <line x1="40" y1="20" x2="40" y2="130" stroke="currentColor" strokeWidth="2"/>
        <line x1="40" y1="130" x2="260" y2="130" stroke="currentColor" strokeWidth="2"/>
        <line x1="50" y1="30" x2="240" y2="120" stroke="#ef4444" strokeWidth="3"/>
        <line x1="50" y1="120" x2="240" y2="30" stroke="#22c55e" strokeWidth="3"/>
        <circle cx="145" cy="75" r="5" fill="#eab308"/>
        <text x="215" y="130" fill="#ef4444" fontSize="12" fontWeight="bold">Demand (D)</text>
        <text x="215" y="40" fill="#22c55e" fontSize="12" fontWeight="bold">Supply (S)</text>
        <text x="155" y="70" fill="#eab308" fontSize="12" fontWeight="bold">Equilibrium (E)</text>
      </svg>`
    }
  ],

  literature: [
    {
      id: 'lit_drama_01',
      subject: 'literature',
      topic: 'Drama',
      subtopic: 'Tragic Hero, Dramatic Irony & Stage Craft',
      difficulty_level: 'medium',
      estimated_reading_time: 20,
      order_index: 1,
      objectives: [
        'Identify characteristics of a tragic hero (hamartia, peripeteia, catharsis)',
        'Distinguish dramatic irony from verbal and situational irony',
        'Analyze stage directions and their role in characterization'
      ],
      recommended_content: `### Drama & Literary Terms

#### Tragic Hero (Aristotle):
1. **Hamartia**: A fatal flaw leading to the hero's downfall
2. **Peripeteia**: A sudden reversal of fortune
3. **Anagnorisis**: The moment of critical discovery
4. **Catharsis**: The audience's emotional release (pity and fear)

#### Types of Irony:
- **Dramatic Irony**: Audience knows what characters do not
- **Verbal Irony**: Words mean the opposite of intent (sarcasm)
- **Situational Irony**: Outcome contradicts expectations

#### Key Nigerian Drama Texts:
- *Death and the King's Horseman* — Wole Soyinka
- *A Dance of the Forests* — Wole Soyinka
- *The Lion and the Jewel* — Wole Soyinka`,
      key_formulas: [
        'Tragic Hero = High status + Hamartia + Downfall + Catharsis',
        'Dramatic Irony = Audience knowledge > Character knowledge'
      ]
    }
  ],

  government: [
    {
      id: 'gov_const_01',
      subject: 'government',
      topic: 'Constitutional Development',
      subtopic: 'Nigerian Constitutions from 1914 to 1999',
      difficulty_level: 'medium',
      estimated_reading_time: 25,
      order_index: 1,
      objectives: [
        'Trace the evolution of Nigerian constitutions from Clifford to 1999',
        'Compare features of the 1963 and 1979 republican constitutions',
        'Analyze the role of military rule in shaping Nigerian governance'
      ],
      recommended_content: `### Constitutional Development in Nigeria

#### Key Constitutions:
1. **Clifford Constitution (1922)**: First legislative council, limited franchise
2. **Richards Constitution (1946)**: Regional representation, 3 regions
3. **Macpherson Constitution (1951)**: Greater autonomy, federal structure
4. **Lyttleton Constitution (1954)**: Federal system, regions gained self-govt
5. **Independence Constitution (1960)**: Parliamentary system, GG/Nigerianized
6. **Republican Constitution (1963)**: President instead of GG, 3 regions
7. **1979 Constitution**: Presidential system, 19 states, 2 chambers
8. **1999 Constitution**: Current constitution, 36 states, federal republic

#### Military Interventions:
- 1966 (Jan & Jul coups) → 1975 → 1979 (2nd Republic)
- 1983 (coup) → 1985 (Babangida) → 1993 (Abacha) → 1999 (3rd Republic)`,
      key_formulas: [
        'Federal Character Principle = Fair representation of all states',
        'Separation of Powers = Executive, Legislature, Judiciary'
      ]
    }
  ],

  crs: [
    {
      id: 'crs_nt_01',
      subject: 'crs',
      topic: 'New Testament',
      subtopic: 'The Gospels, Acts & Pauline Epistles',
      difficulty_level: 'medium',
      estimated_reading_time: 25,
      order_index: 1,
      objectives: [
        'Summarize the Synoptic Gospels and their unique perspectives',
        'Trace the growth of the early church in Acts of the Apostles',
        'Identify key themes in Pauline Epistles (grace, faith, justification)'
      ],
      recommended_content: `### Christian Religious Studies — New Testament

#### The Four Gospels:
1. **Matthew**: Written for Jewish audience, emphasizes Jesus as Messiah, includes Sermon on the Mount
2. **Mark**: Shortest gospel, emphasizes Jesus as Servant, fast-paced narrative
3. **Luke**: Written for Gentile audience, emphasizes Jesus as Son of Man, includes parables (Good Samaritan, Prodigal Son)
4. **John**: Emphasizes Jesus as divine Word (Logos), "I Am" statements

#### Acts of the Apostles:
- Pentecost (Acts 2): Birth of the church
- Peter's ministry (Acts 1-12)
- Paul's missionary journeys (Acts 13-28)

#### Key Pauline Themes:
- **Justification by Faith**: Romans 3:28 — "A person is justified by faith, not by works of the law"
- **Grace**: Ephesians 2:8-9 — "By grace you have been saved through faith"
- **Love**: 1 Corinthians 13 — "Love is patient, love is kind"`,
      key_formulas: [
        'Justification = Faith + Grace (not works)',
        'Great Commission = Matthew 28:19-20'
      ]
    }
  ],

  irs: [
    {
      id: 'irs_quran_01',
      subject: 'irs',
      topic: 'The Quran',
      subtopic: 'Surah Al-Fatiha, Al-Baqarah & Key Chapters',
      difficulty_level: 'medium',
      estimated_reading_time: 25,
      order_index: 1,
      objectives: [
        'Recite and explain the opening chapter (Al-Fatiha)',
        'Identify the main themes of Surah Al-Baqarah',
        'Understand the significance of Quranic revelations (Makki vs Madani)'
      ],
      recommended_content: `### Islamic Religious Studies — The Quran

#### Surah Al-Fatiha (The Opening):
- Recited in every unit (rak'ah) of prayer
- 7 verses praising Allah, seeking guidance
- Key phrase: "Guide us on the Straight Path" (Sirat al-Mustaqim)

#### Surah Al-Baqarah (The Cow):
- Longest surah (286 verses)
- Themes: Faith, Torah vs Quran, Moses, Solomon, patience
- Story of the cow (v. 67-73), Al-Kursi verse (v. 255)

#### Makki vs Madani Revelations:
- **Makki**: Revealed in Mecca, shorter surahs, focus on monotheism and moral values
- **Madani**: Revealed in Medina, longer surahs, focus on law and governance

#### Key Quranic Concepts:
- **Tawhid**: Absolute monotheism — Allah is One, without partners
- **Risalah**: Prophethood — Muhammad (SAW) is the final messenger
- **Akhirah**: Day of Judgment — accountability for all actions`,
      key_formulas: [
        'Al-Fatiha = 7 verses, recited in every prayer',
        'Tawhid = Oneness of Allah'
      ]
    }
  ],

  accounting: [
    {
      id: 'acc_fin_01',
      subject: 'accounting',
      topic: 'Financial Accounting',
      subtopic: 'Double Entry, Trial Balance & Final Accounts',
      difficulty_level: 'medium',
      estimated_reading_time: 25,
      order_index: 1,
      objectives: [
        'Apply the double-entry bookkeeping principle',
        'Prepare a trial balance from ledger accounts',
        'Construct income statement and balance sheet'
      ],
      recommended_content: `### Financial Accounting — Fundamentals

#### Double Entry Principle:
Every transaction has TWO effects:
- **Debit (Dr)**: What comes IN / what the business owes
- **Credit (Cr)**: What goes OUT / what the business owns

#### Rules of Double Entry:
| Account Type | Debit | Credit |
|---|---|---|
| Assets | Increase | Decrease |
| Liabilities | Decrease | Increase |
| Capital/Equity | Decrease | Increase |
| Revenue/Income | Decrease | Increase |
| Expenses | Increase | Decrease |

#### Trial Balance:
Lists all ledger balances to check arithmetic accuracy:
- Total Debits = Total Credits
- If not equal → there's an error

#### Final Accounts:
1. **Income Statement (P&L)**: Revenue - Expenses = Profit/Loss
2. **Balance Sheet**: Assets = Liabilities + Owner's Equity (Accounting Equation)`,
      key_formulas: [
        'Assets = Liabilities + Owner\'s Equity',
        'Profit = Revenue - Expenses',
        'Trial Balance: Total Dr = Total Cr'
      ]
    }
  ],

  commerce: [
    {
      id: 'com_trade_01',
      subject: 'commerce',
      topic: 'Trade',
      subtopic: 'Home Trade, Foreign Trade & Terms of Trade',
      difficulty_level: 'medium',
      estimated_reading_time: 20,
      order_index: 1,
      objectives: [
        'Distinguish between home trade and foreign trade',
        'Explain common trade terms (FOB, CIF, Invoice, L/C)',
        'Analyze methods of payment in international trade'
      ],
      recommended_content: `### Commerce — Trade

#### Home Trade (Internal Trade):
- **Wholesale**: Buying in bulk from manufacturers, selling to retailers
- **Retail**: Selling directly to consumers in small quantities
- **Hawking**: Moving from place to place selling goods
- **Market**: Central place where buyers and sellers meet

#### Foreign Trade (International Trade):
- **Importation**: Buying goods from abroad
- **Exportation**: Selling goods abroad
- **Entrepot Trade**: Importing goods and re-exporting after processing (e.g. crude oil refining)

#### Terms of Trade:
- **FOB (Free On Board)**: Seller pays until goods are loaded on ship
- **CIF (Cost, Insurance, Freight)**: Seller pays cost, insurance, and freight to destination
- **Letter of Credit (L/C)**: Bank guarantees payment to exporter
- **Bill of Lading**: Document of title to goods in transit

#### Methods of Payment:
- Cash on Delivery (COD)
- Open Account
- Documentary Collection
- Letter of Credit`,
      key_formulas: [
        'Balance of Trade = Exports - Imports',
        'FOB: Seller risk ends at ship loading',
        'CIF: Seller covers cost + insurance + freight'
      ]
    }
  ],

  agricultural_science: [
    {
      id: 'agri_crop_01',
      subject: 'agricultural science',
      topic: 'Crop Production',
      subtopic: 'Soil Types, Cropping Systems & Crop Management',
      difficulty_level: 'medium',
      estimated_reading_time: 20,
      order_index: 1,
      objectives: [
        'Classify soil types and their suitability for different crops',
        'Compare monocropping, intercropping, and rotation systems',
        'Apply principles of crop nutrient management'
      ],
      recommended_content: `### Agricultural Science — Crop Production

#### Soil Types in Nigeria:
- **Sandy Soil**: Large particles, good drainage, low nutrient retention (coastal areas)
- **Clay Soil**: Small particles, poor drainage, high nutrient retention (inland)
- **Loam Soil**: Balanced mixture, ideal for most crops (most fertile)

#### Cropping Systems:
1. **Monocropping**: Growing one crop on the same land continuously
   - Advantage: Specialized management
   - Disadvantage: Soil nutrient depletion, pest buildup
2. **Intercropping**: Growing two or more crops together
   - Example: Maize + Cowpea (maize provides support, cowpea fixes nitrogen)
3. **Crop Rotation**: Alternating crops on the same land each season
   - Example: Year 1: Legumes → Year 2: Cereals → Year 3: Root crops

#### Crop Nutrient Management:
- **N-P-K**: Nitrogen (leaf growth), Phosphorus (root/flower), Potassium (overall health)
- **Organic Manure**: Compost, farmyard manure
- **Inorganic Fertilizer**: NPK 15:15:15, Urea (46% N)`,
      key_formulas: [
        'NPK Fertilizer = Nitrogen + Phosphorus + Potassium',
        'Loam Soil = Sand + Silt + Clay (balanced)',
        'Intercropping = 2+ crops grown together'
      ]
    }
  ],

  geography: [
    {
      id: 'geo_phys_01',
      subject: 'geography',
      topic: 'Physical Geography',
      subtopic: 'Landforms, Climate & Vegetation',
      difficulty_level: 'medium',
      estimated_reading_time: 20,
      order_index: 1,
      objectives: [
        'Classify major landforms and their formation processes',
        'Explain Nigerian climate zones and vegetation belts',
        'Analyze the influence of climate on agriculture and settlement'
      ],
      recommended_content: `### Physical Geography — Landforms & Climate

#### Nigerian Landforms:
- **Niger-Benue Trough**: Major river valley, formed by rift activity
- **Jos Plateau**: Highland area (1,200-1,400m), tin mining, cooler climate
- **Obudu Plateau**: Border region with Cameroon, cattle rearing
- **Niger Delta**: Largest delta in Africa, oil-producing region
- **Sokoto Plains**: Northern lowland, seasonal flooding

#### Climate Zones of Nigeria:
1. **Equatorial (South)**: Heavy rainfall (>2,000mm/year), no dry season
2. **Tropical (Middle Belt)**: Wet and dry seasons, 1,000-1,500mm rainfall
3. **Sudan (North)**: Short wet season, 500-1,000mm rainfall
4. **Sahel (Far North)**: Semi-arid, <500mm, desertification risk

#### Vegetation Belts:
- **Mangrove Swamp** (coastal south)
- **Rain Forest** (southwest)
- **Derived Savanna** (middle belt)
- **Guinea Savanna** (north)
- **Sudan Savanna** (far north)
- **Sahel Savanna** (extreme north)`,
      key_formulas: [
        'Rainfall decreases from south to north',
        'Vegetation follows rainfall gradient',
        'Niger-Benue Trough = Rift valley origin'
      ]
    }
  ]
};

// Fallback helper to get syllabus for a given subject offline
export const getOfflineSyllabusForSubject = (subject: string): OfflineSyllabusItem[] => {
  const normalized = subject.toLowerCase().replace(/_/g, ' ');
  const match = Object.keys(JAMB_OFFLINE_SYLLABUS).find(key => 
    key === normalized || normalized.includes(key)
  );
  return match ? JAMB_OFFLINE_SYLLABUS[match] : [];
};
