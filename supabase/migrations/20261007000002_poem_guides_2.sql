-- Hand-written study guides: The Proud King, Ambush, The Dining Table.

-- ============ THE PROUD KING — William Morris ============
-- ch1
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('50fc7f57-ff93-4709-9b74-b2ead56c5df3', 1, 'Summary & Context',
'## Summary & Context

**The Poet:** William Morris (1834–1896), English poet, craftsman and socialist, author of The Earthly Paradise, in which “The Proud King” appears as one of the verse tales.

**What happens:** A great king, swollen with pride in his power and splendour, is humbled by God. An angel takes the king’s shape and throne while the real king — stripped of royal robes, unrecognized even by his own court and queen — wanders in shame and rags. Only after he truly repents his pride is he restored. The tale follows the medieval legend of Emperor Jovinian from the Gesta Romanorum: pride goes before a fall, and humility restores what pride lost.

**Context:** A moral exemplum in verse. Morris retells a wandering medieval story to preach a timeless lesson: earthly glory is loaned, not owned, and the proud must learn lowliness before they can rule again.',
350, 2, NULL);

-- ch2
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('50fc7f57-ff93-4709-9b74-b2ead56c5df3', 2, 'Line-by-Line Analysis',
'## Line-by-Line Analysis

**The king in glory:** The tale opens on majesty at full stretch — feasts, courtiers, armies, treasure. Every detail exists to measure how far the fall will be. Pride is shown, not told: the king believes the kingdom is his by right of self.

**The humbling:** God sends an angel in the king’s exact likeness to sit the throne. The real king returns to find himself a stranger: guards bar him, nobles stare through him, even his queen lies asleep to his pleading. Identity, Morris shows, lives in recognition — take away men’s belief and the king is nobody.

**The wandering:** In rags among common folk, the king suffers cold, hunger and contempt — the exact miseries his pride once inflicted or ignored. Suffering becomes his school; each humiliation files something off his arrogance.

**The meeting:** The solemn centre of the tale is the encounter between the chastened king and the heavenly messenger. No court watches; the drama is private, between a soul and God. The angel’s message is simple: pride dethroned him, humility will restore him.

**Restoration:** Repentant and lowly, the king is given back his throne — but he rules afterward as a humbled man. The arc is complete: pride → fall → suffering → repentance → restoration.',
400, 3, NULL);

-- ch3
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('50fc7f57-ff93-4709-9b74-b2ead56c5df3', 3, 'Themes & Literary Devices',
'## Themes & Literary Devices

**Themes**
- **Pride and nemesis:** arrogance invites a fall — the oldest moral plot.
- **Humility and repentance:** suffering teaches what splendour cannot.
- **Divine justice:** God actively humbles the exalted.
- **Appearance versus reality:** the court cannot tell king from angel; rank is performance.
- **Transience of power:** thrones are loaned, not owned.

**Devices**
- **Exemplum/allegory:** the whole tale illustrates “pride goes before destruction.”
- **Irony:** the king must become a beggar to learn kingship.
- **Doppelgänger motif:** the angel-double who rules better than the original.
- **Repetition:** humiliation scenes pile up until repentance breaks through.
- **Diction:** Morris’s deliberately archaic, romance vocabulary gives the moral a timeless air.
- **Tone:** solemn and didactic; **mood** moves from splendour through shame to solemn joy.',
260, 2, NULL);

-- ch4
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('50fc7f57-ff93-4709-9b74-b2ead56c5df3', 4, 'Practice Questions',
'## Practice Questions

**1. Who wrote “The Proud King”?**
A) Alfred Tennyson
B) William Morris
C) Robert Browning
D) John Milton
Answer: B — from his verse collection The Earthly Paradise.

**2. The tale is adapted from**
A) Greek mythology
B) The medieval Gesta Romanorum legend of Jovinian
C) The Bible book of Esther
D) Arabian Nights
Answer: B — the proud emperor humbled by heaven.

**3. How is the king humbled?**
A) He loses a war
B) An angel takes his shape and throne while he goes unrecognized
C) His queen poisons him
D) His treasure is stolen
Answer: B — identity lives in recognition; without it he is nobody.

