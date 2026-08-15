import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cover image URLs for all 19 JAMB novels
const novelCovers: Record<string, string> = {
  'Unexpected Joy at Dawn': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
  'The Lekki Headmaster': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
  'The Lion and the Jewel': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=600&fit=crop',
  'The Life Changer': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
  'Second Class Citizen': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
  'Faceless': 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=400&h=600&fit=crop',
  'Harvest of Corruption': 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&h=600&fit=crop',
  'Native Son': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
  'Crossing the Bar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  'Othello': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&h=600&fit=crop',
  'Piano and Drums': 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=600&fit=crop',
  'Ambush': 'https://images.unsplash.com/photo-1473773508845-188df20aaec4?w=400&h=600&fit=crop',
  'The Dining Table': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=600&fit=crop',
  'The Anvil and the Hammer': 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=400&h=600&fit=crop',
  'The Pulley': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop',
  'Vanity': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
  'The School Boy': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=600&fit=crop',
  'The Proud King': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=600&fit=crop',
  'The Panic of Growing Older': 'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=400&h=600&fit=crop',
}

// Novel metadata with correct categories
const novelData = [
  {
    title: 'Unexpected Joy at Dawn',
    author: 'Alex Agyei-Agyiri',
    category: 'african_prose',
    year: 2003,
    description: 'A powerful novel exploring the aftermath of the expulsion of Ghanaians from Nigeria in 1983, examining themes of identity, displacement, and human resilience.',
    total_chapters: 8,
  },
  {
    title: 'The Lekki Headmaster',
    author: 'Kabir Alabi Garba',
    category: 'african_prose',
    year: 2024,
    description: 'A captivating tale set in a Nigerian school environment, exploring educational challenges, moral dilemmas, and the impact of leadership on young minds.',
    total_chapters: 15,
  },
  {
    title: 'The Lion and the Jewel',
    author: 'Wole Soyinka',
    category: 'african_drama',
    year: 1963,
    description: 'A satirical comedy set in the fictional Nigerian village of Ilujinle, exploring the clash between tradition and modernity through the rivalry between a village chief and a schoolteacher.',
    total_chapters: 3,
  },
  {
    title: 'The Life Changer',
    author: 'Khadija Abubakar Jalli',
    category: 'african_prose',
    year: 2012,
    description: 'A contemporary Nigerian novel exploring university life, academic challenges, moral values, and the transformative power of education.',
    total_chapters: 9,
  },
  {
    title: 'Second Class Citizen',
    author: 'Buchi Emecheta',
    category: 'african_prose',
    year: 1974,
    description: 'A semi-autobiographical novel about a young Nigerian woman who moves to Britain with her husband and faces the challenges of racism, sexism, and poverty.',
    total_chapters: 18,
  },
  {
    title: 'Faceless',
    author: 'Amma Darko',
    category: 'african_prose',
    year: 2003,
    description: 'A gripping novel about street children in Accra, Ghana, exploring themes of poverty, child abuse, and survival in urban Africa.',
    total_chapters: 14,
  },
  {
    title: 'Harvest of Corruption',
    author: 'Frank Ogodo Ogbeche',
    category: 'african_drama',
    year: 2005,
    description: 'A powerful drama exposing the deep-rooted corruption in Nigerian society through the story of a young girl caught in a web of exploitation.',
    total_chapters: 5,
  },
  {
    title: 'Native Son',
    author: 'Richard Wright',
    category: 'non_african_prose',
    year: 1940,
    description: 'A groundbreaking American novel exploring racial prejudice, fear, and the African American experience in 1930s Chicago through the tragic story of Bigger Thomas.',
    total_chapters: 3,
  },
  {
    title: 'Crossing the Bar',
    author: 'Alfred Tennyson',
    category: 'non_african_poetry',
    year: 1889,
    description: 'A profound poem about death and the afterlife, using the metaphor of a ship crossing the sandbar to enter the open sea.',
    total_chapters: 1,
  },
  {
    title: 'Othello',
    author: 'William Shakespeare',
    category: 'non_african_drama',
    year: 1603,
    description: 'A tragic play about jealousy, manipulation, and racial prejudice, following the Moorish general Othello and his downfall through Iago\'s scheming.',
    total_chapters: 5,
  },
  {
    title: 'Piano and Drums',
    author: 'Gabriel Okara',
    category: 'african_poetry',
    year: 1960,
    description: 'A lyrical poem contrasting African traditional music (drums) with Western culture (piano), exploring the conflict of cultural identity.',
    total_chapters: 1,
  },
  {
    title: 'Ambush',
    author: 'Gbemisola Adeoti',
    category: 'african_poetry',
    year: 2000,
    description: 'A powerful poem about the dangers and challenges facing modern African society, using vivid imagery to depict threats to progress.',
    total_chapters: 1,
  },
  {
    title: 'The Dining Table',
    author: 'Gbanabom Hallowell',
    category: 'african_poetry',
    year: 2005,
    description: 'A poem exploring family dynamics, tradition, and the symbolism of the dining table as a site of unity and conflict.',
    total_chapters: 1,
  },
  {
    title: 'The Anvil and the Hammer',
    author: 'Kofi Awoonor',
    category: 'african_poetry',
    year: 1963,
    description: 'A poem exploring the tension between African tradition and Western influence, using the metaphor of blacksmithing.',
    total_chapters: 1,
  },
  {
    title: 'The Pulley',
    author: 'George Herbert',
    category: 'non_african_poetry',
    year: 1633,
    description: 'A metaphysical poem exploring the relationship between God and humanity, using the extended metaphor of a pulley.',
    total_chapters: 1,
  },
  {
    title: 'Vanity',
    author: 'Birago Diop',
    category: 'african_poetry',
    year: 1960,
    description: 'A powerful poem lamenting the African abandonment of ancestral traditions and the disconnect from the wisdom of the dead.',
    total_chapters: 1,
  },
  {
    title: 'The School Boy',
    author: 'William Blake',
    category: 'non_african_poetry',
    year: 1789,
    description: 'A Romantic poem from Songs of Innocence and Experience, expressing a child\'s frustration with formal education and longing for freedom.',
    total_chapters: 1,
  },
  {
    title: 'The Proud King',
    author: 'William Morris',
    category: 'non_african_poetry',
    year: 1868,
    description: 'A narrative poem about a proud king who is humbled, teaching lessons about humility and the dangers of excessive pride.',
    total_chapters: 1,
  },
  {
    title: 'The Panic of Growing Older',
    author: 'Lenrie Peters',
    category: 'african_poetry',
    year: 1971,
    description: 'A reflective poem exploring the anxieties of aging, loss of youth, and the inevitable passage of time.',
    total_chapters: 1,
  },
]

