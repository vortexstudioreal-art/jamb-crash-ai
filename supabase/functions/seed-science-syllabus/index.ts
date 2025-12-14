import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// COMPLETE OFFICIAL JAMB SCIENCE SYLLABUS 2025/2026
const scienceSyllabus = {
  "english": {
    name: "Use of English",
    generalAims: [
      "Develop ability to communicate effectively in English",
      "Improve reading comprehension and analytical skills",
      "Master the use of correct grammatical structures",
      "Understand and use idiomatic expressions appropriately",
      "Enhance oral English proficiency"
    ],
    recommendedTextbooks: [
      "Exam Focus English by Bolaji Aremo",
      "Countdown to English by O. Ogunsanwo",
      "New Oxford Secondary English Course",
      "Essential English for JSS & SSS by B.O. Oluikpe",
      "Intensive English for SSS by O. Ogunsanwo"
    ],
    sections: {
      "Comprehension and Summary": {
        topics: [
          {
            name: "Reading Comprehension",
            subtopics: ["Identifying main ideas", "Drawing inferences", "Understanding context clues", "Recognizing writer's purpose"],
            objectives: [
              "Read and understand passages of varying difficulty",
              "Identify explicit and implicit meanings",
              "Answer questions based on passages accurately",
              "Distinguish between fact and opinion"
            ],
            content: "Comprehension involves understanding written text at multiple levels: literal (surface meaning), inferential (reading between the lines), and evaluative (making judgments). Practice with narrative, expository, and argumentative passages."
          },
          {
            name: "Summary Writing",
            subtopics: ["Selecting main points", "Paraphrasing", "Condensing information", "Logical organization"],
            objectives: [
              "Extract main points from a passage",
              "Summarize passages in specified number of sentences",
              "Use own words while retaining meaning",
              "Present information in logical sequence"
            ],
            content: "Summary requires identifying key ideas, eliminating redundancy, and expressing essential information concisely. Practice reduces wordy passages to essential points."
          }
        ]
      },
      "Lexis and Structure": {
        topics: [
          {
            name: "Vocabulary Development",
            subtopics: ["Synonyms and antonyms", "Homophones and homonyms", "Word formation", "Collocations"],
            objectives: [
              "Identify and use words with similar meanings",
              "Distinguish between words that sound alike",
              "Understand prefixes, suffixes, and root words",
              "Use words appropriately in context"
            ],
            content: "Build vocabulary through reading, word lists, and contextual learning. Understand word relationships and usage patterns."
          },
          {
            name: "Sentence Structure",
            subtopics: ["Parts of speech", "Phrase and clause types", "Sentence patterns", "Concord"],
            objectives: [
              "Identify grammatical functions of words",
              "Construct grammatically correct sentences",
              "Apply rules of subject-verb agreement",
              "Use punctuation correctly"
            ],
            content: "Master the eight parts of speech, understand sentence types (simple, compound, complex), and apply grammatical rules consistently."
          },
          {
            name: "Idioms and Expressions",
            subtopics: ["Common idioms", "Phrasal verbs", "Figurative language", "Proverbs"],
            objectives: [
              "Understand meaning of common idioms",
              "Use phrasal verbs appropriately",
              "Interpret figurative expressions",
              "Apply idiomatic expressions in context"
            ],
            content: "Idioms are expressions whose meanings cannot be deduced from individual words. Master common Nigerian and British idioms used in JAMB."
          }
        ]
      },
      "Oral English": {
        topics: [
          {
            name: "Vowel Sounds",
            subtopics: ["Pure vowels (monophthongs)", "Diphthongs", "Vowel length", "Vowel contrast"],
            objectives: [
              "Identify and produce 12 pure vowels",
              "Recognize and produce 8 diphthongs",
              "Distinguish between long and short vowels",
              "Correct common vowel errors"
            ],
            content: "English has 12 monophthongs (/iː/, /ɪ/, /e/, /æ/, /ɑː/, /ɒ/, /ɔː/, /ʊ/, /uː/, /ʌ/, /ɜː/, /ə/) and 8 diphthongs. Practice with minimal pairs."
          },
          {
            name: "Consonant Sounds",
            subtopics: ["Voiced and voiceless consonants", "Consonant clusters", "Problem consonants", "Silent letters"],
            objectives: [
              "Distinguish voiced from voiceless sounds",
              "Pronounce consonant clusters correctly",
              "Master difficult consonant sounds",
              "Identify silent letters in words"
            ],
            content: "There are 24 consonant sounds in English. Nigerian learners often have difficulty with /θ/, /ð/, /ʒ/, and consonant clusters like /str/, /spl/."
          },
          {
            name: "Stress and Intonation",
            subtopics: ["Word stress patterns", "Sentence stress", "Emphatic stress", "Intonation patterns"],
            objectives: [
              "Place stress correctly on polysyllabic words",
              "Use sentence stress for emphasis",
              "Apply rising and falling intonation",
              "Recognize how stress changes meaning"
            ],
            content: "Stress is the relative emphasis on syllables. Word stress follows patterns; sentence stress highlights new or important information."
          },
          {
            name: "Rhymes and Syllables",
            subtopics: ["Rhyming words", "Syllable division", "Syllable counting", "Rhythm patterns"],
            objectives: [
              "Identify words that rhyme",
              "Count syllables in words",
              "Divide words into syllables",
              "Recognize rhythmic patterns"
            ],
            content: "Rhyming words have the same ending sound. Syllable awareness helps pronunciation and spelling. English rhythm is stress-timed."
          }
        ]
      }
    }
  },
  "mathematics": {
    name: "Mathematics",
    generalAims: [
      "Develop computational and manipulative skills",
      "Apply mathematical concepts to real-life situations",
      "Develop logical reasoning and problem-solving abilities",
      "Prepare students for further studies in mathematics and related fields",
      "Cultivate interest and confidence in mathematics"
    ],
    recommendedTextbooks: [
      "New General Mathematics for SSS by M.F. Macrae",
      "Essential Mathematics for SSS by A.J.S. Oluwasanmi",
      "Further Mathematics Project by M.R. Tuttuh-Adegun",
      "Exam Focus Mathematics by A. Adeniran",
      "New School Mathematics for SSS by D. Channon"
    ],
    sections: {
      "Number and Numeration": {
        topics: [
          {
            name: "Number Bases",
            subtopics: ["Binary (base 2)", "Octal (base 8)", "Decimal (base 10)", "Conversion between bases", "Arithmetic in different bases"],
            objectives: [
              "Convert numbers from one base to another",
              "Perform arithmetic operations in different bases",
              "Solve problems involving number bases",
              "Apply number bases to computer science concepts"
            ],
            content: "Number bases represent quantities using different groupings. Binary uses 0,1; octal uses 0-7; decimal uses 0-9. Master conversion algorithms: repeated division for decimal to other bases, expanded notation for other bases to decimal."
          },
          {
            name: "Fractions, Decimals and Percentages",
            subtopics: ["Operations on fractions", "Conversion between forms", "Percentage calculations", "Ratio and proportion"],
            objectives: [
              "Perform operations on fractions and decimals",
              "Convert between fractions, decimals, percentages",
              "Solve percentage problems (profit, loss, discount)",
              "Apply ratio in sharing and comparison"
            ],
            content: "Fractions represent parts of wholes. Operations follow specific rules. Percentages express fractions with denominator 100. Ratios compare quantities."
          },
          {
            name: "Indices and Logarithms",
            subtopics: ["Laws of indices", "Standard form", "Logarithmic operations", "Antilogarithms", "Calculations using log tables"],
            objectives: [
              "Apply laws of indices to simplify expressions",
              "Express numbers in standard form",
              "Use logarithm tables for calculations",
              "Solve equations involving indices and logarithms"
            ],
            content: "Index laws: aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ, a⁰ = 1, a⁻ⁿ = 1/aⁿ. Logarithm is the inverse of indices: if aˣ = y, then logₐy = x."
          },
          {
            name: "Surds",
            subtopics: ["Simplification of surds", "Operations on surds", "Rationalization", "Equations with surds"],
            objectives: [
              "Simplify surd expressions",
              "Add, subtract, multiply surds",
              "Rationalize denominators",
              "Solve surd equations"
            ],
            content: "Surds are irrational numbers expressed as roots. Simplify √12 = 2√3. Rationalize by multiplying by conjugate: 1/(√2+1) × (√2-1)/(√2-1)."
          }
        ]
      },
      "Algebra": {
        topics: [
          {
            name: "Algebraic Expressions",
            subtopics: ["Expansion and factorization", "Algebraic fractions", "Substitution", "Polynomial operations"],
            objectives: [
              "Expand and factorize algebraic expressions",
              "Simplify algebraic fractions",
              "Evaluate expressions by substitution",
              "Perform operations on polynomials"
            ],
            content: "Factorization techniques: common factor, difference of squares (a²-b²), trinomials, grouping. Perfect squares: (a+b)² = a² + 2ab + b²."
          },
          {
            name: "Equations",
            subtopics: ["Linear equations", "Quadratic equations", "Simultaneous equations", "Word problems"],
            objectives: [
              "Solve linear equations in one variable",
              "Solve quadratic equations (factoring, formula, completing square)",
              "Solve simultaneous linear equations",
              "Form and solve equations from word problems"
            ],
            content: "Quadratic formula: x = (-b ± √(b²-4ac))/2a. Discriminant b²-4ac determines nature of roots. Simultaneous equations solved by substitution or elimination."
          },
          {
            name: "Inequalities",
            subtopics: ["Linear inequalities", "Quadratic inequalities", "Graphical solution", "Inequality word problems"],
            objectives: [
              "Solve linear inequalities",
              "Solve quadratic inequalities",
              "Represent solutions on number line",
              "Apply inequalities to real situations"
            ],
            content: "Inequality rules: multiplying/dividing by negative reverses sign. Quadratic inequalities: find critical points, test intervals."
          },
          {
            name: "Variation",
            subtopics: ["Direct variation", "Inverse variation", "Joint variation", "Partial variation"],
            objectives: [
              "Express relationships as variation formulas",
              "Solve direct and inverse variation problems",
              "Handle joint and partial variation",
              "Apply variation to real-world problems"
            ],
            content: "Direct: y = kx (y ∝ x). Inverse: y = k/x (y ∝ 1/x). Joint: z = kxy. Partial: y = kx + c. Find constant k using given values."
          },
          {
            name: "Sequences and Series",
            subtopics: ["Arithmetic progression (AP)", "Geometric progression (GP)", "Sum formulas", "Applications"],
            objectives: [
              "Identify AP and GP sequences",
              "Find nth term of sequences",
              "Calculate sum of n terms",
              "Solve sequence problems"
            ],
            content: "AP: nth term aₙ = a + (n-1)d, Sum Sₙ = n/2[2a + (n-1)d]. GP: nth term aₙ = arⁿ⁻¹, Sum Sₙ = a(rⁿ-1)/(r-1) for r≠1."
          }
        ]
      },
      "Geometry and Mensuration": {
        topics: [
          {
            name: "Angles and Lines",
            subtopics: ["Types of angles", "Angle relationships", "Parallel lines and transversals", "Angle properties"],
            objectives: [
              "Identify and classify angles",
              "Apply angle relationships (complementary, supplementary)",
              "Use parallel line theorems",
              "Calculate unknown angles"
            ],
            content: "Angle types: acute (<90°), right (90°), obtuse (>90°<180°), reflex (>180°). Parallel line angles: alternate, corresponding, co-interior."
          },
          {
            name: "Triangles",
            subtopics: ["Types of triangles", "Properties of triangles", "Congruence and similarity", "Pythagoras theorem"],
            objectives: [
              "Classify triangles by sides and angles",
              "Apply triangle properties",
              "Prove triangle congruence/similarity",
              "Apply Pythagoras theorem"
            ],
            content: "Triangle angle sum = 180°. Pythagoras: a² + b² = c² for right triangles. Similarity ratios apply to corresponding sides."
          },
          {
            name: "Circles",
            subtopics: ["Circle properties", "Chord theorems", "Tangent properties", "Circle theorems"],
            objectives: [
              "Apply circle theorems",
              "Solve chord and secant problems",
              "Apply tangent properties",
              "Calculate arc lengths and sector areas"
            ],
            content: "Circle theorems: angle at center = 2× angle at circumference, angles in same segment are equal, angle in semicircle = 90°, opposite angles of cyclic quadrilateral = 180°."
          },
          {
            name: "Mensuration",
            subtopics: ["Perimeter and area of plane shapes", "Surface area of solids", "Volume of solids", "Arc and sector"],
            objectives: [
              "Calculate perimeter and area of shapes",
              "Find surface area of 3D shapes",
              "Calculate volumes of prisms, pyramids, spheres",
              "Solve problems on arcs and sectors"
            ],
            content: "Circle: A = πr², C = 2πr. Sphere: V = (4/3)πr³, SA = 4πr². Cylinder: V = πr²h, SA = 2πr² + 2πrh. Cone: V = (1/3)πr²h."
          }
        ]
      },
      "Trigonometry": {
        topics: [
          {
            name: "Trigonometric Ratios",
            subtopics: ["Sine, cosine, tangent", "Reciprocal ratios", "Trigonometric tables", "Angles of elevation/depression"],
            objectives: [
              "Define and apply trig ratios",
              "Use trigonometric tables/calculator",
              "Solve right triangle problems",
              "Apply to heights and distances"
            ],
            content: "In right triangle: sin θ = opp/hyp, cos θ = adj/hyp, tan θ = opp/adj. SOH-CAH-TOA mnemonic. Angles of elevation look up, depression look down."
          },
          {
            name: "Sine and Cosine Rules",
            subtopics: ["Sine rule", "Cosine rule", "Area of triangle", "Applications"],
            objectives: [
              "Apply sine rule for non-right triangles",
              "Apply cosine rule",
              "Calculate area using ½ab sin C",
              "Solve triangle problems"
            ],
            content: "Sine rule: a/sin A = b/sin B = c/sin C. Cosine rule: a² = b² + c² - 2bc cos A. Area = ½ab sin C."
          },
          {
            name: "Trigonometric Identities",
            subtopics: ["Pythagorean identities", "Compound angle formulas", "Double angle formulas", "Proving identities"],
            objectives: [
              "Apply fundamental identities",
              "Use compound angle formulas",
              "Simplify using identities",
              "Prove trigonometric identities"
            ],
            content: "sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ. Compound: sin(A±B) = sinA cosB ± cosA sinB. Double: sin 2A = 2 sinA cosA."
          }
        ]
      },
      "Coordinate Geometry": {
        topics: [
          {
            name: "Straight Lines",
            subtopics: ["Distance formula", "Midpoint", "Gradient", "Equation of line"],
            objectives: [
              "Calculate distance between two points",
              "Find midpoint of line segment",
              "Determine gradient of line",
              "Write equation of line in various forms"
            ],
            content: "Distance: d = √[(x₂-x₁)² + (y₂-y₁)²]. Midpoint: ((x₁+x₂)/2, (y₁+y₂)/2). Gradient: m = (y₂-y₁)/(x₂-x₁). Line: y = mx + c or y - y₁ = m(x - x₁)."
          }
        ]
      },
      "Statistics and Probability": {
        topics: [
          {
            name: "Measures of Central Tendency",
            subtopics: ["Mean", "Median", "Mode", "Grouped data"],
            objectives: [
              "Calculate mean, median, mode",
              "Work with grouped frequency data",
              "Choose appropriate measure",
              "Interpret central tendency"
            ],
            content: "Mean = Σx/n or Σfx/Σf. Median is middle value when ordered. Mode is most frequent. For grouped data, use class midpoints."
          },
          {
            name: "Measures of Dispersion",
            subtopics: ["Range", "Variance", "Standard deviation", "Mean deviation"],
            objectives: [
              "Calculate range and variance",
              "Compute standard deviation",
              "Interpret measures of spread",
              "Compare distributions"
            ],
            content: "Range = max - min. Variance σ² = Σ(x-x̄)²/n. Standard deviation σ = √variance. Higher SD means more spread."
          },
          {
            name: "Probability",
            subtopics: ["Basic probability", "Addition rule", "Multiplication rule", "Conditional probability"],
            objectives: [
              "Calculate simple probabilities",
              "Apply addition rule for mutually exclusive events",
              "Apply multiplication rule for independent events",
              "Solve probability problems"
            ],
            content: "P(A) = n(A)/n(S). Mutually exclusive: P(A or B) = P(A) + P(B). Independent: P(A and B) = P(A) × P(B)."
          }
        ]
      }
    }
  },
  "physics": {
    name: "Physics",
    generalAims: [
      "Develop understanding of basic physics concepts and principles",
      "Apply physics knowledge to everyday life situations",
      "Develop scientific skills: observation, measurement, analysis",
      "Prepare for higher studies in physics and related disciplines",
      "Appreciate the role of physics in technology and development"
    ],
    recommendedTextbooks: [
      "New School Physics by M.W. Anyakoha",
      "Senior Secondary Physics by P.N. Okeke",
      "Comprehensive Certificate Physics by Olumuyiwa Awe",
      "Exam Focus Physics by I. Ojo",
      "Essential Principles of Physics by J.O. Otuka"
    ],
    sections: {
      "Mechanics": {
        topics: [
          {
            name: "Motion",
            subtopics: ["Types of motion", "Equations of motion", "Projectile motion", "Circular motion", "Relative motion"],
            objectives: [
              "Distinguish between scalar and vector quantities",
              "Apply equations of uniformly accelerated motion",
              "Analyze projectile motion problems",
              "Calculate centripetal force and acceleration"
            ],
            content: "Equations of motion: v = u + at, s = ut + ½at², v² = u² + 2as. For projectile: horizontal velocity is constant, vertical motion has acceleration g. Centripetal acceleration a = v²/r."
          },
          {
            name: "Force and Newton's Laws",
            subtopics: ["Types of forces", "Newton's laws", "Friction", "Equilibrium"],
            objectives: [
              "State and apply Newton's laws of motion",
              "Calculate frictional forces",
              "Analyze equilibrium conditions",
              "Solve problems on forces"
            ],
            content: "Newton's Laws: 1st - body remains at rest or uniform motion unless acted on by force. 2nd - F = ma. 3rd - action equals reaction. Friction: f = μN."
          },
          {
            name: "Work, Energy and Power",
            subtopics: ["Work done by force", "Kinetic and potential energy", "Conservation of energy", "Power and efficiency"],
            objectives: [
              "Calculate work done by a force",
              "Apply kinetic and potential energy formulas",
              "Apply law of conservation of energy",
              "Calculate power and efficiency"
            ],
            content: "Work W = Fs cos θ. KE = ½mv². PE = mgh. Conservation: Total mechanical energy is constant in absence of friction. Power P = W/t = Fv. Efficiency = (useful output/input) × 100%."
          },
          {
            name: "Momentum and Impulse",
            subtopics: ["Linear momentum", "Impulse-momentum theorem", "Conservation of momentum", "Collisions"],
            objectives: [
              "Calculate momentum and impulse",
              "Apply conservation of momentum",
              "Distinguish elastic and inelastic collisions",
              "Solve collision problems"
            ],
            content: "Momentum p = mv. Impulse I = Ft = Δp. Conservation: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂. Elastic collisions conserve KE; inelastic don't."
          },
          {
            name: "Simple Machines",
            subtopics: ["Types of machines", "Mechanical advantage", "Velocity ratio", "Efficiency of machines"],
            objectives: [
              "Identify types of simple machines",
              "Calculate MA, VR, and efficiency",
              "Analyze lever, pulley, wheel-axle systems",
              "Apply machine principles"
            ],
            content: "MA = Load/Effort. VR = distance by effort/distance by load. Efficiency = (MA/VR) × 100%. Levers, pulleys, inclined planes, screws, wheel and axle."
          }
        ]
      },
      "Heat and Thermodynamics": {
        topics: [
          {
            name: "Temperature and Heat",
            subtopics: ["Temperature scales", "Thermometers", "Heat capacity", "Latent heat"],
            objectives: [
              "Convert between temperature scales",
              "Explain working of thermometers",
              "Calculate heat using specific heat capacity",
              "Apply latent heat in phase changes"
            ],
            content: "C = (F-32)×5/9. K = C + 273. Q = mcΔθ for temperature change. Q = mL for phase change. Specific heat capacity c measured in J/kg·K."
          },
          {
            name: "Gas Laws",
            subtopics: ["Boyle's law", "Charles's law", "Pressure law", "General gas equation", "Kinetic theory"],
            objectives: [
              "State and apply gas laws",
              "Use general gas equation",
              "Explain kinetic theory of gases",
              "Solve gas law problems"
            ],
            content: "Boyle: PV = constant (at constant T). Charles: V/T = constant (at constant P). General: P₁V₁/T₁ = P₂V₂/T₂. Kinetic theory explains gas behavior through molecular motion."
          },
          {
            name: "Heat Transfer",
            subtopics: ["Conduction", "Convection", "Radiation", "Applications"],
            objectives: [
              "Distinguish modes of heat transfer",
              "Explain factors affecting conduction",
              "Describe convection currents",
              "Apply Stefan's law for radiation"
            ],
            content: "Conduction: through solids, rate depends on temperature gradient, area, length, conductivity. Convection: in fluids, natural and forced. Radiation: no medium required, Stefan's law P = σAT⁴."
          },
          {
            name: "Expansion",
            subtopics: ["Linear expansion", "Area expansion", "Volume expansion", "Anomalous expansion of water"],
            objectives: [
              "Calculate linear expansion of solids",
              "Relate linear, area, volume expansion",
              "Explain anomalous expansion of water",
              "Apply expansion to real situations"
            ],
            content: "Linear: ΔL = L₀αΔθ. Area: ΔA = A₀(2α)Δθ = A₀βΔθ. Volume: ΔV = V₀(3α)Δθ = V₀γΔθ. Water densest at 4°C."
          }
        ]
      },
      "Waves and Optics": {
        topics: [
          {
            name: "Wave Motion",
            subtopics: ["Wave types", "Wave properties", "Wave equation", "Superposition"],
            objectives: [
              "Classify waves (transverse, longitudinal)",
              "Define wave properties (amplitude, frequency, wavelength)",
              "Apply wave equation v = fλ",
              "Explain superposition and interference"
            ],
            content: "Transverse: vibration perpendicular to propagation. Longitudinal: parallel. v = fλ. Superposition: waves add algebraically. Interference: constructive and destructive."
          },
          {
            name: "Sound Waves",
            subtopics: ["Properties of sound", "Speed of sound", "Resonance", "Musical instruments"],
            objectives: [
              "Describe properties of sound waves",
              "Calculate speed of sound in different media",
              "Explain resonance in pipes and strings",
              "Analyze musical notes"
            ],
            content: "Sound is longitudinal, needs medium. Speed depends on medium (faster in solids). Resonance: vibrating air columns. Frequency determines pitch, amplitude determines loudness."
          },
          {
            name: "Light: Reflection and Refraction",
            subtopics: ["Laws of reflection", "Plane and curved mirrors", "Laws of refraction", "Lenses"],
            objectives: [
              "Apply laws of reflection",
              "Locate images in mirrors",
              "Apply Snell's law of refraction",
              "Calculate lens power and magnification"
            ],
            content: "Reflection: angle of incidence = angle of reflection. Mirror formula: 1/f = 1/u + 1/v. Snell's law: n₁sin i = n₂sin r. Lens formula same as mirror. Power P = 1/f (in diopters)."
          },
          {
            name: "Optical Instruments",
            subtopics: ["Microscope", "Telescope", "Camera", "Human eye"],
            objectives: [
              "Explain working of optical instruments",
              "Calculate magnifying power",
              "Understand image formation",
              "Explain defects of vision and corrections"
            ],
            content: "Simple microscope uses convex lens. Compound microscope has objective and eyepiece. Eye defects: myopia (concave lens), hyperopia (convex lens), astigmatism (cylindrical lens)."
          }
        ]
      },
      "Electricity and Magnetism": {
        topics: [
          {
            name: "Electrostatics",
            subtopics: ["Electric charge", "Coulomb's law", "Electric field", "Capacitors"],
            objectives: [
              "Explain properties of electric charge",
              "Apply Coulomb's law",
              "Calculate electric field strength",
              "Analyze capacitor circuits"
            ],
            content: "Coulomb's law: F = kQ₁Q₂/r². Electric field E = F/q = kQ/r². Capacitance C = Q/V. Parallel: C = C₁ + C₂. Series: 1/C = 1/C₁ + 1/C₂. Energy = ½CV²."
          },
          {
            name: "Current Electricity",
            subtopics: ["Electric current", "Ohm's law", "Resistors in circuits", "Electrical power"],
            objectives: [
              "Define current and measure it",
              "Apply Ohm's law",
              "Calculate effective resistance",
              "Calculate electrical energy and power"
            ],
            content: "I = Q/t. Ohm's law: V = IR. Series: R = R₁ + R₂. Parallel: 1/R = 1/R₁ + 1/R₂. Power P = IV = I²R = V²/R. Energy E = Pt."
          },
          {
            name: "Electromagnetism",
            subtopics: ["Magnetic fields", "Electromagnetic induction", "Transformers", "Motors and generators"],
            objectives: [
              "Describe magnetic field patterns",
              "Apply Faraday's law of induction",
              "Calculate transformer ratios",
              "Explain motors and generators"
            ],
            content: "Faraday's law: EMF = -NdΦ/dt. Transformer: V₁/V₂ = N₁/N₂. Step-up increases voltage, step-down decreases. Efficiency: V₁I₁ = V₂I₂ for ideal transformer."
          }
        ]
      },
      "Modern Physics": {
        topics: [
          {
            name: "Photoelectric Effect",
            subtopics: ["Photon energy", "Work function", "Einstein's equation", "Applications"],
            objectives: [
              "Explain photoelectric effect",
              "Apply Einstein's photoelectric equation",
              "Calculate threshold frequency",
              "Describe applications"
            ],
            content: "E = hf (photon energy). Einstein's equation: hf = W + ½mv²max. Threshold frequency f₀ = W/h. Photoelectric effect shows particle nature of light."
          },
          {
            name: "Atomic Structure",
            subtopics: ["Atomic models", "Energy levels", "Emission spectra", "X-rays"],
            objectives: [
              "Describe atomic models",
              "Explain energy level transitions",
              "Analyze line spectra",
              "Explain X-ray production"
            ],
            content: "Bohr model: electrons in discrete orbits. E = hf for transition between levels. Line spectra are unique atomic fingerprints. X-rays from decelerated electrons."
          },
          {
            name: "Nuclear Physics",
            subtopics: ["Radioactivity", "Types of radiation", "Half-life", "Nuclear reactions"],
            objectives: [
              "Describe types of radioactive emissions",
              "Calculate half-life and decay",
              "Write nuclear equations",
              "Explain fission and fusion"
            ],
            content: "Alpha (²He), beta (electron), gamma (photon). N = N₀(½)^(t/T½). Mass-energy: E = mc². Fission splits heavy nuclei; fusion joins light nuclei."
          }
        ]
      }
    }
  },
  "chemistry": {
    name: "Chemistry",
    generalAims: [
      "Develop understanding of chemical concepts and principles",
      "Apply chemistry knowledge to everyday situations",
      "Develop practical skills in handling chemicals and equipment",
      "Prepare for higher studies in chemistry and related fields",
      "Appreciate the role of chemistry in industry and environment"
    ],
    recommendedTextbooks: [
      "New School Chemistry by Osei Yaw Ababio",
      "Comprehensive Certificate Chemistry by G.N.C. Ohia",
      "Essential Chemistry for SSS by I.A. Odesina",
      "Exam Focus Chemistry by J.E. Ameh",
      "Modern Chemistry for SSS by E.N. Uche"
    ],
    sections: {
      "Atomic Structure and Bonding": {
        topics: [
          {
            name: "Atomic Structure",
            subtopics: ["Subatomic particles", "Electronic configuration", "Atomic number and mass number", "Isotopes"],
            objectives: [
              "Describe atomic structure",
              "Write electronic configurations",
              "Calculate atomic and mass numbers",
              "Explain isotopes and their uses"
            ],
            content: "Atom: protons (+) and neutrons (neutral) in nucleus, electrons (-) in shells. Atomic number Z = protons. Mass number A = protons + neutrons. Isotopes have same Z, different A."
          },
          {
            name: "Periodic Table",
            subtopics: ["Periods and groups", "Periodic trends", "Properties of elements", "Classification"],
            objectives: [
              "Describe organization of periodic table",
              "Explain periodic trends",
              "Predict element properties from position",
              "Classify elements"
            ],
            content: "Periods (horizontal) show increasing atomic number. Groups (vertical) have similar properties. Trends: atomic radius decreases across period, increases down group. Electronegativity increases across, decreases down."
          },
          {
            name: "Chemical Bonding",
            subtopics: ["Ionic bonding", "Covalent bonding", "Metallic bonding", "Van der Waals forces"],
            objectives: [
              "Explain formation of ionic bonds",
              "Draw dot-cross diagrams for covalent bonds",
              "Describe metallic bonding",
              "Compare bond types"
            ],
            content: "Ionic: electron transfer, metal + non-metal. Covalent: electron sharing, non-metals. Metallic: sea of electrons, metals. Properties depend on bond type."
          }
        ]
      },
      "Stoichiometry and States of Matter": {
        topics: [
          {
            name: "Chemical Calculations",
            subtopics: ["Mole concept", "Molar mass", "Stoichiometry", "Limiting reagent"],
            objectives: [
              "Apply mole concept",
              "Calculate molar mass",
              "Perform stoichiometric calculations",
              "Identify limiting reagent"
            ],
            content: "1 mole = 6.02 × 10²³ particles. Molar mass in g/mol equals relative atomic mass. n = m/M. For gases at STP: V = 22.4n liters. Balance equations before calculations."
          },
          {
            name: "Gas Laws",
            subtopics: ["Ideal gas behavior", "Gas law equations", "Dalton's law", "Graham's law"],
            objectives: [
              "Apply ideal gas equation PV = nRT",
              "Use combined gas law",
              "Apply Dalton's law of partial pressures",
              "Apply Graham's law of diffusion"
            ],
            content: "PV = nRT (R = 8.314 J/mol·K). Dalton: P_total = P₁ + P₂ + ... Graham: rate ∝ 1/√M, so r₁/r₂ = √(M₂/M₁)."
          },
          {
            name: "Solutions",
            subtopics: ["Types of solutions", "Concentration", "Solubility", "Colligative properties"],
            objectives: [
              "Distinguish solution types",
              "Calculate concentration (molarity, molality)",
              "Explain factors affecting solubility",
              "Describe colligative properties"
            ],
            content: "Molarity M = moles/L. Molality m = moles/kg. Solubility affected by temperature, pressure (gases), nature of solute/solvent. Colligative properties depend on particle number, not type."
          }
        ]
      },
      "Organic Chemistry": {
        topics: [
          {
            name: "Hydrocarbons",
            subtopics: ["Alkanes", "Alkenes", "Alkynes", "Aromatic hydrocarbons"],
            objectives: [
              "Name and draw hydrocarbons",
              "Describe properties and reactions",
              "Distinguish saturated and unsaturated",
              "Explain aromaticity"
            ],
            content: "Alkanes: CₙH₂ₙ₊₂, saturated, substitution reactions. Alkenes: CₙH₂ₙ, unsaturated, addition reactions. Alkynes: CₙH₂ₙ₋₂, triple bond. Benzene C₆H₆ is aromatic."
          },
          {
            name: "Functional Groups",
            subtopics: ["Alcohols", "Carboxylic acids", "Esters", "Aldehydes and ketones"],
            objectives: [
              "Identify functional groups",
              "Name organic compounds",
              "Describe characteristic reactions",
              "Predict products"
            ],
            content: "Alcohols (-OH): oxidation to aldehydes/ketones/acids. Carboxylic acids (-COOH): react with alcohols to form esters. Aldehydes oxidize to acids; ketones resist oxidation."
          },
          {
            name: "Polymers",
            subtopics: ["Addition polymers", "Condensation polymers", "Natural polymers", "Uses of polymers"],
            objectives: [
              "Distinguish polymer types",
              "Write polymerization equations",
              "Identify monomers from polymers",
              "Describe polymer applications"
            ],
            content: "Addition: monomers add without losing atoms (polythene from ethene). Condensation: monomers join with loss of small molecule (nylon, polyester). Natural: proteins, starch, cellulose."
          }
        ]
      },
      "Physical Chemistry": {
        topics: [
          {
            name: "Reaction Kinetics",
            subtopics: ["Rate of reaction", "Factors affecting rate", "Rate equation", "Catalysis"],
            objectives: [
              "Define reaction rate",
              "Explain factors affecting rate",
              "Interpret rate-concentration graphs",
              "Explain catalysis"
            ],
            content: "Rate = change in concentration/time. Factors: concentration, temperature, surface area, catalyst. Collision theory: reactions need effective collisions. Activation energy Ea."
          },
          {
            name: "Chemical Equilibrium",
            subtopics: ["Reversible reactions", "Le Chatelier's principle", "Equilibrium constant", "Applications"],
            objectives: [
              "Explain dynamic equilibrium",
              "Apply Le Chatelier's principle",
              "Calculate equilibrium constant",
              "Predict equilibrium position"
            ],
            content: "At equilibrium: forward rate = backward rate. Kc = [products]/[reactants]. Le Chatelier: system opposes changes in concentration, pressure, temperature."
          },
          {
            name: "Electrochemistry",
            subtopics: ["Electrolysis", "Electrochemical cells", "Faraday's laws", "Applications"],
            objectives: [
              "Explain electrolysis process",
              "Describe electrochemical cells",
              "Apply Faraday's laws",
              "Calculate quantities in electrolysis"
            ],
            content: "Electrolysis: electrical energy → chemical change. Faraday's laws: m ∝ Q, m ∝ M/z. 1 Faraday = 96500 C deposits 1 mole of monovalent ion."
          }
        ]
      },
      "Environmental Chemistry": {
        topics: [
          {
            name: "Air and Water Pollution",
            subtopics: ["Pollutants", "Sources of pollution", "Effects", "Control measures"],
            objectives: [
              "Identify major pollutants",
              "Explain sources and effects",
              "Describe control measures",
              "Discuss environmental protection"
            ],
            content: "Air pollutants: CO, SO₂, NO₂, particulates. Water pollutants: heavy metals, organic waste, oil spills. Greenhouse effect, ozone depletion, acid rain. Prevention and remediation strategies."
          }
        ]
      }
    }
  },
  "biology": {
    name: "Biology",
    generalAims: [
      "Understand the structure and function of living organisms",
      "Appreciate the diversity of living things",
      "Develop practical skills in biological investigations",
      "Apply biological knowledge to health and environment",
      "Prepare for advanced studies in biology and medicine"
    ],
    recommendedTextbooks: [
      "Modern Biology for SSS by S.T. Ramalingam",
      "Essential Biology for SSS by M.C. Michael",
      "College Biology by Idodo Umeh",
      "Comprehensive Certificate Biology by E.N. Ndu",
      "A-Level Biology by Mary Jones"
    ],
    sections: {
      "Cell Biology": {
        topics: [
          {
            name: "Cell Structure",
            subtopics: ["Cell theory", "Plant vs animal cells", "Cell organelles", "Microscopy"],
            objectives: [
              "State cell theory",
              "Compare plant and animal cells",
              "Describe organelle functions",
              "Use microscopes effectively"
            ],
            content: "Cell theory: all living things made of cells, cells are basic unit of life, cells come from existing cells. Organelles: nucleus (genetic control), mitochondria (respiration), chloroplast (photosynthesis), ribosomes (protein synthesis)."
          },
          {
            name: "Cell Division",
            subtopics: ["Mitosis", "Meiosis", "Cell cycle", "Significance"],
            objectives: [
              "Describe stages of mitosis and meiosis",
              "Compare mitosis and meiosis",
              "Explain significance of cell division",
              "Relate to growth and reproduction"
            ],
            content: "Mitosis: 1 cell → 2 identical cells (growth, repair). Meiosis: 1 cell → 4 haploid cells (gamete formation). Mitosis maintains chromosome number; meiosis halves it."
          },
          {
            name: "Cell Physiology",
            subtopics: ["Diffusion", "Osmosis", "Active transport", "Enzymes"],
            objectives: [
              "Explain diffusion and osmosis",
              "Distinguish passive and active transport",
              "Describe enzyme action",
              "Explain factors affecting enzymes"
            ],
            content: "Diffusion: movement from high to low concentration. Osmosis: water movement through selectively permeable membrane. Enzymes: biological catalysts, specific, affected by pH, temperature, substrate concentration."
          }
        ]
      },
      "Genetics and Evolution": {
        topics: [
          {
            name: "Mendelian Genetics",
            subtopics: ["Mendel's laws", "Monohybrid crosses", "Dihybrid crosses", "Genetic ratios"],
            objectives: [
              "State Mendel's laws of inheritance",
              "Perform genetic crosses",
              "Calculate genetic ratios",
              "Solve genetics problems"
            ],
            content: "Law of segregation: alleles separate in gamete formation. Law of independent assortment: genes on different chromosomes assort independently. Monohybrid ratio 3:1, Dihybrid ratio 9:3:3:1."
          },
          {
            name: "Molecular Genetics",
            subtopics: ["DNA structure", "DNA replication", "Protein synthesis", "Mutations"],
            objectives: [
              "Describe DNA structure",
              "Explain replication",
              "Describe transcription and translation",
              "Explain types of mutations"
            ],
            content: "DNA: double helix, A-T, G-C base pairs. Replication: semiconservative. Transcription: DNA → mRNA. Translation: mRNA → protein at ribosomes. Mutations: gene or chromosome level changes."
          },
          {
            name: "Evolution",
            subtopics: ["Evidence for evolution", "Natural selection", "Speciation", "Human evolution"],
            objectives: [
              "Present evidence for evolution",
              "Explain natural selection",
              "Describe speciation processes",
              "Outline human evolution"
            ],
            content: "Evidence: fossils, comparative anatomy, embryology, molecular biology. Natural selection: variation + differential survival + reproduction. Speciation: geographic isolation leads to new species."
          }
        ]
      },
      "Ecology": {
        topics: [
          {
            name: "Ecosystem",
            subtopics: ["Components of ecosystem", "Food chains and webs", "Energy flow", "Nutrient cycling"],
            objectives: [
              "Identify ecosystem components",
              "Construct food chains and webs",
              "Explain energy flow through trophic levels",
              "Describe nutrient cycles"
            ],
            content: "Ecosystem = biotic + abiotic components. Energy flows: sun → producers → consumers → decomposers. Only 10% energy transferred between levels. Carbon, nitrogen, water cycles recycle matter."
          },
          {
            name: "Population Ecology",
            subtopics: ["Population characteristics", "Population growth", "Carrying capacity", "Limiting factors"],
            objectives: [
              "Define population parameters",
              "Describe growth curves",
              "Explain carrying capacity",
              "Identify limiting factors"
            ],
            content: "Population: size, density, distribution, growth rate. J-curve (exponential) vs S-curve (logistic). Carrying capacity: maximum sustainable population. Limiting factors: food, space, disease, predation."
          }
        ]
      },
      "Human Physiology": {
        topics: [
          {
            name: "Digestive System",
            subtopics: ["Digestive organs", "Digestion process", "Enzymes in digestion", "Absorption"],
            objectives: [
              "Describe digestive system structure",
              "Explain mechanical and chemical digestion",
              "List digestive enzymes and functions",
              "Describe nutrient absorption"
            ],
            content: "Mouth: amylase breaks starch. Stomach: pepsin breaks protein, HCl kills bacteria. Small intestine: bile emulsifies fats, pancreatic enzymes complete digestion. Villi absorb nutrients."
          },
          {
            name: "Circulatory System",
            subtopics: ["Heart structure", "Blood vessels", "Blood composition", "Circulation"],
            objectives: [
              "Describe heart structure and function",
              "Compare blood vessel types",
              "Explain blood composition",
              "Trace blood circulation"
            ],
            content: "Heart: 4 chambers, right side pumps to lungs, left to body. Arteries: thick walls, carry blood away. Veins: valves, return blood. Blood: plasma, RBC (O₂), WBC (immunity), platelets (clotting)."
          },
          {
            name: "Respiratory System",
            subtopics: ["Respiratory organs", "Breathing mechanism", "Gas exchange", "Respiratory disorders"],
            objectives: [
              "Describe respiratory system",
              "Explain ventilation mechanism",
              "Describe gas exchange in alveoli",
              "List respiratory disorders"
            ],
            content: "Air path: nose → pharynx → larynx → trachea → bronchi → bronchioles → alveoli. Gas exchange by diffusion across thin, moist alveolar walls. Disorders: asthma, bronchitis, emphysema."
          },
          {
            name: "Excretory System",
            subtopics: ["Kidney structure", "Urine formation", "Osmoregulation", "Excretory products"],
            objectives: [
              "Describe kidney structure",
              "Explain nephron function",
              "Describe osmoregulation",
              "List excretory products and organs"
            ],
            content: "Kidney: cortex, medulla, pelvis. Nephron: filtration (glomerulus), reabsorption (tubules), secretion. Urine: water, urea, salts. ADH controls water reabsorption."
          },
          {
            name: "Nervous System",
            subtopics: ["Neuron structure", "Nerve impulse", "Central nervous system", "Reflex action"],
            objectives: [
              "Describe neuron types",
              "Explain impulse transmission",
              "Describe brain and spinal cord",
              "Explain reflex arc"
            ],
            content: "Neurons: sensory, motor, relay. Impulse: electrical signal along axon, chemical at synapse. CNS: brain (control center) + spinal cord. Reflex: rapid, involuntary response."
          },
          {
            name: "Reproductive System",
            subtopics: ["Male reproductive system", "Female reproductive system", "Menstrual cycle", "Pregnancy"],
            objectives: [
              "Describe reproductive organs",
              "Explain gamete formation",
              "Describe menstrual cycle",
              "Outline stages of pregnancy"
            ],
            content: "Male: testes produce sperm. Female: ovaries produce eggs. Menstrual cycle: ~28 days, FSH, LH, estrogen, progesterone. Fertilization in oviduct, implantation in uterus."
          }
        ]
      }
    }
  },
  "agricultural_science": {
    name: "Agricultural Science",
    generalAims: [
      "Understand principles of crop and animal production",
      "Apply scientific methods to agricultural practices",
      "Appreciate the role of agriculture in economic development",
      "Develop skills in farm management and marketing",
      "Promote sustainable agricultural practices"
    ],
    recommendedTextbooks: [
      "Agricultural Science for SSS by L.A. Are",
      "Comprehensive Agricultural Science by J.U. Okorie",
      "Essential Agricultural Science by O.A. Falusi",
      "JAMB Agricultural Science by Exam Board",
      "Modern Agricultural Science by N.E. Egbuna"
    ],
    sections: {
      "Soil Science": {
        topics: [
          {
            name: "Soil Formation and Properties",
            subtopics: ["Soil formation processes", "Soil profile", "Soil types", "Soil properties"],
            objectives: [
              "Explain soil formation",
              "Describe soil profile horizons",
              "Classify soil types",
              "Explain physical and chemical properties"
            ],
            content: "Soil forms from weathering of rocks. Profile: O (organic), A (topsoil), B (subsoil), C (parent material), R (bedrock). Properties: texture, structure, pH, water-holding capacity."
          },
          {
            name: "Soil Fertility and Conservation",
            subtopics: ["Nutrient requirements", "Fertilizers", "Soil erosion", "Conservation practices"],
            objectives: [
              "Identify essential plant nutrients",
              "Compare organic and inorganic fertilizers",
              "Explain types of erosion",
              "Describe conservation methods"
            ],
            content: "Macronutrients: N, P, K. Micronutrients: Fe, Zn, etc. Fertilizers replace nutrients. Erosion by water, wind. Conservation: cover crops, terracing, contour plowing, mulching."
          }
        ]
      },
      "Crop Production": {
        topics: [
          {
            name: "Crop Cultivation",
            subtopics: ["Land preparation", "Planting methods", "Crop nutrition", "Pest and disease control"],
            objectives: [
              "Describe land preparation methods",
              "Explain planting techniques",
              "Apply fertilizers correctly",
              "Control crop pests and diseases"
            ],
            content: "Tillage: primary (plowing) and secondary (harrowing). Planting: broadcasting, drilling, transplanting. IPM integrates biological, cultural, chemical control methods."
          },
          {
            name: "Crop Improvement",
            subtopics: ["Selection", "Hybridization", "Biotechnology", "Seed certification"],
            objectives: [
              "Explain selection methods",
              "Describe hybridization process",
              "Discuss biotechnology applications",
              "Explain seed certification"
            ],
            content: "Selection: mass or pure line. Hybridization: cross-breeding for desired traits. GMOs for pest resistance, yield. Certified seeds ensure quality, purity, germination rate."
          }
        ]
      },
      "Animal Production": {
        topics: [
          {
            name: "Animal Husbandry",
            subtopics: ["Types of farm animals", "Breeding systems", "Animal nutrition", "Housing"],
            objectives: [
              "Classify farm animals",
              "Describe breeding methods",
              "Formulate animal rations",
              "Design animal housing"
            ],
            content: "Livestock: cattle, sheep, goats, pigs, poultry. Breeding: inbreeding, outbreeding, crossbreeding. Balanced rations include protein, energy, vitamins, minerals. Housing protects from weather, predators."
          },
          {
            name: "Animal Health",
            subtopics: ["Common diseases", "Disease prevention", "Vaccination", "Parasites"],
            objectives: [
              "Identify common animal diseases",
              "Explain prevention methods",
              "Describe vaccination programs",
              "Control parasites"
            ],
            content: "Diseases: viral (Newcastle, foot-and-mouth), bacterial (anthrax), parasitic (worms, ticks). Prevention: biosecurity, vaccination, deworming, hygiene. Quarantine infected animals."
          }
        ]
      },
      "Agricultural Economics": {
        topics: [
          {
            name: "Farm Management",
            subtopics: ["Farm records", "Farm budgeting", "Farm planning", "Marketing"],
            objectives: [
              "Maintain farm records",
              "Prepare farm budgets",
              "Make farm management decisions",
              "Market farm produce"
            ],
            content: "Records: inventory, production, financial. Budget estimates income and expenses. Marketing involves pricing, grading, storage, transportation. Farm size affects efficiency."
          },
          {
            name: "Agricultural Finance",
            subtopics: ["Sources of credit", "Agricultural banks", "Cooperatives", "Government programs"],
            objectives: [
              "Identify credit sources",
              "Explain role of agricultural banks",
              "Describe cooperative functions",
              "Discuss government support"
            ],
            content: "Credit sources: personal savings, banks, cooperatives, money lenders. Agricultural banks provide specialized loans. Cooperatives pool resources. Government subsidies, extension services."
          }
        ]
      }
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const syllabusEntries: any[] = [];
    let orderIndex = 0;

    for (const [subjectKey, subjectData] of Object.entries(scienceSyllabus)) {
      for (const [sectionName, sectionData] of Object.entries(subjectData.sections)) {
        for (const topic of sectionData.topics) {
          syllabusEntries.push({
            subject: subjectKey,
            topic: topic.name,
            subtopic: topic.subtopics?.join(', ') || null,
            objectives: topic.objectives,
            recommended_content: `${topic.content}\n\n📚 Recommended Textbooks:\n${subjectData.recommendedTextbooks.map((t, i) => `${i+1}. ${t}`).join('\n')}\n\n🎯 General Aims:\n${subjectData.generalAims.map((a, i) => `${i+1}. ${a}`).join('\n')}`,
            difficulty_level: 'medium',
            estimated_reading_time: 15,
            order_index: orderIndex++
          });
        }
      }
    }

    // Clear existing and insert new
    await supabase.from('jamb_syllabus').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { data, error } = await supabase
      .from('jamb_syllabus')
      .insert(syllabusEntries)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted: data?.length || 0,
        subjects: Object.keys(scienceSyllabus),
        message: `Seeded ${data?.length} syllabus topics across ${Object.keys(scienceSyllabus).length} science subjects`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
