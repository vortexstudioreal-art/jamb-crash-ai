import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS: any[] = [
  {
    subject: "geography",
    topic: "Map Reading and Interpretation",
    subtopic: "Fundamental Skills",
    title: "Map Reading — Navigating the World on Paper",
    learning_objectives: [
      "Identify map symbols and conventional signs",
      "Calculate distance using map scale",
      "Determine directions using compass and grid lines",
      "Interpret contour lines and relief features",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "geo_hook_01", type: "hook", order: 1, content: { text: "Before GPS and smartphones, explorers used maps to navigate deserts, oceans, and mountains. A map is a flat representation of the Earth's surface. Learning to read maps is not just a school subject — it's a life skill that helps you understand the world around you.", prediction_prompt: "Can you read a map without a GPS? What information does a map give you?" } },
      { id: "geo_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "A map uses symbols, colors, and lines to represent real features. Contour lines show height — close together means steep, far apart means flat. Scale shows the ratio between map distance and real distance. The compass rose shows directions. Grid references help you locate exact positions.", analogy: "Think of a map like a bird's-eye view of the Earth. You're looking down from an airplane. Roads become lines, buildings become squares, mountains become contour patterns." } },
      { id: "geo_formal_01", type: "formal_explanation", order: 3, content: { text: "Key map skills: (1) Scale — ratio of map distance to ground distance (1:50,000 means 1cm = 500m). (2) Symbols — conventional signs for roads, railways, churches, etc. (3) Direction — compass bearings (N, S, E, W) and grid lines. (4) Contour lines — lines of equal height; interval = difference between adjacent contours. (5) Grid references — four-figure (grid square) and six-figure (exact point).", key_terms: [{ term: "Scale", definition: "Ratio between map distance and actual ground distance" }, { term: "Contour Lines", definition: "Lines connecting points of equal height above sea level" }, { term: "Grid Reference", definition: "A system of coordinates that locates a point on a map" }, { term: "Relief", definition: "The shape of the land surface — hills, valleys, plains" }] } },
      { id: "geo_formula_01", type: "formula", order: 4, content: { formula: "Distance = Map distance × Scale denominator. E.g., 1:50,000 → 3cm on map = 3 × 50,000 = 150,000cm = 1.5km", variables: [{ name: "Scale 1:50,000", description: "1cm on map = 50,000cm = 500m = 0.5km on ground" }, { name: "Scale 1:25,000", description: "1cm on map = 250m on ground" }, { name: "Contour interval", description: "Height difference between adjacent contour lines" }], when_to_use: "When calculating real distances from map measurements.", common_traps: ["Confusing cm and km — always convert units carefully", "Misreading contour intervals — check the key!", "Forgetting to multiply by the scale denominator"], units_note: "Map distances in cm; real distances convert to km." } },
      { id: "geo_practice_01", type: "worked_example", order: 5, content: { scenario: "On a 1:50,000 map, two towns are 4.5cm apart. Calculate the real distance.", given: ["Scale: 1:50,000", "Map distance: 4.5cm"], required: "Calculate real distance", principle: "Multiply map distance by scale denominator.", steps: [{ explanation: "Apply scale", calculation: "4.5cm × 50,000 = 225,000cm" }, { explanation: "Convert to km", calculation: "225,000cm ÷ 100,000 = 2.25km" }], answer: "The real distance is 2.25 km.", check: "At 1:50,000, 1cm = 500m. So 4.5cm = 2,250m = 2.25km." } },
      { id: "geo_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Contour lines that are close together mean flat land.", why_wrong: "Close contours mean STEEP land (height changes quickly over short distance). Far apart means flat.", correct_model: "Close together = steep. Far apart = flat. Contours that form concentric circles = hill or valley." } },
      { id: "geo_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests scale calculations, contour interpretation, grid references, and map symbols.", trap: "JAMB may give a scale in ratio form (1:50,000) or verbal form (1cm to 500m). Convert carefully.", tip: "For contour questions: draw a cross-section along a line. Mark heights where contours cross it.", related_topics: ["Cross-sections", "Landforms", "Cartography"] } },
      { id: "geo_memory_01", type: "memory_hook", order: 8, content: { text: "Close contours = steep. Far contours = flat. Scale: map × denominator = real distance. Grid: Eastings first (along corridor), then Northings (up stairs).", hook_type: "mnemonic" } },
      { id: "geo_reflection_01", type: "reflection", order: 9, content: { question: "Why is map reading still important even though we have GPS?", expected_understanding: "GPS can fail (battery, signal). Maps give a broader overview that GPS lacks. Understanding maps helps you plan routes, understand terrain, and make spatial decisions." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "On a 1:100,000 map, 1cm represents:", options: [{ label: "A", text: "100m" }, { label: "B", text: "1km" }, { label: "C", text: "10km" }, { label: "D", text: "100km" }], answer: "B", explanation: "1:100,000 means 1cm = 100,000cm = 1km.", hints: ["Convert 100,000cm to km"] },
      { difficulty: "medium", question: "Steep slopes are shown on a map by:", options: [{ label: "A", text: "Contours far apart" }, { label: "B", text: "Contours close together" }, { label: "C", text: "Flat colors" }, { label: "D", text: "Dotted lines" }], answer: "B", explanation: "Close contour lines indicate steep slopes.", hints: ["What happens to contour spacing on hillsides?"] },
      { difficulty: "jamb", question: "A four-figure grid reference identifies:", options: [{ label: "A", text: "An exact point" }, { label: "B", text: "A grid square" }, { label: "C", text: "A contour line" }, { label: "D", text: "A road" }], answer: "B", explanation: "A four-figure grid reference identifies a grid square. A six-figure reference identifies an exact point.", hints: ["Four figures = ? Six figures = ?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["geo_hook_01", "geo_intuitive_01", "geo_formal_01", "geo_formula_01", "geo_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "geography",
    topic: "Climate and Weather",
    subtopic: "Atmospheric Processes",
    title: "Climate — Understanding Weather Patterns",
    learning_objectives: [
      "Explain factors affecting climate",
      "Distinguish between weather and climate",
      "Identify climate types in Nigeria",
      "Understand the causes of rainfall",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "clim_hook_01", type: "hook", order: 1, content: { text: "Why is Lagos rainy and Maiduguri dry? Why does Nigeria have a rainy season and a dry season? Climate determines how we dress, what we eat, and how we build our houses. Understanding climate helps us prepare for weather changes.", prediction_prompt: "How would your life be different if you lived in a place with no rainy season?" } },
      { id: "clim_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Weather is what's happening now (sunny, rainy). Climate is the average weather over 30+ years. Factors affecting climate: latitude (distance from equator), altitude (height above sea level), ocean currents, wind patterns, and vegetation. Nigeria has two main climate zones: the wet south and the dry north.", analogy: "Think of weather as your mood today, and climate as your personality. Your mood changes daily, but your personality stays relatively constant over time." } },
      { id: "clim_formal_01", type: "formal_explanation", order: 3, content: { text: "Climate factors: (1) Latitude — areas near equator are hotter. (2) Altitude — higher areas are cooler (temperature drops 6.5°C per 1000m). (3) Ocean currents — warm currents bring moisture, cold currents bring dry air. (4) Wind patterns — prevailing winds carry moisture. (5) Relief — mountains cause orographic rainfall. Nigeria's climate: equatorial in south, tropical in central, arid in north.", key_terms: [{ term: "Climate", definition: "Average weather conditions over a long period (30+ years)" }, { term: "Rainfall Types", definition: "Convectional (heat-driven), relief/orographic (mountain-driven), frontal (warm meets cold air)" }, { term: "ITCZ", definition: "Inter-Tropical Convergence Zone — belt of low pressure near equator that moves north/south seasonally" }, { term: "Harmattan", definition: "Dry, dusty wind from the Sahara that affects Nigeria from November to March" }] } },
      { id: "clim_formula_01", type: "formula", order: 4, content: { formula: "Temperature drops 6.5°C for every 1000m increase in altitude (lapse rate)", variables: [{ name: "Latitude", description: "Equator = hottest. Poles = coldest" }, { name: "Altitude", description: "Higher = cooler (6.5°C per 1000m)" }, { name: "Rainfall", description: "Convectional (afternoon), relief (windward side), frontal (cold/warm front)" }], when_to_use: "When explaining climate differences or rainfall patterns.", common_traps: ["Confusing weather (short-term) with climate (long-term average)", "Not knowing the three types of rainfall", "Forgetting that altitude cools temperature"], units_note: "Lapse rate: 6.5°C per 1000m." } },
      { id: "clim_practice_01", type: "worked_example", order: 5, content: { scenario: "The temperature at sea level is 30°C. What is the temperature at the top of a 2000m mountain?", given: ["Sea level temperature: 30°C", "Height: 2000m"], required: "Calculate temperature at altitude", principle: "Temperature drops 6.5°C per 1000m.", steps: [{ explanation: "Calculate total drop", calculation: "2000m ÷ 1000 × 6.5°C = 13°C" }, { explanation: "Subtract from base", calculation: "30°C − 13°C = 17°C" }], answer: "The temperature at 2000m is 17°C.", check: "13°C drop over 2000m is correct at 6.5°C/1000m." } },
      { id: "clim_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Nigeria has the same climate everywhere.", why_wrong: "Nigeria ranges from equatorial (wet south) to semi-arid (dry north). Lagos gets 1700mm rain; Maiduguri gets 250mm.", correct_model: "Nigeria has diverse climates: equatorial south, tropical central, semi-arid north." } },
      { id: "clim_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests climate factors, rainfall types, and Nigerian climate zones.", trap: "JAMB may ask about the ITCZ — its movement north/south causes Nigeria's rainy and dry seasons.", tip: "Know the rainfall types: convectional (afternoon thunderstorms), relief (windward side of mountains), frontal (when warm and cold air meet).", related_topics: ["Agriculture", "Vegetation", "Human-environment interaction"] } },
      { id: "clim_memory_01", type: "memory_hook", order: 8, content: { text: "Climate = weather average (30+ years). Types of rainfall: convectional, relief, frontal. Lapse rate: 6.5°C per 1000m. Nigeria: wet south, dry north.", hook_type: "mnemonic" } },
      { id: "clim_reflection_01", type: "reflection", order: 9, content: { question: "How does climate change affect agriculture in Nigeria?", expected_unexceptional: "Shifting rainfall patterns cause droughts in the north and floods in the south. Farmers can't predict planting seasons. Food security is threatened." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "The average weather conditions over 30 years is called:", options: [{ label: "A", text: "Weather" }, { label: "B", text: "Climate" }, { label: "C", text: "Season" }, { label: "D", text: "Forecast" }], answer: "B", explanation: "Climate is the long-term average of weather conditions.", hints: ["Long-term vs short-term"] },
      { difficulty: "medium", question: "The Harmattan wind comes from:", options: [{ label: "A", text: "The Atlantic Ocean" }, { label: "B", text: "The Sahara Desert" }, { label: "C", text: "The Indian Ocean" }, { label: "D", text: "The Mediterranean" }], answer: "B", explanation: "The Harmattan is a dry, dusty wind from the Sahara that affects Nigeria from November to March.", hints: ["Which desert is north of Nigeria?"] },
      { difficulty: "jamb", question: "Orographic rainfall occurs when:", options: [{ label: "A", text: "Warm air rises due to heat" }, { label: "B", text: "Moist air is forced to rise over mountains" }, { label: "C", text: "Warm and cold air masses meet" }, { label: "D", text: "The sun heats the ocean" }], answer: "B", explanation: "Orographic (relief) rainfall occurs when moist air is forced to rise over mountains, cooling and condensing.", hints: ["Oro = mountain"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["clim_hook_01", "clim_intuitive_01", "clim_formal_01", "clim_formula_01", "clim_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "geography",
    topic: "Population and Settlement",
    subtopic: "Demographics and Urbanization",
    title: "Population — People and Where They Live",
    learning_objectives: [
      "Explain factors affecting population distribution",
      "Distinguish between population growth and density",
      "Understand urbanization and its effects",
      "Analyze migration patterns and their causes",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "pop_hook_01", type: "hook", order: 1, content: { text: "Lagos has over 20 million people crammed into a small area. Yobe State has far fewer people spread over a larger area. Why do people cluster in some places and avoid others? The answer lies in geography, economics, and history.", prediction_prompt: "Why do you think more people live in southern Nigeria than in the north?" } },
      { id: "pop_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "People settle where conditions are favourable: good soil for farming, water availability, mild climate, economic opportunities, and safety. Population density = people per unit area. Growth rate = how fast population increases (births + immigration − deaths − emigration). Urbanization = the shift from rural to urban living.", analogy: "Think of population like water flowing downhill. People flow toward opportunities (jobs, education, healthcare) just as water flows toward lower ground. Cities are the valleys where people collect." } },
      { id: "pop_formal_01", type: "formal_explanation", order: 3, content: { text: "Population factors: (1) Physical — climate, water, soil, terrain. (2) Economic — jobs, industry, commerce. (3) Social — education, healthcare, security. (4) Historical — colonial influence, trade routes. Nigeria: 200+ million people, fastest-growing large country. Urbanization rate: 50%+ live in cities, projected to reach 60% by 2030.", key_terms: [{ term: "Population Density", definition: "Number of people per unit area (people/km²)" }, { term: "Urbanization", definition: "The process of population shift from rural to urban areas" }, { term: "Migration", definition: "Movement of people from one place to another" }, { term: "Census", definition: "Official count of a population at a specific time" }] } },
      { id: "pop_formula_01", type: "formula", order: 4, content: { formula: "Population Density = Total Population / Land Area. Growth Rate = (Births + Immigration) − (Deaths + Emigration)", variables: [{ name: "Density", description: "People per km²" }, { name: "Growth Rate", description: "% increase per year" }, { name: "Doubling Time", description: "70 / Growth Rate (%) = years to double" }], when_to_use: "When calculating population statistics or analyzing settlement patterns.", common_traps: ["Confusing growth rate with density", "Not knowing doubling time formula", "Forgetting that urbanization has both positive and negative effects"], units_note: "Population density is measured in people per km²." } },
      { id: "pop_practice_01", type: "worked_example", order: 5, content: { scenario: "Nigeria's population growth rate is 2.5%. How long will it take for the population to double?", given: ["Growth rate: 2.5%"], required: "Calculate doubling time", principle: "Doubling time = 70 / growth rate (%)", steps: [{ explanation: "Apply formula", calculation: "70 / 2.5 = 28 years" }], answer: "Nigeria's population will double in approximately 28 years.", check: "At 2.5% per year, population doubles in 70/2.5 = 28 years." } },
      { id: "pop_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Urbanization is always good.", why_wrong: "Urbanization brings opportunities but also problems: congestion, pollution, slums, unemployment, crime.", correct_model: "Urbanization has benefits (jobs, services) and challenges (overcrowding, poverty). Balanced development is key." } },
      { id: "pop_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests population concepts, urbanization effects, and migration causes.", trap: "JAMB may ask about push vs pull factors. Push = reasons to leave (poverty, conflict). Pull = reasons to move to (jobs, education).", tip: "For essay questions, use examples from Nigeria: Lagos as a mega-city, rural-urban migration, IDP camps.", related_topics: ["Urban planning", "Housing", "Migration"] } },
      { id: "pop_memory_01", type: "memory_hook", order: 8, content: { text: "Density = population/area. Growth = births + immigration − deaths − emigration. Doubling time = 70/growth rate. Urbanization = rural to urban shift.", hook_type: "mnemonic" } },
      { id: "pop_reflection_01", type: "reflection", order: 9, content: { question: "What challenges does rapid urbanization pose for Nigerian cities?", expected_unexpected: "Congestion, inadequate housing (slums), pressure on infrastructure, unemployment, environmental degradation." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "Population density is calculated as:", options: [{ label: "A", text: "Births minus deaths" }, { label: "B", text: "Population divided by land area" }, { label: "C", text: "Number of cities" }, { label: "D", text: "Immigration rate" }], answer: "B", explanation: "Population density = total population / land area.", hints: ["How many people per unit area?"] },
      { difficulty: "medium", question: "A push factor for migration is:", options: [{ label: "A", text: "Better job opportunities" }, { label: "B", text: "Good schools" }, { label: "C", text: "Poverty and lack of jobs" }, { label: "D", text: "Modern hospitals" }], answer: "C", explanation: "Push factors drive people away (poverty, conflict). Pull factors attract people (jobs, education).", hints: ["What pushes people to leave?"] },
      { difficulty: "jamb", question: "Urbanization in Nigeria has led to:", options: [{ label: "A", text: "Only positive effects" }, { label: "B", text: "Growth of slums and congestion" }, { label: "C", text: "Empty cities" }, { label: "D", text: "Reduced population" }], answer: "B", explanation: "Rapid urbanization has caused slums, congestion, unemployment, and infrastructure pressure.", hints: ["What are the negative effects of rapid city growth?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["pop_hook_01", "pop_intuitive_01", "pop_formal_01", "pop_formula_01", "pop_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "geography",
    topic: "Natural Resources and Conservation",
    subtopic: "Resource Management",
    title: "Natural Resources — Using and Protecting What We Have",
    learning_objectives: [
      "Classify natural resources (renewable and non-renewable)",
      "Explain the importance of natural resources to Nigeria",
      "Understand environmental conservation methods",
      "Evaluate the impact of resource extraction on the environment",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "res_hook_01", type: "hook", order: 1, content: { text: "Nigeria is one of the world's largest oil producers, yet many Nigerians live in poverty. The Niger Delta — where oil comes from — is one of the most polluted places on Earth. Natural resources can be a blessing or a curse. How we manage them determines our future.", prediction_prompt: "If Nigeria had no oil, what other resources could the country rely on?" } },
      { id: "res_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Natural resources are materials from nature that humans use. Renewable resources can be replenished (water, solar, forests). Non-renewable resources take millions of years to form (oil, gas, minerals). Nigeria's resources include oil, gas, tin, coal, limestone, timber, and fertile farmland. Resource management means balancing exploitation with conservation.", analogy: "Think of non-renewable resources like money in a bank account. Once you withdraw it, it's gone. Renewable resources are like interest — they keep generating if you don't overdraw." } },
      { id: "res_formal_01", type: "formal_explanation", order: 3, content: { text: "Nigeria's resources: (1) Petroleum — 90% of export earnings, found mainly in Niger Delta. (2) Natural gas — largest reserves in Africa. (3) Solid minerals — tin, columbite, coal, limestone. (4) Agriculture — cocoa, rubber, palm oil, groundnut. (5) Water resources — rivers, lakes, groundwater. Conservation: sustainable use, recycling, pollution control, protected areas.", key_terms: [{ term: "Renewable Resources", definition: "Resources that can be replenished naturally (water, solar, wind, forests)" }, { term: "Non-renewable Resources", definition: "Resources that take millions of years to form and cannot be replaced once used (oil, gas, minerals)" }, { term: "Conservation", definition: "Protecting and managing natural resources to prevent waste and destruction" }, { term: "Sustainable Development", definition: "Meeting present needs without compromising future generations' ability to meet their needs" }] } },
      { id: "res_formula_01", type: "formula", order: 4, content: { formula: "Resource Management: Extract + Process + Use + Conserve + Recycle", variables: [{ name: "Extract", description: "Mining, drilling, harvesting" }, { name: "Process", description: "Refining, manufacturing" }, { name: "Use", description: "Consumption by people and industry" }, { name: "Conserve", description: "Protecting resources for future use" }, { name: "Recycle", description: "Reusing materials to reduce waste" }], when_to_use: "When analyzing resource management challenges or sustainability.", common_traps: ["Confusing renewable and non-renewable resources", "Not knowing Nigeria's main exports", "Forgetting that conservation doesn't mean not using resources — it means using them wisely"], units_note: "Oil accounts for ~90% of Nigeria's export earnings." } },
      { id: "res_practice_01", type: "worked_example", order: 5, content: { scenario: "Explain the 'resource curse' — why do oil-rich countries like Nigeria often have high poverty?", given: ["The paradox of resource wealth and poverty"], required: "Explain the resource curse concept", principle: "Resource wealth can create economic, social, and political problems.", steps: [{ explanation: "Economic problem", calculation: "Oil wealth causes 'Dutch Disease' — other sectors (agriculture, manufacturing) are neglected" }, { explanation: "Political problem", calculation: "Corruption — leaders steal oil revenue instead of developing the country" }, { explanation: "Social problem", calculation: "Environmental pollution in Niger Delta destroys farming and fishing" }, { explanation: "Solution", calculation: "Diversify economy, fight corruption, invest in people and infrastructure" }], answer: "The resource curse: oil wealth leads to neglect of other sectors, corruption, environmental damage, and inequality.", check: "Nigeria earns billions from oil but has high poverty — the wealth doesn't reach ordinary people." } },
      { id: "res_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Natural resources will last forever.", why_wrong: "Non-renewable resources (oil, gas) take millions of years to form. Once used, they're gone for human history.", correct_model: "Non-renewable resources are finite. We must use them wisely and invest in renewable alternatives." } },
      { id: "res_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests resource types, Nigeria's resources, and conservation methods.", trap: "JAMB may ask about the Niger Delta environmental crisis — oil spills, gas flaring, and their effects on communities.", tip: "For essay questions, balance: economic benefits of oil vs environmental and social costs.", related_topics: ["Environmental pollution", "Sustainable development", "Economic diversification"] } },
      { id: "res_memory_01", type: "memory_hook", order: 8, content: { text: "Renewable = replenishes (water, solar). Non-renewable = finite (oil, gas). Nigeria: oil = 90% exports. Resource curse = wealth + poverty. Conservation = wise use.", hook_type: "mnemonic" } },
      { id: "res_reflection_01", type: "reflection", order: 9, content: { question: "What steps should Nigeria take to reduce dependence on oil?", expected_understanding: "Invest in agriculture, manufacturing, tourism, and technology. Fight corruption. Develop renewable energy. Educate the workforce." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "Which of the following is a non-renewable resource?", options: [{ label: "A", text: "Solar energy" }, { label: "B", text: "Petroleum" }, { label: "C", text: "Water" }, { label: "D", text: "Wind" }], answer: "B", explanation: "Petroleum is non-renewable — it takes millions of years to form.", hints: ["Which resource cannot be replenished?"] },
      { difficulty: "medium", question: "The Niger Delta environmental crisis is mainly caused by:", options: [{ label: "A", text: "Farming activities" }, { label: "B", text: "Oil exploration and production" }, { label: "C", text: "Deforestation" }, { label: "D", text: "Urbanization" }], answer: "B", explanation: "Oil spills, gas flaring, and pipeline vandalism have devastated the Niger Delta environment.", hints: ["What industry dominates the Niger Delta?"] },
      { difficulty: "jamb", question: "Sustainable development means:", options: [{ label: "A", text: "Using all resources now" }, { label: "B", text: "Meeting present needs without compromising future generations" }, { label: "C", text: "Stopping all development" }, { label: "D", text: "Only using renewable resources" }], answer: "B", explanation: "Sustainable development balances current needs with protecting resources for the future.", hints: ["The Brundtland definition"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["res_hook_01", "res_intuitive_01", "res_formal_01", "res_formula_01", "res_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "geography",
    topic: "Agriculture and Food Production",
    subtopic: "Farming Systems",
    title: "Agriculture — Feeding the Nation",
    learning_objectives: [
      "Identify types of farming in Nigeria",
      "Explain factors affecting agricultural production",
      "Understand the problems facing Nigerian agriculture",
      "Evaluate solutions to food insecurity",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "agr_hook_01", type: "hook", order: 1, content: { text: "Nigeria was once a major exporter of groundnuts, cocoa, and palm oil. Today, it imports food worth billions of dollars. What went wrong? Agriculture — the backbone of the Nigerian economy — declined due to neglect, insecurity, and poor infrastructure. Reviving agriculture is key to Nigeria's future.", prediction_prompt: "Why would a country with fertile land import food?" } },
      { id: "agr_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Agriculture in Nigeria ranges from subsistence farming (growing food for family) to commercial farming (growing for sale). Major crops: cassava, yam, maize, rice, sorghum (food crops); cocoa, rubber, palm oil, groundnut (cash crops). Factors affecting agriculture: climate, soil, water, labour, technology, government policy.", analogy: "Think of agriculture like a chain. Each link — land, seed, water, labour, market — must be strong. If any link breaks (no rain, no market, no road), the whole chain fails and food production suffers." } },
      { id: "agr_formal_01", type: "formal_explanation", order: 3, content: { text: "Nigerian farming systems: (1) Shifting cultivation — clearing and burning vegetation, farming for few years, then moving. (2) Subsistence farming — small plots, family labour, minimal inputs. (3) Commercial farming — large-scale, mechanized, for export. Problems: poor infrastructure, insecurity (herder-farmer conflicts), climate change, land tenure issues, limited access to credit.", key_terms: [{ term: "Subsistence Farming", definition: "Farming mainly to feed the family, with small surpluses for sale" }, { term: "Cash Crops", definition: "Crops grown primarily for sale (cocoa, rubber, palm oil)" }, { term: "Food Crops", definition: "Crops grown mainly for consumption (cassava, yam, rice)" }, { term: "Agricultural Extension", definition: "Government services that educate farmers on modern techniques" }] } },
      { id: "agr_formula_01", type: "formula", order: 4, content: { formula: "Agricultural Productivity = f(Land, Labour, Capital, Technology, Policy)", variables: [{ name: "Land", description: "Fertile soil, adequate rainfall, irrigation" }, { name: "Labour", description: "Available workers, training, health" }, { name: "Capital", description: "Credit, equipment, infrastructure" }, { name: "Technology", description: "Improved seeds, fertilizers, mechanization" }, { name: "Policy", description: "Government support, subsidies, security" }], when_to_use: "When analyzing factors affecting agricultural production.", common_traps: ["Focusing only on climate — infrastructure and policy are equally important", "Not knowing the difference between subsistence and commercial farming", "Forgetting that insecurity (herder-farmer conflicts) is a major problem"], units_note: "Agriculture employs ~35% of Nigeria's workforce but contributes only ~24% of GDP — showing low productivity." } },
      { id: "agr_practice_01", type: "worked_example", order: 5, content: { scenario: "Suggest five ways to improve agricultural production in Nigeria.", given: ["Nigerian agriculture faces multiple challenges"], required: "Propose solutions", principle: "Solutions must address the key constraints: infrastructure, technology, security, finance, and policy.", steps: [{ explanation: "Infrastructure", calculation: "Build rural roads to connect farms to markets" }, { explanation: "Technology", calculation: "Provide improved seeds, fertilizers, and mechanization" }, { explanation: "Security", calculation: "Address herder-farmer conflicts and banditry" }, { explanation: "Finance", calculation: "Provide low-interest loans and insurance for farmers" }, { explanation: "Policy", calculation: "Government should support agriculture with subsidies and research" }], answer: "Solutions: (1) Build rural roads, (2) Provide improved inputs, (3) Address insecurity, (4) Provide credit, (5) Government investment in research and extension.", check: "These address the five key constraints: infrastructure, technology, security, finance, and policy." } },
      { id: "agr_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Nigeria has no agricultural potential.", why_wrong: "Nigeria has vast arable land, diverse climates, and a large workforce. The potential is enormous — but untapped due to poor infrastructure and policy.", correct_model: "Nigeria has huge agricultural potential — it just needs investment, infrastructure, and security." } },
      { id: "agr_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests farming types, agricultural problems, and solutions.", trap: "JAMB may ask about the 'Green Revolution' or government agricultural policies. Know specific programmes.", tip: "For essay questions, use specific examples: Anchor Borrowers' Programme, CBN agricultural loans, Lake Rice project.", related_topics: ["Food security", "Rural development", "Climate change impacts"] } },
      { id: "agr_memory_01", type: "memory_hook", order: 8, content: { text: "Nigeria agriculture: subsistence (food) + commercial (cash). Problems: roads, security, credit, climate, policy. Potential: vast land, diverse climate, large workforce.", hook_type: "mnemonic" } },
      { id: "agr_reflection_01", type: "reflection", order: 9, content: { question: "How can young Nigerians be encouraged to take up agriculture?", expected_understanding: "Make farming profitable (better prices, processing), modernize agriculture (technology, mechanization), provide credit, and change the perception that farming is 'dirty' work." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "Farming mainly to feed one's family is called:", options: [{ label: "A", text: "Commercial farming" }, { label: "B", text: "Subsistence farming" }, { label: "C", text: "Plantation farming" }, { label: "D", text: "Industrial farming" }], answer: "B", explanation: "Subsistence farming is growing food mainly for family consumption.", hints: ["Growing food to eat, not to sell"] },
      { difficulty: "medium", question: "Which of the following is NOT a cash crop in Nigeria?", options: [{ label: "A", text: "Cocoa" }, { label: "B", text: "Cassava" }, { label: "C", text: "Rubber" }, { label: "D", text: "Palm oil" }], answer: "B", explanation: "Cassava is a food crop (grown for consumption). Cocoa, rubber, and palm oil are cash crops (grown for sale).", hints: ["Which crop is mainly eaten, not sold?"] },
      { difficulty: "jamb", question: "A major problem facing Nigerian agriculture is:", options: [{ label: "A", text: "Too much rainfall" }, { label: "B", text: "Insecurity and herder-farmer conflicts" }, { label: "C", text: "Over-mechanization" }, { label: "D", text: "Too many farmers" }], answer: "B", explanation: "Insecurity — including banditry and herder-farmer conflicts — is a major threat to agricultural production.", hints: ["What prevents farmers from working safely?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["agr_hook_01", "agr_intuitive_01", "agr_formal_01", "agr_formula_01", "agr_practice_01"] },
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
