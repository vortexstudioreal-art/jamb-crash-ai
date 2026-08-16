import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function toDataUri(svg: string): string {
  const bytes = new TextEncoder().encode(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="#fff" rx="8"/><style>text{font-family:Arial,sans-serif;font-size:14px;fill:#333}line{stroke:#333;stroke-width:2}circle{fill:none;stroke:#333;stroke-width:2}polygon{fill:none;stroke:#333;stroke-width:2}</style>${svg}</svg>`);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return "data:image/svg+xml;base64," + btoa(s);
}

const DIAGRAM_QUESTIONS = [
  // Physics - Series Circuit
  {
    subject: "physics",
    question: "In the circuit diagram, if bulb 1 burns out, what happens to bulb 2?",
    option_a: "It glows brighter",
    option_b: "It also goes off",
    option_c: "It stays the same",
    option_d: "It explodes",
    correct_answer: "B", explanation: "In a series circuit, current has only one path. If one bulb burns out, the circuit breaks and all bulbs go off.",
    year: 2024,
    image_url: toDataUri(`<line x1="50" y1="250" x2="50" y2="180" stroke-width="3"/><line x1="35" y1="200" x2="65" y2="200" stroke-width="3"/><line x1="40" y1="210" x2="60" y2="210" stroke-width="3"/><line x1="50" y1="210" x2="50" y2="250" stroke-width="3"/><text x="15" y="275" font-size="11">6V</text><line x1="50" y1="180" x2="160" y2="180"/><circle cx="190" cy="180" r="25"/><line x1="190" y1="155" x2="190" y2="205"/><text x="190" y="230" font-size="11" text-anchor="middle">Bulb 1</text><line x1="215" y1="180" x2="240" y2="180"/><circle cx="270" cy="180" r="25"/><line x1="270" y1="155" x2="270" y2="205"/><text x="270" y="230" font-size="11" text-anchor="middle">Bulb 2</text><line x1="295" y1="180" x2="350" y2="180"/><line x1="350" y1="180" x2="350" y2="250"/><line x1="350" y1="250" x2="50" y2="250"/><line x1="130" y1="250" x2="180" y2="235" stroke-width="2.5"/><text x="145" y="275" font-size="11" text-anchor="middle">S</text>`),
  },
  // Physics - Velocity-time graph
  {
    subject: "physics",
    question: "What is the total distance from the velocity-time graph?",
    option_a: "40 m", option_b: "60 m", option_c: "80 m", option_d: "100 m",
    correct_answer: "C",
    explanation: "Distance = area under graph: (½×2×10) + (4×10) + (½×4×10) + (½×2×5) = 10+40+20+10 = 80 m.",
    year: 2024,
    image_url: toDataUri(`<line x1="50" y1="250" x2="380" y2="250" stroke-width="2"/><line x1="50" y1="250" x2="50" y2="30" stroke-width="2"/><text x="190" y="285" font-size="13" text-anchor="middle">Time (s)</text><text x="15" y="145" text-anchor="middle" transform="rotate(-90,15,145)" font-size="13">Velocity (m/s)</text><line x1="50" y1="250" x2="130" y2="180" stroke="#e74c3c" stroke-width="3"/><line x1="130" y1="180" x2="230" y2="180" stroke="#e74c3c" stroke-width="3"/><line x1="230" y1="180" x2="310" y2="220" stroke="#e74c3c" stroke-width="3"/><line x1="310" y1="220" x2="370" y2="250" stroke="#e74c3c" stroke-width="3"/><circle cx="130" cy="180" r="3" fill="#e74c3c"/><circle cx="230" cy="180" r="3" fill="#e74c3c"/><text x="55" y="265" font-size="11">0</text><text x="125" y="265" font-size="11">2</text><text x="225" y="265" font-size="11">6</text><text x="305" y="265" font-size="11">10</text><text x="35" y="185" font-size="11">10</text>`),
  },
  // Mathematics - Right triangle
  {
    subject: "mathematics",
    question: "What is the length of side c in the right-angled triangle?",
    option_a: "5", option_b: "7", option_c: "25", option_d: "√7",
    correct_answer: "A",
    explanation: "c² = a² + b² = 3² + 4² = 9 + 16 = 25. c = √25 = 5.",
    year: 2024,
    image_url: toDataUri(`<polygon points="50,250 250,250 50,80" fill="#e8f4f8" stroke="#333" stroke-width="2"/><line x1="50" y1="230" x2="70" y2="230" stroke="#333" stroke-width="1.5"/><line x1="70" y1="230" x2="70" y2="250" stroke="#333" stroke-width="1.5"/><text x="135" y="270" font-size="14" text-anchor="middle" font-weight="bold">b = 4</text><text x="30" y="170" font-size="14" font-weight="bold">a = 3</text><text x="180" y="145" font-size="14" font-weight="bold">c = ?</text><path d="M 50 250 L 65 250 L 65 235" fill="none" stroke="#e74c3c" stroke-width="1.5"/><text x="70" y="240" font-size="11" fill="#e74c3c">90°</text>`),
  },
  // Mathematics - Venn diagram
  {
    subject: "mathematics",
    question: "How many students take ONLY subject A?",
    option_a: "5", option_b: "8", option_c: "12", option_d: "17",
    correct_answer: "C",
    explanation: "Students taking ONLY A are those in set A but not in the intersection. From the diagram, this is 12.",
    year: 2023,
    image_url: toDataUri(`<rect x="30" y="40" width="340" height="230" fill="#fef9e7" stroke="#333" stroke-width="1.5" rx="8"/><text x="340" y="60" font-size="12" fill="#666">ξ</text><ellipse cx="155" cy="155" rx="90" ry="90" fill="#3498db" fill-opacity="0.15" stroke="#3498db" stroke-width="2"/><text x="120" y="100" font-size="14" font-weight="bold" fill="#3498db">A</text><text x="105" y="160" font-size="13">12</text><ellipse cx="245" cy="155" rx="90" ry="90" fill="#e74c3c" fill-opacity="0.12" stroke="#e74c3c" stroke-width="2"/><text x="280" y="100" font-size="14" font-weight="bold" fill="#e74c3c">B</text><text x="285" y="160" font-size="13">8</text><text x="195" y="155" font-size="13" font-weight="bold">5</text><text x="315" y="245" font-size="13">3</text>`),
  },
  // Mathematics - Quadratic graph
  {
    subject: "mathematics",
    question: "What are the roots of y = x² - 4x + 3?",
    option_a: "1 and 3", option_b: "-1 and -3", option_c: "2 and 2", option_d: "0 and 3",
    correct_answer: "A",
    explanation: "The roots are the x-intercepts. From the graph, the curve crosses the x-axis at x = 1 and x = 3.",
    year: 2024,
    image_url: toDataUri(`<line x1="50" y1="150" x2="380" y2="150" stroke="#333" stroke-width="2"/><line x1="215" y1="270" x2="215" y2="30" stroke="#333" stroke-width="2"/><line x1="120" y1="145" x2="120" y2="155"/><text x="115" y="170" font-size="10">1</text><line x1="315" y1="145" x2="315" y2="155"/><text x="310" y="170" font-size="10">3</text><path d="M 80 270 Q 150 30 215 30 Q 280 30 350 270" fill="none" stroke="#e74c3c" stroke-width="2.5"/><circle cx="120" cy="150" r="3" fill="#2ecc71"/><text x="105" y="140" font-size="11" fill="#2ecc71">x=1</text><circle cx="315" cy="150" r="3" fill="#2ecc71"/><text x="305" y="140" font-size="11" fill="#2ecc71">x=3</text><text x="380" y="155" font-size="12" font-weight="bold">x</text><text x="200" y="30" font-size="12" font-weight="bold">y</text>`),
  },
  // Biology - Plant cell
  {
    subject: "biology",
    question: "Which organelle is responsible for photosynthesis?",
    option_a: "Mitochondrion", option_b: "Nucleus", option_c: "Chloroplast", option_d: "Vacuole",
    correct_answer: "C",
    explanation: "Chloroplasts contain chlorophyll which captures light energy. They are found only in plant cells.",
    year: 2024,
    image_url: toDataUri(`<rect x="50" y="50" width="300" height="220" fill="#e8f8e8" stroke="#27ae60" stroke-width="3" rx="12"/><rect x="65" y="65" width="270" height="190" fill="#f0faf0" stroke="#2ecc71" stroke-width="1.5" rx="8"/><circle cx="200" cy="120" r="35" fill="#f5e6ff" stroke="#8e44ad" stroke-width="2"/><text x="185" y="125" font-size="11" text-anchor="middle">Nucleus</text><ellipse cx="180" cy="220" rx="50" ry="25" fill="#d4e6f1" stroke="#5dade2" stroke-width="1.5"/><text x="155" y="225" font-size="10">Vacuole</text><ellipse cx="280" cy="170" rx="25" ry="15" fill="#58d68d" stroke="#27ae60" stroke-width="1.5"/><text x="265" y="195" font-size="10">Chloroplast</text><ellipse cx="120" cy="170" rx="20" ry="12" fill="#f5b041" stroke="#e67e22" stroke-width="1.5"/><text x="95" y="195" font-size="10">Mitochondrion</text>`),
  },
  // Biology - Heart
  {
    subject: "biology",
    question: "Which chamber pumps blood to the entire body?",
    option_a: "Right Atrium", option_b: "Right Ventricle", option_c: "Left Atrium", option_d: "Left Ventricle",
    correct_answer: "D",
    explanation: "The left ventricle pumps oxygenated blood through the aorta to the entire body. It has the thickest muscular wall.",
    year: 2023,
    image_url: toDataUri(`<path d="M 200 60 C 100 60 60 140 80 200 C 100 260 160 280 200 290 C 240 280 300 260 320 200 C 340 140 300 60 200 60 Z" fill="#fce4e4" stroke="#c0392b" stroke-width="2"/><line x1="200" y1="75" x2="200" y2="275" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="4,2"/><ellipse cx="155" cy="140" rx="30" ry="35" fill="#f5b7b1" fill-opacity="0.5" stroke="#c0392b" stroke-width="1.5"/><text x="155" y="130" font-size="9" text-anchor="middle">RA</text><ellipse cx="155" cy="220" rx="30" ry="35" fill="#d98880" fill-opacity="0.5" stroke="#c0392b" stroke-width="1.5"/><text x="155" y="220" font-size="9" text-anchor="middle">RV</text><ellipse cx="245" cy="140" rx="30" ry="35" fill="#f5b7b1" fill-opacity="0.5" stroke="#c0392b" stroke-width="1.5"/><text x="245" y="130" font-size="9" text-anchor="middle">LA</text><ellipse cx="245" cy="220" rx="33" ry="40" fill="#d98880" fill-opacity="0.5" stroke="#c0392b" stroke-width="1.5"/><text x="245" y="220" font-size="9" text-anchor="middle">LV</text><text x="80" y="140" font-size="9" fill="#666">Right</text><text x="80" y="220" font-size="9" fill="#666">Right</text><text x="310" y="140" font-size="9" fill="#666">Left</text><text x="310" y="220" font-size="9" fill="#666">Left</text><text x="130" y="152" font-size="8" fill="#666">Atrium</text><text x="130" y="232" font-size="8" fill="#666">Ventricle</text><text x="310" y="152" font-size="8" fill="#666">Atrium</text><text x="310" y="232" font-size="8" fill="#666">Ventricle</text>`),
  },
  // Chemistry - Periodic table
  {
    subject: "chemistry",
    question: "Which element is a halogen?",
    option_a: "Na", option_b: "Mg", option_c: "Cl", option_d: "Ar",
    correct_answer: "C",
    explanation: "Chlorine (Cl) is in Group 17 (halogens). Halogens have 7 valence electrons and are highly reactive non-metals.",
    year: 2024,
    image_url: toDataUri(`<rect x="30" y="40" width="60" height="50" fill="#ffcccc" stroke="#333" stroke-width="1" rx="2"/><text x="45" y="60" font-size="12" font-weight="bold">H</text><text x="45" y="75" font-size="9">1</text><rect x="310" y="40" width="60" height="50" fill="#ccffcc" stroke="#333" stroke-width="1" rx="2"/><text x="325" y="60" font-size="12" font-weight="bold">He</text><text x="325" y="75" font-size="9">2</text><rect x="30" y="100" width="60" height="50" fill="#ffcccc" stroke="#333" stroke-width="1" rx="2"/><text x="50" y="120" font-size="12" font-weight="bold">Li</text><text x="50" y="135" font-size="9">3</text><rect x="250" y="100" width="60" height="50" fill="#ffffcc" stroke="#333" stroke-width="1" rx="2"/><text x="258" y="120" font-size="12" font-weight="bold">Cl</text><text x="258" y="135" font-size="9">17</text><rect x="310" y="100" width="60" height="50" fill="#ccffcc" stroke="#333" stroke-width="1" rx="2"/><text x="310" y="120" font-size="12" font-weight="bold">Ar</text><text x="310" y="135" font-size="9">18</text><text x="30" y="175" font-size="11" fill="#ffcccc">● Alkali metals</text><text x="30" y="195" font-size="11" fill="#ffffcc">● Halogens</text><text x="30" y="215" font-size="11" fill="#ccffcc">● Noble gases</text>`),
  },
  // Geography - Atmosphere
  {
    subject: "geography",
    question: "Which layer contains the ozone layer?",
    option_a: "Troposphere", option_b: "Stratosphere", option_c: "Mesosphere", option_d: "Thermosphere",
    correct_answer: "B",
    explanation: "The ozone layer is in the stratosphere (15-35 km). It absorbs harmful UV radiation from the sun.",
    year: 2024,
    image_url: toDataUri(`<ellipse cx="200" cy="280" rx="120" ry="30" fill="#58d68d"/><text x="200" y="290" font-size="12" text-anchor="middle" fill="#fff" font-weight="bold">Earth</text><rect x="50" y="240" width="300" height="25" fill="#d4e6f1" stroke="#333" stroke-width="1"/><text x="55" y="255" font-size="10">Troposphere (0-12 km)</text><rect x="50" y="185" width="300" height="55" fill="#aed6f1" stroke="#333" stroke-width="1"/><text x="55" y="200" font-size="10">Stratosphere (12-50 km)</text><text x="200" y="217" font-size="11" text-anchor="middle" fill="#e74c3c" font-weight="bold">→ Ozone Layer ←</text><rect x="50" y="145" width="300" height="40" fill="#85c1e9" stroke="#333" stroke-width="1"/><text x="55" y="160" font-size="10">Mesosphere (50-80 km)</text><rect x="50" y="60" width="300" height="85" fill="#5dade2" stroke="#333" stroke-width="1"/><text x="55" y="100" font-size="10">Thermosphere (80-700 km)</text>`),
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let inserted = 0;
    let skipped = 0;
    const bySubject: Record<string, { inserted: number; skipped: number }> = {};

    for (const q of DIAGRAM_QUESTIONS) {
      if (!bySubject[q.subject]) bySubject[q.subject] = { inserted: 0, skipped: 0 };

      const { data: existing } = await supabase
        .from('jamb_questions')
        .select('id')
        .eq('question', q.question)
        .maybeSingle();

      if (existing) {
        skipped++;
        bySubject[q.subject].skipped++;
        continue;
      }

      await supabase.from('jamb_questions').insert({
        subject: q.subject,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        year: q.year,
        image_url: q.image_url,
      });

      inserted++;
      bySubject[q.subject].inserted++;
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Seeded ${inserted} new diagram questions, skipped ${skipped} duplicates`,
      inserted, skipped, by_subject: bySubject,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
