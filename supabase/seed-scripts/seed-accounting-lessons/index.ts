import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LESSONS: any[] = [
  {
    subject: "accounting",
    topic: "Introduction to Accounting",
    subtopic: "Fundamentals",
    title: "Accounting — The Language of Business",
    learning_objectives: [
      "Define accounting and its purpose",
      "Identify the users of accounting information",
      "Explain the basic accounting equation",
      "Distinguish between bookkeeping and accounting",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "act_hook_01", type: "hook", order: 1, content: { text: "Every business — from a small shop in the market to a multinational corporation — needs to track money coming in and going out. Accounting is the system that records, summarizes, and reports financial transactions. Without it, businesses would be flying blind.", prediction_prompt: "Why do you think even small traders need to keep track of their money?" } },
      { id: "act_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Accounting is like keeping a diary of money. Every time money comes in (revenue) or goes out (expenses), you write it down. At the end of the month, you check: did I make a profit or a loss? The basic rule: what you own (assets) = what you owe (liabilities) + your investment (equity).", analogy: "Think of accounting like a health tracker. Just as a fitness app tracks your calories in vs calories out, accounting tracks money in vs money out. The result tells you if your business is 'healthy' (profitable) or 'sick' (losing money)." } },
      { id: "act_formal_01", type: "formal_explanation", order: 3, content: { text: "Accounting principles: (1) Going Concern — business will continue operating. (2) Consistency — use same methods year to year. (3) Accrual — record when earned/incurred, not when cash moves. (4) Prudence — don't overstate assets or income. Users of accounting: internal (management, employees) and external (investors, government, creditors).", key_terms: [{ term: "Assets", definition: "Resources owned by the business (cash, equipment, inventory)" }, { term: "Liabilities", definition: "Debts or obligations the business owes (loans, payables)" }, { term: "Equity", definition: "Owner's claim on assets (capital + retained earnings)" }, { term: "Revenue", definition: "Income earned from selling goods or services" }, { term: "Expenses", definition: "Costs incurred to generate revenue" }] } },
      { id: "act_formula_01", type: "formula", order: 4, content: { formula: "Assets = Liabilities + Owner's Equity (Accounting Equation)", variables: [{ name: "Assets", description: "What the business owns (cash, inventory, equipment)" }, { name: "Liabilities", description: "What the business owes (loans, accounts payable)" }, { name: "Equity", description: "Owner's investment in the business (capital)" }], when_to_use: "This equation must always balance. Every transaction affects at least two accounts.", common_traps: ["Confusing assets with expenses — assets are owned, expenses are spent", "Forgetting the accounting equation must always balance", "Not understanding that profit increases equity"], units_note: "The accounting equation is the foundation of double-entry bookkeeping." } },
      { id: "act_practice_01", type: "worked_example", order: 5, content: { scenario: "A business starts with ₦500,000 cash. It buys equipment for ₦200,000 cash. It takes a loan of ₦100,000. What are the assets, liabilities, and equity?", given: ["Starting cash: ₦500,000", "Equipment purchased: ₦200,000", "Loan: ₦100,000"], required: "Calculate total assets, liabilities, and equity", principle: "Apply the accounting equation: Assets = Liabilities + Equity", steps: [{ explanation: "Calculate assets", calculation: "Cash: ₦500,000 − ₦200,000 + ₦100,000 = ₦400,000. Equipment: ₦200,000. Total assets: ₦600,000" }, { explanation: "Identify liabilities", calculation: "Loan: ₦100,000" }, { explanation: "Calculate equity", calculation: "Equity = Assets − Liabilities = ₦600,000 − ₦100,000 = ₦500,000" }, { explanation: "Verify equation", calculation: "₦600,000 = ₦100,000 + ₦500,000 ✓" }], answer: "Assets: ₦600,000. Liabilities: ₦100,000. Equity: ₦500,000.", check: "The equation balances: ₦600,000 = ₦100,000 + ₦500,000." } },
      { id: "act_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Bookkeeping and accounting are the same thing.", why_wrong: "Bookkeeping is recording transactions. Accounting goes further — it analyzes, interprets, and reports financial information for decision-making.", correct_model: "Bookkeeping = recording. Accounting = recording + analyzing + reporting + decision-making." } },
      { id: "act_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests accounting equation, types of accounts, and accounting principles.", trap: "JAMB may ask about the difference between capital expenditure and revenue expenditure. Capital = long-term assets. Revenue = day-to-day expenses.", tip: "Memorize the accounting equation and practice applying it to different transactions.", related_topics: ["Double-entry bookkeeping", "Financial statements", "Types of accounts"] } },
      { id: "act_memory_01", type: "memory_hook", order: 8, content: { text: "Accounting equation: Assets = Liabilities + Equity. Double entry: every debit has a credit. Users: internal (management) and external (investors, government). Principles: going concern, consistency, accrual, prudence.", hook_type: "mnemonic" } },
      { id: "act_reflection_01", type: "reflection", order: 9, content: { question: "Why is accounting important for a small business owner?", expected_understanding: "It helps track income and expenses, calculate profit/loss, make informed decisions, pay correct taxes, and attract investors." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "The accounting equation is:", options: [{ label: "A", text: "Assets = Revenue − Expenses" }, { label: "B", text: "Assets = Liabilities + Equity" }, { label: "C", text: "Assets = Capital − Drawings" }, { label: "D", text: "Assets = Income + Liabilities" }], answer: "B", explanation: "Assets = Liabilities + Owner's Equity is the fundamental accounting equation.", hints: ["The most basic equation in accounting"] },
      { difficulty: "medium", question: "A business has assets of ₦1,000,000 and liabilities of ₦400,000. The owner's equity is:", options: [{ label: "A", text: "₦1,400,000" }, { label: "B", text: "₦600,000" }, { label: "C", text: "₦400,000" }, { label: "D", text: "₦1,000,000" }], answer: "B", explanation: "Equity = Assets − Liabilities = ₦1,000,000 − ₦400,000 = ₦600,000.", hints: ["Rearrange the accounting equation"] },
      { difficulty: "jamb", question: "Which of the following is an accounting principle?", options: [{ label: "A", text: "Profit maximization" }, { label: "B", text: "Going concern" }, { label: "C", text: "Cash basis" }, { label: "D", text: "Cost minimization" }], answer: "B", explanation: "Going concern assumes the business will continue operating indefinitely.", hints: ["Which is a fundamental accounting assumption?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["act_hook_01", "act_intuitive_01", "act_formal_01", "act_formula_01", "act_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "accounting",
    topic: "Double Entry Bookkeeping",
    subtopic: "Recording Transactions",
    title: "Double Entry — Every Debit Has a Credit",
    learning_objectives: [
      "Explain the double entry principle",
      "Identify types of accounts (Real, Personal, Nominal)",
      "Apply debit and credit rules",
      "Record transactions using journals and ledgers",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "dbl_hook_01", type: "hook", order: 1, content: { text: "Imagine lending your friend ₦1,000. In your mind, you've lost ₦1,000 cash but gained a ₦1,000 IOU. That's double entry — every transaction has two sides. This principle, invented 500 years ago, is the backbone of all modern accounting.", prediction_prompt: "When you buy something with cash, what changes? Think about what you gain and what you lose." } },
      { id: "dbl_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Double entry means every transaction affects at least TWO accounts. When you buy goods for cash: goods increase (debit), cash decreases (credit). When you receive money from a debtor: cash increases (debit), debtor decreases (credit). Debits and credits must always be equal.", analogy: "Think of double entry like a seesaw. For every push up on one side (debit), there must be an equal push down on the other side (credit). The seesaw must always stay balanced." } },
      { id: "dbl_formal_01", type: "formal_explanation", order: 3, content: { text: "Three types of accounts: (1) Personal — people and entities (Debtors, Creditors, Bank). (2) Real — assets (Cash, Equipment, Inventory). (3) Nominal — income and expenses (Sales, Rent, Salary). Rules: Personal & Real accounts: Debit the receiver, Credit the giver. Nominal accounts: Debit expenses/losses, Credit incomes/gains.", key_terms: [{ term: "Debit (Dr)", definition: "Left side of an account. Increases assets, expenses; decreases liabilities, equity, income" }, { term: "Credit (Cr)", definition: "Right side of an account. Increases liabilities, equity, income; decreases assets, expenses" }, { term: "Journal", definition: "Book of original entry where transactions are recorded chronologically" }, { term: "Ledger", definition: "Book of final entry where transactions are posted by account" }] } },
      { id: "dbl_formula_01", type: "formula", order: 4, content: { formula: "For every transaction: Total Debits = Total Credits", variables: [{ name: "Personal Account", description: "Debit receiver, Credit giver" }, { name: "Real Account", description: "Debit what comes in, Credit what goes out" }, { name: "Nominal Account", description: "Debit expenses/losses, Credit incomes/gains" }], when_to_use: "When recording any business transaction in the books.", common_traps: ["Debiting the wrong account type", "Forgetting that drawing reduces equity (credit drawings, debit capital)", "Confusing when to use personal vs nominal rules"], units_note: "Every journal entry must have equal debits and credits." } },
      { id: "dbl_practice_01", type: "worked_example", order: 5, content: { scenario: "Record these transactions: (1) Owner invests ₦100,000 cash. (2) Buys equipment for ₦30,000 cash. (3) Buys goods on credit from Ali ₦20,000. (4) Sells goods for cash ₦50,000.", given: ["Four transactions to record"], required: "Journal entries for each transaction", principle: "Apply debit and credit rules for each account type.", steps: [{ explanation: "Owner invests cash", calculation: "Debit Cash ₦100,000 (asset increases), Credit Capital ₦100,000 (equity increases)" }, { explanation: "Buys equipment", calculation: "Debit Equipment ₦30,000 (asset increases), Credit Cash ₦30,000 (asset decreases)" }, { explanation: "Buys on credit", calculation: "Debit Purchases ₦20,000 (expense increases), Credit Ali (Creditor) ₦20,000 (liability increases)" }, { explanation: "Sells goods", calculation: "Debit Cash ₦50,000 (asset increases), Credit Sales ₦50,000 (income increases)" }], answer: "All entries balanced. Total debits = Total credits for each transaction.", check: "Each entry has equal debits and credits." } },
      { id: "dbl_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Debit always means increase.", why_wrong: "Debit increases assets and expenses but DECREASES liabilities, equity, and income. The effect depends on the account type.", correct_model: "Debit = left side. Effect depends on account type: increases assets/expenses, decreases liabilities/equity/income." } },
      { id: "dbl_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests journal entries, ledger posting, and trial balance.", trap: "JAMB may give transactions and ask for the trial balance. Make sure total debits = total credits.", tip: "Practice journalizing common transactions: sales, purchases, expenses, capital introduction.", related_topics: ["Trial balance", "Financial statements", "Accounting cycle"] } },
      { id: "dbl_memory_01", type: "memory_hook", order: 8, content: { text: "Personal: Debit receiver, Credit giver. Real: Debit what comes in, Credit what goes out. Nominal: Debit expenses, Credit incomes. Total debits = Total credits.", hook_type: "mnemonic" } },
      { id: "dbl_reflection_01", type: "reflection", order: 9, content: { question: "Why must every transaction have two entries?", expected_understanding: "Because every transaction has two effects — you gain something and give up something. Double entry ensures the accounting equation always balances." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "When a business receives cash from sales, which account is debited?", options: [{ label: "A", text: "Sales (credit)" }, { label: "B", text: "Cash (debit)" }, { label: "C", text: "Capital (debit)" }, { label: "D", text: "Expenses (credit)" }], answer: "B", explanation: "Cash is debited because cash (asset) increases. Sales is credited because income increases.", hints: ["What account type is cash?"] },
      { difficulty: "medium", question: "The owner withdraws ₦5,000 for personal use. The journal entry is:", options: [{ label: "A", text: "Debit Cash, Credit Drawings" }, { label: "B", text: "Debit Drawings, Credit Cash" }, { label: "C", text: "Debit Capital, Credit Cash" }, { label: "D", text: "Debit Expenses, Credit Cash" }], answer: "B", explanation: "Drawings (nominal) is debited, Cash (real) is credited because cash goes out.", hints: ["Drawings reduce equity — what side increases drawings?"] },
      { difficulty: "jamb", question: "A trial balance will not agree if:", options: [{ label: "A", text: "A correct entry is posted to the wrong account" }, { label: "B", text: "A debit entry is posted as a credit" }, { label: "C", text: "A transaction is completely omitted" }, { label: "D", text: "The same amount is debited and credited" }], answer: "B", explanation: "Posting a debit as a credit will cause the trial balance to disagree. Wrong account or omission won't affect the balance.", hints: ["Which error affects the trial balance totals?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["dbl_hook_01", "dbl_intuitive_01", "dbl_formal_01", "dbl_formula_01", "dbl_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "accounting",
    topic: "Financial Statements",
    subtopic: "Income Statement and Balance Sheet",
    title: "Financial Statements — The Business Report Card",
    learning_objectives: [
      "Prepare an income statement (profit and loss account)",
      "Prepare a balance sheet (statement of financial position)",
      "Understand the relationship between the two statements",
      "Calculate net profit or loss",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "fin_hook_01", type: "hook", order: 1, content: { text: "At the end of every year, companies release their financial results. Is the company making money? Is it growing? Financial statements tell the story. Two main statements: Income Statement (profit or loss) and Balance Sheet (what you own and owe at a point in time).", prediction_prompt: "How would you know if a business is doing well just by looking at its numbers?" } },
      { id: "fin_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Income Statement = Revenue minus Expenses = Profit or Loss (over a period). Balance Sheet = Assets, Liabilities, and Equity (at a specific date). The profit from the Income Statement flows into the Balance Sheet as retained earnings, increasing equity.", analogy: "Think of the Income Statement like your monthly salary slip — how much you earned vs how much you spent. The Balance Sheet is like a snapshot of your bank account, debts, and possessions on a specific day." } },
      { id: "fin_formal_01", type: "formal_explanation", order: 3, content: { text: "Income Statement structure: Sales Revenue − Cost of Sales = Gross Profit. Gross Profit − Operating Expenses = Net Profit. Balance Sheet structure: Non-current Assets + Current Assets = Total Assets. Current Liabilities + Non-current Liabilities + Equity = Total Liabilities + Equity. The two sides must be equal.", key_terms: [{ term: "Gross Profit", definition: "Sales minus cost of goods sold" }, { term: "Net Profit", definition: "Gross profit minus all operating expenses" }, { term: "Current Assets", definition: "Assets that can be converted to cash within one year (cash, inventory, debtors)" }, { term: "Non-current Assets", definition: "Long-term assets (equipment, buildings, vehicles)" }, { term: "Current Liabilities", definition: "Debts due within one year (creditors, short-term loans)" }] } },
      { id: "fin_formula_01", type: "formula", order: 4, content: { formula: "Net Profit = Revenue − Cost of Goods Sold − Expenses. Total Assets = Total Liabilities + Equity", variables: [{ name: "Revenue", description: "Total income from sales" }, { name: "COGS", description: "Direct cost of producing goods sold" }, { name: "Expenses", description: "Operating costs (rent, salary, utilities)" }, { name: "Current Assets", description: "Cash + Inventory + Debtors + Prepayments" }, { name: "Non-current Assets", description: "Equipment + Buildings − Depreciation" }], when_to_use: "When preparing financial statements at year-end.", common_traps: ["Confusing gross profit with net profit", "Forgetting to include all expenses (depreciation, interest)", "Mixing up current and non-current items"], units_note: "Income Statement covers a period (e.g., year ended Dec 31). Balance Sheet is at a specific date." } },
      { id: "fin_practice_01", type: "worked_example", order: 5, content: { scenario: "Prepare an income statement: Sales ₦500,000; Cost of Sales ₦300,000; Rent ₦50,000; Salary ₦80,000; Utilities ₦20,000.", given: ["Revenue and expenses for the year"], required: "Calculate net profit", principle: "Subtract all expenses from revenue.", steps: [{ explanation: "Gross Profit", calculation: "₦500,000 − ₦300,000 = ₦200,000" }, { explanation: "Total Expenses", calculation: "₦50,000 + ₦80,000 + ₦20,000 = ₦150,000" }, { explanation: "Net Profit", calculation: "₦200,000 − ₦150,000 = ₦50,000" }], answer: "Net Profit = ₦50,000.", check: "₦500,000 − ₦300,000 − ₦50,000 − ₦80,000 − ₦20,000 = ₦50,000." } },
      { id: "fin_misconception_01", type: "common_misconception", order: 6, content: { mistake: "The balance sheet shows profit.", why_wrong: "The Income Statement shows profit or loss. The Balance Sheet shows assets, liabilities, and equity at a point in time.", correct_model: "Income Statement = profit/loss. Balance Sheet = financial position (assets = liabilities + equity)." } },
      { id: "fin_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests preparation of income statement and balance sheet from given data.", trap: "JAMB may give trial balance data and ask you to prepare both statements. Don't forget depreciation and closing stock.", tip: "Always check: Net profit goes to balance sheet equity. Trial balance totals must agree before preparing statements.", related_topics: ["Trial balance", "Adjustments", "Depreciation"] } },
      { id: "fin_memory_01", type: "memory_hook", order: 8, content: { text: "Income Statement: Revenue − Expenses = Profit. Balance Sheet: Assets = Liabilities + Equity. Gross Profit = Sales − COGS. Net Profit = Gross Profit − Operating Expenses.", hook_type: "mnemonic" } },
      { id: "fin_reflection_01", type: "reflection", order: 9, content: { question: "Why must the balance sheet balance?", expected_understanding: "Because of the accounting equation: every asset is funded either by borrowing (liabilities) or by the owner's investment (equity). The two sides must always be equal." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "Net profit is calculated as:", options: [{ label: "A", text: "Revenue + Expenses" }, { label: "B", text: "Revenue − Expenses" }, { label: "C", text: "Assets − Liabilities" }, { label: "D", text: "Sales − Capital" }], answer: "B", explanation: "Net profit = Revenue − Expenses.", hints: ["What's left after paying all costs?"] },
      { difficulty: "medium", question: "Which item appears on the balance sheet, not the income statement?", options: [{ label: "A", text: "Sales revenue" }, { label: "B", text: "Rent expense" }, { label: "C", text: "Inventory" }, { label: "D", text: "Salary expense" }], answer: "C", explanation: "Inventory is a current asset on the balance sheet. Sales, rent, and salary are on the income statement.", hints: ["Which is an asset, not an income or expense?"] },
      { difficulty: "jamb", question: "Closing stock appears in the balance sheet as:", options: [{ label: "A", text: "A liability" }, { label: "B", text: "An expense" }, { label: "C", text: "A current asset" }, { label: "D", text: "Income" }], answer: "C", explanation: "Closing stock (inventory) is a current asset on the balance sheet.", hints: ["Stock is something the business owns"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["fin_hook_01", "fin_intuitive_01", "fin_formal_01", "fin_formula_01", "fin_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "accounting",
    topic: "Cost and Management Accounting",
    subtopic: "Costing Methods",
    title: "Cost Accounting — Knowing What Things Really Cost",
    learning_objectives: [
      "Classify costs (fixed, variable, direct, indirect)",
      "Calculate total cost and unit cost",
      "Understand cost-volume-profit analysis",
      "Apply break-even analysis",
    ],
    difficulty_level: "medium",
    estimated_minutes: 20,
    content_sections: [
      { id: "cost_hook_01", type: "hook", order: 1, content: { text: "A shoe maker sells each pair for ₦5,000. But how much does it actually cost to make one pair? Materials, labour, rent — how do you calculate the real cost? If you don't know your costs, you can't set the right price, and you might be selling at a loss without knowing it.", prediction_prompt: "If you run a business, how would you figure out if you're making a profit on each item you sell?" } },
      { id: "cost_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Costs can be classified in different ways: Fixed costs stay the same regardless of output (rent, insurance). Variable costs change with output (materials, direct labour). Direct costs can be traced to a specific product (shoe leather). Indirect costs (overheads) support the business but aren't directly tied to one product (factory rent). Total cost = Fixed + Variable.", analogy: "Think of fixed costs like your phone bill — you pay the same amount whether you make 1 call or 1000. Variable costs are like data charges — the more you use, the more you pay." } },
      { id: "cost_formal_01", type: "formal_explanation", order: 3, content: { text: "Cost classifications: (1) Fixed — constant regardless of output (rent, salary). (2) Variable — changes with output (materials, direct labour). (3) Semi-variable — partly fixed, partly variable (electricity with standing charge). Break-even analysis: the point where total revenue = total cost (no profit, no loss). Contribution = Selling price − Variable cost per unit.", key_terms: [{ term: "Fixed Cost", definition: "Cost that doesn't change with output level" }, { term: "Variable Cost", definition: "Cost that changes directly with output level" }, { term: "Break-even Point", definition: "Output level where total revenue = total cost" }, { term: "Contribution", definition: "Selling price minus variable cost per unit" }, { term: "Margin of Safety", definition: "Actual sales minus break-even sales" }] } },
      { id: "cost_formula_01", type: "formula", order: 4, content: { formula: "Break-even Point (units) = Fixed Costs / (Selling Price − Variable Cost per unit)", variables: [{ name: "Fixed Costs", description: "Total fixed costs for the period" }, { name: "Selling Price", description: "Price per unit" }, { name: "Variable Cost/unit", description: "Variable cost per unit produced" }, { name: "Contribution", description: "Selling Price − Variable Cost per unit" }], when_to_use: "When determining how many units must be sold to cover all costs.", common_traps: ["Confusing fixed and variable costs", "Forgetting to include ALL fixed costs", "Using total costs instead of per-unit variable costs in break-even formula"], units_note: "Break-even can be calculated in units or in revenue (₦)." } },
      { id: "cost_practice_01", type: "worked_example", order: 5, content: { scenario: "A business has fixed costs of ₦200,000 per month. Each unit sells for ₦10,000 and costs ₦6,000 in variable costs. Calculate the break-even point.", given: ["Fixed costs: ₦200,000", "Selling price: ₦10,000", "Variable cost: ₦6,000"], required: "Calculate break-even point in units", principle: "Break-even = Fixed Costs ÷ (Selling Price − Variable Cost per unit)", steps: [{ explanation: "Calculate contribution", calculation: "₦10,000 − ₦6,000 = ₦4,000 per unit" }, { explanation: "Calculate break-even", calculation: "₦200,000 ÷ ₦4,000 = 50 units" }], answer: "The business must sell 50 units to break even.", check: "At 50 units: Revenue = 50 × ₦10,000 = ₦500,000. Total cost = ₦200,000 + (50 × ₦6,000) = ₦500,000. Profit = ₦0." } },
      { id: "cost_misconception_01", type: "common_misconception", order: 6, content: { mistake: "Fixed costs increase when production increases.", why_wrong: "Fixed costs stay the same regardless of output (within relevant range). Rent doesn't change if you produce 1 or 1000 units.", correct_model: "Fixed costs are constant. Variable costs increase with output. Total cost = Fixed + Variable." } },
      { id: "cost_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests cost classification, break-even analysis, and cost-volume-profit.", trap: "JAMB may give semi-variable costs and ask you to separate them into fixed and variable components using high-low method.", tip: "Practice break-even diagrams — know how to plot fixed costs, total costs, and total revenue lines.", related_topics: ["Budgeting", "Variance analysis", "Decision making"] } },
      { id: "cost_memory_01", type: "memory_hook", order: 8, content: { text: "Fixed = constant (rent). Variable = changes with output (materials). Contribution = Price − Variable cost. Break-even = Fixed Costs ÷ Contribution per unit.", hook_type: "mnemonic" } },
      { id: "cost_reflection_01", type: "reflection", order: 9, content: { question: "Why is break-even analysis important for a business owner?", expected_understanding: "It helps determine how many units must be sold to cover costs. Below break-even, the business loses money. Above, it makes profit. It guides pricing and production decisions." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "Rent paid for a factory is an example of:", options: [{ label: "A", text: "Variable cost" }, { label: "B", text: "Fixed cost" }, { label: "C", text: "Direct cost" }, { label: "D", text: "Selling cost" }], answer: "B", explanation: "Rent is a fixed cost — it doesn't change with the level of output.", hints: ["Does the cost change with production?"] },
      { difficulty: "medium", question: "The break-even point is where:", options: [{ label: "A", text: "Revenue is maximum" }, { label: "B", text: "Total revenue equals total cost" }, { label: "C", text: "Variable costs equal fixed costs" }, { label: "D", text: "Profit is maximum" }], answer: "B", explanation: "Break-even is where total revenue = total cost — no profit, no loss.", hints: ["What does 'break even' mean?"] },
      { difficulty: "jamb", question: "If fixed costs are ₦150,000, selling price is ₦12,000, and variable cost per unit is ₦8,000, the break-even point is:", options: [{ label: "A", text: "12.5 units" }, { label: "B", text: "19 units" }, { label: "C", text: "38 units" }, { label: "D", text: "50 units" }], answer: "C", explanation: "Break-even = ₦150,000 ÷ (₦12,000 − ₦8,000) = ₦150,000 ÷ ₦4,000 = 37.5 ≈ 38 units.", hints: ["Use the formula: FC ÷ (SP − VC)"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["cost_hook_01", "cost_intuitive_01", "cost_formal_01", "cost_formula_01", "cost_practice_01"] },
    version: 1,
    status: "published",
  },
  {
    subject: "accounting",
    topic: "Accounting Ratio Analysis",
    subtopic: "Performance Measurement",
    title: "Ratio Analysis — Measuring Business Health",
    learning_objectives: [
      "Calculate key accounting ratios",
      "Interpret profitability, liquidity, and efficiency ratios",
      "Use ratios to evaluate business performance",
      "Compare ratios across different periods",
    ],
    difficulty_level: "hard",
    estimated_minutes: 20,
    content_sections: [
      { id: "rat_hook_01", type: "hook", order: 1, content: { text: "Two companies both make ₦10 million profit. But one has ₦50 million in assets, and the other has ₦200 million. Which is doing better? You can't just look at profit — you need ratios. Ratios are like vital signs for a business: they tell you how healthy it really is.", prediction_prompt: "If two students both score 80%, but one studied for 2 hours and the other for 10 hours, who performed better? How would you measure this?" } },
      { id: "rat_intuitive_01", type: "intuitive_explanation", order: 2, content: { text: "Ratios compare two numbers to give meaning. Gross profit margin = how much profit you make on each sale before expenses. Net profit margin = how much you keep after ALL expenses. Current ratio = can you pay short-term debts? Return on investment = how well is the owner's money working?", analogy: "Think of ratios like a doctor's checkup. Blood pressure, heart rate, temperature — each number alone means little, but together they tell the story of your health. Business ratios do the same for a company." } },
      { id: "rat_formal_01", type: "formal_explanation", order: 3, content: { text: "Key ratios: (1) Gross Profit Margin = Gross Profit/Revenue × 100. (2) Net Profit Margin = Net Profit/Revenue × 100. (3) Current Ratio = Current Assets/Current Liabilities. (4) Quick Ratio = (Current Assets − Inventory)/Current Liabilities. (5) Return on Capital Employed (ROCE) = Net Profit/Capital Employed × 100.", key_terms: [{ term: "Gross Profit Margin", definition: "Percentage of revenue remaining after cost of goods sold" }, { term: "Current Ratio", definition: "Ability to pay short-term debts (ideal: 2:1)" }, { term: "ROCE", definition: "Return on the total capital invested in the business" }, { term: "Inventory Turnover", definition: "How many times inventory is sold and replaced in a period" }] } },
      { id: "rat_formula_01", type: "formula", order: 4, content: { formula: "Gross Profit Margin = (Gross Profit / Revenue) × 100. Current Ratio = Current Assets : Current Liabilities. ROCE = (Net Profit / Capital Employed) × 100", variables: [{ name: "Gross Profit Margin", description: "Higher = better cost control on production" }, { name: "Net Profit Margin", description: "Higher = more efficient overall operations" }, { name: "Current Ratio", description: "Ideal is 2:1. Below 1 = liquidity problems" }, { name: "ROCE", description: "Higher = better use of invested capital" }], when_to_use: "When evaluating business performance, comparing companies, or making investment decisions.", common_traps: ["Using book value instead of market value for ROCE", "Not interpreting ratios in context (industry matters)", "Confusing current ratio with quick ratio"], units_note: "Most ratios are expressed as percentages or ratios (e.g., 2:1)." } },
      { id: "rat_practice_01", type: "worked_example", order: 5, content: { scenario: "Company A: Revenue ₦1,000,000. Gross Profit ₦400,000. Net Profit ₦150,000. Current Assets ₦300,000. Current Liabilities ₦200,000. Calculate key ratios.", given: ["Financial data for Company A"], required: "Calculate gross margin, net margin, and current ratio", principle: "Apply the ratio formulas.", steps: [{ explanation: "Gross Profit Margin", calculation: "₦400,000 / ₦1,000,000 × 100 = 40%" }, { explanation: "Net Profit Margin", calculation: "₦150,000 / ₦1,000,000 × 100 = 15%" }, { explanation: "Current Ratio", calculation: "₦300,000 / ₦200,000 = 1.5:1" }], answer: "Gross margin: 40%. Net margin: 15%. Current ratio: 1.5:1.", check: "The current ratio of 1.5:1 means the company has ₦1.50 in current assets for every ₦1 of current liabilities." } },
      { id: "rat_misconception_01", type: "common_misconception", order: 6, content: { mistake: "A high current ratio is always good.", why_wrong: "A very high current ratio (e.g., 5:1) may mean the business has too much idle cash or unsold inventory — inefficient use of resources.", correct_model: "The ideal current ratio is around 2:1. Too high = inefficiency. Too low = liquidity risk." } },
      { id: "rat_jamb_01", type: "jamb_insight", order: 7, content: { focus_area: "JAMB tests ratio calculations and interpretation.", trap: "JAMB may ask you to compare two companies and explain which is more efficient. Don't just calculate — INTERPRET.", tip: "Memorize the key ratios and their ideal values. Practice interpreting what each ratio tells you about the business.", related_topics: ["Financial analysis", "Business performance", "Investment decisions"] } },
      { id: "rat_memory_01", type: "memory_hook", order: 8, content: { text: "Gross margin = GP/Revenue. Net margin = NP/Revenue. Current ratio = CA:CL (ideal 2:1). ROCE = NP/Capital Employed. Higher profitability ratios = better. Current ratio too high = inefficiency.", hook_type: "mnemonic" } },
      { id: "rat_reflection_01", type: "reflection", order: 9, content: { question: "Why is it important to compare ratios over multiple years rather than just one year?", expected_understanding: "Trends over time reveal whether the business is improving or declining. A single year's ratio doesn't show direction. Ratios also need to be compared with industry averages for meaningful analysis." } },
    ],
    practice_questions: [
      { difficulty: "easy", question: "Gross profit margin is calculated as:", options: [{ label: "A", text: "Net Profit / Revenue × 100" }, { label: "B", text: "Gross Profit / Revenue × 100" }, { label: "C", text: "Revenue / Gross Profit × 100" }, { label: "D", text: "Revenue / Net Profit × 100" }], answer: "B", explanation: "Gross profit margin = (Gross Profit / Revenue) × 100.", hints: ["Which profit and which figure?"] },
      { difficulty: "medium", question: "A current ratio of 0.8:1 indicates:", options: [{ label: "A", text: "The company is very profitable" }, { label: "B", text: "The company may struggle to pay short-term debts" }, { label: "C", text: "The company has too much inventory" }, { label: "D", text: "The company has high sales" }], answer: "B", explanation: "A current ratio below 1:1 means current liabilities exceed current assets — liquidity problems.", hints: ["What does the current ratio measure?"] },
      { difficulty: "jamb", question: "Company A has a net profit margin of 12% and Company B has 8%. This means:", options: [{ label: "A", text: "Company A is larger" }, { label: "B", text: "Company A keeps more profit from each ₦ of sales" }, { label: "C", text: "Company B has more revenue" }, { label: "D", text: "Company A has lower costs" }], answer: "B", explanation: "Net profit margin shows how much profit is kept from each ₦ of revenue. Higher = more efficient.", hints: ["What does the net margin percentage tell you?"] },
    ],
    mastery_criteria: { min_score: 80, required_sections: ["rat_hook_01", "rat_intuitive_01", "rat_formal_01", "rat_formula_01", "rat_practice_01"] },
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
