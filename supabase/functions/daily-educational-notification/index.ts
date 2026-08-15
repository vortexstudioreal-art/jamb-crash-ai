import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ========== CONTENT POOLS ==========

const riddles = [
  { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?", a: "An echo" },
  { q: "The more you take, the more you leave behind. What am I?", a: "Footsteps" },
  { q: "I have cities, but no houses live there. I have mountains, but no trees grow. I have water, but no fish swim. What am I?", a: "A map" },
  { q: "What has keys but no locks, space but no room, and you can enter but can't go inside?", a: "A keyboard" },
  { q: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?", a: "Fire" },
  { q: "What can travel around the world while staying in a corner?", a: "A stamp" },
  { q: "I have a head and a tail but no body. What am I?", a: "A coin" },
  { q: "What gets wetter the more it dries?", a: "A towel" },
  { q: "I am taken from a mine, and shut up in a wooden case, from which I am never released, and yet I am used by almost every person. What am I?", a: "Pencil lead" },
  { q: "What is seen in the middle of March and April that can't be seen at the beginning or end of either month?", a: "The letter R" },
  { q: "What 8-letter word can have a letter taken away and it still makes a word, take another letter away and it still makes a word, keep on doing that until you have one letter left?", a: "Starting (star, start, stat, sad, etc.)" },
  { q: "A man dies of old age on his 25th birthday. How is this possible?", a: "He was born on February 29" },
  { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: "The letter M" },
  { q: "I fly without wings. I cry without eyes. Wherever I go, darkness follows me. What am I?", a: "A cloud" },
  { q: "What is always in front of you but can't be seen?", a: "The future" },
  { q: "What has a neck but no head?", a: "A bottle" },
  { q: "What can you break without touching it?", a: "A promise" },
  { q: "I am so fragile that if you say my name, you'll break me. What am I?", a: "Silence" },
  { q: "What gets bigger the more you put in it?", a: "A hole" },
  { q: "What is full of holes but can still hold water?", a: "A sponge" },
];

const quotes = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.", author: "Richard Feynman" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "I have no special talents. I am only passionately curious.", author: "Albert Einstein" },
  { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
];

const funFacts = [
  "Your brain uses about 20% of your body's total energy — even though it's only 2% of your weight!",
  "Octopuses have three hearts and blue blood.",
  "The human body has enough carbon to make about 9,000 pencils.",
  "Honey never spoils. Archaeologists found 3,000-year-old honey in Egyptian tombs that was still good!",
  "Bananas are berries, but strawberries aren't.",
  "A group of flamingos is called a flamboyance.",
  "The shortest war in history lasted only 38 to 45 minutes (between Britain and Zanzibar).",
  "Your nose can remember about 50,000 different scents.",
  "The heart of a shrimp is located in its head.",
  "A jiffy is an actual unit of time: 1/100th of a second.",
  "Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramids.",
  "There are more possible iterations of a game of chess than there are atoms in the observable universe.",
  "A teaspoonful of neutron star would weigh about 6 billion tons.",
  "Butterflies taste with their feet.",
  "The inventor of the Pringles can is buried in one.",
];

// ========== HELPERS ==========

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ========== MAIN ==========

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const dayOfYear = getDayOfYear();
    const notifications: Array<{ title: string; message: string; type: string }> = [];

    // 1. Daily Riddle
    const riddle = pickRandom(riddles);
    notifications.push({
      title: "Daily Riddle",
      message: `${riddle.q}\n\n💡 Answer: ${riddle.a}`,
      type: "info",
    });

    // 2. Motivational Quote
    const quote = pickRandom(quotes);
    notifications.push({
      title: "Daily Inspiration",
      message: `"${quote.text}"\n— ${quote.author}`,
      type: "info",
    });

    // 3. Fun Fact (every other day)
    if (dayOfYear % 2 === 0) {
      const fact = pickRandom(funFacts);
      notifications.push({
        title: "Did You Know?",
        message: fact,
        type: "info",
      });
    }

    // 4. Leaderboard Update
    const { data: topScorer } = await supabase
      .from("leaderboard_scores")
      .select("full_name, total_score, questions_answered")
      .order("total_score", { ascending: false })
      .limit(1)
      .single();

    if (topScorer) {
      const displayName = topScorer.full_name || "A champion";
      notifications.push({
        title: "Leaderboard Update",
        message: `${displayName} is currently leading with ${topScorer.total_score} points! Can you beat them? Keep practicing to climb the ranks.`,
        type: "leaderboard",
      });
    }

    // 5. Study reminder (weekdays only)
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      notifications.push({
        title: "Study Reminder",
        message: "It's a study day! Open the app and practice a few questions to keep your streak alive. Consistency is key to scoring high in JAMB.",
        type: "reminder",
      });
    }

    // Insert all notifications
    const insertResults = [];
    for (const notif of notifications) {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          title: notif.title,
          message: notif.message,
          type: notif.type,
          is_global: true,
          created_by_email: "system@jambcrashai.com",
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // expires in 24h
        })
        .select("id")
        .single();

      if (error) {
        console.error("Failed to insert notification:", error);
      } else {
        insertResults.push(data.id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      notifications_created: insertResults.length,
      notification_ids: insertResults,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
