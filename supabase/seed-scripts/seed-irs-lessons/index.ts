import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS = [
  {
    subject: "irs",
    topic: "Revelation of the Glorious Qur'an",
    subtopic: "Prophet's Visits to Cave Hira",
    title: "The First Revelation — When Allah Spoke to Muhammad",
    learning_objectives: [
      "Describe the Prophet's (SAW) visits to Cave Hira",
      "Explain the circumstances of the first revelation",
      "Differentiate between the modes of revelation",
      "Understand why the Qur'an was revealed piecemeal",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "irs_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "In the year 610 CE, a 40-year-old man sat alone in a cave on Mount Nur, near Makkah. He was meditating, seeking truth. Then the angel Jibril appeared with a message that would change the world: 'Read, in the name of your Lord.' This was the first revelation of the Glorious Qur'an.",
          prediction_prompt: "How would you feel if an angel appeared and told you to 'Read'? What would your reaction be?",
        },
      },
      {
        id: "irs_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Before prophethood, Muhammad (SAW) often retreated to Cave Hira to meditate and reflect. He was troubled by the idolatry and injustice in Makkah. On the Night of Power (Laylatul Qadr), Angel Jibril came and commanded: 'Read (Iqra).' Muhammad (SAW) replied: 'I am not a reader.' This happened three times. Then the first verses were revealed: 'Read in the name of your Lord who created.' (Q.96:1-5)",
          analogy: "Think of the first revelation like receiving the most important letter of your life. Muhammad (SAW) was alone, seeking guidance. The message came directly from Allah through Jibril. It was personal, powerful, and life-changing.",
        },
      },
      {
        id: "irs_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "The first revelation occurred in 610 CE in Cave Hira. Angel Jibril brought the first 5 verses of Surah al-Alaq (Q.96:1-5). The Prophet (SAW) was terrified and returned home. Khadijah comforted him and took him to Waraqa ibn Nawfal, who confirmed it was a divine revelation. The Qur'an was revealed over 23 years, piecemeal, for specific occasions and needs.",
          key_terms: [
            { term: "Wahy (Revelation)", definition: "Divine communication from Allah to His prophets through various modes" },
            { term: "Jibril (Gabriel)", definition: "The angel assigned by Allah to deliver revelations to prophets" },
            { term: "Laylatul Qadr", definition: "The Night of Power — when the first revelation occurred, better than 1000 months (Q.97:1-5)" },
            { term: "Piecemeal Revelation", definition: "The Qur'an was revealed gradually over 23 years, not all at once (Q.17:106)" },
          ],
        },
      },
      {
        id: "irs_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Modes of Revelation (Q.42:51): Inspiration behind the veil, Through an angel, Direct speech",
          variables: [
            { name: "Direct Speech", description: "Allah spoke directly to Musa (Moses) at Mount Sinai" },
            { name: "Through Angel", description: "Jibril brought revelations to Muhammad (SAW)" },
            { name: "Inspiration (Ilham)", description: "Allah inspired the heart/mind of the Prophet (SAW)" },
          ],
          when_to_use: "When asked about how Allah communicated with His prophets.",
          common_traps: [
            "Confusing the modes of revelation — they are not all the same",
            "Thinking the entire Qur'an was revealed at once — it was gradual",
            "Forgetting the role of Khadijah and Waraqa in confirming the revelation",
          ],
          units_note: "The piecemeal revelation allowed the early Muslims to learn and practice gradually.",
        },
      },
      {
        id: "irs_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Why was the Qur'an revealed gradually over 23 years instead of all at once?",
          given: ["The manner of Qur'anic revelation"],
          required: "Explain the wisdom behind piecemeal revelation",
          principle: "Allah's wisdom in gradual revelation served multiple purposes.",
          steps: [
            { explanation: "Easy to memorize", calculation: "Gradual revelation made it easier for companions to memorize and understand" },
            { explanation: "Applied to events", calculation: "Verses were revealed for specific situations — providing guidance when needed" },
            { explanation: "Gradual training", calculation: "Muslims could learn and practice Islam step by step" },
            { explanation: "Evidence of truth", calculation: "The consistency of the Qur'an over 23 years proves its divine origin" },
          ],
          answer: "The piecemeal revelation allowed for easy memorization, application to specific situations, gradual training of Muslims, and demonstrated the Qur'an's consistency and divine origin.",
          check: "Q.17:106 confirms: 'A Qur'an which We have divided into parts, so that you may recite it to people over a long period.'",
        },
      },
      {
        id: "irs_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "The Prophet (SAW) could read and write, so he composed the Qur'an.",
          why_wrong: "The Prophet (SAW) was ummi (unlettered) — he could not read or write. This is itself a miracle: an unlettered man produced the most eloquent Arabic text.",
          correct_model: "The Prophet (SAW) was unlettered. The Qur'an's miraculous eloquence is evidence of its divine origin.",
        },
      },
      {
        id: "irs_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests knowledge of the first revelation, modes of revelation, and the piecemeal nature of the Qur'an.",
          trap: "JAMB may ask about specific Qur'anic verses related to revelation (Q.96:1-5, Q.42:51, Q.17:106). Know these references.",
          tip: "For essay questions, mention the key figures: Jibril, Khadijah, Waraqa. This shows comprehensive knowledge.",
          related_topics: ["Preservation of the Qur'an", "Tajwid", "Hadith"],
        },
      },
      {
        id: "irs_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "First revelation: Cave Hira, 610 CE, Jibril, 'Iqra' (Read), Surah al-Alaq. Revelation over 23 years, piecemeal. Three modes: direct speech, through angel, inspiration.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "irs_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "What does the Prophet's (SAW) reaction to the first revelation (fear, running home) tell us about the nature of encountering the divine?",
          expected_understanding: "The Prophet's (SAW) fear shows that encountering the divine is overwhelming. Even the best of humanity was terrified. This humbles us — the divine is beyond our comprehension, yet merciful enough to communicate with us.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Where did the first revelation take place?",
        options: [
          { label: "A", text: "Masjid al-Haram" },
          { label: "B", text: "Cave Hira" },
          { label: "C", text: "Masjid al-Nabawi" },
          { label: "D", text: "Mount Uhud" },
        ],
        answer: "B",
        explanation: "The first revelation occurred in Cave Hira on Mount Nur, near Makkah.",
        hints: ["The cave where the Prophet (SAW) used to meditate"],
      },
      {
        difficulty: "medium",
        question: "The first word revealed in the Qur'an was:",
        options: [
          { label: "A", text: "Muhammad" },
          { label: "B", text: "Allah" },
          { label: "C", text: "Iqra (Read)" },
          { label: "D", text: "Bismillah" },
        ],
        answer: "C",
        explanation: "The first word was 'Iqra' (Read) — the opening of Surah al-Alaq (Q.96:1).",
        hints: ["The command Jibril gave to the Prophet (SAW)"],
      },
      {
        difficulty: "jamb",
        question: "The Qur'an was revealed piecemeal (gradually) to:",
        options: [
          { label: "A", text: "Make it easier to forget" },
          { label: "B", text: "Allow gradual learning and practice" },
          { label: "C", text: "Show the Prophet was composing it" },
          { label: "D", text: "Make the revelations longer" },
        ],
        answer: "B",
        explanation: "Gradual revelation allowed Muslims to learn, understand, and practice Islam step by step.",
        hints: ["Why is gradual learning better than instant knowledge?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["irs_hook_01", "irs_intuitive_01", "irs_formal_01", "irs_formula_01", "irs_practice_01"],
    },
    version: 1,
    status: "published",
  },
  {
    subject: "irs",
    topic: "Preservation of the Glorious Qur'an",
    subtopic: "Compilation and Standardization",
    title: "How the Qur'an Was Preserved Through the Ages",
    learning_objectives: [
      "Trace how the Qur'an was recorded and compiled",
      "Identify key companions involved in compilation",
      "Differentiate between Makkan and Madinan surahs",
      "Understand the standardization under Uthman (RA)",
    ],
    difficulty_level: "medium",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "irs2_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "The Qur'an was revealed over 23 years, yet today millions of Muslims recite the exact same Arabic text — word for word, letter for letter. How was this possible? The answer lies in the meticulous preservation efforts of the Prophet (SAW) and his companions.",
          prediction_prompt: "How do you think the Qur'an was preserved before the invention of printing presses?",
        },
      },
      {
        id: "irs2_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "The Prophet (SAW) had scribes who wrote down each revelation as it came. Companions also memorized the entire Qur'an — some knew whole surahs by heart. After the Prophet's death, the first Caliph Abu Bakr compiled the Qur'an into one book. The third Caliph Uthman standardized it, ensuring one统一 text for all Muslims.",
          analogy: "Think of the Qur'an's preservation like a master copy. The Prophet (SAW) dictated, scribes wrote, companions memorized. Multiple copies were made. Uthman's standardization ensured every copy was identical to the master.",
        },
      },
      {
        id: "irs2_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Preservation process: (1) During revelation: Scribes like Zaid ibn Thabit wrote on parchment, leather, bones. Companions memorized. (2) Abu Bakr's compilation (632 CE): Collected all written fragments into one mushaf. (3) Uthman's standardization (645 CE): Made copies, sent to provinces, burned variant copies. (4) Current mushaf: Based on Uthman's standardization, with diacritical marks added later.",
          key_terms: [
            { term: "Mushaf", definition: "The written compilation of the Qur'an in book form" },
            { term: "Hafiz", definition: "One who has memorized the entire Qur'an" },
            { term: "Qira'at", definition: "Variations in pronunciation of the Qur'an, all authentic" },
            { term: "Diacritical Marks", definition: "Vowel marks added later to ensure correct pronunciation" },
          ],
        },
      },
      {
        id: "irs2_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Compilation: Revelation → Oral + Written → Abu Bakr (collection) → Uthman (standardization) → Diacritics (final form)",
          variables: [
            { name: "Revelation", description: "Over 23 years, piecemeal" },
            { name: "Oral Tradition", description: "Companions memorized entire Qur'an" },
            { name: "Written", description: "Scribes recorded on various materials" },
            { name: "Abu Bakr", description: "First compilation into one book" },
            { name: "Uthman", description: "Standardized text, distributed copies" },
          ],
          when_to_use: "When asked about the preservation process of the Qur'an.",
          common_traps: [
            "Thinking the Qur'an was compiled only after the Prophet's death — it was also written during his lifetime",
            "Confusing Abu Bakr's compilation with Uthman's standardization",
            "Forgetting that oral memorization was equally important as written record",
          ],
          units_note: "The Uthmanic mushaf remains the standard text used worldwide today.",
        },
      },
      {
        id: "irs2_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Explain the roles of Abu Bakr and Uthman in preserving the Qur'an.",
          given: ["Two key figures in Qur'anic compilation"],
          required: "Distinguish their contributions",
          principle: "Abu Bakr collected; Uthman standardized.",
          steps: [
            { explanation: "Abu Bakr's role", calculation: "After the Battle of Yamama, many hafiz died. Abu Bakr ordered Zaid ibn Thabit to collect all written fragments and memorized portions into one mushaf." },
            { explanation: "Uthman's role", calculation: "During Uthman's caliphate, different dialects caused confusion. He ordered one standard text, sent copies to provinces, and burned variant copies." },
            { explanation: "Why both were necessary", calculation: "Abu Bakr ensured the Qur'an was collected. Uthman ensured it was standardized and uniform." },
            { explanation: "Legacy", calculation: "The Uthmanic mushaf is the basis of all Qur'ans printed today." },
          ],
          answer: "Abu Bakr compiled the first mushaf from written fragments and memorized portions. Uthman standardized the text, distributed copies to provinces, and removed variant readings.",
          check: "Q.15:9 confirms: 'We have sent down the Reminder (Qur'an) and We will preserve it.'",
        },
      },
      {
        id: "irs2_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "The Qur'an was compiled by one person at one time.",
          why_wrong: "It was a collective effort over time — from the Prophet's scribes to Abu Bakr's compilation to Uthman's standardization.",
          correct_model: "The Qur'an's preservation involved multiple people over multiple years, ensuring accuracy through both oral and written transmission.",
        },
      },
      {
        id: "irs2_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests knowledge of the compilation process, key companions, and Qur'anic preservation.",
          trap: "JAMB may ask about the difference between Makkan and Madinan surahs — Makkan = earlier, shorter, focused on belief. Madinan = later, longer, focused on law and community.",
          tip: "Know the key names: Zaid ibn Thabit (scribe), Abu Bakr (first compilation), Uthman (standardization).",
          related_topics: ["Revelation of the Qur'an", "Tajwid", "Six authentic hadith collections"],
        },
      },
      {
        id: "irs2_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Abu Bakr = first compilation. Uthman = standardization. Zaid ibn Thabit = chief scribe. Oral + Written = dual preservation. Q.15:9 = Allah's promise to preserve the Qur'an.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "irs2_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "What does the meticulous preservation of the Qur'an tell us about the importance Muslims place on the text?",
          expected_understanding: "The extraordinary efforts to preserve every letter and word show that Muslims believe the Qur'an is the literal word of Allah — not a human composition. This reverence drives the preservation effort.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Who was the chief scribe of the Qur'an during the Prophet's lifetime?",
        options: [
          { label: "A", text: "Abu Bakr" },
          { label: "B", text: "Zaid ibn Thabit" },
          { label: "C", text: "Uthman" },
          { label: "D", text: "Ali" },
        ],
        answer: "B",
        explanation: "Zaid ibn Thabit was the chief scribe who wrote down the revelations during the Prophet's (SAW) lifetime.",
        hints: ["The companion who compiled the Qur'an under Abu Bakr and Uthman"],
      },
      {
        difficulty: "medium",
        question: "Uthman standardized the Qur'an to:",
        options: [
          { label: "A", text: "Create a new version" },
          { label: "B", text: "Remove Allah's words" },
          { label: "C", text: "Ensure one统一 text for all Muslims" },
          { label: "D", text: "Translate it into other languages" },
        ],
        answer: "C",
        explanation: "Uthman standardized the text to prevent confusion from different dialects and variant readings.",
        hints: ["Why would having different versions be problematic?"],
      },
      {
        difficulty: "jamb",
        question: "The Qur'an is unique among scriptures because:",
        options: [
          { label: "A", text: "It has never been changed" },
          { label: "B", text: "It has been preserved in its original Arabic, letter for letter" },
          { label: "C", text: "It was written by the Prophet (SAW)" },
          { label: "D", text: "It contains no Arabic" },
        ],
        answer: "B",
        explanation: "The Qur'an has been preserved in its original Arabic text, with millions of hafiz worldwide ensuring its accuracy.",
        hints: ["What makes the Qur'an's preservation unique?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["irs2_hook_01", "irs2_intuitive_01", "irs2_formal_01", "irs2_formula_01", "irs2_practice_01"],
    },
    version: 1,
    status: "published",
  },
  {
    subject: "irs",
    topic: "Hadith Literature",
    subtopic: "History and Authentication",
    title: "Hadith — The Sunnah of the Prophet (SAW)",
    learning_objectives: [
      "Understand the importance of Hadith in Islam",
      "Distinguish between the six authentic hadith collections",
      "Explain the process of hadith authentication",
      "Differentiate between Sahih, Hassan, and Da'if hadith",
    ],
    difficulty_level: "hard",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "irs3_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "The Qur'an tells us to pray, but it doesn't describe HOW to pray — how many rak'ahs, what to recite, the movements. The Prophet's (SAW) example — his words, actions, and approvals — fills this gap. This is Hadith: the recorded Sunnah of the Prophet (SAW).",
          prediction_prompt: "If the Qur'an doesn't describe how to pray in detail, where do Muslims get their prayer instructions?",
        },
      },
      {
        id: "irs3_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Hadith is the record of the Prophet's (SAW) sayings, actions, and silent approvals. It's the second source of Islamic law after the Qur'an. Scholars developed a rigorous science to verify hadith — checking the chain of narrators (isnad) and the content (matn). Only authentic hadith can be used as evidence.",
          analogy: "Think of hadith authentication like fact-checking. Before publishing a story, a journalist verifies: Who said it? Who heard it? Is the chain reliable? Does the content make sense? Hadith scholars did the same — with even more rigor.",
        },
      },
      {
        id: "irs3_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Six authentic collections (Kutub al-Sittah): (1) Sahih al-Bukhari ( Imam al-Bukhari, 194-256 AH). (2) Sahih Muslim (Imam Muslim, 204-261 AH). (3) Sunan Abu Dawud. (4) Jami' al-Tirmidhi. (5) Sunan al-Nasa'i. (6) Sunan Ibn Majah. Authentication: Isnad (chain of narrators) + Matn (content). Classification: Sahih (authentic), Hassan (good), Da'if (weak).",
          key_terms: [
            { term: "Hadith", definition: "The record of the Prophet's (SAW) sayings, actions, and silent approvals" },
            { term: "Isnad", definition: "The chain of narrators who transmitted the hadith" },
            { term: "Matn", definition: "The actual text/content of the hadith" },
            { term: "Sahih", definition: "Authentic hadith with a continuous chain of reliable narrators" },
          ],
        },
      },
      {
        id: "irs3_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Hadith Authentication: Isnad (narrator chain) + Matn (content) → Classification",
          variables: [
            { name: "Sahih", description: "Authentic: continuous chain, reliable narrators, no hidden defects" },
            { name: "Hassan", description: "Good: slightly less reliable chain but content is sound" },
            { name: "Da'if", description: "Weak: unreliable narrator or broken chain — cannot be used as evidence" },
            { name: "Mawdu'", description: "Fabricated: falsely attributed to the Prophet (SAW) — rejected entirely" },
          ],
          when_to_use: "When asked about hadith classification or authentication methodology.",
          common_traps: [
            "Confusing the six collectors — each compiled different hadith, some overlapping",
            "Thinking all hadith are equally authentic — only Sahih hadith are used as evidence",
            "Forgetting that hadith complements the Qur'an, not contradicts it",
          ],
          units_note: "Al-Bukhari and Muslim are considered the most authentic collections.",
        },
      },
      {
        id: "irs3_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A hadith says: 'The Prophet (SAW) said: whoever prays Fajr in congregation is protected from Allah's punishment.' How do scholars determine if this hadith is authentic?",
          given: ["A hadith requiring authentication"],
          required: "Explain the authentication process",
          principle: "Scholars check the isnad (narrator chain) and matn (content).",
          steps: [
            { explanation: "Check the Isnad", calculation: "Who narrated it? Did they meet the person they claim to have heard it from? Were they trustworthy and had a good memory?" },
            { explanation: "Check the Matn", calculation: "Does the content contradict the Qur'an or established hadith? Is it reasonable?" },
            { explanation: "Cross-reference", calculation: "Do other authentic hadith support this? Multiple chains strengthen a hadith." },
            { explanation: "Classification", calculation: "If the chain is unbroken, narrators reliable, content sound → Sahih" },
          ],
          answer: "Scholars verify the isnad (each narrator must be trustworthy, have good memory, and directly heard from the previous narrator) and the matn (content must not contradict established sources).",
          check: "This hadith is found in Sahih al-Bukhari and Sahih Muslim — both authenticated it.",
        },
      },
      {
        id: "irs3_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "The Prophet (SAW) wrote the hadith himself.",
          why_wrong: "The Prophet (SAW) generally discouraged writing down his hadith during his lifetime (to avoid confusion with the Qur'an). The hadith was recorded by companions after his death.",
          correct_model: "Hadith was transmitted orally during the Prophet's lifetime, then recorded by companions and later scholars.",
        },
      },
      {
        id: "irs3_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests knowledge of the six hadith collectors, authentication process, and hadith classification.",
          trap: "JAMB may ask about specific hadith collectors. Know: Bukhari (most authentic), Muslim (second most), Abu Dawud (Sunan), Tirmidhi (Jami'), Nasa'i, Ibn Majah.",
          tip: "For essay questions, mention the importance of hadith: it explains the Qur'an, provides practical guidance, and is the second source of Islamic law.",
          related_topics: ["The Qur'an", "Islamic jurisprudence", "The Prophet's biography"],
        },
      },
      {
        id: "irs3_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Six collections: Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah. Isnad = chain. Matn = content. Sahih = authentic. Hassan = good. Da'if = weak.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "irs3_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why is the chain of narration (isnad) so important in hadith authentication?",
          expected_understanding: "The isnad ensures that the hadith can be traced back to the Prophet (SAW) through reliable, trustworthy people. Without a strong chain, we cannot be sure the hadith is genuinely from the Prophet.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "The most authentic collection of hadith is:",
        options: [
          { label: "A", text: "Sahih Muslim" },
          { label: "B", text: "Sahih al-Bukhari" },
          { label: "C", text: "Sunan Abu Dawud" },
          { label: "D", text: "Jami' al-Tirmidhi" },
        ],
        answer: "B",
        explanation: "Sahih al-Bukhari is considered the most authentic hadith collection after the Qur'an.",
        hints: ["The scholar who spent 16 years compiling it"],
      },
      {
        difficulty: "medium",
        question: "The chain of narrators in a hadith is called:",
        options: [
          { label: "A", text: "Matn" },
          { label: "B", text: "Isnad" },
          { label: "C", text: "Sunan" },
          { label: "D", text: "Fiqh" },
        ],
        answer: "B",
        explanation: "The Isnad is the chain of narrators who transmitted the hadith from the Prophet (SAW).",
        hints: ["The 'chain' that links narrators"],
      },
      {
        difficulty: "jamb",
        question: "Hadith is important in Islam because it:",
        options: [
          { label: "A", text: "Replaces the Qur'an" },
          { label: "B", text: "Explains and complements the Qur'an" },
          { label: "C", text: "Was written by the Prophet (SAW)" },
          { label: "D", text: "Is more important than the Qur'an" },
        ],
        answer: "B",
        explanation: "Hadith complements the Qur'an by providing practical guidance, explanations, and the Prophet's example.",
        hints: ["What does hadith do that the Qur'an doesn't?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["irs3_hook_01", "irs3_intuitive_01", "irs3_formal_01", "irs3_formula_01", "irs3_practice_01"],
    },
    version: 1,
    status: "published",
  },
  {
    subject: "irs",
    topic: "Tawhid (Islamic Monotheism)",
    subtopic: "Concept and Importance",
    title: "Tawhid — The Heart of Islam",
    learning_objectives: [
      "Define Tawhid and its importance",
      "Distinguish between the three types of Tawhid",
      "Explain the concept of Shirk and its categories",
      "Apply Tawhid principles to daily life",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "irs4_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "The Shahadah — 'La ilaha illallah, Muhammadur Rasulullah' — is not just words. It's a complete worldview. It declares: there is no god but Allah. This is Tawhid — the absolute oneness of Allah. It's the foundation of Islam. Everything else in the religion rests on it.",
          prediction_prompt: "What does it mean to say 'there is no god but Allah'? How does this belief affect daily life?",
        },
      },
      {
        id: "irs4_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Tawhid means recognizing that Allah is One — unique, incomparable, the only Creator and Sustainer. It has three aspects: Tawhid ar-Rububiyyah (Allah is the only Lord and Creator), Tawhid al-Uluhiyyah (Allah alone deserves worship), Tawhid al-Asma was-Sifat (Allah's names and attributes are unique). Shirk (associating partners with Allah) is the opposite of Tawhid — the greatest sin.",
          analogy: "Think of Tawhid like the sun. There is only one sun in our solar system. It gives light, warmth, and life. Without it, nothing exists. Similarly, Allah is the only source of all creation, sustenance, and guidance. Everything else depends on Him.",
        },
      },
      {
        id: "irs4_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Three types of Tawhid: (1) Tawhid ar-Rububiyyah — Oneness of Lordship: Allah alone creates, sustains, and controls everything. (2) Tawhid al-Uluhiyyah — Oneness of Worship: only Allah deserves to be worshipped. (3) Tawhid al-Asma was-Sifat — Oneness of Names and Attributes: Allah's names and attributes are unique. Shirk: the opposite of Tawhid — associating others with Allah in worship, love, or obedience.",
          key_terms: [
            { term: "Tawhid", definition: "Islamic monotheism — the absolute oneness of Allah in all aspects" },
            { term: "Rububiyyah", definition: "Lordship — Allah is the only Creator, Sustainer, and Controller" },
            { term: "Uluhiyyah", definition: "Worship — only Allah deserves to be worshipped" },
            { term: "Shirk", definition: "Associating partners with Allah — the greatest sin in Islam" },
          ],
        },
      },
      {
        id: "irs4_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Tawhid = Oneness of Lordship + Oneness of Worship + Oneness of Names/Attributes",
          variables: [
            { name: "Rububiyyah", description: "Allah alone creates, sustains, controls" },
            { name: "Uluhiyyah", description: "Only Allah deserves worship, prayer, sacrifice" },
            { name: "Asma was-Sifat", description: "Allah's names (Ar-Rahman, Al-Malik) and attributes are unique" },
            { name: "Shirk", description: "The opposite — giving any of the above to other than Allah" },
          ],
          when_to_use: "When asked about the concept of Tawhid or its types.",
          common_traps: [
            "Confusing the three types — each addresses a different aspect of Allah's oneness",
            "Thinking Shirk is only idol worship — it can also be loving someone more than Allah",
            "Forgetting that Tawhid is the foundation of all Islamic belief and practice",
          ],
          units_note: "Tawhid is the first article of the Shahadah: 'La ilaha illallah.'",
        },
      },
      {
        id: "irs4_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "How does Tawhid affect a Muslim's daily life? Give three practical examples.",
          given: ["The concept of Tawhid"],
          required: "Apply Tawhid to practical situations",
          principle: "Tawhid means directing all worship, trust, and obedience to Allah alone.",
          steps: [
            { explanation: "Example 1: Prayer", calculation: "A Muslim prays to Allah alone — not to saints, prophets, or idols (Uluhiyyah)" },
            { explanation: "Example 2: Trust", calculation: "A Muslim relies on Allah for provision, not on amulets or fortune-tellers (Rububiyyah)" },
            { explanation: "Example 3: Obedience", calculation: "A Muslim obeys Allah's commands even when it conflicts with social pressure (Asma was-Sifat)" },
            { explanation: "Summary", calculation: "Tawhid shapes every aspect: worship, trust, morality, and social life" },
          ],
          answer: "Tawhid affects daily life through: (1) worshipping Allah alone (prayer, dua), (2) trusting only in Allah for provision (not superstition), (3) obeying Allah's commands in all matters.",
          check: "Tawhid is not just belief — it's a way of life that influences every decision.",
        },
      },
      {
        id: "irs4_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Tawhid only means not worshipping idols.",
          why_wrong: "Tawhid goes beyond idols — it means directing ALL aspects of worship, trust, love, and obedience to Allah alone. Loving wealth more than Allah can be a form of shirk.",
          correct_model: "Tawhid is comprehensive: it affects worship, trust, love, fear, hope, and obedience. Anything directed to other than Allah that should be directed to Him alone is shirk.",
        },
      },
      {
        id: "irs4_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests knowledge of Tawhid's types, its importance, and the concept of shirk.",
          trap: "JAMB may ask about minor shirk (riya — showing off in worship) vs major shirk (idol worship). Both are prohibited.",
          tip: "For essay questions, define Tawhid, explain the three types, give examples, and contrast with shirk. This structure covers all bases.",
          related_topics: ["The Shahadah", "Types of Shirk", "Islamic belief"],
        },
      },
      {
        id: "irs4_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Tawhid = Oneness. Three types: Rububiyyah (Lordship), Uluhiyyah (Worship), Asma/Sifat (Names/Attributes). Opposite = Shirk (associating partners). Greatest sin in Islam.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "irs4_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "How is Tawhid different from the Christian concept of the Trinity?",
          expected_understanding: "Muslims believe Allah is absolutely One — no partners, no divisions. The Trinity (Father, Son, Holy Spirit) is seen as contradicting Tawhid. For Muslims, Tawhid is the purest form of monotheism.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Tawhid means:",
        options: [
          { label: "A", text: "Polytheism" },
          { label: "B", text: "Islamic monotheism" },
          { label: "C", text: "Prophethood" },
          { label: "D", text: "Judgment day" },
        ],
        answer: "B",
        explanation: "Tawhid is the Islamic concept of absolute monotheism — the oneness of Allah.",
        hints: ["Mono = one"],
      },
      {
        difficulty: "medium",
        question: "Which of the following is a type of Tawhid?",
        options: [
          { label: "A", text: "Tawhid ar-Rububiyyah" },
          { label: "B", text: "Tawhid al-Malikiyyah" },
          { label: "C", text: "Tawhid an-Nubuwwah" },
          { label: "D", text: "Tawhid al-Hakimiyyah" },
        ],
        answer: "A",
        explanation: "Tawhid ar-Rububiyyah (Oneness of Lordship) is one of the three types of Tawhid.",
        hints: ["The three types: Lordship, Worship, Names/Attributes"],
      },
      {
        difficulty: "jamb",
        question: "The greatest sin in Islam is:",
        options: [
          { label: "A", text: "Lying" },
          { label: "B", text: "Stealing" },
          { label: "C", text: "Shirk (associating partners with Allah)" },
          { label: "D", text: "Disobedience to parents" },
        ],
        answer: "C",
        explanation: "Shirk is the greatest sin because it violates the foundation of Islam — Tawhid.",
        hints: ["What is the opposite of Tawhid?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["irs4_hook_01", "irs4_intuitive_01", "irs4_formal_01", "irs4_formula_01", "irs4_practice_01"],
    },
    version: 1,
    status: "published",
  },
  {
    subject: "irs",
    topic: "The Pillars of Islam",
    subtopic: "Foundations of Muslim Practice",
    title: "The Five Pillars — The Framework of Muslim Life",
    learning_objectives: [
      "Identify and explain the five pillars of Islam",
      "Understand the requirements of each pillar",
      "Explain the significance of Zakat and Sawm",
      "Apply the pillars to daily Muslim practice",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "irs5_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Islam is not just a set of beliefs — it's a way of life. The five pillars are the framework: they structure a Muslim's day, year, and lifetime. From the daily prayer to the annual pilgrimage, these pillars connect the individual to Allah and to the global Muslim community.",
          prediction_prompt: "What if someone said 'I believe in Islam but don't pray'? Would they be a complete Muslim?",
        },
      },
      {
        id: "irs5_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "The five pillars are: (1) Shahadah — declaration of faith. (2) Salah — five daily prayers. (3) Zakat — annual charity (2.5% of savings). (4) Sawm — fasting during Ramadan. (5) Hajj — pilgrimage to Makkah (once in a lifetime if able). Each pillar addresses a different aspect: belief, prayer, wealth, body, and community.",
          analogy: "Think of the pillars like the pillars of a building. Remove one, and the structure weakens. Each pillar supports a different aspect of faith. Together, they create a complete framework for Muslim life.",
        },
      },
      {
        id: "irs5_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "(1) Shahadah: 'La ilaha illallah, Muhammadur Rasulullah' — the foundation. (2) Salah: Five daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) — the connection to Allah. (3) Zakat: 2.5% of savings above nisab — purification of wealth. (4) Sawm: Fasting from dawn to sunset during Ramadan — self-discipline and empathy. (5) Hajj: Pilgrimage to Makkah — unity and equality before Allah.",
          key_terms: [
            { term: "Shahadah", definition: "The declaration of faith: 'There is no god but Allah, Muhammad is His messenger'" },
            { term: "Salah", definition: "The five daily obligatory prayers" },
            { term: "Zakat", definition: "Annual obligatory charity — 2.5% of savings above nisab (minimum threshold)" },
            { term: "Sawm", definition: "Fasting during Ramadan — abstaining from food, drink, and other needs from dawn to sunset" },
          ],
        },
      },
      {
        id: "irs5_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Five Pillars: Shahadah (Belief) → Salah (Prayer) → Zakat (Wealth) → Sawm (Body) → Hajj (Community)",
          variables: [
            { name: "Shahadah", description: "Foundation — declaration of faith" },
            { name: "Salah", description: "Connection — five daily prayers at fixed times" },
            { name: "Zakat", description: "Purification — 2.5% of wealth for the poor" },
            { name: "Sawm", description: "Discipline — fasting during Ramadan" },
            { name: "Hajj", description: "Unity — pilgrimage to Makkah (once if able)" },
          ],
          when_to_use: "When asked about the five pillars, their order, or their significance.",
          common_traps: [
            "Forgetting that Hajj is only required if physically and financially able",
            "Confusing Zakat with Sadaqah — Zakat is obligatory, Sadaqah is voluntary",
            "Not knowing the five daily prayers by name",
          ],
          units_note: "The five pillars are mentioned in a famous hadith: 'Islam is built on five pillars...' (Sahih al-Bukhari).",
        },
      },
      {
        id: "irs5_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A Muslim earns ₦500,000 per year and has savings of ₦2,000,000 above the nisab threshold. How much Zakat must they pay?",
          given: ["Annual income: ₦500,000", "Savings above nisab: ₦2,000,000"],
          required: "Calculate the Zakat amount",
          principle: "Zakat is 2.5% of savings above nisab (not income).",
          steps: [
            { explanation: "Identify the base", calculation: "Zakat is calculated on savings above nisab, not income" },
            { explanation: "Apply the rate", calculation: "2.5% of ₦2,000,000 = ₦50,000" },
            { explanation: "Note", calculation: "The income (₦500,000) is not included — only accumulated savings" },
            { explanation: "Purpose", calculation: "Zakat purifies wealth and helps the poor (one of the 8 categories in Q.9:60)" },
          ],
          answer: "The Zakat amount is ₦50,000 (2.5% of ₦2,000,000 savings above nisab).",
          check: "Zakat is calculated annually on wealth, not income. The poor receive: Q.9:60 lists 8 categories.",
        },
      },
      {
        id: "irs5_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Zakat is voluntary charity.",
          why_wrong: "Zakat is OBLIGATORY — it's one of the five pillars. Sadaqah (voluntary charity) is separate and additional.",
          correct_model: "Zakat = obligatory (2.5% of savings above nisab). Sadaqah = voluntary (any amount, any time).",
        },
      },
      {
        id: "irs5_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests knowledge of the five pillars, their requirements, and their significance.",
          trap: "JAMB may ask about the conditions for Hajj — it's obligatory only once in a lifetime for those who are physically and financially able.",
          tip: "For essay questions, describe each pillar and explain why it's important. Connect them to the hadith: 'Islam is built on five pillars.'",
          related_topics: ["Zakat rates", "Ramadan rules", "Hajj rituals"],
        },
      },
      {
        id: "irs5_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Five Pillars: Shahadah (faith), Salah (prayer), Zakat (charity), Sawm (fasting), Hajj (pilgrimage). Hadith: 'Islam is built on five pillars.'",
          hook_type: "mnemonic",
        },
      },
      {
        id: "irs5_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why is Salah (prayer) performed five times a day? What does this frequency teach about the Muslim's relationship with Allah?",
          expected_understanding: "Five daily prayers keep the Muslim constantly connected to Allah. It's a reminder that no matter how busy life gets, Allah comes first. The regularity builds discipline and spiritual awareness.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "How many pillars of Islam are there?",
        options: [
          { label: "A", text: "3" },
          { label: "B", text: "4" },
          { label: "C", text: "5" },
          { label: "D", text: "7" },
        ],
        answer: "C",
        explanation: "There are five pillars of Islam: Shahadah, Salah, Zakat, Sawm, and Hajj.",
        hints: ["The five foundations of Muslim practice"],
      },
      {
        difficulty: "medium",
        question: "Zakat is calculated as:",
        options: [
          { label: "A", text: "10% of income" },
          { label: "B", text: "2.5% of savings above nisab" },
          { label: "C", text: "5% of all wealth" },
          { label: "D", text: "20% of profit" },
        ],
        answer: "B",
        explanation: "Zakat is 2.5% of accumulated savings that exceed the nisab (minimum threshold).",
        hints: ["What percentage of wealth above a minimum?"],
      },
      {
        difficulty: "jamb",
        question: "Hajj is obligatory for a Muslim who:",
        options: [
          { label: "A", text: "Is healthy and wealthy" },
          { label: "B", text: "Is physically and financially able" },
          { label: "C", text: "Has completed Ramadan" },
          { label: "D", text: "Is over 40 years old" },
        ],
        answer: "B",
        explanation: "Hajj is obligatory once in a lifetime for those who are physically and financially able to undertake it.",
        hints: ["What two conditions must be met?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["irs5_hook_01", "irs5_intuitive_01", "irs5_formal_01", "irs5_formula_01", "irs5_practice_01"],
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
