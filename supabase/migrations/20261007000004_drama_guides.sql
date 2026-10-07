-- Hand-written study guides: Lion and the Jewel (chs 2-3), Harvest of Corruption (chs 2-5).

-- ============ THE LION AND THE JEWEL — Wole Soyinka ============
-- ch2
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('b93b925d-1ed8-4328-b430-7ee719ce3dca', 2, 'Morning - The Jewel Rebuked',
'## Morning — The Jewel Rebuked

**Where we are:** The play’s three parts are times of day — Morning, Noon, Night — tracking one village day in Ilujinle and Sidi’s fall in a single day. Morning opens with the village schoolteacher Lakunle courting Sidi, the village belle (“the Jewel”), with Western manners and a marriage proposal *without* bride-price.

**What happens:** Sidi rejects him. No bride-price, no marriage — custom is custom, and Lakunle’s “civilized” romance looks like sharp practice to her: he wants the jewel for free. Enter the news that changes everything: the stranger’s magazine has published Sidi’s photograph, and suddenly her fame (and bride-price value) soars. Baroka, the old Bale (“the Lion”), hears of it. Lakunle fumes against tradition, machines and progress; Sidi teases him, secure in custom.

**Key points for JAMB:**
- **Structure:** the day-plan mirrors Sidi’s journey from maiden to wife in one day.
- **Lakunle** = half-baked Western modernity: he quotes progress but understands neither custom nor women.
- **Sidi** = beauty that knows its market value; tradition is her negotiating power, not ignorance.
- **Baroka** enters as rumour and reputation — the Lion whose cunning the audience is warned about early.
- **Dramatic irony:** the audience already suspects what Sidi does not — that the Lion hunts by flattery.
- **Language:** Lakunle’s long speeches (full of “civilization,” “machines,” “progress”) versus Sidi’s short, grounded replies — talk versus sense.',
420, 3, NULL);

-- ch3
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('b93b925d-1ed8-4328-b430-7ee719ce3dca', 3, 'Noon and Night - Sidi’s Choice',
'## Noon and Night — Sidi’s Choice

**Noon:** Heat, siesta, scheming. Baroka sends word that he wants Sidi as his newest wife — she laughs it off: the Lion is old, and Sadiku (his senior wife) spreads the tale that Baroka has lost his manhood. Sidi, puffed with magazine fame, goes to the palace to *mock* the old man to his face. Lakunle, meanwhile, keeps preaching progress to an empty schoolroom.

**The wrestling with words:** At the palace, Baroka proves the better actor. He flatters Sidi’s beauty, confesses (falsely) his impotence as a trick, shows her his stamp collection and wrestling past, and draws her into private conversation. The “impotent old man” story was Sadiku’s planted lie — bait for a proud girl.

**Night:** Celebration outside; inside, Sidi does not return. When she finally appears, the truth lands: she has slept with Baroka and will marry him. Lakunle gets his answer — custom (“the bride-price must be paid… in full”) wins over his free-love modernity. The play closes with dancing: the village absorbs the shock and celebrates, because in Ilujinle life — and the Lion — goes on.

**Key points for JAMB:**
- **Sadiku’s lie** (Baroka’s impotence) is the engine: it makes proud Sidi walk into the trap.
- **Baroka’s victory is wit, not force:** flattery, patience, performance — the Lion hunts with cunning.
- **Theme — tradition vs modernity:** Lakunle’s imported ideas lose to lived custom; Soyinka favours neither blindly (Baroka is no saint either).
- **Theme — the woman question:** Sidi chooses, but within a market where her value is her body; critics argue whether she wins or is won.
- **Comedy with teeth:** the humour (Lakunle’s pomposity, Sadiku’s scheming) carries serious debate about progress.
- **Likely question angles:** why Sidi rejects Lakunle; the function of the magazine; Sadiku’s role; what “Noon” and “Night” symbolize (heat of contest; consummation/darkness).',
480, 3,
'[{"question": "Why does Sidi reject Lakunle at first?", "options": {"A": "He is poor", "B": "He refuses bride-price", "C": "He is ugly", "D": "Her father forbids"}, "correct_answer": "B"}, {"question": "What raises Sidi’s value?", "options": {"A": "Her singing", "B": "Her magazine photograph", "C": "Lakunle’s teaching", "D": "A festival prize"}, "correct_answer": "B"}, {"question": "Sadiku’s story about Baroka claims he is?", "options": {"A": "Rich", "B": "Impotent", "C": "Dead", "D": "A thief"}, "correct_answer": "B"}, {"question": "How does Baroka win Sidi?", "options": {"A": "Force", "B": "Wit, flattery and trickery", "C": "Bribery", "D": "Lakunle’s help"}, "correct_answer": "B"}, {"question": "The play ends with Sidi choosing?", "options": {"A": "Lakunle", "B": "Baroka", "C": "Nobody", "D": "The stranger"}, "correct_answer": "B"}]'::jsonb);

