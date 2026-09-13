/**
 * Zod schemas for alert-related API routes.
 * RULE SEC-1: Every POST/PUT/PATCH API route must parse body with Zod.
 */

import { z } from "zod";

/** Schema for creating a new alert. */
export const CreateAlertSchema = z.object({
  title: z.string().min(3).max(200),
  message: z.string().min(5).max(1000),
  severity: z.enum(["low", "medium", "high", "critical"]),
  zone: z.string().max(100).default("All Areas"),
  adminKey: z.string().min(1).max(256),
});

/** Schema for deactivating an alert. */
export const DeactivateAlertSchema = z.object({
  alertId: z.string().min(1).max(64),
  adminKey: z.string().min(1).max(256),
});

export type CreateAlertInput = z.infer<typeof CreateAlertSchema>;
export type DeactivateAlertInput = z.infer<typeof DeactivateAlertSchema>;
