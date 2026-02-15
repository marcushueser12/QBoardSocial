import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types.js";
import { authMiddleware } from "./middleware/auth.js";
import { gatingMiddleware } from "./middleware/gating.js";
import { rateLimitMiddleware } from "./middleware/rate-limit.js";
import { authRoutes } from "./routes/auth.js";
import { answersRoutes } from "./routes/answers.js";
import { questionsRoutes } from "./routes/questions.js";
import { communitiesRoutes } from "./routes/communities.js";
import { reportsRoutes } from "./routes/reports.js";
import { meRoutes } from "./routes/me.js";
import { cronRoutes } from "./routes/cron.js";

const app = new Hono<Env>();

app.use("*", cors({ origin: "*" }));
app.use("/api/*", rateLimitMiddleware);

app.route("/api/auth", authRoutes);
app.use("/api/me/*", authMiddleware);
app.route("/api/me", meRoutes);
app.use("/api/questions/:questionId/answers", authMiddleware, gatingMiddleware);
app.use("/api/questions/:questionId/answers/*", authMiddleware, gatingMiddleware);
app.route("/api/questions/:questionId/answers", answersRoutes);
app.use("/api/questions/*", authMiddleware);
app.route("/api/questions", questionsRoutes);
app.use("/api/communities/*", authMiddleware);
app.route("/api/communities", communitiesRoutes);
app.use("/api/reports/*", authMiddleware);
app.route("/api/reports", reportsRoutes);
app.route("/cron", cronRoutes);

app.get("/health", (c) => c.json({ status: "ok" }));

const port = parseInt(process.env.PORT || "3001", 10);
console.log(`API running on port ${port}`);

serve({ fetch: app.fetch, port });
