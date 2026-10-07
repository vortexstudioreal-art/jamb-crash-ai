-- Hand-written study guides: Piano and Drums, Vanity, The School Boy.
-- Full chapter content (no AI, no rate limits). Sets total_chapters = 4.

-- ============ PIANO AND DRUMS — Gabriel Okara ============
-- ch1
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('f4db730a-da1e-476c-b41f-1ca263473fd7', 1, 'Summary & Context',
'## Summary & Context

**The Poet:** Gabriel Okara (1921–2019), Nigerian poet and novelist from the Niger Delta, a pioneer of modern African poetry who wrote in English enriched with Ijaw imagery and speech rhythms.

**What happens:** At break of day by a riverside, the persona hears two competing musics — the jungle drums telegraphing their mystic rhythm, and the piano playing its complex, civilized tune. The drums pull him toward his African roots, instincts and ancestral past; the piano pulls him toward Western education, sophistication and restraint. He is torn between the two worlds, but the poem closes with the jungle drums winning — their raw urgency drowns the piano, and he surrenders to the call of his heritage.

**Context:** Written in the early independence era, the poem captures the cultural dilemma of the Western-educated African: formally trained in European ways yet emotionally rooted in African tradition. Okara himself lived this split, and the poem is often read as autobiographical.',
450, 3, NULL);

-- ch2
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('f4db730a-da1e-476c-b41f-1ca263473fd7', 2, 'Line-by-Line Analysis',
'## Line-by-Line Analysis

**Opening — dawn and the drums:** “When at break of day at a riverside / I hear the jungle drums telegraphing / the mystic rhythm, urgent, raw / like bleeding flesh, it sings.” Dawn is the moment of awakening — literal and cultural. The drums “telegraph” (a modern word ironically used for an ancient instrument) a message the persona feels in his blood. “Bleeding flesh” makes the call physical and painful, not pleasant.

**The hunters and the past:** Images of the hunter’s moon, the leopard and the jungle night pull the persona backward into a primal African past of instinct, hunting and communal life.

**Enter the piano:** Against this comes “the piano” with its “mystic rhythm” of a different kind — complex harmonies, concert halls, restraint. It represents Western civilization: refined, intellectual, but cold and distant from the persona’s blood.

**The struggle:** The middle of the poem swings between the two musics. The persona tries to respond to the piano but keeps slipping back to the drums. Notice the diction: everything attached to the drums is warm, bodily and urgent; everything attached to the piano is cool, distant and complicated.

**Resolution:** The jungle drums win. Their “wailing” drowns the piano, and the persona yields to heritage over training. The poem ends not in balance but in surrender to roots.',
520, 3, NULL);

-- ch3
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('f4db730a-da1e-476c-b41f-1ca263473fd7', 3, 'Themes & Literary Devices',
'## Themes & Literary Devices

**Themes**
- **Cultural conflict:** African tradition versus Western civilization — the poem’s entire engine.
- **Nostalgia and roots:** the pull of ancestry, childhood and the communal past.
- **Identity crisis:** the educated African torn between training and blood.
- **Nature versus sophistication:** jungle vitality against concert-hall refinement.

**Devices**
- **Antithesis/contrast:** drums vs piano in almost every stanza — the structural device of the poem.
- **Auditory imagery:** the whole poem is heard, not seen — telegraphing drums, wailing, complex harmonies.
- **Symbolism:** drums = African heritage and instinct; piano = Western culture and intellect; riverside dawn = awakening.
- **Metaphor:** “bleeding flesh” for the painful urgency of the call.
- **Personification:** the drums “sing” and “wail”; music behaves like a living rival.
- **Repetition:** the returning drum-beat lines mimic the persistence of heritage.
- **Tone:** wistful and conflicted, resolving into surrender. **Mood:** restless, then cathartic.',
300, 2, NULL);

