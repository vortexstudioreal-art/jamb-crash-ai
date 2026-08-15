import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS = [
  // 1. ATOMIC STRUCTURE
  {
    subject: "chemistry",
    topic: "Atomic Structure",
    subtopic: "Basic Concepts",
    title: "Atomic Structure — The Building Blocks of Matter",
    learning_objectives: [
      "Describe the structure of an atom (protons, neutrons, electrons)",
      "Define atomic number and mass number",
      "Explain electron configuration and energy levels",
      "Distinguish between isotopes and their applications",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "atomic_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Everything you see — your phone, the air, your body — is made of atoms. But atoms aren't solid balls. They have a tiny nucleus with protons and neutrons, and electrons flying around it. Here's the wild part: if an atom were the size of a football stadium, the nucleus would be the size of a marble in the centre. Most of the atom is empty space!",
          prediction_prompt: "If two atoms have the same number of protons but different numbers of neutrons, are they the same element? What do we call them?",
        },
      },
      {
        id: "atomic_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Think of an atom like a solar system. The nucleus (protons + neutrons) is the sun at the centre. Electrons are planets orbiting around it — but unlike real planets, electrons exist in specific energy levels (shells), not just anywhere. The number of protons determines WHAT the element is. Carbon always has 6 protons. Oxygen always has 8.",
          analogy: "Imagine a school with classrooms (energy levels). The first classroom holds 2 students, the second holds 8, the third holds 18. Students (electrons) fill the closest classrooms first. The number of students in the outermost classroom determines how the atom behaves chemically.",
        },
      },
      {
        id: "atomic_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "An atom consists of a nucleus containing protons (positive charge, mass ≈ 1 amu) and neutrons (no charge, mass ≈ 1 amu). Electrons (negative charge, mass ≈ 0 amu) occupy energy levels outside the nucleus. The atomic number (Z) = number of protons. The mass number (A) = protons + neutrons. Number of neutrons = A − Z.",
          key_terms: [
            { term: "Atomic Number (Z)", definition: "Number of protons in the nucleus. Defines the element." },
            { term: "Mass Number (A)", definition: "Total number of protons and neutrons in the nucleus." },
            { term: "Isotopes", definition: "Atoms of the same element with different mass numbers (different neutrons)." },
            { term: "Electron Configuration", definition: "Distribution of electrons among energy levels and sub-levels." },
          ],
        },
      },
      {
        id: "atomic_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "A = Z + N",
          variables: [
            { name: "A", description: "Mass number", unit: "none" },
            { name: "Z", description: "Atomic number (protons)", unit: "none" },
            { name: "N", description: "Number of neutrons", unit: "none" },
          ],
          when_to_use: "When you need to find the number of neutrons, or given neutrons and atomic number, find the mass number.",
          common_traps: [
            "Confusing atomic number with mass number. Atomic number = protons only.",
            "Forgetting that isotopes of the same element have the same Z but different A.",
            "Writing electron configuration incorrectly — remember 2, 8, 18, 32 maximum per shell.",
          ],
          units_note: "Atomic number and mass number are counts — they have no units.",
        },
      },
      {
        id: "atomic_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "An element X has atomic number 17 and mass number 35. Determine the number of protons, neutrons, and electrons in a neutral atom of X. Write its electron configuration.",
          steps: [
            "Protons = Atomic number = 17",
            "Neutrons = Mass number − Atomic number = 35 − 17 = 18",
            "Electrons = Protons (for neutral atom) = 17",
            "Electron configuration: 2, 8, 7 (first shell: 2, second: 8, third: 7)",
          ],
          answer: "Protons = 17, Neutrons = 18, Electrons = 17. Configuration: 2, 8, 7. Element is Chlorine (Cl).",
          explanation: "The atomic number tells you everything about the element's identity. With 17 electrons filling shells as 2, 8, 7, we can predict it will gain 1 electron to complete its outer shell — which is exactly what chlorine does.",
        },
      },
      {
        id: "atomic_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Very common — appears in nearly every JAMB Chemistry paper",
          typical_question: "Calculate the number of neutrons in an atom of ²³₅U. [Answer: 235 − 92 = 143 neutrons]",
          common_mistakes: [
            "Using mass number as the atomic number",
            "Forgetting that electrons = protons only in neutral atoms (ions have different electron counts)",
          ],
          exam_tip: "When you see notation like ¹⁴₆C, the top number is mass number (A) and bottom is atomic number (Z). Always remember: N = A − Z.",
        },
      },
      {
        id: "atomic_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "How many neutrons are in an atom of Carbon-14?",
              options: ["6", "8", "14", "10"],
              correct_index: 1,
              explanation: "Carbon has atomic number 6. Neutrons = 14 − 6 = 8.",
            },
            {
              question: "Which particle determines the chemical properties of an atom?",
              options: ["Protons", "Neutrons", "Electrons", "Nucleus"],
              correct_index: 2,
              explanation: "Chemical properties are determined by the number and arrangement of electrons, especially the outermost (valence) electrons.",
            },
            {
              question: "Two atoms have the same atomic number but different mass numbers. They are:",
              options: ["Isotopes", "Isomers", "Ions", "Allotropes"],
              correct_index: 0,
              explanation: "Same atomic number = same element. Different mass number = different number of neutrons. These are isotopes.",
            },
          ],
        },
      },
      {
        id: "atomic_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Atomic number = protons = electrons (in neutral atoms)",
            "Mass number = protons + neutrons",
            "Isotopes: same element, different neutrons",
            "Electron configuration: 2, 8, 18, 32 max per shell",
          ],
          connections: [
            "Leads to: Chemical Bonding (how atoms combine)",
            "Leads to: Periodic Table (arrangement by atomic number)",
            "Builds on: Basic Chemistry concepts",
          ],
        },
      },
      {
        id: "atomic_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Atomic Structure",
          min_score: 80,
          required_sections: ["atomic_hook_01", "atomic_intuitive_01", "atomic_formal_01", "atomic_formula_01", "atomic_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 2. CHEMICAL BONDING
  {
    subject: "chemistry",
    topic: "Chemical Bonding",
    subtopic: "Basic Concepts",
    title: "Chemical Bonding — How Atoms Join Together",
    learning_objectives: [
      "Explain the three types of chemical bonding (ionic, covalent, metallic)",
      "Predict the type of bond formed between elements",
      "Draw Lewis dot structures for simple molecules",
      "Relate bonding to physical properties (melting point, conductivity)",
    ],
    difficulty_level: "medium",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "bonding_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Why does salt (NaCl) dissolve in water but not conduct electricity as a solid? Why is diamond the hardest natural material but graphite (also pure carbon) is soft enough to write with? The answer lies in how atoms are bonded together. Chemical bonding is the reason materials behave the way they do.",
          prediction_prompt: "If sodium (Na) has 1 valence electron and chlorine (Cl) has 7, what do you think happens when they meet?",
        },
      },
      {
        id: "bonding_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Atoms bond because they want to be stable — specifically, they want a full outer shell (usually 8 electrons, the octet rule). They achieve this in three main ways: (1) Transfer electrons completely (ionic), (2) Share electrons (covalent), (3) Delocalize electrons across a sea (metallic). Think of it like three different ways people solve problems — each method works differently.",
          analogy: "Imagine you have 1 apple and your friend has 7. You need 8 to be happy. Option 1: Give your 1 apple away — now you have 0 but you've 'completed' someone else's set (ionic bonding). Option 2: Pool your apples together and share — you both have access to 8 (covalent bonding). Option 3: Put all your apples in a community basket everyone can access (metallic bonding).",
        },
      },
      {
        id: "bonding_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Ionic bonding involves transfer of electrons from a metal to a non-metal, forming positive and negative ions held by electrostatic attraction. Covalent bonding involves sharing of electron pairs between non-metal atoms. Metallic bonding involves metal cations in a 'sea' of delocalized electrons.",
          key_terms: [
            { term: "Ionic Bond", definition: "Electrostatic attraction between oppositelyely charged ions formed by electron transfer" },
            { term: "Covalent Bond", definition: "A shared pair of electrons between two non-metal atoms" },
            { term: "Metallic Bond", definition: "Attraction between metal cations and delocalized valence electrons" },
            { term: "Octet Rule", definition: "Atoms tend to gain, lose, or share electrons to achieve 8 electrons in their outer shell" },
          ],
        },
      },
      {
        id: "bonding_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Lewis dot structures show valence electrons as dots around element symbols",
          variables: [
            { name: "Valence electrons", description: "Electrons in the outermost shell", unit: "count" },
            { name: "Bonding pairs", description: "Electrons shared between atoms", unit: "count" },
            { name: "Lone pairs", description: "Non-bonding electrons on an atom", unit: "count" },
          ],
          when_to_use: "Use Lewis structures to visualize how atoms share or transfer electrons in molecules and ionic compounds.",
          common_traps: [
            "Forgetting that ionic compounds form crystal lattices, not discrete molecules",
            "Drawing covalent bonds as ionic (or vice versa)",
            "Not counting all valence electrons in the structure",
          ],
          units_note: "Lewis structures are diagrams — no units, but they represent electron counts.",
        },
      },
      {
        id: "bonding_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "Draw the Lewis structure for water (H₂O) and identify the number of bonding pairs and lone pairs on oxygen.",
          steps: [
            "H has 1 valence electron, O has 6. Total = 2(1) + 6 = 8 valence electrons",
            "O is the central atom. Connect each H with a single bond (2 electrons used)",
            "Place remaining 6 electrons as lone pairs on O: 3 pairs",
            "Check: O has 2 bonding pairs + 2 lone pairs = 8 electrons (octet satisfied)",
          ],
          answer: "Oxygen has 2 bonding pairs (O-H bonds) and 2 lone pairs. Total: 4 electron pairs around oxygen.",
          explanation: "Water's bent shape comes from the 2 lone pairs repelling the bonding pairs. This is why water is polar — a key property for its role as a solvent.",
        },
      },
      {
        id: "bonding_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Very common — bonding questions appear in almost every paper",
          typical_question: "State the type of bonding in: (a) NaCl, (b) H₂O, (c) Fe. Explain why NaCl conducts electricity when molten but not as a solid.",
          common_mistakes: [
            "Saying ionic compounds have 'molecules' — they have formula units in a lattice",
            "Forgetting that metallic bonding explains electrical conductivity in metals",
            "Confusing polar covalent with ionic bonding",
          ],
          exam_tip: "When asked to identify bonding, look at the elements: Metal + Non-metal → Ionic. Non-metal + Non-metal → Covalent. Metal + Metal → Metallic.",
        },
      },
      {
        id: "bonding_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "What type of bond is formed between Sodium (Na) and Chlorine (Cl)?",
              options: ["Covalent", "Ionic", "Metallic", "Hydrogen"],
              correct_index: 1,
              explanation: "Na is a metal, Cl is a non-metal. Na transfers 1 electron to Cl, forming Na⁺ and Cl⁻ ions held by ionic bonding.",
            },
            {
              question: "Which substance does NOT conduct electricity?",
              options: ["Copper metal", "Molten NaCl", "Diamond", "Graphite"],
              correct_index: 2,
              explanation: "Diamond has all electrons locked in covalent bonds with no free carriers. Copper has delocalized electrons. Molten NaCl has free ions. Graphite has delocalized electrons between layers.",
            },
            {
              question: "How many lone pairs are on the central atom in NH₃?",
              options: ["0", "1", "2", "3"],
              correct_index: 1,
              explanation: "N has 5 valence electrons. 3 are used in N-H bonds. 2 remain = 1 lone pair. NH₃ has 3 bonding pairs and 1 lone pair.",
            },
          ],
        },
      },
      {
        id: "bonding_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Ionic: metal + non-metal, electron transfer, high melting point, conducts when molten/dissolved",
            "Covalent: non-metal + non-metal, electron sharing, low melting point, poor conductor",
            "Metallic: metal + metal, delocalized electrons, conducts in solid state",
            "Octet rule drives most bonding behaviour",
          ],
          connections: [
            "Leads to: Molecular Geometry (VSEPR theory)",
            "Leads to: Properties of Materials",
            "Builds on: Atomic Structure (electron configuration)",
          ],
        },
      },
      {
        id: "bonding_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Chemical Bonding",
          min_score: 80,
          required_sections: ["bonding_hook_01", "bonding_intuitive_01", "bonding_formal_01", "bonding_formula_01", "bonding_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 3. ACIDS, BASES AND SALTS
  {
    subject: "chemistry",
    topic: "Acids, Bases and Salts",
    subtopic: "Basic Concepts",
    title: "Acids, Bases and Salts — The Chemistry of Everyday Life",
    learning_objectives: [
      "Define acids, bases, and salts with examples",
      "Explain the pH scale and its significance",
      "Describe neutralization reactions and their applications",
      "Perform calculations involving concentration and dilution",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "acids_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Lemon juice tastes sour because of citric acid. Soap feels slippery because it's a base. Table salt is a neutral compound. These everyday experiences are all about acids, bases, and salts. Understanding them helps you know why antacids work, why soil pH matters for farming, and why some chemicals are dangerous while others are harmless.",
          prediction_prompt: "If you mix an acid with a base, what do you think happens? Can you guess the products?",
        },
      },
      {
        id: "acids_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Acids donate hydrogen ions (H⁺) in solution. They taste sour, turn blue litmus red, and react with metals to produce hydrogen gas. Bases accept H⁺ ions (or donate OH⁻ ions). They taste bitter, feel slippery, and turn red litmus blue. When you mix an acid with a base, they neutralize each other — producing a salt and water.",
          analogy: "Think of acids and bases as opposites. Acid is like adding heat to a room; base is like adding cold. When you add equal amounts, the temperature balances out (neutral). The 'balance point' is pH 7.",
        },
      },
      {
        id: "acids_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "An acid is a substance that donates H⁺ ions (proton donor). A base is a substance that accepts H⁺ ions (proton acceptor). An alkali is a soluble base. Salts are ionic compounds formed from the reaction of an acid with a base, metal, or metal carbonate. The pH scale ranges from 0 (strongly acidic) to 14 (strongly alkaline), with 7 being neutral.",
          key_terms: [
            { term: "Acid", definition: "Proton (H⁺) donor. Turns blue litmus red. pH < 7" },
            { term: "Base", definition: "Proton acceptor. Turns red litmus blue. pH > 7" },
            { term: "Salt", definition: "Ionic compound from acid-base reaction. E.g., NaCl from HCl + NaOH" },
            { term: "Neutralization", definition: "Acid + Base → Salt + Water" },
          ],
        },
      },
      {
        id: "acids_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "pH = −log₁₀[H⁺]",
          variables: [
            { name: "pH", description: "Measure of acidity/alkalinity", unit: "none" },
            { name: "[H⁺]", description: "Concentration of hydrogen ions", unit: "mol/dm³" },
          ],
          when_to_use: "When you need to calculate pH from ion concentration, or find concentration from pH.",
          common_traps: [
            "Confusing pH with concentration — lower pH means HIGHER H⁺ concentration",
            "Forgetting that pH is logarithmic — pH 3 is 10× more acidic than pH 4",
            "Not converting units properly (e.g., mmol to mol)",
          ],
          units_note: "pH has no units. Concentration must be in mol/dm³ (or mol/L) for the formula.",
        },
      },
      {
        id: "acids_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "Calculate the pH of a solution with [H⁺] = 0.001 mol/dm³. Is it acidic, neutral, or alkaline?",
          steps: [
            "pH = −log₁₀[H⁺]",
            "pH = −log₁₀(0.001)",
            "0.001 = 10⁻³, so log₁₀(0.001) = −3",
            "pH = −(−3) = 3",
          ],
          answer: "pH = 3. The solution is acidic (pH < 7).",
          explanation: "A pH of 3 means the solution is 1000× more acidic than pure water (pH 7). This is roughly the pH of vinegar or orange juice.",
        },
      },
      {
        id: "acids_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Very common — acids, bases, and salts are core JAMB Chemistry topics",
          typical_question: "25 cm³ of 0.1 mol/dm³ HCl is neutralized by 20 cm³ of NaOH. Calculate the concentration of NaOH.",
          common_mistakes: [
            "Using the wrong formula in titration calculations (n₁V₁ = n₂V₂ for 1:1 reactions)",
            "Forgetting that strong acids completely ionize while weak acids partially ionize",
            "Confusing indicators — methyl orange changes at pH 3.1-4.4, phenolphthalein at pH 8.2-10",
          ],
          exam_tip: "For titration: write the balanced equation first. Then use n = c × v to find moles of one reactant, then use the mole ratio to find the other.",
        },
      },
      {
        id: "acids_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "What is the pH of a solution with [H⁺] = 10⁻⁴ mol/dm³?",
              options: ["4", "10", "−4", "14"],
              correct_index: 0,
              explanation: "pH = −log₁₀(10⁻⁴) = 4.",
            },
            {
              question: "Which indicator is best for a strong acid-strong base titration?",
              options: ["Methyl orange", "Phenolphthalein", "Litmus paper", "Universal indicator"],
              correct_index: 1,
              explanation: "Phenolphthalein is ideal because it changes sharply at pH 8.2-10, which is near the equivalence point of strong acid-strong base titrations.",
            },
            {
              question: "Which acid is found in vinegar?",
              options: ["Hydrochloric acid", "Sulphuric acid", "Acetic acid", "Citric acid"],
              correct_index: 2,
              explanation: "Vinegar contains acetic acid (ethanoic acid, CH₃COOH) at about 5% concentration.",
            },
          ],
        },
      },
      {
        id: "acids_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Acids donate H⁺, bases accept H⁺",
            "pH scale: 0-14, logarithmic, 7 is neutral",
            "Neutralization: Acid + Base → Salt + Water",
            "pH = −log₁₀[H⁺]",
          ],
          connections: [
            "Leads to: Electrochemistry (electrolysis of salts)",
            "Leads to: Organic Chemistry (carboxylic acids)",
            "Builds on: Chemical Bonding (ionic compounds)",
          ],
        },
      },
      {
        id: "acids_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Acids, Bases and Salts",
          min_score: 80,
          required_sections: ["acids_hook_01", "acids_intuitive_01", "acids_formal_01", "acids_formula_01", "acids_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 4. STOICHIOMETRY
  {
    subject: "chemistry",
    topic: "Stoichiometry",
    subtopic: "Basic Concepts",
    title: "Stoichiometry — The Math of Chemical Reactions",
    learning_objectives: [
      "Write and balance chemical equations",
      "Calculate molar masses from atomic masses",
      "Use the mole concept to perform calculations",
      "Determine limiting reagents and theoretical yields",
    ],
    difficulty_level: "hard",
    estimated_minutes: 25,
    content_sections: [
      {
        id: "stoich_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "If you have 12 balls of flour, 8 eggs, and 200g of sugar, how many cakes can you bake? You'd run out of eggs first — that's the limiting ingredient. Stoichiometry does the same thing but with chemicals. It tells you exactly how much of each chemical you need and how much product you'll get.",
          prediction_prompt: "In the reaction 2H₂ + O₂ → 2H₂O, if you have 5 molecules of H₂ and 3 molecules of O₂, which one runs out first?",
        },
      },
      {
        id: "stoich_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Chemical equations are like recipes. The coefficients (numbers in front) tell you the ratio of ingredients. 2H₂ + O₂ → 2H₂O means: 2 molecules of hydrogen react with 1 molecule of oxygen to make 2 molecules of water. The ratio is always fixed. If you change the amounts, one chemical runs out first — that's the limiting reagent.",
          analogy: "Think of a bicycle. Each bicycle needs 2 wheels and 1 frame. If you have 10 wheels and 3 frames, you can only make 3 bicycles (you run out of frames). 4 wheels are left over (excess). The frames are the limiting reagent.",
        },
      },
      {
        id: "stoich_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Stoichiometry is the quantitative study of reactants and products in chemical reactions. The mole concept is central: 1 mole = 6.022 × 10²³ particles (Avogadro's number). Molar mass = atomic/molecular mass in grams. From a balanced equation, mole ratios give the stoichiometric relationships.",
          key_terms: [
            { term: "Mole", definition: "Amount of substance containing 6.022 × 10²³ particles (Avogadro's number)" },
            { term: "Molar Mass", definition: "Mass of 1 mole of a substance in grams (numerically equal to molecular mass)" },
            { term: "Limiting Reagent", definition: "The reactant that is completely consumed first, limiting the amount of product" },
            { term: "Theoretical Yield", definition: "Maximum amount of product that can be formed from given reactants" },
          ],
        },
      },
      {
        id: "stoich_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "n = m / M = N / Nₐ = c × V",
          variables: [
            { name: "n", description: "Number of moles", unit: "mol" },
            { name: "m", description: "Mass", unit: "g" },
            { name: "M", description: "Molar mass", unit: "g/mol" },
            { name: "N", description: "Number of particles", unit: "count" },
            { name: "Nₐ", description: "Avogadro's number", unit: "6.022 × 10²³" },
            { name: "c", description: "Concentration", unit: "mol/dm³" },
            { name: "V", description: "Volume", unit: "dm³" },
          ],
          when_to_use: "These formulas connect mass, moles, particles, and concentration — the four pillars of stoichiometry.",
          common_traps: [
            "Using atomic mass instead of molar mass (should be in grams, not amu)",
            "Forgetting to balance the equation before doing calculations",
            "Not converting volume from cm³ to dm³ (divide by 1000)",
          ],
          units_note: "Always work in moles, grams, and dm³ for consistency. Convert cm³ to dm³ by dividing by 1000.",
        },
      },
      {
        id: "stoich_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "How many grams of water are produced when 4 g of hydrogen reacts completely with excess oxygen? (H = 1, O = 16)",
          steps: [
            "Write the balanced equation: 2H₂ + O₂ → 2H₂O",
            "Calculate moles of H₂: n = m/M = 4/2 = 2 mol",
            "From equation: 2 mol H₂ produces 2 mol H₂O (ratio 1:1)",
            "Moles of H₂O = 2 mol",
            "Mass of H₂O = n × M = 2 × 18 = 36 g",
          ],
          answer: "36 g of water is produced.",
          explanation: "The key step is using the mole ratio from the balanced equation. Since 2 mol H₂ gives 2 mol H₂O, the ratio is 1:1. Then convert moles back to mass using the molar mass of water (18 g/mol).",
        },
      },
      {
        id: "stoich_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Very common — stoichiometry calculations appear in every JAMB Chemistry paper",
          typical_question: "10 g of calcium carbonate (CaCO₃) is heated. Calculate the volume of CO₂ produced at RTP. [Ca = 40, C = 12, O = 16, Molar gas volume = 24 dm³/mol]",
          common_mistakes: [
            "Forgetting to use the balanced equation to get the mole ratio",
            "Using molar gas volume (24 dm³) instead of converting to moles first",
            "Arithmetic errors when calculating molar masses",
          ],
          exam_tip: "For gas volume questions: find moles of gas from the equation, then multiply by 24 dm³/mol (at RTP). For mass questions: moles × molar mass.",
        },
      },
      {
        id: "stoich_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "How many moles are in 36 g of water? (H = 1, O = 16)",
              options: ["1 mol", "2 mol", "3 mol", "18 mol"],
              correct_index: 1,
              explanation: "Molar mass of H₂O = 18 g/mol. n = 36/18 = 2 mol.",
            },
            {
              question: "In 2H₂ + O₂ → 2H₂O, if you have 3 mol H₂ and 2 mol O₂, which is the limiting reagent?",
              options: ["H₂", "O₂", "Neither", "Cannot determine"],
              correct_index: 1,
              explanation: "3 mol H₂ requires 1.5 mol O₂ (ratio 2:1). You have 2 mol O₂, so H₂ runs out first. H₂ is limiting.",
            },
            {
              question: "What is the volume of 2 mol of gas at RTP?",
              options: ["12 dm³", "24 dm³", "48 dm³", "22.4 dm³"],
              correct_index: 2,
              explanation: "At RTP, 1 mol of gas occupies 24 dm³. 2 mol = 2 × 24 = 48 dm³.",
            },
          ],
        },
      },
      {
        id: "stoich_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Always balance the equation first",
            "n = m/M = N/Nₐ = c × V",
            "Mole ratio from equation connects reactants to products",
            "Limiting reagent determines theoretical yield",
          ],
          connections: [
            "Leads to: Concentration calculations",
            "Leads to: Gas volume calculations",
            "Builds on: Atomic Structure and Molar Mass",
          ],
        },
      },
      {
        id: "stoich_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Stoichiometry",
          min_score: 80,
          required_sections: ["stoich_hook_01", "stoich_intuitive_01", "stoich_formal_01", "stoich_formula_01", "stoich_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 5. CHEMICAL EQUILIBRIUM
  {
    subject: "chemistry",
    topic: "Chemical Equilibrium",
    subtopic: "Basic Concepts",
    title: "Chemical Equilibrium — When Reactions Balance",
    learning_objectives: [
      "Define dynamic equilibrium and its conditions",
      "State and apply Le Chatelier's Principle",
      "Write equilibrium constant expressions (Kc and Kp)",
      "Predict the effect of changes on equilibrium position",
    ],
    difficulty_level: "hard",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "equil_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Imagine a busy highway where cars are going both ways at the same rate. The traffic looks still, but cars are constantly moving. That's dynamic equilibrium — forward and reverse reactions happen at equal rates. Understanding this helps chemists maximize product yield in industrial processes like the Haber process for ammonia.",
          prediction_prompt: "If you add more reactant to a system at equilibrium, which direction will the reaction shift to restore balance?",
        },
      },
      {
        id: "equil_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Chemical equilibrium occurs when the rate of the forward reaction equals the rate of the reverse reaction. The concentrations of reactants and products remain constant (but not necessarily equal). Le Chatelier's Principle says: if you disturb a system at equilibrium, it will shift to counteract the disturbance. It's nature's way of maintaining balance.",
          analogy: "Think of a crowded room with people constantly entering and leaving at the same rate. The total number of people stays the same (equilibrium). If you open more doors to let people in (add reactant), more people will also leave (forward reaction increases) until a new balance is reached.",
        },
      },
      {
        id: "equil_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "For a reaction aA + bB ⇌ cC + dD, the equilibrium constant Kc = [C]ᶜ[D]ᵈ / [A]ᵃ[B]ᵇ. Kp uses partial pressures instead of concentrations. Le Chatelier's Principle: increasing concentration, pressure, or temperature shifts equilibrium to counteract the change. Catalysts speed up both forward and reverse reactions equally — they don't shift equilibrium.",
          key_terms: [
            { term: "Dynamic Equilibrium", definition: "Forward and reverse reactions occur at equal rates; concentrations are constant" },
            { term: "Le Chatelier's Principle", definition: "A system at equilibrium counteracts any imposed change" },
            { term: "Kc", definition: "Equilibrium constant in terms of concentration" },
            { term: "Kp", definition: "Equilibrium constant in terms of partial pressures" },
          ],
        },
      },
      {
        id: "equil_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Kc = [C]ᶜ[D]ᵈ / [A]ᵃ[B]ᵇ",
          variables: [
            { name: "Kc", description: "Equilibrium constant (concentration)", unit: "varies" },
            { name: "[A], [B]", description: "Equilibrium concentrations of reactants", unit: "mol/dm³" },
            { name: "[C], [D]", description: "Equilibrium concentrations of products", unit: "mol/dm³" },
            { name: "a, b, c, d", description: "Stoichiometric coefficients from balanced equation", unit: "none" },
          ],
          when_to_use: "When you know equilibrium concentrations and need to calculate Kc, or know Kc and need to find concentrations.",
          common_traps: [
            "Using initial concentrations instead of equilibrium concentrations",
            "Forgetting to raise concentrations to the power of their coefficients",
            "Not including pure solids or liquids in the expression",
          ],
          units_note: "Kc may have units depending on the reaction. Kp uses partial pressures (usually in atm or Pa).",
        },
      },
      {
        id: "equil_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "For N₂(g) + 3H₂(g) ⇌ 2NH₃(g), at equilibrium: [N₂] = 0.5, [H₂] = 1.5, [NH₃] = 0.8 mol/dm³. Calculate Kc.",
          steps: [
            "Write the Kc expression: Kc = [NH₃]² / ([N₂][H₂]³)",
            "Substitute values: Kc = (0.8)² / ((0.5)(1.5)³)",
            "Calculate numerator: 0.8² = 0.64",
            "Calculate denominator: 0.5 × 3.375 = 1.6875",
            "Kc = 0.64 / 1.6875 ≈ 0.379",
          ],
          answer: "Kc ≈ 0.38 (no units in this case)",
          explanation: "A small Kc (< 1) means reactants are favoured at equilibrium. To make more NH₃ industrially, you need high pressure and low temperature (Le Chatelier's Principle).",
        },
      },
      {
        id: "equil_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Common — equilibrium and Le Chatelier's Principle are frequent JAMB topics",
          typical_question: "Explain the effect of increasing pressure on the equilibrium: N₂(g) + 3H₂(g) ⇌ 2NH₃(g)",
          common_mistakes: [
            "Thinking increasing pressure always shifts to the side with fewer moles (only for gaseous species)",
            "Forgetting that catalysts don't affect equilibrium position",
            "Confusing the effect of temperature on exothermic vs endothermic reactions",
          ],
          exam_tip: "For pressure: count moles of gas on each side. More moles → shift away. For temperature: treat heat as a product (exothermic) or reactant (endothermic).",
        },
      },
      {
        id: "equil_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "At equilibrium, forward and reverse reaction rates are:",
              options: ["Zero", "Equal", "Different", "Maximum"],
              correct_index: 1,
              explanation: "Dynamic equilibrium means forward rate = reverse rate. Both reactions continue, but there's no net change.",
            },
            {
              question: "Adding a catalyst to a system at equilibrium will:",
              options: ["Shift equilibrium to products", "Shift equilibrium to reactants", "Have no effect on equilibrium", "Increase Kc"],
              correct_index: 2,
              explanation: "A catalyst speeds up both forward and reverse reactions equally. It doesn't change the equilibrium position or Kc.",
            },
            {
              question: "For the Haber process, which condition favours NH₃ production?",
              options: ["Low pressure, high temperature", "High pressure, low temperature", "Low pressure, low temperature", "High pressure, high temperature"],
              correct_index: 1,
              explanation: "High pressure shifts equilibrium to the side with fewer moles (products). Low temperature favours the exothermic forward reaction.",
            },
          ],
        },
      },
      {
        id: "equil_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Equilibrium: forward rate = reverse rate, concentrations constant",
            "Le Chatelier's: system counteracts disturbances",
            "Kc = products/reactants (raised to coefficients)",
            "Catalysts speed up both directions equally — no shift",
          ],
          connections: [
            "Leads to: Industrial processes (Haber, Contact process)",
            "Leads to: pH and buffer calculations",
            "Builds on: Chemical Bonding and Reaction Rates",
          ],
        },
      },
      {
        id: "equil_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Chemical Equilibrium",
          min_score: 80,
          required_sections: ["equil_hook_01", "equil_intuitive_01", "equil_formal_01", "equil_formula_01", "equil_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 6. ELECTROCHEMISTRY
  {
    subject: "chemistry",
    topic: "Electrochemistry",
    subtopic: "Basic Concepts",
    title: "Electrochemistry — Electricity from Chemical Reactions",
    learning_objectives: [
      "Distinguish between galvanic and electrolytic cells",
      "Identify anode, cathode, and direction of electron flow",
      "Calculate electrode potentials and cell EMF",
      "Explain electrolysis and its applications",
    ],
    difficulty_level: "hard",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "electrochem_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Your phone battery, the corrosion of iron, electroplating of jewellery, and even how your body transmits nerve impulses — all involve electrochemistry. It's the bridge between chemistry and electricity. Understanding it helps you know why batteries die, how rust forms, and why we can extract metals from ores using electricity.",
          prediction_prompt: "If you connect a zinc rod to a copper rod and dip them in a salt bridge, what do you think happens? Which rod dissolves?",
        },
      },
      {
        id: "electrochem_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Some chemical reactions produce electricity (galvanic/voltaic cells — like batteries). Others use electricity to drive non-spontaneous reactions (electrolytic cells — like electroplating). In both cases, oxidation happens at the anode and reduction at the cathode. Electrons always flow from anode to cathode through the external circuit.",
          analogy: "Think of a galvanic cell like a waterfall — water (electrons) flows downhill naturally, releasing energy. An electrolytic cell is like pumping water uphill — you need to put energy in (from a battery) to make it happen.",
        },
      },
      {
        id: "electrochem_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "A galvanic cell converts chemical energy to electrical energy using spontaneous redox reactions. An electrolytic cell uses electrical energy to drive non-spontaneous reactions. The anode is where oxidation occurs (loss of electrons). The cathode is where reduction occurs (gain of electrons). Electrons flow from anode to cathode externally. Current flows from cathode to anode.",
          key_terms: [
            { term: "Anode", definition: "Electrode where oxidation occurs. Negative in galvanic, positive in electrolytic" },
            { term: "Cathode", definition: "Electrode where reduction occurs. Positive in galvanic, negative in electrolytic" },
            { term: "EMF", definition: "Electromotive force — the potential difference of a cell at equilibrium" },
            { term: "Electrolysis", definition: "Using electricity to decompose an electrolyte" },
          ],
        },
      },
      {
        id: "electrochem_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "E°cell = E°cathode − E°anode",
          variables: [
            { name: "E°cell", description: "Standard cell EMF", unit: "V" },
            { name: "E°cathode", description: "Standard reduction potential of cathode", unit: "V" },
            { name: "E°anode", description: "Standard reduction potential of anode", unit: "V" },
          ],
          when_to_use: "When you need to calculate the EMF of a galvanic cell from standard electrode potentials.",
          common_traps: [
            "Swapping anode and cathode — remember: oxidation at anode, reduction at cathode",
            "Forgetting the negative sign: E°cell = E°cathode − E°anode (not plus)",
            "Confusing which electrode is which in electrolytic vs galvanic cells",
          ],
          units_note: "Electrode potentials are measured in volts (V) under standard conditions (298 K, 1 mol/dm³, 1 atm).",
        },
      },
      {
        id: "electrochem_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "Calculate the EMF of a Daniell cell: Zn | Zn²⁺ || Cu²⁺ | Cu. Given E°(Zn²⁺/Zn) = −0.76 V and E°(Cu²⁺/Cu) = +0.34 V.",
          steps: [
            "Identify: Zn is oxidized (anode), Cu²⁺ is reduced (cathode)",
            "E°cell = E°cathode − E°anode",
            "E°cell = (+0.34) − (−0.76)",
            "E°cell = 0.34 + 0.76 = 1.10 V",
          ],
          answer: "E°cell = 1.10 V",
          explanation: "The positive EMF confirms the reaction is spontaneous. Zinc dissolves at the anode (oxidized) while copper plates out at the cathode (reduced). This is the principle behind Daniell cells.",
        },
      },
      {
        id: "electrochem_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Common — electrochemistry and electrolysis are regular JAMB topics",
          typical_question: "Describe the electrolysis of molten NaCl. What is produced at each electrode?",
          common_mistakes: [
            "Confusing molten NaCl with aqueous NaCl (different products)",
            "Forgetting that in electrolysis, anode is positive (connected to positive terminal)",
            "Not writing the half-equations for electrode reactions",
          ],
          exam_tip: "For electrolysis: always check if the electrolyte is molten or aqueous. Molten = only the cation and anion. Aqueous = water may also be discharged.",
        },
      },
      {
        id: "electrochem_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "In a galvanic cell, electrons flow from:",
              options: ["Cathode to anode", "Anode to cathode", "Positive to negative", "Nowhere (no flow)"],
              correct_index: 1,
              explanation: "Electrons always flow from anode (where oxidation releases electrons) to cathode (where reduction consumes electrons) through the external circuit.",
            },
            {
              question: "During electrolysis of CuSO₄ solution with copper electrodes, what happens at the anode?",
              options: ["Cu²⁺ is deposited", "Cu dissolves", "O₂ is produced", "H₂ is produced"],
              correct_index: 1,
              explanation: "With copper electrodes, the copper anode dissolves: Cu → Cu²⁺ + 2e⁻. This is used in copper refining.",
            },
            {
              question: "Which reaction occurs at the cathode?",
              options: ["Oxidation", "Reduction", "Both", "Neither"],
              correct_index: 1,
              explanation: "Reduction (gain of electrons) always occurs at the cathode. Remember: 'Red Cat' (Reduction at Cathode).",
            },
          ],
        },
      },
      {
        id: "electrochem_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Anode = oxidation, Cathode = reduction",
            "Electrons: anode → cathode (external circuit)",
            "E°cell = E°cathode − E°anode",
            "Electrolysis: molten vs aqueous produces different products",
          ],
          connections: [
            "Leads to: Corrosion and prevention",
            "Leads to: Batteries and fuel cells",
            "Builds on: Redox reactions and Chemical Bonding",
          ],
        },
      },
      {
        id: "electrochem_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Electrochemistry",
          min_score: 80,
          required_sections: ["electrochem_hook_01", "electrochem_intuitive_01", "electrochem_formal_01", "electrochem_formula_01", "electrochem_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 7. ORGANIC CHEMISTRY
  {
    subject: "chemistry",
    topic: "Organic Chemistry",
    subtopic: "Basic Concepts",
    title: "Organic Chemistry — Carbon's Amazing Compounds",
    learning_objectives: [
      "Classify organic compounds by functional groups",
      "Name simple organic compounds using IUPAC nomenclature",
      "Explain the properties of homologous series",
      "Predict products of organic reactions",
    ],
    difficulty_level: "hard",
    estimated_minutes: 25,
    content_sections: [
      {
        id: "organic_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Every living thing on Earth is made of organic compounds — proteins, carbohydrates, fats, DNA. Your body is a walking chemistry lab with thousands of organic reactions happening every second. Organic chemistry is the study of carbon compounds, and it's the foundation of medicine, food science, plastics, and even the fuel in your car.",
          prediction_prompt: "Why do you think carbon is special enough to have its own branch of chemistry? What makes it different from other elements?",
        },
      },
      {
        id: "organic_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Carbon is unique because it can form 4 bonds, bond to itself to make long chains, and form double/triple bonds. This gives rise to millions of different compounds. Organic compounds are grouped by functional groups — specific atom arrangements that determine how they react. Think of functional groups as the 'personality' of the molecule.",
          analogy: "Imagine Lego bricks. Carbon is like a special brick that can connect to 4 other bricks in any direction. You can build straight chains, branches, rings, and complex 3D structures. The functional group is like adding a special piece (wheels, wings, lights) that changes what the structure can do.",
        },
      },
      {
        id: "organic_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Organic compounds are classified by functional groups: alkanes (C-C single bonds), alkenes (C=C double bonds), alcohols (-OH), carboxylic acids (-COOH), esters (-COO-), amines (-NH₂). A homologous series is a family of compounds with the same functional group but differing by CH₂ units. IUPAC nomenclature provides systematic naming.",
          key_terms: [
            { term: "Functional Group", definition: "An atom or group of atoms that determines the chemical properties of an organic compound" },
            { term: "Homologous Series", definition: "A series of compounds with the same functional group, differing by CH₂ units" },
            { term: "IUPAC Name", definition: "Systematic international name for organic compounds" },
            { term: "Saturated", definition: "Contains only C-C single bonds (alkanes). Unsaturated has double/triple bonds" },
          ],
        },
      },
      {
        id: "organic_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "CₙH₂ₙ₊₂ (alkanes), CₙH₂ₙ (alkenes)",
          variables: [
            { name: "n", description: "Number of carbon atoms", unit: "count" },
            { name: "2n+2", description: "Number of hydrogen atoms in alkanes", unit: "count" },
            { name: "2n", description: "Number of hydrogen atoms in alkenes", unit: "count" },
          ],
          when_to_use: "Use these general formulas to determine the molecular formula of alkanes and alkenes.",
          common_traps: [
            "Forgetting that alkanes are saturated (single bonds only) and alkenes are unsaturated",
            "Using the wrong general formula for cyclic compounds (CₙH₂ₙ for cycloalkanes)",
            "Not recognizing functional groups in complex molecules",
          ],
          units_note: "n must be a positive integer (1, 2, 3...). For alkanes, n ≥ 1. For alkenes, n ≥ 2.",
        },
      },
      {
        id: "organic_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "Name the following compound: CH₃-CH₂-CH₂-OH",
          steps: [
            "Identify the functional group: -OH (alcohol)",
            "Count the carbon chain: 3 carbons (prop-)",
            "Number from the end nearest the -OH: C1-C2-C3-OH",
            "Add suffix for alcohol: -ol",
            "Name: propan-1-ol (the -OH is on carbon 1)",
          ],
          answer: "Propan-1-ol (or 1-propanol)",
          explanation: "The IUPAC system identifies the longest carbon chain containing the functional group, numbers it to give the functional group the lowest number, and adds the appropriate suffix (-ol for alcohols).",
        },
      },
      {
        id: "organic_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Very common — organic chemistry is a major JAMB topic",
          typical_question: "Name the products of the reaction between ethanol and ethanoic acid. What type of reaction is this?",
          common_mistakes: [
            "Confusing esterification with neutralization",
            "Not recognizing that alkenes undergo addition reactions while alkanes undergo substitution",
            "Forgetting that carboxylic acids are weak acids",
          ],
          exam_tip: "For naming: identify the functional group first, count the carbon chain, then add prefix + root + suffix. For reactions: know that alkenes decolourise bromine water (test for unsaturation).",
        },
      },
      {
        id: "organic_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "What is the general formula for alkanes?",
              options: ["CₙH₂ₙ", "CₙH₂ₙ₊₂", "CₙH₂ₙ₋₂", "CₙHₙ"],
              correct_index: 1,
              explanation: "Alkanes are saturated hydrocarbons with the general formula CₙH₂ₙ₊₂ (e.g., methane CH₄, ethane C₂H₆).",
            },
            {
              question: "Which test distinguishes alkenes from alkanes?",
              options: ["Litmus test", "Bromine water test", "Flame test", "pH test"],
              correct_index: 1,
              explanation: "Alkenes decolourise bromine water (orange → colourless) due to addition across the double bond. Alkanes don't react.",
            },
            {
              question: "What is the product of ethanol + ethanoic acid?",
              options: ["Sodium ethanoate", "Ethyl ethanoate", "Ethanol", "Ethanoic acid"],
              correct_index: 1,
              explanation: "This is esterification: CH₃COOH + C₂H₅OH → CH₃COOC₂H₅ + H₂O. The product is ethyl ethanoate (an ester).",
            },
          ],
        },
      },
      {
        id: "organic_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Carbon forms 4 bonds, enabling complex structures",
            "Functional groups determine chemical behaviour",
            "Alkanes: CₙH₂ₙ₊₂ (saturated), Alkenes: CₙH₂ₙ (unsaturated)",
            "IUPAC naming: prefix + root + suffix",
          ],
          connections: [
            "Leads to: Biochemistry (carbohydrates, proteins, lipids)",
            "Leads to: Industrial organic chemistry",
            "Builds on: Chemical Bonding (covalent bonds)",
          ],
        },
      },
      {
        id: "organic_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Organic Chemistry",
          min_score: 80,
          required_sections: ["organic_hook_01", "organic_intuitive_01", "organic_formal_01", "organic_formula_01", "organic_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 8. CHEMICAL KINETICS
  {
    subject: "chemistry",
    topic: "Chemical Kinetics",
    subtopic: "Basic Concepts",
    title: "Chemical Kinetics — Why Some Reactions Are Fast",
    learning_objectives: [
      "Define reaction rate and factors affecting it",
      "Explain collision theory and activation energy",
      "Describe the effect of concentration, temperature, and catalysts on rate",
      "Draw and interpret reaction rate graphs",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "kinetics_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Why does food spoil faster at room temperature than in a fridge? Why do we use catalysts in car exhausts? Why does burning paper ignite instantly while rusting iron takes months? All these questions are about reaction rates — how fast or slow chemical reactions happen. Kinetics explains the 'how fast' while equilibrium explains 'how far.'",
          prediction_prompt: "If you increase the temperature of a reaction, does it always speed up? By how much?",
        },
      },
      {
        id: "kinetics_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "For a reaction to happen, particles must collide with enough energy (activation energy) and in the right orientation. Increasing concentration means more particles in the same space → more collisions. Increasing temperature means particles move faster → more collisions AND more energy per collision. Catalysts lower the activation energy barrier, making it easier for collisions to succeed.",
          analogy: "Think of a locked door. Activation energy is the key. Particles need to hit the door with the right key (energy + orientation). Increasing concentration = more people trying. Increasing temperature = people running faster. A catalyst = making the lock easier to pick.",
        },
      },
      {
        id: "kinetics_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Reaction rate is the change in concentration of reactants or products per unit time. Factors affecting rate: concentration (more particles → more collisions), temperature (higher T → more energy, more successful collisions), surface area (more exposed area → more collisions), catalysts (lower activation energy), and nature of reactants.",
          key_terms: [
            { term: "Reaction Rate", definition: "Change in concentration per unit time. Usually mol/dm³/s" },
            { term: "Activation Energy (Ea)", definition: "Minimum energy required for a collision to be successful" },
            { term: "Catalyst", definition: "A substance that speeds up a reaction without being consumed" },
            { term: "Collision Theory", definition: "Reactions occur when particles collide with sufficient energy and correct orientation" },
          ],
        },
      },
      {
        id: "kinetics_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Rate = k[A]ⁿ[B]ᵐ",
          variables: [
            { name: "Rate", description: "Reaction rate", unit: "mol/dm³/s" },
            { name: "k", description: "Rate constant", unit: "varies" },
            { name: "[A], [B]", description: "Concentrations of reactants", unit: "mol/dm³" },
            { name: "n, m", description: "Orders of reaction (determined experimentally)", unit: "none" },
          ],
          when_to_use: "Use the rate equation to calculate rate from concentrations and determine the order of reaction from experimental data.",
          common_traps: [
            "Orders of reaction (n, m) are NOT the same as stoichiometric coefficients",
            "A zero-order reaction means rate is independent of that reactant's concentration",
            "First-order: doubling concentration doubles rate. Second-order: doubling concentration quadruples rate",
          ],
          units_note: "The units of k depend on the overall order. For first order: s⁻¹. For second order: dm³/mol/s.",
        },
      },
      {
        id: "kinetics_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "For the reaction A + B → products, the rate equation is Rate = k[A][B]². If [A] = 0.1 mol/dm³ and [B] = 0.2 mol/dm³, and k = 5.0 × 10³ dm⁶/mol²/s, calculate the rate.",
          steps: [
            "Write the rate equation: Rate = k[A][B]²",
            "Substitute values: Rate = (5.0 × 10³)(0.1)(0.2)²",
            "Calculate [B]²: (0.2)² = 0.04",
            "Rate = 5000 × 0.1 × 0.04 = 20 mol/dm³/s",
          ],
          answer: "Rate = 20 mol/dm³/s",
          explanation: "The reaction is third-order overall (first-order in A, second-order in B). This means the rate is most sensitive to changes in [B]. Doubling [B] would quadruple the rate.",
        },
      },
      {
        id: "kinetics_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Common — kinetics and rate factors are regular JAMB topics",
          typical_question: "Explain why increasing temperature has a greater effect on reaction rate than increasing concentration.",
          common_mistakes: [
            "Forgetting that temperature affects both collision frequency AND the fraction of successful collisions",
            "Confusing catalysts with reactants (catalysts are not consumed)",
            "Not understanding that activation energy is a minimum threshold",
          ],
          exam_tip: "For rate graphs: reactant concentration decreases over time (curve down), product concentration increases (curve up). The gradient at any point = instantaneous rate.",
        },
      },
      {
        id: "kinetics_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "What does a catalyst do to a reaction?",
              options: ["Increases activation energy", "Decreases activation energy", "Changes the products", "Increases the temperature"],
              correct_index: 1,
              explanation: "A catalyst provides an alternative reaction pathway with a lower activation energy, making more collisions successful.",
            },
            {
              question: "If doubling [A] quadruples the rate, what is the order with respect to A?",
              options: ["Zero order", "First order", "Second order", "Third order"],
              correct_index: 2,
              explanation: "Second-order: rate ∝ [A]². Doubling [A] gives 2² = 4× the rate.",
            },
            {
              question: "Which factor does NOT affect reaction rate?",
              options: ["Temperature", "Concentration", "Catalyst", "Equilibrium constant"],
              correct_index: 3,
              explanation: "The equilibrium constant (Kc) determines how far a reaction goes, not how fast. Rate depends on concentration, temperature, surface area, and catalysts.",
            },
          ],
        },
      },
      {
        id: "kinetics_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Reaction rate depends on collision frequency and energy",
            "Factors: concentration, temperature, surface area, catalysts",
            "Catalysts lower activation energy without being consumed",
            "Rate = k[A]ⁿ[B]ᵐ — orders determined experimentally",
          ],
          connections: [
            "Leads to: Industrial processes and optimization",
            "Leads to: Enzyme kinetics in biology",
            "Builds on: Collision theory and Thermodynamics",
          ],
        },
      },
      {
        id: "kinetics_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Chemical Kinetics",
          min_score: 80,
          required_sections: ["kinetics_hook_01", "kinetics_intuitive_01", "kinetics_formal_01", "kinetics_formula_01", "kinetics_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 9. STATES OF MATTER
  {
    subject: "chemistry",
    topic: "States of Matter",
    subtopic: "Basic Concepts",
    title: "States of Matter — Solids, Liquids, and Gases",
    learning_objectives: [
      "Describe the three states of matter and their properties",
      "Explain the kinetic molecular theory",
      "Describe phase changes and their energy requirements",
      "Apply the gas laws (Boyle's, Charles's, Ideal Gas)",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "states_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Water can be ice, liquid water, or steam — same molecule, completely different behaviours. Why does ice float while most solids sink? Why does steam burn more than boiling water? The answers lie in how molecules are arranged and how much energy they have in each state.",
          prediction_prompt: "If you heat a gas in a sealed container, what happens to the pressure? Why do you think tyres can burst in hot weather?",
        },
      },
      {
        id: "states_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "In solids, molecules are tightly packed and vibrate in fixed positions. In liquids, molecules can slide past each other — they're close but free to move. In gases, molecules are far apart and move randomly at high speed. The key difference is the amount of kinetic energy: solids (least) → liquids → gases (most).",
          analogy: "Think of a crowded room. Solid = everyone standing still, shoulder to shoulder, vibrating. Liquid = people walking slowly, bumping into each other. Gas = people running around wildly with lots of space between them.",
        },
      },
      {
        id: "states_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Solids have fixed shape and volume (incompressible). Liquids have fixed volume but take the shape of their container (slightly compressible). Gases have neither fixed shape nor volume (highly compressible). Phase changes: melting (solid→liquid), boiling (liquid→gas), condensation (gas→liquid), freezing (liquid→solid), sublimation (solid→gas), deposition (gas→solid).",
          key_terms: [
            { term: "Melting Point", definition: "Temperature at which solid turns to liquid at 1 atm" },
            { term: "Boiling Point", definition: "Temperature at which liquid turns to gas at 1 atm" },
            { term: "Sublimation", definition: "Direct transition from solid to gas (e.g., dry ice)" },
            { term: "Latent Heat", definition: "Energy absorbed/released during phase change without temperature change" },
          ],
        },
      },
      {
        id: "states_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "PV = nRT",
          variables: [
            { name: "P", description: "Pressure", unit: "Pa or atm" },
            { name: "V", description: "Volume", unit: "m³ or dm³" },
            { name: "n", description: "Number of moles", unit: "mol" },
            { name: "R", description: "Gas constant", unit: "8.314 J/mol/K" },
            { name: "T", description: "Temperature", unit: "K (Kelvin)" },
          ],
          when_to_use: "The ideal gas law relates pressure, volume, temperature, and amount of gas. Use it when other gas laws don't directly apply.",
          common_traps: [
            "Using temperature in °C instead of K (always convert: K = °C + 273)",
            "Confusing Boyle's Law (P ∝ 1/V at constant T) with Charles's Law (V ∝ T at constant P)",
            "Forgetting to convert volume to m³ or dm³",
          ],
          units_note: "Always use SI units: Pa for pressure, m³ for volume, K for temperature. R = 8.314 J/mol/K.",
        },
      },
      {
        id: "states_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "A gas occupies 5.0 dm³ at 25°C and 100 kPa. What volume will it occupy at 100°C and the same pressure?",
          steps: [
            "This is Charles's Law (constant pressure): V₁/T₁ = V₂/T₂",
            "Convert temperatures to Kelvin: T₁ = 25 + 273 = 298 K, T₂ = 100 + 273 = 373 K",
            "Rearrange: V₂ = V₁ × T₂/T₁",
            "V₂ = 5.0 × 373/298 = 5.0 × 1.252 = 6.26 dm³",
          ],
          answer: "V₂ ≈ 6.26 dm³",
          explanation: "When temperature increases at constant pressure, volume increases proportionally (Charles's Law). The gas expands because molecules move faster and push harder against the container walls.",
        },
      },
      {
        id: "states_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Common — gas laws and states of matter are regular JAMB topics",
          typical_question: "A gas at 27°C has a volume of 200 cm³. What is its volume at 127°C at constant pressure?",
          common_mistakes: [
            "Using °C instead of K in gas law calculations",
            "Forgetting to convert cm³ to dm³ when using with pressure in kPa",
            "Not specifying which gas law applies (Boyle's vs Charles's vs Combined)",
          ],
          exam_tip: "For gas law questions: always convert to Kelvin first. Identify which variable is constant to choose the right law.",
        },
      },
      {
        id: "states_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "At what temperature does water boil at 1 atm?",
              options: ["0°C", "100°C", "373°C", "273 K"],
              correct_index: 1,
              explanation: "Water boils at 100°C (373 K) at standard atmospheric pressure (1 atm).",
            },
            {
              question: "Which state has the highest kinetic energy per molecule?",
              options: ["Solid", "Liquid", "Gas", "All equal"],
              correct_index: 2,
              explanation: "Gas molecules have the most kinetic energy — they move freely at high speeds.",
            },
            {
              question: "If pressure is doubled at constant temperature, what happens to volume?",
              options: ["Doubles", "Halves", "Stays the same", "Quadruples"],
              correct_index: 1,
              explanation: "Boyle's Law: P₁V₁ = P₂V₂. If P doubles, V must halve to keep PV constant.",
            },
          ],
        },
      },
      {
        id: "states_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Solid (fixed shape) → Liquid (fixed volume) → Gas (no fixed shape/volume)",
            "Phase changes require energy (latent heat) without temperature change",
            "PV = nRT — always use Kelvin for temperature",
            "Boyle's: P ∝ 1/V. Charles's: V ∝ T",
          ],
          connections: [
            "Leads to: Gas stoichiometry calculations",
            "Leads to: Thermochemistry and enthalpy",
            "Builds on: Kinetic molecular theory",
          ],
        },
      },
      {
        id: "states_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of States of Matter",
          min_score: 80,
          required_sections: ["states_hook_01", "states_intuitive_01", "states_formal_01", "states_formula_01", "states_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 10. PERIODIC TABLE
  {
    subject: "chemistry",
    topic: "Periodic Table",
    subtopic: "Basic Concepts",
    title: "Periodic Table — Organizing the Elements",
    learning_objectives: [
      "Explain the organization of the periodic table",
      "Describe trends in atomic radius, ionization energy, and electronegativity",
      "Classify elements as metals, non-metals, or metalloids",
      "Predict element properties from their position",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "periodic_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "The periodic table isn't just a chart on a classroom wall — it's a map of everything that exists. Mendeleev arranged elements by mass and noticed patterns: elements with similar properties appeared at regular (periodic) intervals. Today, we arrange them by atomic number, and the table predicts how elements behave just by their position.",
          prediction_prompt: "If Lithium (Li) and Sodium (Na) are in the same column, what do you think they have in common?",
        },
      },
      {
        id: "periodic_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "The periodic table is arranged in rows (periods) and columns (groups). Elements in the same group have the same number of valence electrons, which gives them similar chemical properties. Moving left to right across a period, atoms get smaller and lose electrons more easily. Moving down a group, atoms get larger and gain electrons more easily.",
          analogy: "Think of the periodic table like a sports team roster. Groups are positions (goalkeeper, defender, striker). Players in the same position have similar skills (chemical properties). Periods are like experience levels — more experience (periods) means more 'layers' (electron shells).",
        },
      },
      {
        id: "periodic_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "The periodic table organizes elements by increasing atomic number. Groups (columns) contain elements with similar valence electron configurations. Periods (rows) represent the highest energy level occupied. Trends across a period: atomic radius decreases, ionization energy increases, electronegativity increases. Trends down a group: atomic radius increases, ionization energy decreases, electronegativity decreases.",
          key_terms: [
            { term: "Group", definition: "Vertical column. Elements in same group have similar chemical properties" },
            { term: "Period", definition: "Horizontal row. Represents the highest occupied energy level" },
            { term: "Ionization Energy", definition: "Energy required to remove one electron from a gaseous atom" },
            { term: "Electronegativity", definition: "Ability of an atom to attract bonding electrons" },
          ],
        },
      },
      {
        id: "periodic_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Trends: Left→Right: radius↓, IE↑, EN↑. Top→Bottom: radius↑, IE↓, EN↓",
          variables: [
            { name: "IE", description: "Ionization energy", unit: "kJ/mol" },
            { name: "EN", description: "Electronegativity (Pauling scale)", unit: "none" },
          ],
          when_to_use: "Use these trends to predict relative atomic sizes, reactivity, and bonding behaviour of elements.",
          common_traps: [
            "Forgetting that noble gases have very high ionization energy (full outer shell)",
            "Not recognizing that metalloids (Si, Ge, As) have intermediate properties",
            "Confusing electronegativity trend with electron affinity trend",
          ],
          units_note: "Ionization energy is measured in kJ/mol. Electronegativity is on the Pauling scale (no units).",
        },
      },
      {
        id: "periodic_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "Arrange the following in order of increasing atomic radius: Li, Na, K, Rb.",
          steps: [
            "All are in Group 1 (alkali metals)",
            "Going down the group: atomic radius increases",
            "Order from smallest to largest: Li < Na < K < Rb",
            "Each element has one more electron shell than the one above",
          ],
          answer: "Li < Na < K < Rb (increasing atomic radius)",
          explanation: "As you go down Group 1, each element has an additional electron shell, making the atom larger. The outermost electron is also further from the nucleus, which is why reactivity increases down the group.",
        },
      },
      {
        id: "periodic_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Common — periodic trends and element properties are regular JAMB topics",
          typical_question: "Explain why sodium is more reactive than lithium, even though lithium has a higher ionization energy.",
          common_mistakes: [
            "Confusing ionization energy with reactivity — they're inversely related for metals",
            "Forgetting that atomic radius increases down a group",
            "Not connecting periodic position to chemical behaviour",
          ],
          exam_tip: "For trend questions: remember the mnemonic 'Tiny Tom Eats Eggs Regularly' — across a period: radius decreases, IE increases, EN increases.",
        },
      },
      {
        id: "periodic_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "Which element has the highest ionization energy in Period 3?",
              options: ["Na", "Mg", "Al", "Ar"],
              correct_index: 3,
              explanation: "Noble gases have the highest IE because they have a full outer shell. Ar (Period 3 noble gas) has the highest IE in that period.",
            },
            {
              question: "Which group contains the halogens?",
              options: ["Group 1", "Group 2", "Group 17", "Group 18"],
              correct_index: 2,
              explanation: "Halogens are in Group 17: F, Cl, Br, I. They have 7 valence electrons and are highly reactive non-metals.",
            },
            {
              question: "Going down Group 1, ionization energy:",
              options: ["Increases", "Decreases", "Stays the same", "Fluctuates"],
              correct_index: 1,
              explanation: "Down a group, atomic radius increases and the outer electron is further from the nucleus, making it easier to remove (lower IE).",
            },
          ],
        },
      },
      {
        id: "periodic_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Groups = same valence electrons = similar properties",
            "Periods = same energy level = similar atomic size",
            "Left→Right: radius↓, IE↑, EN↑",
            "Top→Bottom: radius↑, IE↓, EN↓",
          ],
          connections: [
            "Leads to: Chemical Bonding (predicting bond type)",
            "Leads to: Periodic Chemistry (reactions of elements)",
            "Builds on: Atomic Structure (electron configuration)",
          ],
        },
      },
      {
        id: "periodic_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of the Periodic Table",
          min_score: 80,
          required_sections: ["periodic_hook_01", "periodic_intuitive_01", "periodic_formal_01", "periodic_formula_01", "periodic_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = [];

    for (const lesson of LESSONS) {
      const { data, error } = await supabase
        .from("lessons")
        .upsert(
          { ...lesson, updated_at: new Date().toISOString() },
          { onConflict: "subject,topic,subtopic" }
        )
        .select("id, topic, subtopic")
        .single();

      if (error) {
        results.push({ topic: lesson.topic, error: error.message });
      } else {
        results.push({ topic: lesson.topic, subtopic: lesson.subtopic, id: data.id });
      }
    }

    return new Response(
      JSON.stringify({ success: true, lessons: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
