import { z } from "zod";
import { TranscriptSegmentSchema, SpeakerSchema, LangSchema } from "./schemas.js";

/**
 * Signaling messages (WebRTC)
 */
export const WsJoinSchema = z.object({
  type: z.literal("join"),
  session_id: z.string().uuid(),
  role: z.enum(["owner", "guest"]),
});

export const WsOfferSchema = z.object({
  type: z.literal("offer"),
  sdp: z.string().min(1),
});

export const WsAnswerSchema = z.object({
  type: z.literal("answer"),
  sdp: z.string().min(1),
});

export const WsIceSchema = z.object({
  type: z.literal("ice"),
  candidate: z.any(),
});

export const WsLeaveSchema = z.object({
  type: z.literal("leave"),
});

/**
 * Captions streaming
 */
export const WsCaptionSchema = z.object({
  type: z.literal("caption"),
  segment: TranscriptSegmentSchema,
});

/**
 * Optional: partial caption (for live feel)
 */
export const WsCaptionPartialSchema = z.object({
  type: z.literal("caption_partial"),
  speaker: SpeakerSchema,
  lang_original: LangSchema,
  text_original: z.string().min(1),
});

export const WsMessageSchema = z.union([
  WsJoinSchema,
  WsOfferSchema,
  WsAnswerSchema,
  WsIceSchema,
  WsLeaveSchema,
  WsCaptionSchema,
  WsCaptionPartialSchema,
]);

export type WsMessage = z.infer<typeof WsMessageSchema>;
