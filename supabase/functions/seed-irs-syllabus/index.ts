import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Full JAMB Islamic Religious Studies (IRS) Syllabus 2025/2026
const irsSyllabus = [
  // ===== PART 1: THE QUR'AN AND HADITH =====
  
  // 1. Revelation of the Glorious Qur'an
  {
    subject: "Islamic Religious Studies",
    topic: "Revelation of the Glorious Qur'an",
    subtopic: "Prophet's Visits to Cave Hira",
    objectives: [
      "Analyse the Prophet's (SAW) visits to Cave Hira and the purpose",
      "Describe the Prophet's reaction to the first revelation and its importance",
      "Differentiate between the modes of revelation",
      "Explain why the Glorious Qur'an was revealed piecemeal"
    ],
    recommended_content: "Topics: (i) Visits of the Prophet (SAW) to Cave Hira (ii) His reaction to the first revelation and its importance (iii) Different modes of revelation (Q.42:51): inspiration behind the veil, through an angel, etc. (iv) Piecemeal revelation (Q.17:106) (Q.25:32). Recommended Texts: Ali, A.Y. (1975) The Holy Qur'an Text: Translation and Commentary, Leicester: The Islamic Foundation; Abdul, M.O.A. (1976) Studies in Islam Series Book 3, Lagos: IPB.",
    difficulty_level: "medium",
    estimated_reading_time: 35,
    order_index: 1
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Preservation of the Glorious Qur'an",
    subtopic: "Compilation and Standardization",
    objectives: [
      "Identify the personalities involved in the arrangement of the Glorious Qur'an",
      "Differentiate between Makkan and Madinan suwar",
      "Analyse how the Glorious Qur'an was recorded, compiled and standardized",
      "Evaluate the role played by the companions of the Prophet (SAW)"
    ],
    recommended_content: "Topics: (i) Complete arrangement (ii) Differences between Makkah and Madina suwar (iii) Recording, compilation and standardization of the Glorious Qur'an (iv) The role played by the Companions of the Prophet (SAW). Key companions include Abu Bakr, Umar, Uthman, Zaid ibn Thabit. Recommended Texts: Abdul, M.O.A. (1982) Studies in Islam Series Book 2, Lagos: IPB.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 2
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Importance of the Glorious Qur'an",
    subtopic: "Source of Guidance",
    objectives: [
      "Examine the importance of the Glorious Qur'an as a source of guidance",
      "Understand spiritual, moral, economic, political and socio-cultural guidance from the Qur'an"
    ],
    recommended_content: "The Glorious Qur'an serves as a source of guidance in spiritual, moral, economic, political and socio-cultural matters. It provides comprehensive guidance for all aspects of human life. Recommended Texts: Ali, A.Y. (1975) The Holy Qur'an Text: Translation and Commentary.",
    difficulty_level: "easy",
    estimated_reading_time: 25,
    order_index: 3
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Divine Authenticity of the Glorious Qur'an",
    subtopic: "Uniqueness and Preservation",
    objectives: [
      "Evaluate the proof of the divine authenticity of the Glorious Qur'an (Q.4:82) (Q.41:42)",
      "Evaluate the uniqueness of the Glorious Qur'an (Q.39:27) (Q.17:88) (Q.75:16-19)",
      "Examine the ways by which the Glorious Qur'an was preserved (Q.15:9)"
    ],
    recommended_content: "Topics: (i) Uniqueness of the Glorious Qur'an - Its inimitability, literary excellence, and challenge to produce similar text (ii) Divine preservation of the Glorious Qur'an - Allah's promise to preserve it. Key verses: Q.4:82, Q.41:42, Q.39:27, Q.17:88, Q.75:16-19, Q.15:9. Recommended Texts: Philips, A.A.B. (1997) Usool at-Tafseer, Kuala Lumpur: Noordeen.",
    difficulty_level: "medium",
    estimated_reading_time: 30,
    order_index: 4
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Tafsir (Qur'anic Exegesis)",
    subtopic: "Development and Types",
    objectives: [
      "Trace the origin and sources of Tafsir",
      "Evaluate the importance of Tafsir",
      "Compare the types of Tafsir"
    ],
    recommended_content: "Topics: (i) Historical development of Tafsir from the time of the Prophet (SAW) (ii) Importance of Tafsir in understanding the Qur'an (iii) Types of Tafsir: Tafsir bil-Ma'thur (based on tradition), Tafsir bil-Ra'y (based on reason), and Tafsir Ishari (mystical interpretation). Recommended Texts: Philips, A.A.B. (1997) Usool at-Tafseer, Kuala Lumpur: Noordeen.",
    difficulty_level: "hard",
    estimated_reading_time: 45,
    order_index: 5
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Introduction to Tajwid",
    subtopic: "Theory and Practice",
    objectives: [
      "Examine the meaning and importance of Tajwid",
      "Apply Tajwid rules in Qur'anic recitation"
    ],
    recommended_content: "Tajwid is the science of proper Qur'anic recitation, ensuring correct pronunciation of letters, observing elongation (madd), and proper articulation points (makharij). It is obligatory (fard) to recite the Qur'an with Tajwid. Recommended Texts: Muhammad, S.Q. (2010) al-Burhanu fi tajwidil Qur'an, Cairo: Shirkatul-Qudus.",
    difficulty_level: "medium",
    estimated_reading_time: 35,
    order_index: 6
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Study of Short Suwar (Part 1)",
    subtopic: "Surah al-Fatihah to Surah an-Nas",
    objectives: [
      "Recite with correct tajwid the Arabic texts of the suwar",
      "Translate the verses",
      "Deduce lessons from them",
      "Evaluate the teachings of the verses"
    ],
    recommended_content: "Study of Arabic text with tajwid: (a) al-Fatihah (Q.1) (b) al-Adiyat (Q.100) (c) al-Qari'ah (Q.101) (d) at-Takathur (Q.102) (e) al-Asr (Q.103) (f) al-Humazah (Q.104) (g) al-Maun (Q.107) (h) al-Kawthar (Q.108) (i) al-Kafirun (Q.109) (j) al-Nasr (Q.110) (k) al-Masad (Q.111) (l) al-Ikhlas (Q.112) (m) al-Falaq (Q.113) (n) an-Nas (Q.114). Recommended Texts: Ali, A.Y. (1975) The Holy Qur'an Text.",
    difficulty_level: "medium",
    estimated_reading_time: 60,
    order_index: 7
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Study of Short Suwar (Part 2)",
    subtopic: "Surah al-A'ala to Selected Ayats",
    objectives: [
      "Recite with correct tajwid the Arabic texts of the suwar",
      "Deduce lessons from them",
      "Evaluate their teachings"
    ],
    recommended_content: "Study of Arabic text with tajwid: (a) al-A'ala (Q.87) (b) ad-Duha (Q.93) (c) al-Inshirah (Q.94) (d) at-Tin (Q.95) (e) al-Alaq (Q.96) (f) al-Qadr (Q.97) (g) al-Bayyinah (Q.98) (h) al-Zilzal (Q.99) (i) Ayatul-Kursiy (Q.2:255) (j) Amanar-Rasul (Q.2:285-286) (k) Laqad jaakum (Q.9:128-129). Recommended Texts: Ali, A.Y. (1975) The Holy Qur'an Text.",
    difficulty_level: "medium",
    estimated_reading_time: 55,
    order_index: 8
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Hadith Literature",
    subtopic: "History and Authentication",
    objectives: [
      "Evaluate the history of Hadith from the time of the Prophet (SAW) to the period of six authentic collectors",
      "Analyse the Isnad (chain of narrators)",
      "Analyse the Matn (text of hadith)",
      "Distinguish between Hadith Sahih, Hassan and Da'if"
    ],
    recommended_content: "Topics: (a) History of Hadith literature - Collection of Hadith from the time of the Prophet (SAW) to the period of the six authentic collectors (b) Authentication of Hadith: (i) Isnad (Asma'ur-rijal) (ii) Matn (iii) Classification of Hadith into Sahih, Hassan and Da'if. Recommended Texts: Quadri, Y.A. et al (1990) Al-Iziyyah for the English Audience.",
    difficulty_level: "hard",
    estimated_reading_time: 50,
    order_index: 9
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Hadith and the Glorious Qur'an",
    subtopic: "Relationship and Importance",
    objectives: [
      "Examine the importance of Hadith",
      "Distinguish between Hadith and the Glorious Qur'an",
      "Understand how Hadith explains and complements the Qur'an"
    ],
    recommended_content: "The relationship between Hadith and the Glorious Qur'an: Hadith serves as explanation, elaboration, and practical application of Qur'anic teachings. Similarities and differences between Hadith and the Glorious Qur'an. Recommended Texts: Sambo, M.B. et al (1984) Islamic Religious Knowledge for WASC Book 1, Lagos: IPB.",
    difficulty_level: "medium",
    estimated_reading_time: 35,
    order_index: 10
  },
  {
    subject: "Islamic Religious Studies",
    topic: "The Six Sound Collectors of Hadith",
    subtopic: "Biographies and Works",
    objectives: [
      "Evaluate their biographies and works",
      "Understand the methodology of each collector"
    ],
    recommended_content: "The six sound collectors (Kutub al-Sittah): (1) Imam al-Bukhari (194-256 AH) - Sahih al-Bukhari (2) Imam Muslim (204-261 AH) - Sahih Muslim (3) Imam Abu Dawud (202-275 AH) - Sunan Abu Dawud (4) Imam al-Tirmidhi (209-279 AH) - Jami' al-Tirmidhi (5) Imam al-Nasa'i (215-303 AH) - Sunan al-Nasa'i (6) Imam Ibn Majah (209-273 AH) - Sunan Ibn Majah. Recommended Texts: Sambo, M.B. et al (1984) Islamic Religious Knowledge for WASC.",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 11
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Muwatta and Imam Malik",
    subtopic: "Biography and Work",
    objectives: [
      "Evaluate the biography of Imam Malik",
      "Analyse his work - al-Muwatta"
    ],
    recommended_content: "Imam Malik ibn Anas (93-179 AH) - The Imam of Madinah, founder of the Maliki school of jurisprudence. His book al-Muwatta is considered one of the earliest and most authentic collections of hadith. It includes hadith, opinions of companions, and legal rulings. Recommended Texts: Quadri, Y.A. et al (1990) Al-Iziyyah for the English Audience.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 12
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Selected Ahadith from an-Nawawi's Collection",
    subtopic: "Study of 20 Ahadith",
    objectives: [
      "Interpret the ahadith in Arabic",
      "Apply them in daily life"
    ],
    recommended_content: "Study of the Arabic texts of the following ahadith from an-Nawawi's collection: Hadith 1 (Intentions), 3 (Pillars of Islam), 5 (Innovation), 6 (Halal and Haram), 7 (Religion is Sincerity), 9 (What Allah Obligated), 10 (Pure Earnings), 11 (Leaving Doubt), 12 (Leaving What Does Not Concern), 13 (Love for Brother), 15 (Speech and Action), 16 (Do Not Be Angry), 18 (Taqwa), 19 (Allah's Protection), 21 (Say I Believe), 22 (Paradise through Good Deeds), 25 (Charity), 27 (Righteousness), 34 (Changing Wrong), 41 (Following the Prophet). Recommended Texts: An-Nawawi's 40 Hadith collection.",
    difficulty_level: "hard",
    estimated_reading_time: 60,
    order_index: 13
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Moral Lessons in the Qur'an and Hadith",
    subtopic: "Admonition of Luqman and Goodness to Parents",
    objectives: [
      "Apply the teachings of the verses in daily life",
      "Demonstrate goodness to parents as taught in Islam"
    ],
    recommended_content: "Topics: (a) General moral lessons contained in the admonition of Sage Luqman to his son (Q.31:18-20) - humility, modesty in walking and speaking (b) Goodness to parents (Q.17:23-24) - kindness, respect, obedience, and supplication for parents. Recommended Texts: Ali, A.Y. (1975) The Holy Qur'an Text: Translation and Commentary.",
    difficulty_level: "easy",
    estimated_reading_time: 30,
    order_index: 14
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Moral Lessons: Honesty and Prohibition of Vices",
    subtopic: "Truthfulness and Forbidden Acts",
    objectives: [
      "Demonstrate the teachings of the verses in daily life",
      "Understand and avoid prohibited actions"
    ],
    recommended_content: "Topics: (c) Honesty (Q.2:42)(Q.61:2-3) (d) Prohibition of: bribery and corruption (Q.2:188), alcohol and gambling (Q.2:219)(Q.5:93-94), stealing and fraud (Q.5:41)(Q.83:1-5), smoking, drug abuse and other intoxicants (Q.2:172-173, 195, 219)(Q.4:43)(Q.5:3)(Q.6:118-121), arrogance (Q.31:18-19), and extravagance (Q.17:26-27)(Q.31:18-19). Recommended Texts: Lemu, A. (1993) Islamic Studies for SSS Books.",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 15
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Moral Lessons: Dignity of Labour and Modesty",
    subtopic: "Work Ethics and Dress Code",
    objectives: [
      "Apply the teachings of the verses in daily life",
      "Demonstrate dignity of labour and modesty in dress"
    ],
    recommended_content: "Topics: (e) Dignity of labour (Q.62:10)(Q.78:11) - Hadith from Bukhari and Ibn Majah: 'that one of you takes his rope....', 'never has anyone of you eaten.....' (f) Behaviour and modesty in dressing (Q.24:27-31)(Q.33:59) - proper covering, lowering gaze, modest attire for men and women. Recommended Texts: Lemu, A. (1993) Islamic Studies for SSS Books.",
    difficulty_level: "easy",
    estimated_reading_time: 30,
    order_index: 16
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Moral Lessons: Sexual Ethics",
    subtopic: "Prohibition of Zina and Related Sins",
    objectives: [
      "Apply the teachings of the verses in daily life",
      "Understand Islamic sexual ethics"
    ],
    recommended_content: "Topics: (g) Adultery and fornication (Q.17:32)(Q.24:2), homosexuality (Q.11:77-78), and obscenity (Q.4:14-15). Hadith - 'No one of you should meet a woman privately......' (Bukhari). Islam prohibits all forms of sexual immorality and emphasizes purity and chastity. Recommended Texts: Doi, A.R.I (1997) Shariah: The Islamic Law.",
    difficulty_level: "medium",
    estimated_reading_time: 35,
    order_index: 17
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Moral Lessons: Leadership and Trust",
    subtopic: "Justice, Obligations and Promises",
    objectives: [
      "Apply the teachings of the verses and hadith to daily life",
      "Demonstrate leadership qualities and trustworthiness"
    ],
    recommended_content: "Topics: (h) Leadership (Q.2:124) and justice (Q.4:58, 135)(Q.5:9) - Hadith: 'Take care, everyone of you is a governor......concerning his subjects' (al-Bukhari) (i) Trust and obligations (Q.4:58)(Q.5:1) and promises (Q.16:91) - Hadith: 'He has (really) no faith.....not fulfilled his promise' (Baihaqi). Recommended Texts: Sambo, M.B. et al (1984) Islamic Religious Knowledge for WASC Book 3.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 18
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Moral Lessons: Piety, Tolerance and Unity",
    subtopic: "Taqwa, Patience and Brotherhood",
    objectives: [
      "Apply the teachings of the verses and ahadith in daily life",
      "Demonstrate piety, patience, and brotherhood"
    ],
    recommended_content: "Topics: (j) Piety/Taqwa (Q.2:177)(Q.3:102)(Q.49:13) - Hadith 18 and 35 of an-Nawawi (k) Tolerance, perseverance and patience (Q.2:153-157)(Q.3:200)(Q.103:3) - Hadith 16 of an-Nawawi (l) Unity and brotherhood (Q.3:103)(Q.8:46)(Q.49:10) - Hadith 35 of an-Nawawi. Recommended Texts: An-Nawawi's 40 Hadith collection.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 19
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Moral Lessons: Enjoining Good and Forbidding Evil",
    subtopic: "Al-Amr bil-Ma'ruf wan-Nahy 'anil-Munkar",
    objectives: [
      "Demonstrate the teachings of the verses and hadith in daily life",
      "Apply the principle of commanding good and forbidding evil"
    ],
    recommended_content: "Topics: (m) Enjoining what is good and forbidding what is wrong (Q.3:104, 110)(Q.16:90) - Hadith 25 and 34 of an-Nawawi. This is a collective obligation (fard kifayah) upon the Muslim community. Recommended Texts: An-Nawawi's 40 Hadith collection; Lemu, A. (1993) Islamic Studies for SSS Book 1.",
    difficulty_level: "medium",
    estimated_reading_time: 35,
    order_index: 20
  },

  // ===== PART II: TAWHID AND FIQH =====
  
  {
    subject: "Islamic Religious Studies",
    topic: "Tawhid (Islamic Monotheism)",
    subtopic: "Concept and Importance",
    objectives: [
      "Analyse the concepts of Tawhid",
      "Understand the importance of Tawhid as the foundation of Islam"
    ],
    recommended_content: "Tawhid is the Islamic doctrine of the absolute oneness of Allah. It is the fundamental concept in Islam and forms the basis of all Islamic beliefs and practices. Types: Tawhid ar-Rububiyyah (Lordship), Tawhid al-Uluhiyyah (Worship), Tawhid al-Asma was-Sifat (Names and Attributes). Recommended Texts: Ali, M.M. (Undated) The Religion of Islam, Lahore.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 21
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Kalimatush-Shahadah",
    subtopic: "Declaration of Faith",
    objectives: [
      "Evaluate the significance of kalimatush-shahadah",
      "Identify the verses dealing with the Oneness of Allah",
      "Determine the significance of the servanthood of the Prophet Muhammad (SAW)",
      "Evaluate the significance of the universality of Prophet Muhammad's message",
      "Examine the significance of the finality of the Prophethood of Muhammad (SAW)"
    ],
    recommended_content: "Topics: (i) Meaning and importance of Shahadah (ii) The Oneness of Allah (Q.3:19)(Q.2:255)(Q.112:1-4) (iii) The servanthood and messengership of Prophet Muhammad (SAW) (Q.3:144)(Q.18:110)(Q.48:29)(Q.34:28) (iv) Universality of his message (Q.7:158)(Q.34:28) (v) Finality of his Prophethood (Q.33:40). Recommended Texts: Abdul, M.O.A. (1976) Studies in Islam Series Book 3.",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 22
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Shirk (Polytheism)",
    subtopic: "Beliefs Incompatible with Tawhid",
    objectives: [
      "Determine what actions and beliefs constitute shirk",
      "Determine the implications of beliefs and actions of shirk",
      "Avoid such actions"
    ],
    recommended_content: "Beliefs incompatible with Tawhid: (i) Worship of Idols (Q.4:48)(Q.22:31) (ii) Ancestral worship (Q.4:48, 116)(Q.21:66-67) (iii) Trinity (Q.4:171)(Q.5:76)(Q.112:1-4) (iv) Atheism (Q.45:24)(Q.72:6)(Q.79:17-22). Shirk is the greatest sin in Islam and negates all good deeds. Recommended Texts: Ali, M.M. The Religion of Islam.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 23
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Practices Incompatible with Tawhid",
    subtopic: "Superstition, Magic and Innovation",
    objectives: [
      "Identify practices that are incompatible with Islamic principles of Tawhid",
      "Determine those practices that are incompatible with Tawhid",
      "Shun off those actions",
      "Demonstrate the teachings of the verses and ahadith in daily life"
    ],
    recommended_content: "Topics: (i) Superstition (Q.25:43)(Q.72:6) (ii) Fortune-telling (Q.15:16-18)(Q.37:6-10) (iii) Magic and witchcraft (Q.2:102)(Q.20:69, 73)(Q.26:46) (iv) Cult worship (Q.17:23)(Q.4:48) (v) Innovation/Bid'ah (Q.4:116) and Hadith 5 and 28 of an-Nawawi. Recommended Texts: Doi, A.R.I (1997) Shariah: The Islamic Law.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 24
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Articles of Faith (Arkan al-Iman)",
    subtopic: "Belief in Allah",
    objectives: [
      "Examine the significance of the article of faith",
      "Examine the attributes of Allah",
      "Examine the works of Allah"
    ],
    recommended_content: "Topics: (a) Belief in Allah: (i) Existence of Allah (Q.2:255)(Q.52:35-36) (ii) Attributes of Allah (Q.59:22-24) - The 99 Names of Allah (iii) The works of Allah (Q.27:59-64) - Creation, sustenance, guidance. Recommended Texts: Ali, A.Y. (1975) The Holy Qur'an Text: Translation and Commentary.",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 25
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Articles of Faith (Continued)",
    subtopic: "Angels, Books, Prophets, Last Day, Destiny",
    objectives: [
      "Examine the belief in Allah's books",
      "Identify the belief in the Prophets of Allah and its significance",
      "Analyse the belief in the Last Day and its significance",
      "Evaluate the belief in destiny and its significance"
    ],
    recommended_content: "Topics: (b) Belief in Allah's angels (Q.2:177, 285)(Q.8:50)(Q.16:2) (c) His books (Q.2:253, 285)(Q.3:3) (d) His Prophets: Ulul-azmi (Q.4:163-164) (e) The Last Day: Yawm-al-Ba'th (Q.23:15-16)(Q.70:4) (f) Destiny: distinction between Qada and Qadar (Q.2:117)(Q.16:40)(Q.36:82). Recommended Texts: Abdul, M.O.A. (1982) Studies in Islam Series Book 2.",
    difficulty_level: "hard",
    estimated_reading_time: 50,
    order_index: 26
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Ibadat (Acts of Worship)",
    subtopic: "Good Deeds and Taharah",
    objectives: [
      "Determine what constitutes acts of ibadah",
      "Distinguish between the different types of taharah"
    ],
    recommended_content: "Topics: (a) Good deeds (Q.3:134)(Q.6:160)(Q.2:177)(Q.31:8)(Q.103:1-3) - 26th Hadith of an-Nawawi (b) Taharah (purification), its types and importance: al-istinja'/istijmar, al-wudu', at-tayammum and al-ghusl (Q.2:222)(Q.5:7) - Hadith 10 and 23 of an-Nawawi. Recommended Texts: Doi, A.R.I (1997) Shariah: The Islamic Law.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 27
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Salah (Prayer)",
    subtopic: "Importance, Types and Requirements",
    objectives: [
      "Assess the importance of salah to a Muslim's life",
      "Analyse different types of salah",
      "Identify things that vitiate salah"
    ],
    recommended_content: "Topics: (i) Importance of Salah (Q.2:45)(Q.20:132)(Q.29:45) - Hadith 23rd of an-Nawawi (ii) Description and types of salah: Fard (obligatory), Sunnah, Nafl, Witr, Tarawih, Jumu'ah, Eid, Janazah (iii) Things that vitiate salah: breaking wudu, deliberate speech, excessive movement, eating/drinking. Recommended Texts: Lemu, A. (1993) Islamic Studies for SSS Book 1.",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 28
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Zakah (Obligatory Charity)",
    subtopic: "Types, Collection and Distribution",
    objectives: [
      "Differentiate between the various types of zakah and the time of giving them out",
      "Determine how to collect and distribute zakah",
      "Distinguish between zakah and sadaqah"
    ],
    recommended_content: "Topics: (i) Types and importance: zakatul-fitr, zakatul-mal, al-an'am and al-harth (Q.2:267)(Q.9:103) - 3rd Hadith of an-Nawawi (ii) Collection and disbursement to 8 categories (Q.9:60) (iii) Difference between Zakah (obligatory) and Sadaqah (voluntary charity). Nisab and haul requirements. Recommended Texts: Doi, A.R.I (1997) Shariah: The Islamic Law.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 29
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Sawm (Fasting)",
    subtopic: "Types, Exemptions and Violations",
    objectives: [
      "Compare the various types of sawm",
      "Determine the people who are exempted from fasting",
      "Determine things that vitiate fasting"
    ],
    recommended_content: "Topics: (i) Types and importance: fard (obligatory Ramadan), sunnah, qada (make-up), kaffarah (expiation) (Q.2:183-185) - 3rd Hadith of an-Nawawi (ii) People exempted: travelers, sick, pregnant/nursing women, elderly, children (iii) Things that vitiate sawm: eating, drinking, sexual relations, deliberate vomiting. Recommended Texts: Lemu, A. (1993) Islamic Studies for SSS Books.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 30
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Hajj (Pilgrimage)",
    subtopic: "Importance, Types and Requirements",
    objectives: [
      "Examine the importance of Hajj",
      "Differentiate between the types of Hajj",
      "Determine the essentials of Hajj",
      "Evaluate the conditions for performance of Hajj",
      "Differentiate between Hajj and Umrah"
    ],
    recommended_content: "Topics: (i) Importance of Hajj (Q.2:158, 197)(Q.3:97)(Q.22:27-28) (ii) Types: Ifrad, Qiran, Tamattu' (iii) Essentials (Arkan al-Hajj): Ihram, Wuquf at Arafat, Tawaf, Sa'i (iv) Conditions: Islam, sanity, puberty, physical/financial ability (v) Differences between Hajj and Umrah. Recommended Texts: Doi, A.R.I (1997) Shariah: The Islamic Law.",
    difficulty_level: "hard",
    estimated_reading_time: 50,
    order_index: 31
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Jihad",
    subtopic: "Concept, Types and Manner",
    objectives: [
      "Examine the concepts of jihad and its types",
      "Evaluate the manner of carrying out jihad and its lessons"
    ],
    recommended_content: "Jihad: Concept, kinds, manner and lessons (Q.2:190-193)(Q.22:39-40). Types: Jihad an-Nafs (struggle against self), Jihad ash-Shaytan (against Satan), Jihad bil-Lisan (by tongue), Jihad bil-Yad (by hand), Jihad bis-Saif (armed struggle - only in self-defense). Rules of engagement: no killing of civilians, no destruction of property, no forcing religion. Recommended Texts: Abdul, M.O.A. (1988) The Classical Caliphate.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 32
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Marriage in Islam",
    subtopic: "Importance, Conditions and Rights",
    objectives: [
      "Analyse the importance of marriage",
      "Determine the category of women prohibited to a man to marry",
      "Examine the conditions for validity of marriage",
      "Determine the rights and duties of the spouse",
      "Evaluate polygamy and its significance",
      "Examine the ill-treatment of wife in marriage"
    ],
    recommended_content: "Topics: (a) Marriage - (i) Importance (Q.16:72)(Q.24:32)(Q.30:20-21) (ii) Prohibited categories (Q.2:221)(Q.4:22-24) (iii) Conditions for validity: offer, acceptance, mahr, witnesses, wali (Q.4:4, 24-25) (iv) Rights and duties of spouses (Q.4:34-35)(Q.20:132)(Q.65:6-7) (v) Polygamy (Q.4:3, 129) (b) Idrar - ill-treatment of wife (Q.65:1-3). Recommended Texts: Doi, A.R.I (1997) Shariah: The Islamic Law.",
    difficulty_level: "hard",
    estimated_reading_time: 55,
    order_index: 33
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Divorce in Islam",
    subtopic: "Types, Iddah and Custody",
    objectives: [
      "Analyse the attitude of Islam to divorce",
      "Examine the different types of divorce",
      "Differentiate between the various kinds of iddah",
      "Analyse its duration and significance",
      "Determine the prohibited forms of ending marriage",
      "Determine who has the right to custody of children"
    ],
    recommended_content: "Topics: (i) Attitude of Islam to divorce (Q.2:228)(Q.4:34-35) - Hadith: 'Of all things lawful.....most hateful to Allah..' (Abu Dawud) (ii) Kinds: Talaq, Khul', Faskh, Mubara'ah, Li'an (Q.2:229-230)(Q.24:6-9) (iii) Iddah: kinds, duration and importance (Q.2:228, 234) (iv) Prohibited forms: Ila' and Zihar (Q.2:226-227)(Q.58:2-4) (v) Custody of children (Hadanah). Recommended Texts: Doi, A.R.I (1997) Shariah: The Islamic Law.",
    difficulty_level: "hard",
    estimated_reading_time: 50,
    order_index: 34
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Inheritance (Al-Mirath)",
    subtopic: "Heirs and Shares",
    objectives: [
      "Evaluate the significance of inheritance",
      "Identify the categories of the Qur'anic heirs",
      "Determine the share of each heir"
    ],
    recommended_content: "Topics: (i) Importance of inheritance in Islam (ii) Heirs and their shares (Q.4:7-8, 11-12, 176) - Primary heirs: husband, wife, son, daughter, father, mother. Shares: husband (1/4 or 1/2), wife (1/8 or 1/4), son (residue), daughter (1/2 or 2/3), father (1/6 + residue), mother (1/6 or 1/3). Recommended Texts: Doi, A.R.I (1997) Shariah: The Islamic Law.",
    difficulty_level: "hard",
    estimated_reading_time: 50,
    order_index: 35
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Sources of Islamic Law",
    subtopic: "Primary Sources",
    objectives: [
      "Analyse the four major sources of Islamic law"
    ],
    recommended_content: "The four major sources of Islamic law: (1) The Qur'an - primary source, divine revelation (2) Sunnah - sayings, actions, and approvals of the Prophet (SAW) (3) Ijma' - consensus of scholars (4) Qiyas - analogical reasoning. Secondary sources: Istihsan, Maslaha Mursala, 'Urf. Recommended Texts: Doi, A.R.I (1997) Shariah: The Islamic Law.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 36
  },
  {
    subject: "Islamic Religious Studies",
    topic: "The Four Sunni Schools of Law",
    subtopic: "Madhahib and Their Founders",
    objectives: [
      "Examine the biography of the Sunni schools of law",
      "Examine their contributions"
    ],
    recommended_content: "The four Sunni Schools of Law (Madhahib): (1) Hanafi - founded by Imam Abu Hanifa (80-150 AH), emphasizes reason (2) Maliki - founded by Imam Malik (93-179 AH), emphasizes practice of Madinah (3) Shafi'i - founded by Imam Shafi'i (150-204 AH), systematized usul al-fiqh (4) Hanbali - founded by Imam Ahmad ibn Hanbal (164-241 AH), emphasizes hadith. Recommended Texts: Quadri, Y.A. et al (1990) Al-Iziyyah for the English Audience.",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 37
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Islamic Economic System",
    subtopic: "Riba, Tatfif and Hoarding",
    objectives: [
      "Analyse Islamic attitude to Riba (interest/usury)",
      "Relate at-tatfif and its negative consequences",
      "Examine ihtikar (hoarding) and its implications on society"
    ],
    recommended_content: "Topics: (i) Islamic attitude to Riba (Q.2:275-280)(Q.3:130)(Q.4:161) - Hadith 6th of an-Nawawi (ii) At-tatfif - cheating in weights and measures (Q.83:1-6) (iii) Hoarding (ihtikar) (Q.9:34) - prohibited during times of need. Recommended Texts: Doi, A.R.I (1997) Shariah: The Islamic Law.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 38
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Islamic Sources of Revenue",
    subtopic: "Zakah, Jizyah, Kharaj, Ghanimah and Baitul-Mal",
    objectives: [
      "Identify the sources of revenue in Islam",
      "Evaluate the disbursement of the revenue",
      "Determine the uses of baitul-mal in the Ummah",
      "Differentiate between the Islamic and Western economic systems"
    ],
    recommended_content: "Topics: (iv) Islamic sources of revenue: Zakah (obligatory charity), Jizyah (tax on non-Muslims for protection), Kharaj (land tax), Ghanimah (war booty) (v) Baitul-mal as an institution of socio-economic welfare - treasury of the Muslim state (vi) Differences between Islamic and Western economic systems - prohibition of interest, emphasis on real trade. Recommended Texts: Abdul, M.O.A. (1988) The Classical Caliphate.",
    difficulty_level: "hard",
    estimated_reading_time: 45,
    order_index: 39
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Islamic Political System",
    subtopic: "Sovereignty, Shura, Justice and Rights",
    objectives: [
      "Analyse the concept of Allah's sovereignty",
      "Examine the concept of Shura in Islam",
      "Evaluate the concept of justice and accountability",
      "Examine the rights of non-Muslims in an Islamic state",
      "Differentiate between the Islamic and Western political systems"
    ],
    recommended_content: "Topics: (i) Allah as the Sovereign (Q.3:26-27) (ii) The concept of Shura/consultation (Q.3:159)(Q.42:38) (iii) The concept of 'Adalah/justice (Q.5:9)(Q.17:13-14, 36) and Mas'uliyah/accountability (Q.4:58)(Q.102:8) (iv) Rights of non-Muslims in an Islamic state (Q.2:256)(Q.6:108) (v) Differences between Islamic and Western political systems. Recommended Texts: Abdul, M.O.A. (1988) The Classical Caliphate.",
    difficulty_level: "hard",
    estimated_reading_time: 50,
    order_index: 40
  },

  // ===== PART III: ISLAMIC HISTORY AND CIVILIZATION =====
  
  {
    subject: "Islamic Religious Studies",
    topic: "Pre-Islamic Arabia (Jahiliyyah)",
    subtopic: "Practices and Reforms",
    objectives: [
      "Distinguish the different types of practices common to the Arabs of al-Jahiliyyah",
      "Trace the reforms brought about by Islam to the Jahiliyyah practices"
    ],
    recommended_content: "Topics: (i) Jahiliyyah practices: idol worship, infanticide (burying female children alive), polyandry, gambling, usury, alcoholism, tribal warfare, blood feuds (ii) Islamic reforms: Tawhid replaced polytheism, equality of genders, prohibition of harmful practices, establishment of justice. Recommended Texts: Hay Lal, M. (1982) The Life of Muhammad (SAW), Academic Press.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 41
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Life of Prophet Muhammad (SAW)",
    subtopic: "Birth, Early Life and Call to Prophethood",
    objectives: [
      "Account for the birth and early life of the Prophet Muhammad (SAW)",
      "Provide evidence for the call of Muhammad (SAW) to Prophethood"
    ],
    recommended_content: "Topics: (i) Birth (570 CE) and early life - orphaned, raised by grandfather Abdul Muttalib then uncle Abu Talib, known as As-Sadiq Al-Amin (the truthful, trustworthy), marriage to Khadijah (ii) Call to Prophethood at age 40 - revelation in Cave Hira, first verses of Surah Al-Alaq. Recommended Texts: Hay Lal, M. (1982) The Life of Muhammad (SAW); Rahim, A. (1992) Islamic History, Lagos: IPB.",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 42
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Da'wah in Makkah and Madinah",
    subtopic: "Preaching and Migration",
    objectives: [
      "Analyse the Da'wah activities of the Prophet Muhammad (SAW) in Makkah and Madinah",
      "Account for the Hijrah of the Prophet Muhammad (SAW)"
    ],
    recommended_content: "Topics: (iii) Da'wah in Makkah - secret preaching, public preaching, persecution of early Muslims (iv) The Hijrah (622 CE) - migration to Madinah, establishment of the first Islamic state, significance as start of Islamic calendar. Bay'ah of Aqaba, selection of Madinah. Recommended Texts: Hay Lal, M. (1982) The Life of Muhammad (SAW).",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 43
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Administration of the Ummah",
    subtopic: "State Building and the Role of the Mosque",
    objectives: [
      "Analyse the administration of the Muslim Ummah in Madinah"
    ],
    recommended_content: "Topics: (v) Administration of the Ummah and the role of the mosque (Q.3:159)(Q.4:58, 135) - Constitution of Madinah, brotherhood between Muhajirun and Ansar, establishment of Masjid Nabawi. The mosque served as: center of worship, education, governance, social gatherings, judicial courts, military headquarters. Recommended Texts: Abdul, M.O.A. (1988) The Classical Caliphate.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 44
  },
  {
    subject: "Islamic Religious Studies",
    topic: "The Major Battles",
    subtopic: "Badr, Uhud and Khandaq",
    objectives: [
      "Account for the causes and effects of the Battles of Badr, Uhud and Khandaq"
    ],
    recommended_content: "Topics: (vi) The Battles: (a) Badr (2 AH/624 CE) - first major battle, 313 Muslims vs 1000 Quraish, decisive Muslim victory (b) Uhud (3 AH/625 CE) - initial Muslim advantage lost due to archers leaving positions, martyrdom of Hamza (c) Khandaq/Trench (5 AH/627 CE) - siege of Madinah, trench strategy by Salman al-Farisi, coalition of enemies failed. Recommended Texts: Hay Lal, M. (1982) The Life of Muhammad (SAW).",
    difficulty_level: "hard",
    estimated_reading_time: 55,
    order_index: 45
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Treaty of Hudaibiyyah and Conquest of Makkah",
    subtopic: "Peace Agreement and Victory",
    objectives: [
      "Trace the circumstances leading to the formulation of the Treaty of Hudaibiyyah",
      "Account for the Conquest of Makkah"
    ],
    recommended_content: "Topics: (vii) The Treaty of al-Hudaibiyyah (6 AH/628 CE) - 10-year peace treaty, described as 'manifest victory' (Q.48:1), terms appeared unfavorable but strategically beneficial (viii) Conquest of Makkah (8 AH/630 CE) - breach of treaty by Quraish, bloodless conquest, general amnesty, destruction of idols in Ka'bah. Recommended Texts: Hay Lal, M. (1982) The Life of Muhammad (SAW).",
    difficulty_level: "hard",
    estimated_reading_time: 50,
    order_index: 46
  },
  {
    subject: "Islamic Religious Studies",
    topic: "The Farewell Pilgrimage",
    subtopic: "Hijjatul-Wada and Final Sermon",
    objectives: [
      "Examine the farewell pilgrimage and its lessons"
    ],
    recommended_content: "Topics: (viii) Hijjatul-Wada (10 AH/632 CE) - the only Hajj performed by the Prophet (SAW). Farewell Sermon at Arafat: sanctity of life and property, equality of all humans, rights of women, prohibition of interest, unity of Muslims, completion of religion (Q.5:3). Recommended Texts: Hay Lal, M. (1982) The Life of Muhammad (SAW).",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 47
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Qualities of Prophet Muhammad (SAW)",
    subtopic: "Character and Lessons",
    objectives: [
      "Analyse the qualities of Muhammad (SAW) and their relevance to the life of a Muslim"
    ],
    recommended_content: "Topics: (ix) Qualities of Muhammad (SAW): Truthfulness (As-Sadiq), Trustworthiness (Al-Amin), Kindness, Mercy, Patience, Justice, Humility, Generosity, Bravery, Forgiveness. Lessons for Muslims: following his Sunnah in all aspects of life, character development, interpersonal relations. Recommended Texts: Hay Lal, M. (1982) The Life of Muhammad (SAW).",
    difficulty_level: "easy",
    estimated_reading_time: 35,
    order_index: 48
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Abu Bakr As-Siddiq",
    subtopic: "First Rightly Guided Caliph",
    objectives: [
      "Trace the biography of Abu Bakr As-Siddiq",
      "Evaluate his contributions to the development of Islam"
    ],
    recommended_content: "Abu Bakr As-Siddiq (632-634 CE): First person to accept Islam among adult men, companion in Hijrah, father of Aisha (RA). Caliphate contributions: Wars of Apostasy (Ridda), compilation of the Qur'an, expansion of Islam, establishment of Baitul-Mal, maintained unity of the Ummah. Known for piety, simplicity, and justice. Recommended Texts: Abdul, M.O.A. (1988) The Classical Caliphate.",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 49
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Umar ibn al-Khattab",
    subtopic: "Second Rightly Guided Caliph",
    objectives: [
      "Trace the biography of Umar ibn al-Khattab",
      "Evaluate his contributions to the development of Islam"
    ],
    recommended_content: "Umar ibn al-Khattab (634-644 CE): Initially opposed Islam, later became a strong supporter. Caliphate contributions: Major territorial expansion (Persia, Egypt, Syria), establishment of Islamic calendar (Hijri), creation of diwan (register), appointment of judges, establishment of shura, public welfare programs, night patrols to check on citizens. Known for justice and simplicity. Recommended Texts: Abdul, M.O.A. (1988) The Classical Caliphate.",
    difficulty_level: "medium",
    estimated_reading_time: 50,
    order_index: 50
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Uthman ibn Affan",
    subtopic: "Third Rightly Guided Caliph",
    objectives: [
      "Trace the biography of Uthman ibn Affan",
      "Evaluate his contributions to the development of Islam"
    ],
    recommended_content: "Uthman ibn Affan (644-656 CE): Married two daughters of the Prophet (SAW), known as Dhun-Nurain (possessor of two lights). Caliphate contributions: Standardization and distribution of the Qur'an (Uthmani codex), expansion of Masjid Nabawi, naval expansion, continuation of conquests. Known for generosity, shyness, and funding of Muslims' needs. Assassinated during civil unrest. Recommended Texts: Abdul, M.O.A. (1988) The Classical Caliphate.",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 51
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Ali ibn Abi Talib",
    subtopic: "Fourth Rightly Guided Caliph",
    objectives: [
      "Trace the biography of Ali ibn Abi Talib",
      "Evaluate his contributions to the development of Islam"
    ],
    recommended_content: "Ali ibn Abi Talib (656-661 CE): Cousin and son-in-law of the Prophet (SAW), first young person to accept Islam. Caliphate contributions: Known for knowledge, wisdom, bravery, and eloquence. Faced internal challenges: Battle of Jamal against Aisha, Talha, Zubair; Battle of Siffin against Muawiya; Khawarij problem. Established principles of governance and justice. Assassinated by a Kharijite. Recommended Texts: Abdul, M.O.A. (1988) The Classical Caliphate.",
    difficulty_level: "medium",
    estimated_reading_time: 50,
    order_index: 52
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Early Contact of Islam with Africa",
    subtopic: "Hijrah to Abyssinia and Egypt",
    objectives: [
      "Evaluate the circumstances leading to the Hijrah to Abyssinia",
      "Give reasons for the spread of Islam in Egypt"
    ],
    recommended_content: "Topics: (i) Hijrah to Abyssinia (615 CE) - First migration of Muslims due to persecution in Makkah, welcomed by Christian King Negus (Najashi), demonstrated interfaith tolerance (ii) The spread of Islam to Egypt - conquest during Umar's caliphate by Amr ibn al-As (641 CE), establishment of Fustat, spread through trade and preaching. Recommended Texts: Trimingham, J.S. (1993) A History of Islam in West Africa, Oxford: OUP.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 53
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Spread of Islam in West Africa",
    subtopic: "Role of Traders, Teachers and Reformers",
    objectives: [
      "Account for the roles of traders, teachers, preachers, Murabitun, Sufi orders and Mujaddidun in the spread of Islam in West Africa"
    ],
    recommended_content: "Topics: (iii) Agents of Islam in West Africa: (a) Traders - Trans-Saharan trade brought Muslim merchants who integrated into local societies (b) Teachers/Ulama - established schools and taught Arabic and Islamic sciences (c) Preachers - itinerant scholars spreading the message (d) Murabitun - reform movement from Mauritania (e) Sufi orders - Qadiriyya, Tijaniyya provided spiritual framework (f) Mujaddidun - reformers like Uthman dan Fodio. Recommended Texts: Trimingham, J.S. (1993) A History of Islam in West Africa.",
    difficulty_level: "hard",
    estimated_reading_time: 50,
    order_index: 54
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Impact of Islam on West African Empires",
    subtopic: "Ghana, Mali, Songhai and Borno",
    objectives: [
      "Analyse the influence of Islam on the socio-political system of some West African States"
    ],
    recommended_content: "Topics: (i) Influence of Islam on West African Empires: (a) Ghana Empire - adoption of Islamic law, Muslim advisers in court (b) Mali Empire - Mansa Musa's pilgrimage, Sankore University, Timbuktu as learning center (c) Songhai Empire - Askia Muhammad's reforms, Islamic courts, expansion of education (d) Borno Empire - Mai Idris Alooma's Islamic reforms, establishment of Sharia courts. Recommended Texts: Trimingham, J.S. (1993) A History of Islam in West Africa.",
    difficulty_level: "hard",
    estimated_reading_time: 50,
    order_index: 55
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Economic Impact of Islam in West Africa",
    subtopic: "Timbuktu, Kano and Borno",
    objectives: [
      "Evaluate the impact of Islam on the economic life of Timbuktu, Kano and Borno"
    ],
    recommended_content: "Topics: (ii) Economic impact of Islam: (a) Timbuktu - major trade center, book trade, salt and gold commerce (b) Kano - leather goods (Moroccan leather), textile industry, trans-Saharan trade hub (c) Borno - controlled trade routes, salt trade, slavery abolished under Islamic influence. Islam introduced: standardized weights and measures, commercial ethics, banking practices, contract law. Recommended Texts: Trimingham, J.S. (1993) A History of Islam in West Africa.",
    difficulty_level: "medium",
    estimated_reading_time: 45,
    order_index: 56
  },
  {
    subject: "Islamic Religious Studies",
    topic: "Contributions of Islam to Education",
    subtopic: "Aims, Objectives and Sources",
    objectives: [
      "Classify the aims and objectives of Islamic Education",
      "Assess the position of the Glorious Qur'an and Hadith in education",
      "Examine the importance of seeking knowledge in Islam"
    ],
    recommended_content: "Topics: (i) Aims and objectives of Islamic Education - development of complete Muslim personality, worship of Allah, service to humanity (ii) The Glorious Qur'an and Hadith on Education (Q.96:1-5)(Q.39:9) (iii) 'The search for knowledge is obligatory on every Muslim' (Ibn Majah) (iv) 'Seek knowledge from the cradle to the grave' (v) 'The words of wisdom are a lost property of the believer.....a better right to it.....' (Tirmidhi). Recommended Texts: Lemu, A. (1992) Methodology of Primary Islamic Studies, Lagos: IPB.",
    difficulty_level: "medium",
    estimated_reading_time: 40,
    order_index: 57
  },
  
  // Additional topics for comprehensive coverage
  {
    subject: "Islamic Religious Studies",
    topic: "Recommended Textbooks for IRS",
    subtopic: "Official JAMB Reading List",
    objectives: [
      "Identify and access recommended textbooks for JAMB IRS preparation",
      "Utilize appropriate study materials for comprehensive preparation"
    ],
    recommended_content: "JAMB Recommended Texts: Abdul, M.O.A. (1976, 1982) Studies in Islam Series Books 2 & 3, Lagos: IPB; Abdul, M.O.A. (1988) The Classical Caliphate, Lagos: IPB; Abdulrahman and Canham (n.d.) The Ink of the Scholar, OUP; Ali, A.Y. (1975) The Holy Qur'an Text: Translation and Commentary, Leicester: Islamic Foundation; Ali, M.M. (Undated) The Religion of Islam, Lahore; Doi, A.R.I (1997) Shariah: The Islamic Law, Kuala Lumpur: Noordeen; Hay Lal, M. (1982) The Life of Muhammad (SAW), Academic Press; Lemu, A. (1992, 1993) Islamic Studies for SSS Books, Lagos: IPB/Minna: IET; Sambo, M.B. et al (1984) Islamic Religious Knowledge for WASC Books 1 & 3, Lagos: IPB; Trimingham, J.S. (1993) A History of Islam in West Africa, Oxford: OUP.",
    difficulty_level: "easy",
    estimated_reading_time: 20,
    order_index: 58
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Starting IRS syllabus seed with ${irsSyllabus.length} topics`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const topic of irsSyllabus) {
      // Check if topic already exists
      const { data: existing } = await supabase
        .from('jamb_syllabus')
        .select('id')
        .eq('subject', topic.subject)
        .eq('topic', topic.topic)
        .eq('subtopic', topic.subtopic)
        .maybeSingle();

      if (existing) {
        console.log(`Skipping existing topic: ${topic.topic} - ${topic.subtopic}`);
        skippedCount++;
        continue;
      }

      // Insert new topic
      const { error } = await supabase
        .from('jamb_syllabus')
        .insert(topic);

      if (error) {
        console.error(`Error inserting topic ${topic.topic}:`, error);
        throw error;
      }

      console.log(`Inserted: ${topic.topic} - ${topic.subtopic}`);
      insertedCount++;
    }

    console.log(`Seed completed: ${insertedCount} inserted, ${skippedCount} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `IRS syllabus seeded successfully`,
        inserted: insertedCount,
        skipped: skippedCount,
        total: irsSyllabus.length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error seeding IRS syllabus:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
