import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const artSyllabus = [
  // ==================== USE OF ENGLISH (Same as Science) ====================
  {
    subject: "english",
    topic: "Comprehension",
    subtopic: "Reading and Understanding Passages",
    objectives: [
      "Identify main ideas and supporting details in passages",
      "Make inferences and draw conclusions from texts",
      "Understand vocabulary in context",
      "Analyze author's purpose and tone",
      "Summarize and paraphrase written content"
    ],
    recommended_content: "Recommended Textbooks:\n1. Intensive English for Senior Secondary Schools (1-3) by B.O. Oluikpe\n2. Countdown to English Language by Ogunsanwo\n3. New Oxford Secondary English Course for SSS by Ayo Banjo\n4. Exam Focus: English Language for WASSCE & UTME\n5. Brighter Grammar Books 1-4 by C.E. Eckersley",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 1
  },
  {
    subject: "english",
    topic: "Lexis and Structure",
    subtopic: "Vocabulary Development and Grammar",
    objectives: [
      "Master parts of speech and their functions",
      "Understand sentence patterns and structures",
      "Use idioms, phrases, and expressions correctly",
      "Apply rules of concord and agreement",
      "Identify and correct grammatical errors"
    ],
    recommended_content: "Topics Covered:\n- Nouns, Pronouns, Verbs, Adjectives, Adverbs\n- Prepositions, Conjunctions, Interjections\n- Tenses and their uses\n- Active and Passive Voice\n- Direct and Indirect Speech\n- Clauses and Phrases\n- Punctuation marks\n\nRecommended: Brighter Grammar Books 1-4",
    difficulty_level: "medium",
    estimated_reading_time: 60,
    order_index: 2
  },
  {
    subject: "english",
    topic: "Oral English",
    subtopic: "Phonetics and Spoken English",
    objectives: [
      "Identify and produce English vowel and consonant sounds",
      "Apply correct stress patterns in words and sentences",
      "Recognize and use appropriate intonation patterns",
      "Distinguish between rhymes and syllable patterns",
      "Master the 44 phonemes of English"
    ],
    recommended_content: "Key Areas:\n- 20 Vowel sounds (12 pure vowels, 8 diphthongs)\n- 24 Consonant sounds\n- Word stress patterns\n- Sentence stress and rhythm\n- Intonation (rising, falling, fall-rise)\n- Connected speech features\n\nRecommended: Oral English for Schools and Colleges by Sam Onuigbo",
    difficulty_level: "hard",
    estimated_reading_time: 50,
    order_index: 3
  },
  {
    subject: "english",
    topic: "Essay Writing",
    subtopic: "Composition and Creative Writing",
    objectives: [
      "Write different types of essays (narrative, descriptive, argumentative, expository)",
      "Organize ideas logically with proper paragraphing",
      "Use appropriate register and tone for different contexts",
      "Write formal and informal letters",
      "Compose speeches, reports, and articles"
    ],
    recommended_content: "Essay Types:\n1. Narrative Essays - Tell a story\n2. Descriptive Essays - Describe persons, places, events\n3. Argumentative Essays - Present arguments for/against\n4. Expository Essays - Explain concepts\n5. Letter Writing - Formal and informal\n6. Article/Report Writing\n7. Speech Writing",
    difficulty_level: "medium",
    estimated_reading_time: 55,
    order_index: 4
  },

  // ==================== LITERATURE IN ENGLISH ====================
  {
    subject: "literature",
    topic: "Introduction to Literary Studies",
    subtopic: "General Literary Principles",
    objectives: [
      "Define literature and its importance to society",
      "Distinguish between oral and written literature",
      "Identify the major genres of literature (prose, poetry, drama)",
      "Understand the functions of literature",
      "Appreciate African and non-African literary traditions"
    ],
    recommended_content: "General Aims:\n- Stimulate candidates' intellectual and imaginative abilities\n- Foster appreciation of literature as art\n- Develop critical thinking and analytical skills\n- Expose candidates to various literary traditions\n- Enhance communication skills through literary study\n\nRecommended Textbooks:\n1. Essentials of Literature in English by Ola Rotimi\n2. Understanding Literature by K. Ogunjimi\n3. JAMB Literature-in-English Examination Guide",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 1
  },
  {
    subject: "literature",
    topic: "Literary Terms and Devices",
    subtopic: "Figures of Speech and Literary Techniques",
    objectives: [
      "Identify and explain various literary devices",
      "Analyze the effect of literary techniques in texts",
      "Distinguish between different types of imagery",
      "Understand symbolism and allegory",
      "Apply knowledge of literary terms to textual analysis"
    ],
    recommended_content: "Key Literary Devices:\n\n**Figures of Speech:**\n- Simile, Metaphor, Personification\n- Hyperbole, Litotes, Irony\n- Oxymoron, Paradox, Euphemism\n- Alliteration, Assonance, Onomatopoeia\n\n**Other Devices:**\n- Symbolism and Allegory\n- Foreshadowing and Flashback\n- Stream of Consciousness\n- Dramatic Irony\n- Pathetic Fallacy\n- Diction and Tone",
    difficulty_level: "medium",
    estimated_reading_time: 50,
    order_index: 2
  },
  {
    subject: "literature",
    topic: "Drama",
    subtopic: "Elements and Types of Drama",
    objectives: [
      "Define drama and identify its elements",
      "Distinguish between tragedy, comedy, and tragicomedy",
      "Analyze plot structure, characterization, and themes in plays",
      "Understand dramatic techniques (soliloquy, aside, dialogue)",
      "Evaluate staging, setting, and dramatic conflict"
    ],
    recommended_content: "Elements of Drama:\n- Plot (exposition, rising action, climax, falling action, resolution)\n- Character and Characterization\n- Theme and Subject Matter\n- Setting (time, place, atmosphere)\n- Dialogue and Diction\n- Stage Directions\n\n**Types of Drama:**\n1. Tragedy - Serious, ends in death/disaster\n2. Comedy - Humorous, happy ending\n3. Tragicomedy - Mix of both\n4. Melodrama - Exaggerated emotions\n5. Farce - Physical comedy\n\n**Dramatic Techniques:**\n- Soliloquy, Aside, Monologue\n- Dramatic Irony\n- Comic Relief\n- Prologue and Epilogue",
    difficulty_level: "medium",
    estimated_reading_time: 55,
    order_index: 3
  },
  {
    subject: "literature",
    topic: "African Drama - Set Texts",
    subtopic: "Analysis of Prescribed African Plays",
    objectives: [
      "Analyze themes, characters, and plot in African drama",
      "Understand the socio-cultural context of African plays",
      "Identify African dramatic traditions and techniques",
      "Compare African and Western dramatic conventions",
      "Evaluate the language and style of African playwrights"
    ],
    recommended_content: "JAMB Prescribed African Drama:\n\n**Common Set Texts:**\n1. The Lion and the Jewel - Wole Soyinka\n2. The Marriage of Anansewa - Efua Sutherland\n3. The Gods Are Not to Blame - Ola Rotimi\n4. Wedlock of the Gods - Zulu Sofola\n5. Harvest of Corruption - Frank Ogodo Ogbeche\n\n**Key Themes in African Drama:**\n- Tradition vs Modernity\n- Colonial and Post-colonial struggles\n- Gender and Marriage\n- Power and Corruption\n- Cultural Identity",
    difficulty_level: "hard",
    estimated_reading_time: 90,
    order_index: 4
  },
  {
    subject: "literature",
    topic: "Non-African Drama - Set Texts",
    subtopic: "Analysis of Prescribed Non-African Plays",
    objectives: [
      "Analyze themes, characters, and plot in non-African drama",
      "Understand historical and cultural contexts of Western plays",
      "Identify elements of Greek tragedy and Shakespearean drama",
      "Compare dramatic traditions across cultures",
      "Evaluate universal themes in world drama"
    ],
    recommended_content: "JAMB Prescribed Non-African Drama:\n\n**Common Set Texts:**\n1. Othello - William Shakespeare\n2. A Raisin in the Sun - Lorraine Hansberry\n3. Look Back in Anger - John Osborne\n4. Arms and the Man - George Bernard Shaw\n5. The Blood of a Stranger - Dele Charley\n\n**Key Themes:**\n- Love and Jealousy\n- Racial Discrimination\n- Social Class and Identity\n- War and Peace\n- Family and Society",
    difficulty_level: "hard",
    estimated_reading_time: 90,
    order_index: 5
  },
  {
    subject: "literature",
    topic: "Prose Fiction",
    subtopic: "Elements of Prose and Novel Analysis",
    objectives: [
      "Define prose and identify its forms",
      "Analyze narrative techniques (point of view, narrative voice)",
      "Evaluate plot structure and characterization in novels",
      "Identify themes and stylistic features in prose fiction",
      "Distinguish between different types of novels"
    ],
    recommended_content: "Elements of Prose Fiction:\n- Plot and Structure\n- Setting (Time, Place, Atmosphere)\n- Characterization (Flat/Round, Static/Dynamic)\n- Point of View (1st person, 3rd person limited/omniscient)\n- Theme and Motif\n- Style and Language\n\n**Types of Novels:**\n- Epistolary Novel\n- Picaresque Novel\n- Bildungsroman (Coming-of-age)\n- Historical Novel\n- Satirical Novel\n- Social Protest Novel",
    difficulty_level: "medium",
    estimated_reading_time: 50,
    order_index: 6
  },
  {
    subject: "literature",
    topic: "African Prose - Set Texts",
    subtopic: "Analysis of Prescribed African Novels",
    objectives: [
      "Analyze major themes in African prose fiction",
      "Understand the historical and cultural context of African novels",
      "Evaluate characterization and narrative techniques",
      "Identify the use of African oral tradition in written fiction",
      "Appreciate the contributions of African novelists to world literature"
    ],
    recommended_content: "JAMB Prescribed African Prose:\n\n**Common Set Texts:**\n1. Second Class Citizen - Buchi Emecheta\n2. The Beautyful Ones Are Not Yet Born - Ayi Kwei Armah\n3. Faceless - Amma Darko\n4. Native Son - Richard Wright\n5. Purple Hibiscus - Chimamanda Ngozi Adichie\n\n**Major Themes:**\n- Gender and Womanhood\n- Colonialism and Independence\n- Corruption and Disillusionment\n- Family and Tradition\n- Migration and Identity",
    difficulty_level: "hard",
    estimated_reading_time: 120,
    order_index: 7
  },
  {
    subject: "literature",
    topic: "Non-African Prose - Set Texts",
    subtopic: "Analysis of Prescribed Non-African Novels",
    objectives: [
      "Analyze themes, style, and characterization in non-African novels",
      "Understand the socio-historical context of Western prose fiction",
      "Compare narrative techniques across different literary traditions",
      "Evaluate the universal appeal of non-African prose",
      "Identify influences of non-African literature on African writing"
    ],
    recommended_content: "JAMB Prescribed Non-African Prose:\n\n**Common Set Texts:**\n1. Animal Farm - George Orwell\n2. The Old Man and the Sea - Ernest Hemingway\n3. Invisible Man - Ralph Ellison\n4. Lord of the Flies - William Golding\n5. Things Fall Apart - Chinua Achebe\n\n**Major Themes:**\n- Power and Corruption\n- Man vs Nature\n- Social Justice and Equality\n- Civilization vs Savagery\n- Colonialism and Culture Clash",
    difficulty_level: "hard",
    estimated_reading_time: 120,
    order_index: 8
  },
  {
    subject: "literature",
    topic: "Poetry",
    subtopic: "Elements and Forms of Poetry",
    objectives: [
      "Define poetry and identify its elements",
      "Distinguish between various poetic forms (sonnet, ode, elegy, ballad)",
      "Analyze rhythm, meter, and rhyme schemes",
      "Interpret imagery, symbolism, and figurative language in poems",
      "Appreciate the musicality and aesthetic qualities of poetry"
    ],
    recommended_content: "Elements of Poetry:\n- Diction and Imagery\n- Rhythm and Meter (iambic, trochaic, etc.)\n- Rhyme Scheme (ABAB, ABBA, etc.)\n- Stanza Structure\n- Tone and Mood\n- Sound Devices\n\n**Poetic Forms:**\n- Sonnet (Petrarchan, Shakespearean)\n- Ode, Elegy, Ballad\n- Epic, Lyric, Dramatic\n- Free Verse, Blank Verse\n- Haiku, Limerick",
    difficulty_level: "hard",
    estimated_reading_time: 60,
    order_index: 9
  },
  {
    subject: "literature",
    topic: "African Poetry - Set Texts",
    subtopic: "Analysis of Prescribed African Poems",
    objectives: [
      "Analyze themes, imagery, and style in African poetry",
      "Understand the cultural and historical context of African poems",
      "Identify the influence of oral tradition on African poetry",
      "Appreciate the diversity of African poetic voices",
      "Evaluate the language and techniques of African poets"
    ],
    recommended_content: "JAMB Prescribed African Poetry:\n\n**Common Poems/Poets:**\n1. Piano and Drums - Gabriel Okara\n2. Ambush - Gbemisola Adeoti\n3. The Panic of Growing Older - Lenrie Peters\n4. The Anvil and the Hammer - Kofi Awoonor\n5. Vanity - Birago Diop\n6. Telephone Conversation - Wole Soyinka\n7. Abiku - J.P. Clark\n\n**Major Themes:**\n- African Identity and Culture\n- Colonialism and Its Effects\n- Nature and the Environment\n- Life, Death, and Spirituality\n- Social and Political Commentary",
    difficulty_level: "hard",
    estimated_reading_time: 90,
    order_index: 10
  },
  {
    subject: "literature",
    topic: "Non-African Poetry - Set Texts",
    subtopic: "Analysis of Prescribed Non-African Poems",
    objectives: [
      "Analyze themes, imagery, and style in non-African poetry",
      "Understand the historical and literary context of Western poetry",
      "Compare African and non-African poetic traditions",
      "Identify universal themes in world poetry",
      "Appreciate the contributions of major world poets"
    ],
    recommended_content: "JAMB Prescribed Non-African Poetry:\n\n**Common Poems/Poets:**\n1. The Journey of the Magi - T.S. Eliot\n2. Crossing the Bar - Alfred, Lord Tennyson\n3. The Road Not Taken - Robert Frost\n4. Birches - Robert Frost\n5. Shall I Compare Thee... (Sonnet 18) - Shakespeare\n6. Not Waving But Drowning - Stevie Smith\n\n**Major Themes:**\n- Love and Beauty\n- Nature and Seasons\n- Life's Journey and Choices\n- Death and Mortality\n- Faith and Spirituality",
    difficulty_level: "hard",
    estimated_reading_time: 90,
    order_index: 11
  },

  // ==================== GOVERNMENT ====================
  {
    subject: "government",
    topic: "Basic Concepts of Government",
    subtopic: "Fundamental Terms and Definitions",
    objectives: [
      "Define government and identify its types",
      "Explain the concept of the state and its features",
      "Distinguish between state, nation, and country",
      "Understand sovereignty and its characteristics",
      "Analyze concepts of legitimacy and political authority"
    ],
    recommended_content: "General Aims:\n- Understanding of basic political concepts\n- Appreciation of the structures and processes of government\n- Knowledge of the Nigerian political system\n- Comparison with other political systems\n- Development of responsible citizenship\n\n**Key Concepts:**\n- Government: Definition, functions, types\n- State: Features (population, territory, government, sovereignty)\n- Power, Authority, Legitimacy\n- Sovereignty (internal & external)\n- Political Culture and Socialization\n\nRecommended Textbooks:\n1. Essential Government by C.C. Dibie\n2. Fundamentals of Government by Oyeleye Oyediran\n3. Comprehensive Government by J.A. Anyaele",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 1
  },
  {
    subject: "government",
    topic: "Forms of Government",
    subtopic: "Types and Systems of Government",
    objectives: [
      "Distinguish between different forms of government",
      "Compare presidential and parliamentary systems",
      "Analyze unitary, federal, and confederal systems",
      "Evaluate advantages and disadvantages of each system",
      "Understand the concept of separation of powers"
    ],
    recommended_content: "Forms of Government:\n\n**By Participation:**\n- Democracy (Direct, Indirect/Representative)\n- Autocracy, Oligarchy, Theocracy\n- Monarchy (Absolute, Constitutional)\n- Military Rule\n\n**By Structure:**\n- Unitary System\n- Federal System\n- Confederal System\n\n**By Executive-Legislative Relationship:**\n- Presidential System\n- Parliamentary (Cabinet) System\n\n**Key Principles:**\n- Separation of Powers\n- Checks and Balances\n- Rule of Law",
    difficulty_level: "medium",
    estimated_reading_time: 55,
    order_index: 2
  },
  {
    subject: "government",
    topic: "Arms of Government",
    subtopic: "Legislature, Executive, and Judiciary",
    objectives: [
      "Explain the functions of each arm of government",
      "Analyze the structure of legislative bodies",
      "Understand executive powers and responsibilities",
      "Evaluate the role of the judiciary in governance",
      "Apply the principle of separation of powers"
    ],
    recommended_content: "**The Legislature:**\n- Types: Unicameral, Bicameral\n- Functions: Law-making, oversight, representation\n- Legislative processes\n\n**The Executive:**\n- Types: Ceremonial, Political\n- Functions: Policy implementation, administration\n- Cabinet and civil service\n\n**The Judiciary:**\n- Types of courts (Supreme, Appeal, High)\n- Functions: Interpretation, adjudication\n- Independence of the judiciary\n\n**Checks and Balances:**\n- How each arm checks the others\n- Constitutional safeguards",
    difficulty_level: "medium",
    estimated_reading_time: 60,
    order_index: 3
  },
  {
    subject: "government",
    topic: "Political Parties and Pressure Groups",
    subtopic: "Political Organizations and Interest Groups",
    objectives: [
      "Define political parties and identify their functions",
      "Distinguish between one-party, two-party, and multi-party systems",
      "Explain the role of pressure groups in politics",
      "Compare political parties and pressure groups",
      "Analyze the impact of these organizations on democracy"
    ],
    recommended_content: "**Political Parties:**\n- Definition and characteristics\n- Types: Ideological, Cadre, Mass, Broker\n- Functions: Aggregation, socialization, recruitment\n- Party systems: One-party, Two-party, Multi-party\n\n**Pressure Groups:**\n- Definition and types (Professional, Trade, Civic)\n- Functions: Interest representation, education\n- Methods: Lobbying, demonstrations, media\n\n**Comparison:**\n- Objectives (power vs influence)\n- Membership and organization\n- Methods and strategies",
    difficulty_level: "medium",
    estimated_reading_time: 50,
    order_index: 4
  },
  {
    subject: "government",
    topic: "Elections and Electoral Systems",
    subtopic: "Voting and Electoral Processes",
    objectives: [
      "Explain the importance of elections in democracy",
      "Distinguish between different electoral systems",
      "Analyze the electoral process from registration to declaration",
      "Evaluate the role of electoral commissions",
      "Identify problems and solutions in electoral systems"
    ],
    recommended_content: "**Electoral Systems:**\n- First-Past-The-Post (Simple Majority)\n- Proportional Representation\n- Second Ballot System\n- Mixed Systems\n\n**Electoral Process:**\n- Voter registration\n- Nomination of candidates\n- Campaigning and party manifestos\n- Voting and counting\n- Declaration of results\n\n**Electoral Commission:**\n- Structure and composition\n- Functions and powers\n- Independence and challenges\n\n**Electoral Malpractices:**\n- Types: Rigging, violence, vote-buying\n- Prevention and remedies",
    difficulty_level: "medium",
    estimated_reading_time: 55,
    order_index: 5
  },
  {
    subject: "government",
    topic: "Constitution",
    subtopic: "Types and Features of Constitutions",
    objectives: [
      "Define constitution and explain its importance",
      "Distinguish between written and unwritten constitutions",
      "Compare flexible and rigid constitutions",
      "Analyze the features of a good constitution",
      "Understand constitutional supremacy and amendment"
    ],
    recommended_content: "**Types of Constitution:**\n- Written vs Unwritten\n- Rigid vs Flexible\n- Federal vs Unitary\n- Presidential vs Parliamentary\n\n**Sources of Constitution:**\n- Legislation, Customs\n- Judicial precedents\n- Constitutional conventions\n\n**Features:**\n- Supremacy, Rule of Law\n- Separation of powers\n- Fundamental rights\n- Amendment procedures\n\n**Nigerian Constitutional History:**\n- 1922, 1946, 1951, 1954, 1960, 1963\n- 1979, 1999 Constitutions",
    difficulty_level: "hard",
    estimated_reading_time: 60,
    order_index: 6
  },
  {
    subject: "government",
    topic: "Nigerian Government: Pre-Colonial Era",
    subtopic: "Traditional Political Systems in Nigeria",
    objectives: [
      "Describe the pre-colonial political systems in Nigeria",
      "Analyze the Hausa-Fulani Emirate system",
      "Evaluate the Yoruba traditional political organization",
      "Understand the Igbo acephalous system",
      "Compare centralized and non-centralized systems"
    ],
    recommended_content: "**Hausa-Fulani Emirate System:**\n- The Emir and his council\n- Hierarchical administration\n- Sharia law and taxation\n- Features and criticism\n\n**Yoruba Political System:**\n- The Oba and chiefs\n- Oyo Empire structure\n- Checks and balances\n- Council of chiefs\n\n**Igbo Political System:**\n- Decentralized/acephalous system\n- Age grades and title societies\n- Village assembly and elders\n- Democratic features\n\n**Other Systems:**\n- Benin Kingdom\n- Sokoto Caliphate",
    difficulty_level: "medium",
    estimated_reading_time: 55,
    order_index: 7
  },
  {
    subject: "government",
    topic: "Nigerian Government: Colonial Era",
    subtopic: "British Colonial Administration in Nigeria",
    objectives: [
      "Explain the process of British colonization of Nigeria",
      "Analyze the system of indirect rule and its features",
      "Evaluate the reasons for and effects of amalgamation",
      "Assess the impact of colonialism on Nigerian politics",
      "Trace the constitutional development during colonial rule"
    ],
    recommended_content: "**Colonial Administration:**\n- Crown Colony System\n- Protectorate System\n- Indirect Rule System\n\n**Indirect Rule:**\n- Features and application\n- Successes and failures\n- Regional variations\n\n**Amalgamation (1914):**\n- Reasons for amalgamation\n- Lord Lugard's role\n- Effects on Nigeria\n\n**Constitutional Development:**\n- Clifford Constitution (1922)\n- Richards Constitution (1946)\n- Macpherson Constitution (1951)\n- Lyttleton Constitution (1954)\n- Independence Constitution (1960)",
    difficulty_level: "hard",
    estimated_reading_time: 65,
    order_index: 8
  },
  {
    subject: "government",
    topic: "Nigerian Government: Post-Independence",
    subtopic: "Nigeria's Political Development Since 1960",
    objectives: [
      "Trace Nigeria's political development from 1960 to date",
      "Analyze the causes and effects of military intervention",
      "Evaluate the various republics and their characteristics",
      "Understand the transition to democracy",
      "Assess current political challenges and developments"
    ],
    recommended_content: "**First Republic (1960-1966):**\n- Parliamentary system\n- Regional structure\n- Problems and collapse\n\n**Military Rule:**\n- Causes of military intervention\n- Military administrations (1966-1979, 1983-1999)\n- Impact on governance\n\n**Second Republic (1979-1983):**\n- Presidential system\n- 1979 Constitution features\n- Collapse\n\n**Third/Fourth Republic (1999-present):**\n- Return to democracy\n- 1999 Constitution\n- Reforms and challenges\n- State creation in Nigeria",
    difficulty_level: "hard",
    estimated_reading_time: 70,
    order_index: 9
  },
  {
    subject: "government",
    topic: "Federalism in Nigeria",
    subtopic: "Structure and Practice of Nigerian Federalism",
    objectives: [
      "Define federalism and explain its features",
      "Analyze the structure of Nigerian federalism",
      "Evaluate the revenue allocation formula",
      "Assess inter-governmental relations",
      "Identify challenges of federalism in Nigeria"
    ],
    recommended_content: "**Features of Federalism:**\n- Division of powers\n- Written constitution\n- Supreme court\n- Multiple levels of government\n\n**Nigerian Federal Structure:**\n- Federal, State, Local governments\n- Exclusive, Concurrent, Residual lists\n- State creation history\n\n**Revenue Allocation:**\n- Vertical and horizontal allocation\n- Derivation principle\n- Revenue Mobilization Commission\n\n**Challenges:**\n- Fiscal federalism\n- Resource control debate\n- True federalism advocacy",
    difficulty_level: "hard",
    estimated_reading_time: 60,
    order_index: 10
  },
  {
    subject: "government",
    topic: "International Organizations",
    subtopic: "Global and Regional Bodies",
    objectives: [
      "Explain the formation and objectives of the UN",
      "Analyze the structure and functions of UN organs",
      "Understand Nigeria's role in international organizations",
      "Evaluate regional organizations (AU, ECOWAS)",
      "Assess the impact of international organizations"
    ],
    recommended_content: "**United Nations (UN):**\n- Formation and objectives\n- Principal organs: General Assembly, Security Council\n- Specialized agencies: WHO, UNESCO, UNICEF\n- Nigeria's role in UN\n\n**African Union (AU):**\n- From OAU to AU\n- Objectives and structure\n- Achievements and challenges\n\n**ECOWAS:**\n- Formation and objectives\n- Structure and institutions\n- ECOMOG and peacekeeping\n- Economic integration efforts\n\n**Other Organizations:**\n- Commonwealth of Nations\n- OPEC, NAM",
    difficulty_level: "medium",
    estimated_reading_time: 55,
    order_index: 11
  },
  {
    subject: "government",
    topic: "Public Administration",
    subtopic: "Civil Service and Public Bureaucracy",
    objectives: [
      "Define public administration and its scope",
      "Explain the structure of the civil service",
      "Analyze the functions of public corporations",
      "Evaluate civil service reforms in Nigeria",
      "Understand the concept of accountability and control"
    ],
    recommended_content: "**Civil Service:**\n- Definition and characteristics\n- Structure and hierarchy\n- Recruitment and training\n- Neutrality and anonymity\n\n**Public Corporations:**\n- Types and formation\n- Functions and management\n- Control and accountability\n- Privatization in Nigeria\n\n**Local Government:**\n- Structure and functions\n- Sources of revenue\n- Challenges and reforms\n\n**Reforms:**\n- Various civil service reforms\n- Udoji Commission\n- Current reform initiatives",
    difficulty_level: "medium",
    estimated_reading_time: 50,
    order_index: 12
  },

  // ==================== CHRISTIAN RELIGIOUS STUDIES (CRS) ====================
  {
    subject: "crs",
    topic: "The Creation Account",
    subtopic: "God's Creation and Purpose",
    objectives: [
      "Narrate the biblical account of creation",
      "Explain the purpose of creation",
      "Analyze the relationship between God and creation",
      "Understand the position of humans in creation",
      "Apply lessons from creation to daily life"
    ],
    recommended_content: "General Aims:\n- Knowledge of the Bible and Christian teachings\n- Understanding of God's relationship with humanity\n- Application of Christian principles to daily life\n- Development of moral character and values\n\n**Creation Narrative (Genesis 1-2):**\n- Day-by-day creation account\n- Creation of man and woman\n- Garden of Eden\n- Purpose and stewardship\n\n**Key Themes:**\n- God as Creator and Sustainer\n- Goodness of creation\n- Human dignity and responsibility\n- Sabbath rest\n\nRecommended Textbooks:\n1. Essential Christian Religious Knowledge by F.I.A. Onaiyekan\n2. Christian Religious Studies for SSS by Oghenebrume\n3. The Holy Bible (RSV or NIV)",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 1
  },
  {
    subject: "crs",
    topic: "The Fall of Man",
    subtopic: "Sin and Its Consequences",
    objectives: [
      "Explain the narrative of the fall in Genesis 3",
      "Identify the consequences of disobedience",
      "Analyze the concept of original sin",
      "Understand God's response to human sin",
      "Apply lessons from the fall to moral decisions"
    ],
    recommended_content: "**The Fall (Genesis 3):**\n- The serpent's temptation\n- Eve and Adam's disobedience\n- Knowledge of good and evil\n- Hiding from God\n\n**Consequences:**\n- Curse on the serpent\n- Pain in childbearing\n- Toil and labor\n- Death and separation from God\n- Expulsion from Eden\n\n**Key Themes:**\n- Free will and choice\n- Consequences of sin\n- God's mercy (promise of redemption)\n- Relationship between humanity and nature",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 2
  },
  {
    subject: "crs",
    topic: "The Patriarchs",
    subtopic: "Abraham, Isaac, Jacob, and Joseph",
    objectives: [
      "Narrate the call and faith of Abraham",
      "Explain the covenant between God and Abraham",
      "Trace the stories of Isaac, Jacob, and Joseph",
      "Identify themes of faith, obedience, and providence",
      "Apply lessons from the patriarchs to contemporary life"
    ],
    recommended_content: "**Abraham:**\n- Call and journey (Genesis 12)\n- Covenant and promises\n- Faith tested (Isaac's sacrifice)\n- Father of faith\n\n**Isaac:**\n- Birth and near-sacrifice\n- Marriage to Rebekah\n- Blessing of Jacob and Esau\n\n**Jacob:**\n- Birthright and blessing\n- Wrestling with God (Israel)\n- Twelve sons\n\n**Joseph:**\n- Dreams and jealousy\n- Slavery and imprisonment\n- Rise to power in Egypt\n- Forgiveness and reconciliation\n\n**Key Themes:**\n- Faith and obedience\n- God's providence\n- Covenant relationship\n- Forgiveness",
    difficulty_level: "medium",
    estimated_reading_time: 60,
    order_index: 3
  },
  {
    subject: "crs",
    topic: "Moses and the Exodus",
    subtopic: "Deliverance from Egypt",
    objectives: [
      "Narrate the birth and call of Moses",
      "Explain the plagues and Passover",
      "Describe the crossing of the Red Sea",
      "Understand the covenant at Sinai",
      "Apply lessons of deliverance to modern contexts"
    ],
    recommended_content: "**Moses' Early Life:**\n- Birth and preservation\n- Education in Egypt\n- Flight to Midian\n- Call at the burning bush\n\n**The Exodus:**\n- Confrontation with Pharaoh\n- Ten plagues of Egypt\n- The Passover institution\n- Crossing the Red Sea\n\n**Sinai Covenant:**\n- Journey to Sinai\n- Ten Commandments\n- Golden calf incident\n- Tabernacle construction\n\n**Key Themes:**\n- God as liberator\n- Faith and trust\n- Law and covenant\n- Leadership",
    difficulty_level: "hard",
    estimated_reading_time: 65,
    order_index: 4
  },
  {
    subject: "crs",
    topic: "The Ten Commandments",
    subtopic: "Divine Laws and Moral Principles",
    objectives: [
      "List and explain the Ten Commandments",
      "Categorize commandments (God-ward and human-ward)",
      "Analyze the moral principles in the commandments",
      "Evaluate the relevance of the commandments today",
      "Apply the commandments to ethical decision-making"
    ],
    recommended_content: "**The Ten Commandments (Exodus 20):**\n\n**God-ward (1-4):**\n1. No other gods\n2. No graven images\n3. Not taking God's name in vain\n4. Remember the Sabbath\n\n**Human-ward (5-10):**\n5. Honor parents\n6. No murder\n7. No adultery\n8. No stealing\n9. No false witness\n10. No covetousness\n\n**Significance:**\n- Foundation of moral law\n- Covenant obligations\n- Social order and justice\n- Relevance in modern society",
    difficulty_level: "medium",
    estimated_reading_time: 50,
    order_index: 5
  },
  {
    subject: "crs",
    topic: "The Judges and Kings",
    subtopic: "Leadership in Ancient Israel",
    objectives: [
      "Explain the role and function of judges",
      "Narrate stories of major judges (Deborah, Gideon, Samson)",
      "Analyze the transition from judges to monarchy",
      "Evaluate the reigns of Saul, David, and Solomon",
      "Identify lessons on leadership and faithfulness"
    ],
    recommended_content: "**The Judges:**\n- Period and pattern (sin-oppression-cry-deliverance)\n- Deborah - Female leadership\n- Gideon - Faith and testing\n- Samson - Strength and weakness\n- Samuel - Last judge, first prophet\n\n**The Kings:**\n- Demand for a king (1 Samuel 8)\n- Saul - First king, disobedience\n- David - Man after God's heart\n- Solomon - Wisdom and temple\n- Division of the kingdom\n\n**Key Themes:**\n- Leadership responsibility\n- Obedience vs disobedience\n- God's sovereignty\n- Consequences of choices",
    difficulty_level: "hard",
    estimated_reading_time: 70,
    order_index: 6
  },
  {
    subject: "crs",
    topic: "The Prophets",
    subtopic: "Major and Minor Prophets",
    objectives: [
      "Define the role of prophets in Israel",
      "Analyze the messages of major prophets (Isaiah, Jeremiah, Ezekiel)",
      "Study selected minor prophets (Amos, Hosea, Micah)",
      "Identify prophetic themes of justice and hope",
      "Apply prophetic messages to contemporary issues"
    ],
    recommended_content: "**Role of Prophets:**\n- Spokespersons for God\n- Social critics\n- Covenant enforcers\n- Predictors of future\n\n**Major Prophets:**\n- Isaiah - Messianic prophecies, comfort\n- Jeremiah - Weeping prophet, new covenant\n- Ezekiel - Visions, restoration\n- Daniel - Faithfulness, apocalyptic\n\n**Minor Prophets:**\n- Amos - Social justice\n- Hosea - God's faithful love\n- Micah - Justice, mercy, humility\n- Jonah - God's universal love\n\n**Common Themes:**\n- Judgment and restoration\n- Social justice\n- Faithfulness to covenant\n- Hope for the future",
    difficulty_level: "hard",
    estimated_reading_time: 75,
    order_index: 7
  },
  {
    subject: "crs",
    topic: "The Birth and Early Life of Jesus",
    subtopic: "Incarnation and Childhood",
    objectives: [
      "Narrate the events surrounding Jesus' birth",
      "Explain the significance of the incarnation",
      "Describe Jesus' childhood and growth",
      "Analyze the baptism and temptation of Jesus",
      "Identify the beginning of Jesus' ministry"
    ],
    recommended_content: "**Birth Narratives:**\n- Annunciation to Mary\n- Birth in Bethlehem\n- Visit of shepherds and magi\n- Presentation in the temple\n- Flight to Egypt\n\n**Childhood:**\n- Growth in Nazareth\n- Visit to temple at age 12\n- Years of obscurity\n\n**Beginning of Ministry:**\n- John the Baptist's ministry\n- Baptism of Jesus\n- Temptation in the wilderness\n- Calling of disciples\n\n**Key Themes:**\n- Fulfillment of prophecy\n- Divine-human nature\n- Humility and obedience\n- Preparation for ministry",
    difficulty_level: "medium",
    estimated_reading_time: 55,
    order_index: 8
  },
  {
    subject: "crs",
    topic: "The Teachings of Jesus",
    subtopic: "Parables and Sermon on the Mount",
    objectives: [
      "Explain Jesus' teaching methods",
      "Analyze major parables and their meanings",
      "Study the Sermon on the Mount (Matthew 5-7)",
      "Identify the ethical teachings of Jesus",
      "Apply Jesus' teachings to daily life"
    ],
    recommended_content: "**Teaching Methods:**\n- Parables - Earthly stories, heavenly meanings\n- Miracles as signs\n- Discourse and dialogue\n- Use of questions\n\n**Major Parables:**\n- Sower and seeds\n- Prodigal Son\n- Good Samaritan\n- Rich man and Lazarus\n- Talents/Minas\n\n**Sermon on the Mount:**\n- Beatitudes\n- Salt and light\n- Fulfilling the law\n- Lord's Prayer\n- Golden Rule\n\n**Key Themes:**\n- Kingdom of God\n- Love and forgiveness\n- Faith and trust\n- Justice and mercy",
    difficulty_level: "medium",
    estimated_reading_time: 65,
    order_index: 9
  },
  {
    subject: "crs",
    topic: "The Miracles of Jesus",
    subtopic: "Signs and Wonders",
    objectives: [
      "Categorize the miracles of Jesus",
      "Analyze the purpose and significance of miracles",
      "Study selected miracles in detail",
      "Understand the faith dimension in miracles",
      "Apply lessons from miracles to Christian living"
    ],
    recommended_content: "**Categories of Miracles:**\n\n**Healing Miracles:**\n- Blind Bartimaeus\n- Ten lepers\n- Paralytic at Bethesda\n- Woman with issue of blood\n\n**Nature Miracles:**\n- Calming the storm\n- Walking on water\n- Feeding 5000 and 4000\n- Water into wine\n\n**Resurrection Miracles:**\n- Jairus' daughter\n- Widow of Nain's son\n- Lazarus\n\n**Exorcisms:**\n- Gerasene demoniac\n- Boy with evil spirit\n\n**Purpose:**\n- Reveal Jesus' identity\n- Demonstrate compassion\n- Sign of God's kingdom\n- Call to faith",
    difficulty_level: "medium",
    estimated_reading_time: 60,
    order_index: 10
  },
  {
    subject: "crs",
    topic: "Passion, Death, and Resurrection",
    subtopic: "The Easter Events",
    objectives: [
      "Narrate the events of Holy Week",
      "Explain the significance of the Last Supper",
      "Describe the trial, crucifixion, and burial of Jesus",
      "Analyze the resurrection appearances",
      "Understand the theological significance of these events"
    ],
    recommended_content: "**Holy Week Events:**\n- Triumphal entry\n- Cleansing the temple\n- Last Supper (Lord's Supper)\n- Gethsemane prayer\n- Arrest and trials\n\n**Crucifixion:**\n- Pilate and Jewish leaders\n- Via Dolorosa\n- Seven words from the cross\n- Death and burial\n\n**Resurrection:**\n- Empty tomb\n- Appearances to disciples\n- Great Commission\n- Ascension\n\n**Significance:**\n- Atonement for sin\n- Victory over death\n- Foundation of faith\n- Hope of eternal life",
    difficulty_level: "hard",
    estimated_reading_time: 70,
    order_index: 11
  },
  {
    subject: "crs",
    topic: "The Early Church",
    subtopic: "Acts and Apostolic Ministry",
    objectives: [
      "Describe the events of Pentecost",
      "Explain the growth of the early church",
      "Analyze Peter's and Paul's ministries",
      "Study the council of Jerusalem",
      "Identify principles of church growth and unity"
    ],
    recommended_content: "**Pentecost:**\n- Coming of the Holy Spirit\n- Peter's sermon\n- First converts\n- Church fellowship\n\n**Church Growth:**\n- Ananias and Sapphira\n- Persecution and scattering\n- Stephen's martyrdom\n- Spread to Samaria and beyond\n\n**Peter's Ministry:**\n- Healing miracles\n- Cornelius' conversion\n- Vision of clean/unclean\n\n**Paul's Ministry:**\n- Conversion on Damascus road\n- Missionary journeys\n- Epistles to churches\n\n**Jerusalem Council:**\n- Gentile inclusion\n- Requirements for believers\n- Church unity",
    difficulty_level: "hard",
    estimated_reading_time: 65,
    order_index: 12
  },
  {
    subject: "crs",
    topic: "Christian Living",
    subtopic: "Ethics and Practical Christianity",
    objectives: [
      "Explain the concept of Christian discipleship",
      "Analyze Paul's teachings on Christian living",
      "Study the fruits of the Spirit",
      "Understand Christian perspectives on social issues",
      "Apply Christian ethics to contemporary situations"
    ],
    recommended_content: "**Discipleship:**\n- Following Christ\n- Counting the cost\n- Denying self\n- Taking up the cross\n\n**Fruits of the Spirit (Galatians 5):**\n- Love, Joy, Peace\n- Patience, Kindness, Goodness\n- Faithfulness, Gentleness, Self-control\n\n**Works of the Flesh:**\n- Contrast with spiritual fruit\n- Warning against sin\n\n**Social Issues:**\n- Marriage and family\n- Work and relationships\n- Citizenship and authority\n- Wealth and poverty\n- Justice and compassion\n\n**Spiritual Disciplines:**\n- Prayer and fasting\n- Bible study\n- Fellowship and service",
    difficulty_level: "medium",
    estimated_reading_time: 55,
    order_index: 13
  },

  // ==================== HISTORY ====================
  {
    subject: "history",
    topic: "Introduction to History",
    subtopic: "Historical Methods and Sources",
    objectives: [
      "Define history and explain its importance",
      "Identify types of historical sources",
      "Distinguish between primary and secondary sources",
      "Understand the work of historians",
      "Apply historical methods to analyze evidence"
    ],
    recommended_content: "General Aims:\n- Understanding of past events and their significance\n- Development of analytical and critical thinking\n- Appreciation of Nigeria's place in African and world history\n- Cultivation of national consciousness and identity\n\n**What is History?**\n- Definition and scope\n- Importance of studying history\n- History as a discipline\n\n**Sources of History:**\n- Primary sources (documents, artifacts, eyewitness accounts)\n- Secondary sources (textbooks, articles)\n- Oral traditions\n- Archaeological evidence\n\n**Historical Methods:**\n- Gathering evidence\n- Analyzing sources\n- Interpretation and narrative\n\nRecommended Textbooks:\n1. History of West Africa by J.F. Ade Ajayi\n2. Nigerian History for SSS by Oguntomsin\n3. A History of Nigeria by Toyin Falola",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 1
  },
  {
    subject: "history",
    topic: "Pre-Colonial Nigerian Societies",
    subtopic: "Early Civilizations and Kingdoms",
    objectives: [
      "Describe the major pre-colonial societies in Nigeria",
      "Analyze the political systems of Hausa states, Yoruba kingdoms, and Igbo communities",
      "Explain the origins and growth of these societies",
      "Evaluate their economic and social structures",
      "Assess their contributions to Nigerian heritage"
    ],
    recommended_content: "**Hausa States and Kingdoms:**\n- The Hausa Bakwai (Seven True States)\n- Kano, Katsina, Zaria, etc.\n- Political organization (Sarki)\n- Trade and economy\n- Spread of Islam\n\n**Yoruba Kingdoms:**\n- Ile-Ife as origin\n- Oyo Empire rise and fall\n- Political structure (Oba, Oyo Mesi)\n- Benin Kingdom\n\n**Igbo Society:**\n- Decentralized system\n- Nri hegemony\n- Democratic institutions\n- Age grades and title societies\n\n**Other Groups:**\n- Nupe, Jukun, Tiv\n- Niger Delta states\n- Cross River peoples",
    difficulty_level: "hard",
    estimated_reading_time: 70,
    order_index: 2
  },
  {
    subject: "history",
    topic: "The Sokoto Caliphate",
    subtopic: "The Jihad and its Impact",
    objectives: [
      "Explain the causes of the Fulani Jihad",
      "Analyze the leadership of Usman Dan Fodio",
      "Describe the structure of the Sokoto Caliphate",
      "Evaluate the impact of the jihad on Hausaland",
      "Assess the legacy of the Sokoto Caliphate"
    ],
    recommended_content: "**Background:**\n- Pre-jihad Hausaland\n- Usman Dan Fodio's life and education\n- Grievances against Hausa rulers\n\n**The Jihad (1804-1808):**\n- Declaration and early battles\n- Support from different groups\n- Military campaigns\n- Fall of Hausa states\n\n**Sokoto Caliphate:**\n- Political structure (Sultan, Emirs)\n- Administrative system\n- Judicial system (Sharia)\n- Economic organization\n\n**Impact:**\n- Religious transformation\n- Political unification\n- Educational development\n- Social changes",
    difficulty_level: "hard",
    estimated_reading_time: 65,
    order_index: 3
  },
  {
    subject: "history",
    topic: "European Contact and Slave Trade",
    subtopic: "The Atlantic Slave Trade and Its Effects",
    objectives: [
      "Explain the origins of European contact with Africa",
      "Describe the organization of the Atlantic slave trade",
      "Analyze the effects of the slave trade on African societies",
      "Evaluate the abolition movement",
      "Assess the transition to legitimate trade"
    ],
    recommended_content: "**European Contact:**\n- Portuguese explorers (15th century)\n- Establishment of trading posts\n- Early trade items\n\n**The Slave Trade:**\n- Triangular trade system\n- Middle Passage\n- Major slave ports in Nigeria\n- Role of African middlemen\n\n**Effects on Africa:**\n- Demographic impact\n- Political instability\n- Economic distortion\n- Social disruption\n\n**Abolition:**\n- Humanitarian movement\n- British abolition (1807)\n- Enforcement efforts\n- Transition to palm oil trade\n\n**Legitimate Commerce:**\n- Palm oil economy\n- New trading relationships\n- Continued European interest",
    difficulty_level: "hard",
    estimated_reading_time: 70,
    order_index: 4
  },
  {
    subject: "history",
    topic: "British Colonization of Nigeria",
    subtopic: "Conquest and Colonial Administration",
    objectives: [
      "Explain the process of British conquest of Nigeria",
      "Analyze the different methods of colonial control",
      "Describe the system of indirect rule",
      "Evaluate the impact of colonialism on Nigeria",
      "Assess the significance of the 1914 amalgamation"
    ],
    recommended_content: "**Conquest:**\n- Lagos annexation (1861)\n- Treaties with local rulers\n- Royal Niger Company\n- Conquest of the North\n- Conquest of the East\n\n**Colonial Administration:**\n- Crown Colony (Lagos)\n- Protectorates (North, South)\n- Lord Lugard's role\n- Amalgamation (1914)\n\n**Indirect Rule:**\n- Features and principles\n- Application in different regions\n- Successes and failures\n- Warrant Chiefs in the East\n\n**Impact:**\n- Political changes\n- Economic exploitation\n- Social transformation\n- Cultural effects",
    difficulty_level: "hard",
    estimated_reading_time: 75,
    order_index: 5
  },
  {
    subject: "history",
    topic: "Nigerian Nationalism",
    subtopic: "The Struggle for Independence",
    objectives: [
      "Explain the factors that led to the rise of nationalism",
      "Identify major nationalist leaders and organizations",
      "Analyze the constitutional developments toward independence",
      "Evaluate the contributions of different nationalist movements",
      "Describe the events leading to independence in 1960"
    ],
    recommended_content: "**Factors for Nationalism:**\n- Effects of World War II\n- Educated elite\n- Pan-Africanism\n- Colonial exploitation\n- Press and media\n\n**Early Nationalists:**\n- Herbert Macaulay\n- NNDP formation\n- Lagos politics\n\n**Later Nationalists:**\n- Nnamdi Azikiwe (NCNC)\n- Obafemi Awolowo (AG)\n- Ahmadu Bello (NPC)\n\n**Constitutional Development:**\n- Clifford (1922)\n- Richards (1946)\n- Macpherson (1951)\n- Lyttleton (1954)\n- Independence (1960)\n\n**Path to Independence:**\n- Regional self-government\n- Federal negotiations\n- October 1, 1960",
    difficulty_level: "hard",
    estimated_reading_time: 70,
    order_index: 6
  },
  {
    subject: "history",
    topic: "Post-Independence Nigeria",
    subtopic: "Political Development Since 1960",
    objectives: [
      "Analyze the First Republic and its challenges",
      "Explain the causes and effects of the civil war",
      "Describe the various military and civilian governments",
      "Evaluate Nigeria's transition to democracy",
      "Assess contemporary political developments"
    ],
    recommended_content: "**First Republic (1960-1966):**\n- Parliamentary system\n- Regional politics\n- Census and election crises\n- Military coup\n\n**Civil War (1967-1970):**\n- Causes and outbreak\n- Biafran secession\n- War and its impact\n- Reconciliation\n\n**Military Rule:**\n- Gowon to Murtala/Obasanjo\n- Second Republic (1979-1983)\n- Buhari and Babangida\n- Abacha era\n\n**Fourth Republic (1999-present):**\n- Return to democracy\n- Democratic consolidation\n- Challenges and achievements\n- Contemporary issues",
    difficulty_level: "hard",
    estimated_reading_time: 80,
    order_index: 7
  },
  {
    subject: "history",
    topic: "West African History",
    subtopic: "Major Empires and Civilizations",
    objectives: [
      "Describe the major West African empires",
      "Analyze the rise and fall of Ghana, Mali, and Songhai",
      "Explain the trans-Saharan trade",
      "Evaluate the impact of Islam on West Africa",
      "Assess the contributions of these empires to African civilization"
    ],
    recommended_content: "**Ghana Empire:**\n- Origins and location\n- Political organization\n- Trade and economy\n- Decline\n\n**Mali Empire:**\n- Rise under Sundiata\n- Mansa Musa's reign\n- Timbuktu as center of learning\n- Decline\n\n**Songhai Empire:**\n- Rise under Sonni Ali\n- Askia Muhammad\n- Administration and expansion\n- Moroccan invasion (1591)\n\n**Trans-Saharan Trade:**\n- Trade routes\n- Goods traded (gold, salt, slaves)\n- Impact on societies\n\n**Islam in West Africa:**\n- Spread and adoption\n- Centers of learning\n- Social and political impact",
    difficulty_level: "hard",
    estimated_reading_time: 75,
    order_index: 8
  },
  {
    subject: "history",
    topic: "Colonialism in West Africa",
    subtopic: "The Scramble for Africa",
    objectives: [
      "Explain the motives for European colonization",
      "Describe the Berlin Conference and its outcomes",
      "Analyze colonial policies in different territories",
      "Compare British and French colonial systems",
      "Evaluate African resistance to colonialism"
    ],
    recommended_content: "**Motives for Colonization:**\n- Economic interests\n- Political and strategic reasons\n- Social Darwinism\n- Missionary activities\n\n**Berlin Conference (1884-1885):**\n- Partitioning of Africa\n- Rules of occupation\n- Arbitrary boundaries\n\n**Colonial Policies:**\n- British indirect rule\n- French assimilation/association\n- Portuguese and German colonies\n\n**African Resistance:**\n- Military resistance\n- Samori Ture\n- Ashanti resistance\n- Religious movements\n\n**Impact of Colonialism:**\n- Political changes\n- Economic exploitation\n- Social transformation\n- Legacy and neo-colonialism",
    difficulty_level: "hard",
    estimated_reading_time: 70,
    order_index: 9
  },
  {
    subject: "history",
    topic: "World History",
    subtopic: "Major World Events and Movements",
    objectives: [
      "Analyze the causes and effects of World War I",
      "Explain the rise of fascism and World War II",
      "Describe the Cold War and its global impact",
      "Evaluate decolonization movements worldwide",
      "Assess the emergence of the modern world order"
    ],
    recommended_content: "**World War I (1914-1918):**\n- Causes (imperialism, nationalism, alliances)\n- Major events and turning points\n- Impact on colonies\n- Treaty of Versailles\n\n**Interwar Period:**\n- Rise of dictatorships\n- Great Depression\n- League of Nations\n\n**World War II (1939-1945):**\n- Causes and outbreak\n- Major theaters\n- Holocaust\n- End of war\n\n**Cold War:**\n- Superpowers rivalry\n- Proxy wars\n- Africa in the Cold War\n\n**Decolonization:**\n- Asian independence\n- African independence movements\n- Non-Aligned Movement",
    difficulty_level: "hard",
    estimated_reading_time: 85,
    order_index: 10
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting art syllabus seeding...');
    console.log(`Total topics to seed: ${artSyllabus.length}`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const topic of artSyllabus) {
      // Check if topic already exists
      const { data: existing } = await supabase
        .from('jamb_syllabus')
        .select('id')
        .eq('subject', topic.subject)
        .eq('topic', topic.topic)
        .maybeSingle();

      if (existing) {
        skippedCount++;
        continue;
      }

      const { error } = await supabase
        .from('jamb_syllabus')
        .insert(topic);

      if (error) {
        console.error(`Error inserting ${topic.subject} - ${topic.topic}:`, error);
      } else {
        insertedCount++;
      }
    }

    console.log(`Seeding complete. Inserted: ${insertedCount}, Skipped: ${skippedCount}`);

    // Get current counts by subject
    const { data: counts } = await supabase
      .from('jamb_syllabus')
      .select('subject');

    const subjectCounts: Record<string, number> = {};
    if (counts) {
      counts.forEach((item: { subject: string }) => {
        subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Art syllabus seeded successfully`,
        inserted: insertedCount,
        skipped: skippedCount,
        subjectCounts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding art syllabus:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
