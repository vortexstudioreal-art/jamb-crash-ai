-- Seed the geography syllabus.
--
-- geography is selectable in SubjectSelector, offered in MockExam, and has 5
-- seeded lessons, but jamb_syllabus contained zero geography rows — so the
-- subject rendered as an empty list. These rows are ordered to match the
-- existing social-science subjects (history, economics, commerce), which
-- number from order_index 1 rather than continuing the english..agricultural_
-- science block at 0..82.
--
-- The five topics that have lessons use the lesson `topic` strings verbatim so
-- the SyllabusReader deep link (subject + topic) resolves.
--
-- jamb_syllabus has no unique constraint on (subject, topic), so each insert is
-- guarded with NOT EXISTS to keep this migration re-runnable.

-- 1. Introduction to Geography ---------------------------------------------
INSERT INTO jamb_syllabus (subject, topic, subtopic, objectives, recommended_content, difficulty_level, estimated_reading_time, order_index)
SELECT 'geography', 'Introduction to Geography',
  'Definition and scope of geography, Physical and human branches, Concept of location, Position and place',
  ARRAY[
    'Define geography and explain its scope as a discipline',
    'Distinguish between physical and human geography',
    'Explain the concepts of location, position and place',
    'Describe the major branches and subdivisions of geography',
    'Relate geography to other subjects and to everyday life'
  ],
  'Geography is the study of the spatial distribution of human and physical features on the Earth''s surface and of the relationships between people and their environment.

Key ideas:
- **Physical geography** studies natural phenomena: landforms, climate, water, vegetation and soils.
- **Human geography** studies human activities: population, settlement, agriculture, trade and industry.
- Every geographical study is anchored to three questions: **where** (location), **what** (the feature being described), and **why** (the processes and reasons behind it).

🎯 General Aims:
1. Develop the ability to describe and explain spatial patterns on the Earth''s surface
2. Build skill in reading, interpreting and presenting geographical information
3. Appreciate the interdependence between humans and their physical environment
4. Prepare for further study in geography and related disciplines',
  'medium', 15, 1
WHERE NOT EXISTS (SELECT 1 FROM jamb_syllabus WHERE subject = 'geography' AND topic = 'Introduction to Geography');

-- 2. Map Reading and Interpretation (has a lesson) ---------------------------
INSERT INTO jamb_syllabus (subject, topic, subtopic, objectives, recommended_content, difficulty_level, estimated_reading_time, order_index)
SELECT 'geography', 'Map Reading and Interpretation',
  'Components of a map, Scale and representative fraction, Grid references, Bearings and distances, Conventional signs, Interpretation of photographs',
  ARRAY[
    'Identify the components of a map',
    'Convert between different map scales and calculate representative fractions',
    'Locate places using six-figure grid references',
    'Calculate bearings and distances from a map',
    'Interpret conventional signs, contour lines and photographs',
    'Relate features on a map to their real-world locations'
  ],
  'A map is the most important geographical tool. JAMB questions frequently require precise scale, grid reference and bearing calculations.

Core skills:
- **Scale**: convert between statement scale (1 cm represents 1 km) and representative fraction (1:100,000). 1 cm on a 1:100,000 map = 1 km; on a 1:50,000 map = 500 m.
- **Grid reference**: read the eastings (vertical grid lines) first, then the northings (horizontal grid lines), always giving the most precise estimate — for example 614283, not 610280.
- **Bearings**: three-figure bearings are measured clockwise from north (000°). Due east 090°, due south 180°, due west 270°.
- **Distance**: use the scale bar rather than measuring with a ruler when one is provided.
- **Contour lines**: closely spaced contours indicate a steep slope; widely spaced contours indicate a gentle slope. V-shaped contours pointing uphill indicate a valley; V-shapes pointing downhill indicate a ridge.

🎯 General Aims:
1. Develop practical competence in map and photograph interpretation
2. Ensure accuracy in scale, grid reference and bearing questions
3. Build confidence with conventional signs across all map types',
  'medium', 20, 2
WHERE NOT EXISTS (SELECT 1 FROM jamb_syllabus WHERE subject = 'geography' AND topic = 'Map Reading and Interpretation');

