import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS = [
  // 1. INTRODUCTION TO ECONOMICS
  {
    subject: "economics",
    topic: "Introduction to Economics",
    subtopic: "Basic Concepts and Scope",
    title: "Economics — The Science of Scarcity and Choice",
    learning_objectives: [
      "Define economics and explain its scope",
      "Distinguish between microeconomics and macroeconomics",
      "Explain opportunity cost and its applications",
      "Identify the factors of production and their rewards",
    ],
    difficulty_level: "beginner",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "econ_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "You have ₦5000. You can buy data, food, or save it. You can't have all three. That's economics — the study of how people make choices when resources are limited. Every decision involves a trade-off. Understanding economics helps you make better decisions.",
          prediction_prompt: "If you have 2 hours to study and 3 subjects to prepare for, how do you decide? What do you sacrifice?",
        },
      },
      {
        id: "econ_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Economics studies how people, businesses, and governments allocate scarce resources to satisfy unlimited wants. The core problem: unlimited wants, limited resources. This forces choices. Every choice has a cost — the next best alternative you gave up. That's opportunity cost.",
          analogy: "Imagine a student with ₦1000 who can buy a textbook or go to the movies. If they buy the textbook, the opportunity cost is the movie experience. If they go to the movies, the opportunity cost is the knowledge from the textbook. Economics is about weighing these trade-offs.",
        },
      },
      {
        id: "econ_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Economics is the social science that studies how individuals and societies allocate scarce resources to satisfy unlimited wants. Two branches: Microeconomics (individual decisions — consumers, firms) and Macroeconomics (economy-wide phenomena — inflation, unemployment, GDP). Factors of production: Land (natural resources), Labour (human effort), Capital (machinery, tools), Entrepreneurship (organizing the other three).",
          key_terms: [
            { term: "Opportunity Cost", definition: "The value of the next best alternative foregone when a choice is made" },
            { term: "Microeconomics", definition: "Study of individual economic agents — consumers, firms, markets" },
            { term: "Macroeconomics", definition: "Study of economy-wide phenomena — inflation, growth, unemployment" },
            { term: "Factors of Production", definition: "Resources used in production: land, labour, capital, entrepreneurship" },
          ],
        },
      },
      {
        id: "econ_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Opportunity Cost = Value of next best alternative foregone",
          variables: [
            { name: "Land", description: "Natural resources — rent" },
            { name: "Labour", description: "Human effort — wages" },
            { name: "Capital", description: "Man-made tools — interest" },
            { name: "Entrepreneurship", description: "Risk-taking and organization — profit" },
          ],
          when_to_use: "Use opportunity cost to evaluate any decision. Ask: 'What am I giving up?'",
          common_traps: [
            "Confusing opportunity cost with money cost — opportunity cost is the value of the alternative, not the price",
            "Forgetting that time is a resource with opportunity cost",
            "Not considering all alternatives — only the NEXT BEST counts",
          ],
          units_note: "Opportunity cost is measured in terms of what is given up, not necessarily in money.",
        },
      },
      {
        id: "econ_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A farmer has ₦100,000. He can invest in farming (expected return ₦30,000) or open a shop (expected return ₦25,000). What is his opportunity cost if he chooses farming?",
          given: ["Two investment options with different returns"],
          required: "Calculate the opportunity cost",
          principle: "Opportunity cost = the value of the next best alternative given up.",
          steps: [
            { explanation: "Identify the choice", calculation: "The farmer chooses farming (return: ₦30,000)" },
            { explanation: "Identify the alternative", calculation: "The next best alternative is the shop (return: ₦25,000)" },
            { explanation: "Calculate opportunity cost", calculation: "Opportunity cost = ₦25,000 (the shop's return)" },
            { explanation: "Note", calculation: "The opportunity cost is NOT ₦100,000 — it's the value of what he gave up" },
          ],
          answer: "The opportunity cost is ₦25,000 — the return from the shop he didn't invest in.",
          check: "He gains ₦30,000 from farming but gives up ₦25,000 from the shop. Net benefit of choosing farming: ₦5,000.",
        },
      },
      {
        id: "econ_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Economics is only about money.",
          why_wrong: "Economics is about ALL scarce resources — time, energy, materials, and money. A student deciding how to spend their time is doing economics.",
          correct_model: "Economics is about choices under scarcity. Money is one resource, but time, labour, and materials are also scarce.",
        },
      },
      {
        id: "econ_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests definitions, opportunity cost, factors of production, and the difference between micro and macroeconomics.",
          trap: "JAMB may ask about 'opportunity cost' in real-world scenarios. Always identify: the choice made, the alternative given up, and the value of that alternative.",
          tip: "For definitions, be precise. JAMB marks based on key terms. Include: scarcity, choice, allocation, satisfaction of wants.",
          related_topics: ["Demand and supply", "Production possibilities", "Economic systems"],
        },
      },
      {
        id: "econ_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Economics = Scarcity + Choice. Opportunity cost = what you give up. Factors: Land (rent), Labour (wages), Capital (interest), Entrepreneurship (profit). Micro = individual. Macro = economy-wide.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "econ_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Is there such a thing as a free lunch? Why or why not?",
          expected_understanding: "No. Even if someone gives you a free lunch, they bear the cost. The saying 'there's no such thing as a free lunch' reminds us that everything has a cost — even if you don't pay for it, someone does, or something is given up.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "The study of individual consumer and firm decisions is called:",
        options: [
          { label: "A", text: "Macroeconomics" },
          { label: "B", text: "Microeconomics" },
          { label: "C", text: "Development economics" },
          { label: "D", text: "Agricultural economics" },
        ],
        answer: "B",
        explanation: "Microeconomics studies individual agents — consumers, firms, and markets.",
        hints: ["Micro = small scale"],
      },
      {
        difficulty: "medium",
        question: "The opportunity cost of attending a 4-year university is:",
        options: [
          { label: "A", text: "Tuition fees only" },
          { label: "B", text: "The salary you could have earned working" },
          { label: "C", text: "Tuition plus books" },
          { label: "D", text: "The degree you receive" },
        ],
        answer: "B",
        explanation: "The opportunity cost is the next best alternative — the salary you could have earned instead of studying.",
        hints: ["What do you give up by spending 4 years in school?"],
      },
      {
        difficulty: "jamb",
        question: "Which factor of production receives 'profit' as its reward?",
        options: [
          { label: "A", text: "Land" },
          { label: "B", text: "Labour" },
          { label: "C", text: "Capital" },
          { label: "D", text: "Entrepreneurship" },
        ],
        answer: "D",
        explanation: "The entrepreneur organizes production and bears risk — profit is the reward for this.",
        hints: ["Who organizes the other factors and takes risks?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["econ_hook_01", "econ_intuitive_01", "econ_formal_01", "econ_formula_01", "econ_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 2. DEMAND AND SUPPLY
  {
    subject: "economics",
    topic: "Theory of Demand and Supply",
    subtopic: "Price Determination",
    title: "Demand and Supply — How Prices Are Born",
    learning_objectives: [
      "State the law of demand and supply",
      "Explain factors affecting demand and supply",
      "Analyze market equilibrium and price determination",
      "Calculate and interpret elasticity of demand",
    ],
    difficulty_level: "medium",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "ds_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Why is garri cheap during harvest season but expensive during the rainy season? Why do exam materials cost more close to the exam date? The answer is demand and supply — the most powerful forces in economics. When many people want something (high demand) and there's little of it (low supply), the price goes up.",
          prediction_prompt: "What happens to the price of umbrellas when it starts raining? Why?",
        },
      },
      {
        id: "ds_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Demand is how much of a product people are willing and able to buy at a given price. Supply is how much producers are willing to sell at a given price. When demand exceeds supply, prices rise. When supply exceeds demand, prices fall. Equilibrium is where demand equals supply — the price 'settles' there.",
          analogy: "Think of demand and supply like a tug-of-war. Buyers pull prices down (they want cheap goods). Sellers pull prices up (they want profit). The equilibrium price is where neither side is winning — the rope stays in the middle.",
        },
      },
      {
        id: "ds_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Law of Demand: as price increases, quantity demanded decreases (and vice versa), ceteris paribus. Law of Supply: as price increases, quantity supplied increases (and vice versa). Market equilibrium: where demand curve intersects supply curve. Price floor: minimum price (above equilibrium). Price ceiling: maximum price (below equilibrium).",
          key_terms: [
            { term: "Demand", definition: "Quantity of a good consumers are willing and able to buy at various prices" },
            { term: "Supply", definition: "Quantity of a good producers are willing and able to sell at various prices" },
            { term: "Equilibrium", definition: "Where demand equals supply — the market-clearing price" },
            { term: "Price Elasticity", definition: "Responsiveness of quantity demanded to a change in price" },
          ],
        },
      },
      {
        id: "ds_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "PED = % Change in Quantity Demanded / % Change in Price",
          variables: [
            { name: "PED", description: "Price Elasticity of Demand" },
            { name: "|PED| > 1", description: "Elastic — quantity changes more than price" },
            { name: "|PED| < 1", description: "Inelastic — quantity changes less than price" },
            { name: "|PED| = 1", description: "Unit elastic — proportional change" },
          ],
          when_to_use: "When analyzing how sensitive consumers are to price changes. Essential for business pricing and government taxation.",
          common_traps: [
            "Confusing demand with quantity demanded — demand is the whole curve, quantity demanded is a point",
            "Forgetting ceteris paribus — all other factors must remain constant",
            "Not knowing that PED is usually negative (price up, demand down)",
          ],
          units_note: "Elasticity has no units — it's a ratio of percentages.",
        },
      },
      {
        id: "ds_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "The price of rice increases from ₦500 to ₦600 per bag. Quantity demanded falls from 1000 bags to 800 bags. Calculate the price elasticity of demand.",
          given: ["Price change: ₦500 to ₦600", "Quantity change: 1000 to 800"],
          required: "Calculate PED",
          principle: "PED = % change in Qd / % change in P",
          steps: [
            { explanation: "Calculate % change in quantity", calculation: "ΔQ = (800−1000)/1000 × 100 = −20%" },
            { explanation: "Calculate % change in price", calculation: "ΔP = (600−500)/500 × 100 = +20%" },
            { explanation: "Calculate PED", calculation: "PED = −20%/20% = −1" },
            { explanation: "Interpret", calculation: "|PED| = 1, so demand is unit elastic" },
          ],
          answer: "PED = −1 (unit elastic). A 20% price increase caused a 20% decrease in quantity demanded.",
          check: "Unit elastic means the percentage change in quantity equals the percentage change in price.",
        },
      },
      {
        id: "ds_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "If demand increases, price always increases.",
          why_wrong: "Only if supply stays constant. If supply also increases, the price may stay the same or even fall.",
          correct_model: "Price depends on BOTH demand AND supply. An increase in demand raises price only if supply is constant.",
        },
      },
      {
        id: "ds_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests demand/supply curves, equilibrium, elasticity calculations, and effects of price controls.",
          trap: "JAMB may ask about the effect of a price ceiling or price floor. Price ceiling below equilibrium creates shortage. Price floor above equilibrium creates surplus.",
          tip: "For elasticity: remember PED is usually negative. When JAMB asks 'is demand elastic or inelastic,' look at the absolute value.",
          related_topics: ["Market structures", "Government intervention", "Taxation"],
        },
      },
      {
        id: "ds_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Law of Demand: Price up, quantity down. Law of Supply: Price up, quantity up. Equilibrium: demand = supply. PED > 1 = elastic. PED < 1 = inelastic.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "ds_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why does the government sometimes set maximum prices for essential goods? Does this always work?",
          expected_understanding: "Price ceilings (maximum prices) make goods affordable for the poor. But if set below equilibrium, they create shortages — producers supply less because prices are too low. This can lead to black markets.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "According to the law of demand, as price increases:",
        options: [
          { label: "A", text: "Quantity demanded increases" },
          { label: "B", text: "Quantity demanded decreases" },
          { label: "C", text: "Supply increases" },
          { label: "D", text: "Supply decreases" },
        ],
        answer: "B",
        explanation: "The law of demand states that as price increases, quantity demanded decreases (inverse relationship).",
        hints: ["Higher prices make people buy less"],
      },
      {
        difficulty: "medium",
        question: "If PED = −2.5, demand is:",
        options: [
          { label: "A", text: "Inelastic" },
          { label: "B", text: "Elastic" },
          { label: "C", text: "Unit elastic" },
          { label: "D", text: "Perfectly inelastic" },
        ],
        answer: "B",
        explanation: "|PED| = 2.5 > 1, so demand is elastic — quantity responds strongly to price changes.",
        hints: ["|PED| > 1 = elastic"],
      },
      {
        difficulty: "jamb",
        question: "A price ceiling set below equilibrium will cause:",
        options: [
          { label: "A", text: "Surplus" },
          { label: "B", text: "Shortage" },
          { label: "C", text: "Equilibrium" },
          { label: "D", text: "No change" },
        ],
        answer: "B",
        explanation: "A price ceiling below equilibrium means demand exceeds supply — creating a shortage.",
        hints: ["Below equilibrium, people want more than producers supply"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["ds_hook_01", "ds_intuitive_01", "ds_formal_01", "ds_formula_01", "ds_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 3. CONSUMER BEHAVIOUR
  {
    subject: "economics",
    topic: "Theory of Consumer Behaviour",
    subtopic: "Utility Analysis",
    title: "Consumer Behaviour — Why We Buy What We Buy",
    learning_objectives: [
      "Explain the concept of utility",
      "State the law of diminishing marginal utility",
      "Analyze consumer equilibrium",
      "Understand indifference curve analysis",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      {
        id: "util_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "The first bottle of water on a hot day is heavenly. The second is nice. The third is okay. By the fifth, you don't want any more. That's diminishing marginal utility — the more you have of something, the less satisfaction you get from each additional unit. This explains why you don't eat only rice every day.",
          prediction_prompt: "Why do you get bored of eating the same food every day? What economic principle explains this?",
        },
      },
      {
        id: "util_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Utility is satisfaction from consuming a good or service. Total utility (TU) is the total satisfaction. Marginal utility (MU) is the extra satisfaction from one more unit. The law of diminishing marginal utility says each additional unit gives less satisfaction than the previous one. Consumers maximize satisfaction by allocating their budget where MU per naira is equal across all goods.",
          analogy: "Think of utility like a buffet. The first plate: everything tastes amazing (high MU). Second plate: still good but less exciting. Third plate: you're getting full (low MU). Fourth plate: you feel sick (negative MU). You stop eating when satisfaction starts dropping.",
        },
      },
      {
        id: "util_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Total Utility (TU) = total satisfaction from consuming all units. Marginal Utility (MU) = ΔTU/ΔQ. Law of Diminishing MU: as consumption increases, marginal utility decreases. Consumer Equilibrium: MUₐ/Pₐ = MU_b/P_b = ... = MU_n/P_n. Indifference curves show combinations of goods giving equal satisfaction. Budget line shows affordable combinations.",
          key_terms: [
            { term: "Utility", definition: "Satisfaction or pleasure from consuming a good or service" },
            { term: "Marginal Utility", definition: "Additional satisfaction from consuming one more unit of a good" },
            { term: "Consumer Equilibrium", definition: "The point where the consumer maximizes satisfaction given their budget" },
            { term: "Indifference Curve", definition: "A curve showing combinations of two goods that give equal satisfaction" },
          ],
        },
      },
      {
        id: "util_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Consumer Equilibrium: MUₐ/Pₐ = MU_b/P_b = ... = MU_n/P_n",
          variables: [
            { name: "MUₐ", description: "Marginal utility of good A" },
            { name: "Pₐ", description: "Price of good A" },
            { name: "MU/P", description: "Marginal utility per naira spent" },
            { name: "Rule", description: "Allocate budget so MU per naira is equal for all goods" },
          ],
          when_to_use: "When analyzing how consumers allocate their budget among different goods to maximize satisfaction.",
          common_traps: [
            "Confusing total utility with marginal utility — TU can rise while MU falls",
            "Forgetting that MU eventually becomes negative (too much of a good thing)",
            "Not understanding that equilibrium means no incentive to change",
          ],
          units_note: "Utility is measured in 'utils' (hypothetical units). In practice, we use ordinal ranking (1st, 2nd, 3rd preference).",
        },
      },
      {
        id: "util_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A consumer has ₦20 to spend on goods X (₦4 each) and Y (₦2 each). The marginal utilities are: X: 24, 20, 16, 12. Y: 12, 10, 8, 6, 4, 2. How should the consumer spend the ₦20?",
          given: ["Budget: ₦20, Price of X: ₦4, Price of Y: ₦2"],
          required: "Find the utility-maximizing combination",
          principle: "Compare MU/P for each good. Allocate to the highest MU/P first.",
          steps: [
            { explanation: "Calculate MU/P for X", calculation: "24/4=6, 20/4=5, 16/4=4, 12/4=3" },
            { explanation: "Calculate MU/P for Y", calculation: "12/2=6, 10/2=5, 8/2=4, 6/2=3, 4/2=2, 2/2=1" },
            { explanation: "Allocate to highest MU/P", calculation: "First naira: X (MU/P=6) or Y (MU/P=6). Buy both until equal." },
            { explanation: "Find equilibrium", calculation: "Buy 2X (₦8) + 6Y (₦12) = ₦20. MU_X/P_X = 4, MU_Y/P_Y = 4. Equal!" },
          ],
          answer: "Buy 2 units of X and 6 units of Y. At this point, MUₓ/Pₓ = MUᵧ/Pᵧ = 4.",
          check: "Total spending: 2×₦4 + 6×₦2 = ₦8 + ₦12 = ₦20. ✓",
        },
      },
      {
        id: "util_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "More consumption always means more satisfaction.",
          why_wrong: "Diminishing marginal utility means each additional unit gives less satisfaction. Eventually, more consumption reduces total satisfaction (MU becomes negative).",
          correct_model: "Satisfaction increases at a decreasing rate, then eventually decreases. There's an optimal level of consumption.",
        },
      },
      {
        id: "util_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests utility maximization, consumer equilibrium, and indifference curve analysis.",
          trap: "JAMB may ask about the equi-marginal principle. Remember: MUₐ/Pₐ = MU_b/P_b — this is the condition for maximum satisfaction.",
          tip: "For indifference curve questions: higher curves = higher satisfaction. Budget line = what you can afford. Equilibrium = where budget line is tangent to highest possible indifference curve.",
          related_topics: ["Demand curves", "Price elasticity", "Consumer surplus"],
        },
      },
      {
        id: "util_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Diminishing MU: more = less satisfaction per unit. Equilibrium: MU/Price equal for all goods. Higher indifference curve = more satisfaction. Budget line = what you can afford.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "util_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why might a rich person still experience diminishing marginal utility?",
          expected_understanding: "Even with unlimited money, the human body and mind have limits. The 10th car gives less joy than the first. The 100th meal gives less satisfaction than the first. Diminishing utility is a human psychological reality, not just a financial one.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "The law of diminishing marginal utility states that:",
        options: [
          { label: "A", text: "Total utility always decreases" },
          { label: "B", text: "Marginal utility decreases as consumption increases" },
          { label: "C", text: "Price decreases as consumption increases" },
          { label: "D", text: "Supply decreases as consumption increases" },
        ],
        answer: "B",
        explanation: "The law states that each additional unit consumed gives less additional satisfaction than the previous unit.",
        hints: ["Each extra unit gives less satisfaction"],
      },
      {
        difficulty: "medium",
        question: "Consumer equilibrium is reached when:",
        options: [
          { label: "A", text: "Total utility is maximized" },
          { label: "B", text: "Marginal utility is zero" },
          { label: "C", text: "MU/P is equal for all goods" },
          { label: "D", text: "Price equals marginal cost" },
        ],
        answer: "C",
        explanation: "Equilibrium: MUₐ/Pₐ = MU_b/P_b — marginal utility per naira is equal across all goods.",
        hints: ["What condition must hold for maximum satisfaction?"],
      },
      {
        difficulty: "jamb",
        question: "At the point of consumer saturation:",
        options: [
          { label: "A", text: "TU is maximum and MU is zero" },
          { label: "B", text: "TU is zero and MU is maximum" },
          { label: "C", text: "Both TU and MU are zero" },
          { label: "D", text: "Both TU and MU are maximum" },
        ],
        answer: "A",
        explanation: "Saturation: TU is maximum (no more satisfaction from more consumption), MU = 0 (additional unit adds nothing).",
        hints: ["Saturation = you've had enough, no more satisfaction"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["util_hook_01", "util_intuitive_01", "util_formal_01", "util_formula_01", "util_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 4. THEORY OF PRODUCTION
  {
    subject: "economics",
    topic: "Theory of Production",
    subtopic: "Production and Costs",
    title: "Production — How Goods Are Made",
    learning_objectives: [
      "Explain the concept of production and production function",
      "Understand the law of variable proportions",
      "Distinguish between short-run and long-run costs",
      "Analyze economies and diseconomies of scale",
    ],
    difficulty_level: "medium",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "prod_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "A company with 10 workers produces 100 shoes per day. With 20 workers, they produce 220 shoes. With 30 workers, they produce 300 shoes. What happened? Why didn't production triple when workers doubled? That's the law of diminishing returns — adding more of one input eventually gives smaller increases in output.",
          prediction_prompt: "If you add more workers to a small kitchen, will food production always increase proportionally?",
        },
      },
      {
        id: "prod_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Production is the process of converting inputs (raw materials, labour, capital) into outputs (goods and services). In the short run, at least one factor is fixed (like factory size). Adding more variable inputs (workers) to fixed inputs (factory) eventually leads to diminishing returns. In the long run, all factors are variable — you can build bigger factories.",
          analogy: "Think of a small kitchen. With 1 cook, production is slow. With 2 cooks, it doubles. With 3 cooks, it's crowded — they bump into each other. With 10 cooks, production might actually decrease! The kitchen (fixed factor) is too small for that many cooks (variable factor).",
        },
      },
      {
        id: "prod_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Production function: Q = f(L, K). Short run: at least one factor fixed. Long run: all factors variable. Law of Variable Proportions: as more units of a variable factor are added to fixed factors, marginal product eventually decreases. Stages: Increasing returns → Diminishing returns → Negative returns. Costs: Fixed (rent), Variable (materials), Total (FC + VC), Average (TC/Q), Marginal (ΔTC/ΔQ).",
          key_terms: [
            { term: "Production Function", definition: "Relationship between inputs and maximum output" },
            { term: "Marginal Product", definition: "Extra output from one more unit of variable input" },
            { term: "Economies of Scale", definition: "Cost advantages from increasing scale of production" },
            { term: "Diseconomies of Scale", definition: "Cost disadvantages from increasing scale too much" },
          ],
        },
      },
      {
        id: "prod_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "TC = FC + VC | AVC = VC/Q | ATC = TC/Q | MC = ΔTC/ΔQ",
          variables: [
            { name: "TC", description: "Total Cost" },
            { name: "FC", description: "Fixed Cost (doesn't change with output)" },
            { name: "VC", description: "Variable Cost (changes with output)" },
            { name: "ATC", description: "Average Total Cost per unit" },
            { name: "MC", description: "Marginal Cost — cost of producing one more unit" },
          ],
          when_to_use: "For analyzing production decisions: firms produce where MC = MR (marginal cost = marginal revenue).",
          common_traps: [
            "Confusing fixed and variable costs — fixed costs don't change with output",
            "Forgetting that MC eventually rises — due to diminishing returns",
            "Not understanding that economies of scale reduce ATC in the long run",
          ],
          units_note: "All cost figures are in naira. Output is in units.",
        },
      },
      {
        id: "prod_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "A firm's total cost is ₦5000 for 100 units and ₦5400 for 101 units. Calculate the marginal cost of the 101st unit.",
          given: ["TC(100) = ₦5000, TC(101) = ₦5400"],
          required: "Calculate MC",
          principle: "MC = ΔTC/ΔQ = change in total cost divided by change in quantity.",
          steps: [
            { explanation: "Find change in total cost", calculation: "ΔTC = ₦5400 − ₦5000 = ₦400" },
            { explanation: "Find change in quantity", calculation: "ΔQ = 101 − 100 = 1" },
            { explanation: "Calculate MC", calculation: "MC = ₦400/1 = ₦400" },
            { explanation: "Interpret", calculation: "The 101st unit costs ₦400 to produce" },
          ],
          answer: "The marginal cost of the 101st unit is ₦400.",
          check: "If the firm sells this unit for more than ₦400, it makes a profit on this unit.",
        },
      },
      {
        id: "prod_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Economies of scale always occur when a firm grows larger.",
          why_wrong: "Beyond a certain size, firms experience diseconomies of scale — coordination problems, bureaucracy, communication breakdowns increase costs.",
          correct_model: "Small firms may experience economies of scale (lower costs). Very large firms may experience diseconomies of scale (higher costs). There's an optimal size.",
        },
      },
      {
        id: "prod_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests production concepts, cost calculations, and economies of scale.",
          trap: "JAMB may ask about the relationship between MC and ATC. MC crosses ATC at its minimum point.",
          tip: "For cost questions, draw a table: Q, FC, VC, TC, ATC, MC. Fill in what you know and calculate the rest.",
          related_topics: ["Market structures", "Profit maximization", "Break-even analysis"],
        },
      },
      {
        id: "prod_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "TC = FC + VC. MC = ΔTC/ΔQ. MC cuts ATC at minimum. Economies of scale: bigger = cheaper (up to a point). Diminishing returns: more input, less extra output.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "prod_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why might a firm choose to produce at a loss in the short run rather than shut down?",
          expected_understanding: "If the firm covers its variable costs, it loses less by continuing to produce than by shutting down (where it still pays fixed costs). The firm only shuts down if price < average variable cost.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "Total cost equals:",
        options: [
          { label: "A", text: "Fixed cost + Variable cost" },
          { label: "B", text: "Fixed cost − Variable cost" },
          { label: "C", text: "Average cost × Quantity" },
          { label: "D", text: "Both A and C" },
        ],
        answer: "D",
        explanation: "TC = FC + VC. Also, TC = ATC × Q. Both formulas give the same result.",
        hints: ["TC can be calculated two ways"],
      },
      {
        difficulty: "medium",
        question: "Economies of scale occur when:",
        options: [
          { label: "A", text: "ATC increases as output increases" },
          { label: "B", text: "ATC decreases as output increases" },
          { label: "C", text: "MC exceeds ATC" },
          { label: "D", text: "Fixed costs increase" },
        ],
        answer: "B",
        explanation: "Economies of scale: as output increases, average cost per unit decreases.",
        hints: ["Scale up, costs down"],
      },
      {
        difficulty: "jamb",
        question: "A firm should shut down in the short run if:",
        options: [
          { label: "A", text: "It is making a loss" },
          { label: "B", text: "Price is less than average variable cost" },
          { label: "C", text: "Price is less than average total cost" },
          { label: "D", text: "Marginal cost exceeds marginal revenue" },
        ],
        answer: "B",
        explanation: "If P < AVC, the firm can't even cover variable costs — it loses more by producing than by shutting down.",
        hints: ["What must a firm cover to stay open?"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["prod_hook_01", "prod_intuitive_01", "prod_formal_01", "prod_formula_01", "prod_practice_01"],
    },
    version: 1,
    status: "published",
  },

  // 5. MARKET STRUCTURES
  {
    subject: "economics",
    topic: "Market Structures",
    subtopic: "Perfect and Imperfect Competition",
    title: "Market Structures — How Markets Are Organized",
    learning_objectives: [
      "Explain the features of perfect competition",
      "Analyze monopoly and its characteristics",
      "Understand monopolistic competition and oligopoly",
      "Compare different market structures",
    ],
    difficulty_level: "hard",
    estimated_minutes: 22,
    content_sections: [
      {
        id: "mkt_hook_01",
        type: "hook",
        order: 1,
        content: {
          text: "Why is there only one PHCN (electricity) in Nigeria but thousands of restaurants? Why are there 4 telecom companies but hundreds of phone accessory sellers? The answer lies in market structure — how many firms exist, how easy it is to enter the market, and how much control firms have over prices.",
          prediction_prompt: "What would happen if there was only one phone seller in Nigeria? How would prices compare to the current market?",
        },
      },
      {
        id: "mkt_intuitive_01",
        type: "intuitive_explanation",
        order: 2,
        content: {
          text: "Markets are organized by competition level. Perfect competition: many firms, identical products, no price control (like agricultural markets). Monopoly: one firm, unique product, total price control (like PHCN). Monopolistic competition: many firms, slightly different products, some price control (like restaurants). Oligopoly: few large firms, mutual interdependence (like telecoms).",
          analogy: "Think of market structures like a sports league. Perfect competition = local football — many teams, anyone can join, no one team dominates. Monopoly = one team controls the league. Oligopoly = 3-4 big teams dominate. Monopolistic = many teams, each with different styles.",
        },
      },
      {
        id: "mkt_formal_01",
        type: "formal_explanation",
        order: 3,
        content: {
          text: "Perfect Competition: many firms, homogeneous product, free entry/exit, perfect information, price takers. Monopoly: single firm, unique product, blocked entry, price maker. Monopolistic Competition: many firms, differentiated products, free entry, some price control. Oligopoly: few firms, identical or differentiated, barriers to entry, mutual interdependence.",
          key_terms: [
            { term: "Price Taker", definition: "A firm that cannot influence the market price — must accept the prevailing price" },
            { term: "Price Maker", definition: "A firm that can set its own price due to market power" },
            { term: "Barriers to Entry", definition: "Obstacles that prevent new firms from entering a market" },
            { term: "Product Differentiation", definition: "Making products appear different from competitors (branding, quality)" },
          ],
        },
      },
      {
        id: "mkt_formula_01",
        type: "formula",
        order: 4,
        content: {
          formula: "Profit Maximization: Produce where MC = MR. Profit = TR − TC = (P − ATC) × Q",
          variables: [
            { name: "MC", description: "Marginal Cost" },
            { name: "MR", description: "Marginal Revenue" },
            { name: "P", description: "Price" },
            { name: "ATC", description: "Average Total Cost" },
            { name: "Q", description: "Quantity produced" },
          ],
          when_to_use: "For any market structure, firms maximize profit by producing where MC = MR.",
          common_traps: [
            "Confusing revenue with profit — revenue is income, profit is revenue minus cost",
            "Forgetting that in perfect competition, P = MR (price taker)",
            "Not understanding that monopolies can set price but not quantity independently",
          ],
          units_note: "All monetary values in naira. Profit can be negative (loss).",
        },
      },
      {
        id: "mkt_practice_01",
        type: "worked_example",
        order: 5,
        content: {
          scenario: "Compare the long-run outcomes of perfect competition and monopoly in terms of price, output, and efficiency.",
          given: ["Two market structures to compare"],
          required: "Analyze differences in price, output, and efficiency",
          principle: "Perfect competition: P = MC (efficient). Monopoly: P > MC (inefficient).",
          steps: [
            { explanation: "Perfect competition long run", calculation: "P = MC = minimum ATC. Zero economic profit. Allocatively and productively efficient." },
            { explanation: "Monopoly long run", calculation: "P > MC > minimum ATC. Positive economic profit. Neither allocatively nor productively efficient." },
            { explanation: "Output comparison", calculation: "Monopoly produces less output than perfect competition (restricts output to raise price)" },
            { explanation: "Price comparison", calculation: "Monopoly charges higher price than perfect competition" },
          ],
          answer: "Perfect competition: lower price, higher output, efficient. Monopoly: higher price, lower output, inefficient. The monopoly's market power leads to deadweight loss.",
          check: "This is why governments regulate monopolies — to protect consumers from high prices and low output.",
        },
      },
      {
        id: "mkt_misconception_01",
        type: "common_misconception",
        order: 6,
        content: {
          mistake: "Monopolies are always bad for the economy.",
          why_wrong: "Natural monopolies (like utilities) can be more efficient than multiple competing firms. One pipe company serving a city is cheaper than five competing pipe companies laying parallel pipes.",
          correct_model: "Some monopolies are natural (high fixed costs make competition wasteful). The key is regulation — preventing abuse of monopoly power.",
        },
      },
      {
        id: "mkt_jamb_01",
        type: "jamb_insight",
        order: 7,
        content: {
          focus_area: "JAMB tests features of market structures, profit maximization, and efficiency comparisons.",
          trap: "JAMB may ask which market structure is 'most efficient.' Perfect competition is the benchmark for efficiency, but it's rare in reality.",
          tip: "For comparison questions, use a table: Feature | Perfect Competition | Monopoly | Monopolistic Competition | Oligopoly.",
          related_topics: ["Price discrimination", "Government regulation", "Anti-trust policy"],
        },
      },
      {
        id: "mkt_memory_01",
        type: "memory_hook",
        order: 8,
        content: {
          text: "Perfect Competition: many firms, price taker, P=MC. Monopoly: one firm, price maker, P>MC. Monopolistic: many firms, differentiated products. Oligopoly: few firms, interdependent.",
          hook_type: "mnemonic",
        },
      },
      {
        id: "mkt_reflection_01",
        type: "reflection",
        order: 9,
        content: {
          question: "Why do telecom companies in Nigeria charge similar prices even though there are 4 competitors?",
          expected_understanding: "This is oligopolistic behavior — firms are interdependent. If one lowers prices, others follow (price war). So they maintain similar prices. This is called price leadership or tacit collusion.",
        },
      },
    ],
    practice_questions: [
      {
        difficulty: "easy",
        question: "A market with only one seller is called:",
        options: [
          { label: "A", text: "Perfect competition" },
          { label: "B", text: "Monopoly" },
          { label: "C", text: "Oligopoly" },
          { label: "D", text: "Monopolistic competition" },
        ],
        answer: "B",
        explanation: "A monopoly is a market structure with a single seller of a unique product.",
        hints: ["Mono = one"],
      },
      {
        difficulty: "medium",
        question: "In perfect competition, firms are:",
        options: [
          { label: "A", text: "Price makers" },
          { label: "B", text: "Price takers" },
          { label: "C", text: "Price regulators" },
          { label: "D", text: "Price leaders" },
        ],
        answer: "B",
        explanation: "In perfect competition, firms have no market power — they must accept the market price.",
        hints: ["Many firms, identical products = no pricing power"],
      },
      {
        difficulty: "jamb",
        question: "A monopolist maximizes profit by producing where:",
        options: [
          { label: "A", text: "P = ATC" },
          { label: "B", text: "MC = MR" },
          { label: "C", text: "P = MC" },
          { label: "D", text: "ATC = MR" },
        ],
        answer: "B",
        explanation: "All profit-maximizing firms produce where MC = MR, including monopolies.",
        hints: ["This rule applies to ALL market structures"],
      },
    ],
    mastery_criteria: {
      min_score: 80,
      required_sections: ["mkt_hook_01", "mkt_intuitive_01", "mkt_formal_01", "mkt_formula_01", "mkt_practice_01"],
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
