import { Hono } from "hono";
import type { Env } from "../types.js";
import { createSupabaseClient } from "../lib/supabase.js";

export const answersRoutes = new Hono<Env>();

answersRoutes.get("/", async (c) => {
  const authToken = c.get("authToken") as string;
  const questionId = c.req.param("questionId");
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const { data: { user } } = await supabase.auth.getUser(authToken);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sort = c.req.query("sort") || "newest";
  const limit = Math.min(parseInt(c.req.query("limit") || "20"), 50);
  const offset = parseInt(c.req.query("offset") || "0");

  let query = supabase
    .from("answers")
    .select(`
      id,
      text,
      created_at,
      user_id,
      profile:profiles!user_id(id, username, avatar_url, is_anonymous)
    `)
    .eq("question_id", questionId)
    .neq("user_id", user.id)
    .is("deleted_at", null);

  if (sort === "most_liked") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: answers, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  if (sort === "most_liked") {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("answer_id")
      .eq("type", "like");

    const likeCounts = (reactions || []).reduce((acc, r) => {
      acc[r.answer_id] = (acc[r.answer_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sorted = [...(answers || [])].sort(
      (a, b) => (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0)
    );

    return c.json({ answers: sorted });
  }

  return c.json({ answers: answers || [] });
});

answersRoutes.post("/", async (c) => {
  const authToken = c.get("authToken") as string;
  const questionId = c.req.param("questionId");
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const { data: { user } } = await supabase.auth.getUser(authToken);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{ text: string }>();

  if (!body.text?.trim()) {
    return c.json({ error: "Answer text is required" }, 400);
  }

  const { data, error } = await supabase
    .from("answers")
    .insert({
      question_id: questionId,
      user_id: user.id,
      text: body.text.trim(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return c.json({ error: "You have already answered this question" }, 409);
    }
    return c.json({ error: error.message }, 400);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarding_completed_at) {
    await supabase
      .from("profiles")
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq("id", user.id);
  }

  return c.json(data);
});

answersRoutes.post("/:answerId/like", async (c) => {
  const authToken = c.get("authToken") as string;
  const answerId = c.req.param("answerId");
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const { data: { user } } = await supabase.auth.getUser(authToken);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { data, error } = await supabase
    .from("reactions")
    .insert({ answer_id: answerId, user_id: user.id, type: "like" })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return c.json({ error: "Already liked" }, 409);
    }
    return c.json({ error: error.message }, 400);
  }

  return c.json(data);
});

answersRoutes.delete("/:answerId/like", async (c) => {
  const authToken = c.get("authToken") as string;
  const answerId = c.req.param("answerId");
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const { data: { user } } = await supabase.auth.getUser(authToken);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("answer_id", answerId)
    .eq("user_id", user.id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true });
});

answersRoutes.delete("/:answerId", async (c) => {
  const authToken = c.get("authToken") as string;
  const answerId = c.req.param("answerId");
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const { data: { user } } = await supabase.auth.getUser(authToken);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { error } = await supabase
    .from("answers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", answerId)
    .eq("user_id", user.id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true });
});
