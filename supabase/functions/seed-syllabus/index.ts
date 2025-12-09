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
