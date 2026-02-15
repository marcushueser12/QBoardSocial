import type { Context, Next } from "hono";
import { createSupabaseClient } from "../lib/supabase.js";

export async function gatingMiddleware(c: Context, next: Next) {
  if (c.req.method !== "GET") {
    return next();
  }

  const questionId = c.req.param("questionId");
  const authToken = c.get("authToken") as string;

  if (!questionId) {
    return next();
  }

  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const { data: { user } } = await supabase.auth.getUser(authToken);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profile?.is_admin) {
    c.set("bypassGating", true);
    return next();
  }

  const { data: userAnswer } = await supabase
    .from("answers")
    .select("id")
    .eq("question_id", questionId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!userAnswer) {
    return c.json(
      { error: "Answer required", message: "You must answer this question before viewing others' answers" },
      403
    );
  }

  return next();
}