-- ch4
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('f4db730a-da1e-476c-b41f-1ca263473fd7', 4, 'Practice Questions',
'## Practice Questions

Work through these JAMB-style questions, then check your answers and read each explanation.

**1. Who is the poet of “Piano and Drums”?**
A) Wole Soyinka
B) Gabriel Okara
C) J.P. Clark
D) Christopher Okigbo
Answer: B — Gabriel Okara, the Niger Delta pioneer of modern African poetry.

**2. In the poem, the jungle drums symbolize**
A) Western education
B) African tradition and instinct
C) The noise of the city
D) Christian worship
Answer: B — the drums embody heritage, blood and the ancestral past.

**3. The piano in the poem represents**
A) African communal life
B) Childhood innocence
C) Western civilization and sophistication
D) The Nigerian civil war
Answer: C — complex harmonies, restraint and foreign training.

**4. The poem is set at**
A) Midnight in the village square
B) Break of day at a riverside
C) Evening in a concert hall
D) Harmattan noon on a farm
Answer: B — dawn, the moment of cultural awakening.

**5. “Like bleeding flesh, it sings” is an example of**
A) Hyperbole
B) Euphemism
C) Imagery appealing to pain and the body
D) Irony
Answer: C — visceral bodily imagery that makes the call physical.

**6. Which pair best captures the poem’s central device?**
A) Simile and elegy
B) Contrast between drums and piano
C) Flashback and foreshadowing
D) Satire and parody
Answer: B — the whole poem is built on that antithesis.

**7. At the end of the poem, the persona**
A) Destroys the drums
B) Learns to play the piano
C) Surrenders to the call of the drums
D) Leaves the riverside forever
Answer: C — heritage overcomes training; the drums drown the piano.

**8. The dominant mood of the poem is**
A) Joyful and celebratory
B) Restless and conflicted, ending in surrender
C) Angry and revolutionary
D) Detached and comic
Answer: B — tension throughout, catharsis at the close.',
600, 4,
'[{"question": "Who wrote Piano and Drums?", "options": {"A": "Wole Soyinka", "B": "Gabriel Okara", "C": "J.P. Clark", "D": "Christopher Okigbo"}, "correct_answer": "B"}, {"question": "What do the jungle drums symbolize?", "options": {"A": "Western education", "B": "African tradition and instinct", "C": "City noise", "D": "Christian worship"}, "correct_answer": "B"}, {"question": "What does the piano represent?", "options": {"A": "Communal life", "B": "Innocence", "C": "Western civilization", "D": "Civil war"}, "correct_answer": "C"}, {"question": "When/where does the poem open?", "options": {"A": "Midnight village square", "B": "Break of day at a riverside", "C": "Evening concert hall", "D": "Harmattan noon"}, "correct_answer": "B"}, {"question": "How does the poem end?", "options": {"A": "Drums destroyed", "B": "Piano mastered", "C": "Persona yields to the drums", "D": "Persona leaves"}, "correct_answer": "C"}]'::jsonb);

UPDATE public.novels SET total_chapters = 4 WHERE id = 'f4db730a-da1e-476c-b41f-1ca263473fd7';

-- ============ VANITY — Birago Diop ============
-- ch1
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('89e820a8-51d7-412b-9593-60c2eb124ce6', 1, 'Summary & Context',
'## Summary & Context

**The Poet:** Birago Diop (1906–1989) of Senegal, folklorist, veterinarian and leading voice of the Négritude movement, which celebrated African cultural values against colonial contempt.

**What happens:** The persona warns that living Africans who scorn their dead ancestors will find no help in their own hour of need. If we only “tell, gently, gently” of troubles to come, who will listen without laughter? If we cry roughly of our torments, what eyes, hearts and ears will attend to us — given that our own ears were deaf to the cries and wild appeals of the dead? The ancestors left their signs on earth, air and water, but we, “blind, deaf and unworthy sons,” saw nothing. Since we never listened to them, no one will listen to us: our sobbing hearts will go unheard.

**Context:** The poem is a lament and a warning. Diop reverses the usual complaint: the living mock tradition as primitive, then expect ancestral protection when trouble comes. The logic is reciprocal — honour denied will be help denied.',
380, 2, NULL);