-- 3. Physical Geography ------------------------------------------------------
INSERT INTO jamb_syllabus (subject, topic, subtopic, objectives, recommended_content, difficulty_level, estimated_reading_time, order_index)
SELECT 'geography', 'Physical Geography',
  'Structure of the Earth, Rock types and classification, Landforms and processes, Internal and external forces, Denudation',
  ARRAY[
    'Describe the internal structure of the Earth',
    'Classify rocks as igneous, sedimentary or metamorphic',
    'Distinguish between the major types of landforms',
    'Explain internal forces such as earthquakes, volcanoes and folding',
    'Explain external processes of denudation: weathering, erosion, deposition and transport',
    'Relate landforms to the processes that formed them'
  ],
  'Physical geography explains the natural landscape: what it is made of and what shaped it.

- **Earth structure**: inner core, outer core, mantle and crust. The crust is thin and floats on the semi-solid mantle; it is divided into tectonic plates.
- **Rocks**: **igneous** form from magma (granite, basalt, obsidian); **sedimentary** form from compacted deposits of earlier rock or remains (sandstone, shale, limestone, coal); **metamorphic** form when existing rock is altered by heat and pressure (marble, slate, gneiss).
- **Denudation** breaks down and removes rock. **Weathering** is breakdown in place (physical, chemical, biological). **Erosion** is removal and transport by agents such as running water, wind, glaciers and waves.
- **Landforms**: fluvial features (V-valley, meander, ox-bow lake, flood plain, delta); arid features (sand dune, mesa, pediment); coastal features (stack, stump, bay, headland).

🎯 General Aims:
1. Explain the processes that create and modify landforms
2. Enable identification of rock types and landforms from description and diagram
3. Link physical processes to the human activities possible in each setting',
  'medium', 20, 3
WHERE NOT EXISTS (SELECT 1 FROM jamb_syllabus WHERE subject = 'geography' AND topic = 'Physical Geography');

-- 4. Climate and Weather (has a lesson) --------------------------------------
INSERT INTO jamb_syllabus (subject, topic, subtopic, objectives, recommended_content, difficulty_level, estimated_reading_time, order_index)
SELECT 'geography', 'Climate and Weather',
  'Elements of weather and climate, Measurement of temperature and rainfall, Atmospheric pressure and winds, Humidity, Cloud types, Weather instruments',
  ARRAY[
    'Distinguish clearly between weather and climate',
    'List the elements of weather and climate',
    'Describe how temperature and rainfall are measured',
    'Explain atmospheric pressure, wind and humidity',
    'Describe the formation and classification of clouds',
    'Explain the factors that determine the climate of a place',
    'Interpret climate data and weather maps'
  ],
  '**Weather** is the state of the atmosphere at a particular place and time. **Climate** is the average weather of a place over a long period, usually at least 30 years.

Elements: temperature, rainfall, humidity, wind, pressure, cloud cover and sunshine duration.

- **Temperature** is measured with a thermometer, recorded in degrees Celsius or Kelvin. It decreases with altitude at roughly 0.65°C per 100 m.
- **Rainfall** is measured with a rain gauge. A simple method: measure the depth of water in mm, multiply by 314 to convert to an area in km².
- **Pressure**: measured with a barometer in millibars (mb). High pressure (above 1010 mb) generally brings fine weather; low pressure brings unsettled, rainy weather.
- **Wind**: measured by an anemometer for speed and a wind vane for direction.
- **Cloud types**: cirrus (high, wispy), cumulus (heaped, fair weather), stratus (low, blanket), nimbostratus (rain-bearing).
- **Climate is controlled by** latitude, altitude, distance from the sea, prevailing winds, ocean currents and relief.

🎯 General Aims:
1. Enable correct use and interpretation of weather instruments and maps
2. Develop the ability to explain why places have different climates
3. Ensure accurate reading of temperature and rainfall data in questions',
  'medium', 20, 4
WHERE NOT EXISTS (SELECT 1 FROM jamb_syllabus WHERE subject = 'geography' AND topic = 'Climate and Weather');

