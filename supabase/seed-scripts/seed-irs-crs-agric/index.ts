import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const IRS_QUESTIONS = [
  // Islamic Law (Fiqh)
  { question: "Wudu (ablution) is a prerequisite for:", option_a: "Fasting", option_b: "Salah (prayer)", option_c: "Zakat", option_d: "Hajj only", correct_answer: "B", explanation: "Wudu is required before performing Salah. Without valid Wudu, prayer is not accepted.", year: 2025, topic: "Fiqh" },
  { question: "The minimum number of Rak'ah for Fajr prayer is:", option_a: "Two", option_b: "Three", option_c: "Four", option_d: "One", correct_answer: "A", explanation: "Fajr prayer consists of 2 Rak'ah (units of prayer).", year: 2025, topic: "Fiqh" },
  { question: "Zakat al-Fitr is paid at the end of:", option_a: "Hajj", option_b: "Ramadan", option_c: "Shawwal", option_d: "Dhul Hijjah", correct_answer: "B", explanation: "Zakat al-Fitr is an obligatory charity paid at the end of Ramadan before Eid prayer.", year: 2025, topic: "Fiqh" },
  { question: "The period of Iddah for a divorced woman is:", option_a: "One month", option_b: "Three months", option_c: "Four months", option_d: "One year", correct_answer: "B", explanation: "The Iddah period for a divorced woman is three menstrual cycles (approximately 3 months).", year: 2025, topic: "Fiqh" },
  { question: "Ghusl (full body wash) is required after:", option_a: "Waking up", option_b: "Sexual intercourse", option_c: "Eating", option_d: "Walking", correct_answer: "B", explanation: "Ghusl is obligatory after janabah (sexual discharge) to restore ritual purity.", year: 2025, topic: "Fiqh" },
  { question: "The Qiblah direction is towards:", option_a: "Madinah", option_b: "Jerusalem", option_c: "Makkah", option_d: "Mount Arafat", correct_answer: "C", explanation: "Muslims face the Kaabah in Makkah during prayer.", year: 2025, topic: "Fiqh" },
  { question: "Jumu'ah (Friday) prayer replaces which daily prayer?", option_a: "Fajr", option_b: "Dhuhr", option_c: "Asr", option_d: "Maghrib", correct_answer: "B", explanation: "Jumu'ah prayer replaces the Dhuhr prayer on Fridays for men.", year: 2025, topic: "Fiqh" },
  { question: "Tayammum is performed when:", option_a: "Water is available", option_b: "Water is unavailable", option_c: "It's raining", option_d: "At night only", correct_answer: "B", explanation: "Tayammum (dry ablution) is permitted when water is unavailable or harmful to use.", year: 2025, topic: "Fiqh" },
  { question: "The minimum amount for Zakat on gold is:", option_a: "7.5 tola", option_b: "85 grams", option_c: "100 grams", option_d: "50 grams", correct_answer: "B", explanation: "Zakat becomes obligatory when gold reaches 85 grams (Nisab) and is held for one year.", year: 2025, topic: "Fiqh" },
  { question: "Breaking fast during Ramadan without valid reason requires:", option_a: "Nothing", option_b: "Qada only", option_c: "Qada and Kaffarah", option_d: "Only repentance", correct_answer: "C", explanation: "Intentional breaking requires both making up the fast (Qada) and feeding a poor person (Kaffarah).", year: 2025, topic: "Fiqh" },
  { question: "The Adhan (call to prayer) has how many Takbirs?", option_a: "Two", option_b: "Four", option_c: "Six", option_d: "Eight", correct_answer: "B", explanation: "The Adhan contains four Takbirs (Allahu Akbar) at various points.", year: 2025, topic: "Fiqh" },
  { question: "Sadaqah is:", option_a: "Obligatory charity", option_b: "Voluntary charity", option_c: "A type of prayer", option_d: "Fasting", correct_answer: "B", explanation: "Sadaqah is voluntary charity given out of kindness, unlike Zakat which is obligatory.", year: 2025, topic: "Fiqh" },
  { question: "The Islamic ruling on alcohol is:", option_a: "Permitted", option_b: "Makruh (discouraged)", option_c: "Haram (forbidden)", option_d: "Mubah (neutral)", correct_answer: "C", explanation: "Alcohol is completely forbidden (Haram) in Islam based on Quran and Hadith.", year: 2025, topic: "Fiqh" },
  { question: "A Muslim can eat the meat of:", option_a: "Any animal", option_b: "Animals slaughtered by People of the Book", option_c: "Only fish", option_d: "Only chicken", correct_answer: "B", explanation: "Quran permits meat slaughtered by Jews and Christians (People of the Book).", year: 2025, topic: "Fiqh" },
  { question: "The night prayer in Islam is called:", option_a: "Tahajjud", option_b: "Tawaf", option_c: "Sa'i", option_d: "Ramy", correct_answer: "A", explanation: "Tahajjud is the voluntary night prayer performed after Isha and before Fajr.", year: 2025, topic: "Fiqh" },
  { question: "Istikhara is a prayer for:", option_a: "Forgiveness", option_b: "Seeking guidance in decisions", option_c: "Healing", option_d: "Protection", correct_answer: "B", explanation: "Istikhara is performed when seeking Allah's guidance in making a choice.", year: 2025, topic: "Fiqh" },
  { question: "The minimum number of Rak'ah for Dhuhr prayer is:", option_a: "Two", option_b: "Three", option_c: "Four", option_d: "One", correct_answer: "C", explanation: "Dhuhr prayer consists of 4 Rak'ah (obligatory), with 2 Rak'ah Sunnah before.", year: 2025, topic: "Fiqh" },
  { question: "Jana'zah (funeral) prayer has how many Takbirs?", option_a: "Two", option_b: "Three", option_c: "Four", option_d: "Five", correct_answer: "C", explanation: "The funeral prayer consists of 4 Takbirs with supplications between them.", year: 2025, topic: "Fiqh" },
  { question: "Fidyah is paid by those who:", option_a: "Missed fasting due to travel", option_b: "Cannot fast due to illness and cannot make it up", option_c: "Are healthy", option_d: "Are wealthy", correct_answer: "B", explanation: "Fidyah is for those permanently unable to fast (e.g., elderly, chronically ill).", year: 2025, topic: "Fiqh" },
  { question: "The Islamic calendar is based on:", option_a: "Solar year", option_b: "Lunar year", option_c: "Lunisolar year", option_d: "Gregorian year", correct_answer: "B", explanation: "The Islamic (Hijri) calendar is purely lunar, with 354-355 days per year.", year: 2025, topic: "Fiqh" },
];

