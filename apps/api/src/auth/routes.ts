import type { FastifyInstance } from "fastify";
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
  // 1) request link
  app.post("/auth/request-link", async (req, reply) => {
    const body = RequestLinkBody.parse(req.body);

    const user = await getOrCreateUserByEmail(body.email);
    const ttl = Number(process.env.AUTH_TOKEN_TTL_MINUTES ?? 30);

    const { token, session } = await createSession(user.id, ttl);

    const baseUrl = process.env.WEB_BASE_URL ?? "http://localhost:3000";
    const link = `${baseUrl}/auth/verify?token=${token}`;

    console.log("[magic-link]", body.email, link, "sessionId=", session.id);

    return reply.send({ ok: true });
  });

  // 2) verify token
  app.post("/auth/verify", async (req, reply) => {
    const body = VerifyBody.parse(req.body);

    const verified = await verifySessionByToken(body.token);
    if (!verified) {
      return reply.code(401).send({ ok: false });
    }

    // cookie (если уже подключил @fastify/cookie)
    const cookieName =
      process.env.SESSION_COOKIE_NAME ?? "bridgecall_session";

    reply.setCookie(cookieName, verified.sessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return reply.send({
      ok: true,
      sessionId: verified.sessionId,
      email: verified.email,
    });
  });

  // 3) auth me  👈 ВОТ ЭТО
  app.get("/auth/me", async (req, reply) => {
    const cookieName =
      process.env.SESSION_COOKIE_NAME ?? "bridgecall_session";

    const sid = (req.cookies as any)?.[cookieName];
    if (!sid) {
      return reply.code(401).send({ ok: false });
    }

    return reply.send({
      ok: true,
      sessionId: sid,
    });
  });
}

