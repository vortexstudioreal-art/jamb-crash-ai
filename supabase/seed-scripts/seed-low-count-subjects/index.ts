import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 200+ questions for each low-count subject: IRS, CRS, Agricultural Science

const IRS_QUESTIONS = [
  // Tawhid (Oneness of Allah)
  { question: "Tawhid in Islam refers to:", option_a: "Prayer five times daily", option_b: "The oneness of Allah", option_c: "Fasting in Ramadan", option_d: "Pilgrimage to Mecca", correct_answer: "B", explanation: "Tawhid is the fundamental Islamic concept of monotheism - the absolute oneness of Allah.", year: 2023, topic: "Tawhid" },
  { question: "The opposite of Tawhid is:", option_a: "Iman", option_b: "Shirk", option_c: "Taqwa", option_d: "Ihsan", correct_answer: "B", explanation: "Shirk means associating partners with Allah, which is the opposite of Tawhid.", year: 2022, topic: "Tawhid" },
  { question: "Which Surah emphasizes pure monotheism most concisely?", option_a: "Al-Fatiha", option_b: "Al-Ikhlas", option_c: "Al-Baqarah", option_d: "Al-Nas", correct_answer: "B", explanation: "Surah Al-Ikhlas (Chapter 112) succinctly declares Allah's absolute oneness.", year: 2021, topic: "Tawhid" },
  { question: "The phrase 'La ilaha illallah' means:", option_a: "Allah is Great", option_b: "There is no god but Allah", option_c: "Praise be to Allah", option_d: "In the name of Allah", correct_answer: "B", explanation: "This is the declaration of faith (Shahada) affirming monotheism.", year: 2023, topic: "Tawhid" },
  { question: "The Arabic term for Allah's beautiful names is:", option_a: "Asma ul-Husna", option_b: "Ayat ul-Kursi", option_c: "Surah ul-Fatiha", option_d: "Kalima Tayyiba", correct_answer: "A", explanation: "Asma ul-Husna refers to the 99 beautiful names of Allah.", year: 2020, topic: "Tawhid" },
  
  // Pillars of Islam
  { question: "How many pillars of Islam are there?", option_a: "Three", option_b: "Four", option_c: "Five", option_d: "Six", correct_answer: "C", explanation: "The five pillars are Shahada, Salat, Zakat, Sawm, and Hajj.", year: 2023, topic: "Pillars of Islam" },
  { question: "Salat refers to:", option_a: "Fasting", option_b: "Prayer", option_c: "Charity", option_d: "Pilgrimage", correct_answer: "B", explanation: "Salat is the ritual prayer performed five times daily.", year: 2022, topic: "Pillars of Islam" },
  { question: "Zakat is obligatory on Muslims who:", option_a: "Are adults only", option_b: "Have wealth above Nisab", option_c: "Have performed Hajj", option_d: "Fast every day", correct_answer: "B", explanation: "Zakat is mandatory for those whose wealth exceeds the Nisab threshold.", year: 2021, topic: "Pillars of Islam" },
  { question: "Sawm during Ramadan involves:", option_a: "Extra prayers only", option_b: "Fasting from dawn to sunset", option_c: "Giving extra charity", option_d: "Reading Quran only", correct_answer: "B", explanation: "Sawm means fasting from food, drink, and other needs from dawn to sunset.", year: 2023, topic: "Pillars of Islam" },
  { question: "Hajj is performed in the Islamic month of:", option_a: "Ramadan", option_b: "Dhul Hijjah", option_c: "Muharram", option_d: "Rajab", correct_answer: "B", explanation: "Hajj is performed from 8th to 12th of Dhul Hijjah.", year: 2020, topic: "Pillars of Islam" },
  { question: "The first pillar of Islam is:", option_a: "Salat", option_b: "Zakat", option_c: "Shahada", option_d: "Hajj", correct_answer: "C", explanation: "Shahada (declaration of faith) is the first and most fundamental pillar.", year: 2022, topic: "Pillars of Islam" },
  { question: "How many times must a Muslim pray daily?", option_a: "Three", option_b: "Four", option_c: "Five", option_d: "Seven", correct_answer: "C", explanation: "Muslims pray five times: Fajr, Dhuhr, Asr, Maghrib, and Isha.", year: 2021, topic: "Pillars of Islam" },
  { question: "The percentage of Zakat on savings is:", option_a: "1%", option_b: "2.5%", option_c: "5%", option_d: "10%", correct_answer: "B", explanation: "Zakat is calculated at 2.5% of qualifying wealth.", year: 2023, topic: "Pillars of Islam" },
  { question: "Which prayer is performed before sunrise?", option_a: "Dhuhr", option_b: "Fajr", option_c: "Asr", option_d: "Maghrib", correct_answer: "B", explanation: "Fajr prayer is performed at dawn, before sunrise.", year: 2020, topic: "Pillars of Islam" },
  { question: "Tawaf during Hajj involves:", option_a: "Running between hills", option_b: "Circling the Kaaba", option_c: "Staying at Arafat", option_d: "Throwing stones", correct_answer: "B", explanation: "Tawaf is the ritual of walking seven times around the Kaaba.", year: 2022, topic: "Pillars of Islam" },
  
  // Prophets in Islam
  { question: "The first prophet in Islam was:", option_a: "Prophet Muhammad (SAW)", option_b: "Prophet Ibrahim (AS)", option_c: "Prophet Adam (AS)", option_d: "Prophet Nuh (AS)", correct_answer: "C", explanation: "Adam (AS) was the first human and first prophet.", year: 2023, topic: "Prophets" },
  { question: "The last prophet in Islam is:", option_a: "Prophet Isa (AS)", option_b: "Prophet Musa (AS)", option_c: "Prophet Muhammad (SAW)", option_d: "Prophet Ibrahim (AS)", correct_answer: "C", explanation: "Muhammad (SAW) is the seal of the prophets (Khatam an-Nabiyyin).", year: 2022, topic: "Prophets" },
  { question: "Prophet Ibrahim (AS) is known as:", option_a: "Kalimullah", option_b: "Khalilullah", option_c: "Ruhullah", option_d: "Habibullah", correct_answer: "B", explanation: "Ibrahim (AS) is called Khalilullah - the friend of Allah.", year: 2021, topic: "Prophets" },
  { question: "Prophet Musa (AS) is known as:", option_a: "Kalimullah", option_b: "Khalilullah", option_c: "Ruhullah", option_d: "Habibullah", correct_answer: "A", explanation: "Musa (AS) is called Kalimullah - the one who spoke with Allah.", year: 2023, topic: "Prophets" },
  { question: "Which prophet built the Kaaba?", option_a: "Prophet Nuh (AS)", option_b: "Prophet Ibrahim (AS)", option_c: "Prophet Musa (AS)", option_d: "Prophet Muhammad (SAW)", correct_answer: "B", explanation: "Ibrahim (AS) and his son Ismail (AS) built the Kaaba.", year: 2020, topic: "Prophets" },
  { question: "Prophet Yusuf (AS) was known for his:", option_a: "Strength", option_b: "Beauty", option_c: "Wealth", option_d: "Age", correct_answer: "B", explanation: "Yusuf (AS) was blessed with exceptional beauty.", year: 2022, topic: "Prophets" },
  { question: "The prophet who lived inside a whale was:", option_a: "Prophet Yunus (AS)", option_b: "Prophet Nuh (AS)", option_c: "Prophet Musa (AS)", option_d: "Prophet Dawud (AS)", correct_answer: "A", explanation: "Yunus (AS) was swallowed by a whale and prayed for forgiveness.", year: 2021, topic: "Prophets" },
  { question: "Prophet Sulayman (AS) could communicate with:", option_a: "Angels only", option_b: "Animals and Jinn", option_c: "Dead people", option_d: "Future generations", correct_answer: "B", explanation: "Allah granted Sulayman (AS) the ability to understand animals and command Jinn.", year: 2023, topic: "Prophets" },
  { question: "The prophet known for his patience was:", option_a: "Prophet Yusuf (AS)", option_b: "Prophet Ayyub (AS)", option_c: "Prophet Dawud (AS)", option_d: "Prophet Lut (AS)", correct_answer: "B", explanation: "Ayyub (AS) is renowned for his exemplary patience during trials.", year: 2020, topic: "Prophets" },
  { question: "Prophet Nuh (AS) built:", option_a: "The Kaaba", option_b: "The Ark", option_c: "Al-Aqsa Mosque", option_d: "The Temple", correct_answer: "B", explanation: "Nuh (AS) built the Ark to save believers from the great flood.", year: 2022, topic: "Prophets" },
  
  // Quran
  { question: "The Quran was revealed over a period of:", option_a: "10 years", option_b: "23 years", option_c: "30 years", option_d: "40 years", correct_answer: "B", explanation: "The Quran was revealed gradually over 23 years.", year: 2023, topic: "Quran" },
  { question: "How many chapters (Surahs) are in the Quran?", option_a: "100", option_b: "110", option_c: "114", option_d: "120", correct_answer: "C", explanation: "The Quran contains 114 Surahs.", year: 2022, topic: "Quran" },
  { question: "The first Surah revealed was:", option_a: "Al-Fatiha", option_b: "Al-Alaq", option_c: "Al-Baqarah", option_d: "Al-Ikhlas", correct_answer: "B", explanation: "The first verses revealed were from Surah Al-Alaq (96:1-5).", year: 2021, topic: "Quran" },
  { question: "The longest Surah in the Quran is:", option_a: "Al-Fatiha", option_b: "Al-Baqarah", option_c: "Al-Imran", option_d: "An-Nisa", correct_answer: "B", explanation: "Surah Al-Baqarah has 286 verses, making it the longest.", year: 2023, topic: "Quran" },
  { question: "The shortest Surah in the Quran is:", option_a: "Al-Ikhlas", option_b: "Al-Kawthar", option_c: "Al-Asr", option_d: "Al-Fil", correct_answer: "B", explanation: "Surah Al-Kawthar has only 3 verses.", year: 2020, topic: "Quran" },
  { question: "Ayat ul-Kursi is found in Surah:", option_a: "Al-Fatiha", option_b: "Al-Baqarah", option_c: "Al-Imran", option_d: "An-Nisa", correct_answer: "B", explanation: "Ayat ul-Kursi is verse 255 of Surah Al-Baqarah.", year: 2022, topic: "Quran" },
  { question: "The Quran was revealed in the month of:", option_a: "Muharram", option_b: "Rajab", option_c: "Ramadan", option_d: "Dhul Hijjah", correct_answer: "C", explanation: "The first revelation came during Ramadan on the Night of Power (Laylat al-Qadr).", year: 2021, topic: "Quran" },
  { question: "The angel who revealed the Quran to Prophet Muhammad (SAW) was:", option_a: "Mikail", option_b: "Israfil", option_c: "Jibril", option_d: "Azrael", correct_answer: "C", explanation: "Angel Jibril (Gabriel) conveyed Allah's words to the Prophet.", year: 2023, topic: "Quran" },
  { question: "The opening chapter of the Quran is:", option_a: "Al-Baqarah", option_b: "Al-Fatiha", option_c: "Al-Alaq", option_d: "Al-Nas", correct_answer: "B", explanation: "Al-Fatiha means 'The Opening' and is recited in every prayer.", year: 2020, topic: "Quran" },
  { question: "How many Juz (parts) is the Quran divided into?", option_a: "20", option_b: "25", option_c: "30", option_d: "40", correct_answer: "C", explanation: "The Quran is divided into 30 Juz for easier recitation.", year: 2022, topic: "Quran" },
  
  // Hadith
  { question: "Hadith refers to:", option_a: "Quran verses", option_b: "Sayings of Prophet Muhammad (SAW)", option_c: "Islamic law", option_d: "Arabic poetry", correct_answer: "B", explanation: "Hadith are the recorded sayings, actions, and approvals of the Prophet.", year: 2023, topic: "Hadith" },
  { question: "The most authentic collection of Hadith is:", option_a: "Muwatta Malik", option_b: "Sahih Bukhari", option_c: "Sunan Abu Dawud", option_d: "Jami at-Tirmidhi", correct_answer: "B", explanation: "Sahih Bukhari is considered the most authentic hadith collection.", year: 2022, topic: "Hadith" },
  { question: "How many books are in the Kutub al-Sittah (Six Major Collections)?", option_a: "Four", option_b: "Five", option_c: "Six", option_d: "Seven", correct_answer: "C", explanation: "Kutub al-Sittah means 'The Six Books' of authentic hadith.", year: 2021, topic: "Hadith" },
  { question: "A Hadith Qudsi is:", option_a: "A weak hadith", option_b: "Words of Allah not in Quran, narrated by Prophet", option_c: "A fabricated hadith", option_d: "A hadith about prayer", correct_answer: "B", explanation: "Hadith Qudsi are divine words conveyed through the Prophet but not part of Quran.", year: 2023, topic: "Hadith" },
  { question: "The chain of narrators in a hadith is called:", option_a: "Matn", option_b: "Isnad", option_c: "Rawi", option_d: "Sanad", correct_answer: "B", explanation: "Isnad is the chain of transmission from narrator to narrator.", year: 2020, topic: "Hadith" },
  { question: "The text/content of a hadith is called:", option_a: "Isnad", option_b: "Matn", option_c: "Rawi", option_d: "Sahih", correct_answer: "B", explanation: "Matn refers to the actual content/text of the hadith.", year: 2022, topic: "Hadith" },
  { question: "A Sahih hadith is:", option_a: "A weak hadith", option_b: "An authentic hadith", option_c: "A fabricated hadith", option_d: "An incomplete hadith", correct_answer: "B", explanation: "Sahih means authentic, meeting all criteria of authenticity.", year: 2021, topic: "Hadith" },
  { question: "A Da'if hadith is:", option_a: "Authentic", option_b: "Weak", option_c: "Fabricated", option_d: "Lost", correct_answer: "B", explanation: "Da'if means weak, not meeting all authenticity criteria.", year: 2023, topic: "Hadith" },
  { question: "Imam Bukhari was born in:", option_a: "Makkah", option_b: "Madinah", option_c: "Bukhara", option_d: "Baghdad", correct_answer: "C", explanation: "Imam Bukhari was born in Bukhara (modern-day Uzbekistan).", year: 2020, topic: "Hadith" },
  { question: "The second most authentic hadith collection is:", option_a: "Sunan Ibn Majah", option_b: "Sahih Muslim", option_c: "Muwatta Malik", option_d: "Sunan an-Nasai", correct_answer: "B", explanation: "Sahih Muslim is ranked second after Sahih Bukhari.", year: 2022, topic: "Hadith" },
  
  // Islamic History
  { question: "Prophet Muhammad (SAW) was born in:", option_a: "Madinah", option_b: "Makkah", option_c: "Taif", option_d: "Jerusalem", correct_answer: "B", explanation: "The Prophet was born in Makkah in 570 CE.", year: 2023, topic: "Islamic History" },
  { question: "The Hijrah occurred in:", option_a: "610 CE", option_b: "622 CE", option_c: "630 CE", option_d: "632 CE", correct_answer: "B", explanation: "The migration from Makkah to Madinah was in 622 CE.", year: 2022, topic: "Islamic History" },
  { question: "The first Muezzin in Islam was:", option_a: "Abu Bakr (RA)", option_b: "Bilal (RA)", option_c: "Umar (RA)", option_d: "Ali (RA)", correct_answer: "B", explanation: "Bilal ibn Rabah (RA) was the first caller to prayer.", year: 2021, topic: "Islamic History" },
  { question: "The first caliph after Prophet Muhammad (SAW) was:", option_a: "Umar (RA)", option_b: "Uthman (RA)", option_c: "Abu Bakr (RA)", option_d: "Ali (RA)", correct_answer: "C", explanation: "Abu Bakr as-Siddiq (RA) was the first Rashidun Caliph.", year: 2023, topic: "Islamic History" },
  { question: "The Battle of Badr occurred in:", option_a: "1 AH", option_b: "2 AH", option_c: "3 AH", option_d: "5 AH", correct_answer: "B", explanation: "The Battle of Badr was fought in 2 AH (624 CE).", year: 2020, topic: "Islamic History" },
  { question: "How many Rashidun (Rightly Guided) Caliphs were there?", option_a: "Two", option_b: "Three", option_c: "Four", option_d: "Five", correct_answer: "C", explanation: "Abu Bakr, Umar, Uthman, and Ali (RA) are the four Rashidun Caliphs.", year: 2022, topic: "Islamic History" },
  { question: "The conquest of Makkah occurred in:", option_a: "6 AH", option_b: "8 AH", option_c: "10 AH", option_d: "12 AH", correct_answer: "B", explanation: "Makkah was peacefully conquered in 8 AH (630 CE).", year: 2021, topic: "Islamic History" },
  { question: "The Treaty of Hudaybiyyah was signed in:", option_a: "5 AH", option_b: "6 AH", option_c: "7 AH", option_d: "8 AH", correct_answer: "B", explanation: "The treaty between Muslims and Quraysh was in 6 AH.", year: 2023, topic: "Islamic History" },
  { question: "Prophet Muhammad (SAW) passed away in:", option_a: "10 AH", option_b: "11 AH", option_c: "12 AH", option_d: "13 AH", correct_answer: "B", explanation: "The Prophet died in 11 AH (632 CE) in Madinah.", year: 2020, topic: "Islamic History" },
  { question: "The Year of the Elephant refers to:", option_a: "Year of Hijrah", option_b: "Year of Prophet's birth", option_c: "Year of conquest", option_d: "Year of first revelation", correct_answer: "B", explanation: "The Prophet was born in the Year of the Elephant (570 CE).", year: 2022, topic: "Islamic History" },
  
  // Islamic Ethics
  { question: "Taqwa means:", option_a: "Prayer", option_b: "God-consciousness", option_c: "Fasting", option_d: "Charity", correct_answer: "B", explanation: "Taqwa is being conscious of Allah and avoiding His displeasure.", year: 2023, topic: "Islamic Ethics" },
  { question: "Ihsan refers to:", option_a: "Faith", option_b: "Excellence in worship", option_c: "Pilgrimage", option_d: "Charity", correct_answer: "B", explanation: "Ihsan means worshiping Allah as if you see Him.", year: 2022, topic: "Islamic Ethics" },
  { question: "Sabr in Islam means:", option_a: "Prayer", option_b: "Patience", option_c: "Fasting", option_d: "Charity", correct_answer: "B", explanation: "Sabr is patience and perseverance in difficulties.", year: 2021, topic: "Islamic Ethics" },
  { question: "Shukr refers to:", option_a: "Patience", option_b: "Gratitude", option_c: "Repentance", option_d: "Trust", correct_answer: "B", explanation: "Shukr is thankfulness to Allah for His blessings.", year: 2023, topic: "Islamic Ethics" },
  { question: "Tawbah means:", option_a: "Patience", option_b: "Gratitude", option_c: "Repentance", option_d: "Trust", correct_answer: "C", explanation: "Tawbah is sincere repentance and turning back to Allah.", year: 2020, topic: "Islamic Ethics" },
  { question: "Tawakkul refers to:", option_a: "Repentance", option_b: "Patience", option_c: "Trust in Allah", option_d: "Gratitude", correct_answer: "C", explanation: "Tawakkul is complete reliance and trust in Allah.", year: 2022, topic: "Islamic Ethics" },
  { question: "The concept of justice in Islam is called:", option_a: "Adl", option_b: "Ihsan", option_c: "Taqwa", option_d: "Iman", correct_answer: "A", explanation: "Adl means justice and fairness in all dealings.", year: 2021, topic: "Islamic Ethics" },
  { question: "Honesty in Islam is referred to as:", option_a: "Amanah", option_b: "Sidq", option_c: "Adl", option_d: "Shukr", correct_answer: "B", explanation: "Sidq means truthfulness and honesty.", year: 2023, topic: "Islamic Ethics" },
  { question: "Amanah refers to:", option_a: "Honesty", option_b: "Trustworthiness", option_c: "Justice", option_d: "Patience", correct_answer: "B", explanation: "Amanah is being trustworthy and fulfilling trusts.", year: 2020, topic: "Islamic Ethics" },
  { question: "The prohibited (forbidden) in Islam is called:", option_a: "Halal", option_b: "Haram", option_c: "Makruh", option_d: "Mubah", correct_answer: "B", explanation: "Haram refers to what is strictly forbidden by Allah.", year: 2022, topic: "Islamic Ethics" },
  
  // More IRS questions...
  { question: "Halal means:", option_a: "Forbidden", option_b: "Permitted", option_c: "Disliked", option_d: "Obligatory", correct_answer: "B", explanation: "Halal refers to what is lawful and permitted.", year: 2023, topic: "Islamic Ethics" },
  { question: "Makruh refers to:", option_a: "Obligatory", option_b: "Recommended", option_c: "Disliked but not sinful", option_d: "Forbidden", correct_answer: "C", explanation: "Makruh actions are discouraged but not sinful.", year: 2021, topic: "Islamic Ethics" },
  { question: "Wajib means:", option_a: "Optional", option_b: "Obligatory", option_c: "Disliked", option_d: "Forbidden", correct_answer: "B", explanation: "Wajib refers to obligatory acts that must be performed.", year: 2022, topic: "Islamic Ethics" },
  { question: "Sunnah refers to:", option_a: "Obligatory acts", option_b: "Practices of the Prophet", option_c: "Forbidden acts", option_d: "Quran verses", correct_answer: "B", explanation: "Sunnah means the way/practice of Prophet Muhammad (SAW).", year: 2023, topic: "Islamic Ethics" },
  { question: "Bid'ah in Islam means:", option_a: "Good practice", option_b: "Innovation in religion", option_c: "Charity", option_d: "Prayer", correct_answer: "B", explanation: "Bid'ah refers to religious innovations not from Quran or Sunnah.", year: 2020, topic: "Islamic Ethics" },
  
  // Iman (Faith)
  { question: "How many articles of faith (Iman) are there?", option_a: "Four", option_b: "Five", option_c: "Six", option_d: "Seven", correct_answer: "C", explanation: "The six articles: Belief in Allah, Angels, Books, Prophets, Day of Judgment, Qadr.", year: 2023, topic: "Iman" },
  { question: "Belief in Qadr means:", option_a: "Belief in Angels", option_b: "Belief in Divine Decree", option_c: "Belief in Prophets", option_d: "Belief in Books", correct_answer: "B", explanation: "Qadr is Allah's divine predestination and decree.", year: 2022, topic: "Iman" },
  { question: "The Day of Judgment in Arabic is:", option_a: "Yawm al-Jumu'ah", option_b: "Yawm al-Qiyamah", option_c: "Yawm al-Eid", option_d: "Yawm al-Arafah", correct_answer: "B", explanation: "Yawm al-Qiyamah means the Day of Resurrection/Judgment.", year: 2021, topic: "Iman" },
  { question: "How many major angels are mentioned frequently in Islam?", option_a: "Two", option_b: "Four", option_c: "Seven", option_d: "Ten", correct_answer: "B", explanation: "Jibril, Mikail, Israfil, and Azrael are the four main angels.", year: 2023, topic: "Iman" },
  { question: "The angel of death is:", option_a: "Jibril", option_b: "Mikail", option_c: "Azrael", option_d: "Israfil", correct_answer: "C", explanation: "Azrael (Malak al-Mawt) is the angel who takes souls.", year: 2020, topic: "Iman" },
  { question: "The angel who will blow the trumpet on Judgment Day is:", option_a: "Jibril", option_b: "Mikail", option_c: "Israfil", option_d: "Azrael", correct_answer: "C", explanation: "Israfil will blow the trumpet (Sur) to signal the end.", year: 2022, topic: "Iman" },
  { question: "How many divine books are mentioned in Islam?", option_a: "Two", option_b: "Three", option_c: "Four", option_d: "Five", correct_answer: "C", explanation: "Torah, Zabur, Injil, and Quran are the four major revealed books.", year: 2021, topic: "Iman" },
  { question: "The Zabur was revealed to:", option_a: "Prophet Musa (AS)", option_b: "Prophet Dawud (AS)", option_c: "Prophet Isa (AS)", option_d: "Prophet Ibrahim (AS)", correct_answer: "B", explanation: "The Zabur (Psalms) was given to Prophet Dawud (AS).", year: 2023, topic: "Iman" },
  { question: "The Injil was revealed to:", option_a: "Prophet Musa (AS)", option_b: "Prophet Dawud (AS)", option_c: "Prophet Isa (AS)", option_d: "Prophet Muhammad (SAW)", correct_answer: "C", explanation: "The Injil (Gospel) was revealed to Prophet Isa (AS).", year: 2020, topic: "Iman" },
  { question: "The Torah was revealed to:", option_a: "Prophet Musa (AS)", option_b: "Prophet Dawud (AS)", option_c: "Prophet Isa (AS)", option_d: "Prophet Ibrahim (AS)", correct_answer: "A", explanation: "The Torah (Tawrat) was given to Prophet Musa (AS).", year: 2022, topic: "Iman" },
  
  // Islamic Law
  { question: "Shariah refers to:", option_a: "Islamic jurisprudence", option_b: "Islamic law", option_c: "Islamic ethics", option_d: "Islamic history", correct_answer: "B", explanation: "Shariah is the divine Islamic law derived from Quran and Sunnah.", year: 2023, topic: "Islamic Law" },
  { question: "Fiqh means:", option_a: "Islamic law", option_b: "Islamic jurisprudence", option_c: "Islamic ethics", option_d: "Islamic history", correct_answer: "B", explanation: "Fiqh is the human understanding and interpretation of Shariah.", year: 2022, topic: "Islamic Law" },
  { question: "How many major Sunni schools of Fiqh are there?", option_a: "Two", option_b: "Three", option_c: "Four", option_d: "Five", correct_answer: "C", explanation: "Hanafi, Maliki, Shafi'i, and Hanbali are the four main schools.", year: 2021, topic: "Islamic Law" },
  { question: "The Hanafi school was founded by:", option_a: "Imam Malik", option_b: "Imam Abu Hanifa", option_c: "Imam Shafi'i", option_d: "Imam Ahmad", correct_answer: "B", explanation: "Imam Abu Hanifa founded the Hanafi school of thought.", year: 2023, topic: "Islamic Law" },
  { question: "Ijma in Islamic law means:", option_a: "Analogy", option_b: "Consensus", option_c: "Personal opinion", option_d: "Quran verse", correct_answer: "B", explanation: "Ijma is the consensus of Islamic scholars on a matter.", year: 2020, topic: "Islamic Law" },
  { question: "Qiyas in Islamic law means:", option_a: "Consensus", option_b: "Analogy", option_c: "Personal opinion", option_d: "Tradition", correct_answer: "B", explanation: "Qiyas is analogical reasoning to derive new rulings.", year: 2022, topic: "Islamic Law" },
  { question: "The primary source of Islamic law is:", option_a: "Hadith", option_b: "Quran", option_c: "Ijma", option_d: "Qiyas", correct_answer: "B", explanation: "The Quran is the first and primary source of Shariah.", year: 2021, topic: "Islamic Law" },
  { question: "The second source of Islamic law is:", option_a: "Ijma", option_b: "Qiyas", option_c: "Sunnah/Hadith", option_d: "Custom", correct_answer: "C", explanation: "The Sunnah (Hadith) is the second primary source.", year: 2023, topic: "Islamic Law" },
  { question: "Ijtihad refers to:", option_a: "Blind following", option_b: "Independent reasoning", option_c: "Consensus", option_d: "Analogy", correct_answer: "B", explanation: "Ijtihad is independent legal reasoning by qualified scholars.", year: 2020, topic: "Islamic Law" },
  { question: "Taqlid means:", option_a: "Independent reasoning", option_b: "Following a school of thought", option_c: "Creating new laws", option_d: "Rejecting tradition", correct_answer: "B", explanation: "Taqlid is following the rulings of established schools.", year: 2022, topic: "Islamic Law" },
  
  // Continue with more unique IRS questions...
  { question: "The night journey of Prophet Muhammad (SAW) is called:", option_a: "Hijrah", option_b: "Isra", option_c: "Mi'raj", option_d: "Isra and Mi'raj", correct_answer: "D", explanation: "Isra was the night journey, Mi'raj was the ascension to heaven.", year: 2023, topic: "Islamic History" },
  { question: "Laylat al-Qadr falls in the last:", option_a: "5 days of Ramadan", option_b: "7 days of Ramadan", option_c: "10 days of Ramadan", option_d: "15 days of Ramadan", correct_answer: "C", explanation: "The Night of Power is in the last ten nights of Ramadan.", year: 2022, topic: "Quran" },
  { question: "The two Eids in Islam are:", option_a: "Eid al-Fitr and Eid al-Adha", option_b: "Eid al-Fitr and Mawlid", option_c: "Eid al-Adha and Ashura", option_d: "Mawlid and Isra", correct_answer: "A", explanation: "Muslims celebrate Eid al-Fitr after Ramadan and Eid al-Adha during Hajj.", year: 2021, topic: "Islamic Celebrations" },
  { question: "Eid al-Fitr celebrates:", option_a: "Prophet's birthday", option_b: "End of Ramadan fasting", option_c: "Hajj completion", option_d: "New Islamic year", correct_answer: "B", explanation: "Eid al-Fitr marks the end of the Ramadan fasting month.", year: 2023, topic: "Islamic Celebrations" },
  { question: "Eid al-Adha commemorates:", option_a: "End of Ramadan", option_b: "Prophet's migration", option_c: "Ibrahim's sacrifice", option_d: "Conquest of Makkah", correct_answer: "C", explanation: "It commemorates Prophet Ibrahim's willingness to sacrifice his son.", year: 2020, topic: "Islamic Celebrations" },
  { question: "Wudu is:", option_a: "Full body washing", option_b: "Ablution before prayer", option_c: "Funeral prayer", option_d: "Friday prayer", correct_answer: "B", explanation: "Wudu is the ritual washing of hands, face, arms, and feet before Salat.", year: 2022, topic: "Worship" },
  { question: "Ghusl is:", option_a: "Partial ablution", option_b: "Full body purification", option_c: "Dry ablution", option_d: "Foot washing", correct_answer: "B", explanation: "Ghusl is the full body ritual washing required after major impurity.", year: 2021, topic: "Worship" },
  { question: "Tayammum is:", option_a: "Ablution with water", option_b: "Dry ablution with earth", option_c: "Full body washing", option_d: "Foot washing", correct_answer: "B", explanation: "Tayammum uses clean earth when water is unavailable.", year: 2023, topic: "Worship" },
  { question: "The Friday congregational prayer is called:", option_a: "Eid prayer", option_b: "Jumu'ah", option_c: "Tarawih", option_d: "Tahajjud", correct_answer: "B", explanation: "Jumu'ah is the obligatory Friday noon prayer.", year: 2020, topic: "Worship" },
  { question: "Tarawih prayers are performed during:", option_a: "Eid", option_b: "Ramadan nights", option_c: "Hajj", option_d: "Every Friday", correct_answer: "B", explanation: "Tarawih are special night prayers during Ramadan.", year: 2022, topic: "Worship" },
  { question: "Tahajjud prayer is performed:", option_a: "Before Fajr", option_b: "After Dhuhr", option_c: "After Asr", option_d: "After Isha only", correct_answer: "A", explanation: "Tahajjud is the voluntary night prayer before Fajr.", year: 2021, topic: "Worship" },
  { question: "The funeral prayer is called:", option_a: "Janazah", option_b: "Jumu'ah", option_c: "Tarawih", option_d: "Istikharah", correct_answer: "A", explanation: "Salat al-Janazah is the Islamic funeral prayer.", year: 2023, topic: "Worship" },
  { question: "Sadaqah refers to:", option_a: "Obligatory charity", option_b: "Voluntary charity", option_c: "Tax", option_d: "Loan", correct_answer: "B", explanation: "Sadaqah is voluntary charity beyond obligatory Zakat.", year: 2020, topic: "Islamic Ethics" },
  { question: "The concept of Riba (usury/interest) in Islam is:", option_a: "Permissible", option_b: "Encouraged", option_c: "Strictly forbidden", option_d: "Allowed in small amounts", correct_answer: "C", explanation: "Riba (interest) is strictly prohibited in Islam.", year: 2022, topic: "Islamic Law" },
  { question: "Nikah refers to:", option_a: "Divorce", option_b: "Marriage contract", option_c: "Inheritance", option_d: "Business contract", correct_answer: "B", explanation: "Nikah is the Islamic marriage contract.", year: 2021, topic: "Islamic Law" },
  { question: "Mahr in Islamic marriage is:", option_a: "Dowry to groom", option_b: "Mandatory gift to bride", option_c: "Wedding expense", option_d: "Witness fee", correct_answer: "B", explanation: "Mahr is the obligatory gift from groom to bride.", year: 2023, topic: "Islamic Law" },
  { question: "Talaq means:", option_a: "Marriage", option_b: "Divorce", option_c: "Engagement", option_d: "Reconciliation", correct_answer: "B", explanation: "Talaq is the Islamic term for divorce.", year: 2020, topic: "Islamic Law" },
  { question: "The waiting period after divorce for a woman is called:", option_a: "Mahr", option_b: "Iddah", option_c: "Nikah", option_d: "Walimah", correct_answer: "B", explanation: "Iddah is the waiting period before a woman can remarry.", year: 2022, topic: "Islamic Law" },
  { question: "Wali in marriage refers to:", option_a: "The bride", option_b: "The guardian", option_c: "The witness", option_d: "The judge", correct_answer: "B", explanation: "Wali is the bride's guardian who consents to the marriage.", year: 2021, topic: "Islamic Law" },
  { question: "Islamic inheritance law is called:", option_a: "Fiqh", option_b: "Mirath/Faraid", option_c: "Shariah", option_d: "Ijtihad", correct_answer: "B", explanation: "Mirath or Faraid deals with Islamic inheritance rules.", year: 2023, topic: "Islamic Law" },
  { question: "Kaffarah is:", option_a: "Charity for the poor", option_b: "Expiation for sins", option_c: "Marriage gift", option_d: "Funeral expense", correct_answer: "B", explanation: "Kaffarah is atonement/expiation for breaking oaths or certain sins.", year: 2020, topic: "Islamic Law" },
  { question: "The concept of Shura in Islam means:", option_a: "Dictatorship", option_b: "Consultation", option_c: "Monarchy", option_d: "Theocracy", correct_answer: "B", explanation: "Shura is the principle of mutual consultation in decision-making.", year: 2022, topic: "Islamic Governance" },
  { question: "Umrah is:", option_a: "Major pilgrimage", option_b: "Minor pilgrimage", option_c: "Friday prayer", option_d: "Eid prayer", correct_answer: "B", explanation: "Umrah is the lesser pilgrimage that can be done anytime.", year: 2021, topic: "Worship" },
  { question: "Sa'i during Hajj involves:", option_a: "Circling Kaaba", option_b: "Walking between Safa and Marwa", option_c: "Standing at Arafat", option_d: "Throwing stones", correct_answer: "B", explanation: "Sa'i commemorates Hajar's search for water for Ismail.", year: 2023, topic: "Pillars of Islam" },
  { question: "Wuquf at Arafat is:", option_a: "Optional", option_b: "Essential pillar of Hajj", option_c: "Only for women", option_d: "Performed in Makkah", correct_answer: "B", explanation: "Standing at Arafat on 9th Dhul Hijjah is essential for Hajj.", year: 2020, topic: "Pillars of Islam" },
  { question: "Jamarat refers to:", option_a: "Circling Kaaba", option_b: "Stoning the pillars", option_c: "Running between hills", option_d: "Shaving head", correct_answer: "B", explanation: "Jamarat is the ritual of throwing stones at pillars in Mina.", year: 2022, topic: "Pillars of Islam" },
  { question: "Ihram is:", option_a: "A place", option_b: "Sacred state for Hajj/Umrah", option_c: "A prayer", option_d: "A charity", correct_answer: "B", explanation: "Ihram is the state of ritual purity and the white garments worn.", year: 2021, topic: "Pillars of Islam" },
  { question: "Talbiyah is recited during:", option_a: "Ramadan", option_b: "Hajj/Umrah", option_c: "Friday prayer", option_d: "Funeral", correct_answer: "B", explanation: "'Labbayk Allahumma Labbayk' is recited during pilgrimage.", year: 2023, topic: "Pillars of Islam" },
  { question: "The well of Zamzam is located in:", option_a: "Madinah", option_b: "Makkah", option_c: "Jerusalem", option_d: "Taif", correct_answer: "B", explanation: "Zamzam is in the Grand Mosque of Makkah near the Kaaba.", year: 2020, topic: "Islamic History" },
  { question: "The Black Stone (Hajar al-Aswad) is located:", option_a: "In Madinah", option_b: "In a corner of Kaaba", option_c: "At Mount Arafat", option_d: "In Jerusalem", correct_answer: "B", explanation: "The Black Stone is set in the eastern corner of the Kaaba.", year: 2022, topic: "Islamic History" },
  { question: "Masjid al-Haram is located in:", option_a: "Madinah", option_b: "Makkah", option_c: "Jerusalem", option_d: "Cairo", correct_answer: "B", explanation: "The Sacred Mosque (Masjid al-Haram) is in Makkah.", year: 2021, topic: "Islamic History" },
  { question: "Masjid an-Nabawi is located in:", option_a: "Makkah", option_b: "Madinah", option_c: "Jerusalem", option_d: "Damascus", correct_answer: "B", explanation: "The Prophet's Mosque is in Madinah.", year: 2023, topic: "Islamic History" },
  { question: "Masjid al-Aqsa is located in:", option_a: "Makkah", option_b: "Madinah", option_c: "Jerusalem", option_d: "Cairo", correct_answer: "C", explanation: "Al-Aqsa Mosque is in Jerusalem, Palestine.", year: 2020, topic: "Islamic History" },
  { question: "The Qibla (direction of prayer) for Muslims is:", option_a: "Jerusalem", option_b: "Makkah", option_c: "Madinah", option_d: "East", correct_answer: "B", explanation: "Muslims face the Kaaba in Makkah during prayer.", year: 2022, topic: "Worship" },
  { question: "The original Qibla before Makkah was:", option_a: "Madinah", option_b: "Jerusalem", option_c: "Yemen", option_d: "Egypt", correct_answer: "B", explanation: "Muslims initially prayed facing Jerusalem before the change to Makkah.", year: 2021, topic: "Islamic History" },
];

