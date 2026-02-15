import type { Context, Next } from "hono";

const answerCounts = new Map<string, { count: number; resetAt: number }>();
const ANSWER_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

export async function rateLimitMiddleware(c: Context, next: Next) {
  const path = c.req.path;
  const authHeader = c.req.header("Authorization");
  const authToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userId = authToken || c.req.header("x-forwarded-for") || "anon";

  if (path.includes("/answers") && c.req.method === "POST") {
    const now = Date.now();
    const key = `answers:${userId}`;
    const record = answerCounts.get(key);

    if (record) {
      if (now > record.resetAt) {
        answerCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
      } else if (record.count >= ANSWER_LIMIT) {
        return c.json(
          { error: "Rate limit exceeded", message: "Maximum 10 answers per hour" },
          429
        );
      } else {
        record.count++;
      }
    } else {
      answerCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    }
  }

  return next();
}
