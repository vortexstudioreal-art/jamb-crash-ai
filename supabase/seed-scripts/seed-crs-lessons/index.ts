import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS = [
  // 1. THE CREATION ACCOUNT
  {
    subject: "crs",
    topic: "The Creation Account",
    subtopic: "God's Creation and Purpose",
    title: "Creation — How Everything Began",
    learning_objectives: [
      "Narrate the biblical account of creation in Genesis 1-2",
      "Explain the purpose of creation and humanity's role",
      "Identify key themes in the creation narrative",
      "Apply lessons from creation to environmental stewardship",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "crs_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "In the beginning, God created the heavens and the earth. The Bible opens with this powerful declaration. But creation is not just about how the world started — it's about WHY it was made. The creation account reveals God's power, purpose, and plan for humanity.",
          prediction_prompt: "Why do you think the Bible begins with creation? What does this tell us about God's nature?",
        },
      },
      {
        id: "crs_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Genesis 1-2 describes God creating the world in six days and resting on the seventh. Each day, God creates something: light, sky, land, plants, animals, and finally humans. The climax is humanity — created in God's image, given dominion over all creation. This shows humans are special in God's plan.",
          analogy: "Think of creation like an artist building a masterpiece. Day by day, God adds elements — the sky as a canvas, mountains as texture, animals as colour. The final touch is humanity — the viewer who appreciates and cares for the artwork.",
        },
      },
      {
        id: "crs_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Key elements of the creation account: (1) God created everything from nothing (ex nihilo). (2) Creation was orderly and progressive (days 1-6). (3) Humanity was created in God's image (imago Dei) — with reason, morality, and creativity. (4) Humanity was given dominion — responsibility to care for creation. (5) God declared creation 'very good' (Genesis 1:31). (6) The Sabbath rest (Genesis 2:1-3) established a pattern of work and rest.",
          key_terms: [
            { term: "Imago Dei", definition: "The image of God in humanity — reason, morality, creativity, relationship" },
            { term: "Dominion", definition: "The God-given responsibility to care for and steward creation" },
            { term: "Ex Nihilo", definition: "Creation from nothing — only God can create from nothing" },
            { term: "Sabbath", definition: "The seventh day of rest, establishing a rhythm of work and worship" },
          ],
        },
      },
      {
        id: "crs_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Creation Account: Days 1-6 (Creation) → Day 7 (Rest) → Humanity as Stewards",
          variables: [
            { name: "Day 1", description: "Light and darkness (Day and Night)" },
            { name: "Day 2", description: "Sky and waters (Firmament)" },
            { name: "Day 3", description: "Land, seas, and plants" },
            { name: "Day 4", description: "Sun, moon, and stars" },
            { name: "Day 5", description: "Birds and sea creatures" },
            { name: "Day 6", description: "Land animals and humanity" },
            { name: "Day 7", description: "God rested — Sabbath" },
          ],
          when_to_use: "When asked about the order of creation, the purpose of humanity, or the significance of the Sabbath.",
          common_traps: [
            "Confusing Genesis 1 and Genesis 2 — they tell the same story from different perspectives",
            "Thinking 'dominion' means exploitation — it means responsible stewardship",
            "Forgetting that rest is part of God's design — not laziness but renewal",
          ],
          units_note: "The 'days' of creation are interpreted differently: literal 24-hour days, or long periods (day-age theory).",
        },
      },
      {
        id: "crs_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A company wants to clear a forest to build a factory. How would the creation account inform a Christian perspective on this decision?",
          given: ["An environmental decision with economic implications"],
          required: "Apply biblical principles from the creation account",
          principle: "Humanity has dominion (stewardship) over creation, not exploitation.",
          steps: [
            { explanation: "Identify the principle", calculation: "Genesis 2:15 — 'The LORD God took the man and put him in the Garden of Eden to work it and take care of it'" },
            { explanation: "Apply to the situation", calculation: "Dominion means stewardship, not destruction. We are caretakers, not owners." },
            { explanation: "Consider the balance", calculation: "Economic development vs environmental care — Christians should seek sustainable solutions" },
            { explanation: "Practical application", calculation: "Can the factory be built without destroying the forest? Can reforestation offset the damage?" },
          ],
          answer: "A Christian perspective would emphasize responsible stewardship — balancing economic needs with environmental care. Complete destruction of the forest would violate the creation mandate.",
          check: "The creation account establishes humanity as caretakers, not destroyers, of God's creation.",
        },
      },
      {
        id: "crs_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "The Bible and science contradict each other on creation.",
          why_wrong: "Many Christians see science and the Bible as complementary — science explains 'how' while the Bible explains 'why.' They address different questions.",
          correct_model: "The creation account is primarily theological (revealing God's nature and purpose), not scientific. It answers 'why' more than 'how.'",
        },
      },
      {
        id: "crs_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests knowledge of the creation narrative, key verses, themes, and practical applications.",
          trap: "JAMB may ask about specific verses (Genesis 1:26-28, Genesis 2:15). Know these passages and their significance.",
          tip: "For essay questions, structure: Introduction (context) → Account (what happened) → Themes (what it teaches) → Application (relevance today).",
          related_topics: ["The Fall", "Environmental stewardship", "Human dignity"],
        },
      },
      {
        id: "crs_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Genesis 1: God created everything in 6 days, rested on 7th. Genesis 2: Humanity placed in Garden to tend it. Key verse: Genesis 1:26 — 'Let us make mankind in our image.' Theme: God's power, purpose, and plan.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "crs_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "What does it mean to be created in the 'image of God'? How should this affect how we treat other people?",
          expected_understanding: "Being in God's image means we have dignity, reason, morality, and the capacity for relationships. This is why every human life has value — regardless of race, gender, status, or ability.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "According to Genesis 1, God created humanity on which day?",
        options: [
          { label: "A", text: "Fifth day" },
          { label: "B", text: "Sixth day" },
          { label: "C", text: "Seventh day" },
          { label: "D", text: "Third day" },
        ],
        answer: "B",
        explanation: "God created land animals and humanity on the sixth day (Genesis 1:24-31).",
        hints: ["The climax of creation"],
      },
      {
        difficulty: "medium",
        question: "The phrase 'imago Dei' refers to:",
        options: [
          { label: "A", text: "God's creation of the world" },
          { label: "B", text: "Humanity being created in God's image" },
          { label: "C", text: "The Sabbath rest" },
          { label: "D", text: "The fall of man" },
        ],
        answer: "B",
        explanation: "'Imago Dei' (image of God) refers to humanity being created in God's likeness — with reason, morality, and creativity.",
        hints: ["Image of God = ?"],
      },
      {
        difficulty: "jamb",
        question: "Genesis 2:15 states that God placed man in the garden 'to work it and take care of it.' This establishes the principle of:",
        options: [
          { label: "A", text: "Exploitation of nature" },
          { label: "B", text: "Environmental stewardship" },
          { label: "C", text: "Agricultural dominance" },
          { label: "D", text: "Retirement from work" },
        ],
        answer: "B",
        explanation: "This verse establishes humanity's role as caretakers (stewards) of God's creation, not exploiters.",
        hints: ["Work AND take care = ?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["crs_hook_01", "crs_intuitive_01", "crs_formal_01", "crs_formula_01", "crs_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 2. THE FALL OF MAN
  {
    subject: "crs",
    topic: "The Fall of Man",
    subtopic: "Sin and Its Consequences",
    title: "The Fall — When Everything Changed",
    learning_objectives: [
      "Narrate the Genesis 3 account of the fall",
      "Explain the consequences of disobedience",
      "Understand the concept of original sin",
      "Apply lessons from the fall to moral decisions",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "fall_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "God gave Adam and Eve everything — a beautiful garden, delicious food, perfect fellowship. He gave them one rule: don't eat from one tree. Just one. But they broke that one rule, and everything changed. Sin entered the world, and nothing has been the same since.",
          prediction_prompt: "Why do you think God gave a rule He knew would be broken? What does this tell us about free will?",
        },
      },
      {
        id: "fall_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "The serpent tempted Eve by questioning God's word: 'Did God really say...?' Eve saw the fruit was good for food, pleasing to the eye, and desirable for wisdom. She ate, and gave some to Adam. Their eyes were opened — they knew they were naked. They hid from God. The consequences were severe: pain, toil, separation from God, and death.",
          analogy: "Think of the fall like breaking a trust. A parent tells a child: 'Don't touch the stove — it's hot.' The child touches it and gets burned. The child's action doesn't change the parent's love, but it changes the relationship. The child now knows pain and loss of trust.",
        },
      },
      {
        id: "fall_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "The Fall (Genesis 3): (1) The serpent's temptation — questioning God's word and character. (2) Eve's disobedience — eating the forbidden fruit. (3) Adam's disobedience — eating without resistance. (4) Consequences: shame (knew they were naked), hiding from God, blame (Adam blamed Eve, Eve blamed serpent). (5) God's curses: pain in childbearing, toil for food, death. (6) The promise of redemption (Genesis 3:15) — the offspring of the woman will crush the serpent's head.",
          key_terms: [
            { term: "Original Sin", definition: "The inherited sinfulness of humanity, descended from Adam and Eve's disobedience" },
            { term: "The Fall", definition: "The event in Genesis 3 when Adam and Eve disobeyed God, bringing sin into the world" },
            { term: "Redemption", definition: "God's plan to rescue humanity from sin through Jesus Christ" },
            { term: "Theological Significance", definition: "The Fall explains why the world is broken and why humanity needs a Savior" },
          ],
        },
      },
      {
        id: "fall_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "The Fall: Temptation → Disobedience → Shame → Hiding → Blame → Consequences → Promise of Redemption",
          variables: [
            { name: "Temptation", description: "Serpent questions God's word" },
            { name: "Disobedience", description: "Adam and Eve eat the forbidden fruit" },
            { name: "Shame", description: "They realize they are naked" },
            { name: "Hiding", description: "They hide from God" },
            { name: "Blame", description: "Each blames the other" },
            { name: "Consequences", description: "Pain, toil, death, separation from God" },
            { name: "Promise", description: "Genesis 3:15 — the offspring will crush the serpent" },
          ],
          when_to_use: "For analyzing the narrative flow and theological significance of the Fall.",
          common_traps: [
            "Blaming Eve alone — Adam was equally responsible (he was with her)",
            "Thinking the fruit was literally poisonous — the issue was disobedience, not the fruit itself",
            "Missing the promise of redemption in Genesis 3:15",
          ],
          units_note: "The Fall is foundational to Christian theology — it explains the human condition and the need for salvation.",
        },
      },
      {
        id: "fall_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A friend says: 'If God is all-knowing, He knew Adam and Eve would sin. So why did He create them? Isn't God responsible for sin?' How would you respond?",
          given: ["A theological question about God's responsibility for sin"],
          required: "Explain the relationship between free will and sin",
          principle: "God created humans with free will. Love requires choice. Without the possibility of disobedience, obedience has no meaning.",
          steps: [
            { explanation: "Acknowledge the question", calculation: "It's a genuine and important question" },
            { explanation: "Explain free will", calculation: "God gave humans the ability to choose — including the choice to disobey" },
            { explanation: "Explain love", calculation: "True love requires free choice. Robot obedience is not love." },
            { explanation: "Address responsibility", calculation: "God created the possibility of sin but did not cause sin. Humans chose to disobey." },
          ],
          answer: "God created humans with free will because love requires choice. The possibility of disobedience is necessary for genuine obedience. Humans, not God, chose to sin.",
          check: "Genesis shows God gave a clear warning and humans freely chose to disobey.",
        },
      },
      {
        id: "fall_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Eve was solely responsible for the fall.",
          why_wrong: "The Bible says Adam was with her and also ate (Genesis 3:6). Both were equally responsible. Paul later attributes sin's entry to Adam (Romans 5:12).",
          correct_model: "Both Adam and Eve were responsible. Adam's failure was passive — he was present but didn't resist.",
        },
      },
      {
        id: "fall_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests knowledge of the Genesis 3 narrative, consequences of the fall, and theological implications.",
          trap: "JAMB may ask about Genesis 3:15 as the 'protoevangelium' (first gospel) — the promise of a redeemer. Don't miss this!",
          tip: "Know the sequence: temptation → disobedience → shame → hiding → blame → consequences → promise. This is the narrative arc.",
          related_topics: ["Original sin", "Redemption", "The nature of temptation"],
        },
      },
      {
        id: "fall_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Genesis 3: Serpent tempts, Eve eats, Adam eats, they hide, God curses, but promises redemption (3:15). The Fall explains why the world is broken. Original sin: we all inherit Adam's sinfulness.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "fall_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "What does Genesis 3:15 ('He will crush your head') mean to Christians?",
          expected_understanding: "Christians see this as the first promise of a Savior — Jesus Christ would defeat Satan and redeem humanity. It's called the 'protoevangelium' (first gospel).",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "What was the forbidden tree called?",
        options: [
          { label: "A", text: "Tree of life" },
          { label: "B", text: "Tree of knowledge of good and evil" },
          { label: "C", text: "Tree of wisdom" },
          { label: "D", text: "Tree of righteousness" },
        ],
        answer: "B",
        explanation: "The tree was the 'tree of the knowledge of good and evil' (Genesis 2:17).",
        hints: ["The tree that gave knowledge"],
      },
      {
        difficulty: "medium",
        question: "Who tempted Eve in the garden?",
        options: [
          { label: "A", text: "God" },
          { label: "B", text: "Adam" },
          { label: "C", text: "The serpent" },
          { label: "D", text: "An angel" },
        ],
        answer: "C",
        explanation: "The serpent (identified with Satan in Christian theology) tempted Eve (Genesis 3:1-5).",
        hints: ["The crafty creature in the garden"],
      },
      {
        difficulty: "jamb",
        question: "Genesis 3:15 is significant because it contains:",
        options: [
          { label: "A", text: "The first miracle" },
          { label: "B", text: "The first promise of a Redeemer" },
          { label: "C", text: "The Ten Commandments" },
          { label: "D", text: "The Great Commission" },
        ],
        answer: "B",
        explanation: "Genesis 3:15 is the 'protoevangelium' — the first gospel promise that the offspring of the woman would defeat Satan.",
        hints: ["The first prophecy about a coming Savior"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["fall_hook_01", "fall_intuitive_01", "fall_formal_01", "fall_formula_01", "fall_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 3. THE PATRIARCHS
  {
    subject: "crs",
    topic: "The Patriarchs",
    subtopic: "Abraham, Isaac, Jacob, Joseph",
    title: "The Patriarchs — Faith Through the Generations",
    learning_objectives: [
      "Narrate the call and faith of Abraham",
      "Explain the Abrahamic covenant",
      "Trace the stories of Isaac, Jacob, and Joseph",
      "Identify themes of faith, obedience, and providence",
    ],
    difficulty_level: "medium",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "pat_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "God told Abraham: 'Leave your country and go to a land I will show you.' Abraham obeyed — without knowing where he was going. That's faith. The patriarchs (Abraham, Isaac, Jacob, Joseph) are examples of faith through trials, failures, and God's faithfulness.",
          prediction_prompt: "Would you leave everything familiar if God told you to? What would make you obey or disobey?",
        },
      },
      {
        id: "pat_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "The patriarchs are the founding fathers of Israel. Abraham was called by God to leave Ur and go to Canaan. God promised him descendants as numerous as the stars. Abraham waited decades for this promise. His grandson Jacob had 12 sons — the 12 tribes of Israel. Joseph, Jacob's favourite son, was sold into slavery but rose to power in Egypt, saving his family from famine.",
          analogy: "Think of the patriarchs like a family saga. Each generation faces challenges: Abraham's waiting, Jacob's deception, Joseph's suffering. But through it all, God's plan unfolds. Like a river flowing to the sea, God's purpose cannot be stopped.",
        },
      },
      {
        id: "pat_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Abraham: Called from Ur (Genesis 12). Covenant: descendants, land, blessing (Genesis 12:1-3). Tested: sacrifice of Isaac (Genesis 22). Isaac: Peaceful life, blessed Jacob over Esau. Jacob: Deceived Isaac, wrestled with God, renamed Israel. Had 12 sons. Joseph: Sold into slavery by brothers, interpreted dreams in Egypt, rose to power, saved family from famine, forgave his brothers.",
          key_terms: [
            { term: "Covenant", definition: "A solemn agreement between God and humanity — God's promises are unconditional" },
            { term: "Faith", definition: "Trust and obedience to God even when the outcome is uncertain" },
            { term: "Providence", definition: "God's care and guidance over human events" },
            { term: "Forgiveness", definition: "Joseph's forgiveness of his brothers — a key theme of the Joseph narrative" },
          ],
        },
      },
      {
        id: "pat_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Patriarchal Narrative: Call → Promise → Test → Faith → Fulfilment",
          variables: [
            { name: "Abraham", description: "Called → Promised descendants → Tested (Isaac) → Faith rewarded" },
            { name: "Isaac", description: "Born of promise → Blessed → Chose Jacob over Esau" },
            { name: "Jacob", description: "Deceived → Wrestled with God → Renamed Israel → 12 sons" },
            { name: "Joseph", description: "Sold into slavery → Rose to power → Saved family → Forgave" },
          ],
          when_to_use: "For tracing the narrative arc of the patriarchal stories.",
          common_traps: [
            "Thinking the patriarchs were perfect — they all had flaws (Abraham lied, Jacob deceived)",
            "Missing the covenant promises — they connect all the patriarchal stories",
            "Forgetting Joseph's forgiveness — the emotional climax of the narrative",
          ],
          units_note: "The patriarchal narratives span Genesis 12-50.",
        },
      },
      {
        id: "pat_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "When Joseph's brothers came to Egypt seeking food, Joseph recognized them but they didn't recognize him. Why didn't Joseph immediately reveal himself?",
          given: ["The reunion scene in Genesis 42-45"],
          required: "Explain Joseph's motives and the themes revealed",
          principle: "Joseph was testing his brothers' character — had they changed since selling him into slavery?",
          steps: [
            { explanation: "Joseph's position", calculation: "He was vizier of Egypt — powerful enough to punish his brothers" },
            { explanation: "The test", calculation: "He accused them of being spies, kept Benjamin, demanded they bring Jacob" },
            { explanation: "Purpose of the test", calculation: "He wanted to see if they had repented — would they abandon Benjamin like they abandoned him?" },
            { explanation: "The reveal", calculation: "When Judah offered himself for Benjamin (Genesis 44:33), Joseph knew they had changed" },
          ],
          answer: "Joseph tested his brothers to see if they had changed. When Judah offered himself for Benjamin — showing self-sacrifice — Joseph knew they had repented and revealed himself.",
          check: "Joseph's famous words: 'You intended to harm me, but God intended it for good' (Genesis 50:20).",
        },
      },
      {
        id: "pat_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "The patriarchs were perfect examples of faith.",
          why_wrong: "Abraham lied about Sarah being his sister. Jacob deceived his father. Joseph's brothers were jealous and violent. They were flawed people who God used despite their failures.",
          correct_model: "The patriarchs were ordinary people with extraordinary faith — and serious flaws. God works through imperfect people.",
        },
      },
      {
        id: "pat_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests knowledge of key patriarchal events, covenants, and themes.",
          trap: "JAMB may ask about the Abrahamic covenant's three promises: descendants, land, blessing. These are the backbone of the patriarchal narratives.",
          tip: "For each patriarch, know: the call/challenge, the response, the outcome. This gives you a framework for any question.",
          related_topics: ["The Exodus", "The Twelve Tribes", "Covenant theology"],
        },
      },
      {
        id: "pat_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Abraham: called, covenant, faith. Isaac: peaceful, blessed Jacob. Jacob: deceived, wrestled, 12 sons. Joseph: slavery, power, forgiveness. Key verse: Genesis 50:20 — 'God meant it for good.'",
          hook_type: "mnemonic",
        },
      },
      {
        id: "pat_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "What does Joseph's forgiveness of his brothers teach us about dealing with people who have wronged us?",
          expected_understanding: "Joseph chose forgiveness over revenge. He recognized God's sovereignty in his suffering and chose to bless those who harmed him. This is a model for Christian forgiveness.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Who is considered the father of faith in Christianity?",
        options: [
          { label: "A", text: "Isaac" },
          { label: "B", text: "Jacob" },
          { label: "C", text: "Abraham" },
          { label: "D", text: "Joseph" },
        ],
        answer: "C",
        explanation: "Abraham is called the 'father of faith' because of his extraordinary trust and obedience to God.",
        hints: ["The one who left Ur and was promised descendants"],
      },
      {
        difficulty: "medium",
        question: "Joseph was sold into slavery by his:",
        options: [
          { label: "A", text: "Father" },
          { label: "B", text: "Brothers" },
          { label: "C", text: "Uncles" },
          { label: "D", text: "Friends" },
        ],
        answer: "B",
        explanation: "Joseph's brothers were jealous of him and sold him into slavery (Genesis 37:27-28).",
        hints: ["They were jealous of his special coat and dreams"],
      },
      {
        difficulty: "jamb",
        question: "The Abrahamic covenant includes all these promises EXCEPT:",
        options: [
          { label: "A", text: "Descendants as numerous as the stars" },
          { label: "B", text: "The land of Canaan" },
          { label: "C", text: "That Abraham would never face trials" },
          { label: "D", text: "All nations would be blessed through him" },
        ],
        answer: "C",
        explanation: "God promised descendants, land, and blessing — not a trial-free life. Abraham faced many tests.",
        hints: ["Which promise is NOT in Genesis 12:1-3?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["pat_hook_01", "pat_intuitive_01", "pat_formal_01", "pat_formula_01", "pat_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 4. THE MOSAIC LAW
  {
    subject: "crs",
    topic: "The Mosaic Law",
    subtopic: "Commandments and Civil Laws",
    title: "The Law — God's Rules for Living",
    learning_objectives: [
      "Identify the Ten Commandments and their significance",
      "Explain the ceremonial and civil laws",
      "Understand the purpose of the law in Israel",
      "Relate the law to Christian ethics today",
    ],
    difficulty_level: "medium",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "law_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "After escaping Egypt, the Israelites needed rules for their new nation. God gave Moses the Ten Commandments on Mount Sinai — the foundation of Israel's law and ethics. These commandments cover relationship with God (commandments 1-4) and relationship with people (commandments 5-10).",
          prediction_prompt: "Which of the Ten Commandments do you think is most important? Why?",
        },
      },
      {
        id: "law_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "The Mosaic Law has three parts: The Ten Commandments (moral law), ceremonial laws (worship and sacrifice), and civil laws (daily life in Israel). The moral law reflects God's character and never changes. The ceremonial and civil laws were specific to ancient Israel. Jesus summarized the entire law in two commands: love God and love your neighbour.",
          analogy: "Think of the law like a country's constitution. The constitution establishes core principles (like human rights) that don't change. Specific laws (like traffic regulations) can be updated for new situations. The Ten Commandments are like the constitution; the ceremonial laws are like specific regulations.",
        },
      },
      {
        id: "law_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "The Ten Commandments (Exodus 20): (1) No other gods. (2) No idols. (3) Don't misuse God's name. (4) Remember the Sabbath. (5) Honour parents. (6) Don't murder. (7) Don't commit adultery. (8) Don't steal. (9) Don't lie. (10) Don't covet. The law revealed sin, guided behaviour, and pointed to Christ (Galatians 3:24 — the law as a 'tutor' leading to Christ).",
          key_terms: [
            { term: "Moral Law", definition: "The Ten Commandments — reflecting God's eternal character" },
            { term: "Ceremonial Law", definition: "Laws about worship, sacrifices, and festivals — fulfilled in Christ" },
            { term: "Civil Law", definition: "Laws about daily life in ancient Israel — specific to that context" },
            { term: "Summary of the Law", definition: "Jesus' summary: Love God completely, love your neighbour as yourself (Matthew 22:37-40)" },
          ],
        },
      },
      {
        id: "law_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "The Law: Ten Commandments (moral) + Ceremonial Laws (worship) + Civil Laws (daily life)",
          variables: [
            { name: "Commandments 1-4", description: "Relationship with God (no other gods, no idols, no misuse of name, Sabbath)" },
            { name: "Commandments 5-10", description: "Relationship with people (honour parents, don't murder/adulterate/steal/lie/covet)" },
            { name: "Ceremonial", description: "Sacrifices, festivals, food laws — fulfilled in Christ" },
            { name: "Civil", description: "Property, justice, community life — specific to Israel" },
          ],
          when_to_use: "When asked about the purpose and structure of the Mosaic Law.",
          common_traps: [
            "Confusing the three types of law — moral (eternal), ceremonial (fulfilled), civil (historical)",
            "Thinking Christians must follow all Old Testament laws — ceremonial laws are fulfilled in Christ",
            "Missing Jesus' summary of the law — love God, love neighbour",
          ],
          units_note: "Christians believe the moral law still applies; ceremonial laws are fulfilled; civil laws were specific to Israel.",
        },
      },
      {
        id: "law_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A student says: 'The Old Testament says 'an eye for an eye,' but Jesus says 'turn the other cheek.' Is Jesus contradicting the Old Testament?'",
          given: ["A common confusion about law and grace"],
          required: "Explain the relationship between Old Testament law and Jesus' teaching",
          principle: "The 'eye for an eye' law limited retaliation (don't take more than you lost). Jesus calls for a higher standard — forgiveness.",
          steps: [
            { explanation: "Context of the Old Testament law", calculation: "'Eye for eye' (Exodus 21:24) limited punishment — you couldn't take more than you lost" },
            { explanation: "Jesus' teaching", calculation: "'Turn the other cheek' (Matthew 5:38-39) calls for forgiveness, not retaliation" },
            { explanation: "Relationship", calculation: "Jesus fulfills the law — not by abolishing it, but by elevating it to a higher standard" },
            { explanation: "Principle", calculation: "The law says 'don't take revenge.' Jesus says 'actively forgive.'" },
          ],
          answer: "Jesus is not contradicting the Old Testament but elevating it. The law limited retaliation; Jesus calls for radical forgiveness and love.",
          check: "Matthew 5:17 — 'I have not come to abolish the law but to fulfill it.'",
        },
      },
      {
        id: "law_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Christians must follow all Old Testament laws.",
          why_wrong: "Ceremonial laws (sacrifices, food restrictions, festivals) were fulfilled in Christ and are no longer binding. Moral laws (Ten Commandments) still apply.",
          correct_model: "Ceremonial laws = fulfilled in Christ. Civil laws = specific to ancient Israel. Moral laws = eternal principles that still guide Christian life.",
        },
      },
      {
        id: "law_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests knowledge of the Ten Commandments, the purpose of the law, and its relationship to Christian ethics.",
          trap: "JAMB may ask about the 'greatest commandment' — Matthew 22:37-38: 'Love the Lord your God with all your heart...' This is Jesus' summary of the entire law.",
          tip: "Know the two divisions of the Ten Commandments: duties to God (1-4) and duties to others (5-10).",
          related_topics: ["Sermon on the Mount", "New Testament ethics", "Christian morality"],
        },
      },
      {
        id: "law_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Ten Commandments: 1-4 = love God. 5-10 = love people. Jesus' summary: Love God + Love neighbour. The law = moral (eternal) + ceremonial (fulfilled) + civil (historical).",
          hook_type: "mnemonic",
        },
      },
      {
        id: "law_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why did God give the Israelites so many specific laws about daily life (food, clothing, property)?",
          expected_understanding: "These laws shaped Israel into a distinct holy community. They addressed health (food laws), justice (property laws), and worship (ceremonial laws). The laws created a society that reflected God's character.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "How many commandments are in the Mosaic Law?",
        options: [
          { label: "A", text: "5" },
          { label: "B", text: "10" },
          { label: "C", text: "12" },
          { label: "D", text: "613" },
        ],
        answer: "B",
        explanation: "The Ten Commandments (Exodus 20:1-17) are the foundation of the Mosaic Law.",
        hints: ["Ten Commandments"],
      },
      {
        difficulty: "medium",
        question: "Jesus summarized the entire law as:",
        options: [
          { label: "A", text: "Follow all 613 laws perfectly" },
          { label: "B", text: "Love God and love your neighbour" },
          { label: "C", text: "Obey the Ten Commandments only" },
          { label: "D", text: "Worship God on the Sabbath" },
        ],
        answer: "B",
        explanation: "Jesus said the greatest commandments are to love God completely and love your neighbour as yourself (Matthew 22:37-40).",
        hints: ["What did Jesus say is the greatest commandment?"],
      },
      {
        difficulty: "jamb",
        question: "The ceremonial laws in the Old Testament include laws about:",
        options: [
          { label: "A", text: "Property and inheritance" },
          { label: "B", text: "Sacrifices, festivals, and worship" },
          { label: "C", text: "Criminal punishment" },
          { label: "D", text: "Marriage and divorce" },
        ],
        answer: "B",
        explanation: "Ceremonial laws dealt with worship, sacrifices, food restrictions, and religious festivals — all fulfilled in Christ.",
        hints: ["Which type of law deals with worship?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["law_hook_01", "law_intuitive_01", "law_formal_01", "law_formula_01", "law_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 5. THE LIFE AND TEACHINGS OF JESUS
  {
    subject: "crs",
    topic: "The Life and Teachings of Jesus",
    subtopic: "Parables and Miracles",
    title: "Jesus — His Life, Teachings, and Miracles",
    learning_objectives: [
      "Identify key events in Jesus' ministry",
      "Explain the meaning of major parables",
      "Understand the significance of Jesus' miracles",
      "Apply Jesus' teachings to daily life",
    ],
    difficulty_level: "medium",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "jesus_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Jesus was born in Bethlehem, worked as a carpenter, then began a 3-year ministry that changed the world. He healed the sick, taught thousands through parables, challenged religious leaders, and was eventually crucified. But His story doesn't end there.",
          prediction_prompt: "Why do you think Jesus used parables (stories) to teach instead of just giving rules?",
        },
      },
      {
        id: "jesus_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Jesus taught through parables — simple stories with deep meanings. The Parable of the Sower teaches about how people respond to God's word. The Good Samaritan teaches about loving your neighbour. His miracles (turning water to wine, healing the blind, raising Lazarus) demonstrated His power over nature, sickness, and death — proving He was who He claimed to be.",
          analogy: "Jesus' parables were like seed bombs — simple on the outside but containing powerful truth inside. The listeners had to think deeply to understand. His miracles were like signposts — pointing to His divine identity.",
        },
      },
      {
        id: "jesus_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Key parables: (1) Sower — different responses to God's word. (2) Good Samaritan — love your neighbour regardless of race. (3) Prodigal Son — God's forgiveness for repentant sinners. (4) Talents — faithfulness with what God gives. Key miracles: (1) Water to wine (John 2) — power over nature. (2) Healing blind (John 9) — power over sickness. (3) Raising Lazarus (John 11) — power over death.",
          key_terms: [
            { term: "Parable", definition: "An earthly story with a heavenly meaning — a teaching tool used by Jesus" },
            { term: "Miracle", definition: "A supernatural act demonstrating Jesus' divine power and compassion" },
            { term: "Kingdom of God", definition: "Jesus' central teaching — God's reign in people's hearts and lives" },
            { term: "Discipleship", definition: "Following Jesus and applying His teachings in daily life" },
          ],
        },
      },
      {
        id: "jesus_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Jesus' Ministry: Teaching (parables) + Healing (miracles) + Challenging (religious leaders) → Crucifixion → Resurrection",
          variables: [
            { name: "Teaching", description: "Parables, Sermon on the Mount, discourse on bread of life" },
            { name: "Healing", description: "Blind, lepers, paralytics, raised the dead" },
            { name: "Challenging", description: "Pharisees, Sadducees, money changers in temple" },
            { name: "Crucifixion", description: "The cross — sacrifice for sin" },
            { name: "Resurrection", description: "Victory over death — proof of divine identity" },
          ],
          when_to_use: "For tracing the narrative arc of Jesus' earthly ministry.",
          common_traps: [
            "Focusing only on Jesus' miracles — His teaching was equally important",
            "Missing the purpose of miracles — they demonstrated His identity, not just His power",
            "Forgetting the resurrection — it's the foundation of Christian faith",
          ],
          units_note: "The Gospels (Matthew, Mark, Luke, John) record Jesus' life and teachings.",
        },
      },
      {
        id: "jesus_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Explain the Parable of the Good Samaritan (Luke 10:25-37). What is Jesus teaching?",
          given: ["The parable of a man beaten by robbers, ignored by a priest and Levite, helped by a Samaritan"],
          required: "Explain the meaning and application",
          principle: "Jesus is redefining 'neighbour' — it's anyone in need, regardless of race or religion.",
          steps: [
            { explanation: "Identify the context", calculation: "A lawyer asked: 'Who is my neighbour?' Jesus told this parable" },
            { explanation: "Identify the characters", calculation: "Priest and Levite (religious leaders) ignored the victim. Samaritan (despised outsider) helped." },
            { explanation: "Identify the teaching", calculation: "Your neighbour is anyone in need — even someone you despise" },
            { explanation: "Apply the teaching", calculation: "Love requires action, not just words. Help those in need regardless of who they are." },
          ],
          answer: "The Good Samaritan teaches that 'neighbour' means anyone in need. Love requires action — not just feeling compassion but helping practically, even those we might despise.",
          check: "Jesus' command: 'Go and do likewise' (Luke 10:37) — love in action.",
        },
      },
      {
        id: "jesus_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Jesus only taught about love and forgiveness — He never challenged anyone.",
          why_wrong: "Jesus was confrontational with religious hypocrisy. He called Pharisees 'whitewashed tombs' (Matthew 23:27) and drove money changers from the temple (John 2:15).",
          correct_model: "Jesus was both compassionate and confrontational — loving sinners while challenging hypocrisy and injustice.",
        },
      },
      {
        id: "jesus_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests knowledge of Jesus' parables, miracles, and their meanings.",
          trap: "JAMB may ask about the 'kingdom of God' — Jesus' central teaching. It's not about political power but about God's rule in people's hearts.",
          tip: "For parable questions, always identify: the story, the characters, the meaning, and the application. This structure works for any parable.",
          related_topics: ["Sermon on the Mount", "Passion narrative", "Resurrection"],
        },
      },
      {
        id: "jesus_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Key parables: Sower (response to God's word), Good Samaritan (love your neighbour), Prodigal Son (God's forgiveness), Talents (faithfulness). Miracles: power over nature, sickness, death.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "jesus_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why did Jesus' teaching about loving your enemies shock His audience?",
          expected_understanding: "The Jews expected a political Messiah who would defeat their enemies. Jesus instead taught to love enemies — a radical reversal of expectations. This shows God's kingdom is about hearts, not politics.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "The Parable of the Sower teaches about:",
        options: [
          { label: "A", text: "Farming techniques" },
          { label: "B", text: "How people respond to God's word" },
          { label: "C", text: "The importance of agriculture" },
          { label: "D", text: "Environmental stewardship" },
        ],
        answer: "B",
        explanation: "The seed represents God's word; the different soils represent different human responses to it.",
        hints: ["What does the seed represent?"],
      },
      {
        difficulty: "medium",
        question: "In the Parable of the Good Samaritan, the 'neighbour' is:",
        options: [
          { label: "A", text: "Only people of the same race" },
          { label: "B", text: "Only religious people" },
          { label: "C", text: "Anyone in need" },
          { label: "D", text: "Only family members" },
        ],
        answer: "C",
        explanation: "Jesus taught that a neighbour is anyone in need — regardless of race, religion, or social status.",
        hints: ["Who helped the beaten man?"],
      },
      {
        difficulty: "jamb",
        question: "Jesus' miracles demonstrate:",
        options: [
          { label: "A", text: "That He was a good teacher only" },
          { label: "B", text: "His divine power over nature, sickness, and death" },
          { label: "C", text: "That He could do magic tricks" },
          { label: "D", text: "That miracles are fake" },
        ],
        answer: "B",
        explanation: "Jesus' miracles demonstrated His divine authority and power — confirming His identity as the Son of God.",
        hints: ["What do miracles prove about Jesus?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["jesus_hook_01", "jesus_intuitive_01", "jesus_formal_01", "jesus_formula_01", "jesus_practice_01"],
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
