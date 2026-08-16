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

    // Get Faceless novel ID
    const { data: facelessNovel } = await supabase
      .from('novels')
      .select('id')
      .eq('title', 'Faceless')
      .single();

    if (!facelessNovel) {
      return new Response(JSON.stringify({ error: 'Faceless novel not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const facelessChapters = [
      {
        chapter_number: 6,
        title: "Kabria's Investigation",
        content: `Chapter Six follows Kabria as she delves deeper into the investigation.

**Personal Stakes**
Kabria's investigation becomes personal:
- Her encounters with street children remind her of her own children
- The dangers she faces affect her family life
- Her colleagues warn her about pushing too hard
- She discovers connections that reach high into society

**The Files**
MUTE begins building a case:
- Documenting testimonies from street children
- Gathering evidence of trafficking networks
- Connecting various disappearances
- Building a picture of systematic exploitation

**Resistance**
Kabria faces resistance from multiple fronts:
- Corrupt police who don't want the investigation
- Powerful people protecting criminals
- Bureaucratic obstacles
- Threats to her safety

**The Street Children's Stories**
More children share their experiences:
- Stories of abuse and exploitation
- Near-escapes from traffickers
- Loss of friends and siblings
- The struggle to survive

**Progress**
Despite obstacles, progress is made:
- Key witnesses identified
- Patterns emerge
- Connections to Baby T's case clarify

**Key Themes:**
- The cost of seeking justice
- Institutional obstacles
- The power of documentation
- Persistence in the face of danger`,
        likely_questions: [
          {
            question: "What challenges does Kabria face in her investigation?",
            options: ["Only lack of time", "Corrupt police, powerful people, and threats to her safety", "Support from everyone", "No challenges at all"],
            correct_answer: 1,
            explanation: "Kabria faces multiple challenges including corrupt police, powerful people protecting criminals, bureaucratic obstacles, and threats to her safety."
          }
        ]
      },
      {
        chapter_number: 7,
        title: "The Discovery",
        content: `Chapter Seven brings a devastating discovery.

**Baby T Found**
The search for Baby T reaches its tragic conclusion:
- Her body is discovered
- Evidence of violent death
- Signs of prior exploitation
- The community's reaction

**Fofo's Grief**
Fofo's response to losing her sister:
- Overwhelming grief
- Anger at those responsible
- Guilt for not finding her sooner
- Determination for justice

**The Evidence**
Baby T's death provides crucial evidence:
- Links to the criminal network
- Proof of systematic abuse
- Identification of perpetrators
- A case that cannot be ignored

**Maa Tsuru's Reaction**
The biological mother's response:
- Forced to confront her failures
- Grief mixed with guilt
- The weight of her choices

**Community Mourning**
The street children mourn one of their own:
- Vigil and remembrance
- Anger at the system
- Fear for their own safety
- Solidarity in grief

**Key Themes:**
- The tragedy of lost children
- Grief and its expressions
- Evidence and justice
- Parental guilt and failure`,
        likely_questions: [
          {
            question: "What happens to Baby T in Chapter Seven?",
            options: ["She is found alive", "Her body is discovered", "She returns home", "She escapes the country"],
            correct_answer: 1,
            explanation: "Chapter Seven reveals the tragic discovery of Baby T's body, showing she was killed after being exploited."
          },
          {
            question: "How does Fofo react to the discovery?",
            options: ["With indifference", "With overwhelming grief, anger, and determination for justice", "She runs away", "She blames herself alone"],
            correct_answer: 1,
            explanation: "Fofo experiences overwhelming grief, anger at those responsible, and a strong determination to seek justice for her sister."
          }
        ]
      },
      {
        chapter_number: 8,
        title: "Confronting Poison",
        content: `Chapter Eight brings confrontations with the perpetrators.

**Gathering Forces**
MUTE, the police (honest ones), and community members prepare:
- Building the legal case
- Gathering witnesses
- Planning the confrontation
- Protecting those at risk

**Poison Exposed**
The evidence against Poison becomes overwhelming:
- His role in Baby T's death
- The extent of his criminal network
- Testimony from his victims
- Documentary evidence

**The Arrest**
Justice begins to move:
- Poison is apprehended
- His network is disrupted
- Some accomplices are caught
- Others flee

**Maa Tsuru's Choice**
Maa Tsuru must decide:
- Will she testify against Poison?
- Will she protect the man who killed her daughter?
- Her final choice defines her redemption or further failure

**The Street Children Testify**
Brave children come forward:
- Sharing their experiences
- Identifying abusers
- Risk to themselves
- Courage in the face of fear

**Key Themes:**
- Justice finally moving
- Courage of the vulnerable
- Redemption possibilities
- The price of testimony`,
        likely_questions: [
          {
            question: "What happens to Poison in Chapter Eight?",
            options: ["He escapes completely", "He is arrested and his network is disrupted", "He becomes a good person", "Nothing happens to him"],
            correct_answer: 1,
            explanation: "Poison is arrested and his criminal network is disrupted as evidence against him becomes overwhelming."
          }
        ]
      },
      {
        chapter_number: 9,
        title: "The Trial",
        content: `Chapter Nine depicts the legal proceedings.

**Court Proceedings**
The trial of Poison and accomplices:
- Evidence presented
- Witnesses testifying
- Legal arguments
- Media attention

**Fofo's Testimony**
Fofo testifies about:
- Life at home with Poison
- The abuse she suffered
- Her sister's disappearance
- The street life they were forced into

**Maa Tsuru's Testimony**
The mother finally speaks:
- Acknowledging her failures
- Testifying against Poison
- Seeking some form of redemption
- Facing the consequences of her choices

**The Defense**
Poison's defense attempts:
- Discrediting witnesses
- Using connections
- Intimidating testimonies
- Legal technicalities

**Justice Prevails**
Despite obstacles:
- The truth emerges
- Convictions are secured
- Some measure of justice achieved
- The system, for once, works

**Key Themes:**
- The justice system
- Courage of testimony
- Redemption through truth
- Society's role in justice`,
        likely_questions: [
          {
            question: "What role does Maa Tsuru play in the trial?",
            options: ["She defends Poison", "She refuses to attend", "She testifies against Poison, acknowledging her failures", "She has no involvement"],
            correct_answer: 2,
            explanation: "Maa Tsuru finally acknowledges her failures and testifies against Poison, seeking some form of redemption."
          }
        ]
      },
      {
        chapter_number: 10,
        title: "Healing Begins",
        content: `Chapter Ten focuses on the aftermath and beginning of healing.

**MUTE's Continued Work**
The organization continues:
- Rehabilitation programs for street children
- Advocacy for policy change
- Support for survivors
- Prevention programs

**Fofo's New Path**
Fofo begins to rebuild:
- Entering a rehabilitation program
- Beginning formal education
- Processing her trauma
- Finding hope for the future

**Kabria's Reflection**
The social worker reflects:
- On the cost and rewards of the work
- The children who can be saved
- The changes needed in society
- Her commitment to continue

**The Other Street Children**
We see other children:
- Some entering programs
- Some still on the streets
- The ongoing challenge
- Individual stories of hope and struggle

**Policy Implications**
The case leads to:
- Discussion of child protection laws
- Media attention to street children
- Public awareness campaigns
- Calls for systemic change

**Key Themes:**
- Healing from trauma
- The long road to recovery
- Societal responsibility
- Hope amid ongoing challenges`,
        likely_questions: [
          {
            question: "What happens to Fofo after the trial?",
            options: ["She returns to the streets", "She enters a rehabilitation program and begins education", "She leaves the country", "She becomes a criminal"],
            correct_answer: 1,
            explanation: "Fofo enters a rehabilitation program and begins formal education, starting to rebuild her life with hope for the future."
          }
        ]
      },
      {
        chapter_number: 11,
        title: "A New Dawn",
        content: `Chapter Eleven, the final chapter, looks to the future.

**Fofo's Transformation**
Fofo has changed:
- From street child to hopeful youth
- Healing from trauma
- Education opening doors
- Advocacy for other children

**Maa Tsuru's Journey**
The mother's path:
- Facing consequences of her past
- Attempting to rebuild relationship with Fofo
- Working to become a better person
- The long road to redemption

**The Bigger Picture**
The novel ends with reflection on:
- The thousands of faceless children still on streets
- The system that fails them
- The individuals who make a difference
- The need for collective action

**Symbolism of the Title**
"Faceless" refers to:
- Children invisible to society
- Those without identity or rights
- The dehumanization of the poor
- The need to give face to the faceless

**Final Message**
Amma Darko's message:
- Society bears responsibility for its children
- Individual choices have consequences
- Change is possible but requires effort
- Every child deserves a face, a name, dignity

**Literary Significance:**
"Faceless" by Amma Darko is significant because:
- It gives voice to the voiceless
- It exposes uncomfortable truths about society
- It challenges readers to act
- It shows both tragedy and hope

**Author's Perspective:**
Amma Darko uses literature to:
- Advocate for marginalized children
- Critique social and economic systems
- Show the human cost of inequality
- Inspire change through storytelling`,
        likely_questions: [
          {
            question: "What does the title 'Faceless' symbolize?",
            options: ["Criminals who hide their identity", "Street children who are invisible and dehumanized by society", "A ghost story", "Plastic surgery"],
            correct_answer: 1,
            explanation: "The title 'Faceless' symbolizes street children who are invisible to society, lacking identity, rights, and dignity."
          },
          {
            question: "Who wrote 'Faceless'?",
            options: ["Chinua Achebe", "Amma Darko", "Wole Soyinka", "Buchi Emecheta"],
            correct_answer: 1,
            explanation: "Amma Darko, a Ghanaian author, wrote 'Faceless' to highlight the plight of street children in Ghana."
          },
          {
            question: "What is the main message of 'Faceless'?",
            options: ["Crime always pays", "Society bears responsibility for protecting its children", "Street life is glamorous", "Parents are always right"],
            correct_answer: 1,
            explanation: "The main message is that society bears responsibility for its children, and every child deserves dignity and protection."
          },
          {
            question: "What happens to the mother-daughter relationship between Maa Tsuru and Fofo?",
            options: ["It completely ends", "Maa Tsuru attempts to rebuild it while facing consequences of her past", "Nothing changes", "Fofo forgives immediately"],
            correct_answer: 1,
            explanation: "Maa Tsuru attempts to rebuild her relationship with Fofo while facing the consequences of her past failures."
          }
        ]
      }
    ];

    for (const chapter of facelessChapters) {
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
    
    await supabase.from('novels').update({ total_chapters: 11 }).eq('id', facelessNovel.id);

    console.log('Seeded remaining Faceless chapters');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Faceless chapters 6-11 seeded successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Error seeding Faceless:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
