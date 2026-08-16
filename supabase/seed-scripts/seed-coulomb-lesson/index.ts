import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COULOMB_LESSON = {
  subject: "physics",
  topic: "Electric fields",
  subtopic: "Electricity",
  title: "Coulomb's Law — The Force Between Charged Objects",
  learning_objectives: [
    "Explain why charged objects attract or repel each other",
    "State Coulomb's Law and define every variable in the formula",
    "Calculate the electrostatic force between two point charges",
    "Explain the inverse-square relationship and why doubling distance reduces force to one-quarter",
    "Identify common mistakes when applying Coulomb's Law in JAMB questions",
  ],
  difficulty_level: "medium",
  estimated_minutes: 20,
  content_sections: [
    {
      id: "coulomb_hook_01",
      type: "hook",
      order: 1,
      content: {
        text: "Have you ever rubbed a balloon on your hair and then stuck it to a wall — without any glue? Or touched a door handle after walking across a carpet and felt a shock? These everyday moments are powered by the same invisible force that governs how atoms bond, how lightning works, and how your phone battery stores energy. Today, we're going to understand that force — and learn to calculate it.",
        prediction_prompt: "Before we start: Two small charged balls are placed 10 cm apart. The force between them is F. If we move them 20 cm apart, what do you think happens to the force? Does it double? Halve? Stay the same? Think about it before we continue.",
      },
    },
    {
      id: "coulomb_intuitive_01",
      type: "intuitive_explanation",
      order: 2,
      content: {
        text: "Imagine two people standing on opposite sides of a room, both holding magnets. If they bring the magnets close together, they feel a push or pull. The closer they get, the stronger the push or pull. The farther apart they are, the weaker it gets. Electric charges work the same way. Positive and negative charges attract each other. Two positives repel. Two negatives repel. The force depends on how much charge each object has and how far apart they are.",
        analogy: "Think of charge like a loud speaker. A small speaker is quiet. A big speaker is loud. Two big speakers together are very loud. Two small speakers are quiet. Two big speakers far apart are quieter than when they're close.",
      },
    },
    {
      id: "coulomb_formal_01",
      type: "formal_explanation",
      order: 3,
      content: {
        text: "Coulomb's Law describes the electrostatic force between two point charges. It states: The force between two point charges is directly proportional to the product of the charges and inversely proportional to the square of the distance between them. The force acts along the line joining the two charges. Like charges repel; unlike charges attract.",
        key_terms: [
          { term: "Electrostatic force", definition: "The force of attraction or repulsion between charged objects." },
          { term: "Point charge", definition: "A charged object treated as a single point, with all its charge concentrated there." },
          { term: "Permittivity of free space (ε₀)", definition: "A constant that describes how electric fields behave in vacuum. ε₀ = 8.85 × 10⁻¹² C²N⁻¹m⁻²." },
        ],
      },
    },
    {
      id: "coulomb_formula_01",
      type: "formula",
      order: 4,
      content: {
        formula: "F = kQq / r²",
        variables: [
          { name: "F", description: "Electrostatic force between the charges", unit: "N (Newtons)" },
          { name: "k", description: "Coulomb's constant = 1/(4πε₀) ≈ 9 × 10⁹ Nm²C⁻²", unit: "Nm²C⁻²" },
          { name: "Q", description: "Magnitude of the first charge", unit: "C (Coulombs)" },
          { name: "q", description: "Magnitude of the second charge", unit: "C (Coulombs)" },
          { name: "r", description: "Distance between the centres of the two charges", unit: "m (metres)" },
        ],
        when_to_use: "When you need to calculate the force between two point charges, or compare forces under different conditions.",
        common_traps: [
          "Forgetting to convert cm to m. If r = 10 cm, use r = 0.1 m.",
          "Confusing r² with 2r. Doubling r reduces F by factor of 4, not 2.",
          "Using k = 9 × 10⁹ without understanding it comes from 1/(4πε₀).",
        ],
        units_note: "All distances must be in metres. All charges in Coulombs. Force will be in Newtons.",
      },
    },
    {
      id: "coulomb_interactive_01",
      type: "interactive",
      order: 5,
      content: {
        component: "formula_calculator",
        config: {
          formula: "F = kQq / r²",
          constants: [{ name: "k", value: 9000000000 }],
          variables: [
            { name: "Q", label: "Charge Q", unit: "C", min: 0.000001, max: 0.01, step: 0.000001, initial: 0.000005 },
            { name: "q", label: "Charge q", unit: "C", min: 0.000001, max: 0.01, step: 0.000001, initial: 0.000005 },
            { name: "r", label: "Distance", unit: "m", min: 0.01, max: 2.0, step: 0.01, initial: 0.1 },
          ],
          output: { name: "F", label: "Force", unit: "N" },
          show_graph: true,
          graph_type: "F_vs_r",
        },
        instruction: "Adjust the charges and distance. Watch how the force changes. Try doubling Q. Try doubling r. What happens to F?",
        prediction_prompt: "Before you adjust anything: What do you predict will happen to the force if you double the distance? Try it and see.",
      },
    },
    {
      id: "coulomb_worked_example_01",
      type: "worked_example",
      order: 6,
      content: {
        scenario: "Two point charges, Q = +4 × 10⁻⁶ C and q = +2 × 10⁻⁶ C, are placed 0.3 m apart in vacuum. Calculate the electrostatic force between them.",
        given: [
          "Q = 4 × 10⁻⁶ C",
          "q = 2 × 10⁻⁶ C",
          "r = 0.3 m",
          "k = 9 × 10⁹ Nm²C⁻²",
        ],
        required: "F (electrostatic force)",
        principle: "Coulomb's Law: F = kQq/r². We have all four quantities. Substitute and calculate.",
        steps: [
          { explanation: "Write the formula", calculation: "F = kQq / r²" },
          { explanation: "Substitute the values", calculation: "F = (9 × 10⁹) × (4 × 10⁻⁶) × (2 × 10⁻⁶) / (0.3)²" },
          { explanation: "Calculate the numerator", calculation: "9 × 4 × 2 = 72; 10⁹ × 10⁻⁶ × 10⁻⁶ = 10⁻³; numerator = 72 × 10⁻³ = 0.072" },
          { explanation: "Calculate the denominator", calculation: "(0.3)² = 0.09" },
          { explanation: "Divide", calculation: "F = 0.072 / 0.09 = 0.8 N" },
          { explanation: "State the answer with direction", calculation: "Since both charges are positive, the force is repulsive." },
        ],
        answer: "F = 0.8 N (repulsive)",
        check: "The charges are micro-Coulombs at 30 cm. 0.8 N is a reasonable force for these values.",
      },
    },
    {
      id: "coulomb_misconception_01",
      type: "common_misconception",
      order: 7,
      content: {
        mistake: "If I double the distance, the force halves.",
        why_wrong: "This confuses linear and inverse-square relationships. Coulomb's Law has r² in the denominator, not r.",
        correct_model: "Doubling r means F becomes 1/(2²) = 1/4 of the original. Tripling r means F becomes 1/9. The force decreases much faster than students expect.",
      },
    },
    {
      id: "coulomb_misconception_02",
      type: "common_misconception",
      order: 8,
      content: {
        mistake: "A larger charge always experiences a larger force.",
        why_wrong: "Force depends on BOTH charges. The force on Q is equal in magnitude to the force on q (Newton's Third Law). A tiny charge near a huge charge feels the same force as the huge charge feels from the tiny one.",
        correct_model: "F = kQq/r² is the same for both charges. The force is mutual.",
      },
    },
    {
      id: "coulomb_jamb_01",
      type: "jamb_insight",
      order: 9,
      content: {
        focus_area: "Coulomb's Law questions usually test the relationship between force, charge, and distance. JAMB often asks: 'What happens to F if Q doubles, q triples, and r quadruples?' These require you to apply the proportional relationships.",
        trap: "JAMB may give distances in cm but expect answers in metres. Always check units before calculating.",
        tip: "For comparison questions (what happens if...), use proportional reasoning instead of calculating the full force. It's faster and less error-prone.",
        related_topics: ["Electric field strength", "Electric potential", "Capacitors"],
      },
    },
    {
      id: "coulomb_practice_inline_01",
      type: "inline_practice",
      order: 10,
      content: {
        question: "Two charges of +3 × 10⁻⁶ C and +5 × 10⁻⁶ C are 0.2 m apart. What is the force between them?",
        options: [
          { label: "A", text: "3.375 N" },
          { label: "B", text: "0.3375 N" },
          { label: "C", text: "33.75 N" },
          { label: "D", text: "0.03375 N" },
        ],
        answer: "A",
        explanation: "F = (9 × 10⁹)(3 × 10⁻⁶)(5 × 10⁻⁶) / (0.2)² = (9 × 3 × 5 × 10⁻³) / 0.04 = 0.135 / 0.04 = 3.375 N",
        hints: [
          "What are Q, q, and r? Are they in the right units?",
          "Calculate the numerator first: k × Q × q",
          "Then divide by r²",
        ],
      },
    },
    {
      id: "coulomb_memory_01",
      type: "memory_hook",
      order: 11,
      content: {
        text: "Coulomb's Law is like gossip: The bigger the story (more charge), the stronger the reaction. The farther it travels (more distance), the weaker it gets. And it fades FAST — double the distance, quarter the force.",
        hook_type: "analogy",
      },
    },
    {
      id: "coulomb_reflection_01",
      type: "reflection",
      order: 12,
      content: {
        question: "Can you explain why a charged rod can pick up small pieces of paper, even though the paper is neutral? What does Coulomb's Law have to do with it?",
        expected_understanding: "The charged rod induces a temporary charge separation in the neutral paper. The near side becomes oppositely charged and is attracted more strongly than the far side is repelled. This is an application of electrostatic induction, which relies on Coulomb's Law.",
      },
    },
  ],
  practice_questions: [
    {
      difficulty: "easy",
      question: "If the distance between two charges is doubled, the force becomes:",
      options: [
        { label: "A", text: "2F" },
        { label: "B", text: "F/2" },
        { label: "C", text: "F/4" },
        { label: "D", text: "F/8" },
      ],
      answer: "C",
      explanation: "F ∝ 1/r². Doubling r → F becomes 1/4.",
      hints: ["What is the relationship between F and r?", "The formula has r² in the denominator."],
    },
    {
      difficulty: "easy",
      question: "Two charges of +1 μC and +4 μC are separated by 0.2 m. If the +1 μC charge is replaced by +2 μC, the new force is:",
      options: [
        { label: "A", text: "doubled" },
        { label: "B", text: "halved" },
        { label: "C", text: "quadrupled" },
        { label: "D", text: "same" },
      ],
      answer: "A",
      explanation: "F = kQq/r². If q doubles and everything else stays the same, F doubles.",
      hints: ["Which variable changed?", "F is directly proportional to q."],
    },
    {
      difficulty: "medium",
      question: "Calculate the force between a charge of +6 × 10⁻⁶ C and -2 × 10⁻⁶ C placed 0.15 m apart.",
      options: [
        { label: "A", text: "4.8 N" },
        { label: "B", text: "-4.8 N" },
        { label: "C", text: "0.48 N" },
        { label: "D", text: "48 N" },
      ],
      answer: "A",
      explanation: "F = (9 × 10⁹)(6 × 10⁻⁶)(2 × 10⁻⁶) / (0.15)² = 0.108 / 0.0225 = 4.8 N. The negative sign indicates attraction, but magnitude is 4.8 N.",
      hints: ["Remember to use the magnitude of both charges.", "Calculate kQq first, then divide by r²."],
    },
    {
      difficulty: "medium",
      question: "Three charges are placed in a line: +Q at x=0, +q at x=d, and +2Q at x=2d. What is the net force on the middle charge?",
      options: [
        { label: "A", text: "kQq/d² to the right" },
        { label: "B", text: "kQq/d² to the left" },
        { label: "C", text: "Zero" },
        { label: "D", text: "3kQq/d² to the right" },
      ],
      answer: "B",
      explanation: "The +Q pushes q to the right with force kQq/d². The +2Q pushes q to the left with force k(2Q)q/d² = 2kQq/d². Net force = kQq/d² (right) - 2kQq/d² (left) = kQq/d² to the left.",
      hints: ["Consider the force from each charge separately.", "Forces to the left and right can be subtracted."],
    },
    {
      difficulty: "jamb",
      question: "Two point charges +2 μC and -8 μC are separated by a distance r. If the distance is halved and the larger charge is doubled, the new force is:",
      options: [
        { label: "A", text: "4F" },
        { label: "B", text: "8F" },
        { label: "C", text: "16F" },
        { label: "D", text: "32F" },
      ],
      answer: "B",
      explanation: "Original: F = k(2)(8)/r² = 16k/r². New: F' = k(2)(16)/(r/2)² = 32k/(r²/4) = 128k/r². Ratio: F'/F = 128/16 = 8.",
      hints: ["Write the original force expression.", "Write the new force expression with the changes.", "Find the ratio F'/F."],
    },
  ],
  mastery_criteria: {
    min_score: 80,
    required_sections: [
      "coulomb_hook_01",
      "coulomb_intuitive_01",
      "coulomb_formal_01",
      "coulomb_formula_01",
      "coulomb_interactive_01",
      "coulomb_worked_example_01",
    ],
  },
  version: 1,
  status: "published",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert the lesson (insert or update if exists)
    const { data, error } = await supabase
      .from("lessons")
      .upsert(
        {
          ...COULOMB_LESSON,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "subject,topic,subtopic" }
      )
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, lesson_id: data.id, message: "Coulomb's Law lesson seeded successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
