import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS: any[] = [
  {
    subject: "agricultural_science",
    topic: "Introduction to Agriculture",
    subtopic: "Branches and Importance",
    title: "Agriculture — The Foundation of Civilization",
    learning_objectives: [
      "Define agriculture and its branches",
      "Explain the importance of agriculture to national development",
      "Identify types of farming systems",
      "Understand the role of agriculture in food security",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "ag_hook_01", type: "hook", order: 1, content: { text: "Without agriculture, there would be no food, no clothes (cotton), no furniture (timber), no medicines (herbs). Agriculture is the oldest and most important human activity. It feeds us, clothes us, and powers economies. Yet many people look down on farming.", prediction_prompt: "Can you go through a single day without using anything that comes from agriculture?" } },
      { id: "ag_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Agriculture = cultivation of crops and rearing of animals for human use. Branches: Crop science (arable farming — yam, cassava, rice). Animal science (livestock — cattle, poultry, fish). Agricultural economics (business side). Agricultural engineering (machines and tools). It provides food, raw materials, employment, and export revenue.", analogy: "Think of agriculture as the root of a tree. The trunk is industry, the branches are services, and the leaves are technology. Without strong roots (agriculture), the whole tree collapses." } },
      { id: "ag_formal_01", type: "formal_explanation", order: 3, content: { text: "Importance of agriculture: (1) Food security — provides food for the population. (2) Employment — employs ~35% of Nigeria's workforce. (3) Foreign exchange — cocoa, rubber, palm oil are major exports. (4) Raw materials — cotton, rubber, timber for industries. (5) Revenue — government earns from agricultural exports. Types of farming: subsistence (small-scale, family labour), commercial (large-scale, mechanized).", key_terms: [{ term: "Agriculture", definition: "The science and practice of cultivating crops and rearing animals for food, fibre, and other products" }, { term: "Subsistence Farming", definition: "Small-scale farming mainly to feed the family" }, { term: "Commercial Farming", definition: "Large-scale farming for sale and profit" }, { term: "Arable Farming", definition: "Farming that involves ploughing land and growing crops" }, { term: "Pastoral Farming", definition: "Farming that involves rearing livestock" }] } },
      { id: "ag_formula_01", type: "formula", order: 4, content: { formula: "Agricultural Output = f(Land, Labour, Capital, Technology, Management)", variables: [{ name: "Land", description: "Fertile soil, adequate rainfall, proper drainage" }, { name: "Labour", description: "Human effort — unskilled, semi-skilled, skilled" }, { name: "Capital", description: "Money for inputs — seeds, fertilizers, equipment" }, { name: "Technology", description: "Improved methods — irrigation, mechanization, improved seeds" }, { name: "Management", description: "Planning, organizing, and controlling farm activities" }], when_to_use: "When analyzing factors affecting agricultural productivity.", common_traps: ["Focusing only on land — labour, capital, and technology are equally important", "Not knowing the difference between subsistence and commercial farming", "Forgetting that management (planning) is crucial"], units_note: "Agriculture contributes about 24% of Nigeria's GDP but employs ~35% of the workforce." } },
      { id: "ag_practice_01", type: "worked_example", order: 5, content: { scenario: "Explain why agriculture is important to Nigeria's economy.", given: ["Nigeria's agricultural sector"], required: "Discuss the importance of agriculture", principle: "Use the five key areas: food, employment, exports, raw materials, revenue.", steps: [{ explanation: "Food security", calculation: "Agriculture provides food for 200+ million Nigerians" }, { explanation: "Employment", calculation: "~35% of the workforce depends on agriculture" }, { explanation: "Foreign exchange", calculation: "Cocoa, rubber, palm oil earn billions in exports" }, { explanation: "Raw materials", calculation: "Cotton, rubber, timber supply local industries" }, { explanation: "Government revenue", calculation: "Export duties and taxes from agriculture" }], answer: "Agriculture provides food, employment (35% of workforce), foreign exchange, raw materials, and government revenue.", check: "Without agriculture, Nigeria would depend entirely on food imports." } },
      { id: "ag_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Agriculture is only for uneducated people.", why_wrong: "Modern agriculture requires knowledge of biology, chemistry, economics, and technology. Agricultural scientists, engineers, and economists are highly educated professionals.", correct_model: "Agriculture is a science that requires education, technology, and management skills." } },
      { id: "ag_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests branches of agriculture, importance, and farming types.", trap: "JAMB may ask about specific agricultural programmes: Operation Feed the Nation (OFN), Green Revolution, Anchor Borrowers' Programme.", tip: "Know the branches of agriculture and Nigeria's agricultural history. Use specific examples.", related_topics: ["Food security", "Agricultural development", "Rural economy"] } },
      { id: "ag_memory_01", type: "memory_hook", order: 8, content: { text: "Agriculture = crops + animals. Branches: crop science, animal science, agricultural economics, agricultural engineering. Types: subsistence (family) + commercial (profit). Importance: food, jobs, exports, materials, revenue.", hook_type: "mnemonic" } },
      { id: "ag_reflection_01", type: "reflection", order: 9, content: { question: "How can agriculture be made attractive to young Nigerians?", expected_understanding: "Modernize farming with technology, make it profitable through better prices and processing, provide credit, and change the perception that farming is backward." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "Farming mainly to feed one's family is called:", options: [{ label: "A", text: "Commercial farming" }, { label: "B", text: "Subsistence farming" }, { label: "C", text: "Plantation farming" }, { label: "D", text: "Industrial farming" }], answer: "B", explanation: "Subsistence farming is small-scale farming to feed the family.", hints: ["Growing food to eat, not sell"] },
      { difficulty: "medium", question: "Which of the following is NOT a branch of agriculture?", options: [{ label: "A", text: "Crop science" }, { label: "B", text: "Animal science" }, { label: "C", text: "Computer science" }, { label: "D", text: "Agricultural economics" }], answer: "C", explanation: "Computer science is not a branch of agriculture. The branches include crop science, animal science, agricultural economics, and agricultural engineering.", hints: ["Which is unrelated to farming?"] },
      { difficulty: "jamb", question: "Agriculture contributes to national development by:", options: [{ label: "A", text: "Only providing food" }, { label: "B", text: "Providing food, employment, raw materials, and export revenue" }, { label: "C", text: "Only employing people" }, { label: "D", text: "Only earning foreign exchange" }], answer: "B", explanation: "Agriculture contributes in multiple ways: food, jobs, raw materials, exports, and government revenue.", hints: ["What are ALL the contributions?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["ag_hook_01", "ag_intuitive_01", "ag_formal_01", "ag_formula_01", "ag_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "agricultural_science",
    topic: "Crop Production",
    subtopic: "Soil and Tillage",
    title: "Crop Production — Growing the Food We Eat",
    learning_objectives: [
      "Describe the composition and properties of soil",
      "Explain soil conservation methods",
      "Understand tillage operations and their purposes",
      "Identify factors affecting crop growth",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "crp_hook_01", type: "hook", order: 1, content: { text: "All food comes from the soil. Rice grows in flooded fields, yam grows in mounds, cassava grows in ridges. The soil provides water, nutrients, and support for plant roots. Without healthy soil, there's no food. Yet soil is being lost to erosion, pollution, and poor farming practices every day.", prediction_prompt: "Why do farmers sometimes get lower yields from the same land year after year?" } },
      { id: "crp_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Soil is made of minerals, organic matter (decayed plants/animals), water, air, and living organisms. Healthy soil has the right balance of these. Tillage = preparing the land for planting: ploughing (turning the soil), harrowing (breaking clumps), ridging (making mounds). Different crops need different soil preparation.", analogy: "Think of soil like a cake recipe. Minerals = flour. Organic matter = sugar. Water and air = eggs and butter. Living organisms = the oven that makes it all work. If you leave out any ingredient, the cake (crop) won't turn out well." } },
      { id: "crp_formal_01", type: "formal_explanation", order: 3, content: { text: "Soil components: mineral particles (sand, silt, clay), organic matter, water, air, microorganisms. Soil types: sandy (drains fast, low nutrients), clay (retains water, compact), loam (balanced — best for farming). Soil conservation: crop rotation, mulching, contour ploughing, terracing, cover cropping, avoiding overgrazing.", key_terms: [{ term: "Soil", definition: "The top layer of earth's surface where plants grow" }, { term: "Loam", definition: "A balanced soil type with sand, silt, and clay — ideal for farming" }, { term: "Tillage", definition: "Preparing land for planting by ploughing, harrowing, and ridging" }, { term: "Crop Rotation", definition: "Growing different crops on the same land in successive seasons" }, { term: "Erosion", definition: "The wearing away of topsoil by wind, water, or farming activities" }] } },
      { id: "crp_formula_01", type: "formula", order: 4, content: { formula: "Soil Health = f(Organic matter, pH, Nutrients, Structure, Moisture)", variables: [{ name: "Organic Matter", description: "Decayed plant and animal material — improves soil structure and nutrients" }, { name: "pH", description: "Acidity or alkalinity — most crops prefer 6.0-7.0" }, { name: "Nutrients", description: "Nitrogen (N), Phosphorus (P), Potassium (K) — the big three" }, { name: "Structure", description: "How particles are arranged — affects root growth and water movement" }, { name: "Moisture", description: "Water content — too much or too little is bad" }], when_to_use: "When diagnosing soil problems or planning crop production.", common_traps: ["Not testing soil before applying fertilizer", "Ignoring organic matter — it's the key to healthy soil", "Over-tilling which destroys soil structure"], units_note: "Soil pH is measured on a scale of 0-14. Below 7 = acidic, above 7 = alkaline, 7 = neutral." } },
      { id: "crp_practice_01", type: "worked_example", order: 5, content: { scenario: "A farmer notices low crop yields despite using fertilizers. Suggest possible causes and solutions.", given: ["Low yields despite fertilizer use"], required: "Diagnose and solve the problem", principle: "Fertilizer alone doesn't guarantee good yields — other factors matter.", steps: [{ explanation: "Check soil pH", calculation: "If pH is too low (acidic) or too high (alkaline), plants can't absorb nutrients. Solution: apply lime (if acidic) or gypsum (if alkaline)" }, { explanation: "Check organic matter", calculation: "Low organic matter means poor soil structure. Solution: add compost or manure" }, { explanation: "Check water", calculation: "Too little or too much water affects nutrient uptake. Solution: improve drainage or irrigation" }, { explanation: "Check nutrients", calculation: "NPK fertilizer may not address all deficiencies. Solution: do soil test and apply specific nutrients" }], answer: "Possible causes: wrong pH, low organic matter, poor drainage, nutrient imbalance. Solution: soil testing, organic matter addition, proper drainage, targeted fertilization.", check: "Fertilizer is only one part of soil management — pH, organic matter, and water are equally important." } },
      { id: "crp_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Adding more fertilizer always increases yields.", why_wrong: "Excessive fertilizer can damage crops (burn roots), pollute water, and harm soil organisms. The right amount depends on soil test results.", correct_model: "Fertilizer should be applied based on soil test results, not just 'more is better'." } },
      { id: "crp_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests soil types, conservation methods, and tillage operations.", trap: "JAMB may ask about specific soil properties: texture vs structure, or types of erosion (gully, sheet, rill).", tip: "Know soil types (sand, clay, loam) and their properties. Know conservation methods and when to use each.", related_topics: ["Soil conservation", "Fertilizer types", "Crop management"] } },
      { id: "crp_memory_01", type: "memory_hook", order: 8, content: { text: "Soil = minerals + organic matter + water + air + organisms. Loam = best (sand + silt + clay). Conservation: rotation, mulching, terracing, cover crops. Tillage: plough, harrow, ridge.", hook_type: "mnemonic" } },
      { id: "crp_reflection_01", type: "reflection", order: 9, content: { question: "Why is soil conservation important for future food security?", expected_understanding: "Topsoil takes hundreds of years to form. If we lose it to erosion or degradation, future generations won't be able to grow food. Conservation ensures the land remains productive." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "The best soil type for farming is:", options: [{ label: "A", text: "Sandy soil" }, { label: "B", text: "Clay soil" }, { label: "C", text: "Loam soil" }, { label: "D", text: "Rocky soil" }], answer: "C", explanation: "Loam soil has a balanced mix of sand, silt, and clay — ideal for most crops.", hints: ["Which soil has the best balance?"] },
      { difficulty: "medium", question: "Crop rotation helps to:", options: [{ label: "A", text: "Increase soil erosion" }, { label: "B", text: "Maintain soil fertility and break pest cycles" }, { label: "C", text: "Reduce crop variety" }, { label: "D", text: "Increase the need for pesticides" }], answer: "B", explanation: "Crop rotation maintains soil fertility (different crops use different nutrients) and breaks pest and disease cycles.", hints: ["Why grow different crops on the same land?"] },
      { difficulty: "jamb", question: "Mulching helps to:", options: [{ label: "A", text: "Increase evaporation" }, { label: "B", text: "Conserve soil moisture and reduce erosion" }, { label: "C", text: "Kill beneficial organisms" }, { label: "D", text: "Increase soil temperature" }], answer: "B", explanation: "Mulching covers the soil surface, reducing evaporation and protecting against erosion.", hints: ["What does covering the soil do?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["crp_hook_01", "crp_intuitive_01", "crp_formal_01", "crp_formula_01", "crp_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "agricultural_science",
    topic: "Livestock Production",
    subtopic: "Animal Husbandry",
    title: "Livestock — Raising Animals for Food and Profit",
    learning_objectives: [
      "Identify major livestock in Nigeria",
      "Explain livestock management practices",
      "Understand animal nutrition and feeding",
      "Identify common livestock diseases and prevention",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "live_hook_01", type: "hook", order: 1, content: { text: "Nigeria has over 20 million cattle, 70 million goats, 40 million sheep, and millions of poultry. Livestock provides meat, milk, eggs, leather, and manure. But raising animals isn't just putting them in a field — it requires knowledge of nutrition, health, breeding, and housing.", prediction_prompt: "What are the challenges of raising cattle in northern Nigeria?" } },
      { id: "live_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Livestock management includes: housing (shelter from weather and predators), feeding (balanced diet for growth and production), breeding (selecting the best animals), health care (vaccination, deworming), and record keeping. Different animals have different needs: cattle need pasture, poultry need feed and water, fish need ponds.", analogy: "Think of raising livestock like raising children. They need proper shelter, nutritious food, regular health check-ups, and a safe environment. Neglect any of these, and they'll get sick or die." } },
      { id: "live_formal_01", type: "formal_explanation", order: 3, content: { text: "Major livestock in Nigeria: (1) Cattle — beef and dairy. (2) Poultry — eggs and meat. (3) Goats — meat and milk. (4) Sheep — meat and wool. (5) Fish — aquaculture. Management practices: housing (types: zero-grazing, free-range, semi-intensive), feeding (concentrates, roughages, supplements), breeding (natural and artificial insemination), disease control (vaccination, quarantine).", key_terms: [{ term: "Livestock", definition: "Domesticated animals raised for food, fibre, or other products" }, { term: "Zero-grazing", definition: "Keeping animals in confined areas and bringing food to them" }, { term: "Free-range", definition: "Allowing animals to roam freely and forage" }, { term: "Concentrates", definition: "High-energy feed like maize, groundnut cake, soybean" }, { term: "Roughage", definition: "Fibrous feed like grass, hay, and crop residues" }] } },
      { id: "live_formula_01", type: "formula", order: 4, content: { formula: "Animal Nutrition: Energy + Protein + Vitamins + Minerals + Water = Balanced Diet", variables: [{ name: "Energy", description: "From carbohydrates (maize, cassava) — for body functions and growth" }, { name: "Protein", description: "From groundnut, soybean, fish meal — for muscle and milk production" }, { name: "Vitamins", description: "From green vegetables, sunlight — for health and disease resistance" }, { name: "Minerals", description: "From salt licks, bone meal — for bone development and milk production" }, { name: "Water", description: "Essential for all body functions — animals need clean water daily" }], when_to_use: "When formulating animal feed or diagnosing nutritional problems.", common_traps: ["Feeding only one type of feed — animals need balanced nutrition", "Not providing clean water — water is the most important nutrient", "Ignoring minerals — deficiency causes poor growth and diseases"], units_note: "A dairy cow needs 50-100 litres of water per day. Poultry need 200-300ml per day." } },
      { id: "live_practice_01", type: "worked_example", order: 5, content: { scenario: "A poultry farmer notices that chickens are not laying eggs as expected. Suggest possible causes and solutions.", given: ["Low egg production in poultry"], required: "Diagnose and solve the problem", principle: "Egg production depends on nutrition, lighting, health, and stress management.", steps: [{ explanation: "Check nutrition", calculation: "Hens need 16-18% protein, calcium for eggshells. Solution: provide balanced poultry feed with calcium supplement" }, { explanation: "Check lighting", calculation: "Hens need 14-16 hours of light per day for egg production. Solution: provide artificial lighting in the coop" }, { explanation: "Check health", calculation: "Diseases like Newcastle reduce production. Solution: vaccinate regularly" }, { explanation: "Check stress", calculation: "Overcrowding, heat, and predators cause stress. Solution: reduce density, provide shade, secure the coop" }], answer: "Causes: poor nutrition, insufficient light, disease, stress. Solutions: balanced feed, 14-16 hours light, vaccination, proper housing.", check: "All four factors (nutrition, light, health, stress) affect egg production." } },
      { id: "live_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Animals can eat anything — they're not picky.", why_wrong: "Animals need specific nutrients in specific amounts. Feeding them random food can cause malnutrition, diseases, and death.", correct_model: "Livestock need balanced nutrition. Different animals have different dietary needs." } },
      { id: "live_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests livestock management, nutrition, and disease control.", trap: "JAMB may ask about specific diseases: Newcastle (poultry), anthrax (cattle), trypanosomiasis (tsetse fly disease).", tip: "Know the major livestock diseases and their control methods. Know the nutritional requirements of different animals.", related_topics: ["Animal health", "Feed formulation", "Livestock economics"] } },
      { id: "live_memory_01", type: "memory_hook", order: 8, content: { text: "Livestock = cattle, poultry, goats, sheep, fish. Needs: housing, feeding, breeding, health care. Feed: energy + protein + vitamins + minerals + water. Diseases: Newcastle, anthrax, trypanosomiasis.", hook_type: "mnemonic" } },
      { id: "live_reflection_01", type: "reflection", order: 9, content: { question: "What are the challenges of livestock farming in Nigeria?", expected_understanding: "Inadequate feed, disease outbreaks, poor infrastructure, insecurity (rustling), climate change, and limited access to credit and modern technology." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "Keeping animals in confined areas and bringing food to them is called:", options: [{ label: "A", text: "Free-range system" }, { label: "B", text: "Zero-grazing" }, { label: "C", text: "Nomadic farming" }, { label: "D", text: "Subsistence farming" }], answer: "B", explanation: "Zero-grazing confines animals in one area and feeds them there.", hints: ["Animals stay in one place"] },
      { difficulty: "medium", question: "The most important nutrient for livestock is:", options: [{ label: "A", text: "Protein" }, { label: "B", text: "Carbohydrates" }, { label: "C", text: "Water" }, { label: "D", text: "Vitamins" }], answer: "C", explanation: "Water is essential for all body functions. Animals can die faster from dehydration than from lack of food.", hints: ["What do animals need most urgently?"] },
      { difficulty: "jamb", question: "Trypanosomiasis in cattle is caused by:", options: [{ label: "A", text: "Bacteria" }, { label: "B", text: "Virus" }, { label: "C", text: "Tsetse fly bite" }, { label: "D", text: "Poor nutrition" }], answer: "C", explanation: "Trypanosomiasis (nagana) is transmitted by the tsetse fly and causes weight loss and death in cattle.", hints: ["Which insect transmits this disease?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["live_hook_01", "live_intuitive_01", "live_formal_01", "live_formula_01", "live_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "agricultural_science",
    topic: "Agricultural Economics",
    subtopic: "Farm Management",
    title: "Farm Management — Running Agriculture as a Business",
    learning_objectives: [
      "Explain the principles of farm management",
      "Understand farm records and their importance",
      "Calculate farm costs and returns",
      "Apply budgeting to farm planning",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "econ_hook_01", type: "hook", order: 1, content: { text: "A farmer harvests 50 bags of maize. Each bag costs ₦5,000 to produce and sells for ₦8,000. Total revenue: ₦400,000. Total cost: ₦250,000. Profit: ₦150,000. But wait — did the farmer account for the value of their own labour? What about the land they could have rented out? Farm management isn't just growing — it's calculating.", prediction_prompt: "If a farmer spends all day working on the farm but doesn't record anything, how will they know if they made a profit?" } },
      { id: "econ_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Farm management = planning, organizing, and controlling farm resources to achieve goals. Key principles: (1) Principle of substitution — use more of what's cheap, less of what's expensive. (2) Principle of diminishing returns — adding more input eventually gives less output. (3) Principle of opportunity cost — the value of the next best alternative given up.", analogy: "Think of farm management like running a shop. You need to know your costs, set your prices, keep records, and plan ahead. A shop that doesn't keep records will eventually run out of money — and so will a farm." } },
      { id: "econ_formal_01", type: "formal_explanation", order: 3, content: { text: "Farm records needed: (1) Production records — crops planted, yields, livestock numbers. (2) Financial records — income, expenses, profits. (3) Labour records — workers, hours, wages. (4) Inventory records — inputs, outputs, stock. Farm budgeting: estimated income and expenses for a planning period. Helps allocate resources and plan ahead.", key_terms: [{ term: "Farm Management", definition: "The process of planning, organizing, and controlling farm activities for maximum profit" }, { term: "Opportunity Cost", definition: "The value of the next best alternative given up when making a choice" }, { term: "Diminishing Returns", definition: "Adding more of one input while keeping others constant eventually gives less additional output" }, { term: "Farm Budget", definition: "A financial plan showing estimated income and expenses for a farming period" }] } },
      { id: "econ_formula_01", type: "formula", order: 4, content: { formula: "Farm Profit = Total Revenue − Total Cost. Total Cost = Fixed Costs + Variable Costs. Return on Investment = (Net Profit / Total Cost) × 100", variables: [{ name: "Total Revenue", description: "Quantity sold × Selling price" }, { name: "Fixed Costs", description: "Costs that don't change with output (land rent, equipment)" }, { name: "Variable Cost", description: "Costs that change with output (seeds, fertilizers, labour)" }, { name: "Net Profit", description: "Total revenue minus all costs (including opportunity costs)" }], when_to_use: "When evaluating farm profitability or planning farm activities.", common_traps: ["Forgetting to include opportunity costs (farmer's own labour)", "Not separating fixed and variable costs", "Confusing revenue with profit"], units_note: "Farm profit should include the opportunity cost of the farmer's labour and land." } },
      { id: "econ_practice_01", type: "worked_example", order: 5, content: { scenario: "A farmer plants yam on 1 hectare. Costs: land rent ₦50,000, seed yam ₦30,000, fertilizer ₦40,000, labour ₦60,000. Harvest: 100 bags. Selling price: ₦3,000/bag. Calculate profit and return on investment.", given: ["Total costs: ₦50,000 + ₦30,000 + ₦40,000 + ₦60,000 = ₦180,000", "Harvest: 100 bags × ₦3,000 = ₦300,000"], required: "Calculate profit and ROI", principle: "Profit = Revenue − Costs. ROI = (Profit / Cost) × 100", steps: [{ explanation: "Calculate total cost", calculation: "₦50,000 + ₦30,000 + ₦40,000 + ₦60,000 = ₦180,000" }, { explanation: "Calculate total revenue", calculation: "100 bags × ₦3,000 = ₦300,000" }, { explanation: "Calculate profit", calculation: "₦300,000 − ₦180,000 = ₦120,000" }, { explanation: "Calculate ROI", calculation: "(₦120,000 / ₦180,000) × 100 = 66.7%" }], answer: "Profit: ₦120,000. ROI: 66.7%.", check: "₦300,000 − ₦180,000 = ₦120,000. ₦120,000/₦180,000 = 66.7%." } },
      { id: "econ_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Revenue is the same as profit.", why_wrong: "Revenue is total money received. Profit is what's left after subtracting ALL costs. A farmer can have high revenue but low profit if costs are high.", correct_model: "Revenue − Costs = Profit. High revenue doesn't always mean high profit." } },
      { id: "econ_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests farm management principles, record keeping, and cost calculations.", trap: "JAMB may ask about opportunity cost — always consider what the farmer gives up (e.g., renting out the land instead of farming it).", tip: "Practice calculating farm profit and ROI. Know the difference between fixed and variable costs.", related_topics: ["Farm budgeting", "Agricultural marketing", "Risk management"] } },
      { id: "econ_memory_01", type: "memory_hook", order: 8, content: { text: "Farm management = planning + organizing + controlling. Profit = Revenue − Costs. ROI = Profit/Cost × 100. Records: production, financial, labour, inventory. Opportunity cost = what you give up.", hook_type: "mnemonic" } },
      { id: "econ_reflection_01", type: "reflection", order: 9, content: { question: "Why do many small-scale farmers in Nigeria not keep farm records?", expected_unexpected: "Lack of education, belief that farming is 'simple', no access to record-keeping tools, and cultural attitudes. Yet records are essential for profitability." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "Farm profit is calculated as:", options: [{ label: "A", text: "Revenue + Costs" }, { label: "B", text: "Revenue − Costs" }, { label: "C", text: "Costs − Revenue" }, { label: "D", text: "Revenue × Costs" }], answer: "B", explanation: "Profit = Total Revenue − Total Costs.", hints: ["What's left after paying all expenses?"] },
      { difficulty: "medium", question: "The opportunity cost of a farmer using their own land is:", options: [{ label: "A", text: "Zero" }, { label: "B", text: "The rent they could have earned by leasing it out" }, { label: "C", text: "The cost of buying the land" }, { label: "D", text: "The cost of fertilizers" }], answer: "B", explanation: "Opportunity cost is the value of the next best alternative. If the farmer could rent out the land, that's what they give up by farming it themselves.", hints: ["What else could the farmer do with the land?"] },
      { difficulty: "jamb", question: "The principle of diminishing returns states that:", options: [{ label: "A", text: "More input always gives more output" }, { label: "B", text: "Adding more of one input eventually gives less additional output" }, { label: "C", text: "Farmers should always use more fertilizer" }, { label: "D", text: "Output decreases immediately with more input" }], answer: "B", explanation: "Diminishing returns: adding more of one input (while others are constant) eventually gives less and less additional output.", hints: ["At some point, more fertilizer stops helping as much"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["econ_hook_01", "econ_intuitive_01", "econ_formal_01", "econ_formula_01", "econ_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "agricultural_science",
    topic: "Pest and Disease Control",
    subtopic: "Crop and Livestock Protection",
    title: "Pest and Disease Control — Protecting Our Harvest",
    learning_objectives: [
      "Identify common crop and livestock pests",
      "Classify diseases affecting crops and animals",
      "Explain methods of pest and disease control",
      "Understand the integrated pest management approach",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "pest_hook_01", type: "hook", order: 1, content: { text: "Armyworms can destroy an entire maize field in days. Newcastle disease can wipe out a poultry flock. Locusts have caused famines throughout history. Pests and diseases are the biggest threats to food production. Controlling them is essential for food security.", prediction_prompt: "What would happen to farmers if there were no ways to control pests and diseases?" } },
      { id: "pest_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Pests: insects (armyworm, borer, aphids), rodents (rats, mice), birds (quelea). Diseases: fungal (blight, rust), bacterial (wilt), viral (mosaic), parasitic (nematodes). Livestock diseases: Newcastle (poultry), anthrax (cattle), rinderpest. Control methods: cultural (crop rotation), biological (natural enemies), chemical (pesticides), mechanical (traps).", analogy: "Think of pest control like your immune system. Your body has multiple defences: physical (skin), chemical (stomach acid), biological (white blood cells). Similarly, farmers use multiple methods — no single method is enough." } },
      { id: "pest_formal_01", type: "formal_explanation", order: 3, content: { text: "Control methods: (1) Cultural — crop rotation, early planting, resistant varieties, field sanitation. (2) Biological — using natural enemies (ladybugs eat aphids, ducks eat snails). (3) Chemical — pesticides (insecticides, fungicides, herbicides). (4) Mechanical — hand-picking, traps, barriers. Integrated Pest Management (IPM) combines all methods for sustainable control.", key_terms: [{ term: "Pest", definition: "Any organism that damages crops or spreads disease" }, { term: "Pathogen", definition: "A disease-causing organism (bacteria, virus, fungus)" }, { term: "Pesticide", definition: "A chemical used to kill or control pests" }, { term: "IPM", definition: "Integrated Pest Management — combining multiple control methods" }, { term: "Biological Control", definition: "Using natural enemies to control pests" }] } },
      { id: "pest_formula_01", type: "formula", order: 4, content: { formula: "IPM = Cultural + Biological + Chemical + Mechanical Control. Economic Threshold = pest level where control cost < expected damage", variables: [{ name: "Cultural Control", description: "Changing farming practices to reduce pest problems" }, { name: "Biological Control", description: "Using natural enemies (predators, parasites)" }, { name: "Chemical Control", description: "Using pesticides (last resort in IPM)" }, { name: "Mechanical Control", description: "Physical removal or barriers (traps, hand-picking)" }], when_to_use: "When deciding how to control pests and diseases on the farm.", common_traps: ["Over-reliance on chemical pesticides — they kill beneficial organisms too", "Not scouting fields regularly to detect problems early", "Ignoring cultural control methods — prevention is better than cure"], units_note: "IPM aims to minimize chemical use while maintaining crop health." } },
      { id: "pest_practice_01", type: "worked_example", order: 5, content: { scenario: "A maize farmer notices armyworms attacking the crop. Design an IPM strategy to control them.", given: ["Armyworm infestation in maize"], required: "Design an integrated pest management plan", principle: "Combine multiple control methods for sustainable, effective control.", steps: [{ explanation: "Cultural control", calculation: "Plant early to avoid peak pest season. Use resistant varieties. Rotate with non-cereal crops." }, { explanation: "Biological control", calculation: "Encourage natural enemies: birds, spiders, parasitic wasps. Avoid broad-spectrum pesticides that kill them." }, { explanation: "Mechanical control", calculation: "Hand-pick caterpillars in the evening. Use pheromone traps to monitor and reduce populations." }, { explanation: "Chemical control (last resort)", calculation: "If infestation exceeds economic threshold, apply targeted insecticide (e.g., Bt-based) to minimize environmental harm." }], answer: "IPM strategy: (1) Cultural — early planting, resistant varieties, rotation. (2) Biological — encourage natural enemies. (3) Mechanical — hand-picking, traps. (4) Chemical — only when necessary, use targeted pesticides.", check: "IPM minimizes chemical use while effectively controlling pests." } },
      { id: "pest_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Pesticides are always the best solution to pest problems.", why_wrong: "Pesticides can kill beneficial organisms, contaminate water, poison food, and pests can develop resistance. They should be a last resort.", correct_model: "IPM is the best approach: combine cultural, biological, and mechanical methods. Use pesticides only when necessary." } },
      { id: "pest_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests pest identification, disease types, and control methods.", trap: "JAMB may ask about specific pests: armyworm (maize), borer (cassava), aphids (various crops). Know the major pests and their crops.", tip: "For essay questions, always recommend IPM — it shows understanding of integrated, sustainable approaches.", related_topics: ["Food security", "Environmental protection", "Sustainable agriculture"] } },
      { id: "pest_memory_01", type: "memory_hook", order: 8, content: { text: "Pests: insects, rodents, birds. Diseases: fungal, bacterial, viral. Control: Cultural, Biological, Chemical, Mechanical = IPM. Prevention > cure. Economic threshold = when to spray.", hook_type: "mnemonic" } },
      { id: "pest_reflection_01", type: "reflection", order: 9, content: { question: "Why is overuse of chemical pesticides harmful to agriculture?", expected_understanding: "Pesticides kill beneficial insects, contaminate soil and water, harm human health, and pests develop resistance over time. IPM provides a more sustainable alternative." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "The use of natural enemies to control pests is called:", options: [{ label: "A", text: "Chemical control" }, { label: "B", text: "Biological control" }, { label: "C", text: "Cultural control" }, { label: "D", text: "Mechanical control" }], answer: "B", explanation: "Biological control uses natural enemies (predators, parasites) to control pest populations.", hints: ["Using nature against pests"] },
      { difficulty: "medium", question: "Integrated Pest Management (IPM) involves:", options: [{ label: "A", text: "Using only chemical pesticides" }, { label: "B", text: "Combining cultural, biological, chemical, and mechanical methods" }, { label: "C", text: "Ignoring pests until they cause damage" }, { label: "D", text: "Using only biological methods" }], answer: "B", explanation: "IPM combines all available control methods for sustainable, effective pest management.", hints: ["What does 'integrated' mean?"] },
      { difficulty: "jamb", question: "The economic threshold for pest control is:", options: [{ label: "A", text: "When all crops are destroyed" }, { label: "B", text: "When the cost of control is less than the expected damage" }, { label: "C", text: "When the first pest is seen" }, { label: "D", text: "At harvest time" }], answer: "B", explanation: "The economic threshold is the pest level where the cost of control is justified by the damage prevented.", hints: ["When is it worth spending money on control?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["pest_hook_01", "pest_intuitive_01", "pest_formal_01", "pest_formula_01", "pest_practice_01"] },
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
