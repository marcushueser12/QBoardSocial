import { createClient } from "@/lib/supabase/server";
import { BoardClient } from "./board-client";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { date } = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const targetDate = date || today;
  const { data: question } = await supabase
    .from("questions")
    .select("id, text, effective_date")
    .eq("scope", "global")
    .eq("effective_date", targetDate)
    .single();

  const { data: myAnswer } = question
    ? await supabase
        .from("answers")
        .select("id, text")
        .eq("question_id", question.id)
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .single()
    : { data: null };

  const { data: recentDates } = await supabase
    .from("questions")
    .select("effective_date")
    .eq("scope", "global")
    .is("community_id", null)
    .order("effective_date", { ascending: false })
    .limit(14);

  return (
    <BoardClient
      question={question}
      myAnswer={myAnswer}
      userId={user.id}
      targetDate={targetDate}
      today={today}
      recentDates={(recentDates || []).map((d) => d.effective_date)}
    />
  );
}