**4. The central theme is**
A) The glory of conquest
B) Pride punished and humility restored
C) The evils of taxation
D) Romantic love
Answer: B — the classic pride-to-repentance arc.

**5. Even his queen fails to recognize him, which shows that**
A) She is blind
B) Rank and identity depend on outward recognition
C) The angel cursed her
D) She never loved him
Answer: B — appearance versus reality, a key theme.

**6. The king is restored when he**
A) Bribes the court
B) Defeats the angel in combat
C) Truly repents his pride
D) Finds hidden treasure
Answer: C — repentance, not force, wins back the throne.

**7. The angel in the tale represents**
A) Random chance
B) Divine justice at work
C) The king’s guilty conscience only
D) A foreign invader
Answer: B — heaven’s instrument for humbling the exalted.

**8. The mood at the end is best described as**
A) Solemn joy after chastening
B) Bitter despair
C) Comic relief
D) Cold detachment
Answer: A — restoration through humility, not triumph.',
580, 4,
'[{"question": "Who wrote The Proud King?", "options": {"A": "Tennyson", "B": "Morris", "C": "Browning", "D": "Milton"}, "correct_answer": "B"}, {"question": "Source legend?", "options": {"A": "Greek myth", "B": "Gesta Romanorum Jovinian", "C": "Esther", "D": "Arabian Nights"}, "correct_answer": "B"}, {"question": "How is the king humbled?", "options": {"A": "Loses war", "B": "Angel takes his shape", "C": "Poisoned", "D": "Robbed"}, "correct_answer": "B"}, {"question": "Central theme?", "options": {"A": "Conquest", "B": "Pride punished, humility restored", "C": "Taxation", "D": "Romance"}, "correct_answer": "B"}, {"question": "Restoration comes through?", "options": {"A": "Bribery", "B": "Combat", "C": "Repentance", "D": "Treasure"}, "correct_answer": "C"}]'::jsonb);

UPDATE public.novels SET total_chapters = 4 WHERE id = '50fc7f57-ff93-4709-9b74-b2ead56c5df3';

-- ============ AMBUSH — Gbemisola Adeoti ============
-- ch1
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('45fbec64-299d-475f-a4b0-ea0409b30087', 1, 'Summary & Context',
'## Summary & Context

**The Poet:** Gbemisola Adeoti, Nigerian professor of literature, writing out of post-independence disillusionment.

**What happens:** Across four stanzas the persona indicts “the land” — Nigeria — as a predator lying in ambush for its own people. As a giant whale it swallows fishermen’s hopes (with a biblical nod to Peter’s empty nets and “petered out desires”); as a sabre-toothed tiger it terrorizes citizens through state violence (“bayonets of tribulation”); as a giant hawk it hovers over every escape route by sea, land and air. Even those who flee toward “the shore of possibilities” find the land waiting ahead of them. The final note is brutally pessimistic: the trap is everywhere.

**Context:** Postcolonial protest poetry. The “land” is the Nigerian state and ruling class that devour the dreams of ordinary people — unemployment, insecurity, corruption — so that striving citizens, like Peter, toil all night and catch nothing.',
380, 2, NULL);

-- ch2
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('45fbec64-299d-475f-a4b0-ea0409b30087', 2, 'Line-by-Line Analysis',
'## Line-by-Line Analysis

**Stanza 1 — the whale:** “The land is a giant whale / that swallows the sinker, / with hook, line and bait / aborting dreams of a good catch.” Fishermen (ordinary strivers) lose everything — hook, line, sinker AND bait. “Fishers turn home at dusk / blue Peter on empty ships” fuses Nigerian hardship with the biblical Peter’s fruitless night of fishing; “all Peters with petered out desires” puns Peter/petered — exhausted hopes.

**Stanza 2 — the tiger:** “The land is a sabre-toothed tiger / that cries deep in the glade / while infants shudder home.” State violence: “bayonets of tribulation” turn protection into terror. Even the old (“grizzled ones”) clutch their guts; every “venturous walk” halts at dusk. Note the military register: bayonets, tribulation, halting.

**Stanza 3 — the hawk:** “The land is a giant hawk / that courts unceasing disaster / as it hovers and hoots in space.” Air power completes the trap: sea (whale), land (tiger), sky (hawk) — no escape route remains. Disaster is not accidental but “courted.”

**Stanza 4 — the ambush:** “The land lies patiently ahead / awaiting in ambush / those who point away from a direction / where nothing happens / towards the shore of possibilities.” Even emigration (“shore of possibilities”) is stalked. “Patiently” is chilling — oppression that can wait will outlast you.',
460, 3, NULL);

