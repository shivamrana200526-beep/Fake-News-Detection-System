import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  sourceType: text("source_type").notNull(),
  prediction: text("prediction").notNull(),
  confidence: integer("confidence").notNull(),
  explanation: text("explanation").notNull(),
  keywords: text("keywords").array(),
  detectedSource: jsonb("detected_source"),
  additionalSources: jsonb("additional_sources"),
  mediaType: text("media_type").default("text"),
  geminiVerification: jsonb("gemini_verification").default(null),
  factBreakdown: jsonb("fact_breakdown").default(null),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id").notNull(),
  verifiedArticles: jsonb("verified_articles").default([]),
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});
