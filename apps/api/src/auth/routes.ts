TypeScriptimport type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  createSession,
  getOrCreateUserByEmail,
  verifySessionByToken,
} from "./sessionRepo.js";

const RequestLinkBody = z.object({
  email: z.string().email(),
});

const VerifyBody = z.object({
  token: z.string().min(10),
});

export async function registerAuthRoutes(app: FastifyInstance) {
  // 1. Запрос magic-link
  app.post("/auth/request-link", async (req, reply) => {
    const body = RequestLinkBody.parse(req.body);
    const user = await getOrCreateUserByEmail(body.email);

    const ttl = Number(process.env.AUTH_TOKEN_TTL_MINUTES ?? 30);
    const { token, session } = await createSession(user.id, ttl);

    const baseUrl = process.env.WEB_BASE_URL ?? "http://localhost:3000";
    const link = `${baseUrl}/auth/verify?token=${token}`;

    console.log("[magic-link]", body.email, link, "sessionId=", session.id);

    return { ok: true, message: "Magic link sent" };
  });

  // 2. Подтверждение magic-link через POST (для API-клиентов)
  app.post("/auth/verify", {
    schema: {
      body: VerifyBody,
    },
  }, async (req, reply) => {
    const { token } = req.body;

    const verified = await verifySessionByToken(token);

    if (!verified) {
      return reply.code(401).send({
        ok: false,
        error: "Invalid or expired token",
      });
    }

    const cookieName = process.env.SESSION_COOKIE_NAME ?? "bridgecall_session";

    reply.setCookie(cookieName, verified.sessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 дней — можно сделать динамическим
    });

    return {
      ok: true,
      sessionId: verified.sessionId,
      email: verified.email,
    };
  });

  // 3. Информация о текущем пользователе
  app.get("/auth/me", async (req, reply) => {
    const cookieName = process.env.SESSION_COOKIE_NAME ?? "bridgecall_session";
    const sessionId = req.cookies?.[cookieName] as string | undefined;

    if (!sessionId) {
      return reply.code(401).send({
        ok: false,
        error: "Not authenticated",
      });
    }

    return {
      ok: true,
      sessionId,
      // можно расширить позже:
      // email, name, role и т.д.
    };
  });

  // 4. Верификация по клику на ссылку из письма (GET) — основной рабочий путь
  // 4. Верификация GET — временный минимальный вариант
  
  app.get("/auth/verify", async (req, reply) => {
   console.log("GET /auth/verify вызван! Токен:", req.query.token);
   return { debug: "GET /auth/verify работает!" };
});

    const { token } = req.query as { token?: string };

    if (!token || typeof token !== "string") {
      return reply.code(400).send({
        ok: false,
        error: "Token is required in query parameter",
      });
    }

    const verified = await verifySessionByToken(token);

    if (!verified) {
      return reply.code(401).send({
        ok: false,
        error: "Invalid or expired token",
      });
    }

    const cookieName = process.env.SESSION_COOKIE_NAME ?? "bridgecall_session";

    reply.setCookie(cookieName, verified.sessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    const redirectUrl =
      process.env.WEB_BASE_URL
        ? `${process.env.WEB_BASE_URL}/dashboard?auth=success`
        : "http://localhost:3000/dashboard?auth=success";

    return reply.redirect(redirectUrl);
  });
}
