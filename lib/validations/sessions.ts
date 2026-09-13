/**
 * Zod schemas for session-related API routes.
 * RULE SEC-1: Every POST/PUT/PATCH API route must parse body with Zod.
 * RULE CQ-6: No raw body casts.
 */

import { z } from "zod";
import { SESSION_CATEGORIES, VENUE_ZONES } from "../constants";

/** Schema for creating a new session. */
export const CreateSessionSchema = z.object({
  title: z.string().min(3).max(200),
  speaker: z.string().min(2).max(100),
  speakerBio: z.string().max(500).optional().default(""),
  zone: z.enum(VENUE_ZONES),
  category: z.enum(SESSION_CATEGORIES as unknown as [string, ...string[]]),
  startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, "ISO datetime required"),
  endTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, "ISO datetime required"),
  description: z.string().min(10).max(2000),
  tags: z.array(z.string().max(50)).max(10).default([]),
  capacity: z.number().int().min(1).max(10000).default(100),
  isFeatured: z.boolean().default(false),
});

/** Schema for querying sessions. */
export const SessionQuerySchema = z.object({
  category: z.string().optional(),
  zone: z.string().optional(),
  search: z.string().max(100).optional(),
  tag: z.string().max(50).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

/** Schema for a session summary request. */
export const SessionSummarySchema = z.object({
  sessionId: z.string().min(1).max(64),
});

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type SessionQueryInput = z.infer<typeof SessionQuerySchema>;