-- 5. Water Resources ---------------------------------------------------------
INSERT INTO jamb_syllabus (subject, topic, subtopic, objectives, recommended_content, difficulty_level, estimated_reading_time, order_index)
SELECT 'geography', 'Water Resources',
  'Sources of water, Types of water bodies, River regimes, Water supply and demand, Water conservation, Ocean currents',
  ARRAY[
    'Identify the sources and types of water on the Earth',
    'Describe the features and course of a river system',
    'Compare rivers with lakes and oceans',
    'Explain the causes and effects of flooding and water scarcity',
    'Describe methods of water supply and conservation',
    'Explain the influence of ocean currents on climate'
  ],
  'Water covers about 71% of the Earth''s surface, but only about 2.5% of it is fresh water.

- **Sources**: precipitation (rain, snow, hail), groundwater, lakes, rivers, glaciers and oceans.
- **Drainage basin** is the area of land drained by a river system. **Confluence** is where two rivers meet; **meander** is a looping bend in a river''s course.
- **River regime** describes the pattern of discharge over a year, and depends mainly on rainfall, catchment area, vegetation and slope.
- **Water supply** comes from surface water (dams and reservoirs), boreholes and groundwater, and desalination in coastal areas.
- **Conservation** includes catchment management, avoiding pollution, drip irrigation, and water harvesting.
- **Ocean currents** transport heat around the globe. Warm currents (for example the Gulf Stream) raise the temperature of adjacent coasts; cold currents (for example the Benguela Current) lower them and can produce coastal aridity.

🎯 General Aims:
1. Explain the hydrological cycle and the origin of water bodies
2. Develop understanding of how rivers, lakes and oceans are formed
3. Link water availability to settlement and agricultural patterns',
  'medium', 20, 5
WHERE NOT EXISTS (SELECT 1 FROM jamb_syllabus WHERE subject = 'geography' AND topic = 'Water Resources');

-- 6. Population and Settlement (has a lesson) --------------------------------
INSERT INTO jamb_syllabus (subject, topic, subtopic, objectives, recommended_content, difficulty_level, estimated_reading_time, order_index)
SELECT 'geography', 'Population and Settlement',
  'Population distribution and density, Sources of population data, Birth and death rates, Migration, Population growth, Urban and rural settlement, Site and situation',
  ARRAY[
    'Explain population distribution and density and the factors that affect them',
    'Distinguish between birth rate, death rate and rate of natural increase',
    'Describe internal and international migration and its causes',
    'Differentiate between rural and urban settlement',
    'Explain the factors that determine the site of a settlement',
    'Describe the problems of rapid urban growth and suggest solutions'
  ],
  '**Population** is the number of people living in an area at a given time.

Key measures:
- **Birth rate** = (number of live births in a year ÷ total population) × 1000.
- **Death rate** = (number of deaths in a year ÷ total population) × 1000.
- **Rate of natural increase** = birth rate − death rate.
- **Population density** = population ÷ total land area.

Data sources: **census** (a complete count by government, accurate but expensive), **sample survey** (a partial count, extrapolated to the whole).

- **Settlement types**: rural (farming, dispersed, small) and urban (towns and cities, dense, non-farming).
- **Site** is the physical location of a settlement; **situation** is its position relative to surrounding features.
- Factors favouring settlement: water supply, fertile soil, relief, transport routes, mineral resources, shelter from wind, and defence.
- Functions of towns: commercial, administrative, industrial, cultural and residential.

🎯 General Aims:
1. Develop skill in calculating and interpreting population statistics
2. Explain the distribution of population across the world and in Nigeria
3. Analyse the problems of rapid urbanisation and propose solutions',
  'medium', 20, 6
WHERE NOT EXISTS (SELECT 1 FROM jamb_syllabus WHERE subject = 'geography' AND topic = 'Population and Settlement');

