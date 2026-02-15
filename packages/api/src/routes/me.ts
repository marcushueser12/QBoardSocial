import { Hono } from "hono";
import type { Env } from "../types.js";
import { createSupabaseClient } from "../lib/supabase.js";

export const meRoutes = new Hono<Env>();

meRoutes.get("/", async (c) => {
  const authToken = c.get("authToken") as string;
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const { data: { user } } = await supabase.auth.getUser(authToken);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return c.json({ error: "Profile not found" }, 404);
  }

  return c.json({ user, profile });
});

meRoutes.get("/answers", async (c) => {
  const authToken = c.get("authToken") as string;
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const { data: { user } } = await supabase.auth.getUser(authToken);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const limit = Math.min(parseInt(c.req.query("limit") || "20"), 50);
  const offset = parseInt(c.req.query("offset") || "0");

  const { data: answers, error } = await supabase
    .from("answers")
    .select(`
      id,
      text,
      created_at,
      question:questions(id, text, effective_date, scope)
    `)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  const { count } = await supabase
    .from("answers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const { count: communityCount } = await supabase
    .from("memberships")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return c.json({
    answers,
    stats: {
      days_answered: count ?? 0,
      communities_joined: communityCount ?? 0,
    },
  });
});

meRoutes.patch("/", async (c) => {
  const authToken = c.get("authToken") as string;
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const { data: { user } } = await supabase.auth.getUser(authToken);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{ username?: string; bio?: string; avatar_url?: string; is_anonymous?: boolean }>();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...(body.username && { username: body.username }),
      ...(body.bio !== undefined && { bio: body.bio }),
      ...(body.avatar_url !== undefined && { avatar_url: body.avatar_url }),
      ...(body.is_anonymous !== undefined && { is_anonymous: body.is_anonymous }),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json(data);
});