-- ch3
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('45fbec64-299d-475f-a4b0-ea0409b30087', 3, 'Themes & Literary Devices',
'## Themes & Literary Devices

**Themes**
- **Oppression and state violence:** the land-as-predator in three domains.
- **Frustrated dreams:** striving citizens whose nets stay empty.
- **Bad governance and corruption:** the ruling class devouring the nation’s resources.
- **Hopelessness/pessimism:** even escape is ambushed; no exit is offered.
- **Postcolonial disillusionment:** independence delivered predators, not promise.

**Devices**
- **Extended metaphor:** land = whale, tiger, hawk — one vehicle sustained throughout.
- **Structural parallelism:** each of the first three stanzas opens “The land is a giant…” — equal weight to each menace.
- **Biblical allusion:** Peter’s empty nets; “petered out desires.”
- **Pun:** Peter / petered out.
- **Military register:** ambush, bayonets, tribulation, halting.
- **Repetition:** “The land is…” hammering inevitability. **Diction** is simple; the terror is in the images.
- **Tone:** angry, mournful, accusatory; **mood** bleak with one glint (the “shore”).',
280, 2, NULL);

-- ch4
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('45fbec64-299d-475f-a4b0-ea0409b30087', 4, 'Practice Questions',
'## Practice Questions

**1. Who wrote “Ambush”?**
A) Niyi Osundare
B) Gbemisola Adeoti
C) Odia Ofeimun
D) Tanure Ojaide
Answer: B.

**2. The three predators in the poem are**
A) Whale, tiger, hawk
B) Lion, shark, eagle
C) Snake, wolf, vulture
D) Whale, lion, falcon
Answer: A — sea, land and sky; no escape route.

**3. “Blue Peter on empty ships” alludes to**
A) A pirate flag
B) The biblical Peter’s fruitless night of fishing
C) A shipping company
D) The poet’s brother
Answer: B — toiling all night and catching nothing, like Nigerians striving in vain.

**4. “Bayonets of tribulation” suggests**
A) Farming tools
B) State violence turned on citizens
C) Fishing equipment
D) Musical instruments
Answer: B — protection perverted into terror.

**5. The structural device opening stanzas 1–3 is**
A) Flashback
B) Parallelism (“The land is a giant…”)
C) Acrostic
D) Dialogue
Answer: B — equal menace in each domain.

**6. “The shore of possibilities” represents**
A) A beach resort
B) Escape to a better life abroad
C) A fishing spot
D) The poet’s village
Answer: B — emigration as the last hope, itself ambushed.

**7. The pun in “all Peters with petered out desires” plays on**
A) Peter / exhausted (petered out)
B) Petrol / petroleum
C) Peters / potatoes
D) Nothing — it is literal
Answer: A — biblical name turned into spent hopes.

**8. The poem’s overall mood is**
A) Joyful
B) Bleak and accusatory with a glint of hope
C) Comic
D) Romantic
Answer: B — lamentation with one distant shore.',
600, 4,
'[{"question": "Who wrote Ambush?", "options": {"A": "Osundare", "B": "Adeoti", "C": "Ofeimun", "D": "Ojaide"}, "correct_answer": "B"}, {"question": "The three predators?", "options": {"A": "Whale, tiger, hawk", "B": "Lion, shark, eagle", "C": "Snake, wolf, vulture", "D": "Whale, lion, falcon"}, "correct_answer": "A"}, {"question": "Blue Peter alludes to?", "options": {"A": "Pirates", "B": "Biblical Peter’s empty nets", "C": "A company", "D": "A brother"}, "correct_answer": "B"}, {"question": "Bayonets of tribulation means?", "options": {"A": "Farming", "B": "State violence", "C": "Fishing", "D": "Music"}, "correct_answer": "B"}, {"question": "Shore of possibilities?", "options": {"A": "Resort", "B": "Escape abroad", "C": "Fishing spot", "D": "Village"}, "correct_answer": "B"}]'::jsonb);

