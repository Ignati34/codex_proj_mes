import { config as loadEnv } from "dotenv";
import path from "node:path";
import Fastify from "fastify";
import pg from "pg";
import cookie from "@fastify/cookie";

import { APP_NAME } from "@bridgecall/shared";
import { registerAuthRoutes } from "./auth/routes.js";

const { Pool } = pg;

// Загружаем .env (из корня монрепо, на два уровня вверх)
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

const port = Number(process.env.PORT ?? 4001);

const app = Fastify({
  logger: true,
});

// Подключаем cookie-плагин (обязательно ДО регистрации роутов, которые используют куки)
await app.register(cookie, {
  secret: process.env.SESSION_COOKIE_SECRET,
});

// Регистрируем все маршруты АУТЕНТИФИКАЦИИ ДО запуска сервера
await registerAuthRoutes(app);

// Простые вспомогательные маршруты
app.get("/health", async () => ({ status: "ok" }));

app.get("/", async () => ({
  name: APP_NAME,
  status: "api-ready",
}));

// Проверка подключения к базе (выполняется перед запуском)
async function checkDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (!databaseUrl) {
    app.log.warn("DATABASE_URL is not set; skipping database check.");
    return;
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await pool.query("SELECT 1 AS ok");
    app.log.info("Database connection established.");
  } catch (error) {
    app.log.error({ error }, "Database connection failed.");
  } finally {
    await pool.end();
  }
}

// Запуск сервера
const start = async () => {
  await checkDatabaseConnection();

  try {
    await app.listen({ port, host: "127.0.0.1" });

    console.log(`Server listening at http://127.0.0.1:${port}`);

    // Вывод всех зарегистрированных маршрутов — очень полезно для отладки
    console.log("\n=== Зарегистрированные маршруты ===\n");
    console.log(app.printRoutes(true));
    console.log("\n==================================\n");

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
