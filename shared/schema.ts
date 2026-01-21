import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export * from "./models/chat";

// === TABLE DEFINITIONS ===

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  patientName: text("patient_name").notNull(),
  patientAge: integer("patient_age"),
  clinicalNotes: text("clinical_notes"),
  transcript: text("transcript"), // Text from voice input
  audioUrl: text("audio_url"),    // Optional reference to audio file
  status: text("status").default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id),
  summary: text("summary"),
  blindSpots: jsonb("blind_spots").$type<string[]>(), // Potential missed diagnoses
  questions: jsonb("questions").$type<string[]>(),    // Follow-up questions
  originalLanguage: text("original_language"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const casesRelations = relations(cases, ({ one }) => ({
  insight: one(insights, {
    fields: [cases.id],
    references: [insights.caseId],
  }),
}));

export const insightsRelations = relations(insights, ({ one }) => ({
  case: one(cases, {
    fields: [insights.caseId],
    references: [cases.id],
  }),
}));

// === ZOD SCHEMAS ===

export const insertCaseSchema = createInsertSchema(cases).omit({ 
  id: true, 
  createdAt: true,
  status: true 
});

// === EXPLICIT TYPES ===

export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;

export type Insight = typeof insights.$inferSelect;

export type CaseWithInsight = Case & { insight?: Insight | null };

export type CreateCaseRequest = InsertCase;

export interface AnalyzeCaseResponse {
  case: Case;
  insight: Insight;
}