const CRS_QUESTIONS = [
  // Old Testament
  { question: "The first book of the Bible is:", option_a: "Exodus", option_b: "Genesis", option_c: "Leviticus", option_d: "Numbers", correct_answer: "B", explanation: "Genesis describes the creation of the world and the patriarchs.", year: 2025, topic: "Old Testament" },
  { question: "Who built the Ark in the Bible?", option_a: "Abraham", option_b: "Moses", option_c: "Noah", option_d: "David", correct_answer: "C", explanation: "Noah built the Ark to save his family and animals from the great flood.", year: 2025, topic: "Old Testament" },
  { question: "The Ten Commandments were given to:", option_a: "Abraham", option_b: "Noah", option_c: "Moses", option_d: "David", correct_answer: "C", explanation: "God gave the Ten Commandments to Moses on Mount Sinai.", year: 2025, topic: "Old Testament" },
  { question: "David was known for killing:", option_a: "A lion", option_b: "A bear", option_c: "Goliath", option_d: "A serpent", correct_answer: "C", explanation: "David, a young shepherd, defeated the giant Goliath with a sling and stone.", year: 2025, topic: "Old Testament" },
  { question: "The first king of Israel was:", option_a: "David", option_b: "Solomon", option_c: "Saul", option_d: "Rehoboam", correct_answer: "C", explanation: "Saul was anointed as the first king of Israel by Prophet Samuel.", year: 2025, topic: "Old Testament" },
  { question: "Solomon was known for his:", option_a: "Strength", option_b: "Wisdom", option_c: "Speed", option_d: "Wealth only", correct_answer: "B", explanation: "Solomon was blessed with great wisdom from God.", year: 2025, topic: "Old Testament" },
  { question: "The book of Psalms was written by:", option_a: "Moses", option_b: "Abraham", option_c: "David", option_d: "Solomon", correct_answer: "C", explanation: "King David is traditionally credited with writing most of the Psalms.", year: 2025, topic: "Old Testament" },
  { question: "Elijah was carried to heaven by:", option_a: "Angels", option_b: "A chariot of fire", option_c: "A whirlwind", option_d: "A cloud", correct_answer: "B", explanation: "Elijah was taken up to heaven in a chariot of fire (2 Kings 2:11).", year: 2025, topic: "Old Testament" },
  { question: "Jonah was swallowed by:", option_a: "A lion", option_b: "A whale", option_c: "A serpent", option_d: "An eagle", correct_answer: "B", explanation: "Jonah was swallowed by a great fish/whale as punishment for disobedience.", year: 2025, topic: "Old Testament" },
  { question: "The burning bush appeared to:", option_a: "Abraham", option_b: "Noah", option_c: "Moses", option_d: "David", correct_answer: "C", explanation: "God spoke to Moses through a burning bush on Mount Horeb.", year: 2025, topic: "Old Testament" },
  { question: "The tower of Babel was built by:", option_a: "The Egyptians", option_b: "The Israelites", option_c: "Humanity to reach heaven", option_d: "The Philistines", correct_answer: "C", explanation: "People tried to build a tower to heaven; God confused their languages.", year: 2025, topic: "Old Testament" },
  { question: "Joseph was sold into slavery by his:", option_a: "Father", option_b: "Uncles", option_c: "Brothers", option_d: "Friends", correct_answer: "C", explanation: "Joseph's jealous brothers sold him to Midianite traders.", year: 2025, topic: "Old Testament" },
  { question: "The Israelites wandered in the desert for:", option_a: "10 years", option_b: "20 years", option_c: "40 years", option_d: "50 years", correct_answer: "C", explanation: "The Israelites wandered for 40 years as punishment for disobedience.", year: 2025, topic: "Old Testament" },
  { question: "Samson's strength came from:", option_a: "His sword", option_b: "His hair", option_c: "His shield", option_d: "His spear", correct_answer: "B", explanation: "Samson's God-given strength was in his hair, which was cut by Delilah.", year: 2025, topic: "Old Testament" },
  { question: "Ruth was the great-grandmother of:", option_a: "Moses", option_b: "David", option_c: "Solomon", option_d: "Abraham", correct_answer: "B", explanation: "Ruth married Boaz; their son Obed was David's grandfather.", year: 2025, topic: "Old Testament" },
  // New Testament
  { question: "Jesus was born in:", option_a: "Nazareth", option_b: "Jerusalem", option_c: "Bethlehem", option_d: "Capernaum", correct_answer: "C", explanation: "Jesus was born in Bethlehem, as prophesied by Micah.", year: 2025, topic: "New Testament" },
  { question: "The twelve apostles were chosen by:", option_a: "John the Baptist", option_b: "Jesus Christ", option_c: "Peter", option_d: "Paul", correct_answer: "B", explanation: "Jesus personally chose his twelve apostles from his followers.", year: 2025, topic: "New Testament" },
  { question: "Paul's original name was:", option_a: "Simon", option_b: "Saul", option_c: "Silas", option_d: "Stephen", correct_answer: "B", explanation: "Paul was known as Saul before his conversion on the road to Damascus.", year: 2025, topic: "New Testament" },
  { question: "The Last Supper was held during:", option_a: "Passover", option_b: "Pentecost", option_c: "Hanukkah", option_d: "Sabbath", correct_answer: "A", explanation: "Jesus shared the Last Supper with his disciples during the Passover festival.", year: 2025, topic: "New Testament" },
  { question: "Peter denied Jesus how many times?", option_a: "One", option_b: "Two", option_c: "Three", option_d: "Four", correct_answer: "C", explanation: "Peter denied knowing Jesus three times before the rooster crowed.", year: 2025, topic: "New Testament" },
  { question: "The Sermon on the Mount was delivered by:", option_a: "Paul", option_b: "Peter", option_c: "Jesus", option_d: "John", correct_answer: "C", explanation: "Jesus delivered the Sermon on the Mount, recorded in Matthew 5-7.", year: 2025, topic: "New Testament" },
  { question: "Lazarus was raised from the dead by:", option_a: "Peter", option_b: "Paul", option_c: "Jesus", option_d: "John", correct_answer: "C", explanation: "Jesus performed the miracle of raising Lazarus after four days in the tomb.", year: 2025, topic: "New Testament" },
  { question: "The road to Damascus experience changed:", option_a: "Peter's life", option_b: "Paul's life", option_c: "John's life", option_d: "James's life", correct_answer: "B", explanation: "Saul (Paul) encountered Christ on the road to Damascus and converted.", year: 2025, topic: "New Testament" },
  { question: "Pentecost celebrated the:", option_a: "Resurrection", option_b: "Coming of the Holy Spirit", option_c: "Birth of Jesus", option_d: "Crucifixion", correct_answer: "B", explanation: "Pentecost marked the descent of the Holy Spirit upon the apostles.", year: 2025, topic: "New Testament" },
  { question: "The book of Revelation was written by:", option_a: "Paul", option_b: "Peter", option_c: "John", option_d: "James", correct_answer: "C", explanation: "John wrote Revelation while exiled on the island of Patmos.", year: 2025, topic: "New Testament" },
  { question: "Jesus' first miracle was:", option_a: "Raising the dead", option_b: "Walking on water", option_c: "Turning water into wine", option_d: "Feeding 5000", correct_answer: "C", explanation: "Jesus turned water into wine at the wedding in Cana (John 2:1-11).", year: 2025, topic: "New Testament" },
  { question: "The parable of the prodigal son teaches about:", option_a: "Obedience", option_b: "Forgiveness", option_c: "Hard work", option_d: "Patience", correct_answer: "B", explanation: "The father's forgiveness of his repentant son illustrates God's mercy.", year: 2025, topic: "New Testament" },
  { question: "Judas betrayed Jesus for:", option_a: "Gold", option_b: "Silver", option_c: "Bronze", option_d: "Copper", correct_answer: "B", explanation: "Judas betrayed Jesus for 30 pieces of silver.", year: 2025, topic: "New Testament" },
  { question: "The Great Commission was given to:", option_a: "The Pharisees", option_b: "The apostles", option_c: "The Romans", option_d: "The Sadducees", correct_answer: "B", explanation: "Jesus commanded his disciples to go and make disciples of all nations.", year: 2025, topic: "New Testament" },
  { question: "Baptism symbolizes:", option_a: "Wealth", option_b: "Death and resurrection with Christ", option_c: "Worldly success", option_d: "Political power", correct_answer: "B", explanation: "Baptism represents dying to sin and rising to new life in Christ.", year: 2025, topic: "New Testament" },
  { question: "The Holy Spirit descended as:", option_a: "A dove", option_b: "A lion", option_c: "A fire", option_d: "A cloud", correct_answer: "A", explanation: "The Holy Spirit descended like a dove at Jesus' baptism (Matthew 3:16).", year: 2025, topic: "New Testament" },
];

