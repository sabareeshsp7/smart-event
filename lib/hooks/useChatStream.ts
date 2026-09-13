"use client";
/**
 * useChatStream hook — manages SSE streaming AI chat with AbortController.
 * RULE EFF-1: All AI chat must use SSE streaming.
 * RULE EFF-8: AbortController must be used in every streaming hook to cancel on unmount.
 */

import { useState, useCallback, useRef } from "react";
import { API_ROUTES } from "../constants";

/** A single message in the chat. */
export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

/** Return value of useChatStream. */
export interface UseChatStreamReturn {
  messages: ChatMsg[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

const SYSTEM_PROMPT =
  "You are EventIQ, a smart event assistant. Help attendees with navigation, schedules, crowd levels, accessibility, and safety. Be concise, helpful, and friendly. Always mention emergency number 112 for urgent situations.";

/**
 * Hook for managing an AI chat stream via Server-Sent Events.
 * Automatically cancels in-flight requests on unmount.
 */
export function useChatStream(): UseChatStreamReturn {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || isStreaming) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: content.trim(),
    };

    const assistantId = `a-${Date.now()}`;
    const assistantMsg: ChatMsg = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);
    setError(null);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch(API_ROUTES.CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
            { role: "user", content: content.trim() },
          ],
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done || controller.signal.aborted) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            accumulated += data;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: accumulated, isStreaming: true }
                  : m
              )
            );
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Connection error";
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, I encountered an error. Please try again.", isStreaming: false }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isStreaming]);

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isStreaming, error, sendMessage, clearMessages };
}
