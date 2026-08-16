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

    // ==================== THE LION AND THE JEWEL ====================
    const lionJewelChapters = [
      {
        chapter_number: 2,
        title: "Noon",
        content: `The Noon section shows the growing conflict as Baroka devises a cunning plan.

**The Bale's Strategy**
Baroka, having heard of Sidi's newfound fame through the magazine, devises a plan. He sends his head wife, Sadiku, to invite Sidi to become his newest wife.

**Sadiku's Mission**
Sadiku, loyal to Baroka, approaches Sidi with the proposal. She boasts about being the "head of the harem" and describes the privileges of being the Bale's wife.

**Sidi's Refusal**
Sidi, drunk on her new celebrity status, arrogantly refuses. She mocks Baroka's age and suggests she is too famous and beautiful for an old man like him.

**The Secret Revealed**
In a dramatic twist, Sadiku reveals to Sidi that Baroka has confided in her about his impotence. She dances in celebration, believing that the "Lion" has lost his power.

**Sidi's Curiosity**
Rather than being deterred, this news makes Sidi curious. She decides to visit Baroka, believing she can safely mock and humiliate him without any risk.

**Key Themes:**
- Pride and Vanity: Sidi's inflated ego due to fame
- Cunning vs. Naivety: Baroka's strategic thinking
- Power Dynamics: The contest between youth and experience
- Gender Relations: Women's roles in traditional society`,
        likely_questions: [
          {
            question: "Why does Sidi decide to visit Baroka in the Noon section?",
            options: ["To accept his marriage proposal", "Because she believes he is impotent and wants to mock him", "To discuss village matters", "Because Lakunle told her to"],
            correct_answer: 1,
            explanation: "Sidi decides to visit Baroka after learning of his supposed impotence, believing she can safely humiliate him without any consequences."
          },
          {
            question: "What role does Sadiku play in Baroka's plan?",
            options: ["She opposes Baroka's wishes", "She acts as a messenger and unwitting accomplice", "She helps Lakunle", "She refuses to cooperate"],
            correct_answer: 1,
            explanation: "Sadiku serves as Baroka's messenger and, unknowingly, helps him execute his cunning plan by revealing his 'secret' to Sidi."
          },
          {
            question: "What does Sadiku's celebration dance symbolize?",
            options: ["Her loyalty to Baroka", "Her belief that she has witnessed the end of male dominance", "Her joy at Sidi's refusal", "Her preparation for a festival"],
            correct_answer: 1,
            explanation: "Sadiku's triumphant dance symbolizes what she perceives as the fall of male supremacy, as she believes Baroka has lost his virility."
          }
        ]
      },
      {
        chapter_number: 3,
        title: "Night",
        content: `The Night section brings the play to its dramatic conclusion.

**The Seduction**
Sidi arrives at Baroka's palace, confident in her plan to humiliate him. However, Baroka proves to be a master manipulator. Through a combination of flattery, philosophy, and cunning, he wins Sidi's admiration.

**Baroka's Wisdom**
Baroka presents himself not as an opponent of progress but as someone who understands how to blend tradition with modernity. He shows Sidi his private stamp machine and speaks of bringing a postal service to Ilujinle.

**The Trap Closes**
In a pivotal moment, Baroka proves that the rumor of his impotence was false – it was a trap designed by him to bring Sidi to his palace. By the end of the night, Sidi has been seduced.

**Morning Revelation**
The next morning, a distraught Sidi emerges. She realizes she has been outsmarted. When Lakunle offers to still marry her (without the bride-price since she is no longer a virgin), she refuses.

**Sidi's Choice**
In the final twist, Sidi chooses to marry Baroka. She has come to admire his strength, cunning, and the power he represents. She demands that the full bride-price be paid.

**The Procession**
The play ends with a wedding procession to Baroka's palace, with Lakunle grudgingly following behind.

**Major Themes:**
- The victory of tradition over superficial modernity
- True wisdom versus educated foolishness
- The complexity of female agency and choice
- The enduring power of experience over youth

**Symbolism:**
- The stamp machine: Progress controlled by tradition
- The wrestling contest: Baroka's continued strength
- Night setting: Hidden truths and seduction`,
        likely_questions: [
          {
            question: "What was Baroka's revelation about his impotence?",
            options: ["It was true and permanent", "It was a clever lie to lure Sidi", "It was a temporary condition", "Sadiku made it up"],
            correct_answer: 1,
            explanation: "The impotence was a deliberate lie crafted by Baroka to manipulate Sidi into visiting him, demonstrating his cunning nature."
          },
          {
            question: "Why does Sidi ultimately choose to marry Baroka instead of Lakunle?",
            options: ["Because Lakunle refused to pay bride-price", "Because she admires Baroka's cunning, strength, and traditional values", "Because her parents forced her", "Because Baroka threatened her"],
            correct_answer: 1,
            explanation: "Sidi chooses Baroka because she comes to admire his wisdom, strength, and the way he blends tradition with modernity, seeing him as a more capable partner."
          },
          {
            question: "What does the stamp machine in Baroka's palace represent?",
            options: ["Complete rejection of progress", "Baroka's ability to control and adapt to progress", "Lakunle's influence on the village", "Colonial oppression"],
            correct_answer: 1,
            explanation: "The stamp machine symbolizes Baroka's ability to embrace useful aspects of modernity while maintaining control and traditional authority."
          },
          {
            question: "How does the play end?",
            options: ["Sidi marries Lakunle", "Sidi remains unmarried", "Sidi marries Baroka with full bride-price", "The village rejects both suitors"],
            correct_answer: 2,
            explanation: "The play ends with Sidi choosing to marry Baroka and insisting on the full bride-price, symbolizing her embrace of traditional values."
          }
        ]
      }
    ];

    // Get Lion and the Jewel novel ID
    const { data: lionNovel } = await supabase
      .from('novels')
      .select('id')
      .eq('title', 'The Lion and the Jewel')
      .single();

    if (lionNovel) {
      for (const chapter of lionJewelChapters) {
        const { data: existing } = await supabase
          .from('novel_chapters')
          .select('id')
          .eq('novel_id', lionNovel.id)
          .eq('chapter_number', chapter.chapter_number)
          .maybeSingle();

        if (!existing) {
          await supabase.from('novel_chapters').insert({
            novel_id: lionNovel.id,
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            likely_questions: chapter.likely_questions,
            word_count: chapter.content.split(/\s+/).length,
            estimated_reading_time: Math.ceil(chapter.content.split(/\s+/).length / 200)
          });
        }
      }
      await supabase.from('novels').update({ total_chapters: 3 }).eq('id', lionNovel.id);
    }

    // ==================== HARVEST OF CORRUPTION ====================
    const harvestChapters = [
      {
        chapter_number: 1,
        title: "Act One - The Innocent Beginning",
        content: `Act One introduces the main characters and sets up the central conflict.

**Setting the Scene**
The play opens in the modest home of Chief Haladu Ade-Amaka, a traditional chief who values honesty and integrity. His daughter, Aloho, is about to complete her National Youth Service.

**Character Introduction - Aloho**
Aloho is portrayed as a young, idealistic woman who has been raised with strong moral values. She represents the hope of the younger generation – educated, principled, and eager to contribute positively to society.

**Character Introduction - Chief Haladu**
Chief Haladu is a man of traditional values who has remained uncorrupted despite the prevalent moral decay in society. He serves as a moral compass in the play.

**The Job Offer**
The central conflict begins when Aloho receives a job offer from Ogeyi, a successful businesswoman. However, the conditions of this offer hint at moral compromise.

**Ogeyi's Visit**
Madam Ogeyi visits the Ade-Amaka household. She is wealthy, influential, and represents the corrupt elite who have prospered through questionable means.

**The Proposal**
Ogeyi offers to help Aloho secure a lucrative government job, but the undertones suggest that this help comes with strings attached.

**Key Themes Introduced:**
- Integrity vs. Corruption
- Generational values
- The role of women in society
- Traditional vs. modern values`,
        likely_questions: [
          {
            question: "What does Chief Haladu represent in the play?",
            options: ["Corruption in society", "Moral integrity and traditional values", "Western influence", "Political power"],
            correct_answer: 1,
            explanation: "Chief Haladu represents moral integrity and traditional values, serving as a moral compass against the corruption prevalent in society."
          },
          {
            question: "What is Aloho doing at the beginning of the play?",
            options: ["Working as a businesswoman", "Completing her National Youth Service", "Getting married", "Running for political office"],
            correct_answer: 1,
            explanation: "Aloho is completing her National Youth Service (NYSC), which positions her as a young graduate entering the workforce."
          }
        ]
      },
      {
        chapter_number: 2,
        title: "Act Two - The Temptation",
        content: `Act Two develops the conflict as the temptation becomes more explicit.

**The Corrupt System Unveiled**
This act exposes the depth of corruption in Nigerian society. We see how positions are bought and sold, how merit is ignored, and how those who refuse to participate are marginalized.

**Justice Odili**
Justice Odili is introduced as a corrupt judge who is part of Ogeyi's network. His character demonstrates how corruption has infiltrated even the judiciary.

**The Pressure Mounts**
Aloho finds herself under increasing pressure. Her unemployment and the family's financial struggles make the corrupt offer more tempting.

**Aloho's Dilemma**
The core of this act is Aloho's internal struggle. She must choose between:
- Accepting help that would compromise her values
- Remaining principled but potentially unsuccessful
- Finding another way forward

**The Sexual Harassment Element**
The play hints at the sexual exploitation of women as part of the corrupt system. Women seeking positions are often expected to provide sexual favors.

**Key Themes:**
- Systemic corruption in institutions
- The vulnerability of job seekers
- Gender exploitation
- The cost of integrity`,
        likely_questions: [
          {
            question: "What does Justice Odili represent in the play?",
            options: ["Justice and fairness", "Corruption in the judiciary", "Religious authority", "Youth empowerment"],
            correct_answer: 1,
            explanation: "Justice Odili represents the corruption that has infiltrated even the judiciary, showing how pervasive corruption is in society."
          },
          {
            question: "What is Aloho's main dilemma in Act Two?",
            options: ["Choosing between suitors", "Choosing between integrity and corrupt success", "Deciding whether to leave the country", "Choosing a career path"],
            correct_answer: 1,
            explanation: "Aloho's central dilemma is whether to maintain her integrity or accept corrupt help to get ahead in life."
          }
        ]
      },
      {
        chapter_number: 3,
        title: "Act Three - The Fall",
        content: `Act Three shows the consequences of choices made.

**Aloho's Decision**
Faced with mounting pressure, Aloho makes a fateful choice. The specifics of her decision represent the moment when idealism meets harsh reality.

**The Consequences**
The act shows the immediate consequences of engaging with the corrupt system:
- Loss of innocence
- Moral degradation
- The slippery slope of compromise

**Chief Haladu's Reaction**
The father's response to his daughter's situation represents the heartbreak of watching the next generation compromise their values.

**The Network Exposed**
More details of the corrupt network emerge, showing how politicians, judges, businesspeople, and civil servants are all interconnected in a web of corruption.

**Character Transformation**
We see how involvement in corruption changes people:
- The hardening of conscience
- The justification of wrong actions
- The loss of moral sensitivity

**Key Themes:**
- The corrupting influence of power
- Parental disappointment
- Moral compromise
- The cycle of corruption`,
        likely_questions: [
          {
            question: "What happens to Aloho's character in Act Three?",
            options: ["She becomes more principled", "She begins to compromise her values", "She leaves the country", "She becomes a politician"],
            correct_answer: 1,
            explanation: "In Act Three, Aloho begins to compromise her values under pressure, showing the corrupting influence of the system."
          },
          {
            question: "How does Chief Haladu respond to the developments?",
            options: ["With joy and approval", "With heartbreak and disappointment", "With indifference", "By joining the corruption"],
            correct_answer: 1,
            explanation: "Chief Haladu responds with heartbreak and disappointment as he watches his daughter compromise her values."
          }
        ]
      },
      {
        chapter_number: 4,
        title: "Act Four - The Reckoning",
        content: `Act Four brings the play to its conclusion with themes of justice and redemption.

**The Unraveling**
The corrupt network begins to unravel. Internal conflicts, greed, and betrayal cause cracks in the system.

**Justice Served?**
The play explores whether true justice can be served in a corrupt society. Some characters face consequences while others escape.

**Aloho's Redemption Arc**
The climax focuses on whether Aloho can redeem herself:
- Recognition of wrong choices
- Attempt at restitution
- Facing consequences

**Chief Haladu's Final Words**
The father delivers powerful speeches about integrity, the future of the nation, and the choices young people must make.

**The Message**
The play ends with a clear message about:
- The personal cost of corruption
- The need for systemic change
- The role of youth in reform
- Hope for a better future

**Final Themes:**
- Redemption and forgiveness
- National renewal
- Personal responsibility
- Hope vs. despair

**Literary Significance:**
"Harvest of Corruption" by Frank Ogodo Ogbeche is a powerful critique of Nigerian society. It uses drama to:
- Expose systemic corruption
- Challenge audiences to examine their own choices
- Inspire change and reform
- Preserve moral values in society`,
        likely_questions: [
          {
            question: "What is the main message of 'Harvest of Corruption'?",
            options: ["Corruption is acceptable if everyone does it", "Corruption has devastating personal and national costs", "Traditional values are outdated", "Youth should accept the system as it is"],
            correct_answer: 1,
            explanation: "The play's main message is that corruption has devastating costs both personally and nationally, and young people must resist it."
          },
          {
            question: "What does the title 'Harvest of Corruption' suggest?",
            options: ["Agricultural practices in Nigeria", "The fruits/consequences of corrupt actions", "A farming community's story", "Economic growth"],
            correct_answer: 1,
            explanation: "The title suggests that corruption produces a 'harvest' – the inevitable consequences of corrupt actions that society must reap."
          },
          {
            question: "Who wrote 'Harvest of Corruption'?",
            options: ["Wole Soyinka", "Chinua Achebe", "Frank Ogodo Ogbeche", "Ama Ata Aidoo"],
            correct_answer: 2,
            explanation: "Frank Ogodo Ogbeche is the author of 'Harvest of Corruption.'"
          }
        ]
      }
    ];

    // Get Harvest of Corruption novel ID
    const { data: harvestNovel } = await supabase
      .from('novels')
      .select('id')
      .eq('title', 'Harvest of Corruption')
      .single();

    if (harvestNovel) {
      for (const chapter of harvestChapters) {
        const { data: existing } = await supabase
          .from('novel_chapters')
          .select('id')
          .eq('novel_id', harvestNovel.id)
          .eq('chapter_number', chapter.chapter_number)
          .maybeSingle();

        if (!existing) {
          await supabase.from('novel_chapters').insert({
            novel_id: harvestNovel.id,
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            likely_questions: chapter.likely_questions,
            word_count: chapter.content.split(/\s+/).length,
            estimated_reading_time: Math.ceil(chapter.content.split(/\s+/).length / 200)
          });
        }
      }
      await supabase.from('novels').update({ total_chapters: 4 }).eq('id', harvestNovel.id);
    }

    // ==================== FACELESS (First batch) ====================
    const facelessChapters1 = [
      {
        chapter_number: 1,
        title: "Street Life",
        content: `Chapter One introduces us to the harsh realities of street life in Accra, Ghana.

**Opening Scene**
The novel opens on the streets of Sodom and Gomorrah, an infamous slum in Accra. Here, we meet Fofo, a fourteen-year-old street girl who has been forced to fend for herself.

**Character Introduction - Fofo**
Fofo is portrayed as tough, street-smart, but also vulnerable. She has been living on the streets for a significant time, learning to survive in an unforgiving environment.

**The Street Children**
We are introduced to the community of street children:
- Children who have run away from abusive homes
- Orphans with nowhere to go
- Kids abandoned by their families
- Young people escaping various forms of exploitation

**Survival Tactics**
The chapter describes how street children survive:
- Scavenging for food
- Begging
- Petty theft
- Forming protective groups
- Finding shelter in abandoned structures

**The Dangers**
The streets are dangerous:
- Police harassment
- Sexual exploitation
- Drug abuse
- Violence from older street dwellers
- Disease and malnutrition

**Baby T**
We learn about Baby T (also called Odarley), a girl connected to Fofo's past who has gone missing.

**Key Themes:**
- Urban poverty and inequality
- Child neglect and abuse
- Survival and resilience
- Social invisibility of street children`,
        likely_questions: [
          {
            question: "Where is the novel 'Faceless' primarily set?",
            options: ["Lagos, Nigeria", "Accra, Ghana", "Nairobi, Kenya", "Dakar, Senegal"],
            correct_answer: 1,
            explanation: "'Faceless' is set in Accra, Ghana, particularly in the slum area known as Sodom and Gomorrah."
          },
          {
            question: "Who is the main protagonist of 'Faceless'?",
            options: ["Baby T", "Maa Tsuru", "Fofo", "Odarley"],
            correct_answer: 2,
            explanation: "Fofo, a fourteen-year-old street girl, is the main protagonist of the novel."
          },
          {
            question: "Who is Baby T in relation to Fofo?",
            options: ["Her best friend", "Her sister who has gone missing", "Her teacher", "A social worker"],
            correct_answer: 1,
            explanation: "Baby T (Odarley) is Fofo's sister who has gone missing from the streets."
          }
        ]
      },
      {
        chapter_number: 2,
        title: "Family History",
        content: `Chapter Two delves into Fofo's family background and how she ended up on the streets.

**Maa Tsuru - The Failed Mother**
We are introduced to Maa Tsuru, Fofo's biological mother. She represents the tragedy of women who fail their children:
- Multiple children with different men
- Economic desperation
- Emotional unavailability
- Inability to protect her children

**The Pattern of Abandonment**
The chapter reveals a pattern in Maa Tsuru's life:
- Relationships with men who don't stay
- Children she cannot care for
- Dependency on unreliable partners
- Repeated cycles of poverty

**Poison - The Abuser**
Poison is introduced as Maa Tsuru's current partner. He is:
- Abusive and violent
- A criminal figure
- Someone who exploits children
- Representative of predatory men

**Why Fofo Left Home**
We learn the specific reasons Fofo fled:
- Poison's abuse and inappropriate behavior
- Maa Tsuru's inability to protect her
- The unbearable home conditions
- Threats to her safety

**The Other Children**
Maa Tsuru's other children are mentioned:
- Baby T (Odarley) - Also on the streets
- Other siblings in various situations
- Children given away or abandoned

**Key Themes:**
- Cycle of poverty and abuse
- Failed parenthood
- Women's vulnerability
- Generational trauma`,
        likely_questions: [
          {
            question: "Who is Maa Tsuru in the novel?",
            options: ["A social worker", "Fofo's biological mother", "A street vendor", "A police officer"],
            correct_answer: 1,
            explanation: "Maa Tsuru is Fofo's biological mother who failed to protect her children."
          },
          {
            question: "Who is Poison in the novel?",
            options: ["Fofo's father", "Maa Tsuru's abusive partner", "A helpful neighbor", "A government official"],
            correct_answer: 1,
            explanation: "Poison is Maa Tsuru's violent and abusive partner who drove Fofo to leave home."
          },
          {
            question: "Why did Fofo run away from home?",
            options: ["To find better education", "Because of Poison's abuse and her mother's failure to protect her", "To join friends on the street", "She was sent away by her mother"],
            correct_answer: 1,
            explanation: "Fofo ran away because of Poison's abuse and her mother Maa Tsuru's inability to protect her."
          }
        ]
      },
      {
        chapter_number: 3,
        title: "The Search Begins",
        content: `Chapter Three focuses on Fofo's search for her missing sister, Baby T.

**Baby T's Disappearance**
Baby T has been missing from the streets. The other street children share what they know:
- When she was last seen
- Who she was with
- Rumors about what might have happened

**The Street Network**
Fofo uses the informal networks among street children:
- Information sharing
- Mutual protection agreements
- Territory knowledge
- Connections to older street dwellers

**Maami Broni**
We meet Maami Broni, an older woman who sometimes helps street children. She:
- Provides occasional food and shelter
- Offers motherly advice
- Has limited resources but a big heart
- Represents hope in a dark world

**The Clues**
Fofo begins to piece together clues:
- Baby T was seen with certain people
- There are rumors about trafficking
- The trail leads to dangerous individuals

**Growing Fears**
As Fofo investigates, she faces:
- Fear of what she might discover
- Danger from those involved in Baby T's disappearance
- The possibility that Baby T may be dead

**Key Themes:**
- Sibling love and loyalty
- Street child vulnerability
- Human trafficking hints
- Community among the marginalized`,
        likely_questions: [
          {
            question: "What is Fofo's main goal in Chapter Three?",
            options: ["Finding employment", "Searching for her missing sister Baby T", "Returning home to her mother", "Going to school"],
            correct_answer: 1,
            explanation: "Fofo's primary mission is to find her missing sister Baby T, who has disappeared from the streets."
          },
          {
            question: "Who is Maami Broni?",
            options: ["A police officer", "An older woman who helps street children", "Fofo's aunt", "A government official"],
            correct_answer: 1,
            explanation: "Maami Broni is a kind older woman who sometimes helps street children with food and shelter."
          }
        ]
      },
      {
        chapter_number: 4,
        title: "MUTE - The Organization",
        content: `Chapter Four introduces the organization that will play a crucial role in the story.

**MUTE Introduction**
MUTE (a fictional NGO) is introduced as an organization that:
- Works with street children
- Provides rehabilitation services
- Advocates for children's rights
- Investigates child abuse cases

**Kabria**
We meet Kabria, a social worker at MUTE. She is:
- Dedicated to helping street children
- Frustrated by the system
- Balancing work and family
- Determined to make a difference

**The Investigation Connects**
MUTE becomes aware of:
- Baby T's disappearance
- Possible connections to child trafficking
- The involvement of powerful people

**Institutional Challenges**
The chapter explores challenges faced by organizations like MUTE:
- Limited funding
- Bureaucratic obstacles
- Corruption in the system
- Danger from those they investigate

**Fofo Meets MUTE**
The paths of Fofo and MUTE begin to intersect:
- Street children talking to social workers
- Investigation leads overlapping
- The beginning of hope for Fofo

**Key Themes:**
- Role of NGOs in social change
- Institutional barriers
- Individual commitment
- Hope through organized effort`,
        likely_questions: [
          {
            question: "What is MUTE in the novel?",
            options: ["A government agency", "An NGO working with street children", "A school", "A hospital"],
            correct_answer: 1,
            explanation: "MUTE is an NGO (Non-Governmental Organization) that works with street children and investigates child abuse cases."
          },
          {
            question: "What is Kabria's role in the novel?",
            options: ["A street vendor", "A social worker at MUTE", "A politician", "A journalist"],
            correct_answer: 1,
            explanation: "Kabria is a dedicated social worker at MUTE who becomes involved in investigating Baby T's disappearance."
          }
        ]
      },
      {
        chapter_number: 5,
        title: "The Dark Underworld",
        content: `Chapter Five exposes the criminal underworld that exploits children.

**Poison's Network**
The extent of Poison's criminal activities is revealed:
- Drug dealing
- Child trafficking
- Exploitation of street children
- Connections to powerful figures

**The Exploitation System**
The chapter describes how children are exploited:
- Forced into prostitution
- Used for drug running
- Forced labor
- Organ trafficking hints

**Onko**
We learn more about Onko, one of Poison's associates:
- Equally dangerous
- Involved in exploiting children
- Part of the network that preys on vulnerable youth

**Baby T's Fate**
More is revealed about what happened to Baby T:
- She was lured or taken
- Connected to the criminal network
- Her fate becomes clearer and more tragic

**The Complicity**
The chapter shows how many are complicit:
- Corrupt officials who look away
- Community members who don't speak up
- Family members who enable abusers

**Key Themes:**
- Criminal exploitation of children
- Systemic complicity in abuse
- The invisibility of victims
- Evil hiding in plain sight`,
        likely_questions: [
          {
            question: "What criminal activities is Poison involved in?",
            options: ["Only petty theft", "Drug dealing, child trafficking, and exploitation", "Legal business only", "Government work"],
            correct_answer: 1,
            explanation: "Poison is involved in multiple criminal activities including drug dealing, child trafficking, and exploitation of street children."
          },
          {
            question: "What does Chapter Five reveal about society's role in child exploitation?",
            options: ["Everyone is actively fighting it", "Many people are complicit through silence or corruption", "Only foreigners are involved", "The government is successfully stopping it"],
            correct_answer: 1,
            explanation: "The chapter reveals widespread complicity through corrupt officials, silent community members, and enabling family members."
          }
        ]
      }
    ];

    // Get Faceless novel ID
    const { data: facelessNovel } = await supabase
      .from('novels')
      .select('id')
      .eq('title', 'Faceless')
      .single();

    if (facelessNovel) {
      for (const chapter of facelessChapters1) {
        const { data: existing } = await supabase
          .from('novel_chapters')
          .select('id')
          .eq('novel_id', facelessNovel.id)
          .eq('chapter_number', chapter.chapter_number)
          .maybeSingle();

        if (!existing) {
          await supabase.from('novel_chapters').insert({
            novel_id: facelessNovel.id,
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            likely_questions: chapter.likely_questions,
            word_count: chapter.content.split(/\s+/).length,
            estimated_reading_time: Math.ceil(chapter.content.split(/\s+/).length / 200)
          });
        }
      }
    }

    console.log('Seeded first batch of remaining novels');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'First batch of chapters seeded successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Error seeding novels:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