-- ch2
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('89e820a8-51d7-412b-9593-60c2eb124ce6', 2, 'Line-by-Line Analysis',
'## Line-by-Line Analysis

**“If we tell, gently, gently / All that we shall one day have to tell”** — a hesitant, fearful confession of coming trouble. The doubled “gently” already sounds like an apology.

**“Who then will hear our voices without laughter, / Sad complaining voices of beggars”** — the first rhetorical question. “Beggars” is deliberately humiliating: a people reduced to pleading.

**“If we cry roughly of our torments / Ever increasing from the start of things”** — contrast with “gently”: when politeness fails, raw crying begins, and the pain only grows.

**“What eyes will watch our large mouths / Shaped by the laughter of big children”** — the “big children” are the mocking powerful (the colonial West); our mouths are grotesquely large with wailing, a spectacle to them.

**“What hearts…? What ear…? / Which grows in us like a tumor”** — anger as disease: unaddressed grievance festers inside the body politic.

**“When our Dead comes with their Dead… / Just as our ears were deaf”** — the hinge of the poem. The ancestors spoke “in clumsy voices” (oral tradition, dismissed as primitive); we refused to hear. Reciprocity is the whole argument.

**“They have left on the earth their cries, / In the air, on the water, where they have traced their signs / For us blind deaf and unworthy Sons”** — the legacy is everywhere, but the heirs are blind. Note the capitals: Dead and Sons carry spiritual weight.

**Closing return:** the opening questions come back sharpened — “what heart…? what ear to our sobbing hearts?” No answer is possible. That silence is the point.',
480, 3, NULL);

-- ch3
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('89e820a8-51d7-412b-9593-60c2eb124ce6', 3, 'Themes & Literary Devices',
'## Themes & Literary Devices

**Themes**
- **Ancestor veneration:** the dead protect the living; dishonouring them invites abandonment.
- **Cultural alienation:** Africans who despise their heritage as primitive.
- **Reciprocity/retribution:** help denied to ancestors means help denied to us.
- **Colonial mockery:** the laughter of “big children” at African suffering.
- **Vanity itself:** the folly of a people who see nothing of what was made for them.

**Devices**
- **Rhetorical questions:** the poem’s skeleton — “Who…? What eyes…? What hearts…? What ear…?”
- **Repetition and parallelism:** “gently, gently,” “Just as our ears were deaf” twice, the returning closing questions.
- **Apostrophe:** the dead are addressed as present persons.
- **Imagery:** tumor, plaintive throats, large mouths — the body in pain.
- **Symbolism:** laughter = contempt; deafness = wilful cultural blindness; Sons = the African generation.
- **Diction:** simple words, devastating arrangement; French-African cadence in translation.
- **Tone:** lamenting, accusatory, prophetic. **Mood:** somber and foreboding.',
280, 2, NULL);

-- ch4
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('89e820a8-51d7-412b-9593-60c2eb124ce6', 4, 'Practice Questions',
'## Practice Questions

**1. Who wrote “Vanity”?**
A) Léopold Senghor
B) Birago Diop
C) David Diop
D) Aimé Césaire
Answer: B — Senegalese folklorist-poet of the Négritude movement. (Do not confuse with David Diop of “Africa My Africa.”)

**2. The central theme of the poem is**
A) The beauty of nature
B) Honouring dead ancestors or facing abandonment
C) The joys of city life
D) Romantic love
Answer: B — reciprocity between the living and the dead.

**3. “The laughter of big children” refers to**
A) Happy village children
B) The mockery of the powerful (colonial West) at African suffering
C) School pupils laughing in class
D) The poet’s own grandchildren
Answer: B — contempt from those who deem Africa primitive.

**4. The dominant device running through the poem is**
A) Flashback
B) Rhetorical questions
C) Acrostic
D) Ballad stanza
Answer: B — “Who…? What eyes…? What hearts…? What ear…?”

**5. “For us blind deaf and unworthy Sons” — the Sons are**
A) European missionaries
B) The African generation that abandoned heritage
C) The poet’s biological children
D) French colonial officers
Answer: B — heirs blind to the legacy left for them.

