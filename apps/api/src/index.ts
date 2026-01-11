import { config as loadEnv } from "dotenv";
import path from "node:path";
import { registerAuthRoutes } from "./auth/routes.js";
import cookie from "@fastify/cookie";


loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

import Fastify from "fastify";
import pg from "pg";
const { Pool } = pg;
import { APP_NAME } from "@bridgecall/shared";
import { registerAuthRoutes } from "./auth/routes.js";

const port = Number(process.env.PORT ?? 4000);
const databaseUrl = process.env.DATABASE_URL ?? "";

const app = Fastify({
  logger: true
});
await app.register(cookie, {
  secret: process.env.SESSION_COOKIE_SECRET,
});
await registerAuthRoutes(app);
app.get("/health", async () => ({ status: "ok" }));

app.get("/", async () => ({
  name: APP_NAME,
  status: "api-ready"
}));

async function checkDatabaseConnection() {
  if (!databaseUrl) {
    app.log.warn("DATABASE_URL is not set; skipping database check.");
    return;
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await pool.query("select 1 as ok");
    app.log.info("Database connection established.");
  } catch (error) {
    app.log.error({ error }, "Database connection failed.");
  } finally {
    await pool.end();
  }
}

const start = async () => {
  await checkDatabaseConnection();

  try {
    await app.listen({ port, host: "127.0.0.1" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