-- 7. Agriculture and Food Production (has a lesson) --------------------------
INSERT INTO jamb_syllabus (subject, topic, subtopic, objectives, recommended_content, difficulty_level, estimated_reading_time, order_index)
SELECT 'geography', 'Agriculture and Food Production',
  'Types of farming, Crop production, Livestock, Fisheries, Forestry, Food processing, Problems of agricultural production, Agricultural policies',
  ARRAY[
    'Classify the main types of farming and their conditions',
    'Describe crop production from preparation of land to harvesting',
    'Describe the major livestock species and their products',
    'Explain the importance of fisheries and forestry to the economy',
    'State the problems affecting agricultural production in Nigeria',
    'Describe the solutions and government policies that address them',
    'Trace the chain from farm produce to finished food products'
  ],
  'Agriculture is the mainstay of Nigeria''s economy, employing a large share of the population.

- **Farming systems**: subsistence (for the farmer''s own use, e.g. shifting cultivation) versus commercial (for sale, e.g. plantation and mechanized farming). Irrigated farming adds a controlled water supply.
- **Crop production stages**: land preparation → seed selection → planting → manuring → weeding → harvesting → processing → storage.
- **Livestock**: cattle, goats, sheep, pigs and poultry. Nigeria has a large pastoral cattle population concentrated in the north.
- **Fisheries**: captured (marine and inland) and cultured (fish farming in ponds).
- **Forestry**: Nigeria''s timber resources come from tropical rainforest in the south and savanna woodland in the north.
- **Problems**: dependence on imported inputs, poor storage and processing, lack of irrigation, inaccessible roads, land fragmentation, and low mechanisation.
- **Solutions**: improved seeds, fertilizers, mechanization, irrigation, rural roads, storage and processing plants, and agricultural credit.

🎯 General Aims:
1. Develop an understanding of farming practice from land preparation to the market
2. Appreciate the economic importance of agriculture to Nigeria
3. Evaluate current agricultural problems and the policies designed to solve them',
  'medium', 20, 7
WHERE NOT EXISTS (SELECT 1 FROM jamb_syllabus WHERE subject = 'geography' AND topic = 'Agriculture and Food Production');

-- 8. Natural Resources and Conservation (has a lesson) ----------------------
INSERT INTO jamb_syllabus (subject, topic, subtopic, objectives, recommended_content, difficulty_level, estimated_reading_time, order_index)
SELECT 'geography', 'Natural Resources and Conservation',
  'Renewable and non-renewable resources, Minerals and petroleum, Land, Water, Forest and wildlife resources, Conservation strategies, Environmental legislation',
  ARRAY[
    'Distinguish between renewable and non-renewable resources',
    'List the major natural resources of Nigeria and their locations',
    'Explain the causes and consequences of resource depletion',
    'Describe methods of conserving natural resources',
    'Evaluate the role of government and international agencies in conservation'
  ],
  'Natural resources are materials from nature used to meet human needs.

- **Renewable resources** can be replaced within a short time: sunlight, wind, water, forest, fish and soil fertility.
- **Non-renewable resources** take millions of years to form: fossil fuels (crude oil, natural gas, coal), metallic minerals (tin, columbite, lead-zinc, iron ore), and non-metallic minerals (limestone, gypsum, salt).
- Nigeria''s solid minerals are mainly in the **geological basement** (tin, columbite, gold, gemstones) while petroleum is in the sedimentary basins of the Niger Delta and offshore.
- **Over-exploitation** of the petroleum economy has damaged the Niger Delta environment through gas flaring, oil spillage and pipeline fires.
- **Conservation methods**: afforestation and reforestation, game reserves and national parks, zoning, sustainable harvesting quotas, recycling, and reducing waste.
- The **National Environmental Standards and Regulations Enforcement Agency (NESREA)** is the federal body responsible for environmental protection.

🎯 General Aims:
1. Identify Nigeria''s natural resources and their distribution
2. Develop awareness of the consequences of unsustainable resource use
3. Promote positive attitudes towards conservation and sustainable development',
  'medium', 20, 8
WHERE NOT EXISTS (SELECT 1 FROM jamb_syllabus WHERE subject = 'geography' AND topic = 'Natural Resources and Conservation');