**6. “Which grows in us like a tumor” is an example of**
A) Metaphor
B) Simile
C) Pun
D) Euphemism
Answer: B — explicit comparison with “like.”

**7. The mood of the poem is best described as**
A) Joyful and triumphant
B) Somber and foreboding
C) Comic and playful
D) Detached and ironic
Answer: B — lamentation over a coming abandonment.

**8. “When our Dead comes with their Dead” suggests that**
A) Everyone will die someday
B) The ancestors live on among the living
C) Funerals are expensive
D) Ghosts haunt villages
Answer: B — the African belief in the living-dead who protect their own.',
620, 4,
'[{"question": "Who wrote Vanity?", "options": {"A": "Léopold Senghor", "B": "Birago Diop", "C": "David Diop", "D": "Aimé Césaire"}, "correct_answer": "B"}, {"question": "What is the central theme?", "options": {"A": "Nature", "B": "Honouring ancestors or facing abandonment", "C": "City life", "D": "Romance"}, "correct_answer": "B"}, {"question": "The laughter of big children means?", "options": {"A": "Village joy", "B": "Mockery of the powerful at African suffering", "C": "School fun", "D": "Grandchildren"}, "correct_answer": "B"}, {"question": "Dominant device?", "options": {"A": "Flashback", "B": "Rhetorical questions", "C": "Acrostic", "D": "Ballad"}, "correct_answer": "B"}, {"question": "Who are the unworthy Sons?", "options": {"A": "Missionaries", "B": "Africans who abandoned heritage", "C": "Poet’s children", "D": "Officers"}, "correct_answer": "B"}]'::jsonb);

UPDATE public.novels SET total_chapters = 4 WHERE id = '89e820a8-51d7-412b-9593-60c2eb124ce6';

-- ============ THE SCHOOL BOY — William Blake ============
-- ch1
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('6b084d67-bd7d-4d08-96b3-5f55188e81df', 1, 'Summary & Context',
'## Summary & Context

**The Poet:** William Blake (1757–1827), English visionary poet-artist of Songs of Innocence and of Experience, enemy of all institutions that cage the human spirit.

**What happens:** The persona loves to rise on a summer morning, hear birds singing and huntsmen with horns far away, and go to school with joy and company. But going to school “in sighing and dismay” under a cruel teacher’s eye turns delight to anxiety. He asks the killer question: how can a bird born for joy sit in a cage and sing? Caged birds, drooping plants, unhappy parents — schooling that kills joy produces misery all round. The poem ends pleading that buds be nursed and young joys protected rather than “blighted with cold.”

**Context:** A Romantic protest against joyless, mechanical education. Blake sets two mornings against each other — the free summer morning and the school morning — and finds school guilty of murdering childhood.',
340, 2, NULL);

-- ch2
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('6b084d67-bd7d-4d08-96b3-5f55188e81df', 2, 'Line-by-Line Analysis',
'## Line-by-Line Analysis

**“I love to rise in a summer morn, / When the birds sing on every tree”** — pure Innocence: morning, song, trees. Everything is alive and free.

**“The distant huntsman winds his horn, / And the skylark sings with me”** — companionship with nature; the boy belongs outdoors.

**“O what sweet company!”** — the exclamation marks unforced delight.

**The turn:** “But to go to school in a summer morn, — / O it drives all joy away!” The same morning curdles. Note the dash — a gasp.

**“Under a cruel eye outworn, / The little ones spend the day / In sighing and dismay.”** — the teacher’s “cruel eye” and the children reduced to sighs. School is surveillance and sorrow.

**“Ah then at times I drooping sit, / And spend many an anxious hour.”** — the boy wilts like an unwatered plant.

**The bird argument:** “How can the bird that is born for joy / Sit in a cage and sing?” A caged bird cannot sing truly; a caged child cannot learn truly. Freedom is the precondition of both song and study.

**“How shall the summer arise in joy, / Or the summer fruits appear?”** — if you blight the buds (children) with cold, there will be no harvest. Utilitarian moral: cruelty is unproductive.

**Close:** nurse the young, don’t blast them. The final stanza is a policy proposal disguised as poetry.',
430, 3, NULL);