UPDATE public.novels SET total_chapters = 4 WHERE id = '45fbec64-299d-475f-a4b0-ea0409b30087';

-- ============ THE DINING TABLE — Gbanabom Hallowell ============
-- ch1
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('adae2d2c-3f57-411a-a726-4baa6e74bd5e', 1, 'Summary & Context',
'## Summary & Context

**The Poet:** Gbanabom (Elvis Gbanabom) Hallowell, Sierra Leonean poet writing out of his country’s eleven-year civil war.

**What happens:** Over three free-verse stanzas the persona turns a family dinner into a war zone. “Dinner tonight comes with gun wounds”: the Sierra Leone war crashes into an ordinary meal. The table becomes an island (Sierra Leone) where guerrillas and crocodiles “surf” children from “Alphabeta” into soldiering; playgrounds empty of toys as child soldiers take up guns; cholera cracks lips; and the persona, who promised himself as a revolutionary under “the spilt milk of the moon,” finds even his Nile lazy — he is tired, his boots too reluctant to walk him. He will not fight on: the dinner of gun wounds is for “lovers of fire,” not him.

**Context:** A war poem built entirely on domestic imagery. Every harmless dinner word is reloaded with violence, forcing the reader to taste war at the table.',
400, 2, NULL);

-- ch2
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('adae2d2c-3f57-411a-a726-4baa6e74bd5e', 2, 'Line-by-Line Analysis',
'## Line-by-Line Analysis

**“Dinner tonight comes with gun wounds”** — the thesis in one line. Dinner promises nourishment and company; gun wounds deliver pain and death. The whole poem is this collision.

**“Our desert tongues lick the vegetable blood — the pepper / strong enough to push scorpions up our heads”** — fear dries mouths (“desert tongues”); blood is “vegetable” (bodies butchered like crops); pain stings like pepper and scorpions. Bodies become food.

**“Guests look into the oceans of bowls / as vegetables die on their tongues”** — onlookers watch the dying; “oceans of bowls” drowns the domestic in the massive.

**Stanza 2 — the island:** “The table that gathers us is an island” = Sierra Leone, surrounded. “Guerrillas walk the land while crocodiles surf”: fighters on land, predators in water. “Children from Alphabeta” (school-age innocents, ABC learners) are harvested into war — “switchblades in their eyes, silence in their voices.” Playgrounds emptied of toys; “who needs roadblocks?” (bitter rhetorical question — movement itself is policed).

**“When the hour to drink from the cup of life ticks, / cholera breaks its spell on cracked lips”** — even survival basics (water, life) are diseased.

**Stanza 3 — the revolutionary’s farewell:** “Under the spilt milk of the moon” (moonlight like spilled milk — a glimpse of possible victory), “I promise to be a revolutionary” — but “my Nile, even without tributaries, comes lazy upon its own Nile”: even great rivers tire; wordplay on Nile (river) vs Nile (to flow/prevail). “On this night reserved for lovers of fire, I’m full with the catch of gun wounds, and my boots have suddenly become too reluctant to walk me.” Exhaustion wins: he quits the war not from cowardice but from surfeit of horror.',
520, 3, NULL);