-- 9. Human Geography ---------------------------------------------------------
INSERT INTO jamb_syllabus (subject, topic, subtopic, objectives, recommended_content, difficulty_level, estimated_reading_time, order_index)
SELECT 'geography', 'Human Geography',
  'Culture and beliefs, Language groups, Settlement patterns, Urbanisation, Transport networks, Trade and tourism, Regional development',
  ARRAY[
    'Describe the main cultural groups of Nigeria and their distinguishing features',
    'Explain how culture influences settlement and economic activity',
    'Describe the pattern of urbanisation in Nigeria',
    'Explain the role of transport in national development',
    'Describe the factors of location for industries',
    'Explain the importance of tourism and its problems'
  ],
  'Human geography studies how people organise themselves across space.

- **Culture** comprises the shared beliefs, values, customs and language of a group. Nigeria has over 250 ethnic groups, with Hausa, Yoruba and Igbo the largest.
- **Urbanisation** is the increasing concentration of population in towns and cities driven by rural-to-urban migration, mainly for employment, education and health care.
- **Transport** improves accessibility and economic growth. Nigeria relies on roads and railways, with waterways and air transport serving particular corridors.
- **Industries** locate where they do because of raw materials, market, labour, transport, power and capital. Industries are classified as processing (using raw materials), manufacturing, service or extractive.
- **Tourism** exploits the scenic, cultural and historical attractions of a place. Nigeria''s attractions include the Osun-Osogbo festival, the Zuma Rock, the Nok culture sites and national parks like Yankari and Gashaka Gumti.
- **Problems of urbanisation** include overcrowding, inadequate housing, poor sanitation, unemployment and increased crime.

🎯 General Aims:
1. Develop understanding of the cultural and economic geography of Nigeria
2. Explain the relationship between human activities and their spatial location
3. Analyse the consequences of rapid urbanisation',
  'medium', 20, 9
WHERE NOT EXISTS (SELECT 1 FROM jamb_syllabus WHERE subject = 'geography' AND topic = 'Human Geography');

-- 10. Environmental Issues and Sustainability -------------------------------
INSERT INTO jamb_syllabus (subject, topic, subtopic, objectives, recommended_content, difficulty_level, estimated_reading_time, order_index)
SELECT 'geography', 'Environmental Issues and Sustainability',
  'Types of pollution, Deforestation, Desertification, Soil erosion, Global warming and climate change, Flooding, Waste management, Sustainable development',
  ARRAY[
    'Identify the major types of pollution and their causes',
    'Explain deforestation, desertification and soil erosion and their effects',
    'Describe the causes and consequences of global warming',
    'Explain the causes and management of flooding in Nigeria',
    'Discuss approaches to waste management',
    'Define sustainable development and give practical steps toward it'
  ],
  'Environmental issues are the result of human activities that degrade natural systems.

- **Pollution** types: air (gas flaring, vehicle emissions, industrial waste), water (sewage, oil spillage, agro-chemicals), land (solid waste, dumpsites) and noise.
- **Deforestation** removes forest faster than it can regenerate. In Nigeria it is driven by farming, fuelwood collection, logging and urban expansion.
- **Desertification** is the gradual spread of desert-like conditions into formerly productive land, affecting the northern Sahel margin through over-grazing and drought.
- **Soil erosion** by water (sheet, rill and gully) and by wind (deflation and deposition) removes fertile topsoil. The most severe form is **gully erosion**.
- **Global warming** arises from the greenhouse effect intensified by carbon dioxide, methane and deforestation. Consequences include sea level rise, altered rainfall patterns and more frequent extreme weather.
- **Flooding** results from heavy rainfall, poor drainage, deforestation, blocking of water courses and building on floodplains. Control measures include drainage channels, embankments, retaining walls and catchment protection.
- **Sustainable development** means meeting present needs without compromising future generations. It requires the three pillars of environment, economy and social equity.

🎯 General Aims:
1. Develop awareness of the causes and consequences of environmental degradation
2. Promote practical solutions and responsible citizenship
3. Build a clear understanding of sustainable development as a national goal',
  'medium', 20, 10
WHERE NOT EXISTS (SELECT 1 FROM jamb_syllabus WHERE subject = 'geography' AND topic = 'Environmental Issues and Sustainability');
