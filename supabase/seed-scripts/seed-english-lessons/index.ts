import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS: any[] = [
  // 1. READING COMPREHENSION PASSAGES
  {
    subject: "english",
    topic: "Reading comprehension passages",
    subtopic: "Comprehension and Summary",
    title: "Reading Comprehension — How to Actually Understand What You Read",
    learning_objectives: [
      "Apply active reading strategies to comprehension passages",
      "Identify main ideas and supporting details in a text",
      "Infer meaning from context clues",
      "Answer comprehension questions accurately and efficiently",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "comprehension_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "JAMB gives you a passage and asks you to understand it — but most students read too fast. They skim without thinking, then panic when the questions ask about details they missed. The secret is reading with PURPOSE: know what you're looking for before you start.",
          prediction_prompt: "Read this: 'The government's new policy has been widely criticised, though some argue it represents a necessary departure from traditional approaches.' What is the author's attitude — positive, negative, or neutral?",
        },
      },
      {
        id: "comprehension_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Reading comprehension is not just about understanding words — it's about understanding what the AUTHOR means. Authors use specific words for a reason. When they say 'criticised' instead of 'discussed,' they're telling you something. Active reading means questioning the text as you read.",
          analogy: "Think of reading comprehension like detective work. The passage is the crime scene. The questions are the case you need to solve. You don't just glance around — you look for clues, connect evidence, and build a case. Every word is a potential clue.",
        },
      },
      {
        id: "comprehension_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "JAMB comprehension passages test three levels: (1) Literal — what is directly stated. (2) Inferential — what can be deduced. (3) Critical — evaluating the author's purpose, tone, and bias. Skimming gives you the general idea. Scanning finds specific details. Inferring goes beyond what is stated.",
          key_terms: [
            { term: "Main idea", definition: "The central point or message of the passage. Usually in the topic sentence." },
            { term: "Supporting details", definition: "Facts, examples, or evidence that support the main idea" },
            { term: "Inference", definition: "A conclusion drawn from evidence in the text, not directly stated" },
            { term: "Context clues", definition: "Surrounding words that help you understand an unfamiliar word's meaning" },
            { term: "Tone", definition: "The author's attitude towards the subject (e.g., critical, supportive, neutral)" },
          ],
        },
      },
      {
        id: "comprehension_strategy_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Read the questions FIRST, Skim the passage, Scan for answers, Eliminate wrong options",
          variables: [
            { name: "Step 1", description: "Read all questions before reading the passage", unit: "" },
            { name: "Step 2", description: "Skim the passage for main ideas (30 seconds)", unit: "" },
            { name: "Step 3", description: "Scan for specific answers to each question", unit: "" },
            { name: "Step 4", description: "Eliminate obviously wrong options, then choose the best answer", unit: "" },
          ],
          when_to_use: "For every JAMB comprehension question. This strategy saves time and improves accuracy.",
          common_traps: [
            "Reading the entire passage slowly before looking at questions — wastes time.",
            "Choosing the first answer that seems right without checking the others.",
            "Inferring too much — only use information actually supported by the text.",
          ],
          units_note: "Time management: spend about 1 minute per question. 10 questions = 10 minutes for the passage.",
        },
      },
      {
        id: "comprehension_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Passage: 'The introduction of computer-based testing in Nigerian universities has generated considerable debate. Proponents argue that it eliminates manual marking errors and reduces examination malpractice. Critics point to the high cost of infrastructure and the digital divide between urban and rural institutions.' Question: What is the main idea?",
          given: ["A passage about computer-based testing in Nigerian universities"],
          required: "Identify the main idea",
          principle: "The main idea is what the whole passage is about. Look at the first and last sentences for clues.",
          steps: [
            { explanation: "Identify the topic", calculation: "The topic is computer-based testing in Nigerian universities" },
            { explanation: "Look at what is said", calculation: "Both benefits and problems are discussed" },
            { explanation: "Find the capturing sentence", calculation: "The passage presents both arguments for and against" },
          ],
          answer: "The main idea is that computer-based testing in Nigerian universities has both advantages and disadvantages, with a gap between benefits and available infrastructure.",
          check: "This captures both the debate and the evidence presented",
        },
      },
      {
        id: "comprehension_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "The answer to a comprehension question is always directly stated in the passage.",
          why_wrong: "Many JAMB questions require inference — you need to read between the lines. The answer may be implied but not stated directly.",
          correct_model: "Some questions test literal comprehension (directly stated), others test inference (implied), and others test critical thinking (evaluating). Be prepared for all three.",
        },
      },
      {
        id: "comprehension_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB comprehension tests include literal, inferential, and vocabulary-in-context questions. Passages are usually 200-400 words on social, political, or scientific topics.",
          trap: "JAMB often includes trap answers that use words from the passage but change the meaning. Always check that your answer matches what the passage actually says.",
          tip: "For vocabulary questions, look at the sentence BEFORE and AFTER the word to get context. Don't just guess from the word alone.",
          related_topics: ["Cloze passages", "Summary writing", "Vocabulary"],
        },
      },
      {
        id: "comprehension_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Questions FIRST, passage SECOND. Skim for main idea, scan for details. Eliminate wrong answers before choosing. When in doubt, re-read the relevant paragraph.",
          hook_type: "strategy",
        },
      },
      {
        id: "comprehension_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why is it important to read the questions before reading the passage?",
          expected_understanding: "Reading questions first tells you what to look for. Instead of reading passively, you read with purpose — scanning for specific information. This saves time and improves accuracy.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "In a comprehension passage, what is the 'main idea'?",
        options: [
          { label: "A", text: "The first sentence of the passage" },
          { label: "B", text: "The central point that the whole passage supports" },
          { label: "C", text: "A detail mentioned in the middle" },
          { label: "D", text: "The author's name" },
        ],
        answer: "B",
        explanation: "The main idea is the central point or message of the entire passage.",
        hints: ["The main idea is what everything in the passage is about"],
      },
      {
        difficulty: "medium",
        question: "'The policy was widely condemned by experts, though the government remained defiant.' What is the author's tone?",
        options: [
          { label: "A", text: "Fully supportive of the government" },
          { label: "B", text: "Neutral — just reporting both sides" },
          { label: "C", text: "Critical of the government" },
          { label: "D", text: "Angry and emotional" },
        ],
        answer: "B",
        explanation: "The author reports both the condemnation and the government's stance without expressing personal opinion.",
        hints: ["Does the author take a side or just report?"],
      },
      {
        difficulty: "jamb",
        question: "'The minister's assurances did little to quell the growing unrest among workers, who had already endured three months of unpaid salaries.' What can you infer about the workers?",
        options: [
          { label: "A", text: "They are satisfied with the minister's response" },
          { label: "B", text: "They have been waiting for payment for a long time" },
          { label: "C", text: "They are about to receive their salaries" },
          { label: "D", text: "They support the government's position" },
        ],
        answer: "B",
        explanation: "'Three months of unpaid salaries' and 'growing unrest' indicate the workers have been waiting a long time and are increasingly frustrated.",
        hints: ["'Three months' = a long time", "'Growing unrest' = getting worse"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["comprehension_hook_01", "comprehension_intuitive_01", "comprehension_formal_01", "comprehension_strategy_01", "comprehension_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 2. CLOZE PASSAGES
  {
    subject: "english",
    topic: "Cloze passages",
    subtopic: "Comprehension and Summary",
    title: "Cloze Passages — Fill in the Blanks with Confidence",
    learning_objectives: [
      "Use context clues to determine missing words in a passage",
      "Apply grammar awareness to choose correct word forms",
      "Recognise collocations and common word combinations",
      "Complete cloze passages accurately under exam conditions",
    ],
    difficulty_level: "medium",
    estimated_minutes: 18,
    content_sections: [
      {
        id: "cloze_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Fill-in-the-blank questions test your understanding of context. You're not just looking for a word that sounds right — you need a word that fits the grammar, the meaning, AND the flow of the passage. The good news? The passage itself gives you all the clues you need.",
          prediction_prompt: "Complete this: 'The committee ____ (has/have) decided to postpone the meeting.' Which is correct and why?",
        },
      },
      {
        id: "cloze_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "A cloze passage is a paragraph with words removed. Your job is to figure out what fits. Think of it like a jigsaw puzzle — the surrounding pieces tell you what shape and colour the missing piece should be.",
          analogy: "Imagine reading a recipe that says: 'Add two _____ of sugar.' You'd know the missing word is probably 'cups' or 'tablespoons' — something that measures. The context tells you what kind of word fits.",
        },
      },
      {
        id: "cloze_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Cloze passages test three things: (1) Grammar — does the word fit grammatically? (2) Meaning — does the word make sense in context? (3) Collocation — does the word naturally go with its neighbours (e.g., 'make a decision' not 'do a decision')?",
          key_terms: [
            { term: "Collocation", definition: "Words that naturally go together in English (e.g., strong coffee, heavy rain)" },
            { term: "Context clue", definition: "Information from surrounding words that helps determine the missing word" },
            { term: "Grammatical fit", definition: "The word must fit the grammar of the sentence" },
            { term: "Semantic fit", definition: "The word must make logical sense in the passage" },
          ],
        },
      },
      {
        id: "cloze_strategy_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Read the full passage, Check grammar, Check meaning, Check collocations, Verify",
          variables: [
            { name: "Step 1", description: "Read the whole passage first to understand context", unit: "" },
            { name: "Step 2", description: "For each blank, check what part of speech is needed", unit: "" },
            { name: "Step 3", description: "Check which option makes logical sense", unit: "" },
            { name: "Step 4", description: "Check which word naturally collocates with surrounding words", unit: "" },
            { name: "Step 5", description: "Read the completed passage to verify it flows", unit: "" },
          ],
          when_to_use: "For every cloze passage question.",
          common_traps: [
            "Choosing a word that sounds right but doesn't fit grammatically.",
            "Picking a word that fits one blank but creates a contradiction elsewhere.",
            "Not reading the full passage before starting.",
          ],
          units_note: "Time: about 3-4 minutes per cloze passage (5 blanks).",
        },
      },
      {
        id: "cloze_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Complete: 'The new policy has been ___ by most stakeholders, though some ___ remain about its implementation.' Options for blank 1: welcomed/welcome/welcoming/welcome. Options for blank 2: concern/concerns/concerned/concerning.",
          given: ["A cloze passage with two blanks"],
          required: "Choose the correct words for each blank",
          principle: "For Blank 1: past participle needed (has been + past participle). For Blank 2: noun needed (some + noun).",
          steps: [
            { explanation: "Blank 1: grammar check", calculation: "'has been' + past participle = welcomed" },
            { explanation: "Blank 2: grammar check", calculation: "'some' + noun = concerns (plural noun)" },
            { explanation: "Read the full passage", calculation: "'The new policy has been welcomed by most stakeholders, though some concerns remain about its implementation.'" },
            { explanation: "Check meaning", calculation: "Most people welcome it, but some concerns exist" },
          ],
          answer: "Blank 1: welcomed, Blank 2: concerns",
          check: "The grammar fits and the meaning is logical",
        },
      },
      {
        id: "cloze_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "You can answer cloze questions just by reading the sentence with the blank.",
          why_wrong: "Often, the clue comes from a different sentence. You need to understand the whole passage.",
          correct_model: "Always read the full passage first. The clue for a blank may be several sentences away.",
        },
      },
      {
        id: "cloze_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB cloze passages test grammar (tense, subject-verb agreement), vocabulary, and collocations.",
          trap: "JAMB often includes options that are grammatically correct but don't fit the context. Check BOTH grammar and meaning.",
          tip: "Common collocations: make a decision (not do), take place (not happen), do harm (not make), heavy rain (not strong).",
          related_topics: ["Reading comprehension", "Sentence completion", "Vocabulary"],
        },
      },
      {
        id: "cloze_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Grammar first, meaning second, collocation third. If it doesn't fit grammatically, it's wrong. If it fits grammatically but makes no sense, it's wrong.",
          hook_type: "strategy",
        },
      },
      {
        id: "cloze_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why do collocations matter in cloze passages?",
          expected_understanding: "Collocations are natural word combinations. 'Make a decision' is correct; 'do a decision' is grammatically possible but sounds wrong to native speakers.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "The teacher asked the students to ___ their essays by Friday.",
        options: [
          { label: "A", text: "submit" },
          { label: "B", text: "submitting" },
          { label: "C", text: "submitted" },
          { label: "D", text: "submission" },
        ],
        answer: "A",
        explanation: "'asked someone to' + base form of verb.",
        hints: ["'to' + base verb"],
      },
      {
        difficulty: "medium",
        question: "The company has ___ a new strategy to increase sales.",
        options: [
          { label: "A", text: "adopted" },
          { label: "B", text: "adapted" },
          { label: "C", text: "adept" },
          { label: "D", text: "addicted" },
        ],
        answer: "A",
        explanation: "'Adopted' means to accept and implement. 'Adapted' means to modify.",
        hints: ["Which word means 'to take on and use'?"],
      },
      {
        difficulty: "jamb",
        question: "Despite the heavy rain, the match went ___ as planned.",
        options: [
          { label: "A", text: "on" },
          { label: "B", text: "off" },
          { label: "C", text: "through" },
          { label: "D", text: "ahead" },
        ],
        answer: "D",
        explanation: "'Went ahead' means proceeded as planned.",
        hints: ["Which phrase means 'proceeded despite obstacles'?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["cloze_hook_01", "cloze_intuitive_01", "cloze_formal_01", "cloze_strategy_01", "cloze_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 3. SYNONYMS AND ANTONYMS
  {
    subject: "english",
    topic: "Synonyms and antonyms",
    subtopic: "Lexis and Structure",
    title: "Synonyms and Antonyms — Knowing What Words Mean and What They Don't",
    learning_objectives: [
      "Identify synonyms and antonyms from word lists",
      "Use word roots, prefixes, and suffixes to determine meaning",
      "Recognise common word families",
      "Apply knowledge of Latin and Greek roots to unfamiliar words",
    ],
    difficulty_level: "medium",
    estimated_minutes: 18,
    content_sections: [
      {
        id: "synonym_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "JAMB loves testing whether you know what words mean — and what words mean the OPPOSITE. But here's the thing: you don't need to memorise every word. If you know a few roots, prefixes, and suffixes, you can figure out hundreds of words you've never seen before.",
          prediction_prompt: "If 'benevolent' means kind, what does 'malevolent' mean? Can you figure it out from the roots?",
        },
      },
      {
        id: "synonym_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "English is built from pieces. Most long words come from Latin or Greek roots, with prefixes (before) and suffixes (after) that modify the meaning. If you know that 'bene' means good and 'mal' means bad, you can understand benevolent and malevolent without memorising them separately.",
          analogy: "Think of words like LEGO bricks. 'Pre-' means before. 'Dict' means say. 'Predict' = say before = say what will happen. 'Dis-' means not. 'Agree' means agree. 'Disagree' = not agree. Once you know the pieces, you can understand any word.",
        },
      },
      {
        id: "synonym_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "A synonym is a word with the same or similar meaning (e.g., big/large, happy/joyful). An antonym is a word with the opposite meaning (e.g., big/small, happy/sad). JAMB tests both, but antonyms are more common.",
          key_terms: [
            { term: "Synonym", definition: "A word with the same or similar meaning as another word" },
            { term: "Antonym", definition: "A word with the opposite meaning of another word" },
            { term: "Word family", definition: "A group of words derived from the same root (e.g., act, action, active, actor, react)" },
            { term: "Prefix", definition: "Letters added to the beginning of a word to change its meaning (e.g., un-, re-, pre-, dis-)" },
            { term: "Suffix", definition: "Letters added to the end of a word to change its meaning or part of speech" },
          ],
        },
      },
      {
        id: "synonym_roots_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Prefix + Root + Suffix = Word meaning",
          variables: [
            { name: "un-", description: "not (unhappy = not happy, undo = reverse)" },
            { name: "re-", description: "again (rewrite = write again, return = come back)" },
            { name: "pre-", description: "before (predict = say before, preview = see before)" },
            { name: "dis-", description: "not/opposite (disagree = not agree, disappear = stop being visible)" },
            { name: "bene-", description: "good (benefit = good result, benevolent = kind)" },
            { name: "mal-", description: "bad (malicious = harmful, malfunction = work badly)" },
          ],
          when_to_use: "When you encounter an unfamiliar word on the JAMB exam. Break it into prefix + root + suffix to guess the meaning.",
          common_traps: [
            "Assuming all words with the same prefix have the same meaning — context matters.",
            "Confusing similar prefixes: 'un-' vs 'in-' vs 'im-'.",
            "Forgetting that some roots have changed form over time.",
          ],
          units_note: "Common JAMB prefixes: un-, re-, pre-, dis-, in-/im-/il-/ir-, over-, under-, mis-, sub-, anti-, post-.",
        },
      },
      {
        id: "synonym_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Choose the word OPPOSITE in meaning to 'benevolent'. A. generous B. kind C. malevolent D. charitable",
          given: ["A synonym/antonym question"],
          required: "Choose the antonym of benevolent",
          principle: "Benevolent means kind/good (bene = good). The opposite would mean evil/harmful (mal = bad).",
          steps: [
            { explanation: "Break down the word", calculation: "bene (good) + volent (wishing) = well-wishing, kind" },
            { explanation: "Find the opposite root", calculation: "mal (bad) + volent (wishing) = ill-wishing, malevolent" },
            { explanation: "Check other options", calculation: "A. generous (similar), B. kind (similar), D. charitable (similar)" },
            { explanation: "Confirm", calculation: "C. malevolent is the only antonym" },
          ],
          answer: "C. malevolent",
          check: "Benevolent = kind. Malevolent = evil. They are opposites.",
        },
      },
      {
        id: "synonym_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Synonyms always have exactly the same meaning.",
          why_wrong: "True synonyms are rare — most synonyms have slightly different meanings or are used in different contexts.",
          correct_model: "Synonyms are SIMILAR in meaning, not identical. For JAMB, choose the closest match.",
        },
      },
      {
        id: "synonym_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB synonyms and antonyms test vocabulary breadth and depth. Questions give a word and ask for the closest meaning or opposite.",
          trap: "JAMB may include words that LOOK similar but mean different things (e.g., 'emigrate' vs 'immigrate'). Don't be fooled by visual similarity.",
          tip: "Build vocabulary systematically. Learn 5 new words a day, focusing on roots and prefixes.",
          related_topics: ["Idioms", "Sentence completion", "Cloze passages"],
        },
      },
      {
        id: "synonym_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Know your prefixes: un- (not), re- (again), pre- (before), dis- (not/opposite), in/im/il/ir (not). Know your roots: dict (say), ject (throw), duct (lead), port (carry), script (write).",
          hook_type: "mnemonic",
        },
      },
      {
        id: "synonym_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "If you see the word 'incredible' for the first time, how can you figure out its meaning using roots and prefixes?",
          expected_understanding: "'In-' means not. 'Cred' means believe. So 'incredible' = not believable = amazing. Knowing roots lets you decode unfamiliar words.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Choose the word CLOSEST in meaning to 'abundant'.",
        options: [
          { label: "A", text: "scarce" },
          { label: "B", text: "plentiful" },
          { label: "C", text: "moderate" },
          { label: "D", text: "adequate" },
        ],
        answer: "B",
        explanation: "'Abundant' means existing in large quantities. 'Plentiful' means the same.",
        hints: ["Abundant = a lot of something"],
      },
      {
        difficulty: "medium",
        question: "Choose the word OPPOSITE in meaning to 'benevolent'.",
        options: [
          { label: "A", text: "generous" },
          { label: "B", text: "kind" },
          { label: "C", text: "malevolent" },
          { label: "D", text: "charitable" },
        ],
        answer: "C",
        explanation: "'Benevolent' means kind/good. 'Malevolent' means evil/harmful.",
        hints: ["Bene- means good, mal- means bad"],
      },
      {
        difficulty: "jamb",
        question: "Choose the word that means OPPOSITE of 'transparent'.",
        options: [
          { label: "A", text: "clear" },
          { label: "B", text: "obvious" },
          { label: "C", text: "opaque" },
          { label: "D", text: "visible" },
        ],
        answer: "C",
        explanation: "'Transparent' means see-through. 'Opaque' means you cannot see through it.",
        hints: ["Transparent = can see through", "Opaque = cannot see through"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["synonym_hook_01", "synonym_intuitive_01", "synonym_formal_01", "synonym_roots_01", "synonym_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 4. IDIOMS AND IDIOMATIC EXPRESSIONS
  {
    subject: "english",
    topic: "Idioms and idiomatic expressions",
    subtopic: "Lexis and Structure",
    title: "Idioms — When Words Don't Mean What You Think",
    learning_objectives: [
      "Identify common English idioms and their meanings",
      "Distinguish between literal and figurative language",
      "Recognise Nigerian English idioms",
      "Match idioms to their correct meanings in exam questions",
    ],
    difficulty_level: "medium",
    estimated_minutes: 18,
    content_sections: [
      {
        id: "idiom_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "It's raining cats and dogs — no one said anything about animals. Idioms are phrases that mean something different from the literal meaning of their words. JAMB tests them because they show whether you truly understand English beyond the dictionary.",
          prediction_prompt: "What does 'bite the bullet' mean? Think about it before reading on.",
        },
      },
      {
        id: "idiom_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Idioms are phrases where the whole meaning is different from the individual words. You can't figure them out by looking at each word — you have to know the phrase as a whole. 'Break a leg' doesn't mean harm — it means good luck.",
          analogy: "Think of idioms like a secret code. If you know the code, you understand the message. If you don't, you'll be confused. 'Spill the beans' doesn't mean you dropped food — it means you revealed a secret.",
        },
      },
      {
        id: "idiom_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "An idiom is a fixed expression whose meaning cannot be deduced from the individual words. Idioms are cultural — they develop from shared usage over time. JAMB tests common English idioms and occasionally Nigerian English expressions.",
          key_terms: [
            { term: "Idiom", definition: "A phrase whose meaning is different from the literal meaning of its words" },
            { term: "Figurative language", definition: "Language that uses words in a non-literal way to create an effect" },
            { term: "Fixed expression", definition: "A phrase that must be said in a specific way — you can't change the words" },
            { term: "Nigerian English idiom", definition: "Idioms unique to or common in Nigerian English (e.g., dash = give freely)" },
          ],
        },
      },
      {
        id: "idiom_list_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Common idioms and their meanings",
          variables: [
            { name: "Break the ice", description: "To initiate conversation in an awkward situation" },
            { name: "Bite the bullet", description: "To endure something painful or difficult" },
            { name: "Hit the nail on the head", description: "To be exactly right about something" },
            { name: "Spill the beans", description: "To reveal a secret" },
            { name: "Once in a blue moon", description: "Very rarely" },
            { name: "Under the weather", description: "Feeling ill" },
            { name: "Piece of cake", description: "Something very easy" },
            { name: "Cost an arm and a leg", description: "Very expensive" },
            { name: "Barking up the wrong tree", description: "Making a wrong assumption" },
            { name: "Beat around the bush", description: "Avoiding the main topic" },
          ],
          when_to_use: "When JAMB asks what an expression means. You need to know the idiom, not analyse the words.",
          common_traps: [
            "Taking idioms literally — 'break a leg' does NOT mean break a bone.",
            "Confusing similar idioms.",
            "Using Nigerian English meanings for standard English idioms.",
          ],
          units_note: "JAMB typically tests 10-15 common idioms per year.",
        },
      },
      {
        id: "idiom_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Choose the option that best explains: 'After much deliberation, the committee decided to bite the bullet and announce the unpopular decision.'",
          given: ["A sentence with the idiom 'bite the bullet'"],
          required: "Explain what the idiom means",
          principle: "Look at the context: 'after much deliberation' and 'unpopular decision' suggest something difficult was faced.",
          steps: [
            { explanation: "Identify the idiom", calculation: "'Bite the bullet'" },
            { explanation: "Look at the context", calculation: "They deliberated and chose to do something unpopular" },
            { explanation: "Match to meaning", calculation: "'Bite the bullet' = to endure something painful with courage" },
            { explanation: "Verify", calculation: "This fits: they decided to face the difficulty" },
          ],
          answer: "To endure something painful or difficult with courage",
          check: "The context confirms the meaning",
        },
      },
      {
        id: "idiom_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "You can figure out an idiom's meaning by looking at the individual words.",
          why_wrong: "That's the whole point of idioms — their meaning is NOT literal.",
          correct_model: "Idioms must be learned as whole units. Don't try to analyse the words.",
        },
      },
      {
        id: "idiom_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests common English idioms in the form: 'Choose the option that best explains the underlined expression.'",
          trap: "JAMB may use less common idioms or Nigerian English expressions. If you don't know the idiom, look at the context.",
          tip: "Create a personal list of idioms. Write each one with its meaning and an example sentence.",
          related_topics: ["Synonyms and antonyms", "Sentence completion", "Reading comprehension"],
        },
      },
      {
        id: "idiom_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Top 10 JAMB idioms: break the ice (start talking), bite the bullet (endure), hit the nail on the head (exactly right), spill the beans (reveal secret), once in a blue moon (rarely), under the weather (ill), piece of cake (easy), cost an arm and a leg (expensive), barking up the wrong tree (wrong assumption), beat around the bush (avoid the point).",
          hook_type: "list",
        },
      },
      {
        id: "idiom_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why do idioms exist in English? Why not just say what you mean directly?",
          expected_understanding: "Idioms add colour, emphasis, and cultural flavour to language. They often express ideas more vividly or concisely than literal language.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "What does 'piece of cake' mean?",
        options: [
          { label: "A", text: "A dessert" },
          { label: "B", text: "Something very easy" },
          { label: "C", text: "A small portion" },
          { label: "D", text: "A reward" },
        ],
        answer: "B",
        explanation: "'Piece of cake' is an idiom meaning something very easy to do.",
        hints: ["It's an idiom, not literal"],
      },
      {
        difficulty: "medium",
        question: "Choose the option that best explains: 'The manager decided to call a spade a spade during the meeting.'",
        options: [
          { label: "A", text: "To bring gardening tools" },
          { label: "B", text: "To speak frankly and directly" },
          { label: "C", text: "To avoid the topic" },
          { label: "D", text: "To make a joke" },
        ],
        answer: "B",
        explanation: "'Call a spade a spade' means to speak plainly and honestly.",
        hints: ["It's about how someone speaks"],
      },
      {
        difficulty: "jamb",
        question: "The expression 'to kill two birds with one stone' means to:",
        options: [
          { label: "A", text: "Harm animals" },
          { label: "B", text: "Waste time" },
          { label: "C", text: "Achieve two objectives with one action" },
          { label: "D", text: "Fail at everything" },
        ],
        answer: "C",
        explanation: "This idiom means accomplishing two things with a single effort.",
        hints: ["One stone, two birds = one action, two results"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["idiom_hook_01", "idiom_intuitive_01", "idiom_formal_01", "idiom_list_01", "idiom_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 5. SENTENCE COMPLETION
  {
    subject: "english",
    topic: "Sentence completion",
    subtopic: "Lexis and Structure",
    title: "Sentence Completion — Choosing the Right Word Every Time",
    learning_objectives: [
      "Choose the correct word based on meaning and grammar",
      "Apply rules of subject-verb agreement",
      "Maintain tense consistency within sentences",
      "Use parallel structure in lists and comparisons",
    ],
    difficulty_level: "medium",
    estimated_minutes: 18,
    content_sections: [
      {
        id: "sentence_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "The sentence makes sense... until you realise the word is wrong. Sentence completion questions test whether you can spot the word that fits BOTH grammatically AND in meaning. One wrong word can change the entire meaning.",
          prediction_prompt: "Which is correct: 'Each of the students ___ their homework' or 'Each of the students ___ his or her homework'?",
        },
      },
      {
        id: "sentence_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Sentence completion is like filling in a puzzle piece. The piece must fit the shape (grammar) AND the picture (meaning). A word that fits grammatically but doesn't make sense is wrong.",
          analogy: "Imagine a jigsaw puzzle. A piece might be the right shape (grammar) but the wrong colour (meaning). Or the right colour but the wrong shape. You need both.",
        },
      },
      {
        id: "sentence_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "JAMB sentence completion tests: (1) Grammar — subject-verb agreement, tense, pronoun agreement, prepositions. (2) Meaning — which word fits the context. (3) Structure — parallel structure, comparison, word order.",
          key_terms: [
            { term: "Subject-verb agreement", definition: "Subject and verb must agree in number" },
            { term: "Tense consistency", definition: "Tense should remain consistent within a sentence" },
            { term: "Parallel structure", definition: "Items in a list must have the same grammatical form" },
            { term: "Pronoun agreement", definition: "A pronoun must agree with its antecedent in number and gender" },
          ],
        },
      },
      {
        id: "sentence_rules_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Key grammar rules for sentence completion",
          variables: [
            { name: "Each/Every/Neither/Either", description: "Take a singular verb: 'Each has,' not 'Each have'" },
            { name: "Neither...nor / Either...or", description: "The verb agrees with the nearer subject" },
            { name: "Collective nouns", description: "Usually singular in British English: 'The team is'" },
            { name: "Prepositions", description: "Fixed: interested IN, depend ON, capable OF" },
            { name: "Comparison", description: "Compare like with like: 'His car is faster than mine'" },
          ],
          when_to_use: "When grammar is the key to eliminating wrong options.",
          common_traps: [
            "Subject-verb agreement with complex subjects.",
            "Tense shifts within a sentence.",
            "Comparing different things.",
          ],
          units_note: "Time: about 1 minute per sentence completion question.",
        },
      },
      {
        id: "sentence_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Neither the teacher nor the students ___ aware of the change. A. was B. is C. were D. has been",
          given: ["A sentence with neither...nor construction"],
          required: "Choose the correct verb form",
          principle: "With neither...nor, the verb agrees with the nearer subject. 'Students' is plural.",
          steps: [
            { explanation: "Identify the rule", calculation: "Neither...nor → verb agrees with nearer subject" },
            { explanation: "Identify nearer subject", calculation: "'the students' — plural" },
            { explanation: "Choose plural verb", calculation: "'were' is past tense plural" },
            { explanation: "Check other options", calculation: "A. was (singular), B. is (singular), D. has been (singular) — all wrong" },
          ],
          answer: "C. were",
          check: "Verb agrees with 'students' (plural)",
        },
      },
      {
        id: "sentence_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "The verb always agrees with the first subject in a sentence.",
          why_wrong: "With neither...nor and either...or, the verb agrees with the NEARER subject.",
          correct_model: "Subject-verb agreement depends on the construction.",
        },
      },
      {
        id: "sentence_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB sentence completion tests subject-verb agreement, prepositions, conjunctions, and vocabulary.",
          trap: "JAMB often includes subject-verb agreement questions with complex subjects. Find the TRUE subject.",
          tip: "For 'The group of students ___,' the subject is 'group' (singular), not 'students.'",
          related_topics: ["Cloze passages", "Synonyms and antonyms"],
        },
      },
      {
        id: "sentence_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Each/Every/Neither/Either = singular verb. Neither...nor/Either...or = verb agrees with nearer subject. Collective nouns = usually singular.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "sentence_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why does subject-verb agreement matter? Can't people just understand what you mean anyway?",
          expected_understanding: "Subject-verb agreement is a rule of standard English. Breaking it makes your writing sound unprofessional and can cause confusion in formal contexts like exams.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Each of the students ___ given a textbook.",
        options: [
          { label: "A", text: "have" },
          { label: "B", text: "were" },
          { label: "C", text: "was" },
          { label: "D", text: "are" },
        ],
        answer: "C",
        explanation: "'Each' is singular, so the verb must be singular: 'was.'",
        hints: ["Each = singular", "Singular subject → singular verb"],
      },
      {
        difficulty: "medium",
        question: "The committee ___ divided in their opinions about the proposal.",
        options: [
          { label: "A", text: "is" },
          { label: "B", text: "was" },
          { label: "C", text: "were" },
          { label: "D", text: "has" },
        ],
        answer: "C",
        explanation: "In British English, collective nouns can take plural verbs when the members are acting individually. 'Were divided' (plural) shows individual opinions.",
        hints: ["Collective nouns can be singular or plural in British English", "Individual actions → plural verb"],
      },
      {
        difficulty: "jamb",
        question: "Neither the boys nor the girl ___ present at the meeting.",
        options: [
          { label: "A", text: "were" },
          { label: "B", text: "are" },
          { label: "C", text: "is" },
          { label: "D", text: "have been" },
        ],
        answer: "C",
        explanation: "With neither...nor, the verb agrees with the nearer subject. 'The girl' is singular → 'is.'",
        hints: ["Neither...nor → verb agrees with nearer subject", "Girl = singular"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["sentence_hook_01", "sentence_intuitive_01", "sentence_formal_01", "sentence_rules_01", "sentence_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 6. STRESS PATTERNS
  {
    subject: "english",
    topic: "Stress patterns",
    subtopic: "Oral Forms",
    title: "Stress Patterns — Why SAY and DESERT Sound Different",
    learning_objectives: [
      "Identify stressed syllables in words",
      "Distinguish word stress in nouns vs verbs",
      "Recognise compound word stress patterns",
      "Apply stress rules to unfamiliar words",
    ],
    difficulty_level: "medium",
    estimated_minutes: 18,
    content_sections: [
      {
        id: "stress_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "SAY vs DESERT — same letters, different stress, different meaning. 'DEsert' (noun) = a dry area. 'deSERT' (verb) = to abandon. Stress changes everything. JAMB tests whether you know where the stress falls in a word.",
          prediction_prompt: "Say these two words out loud: PREsent (noun) and preSENT (verb). Notice where you put the emphasis?",
        },
      },
      {
        id: "stress_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Stress is the emphasis you put on a syllable when you speak. One syllable is louder, longer, and higher-pitched than the others. In English, stress can change the meaning of a word entirely. 'REcord' (noun) vs 'reCORD' (verb). 'PREsent' (gift) vs 'preSENT' (to introduce).",
          analogy: "Think of stress like a spotlight on a stage. Only one actor is spotlighted at a time. In a word, only one syllable gets the spotlight (primary stress). The others are in the background. Move the spotlight, and the meaning changes.",
        },
      },
      {
        id: "stress_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "English stress follows patterns: (1) Noun/verb pairs: stress often shifts (REcord vs reCORD). (2) Compound nouns: stress on the first element (WAter bottle, TOOTHbrush). (3) Adjective + noun: stress on the noun (blue CAR). (4) Suffixes like -tion, -sion, -ic, -ical shift stress to the syllable before the suffix.",
          key_terms: [
            { term: "Primary stress", definition: "The strongest stress in a word, marked with an apostrophe before the syllable: comPUter" },
            { term: "Secondary stress", definition: "A weaker stress, marked with a comma: COMputer (secondary on COM, primary on PU)" },
            { term: "Stress shift", definition: "When stress moves from one syllable to another to avoid two stressed syllables in a row" },
            { term: "Compound noun", definition: "Two words joined to make a new noun, usually stressed on the first element" },
          ],
        },
      },
      {
        id: "stress_rules_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Stress rules for common word patterns",
          variables: [
            { name: "Noun/Verb pairs", description: "Noun: stress on first syllable (REcord, PREsent, CONduct). Verb: stress on second (reCORD, preSENT, conDUCT)" },
            { name: "Compound nouns", description: "Stress on the first element: WAter bottle, TOOTHbrush, BLACKboard" },
            { name: "-tion/-sion words", description: "Stress on the syllable before the suffix: eduCAtion, deciSION" },
            { name: "-ic/-ical words", description: "Stress on the syllable before the suffix: aTOMic, hisTORical" },
            { name: "-ity/-fy words", description: "Stress on the syllable before the suffix: uniVERsity,idenTIFy" },
          ],
          when_to_use: "When JAMB asks you to identify the stressed syllable or which word has different stress.",
          common_traps: [
            "Assuming all words in a category have the same stress pattern — there are exceptions.",
            "Confusing noun and verb stress in pairs like 'record' and 'present.'",
            "Not noticing that compound nouns stress the FIRST element, while adjective+noun phrases stress the NOUN.",
          ],
          units_note: "JAMB usually tests 3-5 stress questions. Know the patterns above and you'll get most of them right.",
        },
      },
      {
        id: "stress_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "In which syllable is the primary stress in the word 'photograph'? A. PHO-to-graph B. pho-TO-graph C. pho-to-GRAPH D. pho-TO-graph",
          given: ["A word stress question"],
          required: "Identify the stressed syllable",
          principle: "Words ending in -graph, -graphy, -phonic stress the syllable before the suffix. 'Photograph' stresses the first syllable.",
          steps: [
            { explanation: "Say the word aloud", calculation: "PHO-to-graph" },
            { explanation: "Check the pattern", calculation: "Photo (from Greek 'photos' = light) + graph (writing)" },
            { explanation: "Apply the rule", calculation: "Two-syllable nouns often stress the first syllable" },
            { explanation: "Confirm", calculation: "PHO-to-graph — stress on first syllable" },
          ],
          answer: "A. PHO-to-graph",
          check: "Say it: PHO-to-graph. The emphasis is on PHO.",
        },
      },
      {
        id: "stress_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Stress always falls on the same syllable in a word family.",
          why_wrong: "Stress often shifts within a word family: PHOTOgraph (noun) vs photographIC (adjective) vs photograPHY (noun). The stress moves!",
          correct_model: "Stress shifts when suffixes are added. Know the suffix rules to predict where stress falls.",
        },
      },
      {
        id: "stress_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB stress questions ask you to identify which word has the stress on a particular syllable, or which word has different stress from the others.",
          trap: "JAMB may include words from other languages (French, Latin) where stress rules differ. Focus on the English patterns.",
          tip: "When in doubt, say the word aloud. Your ear will often tell you where the stress is.",
          related_topics: ["Pronunciation", "Intonation", "Word formation"],
        },
      },
      {
        id: "stress_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Noun/verb pairs: noun = first syllable (REcord), verb = second syllable (reCORD). Compounds: first element (WAter bottle). -tion/-sion: syllable before (eduCAtion). Say it loud — your ear knows.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "stress_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why does stress matter in English? Can't people understand you even if you stress the wrong syllable?",
          expected_understanding: "Stress affects intelligibility. Wrong stress can make a word unrecognisable or change its meaning entirely. In formal contexts (exams, presentations), correct stress signals competence and fluency.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Which syllable is stressed in 'banana'?",
        options: [
          { label: "A", text: "BA-na-na" },
          { label: "B", text: "ba-NA-na" },
          { label: "C", text: "ba-na-NA" },
          { label: "D", text: "BA-NA-na" },
        ],
        answer: "B",
        explanation: "The primary stress is on the second syllable: ba-NA-na.",
        hints: ["Say it aloud: ba-NA-na"],
      },
      {
        difficulty: "medium",
        question: "Which word has the stress on the SECOND syllable?",
        options: [
          { label: "A", text: "photograph" },
          { label: "B", text: "photography" },
          { label: "C", C: "photographic" },
          { label: "D", text: "photographer" },
        ],
        answer: "B",
        explanation: "PHOtograph (1st), phoTOGraphy (2nd), photoGRAPHic (3rd), phoTOGrapher (2nd). Both B and D have 2nd syllable stress, but 'photography' is the clearest example.",
        hints: ["Say each word and notice where the emphasis falls"],
      },
      {
        difficulty: "jamb",
        question: "Which word has a DIFFERENT stress pattern from the others?",
        options: [
          { label: "A", text: "record (noun)" },
          { label: "B", text: "present (noun)" },
          { label: "C", text: "conduct (noun)" },
          { label: "D", text: "conduct (verb)" },
        ],
        answer: "D",
        explanation: "A, B, C are all nouns with stress on the first syllable (REcord, PREsent, CONduct). D is a verb with stress on the second syllable (conDUCT).",
        hints: ["Nouns: stress on first syllable. Verbs: stress on second syllable."],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["stress_hook_01", "stress_intuitive_01", "stress_formal_01", "stress_rules_01", "stress_practice_01"],
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
