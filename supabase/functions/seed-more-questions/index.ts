import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADDITIONAL_QUESTIONS = {
  english: [
    { question: "Choose the option that best completes the gap: The man was too tired to walk, _____ run.", option_a: "much less", option_b: "let alone", option_c: "not to talk of", option_d: "more so", correct_answer: "B", explanation: "'Let alone' is the correct idiomatic expression meaning 'not to mention'.", year: 2023 },
    { question: "Select the option that has the same vowel sound as the one in 'bird'.", option_a: "beard", option_b: "burn", option_c: "bead", option_d: "bad", correct_answer: "B", explanation: "'Burn' has the same /ɜː/ vowel sound as 'bird'.", year: 2022 },
    { question: "The opposite of 'benevolent' is:", option_a: "kind", option_b: "generous", option_c: "malevolent", option_d: "sympathetic", correct_answer: "C", explanation: "'Malevolent' means wishing evil, the opposite of 'benevolent' (wishing good).", year: 2021 },
    { question: "Choose the word that has the stress on the second syllable:", option_a: "comfortable", option_b: "education", option_c: "economy", option_d: "capitalize", correct_answer: "C", explanation: "'Economy' is stressed on the second syllable: e-CO-no-my.", year: 2023 },
    { question: "The sentence 'She sings beautifully' contains:", option_a: "an adverb of manner", option_b: "an adjective", option_c: "a noun", option_d: "a preposition", correct_answer: "A", explanation: "'Beautifully' describes how she sings, making it an adverb of manner.", year: 2020 },
    { question: "Identify the figure of speech in: 'The wind howled through the night.'", option_a: "Simile", option_b: "Metaphor", option_c: "Personification", option_d: "Hyperbole", correct_answer: "C", explanation: "Personification gives human qualities (howling) to wind.", year: 2022 },
    { question: "Choose the correct spelling:", option_a: "accomodation", option_b: "accommodation", option_c: "acomodation", option_d: "acommodation", correct_answer: "B", explanation: "'Accommodation' has two 'c's and two 'm's.", year: 2021 },
    { question: "The phrase 'to beat about the bush' means:", option_a: "to hit bushes", option_b: "to avoid the main topic", option_c: "to garden", option_d: "to hunt animals", correct_answer: "B", explanation: "This idiom means to avoid discussing the main subject directly.", year: 2023 },
    { question: "'He is the man _____ car was stolen.' Choose the correct relative pronoun.", option_a: "who", option_b: "whom", option_c: "whose", option_d: "which", correct_answer: "C", explanation: "'Whose' shows possession and refers to the man.", year: 2020 },
    { question: "Select the word with a different stress pattern:", option_a: "maintain", option_b: "obtain", option_c: "retain", option_d: "certain", correct_answer: "D", explanation: "'Certain' is stressed on the first syllable while others are stressed on the second.", year: 2022 },
    { question: "The literary term for exaggeration is:", option_a: "Litotes", option_b: "Hyperbole", option_c: "Euphemism", option_d: "Irony", correct_answer: "B", explanation: "Hyperbole is deliberate exaggeration for effect.", year: 2021 },
    { question: "Choose the option nearest in meaning to 'ubiquitous':", option_a: "rare", option_b: "everywhere", option_c: "unique", option_d: "dangerous", correct_answer: "B", explanation: "'Ubiquitous' means present everywhere or very common.", year: 2023 },
    { question: "In the sentence 'Running is good exercise', 'Running' is a:", option_a: "participle", option_b: "gerund", option_c: "verb", option_d: "adjective", correct_answer: "B", explanation: "A gerund is a verb form ending in -ing used as a noun (subject here).", year: 2020 },
    { question: "'The teacher, as well as the students, _____ present.' Choose the correct verb.", option_a: "were", option_b: "was", option_c: "are", option_d: "have been", correct_answer: "B", explanation: "With 'as well as', the verb agrees with the first subject (teacher - singular).", year: 2022 },
    { question: "Choose the word that rhymes with 'through':", option_a: "though", option_b: "rough", option_c: "blue", option_d: "cough", correct_answer: "C", explanation: "'Through' and 'blue' both end with the /uː/ sound.", year: 2021 },
  ],
  mathematics: [
    { question: "If log₁₀ 2 = 0.301, find log₁₀ 8.", option_a: "0.602", option_b: "0.903", option_c: "2.408", option_d: "0.301", correct_answer: "B", explanation: "log₁₀ 8 = log₁₀ 2³ = 3 × log₁₀ 2 = 3 × 0.301 = 0.903", year: 2023 },
    { question: "Solve: 2^(x+1) = 16", option_a: "x = 2", option_b: "x = 3", option_c: "x = 4", option_d: "x = 5", correct_answer: "B", explanation: "2^(x+1) = 2⁴, so x+1 = 4, therefore x = 3.", year: 2022 },
    { question: "Find the derivative of y = 3x⁴ - 2x² + 5.", option_a: "12x³ - 4x", option_b: "12x³ - 2x", option_c: "3x³ - 2x", option_d: "12x³ - 4x + 5", correct_answer: "A", explanation: "dy/dx = 12x³ - 4x (using power rule).", year: 2021 },
    { question: "In how many ways can 5 people sit in a row?", option_a: "25", option_b: "60", option_c: "120", option_d: "720", correct_answer: "C", explanation: "5! = 5 × 4 × 3 × 2 × 1 = 120 ways.", year: 2023 },
    { question: "If sin θ = 3/5, find cos θ (0° < θ < 90°).", option_a: "4/5", option_b: "3/4", option_c: "5/3", option_d: "5/4", correct_answer: "A", explanation: "Using sin²θ + cos²θ = 1: cos²θ = 1 - 9/25 = 16/25, so cos θ = 4/5.", year: 2020 },
    { question: "Evaluate: ∫(2x + 3)dx", option_a: "x² + 3x + C", option_b: "2x² + 3x + C", option_c: "x² + 3 + C", option_d: "2x + C", correct_answer: "A", explanation: "∫(2x + 3)dx = x² + 3x + C (integrating term by term).", year: 2022 },
    { question: "Find the 10th term of the AP: 3, 7, 11, 15, ...", option_a: "39", option_b: "43", option_c: "35", option_d: "47", correct_answer: "A", explanation: "a = 3, d = 4, T₁₀ = a + 9d = 3 + 36 = 39.", year: 2021 },
    { question: "Simplify: (√3 + √2)(√3 - √2)", option_a: "1", option_b: "5", option_c: "√6", option_d: "6", correct_answer: "A", explanation: "Using difference of squares: (√3)² - (√2)² = 3 - 2 = 1.", year: 2023 },
    { question: "If A = {1, 2, 3} and B = {2, 3, 4}, find A ∩ B.", option_a: "{1, 4}", option_b: "{2, 3}", option_c: "{1, 2, 3, 4}", option_d: "{}", correct_answer: "B", explanation: "A ∩ B contains elements common to both sets: {2, 3}.", year: 2020 },
    { question: "Find the value of x if 3x + 7 = 22.", option_a: "3", option_b: "4", option_c: "5", option_d: "6", correct_answer: "C", explanation: "3x = 22 - 7 = 15, so x = 5.", year: 2022 },
    { question: "What is the probability of getting a head when a fair coin is tossed?", option_a: "1/4", option_b: "1/3", option_c: "1/2", option_d: "2/3", correct_answer: "C", explanation: "P(Head) = 1/2 for a fair coin.", year: 2021 },
    { question: "Calculate the area of a circle with radius 7 cm. (π = 22/7)", option_a: "44 cm²", option_b: "154 cm²", option_c: "88 cm²", option_d: "308 cm²", correct_answer: "B", explanation: "Area = πr² = (22/7) × 7² = 154 cm².", year: 2023 },
    { question: "Solve the quadratic equation: x² - 5x + 6 = 0", option_a: "x = 2, 3", option_b: "x = -2, -3", option_c: "x = 1, 6", option_d: "x = -1, -6", correct_answer: "A", explanation: "(x - 2)(x - 3) = 0, so x = 2 or x = 3.", year: 2020 },
    { question: "If the mean of 5, 7, x, 11, 13 is 9, find x.", option_a: "7", option_b: "9", option_c: "8", option_d: "10", correct_answer: "B", explanation: "(5 + 7 + x + 11 + 13)/5 = 9, so 36 + x = 45, x = 9.", year: 2022 },
    { question: "Convert 110₂ to base 10.", option_a: "4", option_b: "5", option_c: "6", option_d: "7", correct_answer: "C", explanation: "110₂ = 1×2² + 1×2¹ + 0×2⁰ = 4 + 2 + 0 = 6.", year: 2021 },
  ],
  physics: [
    { question: "The SI unit of electric current is:", option_a: "Volt", option_b: "Ohm", option_c: "Ampere", option_d: "Watt", correct_answer: "C", explanation: "The Ampere (A) is the SI base unit for electric current.", year: 2023 },
    { question: "A body moving in a circle at constant speed has:", option_a: "constant velocity", option_b: "constant acceleration", option_c: "zero acceleration", option_d: "changing velocity", correct_answer: "D", explanation: "Velocity is a vector; direction changes in circular motion, so velocity changes.", year: 2022 },
    { question: "The phenomenon of light bending when passing from one medium to another is called:", option_a: "Reflection", option_b: "Refraction", option_c: "Diffraction", option_d: "Dispersion", correct_answer: "B", explanation: "Refraction is the bending of light when it passes between media of different optical densities.", year: 2021 },
    { question: "Which of the following is NOT a vector quantity?", option_a: "Displacement", option_b: "Velocity", option_c: "Speed", option_d: "Acceleration", correct_answer: "C", explanation: "Speed has only magnitude (scalar); displacement, velocity, and acceleration have magnitude and direction (vectors).", year: 2023 },
    { question: "The resistance of a conductor depends on:", option_a: "length only", option_b: "cross-sectional area only", option_c: "material only", option_d: "length, area, and material", correct_answer: "D", explanation: "R = ρL/A, where ρ is resistivity (material), L is length, A is cross-sectional area.", year: 2020 },
    { question: "Sound waves are:", option_a: "transverse waves", option_b: "longitudinal waves", option_c: "electromagnetic waves", option_d: "stationary waves", correct_answer: "B", explanation: "Sound waves are longitudinal waves where particles vibrate parallel to wave direction.", year: 2022 },
    { question: "The principle of conservation of momentum applies when:", option_a: "there is friction", option_b: "external forces act", option_c: "no external force acts", option_d: "mass changes", correct_answer: "C", explanation: "Momentum is conserved in an isolated system (no external forces).", year: 2021 },
    { question: "A transformer works on the principle of:", option_a: "mutual induction", option_b: "self induction", option_c: "electrostatic induction", option_d: "magnetization", correct_answer: "A", explanation: "Transformers use mutual induction between primary and secondary coils.", year: 2023 },
    { question: "The escape velocity from Earth is approximately:", option_a: "8 km/s", option_b: "11.2 km/s", option_c: "15 km/s", option_d: "25 km/s", correct_answer: "B", explanation: "Earth's escape velocity is approximately 11.2 km/s.", year: 2020 },
    { question: "Which color of light has the longest wavelength?", option_a: "Violet", option_b: "Blue", option_c: "Green", option_d: "Red", correct_answer: "D", explanation: "Red light has the longest wavelength in the visible spectrum (~700 nm).", year: 2022 },
    { question: "The half-life of a radioactive element is 4 days. After 12 days, what fraction remains?", option_a: "1/2", option_b: "1/4", option_c: "1/8", option_d: "1/16", correct_answer: "C", explanation: "After 3 half-lives (12÷4=3): (1/2)³ = 1/8 remains.", year: 2021 },
    { question: "A body at rest can have:", option_a: "kinetic energy", option_b: "potential energy", option_c: "momentum", option_d: "velocity", correct_answer: "B", explanation: "A body at rest can have potential energy due to position (gravitational) or configuration (elastic).", year: 2023 },
    { question: "The dimensional formula for pressure is:", option_a: "MLT⁻²", option_b: "ML⁻¹T⁻²", option_c: "ML²T⁻²", option_d: "M⁻¹L⁻¹T⁻²", correct_answer: "B", explanation: "Pressure = Force/Area = MLT⁻²/L² = ML⁻¹T⁻².", year: 2020 },
    { question: "In a parallel circuit, the total resistance is:", option_a: "sum of individual resistances", option_b: "greater than the largest resistance", option_c: "less than the smallest resistance", option_d: "equal to the largest resistance", correct_answer: "C", explanation: "In parallel, 1/R_total = Σ(1/Rᵢ), making total resistance smaller than any individual.", year: 2022 },
    { question: "The unit of capacitance is:", option_a: "Henry", option_b: "Farad", option_c: "Tesla", option_d: "Weber", correct_answer: "B", explanation: "The Farad (F) is the SI unit of electrical capacitance.", year: 2021 },
  ],
  chemistry: [
    { question: "The atomic number of an element is determined by:", option_a: "number of neutrons", option_b: "number of protons", option_c: "mass number", option_d: "number of electrons in outer shell", correct_answer: "B", explanation: "Atomic number equals the number of protons in the nucleus.", year: 2023 },
    { question: "Which gas is released when dilute HCl reacts with zinc?", option_a: "Oxygen", option_b: "Chlorine", option_c: "Hydrogen", option_d: "Nitrogen", correct_answer: "C", explanation: "Zn + 2HCl → ZnCl₂ + H₂. Hydrogen gas is released.", year: 2022 },
    { question: "The IUPAC name for CH₃CH₂OH is:", option_a: "methanol", option_b: "ethanol", option_c: "propanol", option_d: "butanol", correct_answer: "B", explanation: "CH₃CH₂OH has 2 carbons, making it ethanol.", year: 2021 },
    { question: "Which of the following is an alkali metal?", option_a: "Calcium", option_b: "Magnesium", option_c: "Sodium", option_d: "Aluminum", correct_answer: "C", explanation: "Sodium (Na) is in Group 1 (alkali metals). Ca and Mg are alkaline earth metals.", year: 2023 },
    { question: "The process of converting a solid directly to gas is called:", option_a: "Evaporation", option_b: "Sublimation", option_c: "Condensation", option_d: "Distillation", correct_answer: "B", explanation: "Sublimation is the direct transition from solid to gas without passing through liquid phase.", year: 2020 },
    { question: "What is the oxidation state of sulfur in H₂SO₄?", option_a: "+2", option_b: "+4", option_c: "+6", option_d: "-2", correct_answer: "C", explanation: "In H₂SO₄: 2(+1) + x + 4(-2) = 0, so x = +6.", year: 2022 },
    { question: "The noble gases are chemically inert because they have:", option_a: "high melting points", option_b: "complete outer electron shells", option_c: "low atomic masses", option_d: "metallic properties", correct_answer: "B", explanation: "Noble gases have stable, complete outer electron configurations.", year: 2021 },
    { question: "Which of the following is a diatomic molecule?", option_a: "Helium", option_b: "Argon", option_c: "Oxygen", option_d: "Neon", correct_answer: "C", explanation: "Oxygen exists as O₂ (diatomic). Noble gases exist as single atoms.", year: 2023 },
    { question: "The pH of a neutral solution at 25°C is:", option_a: "0", option_b: "7", option_c: "14", option_d: "1", correct_answer: "B", explanation: "A neutral solution has [H⁺] = [OH⁻], giving pH = 7 at 25°C.", year: 2020 },
    { question: "Isotopes of an element have the same number of:", option_a: "neutrons", option_b: "protons", option_c: "mass number", option_d: "nucleons", correct_answer: "B", explanation: "Isotopes have the same atomic number (protons) but different mass numbers (different neutrons).", year: 2022 },
    { question: "Which compound is formed when ethene reacts with hydrogen?", option_a: "Methane", option_b: "Ethane", option_c: "Propane", option_d: "Butane", correct_answer: "B", explanation: "C₂H₄ + H₂ → C₂H₆ (ethane). This is hydrogenation.", year: 2021 },
    { question: "The catalyst used in the Haber process is:", option_a: "platinum", option_b: "nickel", option_c: "iron", option_d: "vanadium pentoxide", correct_answer: "C", explanation: "The Haber process (N₂ + 3H₂ → 2NH₃) uses iron as a catalyst.", year: 2023 },
    { question: "Electrolysis of brine produces:", option_a: "hydrogen only", option_b: "chlorine only", option_c: "hydrogen and chlorine", option_d: "oxygen and hydrogen", correct_answer: "C", explanation: "Electrolysis of brine (NaCl solution) produces H₂ at cathode and Cl₂ at anode.", year: 2020 },
    { question: "Which of these is an unsaturated hydrocarbon?", option_a: "Methane", option_b: "Ethane", option_c: "Ethene", option_d: "Propane", correct_answer: "C", explanation: "Ethene (C₂H₄) has a C=C double bond, making it unsaturated.", year: 2022 },
    { question: "The functional group -COOH is characteristic of:", option_a: "alcohols", option_b: "aldehydes", option_c: "carboxylic acids", option_d: "ketones", correct_answer: "C", explanation: "The -COOH (carboxyl) group defines carboxylic acids.", year: 2021 },
  ],
  biology: [
    { question: "The powerhouse of the cell is:", option_a: "Nucleus", option_b: "Ribosome", option_c: "Mitochondria", option_d: "Golgi body", correct_answer: "C", explanation: "Mitochondria produce ATP through cellular respiration, earning the nickname 'powerhouse'.", year: 2023 },
    { question: "Which blood group is the universal donor?", option_a: "A", option_b: "B", option_c: "AB", option_d: "O", correct_answer: "D", explanation: "Blood group O has no A or B antigens, so it can be donated to all blood types.", year: 2022 },
    { question: "Photosynthesis occurs in:", option_a: "mitochondria", option_b: "chloroplasts", option_c: "ribosomes", option_d: "nucleus", correct_answer: "B", explanation: "Chloroplasts contain chlorophyll and are the site of photosynthesis.", year: 2021 },
    { question: "The basic unit of heredity is:", option_a: "chromosome", option_b: "gene", option_c: "DNA", option_d: "RNA", correct_answer: "B", explanation: "Genes are the basic units of heredity that determine specific traits.", year: 2023 },
    { question: "Which vitamin is essential for blood clotting?", option_a: "Vitamin A", option_b: "Vitamin C", option_c: "Vitamin D", option_d: "Vitamin K", correct_answer: "D", explanation: "Vitamin K is essential for the synthesis of clotting factors.", year: 2020 },
    { question: "The process by which plants lose water through leaves is:", option_a: "transpiration", option_b: "respiration", option_c: "photosynthesis", option_d: "osmosis", correct_answer: "A", explanation: "Transpiration is the loss of water vapor through stomata in leaves.", year: 2022 },
    { question: "Insulin is produced by:", option_a: "liver", option_b: "pancreas", option_c: "kidney", option_d: "stomach", correct_answer: "B", explanation: "Insulin is produced by beta cells in the islets of Langerhans in the pancreas.", year: 2021 },
    { question: "The largest organ in the human body is:", option_a: "liver", option_b: "brain", option_c: "skin", option_d: "heart", correct_answer: "C", explanation: "The skin is the largest organ, covering the entire body surface.", year: 2023 },
    { question: "Which organelle is responsible for protein synthesis?", option_a: "Mitochondria", option_b: "Ribosomes", option_c: "Lysosomes", option_d: "Vacuoles", correct_answer: "B", explanation: "Ribosomes are the sites of protein synthesis (translation).", year: 2020 },
    { question: "The study of fungi is called:", option_a: "Botany", option_b: "Mycology", option_c: "Zoology", option_d: "Virology", correct_answer: "B", explanation: "Mycology is the branch of biology dealing with fungi.", year: 2022 },
    { question: "DNA replication occurs during which phase of cell cycle?", option_a: "G1 phase", option_b: "S phase", option_c: "G2 phase", option_d: "M phase", correct_answer: "B", explanation: "DNA replication occurs during the S (synthesis) phase of interphase.", year: 2021 },
    { question: "The excretory organ in humans is the:", option_a: "liver", option_b: "kidney", option_c: "lungs", option_d: "large intestine", correct_answer: "B", explanation: "Kidneys are the primary excretory organs, filtering blood and producing urine.", year: 2023 },
    { question: "Which of the following is NOT a greenhouse gas?", option_a: "Carbon dioxide", option_b: "Methane", option_c: "Nitrogen", option_d: "Water vapor", correct_answer: "C", explanation: "Nitrogen (N₂) is not a greenhouse gas; it doesn't absorb infrared radiation.", year: 2020 },
    { question: "Hemoglobin contains which metal?", option_a: "Copper", option_b: "Iron", option_c: "Zinc", option_d: "Magnesium", correct_answer: "B", explanation: "Hemoglobin contains iron (Fe) in its heme group, which binds oxygen.", year: 2022 },
    { question: "The structural and functional unit of the kidney is:", option_a: "neuron", option_b: "nephron", option_c: "alveolus", option_d: "villus", correct_answer: "B", explanation: "Nephrons are the functional units of the kidney that filter blood.", year: 2021 },
  ],
  literature: [
    { question: "Who wrote 'Things Fall Apart'?", option_a: "Wole Soyinka", option_b: "Chinua Achebe", option_c: "Ngugi wa Thiong'o", option_d: "Ben Okri", correct_answer: "B", explanation: "Chinua Achebe wrote 'Things Fall Apart' in 1958.", year: 2023 },
    { question: "A sonnet typically has how many lines?", option_a: "10", option_b: "12", option_c: "14", option_d: "16", correct_answer: "C", explanation: "A sonnet is a 14-line poem, usually in iambic pentameter.", year: 2022 },
    { question: "The use of words that imitate sounds is called:", option_a: "Alliteration", option_b: "Onomatopoeia", option_c: "Assonance", option_d: "Consonance", correct_answer: "B", explanation: "Onomatopoeia uses words that sound like what they describe (buzz, hiss, splash).", year: 2021 },
    { question: "A story with a moral lesson, often using animals, is called:", option_a: "Myth", option_b: "Legend", option_c: "Fable", option_d: "Epic", correct_answer: "C", explanation: "Fables are short stories, typically with animals, that teach a moral lesson.", year: 2023 },
    { question: "The tragic flaw of a hero is known as:", option_a: "Catharsis", option_b: "Hamartia", option_c: "Hubris", option_d: "Nemesis", correct_answer: "B", explanation: "Hamartia is the tragic flaw or error that leads to the hero's downfall.", year: 2020 },
    { question: "Who is the author of 'Purple Hibiscus'?", option_a: "Chimamanda Ngozi Adichie", option_b: "Buchi Emecheta", option_c: "Flora Nwapa", option_d: "Sefi Atta", correct_answer: "A", explanation: "Chimamanda Ngozi Adichie wrote 'Purple Hibiscus' in 2003.", year: 2022 },
    { question: "A play intended to make the audience laugh is called:", option_a: "Tragedy", option_b: "Comedy", option_c: "Melodrama", option_d: "Farce", correct_answer: "B", explanation: "Comedy is a genre of drama intended to amuse and typically has a happy ending.", year: 2021 },
    { question: "The repetition of consonant sounds at the beginning of words is:", option_a: "Assonance", option_b: "Alliteration", option_c: "Rhyme", option_d: "Rhythm", correct_answer: "B", explanation: "Alliteration is the repetition of initial consonant sounds (e.g., 'Peter Piper picked').", year: 2023 },
    { question: "A long narrative poem about heroic deeds is called:", option_a: "Ballad", option_b: "Ode", option_c: "Epic", option_d: "Elegy", correct_answer: "C", explanation: "An epic is a long narrative poem celebrating heroic deeds (e.g., The Odyssey, Beowulf).", year: 2020 },
    { question: "The main character in a literary work is called:", option_a: "Antagonist", option_b: "Protagonist", option_c: "Narrator", option_d: "Persona", correct_answer: "B", explanation: "The protagonist is the main character around whom the story centers.", year: 2022 },
    { question: "Who wrote 'Death and the King's Horseman'?", option_a: "Chinua Achebe", option_b: "J.P. Clark", option_c: "Wole Soyinka", option_d: "Ama Ata Aidoo", correct_answer: "C", explanation: "Wole Soyinka wrote 'Death and the King's Horseman' in 1975.", year: 2021 },
    { question: "A comparison using 'like' or 'as' is called:", option_a: "Metaphor", option_b: "Simile", option_c: "Personification", option_d: "Hyperbole", correct_answer: "B", explanation: "A simile compares two things using 'like' or 'as' (e.g., 'as brave as a lion').", year: 2023 },
    { question: "The feeling or atmosphere created in a literary work is called:", option_a: "Theme", option_b: "Mood", option_c: "Tone", option_d: "Style", correct_answer: "B", explanation: "Mood is the emotional atmosphere that a literary work creates for the reader.", year: 2020 },
    { question: "A poem mourning the death of someone is called:", option_a: "Ode", option_b: "Sonnet", option_c: "Elegy", option_d: "Ballad", correct_answer: "C", explanation: "An elegy is a mournful poem lamenting the death of a person.", year: 2022 },
    { question: "Dramatic irony occurs when:", option_a: "the opposite happens", option_b: "audience knows more than characters", option_c: "words mean opposite", option_d: "situation is humorous", correct_answer: "B", explanation: "Dramatic irony is when the audience knows something the characters don't.", year: 2021 },
  ],
  government: [
    { question: "The principle of separation of powers was propounded by:", option_a: "John Locke", option_b: "Montesquieu", option_c: "Aristotle", option_d: "Thomas Hobbes", correct_answer: "B", explanation: "Baron de Montesquieu developed the theory of separation of powers.", year: 2023 },
    { question: "Nigeria gained independence in:", option_a: "1957", option_b: "1960", option_c: "1963", option_d: "1966", correct_answer: "B", explanation: "Nigeria gained independence from Britain on October 1, 1960.", year: 2022 },
    { question: "The highest court in Nigeria is:", option_a: "Court of Appeal", option_b: "High Court", option_c: "Supreme Court", option_d: "Federal High Court", correct_answer: "C", explanation: "The Supreme Court is the highest court and final court of appeal in Nigeria.", year: 2021 },
    { question: "A system where power is shared between central and regional governments is:", option_a: "Unitary", option_b: "Federalism", option_c: "Confederacy", option_d: "Autocracy", correct_answer: "B", explanation: "Federalism divides power between national and state/regional governments.", year: 2023 },
    { question: "The first Executive President of Nigeria was:", option_a: "Nnamdi Azikiwe", option_b: "Shehu Shagari", option_c: "Olusegun Obasanjo", option_d: "Tafawa Balewa", correct_answer: "B", explanation: "Shehu Shagari became the first Executive President in 1979.", year: 2020 },
    { question: "The right to vote is called:", option_a: "Franchise", option_b: "Suffrage", option_c: "Ballot", option_d: "Both A and B", correct_answer: "D", explanation: "Both 'franchise' and 'suffrage' mean the right to vote.", year: 2022 },
    { question: "Which arm of government makes laws?", option_a: "Executive", option_b: "Legislature", option_c: "Judiciary", option_d: "Civil service", correct_answer: "B", explanation: "The legislature (National Assembly in Nigeria) makes laws.", year: 2021 },
    { question: "The concept of Rule of Law was championed by:", option_a: "Montesquieu", option_b: "A.V. Dicey", option_c: "Karl Marx", option_d: "Jean Rousseau", correct_answer: "B", explanation: "A.V. Dicey developed the modern concept of the Rule of Law.", year: 2023 },
    { question: "Nigeria became a republic in:", option_a: "1960", option_b: "1963", option_c: "1966", option_d: "1979", correct_answer: "B", explanation: "Nigeria became a republic on October 1, 1963.", year: 2020 },
    { question: "The body responsible for conducting elections in Nigeria is:", option_a: "EFCC", option_b: "ICPC", option_c: "INEC", option_d: "NJC", correct_answer: "C", explanation: "INEC (Independent National Electoral Commission) conducts elections.", year: 2022 },
    { question: "Pressure groups are also known as:", option_a: "Political parties", option_b: "Interest groups", option_c: "Trade unions", option_d: "Social clubs", correct_answer: "B", explanation: "Pressure groups are also called interest groups; they seek to influence policy.", year: 2021 },
    { question: "The first military coup in Nigeria occurred in:", option_a: "1960", option_b: "1963", option_c: "1966", option_d: "1975", correct_answer: "C", explanation: "The first military coup in Nigeria was on January 15, 1966.", year: 2023 },
    { question: "Which of these is NOT a feature of democracy?", option_a: "Free elections", option_b: "Rule of law", option_c: "Dictatorship", option_d: "Fundamental rights", correct_answer: "C", explanation: "Dictatorship is the opposite of democracy, not a feature of it.", year: 2020 },
    { question: "The doctrine of checks and balances ensures:", option_a: "absolute power", option_b: "no branch dominates", option_c: "executive supremacy", option_d: "judicial supremacy", correct_answer: "B", explanation: "Checks and balances prevent any branch from having absolute power.", year: 2022 },
    { question: "Lagos was replaced as Nigeria's capital by:", option_a: "Kaduna", option_b: "Ibadan", option_c: "Abuja", option_d: "Kano", correct_answer: "C", explanation: "Abuja became Nigeria's capital on December 12, 1991.", year: 2021 },
  ],
  economics: [
    { question: "The basic economic problem is:", option_a: "unemployment", option_b: "scarcity", option_c: "inflation", option_d: "poverty", correct_answer: "B", explanation: "Scarcity (unlimited wants vs limited resources) is the fundamental economic problem.", year: 2023 },
    { question: "When price increases and quantity demanded decreases, this illustrates:", option_a: "law of supply", option_b: "law of demand", option_c: "law of diminishing returns", option_d: "elasticity", correct_answer: "B", explanation: "The law of demand states that price and quantity demanded are inversely related.", year: 2022 },
    { question: "GDP stands for:", option_a: "General Domestic Product", option_b: "Gross Domestic Product", option_c: "General Development Plan", option_d: "Gross Development Product", correct_answer: "B", explanation: "GDP (Gross Domestic Product) is the total value of goods and services produced.", year: 2021 },
    { question: "A market with only one seller is called:", option_a: "Perfect competition", option_b: "Oligopoly", option_c: "Monopoly", option_d: "Duopoly", correct_answer: "C", explanation: "A monopoly is a market structure with a single seller.", year: 2023 },
    { question: "Inflation refers to:", option_a: "falling prices", option_b: "rising prices", option_c: "stable prices", option_d: "controlled prices", correct_answer: "B", explanation: "Inflation is a sustained increase in the general price level.", year: 2020 },
    { question: "The invisible hand concept was introduced by:", option_a: "Karl Marx", option_b: "John Keynes", option_c: "Adam Smith", option_d: "Alfred Marshall", correct_answer: "C", explanation: "Adam Smith introduced the 'invisible hand' in 'The Wealth of Nations'.", year: 2022 },
    { question: "Money that is backed by government decree is called:", option_a: "commodity money", option_b: "fiat money", option_c: "credit money", option_d: "token money", correct_answer: "B", explanation: "Fiat money has value because the government declares it legal tender.", year: 2021 },
    { question: "Which is NOT a function of money?", option_a: "Medium of exchange", option_b: "Store of value", option_c: "Factor of production", option_d: "Unit of account", correct_answer: "C", explanation: "Money is not a factor of production; land, labor, capital, and enterprise are.", year: 2023 },
    { question: "The Central Bank of Nigeria was established in:", option_a: "1958", option_b: "1959", option_c: "1960", option_d: "1963", correct_answer: "B", explanation: "The Central Bank of Nigeria was established in 1958 and began operations in 1959.", year: 2020 },
    { question: "When supply exceeds demand, there is:", option_a: "shortage", option_b: "surplus", option_c: "equilibrium", option_d: "inflation", correct_answer: "B", explanation: "A surplus occurs when quantity supplied exceeds quantity demanded.", year: 2022 },
    { question: "Progressive taxation means:", option_a: "same rate for all", option_b: "higher rate for higher income", option_c: "lower rate for higher income", option_d: "no taxation", correct_answer: "B", explanation: "Progressive taxes take a larger percentage from higher-income earners.", year: 2021 },
    { question: "The study of individual economic units is called:", option_a: "Macroeconomics", option_b: "Microeconomics", option_c: "Econometrics", option_d: "Development economics", correct_answer: "B", explanation: "Microeconomics studies individual economic units like households and firms.", year: 2023 },
    { question: "Which is an example of indirect tax?", option_a: "Income tax", option_b: "Company tax", option_c: "Value Added Tax", option_d: "Capital gains tax", correct_answer: "C", explanation: "VAT is an indirect tax passed on to consumers through prices.", year: 2020 },
    { question: "A period of declining economic activity is called:", option_a: "boom", option_b: "recovery", option_c: "recession", option_d: "peak", correct_answer: "C", explanation: "A recession is a period of declining GDP and economic activity.", year: 2022 },
    { question: "Balance of trade refers to:", option_a: "total trade", option_b: "exports minus imports", option_c: "imports only", option_d: "exports only", correct_answer: "B", explanation: "Balance of trade is the difference between exports and imports of goods.", year: 2021 },
  ],
  geography: [
    { question: "The layer of the atmosphere closest to Earth is:", option_a: "Stratosphere", option_b: "Troposphere", option_c: "Mesosphere", option_d: "Thermosphere", correct_answer: "B", explanation: "The troposphere extends from Earth's surface to about 12 km.", year: 2023 },
    { question: "Latitude measures distance:", option_a: "East to West", option_b: "North to South", option_c: "Up to Down", option_d: "Diagonally", correct_answer: "B", explanation: "Latitude measures distance north or south of the Equator.", year: 2022 },
    { question: "The largest ocean in the world is:", option_a: "Atlantic Ocean", option_b: "Indian Ocean", option_c: "Pacific Ocean", option_d: "Arctic Ocean", correct_answer: "C", explanation: "The Pacific Ocean covers about 63 million square miles, the largest.", year: 2021 },
    { question: "The imaginary line at 0° longitude is called:", option_a: "Equator", option_b: "Prime Meridian", option_c: "Tropic of Cancer", option_d: "International Date Line", correct_answer: "B", explanation: "The Prime Meridian (0° longitude) passes through Greenwich, England.", year: 2023 },
    { question: "Which rock type is formed from molten magma?", option_a: "Sedimentary", option_b: "Igneous", option_c: "Metamorphic", option_d: "Limestone", correct_answer: "B", explanation: "Igneous rocks form when molten magma cools and solidifies.", year: 2020 },
    { question: "The River Niger flows into:", option_a: "Lake Chad", option_b: "Atlantic Ocean", option_c: "Mediterranean Sea", option_d: "Indian Ocean", correct_answer: "B", explanation: "The River Niger empties into the Atlantic Ocean through the Niger Delta.", year: 2022 },
    { question: "A plateau is:", option_a: "a low-lying area", option_b: "a flat elevated area", option_c: "a valley", option_d: "a depression", correct_answer: "B", explanation: "A plateau is a flat, elevated landform (tableland).", year: 2021 },
    { question: "The study of weather is called:", option_a: "Climatology", option_b: "Meteorology", option_c: "Geology", option_d: "Hydrology", correct_answer: "B", explanation: "Meteorology studies short-term atmospheric conditions (weather).", year: 2023 },
    { question: "Which vegetation belt is closest to the Equator?", option_a: "Desert", option_b: "Savanna", option_c: "Tropical rainforest", option_d: "Mediterranean", correct_answer: "C", explanation: "Tropical rainforests are found near the Equator with high rainfall.", year: 2020 },
    { question: "The highest mountain in Africa is:", option_a: "Mount Kenya", option_b: "Mount Kilimanjaro", option_c: "Mount Cameroon", option_d: "Atlas Mountains", correct_answer: "B", explanation: "Mount Kilimanjaro in Tanzania is Africa's highest peak at 5,895m.", year: 2022 },
    { question: "An earthquake's point of origin underground is called:", option_a: "epicenter", option_b: "focus", option_c: "fault", option_d: "seismic zone", correct_answer: "B", explanation: "The focus (hypocenter) is where an earthquake originates underground.", year: 2021 },
    { question: "Which type of rainfall is caused by mountains?", option_a: "Convectional", option_b: "Frontal", option_c: "Relief", option_d: "Cyclonic", correct_answer: "C", explanation: "Relief (orographic) rainfall occurs when air rises over mountains.", year: 2023 },
    { question: "The Sahara Desert is located in:", option_a: "Asia", option_b: "Australia", option_c: "North Africa", option_d: "South America", correct_answer: "C", explanation: "The Sahara is in North Africa, the world's largest hot desert.", year: 2020 },
    { question: "A scale of 1:50,000 means:", option_a: "1 cm = 50 km", option_b: "1 cm = 500 m", option_c: "1 cm = 50 m", option_d: "1 cm = 5 km", correct_answer: "B", explanation: "1:50,000 means 1 cm on map = 50,000 cm (500 m) in reality.", year: 2022 },
    { question: "The longest river in the world is:", option_a: "Amazon", option_b: "Nile", option_c: "Mississippi", option_d: "Yangtze", correct_answer: "B", explanation: "The Nile River is approximately 6,650 km long.", year: 2021 },
  ],
  accounting: [
    { question: "The accounting equation is:", option_a: "Assets = Liabilities", option_b: "Assets = Capital + Liabilities", option_c: "Assets = Capital - Liabilities", option_d: "Capital = Assets + Liabilities", correct_answer: "B", explanation: "Assets = Capital + Liabilities (or Assets = Equity + Liabilities).", year: 2023 },
    { question: "A trial balance tests:", option_a: "accuracy of accounts", option_b: "arithmetical accuracy", option_c: "profit calculation", option_d: "asset valuation", correct_answer: "B", explanation: "Trial balance verifies that debits equal credits (arithmetical accuracy).", year: 2022 },
    { question: "Depreciation is:", option_a: "increase in asset value", option_b: "decrease in asset value", option_c: "maintenance cost", option_d: "repair expense", correct_answer: "B", explanation: "Depreciation represents the decrease in value of fixed assets over time.", year: 2021 },
    { question: "Which is a current asset?", option_a: "Building", option_b: "Machinery", option_c: "Cash", option_d: "Motor vehicles", correct_answer: "C", explanation: "Cash is a current asset; buildings, machinery, vehicles are fixed assets.", year: 2023 },
    { question: "The book of original entry for credit sales is:", option_a: "Cash book", option_b: "Sales journal", option_c: "Purchases journal", option_d: "General journal", correct_answer: "B", explanation: "Credit sales are first recorded in the sales journal (sales day book).", year: 2020 },
    { question: "Double entry means:", option_a: "recording twice", option_b: "debit and credit entries", option_c: "two books", option_d: "duplicate records", correct_answer: "B", explanation: "Double entry records each transaction with a debit and corresponding credit.", year: 2022 },
    { question: "Goodwill is classified as:", option_a: "current asset", option_b: "intangible asset", option_c: "current liability", option_d: "tangible asset", correct_answer: "B", explanation: "Goodwill is an intangible fixed asset representing business reputation.", year: 2021 },
    { question: "The formula for gross profit is:", option_a: "Sales - Expenses", option_b: "Sales - Cost of goods sold", option_c: "Sales - Net profit", option_d: "Revenue - Liabilities", correct_answer: "B", explanation: "Gross Profit = Sales Revenue - Cost of Goods Sold.", year: 2023 },
    { question: "Which accounting concept states that expenses should match revenues?", option_a: "Prudence", option_b: "Going concern", option_c: "Matching concept", option_d: "Entity concept", correct_answer: "C", explanation: "The matching concept matches expenses to the revenues they generate.", year: 2020 },
    { question: "Bank reconciliation is prepared to:", option_a: "balance the bank", option_b: "explain differences", option_c: "increase balance", option_d: "decrease balance", correct_answer: "B", explanation: "Bank reconciliation explains differences between cash book and bank statement.", year: 2022 },
    { question: "A provision for bad debts is:", option_a: "an asset", option_b: "a liability", option_c: "a contra asset", option_d: "an expense only", correct_answer: "C", explanation: "Provision for bad debts reduces receivables (contra asset).", year: 2021 },
    { question: "Which is NOT a book of original entry?", option_a: "Cash book", option_b: "Ledger", option_c: "Sales journal", option_d: "Purchases journal", correct_answer: "B", explanation: "The ledger is not a book of original entry; it's where entries are posted.", year: 2023 },
    { question: "FIFO stands for:", option_a: "First In First Out", option_b: "Final Inventory For Operations", option_c: "First Inventory Final Output", option_d: "Final In First Out", correct_answer: "A", explanation: "FIFO (First In First Out) is an inventory valuation method.", year: 2020 },
    { question: "A debit note is sent by:", option_a: "seller to buyer", option_b: "buyer to seller", option_c: "bank to customer", option_d: "creditor to debtor", correct_answer: "B", explanation: "A buyer sends a debit note to seller for goods returned.", year: 2022 },
    { question: "Working capital is:", option_a: "fixed assets - liabilities", option_b: "current assets - current liabilities", option_c: "total assets", option_d: "capital employed", correct_answer: "B", explanation: "Working Capital = Current Assets - Current Liabilities.", year: 2021 },
  ],
  commerce: [
    { question: "Commerce is defined as:", option_a: "production of goods", option_b: "trade and aids to trade", option_c: "manufacturing only", option_d: "farming activities", correct_answer: "B", explanation: "Commerce encompasses trade and all activities that facilitate trade.", year: 2023 },
    { question: "Which is NOT an aid to trade?", option_a: "Banking", option_b: "Insurance", option_c: "Production", option_d: "Transportation", correct_answer: "C", explanation: "Production is industry, not commerce. Banking, insurance, transport aid trade.", year: 2022 },
    { question: "A wholesaler buys from:", option_a: "consumers", option_b: "retailers", option_c: "manufacturers", option_d: "agents", correct_answer: "C", explanation: "Wholesalers buy in bulk from manufacturers and sell to retailers.", year: 2021 },
    { question: "An example of invisible export is:", option_a: "crude oil", option_b: "cocoa", option_c: "tourism services", option_d: "textiles", correct_answer: "C", explanation: "Invisible exports are services like tourism, banking, shipping.", year: 2023 },
    { question: "The Stock Exchange deals in:", option_a: "consumer goods", option_b: "securities", option_c: "raw materials", option_d: "agricultural products", correct_answer: "B", explanation: "Stock exchanges trade in securities (shares, bonds, etc.).", year: 2020 },
    { question: "A bill of lading is used in:", option_a: "air transport", option_b: "sea transport", option_c: "road transport", option_d: "rail transport", correct_answer: "B", explanation: "A bill of lading is a document used in shipping goods by sea.", year: 2022 },
    { question: "Hire purchase involves:", option_a: "full payment upfront", option_b: "payment in installments", option_c: "free goods", option_d: "cash discount", correct_answer: "B", explanation: "Hire purchase allows buyers to pay for goods in installments.", year: 2021 },
    { question: "A franchise is:", option_a: "a type of insurance", option_b: "license to use a brand", option_c: "bank loan", option_d: "government agency", correct_answer: "B", explanation: "A franchise is the right to operate a business using another's brand.", year: 2023 },
    { question: "E-commerce refers to:", option_a: "traditional trade", option_b: "electronic trading", option_c: "export trade", option_d: "wholesale trade", correct_answer: "B", explanation: "E-commerce is buying and selling goods/services over the internet.", year: 2020 },
    { question: "The main function of advertising is to:", option_a: "reduce prices", option_b: "inform and persuade", option_c: "store goods", option_d: "transport goods", correct_answer: "B", explanation: "Advertising informs consumers and persuades them to buy.", year: 2022 },
    { question: "A cooperative society is owned by:", option_a: "government", option_b: "shareholders", option_c: "members", option_d: "directors", correct_answer: "C", explanation: "Cooperative societies are owned and controlled by their members.", year: 2021 },
    { question: "Which document shows goods dispatched?", option_a: "Invoice", option_b: "Receipt", option_c: "Consignment note", option_d: "Order form", correct_answer: "C", explanation: "A consignment note accompanies goods being transported.", year: 2023 },
    { question: "Insurance provides protection against:", option_a: "profit loss", option_b: "financial risk", option_c: "competition", option_d: "bad management", correct_answer: "B", explanation: "Insurance protects against financial losses from specified risks.", year: 2020 },
    { question: "The principle of utmost good faith applies to:", option_a: "banking", option_b: "insurance", option_c: "warehousing", option_d: "advertising", correct_answer: "B", explanation: "Utmost good faith (uberrimae fidei) requires full disclosure in insurance.", year: 2022 },
    { question: "Trade within a country is called:", option_a: "international trade", option_b: "domestic trade", option_c: "entrepot trade", option_d: "export trade", correct_answer: "B", explanation: "Domestic (home/internal) trade occurs within a country's borders.", year: 2021 },
  ],
  crs: [
    { question: "The first book of the Bible is:", option_a: "Exodus", option_b: "Genesis", option_c: "Leviticus", option_d: "Numbers", correct_answer: "B", explanation: "Genesis is the first book of the Bible, meaning 'beginning'.", year: 2023 },
    { question: "Who was thrown into the lion's den?", option_a: "David", option_b: "Daniel", option_c: "Moses", option_d: "Elijah", correct_answer: "B", explanation: "Daniel was thrown into the lion's den for praying to God (Daniel 6).", year: 2022 },
    { question: "The Sermon on the Mount is recorded in:", option_a: "Mark", option_b: "Luke", option_c: "Matthew", option_d: "John", correct_answer: "C", explanation: "The Sermon on the Mount is in Matthew chapters 5-7.", year: 2021 },
    { question: "Jesus was baptized by:", option_a: "Peter", option_b: "John the Baptist", option_c: "Paul", option_d: "James", correct_answer: "B", explanation: "John the Baptist baptized Jesus in the River Jordan.", year: 2023 },
    { question: "The Ten Commandments were given to:", option_a: "Abraham", option_b: "Moses", option_c: "David", option_d: "Solomon", correct_answer: "B", explanation: "God gave the Ten Commandments to Moses on Mount Sinai.", year: 2020 },
    { question: "The Apostle of the Gentiles was:", option_a: "Peter", option_b: "James", option_c: "Paul", option_d: "John", correct_answer: "C", explanation: "Paul is called the Apostle to the Gentiles for his missionary work.", year: 2022 },
    { question: "How many disciples did Jesus have?", option_a: "10", option_b: "11", option_c: "12", option_d: "13", correct_answer: "C", explanation: "Jesus chose 12 disciples (apostles).", year: 2021 },
    { question: "The story of the Good Samaritan teaches:", option_a: "prayer", option_b: "love for neighbor", option_c: "fasting", option_d: "tithing", correct_answer: "B", explanation: "The Good Samaritan parable teaches loving one's neighbor.", year: 2023 },
    { question: "Pentecost commemorates:", option_a: "Jesus' birth", option_b: "coming of Holy Spirit", option_c: "Jesus' death", option_d: "Last Supper", correct_answer: "B", explanation: "Pentecost marks the descent of the Holy Spirit on the apostles.", year: 2020 },
    { question: "The longest Psalm is:", option_a: "Psalm 23", option_b: "Psalm 119", option_c: "Psalm 51", option_d: "Psalm 1", correct_answer: "B", explanation: "Psalm 119 is the longest chapter in the Bible with 176 verses.", year: 2022 },
    { question: "Who denied Jesus three times?", option_a: "Judas", option_b: "Peter", option_c: "Thomas", option_d: "John", correct_answer: "B", explanation: "Peter denied knowing Jesus three times before the rooster crowed.", year: 2021 },
    { question: "The Beatitudes begin with:", option_a: "Blessed are the meek", option_b: "Blessed are the poor in spirit", option_c: "Blessed are the peacemakers", option_d: "Blessed are the merciful", correct_answer: "B", explanation: "The first Beatitude is 'Blessed are the poor in spirit' (Matthew 5:3).", year: 2023 },
    { question: "Jesus raised Lazarus after how many days?", option_a: "2 days", option_b: "3 days", option_c: "4 days", option_d: "7 days", correct_answer: "C", explanation: "Lazarus had been dead for four days when Jesus raised him (John 11).", year: 2020 },
    { question: "The Lord's Prayer is found in:", option_a: "Genesis", option_b: "Psalms", option_c: "Matthew", option_d: "Revelation", correct_answer: "C", explanation: "The Lord's Prayer is in Matthew 6:9-13 and Luke 11:2-4.", year: 2022 },
    { question: "The fruit of the Spirit includes:", option_a: "anger", option_b: "love", option_c: "pride", option_d: "jealousy", correct_answer: "B", explanation: "Love is the first fruit of the Spirit listed in Galatians 5:22-23.", year: 2021 },
  ],
  irs: [
    { question: "The first revelation to Prophet Muhammad was:", option_a: "Surah Al-Fatiha", option_b: "Surah Al-Alaq", option_c: "Surah Al-Baqarah", option_d: "Surah An-Nas", correct_answer: "B", explanation: "The first verses revealed were from Surah Al-Alaq (96:1-5).", year: 2023 },
    { question: "Hajj is performed in the month of:", option_a: "Ramadan", option_b: "Dhul Hijjah", option_c: "Muharram", option_d: "Shawwal", correct_answer: "B", explanation: "Hajj takes place during the Islamic month of Dhul Hijjah.", year: 2022 },
    { question: "The number of Surahs in the Quran is:", option_a: "100", option_b: "110", option_c: "114", option_d: "120", correct_answer: "C", explanation: "The Quran contains 114 Surahs (chapters).", year: 2021 },
    { question: "Zakat is one of the:", option_a: "six pillars", option_b: "five pillars", option_c: "four pillars", option_d: "three pillars", correct_answer: "B", explanation: "Zakat (charity) is one of the Five Pillars of Islam.", year: 2023 },
    { question: "The wife of Prophet Ibrahim was:", option_a: "Maryam", option_b: "Sarah", option_c: "Asiyah", option_d: "Fatimah", correct_answer: "B", explanation: "Sarah was the wife of Prophet Ibrahim (Abraham).", year: 2020 },
    { question: "The Battle of Badr occurred in:", option_a: "1 AH", option_b: "2 AH", option_c: "3 AH", option_d: "4 AH", correct_answer: "B", explanation: "The Battle of Badr took place in 2 AH (624 CE).", year: 2022 },
    { question: "Fasting during Ramadan is called:", option_a: "Salat", option_b: "Zakat", option_c: "Sawm", option_d: "Hajj", correct_answer: "C", explanation: "Sawm is the Arabic term for fasting during Ramadan.", year: 2021 },
    { question: "The Prophet's migration from Makkah to Madinah is called:", option_a: "Isra", option_b: "Hijrah", option_c: "Miraj", option_d: "Jihad", correct_answer: "B", explanation: "The Hijrah (migration) occurred in 622 CE, marking year 1 AH.", year: 2023 },
    { question: "The first Muezzin of Islam was:", option_a: "Abu Bakr", option_b: "Umar", option_c: "Bilal", option_d: "Uthman", correct_answer: "C", explanation: "Bilal ibn Rabah was the first muezzin (caller to prayer) in Islam.", year: 2020 },
    { question: "Surah Al-Fatiha has how many verses?", option_a: "5", option_b: "6", option_c: "7", option_d: "8", correct_answer: "C", explanation: "Surah Al-Fatiha (The Opening) has 7 verses.", year: 2022 },
    { question: "The last prophet in Islam is:", option_a: "Ibrahim", option_b: "Isa", option_c: "Musa", option_d: "Muhammad", correct_answer: "D", explanation: "Prophet Muhammad is the final prophet (Seal of the Prophets).", year: 2021 },
    { question: "Wudu is:", option_a: "prayer", option_b: "fasting", option_c: "ablution", option_d: "pilgrimage", correct_answer: "C", explanation: "Wudu is the ritual washing (ablution) before prayer.", year: 2023 },
    { question: "The Quran was revealed over a period of:", option_a: "10 years", option_b: "15 years", option_c: "23 years", option_d: "30 years", correct_answer: "C", explanation: "The Quran was revealed over approximately 23 years.", year: 2020 },
    { question: "Eid-ul-Fitr marks the end of:", option_a: "Hajj", option_b: "Ramadan", option_c: "Muharram", option_d: "Dhul Hijjah", correct_answer: "B", explanation: "Eid-ul-Fitr celebrates the end of Ramadan fasting.", year: 2022 },
    { question: "The Qiblah direction is towards:", option_a: "Jerusalem", option_b: "Madinah", option_c: "Makkah", option_d: "Damascus", correct_answer: "C", explanation: "Muslims face the Kaaba in Makkah (Qiblah) during prayer.", year: 2021 },
  ],
  agricultural_science: [
    { question: "Photosynthesis in plants occurs mainly in the:", option_a: "roots", option_b: "stem", option_c: "leaves", option_d: "flowers", correct_answer: "C", explanation: "Leaves contain chlorophyll and are the main site of photosynthesis.", year: 2023 },
    { question: "NPK fertilizer contains:", option_a: "Nitrogen, Potassium, Calcium", option_b: "Nitrogen, Phosphorus, Potassium", option_c: "Nickel, Phosphorus, Potassium", option_d: "Nitrogen, Phosphorus, Kalium", correct_answer: "B", explanation: "NPK stands for Nitrogen (N), Phosphorus (P), and Potassium (K).", year: 2022 },
    { question: "The practice of growing crops and rearing animals is called:", option_a: "horticulture", option_b: "agriculture", option_c: "apiculture", option_d: "silviculture", correct_answer: "B", explanation: "Agriculture is the science of farming crops and raising animals.", year: 2021 },
    { question: "Leguminous plants are important because they:", option_a: "produce oxygen", option_b: "fix nitrogen", option_c: "prevent erosion", option_d: "absorb carbon", correct_answer: "B", explanation: "Legumes have root nodules with bacteria that fix atmospheric nitrogen.", year: 2023 },
    { question: "Poultry farming involves rearing of:", option_a: "cattle", option_b: "sheep", option_c: "birds", option_d: "pigs", correct_answer: "C", explanation: "Poultry farming involves raising birds like chickens, turkeys, ducks.", year: 2020 },
    { question: "Crop rotation helps to:", option_a: "increase weeds", option_b: "maintain soil fertility", option_c: "spread diseases", option_d: "reduce yields", correct_answer: "B", explanation: "Crop rotation maintains soil fertility and breaks pest cycles.", year: 2022 },
    { question: "The pH of acidic soil is:", option_a: "above 7", option_b: "exactly 7", option_c: "below 7", option_d: "14", correct_answer: "C", explanation: "Acidic soils have pH below 7; neutral is 7; alkaline is above 7.", year: 2021 },
    { question: "Vegetative propagation is:", option_a: "sexual reproduction", option_b: "asexual reproduction", option_c: "seed production", option_d: "pollination", correct_answer: "B", explanation: "Vegetative propagation is asexual reproduction using plant parts.", year: 2023 },
    { question: "The gestation period of a cow is approximately:", option_a: "5 months", option_b: "9 months", option_c: "12 months", option_d: "15 months", correct_answer: "B", explanation: "Cattle have a gestation period of about 9 months (283 days).", year: 2020 },
    { question: "Which is NOT a method of soil conservation?", option_a: "Terracing", option_b: "Bush burning", option_c: "Mulching", option_d: "Cover cropping", correct_answer: "B", explanation: "Bush burning destroys soil structure and organic matter.", year: 2022 },
    { question: "Aquaculture is the rearing of:", option_a: "poultry", option_b: "cattle", option_c: "fish", option_d: "bees", correct_answer: "C", explanation: "Aquaculture is fish farming or aquatic organism cultivation.", year: 2021 },
    { question: "The part of a seed that develops into the root is:", option_a: "plumule", option_b: "radicle", option_c: "cotyledon", option_d: "testa", correct_answer: "B", explanation: "The radicle is the embryonic root that grows into the root system.", year: 2023 },
    { question: "Silage is:", option_a: "dry grass", option_b: "fermented fodder", option_c: "animal waste", option_d: "mineral supplement", correct_answer: "B", explanation: "Silage is fermented, high-moisture stored fodder for livestock.", year: 2020 },
    { question: "Which disease affects cattle?", option_a: "Newcastle disease", option_b: "Rinderpest", option_c: "Fowl pox", option_d: "Coccidiosis", correct_answer: "B", explanation: "Rinderpest (cattle plague) affects cattle and buffalo.", year: 2022 },
    { question: "Humus is:", option_a: "inorganic matter", option_b: "decomposed organic matter", option_c: "mineral soil", option_d: "sand particles", correct_answer: "B", explanation: "Humus is dark, decomposed organic matter that enriches soil.", year: 2021 },
  ]
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let insertedCount = 0;
    let skippedCount = 0;
    const results: Record<string, { inserted: number; skipped: number }> = {};

    for (const [subject, questions] of Object.entries(ADDITIONAL_QUESTIONS)) {
      results[subject] = { inserted: 0, skipped: 0 };
      
      for (const q of questions) {
        // Check if question already exists
        const { data: existing } = await supabase
          .from('jamb_questions')
          .select('id')
          .eq('question', q.question)
          .eq('subject', subject)
          .maybeSingle();

        if (existing) {
          skippedCount++;
          results[subject].skipped++;
          continue;
        }

        // Insert new question
        const { error } = await supabase
          .from('jamb_questions')
          .insert({
            subject,
            question: q.question,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            year: q.year
          });

        if (!error) {
          insertedCount++;
          results[subject].inserted++;
        }
      }
    }

    // Get total count
    const { count } = await supabase
      .from('jamb_questions')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedCount} new questions, skipped ${skippedCount} duplicates`,
        inserted: insertedCount,
        skipped: skippedCount,
        total_in_database: count,
        by_subject: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
