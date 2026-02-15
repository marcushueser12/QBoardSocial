import { Hono } from "hono";
import type { Env } from "../types.js";
import { createSupabaseClient } from "../lib/supabase.js";

export const questionsRoutes = new Hono<Env>();

questionsRoutes.get("/today", async (c) => {
  const authToken = c.get("authToken") as string;
  const supabase = createSupabaseClient(`Bearer ${authToken}`);

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("scope", "global")
    .eq("effective_date", today)
    .single();

  if (error && error.code !== "PGRST116") {
    return c.json({ error: error.message }, 500);
  }

  if (!data) {
    return c.json({ question: null, message: "No question for today yet" });
  }

  return c.json({ question: data });
});

questionsRoutes.get("/:id", async (c) => {
  const authToken = c.get("authToken") as string;
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const id = c.req.param("id");

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return c.json({ error: "Question not found" }, 404);
  }

  return c.json(data);
});
