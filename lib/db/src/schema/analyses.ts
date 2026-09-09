import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

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
  geminiVerification: jsonb("gemini_verification").$type<{
    verdict: string;
    confidence: number;
    reasoning: string;
    channelCredibility?: string;
    factPoints: { point: string; status: "verified" | "disputed" | "false" | "unknown" }[];
  } | null>().default(null),
  factBreakdown: jsonb("fact_breakdown").$type<{
    category: string;
    detail: string;
    status: "real" | "fake" | "misleading" | "unverified";
  }[] | null>().default(null),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id").notNull(),
  verifiedArticles: jsonb("verified_articles").$type<{
    title: string;
    source: string;
    url: string;
    publishDate: string;
    credibilityScore: number;
  }[]>().default([]),
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;
