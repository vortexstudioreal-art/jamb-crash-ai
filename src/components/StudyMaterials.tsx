import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, ArrowLeft, X, Download, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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

### B
- **Bite the bullet** - Face a difficult situation bravely
- **Break the ice** - Start a conversation
- **Burn the midnight oil** - Study/work late at night
- **By hook or by crook** - By any means necessary

### C
- **Call it a day** - Stop working
- **Cost an arm and a leg** - Very expensive
- **Cry over spilt milk** - Regret something that can't be changed
- **Cut corners** - Do something cheaply or quickly

### D
- **Dead of night** - Middle of the night
- **Down to earth** - Practical and realistic
- **Drop in the bucket** - Very small amount

### E
- **Easy as pie** - Very simple
- **Every cloud has a silver lining** - Good comes from bad

### F
- **Face the music** - Accept consequences
- **Fall on deaf ears** - Be ignored
- **Feather in one's cap** - An achievement

### G
- **Get cold feet** - Become nervous
- **Give the green light** - Give permission
- **Go the extra mile** - Do more than expected

### H
- **Hit the nail on the head** - Be exactly right
- **Hold your horses** - Wait, be patient

### I-J
- **In the nick of time** - Just in time
- **Jump on the bandwagon** - Follow a trend

### K-L
- **Keep an eye on** - Watch carefully
- **Let the cat out of the bag** - Reveal a secret
- **Look before you leap** - Think before acting

### M-N
- **Make ends meet** - Manage with limited money
- **No stone unturned** - Try everything possible

### O-P
- **Once in a blue moon** - Very rarely
- **Pull someone's leg** - Joke with someone
- **Put all eggs in one basket** - Risk everything

### R-S
- **Rain cats and dogs** - Rain heavily
- **Spill the beans** - Reveal information
- **Steal someone's thunder** - Take credit

### T-W
- **The ball is in your court** - It's your decision
- **Under the weather** - Feeling sick
- **When pigs fly** - Never

