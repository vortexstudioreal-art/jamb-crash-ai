import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS: any[] = [
  {
    subject: "commerce",
    topic: "Basis of Commerce",
    subtopic: "Introduction",
    title: "Commerce — Buying, Selling, and Everything in Between",
    learning_objectives: [
      "Define commerce and its scope",
      "Distinguish between trade and aid to trade",
      "Explain the importance of commerce to economic development",
      "Identify the branches of commerce",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "com_hook_01", type: "hook", order: 1, content: { text: "Every time you buy airtime, pay school fees, or buy groceries, you're participating in commerce. Commerce is the engine that moves goods from producers to consumers. Without it, farmers couldn't sell their crops, and you couldn't buy the things you need.", prediction_prompt: "What would happen if there were no shops, banks, or transport companies?" } },
      { id: "com_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Commerce = Trade + Aids to Trade. Trade is the actual buying and selling. Aids to trade are the services that help trade happen: banking (finance), insurance (risk protection), transport (moving goods), warehousing (storing goods), advertising (informing buyers), and communication (connecting people).", analogy: "Think of commerce like a football team. Trade is the players scoring goals. Aids to trade are the goalkeeper, coach, referee, and supporters — they make the game possible but aren't the main event." } },
      { id: "com_formal_01", type: "formal_explanation", order: 3, content: { text: "Branches of commerce: (1) Trade — buying and selling. Domestic trade (within country). International trade (between countries). (2) Aids to trade — banking, insurance, transport, warehousing, advertising, communication. Commerce promotes specialization, creates employment, raises living standards, and generates government revenue.", key_terms: [{ term: "Commerce", definition: "All activities involved in buying, selling, and distributing goods and services" }, { term: "Trade", definition: "The buying and selling of goods and services" }, { term: "Aids to Trade", definition: "Services that facilitate trade: banking, insurance, transport, etc." }, { term: "Middleman", definition: "An intermediary between producer and consumer (wholesaler, retailer)" }] } },
      { id: "com_formula_01", type: "formula", order: 4, content: { formula: "Commerce = Trade (Buying + Selling) + Aids to Trade (Banking + Insurance + Transport + Warehousing + Advertising + Communication)", variables: [{ name: "Domestic Trade", description: "Trade within a country (wholesale and retail)" }, { name: "International Trade", description: "Trade between countries (import and export)" }, { name: "Aids to Trade", description: "Services that support trade activities" }], when_to_use: "When classifying commercial activities or understanding the scope of commerce.", common_traps: ["Confusing trade with commerce — commerce is broader, includes aids to trade", "Not knowing all six aids to trade", "Confusing domestic and international trade"], units_note: "Commerce accounts for a significant portion of GDP in most economies." } },
      { id: "com_practice_01", type: "worked_example", order: 5, content: { scenario: "A farmer grows tomatoes in Kano. A wholesaler buys them, a truck transports them to Lagos, a warehouse stores them, a retailer sells them to consumers, and a bank finances the transaction. Identify the commercial activities involved.", given: ["A supply chain from farmer to consumer"], required: "Identify trade and aids to trade", principle: "Trade = buying/selling. Aids = services that help trade happen.", steps: [{ explanation: "Trade", calculation: "Farmer sells to wholesaler (buying). Wholesaler sells to retailer (selling). Retailer sells to consumer (selling)." }, { explanation: "Aids to Trade", calculation: "Transport (truck moves goods), Warehousing (storing tomatoes), Banking (financing the transaction)" }], answer: "Trade: farmer → wholesaler → retailer → consumer. Aids: transport, warehousing, banking.", check: "Each step in the chain involves both trade and aids to trade." } },
      { id: "com_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Commerce is the same as trade.", why_wrong: "Commerce is broader. Trade is just buying and selling. Commerce includes all the services that make trade possible (banking, transport, insurance, etc.).", correct_model: "Commerce = Trade + Aids to Trade. Trade is a subset of commerce." } },
      { id: "com_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests the definition and branches of commerce, and the role of aids to trade.", trap: "JAMB may list activities and ask which is an aid to trade vs. which is trade. Know the difference.", tip: "Remember: Trade = direct buying/selling. Aids to trade = everything else that helps trade happen.", related_topics: ["International trade", "Banking", "Insurance", "Transport"] } },
      { id: "com_memory_01", type: "memory_hook", order: 8, content: { text: "Commerce = Trade + Aids. Trade = buying + selling. Aids = BANKIT: Banking, Advertising, Navigation (transport), Communication, Insurance, Transport, Warehousing.", hook_type: "mnemonic" } },
      { id: "com_reflection_01", type: "reflection", order: 9, content: { question: "How does commerce contribute to national development?", expected_understanding: "Commerce creates jobs, generates tax revenue, connects producers with consumers, improves living standards, and promotes economic growth." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "Commerce includes:", options: [{ label: "A", text: "Only buying and selling" }, { label: "B", text: "Trade and aids to trade" }, { label: "C", text: "Only banking" }, { label: "D", text: "Only transport" }], answer: "B", explanation: "Commerce = Trade + Aids to Trade (banking, insurance, transport, etc.).", hints: ["Commerce is broader than just trade"] },
      { difficulty: "medium", question: "Which of the following is an aid to trade?", options: [{ label: "A", text: "Selling goods" }, { label: "B", text: "Buying goods" }, { label: "C", text: "Warehousing" }, { label: "D", text: "Manufacturing" }], answer: "C", explanation: "Warehousing stores goods until they're needed — it aids trade but isn't trade itself.", hints: ["Which helps trade happen without being buying/selling?"] },
      { difficulty: "jamb", question: "The intermediary between the producer and the final consumer is called:", options: [{ label: "A", text: "Producer" }, { label: "B", text: "Middleman" }, { label: "C", text: "Consumer" }, { label: "D", text: "Manufacturer" }], answer: "B", explanation: "A middleman (wholesaler or retailer) sits between the producer and consumer.", hints: ["Who is in the middle of the supply chain?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["com_hook_01", "com_intuitive_01", "com_formal_01", "com_formula_01", "com_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "commerce",
    topic: "Trade — Domestic and International",
    subtopic: "Exchange of Goods",
    title: "Trade — How Goods Move Across Borders",
    learning_objectives: [
      "Distinguish between domestic and international trade",
      "Explain the balance of trade and balance of payments",
      "Identify types of international trade barriers",
      "Understand the role of ECOWAS and AU in African trade",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "trd_hook_01", type: "hook", order: 1, content: { text: "Nigeria imports cars from Japan, rice from India, and electronics from China. It exports crude oil to Europe and cocoa to the Americas. International trade connects every country to the global economy. But what happens when a country imports more than it exports?", prediction_prompt: "If Nigeria stopped importing rice, what would happen to the price of rice locally?" } },
      { id: "trd_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Domestic trade = buying and selling within a country. International trade = buying and selling between countries. Balance of trade = value of exports minus imports. Surplus = exports > imports. Deficit = imports > exports. Nigeria has a trade deficit in most goods but a surplus in oil.", analogy: "Think of international trade like a family budget. If you earn ₦100 and spend ₦120, you're in deficit — you need to borrow or sell something. Countries face the same problem when they import more than they export." } },
      { id: "trd_formal_01", type: "formal_explanation", order: 3, content: { text: "International trade barriers: (1) Tariffs — taxes on imports. (2) Quotas — limits on import quantities. (3) Embargoes — complete bans on trade. (4) Exchange controls — restrictions on currency conversion. Regional trade: ECOWAS (Economic Community of West African States) promotes free trade in West Africa. AU (African Union) promotes continental trade through AfCFTA.", key_terms: [{ term: "Balance of Trade", definition: "Value of exports minus value of imports" }, { term: "Tariff", definition: "Tax imposed on imported goods" }, { term: "Embargo", definition: "Complete ban on trade with a country" }, { term: "ECOWAS", definition: "Economic Community of West African States — promotes regional trade" }, { term: "AfCFTA", definition: "African Continental Free Trade Area — world's largest free trade area by number of countries" }] } },
      { id: "trd_formula_01", type: "formula", order: 4, content: { formula: "Balance of Trade = Total Exports − Total Imports. Trade Surplus: Exports > Imports. Trade Deficit: Imports > Exports", variables: [{ name: "Exports", description: "Goods sold to other countries" }, { name: "Imports", description: "Goods bought from other countries" }, { name: "Visible Trade", description: "Trade in physical goods (oil, rice, cars)" }, { name: "Invisible Trade", description: "Trade in services (banking, tourism, consulting)" }], when_to_use: "When analyzing a country's trade position or the effect of trade policies.", common_traps: ["Confusing balance of trade with balance of payments", "Not knowing the difference between visible and invisible trade", "Forgetting that tariffs make imports more expensive"], units_note: "Trade balance is usually measured in USD or the country's currency." } },
      { id: "trd_practice_01", type: "worked_example", order: 5, content: { scenario: "Nigeria's total exports in a year are $50 billion and total imports are $65 billion. Calculate the balance of trade and state whether it's a surplus or deficit.", given: ["Exports: $50 billion", "Imports: $65 billion"], required: "Calculate balance of trade", principle: "Balance of Trade = Exports − Imports", steps: [{ explanation: "Calculate", calculation: "$50B − $65B = −$15B" }, { explanation: "Interpret", calculation: "Negative result means imports exceed exports = trade deficit" }], answer: "Balance of trade is −$15 billion (trade deficit of $15 billion).", check: "Imports ($65B) exceed exports ($50B) by $15B." } },
      { id: "trd_misconception_01", type: "common_misconception", order: 6, content: { mistake: "A trade deficit is always bad.", why_wrong: "A deficit means the country is buying more than it sells. This can be financed by borrowing or foreign investment. Some deficits are necessary for development (importing machinery).", correct_model: "A trade deficit isn't always bad — it depends on what's being imported and how it's financed." } },
      { id: "trd_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests trade balance, trade barriers, and regional trade organizations.", trap: "JAMB may give trade data and ask you to calculate the balance and explain whether it's a surplus or deficit.", tip: "Know ECOWAS and AU trade policies. Know the difference between tariffs, quotas, and embargoes.", related_topics: ["Exchange rates", "Balance of payments", "Economic integration"] } },
      { id: "trd_memory_01", type: "memory_hook", order: 8, content: { text: "Domestic = within country. International = between countries. Balance = Exports − Imports. Surplus = good (earn more). Deficit = bad (spend more). Barriers: tariffs, quotas, embargoes.", hook_type: "mnemonic" } },
      { id: "trd_reflection_01", type: "reflection", order: 9, content: { question: "How can Nigeria reduce its trade deficit?", expected_understanding: "Export more (diversify beyond oil), import less (produce locally), invest in manufacturing, and support agricultural exports." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "When a country's exports exceed its imports, it has:", options: [{ label: "A", text: "Trade deficit" }, { label: "B", text: "Trade surplus" }, { label: "C", text: "Balance of payments deficit" }, { label: "D", text: "Inflation" }], answer: "B", explanation: "Trade surplus = exports > imports.", hints: ["More going out (earning) than coming in (spending)"] },
      { difficulty: "medium", question: "A tariff on imported goods will:", options: [{ label: "A", text: "Make imports cheaper" }, { label: "B", text: "Make imports more expensive" }, { label: "C", text: "Increase imports" }, { label: "D", text: "Have no effect" }], answer: "B", explanation: "A tariff is a tax on imports, making them more expensive and reducing demand.", hints: ["What does a tax do to price?"] },
      { difficulty: "jamb", question: "ECOWAS promotes:", options: [{ label: "A", text: "Trade barriers between member states" }, { label: "B", text: "Free movement of goods and people in West Africa" }, { label: "C", text: "Increased tariffs" }, { label: "D", text: "Trade restriction" }], answer: "B", explanation: "ECOWAS aims to promote free trade and free movement of persons in West Africa.", hints: ["What does ECOWAS stand for and what does it do?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["trd_hook_01", "trd_intuitive_01", "trd_formal_01", "trd_formula_01", "trd_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "commerce",
    topic: "Business Finance",
    subtopic: "Sources and Use of Funds",
    title: "Business Finance — Where Money Comes From and Where It Goes",
    learning_objectives: [
      "Identify sources of business finance (short-term and long-term)",
      "Explain the difference between debt and equity financing",
      "Understand the role of banks in business financing",
      "Evaluate the advantages and disadvantages of different financing methods",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "fin_hook_01", type: "hook", order: 1, content: { text: "You want to start a phone accessories business. You need ₦500,000 for stock, rent, and equipment. Where will you get the money? Your savings? A bank loan? A friend? Each option has pros and cons. This is the challenge every business owner faces — finding the right finance.", prediction_prompt: "If you needed money to start a business, would you borrow from a bank or use your own savings? Why?" } },
      { id: "fin_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Sources of finance: Short-term (under 1 year): trade credit, bank overdraft, short-term loans. Long-term (over 1 year): bank loans, shares (equity), debentures, retained profits, government grants. Debt = borrowing money (must repay with interest). Equity = selling ownership (must share profits).", analogy: "Think of financing like building a house. You can borrow money from the bank (debt) — you must pay it back with interest. Or you can invite someone to co-own the house (equity) — they share in the profits and losses. Each has trade-offs." } },
      { id: "fin_formal_01", type: "formal_explanation", order: 3, content: { text: "Debt financing: bank loans, overdrafts, debentures, bonds. Advantages: don't give up ownership, interest is tax-deductible. Disadvantages: must repay with interest, collateral may be required. Equity financing: shares, retained profits, venture capital. Advantages: no repayment obligation, shared risk. Disadvantages: dilute ownership, must share profits.", key_terms: [{ term: "Debt Finance", definition: "Borrowing money that must be repaid with interest" }, { term: "Equity Finance", definition: "Raising money by selling ownership shares in the business" }, { term: "Debenture", definition: "A long-term loan certificate, usually with fixed interest" }, { term: "Retained Profits", definition: "Net profit kept in the business rather than distributed as dividends" }, { term: "Overdraft", definition: "A bank facility allowing you to withdraw more than your account balance (short-term)" }] } },
      { id: "fin_formula_01", type: "formula", order: 4, content: { formula: "Total Capital = Debt + Equity. Cost of Debt = Interest rate × (1 − Tax rate). Cost of Equity = Dividends / Share price", variables: [{ name: "Debt", description: "Borrowed funds (loans, debentures, bonds)" }, { name: "Equity", description: "Owner's funds (shares, retained profits)" }, { name: "Interest Rate", description: "Annual cost of borrowing" }, { name: "Dividends", description: "Share of profit paid to shareholders" }], when_to_use: "When deciding how to finance a business or investment.", common_traps: ["Not considering the cost of each financing method", "Forgetting that debt requires collateral", "Confusing short-term and long-term finance"], units_note: "Debt interest is tax-deductible; dividends are not." } },
      { id: "fin_practice_01", type: "worked_example", order: 5, content: { scenario: "A business needs ₦2,000,000. It can borrow at 15% interest or sell 40% ownership to an investor. The business expects ₦500,000 profit. Which option is better?", given: ["Capital needed: ₦2,000,000", "Bank loan: 15% interest", "Investor: 40% ownership", "Expected profit: ₦500,000"], required: "Compare the two financing options", principle: "Calculate the cost of each option.", steps: [{ explanation: "Bank loan cost", calculation: "₦2,000,000 × 15% = ₦300,000 interest per year" }, { explanation: "Investor cost", calculation: "₦500,000 × 40% = ₦200,000 share of profit" }, { explanation: "Compare", calculation: "Bank: ₦300,000 (must pay regardless of profit). Investor: ₦200,000 (only if profitable), but gives up 40% ownership permanently." }], answer: "Bank loan costs ₦300,000/year. Investor costs ₦200,000/year but dilutes ownership. Bank loan is simpler if business can afford payments.", check: "The investor option is cheaper but you lose 40% of future profits." } },
      { id: "fin_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Debt financing is always better than equity.", why_wrong: "Debt must be repaid with interest regardless of profit. Equity doesn't require repayment but dilutes ownership. The best choice depends on the business situation.", correct_model: "Neither is always better. Debt = cheaper but riskier (must repay). Equity = safer but more expensive long-term (sharing profits)." } },
      { id: "fin_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests sources of finance, advantages/disadvantages of debt vs equity.", trap: "JAMB may ask about specific Nigerian financing: Bank of Industry loans, SMEDAN, CBN intervention funds.", tip: "Know the advantages and disadvantages of each financing method. Practice comparing options.", related_topics: ["Banking", "Investment", "Business planning"] } },
      { id: "fin_memory_01", type: "memory_hook", order: 8, content: { text: "Debt = borrow (must repay with interest). Equity = sell ownership (share profits). Short-term: overdraft, trade credit. Long-term: loans, shares, retained profits.", hook_type: "mnemonic" } },
      { id: "fin_reflection_01", type: "reflection", order: 9, content: { question: "A friend asks you to invest in their business. What factors would you consider before deciding?", expected_understanding: "Profitability, risk, expected return, ownership share, exit strategy, and trust in the friend's ability to run the business." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "Raising money by selling shares is called:", options: [{ label: "A", text: "Debt financing" }, { label: "B", text: "Equity financing" }, { label: "C", text: "Trade credit" }, { label: "D", text: "Overdraft" }], answer: "B", explanation: "Selling shares = equity financing. You're selling ownership in the business.", hints: ["Shares represent ownership"] },
      { difficulty: "medium", question: "An advantage of debt financing over equity is:", options: [{ label: "A", text: "No need to repay" }, { label: "B", text: "The owner retains full ownership" }, { label: "C", text: "Interest is not tax-deductible" }, { label: "D", text: "There is no risk" }], answer: "B", explanation: "With debt, you don't give up ownership. With equity, you share ownership with shareholders.", hints: ["What does the owner keep with debt?"] },
      { difficulty: "jamb", question: "A bank overdraft is a source of:", options: [{ label: "A", text: "Long-term finance" }, { label: "B", text: "Short-term finance" }, { label: "C", text: "Equity finance" }, { label: "D", text: "Government grants" }], answer: "B", explanation: "An overdraft is a short-term facility allowing you to withdraw more than your balance.", hints: ["How long does an overdraft last?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["fin_hook_01", "fin_intuitive_01", "fin_formal_01", "fin_formula_01", "fin_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "commerce",
    topic: "Marketing",
    subtopic: "The 4 Ps of Marketing",
    title: "Marketing — Getting the Right Product to the Right People",
    learning_objectives: [
      "Define marketing and its importance",
      "Explain the marketing mix (4 Ps)",
      "Distinguish between marketing and selling",
      "Understand market research and its methods",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "mkt_hook_01", type: "hook", order: 1, content: { text: "Why do you prefer Coke to Pepsi, or iPhone to Samsung? Is it the taste, the price, the adverts, or the brand image? That's marketing at work. Marketing isn't just advertising — it's everything that makes a product desirable, from design to price to distribution.", prediction_prompt: "What makes you choose one brand over another, even when they're similar?" } },
      { id: "mkt_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Marketing = identifying customer needs and satisfying them profitably. The 4 Ps: Product (what you sell), Price (how much you charge), Place (where customers buy it), Promotion (how you inform and persuade). Marketing starts before the product is made — it identifies what people want.", analogy: "Think of marketing like planning a party. You need the right food (product), at the right price, in the right location, and you need to invite people and make them excited to come (promotion). If any element is wrong, the party fails." } },
      { id: "mkt_formal_01", type: "formal_explanation", order: 3, content: { text: "Marketing mix (4 Ps): (1) Product — design, quality, features, packaging, branding. (2) Price — pricing strategies (penetration, skimming, competitive). (3) Place — distribution channels (direct, wholesale, retail, online). (4) Promotion — advertising, sales promotion, personal selling, public relations. Market research: gathering information about customers, competitors, and market trends.", key_terms: [{ term: "Marketing", definition: "The process of identifying, anticipating, and satisfying customer needs profitably" }, { term: "Marketing Mix", definition: "The 4 Ps: Product, Price, Place, Promotion" }, { term: "Market Research", definition: "Systematic collection and analysis of data about a market" }, { term: "Target Market", definition: "The specific group of customers a business aims to serve" }] } },
      { id: "mkt_formula_01", type: "formula", order: 4, content: { formula: "Marketing = Product + Price + Place + Promotion. Revenue = Price × Quantity Sold. Marketing ROI = (Revenue from Marketing − Marketing Cost) / Marketing Cost × 100", variables: [{ name: "Product", description: "What you sell — must meet customer needs" }, { name: "Price", description: "Must be acceptable to customers and profitable for the business" }, { name: "Place", description: "Where and how customers access the product" }, { name: "Promotion", description: "How you communicate with and persuade customers" }], when_to_use: "When developing a marketing strategy or evaluating a product launch.", common_traps: ["Confusing marketing with advertising — marketing is broader", "Setting price without considering costs and competition", "Ignoring the 'Place' element — distribution matters"], units_note: "Marketing budgets typically range from 5-15% of revenue, depending on industry." } },
      { id: "mkt_practice_01", type: "worked_example", order: 5, content: { scenario: "A company is launching a new energy drink in Nigeria. Apply the 4 Ps to develop a marketing strategy.", given: ["Product: energy drink", "Target: young adults aged 18-35"], required: "Apply the marketing mix", principle: "Each P must be designed to meet the target market's needs.", steps: [{ explanation: "Product", calculation: "Tropical flavours (zobo, ginger), energy-boosting, attractive can design, 500ml size" }, { explanation: "Price", calculation: "₦300-₦500 (competitive with existing brands, affordable for students)" }, { explanation: "Place", calculation: "Universaries, gyms, filling stations, supermarkets, online delivery" }, { explanation: "Promotion", calculation: "Social media influencers, campus events, sponsorship of football matches, radio jingles" }], answer: "Product: locally-flavoured energy drink. Price: ₦300-₦500. Place: universities, gyms, online. Promotion: influencers, campus events, radio.", check: "All 4 Ps align with the target market of young adults." } },
      { id: "mkt_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Marketing is the same as advertising.", why_wrong: "Advertising is just one part of promotion, which is just one part of the marketing mix. Marketing includes product design, pricing, distribution, AND promotion.", correct_model: "Marketing = Product + Price + Place + Promotion. Advertising is a subset of Promotion." } },
      { id: "mkt_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests the 4 Ps, market research methods, and marketing strategies.", trap: "JAMB may give a scenario and ask you to apply the marketing mix. Be specific — use Nigerian examples.", tip: "For essay questions, always apply the 4 Ps to the specific product/service. Don't just define them.", related_topics: ["Consumer behaviour", "Branding", "Distribution channels"] } },
      { id: "mkt_memory_01", type: "memory_hook", order: 8, content: { text: "Marketing Mix = 4 Ps: Product (what), Price (how much), Place (where), Promotion (how to tell). Marketing ≠ advertising — it's everything from design to distribution.", hook_type: "mnemonic" } },
      { id: "mkt_reflection_01", type: "reflection", order: 9, content: { question: "Why is market research important before launching a new product?", expected_understanding: "It helps understand customer needs, identify competitors, set the right price, and choose the best distribution channels. Without research, you risk launching a product nobody wants." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "The marketing mix consists of:", options: [{ label: "A", text: "Product, Price, Place, Promotion" }, { label: "B", text: "People, Process, Physical evidence" }, { label: "C", text: "Sales, Advertising, PR" }, { label: "D", text: "Production, Distribution, Consumption" }], answer: "A", explanation: "The 4 Ps are Product, Price, Place, and Promotion.", hints: ["The classic marketing framework"] },
      { difficulty: "medium", question: "Penetration pricing means:", options: [{ label: "A", text: "Setting a high initial price" }, { label: "B", text: "Setting a low price to enter the market" }, { label: "C", text: "Setting price based on costs" }, { label: "D", text: "Matching competitors' prices" }], answer: "B", explanation: "Penetration pricing = low initial price to attract customers and gain market share quickly.", hints: ["How do you 'penetrate' a new market?"] },
      { difficulty: "jamb", question: "Market research is important because it helps a business:", options: [{ label: "A", text: "Avoid paying taxes" }, { label: "B", text: "Understand customer needs and make better decisions" }, { label: "C", text: "Reduce production costs" }, { label: "D", text: "Increase the number of employees" }], answer: "B", explanation: "Market research provides information about customers, competitors, and trends to guide business decisions.", hints: ["What does research help you know?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["mkt_hook_01", "mkt_intuitive_01", "mkt_formal_01", "mkt_formula_01", "mkt_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "commerce",
    topic: "Insurance",
    subtopic: "Principles and Types",
    title: "Insurance — Spreading the Risk",
    learning_objectives: [
      "Define insurance and its purpose",
      "Explain the principles of insurance",
      "Identify types of insurance",
      "Calculate basic insurance premiums",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "ins_hook_01", type: "hook", order: 1, content: { text: "Your phone worth ₦200,000 falls and cracks the screen. Repair costs ₦50,000. If you had phone insurance for ₦5,000/year, the insurance company would pay the repair. Insurance is paying a small amount regularly to protect against a large unexpected loss.", prediction_prompt: "Would you pay ₦5,000 per year to protect your ₦200,000 phone? Why or why not?" } },
      { id: "ins_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Insurance is a contract where one party (insurer) promises to compensate another party (insured) for a specified loss, in exchange for a premium. The principle: many people pay small premiums into a pool. When one person suffers a loss, they're compensated from the pool. This spreads the risk.", analogy: "Think of insurance like an umbrella shared by many people on a rainy day. Everyone contributes a little to buy the umbrella. When it rains, anyone under the umbrella is protected. If it doesn't rain, you've lost your small contribution — but you're safe." } },
      { id: "ins_formal_01", type: "formal_explanation", order: 3, content: { text: "Principles of insurance: (1) Utmost good faith — both parties must be honest. (2) Insurable interest — you must suffer financially from the loss. (3) Indemnity — compensation restores you to your pre-loss position (no profit). (4) Proximate cause — the nearest cause of loss must be covered. (5) Contribution — if multiple policies, each pays its share.", key_terms: [{ term: "Premium", definition: "The amount paid by the insured to the insurer for coverage" }, { term: "Indemnity", definition: "Compensation that restores the insured to their pre-loss position" }, { term: "Policy", definition: "The insurance contract" }, { term: "Claim", definition: "A request for compensation when a loss occurs" }, { term: "Underwriting", definition: "The process of evaluating risk and setting premium rates" }] } },
      { id: "ins_formula_01", type: "formula", order: 4, content: { formula: "Premium = Sum Insured × Rate. Claim Settlement = Loss Amount (up to sum insured)", variables: [{ name: "Sum Insured", description: "Maximum amount the insurer will pay" }, { name: "Premium Rate", description: "Percentage of sum insured charged as premium" }, { name: "Deductible", description: "Amount the insured must pay before the insurer pays" }], when_to_use: "When calculating insurance costs or understanding claim settlements.", common_traps: ["Expecting to profit from insurance — indemnity means no profit", "Not reading the policy exclusions", "Underinsuring to save on premiums — you'll be undercompensated"], units_note: "Premium is usually paid monthly, quarterly, or annually." } },
      { id: "ins_practice_01", type: "worked_example", order: 5, content: { scenario: "A shop owner insures goods worth ₦1,000,000 at a premium rate of 2%. Halfway through the year, goods worth ₦200,000 are destroyed by fire. How much will the insurance company pay?", given: ["Sum insured: ₦1,000,000", "Premium rate: 2%", "Loss: ₦200,000"], required: "Calculate premium and claim amount", principle: "Premium = Sum Insured × Rate. Claim = Loss amount (up to sum insured).", steps: [{ explanation: "Calculate premium", calculation: "₦1,000,000 × 2% = ₦20,000 per year" }, { explanation: "Calculate claim", calculation: "₦200,000 loss — insurer pays ₦200,000 (up to sum insured)" }], answer: "Premium: ₦20,000/year. Claim: ₦200,000 paid by insurer.", check: "The claim (₦200,000) is within the sum insured (₦1,000,000), so the full loss is covered." } },
      { id: "ins_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Insurance is a savings account — you get back what you pay.", why_wrong: "Insurance is not savings. If you don't suffer a loss, you don't get your premiums back. You're paying for protection, not saving money.", correct_model: "Insurance = protection against loss, not a savings plan. You pay premiums for peace of mind. If no loss, you've paid for nothing — but you were protected." } },
      { id: "ins_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests principles of insurance, types of insurance, and premium calculations.", trap: "JAMB may ask about utmost good faith, insurable interest, or indemnity. Know all the principles.", tip: "For calculations: Premium = Sum Insured × Rate. For essay questions: explain principles with examples.", related_topics: ["Risk management", "Banking", "Investment"] } },
      { id: "ins_memory_01", type: "memory_hook", order: 8, content: { text: "Insurance = spread risk. Principles: good faith, insurable interest, indemnity, proximate cause, contribution. Premium = Sum Insured × Rate. No profit from insurance.", hook_type: "mnemonic" } },
      { id: "ins_reflection_01", type: "reflection", order: 9, content: { question: "Why do many Nigerians not buy insurance?", expected_understanding: "Lack of trust, low awareness, religious/cultural beliefs ('it won't happen to me'), cost, and poor claim settlement history by insurance companies." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "The amount paid by the insured to the insurer is called:", options: [{ label: "A", text: "Claim" }, { label: "B", text: "Premium" }, { label: "C", text: "Sum insured" }, { label: "D", text: "Deductible" }], answer: "B", explanation: "The premium is the regular payment made by the insured for insurance coverage.", hints: ["What do you pay to keep insurance active?"] },
      { difficulty: "medium", question: "The principle of indemnity means:", options: [{ label: "A", text: "The insured profits from a claim" }, { label: "B", text: "The insured is restored to pre-loss position" }, { label: "C", text: "The insurer pays regardless of loss" }, { label: "D", text: "Premiums are refunded" }], answer: "B", explanation: "Indemnity means compensation restores you to your pre-loss position — you don't profit from insurance.", hints: ["What does 'restore to pre-loss' mean?"] },
      { difficulty: "jamb", question: "A person has insurable interest in a property if:", options: [{ label: "A", text: "They own it" }, { label: "B", text: "They would suffer financially from its loss" }, { label: "C", text: "They live near it" }, { label: "D", text: "They admire it" }], answer: "B", explanation: "Insurable interest means you must suffer a financial loss if the property is damaged or destroyed.", hints: ["What must you lose for insurance to pay?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["ins_hook_01", "ins_intuitive_01", "ins_formal_01", "ins_formula_01", "ins_practice_01"] },
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
