import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// NEW batch of 200+ unique JAMB questions (2025 style)
const EXTRA_QUESTIONS: Record<string, Array<{question: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; explanation: string; year: number}>> = {
  english: [
    { question: "The word 'prolific' means:", option_a: "lazy", option_b: "producing much", option_c: "ancient", option_d: "dangerous", correct_answer: "B", explanation: "Prolific means producing a lot of something, especially creative work.", year: 2025 },
    { question: "Choose the correct sentence:", option_a: "He don't know nothing", option_b: "He doesn't know anything", option_c: "He don't knows anything", option_d: "He doesn't knows nothing", correct_answer: "B", explanation: "Correct grammar uses 'doesn't' with third person singular and 'anything' instead of double negative.", year: 2025 },
    { question: "The word 'enigma' means:", option_a: "puzzle or mystery", option_b: "celebration", option_c: "disaster", option_d: "agreement", correct_answer: "A", explanation: "An enigma is something mysterious or difficult to understand.", year: 2025 },
    { question: "An allegory is:", option_a: "a type of rhyme", option_b: "a story with hidden meaning", option_c: "a punctuation mark", option_d: "a grammar rule", correct_answer: "B", explanation: "An allegory uses symbolic characters and events to convey a deeper meaning.", year: 2025 },
    { question: "The plural of 'crisis' is:", option_a: "crisises", option_b: "crises", option_c: "crisis", option_d: "crisiss", correct_answer: "B", explanation: "Crisis has Greek origin; its plural changes -is to -es.", year: 2025 },
    { question: "'The lion's share' means:", option_a: "a small portion", option_b: "the largest part", option_c: "equal division", option_d: "nothing at all", correct_answer: "B", explanation: "This idiom means the biggest or best portion of something.", year: 2025 },
    { question: "A eulogy is:", option_a: "a criticism", option_b: "a speech praising someone", option_c: "a type of poem", option_d: "a debate", correct_answer: "B", explanation: "A eulogy is a speech or writing in praise of someone, often deceased.", year: 2025 },
    { question: "The word 'verbose' describes someone who:", option_a: "speaks few words", option_b: "uses too many words", option_c: "speaks softly", option_d: "never speaks", correct_answer: "B", explanation: "Verbose means using more words than necessary; wordy.", year: 2025 },
    { question: "Identify the adverb in: 'She sings melodiously.'", option_a: "She", option_b: "sings", option_c: "melodiously", option_d: "None", correct_answer: "C", explanation: "'Melodiously' describes how she sings, making it an adverb.", year: 2025 },
    { question: "A paradox is:", option_a: "a simple statement", option_b: "a seemingly contradictory truth", option_c: "a question", option_d: "a command", correct_answer: "B", explanation: "A paradox appears contradictory but contains a hidden truth.", year: 2025 },
    { question: "The word 'gregarious' describes someone who is:", option_a: "shy", option_b: "sociable", option_c: "angry", option_d: "dishonest", correct_answer: "B", explanation: "Gregarious means fond of company; sociable.", year: 2025 },
    { question: "Choose the word with stress on the first syllable:", option_a: "beLIEVE", option_b: "reCORD (verb)", option_c: "REcord (noun)", option_d: "conTROL", correct_answer: "C", explanation: "As a noun, 'record' is stressed on the first syllable: RE-cord.", year: 2025 },
    { question: "'To hit the nail on the head' means:", option_a: "to make a mistake", option_b: "to be exactly right", option_c: "to cause injury", option_d: "to work hard", correct_answer: "B", explanation: "This idiom means to describe exactly what is causing a situation.", year: 2025 },
    { question: "The word 'altruistic' means:", option_a: "selfish", option_b: "unselfish concern for others", option_c: "wealthy", option_d: "artistic", correct_answer: "B", explanation: "Altruistic means showing unselfish concern for the welfare of others.", year: 2025 },
    { question: "A soliloquy is:", option_a: "a conversation between two people", option_b: "a speech to oneself", option_c: "a group discussion", option_d: "a written letter", correct_answer: "B", explanation: "A soliloquy is a speech in which a character speaks their thoughts aloud, alone.", year: 2025 },
  ],
  mathematics: [
    { question: "If 2^x = 64, find x.", option_a: "4", option_b: "5", option_c: "6", option_d: "7", correct_answer: "C", explanation: "2^6 = 64, so x = 6.", year: 2025 },
    { question: "The sum of angles in a pentagon is:", option_a: "360°", option_b: "540°", option_c: "720°", option_d: "180°", correct_answer: "B", explanation: "(n-2)×180 = (5-2)×180 = 540°.", year: 2025 },
    { question: "Simplify: 5! ÷ 3!", option_a: "10", option_b: "20", option_c: "60", option_d: "2", correct_answer: "B", explanation: "5!/3! = 5×4 = 20.", year: 2025 },
    { question: "The gradient of y = 2x + 5 is:", option_a: "2", option_b: "5", option_c: "7", option_d: "10", correct_answer: "A", explanation: "In y = mx + c, the gradient m = 2.", year: 2025 },
    { question: "Find the median of 3, 7, 2, 9, 5.", option_a: "3", option_b: "5", option_c: "7", option_d: "9", correct_answer: "B", explanation: "Arranged: 2, 3, 5, 7, 9. The middle value is 5.", year: 2025 },
    { question: "If A = {1, 2, 3} and B = {3, 4, 5}, find A ∪ B.", option_a: "{3}", option_b: "{1, 2, 3, 4, 5}", option_c: "{1, 2}", option_d: "{4, 5}", correct_answer: "B", explanation: "A ∪ B contains all elements from both sets.", year: 2025 },
    { question: "Solve: 4x - 8 = 12", option_a: "x = 3", option_b: "x = 4", option_c: "x = 5", option_d: "x = 6", correct_answer: "C", explanation: "4x = 20, so x = 5.", year: 2025 },
    { question: "The area of a triangle with base 10 and height 6 is:", option_a: "16", option_b: "30", option_c: "60", option_d: "20", correct_answer: "B", explanation: "Area = ½ × base × height = ½ × 10 × 6 = 30.", year: 2025 },
    { question: "If cos 60° = 0.5, find cos 120°.", option_a: "0.5", option_b: "-0.5", option_c: "1", option_d: "0", correct_answer: "B", explanation: "cos 120° = cos(180° - 60°) = -cos 60° = -0.5.", year: 2025 },
    { question: "Evaluate: 3² + 4²", option_a: "7", option_b: "12", option_c: "25", option_d: "49", correct_answer: "C", explanation: "9 + 16 = 25.", year: 2025 },
    { question: "The mode of 2, 3, 3, 4, 5, 3 is:", option_a: "2", option_b: "3", option_c: "4", option_d: "5", correct_answer: "B", explanation: "3 appears most frequently (3 times).", year: 2025 },
    { question: "Find the value of 27^(1/3).", option_a: "3", option_b: "9", option_c: "27", option_d: "81", correct_answer: "A", explanation: "27^(1/3) = ∛27 = 3.", year: 2025 },
    { question: "If f(x) = x² + 1, find f(3).", option_a: "8", option_b: "9", option_c: "10", option_d: "12", correct_answer: "C", explanation: "f(3) = 3² + 1 = 9 + 1 = 10.", year: 2025 },
    { question: "The range of 5, 8, 12, 3, 9 is:", option_a: "5", option_b: "7", option_c: "9", option_d: "12", correct_answer: "C", explanation: "Range = highest - lowest = 12 - 3 = 9.", year: 2025 },
    { question: "Simplify: √50", option_a: "5√2", option_b: "2√5", option_c: "10", option_d: "25", correct_answer: "A", explanation: "√50 = √(25×2) = 5√2.", year: 2025 },
  ],
  physics: [
    { question: "The SI unit of force is:", option_a: "Joule", option_b: "Newton", option_c: "Watt", option_d: "Pascal", correct_answer: "B", explanation: "The Newton (N) is the SI unit of force.", year: 2025 },
    { question: "Which type of mirror is used in car headlights?", option_a: "Plane mirror", option_b: "Concave mirror", option_c: "Convex mirror", option_d: "Cylindrical mirror", correct_answer: "B", explanation: "Concave mirrors produce parallel light beams from the bulb.", year: 2025 },
    { question: "The unit of electric power is:", option_a: "Ampere", option_b: "Volt", option_c: "Watt", option_d: "Ohm", correct_answer: "C", explanation: "Power (P = VI) is measured in Watts.", year: 2025 },
    { question: "An object at terminal velocity has:", option_a: "increasing speed", option_b: "zero acceleration", option_c: "decreasing speed", option_d: "negative velocity", correct_answer: "B", explanation: "At terminal velocity, air resistance equals weight, so acceleration is zero.", year: 2025 },
    { question: "The phenomenon that explains the blue color of the sky is:", option_a: "reflection", option_b: "refraction", option_c: "scattering", option_d: "diffraction", correct_answer: "C", explanation: "Rayleigh scattering causes shorter blue wavelengths to scatter more.", year: 2025 },
    { question: "In a step-up transformer:", option_a: "voltage decreases", option_b: "voltage increases", option_c: "current increases", option_d: "power increases", correct_answer: "B", explanation: "A step-up transformer increases voltage while decreasing current.", year: 2025 },
    { question: "The SI unit of wavelength is:", option_a: "Hertz", option_b: "Second", option_c: "Metre", option_d: "Joule", correct_answer: "C", explanation: "Wavelength is a distance and is measured in metres.", year: 2025 },
    { question: "Which of these is a primary color of light?", option_a: "Yellow", option_b: "Orange", option_c: "Green", option_d: "Purple", correct_answer: "C", explanation: "Primary colors of light are Red, Green, and Blue (RGB).", year: 2025 },
    { question: "The work done when a force moves an object in its direction is:", option_a: "zero", option_b: "negative", option_c: "positive", option_d: "infinite", correct_answer: "C", explanation: "Work = F × d × cos θ; when θ = 0°, cos θ = 1, so work is positive.", year: 2025 },
    { question: "Echo is a result of:", option_a: "refraction of sound", option_b: "reflection of sound", option_c: "diffraction of sound", option_d: "absorption of sound", correct_answer: "B", explanation: "Echo is caused by the reflection of sound waves from surfaces.", year: 2025 },
    { question: "The instrument used to measure atmospheric pressure is:", option_a: "thermometer", option_b: "ammeter", option_c: "barometer", option_d: "voltmeter", correct_answer: "C", explanation: "A barometer measures atmospheric pressure.", year: 2025 },
    { question: "Fuse wire should have:", option_a: "high melting point", option_b: "low melting point", option_c: "high resistance", option_d: "both B and C", correct_answer: "D", explanation: "Fuse wire needs low melting point and high resistance to melt quickly on overload.", year: 2025 },
    { question: "Beta particles are:", option_a: "protons", option_b: "electrons", option_c: "neutrons", option_d: "alpha particles", correct_answer: "B", explanation: "Beta particles are high-energy electrons emitted during radioactive decay.", year: 2025 },
    { question: "The phenomenon of total internal reflection requires:", option_a: "light going from less dense to denser medium", option_b: "light going from denser to less dense medium", option_c: "angle less than critical angle", option_d: "no boundary", correct_answer: "B", explanation: "Total internal reflection occurs when light travels from denser to less dense medium at angle greater than critical angle.", year: 2025 },
    { question: "The efficiency of a machine is always:", option_a: "greater than 100%", option_b: "equal to 100%", option_c: "less than 100%", option_d: "exactly 50%", correct_answer: "C", explanation: "Due to friction and other losses, efficiency is always less than 100%.", year: 2025 },
  ],
  chemistry: [
    { question: "The most electronegative element is:", option_a: "Oxygen", option_b: "Nitrogen", option_c: "Fluorine", option_d: "Chlorine", correct_answer: "C", explanation: "Fluorine has the highest electronegativity (4.0 on Pauling scale).", year: 2025 },
    { question: "Which gas is used in fire extinguishers?", option_a: "Oxygen", option_b: "Nitrogen", option_c: "Carbon dioxide", option_d: "Hydrogen", correct_answer: "C", explanation: "CO₂ is non-flammable and denser than air, smothering fires.", year: 2025 },
    { question: "The process of converting iron to iron(III) oxide is called:", option_a: "reduction", option_b: "oxidation", option_c: "neutralization", option_d: "precipitation", correct_answer: "B", explanation: "Rusting is an oxidation process where iron loses electrons.", year: 2025 },
    { question: "Which of these is a transition metal?", option_a: "Sodium", option_b: "Calcium", option_c: "Iron", option_d: "Potassium", correct_answer: "C", explanation: "Iron (Fe) is a transition metal found in the d-block.", year: 2025 },
    { question: "The bond in NaCl is:", option_a: "covalent", option_b: "ionic", option_c: "metallic", option_d: "hydrogen", correct_answer: "B", explanation: "NaCl forms ionic bonds through electron transfer from Na to Cl.", year: 2025 },
    { question: "A substance with pH 2 is:", option_a: "neutral", option_b: "weakly acidic", option_c: "strongly acidic", option_d: "basic", correct_answer: "C", explanation: "pH 2 indicates high H⁺ concentration, making it strongly acidic.", year: 2025 },
    { question: "The valency of carbon is:", option_a: "1", option_b: "2", option_c: "3", option_d: "4", correct_answer: "D", explanation: "Carbon has 4 valence electrons and a valency of 4.", year: 2025 },
    { question: "Which of these is an allotrope of carbon?", option_a: "Ozone", option_b: "Diamond", option_c: "Water", option_d: "Ammonia", correct_answer: "B", explanation: "Diamond and graphite are allotropes of carbon.", year: 2025 },
    { question: "The gas evolved when calcium carbonate reacts with HCl is:", option_a: "hydrogen", option_b: "oxygen", option_c: "carbon dioxide", option_d: "nitrogen", correct_answer: "C", explanation: "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂", year: 2025 },
    { question: "An isotope has the same number of:", option_a: "neutrons", option_b: "protons", option_c: "mass number", option_d: "electrons only", correct_answer: "B", explanation: "Isotopes have equal protons (same element) but different neutrons.", year: 2025 },
    { question: "The molecular formula of glucose is:", option_a: "C₆H₁₀O₅", option_b: "C₆H₁₂O₆", option_c: "C₁₂H₂₂O₁₁", option_d: "C₂H₅OH", correct_answer: "B", explanation: "Glucose has the formula C₆H₁₂O₆.", year: 2025 },
    { question: "Which metal is liquid at room temperature?", option_a: "Iron", option_b: "Copper", option_c: "Mercury", option_d: "Lead", correct_answer: "C", explanation: "Mercury (Hg) is the only metal that is liquid at room temperature.", year: 2025 },
    { question: "Saponification is the process of making:", option_a: "plastic", option_b: "soap", option_c: "glass", option_d: "rubber", correct_answer: "B", explanation: "Saponification is the hydrolysis of fat/oil with alkali to make soap.", year: 2025 },
    { question: "The hardest naturally occurring substance is:", option_a: "iron", option_b: "quartz", option_c: "diamond", option_d: "steel", correct_answer: "C", explanation: "Diamond is the hardest natural material due to its tetrahedral carbon bonds.", year: 2025 },
    { question: "Which of these is NOT a hydrocarbon?", option_a: "Methane", option_b: "Ethanol", option_c: "Propane", option_d: "Butane", correct_answer: "B", explanation: "Ethanol (C₂H₅OH) contains oxygen, so it's not a hydrocarbon.", year: 2025 },
  ],
  biology: [
    { question: "The genetic material in most organisms is:", option_a: "RNA", option_b: "DNA", option_c: "Protein", option_d: "Lipids", correct_answer: "B", explanation: "DNA carries genetic information in most organisms.", year: 2025 },
    { question: "Which organelle is responsible for detoxification?", option_a: "Mitochondria", option_b: "Smooth ER", option_c: "Nucleus", option_d: "Ribosome", correct_answer: "B", explanation: "Smooth endoplasmic reticulum detoxifies drugs and poisons.", year: 2025 },
    { question: "The process of cell division that produces gametes is:", option_a: "mitosis", option_b: "meiosis", option_c: "binary fission", option_d: "budding", correct_answer: "B", explanation: "Meiosis produces haploid gametes (sex cells).", year: 2025 },
    { question: "Which blood cells are involved in clotting?", option_a: "Red blood cells", option_b: "White blood cells", option_c: "Platelets", option_d: "Plasma", correct_answer: "C", explanation: "Platelets (thrombocytes) are essential for blood clotting.", year: 2025 },
    { question: "The enzyme that digests starch in the mouth is:", option_a: "pepsin", option_b: "amylase", option_c: "lipase", option_d: "trypsin", correct_answer: "B", explanation: "Salivary amylase begins starch digestion in the mouth.", year: 2025 },
    { question: "Photosynthesis produces:", option_a: "carbon dioxide", option_b: "water only", option_c: "glucose and oxygen", option_d: "nitrogen", correct_answer: "C", explanation: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂", year: 2025 },
    { question: "The functional unit of the kidney is:", option_a: "neuron", option_b: "nephron", option_c: "alveolus", option_d: "villus", correct_answer: "B", explanation: "Nephrons filter blood and produce urine.", year: 2025 },
    { question: "Which hormone regulates blood sugar?", option_a: "Thyroxine", option_b: "Adrenaline", option_c: "Insulin", option_d: "Estrogen", correct_answer: "C", explanation: "Insulin lowers blood glucose by promoting cellular uptake.", year: 2025 },
    { question: "Xylem transports:", option_a: "sugars", option_b: "water and minerals", option_c: "hormones", option_d: "proteins", correct_answer: "B", explanation: "Xylem carries water and dissolved minerals upward in plants.", year: 2025 },
    { question: "The part of the brain that controls balance is:", option_a: "cerebrum", option_b: "cerebellum", option_c: "medulla", option_d: "hypothalamus", correct_answer: "B", explanation: "The cerebellum coordinates movement and balance.", year: 2025 },
    { question: "Which of these is a viral disease?", option_a: "Malaria", option_b: "Typhoid", option_c: "AIDS", option_d: "Cholera", correct_answer: "C", explanation: "AIDS is caused by HIV (Human Immunodeficiency Virus).", year: 2025 },
    { question: "The longest bone in the human body is:", option_a: "humerus", option_b: "femur", option_c: "tibia", option_d: "spine", correct_answer: "B", explanation: "The femur (thigh bone) is the longest and strongest bone.", year: 2025 },
    { question: "Nitrogen fixation is performed by:", option_a: "all plants", option_b: "all animals", option_c: "certain bacteria", option_d: "fungi only", correct_answer: "C", explanation: "Nitrogen-fixing bacteria like Rhizobium convert N₂ to usable forms.", year: 2025 },
    { question: "The tissue that connects muscles to bones is:", option_a: "ligament", option_b: "tendon", option_c: "cartilage", option_d: "adipose", correct_answer: "B", explanation: "Tendons connect muscles to bones; ligaments connect bones to bones.", year: 2025 },
    { question: "Crossing over occurs during:", option_a: "mitosis", option_b: "meiosis I", option_c: "meiosis II", option_d: "interphase", correct_answer: "B", explanation: "Crossing over of chromosomes occurs during prophase I of meiosis.", year: 2025 },
  ],
  literature: [
    { question: "The author of 'Things Fall Apart' is:", option_a: "Wole Soyinka", option_b: "Chinua Achebe", option_c: "Ngugi wa Thiong'o", option_d: "Chimamanda Adichie", correct_answer: "B", explanation: "Chinua Achebe wrote 'Things Fall Apart' in 1958.", year: 2025 },
    { question: "A sonnet has how many lines?", option_a: "10", option_b: "12", option_c: "14", option_d: "16", correct_answer: "C", explanation: "A sonnet is a 14-line poem with a specific rhyme scheme.", year: 2025 },
    { question: "The protagonist is:", option_a: "the villain", option_b: "the main character", option_c: "the narrator", option_d: "a minor character", correct_answer: "B", explanation: "The protagonist is the main character around whom the story centers.", year: 2025 },
    { question: "Irony involves:", option_a: "repetition", option_b: "opposite of expectation", option_c: "exaggeration", option_d: "comparison", correct_answer: "B", explanation: "Irony is when the outcome is opposite to what was expected.", year: 2025 },
    { question: "A stanza is:", option_a: "a line of poetry", option_b: "a group of lines", option_c: "a type of rhyme", option_d: "a figure of speech", correct_answer: "B", explanation: "A stanza is a grouped set of lines in a poem.", year: 2025 },
    { question: "The genre of 'Macbeth' is:", option_a: "comedy", option_b: "tragedy", option_c: "romance", option_d: "pastoral", correct_answer: "B", explanation: "Macbeth is a tragedy by William Shakespeare.", year: 2025 },
    { question: "An elegy is a poem that:", option_a: "celebrates victory", option_b: "mourns the dead", option_c: "tells a story", option_d: "praises nature", correct_answer: "B", explanation: "An elegy is a mournful poem, usually lamenting the dead.", year: 2025 },
    { question: "The setting of a story refers to:", option_a: "the plot", option_b: "time and place", option_c: "the characters", option_d: "the theme", correct_answer: "B", explanation: "Setting is the time, place, and circumstances of a story.", year: 2025 },
    { question: "A flashback is:", option_a: "a future event", option_b: "a past event inserted in the narrative", option_c: "the climax", option_d: "the resolution", correct_answer: "B", explanation: "A flashback presents events that occurred before the current timeline.", year: 2025 },
    { question: "The antagonist opposes:", option_a: "the setting", option_b: "the protagonist", option_c: "the author", option_d: "the narrator", correct_answer: "B", explanation: "The antagonist is the character who opposes the protagonist.", year: 2025 },
    { question: "An epic is:", option_a: "a short poem", option_b: "a long narrative poem", option_c: "a one-act play", option_d: "a love letter", correct_answer: "B", explanation: "An epic is a long narrative poem about heroic deeds.", year: 2025 },
    { question: "Foreshadowing is:", option_a: "looking back", option_b: "hinting at future events", option_c: "describing the setting", option_d: "introducing characters", correct_answer: "B", explanation: "Foreshadowing gives hints about what will happen later.", year: 2025 },
    { question: "The climax of a story is:", option_a: "the beginning", option_b: "the turning point", option_c: "the ending", option_d: "the introduction", correct_answer: "B", explanation: "The climax is the moment of greatest tension or turning point.", year: 2025 },
    { question: "A monologue is:", option_a: "a conversation", option_b: "a long speech by one person", option_c: "a short poem", option_d: "a stage direction", correct_answer: "B", explanation: "A monologue is an extended speech by a single character.", year: 2025 },
    { question: "Satire is used to:", option_a: "praise", option_b: "criticize through humor", option_c: "describe", option_d: "narrate", correct_answer: "B", explanation: "Satire uses humor and irony to criticize or expose flaws.", year: 2025 },
  ],
  government: [
    { question: "The principle of separation of powers was advocated by:", option_a: "John Locke", option_b: "Montesquieu", option_c: "Plato", option_d: "Aristotle", correct_answer: "B", explanation: "Montesquieu proposed separation of powers into legislative, executive, and judicial.", year: 2025 },
    { question: "The head of state in a parliamentary system is usually:", option_a: "President", option_b: "Prime Minister", option_c: "Monarch or President", option_d: "Speaker", correct_answer: "C", explanation: "The head of state can be a monarch or ceremonial president in parliamentary systems.", year: 2025 },
    { question: "Universal adult suffrage means:", option_a: "voting by the rich only", option_b: "all adults can vote", option_c: "voting by men only", option_d: "voting by the educated", correct_answer: "B", explanation: "Universal adult suffrage grants voting rights to all adult citizens.", year: 2025 },
    { question: "A constitution is:", option_a: "a political party", option_b: "the fundamental law of a state", option_c: "a type of government", option_d: "an election process", correct_answer: "B", explanation: "A constitution contains the basic laws and principles governing a state.", year: 2025 },
    { question: "The judiciary interprets:", option_a: "budgets", option_b: "laws", option_c: "elections", option_d: "policies", correct_answer: "B", explanation: "The judiciary interprets and applies laws in disputes.", year: 2025 },
    { question: "A federal system of government has:", option_a: "one level of government", option_b: "two or more levels", option_c: "no constitution", option_d: "a monarchy", correct_answer: "B", explanation: "Federal systems divide power between central and regional governments.", year: 2025 },
    { question: "The executive branch is responsible for:", option_a: "making laws", option_b: "implementing laws", option_c: "interpreting laws", option_d: "amending laws", correct_answer: "B", explanation: "The executive enforces and implements laws.", year: 2025 },
    { question: "A referendum is:", option_a: "an election", option_b: "a direct vote on a specific issue", option_c: "a party meeting", option_d: "a parliamentary debate", correct_answer: "B", explanation: "A referendum allows citizens to vote directly on a proposal.", year: 2025 },
    { question: "The term 'sovereignty' means:", option_a: "cooperation", option_b: "supreme power", option_c: "democracy", option_d: "representation", correct_answer: "B", explanation: "Sovereignty is the supreme authority of a state to govern itself.", year: 2025 },
    { question: "Bicameralism refers to:", option_a: "one legislative chamber", option_b: "two legislative chambers", option_c: "three branches of government", option_d: "a cabinet system", correct_answer: "B", explanation: "Bicameral legislatures have two chambers (e.g., Senate and House).", year: 2025 },
    { question: "A bill becomes a law when:", option_a: "it is proposed", option_b: "it is debated", option_c: "it receives executive assent", option_d: "it is amended", correct_answer: "C", explanation: "A bill becomes law after legislative passage and executive approval.", year: 2025 },
    { question: "Civil liberties are:", option_a: "economic rights", option_b: "fundamental freedoms", option_c: "military duties", option_d: "trade agreements", correct_answer: "B", explanation: "Civil liberties are fundamental rights like freedom of speech and religion.", year: 2025 },
    { question: "The doctrine of checks and balances:", option_a: "gives all power to one branch", option_b: "prevents abuse of power", option_c: "eliminates government", option_d: "creates a monarchy", correct_answer: "B", explanation: "Checks and balances ensure no branch becomes too powerful.", year: 2025 },
    { question: "A coalition government is formed when:", option_a: "one party wins majority", option_b: "no party wins majority", option_c: "elections are cancelled", option_d: "the military takes over", correct_answer: "B", explanation: "Coalition governments form when parties must combine to reach majority.", year: 2025 },
    { question: "Impeachment is:", option_a: "appointing officials", option_b: "removing officials for misconduct", option_c: "electing officials", option_d: "praising officials", correct_answer: "B", explanation: "Impeachment is the process of charging public officials with misconduct.", year: 2025 },
  ],
  economics: [
    { question: "Opportunity cost is:", option_a: "the total cost", option_b: "the next best alternative forgone", option_c: "fixed cost", option_d: "variable cost", correct_answer: "B", explanation: "Opportunity cost is what you give up when making a choice.", year: 2025 },
    { question: "Demand increases when:", option_a: "price increases", option_b: "income increases (for normal goods)", option_c: "supply increases", option_d: "taxes increase", correct_answer: "B", explanation: "For normal goods, higher income leads to higher demand.", year: 2025 },
    { question: "Inflation is:", option_a: "falling prices", option_b: "rising prices", option_c: "stable prices", option_d: "zero prices", correct_answer: "B", explanation: "Inflation is the general increase in price levels over time.", year: 2025 },
    { question: "GDP stands for:", option_a: "Gross Domestic Product", option_b: "General Development Plan", option_c: "Government Debt Policy", option_d: "Global Distribution Pattern", correct_answer: "A", explanation: "GDP measures the total value of goods and services produced.", year: 2025 },
    { question: "A monopoly has:", option_a: "many sellers", option_b: "one seller", option_c: "two sellers", option_d: "no sellers", correct_answer: "B", explanation: "A monopoly is a market with a single seller.", year: 2025 },
    { question: "The law of diminishing returns states that:", option_a: "returns always increase", option_b: "additional inputs eventually yield less output", option_c: "costs always decrease", option_d: "demand is always elastic", correct_answer: "B", explanation: "Beyond a point, adding more input results in smaller increases in output.", year: 2025 },
    { question: "Fiscal policy involves:", option_a: "interest rates", option_b: "government spending and taxation", option_c: "money supply", option_d: "exchange rates", correct_answer: "B", explanation: "Fiscal policy uses government spending and taxes to influence the economy.", year: 2025 },
    { question: "A progressive tax:", option_a: "is the same for everyone", option_b: "increases with income", option_c: "decreases with income", option_d: "is optional", correct_answer: "B", explanation: "Progressive taxes take a larger percentage from higher incomes.", year: 2025 },
    { question: "Unemployment rate measures:", option_a: "total population", option_b: "labor force without jobs", option_c: "GDP growth", option_d: "inflation", correct_answer: "B", explanation: "Unemployment rate is the percentage of labor force without jobs.", year: 2025 },
    { question: "A trade deficit occurs when:", option_a: "exports exceed imports", option_b: "imports exceed exports", option_c: "exports equal imports", option_d: "no trade occurs", correct_answer: "B", explanation: "Trade deficit means a country imports more than it exports.", year: 2025 },
    { question: "Price elasticity of demand measures:", option_a: "supply changes", option_b: "demand response to price changes", option_c: "income changes", option_d: "cost changes", correct_answer: "B", explanation: "It measures how quantity demanded responds to price changes.", year: 2025 },
    { question: "Public goods are:", option_a: "excludable and rival", option_b: "non-excludable and non-rival", option_c: "only for the rich", option_d: "always expensive", correct_answer: "B", explanation: "Public goods like street lights are available to all and one person's use doesn't reduce others'.", year: 2025 },
    { question: "The central bank controls:", option_a: "fiscal policy", option_b: "monetary policy", option_c: "trade policy", option_d: "foreign policy", correct_answer: "B", explanation: "Central banks manage money supply and interest rates.", year: 2025 },
    { question: "Perfect competition has:", option_a: "one seller", option_b: "many buyers and sellers", option_c: "differentiated products", option_d: "barriers to entry", correct_answer: "B", explanation: "Perfect competition features many buyers and sellers with identical products.", year: 2025 },
    { question: "Subsidy is:", option_a: "a tax", option_b: "government financial assistance", option_c: "a fine", option_d: "interest payment", correct_answer: "B", explanation: "Subsidies are government payments to support businesses or consumers.", year: 2025 },
  ],
  geography: [
    { question: "The largest ocean is:", option_a: "Atlantic", option_b: "Pacific", option_c: "Indian", option_d: "Arctic", correct_answer: "B", explanation: "The Pacific Ocean is the largest and deepest ocean.", year: 2025 },
    { question: "The equator passes through:", option_a: "North America", option_b: "Africa", option_c: "Europe", option_d: "Australia", correct_answer: "B", explanation: "The equator crosses several African countries including Kenya and Uganda.", year: 2025 },
    { question: "A delta is formed by:", option_a: "volcanic eruption", option_b: "river deposition", option_c: "earthquake", option_d: "wind erosion", correct_answer: "B", explanation: "Deltas form when rivers deposit sediment at their mouths.", year: 2025 },
    { question: "The instrument used to measure rainfall is:", option_a: "thermometer", option_b: "rain gauge", option_c: "barometer", option_d: "anemometer", correct_answer: "B", explanation: "A rain gauge measures the amount of precipitation.", year: 2025 },
    { question: "Latitude lines run:", option_a: "north to south", option_b: "east to west", option_c: "diagonally", option_d: "randomly", correct_answer: "B", explanation: "Latitude lines run parallel to the equator, east to west.", year: 2025 },
    { question: "The Sahara is located in:", option_a: "Asia", option_b: "Africa", option_c: "Australia", option_d: "South America", correct_answer: "B", explanation: "The Sahara Desert is in North Africa.", year: 2025 },
    { question: "A peninsula is:", option_a: "an island", option_b: "land surrounded by water on three sides", option_c: "a mountain", option_d: "a valley", correct_answer: "B", explanation: "A peninsula is land surrounded by water on three sides.", year: 2025 },
    { question: "The layer of the atmosphere closest to Earth is:", option_a: "stratosphere", option_b: "troposphere", option_c: "mesosphere", option_d: "thermosphere", correct_answer: "B", explanation: "The troposphere is the lowest atmospheric layer where weather occurs.", year: 2025 },
    { question: "Contour lines close together indicate:", option_a: "flat terrain", option_b: "steep slope", option_c: "water body", option_d: "forest", correct_answer: "B", explanation: "Closely spaced contour lines indicate a steep gradient.", year: 2025 },
    { question: "The longest river in Africa is:", option_a: "Congo", option_b: "Nile", option_c: "Niger", option_d: "Zambezi", correct_answer: "B", explanation: "The Nile is the longest river in Africa and one of the longest in the world.", year: 2025 },
    { question: "Earthquakes are measured using:", option_a: "barometer", option_b: "seismograph", option_c: "thermometer", option_d: "hygrometer", correct_answer: "B", explanation: "Seismographs detect and record earthquake waves.", year: 2025 },
    { question: "The primary cause of ocean tides is:", option_a: "wind", option_b: "moon's gravity", option_c: "earthquakes", option_d: "volcanoes", correct_answer: "B", explanation: "The moon's gravitational pull is the main cause of ocean tides.", year: 2025 },
    { question: "A plateau is:", option_a: "a low plain", option_b: "an elevated flat area", option_c: "a deep valley", option_d: "a coastal area", correct_answer: "B", explanation: "A plateau is a flat-topped elevated landform.", year: 2025 },
    { question: "The greenhouse effect is caused by:", option_a: "ozone depletion", option_b: "heat-trapping gases", option_c: "wind patterns", option_d: "ocean currents", correct_answer: "B", explanation: "Greenhouse gases like CO₂ trap heat in the atmosphere.", year: 2025 },
    { question: "Population density is:", option_a: "total population", option_b: "people per unit area", option_c: "birth rate", option_d: "death rate", correct_answer: "B", explanation: "Population density measures the number of people per unit area.", year: 2025 },
  ],
  crs: [
    { question: "The first book of the Bible is:", option_a: "Exodus", option_b: "Genesis", option_c: "Leviticus", option_d: "Numbers", correct_answer: "B", explanation: "Genesis is the first book, describing creation and early history.", year: 2025 },
    { question: "Jesus was baptized by:", option_a: "Peter", option_b: "John the Baptist", option_c: "Paul", option_d: "Moses", correct_answer: "B", explanation: "John the Baptist baptized Jesus in the Jordan River.", year: 2025 },
    { question: "The Ten Commandments were given to:", option_a: "Abraham", option_b: "Moses", option_c: "David", option_d: "Solomon", correct_answer: "B", explanation: "Moses received the Ten Commandments on Mount Sinai.", year: 2025 },
    { question: "The Sermon on the Mount is found in:", option_a: "Genesis", option_b: "Matthew", option_c: "Revelation", option_d: "Acts", correct_answer: "B", explanation: "The Sermon on the Mount is recorded in Matthew chapters 5-7.", year: 2025 },
    { question: "The apostle who denied Jesus three times was:", option_a: "Judas", option_b: "Peter", option_c: "John", option_d: "Thomas", correct_answer: "B", explanation: "Peter denied knowing Jesus three times before the rooster crowed.", year: 2025 },
    { question: "The parable of the Prodigal Son teaches about:", option_a: "judgment", option_b: "forgiveness", option_c: "wealth", option_d: "wisdom", correct_answer: "B", explanation: "This parable illustrates God's forgiveness and a father's love.", year: 2025 },
    { question: "Paul was originally called:", option_a: "Peter", option_b: "Saul", option_c: "Simon", option_d: "Barnabas", correct_answer: "B", explanation: "Saul became Paul after his conversion on the road to Damascus.", year: 2025 },
    { question: "The Last Supper was celebrated during:", option_a: "Pentecost", option_b: "Passover", option_c: "Hanukkah", option_d: "Sabbath", correct_answer: "B", explanation: "Jesus celebrated the Last Supper during the Passover festival.", year: 2025 },
    { question: "The fruit of the Spirit includes:", option_a: "anger", option_b: "love, joy, peace", option_c: "jealousy", option_d: "hatred", correct_answer: "B", explanation: "Galatians 5:22-23 lists love, joy, peace, and other virtues.", year: 2025 },
    { question: "Jesus raised Lazarus after:", option_a: "one day", option_b: "four days", option_c: "seven days", option_d: "ten days", correct_answer: "B", explanation: "Lazarus had been dead for four days when Jesus raised him.", year: 2025 },
    { question: "The Golden Rule teaches us to:", option_a: "seek wealth", option_b: "treat others as we want to be treated", option_c: "obey rulers", option_d: "fast regularly", correct_answer: "B", explanation: "Do unto others as you would have them do unto you.", year: 2025 },
    { question: "Jesus fed 5,000 with:", option_a: "seven loaves and fish", option_b: "five loaves and two fish", option_c: "bread and wine", option_d: "manna", correct_answer: "B", explanation: "Jesus multiplied five loaves and two fish to feed 5,000.", year: 2025 },
    { question: "The book of Psalms contains:", option_a: "laws", option_b: "songs and prayers", option_c: "prophecies", option_d: "genealogies", correct_answer: "B", explanation: "Psalms is a collection of 150 songs, prayers, and poems.", year: 2025 },
    { question: "Jesus was crucified at:", option_a: "Bethlehem", option_b: "Golgotha", option_c: "Nazareth", option_d: "Jericho", correct_answer: "B", explanation: "Golgotha (Calvary) was the place of Jesus' crucifixion.", year: 2025 },
    { question: "The Day of Pentecost marks:", option_a: "Jesus' birth", option_b: "the coming of the Holy Spirit", option_c: "Jesus' death", option_d: "Moses receiving the law", correct_answer: "B", explanation: "The Holy Spirit came upon the apostles on Pentecost.", year: 2025 },
  ],
  irs: [
    { question: "The first pillar of Islam is:", option_a: "Salat", option_b: "Shahadah", option_c: "Zakat", option_d: "Sawm", correct_answer: "B", explanation: "Shahadah (declaration of faith) is the first pillar.", year: 2025 },
    { question: "The holy book of Islam is:", option_a: "Torah", option_b: "Quran", option_c: "Bible", option_d: "Vedas", correct_answer: "B", explanation: "The Quran is the sacred scripture of Islam.", year: 2025 },
    { question: "Ramadan is the month of:", option_a: "pilgrimage", option_b: "fasting", option_c: "charity", option_d: "prayer", correct_answer: "B", explanation: "Muslims fast during Ramadan, the ninth month of the Islamic calendar.", year: 2025 },
    { question: "The migration from Mecca to Medina is called:", option_a: "Jihad", option_b: "Hijrah", option_c: "Hajj", option_d: "Umrah", correct_answer: "B", explanation: "The Hijrah marks the beginning of the Islamic calendar.", year: 2025 },
    { question: "Zakat is:", option_a: "fasting", option_b: "obligatory charity", option_c: "prayer", option_d: "pilgrimage", correct_answer: "B", explanation: "Zakat is the obligatory giving of a portion of wealth to those in need.", year: 2025 },
    { question: "The Prophet Muhammad was born in:", option_a: "Medina", option_b: "Mecca", option_c: "Jerusalem", option_d: "Damascus", correct_answer: "B", explanation: "Prophet Muhammad (PBUH) was born in Mecca around 570 CE.", year: 2025 },
    { question: "Muslims pray facing:", option_a: "Jerusalem", option_b: "Mecca", option_c: "Medina", option_d: "any direction", correct_answer: "B", explanation: "Muslims face the Kaaba in Mecca (Qibla) during prayer.", year: 2025 },
    { question: "The night of power (Laylatul Qadr) is in:", option_a: "Shawwal", option_b: "Ramadan", option_c: "Muharram", option_d: "Dhul Hijjah", correct_answer: "B", explanation: "Laylatul Qadr falls in the last ten nights of Ramadan.", year: 2025 },
    { question: "Hajj is performed in the month of:", option_a: "Ramadan", option_b: "Dhul Hijjah", option_c: "Muharram", option_d: "Rajab", correct_answer: "B", explanation: "Hajj pilgrimage takes place during Dhul Hijjah.", year: 2025 },
    { question: "The number of daily prayers in Islam is:", option_a: "three", option_b: "five", option_c: "seven", option_d: "ten", correct_answer: "B", explanation: "Muslims perform five obligatory prayers daily.", year: 2025 },
    { question: "Surah Al-Fatiha is:", option_a: "the last surah", option_b: "the opening surah", option_c: "the longest surah", option_d: "about charity", correct_answer: "B", explanation: "Al-Fatiha (The Opening) is the first chapter of the Quran.", year: 2025 },
    { question: "Tawhid means:", option_a: "prayer", option_b: "oneness of Allah", option_c: "fasting", option_d: "charity", correct_answer: "B", explanation: "Tawhid is the concept of the absolute oneness of God.", year: 2025 },
    { question: "The wife of the Prophet who was known for her scholarship was:", option_a: "Khadijah", option_b: "Aisha", option_c: "Fatimah", option_d: "Maryam", correct_answer: "B", explanation: "Aisha was renowned for her knowledge and teaching of hadith.", year: 2025 },
    { question: "Wudu is:", option_a: "prayer", option_b: "ritual purification", option_c: "fasting", option_d: "pilgrimage", correct_answer: "B", explanation: "Wudu is the ritual washing before prayers.", year: 2025 },
    { question: "The Battle of Badr took place in:", option_a: "610 CE", option_b: "624 CE", option_c: "630 CE", option_d: "632 CE", correct_answer: "B", explanation: "The Battle of Badr occurred in 624 CE.", year: 2025 },
  ],
  accounting: [
    { question: "The accounting equation is:", option_a: "Assets = Income - Expenses", option_b: "Assets = Liabilities + Equity", option_c: "Revenue = Costs + Profit", option_d: "Cash = Bank + Receivables", correct_answer: "B", explanation: "Assets = Liabilities + Owner's Equity is the fundamental equation.", year: 2025 },
    { question: "A debit entry increases:", option_a: "liabilities", option_b: "assets", option_c: "revenue", option_d: "equity", correct_answer: "B", explanation: "Debits increase assets and expenses.", year: 2025 },
    { question: "Depreciation is:", option_a: "an increase in asset value", option_b: "allocation of asset cost", option_c: "a type of revenue", option_d: "a liability", correct_answer: "B", explanation: "Depreciation allocates the cost of an asset over its useful life.", year: 2025 },
    { question: "The trial balance shows:", option_a: "profit or loss", option_b: "equality of debits and credits", option_c: "cash position", option_d: "inventory levels", correct_answer: "B", explanation: "A trial balance verifies that total debits equal total credits.", year: 2025 },
    { question: "Working capital is:", option_a: "fixed assets", option_b: "current assets minus current liabilities", option_c: "long-term debt", option_d: "retained earnings", correct_answer: "B", explanation: "Working capital = Current Assets - Current Liabilities.", year: 2025 },
    { question: "FIFO stands for:", option_a: "First Input, First Output", option_b: "First In, First Out", option_c: "Final Invoice, First Order", option_d: "First Invoice, Final Order", correct_answer: "B", explanation: "FIFO is an inventory valuation method where oldest items are sold first.", year: 2025 },
    { question: "A balance sheet shows:", option_a: "income and expenses", option_b: "assets, liabilities, and equity", option_c: "cash flows", option_d: "budgets", correct_answer: "B", explanation: "The balance sheet shows financial position at a point in time.", year: 2025 },
    { question: "Accounts receivable represents:", option_a: "money owed to suppliers", option_b: "money owed by customers", option_c: "bank balance", option_d: "inventory value", correct_answer: "B", explanation: "Accounts receivable is money customers owe the business.", year: 2025 },
    { question: "A journal entry records:", option_a: "bank statements", option_b: "business transactions", option_c: "tax returns", option_d: "employee salaries only", correct_answer: "B", explanation: "Journal entries record individual business transactions.", year: 2025 },
    { question: "Gross profit is:", option_a: "revenue minus all expenses", option_b: "revenue minus cost of goods sold", option_c: "net income", option_d: "operating expenses", correct_answer: "B", explanation: "Gross Profit = Revenue - Cost of Goods Sold.", year: 2025 },
    { question: "An audit is:", option_a: "tax filing", option_b: "independent examination of financial records", option_c: "budget planning", option_d: "payroll processing", correct_answer: "B", explanation: "An audit independently verifies the accuracy of financial statements.", year: 2025 },
    { question: "Accrual accounting records revenue when:", option_a: "cash is received", option_b: "it is earned", option_c: "invoices are sent", option_d: "goods are ordered", correct_answer: "B", explanation: "Accrual accounting recognizes revenue when earned, not when cash is received.", year: 2025 },
    { question: "A credit entry increases:", option_a: "assets", option_b: "liabilities", option_c: "expenses", option_d: "drawings", correct_answer: "B", explanation: "Credits increase liabilities, equity, and revenue.", year: 2025 },
    { question: "The income statement shows:", option_a: "financial position", option_b: "profitability over a period", option_c: "cash position", option_d: "asset values", correct_answer: "B", explanation: "The income statement shows revenues, expenses, and profit/loss.", year: 2025 },
    { question: "Bad debts are:", option_a: "loans from banks", option_b: "uncollectible receivables", option_c: "long-term liabilities", option_d: "prepaid expenses", correct_answer: "B", explanation: "Bad debts are amounts owed by customers that cannot be collected.", year: 2025 },
  ],
  commerce: [
    { question: "E-commerce is:", option_a: "traditional trading", option_b: "electronic buying and selling", option_c: "export business", option_d: "wholesale trading", correct_answer: "B", explanation: "E-commerce involves commercial transactions over the internet.", year: 2025 },
    { question: "A wholesaler buys from:", option_a: "retailers", option_b: "manufacturers", option_c: "consumers", option_d: "agents only", correct_answer: "B", explanation: "Wholesalers purchase in bulk from manufacturers.", year: 2025 },
    { question: "Insurance transfers:", option_a: "property", option_b: "risk", option_c: "money", option_d: "goods", correct_answer: "B", explanation: "Insurance transfers financial risk from the insured to the insurer.", year: 2025 },
    { question: "A warehouse provides:", option_a: "manufacturing", option_b: "storage", option_c: "transportation", option_d: "advertising", correct_answer: "B", explanation: "Warehouses store goods until they are needed.", year: 2025 },
    { question: "Advertising creates:", option_a: "goods", option_b: "awareness", option_c: "factories", option_d: "laws", correct_answer: "B", explanation: "Advertising informs and persuades potential customers.", year: 2025 },
    { question: "A bill of lading is used in:", option_a: "banking", option_b: "shipping", option_c: "insurance", option_d: "manufacturing", correct_answer: "B", explanation: "A bill of lading is a shipping document acknowledging receipt of goods.", year: 2025 },
    { question: "Barter trade involves:", option_a: "using money", option_b: "exchange of goods for goods", option_c: "credit transactions", option_d: "digital payments", correct_answer: "B", explanation: "Barter is the direct exchange of goods without money.", year: 2025 },
    { question: "A trademark protects:", option_a: "inventions", option_b: "brand identity", option_c: "buildings", option_d: "employees", correct_answer: "B", explanation: "Trademarks protect brand names, logos, and symbols.", year: 2025 },
    { question: "A cheque is:", option_a: "a promissory note", option_b: "an order to pay", option_c: "a receipt", option_d: "a warranty", correct_answer: "B", explanation: "A cheque is a written order to a bank to pay a specified sum.", year: 2025 },
    { question: "The stock exchange is for:", option_a: "storing goods", option_b: "trading securities", option_c: "manufacturing", option_d: "insurance", correct_answer: "B", explanation: "Stock exchanges facilitate buying and selling of shares.", year: 2025 },
    { question: "A franchise is:", option_a: "government agency", option_b: "licensed business arrangement", option_c: "type of tax", option_d: "import permit", correct_answer: "B", explanation: "A franchise allows use of another company's business model and brand.", year: 2025 },
    { question: "An invoice is:", option_a: "a receipt", option_b: "a request for payment", option_c: "a bank document", option_d: "a shipping document", correct_answer: "B", explanation: "An invoice details goods/services sold and amount owed.", year: 2025 },
    { question: "Consumer protection ensures:", option_a: "profit maximization", option_b: "fair treatment of buyers", option_c: "import restrictions", option_d: "tax collection", correct_answer: "B", explanation: "Consumer protection laws safeguard buyers from unfair practices.", year: 2025 },
    { question: "A cooperative is owned by:", option_a: "government", option_b: "members", option_c: "shareholders", option_d: "directors", correct_answer: "B", explanation: "Cooperatives are owned and controlled by their members.", year: 2025 },
    { question: "Hire purchase allows:", option_a: "full cash payment", option_b: "payment in installments", option_c: "free goods", option_d: "permanent rental", correct_answer: "B", explanation: "Hire purchase allows buying goods through regular payments.", year: 2025 },
  ],
  agricultural_science: [
    { question: "Photosynthesis occurs in:", option_a: "roots", option_b: "leaves", option_c: "stems", option_d: "flowers", correct_answer: "B", explanation: "Leaves contain chloroplasts where photosynthesis takes place.", year: 2025 },
    { question: "NPK fertilizer provides:", option_a: "only nitrogen", option_b: "nitrogen, phosphorus, potassium", option_c: "only organic matter", option_d: "water", correct_answer: "B", explanation: "NPK stands for Nitrogen, Phosphorus, and Potassium.", year: 2025 },
    { question: "Crop rotation helps:", option_a: "increase pests", option_b: "maintain soil fertility", option_c: "reduce yield", option_d: "waste water", correct_answer: "B", explanation: "Rotation prevents nutrient depletion and breaks pest cycles.", year: 2025 },
    { question: "Legumes fix:", option_a: "carbon", option_b: "nitrogen", option_c: "phosphorus", option_d: "potassium", correct_answer: "B", explanation: "Legumes have root nodules with bacteria that fix atmospheric nitrogen.", year: 2025 },
    { question: "Erosion is primarily caused by:", option_a: "planting", option_b: "water and wind", option_c: "fertilizers", option_d: "harvesting", correct_answer: "B", explanation: "Water and wind are the main agents of soil erosion.", year: 2025 },
    { question: "Poultry refers to:", option_a: "cattle", option_b: "domesticated birds", option_c: "pigs", option_d: "fish", correct_answer: "B", explanation: "Poultry includes chickens, turkeys, ducks, and other domesticated birds.", year: 2025 },
    { question: "Weeding removes:", option_a: "pests", option_b: "unwanted plants", option_c: "diseases", option_d: "fertilizers", correct_answer: "B", explanation: "Weeding eliminates plants that compete with crops.", year: 2025 },
    { question: "Irrigation provides:", option_a: "nutrients", option_b: "water", option_c: "sunlight", option_d: "carbon dioxide", correct_answer: "B", explanation: "Irrigation supplies water to crops artificially.", year: 2025 },
    { question: "Humus improves:", option_a: "air quality", option_b: "soil structure", option_c: "water temperature", option_d: "sunlight intensity", correct_answer: "B", explanation: "Humus (decomposed organic matter) improves soil structure and fertility.", year: 2025 },
    { question: "A hybrid is produced by:", option_a: "cloning", option_b: "cross-breeding", option_c: "grafting", option_d: "layering", correct_answer: "B", explanation: "Hybrids result from crossing two different varieties.", year: 2025 },
    { question: "Mulching conserves:", option_a: "air", option_b: "soil moisture", option_c: "sunlight", option_d: "nutrients only", correct_answer: "B", explanation: "Mulch covers soil to reduce evaporation and weed growth.", year: 2025 },
    { question: "Ruminants have:", option_a: "one stomach", option_b: "four stomach compartments", option_c: "no stomach", option_d: "two stomachs", correct_answer: "B", explanation: "Ruminants like cattle have four stomach compartments for digesting grass.", year: 2025 },
    { question: "Tillage prepares:", option_a: "seeds", option_b: "soil", option_c: "fertilizers", option_d: "tools", correct_answer: "B", explanation: "Tillage is the preparation of soil for planting.", year: 2025 },
    { question: "Aquaculture is the farming of:", option_a: "poultry", option_b: "fish", option_c: "cattle", option_d: "crops", correct_answer: "B", explanation: "Aquaculture involves raising fish and other aquatic organisms.", year: 2025 },
    { question: "Composting converts waste into:", option_a: "plastic", option_b: "fertilizer", option_c: "fuel", option_d: "pesticide", correct_answer: "B", explanation: "Composting breaks down organic waste into nutrient-rich fertilizer.", year: 2025 },
  ],
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

    for (const [subject, questions] of Object.entries(EXTRA_QUESTIONS)) {
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