📥 Download full PDF with 500+ idioms`,
      pdfUrl: 'https://example.com/jamb-idioms.pdf'
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

📥 Download complete formula sheet`,
      pdfUrl: 'https://example.com/jamb-maths-formulas.pdf'
    },
    { 
      title: 'Past Question Patterns', 
      type: 'notes', 
      description: 'Most repeated topics',
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

### QUICK TIPS:
✅ Master indices - it's in EVERY exam
✅ Practice Venn diagrams with 3 sets
✅ Know your special angles by heart
✅ Standard deviation formula is a must`
    },
    { 
      title: 'Calculator Tricks', 
      type: 'notes', 
      description: 'Speed solving techniques',
      content: `## Speed Solving Techniques (No Calculator Needed!)

### MULTIPLICATION TRICKS

**Multiply by 11:**
- 23 × 11 = 2(2+3)3 = 253
- 45 × 11 = 4(4+5)5 = 495

**Multiply by 5:**
- Divide by 2, multiply by 10
- 48 × 5 = 48÷2 × 10 = 240

**Multiply by 25:**
- Divide by 4, multiply by 100
- 36 × 25 = 36÷4 × 100 = 900

**Multiply by 9:**
- Multiply by 10, subtract original
- 23 × 9 = 230 - 23 = 207

### SQUARING TRICKS

**Numbers ending in 5:**
- 25² = 2×3 | 25 = 625
- 35² = 3×4 | 25 = 1225
- 85² = 8×9 | 25 = 7225

**Numbers near 100:**
- 97² = 97-3 | 3² = 94 | 09 = 9409
- 103² = 103+3 | 3² = 106 | 09 = 10609

### PERCENTAGE TRICKS

**Finding X% of Y = Y% of X**
- 8% of 25 = 25% of 8 = 2

**15% of anything:**
- Find 10%, add half of it
- 15% of 80 = 8 + 4 = 12

### FRACTION TRICKS

**Comparing fractions:**
- Cross multiply: a/b vs c/d
- Compare a×d with b×c

### DIVISIBILITY RULES

- **By 2:** Last digit even
- **By 3:** Sum of digits divisible by 3
- **By 4:** Last 2 digits divisible by 4
- **By 5:** Ends in 0 or 5
- **By 6:** Divisible by 2 AND 3
- **By 9:** Sum of digits divisible by 9
- **By 11:** Alternating sum = 0 or ±11

### TIME-SAVING IN EXAM:
⏱️ Use these tricks to solve faster
⏱️ Estimate before calculating
⏱️ Eliminate impossible answers first`
    },
  ],
  physics: [
    { 
      title: 'Key Formulas Sheet', 
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
- Magnification: m = v/u = image height/object height

### ELECTRICITY

**Ohm's Law:** V = IR
**Power:** P = IV = I²R = V²/R
**Resistors:**
- Series: R = R₁ + R₂ + R₃
- Parallel: 1/R = 1/R₁ + 1/R₂ + 1/R₃

**Capacitors:**
- Series: 1/C = 1/C₁ + 1/C₂
- Parallel: C = C₁ + C₂

**Electric Field:** E = F/q = V/d
**Coulomb's Law:** F = kQ₁Q₂/r²

### HEAT & THERMODYNAMICS

- Q = mcΔθ (specific heat)
- Q = mL (latent heat)
- Gas Laws: PV/T = constant

📥 Download complete physics formula sheet`,
      pdfUrl: 'https://example.com/jamb-physics-formulas.pdf'
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
    { 
      title: 'Common Mistakes', 
      type: 'notes', 
      description: 'Errors to avoid in JAMB',
      content: `## Common Physics Mistakes to Avoid

### UNIT ERRORS ⚠️

**Always convert to SI units FIRST:**
- km → m (×1000)
- cm → m (÷100)
- g → kg (÷1000)
- minutes → seconds (×60)
- hours → seconds (×3600)

### SIGN ERRORS ⚠️

**Velocity vs Speed:**
- Velocity can be NEGATIVE (direction matters)
- Speed is always POSITIVE

**Deceleration:**
- Use NEGATIVE acceleration
- If slowing down: a = -value

### FORMULA MIX-UPS ⚠️

**Don't confuse:**
- KE = ½mv² (not mv²)
- v² = u² + 2as (not v = u + 2as)
- Power = Work/Time (not Force/Time)

### GRAPH MISTAKES ⚠️

**Velocity-Time Graphs:**
- Gradient = acceleration
- Area under curve = displacement

**Displacement-Time Graphs:**
- Gradient = velocity
- NOT acceleration!

### ELECTRICITY ERRORS ⚠️

**Resistors:**
- SERIES: R increases (add up)
- PARALLEL: R decreases (1/R formula)

**Capacitors:**
- SERIES: C decreases (1/C formula)
- PARALLEL: C increases (add up)

**Opposite rules!**

### LENS/MIRROR ERRORS ⚠️

**Sign Convention:**
- Real: Positive distance
- Virtual: Negative distance
- Concave mirror: Positive focal length
- Convex mirror: Negative focal length

### WAVE ERRORS ⚠️

**Don't confuse:**
- Frequency = 1/Period (NOT wavelength)
- v = fλ (velocity, not frequency)

### TOP TIPS:
✅ Always write units in calculations
✅ Draw diagrams for mechanics problems
✅ Check if answer makes physical sense
✅ Read question twice - what are they ACTUALLY asking?`
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
(More reactive metal displaces less reactive)

**Reactivity Series:**
K > Na > Ca > Mg > Al > Zn > Fe > Pb > H > Cu > Ag > Au

📥 Download complete periodic table with reactions`,
      pdfUrl: 'https://example.com/jamb-periodic-table.pdf'
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

### ISOMERISM

**Structural Isomers:**
Same molecular formula, different arrangement
- C₄H₁₀: Butane vs 2-methylpropane

**IUPAC Naming:**
1. Find longest carbon chain
2. Number from end nearest substituent
3. Name substituents with position

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
    { 
      title: 'Balancing Equations Guide', 
      type: 'notes', 
      description: 'Step-by-step balancing',
      content: `## How to Balance Chemical Equations

### THE GOLDEN RULE
Atoms in = Atoms out (Law of Conservation of Mass)

### STEP-BY-STEP METHOD

**Step 1:** Write the unbalanced equation
**Step 2:** Count atoms on each side
**Step 3:** Balance one element at a time
**Step 4:** Start with metals, then non-metals
**Step 5:** Balance H and O last
**Step 6:** Check your work!

### EXAMPLE 1: Simple Combustion

**Unbalanced:** CH₄ + O₂ → CO₂ + H₂O

**Count atoms:**
- Left: C=1, H=4, O=2
- Right: C=1, H=2, O=3

**Balance H:** CH₄ + O₂ → CO₂ + 2H₂O
**Balance O:** CH₄ + 2O₂ → CO₂ + 2H₂O ✅

### EXAMPLE 2: Metal + Acid

**Unbalanced:** Zn + HCl → ZnCl₂ + H₂

**Balance Cl:** Zn + 2HCl → ZnCl₂ + H₂
**Check H:** 2 on each side ✅
**Check Zn:** 1 on each side ✅

### EXAMPLE 3: Combustion of Alcohol

**Unbalanced:** C₂H₅OH + O₂ → CO₂ + H₂O

**Balance C:** C₂H₅OH + O₂ → 2CO₂ + H₂O
**Balance H:** C₂H₅OH + O₂ → 2CO₂ + 3H₂O
**Balance O:** C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O ✅

### TIPS FOR TRICKY EQUATIONS

**If stuck with O:**
- Try multiplying entire equation by 2
- Then balance O

**Polyatomic ions:**
- Treat as single unit if unchanged
- SO₄²⁻, NO₃⁻, CO₃²⁻

**Redox Reactions:**
- Use oxidation numbers
- Electrons lost = Electrons gained

### COMMON MISTAKES ⚠️

❌ Changing subscripts (H₂O → H₃O)
❌ Forgetting to count ALL atoms
❌ Not rechecking at the end

### PRACTICE THESE:

1. Fe + O₂ → Fe₂O₃
2. Al + H₂SO₄ → Al₂(SO₄)₃ + H₂
3. C₃H₈ + O₂ → CO₂ + H₂O

**Answers:**
1. 4Fe + 3O₂ → 2Fe₂O₃
2. 2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂
3. C₃H₈ + 5O₂ → 3CO₂ + 4H₂O`
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
};

export const StudyMaterials = ({ subjects, onBack }: StudyMaterialsProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(subjects[0] || 'english');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialContent | null>(null);

  // Filter to only show subjects that have materials
  const availableSubjects = subjects.filter(s => SUBJECT_MATERIALS[s]);

  const materials = selectedSubject ? (SUBJECT_MATERIALS[selectedSubject] || []) : [];

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
          <p className="text-sm text-muted-foreground">Tap any material to read or download</p>
        </CardHeader>
        <CardContent>
          {/* Subject Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {availableSubjects.map(subject => (
              <Button
                key={subject}
                variant={selectedSubject === subject ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubject(subject)}
                className="capitalize"
              >
                {SUBJECT_DISPLAY_NAMES[subject] || subject.replace('_', ' ')}
              </Button>
            ))}
          </div>

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
              <span className="font-semibold text-primary">More Coming:</span> Video tutorials and past question PDFs! 🚀
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
