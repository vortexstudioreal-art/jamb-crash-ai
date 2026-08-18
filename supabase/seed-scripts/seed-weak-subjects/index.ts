import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const NEW_QUESTIONS: Record<string, Array<{question: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; explanation: string; year: number}>> = {
  literature: [
    { question: "In 'Things Fall Apart', Okonkwo is exiled for:", option_a: "killing a clansman", option_b: "stealing yams", option_c: "refusing to pay bride price", option_d: "insulting the elders", correct_answer: "A", explanation: "Okonkwo accidentally kills a clansman during the Week of Peace, violating the earth's decree.", year: 2025 },
    { question: "The protagonist of 'Second Class Citizen' is:", option_a: "Adah", option_b: "Obi", option_c: "Amaka", option_d: "Ngozi", correct_answer: "A", explanation: "Adah is the main character who struggles against gender and class discrimination.", year: 2025 },
    { question: "A soliloquy reveals:", option_a: "dialogue between two characters", option_b: "a character's inner thoughts", option_c: "the narrator's opinion", option_d: "stage directions", correct_answer: "B", explanation: "A soliloquy is a speech where a character alone on stage speaks their thoughts aloud.", year: 2025 },
    { question: "Irony in literature means:", option_a: "saying exactly what you mean", option_b: "a contrast between expectation and reality", option_c: "exaggeration for effect", option_d: "a humorous story", correct_answer: "B", explanation: "Irony involves a difference between what is said/meant and what actually happens.", year: 2025 },
    { question: "The setting of 'The Unexpected Joy' is primarily:", option_a: "Lagos", option_b: "London", option_c: "a rural village", option_d: "a university", correct_answer: "B", explanation: "The novel is set in London, exploring the immigrant experience.", year: 2025 },
    { question: "A metaphor is:", option_a: "a comparison using 'like' or 'as'", option_b: "a direct comparison without 'like' or 'as'", option_c: "an exaggeration", option_d: "giving human qualities to objects", correct_answer: "B", explanation: "A metaphor states one thing is another (e.g., 'Time is money'), unlike a simile.", year: 2025 },
    { question: "The theme of 'Native Son' includes:", option_a: "romantic love", option_b: "racial oppression and its psychological effects", option_c: "agricultural development", option_d: "religious conversion", correct_answer: "B", explanation: "Bigger Thomas's life shows how systemic racism shapes behavior and identity.", year: 2025 },
    { question: "An apostrophe in poetry addresses:", option_a: "the reader directly", option_b: "an absent person or abstract concept", option_c: "the poet's lover", option_d: "nature", correct_answer: "B", explanation: "Apostrophe is a direct address to someone absent or something non-human.", year: 2025 },
    { question: "The climax of a story is:", option_a: "the beginning", option_b: "the turning point of highest tension", option_c: "the ending", option_d: "the background information", correct_answer: "B", explanation: "The climax is the most intense moment where the main conflict reaches its peak.", year: 2025 },
    { question: "Allusion refers to:", option_a: "a direct statement", option_b: "a reference to another work, person, or event", option_c: "a sound effect", option_d: "a type of rhyme", correct_answer: "B", explanation: "An allusion is an indirect reference to something well-known for symbolic effect.", year: 2025 },
    { question: "In literature, 'foil' refers to:", option_a: "a type of sword", option_b: "a character who contrasts with another to highlight qualities", option_c: "a poetic device", option_d: "a plot twist", correct_answer: "B", explanation: "A foil character highlights traits of another character through contrast.", year: 2025 },
    { question: "An epilogue is:", option_a: "the opening of a book", option_b: "a concluding section after the main story", option_c: "a preface by the author", option_d: "a chapter summary", correct_answer: "B", explanation: "An epilogue wraps up the story or provides closure after the main events.", year: 2025 },
    { question: "The term 'denouement' means:", option_a: "the introduction", option_b: "the resolution of a plot", option_c: "the conflict", option_d: "the setting", correct_answer: "B", explanation: "Denouement is the final part of a story where loose ends are tied up.", year: 2025 },
    { question: "Imagery in poetry appeals to:", option_a: "logic only", option_b: "the senses (sight, sound, touch, etc.)", option_c: "memory", option_d: "grammar", correct_answer: "B", explanation: "Imagery uses descriptive language to create sensory experiences for readers.", year: 2025 },
    { question: "Personification is:", option_a: "using a person's name", option_b: "giving human qualities to non-human things", option_c: "speaking in first person", option_d: "a type of metaphor", correct_answer: "B", explanation: "Personification attributes human characteristics to objects, animals, or ideas.", year: 2025 },
  ],
  commerce: [
    { question: "A tariff is:", option_a: "a type of tax on imports", option_b: "a trade agreement", option_c: "a shipping method", option_d: "a type of insurance", correct_answer: "A", explanation: "A tariff is a tax imposed on imported goods to protect domestic industries.", year: 2025 },
    { question: "The balance of trade measures:", option_a: "total government revenue", option_b: "difference between exports and imports of goods", option_c: "exchange rate fluctuations", option_d: "inflation rate", correct_answer: "B", explanation: "Balance of trade = Value of exports - Value of imports (visible trade).", year: 2025 },
    { question: "A monopoly exists when:", option_a: "many sellers compete", option_b: "one seller dominates the market", option_c: "buyers control prices", option_d: "goods are free", correct_answer: "B", explanation: "A monopoly is a market structure with a single seller controlling supply and price.", year: 2025 },
    { question: "Dividends are:", option_a: "taxes on profits", option_b: "payments to shareholders from profits", option_c: "cost of production", option_d: "bank charges", correct_answer: "B", explanation: "Dividends are portions of company profits distributed to shareholders.", year: 2025 },
    { question: "Working capital is used for:", option_a: "buying fixed assets", option_b: "day-to-day operations", option_c: "paying dividends", option_d: "repaying long-term loans", correct_answer: "B", explanation: "Working capital funds daily business operations like inventory and salaries.", year: 2025 },
    { question: "A prospectus is:", option_a: "a financial statement", option_b: "a document inviting public to buy shares", option_c: "a tax return", option_d: "an employment contract", correct_answer: "B", explanation: "A prospectus provides details about a company offering shares to the public.", year: 2025 },
    { question: "Depreciation accounts for:", option_a: "increase in asset value", option_b: "wear and tear of assets over time", option_c: "profit distribution", option_d: "inventory shrinkage", correct_answer: "B", explanation: "Depreciation allocates the cost of a tangible asset over its useful life.", year: 2025 },
    { question: "A consortium is:", option_a: "a single company", option_b: "an association of companies for a joint purpose", option_c: "a government agency", option_d: "a type of bank", correct_answer: "B", explanation: "A consortium is a group of businesses that pool resources for a specific project.", year: 2025 },
    { question: "Elasticity of demand measures:", option_a: "total revenue", option_b: "responsiveness of quantity demanded to price changes", option_c: "production costs", option_d: "profit margins", correct_answer: "B", explanation: "Price elasticity measures how much quantity demanded changes when price changes.", year: 2025 },
    { question: "A letter of credit is used in:", option_a: "domestic banking", option_b: "international trade finance", option_c: "insurance claims", option_d: "tax filing", correct_answer: "B", explanation: "A letter of credit guarantees payment to exporters upon meeting document conditions.", year: 2025 },
    { question: "Oligopoly describes a market with:", option_a: "one seller", option_b: "few large sellers", option_c: "many small sellers", option_d: "no sellers", correct_answer: "B", explanation: "An oligopoly is dominated by a small number of large firms.", year: 2025 },
    { question: "A demurrage charge is:", option_a: "a fee for early payment", option_b: "a penalty for delayed cargo pickup", option_c: "a discount for bulk buying", option_d: "a customs duty", correct_answer: "B", explanation: "Demurrage is charged when cargo is not picked up from the port within the allowed time.", year: 2025 },
    { question: "Commercial paper is:", option_a: "a type of receipt", option_b: "short-term unsecured promissory note", option_c: "a legal contract", option_d: "a shipping document", correct_answer: "B", explanation: "Commercial paper is short-term debt issued by companies for financing.", year: 2025 },
    { question: "An embargo is:", option_a: "a trade agreement", option_b: "a government ban on trade with a country", option_c: "a tax incentive", option_d: "a type of license", correct_answer: "B", explanation: "An embargo is an official ban on trade or commerce with a specific country.", year: 2025 },
    { question: "GDP stands for:", option_a: "General Domestic Product", option_b: "Gross Domestic Product", option_c: "Global Development Plan", option_d: "General Development Percentage", correct_answer: "B", explanation: "GDP measures the total monetary value of all finished goods and services produced within a country.", year: 2025 },
  ],
  geography: [
    { question: "The study of earthquakes is called:", option_a: "geology", option_b: "seismology", option_c: "meteorology", option_d: "oceanography", correct_answer: "B", explanation: "Seismology is the scientific study of earthquakes and seismic waves.", year: 2025 },
    { question: "The Tropic of Cancer passes through:", option_a: "Nigeria", option_b: "Egypt", option_c: "South Africa", option_d: "Kenya", correct_answer: "B", explanation: "The Tropic of Cancer (23.5°N) passes through Egypt in Africa.", year: 2025 },
    { question: "A delta forms at:", option_a: "the source of a river", option_b: "the mouth of a river", option_c: "the middle of a river", option_d: "the tributary", correct_answer: "B", explanation: "A delta forms where a river deposits sediment as it enters a slower body of water.", year: 2025 },
    { question: "The largest desert on Earth is:", option_a: "Sahara", option_b: "Gobi", option_c: "Antarctic", option_d: "Kalahari", correct_answer: "C", explanation: "Antarctica is technically the largest desert (polar desert, <250mm precipitation annually).", year: 2025 },
    { question: "Convection currents cause:", option_a: "volcanic eruptions", option_b: "plate tectonic movement", option_c: "river flooding", option_d: "ocean tides", correct_answer: "B", explanation: "Convection currents in the mantle drive the movement of tectonic plates.", year: 2025 },
    { question: "The Prime Meridian passes through:", option_a: "France", option_b: "Greenwich, England", option_c: "Germany", option_d: "Spain", correct_answer: "B", explanation: "The Prime Meridian (0° longitude) passes through the Royal Observatory in Greenwich.", year: 2025 },
    { question: "Humidity refers to:", option_a: "air temperature", option_b: "amount of water vapor in the air", option_c: "wind speed", option_d: "air pressure", correct_answer: "B", explanation: "Humidity is the concentration of water vapor present in the atmosphere.", year: 2025 },
    { question: "An atoll is:", option_a: "a mountain range", option_b: "a ring-shaped coral reef", option_c: "a river valley", option_d: "a glacier", correct_answer: "B", explanation: "An atoll is a ring-shaped reef formed around a submerged volcanic island.", year: 2025 },
    { question: "The process of weathering involves:", option_a: "building up of landforms", option_b: "breakdown of rocks in situ", option_c: "transport of sediments", option_d: "deposition of minerals", correct_answer: "B", explanation: "Weathering is the breakdown of rocks at the Earth's surface without movement.", year: 2025 },
    { question: "The Ring of Fire is associated with:", option_a: "desert formation", option_b: "volcanic and seismic activity around the Pacific", option_c: "tropical storms", option_d: "river systems", correct_answer: "B", explanation: "The Ring of Fire is a horseshoe-shaped zone of frequent earthquakes and volcanoes.", year: 2025 },
    { question: "Permafrost is:", option_a: "permanent snow cover", option_b: "permanently frozen ground", option_c: "a type of rock", option_d: "a desert climate", correct_answer: "B", explanation: "Permafrost is ground that remains frozen for two or more consecutive years.", year: 2025 },
    { question: "A fjord is formed by:", option_a: "river erosion", option_b: "glacial erosion", option_c: "wind deposition", option_d: "volcanic activity", correct_answer: "B", explanation: "Fjords are deep, narrow inlets carved by glaciers and later flooded by the sea.", year: 2025 },
    { question: "The Intertropical Convergence Zone (ITCZ) causes:", option_a: "desert formation", option_b: "tropical rainfall and convection", option_c: "polar ice", option_d: "earthquakes", correct_answer: "B", explanation: "The ITCZ is a belt of low pressure near the equator where trade winds converge, causing rain.", year: 2025 },
    { question: "A tsunami is caused by:", option_a: "strong winds", option_b: "underwater earthquake or landslide", option_c: "high tides", option_d: "volcanic ash", correct_answer: "B", explanation: "Tsunamis are large ocean waves triggered by underwater disturbances like earthquakes.", year: 2025 },
    { question: "The longest river in Africa is:", option_a: "Niger", option_b: "Congo", option_c: "Nile", option_d: "Zambezi", correct_answer: "C", explanation: "The Nile River is approximately 6,650 km long, the longest in Africa.", year: 2025 },
  ],
  accounting: [
    { question: "The accounting equation is:", option_a: "Assets = Liabilities + Revenue", option_b: "Assets = Liabilities + Equity", option_c: "Assets = Expenses + Equity", option_d: "Assets = Capital + Revenue", correct_answer: "B", explanation: "The fundamental accounting equation: Assets = Liabilities + Owner's Equity.", year: 2025 },
    { question: "Double-entry bookkeeping means:", option_a: "recording transactions twice", option_b: "every transaction affects two accounts", option_c: "using two journals", option_d: "balancing two ledgers", correct_answer: "B", explanation: "Double-entry means every debit has a corresponding credit of equal amount.", year: 2025 },
    { question: "Capital expenditure is for:", option_a: "daily expenses", option_b: "acquiring or improving fixed assets", option_c: "paying salaries", option_d: "buying inventory", correct_answer: "B", explanation: "Capital expenditure (CapEx) is spent on long-term assets like buildings and equipment.", year: 2025 },
    { question: "The general ledger contains:", option_a: "cash register records", option_b: "all accounts used by the business", option_c: "customer addresses", option_d: "employee records", correct_answer: "B", explanation: "The general ledger is the master record of all financial transactions by account.", year: 2025 },
    { question: "A contra account:", option_a: "increases the related account", option_b: "decreases the related account", option_c: "replaces the related account", option_d: "doubles the related account", correct_answer: "B", explanation: "A contra account reduces the balance of another account (e.g., Accumulated Depreciation).", year: 2025 },
    { question: "Net income equals:", option_a: "revenue minus assets", option_b: "revenue minus all expenses", option_c: "cash received minus cash paid", option_d: "gross profit minus assets", correct_answer: "B", explanation: "Net Income = Total Revenue - Total Expenses (including taxes and interest).", year: 2025 },
    { question: "Accounts payable represents:", option_a: "money owed to the business", option_b: "money the business owes to suppliers", option_c: "bank loans", option_d: "owner's investment", correct_answer: "B", explanation: "Accounts payable is the amount owed to creditors for goods/services bought on credit.", year: 2025 },
    { question: "The cost of goods sold (COGS) includes:", option_a: "rent and salaries", option_b: "direct costs of producing goods sold", option_c: "marketing expenses", option_d: "depreciation of office equipment", correct_answer: "B", explanation: "COGS includes direct materials, direct labor, and manufacturing overhead.", year: 2025 },
    { question: "Goodwill is classified as:", option_a: "a current asset", option_b: "an intangible asset", option_c: "a liability", option_d: "equity", correct_answer: "B", explanation: "Goodwill is an intangible asset arising from business reputation and customer relationships.", year: 2025 },
    { question: "The matching principle requires:", option_a: "matching assets with liabilities", option_b: "matching expenses with related revenues", option_c: "matching debits with credits", option_d: "matching inventory with sales", correct_answer: "B", explanation: "The matching principle states expenses should be recognized in the same period as revenues.", year: 2025 },
    { question: "Retained earnings represent:", option_a: "current year's profit only", option_b: "cumulative undistributed profits", option_c: "owner's capital contribution", option_d: "total revenue", correct_answer: "B", explanation: "Retained earnings are accumulated profits not distributed as dividends.", year: 2025 },
    { question: "An adjusting entry is made:", option_a: "only at year-end", option_b: "to update accounts before preparing financial statements", option_c: "when cash is received", option_d: "only for errors", correct_answer: "B", explanation: "Adjusting entries ensure revenues and expenses are recorded in the correct period.", year: 2025 },
    { question: "The cash flow statement has sections for:", option_a: "assets, liabilities, equity", option_b: "operating, investing, and financing activities", option_c: "revenue, expenses, profit", option_d: "debit and credit", correct_answer: "B", explanation: "The cash flow statement categorizes cash movements into three activity types.", year: 2025 },
    { question: "Materiality in accounting means:", option_a: "using the right material", option_b: "significance of information to decision-makers", option_c: "physical weight of assets", option_d: "quality of raw materials", correct_answer: "B", explanation: "Materiality refers to whether information is significant enough to influence decisions.", year: 2025 },
    { question: "The liquidity ratio measures:", option_a: "profitability", option_b: "ability to meet short-term obligations", option_c: "long-term solvency", option_d: "asset growth", correct_answer: "B", explanation: "Liquidity ratios (like current ratio) measure a firm's ability to pay short-term debts.", year: 2025 },
  ],
};

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

    for (const [subject, questions] of Object.entries(NEW_QUESTIONS)) {
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
