import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  createSession,
  getOrCreateUserByEmail,
  verifySessionByToken,
} from "./sessionRepo.js";

/* =======================
   Schemas
======================= */

const RequestLinkBody = z.object({
  email: z.string().email(),
});

const VerifyBody = z.object({
  token: z.string().min(10),
});

/* =======================
   Routes
======================= */

export async function registerAuthRoutes(app: FastifyInstance) {
  /* -------------------------------------------------
   * 1. Request magic link
   * ------------------------------------------------- */
  app.post("/auth/request-link", async (req, reply) => {
    const body = RequestLinkBody.parse(req.body);

    const user = await getOrCreateUserByEmail(body.email);
    const ttl = Number(process.env.AUTH_TOKEN_TTL_MINUTES ?? 30);

    const { token, session } = await createSession(user.id, ttl);

    const baseUrl = process.env.WEB_BASE_URL ?? "http://localhost:3000";
    const link = `${baseUrl}/auth/verify?token=${token}`;

    // MVP: console provider
    console.log("[magic-link]", body.email, link, "sessionId=", session.id);

    return reply.send({
      ok: true,
      message: "Magic link sent",
    });
  });

  /* -------------------------------------------------
   * 2. Verify token (POST) — для API / mobile / tests
   * ------------------------------------------------- */
  app.post(
    "/auth/verify",
    {
      schema: { body: VerifyBody },
    },
    async (req, reply) => {
      const { token } = req.body;

      const verified = await verifySessionByToken(token);
      if (!verified) {
        return reply.code(401).send({
          ok: false,
          error: "Invalid or expired token",
        });
      }

      const cookieName =
        process.env.SESSION_COOKIE_NAME ?? "bridgecall_session";

      reply.setCookie(cookieName, verified.sessionId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return reply.send({
        ok: true,
        sessionId: verified.sessionId,
        email: verified.email,
      });
    }
  );

  /* -------------------------------------------------
   * 3. Verify token (GET) — клик по magic-link
   * ------------------------------------------------- */
  app.get("/auth/verify", async (req, reply) => {
  const token = req.query.token as string | undefined;

  if (!token) {
    return reply.code(400).send({ ok: false, error: "token required" });
  }

  const verified = await verifySessionByToken(token);

  if (!verified) {
    return reply.code(401).send({ ok: false, error: "invalid or expired token" });
  }

  const cookieName = process.env.SESSION_COOKIE_NAME ?? "bridgecall_session";

  reply.setCookie(cookieName, verified.sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return reply.send({
    ok: true,
    sessionId: verified.sessionId,
    email: verified.email,
    });
  });

  /* -------------------------------------------------
   * 4. Current user session
   * ------------------------------------------------- */
  app.get("/auth/me", async (req, reply) => {
    const cookieName =
      process.env.SESSION_COOKIE_NAME ?? "bridgecall_session";

    const sessionId = (req.cookies as any)?.[cookieName] as
      | string
      | undefined;

    if (!sessionId) {
      return reply.code(401).send({
        ok: false,
        error: "Not authenticated",
      });
    }

    return reply.send({
      ok: true,
      sessionId,
    });
  });
}
