import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS = [
  // 1. BASIC CONCEPTS OF GOVERNMENT
  {
    subject: "government",
    topic: "Basic Concepts of Government",
    subtopic: "Fundamental Terms and Definitions",
    title: "Government — Power, Authority, and the State",
    learning_objectives: [
      "Define government and distinguish it from the state",
      "Explain concepts of power, authority, and legitimacy",
      "Identify the features of a state",
      "Understand sovereignty and its types",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "govt_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Why do people obey the law? Is it because the government has guns, or because people believe it has the right to rule? The difference between force and authority is the difference between a government and a gang. Understanding this is the foundation of political science.",
          prediction_prompt: "What makes a government different from a group of people with weapons?",
        },
      },
      {
        id: "govt_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Government is the machinery through which a state is ruled. The state is the territory, people, and sovereignty. Government is the people and institutions that make and enforce rules. Power is the ability to influence others. Authority is power that is accepted as legitimate. A armed robber has power; a president has authority.",
          analogy: "Think of the state as a car. Government is the driver. Power is the engine that makes the car move. Authority is the driving license that makes the driver合法. Without authority, the driver is just someone who stole the car.",
        },
      },
      {
        id: "govt_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Key concepts: (1) State — population, territory, government, sovereignty. (2) Government — the political machinery that runs the state. (3) Power — ability to influence behaviour. (4) Authority — legitimate power, accepted by the people. (5) Legitimacy — the right to rule, derived from consent, tradition, or law. (6) Sovereignty — supreme power within a territory (internal) and independence from other states (external).",
          key_terms: [
            { term: "State", definition: "An independent political community with a permanent population, defined territory, government, and sovereignty" },
            { term: "Government", definition: "The political machinery through which the state is governed" },
            { term: "Sovereignty", definition: "Supreme and absolute power within a territory" },
            { term: "Legitimacy", definition: "The popular acceptance of a government's authority" },
          ],
        },
      },
      {
        id: "govt_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "State = Population + Territory + Government + Sovereignty",
          variables: [
            { name: "Population", description: "People living within the territory" },
            { name: "Territory", description: "Defined land area with boundaries" },
            { name: "Government", description: "Institutions that rule the state" },
            { name: "Sovereignty", description: "Supreme authority — internal and external" },
          ],
          when_to_use: "When asked to define or identify a state. All four elements must be present.",
          common_traps: [
            "Confusing state with government — the state is permanent, government changes",
            "Confusing power with authority — power can be illegitimate",
            "Forgetting external sovereignty — a state must be independent",
          ],
          units_note: "A government in exile may have legitimacy but no territory. A occupied country may have territory but no sovereignty.",
        },
      },
      {
        id: "govt_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A military junta takes power through a coup. Is this government legitimate?",
          given: ["A government that came to power by force"],
          required: "Analyze the legitimacy of this government",
          principle: "Legitimacy comes from the consent of the governed, not from force.",
          steps: [
            { explanation: "Check source of power", calculation: "Power came from military force (coup), not elections" },
            { explanation: "Check popular acceptance", calculation: "People may obey out of fear, not belief in the government's right" },
            { explanation: "Apply Weber's types", calculation: "This is coercive power, not legitimate authority" },
            { explanation: "Consider practical reality", calculation: "Over time, the junta may gain legitimacy through effective governance (de facto legitimacy)" },
          ],
          answer: "Initially, the junta lacks democratic legitimacy. However, over time it may gain de facto legitimacy if it governs effectively and the people accept its authority.",
          check: "Legitimacy is not binary — it exists on a spectrum and can change over time.",
        },
      },
      {
        id: "govt_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Government and state are the same thing.",
          why_wrong: "The state is permanent (territory, people, sovereignty). Government changes — it's the people and institutions currently in charge.",
          correct_model: "State = the country (permanent). Government = who is currently ruling (temporary). A new government doesn't create a new state.",
        },
      },
      {
        id: "govt_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests basic political concepts, definitions, and the features of a state.",
          trap: "JAMB may ask about 'de jure' vs 'de facto' legitimacy. De jure = by law. De facto = in practice (whether recognized or not).",
          tip: "For definitions, be precise. JAMB marks based on key terms. Include: population, territory, government, sovereignty when defining a state.",
          related_topics: ["Forms of government", "Sovereignty", "Political legitimacy"],
        },
      },
      {
        id: "govt_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "State needs 4 things: People, Land, Government, Sovereignty. Power = ability. Authority = legitimate power. Government runs the state. State is permanent, government changes.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "govt_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Can a government exist without legitimacy? What happens when people stop believing in a government's right to rule?",
          expected_understanding: "Yes, through coercion — but it's unstable. When people withdraw consent, governments collapse. The Arab Spring showed how quickly governments can fall when legitimacy evaporates.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Which of the following is NOT a feature of a state?",
        options: [
          { label: "A", text: "Population" },
          { label: "B", text: "Territory" },
          { label: "C", text: "Army" },
          { label: "D", text: "Sovereignty" },
        ],
        answer: "C",
        explanation: "A state needs population, territory, government, and sovereignty. An army is not a defining feature.",
        hints: ["What are the four essential elements of a state?"],
      },
      {
        difficulty: "medium",
        question: "Power that is accepted as rightful and proper is called:",
        options: [
          { label: "A", text: "Force" },
          { label: "B", text: "Authority" },
          { label: "C", text: "Coercion" },
          { label: "D", text: "Influence" },
        ],
        answer: "B",
        explanation: "Authority is power that is accepted as legitimate — the right to rule.",
        hints: ["What makes people obey willingly, not out of fear?"],
      },
      {
        difficulty: "jamb",
        question: "A state that has lost control of its territory but maintains its government in exile is said to have:",
        options: [
          { label: "A", text: "Lost its sovereignty completely" },
          { label: "B", text: "Maintained de jure sovereignty" },
          { label: "C", text: "Become a failed state" },
          { label: "D", text: "Both B and C" },
        ],
        answer: "D",
        explanation: "The government retains legal (de jure) sovereignty but has lost effective (de facto) control — making it a failed state.",
        hints: ["De jure = by law. De facto = in practice"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["govt_hook_01", "govt_intuitive_01", "govt_formal_01", "govt_formula_01", "govt_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 2. FORMS OF GOVERNMENT
  {
    subject: "government",
    topic: "Forms of Government",
    subtopic: "Types and Systems",
    title: "Forms of Government — Democracy, Monarchy, and More",
    learning_objectives: [
      "Distinguish between democracy, monarchy, and authoritarianism",
      "Compare presidential and parliamentary systems",
      "Analyze unitary, federal, and confederal systems",
      "Evaluate the separation of powers",
    ],
    difficulty_level: "medium",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "forms_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Nigeria has a presidential system, the UK has a parliamentary system, Saudi Arabia has an absolute monarchy. Why do different countries choose different systems? The answer lies in history, culture, and the values a society prioritizes — efficiency, representation, or stability.",
          prediction_prompt: "If you were designing a new country's government, would you choose a presidential or parliamentary system? Why?",
        },
      },
      {
        id: "forms_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Governments can be classified by who rules (democracy = people, monarchy = one ruler, oligarchy = few) and how power is organized (presidential = separate executive, parliamentary = executive from legislature). The presidential system (like Nigeria) has a president who is both head of state and government. The parliamentary system (like UK) has a prime minister who leads the legislature.",
          analogy: "Think of presidential vs parliamentary like a company. Presidential = CEO (president) is separate from the board of directors (legislature). Parliamentary = CEO (PM) is chosen from and accountable to the board. If the board loses confidence, the CEO is replaced.",
        },
      },
      {
        id: "forms_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "By participation: Democracy (direct or representative), Autocracy, Oligarchy, Theocracy. By structure: Unitary (power centralized), Federal (power divided), Confederal (loose alliance). By executive-legislative relationship: Presidential (separation of powers), Parliamentary (fusion of powers). Key principle: Separation of powers — legislature makes law, executive implements, judiciary interprets.",
          key_terms: [
            { term: "Presidential System", definition: "Executive president separate from legislature, fixed term, cannot be removed by legislature" },
            { term: "Parliamentary System", definition: "PM is part of legislature, government accountable to parliament, vote of no confidence can remove PM" },
            { term: "Federal System", definition: "Power divided between central and state/regional governments by constitution" },
            { term: "Separation of Powers", definition: "Division of government functions among legislature, executive, and judiciary" },
          ],
        },
      },
      {
        id: "forms_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Presidential vs Parliamentary: President = separate, fixed term, both head of state and government. PM = from legislature, removable, head of government only.",
          variables: [
            { name: "Presidential", description: "Separate executive, fixed term, direct mandate" },
            { name: "Parliamentary", description: "Executive from legislature, accountable to parliament" },
            { name: "Unitary", description: "All power at center, local govts are delegates" },
            { name: "Federal", description: "Power shared by constitution, both levels autonomous" },
          ],
          when_to_use: "When asked to compare or classify government systems.",
          common_traps: [
            "Confusing presidential with authoritarian — presidential can be democratic",
            "Forgetting that Nigeria adopted presidential system in 1979",
            "Not understanding that parliamentary systems can be more flexible (vote of no confidence)",
          ],
          units_note: "JAMB may compare Nigeria's system with the UK or USA.",
        },
      },
      {
        id: "forms_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Compare the presidential system (Nigeria/USA) with the parliamentary system (UK).",
          given: ["Two government systems to compare"],
          required: "Identify key differences",
          principle: "Compare: source of executive power, accountability, relationship between executive and legislature.",
          steps: [
            { explanation: "Source of executive power", calculation: "Presidential: President elected directly by people. Parliamentary: PM chosen by parliament" },
            { explanation: "Accountability", calculation: "Presidential: President accountable to electorate (fixed term). Parliamentary: PM accountable to parliament (can be removed)" },
            { explanation: "Relationship", calculation: "Presidential: Separation — president cannot sit in legislature. Parliamentary: Fusion — PM is member of parliament" },
            { explanation: "Head of state", calculation: "Presidential: President is both head of state and government. Parliamentary: Head of state (monarch/president) separate from head of government (PM)" },
          ],
          answer: "Presidential: separate executive, fixed term, direct mandate. Parliamentary: executive from legislature, flexible term, parliament accountability.",
          check: "Nigeria chose the presidential system to prevent the instability of parliamentary systems in West Africa.",
        },
      },
      {
        id: "forms_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "In a parliamentary system, the monarch/ruler has real political power.",
          why_wrong: "In constitutional monarchies (UK, Japan), the monarch is a ceremonial head of state. Real power lies with the PM and parliament.",
          correct_model: "Constitutional monarchy = monarch is ceremonial. Absolute monarchy = monarch has real power. Know the difference.",
        },
      },
      {
        id: "forms_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests comparison of government systems and the principle of separation of powers.",
          trap: "JAMB may ask about 'checks and balances' vs 'separation of powers.' Separation = different branches. Checks = each branch can limit the others.",
          tip: "For comparison questions, use a table format: feature | presidential | parliamentary. This helps organize your answer clearly.",
          related_topics: ["Constitution", "Nigerian government", "Electoral systems"],
        },
      },
      {
        id: "forms_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Presidential: President separate, fixed term, both heads. Parliamentary: PM from parliament, removable, separate head of state. Federal: shared power. Unitary: central power.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "forms_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why did Nigeria choose a presidential system instead of the parliamentary system it inherited from Britain?",
          expected_understanding: "Nigeria's ethnic diversity made parliamentary systems unstable — coalition governments collapsed easily. A strong president was seen as more stable. However, the presidential system has its own challenges: executive dominance and corruption.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "In a parliamentary system, the head of government is the:",
        options: [
          { label: "A", text: "President" },
          { label: "B", text: "Prime Minister" },
          { label: "C", text: "Monarch" },
          { label: "D", text: "Speaker" },
        ],
        answer: "B",
        explanation: "In a parliamentary system, the Prime Minister is the head of government. The monarch/president is usually head of state.",
        hints: ["Who runs the day-to-day government?"],
      },
      {
        difficulty: "medium",
        question: "Which system has a strict separation between the executive and legislature?",
        options: [
          { label: "A", text: "Parliamentary" },
          { label: "B", text: "Presidential" },
          { label: "C", text: "Confederal" },
          { label: "D", text: "Unitary" },
        ],
        answer: "B",
        explanation: "In a presidential system, the president and cabinet are separate from the legislature.",
        hints: ["Which system keeps the executive out of the legislature?"],
      },
      {
        difficulty: "jamb",
        question: "The principle that each branch of government can limit the powers of the other branches is called:",
        options: [
          { label: "A", text: "Separation of powers" },
          { label: "B", text: "Checks and balances" },
          { label: "C", text: "Federalism" },
          { label: "D", text: "Rule of law" },
        ],
        answer: "B",
        explanation: "Checks and balances allow each branch to limit the others. Separation of powers divides the branches.",
        hints: ["Separation = dividing. Checks = limiting each other"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["forms_hook_01", "forms_intuitive_01", "forms_formal_01", "forms_formula_01", "forms_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 3. ARMS OF GOVERNMENT
  {
    subject: "government",
    topic: "Arms of Government",
    subtopic: "Legislature, Executive, Judiciary",
    title: "Arms of Government — Who Does What",
    learning_objectives: [
      "Explain the functions of the legislature, executive, and judiciary",
      "Understand the principle of checks and balances",
      "Analyze the independence of the judiciary",
      "Evaluate the relationship between the three arms",
    ],
    difficulty_level: "medium",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "arms_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Imagine a world where the person who makes the law also enforces it AND judges you when you break it. That's tyranny. The separation of government into three arms — legislature, executive, judiciary — exists to prevent any one person or group from having too much power.",
          prediction_prompt: "Why is it dangerous for one person to make laws, enforce them, AND judge offenders?",
        },
      },
      {
        id: "arms_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "The legislature makes laws. The executive implements laws. The judiciary interprets laws. Think of it like a restaurant: the legislature writes the menu (laws), the executive kitchen staff prepares the food (implements), and the judiciary is the food inspector (ensures rules are followed). Each arm checks the others to prevent abuse.",
          analogy: "In football: the legislature is the rule-making body (FIFA). The executive is the referee (enforces rules). The judiciary is the appeals panel (interprets rules when disputed). Without separation, the team owner would make rules, referee matches, and judge disputes — obviously unfair.",
        },
      },
      {
        id: "arms_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Legislature: Makes laws, approves budgets, oversight of executive, represents people. Can be unicameral (one house) or bicameral (two houses). Executive: Implements laws, runs government, foreign policy, defense. Headed by President/PM. Judiciary: Interprets laws, settles disputes, protects rights, reviews constitutionality. Courts: Supreme, Appeal, High, Magistrate.",
          key_terms: [
            { term: "Legislature", definition: "The law-making body of government (National Assembly in Nigeria)" },
            { term: "Executive", definition: "The arm that implements and enforces laws (President and Ministers)" },
            { term: "Judiciary", definition: "The arm that interprets laws and adjudicates disputes (Courts)" },
            { term: "Judicial Independence", definition: "The principle that courts should be free from interference by other branches" },
          ],
        },
      },
      {
        id: "arms_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Legislature makes → Executive implements → Judiciary interprets → Each checks the others",
          variables: [
            { name: "Legislature", description: "Makes laws, approves budget, oversight" },
            { name: "Executive", description: "Implements laws, runs government, commands armed forces" },
            { name: "Judiciary", description: "Interprets laws, protects rights, reviews constitutionality" },
            { name: "Checks", description: "Each arm can limit the others (e.g., veto, judicial review, impeachment)" },
          ],
          when_to_use: "For questions about government structure, separation of powers, or specific arm functions.",
          common_traps: [
            "Confusing the roles — legislature makes, executive implements, judiciary interprets",
            "Forgetting that checks and balances allow each arm to limit the others",
            "Not knowing that the judiciary can declare laws unconstitutional (judicial review)",
          ],
          units_note: "Nigeria's National Assembly has two chambers: Senate (109 members) and House of Representatives (360 members).",
        },
      },
      {
        id: "arms_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "The President refuses to sign a bill passed by the National Assembly. What power is the President exercising, and how can the legislature respond?",
          given: ["Executive refusal to sign legislation"],
          required: "Identify the constitutional power and legislative response",
          principle: "The president has veto power. The legislature can override with a two-thirds majority.",
          steps: [
            { explanation: "Identify the President's power", calculation: "Presidential veto — the power to reject a bill" },
            { explanation: "Check the legislative response", calculation: "The National Assembly can override with 2/3 majority in both chambers" },
            { explanation: "Apply checks and balances", calculation: "This is the legislature checking the executive's veto power" },
            { explanation: "Practical outcome", calculation: "If 2/3 of both houses vote to override, the bill becomes law without presidential assent" },
          ],
          answer: "The President is exercising veto power. The National Assembly can override with a two-thirds majority in both chambers.",
          check: "This is a key check and balance — the executive can reject laws, but the legislature can override.",
        },
      },
      {
        id: "arms_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "The judiciary only settles disputes between citizens.",
          why_wrong: "The judiciary also reviews the constitutionality of laws and government actions (judicial review). It can strike down laws that violate the constitution.",
          correct_model: "The judiciary interprets the constitution, not just settles private disputes. Judicial review is a powerful check on the legislature and executive.",
        },
      },
      {
        id: "arms_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests the functions of each arm, checks and balances, and judicial independence.",
          trap: "JAMB may ask about specific Nigerian institutions: NASS (legislature), President/ministers (executive), courts (judiciary). Know the structures.",
          tip: "For essay questions, always mention specific examples: 'The National Assembly exercises legislative power by...' This shows practical understanding.",
          related_topics: ["Constitution", "Federalism", "Rule of law"],
        },
      },
      {
        id: "arms_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Legislature = Laws. Executive = Execution. Judiciary = Justice. Each arm checks the others. Veto, override, judicial review, impeachment — these are the checks.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "arms_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why is judicial independence important? What happens if the executive controls the courts?",
          expected_understanding: "If the executive controls courts, there's no impartial judge of government actions. Citizens lose their protection against tyranny. Judicial independence ensures the law applies equally to everyone, including those in power.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Which arm of government makes laws?",
        options: [
          { label: "A", text: "Executive" },
          { label: "B", text: "Judiciary" },
          { label: "C", text: "Legislature" },
          { label: "D", text: "Military" },
        ],
        answer: "C",
        explanation: "The legislature is the law-making body.",
        hints: ["Legislative = law-making"],
      },
      {
        difficulty: "medium",
        question: "The power of the judiciary to declare a law unconstitutional is called:",
        options: [
          { label: "A", text: "Veto power" },
          { label: "B", text: "Judicial review" },
          { label: "C", text: "Impeachment" },
          { label: "D", text: "Prerogative" },
        ],
        answer: "B",
        explanation: "Judicial review allows courts to strike down laws that violate the constitution.",
        hints: ["The judiciary 'reviews' the law against the constitution"],
      },
      {
        difficulty: "jamb",
        question: "In Nigeria, which institution can override a presidential veto?",
        options: [
          { label: "A", text: "The Supreme Court" },
          { label: "B", text: "The National Assembly" },
          { label: "C", text: "The State Governors" },
          { label: "D", text: "The Electoral Commission" },
        ],
        answer: "B",
        explanation: "The National Assembly (both chambers) can override a presidential veto with a two-thirds majority.",
        hints: ["Who has the power to make laws?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["arms_hook_01", "arms_intuitive_01", "arms_formal_01", "arms_formula_01", "arms_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 4. NIGERIAN GOVERNMENT: COLONIAL ERA
  {
    subject: "government",
    topic: "Nigerian Government: Colonial Era",
    subtopic: "British Colonial Administration",
    title: "Colonial Nigeria — How Britain Ruled",
    learning_objectives: [
      "Trace the process of British colonization of Nigeria",
      "Explain the system of indirect rule",
      "Analyze the effects of amalgamation (1914)",
      "Understand constitutional development during colonial rule",
    ],
    difficulty_level: "hard",
    estimated_minutes: 25,
    content_sections: [
      {
        id: "col_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "In 1914, Lord Lugard merged the Northern and Southern Protectorates into one country called Nigeria. He did this to save money — the North was losing revenue. But this 'merger' created a country with over 250 ethnic groups, diverse religions, and different political systems. The consequences of this decision are still felt today.",
          prediction_prompt: "Why would merging two separate colonies into one country cause problems? What might go wrong?",
        },
      },
      {
        id: "col_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Britain colonized Nigeria through three main phases: Lagos Colony (1861), Northern Protectorate (1900), Southern Protectorate (1900). In 1914, they merged all three into one country. The British used 'indirect rule' — they didn't govern directly but used traditional rulers (emirs, obas, chiefs) as intermediaries. This worked in the North but caused problems in the South.",
          analogy: "Think of indirect rule like a franchise system. The British were the head office. Traditional rulers were the franchisees — they ran local affairs according to British rules. But in the South, where traditional authority was weaker (especially among the Igbo), the 'franchise' model didn't work well.",
        },
      },
      {
        id: "col_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Colonial administration: (1) Indirect Rule — governing through existing traditional institutions. Worked in North (emirate system), failed in parts of South (acephalous Igbo society). (2) Amalgamation (1914) — merging North and Southern Protectorates. Lord Lugard's wife named the country 'Nigeria.' (3) Constitutional development: Clifford (1922), Richards (1946), Macpherson (1951), Lyttleton (1954). Each gave more Nigerian participation.",
          key_terms: [
            { term: "Indirect Rule", definition: "British system of governing through existing traditional rulers and institutions" },
            { term: "Amalgamation", definition: "The 1914 merging of Northern and Southern Protectorates into one Nigeria" },
            { term: "Protectorate", definition: "A territory under British protection but not a colony" },
            { term: "Clifford Constitution", definition: "1922 constitution that introduced legislative councils and elective principle" },
          ],
        },
      },
      {
        id: "col_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Indirect Rule: British → Traditional Rulers → People. Worked where traditional authority was strong (North). Failed where it was weak (Igbo areas).",
          variables: [
            { name: "North", description: "Emirate system with strong centralized authority — indirect rule worked well" },
            { name: "South-West", description: "Oba system with structured hierarchy — indirect rule adapted" },
            { name: "South-East", description: "Igbo acephalous system (no central ruler) — indirect rule failed, created warrant chiefs" },
            { name: "Lagos", description: "Direct rule initially, then indirect rule after 1914" },
          ],
          when_to_use: "When asked about colonial administration or why different regions responded differently to colonial rule.",
          common_traps: [
            "Forgetting that indirect rule was cheaper than direct rule — that's why the British chose it",
            "Not understanding why indirect rule failed in Igbo areas — no centralized authority",
            "Confusing indirect rule with direct rule",
          ],
          units_note: "JAMB loves asking about indirect rule — its features, successes, and failures.",
        },
      },
      {
        id: "col_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Explain why indirect rule succeeded in Northern Nigeria but failed in parts of Southern Nigeria.",
          given: ["Different responses to indirect rule in North and South"],
          required: "Compare the two regions and explain the difference",
          principle: "Indirect rule works where traditional authority is centralized and accepted.",
          steps: [
            { explanation: "Analyze the North", calculation: "Northern Nigeria had the emirate system — centralized, hierarchical, with the Emir as supreme authority. British used Emirs as intermediaries." },
            { explanation: "Analyze the South", calculation: "Southern Nigeria (especially Igbo areas) had decentralized, acephalous societies. No single ruler to use as intermediary." },
            { explanation: "Identify the problem", calculation: "The British created 'warrant chiefs' in Igbo areas — people with no traditional authority. This caused resentment and resistance (Women's War of 1929)." },
            { explanation: "Conclusion", calculation: "Indirect rule depended on existing traditional structures. Where these structures were weak, the system failed." },
          ],
          answer: "Indirect rule succeeded in the North because of the centralized emirate system. It failed in Igbo areas because there was no centralized authority — the British-created warrant chiefs were resented.",
          check: "The Women's War of 1929 (Aba Women's Riot) was a direct response to indirect rule failure in the South.",
        },
      },
      {
        id: "col_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "The British colonized Nigeria for the benefit of Nigerians.",
          why_wrong: "Colonialism was driven by British economic interests — raw materials, markets, and strategic advantage. Any benefits to Nigerians were incidental.",
          correct_model: "Colonialism was exploitative. The British extracted resources and labor while imposing foreign political and economic systems.",
        },
      },
      {
        id: "col_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests indirect rule, amalgamation, constitutional development, and the impact of colonialism.",
          trap: "JAMB may ask about specific constitutions (Clifford, Richards, etc.). Know: Clifford (1922) = elective principle. Richards (1946) = regional representation.",
          tip: "For essay questions on colonialism, structure your answer: Introduction → Indirect rule → Amalgamation → Constitutional development → Impact/Effects.",
          related_topics: ["Pre-colonial government", "Independence movement", "Constitution"],
        },
      },
      {
        id: "col_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "1914: Lugard amalgamates Nigeria. Indirect rule = British through traditional rulers. Worked in North (emirates), failed in Igbo areas (no central authority). Clifford (1922) = first elections.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "col_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "How did the amalgamation of 1914 contribute to Nigeria's political challenges today?",
          expected_understanding: "Forcing diverse ethnic groups with different political systems into one country created tensions that persist today: North-South divide, ethnic conflicts, resource control disputes, and debates about federalism.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Who was responsible for the amalgamation of Nigeria in 1914?",
        options: [
          { label: "A", text: "Clifford" },
          { label: "B", text: "Lord Lugard" },
          { label: "C", text: "Macpherson" },
          { label: "D", text: "Richards" },
        ],
        answer: "B",
        explanation: "Lord Lugard, the Governor-General, amalgamated the Northern and Southern Protectorates in 1914.",
        hints: ["The last British colonial governor-general"],
      },
      {
        difficulty: "medium",
        question: "Indirect rule failed in Igbo areas because:",
        options: [
          { label: "A", text: "Igbo people were hostile" },
          { label: "B", text: "There was no centralized authority to use as intermediary" },
          { label: "C", text: "The British preferred direct rule there" },
          { label: "D", text: "The Igbo had their own written laws" },
        ],
        answer: "B",
        explanation: "Igbo society was acephalous (no central ruler), so there was no one to serve as intermediary under indirect rule.",
        hints: ["What was the key requirement for indirect rule to work?"],
      },
      {
        difficulty: "jamb",
        question: "The 1922 Clifford Constitution is significant because it:",
        options: [
          { label: "A", text: "Granted independence to Nigeria" },
          { label: "B", text: "Introduced the elective principle" },
          { label: "C", text: "Created the three regions" },
          { label: "D", text: "Abolished indirect rule" },
        ],
        answer: "B",
        explanation: "The Clifford Constitution (1922) introduced elections — Nigerians could now vote for representatives in the legislative council.",
        hints: ["What was new about this constitution?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["col_hook_01", "col_intuitive_01", "col_formal_01", "col_formula_01", "col_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 5. FEDERALISM IN NIGERIA
  {
    subject: "government",
    topic: "Federalism in Nigeria",
    subtopic: "Structure and Practice",
    title: "Federalism — Sharing Power in Nigeria",
    learning_objectives: [
      "Define federalism and its features",
      "Analyze the structure of Nigerian federalism",
      "Evaluate revenue allocation and fiscal federalism",
      "Identify challenges of federalism in Nigeria",
    ],
    difficulty_level: "hard",
    estimated_minutes: 25,
    content_sections: [
      {
        id: "fed_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Nigeria has 36 states and a Federal Capital Territory. Each state has its own governor, house of assembly, and laws. But there's also a federal government that controls the military, police, and foreign affairs. Why split power this way? Because in a diverse country, no single level of government can handle everything.",
          prediction_prompt: "If Nigeria were a unitary state (all power at the center), what problems might arise in a country with 250+ ethnic groups?",
        },
      },
      {
        id: "fed_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Federalism is a system where power is divided between a central government and regional/state governments by a constitution. Neither level can abolish the other. Each level has its own responsibilities. This is ideal for diverse countries because it allows different groups to have some autonomy while remaining part of a larger nation.",
          analogy: "Think of federalism like a family compound. The family head (federal government) handles major decisions — family reputation, major investments. Each household (state government) manages its own affairs — cooking, cleaning, daily routines. Neither can interfere with the other's responsibilities, but they share common goals.",
        },
      },
      {
        id: "fed_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Features of Nigerian federalism: (1) Division of powers — Exclusive list (federal only), Concurrent list (shared), Residual list (states). (2) Written constitution. (3) Independent judiciary (Supreme Court). (4) Bicameral legislature. (5) 36 states + FCT. Revenue allocation: Based on population, equality of states, internal revenue effort, land mass, and derivation (13% to oil-producing states).",
          key_terms: [
            { term: "Federalism", definition: "A system of government where power is divided between central and regional governments by a constitution" },
            { term: "Exclusive List", definition: "Matters only the federal government can legislate on (defense, foreign affairs, currency)" },
            { term: "Concurrent List", definition: "Matters both federal and state governments can legislate on (education, health)" },
            { term: "Residual List", definition: "Matters only state governments can legislate on (local government, traditional institutions)" },
          ],
        },
      },
      {
        id: "fed_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Federal Structure: Federal Govt (defense, currency, foreign affairs) + State Govts (education, health, agriculture) + Local Govts (basic services)",
          variables: [
            { name: "Exclusive List", description: "16 items — federal only (police, military, immigration, currency)" },
            { name: "Concurrent List", description: "30 items — both levels (education, health, labor, roads)" },
            { name: "Residual List", description: "Items not in other lists — states only (local govt, land matters)" },
            { name: "Revenue", description: "Federal Account shared: 52.68% federal, 26.72% states, 20.60% LGAs" },
          ],
          when_to_use: "When asked about the structure of Nigerian federalism, division of powers, or revenue allocation.",
          common_traps: [
            "Confusing exclusive and concurrent lists — exclusive = federal only, concurrent = both",
            "Forgetting that local governments are the third tier of government",
            "Not knowing the revenue allocation formula",
          ],
          units_note: "Nigeria practices 'fiscal federalism' — the federal government controls most revenue and shares it with states.",
        },
      },
      {
        id: "fed_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A state government wants to build a new university. Can the federal government stop it? Can the state government establish its own police force?",
          given: ["Two questions about federal-state relations"],
          required: "Determine which level has authority in each case",
          principle: "Check which list each matter falls under.",
          steps: [
            { explanation: "University (education)", calculation: "Education is on the Concurrent List — both federal and state can establish universities" },
            { explanation: "Can federal stop it?", calculation: "No — states have the right to establish universities under concurrent jurisdiction" },
            { explanation: "State police", calculation: "Police is on the Exclusive List — only the federal government can establish police" },
            { explanation: "Conclusion", calculation: "States can build universities but cannot create their own police force" },
          ],
          answer: "States can establish universities (concurrent list). States cannot create police forces (exclusive list — federal only).",
          check: "This is why Nigeria has state universities but only one Nigeria Police Force.",
        },
      },
      {
        id: "fed_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "In a federation, the federal government is superior to state governments.",
          why_wrong: "In a true federation, neither level is superior — they are co-equal, each sovereign within its own sphere of authority.",
          correct_model: "Federal and state governments are co-equal. The constitution defines their respective powers. Neither can abolish the other.",
        },
      },
      {
        id: "fed_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests the features of federalism, division of powers, and challenges of Nigerian federalism.",
          trap: "JAMB may ask about 'true federalism' vs what Nigeria practices. Nigeria's federalism is often called 'unitary federalism' because the federal government dominates.",
          tip: "For questions on challenges, mention: state creation demands, revenue allocation disputes, local government autonomy, and ethnic tensions.",
          related_topics: ["Revenue allocation", "State creation", "Constitution"],
        },
      },
      {
        id: "fed_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Federalism = shared power. Exclusive = federal only (police, army). Concurrent = both (education). Residual = states only. Revenue: 52.68% federal, 26.72% states, 20.60% LGAs.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "fed_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Is Nigeria's federalism truly federal? What would 'true federalism' look like?",
          expected_understanding: "Nigeria's federalism is often criticized as too centralized — the federal government controls most revenue and powers. True federalism would give states more autonomy, control over resources, and genuine self-governance.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Which of the following is on Nigeria's Exclusive Legislative List?",
        options: [
          { label: "A", text: "Education" },
          { label: "B", text: "Police" },
          { label: "C", text: "Agriculture" },
          { label: "D", text: "Health" },
        ],
        answer: "B",
        explanation: "Police is on the Exclusive List — only the federal government can legislate on it.",
        hints: ["Which of these is controlled only by the federal government?"],
      },
      {
        difficulty: "medium",
        question: "The 13% derivation principle applies to revenue from:",
        options: [
          { label: "A", text: "All states equally" },
          { label: "B", text: "Oil-producing states" },
          { label: "C", text: "The federal government" },
          { label: "D", text: "Local governments" },
        ],
        answer: "B",
        explanation: "The 13% derivation principle ensures that 13% of revenue from natural resources goes to the producing states.",
        hints: ["What states produce the resources?"],
      },
      {
        difficulty: "jamb",
        question: "A major challenge of federalism in Nigeria is:",
        options: [
          { label: "A", text: "Too many political parties" },
          { label: "B", text: "Revenue allocation disputes between federal and state governments" },
          { label: "C", text: "Too few states" },
          { label: "D", text: "Lack of a written constitution" },
        ],
        answer: "B",
        explanation: "Revenue allocation — how to share oil revenue — is one of Nigeria's most contentious federal issues.",
        hints: ["What is the biggest source of conflict between federal and state governments?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["fed_hook_01", "fed_intuitive_01", "fed_formal_01", "fed_formula_01", "fed_practice_01"],
    },
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
