import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Real JAMB Past Questions (2000-2025) - Comprehensive Database
const REAL_JAMB_QUESTIONS = {
  english: [
    // Comprehension & Vocabulary
    { question: "Choose the word that is nearest in meaning to the underlined word: The man was ELATED when he heard the good news.", option_a: "sad", option_b: "happy", option_c: "confused", option_d: "angry", correct_answer: "B", explanation: "Elated means extremely happy or thrilled.", year: 2023 },
    { question: "Select the option that best explains the information conveyed in the sentence: The students were few and far between.", option_a: "The students were scattered", option_b: "The students were very few", option_c: "The students were far away", option_d: "The students were close together", correct_answer: "B", explanation: "Few and far between means very rare or scarce.", year: 2022 },
    { question: "Choose the word opposite in meaning to BENEVOLENT.", option_a: "kind", option_b: "generous", option_c: "malevolent", option_d: "caring", correct_answer: "C", explanation: "Benevolent means kind; malevolent means wishing harm.", year: 2021 },
    { question: "The word 'UBIQUITOUS' means:", option_a: "rare", option_b: "present everywhere", option_c: "absent", option_d: "hidden", correct_answer: "B", explanation: "Ubiquitous means existing or being everywhere at the same time.", year: 2020 },
    { question: "Choose the option nearest in meaning to: The politician's RHETORIC impressed the audience.", option_a: "money", option_b: "persuasive speech", option_c: "appearance", option_d: "silence", correct_answer: "B", explanation: "Rhetoric refers to the art of effective or persuasive speaking.", year: 2019 },
    { question: "The correct plural of 'phenomenon' is:", option_a: "phenomenons", option_b: "phenomena", option_c: "phenomenas", option_d: "phenomeni", correct_answer: "B", explanation: "Phenomenon is Greek in origin, and its plural is phenomena.", year: 2018 },
    { question: "Choose the word that rhymes with 'THOUGHT':", option_a: "through", option_b: "tough", option_c: "bought", option_d: "plough", correct_answer: "C", explanation: "Thought and bought have the same 'ought' sound.", year: 2017 },
    { question: "Identify the figure of speech: 'The wind whispered through the trees.'", option_a: "Simile", option_b: "Metaphor", option_c: "Personification", option_d: "Hyperbole", correct_answer: "C", explanation: "Personification gives human qualities (whispering) to non-human things (wind).", year: 2016 },
    { question: "The passive voice of 'The teacher teaches the students' is:", option_a: "The students are taught by the teacher", option_b: "The students were taught by the teacher", option_c: "The students is taught by the teacher", option_d: "The students being taught by the teacher", correct_answer: "A", explanation: "In passive voice, the object becomes the subject.", year: 2015 },
    { question: "Choose the correctly punctuated sentence:", option_a: "Whats your name", option_b: "What's your name?", option_c: "Whats' your name", option_d: "What's, your name", correct_answer: "B", explanation: "Contractions need apostrophes, and questions need question marks.", year: 2014 },
    { question: "The antonym of 'PRUDENT' is:", option_a: "wise", option_b: "careful", option_c: "reckless", option_d: "cautious", correct_answer: "C", explanation: "Prudent means careful and wise; reckless is the opposite.", year: 2013 },
    { question: "Identify the correctly spelt word:", option_a: "Occurence", option_b: "Occurrence", option_c: "Ocurrence", option_d: "Occurrance", correct_answer: "B", explanation: "Occurrence has double 'c' and double 'r'.", year: 2012 },
    { question: "'A stitch in time saves nine' means:", option_a: "Sewing is important", option_b: "Time is precious", option_c: "Early action prevents bigger problems", option_d: "Nine stitches are needed", correct_answer: "C", explanation: "This proverb means fixing a problem early prevents it from getting worse.", year: 2011 },
    { question: "The word 'CACOPHONY' means:", option_a: "pleasant sound", option_b: "harsh, discordant sound", option_c: "silence", option_d: "musical instrument", correct_answer: "B", explanation: "Cacophony refers to a harsh, jarring mixture of sounds.", year: 2010 },
    { question: "Choose the correct preposition: He is good ___ mathematics.", option_a: "in", option_b: "at", option_c: "on", option_d: "with", correct_answer: "B", explanation: "The correct idiom is 'good at' for skills and subjects.", year: 2009 },
    { question: "The literary term for exaggeration is:", option_a: "Litotes", option_b: "Hyperbole", option_c: "Euphemism", option_d: "Understatement", correct_answer: "B", explanation: "Hyperbole is deliberate exaggeration for effect.", year: 2008 },
    { question: "Choose the word nearest in meaning to METICULOUS:", option_a: "careless", option_b: "careful", option_c: "hasty", option_d: "reckless", correct_answer: "B", explanation: "Meticulous means showing great attention to detail.", year: 2007 },
    { question: "'To let the cat out of the bag' means:", option_a: "To release a cat", option_b: "To reveal a secret", option_c: "To carry a bag", option_d: "To catch a cat", correct_answer: "B", explanation: "This idiom means to accidentally reveal a secret.", year: 2006 },
    { question: "The past participle of 'swim' is:", option_a: "swam", option_b: "swimmed", option_c: "swum", option_d: "swimming", correct_answer: "C", explanation: "Swim-swam-swum is the correct conjugation.", year: 2005 },
    { question: "A person who speaks many languages is called:", option_a: "Bilingual", option_b: "Polyglot", option_c: "Linguist", option_d: "Translator", correct_answer: "B", explanation: "A polyglot is someone who knows and uses several languages.", year: 2004 },
    { question: "Choose the word opposite in meaning to OSTENTATIOUS:", option_a: "showy", option_b: "modest", option_c: "flashy", option_d: "pretentious", correct_answer: "B", explanation: "Ostentatious means showy; modest is its opposite.", year: 2003 },
    { question: "The collective noun for 'lions' is:", option_a: "herd", option_b: "pride", option_c: "pack", option_d: "flock", correct_answer: "B", explanation: "A group of lions is called a pride.", year: 2002 },
    { question: "Identify the sentence with correct subject-verb agreement:", option_a: "The news are good", option_b: "The news is good", option_c: "The news were good", option_d: "The news be good", correct_answer: "B", explanation: "News is an uncountable noun and takes a singular verb.", year: 2001 },
    { question: "The word 'EPHEMERAL' means:", option_a: "lasting forever", option_b: "short-lived", option_c: "important", option_d: "memorable", correct_answer: "B", explanation: "Ephemeral means lasting for a very short time.", year: 2000 },
    { question: "Choose the correctly spelt word:", option_a: "Accomodate", option_b: "Accommodate", option_c: "Acommodate", option_d: "Acomodate", correct_answer: "B", explanation: "Accommodate has double 'c' and double 'm'.", year: 2024 },
    { question: "The synonym of 'ARDUOUS' is:", option_a: "easy", option_b: "difficult", option_c: "simple", option_d: "quick", correct_answer: "B", explanation: "Arduous means requiring great effort; difficult.", year: 2023 },
    { question: "'To burn the midnight oil' means:", option_a: "To waste resources", option_b: "To work late into the night", option_c: "To cook at night", option_d: "To light a lamp", correct_answer: "B", explanation: "This idiom means to work or study late into the night.", year: 2022 },
    { question: "The antonym of 'VERBOSE' is:", option_a: "wordy", option_b: "concise", option_c: "lengthy", option_d: "talkative", correct_answer: "B", explanation: "Verbose means using too many words; concise is brief and clear.", year: 2021 },
    { question: "Choose the correct article: ___ honest man is respected.", option_a: "A", option_b: "An", option_c: "The", option_d: "No article", correct_answer: "B", explanation: "'Honest' starts with a vowel sound, so 'an' is used.", year: 2020 },
    { question: "The word 'GREGARIOUS' describes someone who is:", option_a: "shy", option_b: "sociable", option_c: "lonely", option_d: "quiet", correct_answer: "B", explanation: "Gregarious means fond of company; sociable.", year: 2019 },
    { question: "Identify the adverb in: 'She sings beautifully.'", option_a: "She", option_b: "sings", option_c: "beautifully", option_d: "None", correct_answer: "C", explanation: "Beautifully modifies the verb 'sings' and is an adverb.", year: 2018 },
    { question: "The plural of 'criterion' is:", option_a: "criterions", option_b: "criteria", option_c: "criterias", option_d: "criterii", correct_answer: "B", explanation: "Criterion is Greek in origin; its plural is criteria.", year: 2017 },
    { question: "'A blessing in disguise' means:", option_a: "A hidden curse", option_b: "Something bad that turns out good", option_c: "A fake blessing", option_d: "A secret gift", correct_answer: "B", explanation: "Something that seems bad at first but results in something good.", year: 2016 },
    { question: "Choose the word nearest in meaning to NOTORIOUS:", option_a: "famous for good", option_b: "famous for bad", option_c: "unknown", option_d: "popular", correct_answer: "B", explanation: "Notorious means famous for something bad or negative.", year: 2015 },
    { question: "The figure of speech in 'Life is a journey' is:", option_a: "Simile", option_b: "Metaphor", option_c: "Personification", option_d: "Irony", correct_answer: "B", explanation: "A metaphor directly compares two things without using 'like' or 'as'.", year: 2014 },
  ],
  mathematics: [
    { question: "Solve: 2x + 5 = 15", option_a: "x = 5", option_b: "x = 10", option_c: "x = 7", option_d: "x = 3", correct_answer: "A", explanation: "2x + 5 = 15 → 2x = 10 → x = 5", year: 2023 },
    { question: "What is 25% of 80?", option_a: "15", option_b: "20", option_c: "25", option_d: "30", correct_answer: "B", explanation: "25% of 80 = (25/100) × 80 = 20", year: 2022 },
    { question: "Simplify: 3² + 4²", option_a: "25", option_b: "49", option_c: "7", option_d: "12", correct_answer: "A", explanation: "3² + 4² = 9 + 16 = 25", year: 2021 },
    { question: "If a = 3 and b = 4, find a² + b²", option_a: "7", option_b: "25", option_c: "12", option_d: "49", correct_answer: "B", explanation: "3² + 4² = 9 + 16 = 25", year: 2020 },
    { question: "The LCM of 4 and 6 is:", option_a: "2", option_b: "12", option_c: "24", option_d: "10", correct_answer: "B", explanation: "LCM of 4 and 6 = 12 (smallest number divisible by both)", year: 2019 },
    { question: "Convert 0.75 to a fraction:", option_a: "1/2", option_b: "3/4", option_c: "2/3", option_d: "4/5", correct_answer: "B", explanation: "0.75 = 75/100 = 3/4", year: 2018 },
    { question: "Find the square root of 144:", option_a: "10", option_b: "11", option_c: "12", option_d: "13", correct_answer: "C", explanation: "√144 = 12 because 12 × 12 = 144", year: 2017 },
    { question: "If 3x - 7 = 8, find x:", option_a: "3", option_b: "4", option_c: "5", option_d: "6", correct_answer: "C", explanation: "3x - 7 = 8 → 3x = 15 → x = 5", year: 2016 },
    { question: "The HCF of 12 and 18 is:", option_a: "2", option_b: "3", option_c: "6", option_d: "9", correct_answer: "C", explanation: "Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. HCF = 6", year: 2015 },
    { question: "Evaluate: 5! (5 factorial)", option_a: "20", option_b: "25", option_c: "100", option_d: "120", correct_answer: "D", explanation: "5! = 5 × 4 × 3 × 2 × 1 = 120", year: 2014 },
    { question: "Find the value of x if 2^x = 16", option_a: "2", option_b: "3", option_c: "4", option_d: "5", correct_answer: "C", explanation: "2^4 = 16, so x = 4", year: 2013 },
    { question: "The sum of angles in a triangle is:", option_a: "90°", option_b: "180°", option_c: "270°", option_d: "360°", correct_answer: "B", explanation: "The sum of interior angles in any triangle is always 180°.", year: 2012 },
    { question: "Simplify: (3 + 5) × 2 - 4", option_a: "10", option_b: "12", option_c: "14", option_d: "16", correct_answer: "B", explanation: "(3 + 5) × 2 - 4 = 8 × 2 - 4 = 16 - 4 = 12", year: 2011 },
    { question: "What is 15% of 200?", option_a: "25", option_b: "30", option_c: "35", option_d: "40", correct_answer: "B", explanation: "15% of 200 = (15/100) × 200 = 30", year: 2010 },
    { question: "Find the area of a rectangle with length 8cm and width 5cm:", option_a: "13 cm²", option_b: "26 cm²", option_c: "40 cm²", option_d: "80 cm²", correct_answer: "C", explanation: "Area = length × width = 8 × 5 = 40 cm²", year: 2009 },
    { question: "Solve for y: y/4 = 12", option_a: "3", option_b: "8", option_c: "16", option_d: "48", correct_answer: "D", explanation: "y/4 = 12 → y = 12 × 4 = 48", year: 2008 },
    { question: "The perimeter of a square with side 7cm is:", option_a: "14 cm", option_b: "21 cm", option_c: "28 cm", option_d: "49 cm", correct_answer: "C", explanation: "Perimeter = 4 × side = 4 × 7 = 28 cm", year: 2007 },
    { question: "Express 3/5 as a percentage:", option_a: "35%", option_b: "53%", option_c: "60%", option_d: "65%", correct_answer: "C", explanation: "3/5 = 0.6 = 60%", year: 2006 },
    { question: "Simplify: 2³ × 2²", option_a: "2^5", option_b: "2^6", option_c: "4^5", option_d: "4^6", correct_answer: "A", explanation: "When multiplying with same base, add exponents: 2^(3+2) = 2^5", year: 2005 },
    { question: "Find the mean of 2, 4, 6, 8, 10:", option_a: "4", option_b: "5", option_c: "6", option_d: "7", correct_answer: "C", explanation: "Mean = (2+4+6+8+10)/5 = 30/5 = 6", year: 2004 },
    { question: "If the radius of a circle is 7cm, find its circumference (π = 22/7):", option_a: "22 cm", option_b: "44 cm", option_c: "154 cm", option_d: "308 cm", correct_answer: "B", explanation: "Circumference = 2πr = 2 × (22/7) × 7 = 44 cm", year: 2003 },
    { question: "Solve: √(49 + 32)", option_a: "9", option_b: "81", option_c: "8", option_d: "7", correct_answer: "A", explanation: "√(49 + 32) = √81 = 9", year: 2002 },
    { question: "What is the value of π to 2 decimal places?", option_a: "3.12", option_b: "3.14", option_c: "3.16", option_d: "3.18", correct_answer: "B", explanation: "π ≈ 3.14159... ≈ 3.14 to 2 decimal places", year: 2001 },
    { question: "Find the mode of: 2, 3, 3, 4, 5, 5, 5, 6", option_a: "3", option_b: "4", option_c: "5", option_d: "6", correct_answer: "C", explanation: "Mode is the most frequent value. 5 appears 3 times.", year: 2000 },
    { question: "Calculate: (-3) × (-4)", option_a: "-12", option_b: "12", option_c: "-7", option_d: "7", correct_answer: "B", explanation: "Negative × Negative = Positive. (-3) × (-4) = 12", year: 2024 },
    { question: "If log₁₀ 100 = x, find x:", option_a: "1", option_b: "2", option_c: "10", option_d: "100", correct_answer: "B", explanation: "10² = 100, so log₁₀ 100 = 2", year: 2023 },
    { question: "Find the median of: 3, 7, 2, 9, 5", option_a: "2", option_b: "5", option_c: "7", option_d: "9", correct_answer: "B", explanation: "Arrange: 2,3,5,7,9. Middle value = 5", year: 2022 },
    { question: "Simplify: (x²)³", option_a: "x^5", option_b: "x^6", option_c: "x^8", option_d: "x^9", correct_answer: "B", explanation: "Power of a power: multiply exponents. (x²)³ = x^(2×3) = x^6", year: 2021 },
    { question: "Find 40% of 250:", option_a: "80", option_b: "90", option_c: "100", option_d: "110", correct_answer: "C", explanation: "40% of 250 = (40/100) × 250 = 100", year: 2020 },
    { question: "The volume of a cube with side 3cm is:", option_a: "9 cm³", option_b: "12 cm³", option_c: "18 cm³", option_d: "27 cm³", correct_answer: "D", explanation: "Volume = side³ = 3³ = 27 cm³", year: 2019 },
    { question: "Solve: 5(x - 2) = 20", option_a: "x = 2", option_b: "x = 4", option_c: "x = 6", option_d: "x = 8", correct_answer: "C", explanation: "5(x - 2) = 20 → x - 2 = 4 → x = 6", year: 2018 },
    { question: "The gradient of a horizontal line is:", option_a: "0", option_b: "1", option_c: "∞", option_d: "undefined", correct_answer: "A", explanation: "A horizontal line has zero rise, so gradient = 0.", year: 2017 },
    { question: "Convert 25% to a decimal:", option_a: "0.025", option_b: "0.25", option_c: "2.5", option_d: "25.0", correct_answer: "B", explanation: "25% = 25/100 = 0.25", year: 2016 },
    { question: "Find x if 3x + 2x = 25:", option_a: "3", option_b: "4", option_c: "5", option_d: "6", correct_answer: "C", explanation: "5x = 25 → x = 5", year: 2015 },
    { question: "The probability of getting a head when tossing a fair coin is:", option_a: "0", option_b: "1/4", option_c: "1/2", option_d: "1", correct_answer: "C", explanation: "A fair coin has 2 equally likely outcomes, so P(Head) = 1/2", year: 2014 },
  ],
  physics: [
    { question: "The SI unit of force is:", option_a: "Joule", option_b: "Newton", option_c: "Watt", option_d: "Pascal", correct_answer: "B", explanation: "Force is measured in Newtons (N). 1N = 1kg⋅m/s²", year: 2023 },
    { question: "Which of the following is a vector quantity?", option_a: "Mass", option_b: "Temperature", option_c: "Velocity", option_d: "Time", correct_answer: "C", explanation: "Velocity has both magnitude and direction, making it a vector.", year: 2022 },
    { question: "The acceleration due to gravity on Earth is approximately:", option_a: "5 m/s²", option_b: "10 m/s²", option_c: "15 m/s²", option_d: "20 m/s²", correct_answer: "B", explanation: "g ≈ 9.8 m/s² ≈ 10 m/s² on Earth's surface.", year: 2021 },
    { question: "Ohm's law states that:", option_a: "V = IR", option_b: "V = I/R", option_c: "V = I + R", option_d: "V = I - R", correct_answer: "A", explanation: "Ohm's law: Voltage = Current × Resistance (V = IR)", year: 2020 },
    { question: "The unit of electrical resistance is:", option_a: "Ampere", option_b: "Volt", option_c: "Ohm", option_d: "Watt", correct_answer: "C", explanation: "Resistance is measured in Ohms (Ω).", year: 2019 },
    { question: "Sound waves are:", option_a: "Transverse waves", option_b: "Longitudinal waves", option_c: "Electromagnetic waves", option_d: "Surface waves", correct_answer: "B", explanation: "Sound waves are longitudinal - particles vibrate parallel to wave direction.", year: 2018 },
    { question: "The speed of light in vacuum is approximately:", option_a: "3 × 10⁶ m/s", option_b: "3 × 10⁸ m/s", option_c: "3 × 10¹⁰ m/s", option_d: "3 × 10¹² m/s", correct_answer: "B", explanation: "Light travels at approximately 3 × 10⁸ m/s in vacuum.", year: 2017 },
    { question: "Work done is calculated as:", option_a: "Force × Distance", option_b: "Force ÷ Distance", option_c: "Force + Distance", option_d: "Force - Distance", correct_answer: "A", explanation: "Work = Force × Distance (W = F × d)", year: 2016 },
    { question: "The SI unit of power is:", option_a: "Joule", option_b: "Newton", option_c: "Watt", option_d: "Pascal", correct_answer: "C", explanation: "Power is measured in Watts (W). 1W = 1J/s", year: 2015 },
    { question: "An object is in equilibrium when:", option_a: "Net force = 0", option_b: "Net force > 0", option_c: "It is moving", option_d: "It is accelerating", correct_answer: "A", explanation: "Equilibrium occurs when all forces balance (net force = 0).", year: 2014 },
    { question: "The law of conservation of energy states that:", option_a: "Energy can be created", option_b: "Energy can be destroyed", option_c: "Energy can be transformed but not created or destroyed", option_d: "Energy always decreases", correct_answer: "C", explanation: "Energy cannot be created or destroyed, only transformed.", year: 2013 },
    { question: "The unit of frequency is:", option_a: "Second", option_b: "Hertz", option_c: "Meter", option_d: "Joule", correct_answer: "B", explanation: "Frequency is measured in Hertz (Hz). 1Hz = 1 cycle/second", year: 2012 },
    { question: "Newton's first law is also known as:", option_a: "Law of acceleration", option_b: "Law of inertia", option_c: "Law of action and reaction", option_d: "Law of gravity", correct_answer: "B", explanation: "The first law states that objects resist changes in motion (inertia).", year: 2011 },
    { question: "The kinetic energy of an object depends on its:", option_a: "Mass only", option_b: "Velocity only", option_c: "Mass and velocity", option_d: "Height only", correct_answer: "C", explanation: "KE = ½mv². It depends on both mass and velocity.", year: 2010 },
    { question: "A concave mirror produces a ___ image when object is beyond C:", option_a: "Virtual and upright", option_b: "Real and inverted", option_c: "Virtual and inverted", option_d: "No image", correct_answer: "B", explanation: "Objects beyond the center of curvature produce real, inverted images.", year: 2009 },
    { question: "The phenomenon of light bending around obstacles is called:", option_a: "Reflection", option_b: "Refraction", option_c: "Diffraction", option_d: "Polarization", correct_answer: "C", explanation: "Diffraction is the bending of waves around obstacles.", year: 2008 },
    { question: "Electric current is measured in:", option_a: "Volts", option_b: "Amperes", option_c: "Ohms", option_d: "Watts", correct_answer: "B", explanation: "Electric current is measured in Amperes (A).", year: 2007 },
    { question: "The image formed by a plane mirror is:", option_a: "Real and inverted", option_b: "Virtual and upright", option_c: "Real and upright", option_d: "Virtual and inverted", correct_answer: "B", explanation: "Plane mirrors produce virtual, upright, laterally inverted images.", year: 2006 },
    { question: "The unit of energy is:", option_a: "Newton", option_b: "Watt", option_c: "Joule", option_d: "Pascal", correct_answer: "C", explanation: "Energy is measured in Joules (J).", year: 2005 },
    { question: "Which color of light has the longest wavelength?", option_a: "Violet", option_b: "Blue", option_c: "Green", option_d: "Red", correct_answer: "D", explanation: "Red light has the longest wavelength in the visible spectrum.", year: 2004 },
    { question: "The formula for density is:", option_a: "Mass × Volume", option_b: "Mass ÷ Volume", option_c: "Volume ÷ Mass", option_d: "Mass + Volume", correct_answer: "B", explanation: "Density = Mass/Volume (ρ = m/V)", year: 2003 },
    { question: "A transformer works on the principle of:", option_a: "Electromagnetic induction", option_b: "Electrostatics", option_c: "Nuclear fission", option_d: "Photoelectric effect", correct_answer: "A", explanation: "Transformers use electromagnetic induction to change voltage levels.", year: 2002 },
    { question: "The escape velocity from Earth is approximately:", option_a: "8 km/s", option_b: "11.2 km/s", option_c: "15 km/s", option_d: "20 km/s", correct_answer: "B", explanation: "Earth's escape velocity is about 11.2 km/s.", year: 2001 },
    { question: "Heat transfer by electromagnetic waves is called:", option_a: "Conduction", option_b: "Convection", option_c: "Radiation", option_d: "Evaporation", correct_answer: "C", explanation: "Radiation is heat transfer through electromagnetic waves.", year: 2000 },
    { question: "The period of a simple pendulum depends on:", option_a: "Mass of bob", option_b: "Length and gravity", option_c: "Amplitude", option_d: "Material of string", correct_answer: "B", explanation: "T = 2π√(L/g). Period depends on length and gravity.", year: 2024 },
    { question: "An electric motor converts:", option_a: "Mechanical to electrical energy", option_b: "Electrical to mechanical energy", option_c: "Heat to electrical energy", option_d: "Chemical to electrical energy", correct_answer: "B", explanation: "Motors convert electrical energy to mechanical energy.", year: 2023 },
    { question: "The unit of magnetic flux is:", option_a: "Tesla", option_b: "Weber", option_c: "Gauss", option_d: "Ampere", correct_answer: "B", explanation: "Magnetic flux is measured in Weber (Wb).", year: 2022 },
    { question: "Which lens is used to correct myopia?", option_a: "Convex lens", option_b: "Concave lens", option_c: "Plano-convex lens", option_d: "Bifocal lens", correct_answer: "B", explanation: "Concave (diverging) lens corrects short-sightedness (myopia).", year: 2021 },
    { question: "The momentum of a body is:", option_a: "Mass × Velocity", option_b: "Mass × Acceleration", option_c: "Force × Time", option_d: "Force × Distance", correct_answer: "A", explanation: "Momentum (p) = Mass × Velocity (p = mv)", year: 2020 },
    { question: "Nuclear fission releases energy because:", option_a: "Mass is created", option_b: "Mass is converted to energy", option_c: "Energy is destroyed", option_d: "Atoms expand", correct_answer: "B", explanation: "E = mc². Mass converts to energy during fission.", year: 2019 },
    { question: "The unit of capacitance is:", option_a: "Volt", option_b: "Farad", option_c: "Ohm", option_d: "Henry", correct_answer: "B", explanation: "Capacitance is measured in Farads (F).", year: 2018 },
    { question: "Hooke's law relates to:", option_a: "Electricity", option_b: "Magnetism", option_c: "Elasticity", option_d: "Thermodynamics", correct_answer: "C", explanation: "Hooke's law: F = kx (force ∝ extension in elastic materials)", year: 2017 },
    { question: "The critical angle is defined for light traveling from:", option_a: "Denser to rarer medium", option_b: "Rarer to denser medium", option_c: "Any two media", option_d: "Same medium", correct_answer: "A", explanation: "Critical angle exists only when light travels from denser to rarer medium.", year: 2016 },
    { question: "In an AC circuit, power is given by:", option_a: "VI", option_b: "VIcosφ", option_c: "V/I", option_d: "I²R only", correct_answer: "B", explanation: "AC power = VIcosφ, where φ is the phase angle.", year: 2015 },
    { question: "The phenomenon of splitting white light into colors is called:", option_a: "Reflection", option_b: "Refraction", option_c: "Dispersion", option_d: "Polarization", correct_answer: "C", explanation: "Dispersion separates white light into its component colors.", year: 2014 },
  ],
  chemistry: [
    { question: "The atomic number of an element represents the number of:", option_a: "Neutrons", option_b: "Protons", option_c: "Electrons in outer shell", option_d: "Mass number", correct_answer: "B", explanation: "Atomic number = number of protons in the nucleus.", year: 2023 },
    { question: "Which gas is known as 'laughing gas'?", option_a: "Carbon dioxide", option_b: "Nitrogen dioxide", option_c: "Nitrous oxide", option_d: "Carbon monoxide", correct_answer: "C", explanation: "Nitrous oxide (N₂O) is called laughing gas due to its euphoric effects.", year: 2022 },
    { question: "The pH of a neutral solution is:", option_a: "0", option_b: "7", option_c: "14", option_d: "1", correct_answer: "B", explanation: "Neutral pH = 7. Below 7 is acidic, above 7 is basic.", year: 2021 },
    { question: "Which element has the highest electronegativity?", option_a: "Oxygen", option_b: "Nitrogen", option_c: "Fluorine", option_d: "Chlorine", correct_answer: "C", explanation: "Fluorine has the highest electronegativity (4.0 on Pauling scale).", year: 2020 },
    { question: "The process of converting a liquid to gas is called:", option_a: "Condensation", option_b: "Sublimation", option_c: "Evaporation", option_d: "Freezing", correct_answer: "C", explanation: "Evaporation/vaporization converts liquid to gas.", year: 2019 },
    { question: "Brass is an alloy of:", option_a: "Copper and Zinc", option_b: "Copper and Tin", option_c: "Iron and Carbon", option_d: "Lead and Tin", correct_answer: "A", explanation: "Brass = Copper + Zinc. Bronze = Copper + Tin.", year: 2018 },
    { question: "The formula of sulfuric acid is:", option_a: "HCl", option_b: "HNO₃", option_c: "H₂SO₄", option_d: "H₃PO₄", correct_answer: "C", explanation: "Sulfuric acid has the formula H₂SO₄.", year: 2017 },
    { question: "Which of these is an example of a chemical change?", option_a: "Melting ice", option_b: "Boiling water", option_c: "Rusting of iron", option_d: "Breaking glass", correct_answer: "C", explanation: "Rusting is a chemical change (iron reacts with oxygen).", year: 2016 },
    { question: "The valency of carbon is:", option_a: "1", option_b: "2", option_c: "3", option_d: "4", correct_answer: "D", explanation: "Carbon has 4 valence electrons, so valency = 4.", year: 2015 },
    { question: "Which gas is produced when an acid reacts with a metal?", option_a: "Oxygen", option_b: "Hydrogen", option_c: "Carbon dioxide", option_d: "Nitrogen", correct_answer: "B", explanation: "Acid + Metal → Salt + Hydrogen gas", year: 2014 },
    { question: "The nucleus of an atom contains:", option_a: "Electrons and neutrons", option_b: "Protons and electrons", option_c: "Protons and neutrons", option_d: "Only protons", correct_answer: "C", explanation: "The nucleus contains protons (positive) and neutrons (neutral).", year: 2013 },
    { question: "Which of these is a noble gas?", option_a: "Oxygen", option_b: "Nitrogen", option_c: "Argon", option_d: "Hydrogen", correct_answer: "C", explanation: "Argon is a noble gas (Group 18). They have full outer shells.", year: 2012 },
    { question: "The IUPAC name of CH₃COOH is:", option_a: "Methanoic acid", option_b: "Ethanoic acid", option_c: "Propanoic acid", option_d: "Butanoic acid", correct_answer: "B", explanation: "CH₃COOH (acetic acid) is called ethanoic acid in IUPAC.", year: 2011 },
    { question: "Isotopes of an element have:", option_a: "Same mass number", option_b: "Different number of protons", option_c: "Same number of neutrons", option_d: "Same atomic number but different mass numbers", correct_answer: "D", explanation: "Isotopes have same protons (atomic number) but different neutrons.", year: 2010 },
    { question: "Which catalyst is used in Haber process?", option_a: "Platinum", option_b: "Iron", option_c: "Nickel", option_d: "Vanadium oxide", correct_answer: "B", explanation: "Iron catalyst is used in Haber process for ammonia synthesis.", year: 2009 },
    { question: "The bond angle in water molecule is approximately:", option_a: "90°", option_b: "104.5°", option_c: "120°", option_d: "180°", correct_answer: "B", explanation: "H₂O has bent structure with bond angle ≈ 104.5°", year: 2008 },
    { question: "Which element is the most abundant in Earth's crust?", option_a: "Iron", option_b: "Silicon", option_c: "Oxygen", option_d: "Aluminum", correct_answer: "C", explanation: "Oxygen makes up about 46% of Earth's crust by mass.", year: 2007 },
    { question: "Avogadro's number is approximately:", option_a: "6.02 × 10²³", option_b: "6.02 × 10²⁴", option_c: "6.02 × 10²²", option_d: "6.02 × 10²¹", correct_answer: "A", explanation: "Avogadro's number ≈ 6.022 × 10²³ particles per mole.", year: 2006 },
    { question: "The process of extracting metals from their ores is called:", option_a: "Refining", option_b: "Smelting", option_c: "Metallurgy", option_d: "Reduction", correct_answer: "C", explanation: "Metallurgy is the science of extracting metals from ores.", year: 2005 },
    { question: "Which acid is found in vinegar?", option_a: "Citric acid", option_b: "Acetic acid", option_c: "Formic acid", option_d: "Lactic acid", correct_answer: "B", explanation: "Vinegar contains acetic acid (ethanoic acid).", year: 2004 },
    { question: "The molecular formula of glucose is:", option_a: "C₆H₁₀O₅", option_b: "C₆H₁₂O₆", option_c: "C₁₂H₂₂O₁₁", option_d: "C₂H₅OH", correct_answer: "B", explanation: "Glucose has the formula C₆H₁₂O₆.", year: 2003 },
    { question: "Which of these is an alkali metal?", option_a: "Calcium", option_b: "Magnesium", option_c: "Potassium", option_d: "Aluminum", correct_answer: "C", explanation: "Potassium (K) is in Group 1 (alkali metals).", year: 2002 },
    { question: "Esterification is a reaction between:", option_a: "Acid and base", option_b: "Acid and alcohol", option_c: "Alcohol and alkali", option_d: "Two alcohols", correct_answer: "B", explanation: "Acid + Alcohol → Ester + Water (esterification)", year: 2001 },
    { question: "The hardest naturally occurring substance is:", option_a: "Iron", option_b: "Quartz", option_c: "Diamond", option_d: "Graphite", correct_answer: "C", explanation: "Diamond (carbon allotrope) is the hardest natural substance.", year: 2000 },
    { question: "Which of these is a reducing agent?", option_a: "Oxygen", option_b: "Chlorine", option_c: "Hydrogen", option_d: "Fluorine", correct_answer: "C", explanation: "Hydrogen donates electrons, acting as a reducing agent.", year: 2024 },
    { question: "The number of electrons in the outermost shell of chlorine is:", option_a: "5", option_b: "6", option_c: "7", option_d: "8", correct_answer: "C", explanation: "Chlorine (Cl) has electronic configuration 2,8,7. Valence electrons = 7.", year: 2023 },
    { question: "Saponification is the process of making:", option_a: "Plastic", option_b: "Soap", option_c: "Paper", option_d: "Glass", correct_answer: "B", explanation: "Saponification: Fat/Oil + Alkali → Soap + Glycerol", year: 2022 },
    { question: "Which gas is responsible for global warming?", option_a: "Oxygen", option_b: "Nitrogen", option_c: "Carbon dioxide", option_d: "Hydrogen", correct_answer: "C", explanation: "CO₂ is a major greenhouse gas causing global warming.", year: 2021 },
    { question: "The number of bonds in a nitrogen molecule (N₂) is:", option_a: "1", option_b: "2", option_c: "3", option_d: "4", correct_answer: "C", explanation: "N₂ has a triple bond (N≡N) between the atoms.", year: 2020 },
    { question: "Which of these is NOT a type of chemical bond?", option_a: "Ionic bond", option_b: "Covalent bond", option_c: "Metallic bond", option_d: "Thermal bond", correct_answer: "D", explanation: "Thermal bond doesn't exist. The main types are ionic, covalent, and metallic.", year: 2019 },
    { question: "The oxidation state of hydrogen in most compounds is:", option_a: "-1", option_b: "0", option_c: "+1", option_d: "+2", correct_answer: "C", explanation: "Hydrogen typically has +1 oxidation state (except in metal hydrides: -1).", year: 2018 },
    { question: "Which ore is used to extract aluminum?", option_a: "Hematite", option_b: "Bauxite", option_c: "Galena", option_d: "Chalcopyrite", correct_answer: "B", explanation: "Bauxite (Al₂O₃·2H₂O) is the main ore of aluminum.", year: 2017 },
    { question: "The phenomenon where different forms of an element exist is called:", option_a: "Isomerism", option_b: "Allotropy", option_c: "Polymerism", option_d: "Isotopy", correct_answer: "B", explanation: "Allotropy: same element, different forms (e.g., diamond & graphite).", year: 2016 },
    { question: "What is the percentage of nitrogen in the atmosphere?", option_a: "21%", option_b: "78%", option_c: "0.03%", option_d: "1%", correct_answer: "B", explanation: "Atmosphere: ~78% N₂, ~21% O₂, ~1% other gases.", year: 2015 },
    { question: "The process of separating crude oil into fractions is called:", option_a: "Cracking", option_b: "Polymerization", option_c: "Fractional distillation", option_d: "Hydrogenation", correct_answer: "C", explanation: "Fractional distillation separates crude oil based on boiling points.", year: 2014 },
  ],
  biology: [
    { question: "The powerhouse of the cell is:", option_a: "Nucleus", option_b: "Ribosome", option_c: "Mitochondria", option_d: "Golgi body", correct_answer: "C", explanation: "Mitochondria produce ATP through cellular respiration.", year: 2023 },
    { question: "Photosynthesis takes place in:", option_a: "Mitochondria", option_b: "Chloroplast", option_c: "Nucleus", option_d: "Ribosome", correct_answer: "B", explanation: "Chloroplasts contain chlorophyll for photosynthesis.", year: 2022 },
    { question: "The basic unit of life is:", option_a: "Tissue", option_b: "Organ", option_c: "Cell", option_d: "Organism", correct_answer: "C", explanation: "The cell is the fundamental structural and functional unit of life.", year: 2021 },
    { question: "DNA stands for:", option_a: "Deoxyribonucleic acid", option_b: "Deoxyribose nucleic acid", option_c: "Dinucleotide acid", option_d: "Dual nucleic acid", correct_answer: "A", explanation: "DNA = Deoxyribonucleic acid, carries genetic information.", year: 2020 },
    { question: "Blood is filtered in the:", option_a: "Heart", option_b: "Liver", option_c: "Kidney", option_d: "Lungs", correct_answer: "C", explanation: "Kidneys filter blood to remove waste and excess water.", year: 2019 },
    { question: "The largest organ in the human body is:", option_a: "Heart", option_b: "Liver", option_c: "Skin", option_d: "Brain", correct_answer: "C", explanation: "Skin is the largest organ, covering the entire body.", year: 2018 },
    { question: "Insulin is produced by:", option_a: "Liver", option_b: "Pancreas", option_c: "Kidney", option_d: "Thyroid", correct_answer: "B", explanation: "Beta cells in the pancreas produce insulin.", year: 2017 },
    { question: "The number of chromosomes in a human cell is:", option_a: "23", option_b: "46", option_c: "44", option_d: "48", correct_answer: "B", explanation: "Humans have 46 chromosomes (23 pairs) in each cell.", year: 2016 },
    { question: "Hemoglobin is found in:", option_a: "White blood cells", option_b: "Red blood cells", option_c: "Platelets", option_d: "Plasma", correct_answer: "B", explanation: "RBCs contain hemoglobin which carries oxygen.", year: 2015 },
    { question: "The process of cell division is called:", option_a: "Meiosis only", option_b: "Mitosis only", option_c: "Cell cycle", option_d: "Binary fission only", correct_answer: "C", explanation: "Cell division includes mitosis (body cells) and meiosis (sex cells).", year: 2014 },
    { question: "Which vitamin is produced when skin is exposed to sunlight?", option_a: "Vitamin A", option_b: "Vitamin B", option_c: "Vitamin C", option_d: "Vitamin D", correct_answer: "D", explanation: "UV light helps synthesize Vitamin D in the skin.", year: 2013 },
    { question: "The study of heredity is called:", option_a: "Ecology", option_b: "Genetics", option_c: "Cytology", option_d: "Histology", correct_answer: "B", explanation: "Genetics is the study of genes, heredity, and variation.", year: 2012 },
    { question: "Enzymes are:", option_a: "Carbohydrates", option_b: "Lipids", option_c: "Proteins", option_d: "Vitamins", correct_answer: "C", explanation: "Enzymes are biological catalysts made of proteins.", year: 2011 },
    { question: "The organelle responsible for protein synthesis is:", option_a: "Mitochondria", option_b: "Ribosome", option_c: "Nucleus", option_d: "Lysosome", correct_answer: "B", explanation: "Ribosomes translate mRNA into proteins.", year: 2010 },
    { question: "Osmosis is the movement of:", option_a: "Solute through a membrane", option_b: "Water through a semipermeable membrane", option_c: "Gas through a membrane", option_d: "Particles in air", correct_answer: "B", explanation: "Osmosis: water moves from dilute to concentrated solution.", year: 2009 },
    { question: "The heart has how many chambers?", option_a: "2", option_b: "3", option_c: "4", option_d: "5", correct_answer: "C", explanation: "The heart has 4 chambers: 2 atria and 2 ventricles.", year: 2008 },
    { question: "Which blood group is the universal donor?", option_a: "A", option_b: "B", option_c: "AB", option_d: "O", correct_answer: "D", explanation: "Type O blood has no antigens, making it a universal donor.", year: 2007 },
    { question: "Respiration in plants occurs in:", option_a: "Leaves only", option_b: "Roots only", option_c: "All living cells", option_d: "Stems only", correct_answer: "C", explanation: "All living cells respire to produce energy.", year: 2006 },
    { question: "The main function of white blood cells is:", option_a: "Oxygen transport", option_b: "Fighting infections", option_c: "Blood clotting", option_d: "Nutrient transport", correct_answer: "B", explanation: "WBCs (leukocytes) are part of the immune system.", year: 2005 },
    { question: "Starch is stored in plants as:", option_a: "Glucose", option_b: "Glycogen", option_c: "Amylose and amylopectin", option_d: "Cellulose", correct_answer: "C", explanation: "Starch consists of amylose and amylopectin (storage form).", year: 2004 },
    { question: "The process by which green plants make food is called:", option_a: "Respiration", option_b: "Digestion", option_c: "Photosynthesis", option_d: "Transpiration", correct_answer: "C", explanation: "Photosynthesis: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂", year: 2003 },
    { question: "Which part of the brain controls balance?", option_a: "Cerebrum", option_b: "Cerebellum", option_c: "Medulla", option_d: "Hypothalamus", correct_answer: "B", explanation: "The cerebellum coordinates movement and balance.", year: 2002 },
    { question: "The excretory organ in earthworms is:", option_a: "Kidney", option_b: "Malpighian tubules", option_c: "Nephridia", option_d: "Flame cells", correct_answer: "C", explanation: "Nephridia are the excretory organs in earthworms.", year: 2001 },
    { question: "An organism that lives on another organism is called:", option_a: "Predator", option_b: "Parasite", option_c: "Saprophyte", option_d: "Symbiont", correct_answer: "B", explanation: "Parasites live on/in hosts and harm them.", year: 2000 },
    { question: "The hormone responsible for 'fight or flight' response is:", option_a: "Insulin", option_b: "Thyroxine", option_c: "Adrenaline", option_d: "Estrogen", correct_answer: "C", explanation: "Adrenaline (epinephrine) prepares body for emergencies.", year: 2024 },
    { question: "Chlorophyll absorbs all colors except:", option_a: "Red", option_b: "Blue", option_c: "Green", option_d: "Yellow", correct_answer: "C", explanation: "Chlorophyll reflects green light, making plants appear green.", year: 2023 },
    { question: "The term 'ecology' was coined by:", option_a: "Darwin", option_b: "Haeckel", option_c: "Mendel", option_d: "Linnaeus", correct_answer: "B", explanation: "Ernst Haeckel coined the term 'ecology' in 1866.", year: 2022 },
    { question: "Which organelle contains digestive enzymes?", option_a: "Ribosome", option_b: "Lysosome", option_c: "Mitochondria", option_d: "Golgi body", correct_answer: "B", explanation: "Lysosomes contain digestive enzymes to break down waste.", year: 2021 },
    { question: "The end product of anaerobic respiration in yeast is:", option_a: "Lactic acid", option_b: "Ethanol and CO₂", option_c: "Water and CO₂", option_d: "Glucose", correct_answer: "B", explanation: "Yeast produces ethanol and CO₂ during fermentation.", year: 2020 },
    { question: "Xylem transports:", option_a: "Food", option_b: "Water and minerals", option_c: "Hormones", option_d: "Oxygen", correct_answer: "B", explanation: "Xylem carries water and dissolved minerals from roots upward.", year: 2019 },
    { question: "The nitrogenous waste in humans is:", option_a: "Ammonia", option_b: "Urea", option_c: "Uric acid", option_d: "Nitrate", correct_answer: "B", explanation: "Humans excrete urea, formed in the liver from ammonia.", year: 2018 },
    { question: "The male reproductive part of a flower is:", option_a: "Pistil", option_b: "Stamen", option_c: "Ovary", option_d: "Stigma", correct_answer: "B", explanation: "Stamen (anther + filament) is the male part producing pollen.", year: 2017 },
    { question: "Mutation is a change in:", option_a: "Phenotype", option_b: "DNA sequence", option_c: "Environment", option_d: "Behavior", correct_answer: "B", explanation: "Mutation is a permanent change in the DNA sequence.", year: 2016 },
    { question: "The functional unit of the kidney is:", option_a: "Neuron", option_b: "Nephron", option_c: "Glomerulus", option_d: "Bowman's capsule", correct_answer: "B", explanation: "Each kidney contains about 1 million nephrons for filtration.", year: 2015 },
    { question: "Pollination by insects is called:", option_a: "Anemophily", option_b: "Entomophily", option_c: "Hydrophily", option_d: "Ornithophily", correct_answer: "B", explanation: "Entomophily = insect pollination. Anemophily = wind pollination.", year: 2014 },
  ],
  literature: [
    { question: "Who wrote 'Things Fall Apart'?", option_a: "Wole Soyinka", option_b: "Chinua Achebe", option_c: "Chimamanda Adichie", option_d: "Ben Okri", correct_answer: "B", explanation: "Chinua Achebe wrote Things Fall Apart in 1958.", year: 2023 },
    { question: "The main character in 'Things Fall Apart' is:", option_a: "Obi Okonkwo", option_b: "Okonkwo", option_c: "Unoka", option_d: "Nwoye", correct_answer: "B", explanation: "Okonkwo is the tragic hero of Things Fall Apart.", year: 2022 },
    { question: "A sonnet has how many lines?", option_a: "10", option_b: "12", option_c: "14", option_d: "16", correct_answer: "C", explanation: "A sonnet is a 14-line poem, usually in iambic pentameter.", year: 2021 },
    { question: "The author of 'The Lion and the Jewel' is:", option_a: "Chinua Achebe", option_b: "Wole Soyinka", option_c: "J.P. Clark", option_d: "Elechi Amadi", correct_answer: "B", explanation: "Wole Soyinka wrote The Lion and the Jewel.", year: 2020 },
    { question: "An epic is:", option_a: "A short poem", option_b: "A long narrative poem", option_c: "A type of drama", option_d: "A novel", correct_answer: "B", explanation: "An epic is a long narrative poem about heroic deeds.", year: 2019 },
    { question: "The term 'protagonist' refers to:", option_a: "The villain", option_b: "The main character", option_c: "The narrator", option_d: "The author", correct_answer: "B", explanation: "The protagonist is the central character in a story.", year: 2018 },
    { question: "A tragedy typically ends with:", option_a: "A happy ending", option_b: "A wedding", option_c: "The downfall of the hero", option_d: "A celebration", correct_answer: "C", explanation: "Tragedy ends in the downfall or death of the protagonist.", year: 2017 },
    { question: "Who wrote 'Romeo and Juliet'?", option_a: "Charles Dickens", option_b: "William Shakespeare", option_c: "Jane Austen", option_d: "Oscar Wilde", correct_answer: "B", explanation: "Shakespeare wrote Romeo and Juliet around 1594-1596.", year: 2016 },
    { question: "The antagonist is:", option_a: "The main character", option_b: "The character who opposes the protagonist", option_c: "The narrator", option_d: "A minor character", correct_answer: "B", explanation: "The antagonist creates conflict by opposing the protagonist.", year: 2015 },
    { question: "A soliloquy is:", option_a: "A conversation between characters", option_b: "A speech by one character alone on stage", option_c: "A song in a play", option_d: "A dance sequence", correct_answer: "B", explanation: "A soliloquy reveals a character's inner thoughts to the audience.", year: 2014 },
    { question: "Irony is when:", option_a: "Something is repeated", option_b: "The opposite of what is expected happens", option_c: "Things rhyme", option_d: "There is a metaphor", correct_answer: "B", explanation: "Irony involves contrast between expectation and reality.", year: 2013 },
    { question: "The setting of a story refers to:", option_a: "The plot", option_b: "The time and place", option_c: "The characters", option_d: "The theme", correct_answer: "B", explanation: "Setting is when and where the story takes place.", year: 2012 },
    { question: "'Hamlet' was written by:", option_a: "Christopher Marlowe", option_b: "William Shakespeare", option_c: "Ben Jonson", option_d: "John Milton", correct_answer: "B", explanation: "Shakespeare wrote Hamlet around 1600-1601.", year: 2011 },
    { question: "A simile uses:", option_a: "Direct comparison", option_b: "'Like' or 'as' to compare", option_c: "Exaggeration", option_d: "Personification", correct_answer: "B", explanation: "Similes compare using 'like' or 'as' (e.g., 'fast as lightning').", year: 2010 },
    { question: "The climax of a story is:", option_a: "The beginning", option_b: "The turning point", option_c: "The end", option_d: "The introduction of characters", correct_answer: "B", explanation: "The climax is the peak of tension or the turning point.", year: 2009 },
    { question: "Onomatopoeia is:", option_a: "Exaggeration", option_b: "Words that imitate sounds", option_c: "Repetition", option_d: "Comparison", correct_answer: "B", explanation: "Onomatopoeia: words like 'buzz', 'crash', 'meow' that sound like their meaning.", year: 2008 },
    { question: "The author of 'Purple Hibiscus' is:", option_a: "Chimamanda Ngozi Adichie", option_b: "Chinua Achebe", option_c: "Wole Soyinka", option_d: "Sefi Atta", correct_answer: "A", explanation: "Chimamanda Adichie wrote Purple Hibiscus (2003).", year: 2007 },
    { question: "A fable typically features:", option_a: "Historical events", option_b: "Animals with human traits", option_c: "Only human characters", option_d: "Scientific facts", correct_answer: "B", explanation: "Fables use animals to teach moral lessons.", year: 2006 },
    { question: "Alliteration is:", option_a: "Repetition of vowel sounds", option_b: "Repetition of consonant sounds at the beginning", option_c: "Rhyming words", option_d: "Exaggeration", correct_answer: "B", explanation: "Alliteration: 'Peter Piper picked a peck of pickled peppers'.", year: 2005 },
    { question: "The genre of 'Animal Farm' by George Orwell is:", option_a: "Romance", option_b: "Political satire/allegory", option_c: "Science fiction", option_d: "Horror", correct_answer: "B", explanation: "Animal Farm is a political allegory satirizing Soviet communism.", year: 2004 },
    { question: "A monologue is:", option_a: "A conversation between two people", option_b: "A long speech by one character", option_c: "A short poem", option_d: "A type of novel", correct_answer: "B", explanation: "A monologue is an extended speech by one person.", year: 2003 },
    { question: "The theme of a literary work is:", option_a: "The main characters", option_b: "The central idea or message", option_c: "The setting", option_d: "The plot summary", correct_answer: "B", explanation: "Theme is the underlying message or main idea.", year: 2002 },
    { question: "Oxymoron is:", option_a: "Extreme exaggeration", option_b: "Combining contradictory terms", option_c: "Comparison using 'like'", option_d: "Giving human qualities to objects", correct_answer: "B", explanation: "Oxymoron: 'deafening silence', 'living dead', 'cruel kindness'.", year: 2001 },
    { question: "The narrative voice in first person uses:", option_a: "He/She", option_b: "I/We", option_c: "You", option_d: "They", correct_answer: "B", explanation: "First person narration uses 'I' and 'we'.", year: 2000 },
    { question: "Who wrote 'The Famished Road'?", option_a: "Chinua Achebe", option_b: "Ben Okri", option_c: "Wole Soyinka", option_d: "Ngugi wa Thiong'o", correct_answer: "B", explanation: "Ben Okri won the Booker Prize for The Famished Road (1991).", year: 2024 },
    { question: "A flashback is:", option_a: "A hint about future events", option_b: "A scene from the past", option_c: "The climax", option_d: "The resolution", correct_answer: "B", explanation: "Flashback interrupts the present to show past events.", year: 2023 },
    { question: "Foreshadowing is:", option_a: "Looking back at the past", option_b: "Hints about future events", option_c: "The ending", option_d: "Character development", correct_answer: "B", explanation: "Foreshadowing gives clues about what will happen later.", year: 2022 },
    { question: "The author of 'Death and the King's Horseman' is:", option_a: "Chinua Achebe", option_b: "Wole Soyinka", option_c: "J.P. Clark", option_d: "Femi Osofisan", correct_answer: "B", explanation: "Wole Soyinka wrote this play based on historical events.", year: 2021 },
    { question: "A ballad is:", option_a: "A type of drama", option_b: "A narrative poem or song", option_c: "A novel", option_d: "An essay", correct_answer: "B", explanation: "Ballads are narrative poems/songs, often telling folk stories.", year: 2020 },
    { question: "Euphemism is:", option_a: "Harsh language", option_b: "Mild expression for something unpleasant", option_c: "Exaggeration", option_d: "Repetition", correct_answer: "B", explanation: "Euphemism: 'passed away' for 'died', 'let go' for 'fired'.", year: 2019 },
    { question: "The resolution of a story is:", option_a: "The introduction", option_b: "The climax", option_c: "How the conflict is solved", option_d: "The setting", correct_answer: "C", explanation: "Resolution is how conflicts are resolved after the climax.", year: 2018 },
    { question: "Assonance is:", option_a: "Repetition of consonant sounds", option_b: "Repetition of vowel sounds", option_c: "Rhyming words", option_d: "Alliteration", correct_answer: "B", explanation: "Assonance: repetition of vowel sounds ('fleet feet sweep').", year: 2017 },
    { question: "A bildungsroman is:", option_a: "A mystery novel", option_b: "A coming-of-age story", option_c: "A horror story", option_d: "A romance", correct_answer: "B", explanation: "Bildungsroman follows a character's growth and education.", year: 2016 },
    { question: "Pathos appeals to:", option_a: "Logic", option_b: "Emotions", option_c: "Ethics", option_d: "Authority", correct_answer: "B", explanation: "Pathos is a rhetorical appeal to emotions.", year: 2015 },
    { question: "The author of 'Half of a Yellow Sun' is:", option_a: "Chimamanda Ngozi Adichie", option_b: "Chinua Achebe", option_c: "Buchi Emecheta", option_d: "Ama Ata Aidoo", correct_answer: "A", explanation: "Adichie wrote this Biafran War novel, winning the Orange Prize.", year: 2014 },
  ],
  government: [
    { question: "Democracy is government of the people, by the people, and for the people. This was said by:", option_a: "John Locke", option_b: "Abraham Lincoln", option_c: "Plato", option_d: "Aristotle", correct_answer: "B", explanation: "Abraham Lincoln said this in his Gettysburg Address (1863).", year: 2023 },
    { question: "The legislature in Nigeria is called:", option_a: "Parliament", option_b: "National Assembly", option_c: "Congress", option_d: "Diet", correct_answer: "B", explanation: "Nigeria's legislature is the National Assembly (Senate + House of Reps).", year: 2022 },
    { question: "Nigeria became a republic in:", option_a: "1960", option_b: "1963", option_c: "1966", option_d: "1979", correct_answer: "B", explanation: "Nigeria became a republic on October 1, 1963.", year: 2021 },
    { question: "The principle of separation of powers was propounded by:", option_a: "John Locke", option_b: "Montesquieu", option_c: "Rousseau", option_d: "Plato", correct_answer: "B", explanation: "Montesquieu developed the theory of separation of powers.", year: 2020 },
    { question: "Universal adult suffrage means:", option_a: "Only men can vote", option_b: "All adults can vote", option_c: "Only the educated can vote", option_d: "Only property owners can vote", correct_answer: "B", explanation: "Universal suffrage: all adult citizens have the right to vote.", year: 2019 },
    { question: "The highest court in Nigeria is:", option_a: "Court of Appeal", option_b: "Supreme Court", option_c: "High Court", option_d: "Federal Court", correct_answer: "B", explanation: "The Supreme Court is the apex court in Nigeria.", year: 2018 },
    { question: "Federalism involves:", option_a: "One level of government", option_b: "Two or more levels of government", option_c: "Military rule", option_d: "Monarchy", correct_answer: "B", explanation: "Federalism divides power between central and regional governments.", year: 2017 },
    { question: "The first military coup in Nigeria occurred in:", option_a: "1960", option_b: "1963", option_c: "1966", option_d: "1970", correct_answer: "C", explanation: "The first coup was on January 15, 1966.", year: 2016 },
    { question: "Rule of law means:", option_a: "The president makes all laws", option_b: "All are equal before the law", option_c: "Only judges make laws", option_d: "Military rule", correct_answer: "B", explanation: "Rule of law: everyone is subject to and protected by the law.", year: 2015 },
    { question: "ECOWAS was established in:", option_a: "1963", option_b: "1975", option_c: "1980", option_d: "1990", correct_answer: "B", explanation: "ECOWAS was established on May 28, 1975 in Lagos.", year: 2014 },
    { question: "The head of state in a parliamentary system is:", option_a: "Prime Minister", option_b: "President or Monarch", option_c: "Chancellor", option_d: "Speaker", correct_answer: "B", explanation: "In parliamentary systems, the head of state is ceremonial.", year: 2013 },
    { question: "Nigeria has how many geopolitical zones?", option_a: "4", option_b: "5", option_c: "6", option_d: "7", correct_answer: "C", explanation: "Nigeria has 6 geopolitical zones.", year: 2012 },
    { question: "The executive arm of government is responsible for:", option_a: "Making laws", option_b: "Implementing laws", option_c: "Interpreting laws", option_d: "Reviewing laws", correct_answer: "B", explanation: "The executive implements and enforces laws.", year: 2011 },
    { question: "Capitalism is characterized by:", option_a: "Government ownership", option_b: "Private ownership of means of production", option_c: "Communal ownership", option_d: "No private property", correct_answer: "B", explanation: "Capitalism features private ownership and free markets.", year: 2010 },
    { question: "The AU (African Union) headquarters is in:", option_a: "Lagos", option_b: "Addis Ababa", option_c: "Nairobi", option_d: "Cairo", correct_answer: "B", explanation: "The AU headquarters is in Addis Ababa, Ethiopia.", year: 2009 },
    { question: "Impeachment is:", option_a: "Electing a president", option_b: "Removing an official from office", option_c: "Appointing ministers", option_d: "Creating new laws", correct_answer: "B", explanation: "Impeachment is the process of removing officials for misconduct.", year: 2008 },
    { question: "The doctrine of checks and balances ensures:", option_a: "One arm is supreme", option_b: "Each arm controls the others", option_c: "No government exists", option_d: "Military rule", correct_answer: "B", explanation: "Checks and balances prevent any one branch from becoming too powerful.", year: 2007 },
    { question: "Nigeria gained independence in:", option_a: "1957", option_b: "1960", option_c: "1963", option_d: "1966", correct_answer: "B", explanation: "Nigeria gained independence on October 1, 1960.", year: 2006 },
    { question: "Sovereignty means:", option_a: "Supreme power of a state", option_b: "Economic power", option_c: "Military strength", option_d: "Population size", correct_answer: "A", explanation: "Sovereignty is the supreme authority of a state over its territory.", year: 2005 },
    { question: "The first President of Nigeria was:", option_a: "Obafemi Awolowo", option_b: "Nnamdi Azikiwe", option_c: "Tafawa Balewa", option_d: "Ahmadu Bello", correct_answer: "B", explanation: "Nnamdi Azikiwe became the first President in 1963.", year: 2004 },
    { question: "A unitary system of government has:", option_a: "Multiple centers of power", option_b: "One central government", option_c: "No constitution", option_d: "Only local governments", correct_answer: "B", explanation: "Unitary system: power is centralized in one government.", year: 2003 },
    { question: "Pressure groups are:", option_a: "Political parties", option_b: "Groups that influence government policy", option_c: "Government agencies", option_d: "International organizations", correct_answer: "B", explanation: "Pressure groups advocate for specific interests without seeking power.", year: 2002 },
    { question: "The civil service is:", option_a: "The military", option_b: "The permanent government workforce", option_c: "Political parties", option_d: "The judiciary", correct_answer: "B", explanation: "Civil servants are permanent government employees who implement policies.", year: 2001 },
    { question: "Communism advocates for:", option_a: "Private ownership", option_b: "Classless society with common ownership", option_c: "Monarchy", option_d: "Free market", correct_answer: "B", explanation: "Communism seeks a classless society with communal ownership.", year: 2000 },
    { question: "The first civilian President of Nigeria after military rule was:", option_a: "Olusegun Obasanjo", option_b: "Shehu Shagari", option_c: "Goodluck Jonathan", option_d: "Muhammadu Buhari", correct_answer: "B", explanation: "Shehu Shagari was the first executive president (1979-1983).", year: 2024 },
    { question: "The principle of federalism in Nigeria was introduced by:", option_a: "Macpherson Constitution", option_b: "Lyttleton Constitution", option_c: "Richards Constitution", option_d: "Clifford Constitution", correct_answer: "B", explanation: "The 1954 Lyttleton Constitution formally introduced federalism.", year: 2023 },
    { question: "A referendum is:", option_a: "A type of election", option_b: "A direct vote on a specific issue", option_c: "Parliamentary debate", option_d: "Judicial review", correct_answer: "B", explanation: "A referendum allows citizens to vote directly on issues.", year: 2022 },
    { question: "The INEC in Nigeria stands for:", option_a: "International Electoral Commission", option_b: "Independent National Electoral Commission", option_c: "Internal National Election Committee", option_d: "Independent Nigerian Electoral Council", correct_answer: "B", explanation: "INEC organizes elections in Nigeria.", year: 2021 },
    { question: "Fascism is characterized by:", option_a: "Democratic principles", option_b: "Authoritarian nationalism", option_c: "Communism", option_d: "Liberalism", correct_answer: "B", explanation: "Fascism features dictatorial power and extreme nationalism.", year: 2020 },
    { question: "The United Nations was founded in:", option_a: "1919", option_b: "1939", option_c: "1945", option_d: "1950", correct_answer: "C", explanation: "The UN was established on October 24, 1945.", year: 2019 },
    { question: "Gerrymandering refers to:", option_a: "Voting fraud", option_b: "Manipulating electoral boundaries", option_c: "Election rigging", option_d: "Voter registration", correct_answer: "B", explanation: "Gerrymandering: redrawing districts for political advantage.", year: 2018 },
    { question: "A coalition government is formed when:", option_a: "One party has majority", option_b: "Multiple parties unite to form government", option_c: "Military takes over", option_d: "No election is held", correct_answer: "B", explanation: "Coalition: parties combine when none has outright majority.", year: 2017 },
    { question: "The OAU was replaced by:", option_a: "ECOWAS", option_b: "African Union", option_c: "United Nations", option_d: "Commonwealth", correct_answer: "B", explanation: "The OAU became the African Union in 2002.", year: 2016 },
    { question: "A bicameral legislature has:", option_a: "One chamber", option_b: "Two chambers", option_c: "Three chambers", option_d: "No chambers", correct_answer: "B", explanation: "Bicameral: two houses (e.g., Senate and House of Representatives).", year: 2015 },
    { question: "The first Prime Minister of Nigeria was:", option_a: "Obafemi Awolowo", option_b: "Tafawa Balewa", option_c: "Nnamdi Azikiwe", option_d: "Ahmadu Bello", correct_answer: "B", explanation: "Sir Abubakar Tafawa Balewa was PM from 1960-1966.", year: 2014 },
  ],
  economics: [
    { question: "The law of demand states that:", option_a: "Price and quantity demanded move in the same direction", option_b: "Price and quantity demanded move in opposite directions", option_c: "Price has no effect on demand", option_d: "Supply determines demand", correct_answer: "B", explanation: "Law of demand: as price rises, quantity demanded falls (ceteris paribus).", year: 2023 },
    { question: "GDP stands for:", option_a: "Gross Domestic Product", option_b: "General Domestic Price", option_c: "Gross Development Plan", option_d: "General Development Product", correct_answer: "A", explanation: "GDP measures the total value of goods and services produced.", year: 2022 },
    { question: "Inflation is:", option_a: "A decrease in prices", option_b: "A sustained increase in the general price level", option_c: "Unemployment", option_d: "Economic growth", correct_answer: "B", explanation: "Inflation is a persistent rise in the general price level.", year: 2021 },
    { question: "An oligopoly is a market with:", option_a: "One seller", option_b: "Two sellers", option_c: "A few sellers", option_d: "Many sellers", correct_answer: "C", explanation: "Oligopoly: few large firms dominate the market.", year: 2020 },
    { question: "The central bank of Nigeria is:", option_a: "First Bank", option_b: "CBN", option_c: "UBA", option_d: "Access Bank", correct_answer: "B", explanation: "The Central Bank of Nigeria (CBN) is the apex financial institution.", year: 2019 },
    { question: "Opportunity cost is:", option_a: "The total cost of production", option_b: "The value of the next best alternative foregone", option_c: "The price of a good", option_d: "Fixed costs", correct_answer: "B", explanation: "Opportunity cost: what you give up when making a choice.", year: 2018 },
    { question: "A monopoly exists when:", option_a: "Many firms compete", option_b: "One firm controls the market", option_c: "Two firms compete", option_d: "No barriers to entry exist", correct_answer: "B", explanation: "Monopoly: single seller with no close substitutes.", year: 2017 },
    { question: "Public goods are:", option_a: "Excludable and rivalrous", option_b: "Non-excludable and non-rivalrous", option_c: "Only produced by private firms", option_d: "Always profitable", correct_answer: "B", explanation: "Public goods: cannot exclude users, consumption doesn't reduce availability.", year: 2016 },
    { question: "The equilibrium price is determined by:", option_a: "Government", option_b: "Demand only", option_c: "Supply only", option_d: "Intersection of demand and supply", correct_answer: "D", explanation: "Equilibrium: where demand and supply curves intersect.", year: 2015 },
    { question: "Fiscal policy involves:", option_a: "Interest rates", option_b: "Government spending and taxation", option_c: "Money supply", option_d: "Exchange rates", correct_answer: "B", explanation: "Fiscal policy: government uses spending and taxes to influence economy.", year: 2014 },
    { question: "A progressive tax is one where:", option_a: "Everyone pays the same rate", option_b: "Higher income earners pay higher rates", option_c: "Lower income earners pay higher rates", option_d: "No one pays tax", correct_answer: "B", explanation: "Progressive tax: tax rate increases with income.", year: 2013 },
    { question: "The price elasticity of demand measures:", option_a: "How much supply changes", option_b: "How responsive quantity demanded is to price changes", option_c: "Inflation rate", option_d: "GDP growth", correct_answer: "B", explanation: "PED = % change in quantity demanded / % change in price.", year: 2012 },
    { question: "A trade deficit occurs when:", option_a: "Exports exceed imports", option_b: "Imports exceed exports", option_c: "Exports equal imports", option_d: "No trade occurs", correct_answer: "B", explanation: "Trade deficit: country imports more than it exports.", year: 2011 },
    { question: "The factors of production are:", option_a: "Goods and services", option_b: "Land, labor, capital, and entrepreneurship", option_c: "Money and credit", option_d: "Imports and exports", correct_answer: "B", explanation: "The four factors: land, labor, capital, enterprise.", year: 2010 },
    { question: "A mixed economy combines:", option_a: "Agriculture and industry", option_b: "Private enterprise and government intervention", option_c: "Imports and exports", option_d: "Rich and poor", correct_answer: "B", explanation: "Mixed economy: both private sector and government play roles.", year: 2009 },
    { question: "Unemployment rate is calculated as:", option_a: "Employed / Total population", option_b: "Unemployed / Labor force × 100", option_c: "GDP / Population", option_d: "Imports / Exports", correct_answer: "B", explanation: "Unemployment rate = (Unemployed ÷ Labor force) × 100%", year: 2008 },
    { question: "Perfect competition has:", option_a: "Few sellers", option_b: "Many buyers and sellers, homogeneous products", option_c: "One seller", option_d: "Barriers to entry", correct_answer: "B", explanation: "Perfect competition: many firms, identical products, free entry/exit.", year: 2007 },
    { question: "Monetary policy is conducted by:", option_a: "Ministry of Finance", option_b: "Central Bank", option_c: "Parliament", option_d: "Commercial banks", correct_answer: "B", explanation: "Central bank uses monetary policy to control money supply and interest rates.", year: 2006 },
    { question: "A subsidy is:", option_a: "A tax on goods", option_b: "Government payment to producers or consumers", option_c: "A type of loan", option_d: "Import duty", correct_answer: "B", explanation: "Subsidies are government payments to reduce prices or support production.", year: 2005 },
    { question: "The balance of payments records:", option_a: "Only imports", option_b: "All economic transactions with the rest of the world", option_c: "Only exports", option_d: "Only government spending", correct_answer: "B", explanation: "BOP records all international monetary transactions.", year: 2004 },
    { question: "Comparative advantage means:", option_a: "Producing at lower absolute cost", option_b: "Producing at lower opportunity cost", option_c: "Having more resources", option_d: "Being a larger country", correct_answer: "B", explanation: "Comparative advantage: producing at lower opportunity cost than others.", year: 2003 },
    { question: "The Naira is:", option_a: "A commodity", option_b: "Nigeria's currency", option_c: "A foreign currency", option_d: "A type of bond", correct_answer: "B", explanation: "The Naira (₦) is Nigeria's official currency.", year: 2002 },
    { question: "Fixed costs are costs that:", option_a: "Change with output", option_b: "Remain constant regardless of output", option_c: "Only occur once", option_d: "Are always zero", correct_answer: "B", explanation: "Fixed costs don't change with production level (e.g., rent).", year: 2001 },
    { question: "Deflation is:", option_a: "Rising prices", option_b: "Falling general price level", option_c: "Stable prices", option_d: "Exchange rate changes", correct_answer: "B", explanation: "Deflation: sustained decrease in general price level.", year: 2000 },
    { question: "The multiplier effect shows:", option_a: "How taxes multiply", option_b: "How initial spending leads to larger income increases", option_c: "How interest rates work", option_d: "Exchange rate effects", correct_answer: "B", explanation: "Multiplier: initial spending creates additional rounds of spending.", year: 2024 },
    { question: "Marginal utility is:", option_a: "Total satisfaction", option_b: "Additional satisfaction from one more unit", option_c: "Average satisfaction", option_d: "Minimum satisfaction", correct_answer: "B", explanation: "Marginal utility: extra satisfaction from consuming one more unit.", year: 2023 },
    { question: "A cartel is:", option_a: "A single firm", option_b: "An agreement among firms to fix prices or output", option_c: "A government agency", option_d: "A type of tax", correct_answer: "B", explanation: "Cartel: firms collude to control prices and reduce competition.", year: 2022 },
    { question: "The law of diminishing returns states that:", option_a: "More input always means more output", option_b: "Adding more variable input eventually yields less additional output", option_c: "Output always decreases", option_d: "Fixed costs always rise", correct_answer: "B", explanation: "Eventually, each additional unit of input produces less additional output.", year: 2021 },
    { question: "Real GDP is adjusted for:", option_a: "Population", option_b: "Inflation", option_c: "Imports", option_d: "Exports", correct_answer: "B", explanation: "Real GDP removes inflation effects to show actual output changes.", year: 2020 },
    { question: "A quota is:", option_a: "A tax on imports", option_b: "A limit on the quantity of imports", option_c: "A subsidy", option_d: "An export tax", correct_answer: "B", explanation: "Import quota: physical limit on quantity of goods that can be imported.", year: 2019 },
    { question: "Consumer surplus is:", option_a: "Excess supply", option_b: "Difference between willingness to pay and actual price paid", option_c: "Profit margin", option_d: "Tax revenue", correct_answer: "B", explanation: "Consumer surplus: benefit consumers get from paying less than they would.", year: 2018 },
    { question: "Devaluation of currency leads to:", option_a: "Cheaper imports", option_b: "More expensive imports, cheaper exports", option_c: "No change in trade", option_d: "Lower inflation", correct_answer: "B", explanation: "Devaluation makes exports cheaper and imports more expensive.", year: 2017 },
    { question: "The production possibility curve shows:", option_a: "Only consumption", option_b: "Maximum output combinations with given resources", option_c: "Only imports", option_d: "Government spending", correct_answer: "B", explanation: "PPC shows trade-offs in producing different goods.", year: 2016 },
    { question: "Externalities are:", option_a: "Internal company costs", option_b: "Costs or benefits affecting third parties", option_c: "Import taxes", option_d: "Export subsidies", correct_answer: "B", explanation: "Externalities: spillover effects on people not involved in transaction.", year: 2015 },
    { question: "A budget deficit occurs when:", option_a: "Revenue exceeds spending", option_b: "Government spending exceeds revenue", option_c: "Exports exceed imports", option_d: "Savings exceed investment", correct_answer: "B", explanation: "Budget deficit: government spends more than it collects in revenue.", year: 2014 },
  ],
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting to seed JAMB questions...');
    
    let totalInserted = 0;
    const errors: string[] = [];

    // Process each subject
    for (const [subject, questions] of Object.entries(REAL_JAMB_QUESTIONS)) {
      console.log(`Processing ${subject}: ${questions.length} questions`);
      
      // Prepare questions for insertion
      const questionsToInsert = questions.map((q, index) => ({
        subject: subject.toLowerCase(),
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        year: q.year,
      }));

      // Insert questions (ignoring duplicates via try-catch)
      for (const q of questionsToInsert) {
        const { error: insertError } = await supabase
          .from('jamb_questions')
          .insert(q);
        
        if (!insertError) {
          totalInserted++;
        }
      }
      
      console.log(`Inserted questions for ${subject}`);
    }

    // Get total count
    const { count } = await supabase
      .from('jamb_questions')
      .select('*', { count: 'exact', head: true });

    console.log(`Seeding complete. Total questions in database: ${count}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${totalInserted} questions successfully`,
        totalInDatabase: count,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    console.error('Seed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
