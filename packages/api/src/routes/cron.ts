import { Hono } from "hono";
import { ensureDailyQuestion } from "../jobs/daily-question.js";

export const cronRoutes = new Hono();

cronRoutes.post("/daily-question", async (c) => {
  const authHeader = c.req.header("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const result = await ensureDailyQuestion();
    return c.json(result);
  } catch (error) {
    console.error("Daily question job failed:", error);
    return c.json({ error: "Failed to create daily question" }, 500);
  }
});
