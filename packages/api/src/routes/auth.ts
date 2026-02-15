import { Hono } from "hono";

export const authRoutes = new Hono();

authRoutes.get("/verify", (c) => {
  return c.json({ message: "Use Supabase Auth for sign in/up" });
});
