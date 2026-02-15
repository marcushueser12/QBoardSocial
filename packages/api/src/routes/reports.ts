import { Hono } from "hono";
import type { Env } from "../types.js";
import { createSupabaseClient } from "../lib/supabase.js";

export const reportsRoutes = new Hono<Env>();

reportsRoutes.post("/", async (c) => {
  const authToken = c.get("authToken") as string;
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const { data: { user } } = await supabase.auth.getUser(authToken);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{
    target_type: "answer" | "user" | "community";
    target_id: string;
    reason?: string;
  }>();

  if (!body.target_type || !body.target_id) {
    return c.json({ error: "target_type and target_id are required" }, 400);
  }

  const validTypes = ["answer", "user", "community"];
  if (!validTypes.includes(body.target_type)) {
    return c.json({ error: "Invalid target_type" }, 400);
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      target_type: body.target_type,
      target_id: body.target_id,
      reason: body.reason?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json(data);
});