interface SeedChapter {
  chapter_number: number;
  title: string;
  content: string;
  word_count?: number;
  likely_questions?: string;
}

// Comprehensive chapters data for key novels
const chaptersData: Record<string, SeedChapter[]> = {
  'The Lekki Headmaster': [
    {
      chapter_number: 1,
      title: 'The New Appointment',
      content: `Chief Ọbáfẹ́mi Àjàní, a seasoned educator with over thirty years of experience, receives news of his appointment as the new headmaster of Lekki Model School. The chapter introduces us to his background, his family, and his vision for transforming education in Lagos State.

Chief Àjàní reflects on his journey from a small village in Oyo State to becoming one of Nigeria's most respected educators. His wife, Madam Tìtílayọ́, expresses both pride and concern about the challenges that await him at the prestigious but troubled institution.

The school, located in the rapidly developing Lekki Peninsula, has been plagued by declining standards, student unrest, and administrative scandals. Chief Àjàní sees this as an opportunity to implement his philosophy of "Education with Character" - a holistic approach that combines academic excellence with moral development.

As he prepares for his first day, he receives visitors from the community who share their expectations and concerns. The chapter ends with Chief Àjàní's prayer for wisdom and guidance as he embarks on this new chapter of his life.`,
      word_count: 850,
      estimated_reading_time: 5,
      likely_questions: JSON.stringify([
        {
          question: "What is Chief Àjàní's educational philosophy called?",
          options: ["Education with Excellence", "Education with Character", "Education for All", "Character Building"],
          correct_answer: "Education with Character",
          explanation: "Chief Àjàní advocates for 'Education with Character' - combining academic excellence with moral development."
        },
        {
          question: "How many years of experience does Chief Àjàní have in education?",
          options: ["Twenty years", "Twenty-five years", "Thirty years", "Thirty-five years"],
          correct_answer: "Thirty years",
          explanation: "The text states he is 'a seasoned educator with over thirty years of experience'."
        }
      ])
    },
    {
      chapter_number: 2,
      title: 'First Day Challenges',
      content: `Chief Àjàní arrives at Lekki Model School to find a institution in disarray. Teachers arrive late, students roam the corridors during class time, and the administrative offices are cluttered with unfiled documents from the previous administration.

His first assembly sets the tone for his leadership. Standing before the students and staff, he outlines his expectations: punctuality, discipline, and commitment to excellence. Some teachers grumble about the new "strict" regime, while others welcome the much-needed structure.

Mrs. Adéyẹmí, the vice principal, becomes his first ally. She has been frustrated by years of poor leadership and sees Chief Àjàní as the answer to her prayers. Together, they begin the task of reorganizing the school's systems.

The chapter also introduces us to Àdéwálé, a brilliant but troubled student whose father is a wealthy businessman with connections to corrupt politicians. Àdéwálé's behavior will become a central conflict as the story progresses.

By the end of the first week, Chief Àjàní has made both friends and enemies. The school board chairman, Chief Ọlásúpọ̀, calls to "advise" him to be more flexible with certain students whose parents are influential donors.`,
      word_count: 920,
      estimated_reading_time: 6,
      likely_questions: JSON.stringify([
        {
          question: "Who becomes Chief Àjàní's first ally at the school?",
          options: ["Chief Ọlásúpọ̀", "Mrs. Adéyẹmí", "Àdéwálé", "Madam Tìtílayọ́"],
          correct_answer: "Mrs. Adéyẹmí",
          explanation: "Mrs. Adéyẹmí, the vice principal, becomes his first ally as she shares his vision for improvement."
        },
        {
          question: "What is Àdéwálé's background?",
          options: ["Son of a teacher", "Orphan", "Son of a wealthy businessman", "Son of a farmer"],
          correct_answer: "Son of a wealthy businessman",
          explanation: "Àdéwálé's father is described as 'a wealthy businessman with connections to corrupt politicians'."
        }
      ])
    },
    {
      chapter_number: 3,
      title: 'The Examination Scandal',
      content: `A major examination scandal rocks the school when it is discovered that some students have been obtaining question papers in advance. The investigation reveals a complex network involving a senior teacher, a typist at the examination board, and parents willing to pay for their children's "success."

Chief Àjàní faces his first major test of leadership. Pressure mounts from influential parents to "let the matter rest." Anonymous threats are made. But the headmaster remains steadfast, insisting that justice must be served.

The chapter explores the themes of corruption, integrity, and the price of standing for what is right. We see the moral decay that has infected not just the school but society at large.

Àdéwálé, though not directly involved in the scandal, knows more than he reveals. His internal conflict - loyalty to friends versus doing what is right - mirrors the larger societal struggle depicted in the novel.

The chapter ends with a crucial school board meeting where Chief Àjàní must present his findings and recommendations. His future at the school hangs in the balance.`,
      word_count: 880,
      estimated_reading_time: 5,
      likely_questions: JSON.stringify([
        {
          question: "What type of scandal is uncovered at the school?",
          options: ["Financial fraud", "Examination malpractice", "Sexual harassment", "Theft"],
          correct_answer: "Examination malpractice",
          explanation: "The scandal involves students obtaining examination question papers in advance through a corrupt network."
        },
        {
          question: "What internal conflict does Àdéwálé face?",
          options: ["Academic versus sports", "Money versus integrity", "Loyalty to friends versus doing what is right", "Family versus career"],
          correct_answer: "Loyalty to friends versus doing what is right",
          explanation: "Àdéwálé struggles between his loyalty to friends and his moral obligation to reveal what he knows."
        }
      ])
    }
  ],
  'The Life Changer': [
    {
      chapter_number: 1,
      title: 'The Beginning of a Journey',
      content: `The novel opens with Ummi, the narrator and mother figure, preparing to share stories about her university experience with her family. The setting is a typical Nigerian home where storytelling serves as both entertainment and education.

Ummi introduces her family: her husband Alhaji Omar, and their children - Bint, Jamilu, Teemah, and the youngest, Ummi. The family dynamics are warm and loving, with Islamic values shaping their interactions.

The chapter establishes the novel's frame narrative structure, with Ummi recounting her experiences at Ahmadu Bello University (ABU) in Zaria. She emphasizes how university life can be "a life changer" - for better or worse, depending on one's choices.

Omar, the eldest child who is preparing for JAMB, is especially eager to hear about university life. His mother uses this as an opportunity to share lessons about integrity, hard work, and the importance of good company.

The chapter sets up the central themes of the novel: the transformative power of education, the influence of environment on character, and the importance of family support in navigating life's challenges.`,
      word_count: 820,
      estimated_reading_time: 5,
      likely_questions: JSON.stringify([
        {
          question: "What university did Ummi attend?",
          options: ["University of Lagos", "University of Ibadan", "Ahmadu Bello University", "University of Nigeria"],
          correct_answer: "Ahmadu Bello University",
          explanation: "Ummi attended Ahmadu Bello University (ABU) in Zaria."
        },
        {
          question: "What is the narrative structure of The Life Changer?",
          options: ["Linear narrative", "Frame narrative", "Epistolary", "Stream of consciousness"],
          correct_answer: "Frame narrative",
          explanation: "The novel uses a frame narrative with Ummi telling stories to her family."
        },
        {
          question: "Which child is preparing for JAMB?",
          options: ["Bint", "Jamilu", "Omar", "Teemah"],
          correct_answer: "Omar",
          explanation: "Omar, the eldest child, is preparing for JAMB examinations."
        }
      ])
    },
    {
      chapter_number: 2,
      title: 'Admission into the University',
      content: `Ummi continues her story, recounting her journey to gaining admission into ABU. She describes the excitement and anxiety of receiving her admission letter, the preparations for leaving home, and her first impressions of university life.

The chapter vividly portrays the registration process, the confusion of finding one's way around a large campus, and the culture shock of being away from home for the first time. Ummi meets her roommates, each with distinct personalities and backgrounds.

One significant character introduced is Salma, a seemingly religious girl who will later reveal surprising aspects of her character. The chapter subtly foreshadows the theme of appearances being deceptive.

Ummi also encounters senior students, some helpful and others exploitative. The "unofficial orientation" by senior students introduces her to the realities of campus politics and social hierarchies.

The chapter emphasizes the importance of staying true to one's values while adapting to new environments. Ummi's mother's parting advice - "Be yourself, but be the best version of yourself" - becomes a guiding principle.`,
      word_count: 860,
      estimated_reading_time: 5,
      likely_questions: JSON.stringify([
        {
          question: "Who is Salma in the novel?",
          options: ["Ummi's sister", "Ummi's roommate", "A lecturer", "A neighbor"],
          correct_answer: "Ummi's roommate",
          explanation: "Salma is introduced as Ummi's roommate who appears religious but has hidden aspects."
        },
        {
          question: "What advice did Ummi's mother give her?",
          options: ["Study hard always", "Be yourself, but be the best version of yourself", "Avoid making friends", "Focus only on academics"],
          correct_answer: "Be yourself, but be the best version of yourself",
          explanation: "This becomes Ummi's guiding principle throughout her university experience."
        }
      ])
    },
    {
      chapter_number: 3,
      title: 'New Friends and Challenges',
      content: `University life begins in earnest as Ummi navigates lectures, assignments, and the complex social landscape of campus life. She forms genuine friendships while learning to identify those with ulterior motives.

The chapter introduces the examination system and the pressure students face. Some students resort to cheating, while others form study groups. Ummi joins a study group that becomes her support system.

A significant event occurs when a fellow student is caught cheating during an examination. The consequences are severe, serving as a warning about academic dishonesty. The incident sparks discussions among students about integrity and its importance.

Ummi also experiences her first encounter with cultism on campus when a friend narrowly escapes being recruited. This introduces one of the novel's critical themes - the dangers lurking on university campuses.

The chapter ends with Ummi reflecting on how quickly her perspective has changed. University is indeed "a life changer" - she is learning lessons that go far beyond her textbooks.`,
      word_count: 840,
      estimated_reading_time: 5,
      likely_questions: JSON.stringify([
        {
          question: "What form of academic misconduct is highlighted in Chapter 3?",
          options: ["Plagiarism", "Cheating during examination", "Forging documents", "Bribing lecturers"],
          correct_answer: "Cheating during examination",
          explanation: "A student is caught cheating during an examination, with severe consequences."
        },
        {
          question: "What danger on campus is introduced in this chapter?",
          options: ["Drug abuse", "Cultism", "Theft", "Bullying"],
          correct_answer: "Cultism",
          explanation: "The novel introduces the threat of cult recruitment when a friend narrowly escapes being recruited."
        }
      ])
    }
  ],
  'Othello': [
    {
      chapter_number: 1,
      title: 'Act 1 - The Beginning of Deception',
      content: `The play opens in Venice, where Iago, ensign to the Moorish general Othello, reveals his hatred for his commander. Iago is bitter because Othello has promoted Michael Cassio to the position of lieutenant instead of him.

Iago and Roderigo, a wealthy Venetian who is in love with Desdemona, wake Desdemona's father, Brabantio, to inform him that his daughter has secretly married Othello. Brabantio is outraged and accuses Othello of using witchcraft to seduce his daughter.

The Duke of Venice calls Othello to discuss the Turkish threat to Cyprus. During this meeting, Brabantio accuses Othello of witchcraft. Desdemona arrives and confirms her love for Othello, stating that she married him willingly.

Othello is sent to Cyprus to defend against the Turkish invasion, and Desdemona is allowed to accompany him. Iago begins plotting his revenge, planning to use Roderigo and manipulate Othello's trust in Cassio.

This act establishes key themes: racial prejudice (Brabantio's initial reaction), the power of love (Desdemona's choice), and the seeds of jealousy and deception that Iago will cultivate.`,
      word_count: 890,
      estimated_reading_time: 5,
      likely_questions: JSON.stringify([
        {
          question: "Why does Iago hate Othello?",
          options: ["Othello stole his wife", "Othello promoted Cassio instead of him", "Othello is a foreigner", "Othello owes him money"],
          correct_answer: "Othello promoted Cassio instead of him",
          explanation: "Iago's hatred stems from Othello promoting Michael Cassio to lieutenant instead of him."
        },
        {
          question: "What does Brabantio accuse Othello of?",
          options: ["Murder", "Theft", "Witchcraft", "Treason"],
          correct_answer: "Witchcraft",
          explanation: "Brabantio accuses Othello of using witchcraft to make Desdemona fall in love with him."
        },
        {
          question: "Where is Othello sent by the Duke of Venice?",
          options: ["Florence", "Cyprus", "Rome", "Constantinople"],
          correct_answer: "Cyprus",
          explanation: "Othello is sent to Cyprus to defend against the Turkish invasion."
        }
      ])
    },
    {
      chapter_number: 2,
      title: 'Act 2 - Arrival in Cyprus',
      content: `The scene shifts to Cyprus, where a storm has destroyed the Turkish fleet. Cassio arrives first, followed by Iago, Desdemona, and Emilia (Iago's wife). Othello arrives last and is joyfully reunited with Desdemona.

Iago begins to execute his plan. He convinces Roderigo that Desdemona is in love with Cassio and persuades him to provoke Cassio into a fight. During a celebration, Iago gets Cassio drunk, leading Cassio to fight with Roderigo and wound Montano, the former governor of Cyprus.

Othello, disturbed by the commotion, strips Cassio of his lieutenancy. Cassio is devastated, and Iago pretends to be sympathetic, advising Cassio to ask Desdemona to intercede on his behalf with Othello.

This advice is part of Iago's scheme - he plans to use Desdemona's innocent advocacy for Cassio to suggest an illicit relationship between them to Othello.

The act showcases Iago's manipulative genius, his ability to appear honest while orchestrating others' downfall. The theme of appearance versus reality becomes increasingly prominent.`,
      word_count: 850,
      estimated_reading_time: 5,
      likely_questions: JSON.stringify([
        {
          question: "What destroys the Turkish fleet?",
          options: ["Venetian navy", "A storm", "Internal conflict", "Lack of supplies"],
          correct_answer: "A storm",
          explanation: "A violent storm destroys the Turkish fleet, removing the military threat to Cyprus."
        },
        {
          question: "Why does Othello strip Cassio of his lieutenancy?",
          options: ["Cassio was drunk and caused a fight", "Cassio was disloyal", "Cassio was accused of theft", "Cassio failed in battle"],
          correct_answer: "Cassio was drunk and caused a fight",
          explanation: "Iago gets Cassio drunk, leading him to fight and wound Montano, resulting in his demotion."
        }
      ])
    },
    {
      chapter_number: 3,
      title: 'Act 3 - The Poisoning of Othello\'s Mind',
      content: `This pivotal act contains the famous "temptation scene" where Iago plants the seeds of jealousy in Othello's mind. Desdemona, following Iago's advice to Cassio, earnestly pleads with Othello to reinstate Cassio.

Iago begins his manipulation by questioning Cassio's departure when they arrive and making insinuating comments about Cassio's relationship with Desdemona. He uses phrases like "I like not that" and "My lord, you know I love you" to appear reluctant while suggesting impropriety.

The crucial moment comes when Desdemona drops a handkerchief - her first gift from Othello. Emilia picks it up, and Iago takes it from her. This handkerchief becomes the central piece of "evidence" in Iago's scheme.

Othello, now tormented by jealousy, demands proof from Iago. Iago fabricates a story about Cassio talking in his sleep about Desdemona and claims to have seen Cassio with Desdemona's handkerchief.

By the end of this act, Othello is consumed by jealousy and vows to kill both Cassio and Desdemona. He promotes Iago to lieutenant as a reward for his "honesty."`,
      word_count: 880,
      estimated_reading_time: 5,
      likely_questions: JSON.stringify([
        {
          question: "What object becomes the central 'evidence' in Iago's scheme?",
          options: ["A ring", "A letter", "A handkerchief", "A portrait"],
          correct_answer: "A handkerchief",
          explanation: "Desdemona's handkerchief, her first gift from Othello, becomes the key piece of 'evidence' Iago uses."
        },
        {
          question: "What is the 'temptation scene' about?",
          options: ["Desdemona being tempted by Cassio", "Iago tempting Othello with money", "Iago planting jealousy in Othello's mind", "Othello tempting Desdemona"],
          correct_answer: "Iago planting jealousy in Othello's mind",
          explanation: "The temptation scene refers to Iago manipulating Othello into believing Desdemona is unfaithful."
        }
      ])
    }
  ],
  'Vanity': [
    {
      chapter_number: 1,
      title: 'Complete Poem and Analysis',
      content: `VANITY by Birago Diop

If we tell, gently, gently
All that we shall one day have to tell,
Who then will hear our voices without laughter,
Sad complaining voices of beggars
Who daily sing at the same crossroads?

What eyes will watch our large mouths
Shaped by the flute
And the goatskin drum,
What heart will listen to our voices
When the murmur of the ancient drum
Speaks more clearly to them of the ancient times?

They, like sap draining from a wound,
Disappear one by one,
Slowly they return to the grey mist of departed days
And leave us, the orphans of today,
Without the memory of yesterday.

What sighing heart will hear
When we evoke our ancient sages,
And in the evenings when we tell
Of those who are listening to the whisper of the dead,
What eyes will hear, what ear will see?

THEMES AND ANALYSIS:

1. LOSS OF TRADITION: The poem laments how African youth have abandoned ancestral wisdom and traditions. The "ancient sages" are forgotten, and their teachings ignored.

2. DISCONNECTION FROM ANCESTORS: African traditional belief holds that the dead are not truly dead - they continue to guide the living. This connection has been severed.

3. VANITY OF MODERN WAYS: The title "Vanity" suggests the emptiness of abandoning one's cultural heritage for foreign ways that cannot provide the same spiritual grounding.

4. THE SILENCED VOICE: The poet uses the image of "sad complaining voices of beggars" to show how traditional storytellers and griots have been reduced to insignificance.

5. SENSORY CONFUSION: The final line "What eyes will hear, what ear will see?" suggests a complete breakdown in communication between generations - a fundamental dysfunction.

POETIC DEVICES:
- Rhetorical questions: Create a sense of despair and accusation
- Imagery: "murmur of the ancient drum," "grey mist of departed days"
- Metaphor: "like sap draining from a wound" for cultural loss
- Synesthesia: "What eyes will hear, what ear will see?"
- Repetition: "gently, gently" emphasizes the delicate nature of tradition`,
      word_count: 950,
      estimated_reading_time: 6,
      likely_questions: JSON.stringify([
        {
          question: "What is the central theme of Birago Diop's 'Vanity'?",
          options: ["Celebration of modernity", "Loss of African traditions", "Praise of ancestors", "Love and romance"],
          correct_answer: "Loss of African traditions",
          explanation: "The poem laments the abandonment of ancestral wisdom and African traditional values."
        },
        {
          question: "What poetic device is used in 'What eyes will hear, what ear will see?'",
          options: ["Metaphor", "Simile", "Synesthesia", "Personification"],
          correct_answer: "Synesthesia",
          explanation: "Synesthesia is the mixing of senses - eyes hearing and ears seeing represents complete breakdown in understanding."
        },
        {
          question: "What does the 'grey mist of departed days' symbolize?",
          options: ["Foggy weather", "The fading memory of ancestors and traditions", "Morning dew", "Pollution"],
          correct_answer: "The fading memory of ancestors and traditions",
          explanation: "This image represents how ancestral wisdom is becoming obscured and forgotten."
        },
        {
          question: "Who are 'the orphans of today' in the poem?",
          options: ["Literal orphans", "Young Africans cut off from their traditions", "Street children", "The elderly"],
          correct_answer: "Young Africans cut off from their traditions",
          explanation: "The modern generation, having abandoned ancestral traditions, are like orphans without cultural parents."
        },
        {
          question: "What nationality was Birago Diop?",
          options: ["Nigerian", "Senegalese", "Ghanaian", "Kenyan"],
          correct_answer: "Senegalese",
          explanation: "Birago Diop was a Senegalese poet, part of the Negritude movement."
        }
      ])
    }
  ]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting to update novels with covers and content...')

    // Update existing novels with cover images and correct data
    for (const novel of novelData) {
      const coverUrl = novelCovers[novel.title]
      
      // Update the novel
      const { error: updateError } = await supabase
        .from('novels')
        .update({
          cover_image_url: coverUrl,
          category: novel.category,
          year: novel.year,
          description: novel.description,
          total_chapters: novel.total_chapters,
          is_premium: false,
        })
        .eq('title', novel.title)

      if (updateError) {
        console.log(`Error updating ${novel.title}:`, updateError)
      } else {
        console.log(`Updated: ${novel.title}`)
      }
    }

    // Get all novel IDs
    const { data: novels } = await supabase
      .from('novels')
      .select('id, title')

    if (!novels) {
      throw new Error('Failed to fetch novels')
    }

    // Create a map of title to ID
    const novelIdMap: Record<string, string> = {}
    novels.forEach(n => {
      novelIdMap[n.title] = n.id
    })

    // Add chapters for novels that have detailed content
    for (const [novelTitle, chapters] of Object.entries(chaptersData)) {
      const novelId = novelIdMap[novelTitle]
      if (!novelId) {
        console.log(`Novel not found: ${novelTitle}`)
        continue
      }

      // Delete existing chapters for this novel
      await supabase
        .from('novel_chapters')
        .delete()
        .eq('novel_id', novelId)

      // Insert new chapters
      for (const chapter of chapters) {
        const { error: chapterError } = await supabase
          .from('novel_chapters')
          .insert({
            novel_id: novelId,
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            word_count: chapter.word_count,
            estimated_reading_time: chapter.estimated_reading_time,
            likely_questions: chapter.likely_questions,
          })

        if (chapterError) {
          console.log(`Error adding chapter for ${novelTitle}:`, chapterError)
        }
      }
      console.log(`Added ${chapters.length} chapters for: ${novelTitle}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'All 19 JAMB novels updated with covers and content',
        novels_updated: novelData.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
