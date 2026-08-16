import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS = [
  // 1. CELL STRUCTURE AND ORGANIZATION
  {
    subject: "biology",
    topic: "Cell Structure and Organization",
    subtopic: "Basic Concepts",
    title: "Cell Structure and Organization — The Unit of Life",
    learning_objectives: [
      "Describe the structure of plant and animal cells",
      "Distinguish between plant and animal cells",
      "Explain the functions of cell organelles",
      "Describe cell division (mitosis and meiosis)",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "cell_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Every living thing — from bacteria to blue whales — is made of cells. Your body has about 37 trillion cells, each one a tiny factory with specialized parts doing specific jobs. A cell is the smallest unit of life. Understanding cells is like understanding the building blocks of everything alive.",
          prediction_prompt: "Why do you think plant cells have a rigid cell wall while animal cells don't? What would happen if animal cells had cell walls?",
        },
      },
      {
        id: "cell_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Think of a cell like a city. The cell membrane is the city wall — it controls what comes in and out. The nucleus is city hall — it contains the DNA (the master plans). Mitochondria are power stations — they make energy. The endoplasmic reticulum is a highway system for moving materials. The Golgi apparatus is the post office — packaging and sending proteins.",
          analogy: "A cell is like a busy factory. The manager (nucleus) gives orders. Workers (ribosomes) build products (proteins). Power generators (mitochondria) supply energy. The warehouse (ER) stores materials. Delivery trucks (Golgi) send products to where they're needed. The security gate (cell membrane) decides what enters and exits.",
        },
      },
      {
        id: "cell_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "All cells have: cell membrane, cytoplasm, ribosomes, and DNA. Plant cells additionally have: cell wall, chloroplasts, and a large central vacuole. Animal cells may have lysosomes and centrioles. Eukaryotic cells have a membrane-bound nucleus; prokaryotic cells don't.",
          key_terms: [
            { term: "Cell Membrane", definition: "Semi-permeable phospholipid bilayer that controls movement of substances in and out" },
            { term: "Nucleus", definition: "Contains DNA; controls cell activities and reproduction" },
            { term: "Mitochondria", definition: "Site of aerobic respiration; produces ATP (energy currency)" },
            { term: "Chloroplast", definition: "Site of photosynthesis; contains chlorophyll (plant cells only)" },
          ],
        },
      },
      {
        id: "cell_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Plant cell = Animal cell + Cell wall + Chloroplasts + Large central vacuole",
          variables: [
            { name: "Cell wall", description: "Rigid cellulose layer outside cell membrane", unit: "none" },
            { name: "Chloroplasts", description: "Organelles for photosynthesis", unit: "count varies" },
            { name: "Large central vacuole", description: "Stores water; maintains turgor pressure", unit: "none" },
          ],
          when_to_use: "Use this comparison to distinguish between plant and animal cells in exams.",
          common_traps: [
            "Forgetting that plant cells ALSO have mitochondria (not just chloroplasts)",
            "Confusing the cell wall (plant) with the cell membrane (both)",
            "Not knowing that animal cells have lysosomes but plant cells usually don't",
          ],
          units_note: "Cell organelles are microscopic — measured in micrometres (μm).",
        },
      },
      {
        id: "cell_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "List 5 differences between plant and animal cells.",
          steps: [
            "Plant cells have a cell wall; animal cells don't",
            "Plant cells have chloroplasts; animal cells don't",
            "Plant cells have a large central vacuole; animal cells have small temporary vacuoles",
            "Plant cells are usually rectangular/fixed shape; animal cells are irregular",
            "Animal cells have centrioles and lysosomes; plant cells usually don't",
          ],
          answer: "See the 5 differences above. Plant cells are more rigid and specialized for photosynthesis.",
          explanation: "These differences reflect the different lifestyles of plants (sessile, photosynthetic) vs animals (mobile, heterotrophic).",
        },
      },
      {
        id: "cell_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Very common — cell biology is fundamental to JAMB Biology",
          typical_question: "Name 3 organelles found in plant cells but not in animal cells. State the function of each.",
          common_mistakes: [
            "Forgetting that both plant and animal cells have mitochondria",
            "Confusing lysosomes (animal) with peroxisomes (both)",
            "Not mentioning the function of each organelle",
          ],
          exam_tip: "For organelle questions: always state the name, location, and function. JAMB awards marks for each part.",
        },
      },
      {
        id: "cell_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "Which organelle is the 'powerhouse of the cell'?",
              options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
              correct_index: 2,
              explanation: "Mitochondria carry out aerobic respiration, producing ATP (energy) for the cell.",
            },
            {
              question: "Which structure is found in plant cells but NOT animal cells?",
              options: ["Cell membrane", "Nucleus", "Chloroplast", "Ribosome"],
              correct_index: 2,
              explanation: "Chloroplasts are unique to plant cells (and some protists). They carry out photosynthesis.",
            },
            {
              question: "What is the function of the cell membrane?",
              options: ["Support and protection", "Controls what enters and exits", "Contains DNA", "Makes proteins"],
              correct_index: 1,
              explanation: "The cell membrane is semi-permeable — it selectively controls the movement of substances.",
            },
          ],
        },
      },
      {
        id: "cell_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "All cells: membrane, cytoplasm, ribosomes, DNA",
            "Plant cells + cell wall, chloroplasts, large vacuole",
            "Mitochondria = energy (ATP), Nucleus = control centre",
            "Mitosis = growth, Meiosis = gametes",
          ],
          connections: [
            "Leads to: Tissues, organs, and organ systems",
            "Leads to: Cell division and genetics",
            "Builds on: Basic biology concepts",
          ],
        },
      },
      {
        id: "cell_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Cell Structure and Organization",
          min_score: 80,
          required_sections: ["cell_hook_01", "cell_intuitive_01", "cell_formal_01", "cell_formula_01", "cell_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 2. TRANSPORT IN PLANTS
  {
    subject: "biology",
    topic: "Transport in Plants",
    subtopic: "Basic Concepts",
    title: "Transport in Plants — How Water and Nutrients Move",
    learning_objectives: [
      "Explain the structure and function of xylem and phloem",
      "Describe the mechanisms of water transport (transpiration pull, root pressure)",
      "Explain translocation in the phloem",
      "Describe the factors affecting transpiration rate",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "transport_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "How does water get from the roots of a 100-metre tall tree all the way to the leaves? There's no pump — trees don't have hearts. The answer involves physics (evaporation, cohesion, tension) working together with biology. It's one of the most elegant systems in nature.",
          prediction_prompt: "If a tree's leaves are cut off, what do you think happens to water transport? Why?",
        },
      },
      {
        id: "transport_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Plants have two transport systems: xylem (one-way, from roots to leaves) carries water and dissolved minerals. Phloem (two-way) carries sugars from leaves to other parts. Water moves up the xylem mainly by transpiration pull — evaporation from leaves creates a suction force that pulls water up, like drinking through a straw.",
          analogy: "Think of the xylem as a drinking straw. When you suck on a straw, you create negative pressure that pulls liquid up. Trees do the same thing — evaporation from leaves (transpiration) creates a pull that draws water up from the roots. The water molecules stick together (cohesion), so the whole column moves as one.",
        },
      },
      {
        id: "transport_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Xylem transports water and minerals unidirectionally from roots to shoots. It consists of dead cells with thickened lignified walls. Phloem transports sugars bidirectionally (source to sink). It consists of living sieve tube elements and companion cells. Transpiration is the loss of water vapour from leaves through stomata.",
          key_terms: [
            { term: "Xylem", definition: "Vascular tissue that transports water and minerals upwards. Dead cells." },
            { term: "Phloem", definition: "Vascular tissue that transports sugars (translocation). Living cells." },
            { term: "Transpiration", definition: "Loss of water vapour from aerial parts of the plant through stomata" },
            { term: "Translocation", definition: "Movement of dissolved sugars in phloem from source to sink" },
          ],
        },
      },
      {
        id: "transport_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Water potential (Ψ) = Ψs + Ψp",
          variables: [
            { name: "Ψ", description: "Water potential", unit: "MPa" },
            { name: "Ψs", description: "Solute potential (always negative)", unit: "MPa" },
            { name: "Ψp", description: "Pressure potential (usually positive)", unit: "MPa" },
          ],
          when_to_use: "Water always moves from high water potential to low water potential. Use this to predict water movement in plant tissues.",
          common_traps: [
            "Water potential is always negative or zero — never positive",
            "Forgetting that pure water has Ψ = 0 (reference point)",
            "Confusing water potential with osmotic pressure",
          ],
          units_note: "Water potential is measured in megapascals (MPa). Pure water at atmospheric pressure = 0 MPa.",
        },
      },
      {
        id: "transport_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "Cell A has Ψ = −1.2 MPa. Cell B has Ψ = −0.8 MPa. In which direction will water move?",
          steps: [
            "Water moves from HIGH Ψ to LOW Ψ",
            "Cell B (−0.8) has higher Ψ than Cell A (−1.2)",
            "Water moves from Cell B to Cell A",
          ],
          answer: "Water moves from Cell B to Cell A (from −0.8 to −1.2 MPa).",
          explanation: "Remember: less negative = higher water potential. −0.8 is higher than −1.2. Water always moves down the water potential gradient.",
        },
      },
      {
        id: "transport_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Common — transport in plants is a regular JAMB Biology topic",
          typical_question: "Describe the process of transpiration and explain 3 factors that affect its rate.",
          common_mistakes: [
            "Confusing transpiration (water loss) with translocation (sugar transport)",
            "Forgetting that xylem transport requires no energy (passive)",
            "Not mentioning that phloem transport requires energy (active)",
          ],
          exam_tip: "For transpiration: mention stomata, guard cells, and the cohesion-tension theory. For factors: temperature, humidity, wind speed, light intensity.",
        },
      },
      {
        id: "transport_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "Which tissue transports water in plants?",
              options: ["Phloem", "Xylem", "Cambium", "Epidermis"],
              correct_index: 1,
              explanation: "Xylem transports water and dissolved minerals from roots to leaves.",
            },
            {
              question: "Transpiration is mainly through which structures?",
              options: ["Root hairs", "Stomata", "Xylem vessels", "Phloem sieve tubes"],
              correct_index: 1,
              explanation: "Stomata (pores on leaf surface) are the main sites of transpiration. Guard cells control their opening/closing.",
            },
            {
              question: "Which condition would INCREASE transpiration rate?",
              options: ["High humidity", "Low temperature", "Still air", "Bright light"],
              correct_index: 3,
              explanation: "Bright light opens stomata, increasing transpiration. High humidity, low temperature, and still air all decrease it.",
            },
          ],
        },
      },
      {
        id: "transport_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Xylem = water up (dead cells, passive), Phloem = sugars (living, active)",
            "Transpiration pull is the main force for water transport",
            "Water moves from high Ψ to low Ψ",
            "Transpiration rate affected by: light, temperature, humidity, wind",
          ],
          connections: [
            "Leads to: Photosynthesis (water is a reactant)",
            "Leads to: Plant nutrition and mineral uptake",
            "Builds on: Cell structure and osmosis",
          ],
        },
      },
      {
        id: "transport_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Transport in Plants",
          min_score: 80,
          required_sections: ["transport_hook_01", "transport_intuitive_01", "transport_formal_01", "transport_formula_01", "transport_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 3. NUTRITION
  {
    subject: "biology",
    topic: "Nutrition",
    subtopic: "Basic Concepts",
    title: "Nutrition — How Living Things Get Food",
    learning_objectives: [
      "Distinguish between autotrophic and heterotrophic nutrition",
      "Describe the structure and function of the human alimentary canal",
      "Explain the process of digestion and absorption",
      "Describe deficiency diseases and balanced diet",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "nutrition_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "You eat food every day, but do you know what happens after you swallow? Your body breaks down a sandwich into molecules small enough to absorb — and this process involves mechanical churning, chemical digestion, and absorption across 6+ metres of intestines. Understanding nutrition helps you know why balanced diets matter and why some foods are essential.",
          prediction_prompt: "Why do we need to eat both carbohydrates AND proteins? Can't one replace the other?",
        },
      },
      {
        id: "nutrition_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Autotrophs (plants) make their own food through photosynthesis. Heterotrophs (animals, fungi) must consume other organisms for food. In humans, food travels through the alimentary canal: mouth (mechanical + chemical digestion) → oesophagus → stomach (protein digestion) → small intestine (complete digestion + absorption) → large intestine (water absorption) → rectum.",
          analogy: "Think of digestion like a recycling plant. Food goes in as complex materials (big molecules). It's broken down step by step: teeth chop it up (mechanical), enzymes dissolve it (chemical), and the useful parts are absorbed (like sorting recyclables). Waste is discarded.",
        },
      },
      {
        id: "nutrition_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Carbohydrates provide energy (4 kcal/g). Proteins provide amino acids for growth and repair (4 kcal/g). Fats provide concentrated energy and insulation (9 kcal/g). Vitamins and minerals are needed in small amounts for metabolic functions. Fibre aids digestion. Water is essential for all body processes.",
          key_terms: [
            { term: "Carbohydrates", definition: "Energy source. Simple (glucose) and complex (starch). 4 kcal/g" },
            { term: "Proteins", definition: "Growth and repair. Made of amino acids. 4 kcal/g" },
            { term: "Fats", definition: "Energy storage, insulation. Most concentrated energy source. 9 kcal/g" },
            { term: "Vitamins", definition: "Organic compounds needed in small amounts for metabolic processes" },
          ],
        },
      },
      {
        id: "nutrition_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Enzyme + Substrate → Enzyme-Substrate Complex → Enzyme + Products",
          variables: [
            { name: "Enzyme", description: "Biological catalyst (protein)", unit: "none" },
            { name: "Substrate", description: "Molecule the enzyme acts on", unit: "none" },
            { name: "Products", description: "Molecules produced by the reaction", unit: "none" },
          ],
          when_to_use: "This describes how enzymes work in digestion. Each enzyme is specific to one substrate (lock and key model).",
          common_traps: [
            "Confusing mechanical digestion (physical breakdown) with chemical digestion (enzyme action)",
            "Forgetting that enzymes are specific — amylase only works on starch, pepsin only on protein",
            "Not knowing that enzymes have optimal temperatures and pH values",
          ],
          units_note: "Enzyme activity is often measured in units per minute (U/min). Optimal temperature ≈ 37°C for human enzymes.",
        },
      },
      {
        id: "nutrition_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "Trace the path of a piece of bread from mouth to absorption.",
          steps: [
            "Mouth: teeth chew (mechanical), salivary amylase breaks starch → maltose (chemical)",
            "Oesophagus: peristalsis moves bolus to stomach",
            "Stomach: pepsin digests proteins; HCl kills bacteria; no carbohydrate digestion",
            "Small intestine: pancreatic amylase continues starch digestion; maltase breaks maltose → glucose; lipase digests fats; bile emulsifies fats",
            "Ileum: glucose, amino acids, fatty acids absorbed through villi into blood",
          ],
          answer: "Mouth → Oesophagus → Stomach → Duodenum → Jejunum → Ileum (absorption). Bread's starch is broken down to glucose and absorbed in the ileum.",
          explanation: "Digestion is sequential — each organ has specific roles. Starch digestion begins in the mouth and completes in the small intestine.",
        },
      },
      {
        id: "nutrition_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Very common — nutrition and digestion are core JAMB Biology topics",
          typical_question: "Describe the role of bile in fat digestion. Why is bile not an enzyme?",
          common_mistakes: [
            "Saying bile 'digests' fat — it only emulsifies (breaks into small droplets)",
            "Forgetting that the small intestine is the main site of absorption",
            "Confusing villi (absorption) with microvilli (increased surface area on cells)",
          ],
          exam_tip: "For digestion questions: mention the organ, the enzyme, the substrate, and the product. Example: 'In the small intestine, lipase digests fats into fatty acids and glycerol.'",
        },
      },
      {
        id: "nutrition_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "Which enzyme begins protein digestion?",
              options: ["Amylase", "Pepsin", "Lipase", "Maltase"],
              correct_index: 1,
              explanation: "Pepsin (in the stomach) begins protein digestion, breaking proteins into peptides.",
            },
            {
              question: "What is the main function of the large intestine?",
              options: ["Digest food", "Absorb glucose", "Absorb water", "Produce enzymes"],
              correct_index: 2,
              explanation: "The large intestine absorbs water and salts from undigested food, forming faeces.",
            },
            {
              question: "Which nutrient provides the most energy per gram?",
              options: ["Carbohydrates", "Proteins", "Fats", "Vitamins"],
              correct_index: 2,
              explanation: "Fats provide 9 kcal/g, compared to 4 kcal/g for carbohydrates and proteins.",
            },
          ],
        },
      },
      {
        id: "nutrition_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Autotrophs make food; heterotrophs consume food",
            "Digestion: mechanical (teeth) + chemical (enzymes)",
            "Small intestine: main site of digestion and absorption",
            "Enzymes are specific biological catalysts",
          ],
          connections: [
            "Leads to: Enzyme kinetics and control",
            "Leads to: Nutritional diseases and deficiency",
            "Builds on: Cell biology and membrane transport",
          ],
        },
      },
      {
        id: "nutrition_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Nutrition",
          min_score: 80,
          required_sections: ["nutrition_hook_01", "nutrition_intuitive_01", "nutrition_formal_01", "nutrition_formula_01", "nutrition_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 4. RESPIRATION
  {
    subject: "biology",
    topic: "Respiration",
    subtopic: "Basic Concepts",
    title: "Respiration — How Cells Get Energy",
    learning_objectives: [
      "Distinguish between breathing and cellular respiration",
      "Explain the structure of the human respiratory system",
      "Describe aerobic and anaerobic respiration",
      "Explain the mechanism of breathing (inhalation and exhalation)",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "respiration_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "You breathe about 20,000 times a day without thinking about it. But respiration isn't just breathing — it's what happens inside your cells. Every cell in your body needs energy to function, and cellular respiration is how that energy is released from food. Breathing is just the first step — getting oxygen in and carbon dioxide out.",
          prediction_prompt: "Why do you breathe faster when you exercise? What's happening inside your cells that demands more oxygen?",
        },
      },
      {
        id: "respiration_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Breathing (ventilation) is the physical process of moving air in and out of lungs. Cellular respiration is the chemical process of breaking down glucose to release energy (ATP). They're connected: breathing provides the oxygen needed for cellular respiration and removes the carbon dioxide produced. Think of breathing as the delivery truck and respiration as the factory.",
          analogy: "Breathing is like opening the windows of a factory (letting air in). Respiration is like the factory's machines using that air to burn fuel and make products (energy). You need both — the windows AND the machines — for the factory to work.",
        },
      },
      {
        id: "respiration_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Aerobic respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP. Anaerobic respiration (in animals): C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ + 2 ATP. The respiratory system: nasal cavity → pharynx → larynx → trachea → bronchi → bronchioles → alveoli. Gas exchange occurs in alveoli by diffusion.",
          key_terms: [
            { term: "Aerobic Respiration", definition: "Complete oxidation of glucose using oxygen. Produces 38 ATP" },
            { term: "Anaerobic Respiration", definition: "Incomplete oxidation without oxygen. Produces 2 ATP (in animals: ethanol + CO₂)" },
            { term: "Alveoli", definition: "Tiny air sacs in lungs where gas exchange occurs" },
            { term: "Diaphragm", definition: "Muscle below lungs that contracts during inhalation" },
          ],
        },
      },
      {
        id: "respiration_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy (ATP)",
          variables: [
            { name: "C₆H₁₂O₆", description: "Glucose (fuel)", unit: "none" },
            { name: "O₂", description: "Oxygen (from breathing)", unit: "none" },
            { name: "CO₂", description: "Carbon dioxide (waste, exhaled)", unit: "none" },
            { name: "ATP", description: "Adenosine triphosphate (energy currency)", unit: "none" },
          ],
          when_to_use: "This is the overall equation for aerobic respiration. It occurs in mitochondria.",
          common_traps: [
            "Confusing respiration with breathing — respiration is cellular, breathing is physical",
            "Forgetting that anaerobic respiration produces much less ATP (2 vs 38)",
            "Confusing anaerobic respiration in animals (ethanol) with fermentation in yeast (also ethanol but different pathway)",
          ],
          units_note: "ATP is measured in moles or molecules. 1 mole of glucose yields approximately 38 moles of ATP.",
        },
      },
      {
        id: "respiration_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "Compare aerobic and anaerobic respiration in terms of oxygen use, ATP yield, and products.",
          steps: [
            "Aerobic: requires O₂, produces 38 ATP, products are CO₂ + H₂O",
            "Anaerobic (animals): no O₂, produces 2 ATP, products are ethanol + CO₂",
            "Anaerobic (plants/yeast): no O₂, produces 2 ATP, products are ethanol + CO₂",
          ],
          answer: "Aerobic: O₂ needed, 38 ATP, CO₂ + H₂O. Anaerobic: no O₂, 2 ATP, ethanol + CO₂.",
          explanation: "Aerobic respiration is 19× more efficient than anaerobic. This is why we breathe — to supply oxygen for efficient energy production.",
        },
      },
      {
        id: "respiration_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Very common — respiration is a core JAMB Biology topic",
          typical_question: "Describe the mechanism of inhalation in humans.",
          common_mistakes: [
            "Forgetting that the diaphragm contracts (flattens) during inhalation",
            "Confusing internal intercostal muscles (exhalation) with external (inhalation)",
            "Not mentioning that the thoracic volume increases and pressure decreases",
          ],
          exam_tip: "For breathing mechanism: mention diaphragm, intercostal muscles, thoracic volume, and pressure changes. Always explain the pressure gradient (air moves from high to low pressure).",
        },
      },
      {
        id: "respiration_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "Where does cellular respiration primarily occur?",
              options: ["Nucleus", "Ribosome", "Mitochondria", "Cell membrane"],
              correct_index: 2,
              explanation: "Mitochondria are the site of aerobic respiration, where ATP is produced.",
            },
            {
              question: "How many ATP molecules are produced by anaerobic respiration?",
              options: ["2", "4", "38", "76"],
              correct_index: 0,
              explanation: "Anaerobic respiration produces only 2 ATP per glucose molecule (vs 38 for aerobic).",
            },
            {
              question: "During inhalation, the diaphragm:",
              options: ["Relaxes and domes upward", "Contracts and flattens", "Does not move", "Contracts and moves upward"],
              correct_index: 1,
              explanation: "The diaphragm contracts and flattens, increasing thoracic volume and decreasing pressure, so air rushes in.",
            },
          ],
        },
      },
      {
        id: "respiration_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Breathing = physical; Respiration = cellular",
            "Aerobic: 38 ATP (efficient), Anaerobic: 2 ATP (inefficient)",
            "Inhalation: diaphragm contracts, volume↑, pressure↓",
            "Gas exchange in alveoli by diffusion",
          ],
          connections: [
            "Leads to: Circulatory system (transport of gases)",
            "Leads to: Exercise physiology",
            "Builds on: Cell biology and enzyme kinetics",
          ],
        },
      },
      {
        id: "respiration_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Respiration",
          min_score: 80,
          required_sections: ["respiration_hook_01", "respiration_intuitive_01", "respiration_formal_01", "respiration_formula_01", "respiration_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 5. EXCRETION
  {
    subject: "biology",
    topic: "Excretion",
    subtopic: "Basic Concepts",
    title: "Excretion — Removing Metabolic Wastes",
    learning_objectives: [
      "Define excretion and distinguish it from egestion",
      "Describe the structure and function of the human excretory system",
      "Explain the process of urine formation (filtration, reabsorption, secretion)",
      "Describe the role of the liver in excretion",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "excretion_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Your kidneys filter about 180 litres of blood every day, but you only pee about 1.5 litres. That means 99% of what's filtered is reabsorbed! Excretion isn't just about urine — your lungs excrete CO₂, your skin excretes sweat, and your liver processes toxins. It's your body's waste management system.",
          prediction_prompt: "Why do you think the body reabsorbs 99% of the filtered water? What would happen if it didn't?",
        },
      },
      {
        id: "excretion_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Excretion is the removal of metabolic waste products (produced by cells) from the body. This is different from egestion (removal of undigested food). The main excretory organs are: kidneys (urea, excess water, salts), lungs (CO₂, water vapour), skin (sweat: water, salts, urea), and liver (breaks down toxins, produces urea).",
          analogy: "Think of your body like a city. The kidneys are the water treatment plant — they filter waste from the blood. The lungs are the ventilation system — they remove gaseous waste (CO₂). The liver is the detox centre — it neutralizes poisons before sending them to the kidneys.",
        },
      },
      {
        id: "excretion_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "The excretory system: kidneys (filter blood, produce urine) → ureters (transport urine) → urinary bladder (stores urine) → urethra (expels urine). Nephron is the functional unit of the kidney. Urine formation: (1) Glomerular filtration (blood pressure forces fluid into Bowman's capsule), (2) Tubular reabsorption (useful substances returned to blood), (3) Tubular secretion (additional waste removed from blood).",
          key_terms: [
            { term: "Excretion", definition: "Removal of metabolic waste products from the body" },
            { term: "Nephron", definition: "Functional unit of the kidney; filters blood and forms urine" },
            { term: "Glomerulus", definition: "Network of capillaries in Bowman's capsule; site of filtration" },
            { term: "Urea", definition: "Nitrogenous waste from deamination of amino acids in the liver" },
          ],
        },
      },
      {
        id: "excretion_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Urine = Filtrate − Reabsorbed + Secreted",
          variables: [
            { name: "Filtrate", description: "Fluid filtered from blood at glomerulus", unit: "180 L/day" },
            { name: "Reabsorbed", description: "Useful substances returned to blood", unit: "~178.5 L/day" },
            { name: "Secreted", description: "Additional waste from blood into tubule", unit: "varies" },
            { name: "Urine", description: "Final waste product excreted", unit: "~1.5 L/day" },
          ],
          when_to_use: "Use this equation to understand why urine volume is much less than the filtrate volume.",
          common_traps: [
            "Confusing excretion (metabolic waste) with egestion (undigested food)",
            "Forgetting that the liver produces urea (from deamination), which the kidneys excrete",
            "Not understanding that the nephron reabsorbs 99% of water",
          ],
          units_note: "Glomerular filtration rate (GFR) ≈ 125 mL/min = 180 L/day. Urine output ≈ 1.5 L/day.",
        },
      },
      {
        id: "excretion_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "If the glomerular filtration rate is 125 mL/min, and a person produces 1.5 L of urine per day, what percentage of the filtrate is reabsorbed?",
          steps: [
            "Filtrate per day: 125 mL/min × 60 min × 24 h = 180,000 mL = 180 L",
            "Urine produced: 1.5 L",
            "Reabsorbed: 180 − 1.5 = 178.5 L",
            "Percentage reabsorbed: (178.5 / 180) × 100 = 99.17%",
          ],
          answer: "99.17% of the filtrate is reabsorbed.",
          explanation: "This demonstrates how efficiently the kidneys conserve water. Only about 0.83% of the filtrate becomes urine.",
        },
      },
      {
        id: "excretion_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Common — excretion and the excretory system are regular JAMB Biology topics",
          typical_question: "Describe the three stages of urine formation in the nephron.",
          common_mistakes: [
            "Confusing the three stages (filtration, reabsorption, secretion)",
            "Forgetting that the liver produces urea from amino acid deamination",
            "Not mentioning that the loop of Henle concentrates urine",
          ],
          exam_tip: "For nephron questions: know the parts (Bowman's capsule, proximal convoluted tubule, loop of Henle, distal convoluted tubule, collecting duct) and what happens at each part.",
        },
      },
      {
        id: "excretion_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "Which organ produces urea?",
              options: ["Kidney", "Liver", "Lung", "Skin"],
              correct_index: 1,
              explanation: "The liver produces urea through deamination of amino acids. The kidneys then excrete it in urine.",
            },
            {
              question: "What is the functional unit of the kidney?",
              options: ["Alveolus", "Nephron", "Villus", "Neuron"],
              correct_index: 1,
              explanation: "The nephron is the functional unit of the kidney. Each kidney has about 1 million nephrons.",
            },
            {
              question: "CO₂ is excreted through the:",
              options: ["Kidneys", "Lungs", "Skin", "Liver"],
              correct_index: 1,
              explanation: "CO₂ (a waste product of respiration) is excreted through the lungs during exhalation.",
            },
          ],
        },
      },
      {
        id: "excretion_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Excretion = metabolic waste removal (not egestion)",
            "Main organs: kidneys, lungs, skin, liver",
            "Nephron: filtration → reabsorption → secretion → urine",
            "99% of filtrate is reabsorbed",
          ],
          connections: [
            "Leads to: Osmoregulation and water balance",
            "Leads to: Kidney disorders and dialysis",
            "Builds on: Circulatory system and blood filtration",
          ],
        },
      },
      {
        id: "excretion_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Excretion",
          min_score: 80,
          required_sections: ["excretion_hook_01", "excretion_intuitive_01", "excretion_formal_01", "excretion_formula_01", "excretion_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 6. REPRODUCTION
  {
    subject: "biology",
    topic: "Reproduction",
    subtopic: "Basic Concepts",
    title: "Reproduction — Ensuring Species Survival",
    learning_objectives: [
      "Distinguish between sexual and asexual reproduction",
      "Describe human male and female reproductive systems",
      "Explain the menstrual cycle and hormonal control",
      "Describe fertilization and early embryonic development",
    ],
    difficulty_level: "medium",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "repro_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Reproduction is the reason life exists. Without it, every species would go extinct within a single lifetime. Nature has invented two main strategies: asexual (one parent, identical copies) and sexual (two parents, genetic variation). Understanding reproduction helps you know how life perpetuates and why genetic diversity matters.",
          prediction_prompt: "If asexual reproduction is faster and easier, why did sexual reproduction evolve? What advantage does it provide?",
        },
      },
      {
        id: "repro_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Asexual reproduction: one parent, no gametes, offspring are clones (genetically identical). Fast and efficient but no genetic variation. Sexual reproduction: two parents, gametes fuse (fertilization), offspring are genetically unique. Slower but creates variation — which helps species adapt to changing environments.",
          analogy: "Think of asexual reproduction like photocopying — every copy is identical. Sexual reproduction is like mixing paints — every combination is slightly different. In a stable environment, photocopying works great. But if the environment changes, having varied copies (sexual reproduction) gives some offspring a better chance of survival.",
        },
      },
      {
        id: "repro_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Male reproductive system: testes (produce sperm + testosterone), epididymis (sperm maturation), vas deferens (sperm transport), prostate/seminal vesicles (seminal fluid), penis. Female reproductive system: ovaries (produce eggs + oestrogen/progesterone), fallopian tubes (site of fertilization), uterus (embryo development), vagina (birth canal).",
          key_terms: [
            { term: "Gametes", definition: "Sex cells: sperm (male) and ovum (female)" },
            { term: "Fertilization", definition: "Fusion of sperm and ovum to form a zygote" },
            { term: "Menstrual Cycle", definition: "Monthly hormonal cycle preparing the uterus for pregnancy (~28 days)" },
            { term: "Ovulation", definition: "Release of a mature ovum from the ovary (day 14)" },
          ],
        },
      },
      {
        id: "repro_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Menstrual cycle: FSH → Oestrogen → LH surge → Ovulation → Progesterone → Menstruation",
          variables: [
            { name: "FSH", description: "Follicle-stimulating hormone — stimulates follicle growth", unit: "none" },
            { name: "LH", description: "Luteinizing hormone — triggers ovulation", unit: "none" },
            { name: "Oestrogen", description: "Thickens endometrium; inhibits FSH", unit: "none" },
            { name: "Progesterone", description: "Maintains endometrium; inhibits LH and FSH", unit: "none" },
          ],
          when_to_use: "Use this sequence to trace hormonal changes through the menstrual cycle.",
          common_traps: [
            "Confusing the hormones: FSH (follicle), LH (ovulation), Oestrogen (thickening), Progesterone (maintaining)",
            "Forgetting that menstruation occurs when progesterone drops (no pregnancy)",
            "Not knowing that negative feedback prevents multiple ovulations",
          ],
          units_note: "Hormones are measured in IU/L or pg/mL. The cycle averages 28 days but normal range is 21-35 days.",
        },
      },
      {
        id: "repro_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "Trace the hormonal events from day 1 to day 28 of the menstrual cycle.",
          steps: [
            "Days 1-5: Menstruation (progesterone drops, endometrium sheds)",
            "Days 1-13: FSH stimulates follicle growth; follicle produces oestrogen",
            "Day 13: High oestrogen triggers LH surge",
            "Day 14: LH surge triggers ovulation (ovum released)",
            "Days 15-28: Corpus luteum produces progesterone; endometrium thickens",
            "Day 28: No fertilization → corpus luteum degenerates → progesterone drops → menstruation begins",
          ],
          answer: "FSH (1-13) → Oestrogen (rising) → LH surge (13) → Ovulation (14) → Progesterone (15-28) → Menstruation (28/1)",
          explanation: "The cycle is controlled by feedback loops. Oestrogen initially inhibits FSH (negative feedback) but at high levels triggers LH (positive feedback). Progesterone inhibits both FSH and LH.",
        },
      },
      {
        id: "repro_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Very common — reproduction is a major JAMB Biology topic",
          typical_question: "Describe the role of FSH and LH in the menstrual cycle.",
          common_mistakes: [
            "Confusing FSH and LH roles",
            "Forgetting that oestrogen has both negative and positive feedback effects",
            "Not mentioning that the corpus luteum produces progesterone",
          ],
          exam_tip: "For hormonal control: name the hormone, where it's produced, its target, and its effect. JAMB loves asking about feedback mechanisms.",
        },
      },
      {
        id: "repro_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "What is the main advantage of sexual reproduction?",
              options: ["Faster reproduction", "No need for a mate", "Genetic variation", "Identical offspring"],
              correct_index: 2,
              explanation: "Sexual reproduction creates genetic variation, which helps species adapt to changing environments.",
            },
            {
              question: "Where does fertilization normally occur?",
              options: ["Ovary", "Uterus", "Fallopian tube", "Vagina"],
              correct_index: 2,
              explanation: "Fertilization normally occurs in the fallopian tube (oviduct), about 12-24 hours after ovulation.",
            },
            {
              question: "Which hormone triggers ovulation?",
              options: ["FSH", "Oestrogen", "LH", "Progesterone"],
              correct_index: 2,
              explanation: "The LH surge (sharp increase in LH) triggers the release of the ovum from the ovary.",
            },
          ],
        },
      },
      {
        id: "repro_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Asexual: one parent, clones, fast. Sexual: two parents, variation, slow",
            "Fertilization: sperm + ovum → zygote (in fallopian tube)",
            "Menstrual cycle: FSH → Oestrogen → LH → Ovulation → Progesterone",
            "Negative feedback controls hormone levels",
          ],
          connections: [
            "Leads to: Genetics and inheritance",
            "Leads to: Development of the embryo",
            "Builds on: Cell biology and hormones",
          ],
        },
      },
      {
        id: "repro_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Reproduction",
          min_score: 80,
          required_sections: ["repro_hook_01", "repro_intuitive_01", "repro_formal_01", "repro_formula_01", "repro_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 7. GENETICS
  {
    subject: "biology",
    topic: "Genetics",
    subtopic: "Basic Concepts",
    title: "Genetics — The Science of Heredity",
    learning_objectives: [
      "Define genotype and phenotype",
      "Explain Mendel's laws of inheritance",
      "Perform monohybrid and dihybrid crosses",
      "Describe patterns of inheritance (codominance, sex-linkage)",
    ],
    difficulty_level: "hard",
    estimated_minutes: 25,
    content_sections: [
      {
        id: "genetics_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Why do you have your mother's eyes but your father's nose? Why do some families have a history of sickle cell anaemia? Genetics is the code of life — written in DNA, passed from parents to offspring. Mendel discovered the basic rules with pea plants in the 1860s, and his work laid the foundation for modern genetics, forensics, and medicine.",
          prediction_prompt: "If both parents are carriers of the sickle cell gene (HbA HbS), what are the chances their child will have sickle cell disease?",
        },
      },
      {
        id: "genetics_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Every trait is controlled by genes, which come in pairs (one from each parent). Dominant genes (capital letters, e.g., B) mask recessive genes (lowercase, e.g., b). Genotype is the genetic makeup (BB, Bb, bb). Phenotype is the physical appearance (brown eyes, blue eyes). If B is dominant for brown eyes: BB = brown, Bb = brown, bb = blue.",
          analogy: "Think of genes like light switches. Dominant genes are 'on' switches — they override recessive 'off' switches. If you have at least one 'on' switch (BB or Bb), the light is on (brown eyes). Only if both switches are 'off' (bb) is the light off (blue eyes).",
        },
      },
      {
        id: "genetics_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Mendel's Law of Segregation: each gamete receives one allele from each gene pair. Law of Independent Assortment: genes for different traits are inherited independently. Monohybrid cross: one trait (e.g., Bb × Bb → 3:1 ratio). Dihybrid cross: two traits (e.g., BbRr × BbRr → 9:3:3:1 ratio).",
          key_terms: [
            { term: "Allele", definition: "Alternative form of a gene (e.g., B and b are alleles)" },
            { term: "Homozygous", definition: "Two identical alleles (BB or bb)" },
            { term: "Heterozygous", definition: "Two different alleles (Bb)" },
            { term: "Dominant", definition: "Allele that masks the recessive allele when present" },
          ],
        },
      },
      {
        id: "genetics_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Bb × Bb → 1 BB : 2 Bb : 1 bb (genotype) → 3:1 (phenotype)",
          variables: [
            { name: "B", description: "Dominant allele", unit: "none" },
            { name: "b", description: "Recessive allele", unit: "none" },
            { name: "BB", description: "Homozygous dominant", unit: "none" },
            { name: "Bb", description: "Heterozygous", unit: "none" },
            { name: "bb", description: "Homozygous recessive", unit: "none" },
          ],
          when_to_use: "Use Punnett squares for monohybrid crosses to predict offspring genotypes and phenotypes.",
          common_traps: [
            "Confusing genotype (genetic makeup) with phenotype (physical appearance)",
            "Forgetting that carriers are heterozygous (Bb) — they have the recessive allele but don't show it",
            "Not understanding that the 3:1 ratio applies to phenotype, not genotype",
          ],
          units_note: "Ratios are always expressed in simplest form. 1:2:1 is genotype, 3:1 is phenotype.",
        },
      },
      {
        id: "genetics_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "Both parents are carriers of sickle cell anaemia (HbA HbS). What is the probability of their child having sickle cell disease?",
          steps: [
            "Sickle cell is autosomal recessive: HbS HbS = disease, HbA HbS = carrier (normal), HbA HbA = normal",
            "Cross: HbA HbS × HbA HbS",
            "Punnett square: 1/4 HbA HbA (normal), 1/2 HbA HbS (carrier), 1/4 HbS HbS (disease)",
          ],
          answer: "25% chance of sickle cell disease, 50% chance of being a carrier, 25% chance of being completely normal.",
          explanation: "Both parents must be carriers for a child to have sickle cell disease. Each child has a 1/4 chance of inheriting both recessive alleles.",
        },
      },
      {
        id: "genetics_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Very common — genetics and inheritance are core JAMB Biology topics",
          typical_question: "A cross between two heterozygous tall plants (Tt × Tt) produces 200 offspring. How many would be expected to be short?",
          common_mistakes: [
            "Confusing the genotypic ratio (1:2:1) with phenotypic ratio (3:1)",
            "Forgetting that 'short' is recessive and only appears in tt genotype",
            "Not converting the ratio to actual numbers (1/4 of 200 = 50)",
          ],
          exam_tip: "For cross questions: draw the Punnett square, identify dominant/recessive, then calculate ratios. JAMB often asks for expected numbers from a given total.",
        },
      },
      {
        id: "genetics_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "In a cross BB × Bb, what percentage of offspring will show the dominant phenotype?",
              options: ["25%", "50%", "75%", "100%"],
              correct_index: 3,
              explanation: "All offspring (BB or Bb) have at least one dominant allele, so 100% show the dominant phenotype.",
            },
            {
              question: "What is the genotype of a carrier of a recessive disorder?",
              options: ["Homozygous dominant", "Homozygous recessive", "Heterozygous", "Cannot determine"],
              correct_index: 2,
              explanation: "A carrier has one dominant and one recessive allele (heterozygous) — they don't show the disorder but can pass it on.",
            },
            {
              question: "Mendel's Law of Segregation states that:",
              options: [
                "Genes are on chromosomes",
                "Each gamete receives one allele from each pair",
                "Traits are inherited independently",
                "Dominant genes are more common"
              ],
              correct_index: 1,
              explanation: "The Law of Segregation: during gamete formation, the two alleles of a gene separate so each gamete gets only one.",
            },
          ],
        },
      },
      {
        id: "genetics_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Genotype = genes (BB, Bb, bb). Phenotype = appearance",
            "Dominant masks recessive. Carrier = heterozygous",
            "Monohybrid cross: 3:1 phenotype ratio",
            "Mendel's laws: Segregation and Independent Assortment",
          ],
          connections: [
            "Leads to: Genetic disorders and screening",
            "Leads to: DNA and molecular genetics",
            "Builds on: Cell division (meiosis)",
          ],
        },
      },
      {
        id: "genetics_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Genetics",
          min_score: 80,
          required_sections: ["genetics_hook_01", "genetics_intuitive_01", "genetics_formal_01", "genetics_formula_01", "genetics_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 8. ECOLOGY
  {
    subject: "biology",
    topic: "Ecology",
    subtopic: "Basic Concepts",
    title: "Ecology — How Organisms Interact with Their Environment",
    learning_objectives: [
      "Define ecology and levels of ecological organization",
      "Describe biotic and abiotic factors in ecosystems",
      "Explain food chains, food webs, and energy flow",
      "Describe the carbon and nitrogen cycles",
    ],
    difficulty_level: "medium",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "ecology_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Every organism on Earth is connected. The plants you see, the insects you swat, the birds you hear — they're all part of an intricate web of relationships called an ecosystem. Ecology studies how organisms interact with each other and their environment. Understanding ecology helps us know why biodiversity matters and how human actions affect the planet.",
          prediction_prompt: "What would happen to an ecosystem if all the predators were removed? Can you think of a real example?",
        },
      },
      {
        id: "ecology_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Ecology has levels: individual → population → community → ecosystem → biome → biosphere. Biotic factors are living (predation, competition, symbiosis). Abiotic factors are non-living (temperature, water, soil, sunlight). Energy flows through ecosystems via food chains: producers → primary consumers → secondary consumers → decomposers.",
          analogy: "Think of an ecosystem like a giant economy. Producers (plants) are the factories making food. Consumers (animals) are the businesses buying and selling. Decomposers (fungi, bacteria) are the recyclers. Remove any group and the whole economy suffers.",
        },
      },
      {
        id: "ecology_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Producers (autotrophs) convert solar energy to chemical energy (photosynthesis). Consumers eat other organisms: primary (herbivores), secondary (carnivores), tertiary (top predators). Decomposers break down dead matter, recycling nutrients. Only 10% of energy transfers between trophic levels (10% rule).",
          key_terms: [
            { term: "Ecosystem", definition: "Community of living organisms + their physical environment" },
            { term: "Food Chain", definition: "Linear sequence of organisms through which energy and nutrients pass" },
            { term: "Trophic Level", definition: "Position in a food chain (producer = level 1)" },
            { term: "Decomposer", definition: "Organism that breaks down dead organic matter (fungi, bacteria)" },
          ],
        },
      },
      {
        id: "ecology_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Energy at level n+1 = 10% × Energy at level n",
          variables: [
            { name: "Level 1", description: "Producers (100% of solar energy captured)", unit: "kJ/m²/year" },
            { name: "Level 2", description: "Primary consumers (10% of level 1)", unit: "kJ/m²/year" },
            { name: "Level 3", description: "Secondary consumers (10% of level 2)", unit: "kJ/m²/year" },
          ],
          when_to_use: "Use the 10% rule to calculate energy available at each trophic level.",
          common_traps: [
            "Confusing energy flow (unidirectional) with nutrient cycling (circular)",
            "Forgetting that energy is lost as heat at each level",
            "Not understanding why food chains are rarely longer than 4-5 levels",
          ],
          units_note: "Energy is measured in kJ/m²/year. Only about 1% of solar energy is captured by producers.",
        },
      },
      {
        id: "ecology_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "If producers capture 10,000 kJ/m²/year of energy, how much is available to secondary consumers?",
          steps: [
            "Level 1 (Producers): 10,000 kJ/m²/year",
            "Level 2 (Primary consumers): 10,000 × 0.10 = 1,000 kJ/m²/year",
            "Level 3 (Secondary consumers): 1,000 × 0.10 = 100 kJ/m²/year",
          ],
          answer: "100 kJ/m²/year is available to secondary consumers.",
          explanation: "Only 10% of energy transfers between levels. This is why there are fewer top predators than herbivores — there's simply less energy available at higher trophic levels.",
        },
      },
      {
        id: "ecology_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Common — ecology and environmental biology are regular JAMB topics",
          typical_question: "Describe the carbon cycle and explain how human activities disrupt it.",
          common_mistakes: [
            "Confusing the carbon cycle with the nitrogen cycle",
            "Forgetting that combustion of fossil fuels releases stored carbon",
            "Not mentioning the role of decomposers in nutrient cycling",
          ],
          exam_tip: "For cycle diagrams: show all reservoirs (atmosphere, ocean, soil, organisms) and all processes (photosynthesis, respiration, combustion, decomposition).",
        },
      },
      {
        id: "ecology_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "What percentage of energy transfers between trophic levels?",
              options: ["1%", "10%", "50%", "100%"],
              correct_index: 1,
              explanation: "Only about 10% of energy transfers between trophic levels. The rest is lost as heat.",
            },
            {
              question: "Which organism is a decomposer?",
              options: ["Grass", "Rabbit", "Fungi", "Eagle"],
              correct_index: 2,
              explanation: "Fungi break down dead organic matter, recycling nutrients back into the ecosystem.",
            },
            {
              question: "The nitrogen cycle involves which process?",
              options: ["Photosynthesis", "Nitrogen fixation", "Transpiration", "Fermentation"],
              correct_index: 1,
              explanation: "Nitrogen fixation converts atmospheric N₂ into usable forms (NH₃) by bacteria in root nodules.",
            },
          ],
        },
      },
      {
        id: "ecology_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Levels: individual → population → community → ecosystem",
            "10% rule: only 10% of energy transfers between levels",
            "Biotic = living factors, Abiotic = non-living factors",
            "Nutrients cycle; energy flows one way",
          ],
          connections: [
            "Leads to: Environmental issues and conservation",
            "Leads to: Human impact on ecosystems",
            "Builds on: Photosynthesis and respiration",
          ],
        },
      },
      {
        id: "ecology_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Ecology",
          min_score: 80,
          required_sections: ["ecology_hook_01", "ecology_intuitive_01", "ecology_formal_01", "ecology_formula_01", "ecology_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 9. EVOLUTION
  {
    subject: "biology",
    topic: "Evolution",
    subtopic: "Basic Concepts",
    title: "Evolution — How Species Change Over Time",
    learning_objectives: [
      "Define evolution and natural selection",
      "Explain Darwin's theory of evolution by natural selection",
      "Describe evidence for evolution (fossils, anatomy, molecular)",
      "Distinguish between artificial and natural selection",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "evolution_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "There are over 8 million species on Earth, and they all share a common ancestor. How did one simple cell become everything from bacteria to blue whales? Darwin's answer: natural selection. It's beautifully simple — those with traits that help them survive and reproduce pass those traits on. Over millions of years, this creates new species.",
          prediction_prompt: "If a population of beetles lives on green leaves, and some are green while others are brown, which colour do you think would become more common over time? Why?",
        },
      },
      {
        id: "evolution_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Natural selection has four conditions: (1) Variation exists in a population. (2) Some variation is heritable. (3) More offspring are produced than can survive. (4) Those with favourable traits survive and reproduce more. Over time, the population changes. This is evolution — change in allele frequencies in a population over generations.",
          analogy: "Imagine a job interview with 100 candidates but only 1 opening. Some candidates are better qualified (variation). The employer picks the best (selection). If the successful candidate has children and trains them similarly, the next generation of applicants will be better qualified on average. Over many generations, the 'pool' of applicants improves.",
        },
      },
      {
        id: "evolution_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Evidence for evolution: (1) Fossil record shows gradual changes. (2) Comparative anatomy (homologous structures suggest common ancestry). (3) Molecular biology (DNA similarities between species). (4) Biogeography (island species resemble nearby mainland species). Artificial selection: humans breed organisms for desired traits (dog breeds, crop varieties).",
          key_terms: [
            { term: "Natural Selection", definition: "Differential survival and reproduction of individuals due to differences in phenotype" },
            { term: "Adaptation", definition: "Trait that increases an organism's fitness in its environment" },
            { term: "Speciation", definition: "Formation of new species through evolution" },
            { term: "Fossil", definition: "Preserved remains or traces of ancient organisms" },
          ],
        },
      },
      {
        id: "evolution_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Variation + Inheritance + Selection + Time = Evolution",
          variables: [
            { name: "Variation", description: "Differences between individuals", unit: "none" },
            { name: "Inheritance", description: "Traits passed from parents to offspring", unit: "none" },
            { name: "Selection", description: "Differential survival and reproduction", unit: "none" },
            { name: "Time", description: "Many generations required for significant change", unit: "generations" },
          ],
          when_to_use: "Use these four conditions to explain how natural selection leads to evolution.",
          common_traps: [
            "Evolution is not about individuals — populations evolve over generations",
            "Natural selection doesn't create variation — it acts on existing variation",
            "Evolution doesn't have a 'goal' — it's not directed toward perfection",
          ],
          units_note: "Evolution is measured in changes of allele frequencies over generations.",
        },
      },
      {
        id: "evolution_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "Explain how antibiotic resistance in bacteria demonstrates natural selection.",
          steps: [
            "Variation: some bacteria have genes that make them resistant to antibiotics",
            "Selection: when antibiotics are used, non-resistant bacteria die",
            "Inheritance: surviving resistant bacteria reproduce and pass on resistance genes",
            "Time: over many generations, the population becomes mostly resistant",
          ],
          answer: "Antibiotics create a selection pressure. Resistant bacteria survive and reproduce, leading to a resistant population.",
          explanation: "This is natural selection in real-time. It's why we need to complete full courses of antibiotics — stopping early allows resistant bacteria to survive and multiply.",
        },
      },
      {
        id: "evolution_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Common — evolution and natural selection are regular JAMB Biology topics",
          typical_question: "Explain Darwin's theory of evolution by natural selection with a suitable example.",
          common_mistakes: [
            "Saying 'survival of the fittest' means the strongest — it means best adapted",
            "Confusing artificial selection with natural selection",
            "Forgetting that evolution requires heritable variation",
          ],
          exam_tip: "For evolution questions: always mention the four conditions (variation, inheritance, selection, time) and give a specific example.",
        },
      },
      {
        id: "evolution_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "What is the main mechanism of evolution according to Darwin?",
              options: ["Genetic drift", "Natural selection", "Mutation", "Gene flow"],
              correct_index: 1,
              explanation: "Natural selection is the primary mechanism of evolution — differential survival and reproduction based on fitness.",
            },
            {
              question: "Antibiotic resistance in bacteria is an example of:",
              options: ["Artificial selection", "Natural selection", "Genetic drift", "Mutation"],
              correct_index: 1,
              explanation: "Antibiotics create a selection pressure. Resistant bacteria survive (natural selection), not humans choosing which bacteria survive (artificial selection).",
            },
            {
              question: "Which is evidence for evolution?",
              options: ["Fossils", "Photosynthesis", "Respiration", "Digestion"],
              correct_index: 0,
              explanation: "Fossils show how organisms have changed over millions of years, providing direct evidence for evolution.",
            },
          ],
        },
      },
      {
        id: "evolution_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Natural selection: variation + inheritance + selection + time",
            "Populations evolve, not individuals",
            "Evidence: fossils, anatomy, molecular, biogeography",
            "Artificial selection = humans choosing traits",
          ],
          connections: [
            "Leads to: Genetic drift and speciation",
            "Leads to: Human evolution",
            "Builds on: Genetics and Mendel's laws",
          ],
        },
      },
      {
        id: "evolution_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Evolution",
          min_score: 80,
          required_sections: ["evolution_hook_01", "evolution_intuitive_01", "evolution_formal_01", "evolution_formula_01", "evolution_worked_example_01"],
        },
      },
    ],
    version: 1,
    status: "published",
  },

  // 10. HOMEOSTASIS
  {
    subject: "biology",
    topic: "Homeostasis",
    subtopic: "Basic Concepts",
    title: "Homeostasis — Maintaining Internal Balance",
    learning_objectives: [
      "Define homeostasis and its importance",
      "Explain the role of receptors, coordination centres, and effectors",
      "Describe thermoregulation and osmoregulation",
      "Explain feedback mechanisms (negative and positive)",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "homeostasis_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Your body temperature stays around 37°C whether it's 5°C outside or 40°C. Your blood sugar stays stable even after eating a sugary meal. This isn't magic — it's homeostasis, the body's ability to maintain a stable internal environment despite external changes. Every system in your body works together to keep things balanced.",
          prediction_prompt: "If your body temperature rises to 40°C, what mechanisms do you think your body uses to cool down?",
        },
      },
      {
        id: "homeostasis_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Homeostasis works like a thermostat. (1) Receptors detect changes (stimuli). (2) Coordination centres (brain, spinal cord, pancreas) process information. (3) Effectors (muscles, glands) respond to restore balance. This is a negative feedback loop — the response opposes the change. Example: if temperature rises → sweat → cool down → temperature returns to normal.",
          analogy: "Think of homeostasis like a thermostat in your house. If the room gets too hot, the AC turns on. If it gets too cold, the heater turns on. The thermostat (receptor) detects the change, the control unit (brain) decides what to do, and the AC/heater (effectors) respond. The goal is always to return to the set temperature.",
        },
      },
      {
        id: "homeostasis_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Homeostasis maintains: body temperature (37°C), blood pH (7.4), blood glucose (3.9-5.6 mmol/L), water balance. Negative feedback: opposes the change (most common). Positive feedback: amplifies the change (less common, e.g., blood clotting, childbirth). Thermoregulation: hypothalamus detects temperature changes and triggers sweating/shivering.",
          key_terms: [
            { term: "Homeostasis", definition: "Maintenance of a stable internal environment despite external changes" },
            { term: "Negative Feedback", definition: "Response that opposes the change, restoring the set point" },
            { term: "Positive Feedback", definition: "Response that amplifies the change (rare in biology)" },
            { term: "Receptor", definition: "Detects changes in the environment (stimuli)" },
          ],
        },
      },
      {
        id: "homeostasis_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Stimulus → Receptor → Coordination Centre → Effector → Response (opposes stimulus)",
          variables: [
            { name: "Stimulus", description: "Change in the environment", unit: "none" },
            { name: "Receptor", description: "Detects the change", unit: "none" },
            { name: "Coordination Centre", description: "Processes information (brain/pancreas)", unit: "none" },
            { name: "Effector", description: "Carries out the response (muscle/gland)", unit: "none" },
            { name: "Response", description: "Opposes the original change", unit: "none" },
          ],
          when_to_use: "Use this pathway to describe any homeostatic mechanism (temperature, glucose, water balance).",
          common_traps: [
            "Confusing negative feedback (opposes change) with positive feedback (amplifies change)",
            "Forgetting that homeostasis involves all three components: receptor, coordinator, effector",
            "Not specifying the stimulus, receptor, coordinator, effector, and response in answers",
          ],
          units_note: "Homeostatic set points are ranges, not exact values (e.g., body temperature 36.5-37.5°C).",
        },
      },
      {
        id: "homeostasis_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          problem: "Describe how the body maintains blood glucose levels after a meal.",
          steps: [
            "Stimulus: blood glucose rises after eating",
            "Receptor: beta cells in pancreas detect high glucose",
            "Coordination centre: pancreas processes the information",
            "Effector: pancreas secretes insulin",
            "Response: insulin promotes glucose uptake by cells; blood glucose falls to normal",
          ],
          answer: "High glucose → pancreas (receptor) → insulin (effector) → cells take up glucose → glucose falls to normal.",
          explanation: "This is negative feedback. When glucose is too low, the pancreas releases glucagon instead, which promotes glycogen breakdown to raise glucose levels.",
        },
      },
      {
        id: "homeostasis_jamb_focus_01",
        type: "jamb_focus",
        order: 6,
        content: {
          frequency: "Common — homeostasis is a regular JAMB Biology topic",
          typical_question: "Explain how the body responds to a sudden drop in body temperature (cold exposure).",
          common_mistakes: [
            "Forgetting to mention all components: receptor, coordinator, effector",
            "Not specifying that the response is negative feedback",
            "Confusing thermoregulation with osmoregulation",
          ],
          exam_tip: "For homeostasis questions: always follow the pathway: Stimulus → Receptor → Coordination centre → Effector → Response. State clearly that it's negative feedback.",
        },
      },
      {
        id: "homeostasis_practice_01",
        type: "practice",
        order: 7,
        content: {
          questions: [
            {
              question: "What is the main role of the hypothalamus in homeostasis?",
              options: ["Digest food", "Regulate body temperature", "Produce insulin", "Filter blood"],
              correct_index: 1,
              explanation: "The hypothalamus is the body's thermostat — it detects temperature changes and coordinates responses.",
            },
            {
              question: "Negative feedback means the response:",
              options: ["Amplifies the change", "Opposes the change", "Has no effect", "Creates a new set point"],
              correct_index: 1,
              explanation: "Negative feedback opposes the original change, restoring the set point. It's the most common homeostatic mechanism.",
            },
            {
              question: "Which hormone raises blood glucose levels?",
              options: ["Insulin", "Glucagon", "Adrenaline", "Thyroxine"],
              correct_index: 1,
              explanation: "Glucagon (from pancreas) promotes glycogen breakdown into glucose, raising blood sugar levels.",
            },
          ],
        },
      },
      {
        id: "homeostasis_summary_01",
        type: "summary",
        order: 8,
        content: {
          key_takeaways: [
            "Homeostasis = stable internal environment",
            "Pathway: Stimulus → Receptor → Coordinator → Effector → Response",
            "Negative feedback opposes change; positive feedback amplifies it",
            "Key examples: temperature, glucose, water balance",
          ],
          connections: [
            "Leads to: Nervous and hormonal control",
            "Leads to: Kidney function and osmoregulation",
            "Builds on: Cell biology and enzyme kinetics",
          ],
        },
      },
      {
        id: "homeostasis_mastery_01",
        type: "mastery_check",
        order: 9,
        content: {
          description: "Demonstrate mastery of Homeostasis",
          min_score: 80,
          required_sections: ["homeostasis_hook_01", "homeostasis_intuitive_01", "homeostasis_formal_01", "homeostasis_formula_01", "homeostasis_worked_example_01"],
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
