import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function ensureDailyQuestion() {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("questions")
    .select("id")
    .eq("scope", "global")
    .eq("effective_date", today)
    .single();

  if (existing) {
    return { created: false, question: existing };
  }

  const defaultQuestions = [
    "What made you smile today?",
    "What's one thing you're grateful for?",
    "What did you learn today?",
    "What's the best part of your day so far?",
    "What are you looking forward to tomorrow?",
  ];

  const text = defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)];

  const { data: question, error } = await supabase
    .from("questions")
    .insert({
      scope: "global",
      community_id: null,
      effective_date: today,
      text,
      created_by: null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { created: true, question };
}
