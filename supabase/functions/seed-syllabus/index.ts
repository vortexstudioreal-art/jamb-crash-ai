import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const syllabusData = {
  "english": {
    "sections": {
      "Comprehension and Summary": {
        "topics": [
          "Reading comprehension passages",
          "Cloze passages",
          "Interpretation of passages",
          "Summary writing techniques",
          "Logical reasoning in passages",
          "Understanding theme, tone, style"
        ]
      },
      "Lexis and Structure": {
        "topics": [
          "Synonyms and antonyms",
          "Sentence completion",
          "Word meanings and usage",
          "Idioms and idiomatic expressions",
          "Contextual vocabulary",
          "Error detection",
          "Sentence interpretation"
        ]
      },
      "Oral Forms": {
        "topics": [
          "Vowel and consonant sounds",
          "Stress patterns",
          "Intonation",
          "Rhymes and minimal pairs",
          "Syllabic structure",
          "Emphatic stress",
          "Phonetic transcription basics"
        ]
      }
    }
  },
  "mathematics": {
    "sections": {
      "Number and Numeration": {
        "topics": [
          "Basic operations",
          "Fractions and decimals",
          "Indices and logarithms",
          "Approximations",
          "Number bases",
          "Ratios and proportions",
          "Surds"
        ]
      },
      "Algebra": {
        "topics": [
          "Algebraic expressions",
          "Linear equations",
          "Quadratic equations",
          "Inequalities",
          "Simultaneous equations",
          "Polynomials",
          "Variation (direct, inverse, joint)",
          "Sequences and series"
        ]
      },
      "Geometry and Mensuration": {
        "topics": [
          "Angles and lines",
          "Triangles and properties",
          "Quadrilaterals",
          "Circles (theorems, chords, tangents)",
          "Construction",
          "Solid shapes",
          "Perimeter, area, volume"
        ]
      },
      "Trigonometry": {
        "topics": [
          "Trigonometric ratios",
          "Sine and cosine rules",
          "Heights and distances",
          "Trigonometric identities",
          "Graphs of trigonometric functions"
        ]
      },
      "Statistics and Probability": {
        "topics": [
          "Data collection",
          "Measures of central tendency (mean, median, mode)",
          "Range and variance",
          "Histograms and pie charts",
          "Probability rules"
        ]
      },
      "Coordinate Geometry": {
        "topics": [
          "Cartesian plane",
          "Distance between points",
          "Midpoint and gradient",
          "Equation of a straight line"
        ]
      }
    }
  },
  "biology": {
    "sections": {
      "Cell Biology": {
        "topics": [
          "Cell structure",
          "Cell functions",
          "Cellular processes",
          "Cell division (mitosis, meiosis)"
        ]
      },
      "Ecology": {
        "topics": [
          "Ecosystems",
          "Food chains and webs",
          "Ecological succession",
          "Population studies",
          "Human influence on environment"
        ]
      },
      "Genetics and Evolution": {
        "topics": [
          "Mendelian genetics",
          "DNA and chromosomes",
          "Inheritance patterns",
          "Evolutionary theories"
        ]
      },
      "Plant Biology": {
        "topics": [
          "Photosynthesis",
          "Transport in plants",
          "Respiration",
          "Reproduction in plants",
          "Growth processes"
        ]
      },
      "Human Anatomy and Physiology": {
        "topics": [
          "Digestive system",
          "Respiratory system",
          "Excretory system",
          "Circulatory system",
          "Nervous system",
          "Reproductive system"
        ]
      }
    }
  },
  "chemistry": {
    "sections": {
      "Basic Concepts": {
        "topics": [
          "Atomic structure",
          "Periodic table",
          "Chemical bonding",
          "Stoichiometry"
        ]
      },
      "States of Matter": {
        "topics": [
          "Gases and gas laws",
          "Liquids",
          "Solids",
          "Solutions"
        ]
      },
      "Organic Chemistry": {
        "topics": [
          "Hydrocarbons",
          "Alkanes, alkenes, alkynes",
          "Alcohols",
          "Carboxylic acids",
          "Aromatic compounds",
          "Polymers"
        ]
      },
      "Inorganic Chemistry": {
        "topics": [
          "Transition metals",
          "Periodicity",
          "Acids, bases, salts",
          "Qualitative analysis"
        ]
      },
      "Physical Chemistry": {
        "topics": [
          "Chemical kinetics",
          "Chemical equilibrium",
          "Electrochemistry",
          "Thermochemistry"
        ]
      }
    }
  },
  "physics": {
    "sections": {
      "Mechanics": {
        "topics": [
          "Motion",
          "Forces",
          "Work, energy, power",
          "Moments",
          "Simple machines"
        ]
      },
      "Heat and Thermodynamics": {
        "topics": [
          "Temperature and heat",
          "Gas laws",
          "Expansion",
          "Heat transfer"
        ]
      },
      "Electricity": {
        "topics": [
          "Electric fields",
          "Current electricity",
          "Ohm's law",
          "Capacitors",
          "Electromagnetism"
        ]
      },
      "Waves and Optics": {
        "topics": [
          "Wave motion",
          "Sound waves",
          "Light waves",
          "Reflection",
          "Refraction",
          "Lenses"
        ]
      },
      "Modern Physics": {
        "topics": [
          "Photoelectric effect",
          "Nuclear physics",
          "Radioactivity"
        ]
      }
    }
  },
  "agricultural_science": {
    "sections": {
      "Agricultural Ecology": {
        "topics": [
          "Ecological zones",
          "Environmental factors",
          "Sustainability"
        ]
      },
      "Crop Production": {
        "topics": [
          "Soil preparation",
          "Crop improvement",
          "Irrigation",
          "Pests and diseases"
        ]
      },
      "Livestock Production": {
        "topics": [
          "Animal husbandry",
          "Breeds of animals",
          "Nutrition",
          "Diseases and control"
        ]
      },
      "Agricultural Economics": {
        "topics": [
          "Farm management",
          "Marketing",
          "Agricultural finance"
        ]
      }
    }
  },
  "government": {
    "sections": {
      "Elements of Government": {
        "topics": [
          "Meaning and scope of government",
          "Functions of government",
          "Power, authority, legitimacy",
          "Concepts of democracy",
          "Dictatorship and totalitarianism",
          "Systems of government (unitary, federal, confederacy)",
          "Constitution: types and features"
        ]
      },
      "Political Institutions": {
        "topics": [
          "Legislature: structure and functions",
          "Executive: composition, roles",
          "Judiciary: structure and independence",
          "Civil service",
          "Public corporations",
          "Local government: functions and structure"
        ]
      },
      "Political Processes": {
        "topics": [
          "Political parties",
          "Pressure groups",
          "Electoral systems",
          "Elections and electoral commissions",
          "Public opinion",
          "Political participation"
        ]
      },
      "Nigerian Government and Politics": {
        "topics": [
          "Pre-colonial political systems",
          "Colonial administration",
          "Post-independence political development",
          "Military rule in Nigeria",
          "Nigerian foreign policy",
          "Constitutional development"
        ]
      },
      "International Relations": {
        "topics": [
          "International organizations",
          "Foreign policy",
          "Interdependence of nations",
          "Diplomacy"
        ]
      }
    }
  },
  "economics": {
    "sections": {
      "Basic Economic Principles": {
        "topics": [
          "Meaning and scope of economics",
          "Basic economic problems",
          "Scale of preference",
          "Opportunity cost",
          "Economic systems"
        ]
      },
      "Production and Distribution": {
        "topics": [
          "Factors of production",
          "Efficiency and division of labour",
          "Types of production",
          "Distribution channels"
        ]
      },
      "Market Structure": {
        "topics": [
          "Demand and supply",
          "Price determination",
          "Elasticity",
          "Market equilibrium",
          "Perfect and imperfect markets"
        ]
      },
      "Money and Banking": {
        "topics": [
          "Definition and functions of money",
          "Banking systems",
          "Central bank roles",
          "Commercial banks",
          "Inflation and deflation"
        ]
      },
      "National Income": {
        "topics": [
          "Concepts of national income",
          "Methods of measuring national income",
          "Uses and limitations"
        ]
      },
      "Public Finance": {
        "topics": [
          "Government revenue",
          "Government expenditure",
          "Taxation: types and principles",
          "Budgeting"
        ]
      },
      "International Trade": {
        "topics": [
          "Balance of trade",
          "Balance of payments",
          "Foreign exchange",
          "Protectionism and free trade"
        ]
      }
    }
  },
  "crs": {
    "sections": {
      "Old Testament": {
        "topics": [
          "Creation stories",
          "Call of Abraham",
          "Moses and the Exodus",
          "Israelite monarchy",
          "Prophets and their messages"
        ]
      },
      "New Testament": {
        "topics": [
          "Birth and ministry of Jesus",
          "Parables of Jesus",
          "Miracles of Jesus",
          "The passion and resurrection",
          "Acts of the Apostles",
          "Teachings of Paul"
        ]
      },
      "Christian Ethics": {
        "topics": [
          "Obedience and faith",
          "Leadership",
          "Love and forgiveness",
          "Righteousness",
          "Humility"
        ]
      }
    }
  },
  "irs": {
    "sections": {
      "Qur'an": {
        "topics": [
          "Tafsir of selected surahs",
          "Themes of revelation",
          "Virtues of the Qur'an",
          "Qur'anic teachings on conduct"
        ]
      },
      "Hadith": {
        "topics": [
          "Classification of hadith",
          "Selected hadith and meanings",
          "Importance of Sunnah",
          "Application of hadith in daily life"
        ]
      },
      "Fiqh (Islamic Law)": {
        "topics": [
          "Purification",
          "Salah (prayer)",
          "Zakah",
          "Sawm (fasting)",
          "Hajj",
          "Islamic marriage and family"
        ]
      },
      "Tauhid (Islamic Belief)": {
        "topics": [
          "Oneness of Allah",
          "Articles of faith",
          "Angels, books, prophets",
          "Akhirah (hereafter)"
        ]
      },
      "Sirah (Life of Prophet Muhammad)": {
        "topics": [
          "Early life of the Prophet",
          "Prophethood and revelation",
          "Hijrah",
          "Battles of Islam",
          "Farewell sermon"
        ]
      }
    }
  },
  "literature": {
    "sections": {
      "Literary Appreciation": {
        "topics": [
          "Figures of speech",
          "Poetic devices",
          "Literary terms",
          "Analyzing themes, style, tone"
        ]
      },
      "Poetry": {
        "topics": [
          "Types of poetry",
          "Analysis of African poems",
          "Analysis of non-African poems"
        ]
      },
      "Prose": {
        "topics": [
          "Elements of prose",
          "Characterization",
          "Setting and themes",
          "African prose texts",
          "Non-African prose texts"
        ]
      },
      "Drama": {
        "topics": [
          "Types of drama",
          "African plays",
          "Non-African plays",
          "Tragic elements",
          "Comedy and satire"
        ]
      }
    }
  },
  "geography": {
    "sections": {
      "Physical Geography": {
        "topics": [
          "Earth's structure",
          "Rocks and minerals",
          "Landforms",
          "Atmosphere and weather",
          "Climate regions"
        ]
      },
      "Human Geography": {
        "topics": [
          "Population studies",
          "Rural and urban settlement",
          "Transportation",
          "Economic activities"
        ]
      },
      "Regional Geography": {
        "topics": [
          "Nigeria: physical and human geography",
          "West Africa",
          "Africa",
          "World regional geography"
        ]
      },
      "Map Reading and Interpretation": {
        "topics": [
          "Scale and measurement",
          "Contour interpretation",
          "Map symbols",
          "Compass points",
          "Field sketching"
        ]
      }
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const syllabusEntries: any[] = [];
    let orderIndex = 0;

    for (const [subject, data] of Object.entries(syllabusData)) {
      for (const [sectionName, sectionData] of Object.entries(data.sections)) {
        for (const topic of sectionData.topics) {
          syllabusEntries.push({
            subject,
            topic,
            subtopic: sectionName,
            order_index: orderIndex++,
            difficulty_level: "medium",
            estimated_reading_time: 30,
            objectives: [
              `Understand ${topic}`,
              `Apply concepts of ${topic} in JAMB questions`,
              `Identify key patterns in ${topic}`
            ]
          });
        }
      }
    }

    // Clear existing syllabus data
    await supabase.from("jamb_syllabus").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert new syllabus data
    const { error } = await supabase.from("jamb_syllabus").insert(syllabusEntries);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, count: syllabusEntries.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error seeding syllabus:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