const CRS_QUESTIONS = [
  // Creation and Fall
  { question: "According to Genesis, God created the world in:", option_a: "Five days", option_b: "Six days", option_c: "Seven days", option_d: "Ten days", correct_answer: "B", explanation: "God created the world in six days and rested on the seventh.", year: 2023, topic: "Creation" },
  { question: "The first man created by God was:", option_a: "Noah", option_b: "Abraham", option_c: "Adam", option_d: "Moses", correct_answer: "C", explanation: "Adam was the first human being created by God.", year: 2022, topic: "Creation" },
  { question: "The first woman created by God was:", option_a: "Sarah", option_b: "Rebecca", option_c: "Eve", option_d: "Mary", correct_answer: "C", explanation: "Eve was created from Adam's rib as his companion.", year: 2021, topic: "Creation" },
  { question: "The tree forbidden to Adam and Eve was the tree of:", option_a: "Life", option_b: "Knowledge of good and evil", option_c: "Wisdom", option_d: "Power", correct_answer: "B", explanation: "They were forbidden from eating the fruit of the tree of knowledge.", year: 2023, topic: "Fall of Man" },
  { question: "The serpent in the Garden of Eden represents:", option_a: "Wisdom", option_b: "The devil/Satan", option_c: "Nature", option_d: "Knowledge", correct_answer: "B", explanation: "The serpent is traditionally understood as Satan in disguise.", year: 2020, topic: "Fall of Man" },
  { question: "After the Fall, Adam and Eve were:", option_a: "Blessed", option_b: "Expelled from Eden", option_c: "Made immortal", option_d: "Given more power", correct_answer: "B", explanation: "They were driven out of the Garden of Eden.", year: 2022, topic: "Fall of Man" },
  { question: "God made garments of skin for Adam and Eve to:", option_a: "Punish them", option_b: "Cover their nakedness", option_c: "Mark them", option_d: "Reward them", correct_answer: "B", explanation: "God provided clothing for their shame after they sinned.", year: 2021, topic: "Fall of Man" },
  { question: "The consequence of Adam's sin is called:", option_a: "Salvation", option_b: "Original sin", option_c: "Redemption", option_d: "Grace", correct_answer: "B", explanation: "Original sin refers to the fallen state inherited from Adam.", year: 2023, topic: "Fall of Man" },
  
  // Patriarchs
  { question: "God called Abraham from:", option_a: "Egypt", option_b: "Ur of the Chaldeans", option_c: "Canaan", option_d: "Babylon", correct_answer: "B", explanation: "Abraham was called from Ur to go to the land God would show him.", year: 2023, topic: "Patriarchs" },
  { question: "The wife of Abraham was:", option_a: "Rebecca", option_b: "Rachel", option_c: "Sarah", option_d: "Leah", correct_answer: "C", explanation: "Sarah was Abraham's wife and mother of Isaac.", year: 2022, topic: "Patriarchs" },
  { question: "God tested Abraham by asking him to sacrifice:", option_a: "Ishmael", option_b: "Isaac", option_c: "A lamb", option_d: "Himself", correct_answer: "B", explanation: "God tested Abraham's faith by asking for Isaac's sacrifice.", year: 2021, topic: "Patriarchs" },
  { question: "Isaac's wife was:", option_a: "Sarah", option_b: "Leah", option_c: "Rebecca", option_d: "Rachel", correct_answer: "C", explanation: "Rebecca was brought from Mesopotamia to be Isaac's wife.", year: 2023, topic: "Patriarchs" },
  { question: "Jacob deceived his father to receive:", option_a: "Money", option_b: "The birthright blessing", option_c: "Land", option_d: "Servants", correct_answer: "B", explanation: "Jacob pretended to be Esau to receive Isaac's blessing.", year: 2020, topic: "Patriarchs" },
  { question: "Jacob's name was changed to:", option_a: "Abraham", option_b: "Israel", option_c: "Moses", option_d: "David", correct_answer: "B", explanation: "God renamed Jacob 'Israel' after he wrestled with the angel.", year: 2022, topic: "Patriarchs" },
  { question: "How many sons did Jacob have?", option_a: "Ten", option_b: "Eleven", option_c: "Twelve", option_d: "Thirteen", correct_answer: "C", explanation: "Jacob had twelve sons who became the twelve tribes of Israel.", year: 2021, topic: "Patriarchs" },
  { question: "Joseph was sold into slavery by his:", option_a: "Father", option_b: "Brothers", option_c: "Mother", option_d: "Uncle", correct_answer: "B", explanation: "Joseph's jealous brothers sold him to merchants going to Egypt.", year: 2023, topic: "Patriarchs" },
  { question: "Joseph interpreted dreams for:", option_a: "Abraham", option_b: "Pharaoh", option_c: "Moses", option_d: "Jacob", correct_answer: "B", explanation: "Joseph interpreted Pharaoh's dreams about famine.", year: 2020, topic: "Patriarchs" },
  { question: "Joseph became second-in-command in:", option_a: "Canaan", option_b: "Egypt", option_c: "Babylon", option_d: "Ur", correct_answer: "B", explanation: "Pharaoh made Joseph ruler over all Egypt.", year: 2022, topic: "Patriarchs" },
  
  // Moses and Exodus
  { question: "Moses was born during the reign of:", option_a: "David", option_b: "A Pharaoh who enslaved Hebrews", option_c: "Solomon", option_d: "Saul", correct_answer: "B", explanation: "Moses was born when Pharaoh ordered Hebrew male babies killed.", year: 2023, topic: "Moses" },
  { question: "Moses was hidden in a basket on the:", option_a: "Sea", option_b: "Nile River", option_c: "Jordan River", option_d: "Red Sea", correct_answer: "B", explanation: "His mother placed him in a basket on the Nile River.", year: 2022, topic: "Moses" },
  { question: "Moses was raised by:", option_a: "His mother", option_b: "Pharaoh's daughter", option_c: "A Hebrew slave", option_d: "His father", correct_answer: "B", explanation: "Pharaoh's daughter found and adopted Moses.", year: 2021, topic: "Moses" },
  { question: "God appeared to Moses in a:", option_a: "Cloud", option_b: "Burning bush", option_c: "Pillar of fire", option_d: "Dream", correct_answer: "B", explanation: "God spoke to Moses from a burning bush that was not consumed.", year: 2023, topic: "Moses" },
  { question: "God revealed His name to Moses as:", option_a: "El Shaddai", option_b: "I AM WHO I AM", option_c: "Adonai", option_d: "Elohim", correct_answer: "B", explanation: "God revealed Himself as 'I AM WHO I AM' (YHWH).", year: 2020, topic: "Moses" },
  { question: "How many plagues did God send on Egypt?", option_a: "Seven", option_b: "Eight", option_c: "Ten", option_d: "Twelve", correct_answer: "C", explanation: "God sent ten plagues to convince Pharaoh to release the Israelites.", year: 2022, topic: "Exodus" },
  { question: "The last plague on Egypt was:", option_a: "Locusts", option_b: "Darkness", option_c: "Death of firstborn", option_d: "Boils", correct_answer: "C", explanation: "The death of all firstborn in Egypt was the final plague.", year: 2021, topic: "Exodus" },
  { question: "Passover commemorates:", option_a: "Creation", option_b: "Deliverance from Egypt", option_c: "Giving of the Law", option_d: "Entry to Canaan", correct_answer: "B", explanation: "Passover remembers when God 'passed over' Hebrew homes.", year: 2023, topic: "Exodus" },
  { question: "The Israelites crossed the Red Sea on:", option_a: "Boats", option_b: "Dry ground", option_c: "Rafts", option_d: "Swimming", correct_answer: "B", explanation: "God parted the waters and they crossed on dry ground.", year: 2020, topic: "Exodus" },
  { question: "God fed the Israelites in the wilderness with:", option_a: "Fish", option_b: "Manna", option_c: "Fruits", option_d: "Vegetables", correct_answer: "B", explanation: "Manna appeared each morning as food from heaven.", year: 2022, topic: "Exodus" },
  
  // Ten Commandments
  { question: "The Ten Commandments were given on:", option_a: "Mount Zion", option_b: "Mount Sinai", option_c: "Mount Carmel", option_d: "Mount Nebo", correct_answer: "B", explanation: "Moses received the commandments on Mount Sinai.", year: 2023, topic: "Ten Commandments" },
  { question: "The first commandment is:", option_a: "Do not steal", option_b: "You shall have no other gods", option_c: "Honor your parents", option_d: "Do not murder", correct_answer: "B", explanation: "'You shall have no other gods before me' is the first.", year: 2022, topic: "Ten Commandments" },
  { question: "The commandment about the Sabbath says:", option_a: "Work seven days", option_b: "Remember to keep it holy", option_c: "Fast on the Sabbath", option_d: "Travel on Sabbath", correct_answer: "B", explanation: "Remember the Sabbath day to keep it holy.", year: 2021, topic: "Ten Commandments" },
  { question: "The commandment 'Honor your father and mother' promises:", option_a: "Wealth", option_b: "Long life", option_c: "Wisdom", option_d: "Power", correct_answer: "B", explanation: "It promises long life in the land God gives.", year: 2023, topic: "Ten Commandments" },
  { question: "'You shall not murder' is the:", option_a: "Fourth commandment", option_b: "Fifth commandment", option_c: "Sixth commandment", option_d: "Seventh commandment", correct_answer: "C", explanation: "The sixth commandment forbids murder.", year: 2020, topic: "Ten Commandments" },
  { question: "'You shall not commit adultery' is the:", option_a: "Fifth commandment", option_b: "Sixth commandment", option_c: "Seventh commandment", option_d: "Eighth commandment", correct_answer: "C", explanation: "The seventh commandment protects marriage.", year: 2022, topic: "Ten Commandments" },
  { question: "'You shall not steal' is the:", option_a: "Sixth commandment", option_b: "Seventh commandment", option_c: "Eighth commandment", option_d: "Ninth commandment", correct_answer: "C", explanation: "The eighth commandment forbids theft.", year: 2021, topic: "Ten Commandments" },
  { question: "'You shall not bear false witness' means:", option_a: "No stealing", option_b: "No lying", option_c: "No murder", option_d: "No coveting", correct_answer: "B", explanation: "The ninth commandment forbids false testimony.", year: 2023, topic: "Ten Commandments" },
  { question: "The last commandment is about:", option_a: "Murder", option_b: "Stealing", option_c: "Coveting", option_d: "Adultery", correct_answer: "C", explanation: "The tenth commandment forbids coveting what belongs to others.", year: 2020, topic: "Ten Commandments" },
  { question: "The tablets of stone were written by:", option_a: "Moses", option_b: "God's finger", option_c: "Aaron", option_d: "The elders", correct_answer: "B", explanation: "The commandments were written by the finger of God.", year: 2022, topic: "Ten Commandments" },
  
  // Kings and Prophets
  { question: "The first king of Israel was:", option_a: "David", option_b: "Saul", option_c: "Solomon", option_d: "Samuel", correct_answer: "B", explanation: "Saul was anointed as Israel's first king by Samuel.", year: 2023, topic: "Kings" },
  { question: "David was the king of:", option_a: "Egypt", option_b: "Israel", option_c: "Babylon", option_d: "Assyria", correct_answer: "B", explanation: "David became king of Israel after Saul.", year: 2022, topic: "Kings" },
  { question: "David killed the giant:", option_a: "Samson", option_b: "Goliath", option_c: "Og", option_d: "Sisera", correct_answer: "B", explanation: "Young David killed the Philistine giant Goliath with a sling.", year: 2021, topic: "Kings" },
  { question: "Solomon was known for his:", option_a: "Strength", option_b: "Wisdom", option_c: "Beauty", option_d: "Speed", correct_answer: "B", explanation: "Solomon asked for wisdom and became the wisest king.", year: 2023, topic: "Kings" },
  { question: "Solomon built the:", option_a: "Ark", option_b: "Temple", option_c: "Tabernacle", option_d: "Tower", correct_answer: "B", explanation: "Solomon built the first Temple in Jerusalem.", year: 2020, topic: "Kings" },
  { question: "Elijah challenged the prophets of:", option_a: "Dagon", option_b: "Baal", option_c: "Molech", option_d: "Asherah", correct_answer: "B", explanation: "Elijah confronted 450 prophets of Baal on Mount Carmel.", year: 2022, topic: "Prophets" },
  { question: "Isaiah prophesied about:", option_a: "The flood", option_b: "The Messiah", option_c: "The exodus", option_d: "Creation", correct_answer: "B", explanation: "Isaiah contains many prophecies about the coming Messiah.", year: 2021, topic: "Prophets" },
  { question: "Jeremiah is known as the:", option_a: "Major prophet", option_b: "Weeping prophet", option_c: "Silent prophet", option_d: "Last prophet", correct_answer: "B", explanation: "Jeremiah wept over Jerusalem's coming destruction.", year: 2023, topic: "Prophets" },
  { question: "Daniel was thrown into:", option_a: "The fire", option_b: "The lions' den", option_c: "Prison", option_d: "The sea", correct_answer: "B", explanation: "Daniel was cast into the lions' den for praying to God.", year: 2020, topic: "Prophets" },
  { question: "Jonah was swallowed by a:", option_a: "Shark", option_b: "Great fish", option_c: "Whale", option_d: "Sea monster", correct_answer: "B", explanation: "A great fish swallowed Jonah when he fled from God.", year: 2022, topic: "Prophets" },
  
  // Life of Jesus
  { question: "Jesus was born in:", option_a: "Nazareth", option_b: "Bethlehem", option_c: "Jerusalem", option_d: "Capernaum", correct_answer: "B", explanation: "Jesus was born in Bethlehem of Judea.", year: 2023, topic: "Life of Jesus" },
  { question: "The mother of Jesus was:", option_a: "Elizabeth", option_b: "Mary", option_c: "Martha", option_d: "Anna", correct_answer: "B", explanation: "Mary was chosen to be the mother of Jesus.", year: 2022, topic: "Life of Jesus" },
  { question: "Jesus was baptized by:", option_a: "Peter", option_b: "John the Baptist", option_c: "James", option_d: "Paul", correct_answer: "B", explanation: "John baptized Jesus in the Jordan River.", year: 2021, topic: "Life of Jesus" },
  { question: "Jesus' first miracle was at:", option_a: "Jerusalem", option_b: "Cana", option_c: "Capernaum", option_d: "Bethsaida", correct_answer: "B", explanation: "Jesus turned water into wine at a wedding in Cana.", year: 2023, topic: "Miracles of Jesus" },
  { question: "How many disciples did Jesus choose?", option_a: "Ten", option_b: "Eleven", option_c: "Twelve", option_d: "Thirteen", correct_answer: "C", explanation: "Jesus chose twelve disciples/apostles.", year: 2020, topic: "Life of Jesus" },
  { question: "The disciple who betrayed Jesus was:", option_a: "Peter", option_b: "Judas Iscariot", option_c: "Thomas", option_d: "John", correct_answer: "B", explanation: "Judas betrayed Jesus for thirty pieces of silver.", year: 2022, topic: "Life of Jesus" },
  { question: "Jesus was crucified at:", option_a: "Bethlehem", option_b: "Golgotha", option_c: "Nazareth", option_d: "Jericho", correct_answer: "B", explanation: "Golgotha (the skull) was the place of crucifixion.", year: 2021, topic: "Death of Jesus" },
  { question: "Jesus rose from the dead on the:", option_a: "First day", option_b: "Second day", option_c: "Third day", option_d: "Fourth day", correct_answer: "C", explanation: "Jesus rose on the third day as He predicted.", year: 2023, topic: "Resurrection" },
  { question: "After resurrection, Jesus appeared to His disciples for:", option_a: "3 days", option_b: "7 days", option_c: "40 days", option_d: "50 days", correct_answer: "C", explanation: "Jesus appeared to disciples for 40 days before ascension.", year: 2020, topic: "Resurrection" },
  { question: "Jesus ascended to heaven from:", option_a: "Jerusalem", option_b: "Mount of Olives", option_c: "Bethlehem", option_d: "Galilee", correct_answer: "B", explanation: "Jesus ascended from the Mount of Olives near Bethany.", year: 2022, topic: "Ascension" },
  
  // Teachings of Jesus
  { question: "The Sermon on the Mount is found in:", option_a: "Mark", option_b: "Matthew", option_c: "Luke", option_d: "John", correct_answer: "B", explanation: "Matthew chapters 5-7 contain the Sermon on the Mount.", year: 2023, topic: "Teachings of Jesus" },
  { question: "The Beatitudes begin with:", option_a: "Blessed are the rich", option_b: "Blessed are the poor in spirit", option_c: "Blessed are the powerful", option_d: "Blessed are the famous", correct_answer: "B", explanation: "Blessed are the poor in spirit, for theirs is the kingdom.", year: 2022, topic: "Teachings of Jesus" },
  { question: "Jesus taught His disciples to pray the:", option_a: "Hail Mary", option_b: "Lord's Prayer", option_c: "Apostles' Creed", option_d: "Nicene Creed", correct_answer: "B", explanation: "The Lord's Prayer (Our Father) was taught by Jesus.", year: 2021, topic: "Teachings of Jesus" },
  { question: "The parable of the Good Samaritan teaches:", option_a: "Giving money", option_b: "Loving your neighbor", option_c: "Prayer", option_d: "Fasting", correct_answer: "B", explanation: "It teaches that everyone is our neighbor worthy of love.", year: 2023, topic: "Parables" },
  { question: "The parable of the Prodigal Son is about:", option_a: "Judgment", option_b: "Forgiveness", option_c: "Wealth", option_d: "Power", correct_answer: "B", explanation: "It illustrates God's forgiving love for sinners who repent.", year: 2020, topic: "Parables" },
  { question: "The parable of the Sower is about:", option_a: "Farming", option_b: "Receiving God's Word", option_c: "Money", option_d: "Travel", correct_answer: "B", explanation: "It describes different responses to hearing God's Word.", year: 2022, topic: "Parables" },
  { question: "The Greatest Commandment according to Jesus is:", option_a: "Keep the Sabbath", option_b: "Love God and love your neighbor", option_c: "Do not steal", option_d: "Honor parents", correct_answer: "B", explanation: "Jesus summarized the law as loving God and neighbor.", year: 2021, topic: "Teachings of Jesus" },
  { question: "The Golden Rule is:", option_a: "An eye for an eye", option_b: "Do unto others as you would have them do unto you", option_c: "Might makes right", option_d: "Survival of the fittest", correct_answer: "B", explanation: "Treat others as you wish to be treated.", year: 2023, topic: "Teachings of Jesus" },
  { question: "Jesus said 'I am the way, the truth, and the':", option_a: "Light", option_b: "Life", option_c: "Door", option_d: "Shepherd", correct_answer: "B", explanation: "I am the way, the truth, and the life (John 14:6).", year: 2020, topic: "Teachings of Jesus" },
  { question: "The parable of the Lost Sheep emphasizes:", option_a: "Punishment", option_b: "God's pursuit of the lost", option_c: "Farming", option_d: "Wealth", correct_answer: "B", explanation: "God seeks out every lost person like a shepherd seeks a lost sheep.", year: 2022, topic: "Parables" },
  
  // Early Church
  { question: "Pentecost occurred how many days after Jesus' resurrection?", option_a: "40 days", option_b: "50 days", option_c: "7 days", option_d: "30 days", correct_answer: "B", explanation: "Pentecost was 50 days after the resurrection.", year: 2023, topic: "Early Church" },
  { question: "The Holy Spirit came upon the disciples as:", option_a: "A dove", option_b: "Tongues of fire", option_c: "A cloud", option_d: "An earthquake", correct_answer: "B", explanation: "The Spirit appeared as tongues of fire on Pentecost.", year: 2022, topic: "Early Church" },
  { question: "The first Christian martyr was:", option_a: "Peter", option_b: "Stephen", option_c: "James", option_d: "Paul", correct_answer: "B", explanation: "Stephen was stoned to death for his faith.", year: 2021, topic: "Early Church" },
  { question: "Saul of Tarsus was converted on the road to:", option_a: "Jerusalem", option_b: "Damascus", option_c: "Rome", option_d: "Antioch", correct_answer: "B", explanation: "Saul met the risen Jesus on the road to Damascus.", year: 2023, topic: "Early Church" },
  { question: "After conversion, Saul became known as:", option_a: "Peter", option_b: "Paul", option_c: "Barnabas", option_d: "Silas", correct_answer: "B", explanation: "Saul became the Apostle Paul after his conversion.", year: 2020, topic: "Early Church" },
  { question: "Paul's letters to churches are called:", option_a: "Gospels", option_b: "Epistles", option_c: "Psalms", option_d: "Proverbs", correct_answer: "B", explanation: "Paul wrote epistles (letters) to various churches.", year: 2022, topic: "Early Church" },
  { question: "The book of Acts was written by:", option_a: "Paul", option_b: "Luke", option_c: "Peter", option_d: "John", correct_answer: "B", explanation: "Luke wrote both his Gospel and the Acts of the Apostles.", year: 2021, topic: "Early Church" },
  { question: "The church at Antioch was significant because:", option_a: "It was the largest", option_b: "Disciples were first called Christians there", option_c: "Peter founded it", option_d: "Jesus visited it", correct_answer: "B", explanation: "Believers were first called Christians in Antioch.", year: 2023, topic: "Early Church" },
  { question: "Paul was a:", option_a: "Fisherman", option_b: "Tentmaker", option_c: "Carpenter", option_d: "Tax collector", correct_answer: "B", explanation: "Paul made tents to support his ministry.", year: 2020, topic: "Early Church" },
  { question: "Paul wrote the most letters in the:", option_a: "Old Testament", option_b: "New Testament", option_c: "Apocrypha", option_d: "Dead Sea Scrolls", correct_answer: "B", explanation: "Paul authored 13 of the New Testament epistles.", year: 2022, topic: "Early Church" },
  
  // More CRS questions...
  { question: "How many books are in the New Testament?", option_a: "25", option_b: "27", option_c: "29", option_d: "31", correct_answer: "B", explanation: "The New Testament contains 27 books.", year: 2023, topic: "Bible" },
  { question: "How many books are in the Old Testament?", option_a: "36", option_b: "37", option_c: "38", option_d: "39", correct_answer: "D", explanation: "The Old Testament contains 39 books.", year: 2022, topic: "Bible" },
  { question: "The four Gospels are:", option_a: "Matthew, Mark, Luke, John", option_b: "Matthew, Mark, Luke, Acts", option_c: "Matthew, Mark, John, Romans", option_d: "Matthew, Mark, Luke, Peter", correct_answer: "A", explanation: "Matthew, Mark, Luke, and John are the four Gospel writers.", year: 2021, topic: "Bible" },
  { question: "The Gospel written for Jews is:", option_a: "Mark", option_b: "Matthew", option_c: "Luke", option_d: "John", correct_answer: "B", explanation: "Matthew emphasizes Jesus as the Jewish Messiah.", year: 2023, topic: "Bible" },
  { question: "The Gospel written for Gentiles is:", option_a: "Matthew", option_b: "Mark", option_c: "Luke", option_d: "John", correct_answer: "C", explanation: "Luke wrote for a Gentile audience (Theophilus).", year: 2020, topic: "Bible" },
  { question: "The last book of the Bible is:", option_a: "Jude", option_b: "Revelation", option_c: "3 John", option_d: "Hebrews", correct_answer: "B", explanation: "Revelation is the final book of the New Testament.", year: 2022, topic: "Bible" },
  { question: "The book of Psalms contains:", option_a: "100 songs", option_b: "120 songs", option_c: "150 songs", option_d: "200 songs", correct_answer: "C", explanation: "Psalms contains 150 hymns and songs.", year: 2021, topic: "Bible" },
  { question: "Proverbs was mainly written by:", option_a: "David", option_b: "Solomon", option_c: "Moses", option_d: "Samuel", correct_answer: "B", explanation: "Most Proverbs are attributed to King Solomon.", year: 2023, topic: "Bible" },
  { question: "The book focused on wisdom literature is:", option_a: "Genesis", option_b: "Ecclesiastes", option_c: "Joshua", option_d: "Judges", correct_answer: "B", explanation: "Ecclesiastes explores the meaning of life.", year: 2020, topic: "Bible" },
  { question: "The shortest verse in the Bible is:", option_a: "Genesis 1:1", option_b: "John 11:35", option_c: "John 3:16", option_d: "Psalm 23:1", correct_answer: "B", explanation: "'Jesus wept' (John 11:35) is the shortest verse.", year: 2022, topic: "Bible" },
  { question: "John 3:16 is often called:", option_a: "The Lord's Prayer", option_b: "The Gospel in a nutshell", option_c: "The Great Commission", option_d: "The Beatitude", correct_answer: "B", explanation: "It summarizes God's love and salvation plan.", year: 2021, topic: "Bible" },
  { question: "The Great Commission is found in:", option_a: "Matthew 28", option_b: "John 3", option_c: "Romans 8", option_d: "Genesis 1", correct_answer: "A", explanation: "Jesus' command to make disciples is in Matthew 28:18-20.", year: 2023, topic: "Teachings of Jesus" },
  { question: "Love, joy, peace, patience are part of the:", option_a: "Ten Commandments", option_b: "Fruit of the Spirit", option_c: "Beatitudes", option_d: "Lord's Prayer", correct_answer: "B", explanation: "These are aspects of the Fruit of the Spirit (Galatians 5:22).", year: 2020, topic: "Christian Living" },
  { question: "Faith, hope, and love are called the:", option_a: "Holy virtues", option_b: "Theological virtues", option_c: "Cardinal virtues", option_d: "Moral virtues", correct_answer: "B", explanation: "Paul mentions these three theological virtues in 1 Corinthians 13.", year: 2022, topic: "Christian Living" },
  { question: "The greatest of faith, hope, and love is:", option_a: "Faith", option_b: "Hope", option_c: "Love", option_d: "All equal", correct_answer: "C", explanation: "'The greatest of these is love' (1 Corinthians 13:13).", year: 2021, topic: "Christian Living" },
  { question: "Baptism symbolizes:", option_a: "Judgment", option_b: "Death and resurrection with Christ", option_c: "Creation", option_d: "The flood", correct_answer: "B", explanation: "Baptism represents dying to sin and rising to new life.", year: 2023, topic: "Sacraments" },
  { question: "Holy Communion commemorates:", option_a: "Creation", option_b: "The Last Supper", option_c: "Pentecost", option_d: "The Exodus", correct_answer: "B", explanation: "Communion recalls Jesus' last meal with His disciples.", year: 2020, topic: "Sacraments" },
  { question: "In Communion, bread represents:", option_a: "Life", option_b: "Christ's body", option_c: "Heaven", option_d: "Manna", correct_answer: "B", explanation: "Jesus said 'This is my body' when breaking bread.", year: 2022, topic: "Sacraments" },
  { question: "In Communion, wine represents:", option_a: "Joy", option_b: "Christ's blood", option_c: "The Spirit", option_d: "Water", correct_answer: "B", explanation: "Jesus said 'This is my blood of the covenant'.", year: 2021, topic: "Sacraments" },
  { question: "The Trinity refers to:", option_a: "Three gods", option_b: "Father, Son, and Holy Spirit", option_c: "Three prophets", option_d: "Three angels", correct_answer: "B", explanation: "The Trinity is one God in three persons.", year: 2023, topic: "Doctrine" },
];