const AGRI_QUESTIONS = [
  // Crop Production
  { question: "The process of plant growth from seed is called:", option_a: "Germination", option_b: "Pollination", option_c: "Fertilization", option_d: "Decomposition", correct_answer: "A", explanation: "Germination is the process by which a seed develops into a new plant.", year: 2025, topic: "Crop Production" },
  { question: "Photosynthesis requires:", option_a: "Oxygen only", option_b: "Carbon dioxide and water", option_c: "Nitrogen only", option_d: "Soil only", correct_answer: "B", explanation: "Plants use CO₂ and water in the presence of light to make glucose.", year: 2025, topic: "Crop Production" },
  { question: "The best time to water crops is:", option_a: "Midday", option_b: "Afternoon", option_c: "Early morning or evening", option_d: "Night only", correct_answer: "C", explanation: "Watering during cooler hours reduces evaporation and stress on plants.", year: 2025, topic: "Crop Production" },
  { question: "Mulching helps to:", option_a: "Increase weeds", option_b: "Conserve soil moisture and suppress weeds", option_c: "Attract pests", option_d: "Reduce soil temperature only", correct_answer: "B", explanation: "Mulch covers soil to retain moisture and prevent weed growth.", year: 2025, topic: "Crop Production" },
  { question: "The main function of roots is:", option_a: "Photosynthesis", option_b: "Absorbing water and nutrients", option_c: "Producing flowers", option_d: "Seed dispersal", correct_answer: "B", explanation: "Roots anchor the plant and absorb water and minerals from soil.", year: 2025, topic: "Crop Production" },
  { question: "Inter-cropping means:", option_a: "Growing one crop", option_b: "Growing two or more crops simultaneously", option_c: "Growing crops in rows", option_d: "Growing crops in different seasons", correct_answer: "B", explanation: "Inter-cropping involves growing different crops together in the same field.", year: 2025, topic: "Crop Production" },
  { question: "Seed rate refers to:", option_a: "Speed of seed growth", option_b: "Amount of seed planted per unit area", option_c: "Quality of seeds", option_d: "Time of planting", correct_answer: "B", explanation: "Seed rate is the quantity of seed sown per hectare or acre.", year: 2025, topic: "Crop Production" },
  { question: "Nursery is used for:", option_a: "Harvesting crops", option_b: "Raising young seedlings before transplanting", option_c: "Storing harvested crops", option_d: "Processing crops", correct_answer: "B", explanation: "Nurseries provide controlled conditions for young plants before field transplanting.", year: 2025, topic: "Crop Production" },
  { question: "Top-dressing refers to:", option_a: "Applying fertilizer before planting", option_b: "Applying fertilizer during crop growth", option_c: "Removing weeds", option_d: "Harvesting crops", correct_answer: "B", explanation: "Top-dressing is applying fertilizer to growing crops without incorporation.", year: 2025, topic: "Crop Production" },
  { question: "The shelf life of a crop refers to:", option_a: "Time to mature", option_b: "Duration it remains marketable after harvest", option_c: "Time to germinate", option_d: "Growth period", correct_answer: "B", explanation: "Shelf life is how long a crop stays fresh and marketable post-harvest.", year: 2025, topic: "Crop Production" },
  { question: "Monoculture means:", option_a: "Growing many crops", option_b: "Growing the same crop repeatedly on the same land", option_c: "Growing crops without water", option_d: "Growing crops indoors", correct_answer: "B", explanation: "Monoculture is the practice of growing a single crop on the same land year after year.", year: 2025, topic: "Crop Production" },
  { question: "Green manure crops are:", option_a: "Sold for profit", option_b: "Ploughed into the soil to improve fertility", option_c: "Used for animal feed", option_d: "Grown for decoration", correct_answer: "B", explanation: "Green manure crops are grown and incorporated into soil to add organic matter.", year: 2025, topic: "Crop Production" },
  { question: "Spacing between plants affects:", option_a: "Only appearance", option_b: "Light, water, and nutrient competition", option_c: "Soil color", option_d: "Rainfall", correct_answer: "B", explanation: "Proper spacing ensures adequate light, water, and nutrients for each plant.", year: 2025, topic: "Crop Production" },
  { question: "The rainy season is best for:", option_a: "Harvesting", option_b: "Planting rain-fed crops", option_c: "Storing produce", option_d: "Weeding only", correct_answer: "B", explanation: "Rain-fed crops are planted during the rainy season when moisture is available.", year: 2025, topic: "Crop Production" },
  { question: "Seed treatment protects against:", option_a: "Drought", option_b: "Seed-borne diseases and pests", option_c: "Soil erosion", option_d: "Excess sunlight", correct_answer: "B", explanation: "Seed treatment with fungicides/insecticides protects seeds from soil-borne pathogens.", year: 2025, topic: "Crop Production" },
  // Animal Husbandry
  { question: "Ruminants have how many stomach compartments?", option_a: "One", option_b: "Two", option_c: "Three", option_d: "Four", correct_answer: "D", explanation: "Ruminants like cattle have four stomach compartments: rumen, reticulum, omasum, abomasum.", year: 2025, topic: "Animal Husbandry" },
  { question: "Poultry farming includes raising:", option_a: "Only chickens", option_b: "Chickens, turkeys, ducks, and geese", option_c: "Only turkeys", option_d: "Only ducks", correct_answer: "B", explanation: "Poultry farming encompasses all domesticated birds raised for eggs or meat.", year: 2025, topic: "Animal Husbandry" },
  { question: "Feed conversion ratio (FCR) measures:", option_a: "How fast animals grow", option_b: "Efficiency of converting feed to body weight", option_c: "Water intake", option_d: "Reproduction rate", correct_answer: "B", explanation: "FCR = amount of feed consumed / weight gained; lower is better.", year: 2025, topic: "Animal Husbandry" },
  { question: "A broiler is a chicken raised for:", option_a: "Eggs", option_b: "Meat", option_c: "Feathers", option_d: "Breeding", correct_answer: "B", explanation: "Broilers are chickens specifically bred and raised for meat production.", year: 2025, topic: "Animal Husbandry" },
  { question: "Layer hens begin laying eggs at:", option_a: "4 weeks", option_b: "8 weeks", option_c: "18-20 weeks", option_d: "6 months", correct_answer: "C", explanation: "Most layer breeds start producing eggs around 18-20 weeks of age.", year: 2025, topic: "Animal Husbandry" },
  { question: "Deworming in livestock is done to:", option_a: "Increase weight", option_b: "Remove internal parasites", option_c: "Improve milk production", option_d: "All of the above", correct_answer: "D", explanation: "Deworming improves overall health, weight gain, and productivity.", year: 2025, topic: "Animal Husbandry" },
  { question: "The gestation period of cattle is approximately:", option_a: "3 months", option_b: "6 months", option_c: "9 months", option_d: "12 months", correct_answer: "C", explanation: "Cattle gestation is about 9 months (283 days).", year: 2025, topic: "Animal Husbandry" },
  { question: "Silage is:", option_a: "Dried grass", option_b: "Fermented high-moisture fodder", option_c: "Fresh grass", option_d: "Concentrate feed", correct_answer: "B", explanation: "Silage is preserved through fermentation of moist fodder in anaerobic conditions.", year: 2025, topic: "Animal Husbandry" },
  { question: "Artificial insemination in cattle is done by:", option_a: "Natural mating", option_b: "Injecting semen into the uterus", option_c: "Feeding hormones", option_d: "Surgical implantation", correct_answer: "B", explanation: "AI involves placing semen directly into the cow's reproductive tract.", year: 2025, topic: "Animal Husbandry" },
  { question: "Culling refers to:", option_a: "Buying new animals", option_b: "Removing unproductive animals from the herd", option_c: "Vaccinating animals", option_d: "Feeding animals", correct_answer: "B", explanation: "Culling removes low-performing or diseased animals to improve herd quality.", year: 2025, topic: "Animal Husbandry" },
  { question: "The ideal temperature for broilers is:", option_a: "10-15°C", option_b: "20-25°C", option_c: "30-35°C", option_d: "40-45°C", correct_answer: "C", explanation: "Broilers perform best in warm temperatures around 30-35°C.", year: 2025, topic: "Animal Husbandry" },
  { question: "Mastitis is a disease affecting:", option_a: "Chickens", option_b: "Cattle (udders)", option_c: "Pigs", option_d: "Fish", correct_answer: "B", explanation: "Mastitis is an inflammation of the udder tissue in dairy cows.", year: 2025, topic: "Animal Husbandry" },
  { question: "Battery cage system is used in:", option_a: "Cattle farming", option_b: "Poultry (egg production)", option_c: "Fish farming", option_d: "Goat farming", correct_answer: "B", explanation: "Battery cages are used for housing layers in commercial egg production.", year: 2025, topic: "Animal Husbandry" },
  { question: "Probiotics in animal feed improve:", option_a: "Feed cost", option_b: "Gut health and digestion", option_c: "Meat color", option_d: "Bone strength only", correct_answer: "B", explanation: "Probiotics are beneficial bacteria that improve digestive health.", year: 2025, topic: "Animal Husbandry" },
  { question: "The deep litter system is:", option_a: "Cage-based housing", option_b: "Floor-based housing with thick litter material", option_c: "Free-range system", option_d: "Aquaculture system", correct_answer: "B", explanation: "Deep litter uses thick layers of organic material on the floor for poultry.", year: 2025, topic: "Animal Husbandry" },
  // Soil Science
  { question: "The three main nutrients in fertilizer are:", option_a: "NPK", option_b: "CNP", option_c: "NCK", option_d: "OPK", correct_answer: "A", explanation: "NPK stands for Nitrogen (N), Phosphorus (P), and Potassium (K).", year: 2025, topic: "Soil Science" },
  { question: "Soil texture refers to:", option_a: "Soil color", option_b: "Proportion of sand, silt, and clay", option_c: "Soil depth", option_d: "Soil temperature", correct_answer: "B", explanation: "Soil texture is determined by the relative amounts of sand, silt, and clay particles.", year: 2025, topic: "Soil Science" },
  { question: "pH of acidic soil is:", option_a: "Above 7", option_b: "Below 7", option_c: "Exactly 7", option_d: "Above 14", correct_answer: "B", explanation: "Soil pH below 7 indicates acidity; below 5.5 is strongly acidic.", year: 2025, topic: "Soil Science" },
  { question: "Humus is:", option_a: "A type of rock", option_b: "Decomposed organic matter in soil", option_c: "A fertilizer chemical", option_d: "A type of clay", correct_answer: "B", explanation: "Humus is the dark organic matter formed from decomposed plant and animal material.", year: 2025, topic: "Soil Science" },
  { question: "Contour ploughing helps prevent:", option_a: "Pest attack", option_b: "Soil erosion", option_c: "Drought", option_d: "Floods", correct_answer: "B", explanation: "Ploughing along contours reduces water runoff and soil erosion.", year: 2025, topic: "Soil Science" },
  { question: "Terracing is done on:", option_a: "Flat land", option_b: "Sloped land", option_c: "Swampy land", option_d: "Sandy land", correct_answer: "B", explanation: "Terraces are built on slopes to create flat areas for farming and reduce erosion.", year: 2025, topic: "Soil Science" },
  { question: "The best soil for farming is:", option_a: "Sandy soil", option_b: "Clay soil", option_c: "Loamy soil", option_d: "Rocky soil", correct_answer: "C", explanation: "Loamy soil has balanced sand, silt, and clay with good drainage and nutrients.", year: 2025, topic: "Soil Science" },
  { question: "Nitrogen deficiency shows as:", option_a: "Yellowing of leaves", option_b: "Brown spots", option_c: "Wilting only", option_d: "Root rot", correct_answer: "A", explanation: "Nitrogen deficiency causes chlorosis (yellowing) starting from older leaves.", year: 2025, topic: "Soil Science" },
  { question: "Soil erosion is worst on:", option_a: "Flat land", option_b: "Steep slopes", option_c: "Irrigated land", option_d: "Mulched land", correct_answer: "B", explanation: "Steep slopes have faster water runoff, causing more soil erosion.", year: 2025, topic: "Soil Science" },
  { question: "Cover crops protect soil by:", option_a: "Increasing erosion", option_b: "Holding soil with roots and reducing runoff", option_c: "Attracting pests", option_d: "Depleting nutrients", correct_answer: "B", explanation: "Cover crops' roots bind soil particles and reduce water/wind erosion.", year: 2025, topic: "Soil Science" },
  { question: "Legumes improve soil by:", option_a: "Adding phosphorus", option_b: "Fixing atmospheric nitrogen", option_c: "Increasing acidity", option_d: "Adding potassium", correct_answer: "B", explanation: "Legumes have root nodules containing bacteria that fix atmospheric nitrogen.", year: 2025, topic: "Soil Science" },
  { question: "Composting converts:", option_a: "Plastic to fertilizer", option_b: "Organic waste to nutrient-rich fertilizer", option_c: "Rocks to soil", option_d: "Sand to clay", correct_answer: "B", explanation: "Composting breaks down organic waste into humus-rich fertilizer.", year: 2025, topic: "Soil Science" },
  { question: "Erosion by wind is called:", option_a: "Water erosion", option_b: "Wind erosion", option_c: "Soil creep", option_d: "Mass movement", correct_answer: "B", explanation: "Wind erosion removes topsoil particles in dry, exposed areas.", year: 2025, topic: "Soil Science" },
  { question: "The FAO soil classification has how many orders?", option_a: "8", option_b: "10", option_c: "12", option_d: "16", correct_answer: "D", explanation: "The FAO/UNESCO system classifies soils into 26 soil groups, while USDA has 12 orders.", year: 2025, topic: "Soil Science" },
  { question: "Irrigation效率 is measured by:", option_a: "Water color", option_b: "Amount of water reaching root zone vs applied", option_c: "Soil temperature", option_d: "Crop height", correct_answer: "B", explanation: "Irrigation efficiency = water used by crops / water applied × 100.", year: 2025, topic: "Soil Science" },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let insertedCount = 0;
    let skippedCount = 0;
    const results: Record<string, { inserted: number; skipped: number }> = {};

    const allQuestions: Record<string, Array<{question: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; explanation: string; year: number}>> = {
      irs: IRS_QUESTIONS,
      crs: CRS_QUESTIONS,
      agricultural_science: AGRI_QUESTIONS,
    };

    for (const [subject, questions] of Object.entries(allQuestions)) {
      results[subject] = { inserted: 0, skipped: 0 };
      
      for (const q of questions) {
        const { data: existing } = await supabase
          .from('jamb_questions')
          .select('id')
          .eq('question', q.question)
          .eq('subject', subject)
          .maybeSingle();

        if (existing) {
          skippedCount++;
          results[subject].skipped++;
          continue;
        }

        const { error } = await supabase
          .from('jamb_questions')
          .insert({
            subject,
            question: q.question,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            year: q.year
          });

        if (!error) {
          insertedCount++;
          results[subject].inserted++;
        }
      }
    }

    const { count } = await supabase
      .from('jamb_questions')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedCount} new questions, skipped ${skippedCount} duplicates`,
        inserted: insertedCount,
        skipped: skippedCount,
        total_in_database: count,
        by_subject: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
