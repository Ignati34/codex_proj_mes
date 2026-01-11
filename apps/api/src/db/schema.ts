import { pgTable, text, timestamp, uuid, jsonb, integer, index } from "drizzle-orm/pg-core";

// users
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// sessions
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdIdx: index("sessions_user_id_idx").on(t.userId),
  })
);

// participants (минимально)
export const participants = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(), // owner|guest
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// transcripts
export const transcripts = pgTable("transcripts", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id"),
  segments: jsonb("segments").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// summaries
export const summaries = pgTable("summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id"),
  summaryJson: jsonb("summary_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// usage_events
export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    kind: text("kind").notNull(),
    qty: integer("qty").notNull().default(0),
    meta: jsonb("meta").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdIdx: index("usage_events_user_id_idx").on(t.userId),
  })
);
