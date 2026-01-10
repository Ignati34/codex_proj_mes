import { z } from "zod";

/**
 * Shared enums
 */
export const PlanSchema = z.enum(["starter", "pro", "team"]);
export type Plan = z.infer<typeof PlanSchema>;

export const SummaryTypeSchema = z.enum(["recruitment", "legal"]);
export type SummaryType = z.infer<typeof SummaryTypeSchema>;

export const SessionStatusSchema = z.enum(["created", "active", "ended", "expired"]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const LangSchema = z.enum(["en", "pl", "de", "hi", "bn", "vi"]);
export type Lang = z.infer<typeof LangSchema>;

/**
 * Auth DTOs
 */
export const MagicLinkRequestSchema = z.object({
  email: z.string().email(),
});
export type MagicLinkRequest = z.infer<typeof MagicLinkRequestSchema>;

export const MagicLinkVerifyQuerySchema = z.object({
  token: z.string().min(20),
});
export type MagicLinkVerifyQuery = z.infer<typeof MagicLinkVerifyQuerySchema>;

/**
 * Sessions DTOs
 */
export const CreateSessionRequestSchema = z.object({
  lang_owner: LangSchema,
  lang_guest: LangSchema,
  summary_type: SummaryTypeSchema,
  ttl_hours: z.number().int().min(1).max(168).default(24),
});
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const CreateSessionResponseSchema = z.object({
  id: z.string().uuid(),
  token: z.string().min(24),
  expires_at: z.string().datetime(),
  join_url: z.string().url(),
});
export type CreateSessionResponse = z.infer<typeof CreateSessionResponseSchema>;

export const JoinInfoResponseSchema = z.object({
  session_id: z.string().uuid(),
  status: SessionStatusSchema,
  lang_owner: LangSchema,
  lang_guest: LangSchema,
  summary_type: SummaryTypeSchema,
  expires_at: z.string().datetime(),
  join_allowed: z.boolean(),
  reason: z.string().optional(),
});
export type JoinInfoResponse = z.infer<typeof JoinInfoResponseSchema>;

/**
 * Transcript models
 */
export const SpeakerSchema = z.enum(["owner", "guest"]);
export type Speaker = z.infer<typeof SpeakerSchema>;

export const TranscriptSegmentSchema = z.object({
  speaker: SpeakerSchema,
  ts_start_ms: z.number().int().nonnegative(),
  ts_end_ms: z.number().int().nonnegative(),
  text_original: z.string().min(1),
  lang_original: LangSchema,
  text_translated: z.string().min(1).optional(),
  lang_translated: LangSchema.optional(),
  confidence: z.number().min(0).max(1).optional(),
});
export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchema>;

export const TranscriptResponseSchema = z.object({
  session_id: z.string().uuid(),
  segments: z.array(TranscriptSegmentSchema),
});
export type TranscriptResponse = z.infer<typeof TranscriptResponseSchema>;

/**
 * Recruitment Summary schema (structured)
 */
export const ConfirmationTopicSchema = z.enum([
  "duties",
  "salary",
  "hours",
  "accommodation",
  "documents",
  "next_steps",
]);

export const ConfirmationSchema = z.object({
  topic: ConfirmationTopicSchema,
  confirmed: z.enum(["yes", "no", "unknown"]),
  notes: z.string().optional(),
});

export const RecruitmentSummarySchema = z.object({
  type: z.literal("recruitment"),
  position: z.object({
    title: z.string().min(1),
    country_of_employment: z.string().min(1),
    start_date: z.string().optional(),
  }),
  confirmations: z.array(ConfirmationSchema).min(1),
  risk_level: z.enum(["low", "medium", "high"]),
  recommendation: z.enum(["proceed", "clarify", "reject"]),
  freeform_summary: z.string().min(1),
});
export type RecruitmentSummary = z.infer<typeof RecruitmentSummarySchema>;

/**
 * Legal Summary schema (minimal for MVP)
 */
export const LegalSummarySchema = z.object({
  type: z.literal("legal"),
  topic: z.string().min(1),
  key_points: z.array(z.string().min(1)).min(1),
  action_items: z.array(z.string().min(1)).optional(),
  freeform_summary: z.string().min(1),
});
export type LegalSummary = z.infer<typeof LegalSummarySchema>;

export const AnySummarySchema = z.union([RecruitmentSummarySchema, LegalSummarySchema]);
export type AnySummary = z.infer<typeof AnySummarySchema>;

/**
 * Usage
 */
export const UsageEventKindSchema = z.enum(["call_minute", "stt_minute", "translate_minute"]);
export type UsageEventKind = z.infer<typeof UsageEventKindSchema>;

export const UsageTotalsResponseSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  totals: z.record(UsageEventKindSchema, z.number().nonnegative()),
});
export type UsageTotalsResponse = z.infer<typeof UsageTotalsResponseSchema>;