-- ch3
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('adae2d2c-3f57-411a-a726-4baa6e74bd5e', 3, 'Themes & Literary Devices',
'## Themes & Literary Devices

**Themes**
- **Horrors of war:** every dinner image reloaded as violence.
- **Child soldiering:** Alphabeta children harvested into armies; playgrounds emptied.
- **Bad leadership and state failure:** the war as harvest of misrule.
- **Exhaustion and moral fatigue:** even the willing revolutionary quits.
- **Loss of innocence:** food, play and moonlight all corrupted.

**Devices**
- **Extended metaphor:** dinner = war; meal = gun wounds; table = Sierra Leone.
- **Symbolism:** tonight = darkness/doom; pepper/scorpions = pain; table = nation; fire = destruction; Nile = endurance.
- **Oxymoron/antithesis:** silent voices; dinner that wounds; lovers of fire.
- **Rhetorical question:** “when the playground is emptied of children’s toys, who needs roadblocks?”
- **Personification:** cholera “breaks its spell”; pepper “pushes.”
- **Pun:** Nile (river) vs Nile (to flow) — “my Nile… comes lazy upon its own Nile.”
- **Repetition:** gun wounds, Nile, children, walk — drumbeat of attrition.
- **Free verse, three stanzas; diction** domestic-turned-military; **tone** anguished then weary; **mood** gloomy.',
300, 2, NULL);

-- ch4
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('adae2d2c-3f57-411a-a726-4baa6e74bd5e', 4, 'Practice Questions',
'## Practice Questions

**1. Who wrote “The Dining Table”?**
A) Gbanabom Hallowell
B) Lenrie Peters
C) Kofi Awoonor
D) Dennis Brutus
Answer: A — Sierra Leonean poet of the civil-war generation.

**2. “Dinner tonight comes with gun wounds” means**
A) The food is spicy
B) War crashes into ordinary domestic life
C) Soldiers eat well
D) The cook is careless
Answer: B — the poem’s thesis: the meal is violence.

**3. The “table” in the poem symbolizes**
A) A school desk
B) Sierra Leone, surrounded like an island
C) A restaurant business
D) The United Nations
Answer: B — “The table that gathers us is an island.”

**4. Children “from Alphabeta” are**
A) Top students on scholarship
B) School-age children conscripted as soldiers
C) The poet’s own kids
D) Choir members
Answer: B — ABC learners harvested into war; playgrounds emptied.

**5. The Nile wordplay (“my Nile… upon its own Nile”) is**
A) A simile
B) A pun on river vs flowing/prevailing
C) An error
D) A biblical quote
Answer: B — even great rivers tire; exhaustion beats ideology.

**6. “Pepper strong enough to push scorpions up our heads” conveys**
A) Good cooking
B) Pain so intense it feels venomous and shoving
C) A recipe
D) Farming advice
Answer: B — pain imagery stacked on pain imagery.

**7. The persona finally decides to**
A) Lead the revolution
B) Quit fighting — he is full of gun wounds and his boots won’t walk him
C) Flee to America
D) Join the guerrillas
Answer: B — moral fatigue, not cowardice: “lovers of fire” can have the war.

**8. The dominant mood is**
A) Festive
B) Gloomy and anguished, ending weary
C) Comic
D) Triumphant
Answer: B — pain throughout, resignation at the close.',
620, 4,
'[{"question": "Who wrote The Dining Table?", "options": {"A": "Hallowell", "B": "Peters", "C": "Awoonor", "D": "Brutus"}, "correct_answer": "A"}, {"question": "Dinner with gun wounds means?", "options": {"A": "Spicy food", "B": "War invades domestic life", "C": "Soldiers feast", "D": "Bad cooking"}, "correct_answer": "B"}, {"question": "The table symbolizes?", "options": {"A": "Desk", "B": "Sierra Leone", "C": "Restaurant", "D": "UN"}, "correct_answer": "B"}, {"question": "Children from Alphabeta?", "options": {"A": "Scholars", "B": "Conscripted child soldiers", "C": "Poet’s kids", "D": "Choir"}, "correct_answer": "B"}, {"question": "Persona’s final decision?", "options": {"A": "Lead", "B": "Quit, exhausted", "C": "Flee", "D": "Join"}, "correct_answer": "B"}]'::jsonb);

UPDATE public.novels SET total_chapters = 4 WHERE id = 'adae2d2c-3f57-411a-a726-4baa6e74bd5e';
