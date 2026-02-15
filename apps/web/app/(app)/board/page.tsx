import { createClient } from "@/lib/supabase/server";
import { BoardClient } from "./board-client";

export default async function BoardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date().toISOString().split("T")[0];
  const { data: question } = await supabase
    .from("questions")
    .select("id, text, effective_date")
    .eq("scope", "global")
    .eq("effective_date", today)
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

  return (
    <BoardClient
      question={question}
      myAnswer={myAnswer}
      userId={user.id}
    />
  );
}
