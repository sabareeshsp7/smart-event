/**
 * POST /api/speech-tts — Sarvam AI Text-to-Speech endpoint.
 * Converts text to Indian-language audio using Sarvam AI.
 * RULE SEC-1: Zod validation on all routes.
 * RULE SEC-5: Rate limiting on AI routes.
 * RULE A11Y-3: Supports multimodal voice I/O for accessibility.
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSarvamClient, SARVAM_SPEAKERS, type SarvamLanguageCode } from "@/lib/ai/sarvam";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";

const TTSSchema = z.object({
  text: z.string().min(1).max(500),
  languageCode: z.enum([
    "en-IN", "hi-IN", "ta-IN", "te-IN", "kn-IN",
    "ml-IN", "bn-IN", "gu-IN", "mr-IN", "od-IN",
  ] as [SarvamLanguageCode, ...SarvamLanguageCode[]]).default("en-IN"),
});

/** POST /api/speech-tts */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const rateCheck = checkRateLimit(`tts:${ip}`, 15, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = TTSSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { text, languageCode } = parsed.data;
  const client = getSarvamClient();

  if (!client) {
    // Fallback: signal client to use browser TTS
    return NextResponse.json(
      { fallback: true, message: "Use browser TTS — Sarvam key not configured" },
      { status: 200 }
    );
  }

  try {
    const speaker = SARVAM_SPEAKERS[languageCode];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client.textToSpeech as any).convert({
      inputs: [text],
      target_language_code: languageCode,
      speaker,
      pitch: 0,
      pace: 1.0,
      loudness: 1.5,
      enable_preprocessing: true,
      model: "bulbul:v2",
    });

    // Return base64 audio for the client to play
    const audioData = response.audios?.[0];
    return NextResponse.json({
      audio: audioData,
      languageCode,
      speaker,
      fallback: false,
    });
  } catch (err) {
    console.error("[Sarvam TTS]", err instanceof Error ? err.message : "Unknown");
    return NextResponse.json({ fallback: true, message: "TTS failed, use browser fallback" });
  }
}