UPDATE public.novels SET total_chapters = 3 WHERE id = 'b93b925d-1ed8-4328-b430-7ee719ce3dca';

-- ============ HARVEST OF CORRUPTION — Frank Ogodo Ogbeche ============
-- Structure note: the play runs in scenes (no act divisions). These four
-- guides follow the scene order: ch2 = scenes 1-2, ch3 = scenes 3-4,
-- ch4 = scenes 5-6, ch5 = scenes 7-8.
-- ch2
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('8d36fa90-73c2-405b-add4-72c18f0b18cb', 2, 'The Seeds Are Sown',
'## The Seeds Are Sown (Scenes 1–2)

**Setting:** Jacassa — a fictional African country. The Ministry of External Relations and the police headquarters at Darkin.

**What happens:** Aloho, a fresh graduate roaming jobless since youth service, runs into Ochuole, her notorious old schoolmate, now chief administrative officer to the Minister. Against roommate Ogeyi’s fierce warnings, Aloho accepts Ochuole’s promise of a ministry job. Meanwhile Chief Haladu Ade-Amaka, the pot-bellied Minister, buys off the police Commissioner (with cash and the dream of the Inspector-General seat) and bribes Justice Odili — while honest ACP Yakubu, watching a madman’s ravings, concludes the country needs rebirth and starts quietly investigating the ministry’s missing billions.

**Key points for JAMB:**
- **Exposition done right:** every principal is planted early — the naive graduate, the fixer, the good friend, the corrupt trinity (minister, police chief, judge) and the honest investigator.
- **Ogeyi vs Ochuole:** the play’s moral compass in one pair — caution against desperation.
- **Show boy the madman:** licensed truth-teller; his “madness” speaks sense the sane dare not.
- **Theme seeds:** unemployment breeding crime; corruption as a network, not one man.
- **Foreshadowing:** Ochuole dressing Aloho “sexy,” the Akpara Hotel meetings, the missing billions — all loaded guns.',
420, 3, NULL);

-- ch3
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('8d36fa90-73c2-405b-add4-72c18f0b18cb', 3, 'The Web Tightens',
'## The Web Tightens (Scenes 3–4)

**What happens:** Aloho is presented to Chief and hired as protocol officer — her real job description arrives fast: deliver a “package” to America. It is cocaine; she is caught at the airport. Chief buys her freedom (one million naira to Justice Odili; “want of evidence”) and seduces her along the way — she is now his mistress and pregnant. Ogeyi’s warnings curdle into fact. Simultaneously ACP Yakubu, blocked by his compromised Commissioner, pushes Inspector Inaku to squeeze Ayo the clerk (₦2,000 for photocopied evidence), building the paper case for the missing 1.2 billion naira.

**Key points for JAMB:**
- **Rising action:** every scene tightens — job, trip, arrest, acquittal, pregnancy, investigation.
- **Aloho’s arc:** naivety → complicity → victimhood. She ignored counsel; sympathy and judgment both attach to her.
- **Parallel plots:** Aloho’s ruin and Yakubu’s investigation climb together — classic well-made-play construction.
- **Dramatic devices:** suspense (the airport arrest), peripeteia (acquittal that damns instead of saving), the “package” as a perfect corruption symbol.
- **Character contrast:** Ogeyi’s loyalty vs Ochuole’s exploitation; Yakubu’s integrity vs the Commissioner’s appetite.',
420, 3, NULL);

