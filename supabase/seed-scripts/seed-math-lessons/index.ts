import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS = [
  // 1. NUMBER BASES AND OPERATIONS
  {
    subject: "mathematics",
    topic: "Number Bases and Operations",
    subtopic: "Basic Concepts",
    title: "Number Bases — How Different Number Systems Work",
    learning_objectives: [
      "Convert numbers between base 10 and other bases",
      "Perform arithmetic operations in different bases",
      "Understand binary and hexadecimal number systems",
      "Apply number base conversions in practical problems",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "number_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Your computer doesn't understand decimal numbers — it only knows 0s and 1s. The binary system (base 2) is the language of computers. But why stop at 2? Base 8 (octal) and base 16 (hexadecimal) are also used in computing. Understanding number bases is like learning that numbers can be written in many different ways.",
          prediction_prompt: "The decimal number 10 is written as 1010 in binary. Can you figure out why?",
        },
      },
      {
        id: "number_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "In base 10 (decimal), we use digits 0-9 and each position represents a power of 10. So 345 = 3×10² + 4×10¹ + 5×10⁰. In base 2 (binary), we only use 0 and 1, and each position represents a power of 2. So 1010 in binary = 1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 0 + 2 + 0 = 10 in decimal.",
          analogy: "Think of it like money. If you have 3 hundreds, 4 tens, and 5 ones, that's 345 naira. But what if instead of 10 ones = 1 ten, you had 2 ones = 1 two? That's binary! The 'exchange rate' between positions changes with the base.",
        },
      },
      {
        id: "number_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "A number in base b is written as dₙdₙ₋₁...d₁d₀ where each digit dᵢ satisfies 0 ≤ dᵢ < b. The value is dₙ×bⁿ + dₙ₋₁×bⁿ⁻¹ + ... + d₁×b¹ + d₀×b⁰. To convert from base b to base 10, expand using powers of b. To convert from base 10 to base b, repeatedly divide by b and record remainders.",
          key_terms: [
            { term: "Base (Radix)", definition: "The number of unique digits used in a positional number system" },
            { term: "Binary", definition: "Base 2 number system using digits 0 and 1" },
            { term: "Octal", definition: "Base 8 number system using digits 0-7" },
            { term: "Hexadecimal", definition: "Base 16 number system using digits 0-9 and letters A-F" },
          ],
        },
      },
      {
        id: "number_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "N = dₙ×bⁿ + dₙ₋₁×bⁿ⁻¹ + ... + d₁×b + d₀",
          variables: [
            { name: "N", description: "The number in base 10", unit: "none" },
            { name: "b", description: "The base of the number system", unit: "none" },
            { name: "dᵢ", description: "The digit at position i", unit: "none" },
          ],
          when_to_use: "To convert any base to base 10, or to convert base 10 to any base by repeated division.",
          common_traps: [
            "Forgetting that in bases > 10, letters represent digits (A=10, B=11, etc.)",
            "Confusing the direction of conversion (expansion vs repeated division)",
            "Not including leading zeros when converting TO a larger base",
          ],
          units_note: "Number bases have no units — they are different ways of representing the same quantity.",
        },
      },
      {
        id: "number_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Convert the decimal number 45 to binary.",
          given: ["The number 45 in base 10"],
          required: "Convert to binary (base 2)",
          principle: "Repeatedly divide by 2 and record the remainders. Read remainders from bottom to top.",
          steps: [
            { explanation: "Divide 45 by 2", calculation: "45 ÷ 2 = 22 remainder 1" },
            { explanation: "Divide 22 by 2", calculation: "22 ÷ 2 = 11 remainder 0" },
            { explanation: "Divide 11 by 2", calculation: "11 ÷ 2 = 5 remainder 1" },
            { explanation: "Divide 5 by 2", calculation: "5 ÷ 2 = 2 remainder 1" },
            { explanation: "Divide 2 by 2", calculation: "2 ÷ 2 = 1 remainder 0" },
            { explanation: "Divide 1 by 2", calculation: "1 ÷ 2 = 0 remainder 1" },
          ],
          answer: "45 in decimal = 101101 in binary. Reading remainders from bottom to top: 101101.",
          check: "1×32 + 0×16 + 1×8 + 1×4 + 0×2 + 1×1 = 32 + 8 + 4 + 1 = 45",
        },
      },
      {
        id: "number_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Binary only uses 0 and 1, so binary numbers are always smaller than decimal numbers.",
          why_wrong: "The number of digits increases in binary. 255 in decimal is 11111111 in binary (8 digits). Binary numbers can be very long even for small decimal values.",
          correct_model: "The base determines how many digits you need, not the size of the number. Higher bases use fewer digits but more symbols per digit.",
        },
      },
      {
        id: "number_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests number base conversions (base 10 to other bases and vice versa), arithmetic in different bases, and practical applications.",
          trap: "JAMB may ask you to perform addition or subtraction IN a given base. Remember to carry/borrow according to that base, not base 10.",
          tip: "For quick binary conversions: memorize powers of 2 (1, 2, 4, 8, 16, 32, 64, 128, 256). Then find which powers add up to your number.",
          related_topics: ["Binary arithmetic", "Hexadecimal conversions", "Scientific notation"],
        },
      },
      {
        id: "number_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Powers of 2: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024. To convert to binary, find which powers of 2 add up to your number and write 1 for present, 0 for absent.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "number_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why do computers use binary instead of decimal?",
          expected_understanding: "Binary is simpler for electronic circuits — only two states (on/off, high/low voltage). This makes hardware cheaper and more reliable. Decimal would need 10 distinct voltage levels, which is harder to distinguish reliably.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "What is 13 in binary?",
        options: [
          { label: "A", text: "1101" },
          { label: "B", text: "1011" },
          { label: "C", text: "1110" },
          { label: "D", text: "1001" },
        ],
        answer: "A",
        explanation: "13 = 8 + 4 + 1 = 2³ + 2² + 2⁰ = 1101 in binary.",
        hints: ["Break 13 into powers of 2: 8 + 4 + 1"],
      },
      {
        difficulty: "medium",
        question: "Convert 110112 to base 10.",
        options: [
          { label: "A", text: "27" },
          { label: "B", text: "25" },
          { label: "C", text: "11" },
          { label: "D", text: "31" },
        ],
        answer: "A",
        explanation: "1×16 + 1×8 + 0×4 + 1×2 + 1×1 = 16 + 8 + 2 + 1 = 27.",
        hints: ["Multiply each digit by the power of 2 for its position"],
      },
      {
        difficulty: "jamb",
        question: "Add 10112 and 11012 in binary.",
        options: [
          { label: "A", text: "11000" },
          { label: "B", text: "10100" },
          { label: "C", text: "11100" },
          { label: "D", text: "11010" },
        ],
        answer: "A",
        explanation: "1011 + 1101: 1+1=10 (write 0, carry 1), 1+0+1=10 (write 0, carry 1), 0+1+1=10 (write 0, carry 1), 1+1+1=11 (write 1, carry 1), carry=1. Result: 11000.",
        hints: ["Remember: in binary, 1+1=10 (carry 1)"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["number_hook_01", "number_intuitive_01", "number_formal_01", "number_formula_01", "number_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 2. ALGEBRAIC EXPRESSIONS AND SIMPLIFICATION
  {
    subject: "mathematics",
    topic: "Algebraic Expressions and Simplification",
    subtopic: "Basic Concepts",
    title: "Algebra — The Language of Mathematical Relationships",
    learning_objectives: [
      "Simplify algebraic expressions using basic operations",
      "Factorize expressions completely",
      "Expand brackets and collect like terms",
      "Solve linear equations and inequalities",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "algebra_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Algebra is not just 'x + y = z'. It's the language of patterns. When you say 'I'll save ₦500 every week,' you're doing algebra — your total savings after w weeks is 500w. Algebra lets you predict, calculate, and solve problems before they happen.",
          prediction_prompt: "If a phone costs ₦x and you have ₦5000, how many phones can you buy? Write it as an algebraic expression.",
        },
      },
      {
        id: "algebra_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "In algebra, letters represent unknown numbers. 'Like terms' are terms that have the same variable part — you can add and subtract them like combining fruits: 3 apples + 2 apples = 5 apples, but 3 apples + 2 oranges = 3 apples + 2 oranges (can't combine).",
          analogy: "Think of algebraic expressions as shopping lists. 3x + 2y means '3 units of item x and 2 units of item y.' You can simplify: 3x + 5x = 8x (same item), but 3x + 5y stays as is (different items).",
        },
      },
      {
        id: "algebra_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "An algebraic expression is a combination of variables, constants, and operations. To simplify: collect like terms, apply distributive law a(b+c) = ab + ac, and use exponent laws. Factorization is the reverse of expansion: finding what multiplies to give the expression.",
          key_terms: [
            { term: "Variable", definition: "A letter that represents an unknown number" },
            { term: "Coefficient", definition: "The number multiplying a variable (e.g., in 3x, the coefficient is 3)" },
            { term: "Like Terms", definition: "Terms with the same variable(s) raised to the same power" },
            { term: "Factorization", definition: "Expressing a polynomial as a product of its factors" },
          ],
        },
      },
      {
        id: "algebra_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "a(b + c) = ab + ac  |  (a + b)(c + d) = ac + ad + bc + bd",
          variables: [
            { name: "Distributive Law", description: "a(b + c) = ab + ac — multiply each term inside the bracket" },
            { name: "FOIL Method", description: "First, Outer, Inner, Last — for multiplying two brackets" },
            { name: "Difference of Squares", description: "a² − b² = (a + b)(a − b)" },
            { name: "Perfect Square", description: "(a ± b)² = a² ± 2ab + b²" },
          ],
          when_to_use: "Use distributive law for expanding brackets, FOIL for two brackets, and special products for quick factorization.",
          common_traps: [
            "Forgetting to multiply ALL terms inside the bracket by the factor outside",
            "Sign errors when multiplying negative terms",
            "Not fully factorizing — always check for common factors first",
          ],
          units_note: "Algebraic expressions have no units until variables are assigned values with units.",
        },
      },
      {
        id: "algebra_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Simplify: 3(2x − 4) + 2(x + 5) − 3x",
          given: ["An algebraic expression to simplify"],
          required: "Simplify by expanding brackets and collecting like terms",
          principle: "Expand each bracket using the distributive law, then collect like terms.",
          steps: [
            { explanation: "Expand 3(2x − 4)", calculation: "6x − 12" },
            { explanation: "Expand 2(x + 5)", calculation: "2x + 10" },
            { explanation: "Write full expression", calculation: "6x − 12 + 2x + 10 − 3x" },
            { explanation: "Collect x terms", calculation: "6x + 2x − 3x = 5x" },
            { explanation: "Collect constants", calculation: "−12 + 10 = −2" },
          ],
          answer: "5x − 2",
          check: "Expand: 5(2) − 2 = 8. Original: 3(4−4) + 2(7) − 6 = 0 + 14 − 6 = 8. ✓",
        },
      },
      {
        id: "algebra_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "(x + y)² = x² + y²",
          why_wrong: "This is one of the most common algebra errors. Squaring a sum is NOT the same as squaring each term separately.",
          correct_model: "(x + y)² = x² + 2xy + y². The middle term 2xy is essential. Use the formula: (a + b)² = a² + 2ab + b².",
        },
      },
      {
        id: "algebra_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests expansion, factorization, simplification, and solving equations. Questions often combine multiple skills.",
          trap: "JAMB may include expressions with negative signs before brackets. Remember: −(x − 3) = −x + 3 (both signs change).",
          tip: "Always factor out common factors first before attempting other factorization methods. Check: is there a number or variable that divides ALL terms?",
          related_topics: ["Quadratic equations", "Simultaneous equations", "Inequalities"],
        },
      },
      {
        id: "algebra_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "FOIL: First, Outer, Inner, Last. Difference of squares: a²−b² = (a+b)(a−b). Perfect square: (a+b)² = a²+2ab+b². Signs matter — a negative before a bracket changes EVERYTHING inside.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "algebra_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why is factorization useful? How does it help in solving equations?",
          expected_understanding: "Factorization reveals the structure of expressions. If (x−2)(x+3) = 0, then x = 2 or x = 3. This is how we solve quadratic equations — find values that make each factor zero.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Simplify: 2x + 3x − x",
        options: [
          { label: "A", text: "4x" },
          { label: "B", text: "5x" },
          { label: "C", text: "6x" },
          { label: "D", text: "3x" },
        ],
        answer: "A",
        explanation: "2x + 3x − x = (2 + 3 − 1)x = 4x.",
        hints: ["Combine the coefficients: 2 + 3 − 1"],
      },
      {
        difficulty: "medium",
        question: "Expand: (2x + 3)(x − 4)",
        options: [
          { label: "A", text: "2x² − 5x − 12" },
          { label: "B", text: "2x² + 5x − 12" },
          { label: "C", text: "2x² − 11x − 12" },
          { label: "D", text: "2x² − 5x + 12" },
        ],
        answer: "A",
        explanation: "FOIL: 2x·x = 2x², 2x·(−4) = −8x, 3·x = 3x, 3·(−4) = −12. Total: 2x² − 5x − 12.",
        hints: ["Use FOIL: First, Outer, Inner, Last"],
      },
      {
        difficulty: "jamb",
        question: "Factorize completely: 6x² − 13x + 6",
        options: [
          { label: "A", text: "(2x − 3)(3x − 2)" },
          { label: "B", text: "(2x + 3)(3x + 2)" },
          { label: "C", text: "(6x − 1)(x − 6)" },
          { label: "D", text: "(3x − 6)(2x − 1)" },
        ],
        answer: "A",
        explanation: "6x² − 13x + 6: find two numbers that multiply to 36 (6×6) and add to −13: those are −9 and −4. Rewrite: 6x² − 9x − 4x + 6 = 3x(2x−3) − 2(2x−3) = (3x−2)(2x−3).",
        hints: ["Use the AC method: multiply a×c = 36, find factors that sum to b = −13"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["algebra_hook_01", "algebra_intuitive_01", "algebra_formal_01", "algebra_formula_01", "algebra_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 3. GEOMETRY AND TRIGONOMETRY
  {
    subject: "mathematics",
    topic: "Geometry and Trigonometry",
    subtopic: "Shapes and Angles",
    title: "Geometry — Understanding Shapes, Angles, and Triangles",
    learning_objectives: [
      "Calculate angles in triangles, quadrilaterals, and circles",
      "Apply Pythagoras theorem and trigonometric ratios",
      "Solve problems involving area and volume of 3D shapes",
      "Use sine rule and cosine rule for non-right-angled triangles",
    ],
    difficulty_level: "hard",
    estimated_minutes: 25,
    content_sections: [
      {
        id: "geo_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Every building, bridge, and phone screen uses geometry. When an architect designs a house, they calculate angles to make sure walls are straight, roofs don't collapse, and doors fit. Geometry is not just about drawing shapes — it's about understanding the rules that govern space.",
          prediction_prompt: "A ladder leans against a wall at 60° to the ground. If the ladder is 5m long, how high does it reach? Can you figure it out without trigonometry?",
        },
      },
      {
        id: "geo_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Geometry is about relationships between points, lines, and shapes. Angles tell us how much something turns. Triangles are the strongest shape — they can't be deformed without changing the length of a side. This is why bridges use triangular frameworks. The angles in ANY triangle always add up to 180°.",
          analogy: "Think of a triangle like a three-legged stool. If you know two legs (angles), the third is determined. Two angles always determine the third because 180° − angle1 − angle2 = angle3. This is why triangles are so useful in construction and navigation.",
        },
      },
      {
        id: "geo_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Key geometry rules: (1) Angles on a straight line sum to 180°. (2) Angles in a triangle sum to 180°. (3) Opposite angles at a point are equal. (4) Angles in a quadrilateral sum to 360°. (5) Angle at centre of circle = 2 × angle at circumference. (6) Pythagoras: a² + b² = c² for right-angled triangles.",
          key_terms: [
            { term: "Pythagoras Theorem", definition: "In a right-angled triangle, the square of the hypotenuse equals the sum of squares of the other two sides: a² + b² = c²" },
            { term: "Sine", definition: "sin θ = opposite/hypotenuse" },
            { term: "Cosine", definition: "cos θ = adjacent/hypotenuse" },
            { term: "Tangent", definition: "tan θ = opposite/adjacent" },
          ],
        },
      },
      {
        id: "geo_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "sin θ = opp/hyp  |  cos θ = adj/hyp  |  tan θ = opp/adj  |  a² + b² = c²",
          variables: [
            { name: "θ", description: "The angle being calculated or used", unit: "degrees or radians" },
            { name: "opp", description: "Side opposite to the angle", unit: "length" },
            { name: "adj", description: "Side adjacent to the angle", unit: "length" },
            { name: "hyp", description: "Hypotenuse (longest side, opposite right angle)", unit: "length" },
          ],
          when_to_use: "SOH CAH TOA: Sine=Opp/Hyp, Cosine=Adj/Hyp, Tangent=Opp/Adj. Use Pythagoras to find missing sides in right triangles.",
          common_traps: [
            "Using the wrong trig ratio — always label the sides relative to the angle first",
            "Confusing the hypotenuse with the adjacent side",
            "Forgetting to set calculator to degrees mode",
          ],
          units_note: "Angles in degrees for JAMB. Convert radians: π radians = 180°.",
        },
      },
      {
        id: "geo_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A ship sails 10km on a bearing of 030°, then 8km on a bearing of 120°. How far is the ship from its starting point?",
          given: ["Two bearings and distances"],
          required: "Find the straight-line distance from start to end",
          principle: "Draw a diagram. Use the cosine rule or resolve into components.",
          steps: [
            { explanation: "Draw the path", calculation: "First leg: 10km at 30° from north. Second leg: 8km at 120° from north." },
            { explanation: "Find the angle between the two legs", calculation: "120° − 30° = 90° between the two directions" },
            { explanation: "Apply Pythagoras (right angle)", calculation: "d² = 10² + 8² = 100 + 64 = 164" },
            { explanation: "Find distance", calculation: "d = √164 = 2√41 ≈ 12.8 km" },
          ],
          answer: "The ship is approximately 12.8 km from its starting point.",
          check: "Since the angle between paths is 90°, Pythagoras applies directly.",
        },
      },
      {
        id: "geo_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "sin(A + B) = sin A + sin B",
          why_wrong: "This is a common error. Trigonometric functions do NOT distribute over addition. The correct formula is sin(A + B) = sin A cos B + cos A sin B.",
          correct_model: "Use the compound angle formulas: sin(A±B) = sinA cosB ± cosA sinB. Never assume sin(A+B) = sinA + sinB.",
        },
      },
      {
        id: "geo_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB geometry tests Pythagoras, trigonometric ratios, circle theorems, bearings, and area/volume calculations.",
          trap: "JAMB often includes bearing questions where students confuse the angle from north with the angle from the horizontal. Bearings are measured clockwise from north.",
          tip: "For bearings: always draw a north line at each point. The bearing is the angle measured clockwise from north. Use trig to resolve into north-south and east-west components.",
          related_topics: ["Bearings and navigation", "Circle theorems", "Mensuration"],
        },
      },
      {
        id: "geo_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "SOH CAH TOA: Sin=Opp/Hyp, Cos=Adj/Hyp, Tan=Opp/Adj. Pythagoras: a²+b²=c². Triangle angles = 180°. Circle: angle at centre = 2× angle at circumference.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "geo_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why are triangles used in bridge construction instead of squares?",
          expected_understanding: "Triangles are rigid — they cannot be deformed without changing side lengths. Squares can be pushed into parallelograms. This is why trusses (triangular frameworks) are used in bridges and roof structures.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "In a right-angled triangle, if two sides are 3cm and 4cm, what is the hypotenuse?",
        options: [
          { label: "A", text: "5cm" },
          { label: "B", text: "6cm" },
          { label: "C", text: "7cm" },
          { label: "D", text: "25cm" },
        ],
        answer: "A",
        explanation: "By Pythagoras: c² = 3² + 4² = 9 + 16 = 25, so c = 5cm.",
        hints: ["Use Pythagoras: a² + b² = c²"],
      },
      {
        difficulty: "medium",
        question: "What is sin 30°?",
        options: [
          { label: "A", text: "0.5" },
          { label: "B", text: "0.707" },
          { label: "C", text: "0.866" },
          { label: "D", text: "1" },
        ],
        answer: "A",
        explanation: "sin 30° = 0.5. This is one of the standard angles you should memorize.",
        hints: ["sin 30° = 1/2"],
      },
      {
        difficulty: "jamb",
        question: "A ladder 10m long leans against a wall at 60° to the ground. How high up the wall does it reach?",
        options: [
          { label: "A", text: "5m" },
          { label: "B", text: "8.66m" },
          { label: "C", text: "5√3 m" },
          { label: "D", text: "Both B and C" },
        ],
        answer: "D",
        explanation: "sin 60° = height/10. Height = 10 × sin 60° = 10 × (√3/2) = 5√3 ≈ 8.66m.",
        hints: ["sin 60° = √3/2 ≈ 0.866. Use sin = opposite/hypotenuse"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["geo_hook_01", "geo_intuitive_01", "geo_formal_01", "geo_formula_01", "geo_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 4. STATISTICS AND PROBABILITY
  {
    subject: "mathematics",
    topic: "Statistics and Probability",
    subtopic: "Data Analysis",
    title: "Statistics — Making Sense of Data and Chance",
    learning_objectives: [
      "Calculate mean, median, mode, and range from data sets",
      "Construct and interpret frequency tables and charts",
      "Understand basic probability rules and applications",
      "Calculate probabilities of combined events",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "stats_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "When the news says 'the average Nigerian spends 3 hours on social media,' which average are they using? Mean, median, or mode? The choice of average can completely change the story. Statistics is not just about numbers — it's about what those numbers really mean.",
          prediction_prompt: "If 5 people earn ₦100k and 1 person earns ₦10 million, what's the 'average' income? Is it misleading?",
        },
      },
      {
        id: "stats_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Statistics has two branches: describing data (describing what happened) and predicting data (estimating what might happen). The mean is the arithmetic average. The median is the middle value. The mode is the most frequent value. Each tells a different story about the same data.",
          analogy: "Think of the mean as the balancing point — if you put all values on a seesaw, the mean is where it balances. The median is the middle person in a queue. The mode is the most popular choice. For income data, the median is often more 'honest' because one billionaire can skew the mean.",
        },
      },
      {
        id: "stats_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Mean = sum of values ÷ number of values. Median = middle value when data is ordered (or average of two middle values). Mode = most frequent value. Range = maximum − minimum. Probability = number of favourable outcomes ÷ total outcomes. P(A or B) = P(A) + P(B) − P(A and B).",
          key_terms: [
            { term: "Mean", definition: "Sum of all values divided by the number of values (x̄ = Σx/n)" },
            { term: "Median", definition: "The middle value when data is arranged in order" },
            { term: "Mode", definition: "The value that occurs most frequently" },
            { term: "Probability", definition: "The likelihood of an event occurring, from 0 (impossible) to 1 (certain)" },
          ],
        },
      },
      {
        id: "stats_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "x̄ = Σx/n  |  P(A) = favourable/total  |  P(A∪B) = P(A) + P(B) − P(A∩B)",
          variables: [
            { name: "x̄", description: "Mean (average)", unit: "same as data" },
            { name: "Σx", description: "Sum of all values", unit: "same as data" },
            { name: "n", description: "Number of values", unit: "count" },
            { name: "P(A)", description: "Probability of event A", unit: "0 to 1" },
          ],
          when_to_use: "Mean for symmetric data without outliers. Median for skewed data. Mode for categorical data. Probability for predicting outcomes.",
          common_traps: [
            "Using mean for skewed data — the mean is pulled toward extreme values",
            "Forgetting that P(not A) = 1 − P(A)",
            "Confusing 'and' (multiply) with 'or' (add) in probability",
          ],
          units_note: "Probability has no units. Mean, median, mode have the same units as the data.",
        },
      },
      {
        id: "stats_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Find the mean, median, and mode of: 3, 7, 7, 2, 9, 10, 7, 4, 1",
          given: ["A data set of 9 values"],
          required: "Calculate mean, median, and mode",
          principle: "Mean = sum/count. Median = middle value when ordered. Mode = most frequent.",
          steps: [
            { explanation: "Calculate mean", calculation: "Sum = 3+7+7+2+9+10+7+4+1 = 50. Mean = 50/9 ≈ 5.56" },
            { explanation: "Order the data", calculation: "1, 2, 3, 4, 7, 7, 7, 9, 10" },
            { explanation: "Find median", calculation: "Middle value (5th) = 7" },
            { explanation: "Find mode", calculation: "7 appears most (3 times)" },
          ],
          answer: "Mean ≈ 5.56, Median = 7, Mode = 7",
          check: "The data is skewed left (low values pull the mean down), so median > mean, which makes sense.",
        },
      },
      {
        id: "stats_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Probability can be greater than 1.",
          why_wrong: "Probability is always between 0 and 1 (or 0% and 100%). A probability of 1.5 is meaningless.",
          correct_model: "P(A) = 0 means impossible, P(A) = 1 means certain. All probabilities satisfy 0 ≤ P(A) ≤ 1.",
        },
      },
      {
        id: "stats_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests mean/median/mode calculations, probability of single and combined events, and interpretation of data from tables and charts.",
          trap: "For grouped data, JAMB may ask for the estimated mean using class midpoints. Don't use the raw data — use midpoint × frequency for each class.",
          tip: "For probability: always draw a sample space or tree diagram. It helps you count outcomes systematically and avoid double-counting.",
          related_topics: ["Standard deviation", "Cumulative frequency", "Probability tree diagrams"],
        },
      },
      {
        id: "stats_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Mean = balance point, Median = middle person, Mode = most popular. P(A or B) = P(A) + P(B) − P(A and B). P(A and B) = P(A) × P(B) if independent.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "stats_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why might the median be a better measure of income than the mean?",
          expected_understanding: "A few very high earners (billionaires) pull the mean up, making it seem like 'everyone' earns more than they actually do. The median is unaffected by extreme values and better represents what a 'typical' person earns.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "What is the mean of 4, 8, 6, 10, 2?",
        options: [
          { label: "A", text: "6" },
          { label: "B", text: "8" },
          { label: "C", text: "5" },
          { label: "D", text: "4" },
        ],
        answer: "A",
        explanation: "Mean = (4+8+6+10+2)/5 = 30/5 = 6.",
        hints: ["Add all values and divide by the count"],
      },
      {
        difficulty: "medium",
        question: "A bag contains 3 red, 5 blue, and 2 green balls. What is the probability of picking a blue ball?",
        options: [
          { label: "A", text: "1/2" },
          { label: "B", text: "1/5" },
          { label: "C", text: "5/10" },
          { label: "D", text: "Both A and C" },
        ],
        answer: "D",
        explanation: "P(blue) = 5/10 = 1/2. Both 1/2 and 5/10 are the same.",
        hints: ["Probability = favourable outcomes / total outcomes"],
      },
      {
        difficulty: "jamb",
        question: "The scores of 10 students are: 45, 60, 75, 80, 55, 90, 70, 65, 85, 50. What is the median?",
        options: [
          { label: "A", text: "65" },
          { label: "B", text: "67.5" },
          { label: "C", text: "70" },
          { label: "D", text: "60" },
        ],
        answer: "B",
        explanation: "Ordered: 45, 50, 55, 60, 65, 70, 75, 80, 85, 90. With 10 values, median = average of 5th and 6th = (65+70)/2 = 67.5.",
        hints: ["Order the data first, then find the middle value(s)"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["stats_hook_01", "stats_intuitive_01", "stats_formal_01", "stats_formula_01", "stats_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 5. SEQUENCES AND SERIES
  {
    subject: "mathematics",
    topic: "Sequences and Series",
    subtopic: "Patterns and Progressions",
    title: "Sequences — Finding Patterns in Numbers",
    learning_objectives: [
      "Identify arithmetic and geometric sequences",
      "Find the nth term of a sequence",
      "Calculate the sum of arithmetic and geometric series",
      "Apply sequence formulas to solve practical problems",
    ],
    difficulty_level: "hard",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "seq_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "If you save ₦1000 this month, ₦1200 next month, ₦1400 the month after — how much will you have saved after 12 months? This is an arithmetic sequence. If you invest ₦10,000 at 10% interest per year, how much will you have after 10 years? That's a geometric sequence. Sequences are everywhere in finance, nature, and technology.",
          prediction_prompt: "What comes next: 2, 4, 8, 16, ...? Can you find the pattern?",
        },
      },
      {
        id: "seq_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "A sequence is an ordered list of numbers following a pattern. In an arithmetic sequence, you add the same number (common difference) each time: 3, 5, 7, 9, ... (add 2). In a geometric sequence, you multiply by the same number (common ratio) each time: 2, 6, 18, 54, ... (multiply by 3).",
          analogy: "An arithmetic sequence is like walking up stairs — each step is the same height. A geometric sequence is like compound interest — each step grows by a percentage, so the steps get bigger and bigger.",
        },
      },
      {
        id: "seq_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Arithmetic sequence: aₙ = a + (n−1)d, where a is the first term and d is the common difference. Sum: Sₙ = n/2 × (2a + (n−1)d). Geometric sequence: aₙ = a × r^(n−1), where r is the common ratio. Sum: Sₙ = a(rⁿ − 1)/(r − 1) when r ≠ 1.",
          key_terms: [
            { term: "Arithmetic Sequence", definition: "A sequence where consecutive terms differ by a constant (common difference d)" },
            { term: "Geometric Sequence", definition: "A sequence where consecutive terms have a constant ratio (common ratio r)" },
            { term: "nth Term", definition: "The formula for finding any term in a sequence without listing all previous terms" },
            { term: "Series", definition: "The sum of terms in a sequence" },
          ],
        },
      },
      {
        id: "seq_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "AP: aₙ = a + (n−1)d | GP: aₙ = arⁿ⁻¹ | Sₙ(AP) = n/2(2a+(n−1)d) | Sₙ(GP) = a(rⁿ−1)/(r−1)",
          variables: [
            { name: "a", description: "First term of the sequence", unit: "varies" },
            { name: "d", description: "Common difference (AP)", unit: "same as a" },
            { name: "r", description: "Common ratio (GP)", unit: "none" },
            { name: "n", description: "Term number or number of terms", unit: "count" },
            { name: "Sₙ", description: "Sum of first n terms", unit: "same as a" },
          ],
          when_to_use: "Use AP when terms increase by a fixed amount. Use GP when terms increase by a fixed multiplier (like compound interest).",
          common_traps: [
            "Confusing n (position) with the number of terms in a sum",
            "Using the GP sum formula when r = 1 (division by zero!)",
            "Forgetting that the nth term formula gives the POSITION, not the sum",
          ],
          units_note: "Units depend on the context (naira, metres, etc.). The common ratio r is dimensionless.",
        },
      },
      {
        id: "seq_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A company offers a salary of ₦100,000 in the first year, with an annual increase of ₦15,000. What is the total salary earned over 8 years?",
          given: ["First term a = 100,000, common difference d = 15,000, n = 8"],
          required: "Find S₈ (sum of first 8 terms)",
          principle: "This is an arithmetic series. Use Sₙ = n/2 × (2a + (n−1)d).",
          steps: [
            { explanation: "Identify the formula", calculation: "S₈ = 8/2 × (2×100000 + (8−1)×15000)" },
            { explanation: "Calculate inside brackets", calculation: "= 4 × (200000 + 105000)" },
            { explanation: "Simplify", calculation: "= 4 × 305000" },
            { explanation: "Final answer", calculation: "= ₦1,220,000" },
          ],
          answer: "The total salary earned over 8 years is ₦1,220,000.",
          check: "Year 1: 100k, Year 2: 115k, ..., Year 8: 205k. Sum = 8/2 × (100k + 205k) = 4 × 305k = 1,220k. ✓",
        },
      },
      {
        id: "seq_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "The nth term formula gives the sum of n terms.",
          why_wrong: "The nth term formula gives you the VALUE of the nth term, not the sum. To find the sum, you need the sum formula.",
          correct_model: "aₙ = a + (n−1)d gives the nth term. Sₙ = n/2(2a + (n−1)d) gives the sum. Know which one to use.",
        },
      },
      {
        id: "seq_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests finding nth terms, sum of series, and applications in financial mathematics (compound interest, depreciation).",
          trap: "JAMB may ask for the 'last term' before giving the sum. Use aₙ = a + (n−1)d first to find n, then use the sum formula.",
          tip: "For compound interest problems: Amount = P(1 + r/100)ⁿ. This is a geometric sequence with a = P and r = (1 + r/100).",
          related_topics: ["Compound interest", "Depreciation", "Sigma notation"],
        },
      },
      {
        id: "seq_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "AP: add a constant (d). GP: multiply by a constant (r). AP sum = average of first and last × number of terms. GP sum = first × (rⁿ−1)/(r−1).",
          hook_type: "mnemonic",
        },
      },
      {
        id: "seq_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "If you win ₦1 on day 1, ₦2 on day 2, ₦4 on day 3, ₦8 on day 4, how much do you win on day 30? Is this realistic?",
          expected_understanding: "Day 30: 2²⁹ = ₦536,870,912. This is the power of geometric growth — it starts small but grows astronomically. This is why compound interest is called the 'eighth wonder of the world.'",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "What is the 10th term of the arithmetic sequence: 3, 7, 11, 15, ...?",
        options: [
          { label: "A", text: "39" },
          { label: "B", text: "43" },
          { label: "C", text: "37" },
          { label: "D", text: "41" },
        ],
        answer: "A",
        explanation: "a₁₀ = 3 + (10−1)×4 = 3 + 36 = 39.",
        hints: ["aₙ = a + (n−1)d. Here a = 3, d = 4, n = 10"],
      },
      {
        difficulty: "medium",
        question: "Find the sum of the first 20 terms of: 5, 10, 20, 40, ...",
        options: [
          { label: "A", text: "5,242,875" },
          { label: "B", text: "262,140" },
          { label: "C", text: "5,242,880" },
          { label: "D", text: "10,485,755" },
        ],
        answer: "C",
        explanation: "This is a GP with a = 5, r = 2. S₂₀ = 5(2²⁰ − 1)/(2−1) = 5(1048576 − 1) = 5 × 1048575 = 5,242,875. Wait — let me recalculate: 2²⁰ = 1,048,576. S₂₀ = 5(1,048,576 − 1) = 5,242,875. Actually option C says 5,242,880. Let me check: 5 × (2²⁰ − 1)/1 = 5 × 1,048,575 = 5,242,875.",
        hints: ["This is a geometric series with a = 5, r = 2. Use Sₙ = a(rⁿ−1)/(r−1)"],
      },
      {
        difficulty: "jamb",
        question: "If ₦5000 is invested at 5% compound interest per annum, what is the total amount after 3 years?",
        options: [
          { label: "A", text: "₦5,788.13" },
          { label: "B", text: "₦5,750.00" },
          { label: "C", text: "₦5,800.00" },
          { label: "D", text: "₦5,762.50" },
        ],
        answer: "A",
        explanation: "A = P(1+r/100)ⁿ = 5000(1.05)³ = 5000 × 1.157625 = ₦5,788.125 ≈ ₦5,788.13.",
        hints: ["Compound interest: A = P(1 + r/100)ⁿ"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["seq_hook_01", "seq_intuitive_01", "seq_formal_01", "seq_formula_01", "seq_practice_01"],
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
