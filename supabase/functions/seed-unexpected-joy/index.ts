import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Unexpected Joy at Dawn by Alex Agyei-Agyiri - Full chapter summaries with JAMB-style questions
const CHAPTERS = [
  {
    chapter_number: 1,
    title: "The Expulsion Order",
    content: `The novel opens in 1983 Ghana during the infamous "Ghana Must Go" period. The government of Ghana, under economic pressure and nationalist sentiment, issues the Aliens Compliance Order. This decree requires all undocumented foreigners to leave the country within two weeks.

Nii Tackie, a Nigerian living in Ghana, finds himself caught in this upheaval. Despite having lived and worked in Ghana for years, contributing to the economy and building relationships, he is suddenly classified as an unwanted alien. The speed and brutality of the expulsion catch many immigrants off guard.

The chapter introduces the chaotic scenes at the border. Thousands of Nigerians and other West Africans stream toward the borders, carrying whatever possessions they can. Families are separated, businesses abandoned, and years of hard work are lost overnight.

Mama Orojo, a Nigerian market woman, represents the older generation of immigrants who have deep ties to Ghana. She has lived there for decades, raised children who consider Ghana their home, and built a successful trading business. The expulsion order throws her life into disarray.

The chapter explores themes of xenophobia, nationalism, and the fragility of immigrant life. It questions what it means to belong to a place and how quickly that belonging can be revoked by political decisions.`,
    word_count: 1800,
    estimated_reading_time: 8,
    likely_questions: [
      {
        question: "What historical event provides the backdrop for the novel?",
        options: ["Nigerian Civil War", "Ghana Must Go expulsion of 1983", "Ghana independence", "World War II"],
        correct_answer: 1,
        explanation: "The novel is set during the 1983 'Ghana Must Go' period when undocumented foreigners were expelled."
      },
      {
        question: "What did the Aliens Compliance Order require?",
        options: ["Immigrants to register with police", "All undocumented foreigners to leave within two weeks", "Ghanaians to return home", "Businesses to close"],
        correct_answer: 1,
        explanation: "The order required all undocumented foreigners to leave Ghana within two weeks."
      },
      {
        question: "Who represents the older generation of immigrants in the chapter?",
        options: ["Nii Tackie", "Mama Orojo", "The government official", "A border guard"],
        correct_answer: 1,
        explanation: "Mama Orojo, a Nigerian market woman who has lived in Ghana for decades, represents the older generation."
      }
    ]
  },
  {
    chapter_number: 2,
    title: "Nii Tackie's Dilemma",
    content: `Nii Tackie faces a complex situation. Although he is ethnically Ghanaian with the name to prove it, his parents migrated to Nigeria before his birth. He was raised in Nigeria and considers himself Nigerian. Now, neither country fully accepts him.

His Ghanaian heritage should exempt him from the expulsion, but he lacks the documents to prove his citizenship. His Nigerian upbringing makes him feel like a stranger in the land of his ancestors. He is caught between two identities, belonging fully to neither.

The chapter explores the absurdity of borders and nationality. Nii Tackie speaks the local language, understands Ghanaian culture through his parents' teachings, yet bureaucracy defines him as an alien. The paperwork becomes more important than the person.

Nii Tackie meets Massa, a Ghanaian woman who shows him kindness amid the chaos. Their relationship develops as she helps him navigate the hostile environment. Massa represents the Ghanaians who disagreed with the harsh treatment of immigrants.

The chapter raises questions about identity and belonging. What makes someone belong to a nation? Is it birth, residence, culture, or paperwork? Nii Tackie's situation illustrates how arbitrary these definitions can be.`,
    word_count: 1600,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "What is unique about Nii Tackie's situation?",
        options: ["He is wealthy", "He is ethnically Ghanaian but raised in Nigeria", "He is a government official", "He is British"],
        correct_answer: 1,
        explanation: "Nii Tackie is ethnically Ghanaian but was born and raised in Nigeria, leaving him caught between two identities."
      },
      {
        question: "Who helps Nii Tackie navigate the hostile environment?",
        options: ["A government official", "A Nigerian friend", "Massa, a Ghanaian woman", "His parents"],
        correct_answer: 2,
        explanation: "Massa, a Ghanaian woman, shows him kindness and helps him amid the chaos."
      },
      {
        question: "What question does Nii Tackie's situation raise?",
        options: ["How to make money quickly", "What makes someone belong to a nation", "How to avoid taxes", "Which country is better"],
        correct_answer: 1,
        explanation: "His situation raises questions about identity and what truly makes someone belong to a nation."
      }
    ]
  },
  {
    chapter_number: 3,
    title: "The Border Crossing",
    content: `The journey to the border is harrowing. Thousands of displaced people crowd the roads, creating a human tide of misery and desperation. Some travel by vehicle, others on foot, all carrying the remnants of their lives in bags and bundles.

At the border, the situation is chaotic. Ghanaian officials process the departures with varying degrees of hostility and efficiency. Some immigrants face harassment, theft, and violence. The border becomes a scene of human suffering and indignity.

Nii Tackie observes the breakdown of social order. People who were neighbors and colleagues turn against each other. The thin veneer of civilization cracks under the pressure of nationalist fervor. He sees acts of cruelty but also unexpected kindness.

A young family with small children struggles at the checkpoint. The father is separated from his wife and children in the chaos. Nii Tackie helps reunite them, showing that humanity can persist even in the darkest moments.

The chapter depicts the human cost of political decisions. The abstract policy of expulsion translates into real suffering for real people. Children cry, elderly people collapse, and families are torn apart in the name of national interests.`,
    word_count: 1700,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "How is the situation at the border described?",
        options: ["Orderly and calm", "Chaotic with harassment and violence", "Quick and efficient", "Empty and quiet"],
        correct_answer: 1,
        explanation: "The border is described as chaotic with immigrants facing harassment, theft, and violence."
      },
      {
        question: "What does Nii Tackie do at the checkpoint?",
        options: ["Starts a fight", "Helps reunite a separated family", "Tries to bribe officials", "Returns to Ghana"],
        correct_answer: 1,
        explanation: "Nii Tackie helps reunite a young family that was separated in the chaos."
      },
      {
        question: "What does the chapter illustrate about political decisions?",
        options: ["They are always beneficial", "They have human costs in real suffering", "They are easy to implement", "They affect only politicians"],
        correct_answer: 1,
        explanation: "The chapter shows how the abstract policy of expulsion translates into real suffering for real people."
      }
    ]
  },
  {
    chapter_number: 4,
    title: "Strangers in Their Own Land",
    content: `Upon arriving in Nigeria, the returnees face another set of challenges. Many of them left Nigeria decades ago and have no connections or support systems in place. They are strangers in what is supposedly their own country.

The Nigerian government, unprepared for the massive influx of returnees, struggles to provide assistance. Refugee camps are hastily set up, but resources are inadequate. Many returnees face hunger, illness, and exposure to the elements.

Nii Tackie's identity crisis deepens. In Ghana, he was called a Nigerian. In Nigeria, he is seen as a foreigner because of his accent and mannerisms. The concept of home becomes increasingly elusive for him.

Mama Orojo, having lost everything she built in Ghana, must start over from nothing. Her children, who only know Ghana as home, are bewildered by the Nigerian environment. The generation gap in the immigrant experience becomes apparent.

The chapter examines the concept of home and belonging. It challenges the assumption that nationality automatically confers belonging. The returnees discover that their Nigerian citizenship means little when they have no roots, no networks, and no familiarity with the country.`,
    word_count: 1650,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "How is Nii Tackie perceived upon arriving in Nigeria?",
        options: ["As a hero", "As a foreigner due to his accent", "As a government official", "As a wealthy businessman"],
        correct_answer: 1,
        explanation: "In Nigeria, Nii Tackie is seen as a foreigner because of his Ghanaian accent and mannerisms."
      },
      {
        question: "What challenge does the Nigerian government face?",
        options: ["Too much money", "Dealing with the massive influx of returnees", "Closing borders", "Building new cities"],
        correct_answer: 1,
        explanation: "The government, unprepared for the massive influx, struggles to provide adequate assistance."
      },
      {
        question: "What does the chapter challenge about nationality?",
        options: ["That it determines wealth", "That it automatically confers belonging", "That it is unimportant", "That it should be abandoned"],
        correct_answer: 1,
        explanation: "The chapter challenges the assumption that nationality automatically means belonging to a place."
      }
    ]
  },
  {
    chapter_number: 5,
    title: "Memories of Ghana",
    content: `As the characters struggle with their new reality, they reflect on their lives in Ghana. Flashbacks reveal the communities they built, the relationships they formed, and the lives they led before the expulsion.

Nii Tackie remembers his work as a trader in Accra's markets. He had friends, both Ghanaian and Nigerian, and a life that felt stable and purposeful. The sudden loss of that life leaves him feeling unmoored.

Mama Orojo's memories are particularly poignant. She recalls arriving in Ghana as a young bride, building her business from nothing, and watching her children grow up speaking Twi as their first language. Ghana was more than a residence; it was her life's work.

The chapter uses these memories to humanize the statistics of mass displacement. Each of the thousands expelled had stories, dreams, and connections. The political decision that uprooted them destroyed not just economic ties but emotional and cultural ones as well.

The contrast between past happiness and present misery intensifies the tragedy. The characters mourn not just their material losses but the intangible things: friendships, routines, the sense of being at home somewhere.`,
    word_count: 1600,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "What narrative technique does the chapter use?",
        options: ["Only present action", "Flashbacks to life in Ghana", "Letters and documents", "News reports"],
        correct_answer: 1,
        explanation: "The chapter uses flashbacks to reveal the lives the characters led before the expulsion."
      },
      {
        question: "What language did Mama Orojo's children speak as their first language?",
        options: ["English", "Yoruba", "Twi", "Hausa"],
        correct_answer: 2,
        explanation: "Her children grew up speaking Twi (a Ghanaian language) as their first language."
      },
      {
        question: "What purpose do the memories serve in the narrative?",
        options: ["To show off wealth", "To humanize the statistics of displacement", "To criticize Ghana", "To plan revenge"],
        correct_answer: 1,
        explanation: "The memories humanize the statistics by showing that each displaced person had stories and connections."
      }
    ]
  },
  {
    chapter_number: 6,
    title: "The Struggle for Survival",
    content: `The daily struggle for survival dominates the lives of the returnees. Finding food, shelter, and work becomes the primary concern. The dreams and ambitions they once had are put aside as basic needs take precedence.

Nii Tackie finds work as a laborer, a significant comedown from his trading business in Ghana. The physical toll and low pay are demoralizing, but he has no choice. Pride becomes a luxury that displaced people cannot afford.

Some returnees fall into despair. Without hope for the future, they struggle to find reasons to continue. The psychological toll of displacement, often overlooked, proves as devastating as the material losses.

Others, however, show remarkable resilience. Community networks form among the displaced, with people helping each other navigate their new circumstances. Shared suffering creates bonds between strangers.

The chapter explores themes of survival, resilience, and community. It shows how crisis can bring out both the worst and best in people. For every story of despair, there is one of determination and mutual support.`,
    word_count: 1550,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "What kind of work does Nii Tackie find in Nigeria?",
        options: ["Banking", "Labor work", "Teaching", "Government service"],
        correct_answer: 1,
        explanation: "Nii Tackie finds work as a laborer, a significant comedown from his trading business."
      },
      {
        question: "What is often overlooked in displacement situations according to the chapter?",
        options: ["Material losses", "The psychological toll", "Physical injuries", "Political implications"],
        correct_answer: 1,
        explanation: "The psychological toll of displacement, often overlooked, proves as devastating as material losses."
      },
      {
        question: "What forms among the displaced returnees?",
        options: ["Government organizations", "Community support networks", "Political parties", "Business corporations"],
        correct_answer: 1,
        explanation: "Community networks form among the displaced, with people helping each other navigate their circumstances."
      }
    ]
  },
  {
    chapter_number: 7,
    title: "Love Amid Chaos",
    content: `The relationship between Nii Tackie and Massa develops against the backdrop of displacement. Having helped him during the expulsion, Massa finds herself unable to forget the Nigerian with the Ghanaian name. She makes the unexpected decision to follow him to Nigeria.

Their love story represents hope amid despair. In a narrative filled with loss and suffering, their connection offers a counterpoint. Love, the chapter suggests, can flourish even in the most difficult circumstances.

The relationship is not without complications. Massa faces hostility from Nigerians who see her as the enemy. The same nationalism that expelled Nigerians from Ghana makes some suspicious of Ghanaians in Nigeria. The lovers navigate these tensions together.

Nii Tackie's feelings are complicated by his identity confusion. Massa represents Ghana, the country that rejected him. Yet she also represents the kindness and love that transcended national boundaries. Through her, he begins to reconcile his divided identity.

The chapter explores how love can bridge divides. In a story about borders and nationalism, Massa and Nii Tackie's relationship suggests that human connections can transcend political boundaries.`,
    word_count: 1650,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "What unexpected decision does Massa make?",
        options: ["Returns to her village", "Follows Nii Tackie to Nigeria", "Joins the government", "Leaves Africa"],
        correct_answer: 1,
        explanation: "Massa makes the unexpected decision to follow Nii Tackie to Nigeria."
      },
      {
        question: "What does their love story represent in the narrative?",
        options: ["Political alliance", "Hope amid despair", "Business partnership", "Family obligation"],
        correct_answer: 1,
        explanation: "Their love story represents hope amid despair in a narrative filled with loss and suffering."
      },
      {
        question: "What does the relationship suggest about human connections?",
        options: ["They are unimportant", "They can transcend political boundaries", "They cause problems", "They are purely economic"],
        correct_answer: 1,
        explanation: "The relationship suggests that human connections can transcend political and national boundaries."
      }
    ]
  },
  {
    chapter_number: 8,
    title: "Building Anew",
    content: `Time passes, and the characters begin to rebuild their lives. The initial shock of displacement fades, replaced by the slow, difficult work of establishing new routines and connections.

Nii Tackie, with Massa's support, starts a small business. Drawing on his experience as a trader, he gradually builds a modest enterprise. Success is neither quick nor guaranteed, but he persists.

Mama Orojo, despite her age, refuses to give up. She reconnects with distant relatives who help her establish herself. Her resilience becomes an inspiration to others who are tempted to surrender to despair.

The younger generation faces its own challenges. Those who were children during the expulsion must forge identities in a country they barely know. Some adapt quickly; others struggle with a sense of displacement that may never fully resolve.

The chapter depicts the slow process of healing and adaptation. It does not minimize the ongoing challenges or pretend that all wounds are healed. Rather, it shows how life continues despite trauma, neither erasing the past nor being fully defined by it.`,
    word_count: 1600,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "What does Nii Tackie start with Massa's support?",
        options: ["A political party", "A small business", "A school", "A hospital"],
        correct_answer: 1,
        explanation: "Nii Tackie starts a small business, drawing on his trading experience."
      },
      {
        question: "How does Mama Orojo cope with her situation?",
        options: ["She gives up hope", "She reconnects with relatives and shows resilience", "She returns to Ghana illegally", "She blames others"],
        correct_answer: 1,
        explanation: "Despite her age, Mama Orojo reconnects with relatives and shows inspiring resilience."
      },
      {
        question: "What challenge do the younger generation face?",
        options: ["Being too wealthy", "Forging identities in a country they barely know", "Having too many opportunities", "Speaking too many languages"],
        correct_answer: 1,
        explanation: "The young people must forge identities in a country they barely know."
      }
    ]
  },
  {
    chapter_number: 9,
    title: "Reflections on Belonging",
    content: `The characters reflect on their experiences and what they have learned about belonging, identity, and home. Nii Tackie, having lived as an outsider in both Ghana and Nigeria, develops a more nuanced understanding of these concepts.

He realizes that home is not simply a matter of nationality or geography. It is built through relationships, work, and daily life. The borders that divided him from "home" were artificial constructs that could not capture the complexity of human experience.

Mama Orojo comes to terms with her losses while appreciating what she has gained. Her family has survived, her spirit is unbroken, and she has found community among fellow returnees. Loss and resilience coexist in her story.

The chapter raises philosophical questions about nationalism and belonging. It suggests that the rigid categories of "citizen" and "foreigner" fail to capture the reality of human migration and connection. People move, mix, and create new communities that transcend boundaries.

These reflections do not resolve all the pain and injustice depicted in the novel. They offer, instead, a way of understanding and living with these experiences. Wisdom, the chapter suggests, can come from suffering.`,
    word_count: 1700,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "What does Nii Tackie realize about home?",
        options: ["It is only about nationality", "It is built through relationships and daily life", "It is unimportant", "It is determined by government"],
        correct_answer: 1,
        explanation: "Nii Tackie realizes that home is built through relationships, work, and daily life, not just nationality."
      },
      {
        question: "What philosophical question does the chapter raise?",
        options: ["How to make money", "The validity of nationalism and rigid categories of belonging", "How to win elections", "The best type of government"],
        correct_answer: 1,
        explanation: "The chapter questions nationalism and suggests that citizen/foreigner categories fail to capture human reality."
      },
      {
        question: "What can come from suffering according to the chapter?",
        options: ["Revenge", "Wealth", "Wisdom", "Nothing"],
        correct_answer: 2,
        explanation: "The chapter suggests that wisdom can come from suffering and difficult experiences."
      }
    ]
  },
  {
    chapter_number: 10,
    title: "Unexpected Joy at Dawn",
    content: `The novel concludes with a moment of unexpected joy. Despite all the suffering, loss, and struggle, the characters find reasons to hope. The title's promise is fulfilled not in the erasure of pain but in the discovery of joy alongside it.

Nii Tackie and Massa expect a child, symbolizing new life and the future. Their child will be born in Nigeria with Ghanaian heritage, embodying the cross-border identity that Nii Tackie has struggled to understand.

Mama Orojo witnesses a new generation taking root. Her grandchildren, though displaced, are flourishing. The resilience she modeled has been inherited, and the family will continue despite everything they have endured.

The dawn in the title is both literal and metaphorical. After the long night of expulsion and displacement, a new day begins. It does not erase the past, but it offers the possibility of a different future.

The novel ends with a sense of measured hope. The joy is "unexpected" because it comes after so much sorrow. Yet its arrival suggests that hope, like dawn, is inevitable—even if we cannot see it during the darkest hours of the night.`,
    word_count: 1650,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "What symbolizes new life and the future in the final chapter?",
        options: ["A new house", "Nii Tackie and Massa's expected child", "A political victory", "Return to Ghana"],
        correct_answer: 1,
        explanation: "Nii Tackie and Massa expect a child, symbolizing new life and the future."
      },
      {
        question: "What does the 'dawn' in the title represent?",
        options: ["A specific time of day only", "Both literal dawn and metaphorical new beginnings", "The end of the world", "A person's name"],
        correct_answer: 1,
        explanation: "The dawn is both literal and metaphorical, representing new beginnings after the night of displacement."
      },
      {
        question: "Why is the joy described as 'unexpected'?",
        options: ["It was planned", "It comes after so much sorrow", "It is unwanted", "It is imaginary"],
        correct_answer: 1,
        explanation: "The joy is unexpected because it comes after so much sorrow and suffering."
      }
    ]
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Unexpected Joy at Dawn seeding...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the novel
    const { data: novel, error: novelError } = await supabase
      .from('novels')
      .select('id, total_chapters')
      .eq('title', 'Unexpected Joy at Dawn')
      .single();

    if (novelError || !novel) {
      console.error('Novel not found:', novelError);
      return new Response(JSON.stringify({ error: 'Novel not found', details: novelError }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Found novel:', novel.id);

    // Check existing chapters
    const { data: existingChapters } = await supabase
      .from('novel_chapters')
      .select('chapter_number')
      .eq('novel_id', novel.id);

    const existingNumbers = new Set((existingChapters || []).map(c => c.chapter_number));
    console.log('Existing chapters:', existingNumbers);

    let insertedCount = 0;

    for (const chapter of CHAPTERS) {
      if (!existingNumbers.has(chapter.chapter_number)) {
        const { error: insertError } = await supabase
          .from('novel_chapters')
          .insert({
            novel_id: novel.id,
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            word_count: chapter.word_count,
            estimated_reading_time: chapter.estimated_reading_time,
            likely_questions: chapter.likely_questions
          });

        if (insertError) {
          console.error(`Error inserting chapter ${chapter.chapter_number}:`, insertError);
        } else {
          insertedCount++;
          console.log(`Inserted chapter ${chapter.chapter_number}: ${chapter.title}`);
        }
      }
    }

    // Update total chapters
    await supabase
      .from('novels')
      .update({ total_chapters: CHAPTERS.length })
      .eq('id', novel.id);

    return new Response(JSON.stringify({
      success: true,
      message: `Seeded ${insertedCount} chapters for Unexpected Joy at Dawn`,
      total_chapters: CHAPTERS.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in seed-unexpected-joy:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
