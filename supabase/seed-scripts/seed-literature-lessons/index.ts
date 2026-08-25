import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS = [
  // 1. LITERARY TERMS AND DEVICES
  {
    subject: "literature",
    topic: "Literary Terms and Devices",
    subtopic: "Figures of Speech and Techniques",
    title: "Literary Devices — The Tools Every Writer Uses",
    learning_objectives: [
      "Identify and explain various figures of speech",
      "Distinguish between literal and figurative language",
      "Analyze the effect of literary techniques in texts",
      "Apply knowledge of literary devices to exam questions",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "lit_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "When Shakespeare writes 'All the world's a stage,' he doesn't mean the world is literally a theatre. He's using a metaphor — comparing life to a performance. Literary devices are the tools writers use to make their writing vivid, powerful, and memorable. Knowing them helps you understand what the author REALLY means.",
          prediction_prompt: "What's the difference between 'He is brave' and 'He is a lion'? Which is more powerful and why?",
        },
      },
      {
        id: "lit_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Figures of speech are words used in a non-literal way to create an effect. A simile compares using 'like' or 'as' (brave as a lion). A metaphor compares directly (he IS a lion). Personification gives human qualities to non-human things (the wind whispered). They make writing more vivid and emotional.",
          analogy: "Think of literary devices like spices in cooking. Plain rice (literal language) fills you up, but rice with spices (figurative language) creates an experience. Writers use similes, metaphors, and other devices to add flavour to their words.",
        },
      },
      {
        id: "lit_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Major figures of speech: Simile (comparison using like/as), Metaphor (direct comparison), Personification (human qualities to non-human), Hyperbole (exaggeration), Irony (opposite of what is meant), Oxymoron (contradictory terms together), Alliteration (repetition of initial consonant sounds), Assonance (repetition of vowel sounds), Onomatopoeia (words that sound like what they describe).",
          key_terms: [
            { term: "Simile", definition: "A comparison using 'like' or 'as' — e.g., 'Her eyes sparkled like diamonds'" },
            { term: "Metaphor", definition: "A direct comparison without like/as — e.g., 'Time is money'" },
            { term: "Personification", definition: "Giving human qualities to non-human things — e.g., 'The sun smiled down on us'" },
            { term: "Irony", definition: "When the opposite of what is expected happens or is said" },
          ],
        },
      },
      {
        id: "lit_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Identifying Literary Devices: Look for comparison words (like, as) → Simile. Direct comparison (is, are) → Metaphor. Human actions to non-human → Personification. Exaggeration → Hyperbole. Opposite meaning → Irony",
          variables: [
            { name: "Simile", description: "Uses 'like' or 'as' for comparison" },
            { name: "Metaphor", description: "Direct comparison without comparison words" },
            { name: "Personification", description: "Non-human things doing human actions" },
            { name: "Hyperbole", description: "Extreme exaggeration for effect" },
            { name: "Irony", description: "Words say one thing, meaning is opposite" },
          ],
          when_to_use: "For any JAMB question asking you to identify or explain a literary device in a passage.",
          common_traps: [
            "Confusing simile with metaphor — check for 'like' or 'as'",
            "Missing personification when it's subtle (e.g., 'the city sleeps')",
            "Confusing verbal irony with sarcasm — they're related but not identical",
          ],
          units_note: "JAMB typically tests 5-8 devices per year. Master the main ones first.",
        },
      },
      {
        id: "lit_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Identify the literary device: 'The wind howled through the trees, shaking every leaf in its path.'",
          given: ["A sentence from a literary text"],
          required: "Identify and explain the literary device used",
          principle: "Look at what the wind is doing — 'howled' is a human action given to wind.",
          steps: [
            { explanation: "Identify the subject", calculation: "The wind (non-human)" },
            { explanation: "Identify the action", calculation: "'Howled' — a human/animal action" },
            { explanation: "Match to device", calculation: "Non-human doing human action = Personification" },
            { explanation: "Explain the effect", calculation: "Makes the wind seem alive and threatening, creating a mood of danger" },
          ],
          answer: "Personification. The wind is given the human/animal ability to 'howl,' making it seem alive and menacing.",
          check: "The effect is emotional — we feel the danger of the storm.",
        },
      },
      {
        id: "lit_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "All comparisons are metaphors.",
          why_wrong: "Similes and metaphors are both comparisons, but similes use 'like' or 'as' while metaphors state something IS something else.",
          correct_model: "'Brave as a lion' = simile (uses 'as'). 'He is a lion' = metaphor (direct comparison). Know the difference.",
        },
      },
      {
        id: "lit_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests identification of literary devices in passages and their effects on meaning and tone.",
          trap: "JAMB may use less common devices like synecdoche (part for whole: 'all hands on deck') or metonymy (associated thing: 'the Crown' for the monarchy). Learn these too.",
          tip: "When explaining a device's effect, always say HOW it contributes to the meaning or mood. Don't just identify it — explain what it achieves.",
          related_topics: ["Tone and mood", "Imagery", "Symbolism"],
        },
      },
      {
        id: "lit_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "SIMILE uses 'like/as.' METAPHOR says something IS something. PERSONIFICATION gives human traits. HYPERBOLE exaggerates. IRONY says the opposite. ALLITERATION repeats initial sounds.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "lit_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why do authors use figurative language instead of just stating facts?",
          expected_understanding: "Figurative language creates vivid images, evokes emotions, and makes abstract ideas concrete. 'He was sad' is forgettable. 'He carried the weight of the world on his shoulders' creates a powerful image.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Which literary device is used in 'The stars danced in the night sky'?",
        options: [
          { label: "A", text: "Simile" },
          { label: "B", text: "Metaphor" },
          { label: "C", text: "Personification" },
          { label: "D", text: "Hyperbole" },
        ],
        answer: "C",
        explanation: "Stars cannot literally dance — this is personification, giving human action to non-human things.",
        hints: ["Can stars really dance? What is the author doing?"],
      },
      {
        difficulty: "medium",
        question: "'Her voice was music to his ears.' This is an example of:",
        options: [
          { label: "A", text: "Simile" },
          { label: "B", text: "Metaphor" },
          { label: "C", text: "Alliteration" },
          { label: "D", text: "Onomatopoeia" },
        ],
        answer: "B",
        explanation: "Her voice IS music — direct comparison without 'like' or 'as' = metaphor.",
        hints: ["Is there a comparison? Does it use 'like' or 'as'?"],
      },
      {
        difficulty: "jamb",
        question: "'The classroom was a zoo during the teacher's absence.' The dominant device is:",
        options: [
          { label: "A", text: "Simile" },
          { label: "B", text: "Metaphor" },
          { label: "C", text: "Irony" },
          { label: "D", text: "Synecdoche" },
        ],
        answer: "B",
        explanation: "The classroom IS a zoo — a direct metaphor comparing the chaos to a zoo. No 'like' or 'as' is used.",
        hints: ["The classroom is directly compared to something else"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["lit_hook_01", "lit_intuitive_01", "lit_formal_01", "lit_formula_01", "lit_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 2. DRAMA
  {
    subject: "literature",
    topic: "Drama",
    subtopic: "Elements and Types of Drama",
    title: "Drama — Understanding Plays and Performance",
    learning_objectives: [
      "Identify the key elements of drama (plot, character, setting)",
      "Distinguish between tragedy, comedy, and tragicomedy",
      "Analyze dramatic techniques (soliloquy, aside, dialogue)",
      "Understand plot structure and dramatic conflict",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "drama_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "When you watch a Nollywood movie or a stage play, you're experiencing drama. But drama is not just entertainment — it's a mirror that reflects society. Wole Soyinka's 'Death and the King's Horseman' explores the clash between African tradition and colonial rule. Drama teaches us about ourselves and our world.",
          prediction_prompt: "What makes a story dramatic? Is it the conflict, the characters, or the dialogue?",
        },
      },
      {
        id: "drama_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Drama is storytelling through performance — actors speak and act out a story on stage. The key elements are: Plot (what happens), Character (who it happens to), Dialogue (what they say), Setting (where and when), and Conflict (the problem that drives the story). Without conflict, there is no drama.",
          analogy: "Think of drama like a football match. The plot is the game plan. The characters are the players. The dialogue is what they say to each other. The setting is the stadium. The conflict is the competition — who will win? Without the competition, nobody would watch.",
        },
      },
      {
        id: "drama_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Drama is literature written for performance. Key elements: (1) Plot — exposition, rising action, climax, falling action, resolution. (2) Character — protagonist, antagonist, supporting. (3) Dialogue — conversations between characters. (4) Stage directions — instructions for actors. (5) Setting — time, place, atmosphere. Types: Tragedy (serious, ends in downfall), Comedy (humorous, happy ending), Tragicomedy (mix of both).",
          key_terms: [
            { term: "Soliloquy", definition: "A character speaking their thoughts aloud while alone on stage" },
            { term: "Aside", definition: "A character speaking to the audience, unheard by other characters" },
            { term: "Climax", definition: "The turning point of the play — the moment of greatest tension" },
            { term: "Denouement", definition: "The resolution of the plot after the climax" },
          ],
        },
      },
      {
        id: "drama_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Plot Structure: Exposition → Rising Action → Climax → Falling Action → Resolution",
          variables: [
            { name: "Exposition", description: "Introduction of characters, setting, and background" },
            { name: "Rising Action", description: "Events that build tension and develop the conflict" },
            { name: "Climax", description: "The turning point — moment of highest tension" },
            { name: "Falling Action", description: "Events after the climax, leading to resolution" },
            { name: "Resolution", description: "The conflict is resolved; the play ends" },
          ],
          when_to_use: "For any JAMB question about plot structure or dramatic form. This structure applies to most plays and novels.",
          common_traps: [
            "Confusing climax with the ending — the climax is the turning point, not the conclusion",
            "Missing the difference between tragedy and comedy — check how it ends",
            "Not recognizing soliloquy when a character is alone on stage speaking",
          ],
          units_note: "JAMB may test either the 5-part or 3-part structure (beginning, middle, end).",
        },
      },
      {
        id: "drama_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "In a play, a character says: 'To be or not to be, that is the question.' The character is alone on stage. What dramatic technique is being used?",
          given: ["A famous line from Hamlet", "The character is alone on stage"],
          required: "Identify the dramatic technique",
          principle: "When a character speaks their thoughts aloud while alone, it's a soliloquy.",
          steps: [
            { explanation: "Check if other characters are present", calculation: "The character is alone on stage" },
            { explanation: "Check what the character is doing", calculation: "Speaking their inner thoughts and feelings" },
            { explanation: "Match to technique", calculation: "Alone + speaking thoughts = Soliloquy" },
            { explanation: "Why it matters", calculation: "Soliloquy reveals the character's innermost feelings to the audience" },
          ],
          answer: "Soliloquy. Hamlet is alone on stage, revealing his inner thoughts about life and death to the audience.",
          check: "If other characters were present and could hear him, it would be an aside instead.",
        },
      },
      {
        id: "drama_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Soliloquy and aside are the same thing.",
          why_wrong: "In a soliloquy, the character is ALONE on stage. In an aside, other characters are present but the character speaks to the audience as if they can't hear.",
          correct_model: "Soliloquy = alone on stage, speaking thoughts. Aside = others present, speaking to audience (others pretend not to hear).",
        },
      },
      {
        id: "drama_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests dramatic techniques, plot structure, and analysis of prescribed set texts (both African and non-African).",
          trap: "JAMB may ask about the function of a specific dramatic technique, not just its name. Always explain HOW it advances the plot or reveals character.",
          tip: "For set texts, know the key scenes, characters, and themes. JAMB often quotes specific lines and asks what they reveal about character or theme.",
          related_topics: ["Set text analysis", "Character study", "Thematic analysis"],
        },
      },
      {
        id: "drama_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "SOLILOQUY: Solo + speech = alone on stage. ASIDE: A-side = spoken to the side (audience). Tragedy ends in death/disaster. Comedy ends happily. Tragicomedy mixes both.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "drama_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why do playwrights use soliloquies instead of having characters explain their feelings through dialogue with others?",
          expected_understanding: "Soliloquies reveal what a character truly thinks and feels — things they might not say to others. This creates dramatic irony (the audience knows more than other characters) and deepens our understanding of the character's motivations.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "A character speaks their thoughts aloud while alone on stage. This is called:",
        options: [
          { label: "A", text: "Aside" },
          { label: "B", text: "Soliloquy" },
          { label: "C", text: "Monologue" },
          { label: "D", text: "Dialogue" },
        ],
        answer: "B",
        explanation: "A soliloquy is when a character speaks their thoughts aloud while alone on stage.",
        hints: ["Solo + speech = ?"],
      },
      {
        difficulty: "medium",
        question: "The turning point in a play, where tension is at its highest, is called the:",
        options: [
          { label: "A", text: "Exposition" },
          { label: "B", text: "Denouement" },
          { label: "C", text: "Climax" },
          { label: "D", text: "Prologue" },
        ],
        answer: "C",
        explanation: "The climax is the turning point of the play — the moment of greatest tension.",
        hints: ["The peak, the highest point"],
      },
      {
        difficulty: "jamb",
        question: "In 'Death and the King's Horseman,' the conflict between Elesin and the Colonial District Officer represents:",
        options: [
          { label: "A", text: "Individual vs society" },
          { label: "B", text: "Tradition vs modernity/colonialism" },
          { label: "C", text: "Man vs nature" },
          { label: "D", text: "Good vs evil" },
        ],
        answer: "B",
        explanation: "The play explores the clash between Yoruba tradition (Elesin's ritual suicide) and British colonial authority.",
        hints: ["Think about the two opposing forces in the play"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["drama_hook_01", "drama_intuitive_01", "drama_formal_01", "drama_formula_01", "drama_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 3. PROSE FICTION
  {
    subject: "literature",
    topic: "Prose Fiction",
    subtopic: "Elements of Prose and Novel Analysis",
    title: "Prose Fiction — Reading Between the Lines",
    learning_objectives: [
      "Identify elements of prose (plot, characterization, setting, point of view)",
      "Distinguish between types of novels (epistolary, picaresque, bildungsroman)",
      "Analyze narrative techniques and their effects",
      "Interpret themes and stylistic features in prose",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "prose_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "When you read 'Things Fall Apart' by Chinua Achebe, you're not just reading a story — you're experiencing pre-colonial Igbo life, the arrival of missionaries, and the collapse of a culture. Prose fiction is the art of telling stories that teach us about human nature and society.",
          prediction_prompt: "What's the difference between reading a novel for fun and reading it for an exam? What should you pay attention to?",
        },
      },
      {
        id: "prose_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Prose fiction is written in sentences and paragraphs (not verse). It includes novels, novellas, and short stories. The key elements are: Plot (what happens), Characterization (how characters are created), Setting (time and place), Point of View (who tells the story), and Theme (the message or idea). Every choice the author makes serves the story.",
          analogy: "Think of a novel like a movie. The plot is the script. The characters are the actors. The setting is the scenery. The point of view is the camera angle. The theme is the message the director wants to convey. Change any element, and the story changes.",
        },
      },
      {
        id: "prose_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Prose fiction elements: (1) Plot — events arranged in a narrative arc. (2) Characterization — direct (author tells) vs indirect (actions, speech, thoughts). (3) Setting — time, place, social environment. (4) Point of View — first person (I), third person limited (he/she, one character's thoughts), third person omniscient (all-knowing). (5) Theme — the central idea or message.",
          key_terms: [
            { term: "Protagonist", definition: "The main character of the story" },
            { term: "Antagonist", definition: "The character or force that opposes the protagonist" },
            { term: "Foreshadowing", definition: "Hints about what will happen later in the story" },
            { term: "Flashback", definition: "A scene set in a time earlier than the main story" },
          ],
        },
      },
      {
        id: "prose_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Characterization Methods: Direct (author tells you) + Indirect (show through action, speech, thoughts, appearance, others' reactions)",
          variables: [
            { name: "Direct", description: "Author directly states character traits" },
            { name: "Action", description: "What the character does reveals who they are" },
            { name: "Speech", description: "How and what the character says" },
            { name: "Thoughts", description: "Internal monologue reveals feelings" },
            { name: "Others", description: "How other characters react to them" },
          ],
          when_to_use: "When JAMB asks how a character is portrayed or what characterization method is used.",
          common_traps: [
            "Confusing flat/round characters — flat = one trait, round = complex",
            "Confusing static/dynamic — static doesn't change, dynamic does",
            "Missing indirect characterization when the author doesn't explicitly state traits",
          ],
          units_note: "JAMB may ask about specific characters from set texts. Know the main characters in your prescribed novels.",
        },
      },
      {
        id: "prose_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "In 'Second Class Citizen' by Buchi Emecheta, Adah works hard to support her family despite facing gender discrimination. The author shows this through Adah's actions and determination rather than directly stating it.",
          given: ["A passage describing Adah's behavior"],
          required: "Identify the characterization method",
          principle: "When the author shows character through actions rather than telling directly, it's indirect characterization.",
          steps: [
            { explanation: "Check if the author states traits directly", calculation: "The author doesn't say 'Adah is determined'" },
            { explanation: "Check what Adah does", calculation: "She works hard, supports family, faces discrimination" },
            { explanation: "Identify the method", calculation: "Actions reveal character = Indirect characterization" },
            { explanation: "Identify the technique within indirect", calculation: "Actions and behavior = characterization through action" },
          ],
          answer: "Indirect characterization through action. Adah's determination and resilience are shown through what she does, not what the author says about her.",
          check: "The reader discovers Adah's strength by watching her actions, not being told directly.",
        },
      },
      {
        id: "prose_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "A first-person narrator is always reliable.",
          why_wrong: "First-person narrators can be biased, unreliable, or even lying. The reader must evaluate what the narrator says vs what actually happens.",
          correct_model: "First-person narrators give intimate access but may be unreliable. Third-person omniscient gives a broader, more objective view.",
        },
      },
      {
        id: "prose_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests analysis of set texts — characters, themes, plot, and narrative techniques.",
          trap: "JAMB may quote a passage and ask which technique is used. Look for the method (direct/indirect) and the specific device (action, speech, thought).",
          tip: "For each set text, make a character map: who is the protagonist, antagonist, what do they want, what stands in their way, how do they change?",
          related_topics: ["Theme analysis", "Narrative voice", "Set text study"],
        },
      },
      {
        id: "prose_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Prose elements: Plot (what), Character (who), Setting (where/when), POV (whose eyes), Theme (why). Indirect characterization: Action, Speech, Thoughts, Appearance, Others' reactions.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "prose_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why might an author choose first-person narration over third-person omniscient?",
          expected_understanding: "First-person creates intimacy — the reader experiences everything through the narrator's eyes. It's powerful for showing personal struggle, bias, or limited understanding. But it limits what the reader knows.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "The main character in a novel is called the:",
        options: [
          { label: "A", text: "Antagonist" },
          { label: "B", text: "Protagonist" },
          { label: "C", text: "Narrator" },
          { label: "D", text: "Author" },
        ],
        answer: "B",
        explanation: "The protagonist is the main character. The antagonist opposes them.",
        hints: ["Pro = first/main"],
      },
      {
        difficulty: "medium",
        question: "When an author describes a character's thoughts and feelings directly, it is:",
        options: [
          { label: "A", text: "Indirect characterization" },
          { label: "B", text: "Direct characterization" },
          { label: "C", text: "Dialogue" },
          { label: "D", text: "Foreshadowing" },
        ],
        answer: "B",
        explanation: "Direct characterization is when the author directly tells the reader about a character's traits.",
        hints: ["Direct = author tells you directly"],
      },
      {
        difficulty: "jamb",
        question: "In 'Things Fall Apart,' Achebe's use of Igbo proverbs serves to:",
        options: [
          { label: "A", text: "Make the text longer" },
          { label: "B", text: "Show the richness of Igbo culture and wisdom" },
          { label: "C", text: "Confuse non-Igbo readers" },
          { label: "D", text: "Provide comic relief" },
        ],
        answer: "B",
        explanation: "Achebe uses Igbo proverbs to demonstrate the depth and sophistication of Igbo oral tradition and cultural values.",
        hints: ["What do proverbs represent in a culture?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["prose_hook_01", "prose_intuitive_01", "prose_formal_01", "prose_formula_01", "prose_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 4. POETRY
  {
    subject: "literature",
    topic: "Poetry",
    subtopic: "Elements and Forms of Poetry",
    title: "Poetry — The Music of Language",
    learning_objectives: [
      "Identify elements of poetry (rhythm, meter, rhyme, imagery)",
      "Distinguish between poetic forms (sonnet, ode, elegy, ballad)",
      "Analyze figurative language and sound devices in poems",
      "Interpret meaning through close reading of poems",
    ],
    difficulty_level: "hard",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "poetry_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Poetry is the most compressed form of literature. Every word matters. A single poem can make you cry, laugh, or see the world differently — in just 14 lines. When Shakespeare writes 'Shall I compare thee to a summer's day?', he's not just asking a question — he's creating an image, a feeling, and a declaration of love all at once.",
          prediction_prompt: "Read this: 'The fog comes on little cat feet.' What does this poem make you see? How does it work?",
        },
      },
      {
        id: "poetry_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Poetry is language chosen and arranged for its emotional and aesthetic effect. Poets use rhythm (the beat of the words), rhyme (matching sounds), imagery (vivid pictures in words), and figurative language (non-literal meaning) to create impact. Every word is deliberate — nothing is accidental.",
          analogy: "Think of poetry like perfume. A novel is a bottle of perfume — lots of liquid, the scent develops over time. A poem is a single drop — concentrated, powerful, lingering. One drop can fill a room. One poem can change how you see the world.",
        },
      },
      {
        id: "poetry_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Poetry elements: (1) Rhythm — pattern of stressed/unstressed syllables. (2) Meter — regular rhythm pattern (iambic: da-DUM). (3) Rhyme scheme — pattern of rhyming words (ABAB, ABBA). (4) Stanza — group of lines (couplet, triplet, quatrain). (5) Imagery — vivid sensory descriptions. (6) Sound devices — alliteration, assonance, consonance, onomatopoeia.",
          key_terms: [
            { term: "Sonnet", definition: "14-line poem, usually about love (Shakespearean: ABAB CDCD EFEF GG)" },
            { term: "Elegy", definition: "A poem of mourning for the dead" },
            { term: "Ballad", definition: "A narrative poem telling a story, often with a refrain" },
            { term: "Free Verse", definition: "Poetry without regular meter or rhyme scheme" },
          ],
        },
      },
      {
        id: "poetry_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Poem Analysis: Read → Identify form → Find imagery → Check sound devices → Determine theme → Analyze tone",
          variables: [
            { name: "Form", description: "What type of poem? Sonnet, ode, elegy, free verse?" },
            { name: "Imagery", description: "What senses does the poet appeal to? (sight, sound, touch, smell, taste)" },
            { name: "Sound", description: "Alliteration, assonance, consonance, onomatopoeia" },
            { name: "Theme", description: "What is the poem about? What message does it convey?" },
            { name: "Tone", description: "What is the poet's attitude? (sad, angry, joyful, reflective)" },
          ],
          when_to_use: "For any JAMB question requiring analysis of a poem. Follow this systematic approach.",
          common_traps: [
            "Confusing the speaker with the poet — the speaker may not be the poet",
            "Missing the difference between literal and figurative meaning",
            "Not identifying the rhyme scheme correctly",
          ],
          units_note: "JAMB may present unfamiliar poems. Use analysis skills, not memorization.",
        },
      },
      {
        id: "poetry_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Analyze: 'The autumn leaves fell softly to the ground, / Like golden tears from nature's weeping eye.'",
          given: ["Two lines from a poem"],
          required: "Identify the literary devices and explain their effect",
          principle: "Look for comparisons, sensory details, and figurative language.",
          steps: [
            { explanation: "Identify imagery", calculation: "'Autumn leaves fell softly' — visual and auditory imagery (golden, softly)" },
            { explanation: "Identify comparison", calculation: "'Like golden tears' — simile comparing leaves to tears" },
            { explanation: "Identify personification", calculation: "'Nature's weeping eye' — nature given human ability to weep" },
            { explanation: "Determine effect", calculation: "Creates a mood of sadness and beauty — autumn becomes emotional, not just seasonal" },
          ],
          answer: "Simile ('like golden tears'), personification ('nature's weeping eye'), and imagery ('golden,' 'softly'). The effect is melancholic — autumn becomes a time of loss and beauty.",
          check: "The devices work together to create a unified emotional effect.",
        },
      },
      {
        id: "poetry_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "The speaker in a poem is always the poet.",
          why_wrong: "The speaker is a persona — a voice created by the poet. In dramatic monologues, the speaker is a character, not the poet.",
          correct_model: "The speaker may or may not be the poet. Always refer to 'the speaker' not 'the poet' unless you're sure they're the same.",
        },
      },
      {
        id: "poetry_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests analysis of set poems — identifying devices, interpreting meaning, and explaining effects.",
          trap: "JAMB may ask about the 'tone' of a poem. Tone = the speaker's attitude. Don't confuse tone (attitude) with mood (feeling created in the reader).",
          tip: "For each set poem, know: the poet, the speaker, the occasion, the main imagery, the theme, and 2-3 key devices.",
          related_topics: ["Close reading", "Theme analysis", "Comparative analysis"],
        },
      },
      {
        id: "poetry_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Poetry analysis: Form (type), Imagery (pictures), Sound (music), Theme (message), Tone (attitude). Sonnet=14 lines. Elegy=mourning. Ballad=story. Free verse=no rules.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "poetry_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why do poets use imagery instead of just stating their feelings directly?",
          expected_understanding: "Imagery makes feelings vivid and personal. 'I am sad' tells you. 'The world is a hollow drum echoing my emptiness' makes you FEEL it. Poetry shows rather than tells.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "A 14-line poem about love is called a:",
        options: [
          { label: "A", text: "Ballad" },
          { label: "B", text: "Sonnet" },
          { label: "C", text: "Elegy" },
          { label: "D", text: "Ode" },
        ],
        answer: "B",
        explanation: "A sonnet is a 14-line poem, traditionally about love.",
        hints: ["Shakespeare wrote many of these"],
      },
      {
        difficulty: "medium",
        question: "'The wind whispered through the trees' uses which device?",
        options: [
          { label: "A", text: "Simile" },
          { label: "B", text: "Metaphor" },
          { label: "C", text: "Personification" },
          { label: "D", text: "Alliteration" },
        ],
        answer: "C",
        explanation: "Wind cannot whisper — this is personification, giving a human action to a non-human thing.",
        hints: ["Can wind really whisper?"],
      },
      {
        difficulty: "jamb",
        question: "In 'Piano and Drums' by Gabriel Okara, the contrast between piano and drums represents:",
        options: [
          { label: "A", text: "Music appreciation" },
          { label: "B", text: "Conflict between Western and African culture" },
          { label: "C", text: "Childhood memories" },
          { label: "D", text: "Musical instruments" },
        ],
        answer: "B",
        explanation: "The piano symbolizes Western civilization while drums represent African tradition. The poem explores cultural identity.",
        hints: ["What do piano and drums symbolize in African context?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["poetry_hook_01", "poetry_intuitive_01", "poetry_formal_01", "poetry_formula_01", "poetry_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 5. AFRICAN LITERATURE
  {
    subject: "literature",
    topic: "African Literature",
    subtopic: "Themes and Traditions",
    title: "African Literature — Voices of a Continent",
    learning_objectives: [
      "Identify major themes in African literature",
      "Understand the influence of oral tradition on written African literature",
      "Analyze the impact of colonialism on African literary expression",
      "Compare African and Western literary traditions",
    ],
    difficulty_level: "hard",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "afr_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "African literature is not just stories — it's the voice of a continent fighting for identity, independence, and dignity. From Chinua Achebe's 'Things Fall Apart' to Chimamanda Adichie's 'Purple Hibiscus,' African writers tell stories that the world needs to hear. They challenge stereotypes, preserve cultures, and imagine new futures.",
          prediction_prompt: "Why do you think Achebe wrote 'Things Fall Apart' in response to Joseph Conrad's 'Heart of Darkness'? What was he trying to correct?",
        },
      },
      {
        id: "afr_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "African literature has two roots: oral tradition (stories, proverbs, songs passed down through generations) and written tradition (novels, poems, plays). Modern African writers combine both — using proverbs in dialogue, incorporating oral storytelling techniques, and writing about the African experience in a world shaped by colonialism.",
          analogy: "Think of African literature like a baobab tree. The roots are oral traditions — deep, ancient, nourishing. The trunk is the written word — strong, visible, reaching outward. The branches are the different genres — novels, poetry, drama. The fruit is the message — stories that feed the mind and soul.",
        },
      },
      {
        id: "afr_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Major themes in African literature: (1) Colonialism and its effects — cultural disruption, identity crisis. (2) Tradition vs modernity — tension between old ways and new. (3) Identity — personal, cultural, national. (4) Gender and marriage — women's roles, bride price, education. (5) Corruption and politics — post-colonial governance. (6) Family and community — Ubuntu philosophy.",
          key_terms: [
            { term: "Oral Tradition", definition: "Stories, proverbs, songs, and history passed down through generations by word of mouth" },
            { term: "Negritude", definition: "A literary movement celebrating Black African identity and culture" },
            { term: "Post-colonialism", definition: "The study of cultural, social, and political effects of colonialism" },
            { term: "Ubuntu", definition: "African philosophy: 'I am because we are' — community over individualism" },
          ],
        },
      },
      {
        id: "afr_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Analyzing African Literature: Context (when/where) → Theme (what message) → Character (who) → Technique (how) → Tradition (oral roots)",
          variables: [
            { name: "Context", description: "Historical and cultural background of the work" },
            { name: "Theme", description: "Central messages about society, culture, politics" },
            { name: "Character", description: "How characters represent African experiences" },
            { name: "Technique", description: "Use of proverbs, oral storytelling, multiple languages" },
            { name: "Tradition", description: "Connection to oral literature and cultural practices" },
          ],
          when_to_use: "When analyzing any African literary text for JAMB. This framework covers all key aspects.",
          common_traps: [
            "Reading African literature with Western expectations — African storytelling has its own conventions",
            "Missing the use of proverbs and their significance",
            "Not understanding the historical context of colonialism",
          ],
          units_note: "JAMB set texts change periodically. Know the themes and techniques of your prescribed texts.",
        },
      },
      {
        id: "afr_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "In 'Things Fall Apart,' Okonkwo says: 'The white man is very clever. He came quietly and peaceably with his religion.' What does this reveal about the theme of the novel?",
          given: ["A quote from Things Fall Apart"],
          required: "Analyze what the quote reveals about the novel's theme",
          principle: "Look at the surface meaning and the deeper implication.",
          steps: [
            { explanation: "Read the quote literally", calculation: "Okonkwo acknowledges the white man's cleverness and peaceful approach" },
            { explanation: "Identify the irony", calculation: "Okonkwo says 'peaceably' but the religion will destroy his culture — he doesn't see the threat" },
            { explanation: "Connect to theme", calculation: "Theme: Colonialism arrived peacefully but its effects were devastating" },
            { explanation: "Identify dramatic irony", calculation: "The reader knows what Okonkwo doesn't — this religion will 'eat deep' into the culture" },
          ],
          answer: "The quote reveals the theme of colonialism's subtle destruction. The white man's approach seemed peaceful but was actually a form of cultural invasion that would destroy Igbo traditions.",
          check: "Achebe uses Okonkwo's blindness to dramatic irony — the reader sees the danger that Okonkwo cannot.",
        },
      },
      {
        id: "afr_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "African literature only started when Africans began writing in English.",
          why_wrong: "African oral literature (folktales, proverbs, songs, epics) existed for thousands of years before colonialism. Written African literature builds on this tradition.",
          correct_model: "African literature includes both oral and written traditions. Oral literature is the foundation; written literature is the extension.",
        },
      },
      {
        id: "afr_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests themes, characters, and techniques in prescribed African literary texts.",
          trap: "JAMB may ask about the cultural significance of specific practices (e.g., the Week of Peace, yam festival) in set texts. Know the cultural context.",
          tip: "For African literature, always consider: What does this text say about Africa? How does it challenge or reinforce stereotypes? What is the author's purpose?",
          related_topics: ["Post-colonial analysis", "Cultural studies", "Comparative literature"],
        },
      },
      {
        id: "afr_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "African literature themes: Colonialism, Tradition vs Modernity, Identity, Gender, Corruption, Community. Key authors: Achebe, Soyinka, Adichie, Armah, Emecheta, Ngugi.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "afr_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why is it important for Africans to tell their own stories rather than having others tell them?",
          expected_understanding: "As Chimamanda Adichie warns, 'The danger of a single story' is that others' stories about Africa are often one-dimensional — poverty, war, disease. Africans telling their own stories creates a fuller, more accurate, more human picture.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Who wrote 'Things Fall Apart'?",
        options: [
          { label: "A", text: "Wole Soyinka" },
          { label: "B", text: "Chinua Achebe" },
          { label: "C", text: "Chimamanda Adichie" },
          { label: "D", text: "Ngugi wa Thiong'o" },
        ],
        answer: "B",
        explanation: "Chinua Achebe wrote 'Things Fall Apart' (1958), one of the most widely read African novels.",
        hints: ["The most famous African novel about pre-colonial Igbo life"],
      },
      {
        difficulty: "medium",
        question: "The main theme of 'Purple Hibiscus' by Chimamanda Adichie is:",
        options: [
          { label: "A", text: "The Civil War" },
          { label: "B", text: "Family, freedom, and growing up" },
          { label: "C", text: "Colonialism" },
          { label: "D", text: "Slavery" },
        ],
        answer: "B",
        explanation: "Purple Hibiscus explores family dynamics, the search for freedom from a tyrannical father, and the coming-of-age of Kambili.",
        hints: ["The novel is about a teenage girl growing up in a strict household"],
      },
      {
        difficulty: "jamb",
        question: "In African literature, the use of proverbs serves to:",
        options: [
          { label: "A", text: "Make the text longer" },
          { label: "B", text: "Connect the written text to oral tradition" },
          { label: "C", text: "Confuse readers" },
          { label: "D", text: "Show off the author's knowledge" },
        ],
        answer: "B",
        explanation: "Proverbs connect written African literature to the rich oral tradition, adding cultural depth and wisdom.",
        hints: ["Proverbs are a key part of oral tradition"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["afr_hook_01", "afr_intuitive_01", "afr_formal_01", "afr_formula_01", "afr_practice_01"],
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
