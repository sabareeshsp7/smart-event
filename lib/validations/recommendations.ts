/**
 * Zod schemas for AI recommendation and chat routes.
 * RULE SEC-1: Every POST/PUT/PATCH API route must parse body with Zod.
 */

import { z } from "zod";
import { INTEREST_TAGS } from "../constants";

/** Schema for recommendation requests. */
export const RecommendationSchema = z.object({
  interests: z
    .array(z.enum(INTEREST_TAGS as unknown as [string, ...string[]]))
    .min(1, "Select at least one interest")
    .max(12),
  limit: z.number().int().min(1).max(12).default(6),
});

/** Schema for chat messages. */
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

/** Schema for chat requests. */
export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(20),
});

/** Schema for crowd risk requests. */
export const CrowdRiskSchema = z.object({
  zones: z
    .array(
      z.object({
        zone: z.string().min(1).max(100),
        occupancy: z.number().int().min(0),
        capacity: z.number().int().min(1),
      })
    )
    .min(1)
    .max(30),
});

export type RecommendationInput = z.infer<typeof RecommendationSchema>;
export type ChatRequestInput = z.infer<typeof ChatRequestSchema>;
export type CrowdRiskInput = z.infer<typeof CrowdRiskSchema>;
