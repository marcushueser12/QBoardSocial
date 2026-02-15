import type { Context, Next } from "hono";
import type { Env } from "../types.js";

export async function authMiddleware(c: Context<Env>, next: Next) {
  const authHeader = c.req.header("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!bearerToken) {
    return c.json({ error: "Unauthorized", message: "Missing or invalid authorization" }, 401);
  }

  c.set("authToken", bearerToken);
  await next();
}
