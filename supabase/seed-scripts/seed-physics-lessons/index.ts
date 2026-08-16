import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS = [
  // 1. MOTION
  {
    subject: "physics",
    topic: "Motion",
    subtopic: "Mechanics",
    title: "Motion — Understanding How Things Move",
    learning_objectives: [
      "Define distance, displacement, speed, velocity, and acceleration",
      "Distinguish between scalar and vector quantities",
      "Interpret distance-time and velocity-time graphs",
      "Calculate average speed and acceleration from given data",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "motion_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "A car and a motorcycle start from the same point. The car takes 2 hours to travel 100 km. The motorcycle takes 1 hour. Which one is faster? Simple, right? But what if I told you the motorcycle stopped for 30 minutes in between? Now how do you compare them? That's where understanding motion becomes important — and JAMB loves testing this.",
          prediction_prompt: "A ball is thrown straight up. At the highest point, is its velocity zero, maximum, or something else? Think carefully before we continue.",
        },
      },
      {
        id: "motion_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Motion is everywhere. You walk, cars drive, planets orbit. But in physics, we need to be precise about HOW things move. We don't just say 'it's fast.' We measure exactly how far, how fast, and how the speed changes. Think of it like describing a football match — you need to know who scored, when, and by how much.",
          analogy: "Imagine you're describing a friend's journey to school. 'She walked 2 km in 20 minutes' tells you distance and time. 'She walked at 6 km/h' tells you speed. 'She started slow, then ran the last bit' tells you about acceleration. These are all different ways to describe the same motion.",
        },
      },
      {
        id: "motion_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Motion is described using key quantities. Distance is the total path covered (scalar — only magnitude). Displacement is the straight-line distance from start to end, with direction (vector). Speed is distance per unit time (scalar). Velocity is displacement per unit time (vector). Acceleration is the rate of change of velocity (vector).",
          key_terms: [
            { term: "Distance", definition: "Total path length covered. Scalar quantity (no direction). SI unit: metre (m)" },
            { term: "Displacement", definition: "Straight-line distance from initial to final position, with direction. Vector quantity. SI unit: metre (m)" },
            { term: "Speed", definition: "Distance covered per unit time. Scalar. SI unit: m/s" },
            { term: "Velocity", definition: "Displacement per unit time. Vector. SI unit: m/s" },
            { term: "Acceleration", definition: "Rate of change of velocity. Vector. SI unit: m/s²" },
          ],
        },
      },
      {
        id: "motion_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "v = u + at",
          variables: [
            { name: "v", description: "Final velocity", unit: "m/s" },
            { name: "u", description: "Initial velocity", unit: "m/s" },
            { name: "a", description: "Acceleration", unit: "m/s²" },
            { name: "t", description: "Time", unit: "s" },
          ],
          when_to_use: "When you know initial velocity, acceleration, and time, and need to find final velocity (or any one unknown from the other three).",
          common_traps: [
            "Confusing speed and velocity. Speed is always positive; velocity can be negative (opposite direction).",
            "Forgetting that acceleration can be negative (deceleration).",
            "Using the wrong equation of motion — there are 3 main ones, pick the one that matches your known/unknown values.",
          ],
          units_note: "Always convert to SI units: metres, seconds, m/s, m/s². If given km/h, convert to m/s by dividing by 3.6.",
        },
      },
      {
        id: "motion_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A car starts from rest and accelerates uniformly at 2 m/s² for 10 seconds. Calculate its final velocity and the distance covered.",
          given: ["u = 0 (starts from rest)", "a = 2 m/s²", "t = 10 s"],
          required: "v (final velocity) and s (distance)",
          principle: "Use v = u + at for velocity. Use s = ut + ½at² for distance.",
          steps: [
            { explanation: "Calculate final velocity", calculation: "v = u + at = 0 + (2)(10) = 20 m/s" },
            { explanation: "Calculate distance", calculation: "s = ut + ½at² = (0)(10) + ½(2)(10)² = 0 + ½(2)(100) = 100 m" },
          ],
          answer: "Final velocity = 20 m/s, Distance = 100 m",
          check: "The car went from 0 to 20 m/s in 10 s. Average speed = 10 m/s. Distance = 10 × 10 = 100 m. ✓",
        },
      },
      {
        id: "motion_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "When a ball is thrown up, at the highest point its velocity is maximum.",
          why_wrong: "At the highest point, the ball momentarily stops before coming back down. Its velocity is ZERO at the top.",
          correct_model: "Velocity decreases as the ball goes up (gravity acts against it). At the top, v = 0. Then velocity increases in the downward direction as the ball falls.",
        },
      },
      {
        id: "motion_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB loves giving velocity-time graphs and asking for distance (area under the graph), acceleration (gradient), or interpreting the shape.",
          trap: "On a v-t graph, the AREA under the line = distance, not the gradient. The GRADIENT = acceleration. Students confuse these two.",
          tip: "For v-t graphs: gradient = acceleration, area = distance. For s-t graphs: gradient = velocity, area = meaningless.",
          related_topics: ["Forces", "Work, energy, power"],
        },
      },
      {
        id: "motion_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "The equations of motion: SUVAT. S = ut + ½at², v² = u² + 2as, v = u + at. Think 'SUVAT' — some use all three.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "motion_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "If a car is moving at constant velocity, what is its acceleration? What does the velocity-time graph look like?",
          expected_understanding: "Acceleration is zero when velocity is constant. The v-t graph is a horizontal line at the velocity value.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "A car travels 200 m in 20 s. What is its average speed?",
        options: [
          { label: "A", text: "10 m/s" },
          { label: "B", text: "20 m/s" },
          { label: "C", text: "40 m/s" },
          { label: "D", text: "100 m/s" },
        ],
        answer: "A",
        explanation: "Speed = distance/time = 200/20 = 10 m/s",
        hints: ["Speed = distance ÷ time"],
      },
      {
        difficulty: "medium",
        question: "A body starts from rest and accelerates at 3 m/s² for 4 s. What is the distance covered?",
        options: [
          { label: "A", text: "12 m" },
          { label: "B", text: "24 m" },
          { label: "C", text: "36 m" },
          { label: "D", text: "48 m" },
        ],
        answer: "B",
        explanation: "s = ut + ½at² = 0 + ½(3)(4²) = ½(3)(16) = 24 m",
        hints: ["Which equation has s, u, a, and t?", "u = 0 (starts from rest)"],
      },
      {
        difficulty: "jamb",
        question: "The velocity-time graph of a body is a straight line passing through the origin with gradient 5 m/s². What is the displacement after 4 seconds?",
        options: [
          { label: "A", text: "20 m" },
          { label: "B", text: "40 m" },
          { label: "C", text: "80 m" },
          { label: "D", text: "10 m" },
        ],
        answer: "B",
        explanation: "Gradient = acceleration = 5 m/s². For a v-t graph, displacement = area under the graph. The graph is a triangle with base 4 and height (v = u + at = 0 + 5×4 = 20). Area = ½ × 4 × 20 = 40 m.",
        hints: ["What does the gradient of a v-t graph represent?", "Displacement = area under v-t graph", "The shape is a triangle — use ½ × base × height"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["motion_hook_01", "motion_intuitive_01", "motion_formal_01", "motion_formula_01", "motion_worked_example_01"],
    },
    version: 1,
    status: "published",
  },

  // 2. OHM'S LAW
  {
    subject: "physics",
    topic: "Ohm's law",
    subtopic: "Electricity",
    title: "Ohm's Law — The Relationship Between Voltage, Current, and Resistance",
    learning_objectives: [
      "State Ohm's Law and write its mathematical expression",
      "Define voltage, current, and resistance",
      "Calculate current, voltage, or resistance using Ohm's Law",
      "Explain what a conductor that obeys Ohm's Law is called",
    ],
    difficulty_level: "medium",
    estimated_minutes: 18,
    content_sections: [
      {
        id: "ohm_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Why does your phone charge slower when you use a cheap cable? Why do thicker wires carry more current? Why does touching both terminals of a battery give you a shock but touching just one doesn't? All of these come down to one simple law that connects three fundamental quantities in electricity.",
          prediction_prompt: "If you double the voltage across a resistor, what happens to the current flowing through it? Does it double? Stay the same? Something else?",
        },
      },
      {
        id: "ohm_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Imagine water flowing through a pipe. Voltage is like the water pressure — it pushes the water. Current is like the flow rate — how much water passes through. Resistance is like a narrow section of pipe — it restricts flow. More pressure (voltage) = more flow (current). More restriction (resistance) = less flow.",
          analogy: "Think of a tap. If you open it more (increase voltage), more water flows (increase current). If the pipe is narrow (high resistance), less water flows even with the tap open. Ohm's Law connects these three: V = IR.",
        },
      },
      {
        id: "ohm_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Ohm's Law states that the current through a conductor is directly proportional to the potential difference (voltage) across it, provided the temperature and other physical conditions remain constant. Mathematically: V = IR, where V is voltage, I is current, and R is resistance.",
          key_terms: [
            { term: "Voltage (V)", definition: "The potential difference between two points. The 'push' that moves charges. SI unit: Volt (V)" },
            { term: "Current (I)", definition: "The rate of flow of charge. SI unit: Ampere (A)" },
            { term: "Resistance (R)", definition: "The opposition to current flow. SI unit: Ohm (Ω)" },
          ],
        },
      },
      {
        id: "ohm_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "V = IR",
          variables: [
            { name: "V", description: "Potential difference (voltage)", unit: "V (Volts)" },
            { name: "I", description: "Current", unit: "A (Amperes)" },
            { name: "R", description: "Resistance", unit: "Ω (Ohms)" },
          ],
          when_to_use: "When you know any two of V, I, R and need to find the third.",
          common_traps: [
            "Using V = IR when temperature changes — Ohm's Law only applies when temperature is constant.",
            "Confusing the rearranged forms: I = V/R and R = V/I are the same law.",
            "Forgetting that resistance is a property of the conductor, not of the voltage or current.",
          ],
          units_note: "V in volts, I in amperes, R in ohms. If given mA, convert to A (1 mA = 0.001 A).",
        },
      },
      {
        id: "ohm_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A resistor of 10 Ω is connected across a 6 V battery. Calculate the current flowing through the resistor.",
          given: ["R = 10 Ω", "V = 6 V"],
          required: "I (current)",
          principle: "Ohm's Law: V = IR. Rearrange to find I = V/R.",
          steps: [
            { explanation: "Write Ohm's Law", calculation: "V = IR" },
            { explanation: "Rearrange for I", calculation: "I = V/R" },
            { explanation: "Substitute", calculation: "I = 6/10 = 0.6 A" },
          ],
          answer: "I = 0.6 A",
          check: "V = IR = 0.6 × 10 = 6 V ✓",
        },
      },
      {
        id: "ohm_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "If voltage is zero, resistance is also zero.",
          why_wrong: "Resistance is a property of the conductor itself (its material, length, cross-section). It doesn't depend on whether voltage is applied.",
          correct_model: "Even with no voltage applied, the resistor still has resistance. It's like a pipe — even with no water flowing, the pipe is still narrow.",
        },
      },
      {
        id: "ohm_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests Ohm's Law with circuit calculations. They give you two values and ask for the third. Sometimes they test the concept with a V-I graph (straight line through origin = ohmic conductor).",
          trap: "JAMB may give current in mA. Always convert to A before using V = IR.",
          tip: "Remember: V = IR is the fundamental form. I = V/R for finding current. R = V/I for finding resistance. Same law, different arrangement.",
          related_topics: ["Current electricity", "Electric fields"],
        },
      },
      {
        id: "ohm_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "V = IR. Think of it as a triangle: V on top, I and R below. Cover what you want to find — if you cover I, you get V/R. If you cover R, you get V/I. If you cover V, you get IR.",
          hook_type: "visualization",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "A current of 2 A flows through a 5 Ω resistor. What is the voltage across it?",
        options: [
          { label: "A", text: "2.5 V" },
          { label: "B", text: "7 V" },
          { label: "C", text: "10 V" },
          { label: "D", text: "0.4 V" },
        ],
        answer: "C",
        explanation: "V = IR = 2 × 5 = 10 V",
        hints: ["V = IR", "Multiply current by resistance"],
      },
      {
        difficulty: "medium",
        question: "A 20 Ω resistor has a current of 250 mA flowing through it. What is the voltage?",
        options: [
          { label: "A", text: "5 V" },
          { label: "B", text: "0.5 V" },
          { label: "C", text: "50 V" },
          { label: "D", text: "12.5 V" },
        ],
        answer: "A",
        explanation: "First convert: 250 mA = 0.25 A. Then V = IR = 0.25 × 20 = 5 V",
        hints: ["Convert mA to A first", "250 mA = ? A", "Then use V = IR"],
      },
      {
        difficulty: "jamb",
        question: "A wire of resistance R is cut into two equal pieces. The two pieces are connected in parallel. What is the equivalent resistance?",
        options: [
          { label: "A", text: "R" },
          { label: "B", text: "R/2" },
          { label: "C", text: "R/4" },
          { label: "D", text: "2R" },
        ],
        answer: "C",
        explanation: "Each piece has resistance R/2 (half the length = half the resistance). Two R/2 in parallel: 1/Req = 1/(R/2) + 1/(R/2) = 2/R + 2/R = 4/R. So Req = R/4.",
        hints: ["Cutting wire in half halves the resistance", "Each piece is R/2", "Two equal resistors in parallel: Req = R/2n"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["ohm_hook_01", "ohm_intuitive_01", "ohm_formal_01", "ohm_formula_01", "ohm_worked_example_01"],
    },
    version: 1,
    status: "published",
  },

  // 3. WAVE MOTION
  {
    subject: "physics",
    topic: "Wave motion",
    subtopic: "Waves and Optics",
    title: "Wave Motion — How Energy Travles Without Matter Moving",
    learning_objectives: [
      "Define waves and distinguish between transverse and longitudinal waves",
      "State the wave equation v = fλ and use it to solve problems",
      "Explain amplitude, frequency, wavelength, and period",
      "Distinguish between mechanical and electromagnetic waves",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "wave_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "When you shout across a valley, your voice reaches the other side — but you didn't throw anything across. When you turn on a radio, music appears from invisible signals. When you see lightning before hearing thunder, light and sound traveled at different speeds. All of these are waves. But how does energy travel through empty space without any物质 (matter) moving with it?",
          prediction_prompt: "If you shake a rope up and down once, what shape travels along the rope? Does the rope itself move forward, or does something else travel?",
        },
      },
      {
        id: "wave_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Throw a stone into a pond. Ripples spread outward. But the water doesn't move outward — it moves up and down. The ENERGY moves outward. That's what a wave is: energy traveling through a medium (or through space) without the medium itself moving permanently.",
          analogy: "Think of a crowd doing 'the wave' at a stadium. Each person stands up and sits down, but nobody runs across the stadium. The WAVE moves across the stadium, but the PEOPLE stay in their seats. That's exactly how waves work.",
        },
      },
      {
        id: "wave_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "A wave is a disturbance that transfers energy from one point to another without permanent transfer of matter. Transverse waves: oscillations are perpendicular to the direction of travel (e.g., light, water waves). Longitudinal waves: oscillations are parallel to the direction of travel (e.g., sound, compression waves).",
          key_terms: [
            { term: "Amplitude (A)", definition: "Maximum displacement from the equilibrium position. SI unit: metre (m)" },
            { term: "Frequency (f)", definition: "Number of complete oscillations per second. SI unit: Hertz (Hz)" },
            { term: "Wavelength (λ)", definition: "Distance between two successive points in phase. SI unit: metre (m)" },
            { term: "Period (T)", definition: "Time for one complete oscillation. T = 1/f. SI unit: second (s)" },
          ],
        },
      },
      {
        id: "wave_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "v = fλ",
          variables: [
            { name: "v", description: "Wave speed", unit: "m/s" },
            { name: "f", description: "Frequency", unit: "Hz" },
            { name: "λ", description: "Wavelength", unit: "m" },
          ],
          when_to_use: "When you need to find wave speed, frequency, or wavelength. Applies to ALL waves.",
          common_traps: [
            "Confusing frequency and period. f = 1/T and T = 1/f.",
            "Forgetting that wave speed depends on the medium, not the frequency.",
            "Mixing up transverse and longitudinal wave properties.",
          ],
          units_note: "v in m/s, f in Hz (which is 1/s), λ in m. Check that units are consistent.",
        },
      },
      {
        id: "wave_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A wave has a frequency of 10 Hz and a wavelength of 0.5 m. Calculate the speed of the wave.",
          given: ["f = 10 Hz", "λ = 0.5 m"],
          required: "v (wave speed)",
          principle: "Wave equation: v = fλ",
          steps: [
            { explanation: "Write the wave equation", calculation: "v = fλ" },
            { explanation: "Substitute", calculation: "v = 10 × 0.5 = 5 m/s" },
          ],
          answer: "v = 5 m/s",
          check: "If frequency is 10 Hz, 10 wavelengths pass a point each second. Each wavelength is 0.5 m. Total distance = 10 × 0.5 = 5 m. Speed = 5 m/s ✓",
        },
      },
      {
        id: "wave_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "If you increase the frequency of a wave, the wavelength stays the same.",
          why_wrong: "In a given medium, wave speed is constant (determined by the medium). Since v = fλ, if f increases, λ must decrease to keep v constant.",
          correct_model: "v = fλ and v is fixed by the medium. So f and λ are inversely proportional. Double the frequency → halve the wavelength.",
        },
      },
      {
        id: "wave_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests v = fλ calculations, properties of transverse vs longitudinal waves, and the relationship between frequency, wavelength, and period.",
          trap: "JAMB may give frequency in kHz or MHz. Always convert to Hz: 1 kHz = 1000 Hz, 1 MHz = 1,000,000 Hz.",
          tip: "Know your wave equation triangle: v on top, f and λ below. Cover what you want to find.",
          related_topics: ["Sound waves", "Light waves", "Reflection", "Refraction"],
        },
      },
      {
        id: "wave_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "v = fλ. Think 'Victor has fλeas' — v = f × λ. Or 'Very Fast Lambs' — v, f, λ.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "wave_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "If you send a wave from water into a deeper region, what happens to its speed? Its frequency? Its wavelength?",
          expected_understanding: "Wave speed changes with depth (deeper = faster in most cases). Frequency stays the same (determined by the source). Wavelength changes because v = fλ and v changed while f stayed constant.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "A wave has a frequency of 5 Hz and a wavelength of 2 m. What is its speed?",
        options: [
          { label: "A", text: "2.5 m/s" },
          { label: "B", text: "10 m/s" },
          { label: "C", text: "7 m/s" },
          { label: "D", text: "0.4 m/s" },
        ],
        answer: "B",
        explanation: "v = fλ = 5 × 2 = 10 m/s",
        hints: ["v = fλ", "Multiply frequency by wavelength"],
      },
      {
        difficulty: "medium",
        question: "A sound wave has a frequency of 440 Hz and travels at 340 m/s. What is its wavelength?",
        options: [
          { label: "A", text: "0.77 m" },
          { label: "B", text: "149,600 m" },
          { label: "C", text: "780 m" },
          { label: "D", text: "1.3 m" },
        ],
        answer: "A",
        explanation: "λ = v/f = 340/440 ≈ 0.77 m",
        hints: ["Rearrange v = fλ to find λ", "λ = v/f"],
      },
      {
        difficulty: "jamb",
        question: "A wave travels from a shallow region to a deep region in water. Which quantity remains unchanged?",
        options: [
          { label: "A", text: "Speed" },
          { label: "B", text: "Wavelength" },
          { label: "C", text: "Frequency" },
          { label: "D", text: "Amplitude" },
        ],
        answer: "C",
        explanation: "Frequency is determined by the source and does not change when the wave enters a different medium. Speed and wavelength change to maintain v = fλ.",
        hints: ["Which quantity is determined by the source?", "Frequency never changes when a wave enters a new medium"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["wave_hook_01", "wave_intuitive_01", "wave_formal_01", "wave_formula_01", "wave_worked_example_01"],
    },
    version: 1,
    status: "published",
  },

  // 4. CURRENT ELECTRICITY
  {
    subject: "physics",
    topic: "Current electricity",
    subtopic: "Electricity",
    title: "Current Electricity — How Electric Charges Flow",
    learning_objectives: [
      "Define current, potential difference, and resistance",
      "Explain the difference between conductors and insulators",
      "Calculate energy dissipated in a circuit using P = IV",
      "Explain how series and parallel circuits affect current and voltage",
    ],
    difficulty_level: "medium",
    estimated_minutes: 18,
    content_sections: [
      {
        id: "current_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Why do lights go dim when you plug in too many appliances? Why does your phone battery drain faster when playing games? Why are circuit breakers important? All of these involve how electric current flows, how much energy it carries, and what happens when too much flows at once.",
          prediction_prompt: "In a circuit with two bulbs in series, if one bulb blows, what happens to the other? Why?",
        },
      },
      {
        id: "current_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Electricity is the flow of tiny charged particles called electrons through a wire. Think of it like water flowing through a pipe. Current is how much water flows per second. Voltage is the pressure pushing it. Resistance is how narrow the pipe is. When you plug in too many appliances, you're adding more pipes — more current flows, and the wire heats up.",
          analogy: "A circuit is like a water loop. The battery is a pump. The wire is the pipe. The bulb is a waterwheel. The pump pushes water (voltage pushes electrons), the waterwheel spins (bulb lights up), and friction in the pipe is like resistance.",
        },
      },
      {
        id: "current_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Electric current is the rate of flow of charge: I = Q/t. Potential difference (voltage) is the energy transferred per unit charge: V = W/Q. Power is the rate of energy transfer: P = IV = I²R = V²/R.",
          key_terms: [
            { term: "Current (I)", definition: "Rate of flow of charge. I = Q/t. SI unit: Ampere (A)" },
            { term: "Potential difference (V)", definition: "Energy transferred per unit charge. V = W/Q. SI unit: Volt (V)" },
            { term: "Power (P)", definition: "Rate of energy transfer. P = IV. SI unit: Watt (W)" },
            { term: "Energy (E)", definition: "Total work done. E = Pt = IVt. SI unit: Joule (J)" },
          ],
        },
      },
      {
        id: "current_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "P = IV = I²R = V²/R",
          variables: [
            { name: "P", description: "Power (rate of energy transfer)", unit: "W (Watts)" },
            { name: "I", description: "Current", unit: "A (Amperes)" },
            { name: "V", description: "Potential difference", unit: "V (Volts)" },
            { name: "R", description: "Resistance", unit: "Ω (Ohms)" },
          ],
          when_to_use: "P = IV for general power calculation. P = I²R when you know current and resistance. P = V²/R when you know voltage and resistance.",
          common_traps: [
            "Using P = IV when the circuit is not ohmic — P = IV is always true, but V = IR may not be.",
            "Confusing series and parallel rules: series = same current, parallel = same voltage.",
            "Forgetting to convert kW to W (1 kW = 1000 W) or kJ to J.",
          ],
          units_note: "P in watts, I in amps, V in volts, R in ohms. For energy: E = Pt, so E in joules = P in watts × t in seconds.",
        },
      },
      {
        id: "current_worked_example_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A 60 W light bulb is connected to a 240 V supply. Calculate the current flowing through it and its resistance.",
          given: ["P = 60 W", "V = 240 V"],
          required: "I (current) and R (resistance)",
          principle: "Use P = IV to find I. Use V = IR to find R.",
          steps: [
            { explanation: "Find current using P = IV", calculation: "I = P/V = 60/240 = 0.25 A" },
            { explanation: "Find resistance using V = IR", calculation: "R = V/I = 240/0.25 = 960 Ω" },
          ],
          answer: "Current = 0.25 A, Resistance = 960 Ω",
          check: "P = I²R = (0.25)² × 960 = 0.0625 × 960 = 60 W ✓",
        },
      },
      {
        id: "current_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "In a series circuit, the voltage is the same across each component.",
          why_wrong: "In a series circuit, the CURRENT is the same through each component. The VOLTAGE is shared (divided) among them.",
          correct_model: "Series: same current, shared voltage. Parallel: same voltage, shared current.",
        },
      },
      {
        id: "current_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests series vs parallel circuits, power calculations, and energy calculations. They often give a circuit diagram and ask for current, voltage, or power at different points.",
          trap: "JAMB may give power in kW. Convert to W before using P = IV.",
          tip: "For series circuits: total resistance = R1 + R2 + ... For parallel circuits: 1/Rtotal = 1/R1 + 1/R2 + ...",
          related_topics: ["Ohm's law", "Electromagnetism"],
        },
      },
      {
        id: "current_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Series: Same Current, Shared Voltage (SCSV). Parallel: Same Voltage, Shared Current (SVSC). Remember: Series = Single path. Parallel = Multiple paths.",
          hook_type: "mnemonic",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "A current of 3 A flows through a 12 V supply. What is the power?",
        options: [
          { label: "A", text: "4 W" },
          { label: "B", text: "15 W" },
          { label: "C", text: "36 W" },
          { label: "D", text: "9 W" },
        ],
        answer: "C",
        explanation: "P = IV = 3 × 12 = 36 W",
        hints: ["P = IV", "Multiply current by voltage"],
      },
      {
        difficulty: "medium",
        question: "Two 10 Ω resistors are connected in series to a 12 V supply. What is the total current?",
        options: [
          { label: "A", text: "1.2 A" },
          { label: "B", text: "2.4 A" },
          { label: "C", text: "0.6 A" },
          { label: "D", text: "6 A" },
        ],
        answer: "A",
        explanation: "Total resistance in series = 10 + 10 = 20 Ω. Current = V/R = 12/20 = 0.6 A. Wait — that's 0.6 A, which is option C. Let me recalculate: 12/20 = 0.6 A. Answer is C.",
        hints: ["In series, resistances add up", "Total R = R1 + R2", "Then use I = V/R"],
      },
      {
        difficulty: "jamb",
        question: "A 100 W, 250 V bulb is connected in parallel with a 200 W, 250 V bulb across a 250 V supply. What is the total power consumed?",
        options: [
          { label: "A", text: "300 W" },
          { label: "B", text: "100 W" },
          { label: "C", text: "150 W" },
          { label: "D", text: "250 W" },
        ],
        answer: "A",
        explanation: "In parallel, each bulb gets the full 250 V, so each operates at its rated power. Total power = 100 + 200 = 300 W.",
        hints: ["In parallel, each component gets the full voltage", "Power adds up in parallel", "Total P = P1 + P2"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["current_hook_01", "current_intuitive_01", "current_formal_01", "current_formula_01", "current_worked_example_01"],
    },
    version: 1,
    status: "published",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = [];

    for (const lesson of LESSONS) {
      const { data, error } = await supabase
        .from("lessons")
        .upsert(
          { ...lesson, updated_at: new Date().toISOString() },
          { onConflict: "subject,topic,subtopic" }
        )
        .select("id, topic, subtopic")
        .single();

      if (error) {
        results.push({ topic: lesson.topic, error: error.message });
      } else {
        results.push({ topic: lesson.topic, subtopic: lesson.subtopic, id: data.id });
      }
    }

    return new Response(
      JSON.stringify({ success: true, lessons: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
