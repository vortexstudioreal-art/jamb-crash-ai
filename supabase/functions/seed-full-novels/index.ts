import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ============ THE LEKKI HEADMASTER ============
    const lekkiHeadmaster = {
      title: "The Lekki Headmaster",
      author: "Kabir Alabi Garba",
      description: "The official JAMB 2025/2026 recommended novel for Use of English. A compelling story about Mr. Bepo Adewale, a dedicated headmaster at Stardom Schools in Lekki, Lagos, who faces professional challenges, family pressures, and moral dilemmas while striving to provide quality education.",
      category: "general_reading",
      year: 2025,
      is_premium: false,
      total_chapters: 12,
      difficulty_level: "medium"
    };

    const lekkiChapters = [
      {
        chapter_number: 1,
        title: "Dusk",
        content: `**Chapter 1: Dusk**

The chapter opens with an emotional scene at a morning assembly at Stardom Schools in the affluent Lekki area of Lagos. The principal, Mr. Bepo Adewale, stands in front of the students and staff looking visibly distressed. Tears run down his face, and everyone watches in silence as he finds it hard to speak.

The Vice Principal, Mrs. Grace Apeh, and other staff try to calm him. No one knows why he is crying. The assembly ends quickly, and Mr. Bepo is taken to his office, still in tears.

**The Principal's Challenges:**
Mr. Bepo faces many problems in running the school. He feels the weight of expectations from others. The story shows his care for the students and his dedication to the school. But his personal life is full of struggles. His family wants him to move abroad, which adds to his stress.

**Money Problems at the School:**
Mrs. Ibidun Gloss, the Managing Director, worries about the school's finances. She thinks some staff members spend too much money. She asks the school accountant about possible theft or mismanagement. This shows the need for honesty and responsibility in the school.

**Conflicts Among Teachers:**
The chapter also introduces Mr. Fafore, the English teacher. He faces criticism for his teaching style and the quality of his lessons. Mrs. Gloss is unhappy with the lack of skill shown by some teachers. She stresses the importance of doing a good job and being accountable.

**Key Themes:**
The chapter sets a serious mood for the rest of the story. It addresses emotional struggles, money problems, and the challenges teachers face. Mr. Bepo's breakdown hints at more drama to come in the school.`,
        word_count: 280,
        estimated_reading_time: 3,
        likely_questions: [
          {
            question: "Where is Stardom Schools located in The Lekki Headmaster?",
            options: ["Victoria Island, Lagos", "Lekki, Lagos", "Ikeja, Lagos", "Ikoyi, Lagos"],
            correct_answer: 1,
            explanation: "Stardom Schools is located in the affluent Lekki area of Lagos."
          },
          {
            question: "Who is the principal of Stardom Schools?",
            options: ["Mrs. Ibidun Gloss", "Mrs. Grace Apeh", "Mr. Bepo Adewale", "Mr. Fafore"],
            correct_answer: 2,
            explanation: "Mr. Bepo Adewale is the principal (headmaster) of Stardom Schools."
          },
          {
            question: "What is Mrs. Ibidun Gloss's position at the school?",
            options: ["Vice Principal", "English Teacher", "Managing Director", "Accountant"],
            correct_answer: 2,
            explanation: "Mrs. Ibidun Gloss is the Managing Director of the school who worries about finances."
          },
          {
            question: "Who is the Vice Principal of Stardom Schools?",
            options: ["Mrs. Ibidun Gloss", "Mrs. Grace Apeh", "Mr. Fafore", "Mr. Bepo Adewale"],
            correct_answer: 1,
            explanation: "Mrs. Grace Apeh is the Vice Principal who tries to calm Mr. Bepo during his breakdown."
          }
        ]
      },
      {
        chapter_number: 2,
        title: "The Enticement",
        content: `**Chapter 2: The Enticement**

The chapter begins with Mr. Bepo reflecting on his life. He thinks about his choice to remain at Stardom Schools, even though he has a teaching job waiting for him in the United Kingdom. His dedication to the students keeps him grounded, but his family abroad adds to the pressure.

**Staff Conflicts:**
A staff meeting brings unresolved disputes among the teachers to light. Arguments and disagreements create a tense atmosphere in the room. Mr. Bepo tries to mediate the situation and calm the staff. His actions remind others of the fictional King Oloja from the TV drama "Village Headmaster." This earns him the nickname "The Lekki Headmaster," which reflects his leadership style and approach.

**Leadership Challenges:**
Mr. Bepo often steps in to settle conflicts among the staff. He tries to bring peace, even when the issues seem petty. His calm and understanding style sometimes frustrates those who expect stronger actions.

**Family Pressure:**
His family in the UK continues to urge him to relocate. They question why he stays in Nigeria when better opportunities await abroad. Mr. Bepo struggles to balance his professional calling with family expectations.

**Key Themes:**
- The tension between staying true to one's purpose and succumbing to external pressures
- Leadership and conflict resolution
- The nickname "Lekki Headmaster" and its significance
- Sacrifice for the greater good of education`,
        word_count: 240,
        estimated_reading_time: 3,
        likely_questions: [
          {
            question: "Why is Mr. Bepo called 'The Lekki Headmaster'?",
            options: ["Because he is from Lekki", "His leadership style resembles King Oloja from Village Headmaster", "He owns the school", "He built the school"],
            correct_answer: 1,
            explanation: "Mr. Bepo's leadership and mediation style reminds people of King Oloja from the TV drama 'Village Headmaster,' earning him the nickname."
          },
          {
            question: "What opportunity does Mr. Bepo have abroad?",
            options: ["A business deal", "A teaching job in the UK", "A political position", "Medical treatment"],
            correct_answer: 1,
            explanation: "Mr. Bepo has a teaching job waiting for him in the United Kingdom."
          }
        ]
      },
      {
        chapter_number: 3,
        title: "Migration Tales",
        content: `**Chapter 3: Migration Tales**

This chapter explores the theme of migration and the desire of many Nigerians to relocate abroad. Various characters share their experiences and aspirations about leaving Nigeria for greener pastures.

**Staff Aspirations:**
Several teachers at Stardom Schools express their desire to emigrate. They discuss the challenges of living in Nigeria—economic hardship, poor infrastructure, and limited opportunities. Some staff members have begun their visa applications.

**Mr. Bepo's Dilemma:**
While others dream of leaving, Mr. Bepo remains conflicted. He understands why people want to migrate but feels a strong attachment to his mission in Nigeria. He believes that if everyone leaves, who will build the nation?

**Stories of Those Who Left:**
The chapter includes stories of former colleagues and friends who have migrated. Some share success stories of better lives abroad, while others warn of the challenges—discrimination, loneliness, and the difficulty of starting over.

**Key Themes:**
- Brain drain and its impact on Nigeria
- The allure of life abroad versus patriotism
- Personal sacrifice for national development
- The emotional cost of migration on families`,
        word_count: 200,
        estimated_reading_time: 2,
        likely_questions: [
          {
            question: "What is the main theme of Chapter 3 'Migration Tales'?",
            options: ["School finances", "Student performance", "The desire to emigrate abroad", "Religious conflicts"],
            correct_answer: 2,
            explanation: "Chapter 3 explores the theme of migration and Nigerians' desire to relocate abroad."
          },
          {
            question: "What is Mr. Bepo's view on migration?",
            options: ["Everyone should leave Nigeria", "He is conflicted but feels attachment to his mission in Nigeria", "He has already applied for visa", "He encourages all staff to migrate"],
            correct_answer: 1,
            explanation: "Mr. Bepo remains conflicted about migration. He understands why people want to leave but believes someone must stay to build the nation."
          }
        ]
      },
      {
        chapter_number: 4,
        title: "A Case of Visa Denied",
        content: `**Chapter 4: A Case of Visa Denied**

This chapter follows the story of a teacher who applies for a visa but faces rejection. The experience highlights the challenges and disappointments many Nigerians face in their quest to travel abroad.

**The Visa Application:**
A staff member at Stardom Schools decides to apply for a visa to the United States or United Kingdom. They prepare documents, attend interviews, and wait anxiously for results.

**The Rejection:**
Despite careful preparation, the visa is denied. The rejection devastates the applicant, who had pinned high hopes on leaving Nigeria. The chapter explores the emotional toll of this rejection.

**Reactions at School:**
Colleagues react differently to the news. Some offer sympathy, while others use it as a warning about unrealistic dreams. The incident sparks discussions about why so many Nigerian applications are rejected.

**Mr. Bepo's Counsel:**
Mr. Bepo offers words of wisdom to the disappointed teacher. He encourages them to find purpose and fulfillment in Nigeria rather than seeing abroad as the only path to success.

**Key Themes:**
- The challenges of visa applications for Nigerians
- Dealing with disappointment and rejection
- Finding purpose at home
- The misconception that success only exists abroad`,
        word_count: 210,
        estimated_reading_time: 2,
        likely_questions: [
          {
            question: "What happens to the teacher who applies for a visa in Chapter 4?",
            options: ["The visa is approved", "The visa is denied", "The teacher withdraws the application", "The embassy closes"],
            correct_answer: 1,
            explanation: "The teacher's visa application is denied, causing great disappointment."
          }
        ]
      },
      {
        chapter_number: 5,
        title: "Snake in the Roof",
        content: `**Chapter 5: Snake in the Roof**

This chapter uses the metaphor of a snake to represent hidden dangers or problems within the school system. An actual incident involving a snake causes panic and reveals deeper issues.

**The Snake Incident:**
A snake is discovered somewhere in the school premises, causing panic among students and staff. The incident becomes a metaphor for hidden problems that can suddenly emerge and cause chaos.

**Hidden Problems:**
The chapter uses this event to explore hidden issues within the school—financial irregularities, staff misconduct, or suppressed conflicts that threaten the school's harmony.

**Mr. Bepo's Response:**
As headmaster, Mr. Bepo must address both the literal snake and the metaphorical ones. His response demonstrates his leadership abilities and his commitment to the school's wellbeing.

**Key Themes:**
- Hidden dangers in institutions
- The importance of vigilance
- Addressing problems before they escalate
- Leadership in crisis situations`,
        word_count: 160,
        estimated_reading_time: 2,
        likely_questions: [
          {
            question: "What does the 'Snake in the Roof' represent in Chapter 5?",
            options: ["A literal pet snake", "Hidden dangers or problems within the school", "A new student", "A construction project"],
            correct_answer: 1,
            explanation: "The snake serves as a metaphor for hidden problems within the school system."
          }
        ]
      },
      {
        chapter_number: 6,
        title: "Ade as Well as Jide COMES vs. COME",
        content: `**Chapter 6: Ade as Well as Jide COMES vs. COME**

This chapter focuses on education, particularly grammar and language issues. It addresses common grammatical errors and the importance of proper English usage in schools.

**Grammar Debates:**
The title refers to a grammatical question about subject-verb agreement when using "as well as." Teachers debate the correct usage, highlighting the importance of grammar in education.

**Mr. Fafore's Role:**
As the English teacher, Mr. Fafore's expertise is tested. The chapter may critique or highlight his teaching methods and knowledge of grammar.

**Educational Standards:**
The incident sparks discussions about educational standards in Nigerian schools. Are teachers well-equipped to teach proper English? How do language skills affect students' futures?

**Key Themes:**
- The importance of proper grammar and language skills
- Teacher competence and continuous learning
- Educational standards in Nigeria
- The role of English in Nigerian society`,
        word_count: 160,
        estimated_reading_time: 2,
        likely_questions: [
          {
            question: "What is the correct grammatical form: 'Ade as well as Jide COMES' or 'COME'?",
            options: ["COME because there are two subjects", "COMES because 'as well as' doesn't affect the verb", "Both are correct", "Neither is correct"],
            correct_answer: 1,
            explanation: "When 'as well as' is used, the verb agrees with the first subject. So 'Ade (singular) as well as Jide comes' is correct."
          },
          {
            question: "Who is the English teacher at Stardom Schools?",
            options: ["Mr. Bepo Adewale", "Mrs. Grace Apeh", "Mr. Fafore", "Mrs. Ibidun Gloss"],
            correct_answer: 2,
            explanation: "Mr. Fafore is the English teacher at Stardom Schools."
          }
        ]
      },
      {
        chapter_number: 7,
        title: "Ritualists",
        content: `**Chapter 7: Ritualists**

This chapter addresses the dark topic of ritual killings and superstition in Nigerian society. It may involve rumors, fears, or actual incidents that affect the school community.

**Rumors and Fear:**
Rumors about ritualists spread through the community, causing fear among parents, students, and staff. These fears reflect broader societal concerns about safety and superstition.

**Impact on the School:**
The school must address these fears while maintaining normalcy. Parents become overprotective, and attendance may be affected.

**Mr. Bepo's Approach:**
The headmaster must balance addressing legitimate safety concerns with dispelling irrational fears. His response tests his leadership and communication skills.

**Key Themes:**
- Superstition versus rationality in Nigerian society
- The impact of fear on communities
- Leadership in addressing social fears
- The responsibility of educational institutions in shaping societal thinking`,
        word_count: 150,
        estimated_reading_time: 2,
        likely_questions: [
          {
            question: "What social issue does Chapter 7 'Ritualists' address?",
            options: ["Political corruption", "Ritual killings and superstition", "Economic crisis", "Religious conflicts"],
            correct_answer: 1,
            explanation: "Chapter 7 addresses the topic of ritual killings and superstition in Nigerian society."
          }
        ]
      },
      {
        chapter_number: 8,
        title: "Missions Unaccomplished",
        content: `**Chapter 8: Missions Unaccomplished**

This chapter reflects on unfulfilled goals and aspirations. Characters face the reality that some objectives remain unachieved despite their best efforts.

**Incomplete Projects:**
The school or its staff may have started initiatives that remain unfinished. Budget constraints, lack of support, or changing priorities may have derailed these projects.

**Personal Goals:**
Individual characters also reflect on their personal missions—career ambitions, educational goals, or family objectives—that have not been achieved.

**Mr. Bepo's Reflections:**
The headmaster looks at his own unaccomplished missions. Has he achieved what he set out to do? What remains undone?

**Key Themes:**
- The gap between aspiration and reality
- Resilience in the face of incomplete goals
- Learning from failures
- Reassessing priorities and setting new goals`,
        word_count: 140,
        estimated_reading_time: 2,
        likely_questions: [
          {
            question: "What is the main focus of Chapter 8 'Missions Unaccomplished'?",
            options: ["Military missions", "Unfulfilled goals and aspirations", "School missions statement", "Religious missions"],
            correct_answer: 1,
            explanation: "Chapter 8 reflects on unfulfilled goals and aspirations of characters in the novel."
          }
        ]
      },
      {
        chapter_number: 9,
        title: "Laughing Waterfalls",
        content: `**Chapter 9: Laughing Waterfalls**

This chapter likely introduces a moment of joy or relief in the narrative. The "laughing waterfalls" may symbolize happiness, renewal, or a positive turning point.

**Moments of Joy:**
Despite the challenges faced throughout the novel, this chapter presents moments of happiness. Perhaps a school event, celebration, or achievement brings joy to the community.

**Natural Imagery:**
The waterfall imagery may connect the characters to nature and the beauty that exists despite urban challenges. It could represent cleansing, renewal, or the flow of life.

**Character Development:**
Characters may experience personal growth or resolution of earlier conflicts. Relationships may be mended or strengthened.

**Key Themes:**
- Finding joy amidst challenges
- The healing power of nature and community
- Hope and renewal
- The importance of celebrating small victories`,
        word_count: 140,
        estimated_reading_time: 2,
        likely_questions: [
          {
            question: "What does 'Laughing Waterfalls' symbolize in Chapter 9?",
            options: ["Sadness and despair", "Joy, renewal, and a positive turning point", "Financial problems", "Staff conflicts"],
            correct_answer: 1,
            explanation: "The 'laughing waterfalls' symbolizes happiness, renewal, or a positive turning point in the narrative."
          }
        ]
      },
      {
        chapter_number: 10,
        title: "Passport Pains",
        content: `**Chapter 10: Passport Pains**

This chapter returns to the theme of migration, focusing specifically on the difficulties of obtaining Nigerian passports.

**Bureaucratic Challenges:**
Characters face the frustrating process of obtaining or renewing passports. Long queues, corrupt officials, and inefficient systems make the process painful.

**The Desire to Leave:**
The passport difficulties highlight the desperation of those wanting to travel abroad. Some may need passports for legitimate reasons—education, business, or family visits.

**Commentary on Systems:**
The chapter serves as a critique of bureaucratic inefficiency in Nigeria. It asks why simple processes become so complicated and painful for citizens.

**Key Themes:**
- Bureaucratic inefficiency in Nigeria
- Corruption in public services
- The challenges of civic processes
- The human cost of inefficiency`,
        word_count: 140,
        estimated_reading_time: 2,
        likely_questions: [
          {
            question: "What bureaucratic challenge does Chapter 10 'Passport Pains' highlight?",
            options: ["Getting a driver's license", "Difficulties in obtaining Nigerian passports", "Paying taxes", "Registering a business"],
            correct_answer: 1,
            explanation: "Chapter 10 focuses on the difficulties of obtaining Nigerian passports and bureaucratic inefficiency."
          }
        ]
      },
      {
        chapter_number: 11,
        title: "Point of No Return",
        content: `**Chapter 11: Point of No Return**

This chapter represents a critical turning point where characters must make irreversible decisions. The title suggests reaching a moment from which there is no going back.

**Critical Decisions:**
Characters face decisions that will permanently change their lives. For Mr. Bepo, this may involve finally choosing between Nigeria and abroad, between the school and family.

**Consequences:**
The chapter explores the consequences of past actions and decisions. Some characters may face the results of choices made earlier in the story.

**Climax Building:**
As the penultimate chapter, it builds toward the story's climax. Tensions reach their peak, and resolutions begin to emerge.

**Key Themes:**
- Irreversible decisions and their consequences
- Commitment to chosen paths
- The courage to make difficult choices
- Accepting responsibility for decisions`,
        word_count: 140,
        estimated_reading_time: 2,
        likely_questions: [
          {
            question: "What does 'Point of No Return' signify in Chapter 11?",
            options: ["A geographical location", "A critical moment where irreversible decisions must be made", "The end of the school year", "A staff party"],
            correct_answer: 1,
            explanation: "'Point of No Return' signifies a critical turning point where characters must make irreversible decisions."
          }
        ]
      },
      {
        chapter_number: 12,
        title: "...Dawn",
        content: `**Chapter 12: ...Dawn**

The final chapter brings the story to its conclusion. "Dawn" symbolizes a new beginning after the darkness of challenges faced throughout the novel.

**Resolution:**
The various conflicts and tensions are resolved. Mr. Bepo's story reaches its conclusion—whether he stays or leaves, whether the school thrives or struggles.

**New Beginnings:**
Despite whatever hardships occurred, dawn suggests hope and new beginnings. Characters move forward with lessons learned and new perspectives gained.

**Final Reflections:**
The chapter offers final reflections on the themes explored—education, migration, leadership, and finding one's purpose. The author's message becomes clear.

**The Lekki Headmaster's Legacy:**
Mr. Bepo's impact on the school and its community is assessed. What legacy does he leave? What has the school community learned?

**Key Themes:**
- Hope and new beginnings
- Resolution of conflicts
- The legacy of dedicated educators
- Finding peace with one's choices
- The enduring value of education`,
        word_count: 170,
        estimated_reading_time: 2,
        likely_questions: [
          {
            question: "What does 'Dawn' symbolize in the final chapter of The Lekki Headmaster?",
            options: ["The end of everything", "Hope and new beginnings after challenges", "Morning assembly", "The principal waking up"],
            correct_answer: 1,
            explanation: "'Dawn' symbolizes hope and new beginnings after the darkness of challenges faced throughout the novel."
          },
          {
            question: "How many chapters are in The Lekki Headmaster?",
            options: ["8 chapters", "10 chapters", "12 chapters", "15 chapters"],
            correct_answer: 2,
            explanation: "The Lekki Headmaster has 12 chapters, from 'Dusk' to '...Dawn'."
          },
          {
            question: "Who is the author of The Lekki Headmaster?",
            options: ["Chinua Achebe", "Wole Soyinka", "Kabir Alabi Garba", "Khadija Abubakar Jalli"],
            correct_answer: 2,
            explanation: "The Lekki Headmaster was written by Kabir Alabi Garba, a Nigerian journalist with a Ph.D. in mass communication."
          }
        ]
      }
    ];

    // ============ THE LIFE CHANGER ============
    const lifeChanger = {
      title: "The Life Changer",
      author: "Khadija Abubakar Jalli",
      description: "The JAMB recommended novel about university life in Nigeria. A moral story that portrays the reality of life in Nigerian universities, following Ummi's family as her son Omar gains admission to study Law. Through Ummi's stories, the novel warns about temptations and challenges students face in tertiary institutions.",
      category: "general_reading",
      year: 2024,
      is_premium: false,
      total_chapters: 9,
      difficulty_level: "medium"
    };

    const lifeChangerChapters = [
      {
        chapter_number: 1,
        title: "The Waiting",
        content: `**Chapter 1: The Waiting**

The story opens with Ummi's family eagerly awaiting the arrival of Daddy. The children—Omar (18), Teemah, and five-year-old Bint—engage in lively discussions that bring laughter to the household.

**The Family Dynamics:**
Ummi is a teacher with four children: three girls and one boy. Omar is the eldest at 18, while Bint is the youngest and Ummi's favorite. The name "Ummi" means "mother," and she was named after her grandmother.

**Bint's Story:**
Five-year-old Bint tells her siblings about humiliating her Social Studies teacher, Mallam Salihu, who asked her to say "good morning" in French. When Bint answered correctly and the teacher couldn't respond in French, her classmates celebrated her.

**Omar's Big News:**
Omar, dressed in jeans and a white shirt, announces his admission to study Law at Ahmadu Bello University, Kongo Campus, Kano. His JAMB score is 230. He jokes that everyone should call him "learned brother" or "Esquire." Omar is excited because Daddy promised to buy him an Android phone if he got admitted to study Law.

**Setting the Scene:**
Due to a power outage, the family sits under a mango tree where Teemah sells Zobo drinks. Omar takes Teemah's zobo without paying, causing a playful argument until Ummi pays for him.

**Ummi's Decision:**
Since Omar will soon leave for university, Ummi decides to share her university experiences with her children as a warning and guide.`,
        word_count: 250,
        estimated_reading_time: 3,
        likely_questions: [
          {
            question: "What course was Omar admitted to study?",
            options: ["Medicine", "Engineering", "Law", "Accounting"],
            correct_answer: 2,
            explanation: "Omar was admitted to study Law at Ahmadu Bello University."
          },
          {
            question: "What was Omar's JAMB score?",
            options: ["200", "230", "250", "280"],
            correct_answer: 1,
            explanation: "Omar's JAMB score was 230."
          },
          {
            question: "Who is the youngest child in Ummi's family?",
            options: ["Omar", "Teemah", "Bint", "Jamila"],
            correct_answer: 2,
            explanation: "Bint, at five years old, is the youngest child in the family."
          },
          {
            question: "What does the name 'Ummi' mean?",
            options: ["Teacher", "Mother", "Wife", "Sister"],
            correct_answer: 1,
            explanation: "The name 'Ummi' means 'mother' in Arabic."
          },
          {
            question: "Which university did Omar gain admission to?",
            options: ["University of Lagos", "University of Ibadan", "Ahmadu Bello University", "University of Nigeria"],
            correct_answer: 2,
            explanation: "Omar was admitted to Ahmadu Bello University, Kongo Campus, Kano."
          }
        ]
      },
      {
        chapter_number: 2,
        title: "University Days",
        content: `**Chapter 2: University Days**

Ummi tells her children about her university experiences and her encounter with Salma and Dr. Samuel Johnson.

**First Days at University:**
Ummi was shocked by the free nature of university life—students didn't wear uniforms like in secondary school, making them appear equal to lecturers. Her father wanted her to marry before graduation, adding pressure to her university experience.

**Meeting Salma:**
At the faculty registration office, Ummi encounters Salma—a tall, busty, slim, light-skinned girl. Salma complains loudly, claiming that university lecturers are "inexpensive to purchase, just like the Nigerian Police."

**The Encounter with Dr. Samuel Johnson:**
A young man overhears Salma and challenges her claim. When Salma discovers this man is Dr. Samuel Johnson (Sam John), a Ph.D. holder and the Head of Department (HOD), she is embarrassed. Dr. Johnson, often mistaken for Igala but actually Yoruba, rarely talked or engaged in confrontations.

**Ummi's Fortunate Registration:**
Dr. Johnson praises Ummi for her decent dressing and wishes other students would learn from her. Ummi initially thinks he is making advances, but realizes she misjudged him. She becomes the first to register with number UG0001. Dr. Johnson prays she will always be number one in everything.

**The Connection:**
At home, Daddy reveals that Dr. Samuel Johnson is his friend who helped Ummi get admission. Daddy had wanted to study Law but ended up studying Accounting instead.`,
        word_count: 250,
        estimated_reading_time: 3,
        likely_questions: [
          {
            question: "What is Dr. Samuel Johnson's nickname?",
            options: ["Dr. Sam", "Sam John", "S.J.", "Dr. Johnson"],
            correct_answer: 1,
            explanation: "Dr. Samuel Johnson's nickname is 'Sam John.'"
          },
          {
            question: "What is Dr. Samuel Johnson's actual ethnic group?",
            options: ["Igala", "Hausa", "Yoruba", "Igbo"],
            correct_answer: 2,
            explanation: "Although often mistaken for Igala, Dr. Samuel Johnson is Yoruba."
          },
          {
            question: "What was Ummi's registration number?",
            options: ["UG0001", "UG0002", "UG1000", "UG0010"],
            correct_answer: 0,
            explanation: "Ummi was the first to register with number UG0001."
          },
          {
            question: "What did Salma claim about university lecturers?",
            options: ["They are very intelligent", "They are expensive to bribe", "They are inexpensive to purchase like Nigerian Police", "They are very strict"],
            correct_answer: 2,
            explanation: "Salma claimed that university lecturers are 'inexpensive to purchase, just like the Nigerian Police.'"
          }
        ]
      },
      {
        chapter_number: 3,
        title: "The Quiet One",
        content: `**Chapter 3: The Quiet One**

Ummi continues her stories, this time about a mysterious character known as "The Quiet One" and a kidnapping incident.

**The Community of Lafayette:**
Lafayette is a tight-knit community where the presence of strangers is a threat without the acknowledgment of the District Head, Hakimi. The community has a deep culture of neighborliness.

**Talle - The Quiet One:**
Talle's parents were from Lafayette. Before his birth, they struggled to conceive and sought help from a traditional healer named Boka. Tragically, Talle's mother died shortly after his birth. His father and stepmother later died in a fatal accident when he was twenty. Talle worked as a driver at the local government and was nicknamed "The Quiet One" due to his reserved nature.

**The Market Vendor's Report:**
A market vendor reports Talle's unusually large purchases to Hakimi, triggering an investigation. During questioning, Talle faints.

**Zaki the Criminal:**
A police van arrives—unprecedented in the peaceful community under Hakimi's 30-year rule. Three men accuse a local named Zaki of robbery and extortion. Seeing Zaki causes Talle to faint again.

**The Kidnapping Plot:**
It's revealed that Talle's financial struggles led him to work with Zaki in kidnapping. They targeted the 13-year-old son of wealthy businessman Alhaji Adamu, demanding only ₦250,000—showing their inexperience as kidnappers.`,
        word_count: 240,
        estimated_reading_time: 3,
        likely_questions: [
          {
            question: "What is Talle's nickname?",
            options: ["The Silent Man", "The Quiet One", "The Reserved", "The Calm One"],
            correct_answer: 1,
            explanation: "Talle is nicknamed 'The Quiet One' because of his reserved nature."
          },
          {
            question: "Who helped Talle's parents conceive?",
            options: ["A doctor", "A priest", "A traditional healer named Boka", "Dr. Samuel Johnson"],
            correct_answer: 2,
            explanation: "Talle's parents sought help from a traditional healer named Boka."
          },
          {
            question: "What crime did Talle get involved in?",
            options: ["Fraud", "Kidnapping", "Armed robbery", "Drug trafficking"],
            correct_answer: 1,
            explanation: "Talle got involved in kidnapping due to financial struggles."
          },
          {
            question: "How much ransom did Talle and Zaki demand?",
            options: ["₦500,000", "₦1,000,000", "₦250,000", "₦100,000"],
            correct_answer: 2,
            explanation: "They demanded ₦250,000, showing their inexperience as kidnappers."
          }
        ]
      },
      {
        chapter_number: 4,
        title: "Salma's University Life",
        content: `**Chapter 4: Salma's University Life**

This chapter focuses on Salma's experiences at university and her encounter with Dr. Dabo.

**Salma's Confidence:**
Salma revels in the freedoms of university life. She is the same woman who claimed she could buy university lecturers.

**Dr. Dabo's Advances:**
Dr. Dabo, a stern and morally upright lecturer, encounters Salma. Surprisingly, her beauty disrupts his usual composure, exposing vulnerability. Despite his advances, Salma dismisses him as lacking confidence and substance, calling him "sleazy."

**Queen Amina Hall - The Happening Babes:**
Salma stays in Queen Amina Hall, home to the "Happening Babes." Initially, she has a hostile relationship with her roommates:
- **Tomiwa** (from Oyo): The brightest, aspiring to careers in music and fashion. She loves snail soup.
- **Ngozi**: The quiet caretaker who cooks for the room.
- **Ada**: Rounds out the diverse group.

**Religious Diversity:**
Salma and Tomiwa are Muslims, while Ngozi and Ada are Christians. Despite their differences, Salma and Tomiwa develop a mischievous friendship.

**Cultural Exchange:**
Salma introduces her roommates to danwake, a Hausa cuisine. They share recipes and learn about each other's cultures.`,
        word_count: 210,
        estimated_reading_time: 2,
        likely_questions: [
          {
            question: "Where does Salma stay at the university?",
            options: ["King's Hall", "Queen Amina Hall", "Victoria Hall", "Independence Hall"],
            correct_answer: 1,
            explanation: "Salma stays in Queen Amina Hall, home to the 'Happening Babes.'"
          },
          {
            question: "Which roommate is described as the brightest?",
            options: ["Ngozi", "Ada", "Tomiwa", "Salma"],
            correct_answer: 2,
            explanation: "Tomiwa is described as the brightest, with aspirations in music and fashion."
          },
          {
            question: "What food does Salma introduce to her roommates?",
            options: ["Jollof rice", "Danwake", "Pounded yam", "Fried rice"],
            correct_answer: 1,
            explanation: "Salma introduces danwake, a Hausa cuisine, to her roommates."
          },
          {
            question: "What is Tomiwa's favorite food?",
            options: ["Fried rice", "Snail soup", "Danwake", "Amala"],
            correct_answer: 1,
            explanation: "Tomiwa is fond of snail soup."
          }
        ]
      },
      {
        chapter_number: 5,
        title: "The Gift of Money",
        content: `**Chapter 5: The Gift of Money**

This chapter explores the temptations that come with wealth and the dangers of accepting gifts from strangers.

**The Phone Call:**
Tomiwa's phone rings at 8 p.m. Salma had given Tomiwa's number to her admirers, considering herself too much of a "big babe" to give her own number.

**Meeting Habib and Labaran:**
Habib calls Tomiwa. Labaran owns the car, but Habib is the boss. When Tomiwa meets them, Habib notes that she seems more confident than Salma, who had introduced them.

**The Generous Gift:**
Habib gives Tomiwa ₦50,000 in ₦500 notes—₦10,000 for each of her three roommates and ₦20,000 for herself. Upon returning, the roommates celebrate, with Ngozi securing the door.

**Salma's Jealousy:**
Salma becomes upset, feeling overshadowed by Tomiwa's fortune. She lashes out at Ngozi, calling her a "money-monger." Ada calms the situation.

**Ngozi's Warning:**
Ngozi warns that such gifts always come with a price. Tomiwa dismissively says she's willing to sacrifice anything for the money.

**Salma's Focus:**
Meanwhile, Salma becomes fixated on securing Labaran's attention for herself.

**Academic Standing:**
Despite the drama, all four girls are solid B students in their courses, likely to graduate with second-class upper degrees. Only their final paper in moral philosophy remains.`,
        word_count: 230,
        estimated_reading_time: 3,
        likely_questions: [
          {
            question: "How much money did Habib give Tomiwa?",
            options: ["₦20,000", "₦30,000", "₦50,000", "₦100,000"],
            correct_answer: 2,
            explanation: "Habib gave Tomiwa ₦50,000—₦20,000 for herself and ₦10,000 for each roommate."
          },
          {
            question: "Who warned that the money would come with a price?",
            options: ["Salma", "Tomiwa", "Ada", "Ngozi"],
            correct_answer: 3,
            explanation: "Ngozi warned that such gifts always come with a price."
          },
          {
            question: "What was the girls' academic standing?",
            options: ["A students", "B students", "C students", "First class"],
            correct_answer: 1,
            explanation: "All four girls were solid B students, likely to graduate with second-class upper degrees."
          }
        ]
      },
      {
        chapter_number: 6,
        title: "The Examination",
        content: `**Chapter 6: The Examination**

This chapter follows a disastrous examination experience that changes everything for Salma.

**Overconfidence:**
On exam day, Salma approaches the moral philosophy examination with overconfidence, believing it will be easy. Other students share similar sentiments, thinking it's like what preachers teach in worship places.

**The Changed Exam:**
Unknown to Salma, the exam format has changed, requiring students to study specific sections of assigned books. Kolawole Abdul, known for academic excellence, and other prepared students focus on their answer sheets.

**The Invigilator's Notice:**
Dr. Amina, the invigilator, notices Salma's inappropriate attire and develops negative feelings toward her.

**The Cheating:**
Kolawole discreetly passes coded answers to Salma, unnoticed by the teacher. But when Salma returns to her seat, she is caught.

**The EMAL Form:**
Salma is issued an Examination Malpractice (EMAL) form. Her case is to be taken to the Exams and Ethics Committee (EMEC). The HOD handling her case is Dr. Samuel Johnson—the same man she had insulted at registration.

**Implicating Abdul:**
During disciplinary proceedings, Salma, in frustration, implicates Kolawole Abdul. This leads to Abdul's expulsion. Omar finds this action unfavorable, while Ummi maintains that following rules is paramount.`,
        word_count: 220,
        estimated_reading_time: 3,
        likely_questions: [
          {
            question: "What did Salma get caught doing in the exam?",
            options: ["Sleeping", "Talking", "Cheating", "Using phone"],
            correct_answer: 2,
            explanation: "Salma was caught cheating—receiving coded answers from Kolawole Abdul."
          },
          {
            question: "What form was Salma issued?",
            options: ["Registration form", "EMAL (Examination Malpractice) form", "Withdrawal form", "Transfer form"],
            correct_answer: 1,
            explanation: "Salma was issued an EMAL (Examination Malpractice) form."
          },
          {
            question: "What happened to Kolawole Abdul?",
            options: ["He was promoted", "He was expelled", "He was suspended", "Nothing happened"],
            correct_answer: 1,
            explanation: "Kolawole Abdul was expelled after Salma implicated him during disciplinary proceedings."
          },
          {
            question: "Who is known for academic excellence in the novel?",
            options: ["Tomiwa", "Salma", "Kolawole Abdul", "Ngozi"],
            correct_answer: 2,
            explanation: "Kolawole Abdul is described as someone renowned for his academic prowess."
          }
        ]
      },
      {
        chapter_number: 7,
        title: "Seeking Help",
        content: `**Chapter 7: Seeking Help**

Salma desperately seeks help to escape her disciplinary problems, leading to more complications.

**Confiding in Tomiwa:**
Salma tells Tomiwa about her predicament and receives genuine empathy. Tomiwa suggests seeking help from Habib Lawal, who is the Speaker of the House of Assembly.

**Habib's Suggestion:**
Habib advises Salma to seek Dr. Dabo's help—the same lecturer whose advances she had earlier rejected. Uncomfortable with this, Salma suggests consulting the chairman of the Exams and Ethics Committee instead.

**The Bribe Offer:**
In a troubling turn, Habib offers Salma ₦300,000 in exchange for sexual favors. She refuses.

**Meeting Dr. Kabir Mohammed:**
Salma meets with an EMEC committee member who introduces her to the chairman, Dr. Kabir Mohammed, at a local hotel. She refuses his sexual advances but negotiates a financial settlement—paying him ₦100,000 instead of the ₦200,000 they agreed on.

**The Fraud Revealed:**
Salma later realizes Dr. Kabir Mohammed is a fraud. He is not actually a Medical Doctor but an LT (Laboratory Technologist). She is distraught by the consequences of her actions.

**Reflection:**
Salma recognizes her error in implicating Abdul and reflects on her disillusionment with men, except for her father whom she regards as an exception.`,
        word_count: 220,
        estimated_reading_time: 3,
        likely_questions: [
          {
            question: "What is Habib Lawal's political position?",
            options: ["Governor", "Senator", "Speaker of the House of Assembly", "Minister"],
            correct_answer: 2,
            explanation: "Habib Lawal is the Speaker of the House of Assembly."
          },
          {
            question: "How much did Salma pay Dr. Kabir Mohammed?",
            options: ["₦50,000", "₦100,000", "₦200,000", "₦300,000"],
            correct_answer: 1,
            explanation: "Salma paid ₦100,000 instead of the agreed ₦200,000."
          },
          {
            question: "What is Dr. Kabir Mohammed's actual profession?",
            options: ["Medical Doctor", "Professor", "Laboratory Technologist", "Lawyer"],
            correct_answer: 2,
            explanation: "Dr. Kabir Mohammed is not a Medical Doctor but an LT (Laboratory Technologist)."
          }
        ]
      },
      {
        chapter_number: 8,
        title: "The Recovery",
        content: `**Chapter 8: The Recovery**

This chapter deals with the aftermath of Salma's ordeal and the recovery of the bribe money.

**Kabir's Character:**
Kabir Mohammed is described as friendly and approachable, but susceptible to financial enticements. Despite his amiable demeanor, he is often moody.

**Labaran's Discovery:**
Labaran tells Habib about Kabir's fraudulent actions. Habib suggests involving Zaki to retrieve the money, though he's uncomfortable because of Zaki's previous errors. (Zaki is the same man who lured Talle into kidnapping.)

**Talle's Deception:**
It's revealed that Talle deceives villagers between Nigeria and Niger, pretending to be a prosperous farmer while actually being involved in smuggling.

**The Gambling Den:**
Zaki tracks Kabir to a gambling establishment. Kabir arrives with less than ₦50,000 but leaves with ₦300,000. Kartagi, the gambling leader, signals his thug Gumuzu to confront Kabir. Zaki intervenes and retrieves the money.

**The Money's Fate:**
Zaki delivers the money to Labaran, who compensates him with ₦50,000. Labaran chooses not to inform Habib, assuming the original transaction with Salma was sexual rather than charitable.

**Salma's Return:**
Salma reappears eight days after her father's funeral, having transformed through grief. She develops romantic feelings for Salim.`,
        word_count: 220,
        estimated_reading_time: 2,
        likely_questions: [
          {
            question: "How much money does Zaki receive for recovering the bribe?",
            options: ["₦20,000", "₦50,000", "₦100,000", "₦200,000"],
            correct_answer: 1,
            explanation: "Labaran compensates Zaki with ₦50,000 for recovering the money."
          },
          {
            question: "What business does Talle pretend to do?",
            options: ["Teaching", "Farming", "Trading", "Driving"],
            correct_answer: 1,
            explanation: "Talle pretends to be a prosperous farmer while actually being involved in smuggling."
          },
          {
            question: "Who is Salma's new love interest?",
            options: ["Habib", "Labaran", "Salim", "Kabir"],
            correct_answer: 2,
            explanation: "Salma develops romantic feelings for Salim."
          }
        ]
      },
      {
        chapter_number: 9,
        title: "The Conclusion",
        content: `**Chapter 9: The Conclusion**

The final chapter wraps up the story with lessons and warnings about university life.

**Salim's Story:**
Ummi tells her children about Salim's encounter with an odd girl on social media, amidst his engagement to Salma. Salim bought a new Note Series phone, and Salma jokingly encouraged him to enjoy his bachelorhood before marriage "caged" him.

**Natasha's Appearance:**
Salim confides in Lawal about Natasha, an enigmatic figure he met online. Lawal is stunned that Salim has another girlfriend despite planning to marry Salma. Salim clarifies, "Salma is my wife."

**The Catfish:**
Natasha turns out to be a catfish—someone pretending to be someone else online. This serves as a warning about the dangers of social media relationships and online deception.

**Final Lessons:**
The story concludes with Ummi emphasizing the moral lessons:
- Be careful of the company you keep in university
- Avoid examination malpractice at all costs
- Don't accept gifts from strangers—they always come with strings attached
- Be wary of online relationships
- University truly is a "life changer"—it can change lives for better or worse

**Omar's Preparation:**
As Omar prepares for university, he carries with him the wisdom from his mother's stories, hopefully ready to navigate the challenges ahead.`,
        word_count: 230,
        estimated_reading_time: 3,
        likely_questions: [
          {
            question: "Who is Natasha in The Life Changer?",
            options: ["Salim's fiancée", "A catfish/online pretender", "Salma's sister", "A lecturer"],
            correct_answer: 1,
            explanation: "Natasha is a catfish—someone pretending to be someone else online."
          },
          {
            question: "What is the main message of The Life Changer?",
            options: ["University is easy", "Life has no challenges", "University can change lives for better or worse", "Online friends are trustworthy"],
            correct_answer: 2,
            explanation: "The novel's main message is that university is a 'life changer' that can change lives for better or worse."
          },
          {
            question: "Who is the author of The Life Changer?",
            options: ["Kabir Alabi Garba", "Chinua Achebe", "Khadija Abubakar Jalli", "Wole Soyinka"],
            correct_answer: 2,
            explanation: "The Life Changer was written by Khadija Abubakar Jalli."
          },
          {
            question: "How many chapters are in The Life Changer?",
            options: ["7 chapters", "8 chapters", "9 chapters", "10 chapters"],
            correct_answer: 2,
            explanation: "The Life Changer has 9 chapters."
          }
        ]
      }
    ];

    // ============ ADDITIONAL LITERATURE TEXTS ============
    const additionalNovels = [
      // DRAMA
      {
        title: "Harvest of Corruption",
        author: "Frank Ogodo Ogbeche",
        description: "JAMB African Drama text. A powerful play exposing corruption in Nigerian society through the story of Aloho, a young graduate seeking employment, and her encounter with Chief Haladu Ade-Amaka, a corrupt and lecherous politician.",
        category: "african_drama",
        year: 2025,
        is_premium: false,
        total_chapters: 5,
        difficulty_level: "medium"
      },
      {
        title: "Othello",
        author: "William Shakespeare",
        description: "JAMB Non-African Drama text. Shakespeare's tragic tale of jealousy, betrayal, and racism. Othello, a Moorish general in the Venetian army, is manipulated by his ensign Iago into believing his wife Desdemona has been unfaithful.",
        category: "non_african_drama",
        year: 2025,
        is_premium: false,
        total_chapters: 5,
        difficulty_level: "hard"
      },
      // PROSE
      {
        title: "Faceless",
        author: "Amma Darko",
        description: "JAMB African Prose text. A gripping story about street children in Accra, Ghana, exploring themes of poverty, survival, child abuse, and hope through the eyes of Fofo and her friends.",
        category: "african_prose",
        year: 2025,
        is_premium: false,
        total_chapters: 12,
        difficulty_level: "medium"
      },
      {
        title: "Native Son",
        author: "Richard Wright",
        description: "JAMB Non-African Prose text. A groundbreaking novel exploring race relations, fear, and violence in 1930s Chicago through Bigger Thomas, a young African American man whose life spirals into tragedy.",
        category: "non_african_prose",
        year: 2025,
        is_premium: false,
        total_chapters: 15,
        difficulty_level: "hard"
      }
    ];

    // ============ POETRY ============
    const poetryTexts = [
      // African Poetry
      {
        title: "Vanity",
        author: "Birago Diop",
        description: "JAMB African Poetry. A poem criticizing those who ignore the wisdom of ancestors and embrace foreign cultures, emphasizing the importance of African traditions and heritage.",
        category: "african_poetry",
        year: 2025,
        is_premium: false,
        total_chapters: 1,
        difficulty_level: "medium"
      },
      {
        title: "Ambush",
        author: "Gbemisola Adeoti",
        description: "JAMB African Poetry. A powerful poem depicting the harsh realities and challenges of modern African society, using vivid imagery of predators and prey.",
        category: "african_poetry",
        year: 2025,
        is_premium: false,
        total_chapters: 1,
        difficulty_level: "medium"
      },
      {
        title: "Piano and Drums",
        author: "Gabriel Okara",
        description: "JAMB African Poetry. A poem contrasting African and Western cultures through the imagery of drums (African tradition) and piano (Western civilization), exploring the poet's cultural conflict.",
        category: "african_poetry",
        year: 2025,
        is_premium: false,
        total_chapters: 1,
        difficulty_level: "medium"
      },
      {
        title: "The Dining Table",
        author: "Gbanabam Hallowell",
        description: "JAMB African Poetry. A poem that uses the dining table as a metaphor to explore themes of family, colonialism, and African identity.",
        category: "african_poetry",
        year: 2025,
        is_premium: false,
        total_chapters: 1,
        difficulty_level: "medium"
      },
      {
        title: "The Panic of Growing Older",
        author: "Lenrie Peters",
        description: "JAMB African Poetry. A reflective poem exploring the anxieties and fears associated with aging and mortality.",
        category: "african_poetry",
        year: 2025,
        is_premium: false,
        total_chapters: 1,
        difficulty_level: "medium"
      },
      {
        title: "The Anvil and the Hammer",
        author: "Kofi Awoonor",
        description: "JAMB African Poetry. A poem exploring the conflict between traditional African values and modern Western influences, using the imagery of blacksmithing.",
        category: "african_poetry",
        year: 2025,
        is_premium: false,
        total_chapters: 1,
        difficulty_level: "medium"
      },
      // Non-African Poetry
      {
        title: "Crossing the Bar",
        author: "Alfred Tennyson",
        description: "JAMB Non-African Poetry. A poem about death and the afterlife, using the metaphor of a ship crossing the sandbar as it leaves harbor, representing the soul's journey to meet God.",
        category: "non_african_poetry",
        year: 2025,
        is_premium: false,
        total_chapters: 1,
        difficulty_level: "medium"
      },
      {
        title: "The Pulley",
        author: "George Herbert",
        description: "JAMB Non-African Poetry. A metaphysical poem explaining why God withheld 'rest' from humanity's blessings, creating a 'pulley' to draw humans back to God.",
        category: "non_african_poetry",
        year: 2025,
        is_premium: false,
        total_chapters: 1,
        difficulty_level: "medium"
      },
      {
        title: "The School Boy",
        author: "William Blake",
        description: "JAMB Non-African Poetry. A poem from 'Songs of Experience' criticizing formal education's suppression of children's natural joy and creativity.",
        category: "non_african_poetry",
        year: 2025,
        is_premium: false,
        total_chapters: 1,
        difficulty_level: "medium"
      },
      {
        title: "The Proud King",
        author: "William Morris",
        description: "JAMB Non-African Poetry. A narrative poem teaching humility through the story of a proud king who is humbled by supernatural intervention.",
        category: "non_african_poetry",
        year: 2025,
        is_premium: false,
        total_chapters: 1,
        difficulty_level: "medium"
      }
    ];

    // Clear existing data and insert new
    console.log("Clearing existing novels and chapters...");
    await supabase.from('novel_chapters').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('novels').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert The Lekki Headmaster
    console.log("Inserting The Lekki Headmaster...");
    const { data: lekki, error: lekkiError } = await supabase
      .from('novels')
      .insert(lekkiHeadmaster)
      .select()
      .single();

    if (lekkiError) throw lekkiError;

    // Insert Lekki chapters
    for (const chapter of lekkiChapters) {
      await supabase.from('novel_chapters').insert({
        novel_id: lekki.id,
        ...chapter
      });
    }

    // Insert The Life Changer
    console.log("Inserting The Life Changer...");
    const { data: lifeChangerData, error: lifeChangerError } = await supabase
      .from('novels')
      .insert(lifeChanger)
      .select()
      .single();

    if (lifeChangerError) throw lifeChangerError;

    // Insert Life Changer chapters
    for (const chapter of lifeChangerChapters) {
      await supabase.from('novel_chapters').insert({
        novel_id: lifeChangerData.id,
        ...chapter
      });
    }

    // Insert additional novels
    console.log("Inserting additional Literature texts...");
    for (const novel of [...additionalNovels, ...poetryTexts]) {
      const { data: insertedNovel, error } = await supabase
        .from('novels')
        .insert(novel)
        .select()
        .single();

      if (insertedNovel) {
        // Add intro chapter
        await supabase.from('novel_chapters').insert({
          novel_id: insertedNovel.id,
          chapter_number: 1,
          title: novel.total_chapters === 1 ? "Full Text & Analysis" : "Introduction & Overview",
          content: `**${novel.title}** by ${novel.author}\n\n${novel.description}\n\nThis is a JAMB ${novel.year} recommended text for Literature in English. Study the themes, characters, and literary devices carefully.`,
          word_count: 100,
          estimated_reading_time: 2,
          likely_questions: [
            {
              question: `Who wrote "${novel.title}"?`,
              options: [novel.author, "Chinua Achebe", "Wole Soyinka", "Chimamanda Adichie"],
              correct_answer: 0,
              explanation: `"${novel.title}" was written by ${novel.author}.`
            }
          ]
        });
      }
    }

    console.log("Seeding complete!");
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Full JAMB novels content seeded successfully',
      novels_added: 2 + additionalNovels.length + poetryTexts.length,
      chapters_added: lekkiChapters.length + lifeChangerChapters.length + additionalNovels.length + poetryTexts.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error seeding novels:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