-- ch3
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('6b084d67-bd7d-4d08-96b3-5f55188e81df', 3, 'Themes & Literary Devices',
'## Themes & Literary Devices

**Themes**
- **Childhood innocence vs oppressive schooling:** the core opposition.
- **Nature versus institution:** outdoors = life; schoolroom = cage.
- **Freedom as the condition of growth:** song, learning and fruit all need liberty.
- **Critique of joyless education:** cruelty produces anxiety, not scholars.

**Devices**
- **Rhetorical questions:** the bird-in-cage passage — unanswerable by design.
- **Metaphor:** school as cage/prison; children as buds, birds, plants.
- **Contrast/antithesis:** two mornings, joy vs dismay, song vs sighing.
- **Repetition:** “How can…? How shall…?” hammering the argument.
- **Imagery:** summer mornings, singing birds, drooping sitters.
- **Tone:** tender then indignant; **mood** moves from delight to anxiety to moral urgency.',
250, 2, NULL);

-- ch4
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('6b084d67-bd7d-4d08-96b3-5f55188e81df', 4, 'Practice Questions',
'## Practice Questions

**1. Who wrote “The School Boy”?**
A) William Wordsworth
B) William Blake
C) Samuel Coleridge
D) John Keats
Answer: B — Blake, of Songs of Innocence and of Experience.

**2. What does the caged bird represent?**
A) A pet shop
B) The schoolboy trapped in joyless schooling
C) The teacher’s lunch
D) A literal bird the boy owns
Answer: B — unfreedom that kills song and learning alike.

**3. The two mornings contrast**
A) Winter and summer
B) Free joyful morning vs miserable school morning
C) Town and village
D) Past and future
Answer: B — the poem’s structural antithesis.

**4. “Under a cruel eye outworn” refers to**
A) The summer sun
B) The harsh, watchful schoolteacher
C) A blind beggar
D) The boy’s father
Answer: B — surveillance that turns delight to dismay.

**5. The poem’s main target is**
A) Bad weather
B) Mechanical, joy-killing education
C) Hunting as a sport
D) Early rising
Answer: B — Blake’s Romantic protest against the institution.

**6. “How can the bird that is born for joy / Sit in a cage and sing?” is**
A) A simile
B) A rhetorical question
C) A paradox
D) An elegy
Answer: B — asked to prove a point, not to be answered.

**7. The final stanza advises that young joys should be**
A) Punished severely
B) Nursed and protected, not blighted
C) Ignored completely
D) Tested by examinations
Answer: B — “nurse” the buds instead of blasting them.

**8. The dominant mood shift is**
A) Joy to anxiety to moral urgency
B) Fear to anger to revenge
C) Boredom to excitement to sleep
D) Pride to shame to confession
Answer: A — delight, dismay, then the closing plea.',
600, 4,
'[{"question": "Who wrote The School Boy?", "options": {"A": "Wordsworth", "B": "Blake", "C": "Coleridge", "D": "Keats"}, "correct_answer": "B"}, {"question": "What does the caged bird represent?", "options": {"A": "A pet", "B": "The schoolboy in joyless schooling", "C": "Lunch", "D": "A literal bird"}, "correct_answer": "B"}, {"question": "What do the two mornings contrast?", "options": {"A": "Winter/summer", "B": "Free morning vs school morning", "C": "Town/village", "D": "Past/future"}, "correct_answer": "B"}, {"question": "The cruel eye belongs to?", "options": {"A": "The sun", "B": "The harsh teacher", "C": "A beggar", "D": "The father"}, "correct_answer": "B"}, {"question": "The poem mainly attacks?", "options": {"A": "Weather", "B": "Joy-killing education", "C": "Hunting", "D": "Early rising"}, "correct_answer": "B"}]'::jsonb);

UPDATE public.novels SET total_chapters = 4 WHERE id = '6b084d67-bd7d-4d08-96b3-5f55188e81df';