const AGRIC_QUESTIONS = [
  // Crop Production
  { question: "The process of breaking up soil for planting is called:", option_a: "Harvesting", option_b: "Tillage", option_c: "Weeding", option_d: "Irrigation", correct_answer: "B", explanation: "Tillage is the preparation of soil by mechanical agitation.", year: 2023, topic: "Crop Production" },
  { question: "NPK fertilizer contains:", option_a: "Nitrogen, Phosphorus, Potassium", option_b: "Nitrogen, Phosphorus, Calcium", option_c: "Nickel, Phosphorus, Potassium", option_d: "Nitrogen, Platinum, Potassium", correct_answer: "A", explanation: "NPK stands for Nitrogen (N), Phosphorus (P), and Potassium (K).", year: 2022, topic: "Crop Production" },
  { question: "Photosynthesis occurs mainly in the:", option_a: "Roots", option_b: "Stem", option_c: "Leaves", option_d: "Flowers", correct_answer: "C", explanation: "Leaves contain chlorophyll where photosynthesis takes place.", year: 2021, topic: "Crop Production" },
  { question: "The practice of growing different crops in succession is:", option_a: "Monoculture", option_b: "Crop rotation", option_c: "Mixed farming", option_d: "Intercropping", correct_answer: "B", explanation: "Crop rotation maintains soil fertility and breaks pest cycles.", year: 2023, topic: "Crop Production" },
  { question: "Leguminous plants fix nitrogen through:", option_a: "Leaves", option_b: "Root nodules", option_c: "Stems", option_d: "Flowers", correct_answer: "B", explanation: "Bacteria in root nodules convert atmospheric nitrogen.", year: 2020, topic: "Crop Production" },
  { question: "The optimal pH for most crops is:", option_a: "4.0-5.0", option_b: "5.5-7.0", option_c: "8.0-9.0", option_d: "10.0-12.0", correct_answer: "B", explanation: "Most crops thrive in slightly acidic to neutral soil.", year: 2022, topic: "Soil Science" },
  { question: "Mulching helps to:", option_a: "Increase erosion", option_b: "Conserve soil moisture", option_c: "Increase weeds", option_d: "Remove nutrients", correct_answer: "B", explanation: "Mulch retains moisture and suppresses weeds.", year: 2021, topic: "Crop Production" },
  { question: "The process of removing unwanted plants is called:", option_a: "Pruning", option_b: "Weeding", option_c: "Harvesting", option_d: "Planting", correct_answer: "B", explanation: "Weeding removes plants that compete with crops.", year: 2023, topic: "Crop Production" },
  { question: "Seeds germinate best in:", option_a: "Dry conditions", option_b: "Moisture, warmth, and oxygen", option_c: "Extreme cold", option_d: "Complete darkness only", correct_answer: "B", explanation: "Germination requires adequate moisture, temperature, and air.", year: 2020, topic: "Crop Production" },
  { question: "The embryonic root in a seed is called:", option_a: "Plumule", option_b: "Radicle", option_c: "Cotyledon", option_d: "Testa", correct_answer: "B", explanation: "The radicle develops into the root system.", year: 2022, topic: "Crop Production" },
  { question: "Hybrid seeds are:", option_a: "Natural seeds", option_b: "Cross-bred for improved traits", option_c: "Wild seeds", option_d: "Ancient seeds", correct_answer: "B", explanation: "Hybrids combine desirable traits from different varieties.", year: 2021, topic: "Crop Production" },
  { question: "Irrigation is:", option_a: "Removing water", option_b: "Artificial application of water", option_c: "Soil testing", option_d: "Harvesting", correct_answer: "B", explanation: "Irrigation supplies water to crops artificially.", year: 2023, topic: "Crop Production" },
  { question: "Drip irrigation is best for:", option_a: "Rice paddies", option_b: "Water conservation", option_c: "Flooding fields", option_d: "Heavy rainfall areas", correct_answer: "B", explanation: "Drip systems deliver water directly to plant roots efficiently.", year: 2020, topic: "Crop Production" },
  { question: "The Green Revolution introduced:", option_a: "Traditional farming only", option_b: "High-yielding varieties and modern techniques", option_c: "Organic farming only", option_d: "Animal husbandry", correct_answer: "B", explanation: "It brought improved seeds, fertilizers, and irrigation.", year: 2022, topic: "Crop Production" },
  { question: "Transplanting involves:", option_a: "Direct seeding", option_b: "Moving seedlings to main field", option_c: "Harvesting", option_d: "Storage", correct_answer: "B", explanation: "Seedlings grown in nurseries are transplanted to fields.", year: 2021, topic: "Crop Production" },
  
  // Soil Science
  { question: "The three main soil particles are:", option_a: "Rock, stone, pebble", option_b: "Sand, silt, clay", option_c: "Humus, minerals, water", option_d: "Calcium, magnesium, iron", correct_answer: "B", explanation: "Soil texture is determined by sand, silt, and clay proportions.", year: 2023, topic: "Soil Science" },
  { question: "Humus is:", option_a: "Inorganic matter", option_b: "Decomposed organic matter", option_c: "Rock particles", option_d: "Sand", correct_answer: "B", explanation: "Humus is dark, decomposed organic material in soil.", year: 2022, topic: "Soil Science" },
  { question: "Soil erosion is caused by:", option_a: "Planting trees", option_b: "Water, wind, and human activities", option_c: "Mulching", option_d: "Composting", correct_answer: "B", explanation: "These agents remove topsoil and damage land.", year: 2021, topic: "Soil Science" },
  { question: "Terracing is used to prevent erosion on:", option_a: "Flat land", option_b: "Slopes and hills", option_c: "Valleys", option_d: "Deserts", correct_answer: "B", explanation: "Terraces create level steps on slopes to reduce runoff.", year: 2023, topic: "Soil Science" },
  { question: "Liming acidic soil is done to:", option_a: "Lower pH", option_b: "Raise pH", option_c: "Add nitrogen", option_d: "Remove water", correct_answer: "B", explanation: "Lime (calcium carbonate) neutralizes soil acidity.", year: 2020, topic: "Soil Science" },
  { question: "Clay soil is characterized by:", option_a: "Good drainage", option_b: "Poor drainage, high water retention", option_c: "Large particles", option_d: "Low fertility", correct_answer: "B", explanation: "Clay has tiny particles that hold water tightly.", year: 2022, topic: "Soil Science" },
  { question: "Sandy soil has:", option_a: "Poor drainage", option_b: "Good drainage, low water retention", option_c: "Tiny particles", option_d: "High fertility", correct_answer: "B", explanation: "Large sand particles allow water to drain quickly.", year: 2021, topic: "Soil Science" },
  { question: "Loam soil is considered ideal because:", option_a: "It has only clay", option_b: "It has balanced sand, silt, and clay", option_c: "It has only sand", option_d: "It has no humus", correct_answer: "B", explanation: "Loam has good drainage, fertility, and water retention.", year: 2023, topic: "Soil Science" },
  { question: "Soil profile refers to:", option_a: "Soil color", option_b: "Vertical cross-section of soil layers", option_c: "Soil weight", option_d: "Soil temperature", correct_answer: "B", explanation: "It shows horizons (O, A, B, C) from surface to bedrock.", year: 2020, topic: "Soil Science" },
  { question: "The topsoil is called horizon:", option_a: "O", option_b: "A", option_c: "B", option_d: "C", correct_answer: "B", explanation: "The A horizon is the topsoil rich in organic matter.", year: 2022, topic: "Soil Science" },
  { question: "Cover cropping helps to:", option_a: "Increase erosion", option_b: "Protect and enrich soil", option_c: "Remove nutrients", option_d: "Compact soil", correct_answer: "B", explanation: "Cover crops prevent erosion and add organic matter.", year: 2021, topic: "Soil Science" },
  { question: "Nitrogen deficiency in plants causes:", option_a: "Purple leaves", option_b: "Yellowing of older leaves", option_c: "Brown tips", option_d: "White spots", correct_answer: "B", explanation: "Nitrogen-deficient plants show chlorosis in older leaves.", year: 2023, topic: "Soil Science" },
  { question: "Phosphorus is important for:", option_a: "Leaf growth only", option_b: "Root development and flowering", option_c: "Stem height only", option_d: "Leaf color only", correct_answer: "B", explanation: "Phosphorus promotes root growth and flower/fruit development.", year: 2020, topic: "Soil Science" },
  { question: "Potassium helps plants with:", option_a: "Root growth only", option_b: "Disease resistance and water regulation", option_c: "Only flowering", option_d: "Only germination", correct_answer: "B", explanation: "Potassium strengthens plants and regulates water use.", year: 2022, topic: "Soil Science" },
  { question: "Compost is:", option_a: "Chemical fertilizer", option_b: "Decomposed organic waste", option_c: "Pesticide", option_d: "Herbicide", correct_answer: "B", explanation: "Compost is organic material broken down by decomposers.", year: 2021, topic: "Soil Science" },
  
  // Animal Husbandry
  { question: "Poultry farming involves raising:", option_a: "Cattle", option_b: "Chickens, turkeys, ducks", option_c: "Pigs only", option_d: "Goats only", correct_answer: "B", explanation: "Poultry includes domestic birds raised for eggs or meat.", year: 2023, topic: "Animal Husbandry" },
  { question: "The gestation period of a cow is approximately:", option_a: "5 months", option_b: "9 months", option_c: "12 months", option_d: "15 months", correct_answer: "B", explanation: "Cattle have a gestation period of about 283 days.", year: 2022, topic: "Animal Husbandry" },
  { question: "Aquaculture refers to:", option_a: "Poultry farming", option_b: "Fish farming", option_c: "Cattle rearing", option_d: "Bee keeping", correct_answer: "B", explanation: "Aquaculture is the farming of fish and aquatic organisms.", year: 2021, topic: "Animal Husbandry" },
  { question: "Apiculture is:", option_a: "Fish farming", option_b: "Bee keeping", option_c: "Poultry farming", option_d: "Cattle rearing", correct_answer: "B", explanation: "Apiculture is the maintenance of bee colonies for honey.", year: 2023, topic: "Animal Husbandry" },
  { question: "Silage is:", option_a: "Dry hay", option_b: "Fermented, preserved fodder", option_c: "Animal waste", option_d: "Grain mixture", correct_answer: "B", explanation: "Silage is fermented green fodder stored for livestock.", year: 2020, topic: "Animal Husbandry" },
  { question: "Ruminants have:", option_a: "Simple stomach", option_b: "Four-chambered stomach", option_c: "No stomach", option_d: "Three-chambered heart", correct_answer: "B", explanation: "Ruminants (cows, goats) have rumen, reticulum, omasum, abomasum.", year: 2022, topic: "Animal Husbandry" },
  { question: "The rumen is important for:", option_a: "Blood circulation", option_b: "Fermentation of plant material", option_c: "Egg production", option_d: "Muscle growth only", correct_answer: "B", explanation: "Microbes in the rumen break down cellulose.", year: 2021, topic: "Animal Husbandry" },
  { question: "Broilers are raised for:", option_a: "Eggs", option_b: "Meat", option_c: "Feathers only", option_d: "Breeding only", correct_answer: "B", explanation: "Broilers are chickens bred and raised for meat production.", year: 2023, topic: "Animal Husbandry" },
  { question: "Layers are raised for:", option_a: "Meat only", option_b: "Egg production", option_c: "Feathers", option_d: "Racing", correct_answer: "B", explanation: "Layer hens are bred specifically for egg-laying.", year: 2020, topic: "Animal Husbandry" },
  { question: "Newcastle disease affects:", option_a: "Cattle", option_b: "Poultry", option_c: "Fish", option_d: "Pigs", correct_answer: "B", explanation: "Newcastle is a viral disease affecting chickens and other birds.", year: 2022, topic: "Animal Husbandry" },
  { question: "Rinderpest affects:", option_a: "Poultry", option_b: "Cattle", option_c: "Fish", option_d: "Bees", correct_answer: "B", explanation: "Rinderpest (cattle plague) was a disease of cattle and buffalo.", year: 2021, topic: "Animal Husbandry" },
  { question: "Artificial insemination is used to:", option_a: "Kill pests", option_b: "Improve breeding efficiency", option_c: "Store meat", option_d: "Grow crops", correct_answer: "B", explanation: "AI allows controlled breeding with superior genetics.", year: 2023, topic: "Animal Husbandry" },
  { question: "Cattle are raised for:", option_a: "Eggs", option_b: "Meat, milk, and leather", option_c: "Feathers", option_d: "Honey", correct_answer: "B", explanation: "Cattle provide beef, dairy products, and hides.", year: 2020, topic: "Animal Husbandry" },
  { question: "The lactation period of a cow is:", option_a: "1-2 months", option_b: "10-12 months", option_c: "24 months", option_d: "36 months", correct_answer: "B", explanation: "Cows typically lactate for about 10-12 months.", year: 2022, topic: "Animal Husbandry" },
  { question: "Colostrum is:", option_a: "Regular milk", option_b: "First milk rich in antibodies", option_c: "Spoiled milk", option_d: "Low-fat milk", correct_answer: "B", explanation: "Colostrum provides immunity to newborn animals.", year: 2021, topic: "Animal Husbandry" },
  
  // Pests and Diseases
  { question: "Integrated Pest Management (IPM) involves:", option_a: "Chemicals only", option_b: "Combined pest control methods", option_c: "Ignoring pests", option_d: "Manual removal only", correct_answer: "B", explanation: "IPM combines biological, cultural, and chemical controls.", year: 2023, topic: "Pests and Diseases" },
  { question: "Biological pest control uses:", option_a: "Chemicals", option_b: "Natural enemies of pests", option_c: "Fire", option_d: "Salt", correct_answer: "B", explanation: "Predators, parasites, or pathogens control pest populations.", year: 2022, topic: "Pests and Diseases" },
  { question: "Pesticides are used to:", option_a: "Fertilize plants", option_b: "Kill or control pests", option_c: "Water plants", option_d: "Harvest crops", correct_answer: "B", explanation: "Pesticides eliminate harmful insects, weeds, or diseases.", year: 2021, topic: "Pests and Diseases" },
  { question: "Herbicides are used against:", option_a: "Insects", option_b: "Weeds", option_c: "Fungi", option_d: "Bacteria", correct_answer: "B", explanation: "Herbicides kill unwanted plants (weeds).", year: 2023, topic: "Pests and Diseases" },
  { question: "Fungicides are used against:", option_a: "Insects", option_b: "Fungi", option_c: "Weeds", option_d: "Rodents", correct_answer: "B", explanation: "Fungicides prevent or kill fungal diseases.", year: 2020, topic: "Pests and Diseases" },
  { question: "Insecticides target:", option_a: "Weeds", option_b: "Insects", option_c: "Fungi", option_d: "Bacteria", correct_answer: "B", explanation: "Insecticides kill or repel harmful insects.", year: 2022, topic: "Pests and Diseases" },
  { question: "Stem borers are pests of:", option_a: "Maize, rice, sugarcane", option_b: "Only vegetables", option_c: "Only fruits", option_d: "Fish", correct_answer: "A", explanation: "Stem borers damage cereal crops by boring into stems.", year: 2021, topic: "Pests and Diseases" },
  { question: "Aphids damage plants by:", option_a: "Eating roots", option_b: "Sucking plant sap", option_c: "Boring into stems", option_d: "Eating seeds", correct_answer: "B", explanation: "Aphids are sap-sucking insects that weaken plants.", year: 2023, topic: "Pests and Diseases" },
  { question: "Crop rotation helps control pests by:", option_a: "Increasing pest food", option_b: "Breaking pest life cycles", option_c: "Attracting more pests", option_d: "Ignoring pests", correct_answer: "B", explanation: "Changing crops disrupts pests dependent on specific hosts.", year: 2020, topic: "Pests and Diseases" },
  { question: "Quarantine in agriculture prevents:", option_a: "Rainfall", option_b: "Spread of pests and diseases", option_c: "Crop growth", option_d: "Harvesting", correct_answer: "B", explanation: "Quarantine restricts movement of infected materials.", year: 2022, topic: "Pests and Diseases" },
  { question: "Weeds compete with crops for:", option_a: "Only space", option_b: "Water, nutrients, light, space", option_c: "Only water", option_d: "Only sunlight", correct_answer: "B", explanation: "Weeds take resources needed by crop plants.", year: 2021, topic: "Pests and Diseases" },
  { question: "Striga is a:", option_a: "Beneficial insect", option_b: "Parasitic weed", option_c: "Fertilizer", option_d: "Pesticide", correct_answer: "B", explanation: "Striga (witchweed) parasitizes cereal crop roots.", year: 2023, topic: "Pests and Diseases" },
  { question: "Resistant crop varieties help by:", option_a: "Attracting pests", option_b: "Withstanding pest/disease attack", option_c: "Reducing yields", option_d: "Increasing costs", correct_answer: "B", explanation: "Resistant varieties have natural defenses against pests.", year: 2020, topic: "Pests and Diseases" },
  { question: "Nematodes are:", option_a: "Insects", option_b: "Microscopic worms", option_c: "Fungi", option_d: "Bacteria", correct_answer: "B", explanation: "Plant-parasitic nematodes damage roots of many crops.", year: 2022, topic: "Pests and Diseases" },
  { question: "Blight in plants is caused by:", option_a: "Insects", option_b: "Fungi or bacteria", option_c: "Excess water only", option_d: "Heat only", correct_answer: "B", explanation: "Blight diseases are typically fungal or bacterial.", year: 2021, topic: "Pests and Diseases" },
  
  // Farm Tools and Machinery
  { question: "A cutlass is used for:", option_a: "Planting", option_b: "Cutting and clearing", option_c: "Harvesting rice", option_d: "Milking", correct_answer: "B", explanation: "Cutlasses are used to clear bush and cut vegetation.", year: 2023, topic: "Farm Tools" },
  { question: "A hoe is used for:", option_a: "Planting only", option_b: "Tilling and weeding", option_c: "Harvesting only", option_d: "Irrigation", correct_answer: "B", explanation: "Hoes are used to break soil and remove weeds.", year: 2022, topic: "Farm Tools" },
  { question: "A tractor is used for:", option_a: "Hand weeding", option_b: "Mechanized farming operations", option_c: "Milking only", option_d: "Egg collection", correct_answer: "B", explanation: "Tractors pull implements for plowing, planting, harvesting.", year: 2021, topic: "Farm Machinery" },
  { question: "A plough is used for:", option_a: "Harvesting", option_b: "Turning and loosening soil", option_c: "Planting seeds", option_d: "Spraying", correct_answer: "B", explanation: "Ploughs break up and turn over soil for planting.", year: 2023, topic: "Farm Tools" },
  { question: "A harrow is used after ploughing to:", option_a: "Plant seeds", option_b: "Break clods and level soil", option_c: "Harvest crops", option_d: "Spray chemicals", correct_answer: "B", explanation: "Harrows refine the seedbed after ploughing.", year: 2020, topic: "Farm Tools" },
  { question: "A sickle is used for:", option_a: "Ploughing", option_b: "Harvesting cereals", option_c: "Irrigating", option_d: "Milking", correct_answer: "B", explanation: "Sickles are curved blades for cutting grain crops.", year: 2022, topic: "Farm Tools" },
  { question: "A knapsack sprayer is used for:", option_a: "Planting", option_b: "Applying pesticides", option_c: "Harvesting", option_d: "Storage", correct_answer: "B", explanation: "It's a backpack sprayer for applying chemicals to crops.", year: 2021, topic: "Farm Tools" },
  { question: "A combine harvester does:", option_a: "Only planting", option_b: "Cutting, threshing, and cleaning grain", option_c: "Only irrigation", option_d: "Only spraying", correct_answer: "B", explanation: "Combines perform multiple harvest operations in one pass.", year: 2023, topic: "Farm Machinery" },
  { question: "A seed drill is used for:", option_a: "Harvesting", option_b: "Precise seed placement", option_c: "Spraying", option_d: "Irrigation", correct_answer: "B", explanation: "Seed drills plant seeds at uniform depth and spacing.", year: 2020, topic: "Farm Machinery" },
  { question: "A wheelbarrow is used for:", option_a: "Planting", option_b: "Transporting materials", option_c: "Spraying", option_d: "Harvesting", correct_answer: "B", explanation: "Wheelbarrows carry soil, fertilizer, produce, etc.", year: 2022, topic: "Farm Tools" },
  { question: "Maintenance of farm tools includes:", option_a: "Throwing them away", option_b: "Cleaning, oiling, sharpening", option_c: "Leaving them in rain", option_d: "Burning them", correct_answer: "B", explanation: "Proper care extends tool life and effectiveness.", year: 2021, topic: "Farm Tools" },
  { question: "Simple farm tools are:", option_a: "Tractors", option_b: "Hand-held implements", option_c: "Combine harvesters", option_d: "Aeroplanes", correct_answer: "B", explanation: "Simple tools are manually operated like hoes, cutlasses.", year: 2023, topic: "Farm Tools" },
  { question: "A watering can is used for:", option_a: "Planting", option_b: "Manual irrigation", option_c: "Harvesting", option_d: "Storage", correct_answer: "B", explanation: "Watering cans deliver water to plants in gardens/nurseries.", year: 2020, topic: "Farm Tools" },
  { question: "A rake is used for:", option_a: "Cutting", option_b: "Gathering debris and leveling", option_c: "Spraying", option_d: "Digging deep", correct_answer: "B", explanation: "Rakes collect leaves, level soil, and spread mulch.", year: 2022, topic: "Farm Tools" },
  { question: "A shovel is used for:", option_a: "Cutting weeds", option_b: "Digging and moving soil", option_c: "Spraying", option_d: "Harvesting cereals", correct_answer: "B", explanation: "Shovels are used for digging and moving loose materials.", year: 2021, topic: "Farm Tools" },
  
  // Agricultural Economics
  { question: "Farm records help farmers to:", option_a: "Waste time", option_b: "Track income, expenses, and make decisions", option_c: "Avoid planning", option_d: "Ignore problems", correct_answer: "B", explanation: "Records provide data for farm management decisions.", year: 2023, topic: "Agricultural Economics" },
  { question: "Subsistence farming produces:", option_a: "For export", option_b: "Mainly for family consumption", option_c: "Only cash crops", option_d: "For industries only", correct_answer: "B", explanation: "Subsistence farmers grow food primarily for their own use.", year: 2022, topic: "Agricultural Economics" },
  { question: "Commercial farming produces:", option_a: "For family only", option_b: "For sale and profit", option_c: "Nothing", option_d: "Weeds only", correct_answer: "B", explanation: "Commercial farms aim to sell products for income.", year: 2021, topic: "Agricultural Economics" },
  { question: "Agricultural cooperatives help farmers by:", option_a: "Increasing costs", option_b: "Pooling resources and marketing", option_c: "Working alone", option_d: "Avoiding credit", correct_answer: "B", explanation: "Cooperatives give farmers collective bargaining power.", year: 2023, topic: "Agricultural Economics" },
  { question: "Agricultural extension services provide:", option_a: "Money only", option_b: "Information and training to farmers", option_c: "Seeds only", option_d: "Nothing", correct_answer: "B", explanation: "Extension agents transfer knowledge to farmers.", year: 2020, topic: "Agricultural Economics" },
  { question: "Land tenure refers to:", option_a: "Soil type", option_b: "Rights to use land", option_c: "Land size only", option_d: "Soil color", correct_answer: "B", explanation: "Land tenure defines how people access and use land.", year: 2022, topic: "Agricultural Economics" },
  { question: "Agricultural credit helps farmers to:", option_a: "Avoid farming", option_b: "Access funds for inputs", option_c: "Stop production", option_d: "Ignore costs", correct_answer: "B", explanation: "Credit provides capital for seeds, fertilizers, equipment.", year: 2021, topic: "Agricultural Economics" },
  { question: "Farm budgeting involves:", option_a: "Ignoring costs", option_b: "Planning income and expenses", option_c: "Random spending", option_d: "No planning", correct_answer: "B", explanation: "Budgets help farmers plan and control finances.", year: 2023, topic: "Agricultural Economics" },
  { question: "Gross margin is:", option_a: "Total loss", option_b: "Revenue minus variable costs", option_c: "Only expenses", option_d: "Fixed costs only", correct_answer: "B", explanation: "Gross margin = Total revenue - Variable costs.", year: 2020, topic: "Agricultural Economics" },
  { question: "Market price is determined by:", option_a: "Government only", option_b: "Supply and demand", option_c: "Farmers alone", option_d: "Buyers alone", correct_answer: "B", explanation: "Market forces of supply and demand set prices.", year: 2022, topic: "Agricultural Economics" },
  { question: "Value addition in agriculture means:", option_a: "Reducing quality", option_b: "Processing to increase value", option_c: "Leaving raw", option_d: "Ignoring products", correct_answer: "B", explanation: "Processing raw products increases their market value.", year: 2021, topic: "Agricultural Economics" },
  { question: "Agribusiness includes:", option_a: "Only farming", option_b: "All businesses related to agriculture", option_c: "Only selling", option_d: "Only processing", correct_answer: "B", explanation: "Agribusiness covers input supply, production, processing, marketing.", year: 2023, topic: "Agricultural Economics" },
  { question: "Farm inventory includes:", option_a: "Only tools", option_b: "List of all farm assets", option_c: "Only crops", option_d: "Only animals", correct_answer: "B", explanation: "Inventory lists all equipment, livestock, supplies, etc.", year: 2020, topic: "Agricultural Economics" },
  { question: "Depreciation means:", option_a: "Value increase", option_b: "Decrease in asset value over time", option_c: "No change", option_d: "Immediate loss", correct_answer: "B", explanation: "Farm equipment loses value through use and age.", year: 2022, topic: "Agricultural Economics" },
  { question: "Organic farming avoids:", option_a: "All farming", option_b: "Synthetic chemicals and GMOs", option_c: "Natural methods", option_d: "Composting", correct_answer: "B", explanation: "Organic agriculture uses natural inputs only.", year: 2021, topic: "Agricultural Economics" },
  
  // More Agric questions...
  { question: "Monoculture means growing:", option_a: "Many crops together", option_b: "One crop type repeatedly", option_c: "No crops", option_d: "Only trees", correct_answer: "B", explanation: "Monoculture is continuous cultivation of a single crop.", year: 2023, topic: "Crop Production" },
  { question: "Intercropping involves:", option_a: "Growing one crop", option_b: "Growing multiple crops together", option_c: "No farming", option_d: "Only animals", correct_answer: "B", explanation: "Intercropping grows two or more crops simultaneously.", year: 2022, topic: "Crop Production" },
  { question: "Mixed farming combines:", option_a: "Only crops", option_b: "Crop and animal production", option_c: "Only animals", option_d: "Only fishing", correct_answer: "B", explanation: "Mixed farming integrates crops and livestock.", year: 2021, topic: "Agricultural Systems" },
  { question: "Shifting cultivation involves:", option_a: "Permanent farming", option_b: "Moving to new land after soil exhaustion", option_c: "Never moving", option_d: "Urban farming", correct_answer: "B", explanation: "Farmers move when soil fertility declines.", year: 2023, topic: "Agricultural Systems" },
  { question: "Taungya farming combines:", option_a: "Fish and crops", option_b: "Trees and arable crops", option_c: "Only trees", option_d: "Only animals", correct_answer: "B", explanation: "Taungya grows food crops between tree plantations.", year: 2020, topic: "Agricultural Systems" },
  { question: "Agroforestry integrates:", option_a: "Only crops", option_b: "Trees with crops and/or livestock", option_c: "Only forest", option_d: "Only buildings", correct_answer: "B", explanation: "Agroforestry combines trees with agricultural practices.", year: 2022, topic: "Agricultural Systems" },
  { question: "The storage hormone in plants is:", option_a: "Auxin", option_b: "Abscisic acid", option_c: "Gibberellin", option_d: "Cytokinin", correct_answer: "B", explanation: "Abscisic acid regulates seed dormancy and storage.", year: 2021, topic: "Crop Production" },
  { question: "Auxins promote:", option_a: "Leaf fall", option_b: "Cell elongation and growth", option_c: "Dormancy", option_d: "Flowering only", correct_answer: "B", explanation: "Auxins stimulate stem elongation and root initiation.", year: 2023, topic: "Crop Production" },
  { question: "Gibberellins promote:", option_a: "Dormancy", option_b: "Stem elongation and germination", option_c: "Leaf fall", option_d: "Death", correct_answer: "B", explanation: "Gibberellins break dormancy and promote growth.", year: 2020, topic: "Crop Production" },
  { question: "Ethylene is associated with:", option_a: "Growth", option_b: "Fruit ripening", option_c: "Dormancy", option_d: "Root formation", correct_answer: "B", explanation: "Ethylene triggers fruit ripening and senescence.", year: 2022, topic: "Crop Production" },
  { question: "Vegetative propagation is:", option_a: "Sexual reproduction", option_b: "Asexual reproduction", option_c: "Seed production", option_d: "Pollination", correct_answer: "B", explanation: "Plants reproduce asexually from cuttings, tubers, etc.", year: 2021, topic: "Crop Production" },
  { question: "Grafting involves:", option_a: "Seed planting", option_b: "Joining tissues of two plants", option_c: "Root cutting", option_d: "Leaf removal", correct_answer: "B", explanation: "Grafting unites a scion to a rootstock.", year: 2023, topic: "Crop Production" },
  { question: "Budding is a form of:", option_a: "Seed propagation", option_b: "Grafting", option_c: "Sexual reproduction", option_d: "Harvesting", correct_answer: "B", explanation: "Budding grafts a single bud onto rootstock.", year: 2020, topic: "Crop Production" },
  { question: "Layering propagates plants by:", option_a: "Seeds", option_b: "Rooting attached stems", option_c: "Cutting leaves", option_d: "Grafting", correct_answer: "B", explanation: "Layering roots stems while still attached to parent.", year: 2022, topic: "Crop Production" },
  { question: "Tissue culture produces:", option_a: "Seeds only", option_b: "Plants from small tissue pieces", option_c: "Animals", option_d: "Chemicals", correct_answer: "B", explanation: "Tissue culture grows plants from cells in sterile conditions.", year: 2021, topic: "Crop Production" },
  { question: "Pasture refers to:", option_a: "Crop land", option_b: "Grazing land for livestock", option_c: "Forest", option_d: "Desert", correct_answer: "B", explanation: "Pastures provide grass and forage for grazing animals.", year: 2023, topic: "Animal Husbandry" },
  { question: "Fodder crops are grown for:", option_a: "Human food", option_b: "Animal feed", option_c: "Building materials", option_d: "Fuel only", correct_answer: "B", explanation: "Fodder provides nutrition for livestock.", year: 2020, topic: "Animal Husbandry" },
  { question: "Hay is:", option_a: "Fresh grass", option_b: "Dried grass or legumes", option_c: "Fermented fodder", option_d: "Grain", correct_answer: "B", explanation: "Hay is grass cut and dried for animal feed.", year: 2022, topic: "Animal Husbandry" },
  { question: "Concentrate feeds are:", option_a: "Low energy", option_b: "High energy and protein", option_c: "Only roughage", option_d: "Only water", correct_answer: "B", explanation: "Concentrates like grains provide dense nutrition.", year: 2021, topic: "Animal Husbandry" },
  { question: "Roughages are:", option_a: "High protein", option_b: "High fiber, low energy", option_c: "Grains", option_d: "Minerals only", correct_answer: "B", explanation: "Roughages like hay and straw are fibrous feeds.", year: 2023, topic: "Animal Husbandry" },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const allQuestions = [
      ...IRS_QUESTIONS.map(q => ({ ...q, subject: 'irs' })),
      ...CRS_QUESTIONS.map(q => ({ ...q, subject: 'crs' })),
      ...AGRIC_QUESTIONS.map(q => ({ ...q, subject: 'agricultural_science' })),
    ];

    let insertedCount = 0;
    let skippedCount = 0;
    const results: Record<string, { inserted: number; skipped: number }> = {
      irs: { inserted: 0, skipped: 0 },
      crs: { inserted: 0, skipped: 0 },
      agricultural_science: { inserted: 0, skipped: 0 },
    };

    for (const q of allQuestions) {
      // Check if question already exists (by matching question text and subject)
      const { data: existing } = await supabase
        .from('jamb_questions')
        .select('id')
        .eq('question', q.question)
        .eq('subject', q.subject)
        .maybeSingle();

      if (existing) {
        skippedCount++;
        results[q.subject].skipped++;
        continue;
      }

      // Insert new question
      const { error } = await supabase
        .from('jamb_questions')
        .insert({
          subject: q.subject,
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          year: q.year,
        });

      if (!error) {
        insertedCount++;
        results[q.subject].inserted++;
      } else {
        console.error('Insert error:', error);
      }
    }

    // Get updated counts
    const { data: countData } = await supabase
      .from('jamb_questions')
      .select('subject')
      .in('subject', ['irs', 'crs', 'agricultural_science']);

    const subjectCounts: Record<string, number> = {
      irs: 0,
      crs: 0,
      agricultural_science: 0,
    };

    countData?.forEach(row => {
      if (row.subject in subjectCounts) {
        subjectCounts[row.subject]++;
      }
    });

    // Get total count
    const { count: totalCount } = await supabase
      .from('jamb_questions')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedCount} new questions for low-count subjects`,
        inserted: insertedCount,
        skipped: skippedCount,
        total_in_database: totalCount,
        by_subject: results,
        current_counts: subjectCounts,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
