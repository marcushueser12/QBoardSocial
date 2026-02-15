import { Hono } from "hono";
import type { Env } from "../types.js";
import { createSupabaseClient } from "../lib/supabase.js";

export const communitiesRoutes = new Hono<Env>();

communitiesRoutes.get("/", async (c) => {
  const authToken = c.get("authToken") as string;
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const q = c.req.query("q");
  const limit = Math.min(parseInt(c.req.query("limit") || "20"), 50);
  const offset = parseInt(c.req.query("offset") || "0");

  let query = supabase
    .from("communities")
    .select("id, name, slug, description, visibility, owner_id, created_at")
    .is("deleted_at", null);

  if (q) {
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ communities: data || [] });
});

communitiesRoutes.post("/", async (c) => {
  const authToken = c.get("authToken") as string;
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const { data: { user } } = await supabase.auth.getUser(authToken);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{
    name: string;
    slug?: string;
    description?: string;
    rules?: string;
    visibility?: "open" | "private" | "invite_only";
  }>();

  if (!body.name?.trim()) {
    return c.json({ error: "Community name is required" }, 400);
  }

  const slug =
    body.slug?.trim() ||
    body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const { data, error } = await supabase
    .from("communities")
    .insert({
      name: body.name.trim(),
      slug,
      description: body.description?.trim() || null,
      rules: body.rules?.trim() || null,
      owner_id: user.id,
      visibility: body.visibility || "open",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return c.json({ error: "Community slug already exists" }, 409);
    }
    return c.json({ error: error.message }, 400);
  }

  return c.json(data);
});

communitiesRoutes.get("/:communityId", async (c) => {
  const authToken = c.get("authToken") as string;
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const communityId = c.req.param("communityId");

  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .or(`id.eq.${communityId},slug.eq.${communityId}`)
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    return c.json({ error: "Community not found" }, 404);
  }

  return c.json(data);
});

communitiesRoutes.get("/:communityId/members", async (c) => {
  const authToken = c.get("authToken") as string;
  const supabase = createSupabaseClient(`Bearer ${authToken}`);
  const communityId = c.req.param("communityId");

  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .or(`id.eq.${communityId},slug.eq.${communityId}`)
    .single();

  if (!community) {
    return c.json({ error: "Community not found" }, 404);
  }

  const { data, error } = await supabase
    .from("memberships")
    .select(`
      role,
      joined_at,
      profile:profiles!user_id(id, username, avatar_url)
    `)
    .eq("community_id", community.id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ members: data || [] });
});
