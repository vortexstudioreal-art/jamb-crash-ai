import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, ArrowLeft, Download, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StudyMaterialsProps {
  subjects: string[];
  onBack?: () => void;
}

interface MaterialContent {
  title: string;
  type: 'pdf' | 'notes';
  description: string;
  content: string;
  pdfUrl?: string;
}

const SUBJECT_MATERIALS: Record<string, MaterialContent[]> = {
  english: [
    { 
      title: 'Comprehension Techniques', 
      type: 'notes', 
      description: 'Master reading passages quickly',
      content: `## Comprehension Techniques for JAMB

### 1. Skim First, Read Later
- Quickly scan the passage (30 seconds)
- Identify the main topic and structure
- Note key words and phrases

### 2. Read Questions Before Passage
- Understand what you're looking for
- Saves time during the actual reading
- Focus on relevant sections

### 3. Context Clues for Vocabulary
- Look at surrounding words
- Identify prefixes and suffixes
- Use elimination method

### 4. Main Idea vs. Details
- Main idea = what the passage is ABOUT
- Details = examples, facts, evidence
- Don't confuse supporting points with main idea

### 5. Inference Questions
- "The author implies..." means READ BETWEEN THE LINES
- Look for tone and attitude
- Consider what's NOT directly stated

### 6. Time Management
- 1-2 minutes per passage
- Don't spend too long on one question
- Mark difficult ones and return later

### Practice Tips:
✅ Read newspapers daily
✅ Practice with past JAMB passages
✅ Time yourself (2 mins per passage)
✅ Build vocabulary daily`
    },
    { 
      title: 'Common Idioms & Phrases', 
      type: 'pdf', 
      description: '500+ idioms for JAMB',
      content: `## 500+ Common Idioms for JAMB

### A
- **A bird in hand** - Something certain is better than uncertainty
- **A piece of cake** - Very easy
- **Add fuel to fire** - Make a situation worse
- **At the drop of a hat** - Immediately, without hesitation
- **An axe to grind** - A personal reason for doing something

### B
- **Bite the bullet** - Face a difficult situation bravely
- **Break the ice** - Start a conversation
- **Burn the midnight oil** - Study/work late at night
- **By hook or by crook** - By any means necessary
- **Beat around the bush** - Avoid the main topic

### C
- **Call it a day** - Stop working
- **Cost an arm and a leg** - Very expensive
- **Cry over spilt milk** - Regret something that can't be changed
- **Cut corners** - Do something cheaply or quickly
- **Cross that bridge when you come to it** - Deal with problems when they arise

### D
- **Dead of night** - Middle of the night
- **Down to earth** - Practical and realistic
- **Drop in the bucket** - Very small amount
- **Don't judge a book by its cover** - Don't judge by appearance

### E
- **Easy as pie** - Very simple
- **Every cloud has a silver lining** - Good comes from bad
- **Eat humble pie** - Admit you were wrong

### F
- **Face the music** - Accept consequences
- **Fall on deaf ears** - Be ignored
- **Feather in one's cap** - An achievement
- **From the horse's mouth** - Directly from the source

### G
- **Get cold feet** - Become nervous
- **Give the green light** - Give permission
- **Go the extra mile** - Do more than expected
- **Grease someone's palm** - Bribe someone

### H
- **Hit the nail on the head** - Be exactly right
- **Hold your horses** - Wait, be patient
- **Hot under the collar** - Angry

### I-J
- **In the nick of time** - Just in time
- **Jump on the bandwagon** - Follow a trend
- **Jack of all trades** - Someone with many skills

### K-L
- **Keep an eye on** - Watch carefully
- **Let the cat out of the bag** - Reveal a secret
- **Look before you leap** - Think before acting
- **Lend an ear** - Listen carefully

### M-N
- **Make ends meet** - Manage with limited money
- **No stone unturned** - Try everything possible
- **Nip in the bud** - Stop something early

### O-P
- **Once in a blue moon** - Very rarely
- **Pull someone's leg** - Joke with someone
- **Put all eggs in one basket** - Risk everything
- **Play devil's advocate** - Argue the opposite side

### R-S
- **Rain cats and dogs** - Rain heavily
- **Spill the beans** - Reveal information
- **Steal someone's thunder** - Take credit
- **Strike while the iron is hot** - Act at the right time

### T-W
- **The ball is in your court** - It's your decision
- **Under the weather** - Feeling sick
- **When pigs fly** - Never
- **Whole nine yards** - Everything possible

📥 Download full PDF with 500+ idioms`
    },
    { 
      title: 'Oral English Guide', 
      type: 'notes', 
      description: 'Vowels, consonants & stress patterns',
      content: `## Oral English Complete Guide

### VOWEL SOUNDS (20 sounds)

**Pure Vowels (12):**
1. /iː/ - see, beat, meat
2. /ɪ/ - sit, bit, kid
3. /e/ - bed, said, head
4. /æ/ - cat, bat, man
5. /ɑː/ - car, heart, father
6. /ɒ/ - hot, dog, what
7. /ɔː/ - call, law, caught
8. /ʊ/ - put, book, could
9. /uː/ - boot, food, moon
10. /ʌ/ - cup, but, luck
11. /ɜː/ - bird, learn, turn
12. /ə/ - about, again, banana

**Diphthongs (8):**
1. /eɪ/ - make, say, day
2. /aɪ/ - like, my, night
3. /ɔɪ/ - boy, coin, toy
4. /əʊ/ - go, home, boat
5. /aʊ/ - now, house, cow
6. /ɪə/ - here, dear, near
7. /eə/ - care, hair, there
8. /ʊə/ - poor, tour, sure

### CONSONANT SOUNDS (24 sounds)

**Plosives:** /p/, /b/, /t/, /d/, /k/, /g/
**Fricatives:** /f/, /v/, /θ/, /ð/, /s/, /z/, /ʃ/, /ʒ/, /h/
**Affricates:** /tʃ/, /dʒ/
**Nasals:** /m/, /n/, /ŋ/
**Laterals:** /l/
**Approximants:** /r/, /w/, /j/

### STRESS PATTERNS

**Two-Syllable Words:**
- Nouns: FIRST syllable (TA-ble, WA-ter)
- Verbs: SECOND syllable (be-GIN, de-CIDE)

**Three-Syllable Words:**
- Check suffix rules below

**Common Suffixes (stress on syllable BEFORE):**
- -tion: edu-CA-tion
- -sion: deci-SION
- -ic: eco-NO-mic
- -ity: electri-CI-ty
- -ial: offi-CI-al

**Stress on LAST syllable:**
- -ee: refu-GEE
- -eer: engi-NEER
- -ese: Japa-NESE

### INTONATION

**Rising (↗):** Yes/No questions
**Falling (↘):** Statements, WH-questions
**Rise-Fall:** Surprise, emphasis

### RHYMES
Words that rhyme share the same ending sound:
- cat, hat, bat, sat
- make, lake, take, fake
- go, show, know, flow`
    },
  ],
  mathematics: [
    { 
      title: 'Formulas & Shortcuts', 
      type: 'pdf', 
      description: 'All JAMB maths formulas',
      content: `## Complete JAMB Mathematics Formulas

### ALGEBRA

**Quadratic Formula:**
x = (-b ± √(b² - 4ac)) / 2a

**Factorization Patterns:**
- a² - b² = (a+b)(a-b)
- a² + 2ab + b² = (a+b)²
- a² - 2ab + b² = (a-b)²
- a³ + b³ = (a+b)(a² - ab + b²)
- a³ - b³ = (a-b)(a² + ab + b²)

**Indices Laws:**
- aᵐ × aⁿ = aᵐ⁺ⁿ
- aᵐ ÷ aⁿ = aᵐ⁻ⁿ
- (aᵐ)ⁿ = aᵐⁿ
- a⁰ = 1
- a⁻ⁿ = 1/aⁿ

**Logarithm Laws:**
- log(ab) = log a + log b
- log(a/b) = log a - log b
- log aⁿ = n log a
- logₐa = 1
- logₐ1 = 0

### GEOMETRY

**Circle:**
- Area = πr²
- Circumference = 2πr
- Arc length = (θ/360) × 2πr
- Sector area = (θ/360) × πr²

**Triangle:**
- Area = ½ × base × height
- Area = ½ab sin C
- Pythagoras: a² + b² = c²

**Trigonometry:**
- sin²θ + cos²θ = 1
- tan θ = sin θ / cos θ
- sin 30° = ½, cos 30° = √3/2
- sin 45° = cos 45° = √2/2
- sin 60° = √3/2, cos 60° = ½

### STATISTICS

**Mean:** x̄ = Σx / n
**Variance:** σ² = Σ(x - x̄)² / n
**Standard Deviation:** σ = √variance

### SEQUENCES

**AP:** Tₙ = a + (n-1)d, Sₙ = n/2[2a + (n-1)d]
**GP:** Tₙ = arⁿ⁻¹, Sₙ = a(rⁿ - 1)/(r - 1)

📥 Download complete formula sheet`
    },
    { 
      title: 'Common Patterns & Tips', 
      type: 'notes', 
      description: 'Most tested topics & tricks',
      content: `## JAMB Mathematics: Most Tested Topics

### TOP 10 MOST REPEATED TOPICS

1. **Indices & Logarithms** (appears 90% of exams)
   - Simplification
   - Equation solving
   - Change of base

2. **Quadratic Equations** (85%)
   - Factorization
   - Formula method
   - Sum and product of roots

3. **Sets** (80%)
   - Venn diagrams (2 & 3 sets)
   - n(A∪B) = n(A) + n(B) - n(A∩B)

4. **Statistics** (80%)
   - Mean, median, mode
   - Standard deviation
   - Probability

5. **Mensuration** (75%)
   - Circles (area, circumference)
   - Triangles, rectangles
   - 3D shapes (volume, surface area)

6. **Trigonometry** (75%)
   - Ratios (sin, cos, tan)
   - Special angles (30°, 45°, 60°)
   - Graphs

7. **Coordinate Geometry** (70%)
   - Distance formula
   - Midpoint
   - Gradient/slope
   - Equation of line

8. **Matrices** (65%)
   - Addition, subtraction
   - Multiplication
   - Determinant (2×2)

9. **Number Bases** (60%)
   - Conversion
   - Operations in other bases

10. **Sequences & Series** (55%)
    - AP and GP
    - Sum formulas

### SPEED TRICKS

**Multiply by 11:**
- 23 × 11 = 2(2+3)3 = 253

**Multiply by 5:**
- Divide by 2, multiply by 10
- 48 × 5 = 240

**Numbers ending in 5 squared:**
- 25² = 2×3 | 25 = 625
- 35² = 3×4 | 25 = 1225

### QUICK TIPS:
✅ Master indices - it's in EVERY exam
✅ Practice Venn diagrams with 3 sets
✅ Know your special angles by heart
✅ Standard deviation formula is a must`
    },
  ],
  physics: [
    { 
      title: 'Formula Sheet', 
      type: 'pdf', 
      description: 'All JAMB physics formulas',
      content: `## Complete JAMB Physics Formulas

### MECHANICS

**Motion:**
- v = u + at
- s = ut + ½at²
- v² = u² + 2as
- s = ½(u + v)t

**Force & Motion:**
- F = ma
- W = mg
- Momentum: p = mv
- Impulse: J = Ft = Δp

**Work, Energy & Power:**
- Work: W = Fs cos θ
- KE = ½mv²
- PE = mgh
- Power: P = W/t = Fv

**Circular Motion:**
- v = 2πr/T
- a = v²/r = ω²r
- F = mv²/r

### WAVES & OPTICS

**Wave Equation:**
- v = fλ
- T = 1/f

**Reflection:**
- Angle of incidence = Angle of reflection

**Refraction:**
- n = sin i / sin r
- n = c/v = real depth/apparent depth

**Lenses:**
- 1/f = 1/u + 1/v
- Magnification: m = v/u

### ELECTRICITY

**Ohm's Law:** V = IR
**Power:** P = IV = I²R = V²/R
**Resistors:**
- Series: R = R₁ + R₂ + R₃
- Parallel: 1/R = 1/R₁ + 1/R₂ + 1/R₃

**Capacitors:**
- Series: 1/C = 1/C₁ + 1/C₂
- Parallel: C = C₁ + C₂

### HEAT

- Q = mcΔθ (specific heat)
- Q = mL (latent heat)
- Gas Laws: PV/T = constant

📥 Download complete physics formula sheet`
    },
    { 
      title: 'Diagrams & Derivations', 
      type: 'notes', 
      description: 'Visual physics concepts',
      content: `## Physics Diagrams & Key Derivations

### PROJECTILE MOTION

**Key Points:**
- Horizontal velocity (vₓ) = constant
- Vertical velocity (vᵧ) changes due to gravity
- At maximum height, vᵧ = 0

**Formulas:**
- Range: R = u²sin2θ/g
- Max Height: H = u²sin²θ/2g
- Time of flight: T = 2u sinθ/g

**Maximum range at θ = 45°**

### SIMPLE PENDULUM

- Period: T = 2π√(L/g)
- Only depends on LENGTH and GRAVITY
- NOT affected by mass or amplitude (for small angles)

### ELECTROMAGNETIC SPECTRUM

Radio → Microwave → Infrared → Visible → UV → X-ray → Gamma

**Increasing frequency →**
**Increasing energy →**
**← Increasing wavelength**

### KIRCHHOFF'S LAWS

**First Law (Junction Rule):**
- Current in = Current out
- ΣI = 0 at a junction

**Second Law (Loop Rule):**
- Sum of EMFs = Sum of potential drops
- ΣE = ΣIR in any closed loop

### TRANSFORMERS

- Vₚ/Vₛ = Nₚ/Nₛ = Iₛ/Iₚ
- Step-up: More secondary turns
- Step-down: Fewer secondary turns

### PHOTOELECTRIC EFFECT

- E = hf = hc/λ
- KE_max = hf - φ (work function)
- Threshold frequency: f₀ = φ/h

### NUCLEAR PHYSICS

- Mass defect: Δm = (Reactants mass) - (Products mass)
- Energy released: E = Δmc²
- Half-life: N = N₀(½)^(t/T½)`
    },
  ],
  chemistry: [
    { 
      title: 'Periodic Table + Reactions', 
      type: 'pdf', 
      description: 'Elements & key reactions',
      content: `## Periodic Table & Important Reactions

### PERIODIC TABLE TRENDS

**Atomic Radius:**
- ↓ Group: INCREASES (more shells)
- → Period: DECREASES (more protons, same shell)

**Electronegativity:**
- ↓ Group: DECREASES
- → Period: INCREASES
- Most electronegative: Fluorine (F)

**Ionization Energy:**
- ↓ Group: DECREASES
- → Period: INCREASES

### KEY GROUPS

**Group 1 (Alkali Metals):** Li, Na, K, Rb, Cs
- Very reactive
- Form +1 ions
- React with water → hydroxide + H₂

**Group 2 (Alkaline Earth):** Be, Mg, Ca, Sr, Ba
- Form +2 ions
- Less reactive than Group 1

**Group 7 (Halogens):** F, Cl, Br, I
- Very reactive non-metals
- Form -1 ions
- Reactivity decreases down group

**Group 0 (Noble Gases):** He, Ne, Ar, Kr, Xe
- Unreactive (full outer shell)

### IMPORTANT REACTIONS

**Neutralization:**
Acid + Base → Salt + Water
HCl + NaOH → NaCl + H₂O

**Combustion:**
Hydrocarbon + O₂ → CO₂ + H₂O

**Displacement:**
Zn + CuSO₄ → ZnSO₄ + Cu

**Reactivity Series:**
K > Na > Ca > Mg > Al > Zn > Fe > Pb > H > Cu > Ag > Au

📥 Download complete periodic table with reactions`
    },
    { 
      title: 'Organic Chemistry Summary', 
      type: 'notes', 
      description: 'Hydrocarbons & functional groups',
      content: `## Organic Chemistry Quick Guide

### HOMOLOGOUS SERIES

**Alkanes (CₙH₂ₙ₊₂):**
- Single bonds only
- Saturated
- Examples: CH₄ (methane), C₂H₆ (ethane), C₃H₈ (propane)

**Alkenes (CₙH₂ₙ):**
- Contains C=C double bond
- Unsaturated
- Examples: C₂H₄ (ethene), C₃H₆ (propene)

**Alkynes (CₙH₂ₙ₋₂):**
- Contains C≡C triple bond
- Examples: C₂H₂ (ethyne/acetylene)

**Alkanols (Alcohols):**
- Contains -OH group
- General formula: CₙH₂ₙ₊₁OH
- Examples: CH₃OH (methanol), C₂H₅OH (ethanol)

**Alkanoic Acids (Carboxylic Acids):**
- Contains -COOH group
- Examples: HCOOH (methanoic), CH₃COOH (ethanoic)

### FUNCTIONAL GROUPS

| Group | Name | Example |
|-------|------|---------|
| -OH | Hydroxyl | Ethanol |
| -COOH | Carboxyl | Ethanoic acid |
| -CHO | Aldehyde | Ethanal |
| C=O | Ketone | Propanone |
| -NH₂ | Amine | Ethylamine |

### KEY REACTIONS

**Addition (Alkenes):**
C₂H₄ + Br₂ → C₂H₄Br₂ (decolorizes bromine water)

**Substitution (Alkanes):**
CH₄ + Cl₂ → CH₃Cl + HCl (UV light needed)

**Esterification:**
Acid + Alcohol → Ester + Water
CH₃COOH + C₂H₅OH → CH₃COOC₂H₅ + H₂O

**Polymerization:**
nCH₂=CH₂ → (-CH₂-CH₂-)ₙ`
    },
  ],
  biology: [
    { 
      title: 'Cell Structure', 
      type: 'notes', 
      description: 'Complete cell biology guide',
      content: `## Cell Structure & Functions

### CELL ORGANELLES

**Nucleus:**
- Contains DNA (genetic material)
- Controls cell activities
- Has nuclear membrane with pores

**Mitochondria:**
- Powerhouse of the cell
- Site of aerobic respiration
- Produces ATP (energy)
- Has double membrane

**Ribosomes:**
- Site of protein synthesis
- Found free or on rough ER
- Made of RNA and protein

**Endoplasmic Reticulum (ER):**
- Rough ER: Has ribosomes, makes proteins
- Smooth ER: Makes lipids, detoxifies

**Golgi Apparatus:**
- Packages and modifies proteins
- Creates vesicles for transport

**Lysosomes:**
- Contains digestive enzymes
- Breaks down worn-out organelles
- "Suicide bags" of the cell

**Chloroplast (Plants only):**
- Site of photosynthesis
- Contains chlorophyll
- Has double membrane + thylakoids

**Vacuole:**
- Plant cells: Large central vacuole (storage, turgor)
- Animal cells: Small, temporary vacuoles

**Cell Wall (Plants, Fungi, Bacteria):**
- Made of cellulose (plants)
- Provides support and shape
- Fully permeable

### PLANT vs ANIMAL CELLS

| Feature | Plant | Animal |
|---------|-------|--------|
| Cell wall | Present | Absent |
| Chloroplast | Present | Absent |
| Vacuole | Large, central | Small, temporary |
| Centrioles | Absent | Present |
| Shape | Fixed, rectangular | Variable |

### CELL DIVISION

**Mitosis:** 
- 1 cell → 2 identical cells
- For growth and repair
- Stages: PMAT (Prophase, Metaphase, Anaphase, Telophase)

**Meiosis:**
- 1 cell → 4 different cells
- For gamete (sex cell) production
- Results in genetic variation`
    },
    { 
      title: 'Ecology Summary', 
      type: 'pdf', 
      description: 'Ecosystems & food chains',
      content: `## Ecology Complete Guide

### LEVELS OF ORGANIZATION

Individual → Population → Community → Ecosystem → Biome → Biosphere

### FOOD CHAINS & WEBS

**Trophic Levels:**
1. Producers (autotrophs) - plants, algae
2. Primary consumers (herbivores)
3. Secondary consumers (carnivores)
4. Tertiary consumers (top predators)
5. Decomposers (bacteria, fungi)

**Energy Flow:**
- Only 10% energy transferred per level
- 90% lost as heat
- Explains why food chains are short

### NUTRIENT CYCLES

**Carbon Cycle:**
- Photosynthesis: CO₂ → Glucose
- Respiration: Glucose → CO₂
- Combustion: Fossil fuels → CO₂
- Decomposition: Dead matter → CO₂

**Nitrogen Cycle:**
- Nitrogen fixation: N₂ → NH₃ (by bacteria)
- Nitrification: NH₃ → NO₃⁻
- Denitrification: NO₃⁻ → N₂

**Water Cycle:**
- Evaporation → Condensation → Precipitation → Collection

### ECOLOGICAL CONCEPTS

**Carrying Capacity:** Maximum population an environment can support

**Biotic Factors:** Living things affecting organisms
- Predation, competition, parasitism

**Abiotic Factors:** Non-living factors
- Temperature, water, light, pH

### POPULATION INTERACTIONS

**Symbiosis Types:**
- Mutualism: Both benefit (+/+)
- Commensalism: One benefits, other unaffected (+/0)
- Parasitism: One benefits, other harmed (+/-)
- Competition: Both harmed (-/-)
- Predation: One benefits, other dies (+/-)

📥 Download complete ecology PDF`
    },
  ],
  literature: [
    { 
      title: 'Literary Devices', 
      type: 'notes', 
      description: 'All figures of speech explained',
      content: `## Literary Devices & Figures of Speech

### SOUND DEVICES

**Alliteration:** Repetition of consonant sounds at the beginning
- "Peter Piper picked a peck of pickled peppers"

**Assonance:** Repetition of vowel sounds
- "The rain in Spain stays mainly in the plain"

**Onomatopoeia:** Words that sound like what they mean
- buzz, hiss, splash, bang, meow

**Rhyme:** Same ending sounds
- Internal rhyme: within a line
- End rhyme: at line endings

### COMPARISON DEVICES

**Simile:** Comparison using "like" or "as"
- "He ran like the wind"
- "She is as brave as a lion"

**Metaphor:** Direct comparison without like/as
- "Life is a journey"
- "The world is a stage"

**Personification:** Giving human qualities to non-human things
- "The sun smiled down on us"
- "The wind whispered through the trees"

### CONTRAST & EMPHASIS

**Hyperbole:** Extreme exaggeration
- "I've told you a million times"
- "I'm so hungry I could eat a horse"

**Litotes/Understatement:** Saying less than meant
- "It's not rocket science" (it's easy)
- "He's not a bad singer" (he's good)

**Irony:**
- Verbal: Saying opposite of meaning
- Situational: Opposite of expected happens
- Dramatic: Audience knows what characters don't

**Paradox:** Contradictory statement that's true
- "Less is more"
- "The only constant is change"

**Oxymoron:** Two opposite words together
- "Living dead," "deafening silence," "bittersweet"

### REPETITION DEVICES

**Anaphora:** Same word(s) at the start of lines
- "I have a dream... I have a dream..."

**Epistrophe:** Same word(s) at end of lines

**Refrain:** Repeated line or phrase in poem/song

### OTHER DEVICES

**Euphemism:** Mild expression for harsh reality
- "Passed away" instead of "died"

**Symbolism:** Object represents an idea
- Dove = peace, Red = danger/love

**Imagery:** Descriptive language appealing to senses
- Visual, auditory, tactile, gustatory, olfactory`
    },
    { 
      title: 'Drama, Prose & Poetry Tips', 
      type: 'notes', 
      description: 'Analysis techniques for all genres',
      content: `## Literature Analysis Guide

### DRAMA ANALYSIS

**Key Elements:**
- Plot: Sequence of events
- Conflict: Central struggle
- Characters: Protagonist vs Antagonist
- Theme: Central message
- Setting: Time and place
- Dialogue: Character speech

**Types of Drama:**
- Tragedy: Ends in death/suffering
- Comedy: Ends happily
- Tragi-comedy: Mix of both
- Melodrama: Exaggerated emotions

**Dramatic Techniques:**
- Soliloquy: Character speaks thoughts alone
- Monologue: Long speech to others
- Aside: Brief comment to audience
- Flashback: Scene from the past
- Foreshadowing: Hints at future events

### PROSE ANALYSIS

**Types:**
- Novel: Long fictional narrative
- Novella: Medium-length fiction
- Short story: Brief narrative
- Essay: Non-fiction piece

**Narrative Techniques:**
- First person: "I" narrator
- Third person limited: One character's view
- Third person omniscient: All-knowing narrator
- Stream of consciousness: Inner thoughts

**Elements to Analyze:**
- Point of view
- Characterization (direct vs indirect)
- Setting and atmosphere
- Plot structure
- Themes and motifs

### POETRY ANALYSIS

**Poetic Forms:**
- Sonnet: 14 lines
- Ballad: Story poem
- Ode: Praise poem
- Elegy: Mourning poem
- Epic: Long heroic poem
- Free verse: No fixed pattern

**Poetic Devices:**
- Meter: Rhythm pattern
- Stanza: Group of lines
- Enjambment: Line runs into next
- Caesura: Pause within line

**How to Analyze Poetry:**
1. Read multiple times
2. Identify the speaker
3. Note the tone and mood
4. Find literary devices
5. Interpret the theme
6. Consider the title

### ANSWERING LITERATURE QUESTIONS

**For context questions:**
- Quote directly from the text
- Explain significance
- Link to theme

**For essay questions:**
- Introduction with thesis
- Body paragraphs with evidence
- Conclusion summarizing main points`
    },
  ],
  government: [
    { 
      title: 'Key Concepts & Constitution', 
      type: 'notes', 
      description: 'Government fundamentals',
      content: `## Government Key Concepts

### BASIC CONCEPTS

**State:** A territory with a government, population, sovereignty, and defined borders

**Government:** Body that makes and enforces laws
- Types: Democracy, Monarchy, Aristocracy, Oligarchy, Autocracy

**Power:** Ability to influence or control others
- Authority: Legitimate power
- Sovereignty: Supreme power of a state

**Constitution:** Fundamental laws governing a country
- Written: In a single document (Nigeria, USA)
- Unwritten: Based on conventions (UK)

### ARMS OF GOVERNMENT

**Legislature:** Makes laws
- Bicameral: Two houses (Senate + House of Reps)
- Unicameral: One house

**Executive:** Implements laws
- President, Vice President, Ministers
- Civil servants

**Judiciary:** Interprets laws
- Supreme Court (highest)
- Court of Appeal
- High Courts

**Separation of Powers:** Each arm is independent
**Checks and Balances:** Each arm limits others

### NIGERIAN CONSTITUTION

**1960 Constitution:** Independence constitution
**1963 Constitution:** Republican constitution
**1979 Constitution:** Presidential system
**1999 Constitution (current):** Fourth Republic

**Key Features:**
- Federal system
- Presidential system
- Fundamental human rights
- Directive principles
- Supremacy of constitution

### TYPES OF GOVERNMENT

**Federalism:** Power shared between central and regional governments
- Nigeria, USA, Canada

**Unitary:** Power concentrated at center
- UK, France

**Confederalism:** Weak central government
- Former Confederate States of America

### LOCAL GOVERNMENT

**Functions:**
- Provision of basic services
- Revenue collection
- Community development
- Health and education at grassroots

**Sources of Revenue:**
- Federal allocation
- Local taxes and rates
- Fees and charges`
    },
  ],
  economics: [
    { 
      title: 'Basic Principles & Graphs', 
      type: 'pdf', 
      description: 'Economic fundamentals with diagrams',
      content: `## Economics Principles & Graphs

### BASIC CONCEPTS

**Scarcity:** Limited resources, unlimited wants
**Opportunity Cost:** What you give up when making a choice
**Utility:** Satisfaction from consuming goods

**Types of Goods:**
- Economic goods: Scarce, have price
- Free goods: Abundant, no price (air, sunlight)
- Consumer goods: Final use (food, clothes)
- Capital goods: Used to produce others (machines)

### DEMAND

**Law of Demand:** As price increases, quantity demanded decreases (ceteris paribus)

**Demand Curve:** Slopes downward left to right

**Factors Affecting Demand:**
- Price of the good
- Income
- Tastes and preferences
- Price of related goods (substitutes/complements)
- Population
- Future expectations

### SUPPLY

**Law of Supply:** As price increases, quantity supplied increases

**Supply Curve:** Slopes upward left to right

**Factors Affecting Supply:**
- Cost of production
- Technology
- Government policies
- Natural factors
- Number of producers

### MARKET EQUILIBRIUM

Where demand = supply
- Market clearing price
- No surplus or shortage

**Price Above Equilibrium:** Surplus (excess supply)
**Price Below Equilibrium:** Shortage (excess demand)

### ELASTICITY

**Price Elasticity of Demand (PED):**
PED = % change in Qd / % change in P

- Elastic: PED > 1 (responsive)
- Inelastic: PED < 1 (unresponsive)
- Unitary: PED = 1

### MARKET STRUCTURES

**Perfect Competition:**
- Many buyers and sellers
- Homogeneous products
- Free entry and exit
- Perfect information

**Monopoly:**
- Single seller
- No close substitutes
- Barriers to entry

**Oligopoly:**
- Few large sellers
- Interdependent decisions

**Monopolistic Competition:**
- Many sellers
- Differentiated products

📥 Download complete economics graphs`
    },
  ],
  commerce: [
    { 
      title: 'Trade & Business Units', 
      type: 'notes', 
      description: 'Commerce fundamentals',
      content: `## Commerce Complete Guide

### TRADE

**Definition:** Buying and selling of goods and services

**Types of Trade:**

**Home Trade (Internal):**
- Wholesale trade: Large quantities, B2B
- Retail trade: Small quantities, B2C

**Foreign Trade (International):**
- Import: Buying from other countries
- Export: Selling to other countries
- Entrepot: Import for re-export

### AIDS TO TRADE

**Banking:** Provides finance, safe keeping
**Insurance:** Protects against risks
**Advertising:** Creates awareness
**Transportation:** Moves goods
**Warehousing:** Storage of goods
**Communication:** Information exchange

### BUSINESS UNITS

**Sole Proprietorship:**
- Single owner
- Unlimited liability
- Easy to start
- Limited capital

**Partnership:**
- 2-20 partners
- Shared responsibility
- More capital
- Partnership deed

**Limited Company:**
- Private Ltd (2-50 shareholders)
- Public Ltd (7+ shareholders)
- Limited liability
- Separate legal entity

**Cooperative Societies:**
- Owned by members
- Democratic control
- One member, one vote
- Types: Consumer, Producer, Credit

### BUSINESS DOCUMENTS

**Order Documents:**
- Letter of inquiry
- Quotation
- Order

**Delivery Documents:**
- Delivery note
- Consignment note

**Payment Documents:**
- Invoice
- Credit note
- Debit note
- Receipt
- Statement of account

### CHANNELS OF DISTRIBUTION

Producer → Wholesaler → Retailer → Consumer
Producer → Retailer → Consumer
Producer → Consumer (direct)`
    },
  ],
  accounting: [
    { 
      title: 'Books of Entry & Final Accounts', 
      type: 'notes', 
      description: 'Accounting fundamentals',
      content: `## Accounting Fundamentals

### DOUBLE ENTRY SYSTEM

**Golden Rule:**
- Debit the receiver
- Credit the giver

**Account Types:**
- Assets: Debit increase, Credit decrease
- Liabilities: Credit increase, Debit decrease
- Capital: Credit increase, Debit decrease
- Expenses: Debit increase
- Income: Credit increase

### BOOKS OF ORIGINAL ENTRY

**Sales Day Book:** Credit sales
**Purchases Day Book:** Credit purchases
**Sales Returns Book:** Goods returned by customers
**Purchases Returns Book:** Goods returned to suppliers
**Cash Book:** Cash transactions
**Journal:** Other transactions

### CASH BOOK

**Types:**
- Single column: Cash only
- Two column: Cash and bank
- Three column: Cash, bank, and discount

**Petty Cash Book:** Small expenses
- Imprest system: Fixed amount replenished

### TRIAL BALANCE

List of all ledger balances
- Debits = Credits
- Detects arithmetic errors
- Prepared before final accounts

### TRADING ACCOUNT

Sales - Cost of Goods Sold = Gross Profit

**Cost of Goods Sold:**
Opening Stock + Purchases - Closing Stock

### PROFIT & LOSS ACCOUNT

Gross Profit + Other Income - Expenses = Net Profit

**Expenses include:**
- Salaries, rent, utilities
- Depreciation
- Bad debts

### BALANCE SHEET

**Assets = Liabilities + Capital**

**Fixed Assets:** Long-term (buildings, machinery)
**Current Assets:** Short-term (cash, debtors, stock)
**Current Liabilities:** Short-term debts
**Long-term Liabilities:** Loans, mortgages

### DEPRECIATION

**Methods:**
- Straight line: (Cost - Salvage) / Years
- Reducing balance: % of book value yearly

**Purpose:**
- Shows true asset value
- Matches cost with revenue`
    },
  ],
  crs: [
    { 
      title: 'Key Themes & Teachings', 
      type: 'notes', 
      description: 'Christian Religious Studies guide',
      content: `## Christian Religious Studies Guide

### OLD TESTAMENT THEMES

**Creation:**
- God created the world in 6 days, rested on 7th
- Man created in God's image
- Stewardship of creation

**The Fall:**
- Adam and Eve's disobedience
- Introduction of sin and death
- Promise of redemption (Genesis 3:15)

**Covenant with Abraham:**
- Land, descendants, blessing
- Father of faith
- Sacrifice of Isaac (test of faith)

**The Exodus:**
- Moses and the burning bush
- Plagues of Egypt
- Passover and Red Sea crossing
- Ten Commandments

**The Monarchy:**
- Saul: First king, rejected by God
- David: Man after God's heart
- Solomon: Wisdom, built the temple

### NEW TESTAMENT THEMES

**Birth of Jesus:**
- Virgin birth
- Fulfillment of prophecy
- Shepherds and wise men

**Ministry of Jesus:**
- Baptism and temptation
- Miracles and parables
- Teaching on love, forgiveness, kingdom

**Death and Resurrection:**
- Crucifixion for sin
- Resurrection on third day
- Great Commission

**Early Church:**
- Day of Pentecost
- Spread of Christianity
- Paul's missionary journeys

### KEY TEACHINGS

**Beatitudes (Matthew 5):**
- Blessed are the poor in spirit
- Blessed are those who mourn
- Blessed are the meek
- etc.

**Lord's Prayer:**
- Model for prayer
- Forgiveness, daily needs, deliverance

**Greatest Commandment:**
- Love God with all your heart
- Love your neighbor as yourself

### MORAL LESSONS

- Obedience to God
- Faith and trust
- Love and forgiveness
- Humility and service
- Justice and righteousness`
    },
  ],
  irs: [
    { 
      title: 'Key Themes & Teachings', 
      type: 'notes', 
      description: 'Islamic Religious Studies guide',
      content: `## Islamic Religious Studies Guide

### PILLARS OF ISLAM (Five Pillars)

**1. Shahada (Declaration of Faith):**
"There is no god but Allah, and Muhammad is His Messenger"

**2. Salat (Prayer):**
- Five daily prayers
- Fajr, Dhuhr, Asr, Maghrib, Isha
- Facing Qibla (Mecca)

**3. Zakat (Charity):**
- 2.5% of wealth annually
- Purification of wealth
- For the poor and needy

**4. Sawm (Fasting):**
- During Ramadan
- Dawn to sunset
- Spiritual discipline

**5. Hajj (Pilgrimage):**
- Once in lifetime if able
- To Mecca
- During Dhul Hijjah

### PILLARS OF IMAN (Faith)

1. Belief in Allah
2. Belief in Angels
3. Belief in Books (Quran, Torah, Injil, etc.)
4. Belief in Prophets
5. Belief in Day of Judgment
6. Belief in Divine Decree (Qadr)

### KEY PROPHETS

**Ibrahim (Abraham):** Friend of Allah, builder of Ka'bah
**Musa (Moses):** Given Torah, parted Red Sea
**Isa (Jesus):** Born of virgin Mary, performed miracles
**Muhammad (PBUH):** Final Prophet, given Quran

### THE QURAN

- Final revelation
- Revealed over 23 years
- 114 Surahs (chapters)
- Preserved in original Arabic

### HADITH

- Sayings and actions of Prophet Muhammad
- Second source of Islamic law
- Collections: Bukhari, Muslim, etc.

### ISLAMIC HISTORY

**Hijra (622 CE):**
- Migration from Mecca to Medina
- Start of Islamic calendar

**Rightly Guided Caliphs:**
1. Abu Bakr
2. Umar ibn Khattab
3. Uthman ibn Affan
4. Ali ibn Abi Talib

### MORAL TEACHINGS

- Honesty and truthfulness
- Respect for parents
- Justice and fairness
- Kindness to neighbors
- Modesty and humility
- Prohibition of interest (riba)`
    },
  ],
  'agricultural science': [
    { 
      title: 'Soil & Crop Production', 
      type: 'notes', 
      description: 'Agriculture fundamentals',
      content: `## Agricultural Science Guide

### SOIL SCIENCE

**Soil Formation:**
- Parent material + Climate + Organisms + Topography + Time

**Soil Components:**
- Mineral matter (45%)
- Organic matter (5%)
- Water (25%)
- Air (25%)

**Soil Texture:**
- Sand: Large particles, drains quickly
- Silt: Medium particles
- Clay: Small particles, holds water
- Loam: Best for farming (mix of all)

**Soil pH:**
- Acidic: Below 7
- Neutral: 7
- Alkaline: Above 7
- Most crops prefer 6-7

### CROP PRODUCTION

**Types of Crops:**
- Cereals: Maize, rice, wheat, sorghum
- Legumes: Groundnut, cowpea, soybean
- Root/Tuber: Cassava, yam, potato
- Vegetables: Tomato, pepper, okra
- Tree crops: Cocoa, oil palm, rubber

**Cultural Practices:**
1. Land clearing
2. Tillage
3. Planting
4. Fertilizer application
5. Weeding
6. Pest/disease control
7. Harvesting

**Crop Rotation:** Growing different crops in succession
- Benefits: Prevents soil exhaustion, controls pests

**Mixed Cropping:** Growing two or more crops together
- Benefits: Risk reduction, efficient land use

### PLANT NUTRIENTS

**Macro-nutrients:**
- Nitrogen (N): Leaf growth
- Phosphorus (P): Root growth
- Potassium (K): Flower/fruit

**Micro-nutrients:**
- Iron, Zinc, Manganese, etc.

**NPK Fertilizers:**
- 15:15:15 (balanced)
- 20:10:10 (high nitrogen)

### PEST AND DISEASE CONTROL

**Types of Pests:**
- Insects (weevils, caterpillars)
- Rodents (rats, mice)
- Birds
- Nematodes

**Control Methods:**
- Cultural (crop rotation)
- Biological (natural predators)
- Chemical (pesticides)
- Physical (traps, barriers)

### ANIMAL HUSBANDRY

**Livestock:**
- Cattle: Beef, dairy
- Poultry: Eggs, meat
- Pigs: Pork
- Sheep/Goats: Meat, milk, wool

**Feeding Types:**
- Concentrates: High energy/protein
- Roughages: Fibrous feeds (hay, grass)`
    },
  ],
  history: [
    { 
      title: 'Nigeria & West Africa Timeline', 
      type: 'notes', 
      description: 'Historical events and dates',
      content: `## Nigerian & West African History

### PRE-COLONIAL ERA

**Early Kingdoms & Empires:**

**Ghana Empire (300-1200 AD):**
- First major West African empire
- Controlled gold and salt trade
- Declined due to Almoravid attacks

**Mali Empire (1235-1600 AD):**
- Founded by Sundiata Keita
- Mansa Musa: Famous pilgrimage to Mecca
- Timbuktu: Center of learning

**Songhai Empire (1464-1591 AD):**
- Largest West African empire
- Sunni Ali and Askia Muhammad
- Fell to Moroccan invasion

**Nigerian Kingdoms:**

**Benin Kingdom:**
- Advanced bronze casting
- Trade with Portuguese
- Oba as divine ruler

**Oyo Empire:**
- Yoruba kingdom
- Alaafin and Oyomesi
- Strong cavalry

**Hausa City-States:**
- Kano, Katsina, Zaria
- Trade and crafts
- Islamic influence

### COLONIAL ERA

**1861:** Lagos annexed by Britain
**1884-85:** Berlin Conference (Scramble for Africa)
**1900:** Northern and Southern Protectorates
**1914:** Amalgamation by Lord Lugard

**Colonial Administration:**
- Direct rule in South
- Indirect rule in North
- Native authority system

### ROAD TO INDEPENDENCE

**1922:** Clifford Constitution (Lagos elections)
**1946:** Richards Constitution (regional councils)
**1951:** Macpherson Constitution
**1954:** Lyttleton Constitution (federal system)
**1957:** Regional self-government
**1960:** Independence (October 1)
**1963:** Republic declared

### POST-INDEPENDENCE

**First Republic (1960-1966):**
- Tafawa Balewa (PM)
- Nnamdi Azikiwe (President)

**Military Coups:**
- 1966: January and July coups
- Civil War (1967-1970)

**Key Military Leaders:**
- Ironsi, Gowon, Murtala, Obasanjo, Buhari, Babangida, Abacha

**Second Republic (1979-1983):**
- Shehu Shagari

**Fourth Republic (1999-present):**
- Obasanjo, Yar'Adua, Jonathan, Buhari, Tinubu`
    },
  ],
  geography: [
    { 
      title: 'Physical & Human Geography', 
      type: 'notes', 
      description: 'Geography fundamentals',
      content: `## Geography Complete Guide

### PHYSICAL GEOGRAPHY

**Landforms:**
- Mountains: Fold, block, volcanic
- Plains: Coastal, riverine
- Plateaus: Highland plains
- Valleys: River-formed depressions

**Nigerian Landforms:**
- Niger-Benue Trough
- Jos Plateau
- Obudu Plateau
- Niger Delta

**Climate:**
- Tropical: Hot and wet
- Savanna: Wet and dry seasons
- Sahel: Semi-arid

**Nigerian Climate Zones:**
- Equatorial (South): Heavy rainfall
- Tropical (Middle Belt): Distinct seasons
- Sudan (North): Less rainfall
- Sahel (Far North): Semi-desert

**Vegetation:**
- Rainforest: South (high rainfall)
- Savanna: Middle Belt
- Sudan Savanna: North
- Sahel: Far North

### POPULATION

**Factors Affecting Population:**
- Birth rate and death rate
- Migration
- Healthcare
- Economic factors

**Population Distribution:**
- Dense: Lagos, Kano
- Sparse: Sahel, forests

**Urbanization:**
- Rural-urban migration
- Urban problems: Housing, traffic, pollution

### SETTLEMENT

**Rural Settlement:**
- Dispersed: Scattered farms
- Nucleated: Clustered village
- Linear: Along roads/rivers

**Urban Settlement:**
- Cities: Over 20,000 people
- Functions: Administrative, commercial, industrial

### RESOURCES

**Mineral Resources:**
- Petroleum: Niger Delta
- Coal: Enugu
- Tin: Jos Plateau
- Iron: Itakpe
- Limestone: Throughout

**Agricultural Resources:**
- Cocoa: Southwest
- Groundnut: North
- Palm oil: Southeast
- Rubber: South

### MAP READING

**Scale:** Ratio of map distance to actual distance
**Contour Lines:** Lines of equal height
**Symbols:** Represent features

**Bearings:**
- Compass bearings (N, NE, E, etc.)
- Three-figure bearings (045°, 180°, etc.)

**Grid References:**
- Eastings first, then Northings
- 4-figure: General area
- 6-figure: Specific location`
    },
  ],
};

