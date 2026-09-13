/**
 * GET /api/health — Health check endpoint using parallel checks.
 * RULE EFF-7: Use Promise.all() for all independent parallel async operations.
 */

import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/connection";
import { getAzureClient } from "@/lib/ai/azure";
import { getGeminiClient } from "@/lib/ai/gemini";

interface ServiceHealth {
  status: "healthy" | "degraded" | "unavailable";
  latencyMs?: number;
  note?: string;
}

interface HealthResponse {
  status: "healthy" | "degraded";
  timestamp: string;
  services: {
    database: ServiceHealth;
    azureAI: ServiceHealth;
    geminiAI: ServiceHealth;
  };
  version: string;
}

/** GET /api/health */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest): Promise<NextResponse<HealthResponse>> {
  // RULE EFF-7: Parallel checks
  const [dbHealth, azureHealth, geminiHealth] = await Promise.all([
    checkDatabase(),
    checkAzure(),
    checkGemini(),
  ]);

  const allHealthy =
    dbHealth.status === "healthy" &&
    azureHealth.status !== "unavailable";

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        azureAI: azureHealth,
        geminiAI: geminiHealth,
      },
      version: "1.0.0",
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-cache" },
    }
  );
}

async function checkDatabase(): Promise<ServiceHealth> {
  const t = Date.now();
  try {
    const db = getDb();
    db.prepare("SELECT 1").get();
    return { status: "healthy", latencyMs: Date.now() - t };
  } catch {
    return { status: "unavailable", note: "DB connection failed" };
  }
}

async function checkAzure(): Promise<ServiceHealth> {
  const client = getAzureClient();
  if (!client) return { status: "degraded", note: "API key not configured — using fallback" };
  return { status: "healthy", note: "Configured" };
}

async function checkGemini(): Promise<ServiceHealth> {
  const client = getGeminiClient();
  if (!client) return { status: "degraded", note: "API key not configured — using fallback" };
  return { status: "healthy", note: "Configured" };
}
