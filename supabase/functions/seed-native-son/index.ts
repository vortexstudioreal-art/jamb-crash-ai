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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: novel } = await supabase
      .from('novels')
      .select('id')
      .eq('title', 'Native Son')
      .single();

    if (!novel) {
      return new Response(JSON.stringify({ error: 'Native Son not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const chapters = [
      {
        chapter_number: 1,
        title: "Book One: Fear - The Awakening",
        content: `Book One introduces Bigger Thomas and the overwhelming fear that defines his existence.

**The Opening Scene**
The novel opens dramatically in a one-room apartment on Chicago's South Side where the Thomas family lives. Bigger wakes to the sound of an alarm clock.

**The Rat Scene**
A powerful symbolic scene occurs when a huge rat appears in the apartment:
- Bigger kills the rat after a tense chase
- The rat symbolizes how Black Americans are treated - trapped and hunted
- It foreshadows Bigger's own fate
- The family's terror mirrors the fear that pervades their lives

**The Thomas Family**
We meet Bigger's family:
- Ma Thomas - Hardworking mother who relies on her faith
- Vera - Younger sister, represents innocence
- Buddy - Younger brother who admires Bigger
- They live in extreme poverty in a cramped apartment

**Bigger's Character**
Bigger is twenty years old and:
- Full of suppressed rage
- Feels trapped by his circumstances
- Dreams of flying airplanes but knows it's impossible for him
- Resents his powerlessness

**The South Side Setting**
Wright describes the Black ghetto:
- Overcrowded conditions
- Discrimination in housing
- Limited opportunities
- Constant surveillance by white power structures

**Key Themes Introduced:**
- Racial oppression and its psychological effects
- Fear as a constant companion
- The trap of poverty
- Limited horizons for Black Americans`,
        likely_questions: [
          {
            question: "What does the rat in the opening scene symbolize?",
            options: ["Good luck", "How Black Americans are treated - trapped and hunted", "Bigger's dream", "Family unity"],
            correct_answer: 1,
            explanation: "The rat symbolizes how Black Americans are treated by society - trapped, hunted, and killed - foreshadowing Bigger's fate."
          },
          {
            question: "Where is 'Native Son' primarily set?",
            options: ["Mississippi", "Chicago's South Side", "New York's Harlem", "Los Angeles"],
            correct_answer: 1,
            explanation: "The novel is set in Chicago's South Side, in the Black ghetto during the 1930s."
          }
        ]
      },
      {
        chapter_number: 2,
        title: "Book One: Fear - The Gang",
        content: `This chapter introduces Bigger's social world and his failed robbery plan.

**The Pool Hall**
Bigger spends time at Doc's pool hall with his gang:
- Gus - Friend whom Bigger both relies on and bullies
- G.H. - Another gang member
- Jack - Part of the group

**The Robbery Plan**
The gang plans to rob Blum's delicatessen:
- It's owned by a white man, which makes it more dangerous
- Bigger has never robbed a white establishment before
- The increased risk creates extreme tension

**Bigger's Internal Conflict**
Bigger is terrified of the robbery but:
- Cannot admit his fear to his friends
- His fear transforms into violence against Gus
- He attacks Gus violently to avoid the robbery
- This displacement of fear into violence is a pattern

**The Movie Theater**
Bigger and Jack go to the movies:
- They see a film about wealthy white people
- Another film shows "savage" Africans
- The movies reveal how media shapes racial perceptions
- Bigger is both fascinated and disturbed by white life

**The Job Offer**
Bigger has been referred for a job:
- Working as a chauffeur for the Dalton family
- His mother pressures him to take it
- The family will lose welfare if he doesn't
- He dreads entering the white world

**Key Themes:**
- Masculinity and fear
- Media and racial stereotypes  
- Violence as displacement of fear
- Economic pressure and survival`,
        likely_questions: [
          {
            question: "Why does Bigger attack Gus before the robbery?",
            options: ["Gus insulted him", "To displace his own fear about robbing a white-owned store", "Gus attacked him first", "They were playing"],
            correct_answer: 1,
            explanation: "Bigger attacks Gus to avoid the robbery he's terrified of, displacing his fear into violence - a pattern throughout the novel."
          }
        ]
      },
      {
        chapter_number: 3,
        title: "Book One: Fear - The Dalton House",
        content: `Bigger enters the white world of the Dalton family.

**Arriving at the Daltons**
Bigger approaches the Dalton mansion on Drexel Boulevard:
- The contrast to his world is stark
- He feels deeply uncomfortable
- He doesn't know how to act
- Everything about the house intimidates him

**Mr. Henry Dalton**
The owner is a wealthy real estate magnate:
- He owns the building where Bigger's family lives
- He considers himself a philanthropist
- He gives money to Black causes
- Ironically, he profits from the slum housing

**Mrs. Dalton**
The blind wife:
- Her blindness symbolizes white America's inability to see Black humanity
- She is well-meaning but oblivious
- She questions Bigger in ways that feel intrusive

**Mary Dalton**
The Daltons' daughter:
- Young, liberal, idealistic
- Involved with Communist groups
- Treats Bigger with what she thinks is equality
- Her approach makes him more uncomfortable, not less

**Peggy the Housekeeper**
The Irish housekeeper:
- Also marginalized but higher in hierarchy than Bigger
- Explains the household to Bigger
- Represents layers of social hierarchy

**The Room**
Bigger is given a room in the house:
- Better than anything he's had
- But he feels like a trespasser
- He cannot relax or feel at home

**Key Themes:**
- White liberalism and its limitations
- The invisibility of Black humanity
- Class distinctions
- The psychology of oppression`,
        likely_questions: [
          {
            question: "What does Mrs. Dalton's blindness symbolize?",
            options: ["Physical disability only", "White America's inability to truly see Black humanity", "Spiritual insight", "Medical science"],
            correct_answer: 1,
            explanation: "Mrs. Dalton's blindness symbolizes how white America, despite good intentions, cannot truly see Black people as full human beings."
          },
          {
            question: "What is ironic about Mr. Dalton's philanthropy?",
            options: ["He gives too much money away", "He donates to Black causes while profiting from slum housing", "He doesn't donate enough", "His philanthropy is very effective"],
            correct_answer: 1,
            explanation: "Mr. Dalton's philanthropy is ironic because he donates to Black causes while simultaneously owning the slum buildings that trap Black families in poverty."
          }
        ]
      },
      {
        chapter_number: 4,
        title: "Book One: Fear - Mary and Jan",
        content: `Bigger's first night driving Mary leads to a fateful evening.

**The First Assignment**
Bigger's job is to drive Mary to a university lecture:
- She has different plans
- She directs him to pick up Jan Erlone
- Jan is her boyfriend and a Communist Party organizer

**Jan Erlone**
Jan's character:
- Genuine in his desire for racial equality
- But blind to Bigger's discomfort
- Insists on treating Bigger as an equal
- This makes Bigger more uncomfortable, not less

**The Uncomfortable Evening**
Jan and Mary want to experience Black life:
- They make Bigger sit with them in the front seat
- They insist on going to a Black restaurant
- They order Black food and drink
- Their condescension disguised as equality torments Bigger

**Ernie's Kitchen Shack**
At the South Side restaurant:
- Bigger is humiliated in front of his own people
- Jan and Mary are oblivious
- They drink heavily
- They ask Bigger about his life in invasive ways

**The Return Home**
Driving back, Mary is very drunk:
- Jan gets out to take a streetcar
- Bigger drives Mary home
- She cannot walk on her own
- Bigger has to help her to her room

**The Danger**
Bigger is alone with a drunk white woman:
- Any accusation would destroy him
- The danger is extreme
- His fear is at its highest

**Key Themes:**
- Well-meaning racism
- The impossibility of genuine cross-racial contact
- Sexual taboos
- Building terror`,
        likely_questions: [
          {
            question: "Why does Bigger feel uncomfortable when Jan treats him as an equal?",
            options: ["Because Jan is mean to him", "Because forced equality ignores the real power differences and feels condescending", "Because Bigger is shy", "Because Jan speaks another language"],
            correct_answer: 1,
            explanation: "Jan's forced equality ignores the real power differences and the danger Bigger faces as a Black man, making the gestures feel condescending rather than liberating."
          }
        ]
      },
      {
        chapter_number: 5,
        title: "Book One: Fear - The Killing",
        content: `The climactic scene of Book One - the accidental death of Mary Dalton.

**In Mary's Room**
Bigger helps the drunk Mary to her bedroom:
- She is barely conscious
- She clings to him inappropriately
- He is terrified of being discovered
- Every moment increases his danger

**Mrs. Dalton Enters**
The blind Mrs. Dalton comes to check on her daughter:
- Bigger freezes in terror
- If Mary speaks, he will be accused of rape
- His fear is absolute and overwhelming
- He covers Mary's face with a pillow to keep her quiet

**The Accidental Death**
In his panic:
- Bigger smothers Mary without realizing
- When Mrs. Dalton leaves, he discovers Mary is dead
- He has killed her accidentally
- But no one will believe a Black man's explanation

**The Decision**
Bigger must dispose of the body:
- He puts Mary in a trunk
- He takes her to the basement
- He places her in the furnace
- He beheads her to fit her in the furnace

**The Aftermath**
After the disposal:
- Bigger feels a strange sense of power
- For the first time, he has acted
- He has done something significant
- His fear transforms into something else

**The Psychological Shift**
Something changes in Bigger:
- The passive fear becomes active energy
- He feels he has created something new
- He knows he is doomed but feels alive
- The killing paradoxically liberates him temporarily

**Key Themes:**
- Violence born of fear
- The death of innocence
- Transformation through act
- The impossibility of explanation`,
        likely_questions: [
          {
            question: "How does Mary Dalton die?",
            options: ["She was murdered intentionally", "Bigger accidentally smothers her while trying to keep her quiet when Mrs. Dalton enters", "She had a heart attack", "She fell down the stairs"],
            correct_answer: 1,
            explanation: "Mary's death is accidental - Bigger smothers her with a pillow trying to keep her quiet so Mrs. Dalton won't discover him in her room."
          },
          {
            question: "Why does Bigger feel a sense of power after the killing?",
            options: ["He enjoys violence", "Because for the first time he has acted decisively instead of being passive", "He becomes rich", "He escapes the house"],
            correct_answer: 1,
            explanation: "Despite the horror, Bigger feels a sense of power because for the first time he has taken decisive action rather than being a passive victim of his circumstances."
          }
        ]
      },
      {
        chapter_number: 6,
        title: "Book Two: Flight - The Morning After",
        content: `Book Two opens with Bigger's psychological state after the killing.

**A New Bigger**
Bigger wakes feeling different:
- Strangely calm despite what happened
- He sees the world differently
- He feels he has crossed a line
- He can never go back

**Covering His Tracks**
Bigger creates a story:
- He claims Mary left with Jan
- He implicates Jan in her disappearance
- He plays the ignorant servant role
- His lies are deliberate and strategic

**The Ransom Note**
Bigger has an idea:
- He will write a ransom note
- He will demand money from the Daltons
- He plans to deflect suspicion to Communists
- He signs it "Red" to implicate Jan

**Bessie Mears**
Bigger visits his girlfriend Bessie:
- She is suspicious of his new behavior
- He tells her about his plan
- She is frightened and reluctant
- He forces her into complicity

**The Investigation Begins**
The Daltons notice Mary is missing:
- They call the police
- Bigger maintains his cover
- The investigation starts to circle

**Media Frenzy**
The newspapers pick up the story:
- A wealthy white girl missing
- Communists suspected
- The story becomes sensational
- Racial stereotypes fill the coverage

**Key Themes:**
- Performance and deception
- The weight of complicity
- Media and racial narratives
- Flight from consequence`,
        likely_questions: [
          {
            question: "Who does Bigger try to implicate in Mary's disappearance?",
            options: ["The Daltons", "Jan Erlone and the Communist Party", "Bessie", "The police"],
            correct_answer: 1,
            explanation: "Bigger writes a ransom note signed 'Red' to implicate Jan and the Communists in Mary's disappearance."
          }
        ]
      },
      {
        chapter_number: 7,
        title: "Book Two: Flight - The Discovery",
        content: `The investigation closes in on Bigger.

**The Furnace**
A newspaper reporter discovers:
- Mary's bones in the furnace ashes
- Her earring among the remains
- The truth cannot be hidden
- Bigger knows he is trapped

**The Chase Begins**
News spreads that Mary is dead:
- Bigger flees the Dalton house
- The police search begins
- The manhunt is massive
- All of Chicago hunts for Bigger

**Bessie's Fate**
Bigger forces Bessie to flee with him:
- She knows too much
- He cannot trust her silence
- He realizes she is a liability
- In a brutal scene, he kills her with a brick

**The Second Killing**
Unlike Mary's death:
- Bessie's murder is deliberate
- Bigger is cold and calculating
- He throws her body down an airshaft
- This killing shows the dehumanization of desperation

**The Manhunt**
Eight thousand police search Chicago:
- The Black Belt is locked down
- Other Black men are beaten and arrested
- The whole community suffers
- Bigger moves through the shadows

**Capture on the Rooftop**
Bigger is finally caught:
- Cornered on a water tower
- Blasted down by fire hoses
- Captured by the mob
- The hunt is over

**Key Themes:**
- The inevitability of capture
- Violence begets violence
- Collective punishment
- The dehumanization of survival`,
        likely_questions: [
          {
            question: "How is Bessie's death different from Mary's?",
            options: ["It was an accident like Mary's", "It was deliberate and calculated, unlike Mary's accidental death", "She died of natural causes", "She was killed by police"],
            correct_answer: 1,
            explanation: "Unlike Mary's accidental death, Bigger deliberately and coldly murders Bessie to prevent her from talking, showing his moral deterioration."
          }
        ]
      },
      {
        chapter_number: 8,
        title: "Book Three: Fate - The Trial Begins",
        content: `Book Three focuses on Bigger's trial and the exploration of meaning.

**In Custody**
Bigger is held in jail:
- He is beaten by police
- He is paraded before the press
- He is treated as a monster
- The legal system takes over

**Boris Max**
A Communist lawyer agrees to defend Bigger:
- Max sees Bigger's case as emblematic
- He wants to argue the systemic causes
- He genuinely tries to understand Bigger
- He becomes the only one who really listens

**The Inquest**
Before the trial:
- Jan testifies he was not involved
- Despite being wrongly accused, he does not hate Bigger
- He offers sympathy, not vengeance
- This challenges Bigger's worldview

**Bigger Speaks**
For the first time, Bigger talks about his life:
- His fears and frustrations
- His sense of being trapped
- His feelings about the killings
- His search for meaning in what he did

**The Mob Mentality**
Outside the courthouse:
- Mobs demand Bigger's death
- Racial hatred is at fever pitch
- Black neighborhoods are attacked
- The community pays for one man's act

**The State's Case**
The prosecution portrays Bigger as:
- A savage monster
- Inherently criminal
- Sexually dangerous
- Without humanity

**Key Themes:**
- Justice vs. vengeance
- Systemic explanations for crime
- Humanity in the accused
- Collective racial hatred`,
        likely_questions: [
          {
            question: "Who is Boris Max?",
            options: ["The prosecutor", "A Communist lawyer who defends Bigger", "A journalist", "A police officer"],
            correct_answer: 1,
            explanation: "Boris Max is a Communist lawyer who agrees to defend Bigger, seeing his case as emblematic of systemic racism."
          }
        ]
      },
      {
        chapter_number: 9,
        title: "Book Three: Fate - Max's Defense",
        content: `Max delivers his famous courtroom speech.

**The Defense Strategy**
Max does not claim Bigger is innocent:
- He argues for understanding, not acquittal
- He puts American society on trial
- He traces the causes of Bigger's actions
- He asks for mercy, not freedom

**Max's Speech**
The courtroom address is the ideological heart of the novel:

On Fear:
"This boy represents but a tiny aspect of a problem whose reality sprawls over a third of this nation... Kill him and swell the tide of pent-up lava that will some day break loose."

On Creation:
"He was not born with this hate, this fear. He was conditioned to feel this way... The hate and fear which we have inspired in him, woven by our civilization into the very structure of his consciousness."

On America:
"The consciousness of Bigger Thomas and millions of others more or less like him, white and Black, according to the weight of the pressure we have put upon them, form the quicksands upon which the foundations of our civilization rest."

**The Argument**
Max argues that:
- Bigger was created by an oppressive system
- He acted out what was created in him
- To execute him solves nothing
- America must address its disease

**The Response**
The prosecutor and public:
- Reject Max's arguments
- Demand death
- Refuse to see Bigger as human
- Uphold the racial order

**Key Themes:**
- Systemic vs. individual responsibility
- The creation of crime
- Speech and persuasion
- The limits of understanding`,
        likely_questions: [
          {
            question: "What is Max's main argument in his defense of Bigger?",
            options: ["That Bigger didn't commit the crimes", "That American society created Bigger's hate and fear through oppression", "That Bigger is mentally ill", "That someone else did it"],
            correct_answer: 1,
            explanation: "Max argues that Bigger's hate, fear, and violence were created by an oppressive American society, and that killing him won't address the root causes."
          }
        ]
      },
      {
        chapter_number: 10,
        title: "Book Three: Fate - The Sentence",
        content: `The conclusion of the trial and Bigger's final moments.

**The Verdict**
The judge delivers the sentence:
- Guilty of murder
- Death by electrocution
- No consideration of mitigating factors
- The state's vengeance is satisfied

**Bigger's Family**
Ma Thomas, Vera, and Buddy visit:
- They are shattered by his fate
- Ma begs him to pray
- The scene is heartbreaking
- They cannot bridge the distance

**Jan's Visit**
Jan comes to see Bigger:
- He has forgiven Bigger for framing him
- He tries to explain the Communist vision
- He treats Bigger as fully human
- This touches something in Bigger

**Max's Final Visit**
The lawyer comes to say goodbye:
- Bigger asks Max difficult questions
- "What I killed for, I am!"
- Max is disturbed by Bigger's claims
- Their final exchange is haunting

**Bigger's Realization**
In his last moments, Bigger reflects:
- He accepts responsibility for his actions
- He also accepts that he was shaped by forces
- He finds a kind of peace
- He has finally become visible, even if only in death

**The Ending**
Bigger is led to his execution:
- He has achieved a tragic self-understanding
- He has been seen and heard for the first time
- His life was payment for visibility
- America's native son goes to his death

**Literary Significance:**
"Native Son" by Richard Wright:
- Was groundbreaking in its portrayal of Black American life
- Challenged both white racism and Black accommodation
- Remains controversial and powerful
- Is considered one of the most important American novels

**Key Themes:**
- Self-creation through action
- Visibility in death
- The cost of being seen
- Tragic acceptance`,
        likely_questions: [
          {
            question: "What does Bigger mean when he says 'What I killed for, I am'?",
            options: ["He enjoys killing", "His violent acts, though wrong, were the only way he could assert his existence in a society that denied his humanity", "He wants to kill again", "He is joking"],
            correct_answer: 1,
            explanation: "Bigger's statement means that his violent acts, though terrible, were the only way he could assert his existence and identity in a society that denied his humanity."
          },
          {
            question: "What is Bigger's sentence?",
            options: ["Life in prison", "Acquittal", "Death by electrocution", "Deportation"],
            correct_answer: 2,
            explanation: "Bigger is sentenced to death by electrocution, and the novel ends with him being led to his execution."
          },
          {
            question: "Who wrote 'Native Son'?",
            options: ["James Baldwin", "Richard Wright", "Ralph Ellison", "Langston Hughes"],
            correct_answer: 1,
            explanation: "Richard Wright wrote 'Native Son,' published in 1940, which became a landmark in American literature."
          }
        ]
      }
    ];

    for (const chapter of chapters) {
      const { data: existing } = await supabase
        .from('novel_chapters')
        .select('id')
        .eq('novel_id', novel.id)
        .eq('chapter_number', chapter.chapter_number)
        .maybeSingle();

      if (!existing) {
        await supabase.from('novel_chapters').insert({
          novel_id: novel.id,
          chapter_number: chapter.chapter_number,
          title: chapter.title,
          content: chapter.content,
          likely_questions: chapter.likely_questions,
          word_count: chapter.content.split(/\s+/).length,
          estimated_reading_time: Math.ceil(chapter.content.split(/\s+/).length / 200)
        });
      }
    }
    
    await supabase.from('novels').update({ total_chapters: 10 }).eq('id', novel.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Native Son chapters seeded successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Error seeding Native Son:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