// Map to display full subject names
const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
  english: 'English',
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  literature: 'Literature',
  government: 'Government',
  economics: 'Economics',
  commerce: 'Commerce',
  accounting: 'Accounting',
  crs: 'CRS',
  irs: 'IRS',
  'agricultural science': 'Agric Science',
  history: 'History',
  geography: 'Geography',
};

// All available subjects in order
const ALL_SUBJECTS = [
  'english',
  'mathematics', 
  'physics',
  'chemistry',
  'biology',
  'literature',
  'government',
  'economics',
  'commerce',
  'accounting',
  'crs',
  'irs',
  'agricultural science',
  'history',
  'geography',
];

export const StudyMaterials = ({ subjects, onBack }: StudyMaterialsProps) => {
  // Normalize user's subjects to lowercase for matching
  const normalizedUserSubjects = subjects.map(s => s.toLowerCase().replace('_', ' '));
  
  // Filter available subjects to only show user's selected subjects (always include english)
  const availableSubjects = ALL_SUBJECTS.filter(s => 
    s === 'english' || normalizedUserSubjects.includes(s) || normalizedUserSubjects.some(us => 
      us.includes(s) || s.includes(us) || 
      (s === 'literature' && us.includes('literature')) ||
      (s === 'agricultural science' && (us.includes('agricultural') || us.includes('agric')))
    )
  );
  
  const [selectedSubject, setSelectedSubject] = useState<string>(availableSubjects[0] || 'english');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialContent | null>(null);

  const materials = SUBJECT_MATERIALS[selectedSubject] || [];

  const handleMaterialClick = (material: MaterialContent) => {
    setSelectedMaterial(material);
  };

  const handleDownloadPDF = (material: MaterialContent) => {
    // Create a blob with the content and download
    const blob = new Blob([material.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${material.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Show material content view
  if (selectedMaterial) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSelectedMaterial(null)}
            className="text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Materials
          </Button>
          
          {selectedMaterial.type === 'pdf' && (
            <Button
              onClick={() => handleDownloadPDF(selectedMaterial)}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>

        {/* Content Card */}
        <Card className="border-primary/20">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedMaterial.type === 'pdf' ? (
                  <FileText className="w-6 h-6 text-red-500" />
                ) : (
                  <BookOpen className="w-6 h-6 text-primary" />
                )}
                <div>
                  <CardTitle className="text-lg">{selectedMaterial.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedMaterial.description}</p>
                </div>
              </div>
              <Badge variant="outline" className={selectedMaterial.type === 'pdf' ? 'text-red-500 border-red-500/30' : 'text-primary border-primary/30'}>
                {selectedMaterial.type.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[60vh] p-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {selectedMaterial.content.split('\n').map((line, idx) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={idx} className="text-xl font-bold text-foreground mt-6 mb-3">{line.replace('## ', '')}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-lg font-semibold text-foreground mt-4 mb-2">{line.replace('### ', '')}</h3>;
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={idx} className="font-bold text-foreground">{line.replace(/\*\*/g, '')}</p>;
                  } else if (line.startsWith('- ')) {
                    return <li key={idx} className="text-muted-foreground ml-4">{line.replace('- ', '')}</li>;
                  } else if (line.startsWith('✅') || line.startsWith('❌') || line.startsWith('⚠️') || line.startsWith('📥') || line.startsWith('⏱️')) {
                    return <p key={idx} className="text-muted-foreground">{line}</p>;
                  } else if (line.trim() === '') {
                    return <br key={idx} />;
                  } else {
                    return <p key={idx} className="text-muted-foreground">{line}</p>;
                  }
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Back Button */}
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-primary hover:bg-primary/10 mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Study Materials 📚
          </CardTitle>
          <p className="text-sm text-muted-foreground">Tap any subject to view materials</p>
        </CardHeader>
        <CardContent>
          {/* Subject Tabs - Scrollable */}
          <ScrollArea className="w-full mb-6">
            <div className="flex gap-2 pb-2">
              {availableSubjects.map(subject => (
                <Button
                  key={subject}
                  variant={selectedSubject === subject ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubject(subject)}
                  className="whitespace-nowrap capitalize shrink-0"
                >
                  {SUBJECT_DISPLAY_NAMES[subject] || subject.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Materials List */}
          <AnimatePresence mode="wait">
            {materials.length > 0 ? (
              <motion.div
                key={selectedSubject}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {materials.map((material, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleMaterialClick(material)}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {material.type === 'pdf' ? (
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-500" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{material.title}</p>
                        <p className="text-sm text-muted-foreground">{material.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={material.type === 'pdf' ? 'text-red-500 border-red-500/30' : 'text-primary border-primary/30'}>
                        {material.type.toUpperCase()}
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No materials available yet</p>
                <p className="text-sm">Materials for this subject coming soon! 📖</p>
              </div>
            )}
          </AnimatePresence>

          {/* Coming Soon Banner */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-green-500/10 border border-primary/20">
            <p className="text-sm text-center text-muted-foreground">
              <span className="font-semibold text-primary">More Coming:</span> Video tutorials & past question PDFs! 🚀
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
