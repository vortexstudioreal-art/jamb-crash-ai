import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Second Class Citizen by Buchi Emecheta - Full chapter summaries with JAMB-style questions
const CHAPTERS = [
  {
    chapter_number: 1,
    title: "The First Shock",
    content: `Adah is a young Igbo girl growing up in Lagos, Nigeria in the 1950s. From an early age, she shows a strong desire for education, which was unusual for girls at that time. Her parents, especially her mother, believe that investing in a girl's education is a waste since she will eventually marry and leave.

Despite the obstacles, Adah's determination to learn is unwavering. She sneaks to school before her younger brother even begins his education. When her father discovers this, rather than being angry, he is impressed by her initiative and allows her to continue.

Adah's father is a railway worker who values education but faces financial constraints. Her mother, a traditional woman, believes in preparing girls for marriage rather than school. This creates tension in the household regarding Adah's future.

The chapter establishes the gender discrimination prevalent in Nigerian society during this period. Boys were prioritized for education while girls were expected to learn domestic skills. Adah's rebellion against these norms sets the tone for the entire novel.

Key themes introduced include the value of education, gender inequality, determination, and the clash between tradition and modernity. Adah emerges as a fighter who refuses to accept the limitations placed on her because of her gender.`,
    word_count: 1800,
    estimated_reading_time: 8,
    likely_questions: [
      {
        question: "What was Adah's primary motivation as a young girl?",
        options: ["Getting married early", "Learning to cook", "Getting an education", "Helping her mother"],
        correct_answer: 2,
        explanation: "Adah had a strong desire for education from an early age, which was unusual for girls at that time."
      },
      {
        question: "How did Adah's father react when he found out she had sneaked to school?",
        options: ["He beat her severely", "He was impressed and let her continue", "He ignored her", "He sent her to live elsewhere"],
        correct_answer: 1,
        explanation: "Her father was impressed by her initiative and allowed her to continue her education."
      },
      {
        question: "What was the prevailing attitude toward girls' education in the setting of the novel?",
        options: ["It was highly encouraged", "It was considered a waste of resources", "It was mandatory", "It was equal to boys' education"],
        correct_answer: 1,
        explanation: "Girls' education was considered a waste since they would eventually marry and leave their families."
      }
    ]
  },
  {
    chapter_number: 2,
    title: "Childhood Dreams",
    content: `Adah continues to excel in school despite the obstacles she faces at home. Her academic success brings her some respect, but her mother remains skeptical about its usefulness. The tension between traditional expectations and Adah's modern aspirations grows stronger.

Adah develops a dream of going to the United Kingdom, which she sees as a land of opportunity and advancement. This dream becomes her driving force, shaping her decisions and ambitions. The UK represents freedom from the constraints of her Nigerian society.

Her father's death marks a turning point in Adah's life. Without his support, she becomes even more vulnerable to the wishes of her extended family. Nigerian custom dictates that she must now be under the control of her relatives, who have different plans for her future.

The chapter explores the impact of colonialism on Nigerian aspirations. Many young Nigerians saw Britain as a model of civilization and progress. Adah internalizes this view, dreaming of escaping what she perceives as the limitations of her homeland.

Adah's resilience is tested as she must navigate both grief and the expectations placed on her as an orphan. Her determination to continue her education and eventually travel to England becomes her source of strength.`,
    word_count: 1600,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "What major event changes Adah's life circumstances?",
        options: ["Her marriage", "Her father's death", "Moving to a new city", "Finishing school"],
        correct_answer: 1,
        explanation: "Her father's death is a turning point, leaving her vulnerable to her extended family's wishes."
      },
      {
        question: "What does the United Kingdom represent to Adah?",
        options: ["Danger and uncertainty", "Freedom and opportunity", "Traditional values", "Poverty"],
        correct_answer: 1,
        explanation: "The UK represents freedom from the constraints of Nigerian society and a land of opportunity."
      },
      {
        question: "The chapter explores the impact of what on Nigerian aspirations?",
        options: ["Tribalism", "Colonialism", "Religion", "Agriculture"],
        correct_answer: 1,
        explanation: "The chapter explores how colonialism shaped Nigerian aspirations, with Britain seen as a model of progress."
      }
    ]
  },
  {
    chapter_number: 3,
    title: "The Price of Ambition",
    content: `To continue her education, Adah must find a way to support herself. She is eventually married to Francis Obi, a man studying to become an accountant. The marriage is seen as a way to secure her future while also allowing her to pursue her dreams of going to England.

Francis comes from a family with its own expectations. His family sees Adah primarily as a source of income and a producer of children. The marriage quickly becomes a struggle for Adah's identity and independence.

Despite being married, Adah continues to work and contribute financially to the household. Her earnings are often taken by Francis's family, and she finds herself working harder with little reward. The exploitation she experiences as a wife mirrors the exploitation she faced as a child.

Adah gives birth to her first children, adding to her responsibilities. Motherhood becomes another challenge to balance with her work and her dreams of going to England. Yet she refuses to give up on her aspirations.

The chapter reveals the complex dynamics of marriage in Nigerian society. Women were expected to submit to their husbands and in-laws while providing financial support. Adah's resistance to complete submission creates ongoing conflict.`,
    word_count: 1700,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "Why does Adah marry Francis Obi?",
        options: ["Out of love only", "To continue her education and go to England", "Because her mother forced her", "To escape poverty"],
        correct_answer: 1,
        explanation: "Marriage to Francis was seen as a way to secure her future while pursuing her dreams of going to England."
      },
      {
        question: "How does Francis's family view Adah?",
        options: ["As a respected family member", "As a source of income and children", "As an intellectual equal", "With complete indifference"],
        correct_answer: 1,
        explanation: "Francis's family sees Adah primarily as a source of income and a producer of children."
      },
      {
        question: "What additional responsibility does Adah take on in this chapter?",
        options: ["Political activism", "Motherhood", "Religious leadership", "Business ownership"],
        correct_answer: 1,
        explanation: "Adah gives birth to her first children, adding motherhood to her many responsibilities."
      }
    ]
  },
  {
    chapter_number: 4,
    title: "Journey to England",
    content: `Adah's dream finally becomes reality when she manages to travel to England with her children. Francis goes ahead first, and Adah works tirelessly to save money to join him. The journey represents both hope and uncertainty for the family.

Upon arrival in England, Adah is shocked by the reality that differs greatly from her dreams. The cold weather, the unfriendly reception from some English people, and the challenging living conditions are far from what she imagined. The England of her dreams was a paradise; the real England is harsh and unwelcoming.

The family settles in London, where they face the challenge of finding accommodation. Many landlords refuse to rent to Black families, displaying signs that say "No Coloureds." This is Adah's first direct encounter with racism, and it deeply affects her understanding of her place in English society.

Francis proves to be an unreliable partner, spending money irresponsibly and failing his exams repeatedly. Adah must continue to be the main breadwinner while also caring for her growing family. Her dreams of a better life seem increasingly distant.

The chapter explores the immigrant experience in 1960s Britain. The racial discrimination, cultural isolation, and economic struggles faced by African immigrants are depicted through Adah's experiences. The title "Second Class Citizen" becomes painfully relevant.`,
    word_count: 1900,
    estimated_reading_time: 8,
    likely_questions: [
      {
        question: "What phrase did landlords use to discriminate against Black families?",
        options: ["Welcome All", "No Coloureds", "Rooms Available", "English Only"],
        correct_answer: 1,
        explanation: "Landlords displayed signs saying 'No Coloureds,' refusing to rent to Black families."
      },
      {
        question: "How does Adah feel about England upon arrival?",
        options: ["Exactly as she imagined", "Shocked by the harsh reality", "Immediately at home", "Indifferent"],
        correct_answer: 1,
        explanation: "Adah is shocked by the reality that differs greatly from her dreams - the cold, unfriendly reception, and challenging conditions."
      },
      {
        question: "What becomes clear about Francis's character in England?",
        options: ["He is hardworking and reliable", "He is unreliable and irresponsible", "He is a successful accountant", "He is supportive of Adah"],
        correct_answer: 1,
        explanation: "Francis proves unreliable, spending money irresponsibly and failing his exams repeatedly."
      }
    ]
  },
  {
    chapter_number: 5,
    title: "The Burden of Motherhood",
    content: `Adah continues to have children, eventually giving birth to five. Each child adds to her burden as she struggles to balance work, childcare, and her deteriorating marriage. Finding childcare is particularly challenging due to discrimination and financial constraints.

The family's living conditions are deplorable. They live in cramped, shared accommodation with inadequate facilities. The children suffer from the poor conditions, and Adah worries constantly about their health and wellbeing.

One particularly traumatic event occurs when Adah must leave her children with a neglectful babysitter. The experience highlights the impossible choices immigrant mothers face when trying to provide for their families. Adah's guilt and anger at the situation fuel her determination to improve their circumstances.

Francis shows little interest in helping with the children or improving their situation. He sees childcare as exclusively Adah's responsibility and continues to pursue his failing studies while Adah works to support the family.

The chapter examines the triple burden of being black, female, and an immigrant in 1960s Britain. Adah faces discrimination on multiple fronts while carrying the primary responsibility for her family's survival.`,
    word_count: 1650,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "How many children does Adah eventually have?",
        options: ["Two", "Three", "Four", "Five"],
        correct_answer: 3,
        explanation: "Adah eventually gives birth to five children."
      },
      {
        question: "What is the triple burden Adah faces in Britain?",
        options: ["Work, school, and family", "Being black, female, and an immigrant", "Poverty, illness, and isolation", "Marriage, religion, and culture"],
        correct_answer: 1,
        explanation: "Adah faces discrimination as a Black person, as a woman, and as an immigrant."
      },
      {
        question: "What is Francis's attitude toward childcare?",
        options: ["He shares responsibilities equally", "He sees it as exclusively Adah's job", "He is the primary caregiver", "He hires professional help"],
        correct_answer: 1,
        explanation: "Francis sees childcare as exclusively Adah's responsibility and shows little interest in helping."
      }
    ]
  },
  {
    chapter_number: 6,
    title: "Discovering Her Voice",
    content: `Despite all her struggles, Adah begins to write. Writing becomes an outlet for her frustrations and a way to process her experiences. She starts working on a novel that draws from her life experiences.

Her writing is initially dismissed by Francis, who sees no value in her creative pursuits. When Adah completes her first manuscript, Francis burns it in an act of cruelty and control. This destruction of her work represents his attempt to destroy her identity and aspirations.

The burning of the manuscript is a pivotal moment in the novel. Rather than breaking Adah's spirit, it strengthens her resolve. She realizes that she must not allow Francis to control her completely and that her writing is a form of resistance.

Adah's writing represents her claim to a voice and identity beyond her roles as wife and mother. Through her stories, she can articulate the injustices she faces and imagine alternatives to her current situation.

The chapter explores the power of creative expression as a tool for survival and resistance. For marginalized individuals, writing can be a way to reclaim agency and tell one's own story.`,
    word_count: 1550,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "What does Francis do to Adah's first manuscript?",
        options: ["Publishes it", "Burns it", "Praises it", "Shares it with friends"],
        correct_answer: 1,
        explanation: "Francis burns Adah's manuscript in an act of cruelty and control."
      },
      {
        question: "What does writing represent for Adah?",
        options: ["A waste of time", "A way to earn money quickly", "Resistance and reclaiming her voice", "A hobby with no meaning"],
        correct_answer: 2,
        explanation: "Writing represents Adah's claim to a voice and identity beyond her roles as wife and mother."
      },
      {
        question: "How does Adah respond to the destruction of her manuscript?",
        options: ["She gives up writing forever", "She becomes strengthened in her resolve", "She forgives Francis immediately", "She returns to Nigeria"],
        correct_answer: 1,
        explanation: "Rather than breaking her spirit, the act strengthens her resolve to continue writing."
      }
    ]
  },
  {
    chapter_number: 7,
    title: "The Breaking Point",
    content: `The abuse in Adah's marriage escalates. Francis becomes physically violent, and Adah realizes that she must make a choice between staying in a dangerous situation or taking a risk for herself and her children.

Adah seeks help from various social services, but finds that the system is not designed to support women in her situation. She faces skepticism and bureaucratic obstacles as she tries to find a way out of her marriage.

The chapter depicts the isolation that abuse victims often experience. Adah has few people she can turn to, and the stigma of divorce in both Nigerian and British society makes her hesitate. However, her children's safety becomes her primary concern.

A particularly violent incident forces Adah to take action. She decides to leave Francis, knowing that life as a single mother will be extremely difficult but believing it is better than the alternative.

The chapter examines domestic violence within the context of immigrant communities and the additional barriers women face when trying to escape abusive relationships. Cultural expectations, financial dependence, and lack of social support all complicate Adah's situation.`,
    word_count: 1600,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "What escalates in Adah's marriage in this chapter?",
        options: ["Love and affection", "Physical violence and abuse", "Financial success", "Communication"],
        correct_answer: 1,
        explanation: "The abuse escalates with Francis becoming physically violent."
      },
      {
        question: "What becomes Adah's primary concern when deciding to leave?",
        options: ["Her career", "Her children's safety", "Her social status", "Her relationship with Francis's family"],
        correct_answer: 1,
        explanation: "Her children's safety becomes her primary concern in deciding to leave the marriage."
      },
      {
        question: "What additional barriers do immigrant women face when escaping abuse?",
        options: ["Cultural expectations and lack of social support", "Too much money", "Excessive help from authorities", "Easy divorce procedures"],
        correct_answer: 0,
        explanation: "Immigrant women face cultural expectations, financial dependence, and lack of social support."
      }
    ]
  },
  {
    chapter_number: 8,
    title: "A New Beginning",
    content: `Adah leaves Francis and begins her life as a single mother. The challenges are immense, but she faces them with the same determination that has carried her through her entire life. She finds work, secures accommodation, and begins rebuilding her life.

Her writing career begins to take shape. Adah writes during any spare moment she can find, often late at night after her children are asleep. Her persistence pays off when her work begins to attract attention from publishers.

The children adapt to their new circumstances, and Adah works hard to provide them with the stability and opportunities she never had. Education remains central to her values, and she ensures her children understand its importance.

Adah reflects on her journey from Lagos to London, from a girl denied education to a writer finding her voice. She recognizes that while she may be treated as a second-class citizen by society, she refuses to accept that definition of herself.

The novel ends on a note of qualified hope. Adah's future remains uncertain, but she has proven her resilience and her ability to survive. Her story becomes a testament to the strength of women who refuse to be defined by their circumstances.`,
    word_count: 1700,
    estimated_reading_time: 7,
    likely_questions: [
      {
        question: "What does Adah do after leaving Francis?",
        options: ["Returns to Nigeria", "Gives up on her dreams", "Rebuilds her life as a single mother", "Marries another man immediately"],
        correct_answer: 2,
        explanation: "Adah begins rebuilding her life as a single mother while pursuing her writing career."
      },
      {
        question: "What value does Adah ensure her children understand?",
        options: ["Wealth accumulation", "The importance of education", "Religious devotion", "Traditional marriage"],
        correct_answer: 1,
        explanation: "Education remains central to her values, and she ensures her children understand its importance."
      },
      {
        question: "How does the novel end?",
        options: ["In complete despair", "With qualified hope", "With Adah's death", "With a return to Nigeria"],
        correct_answer: 1,
        explanation: "The novel ends on a note of qualified hope as Adah has proven her resilience and ability to survive."
      }
    ]
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Second Class Citizen seeding...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the novel
    const { data: novel, error: novelError } = await supabase
      .from('novels')
      .select('id, total_chapters')
      .eq('title', 'Second Class Citizen')
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
      message: `Seeded ${insertedCount} chapters for Second Class Citizen`,
      total_chapters: CHAPTERS.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in seed-second-class-citizen:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