-- ch4
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('8d36fa90-73c2-405b-add4-72c18f0b18cb', 4, 'Exposure',
'## Exposure (Scenes 5–6)

**What happens:** Pregnant and desperate, Aloho seeks an abortion at Wazobia Hospital — bribes the doctor, but Nurse Halimatu’s emergency interruption saves her (providence working through bureaucracy). Tormented by nightmares, she confesses all to Ogeyi and resolves to keep the baby and return to her parents. Ogeyi carries everything — the drug run, the affair, the pregnancy — to ACP Yakubu on a taped cassette, volunteering as principal witness. Yakubu routes the tape to the Presidency; the SSS moves in and arrests Chief, Ochuole and Ayo.

**Key points for JAMB:**
- **Moral turning point:** Aloho stops running and Ogeyi stops merely warning — confession plus testimony break the web.
- **Halimatu’s interruption:** chance or providence? Examiners love this — the play suggests heaven still intervenes.
- **The cassette:** evidence made physical; Ogeyi transforms from adviser to prosecutor’s star witness.
- **Theme — good vs evil as institutions:** SSS and Presidency versus ministry, police brass and bench. Justice requires the *whole* clean chain.
- **Irony:** men who bought every institution are caught by a nurse’s timing and a girl’s conscience.',
400, 3, NULL);

-- ch5
INSERT INTO public.novel_chapters (novel_id, chapter_number, title, content, word_count, estimated_reading_time, likely_questions)
VALUES ('8d36fa90-73c2-405b-add4-72c18f0b18cb', 5, 'The Harvest',
'## The Harvest (Scenes 7–8 and Resolution)

**What happens:** Aloho dies in childbirth; her baby girl lives. Okpotu brings the news — and her dying calls for Ogeyi. Grief hardens Ogeyi’s resolve to see it through. In court, the defence (Ajayi Adeleye) fights hard, but the evidence holds: Chief gets 25 years, the Commissioner and Justice Odili 20 each, Madam Hoha and Ochuole 10 each, Ayo 5. The gavel falls; the harvest is gathered.

**Key points for JAMB:**
- **Title meaning:** “whatever a man sows, that shall he reap” (Mrs Obi’s line, p.79) — corruption sown for years, prison reaped in a day.
- **Tragic cost:** Aloho pays with her life; justice arrives but does not resurrect. The play refuses cheap comfort.
- **Poetic justice, itemized:** know the sentences — Chief 25, Commissioner 20, Odili 20, Hoha 10, Ochuole 10, Ayo 5. Examiners *do* ask.
- **Theme — evil does not last:** every institution was bought, yet truth still won through the weakest links (a clerk’s photocopies, a girl’s testimony).
- **Structure:** regular/well-made plot — exposition (1–2), complication (3–4), crisis (5–6), catastrophe + resolution (7–8). Turning point: Aloho’s kangaroo acquittal; climax: the sentencing.
- **Style notes:** prose dialogue with pidgin touches; dramatic monologue (Yakubu); proverbs and biblical echoes (“sow/reap”); Jacassa as every-country.',
460, 3,
'[{"question": "Who is the Minister in the play?", "options": {"A": "Chief Haladu Ade-Amaka", "B": "ACP Yakubu", "C": "Justice Odili", "D": "Okpotu"}, "correct_answer": "A"}, {"question": "How much was missing from the ministry?", "options": {"A": "200 million", "B": "2.1 billion", "C": "1.2 billion naira", "D": "500 million"}, "correct_answer": "C"}, {"question": "Who connects Aloho to the Chief?", "options": {"A": "Ogeyi", "B": "Ochuole", "C": "Madam Hoha", "D": "Ayo"}, "correct_answer": "B"}, {"question": "What was in Aloho’s package?", "options": {"A": "Documents", "B": "Cocaine", "C": "Money", "D": "Jewellery"}, "correct_answer": "B"}, {"question": "Chief’s prison sentence?", "options": {"A": "10 years", "B": "20 years", "C": "25 years", "D": "Life"}, "correct_answer": "C"}, {"question": "Who reported Chief to the police?", "options": {"A": "Aloho", "B": "Ogeyi", "C": "Ayo", "D": "The Commissioner"}, "correct_answer": "B"}]'::jsonb);

UPDATE public.novels SET total_chapters = 5 WHERE id = '8d36fa90-73c2-405b-add4-72c18f0b18cb';
