"use client";
/**
 * AI Chat page — SSE streaming chat with voice I/O.
 * RULE EFF-1: SSE streaming for AI chat.
 * RULE A11Y-3: Voice input/output via Web Speech API.
 */

import { useEffect, useRef } from "react";
import { useChatStream } from "@/lib/hooks/useChatStream";
import { useSpeech } from "@/lib/hooks/useSpeech";
import { EMERGENCY_CONTACTS } from "@/lib/constants";

/** AI Chat page with streaming SSE and voice I/O. */
export default function ChatPage() {
  const { messages, isStreaming, error, sendMessage, clearMessages } = useChatStream();
  const { isListening, isSpeaking, transcript, isSupported, startListening, stopListening, speak, stopSpeaking } = useSpeech();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (transcript && inputRef.current) {
      inputRef.current.value = transcript;
    }
  }, [transcript]);

  const handleSend = () => {
    const val = inputRef.current?.value.trim();
    if (!val) return;
    void sendMessage(val);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeakLast = () => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant) speak(lastAssistant.content);
  };

  const QUICK_PROMPTS = [
    "Where is the Main Stage?",
    "Which sessions match AI & ML?",
    "What's the crowd level at Food Court?",
    "What are the emergency contacts?",
    "Tell me about accessibility options",
    "What sessions are on now?",
  ] as const;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: "2rem", maxWidth: "800px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h1 className="section-title">
              🤖 EventIQ <span className="gradient-text">AI Chat</span>
            </h1>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              Ask me anything about the event — powered by Azure OpenAI
            </p>
          </div>
          <button onClick={clearMessages} className="btn btn-ghost btn-sm" aria-label="Clear chat history">
            🗑️ Clear
          </button>
        </div>

        {/* Feature badges */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <span className="badge badge-primary">⚡ Streaming</span>
          {isSupported && <span className="badge badge-success">🎤 Voice Enabled</span>}
          <span className="badge badge-info">🚨 Emergency: 112</span>
        </div>

        {/* Chat window */}
        <div
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
          style={{
            height: "450px",
            overflowY: "auto",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            background: "var(--color-surface)",
            marginBottom: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--color-text-muted)", margin: "auto" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }} aria-hidden="true">🤖</div>
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                Hello! I&apos;m EventIQ Assistant
              </p>
              <p style={{ fontSize: "0.875rem" }}>
                Ask me about sessions, navigation, crowd levels, or emergency info.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "0.875rem 1.125rem",
                  borderRadius: msg.role === "user" ? "var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)" : "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
                  background: msg.role === "user"
                    ? "var(--gradient-primary)"
                    : "var(--color-surface-hover)",
                  color: "var(--color-text-primary)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  border: msg.role === "assistant" ? "1px solid var(--color-border)" : "none",
                }}
                aria-label={`${msg.role === "user" ? "You" : "EventIQ"}: ${msg.content}`}
              >
                {msg.role === "assistant" && (
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.375rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span aria-hidden="true">🤖</span> EventIQ
                    {msg.isStreaming && (
                      <span style={{ display: "inline-flex", gap: "2px", marginLeft: "0.5rem" }} aria-label="AI is typing">
                        <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--color-primary)", animation: "spin 1s linear infinite" }} />
                        <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--color-secondary)", animation: "spin 1s linear infinite 0.2s" }} />
                        <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--color-accent)", animation: "spin 1s linear infinite 0.4s" }} />
                      </span>
                    )}
                  </div>
                )}
                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {error && (
          <div className="alert-banner" style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", marginBottom: "1rem" }} role="alert">
            <span aria-hidden="true">❌</span>
            <span style={{ fontSize: "0.875rem" }}>{error}</span>
          </div>
        )}

        {/* Quick prompts */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => void sendMessage(prompt)}
              disabled={isStreaming}
              className="btn btn-ghost btn-sm"
              aria-label={`Quick prompt: ${prompt}`}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="chat-input" className="sr-only">Message EventIQ assistant</label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              className="input"
              placeholder="Ask about sessions, navigation, crowd levels..."
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              aria-label="Chat message input"
            />
          </div>

          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`btn ${isListening ? "btn-danger" : "btn-ghost"}`}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              aria-pressed={isListening}
              style={{ flexShrink: 0 }}
            >
              {isListening ? "🔴 Stop" : "🎤"}
            </button>
          )}

          {isSupported && messages.length > 0 && (
            <button
              onClick={isSpeaking ? stopSpeaking : handleSpeakLast}
              className={`btn btn-ghost`}
              aria-label={isSpeaking ? "Stop speaking" : "Read last response aloud"}
              aria-pressed={isSpeaking}
              style={{ flexShrink: 0 }}
            >
              {isSpeaking ? "🔇" : "🔊"}
            </button>
          )}

          <button
            onClick={handleSend}
            disabled={isStreaming}
            className="btn btn-primary"
            id="chat-send-btn"
            aria-label="Send message"
            style={{ flexShrink: 0 }}
          >
            {isStreaming ? <div className="spinner" role="status" aria-label="AI is responding" /> : "Send →"}
          </button>
        </div>

        {isListening && (
          <p style={{ color: "var(--color-danger)", fontSize: "0.8rem", marginTop: "0.5rem" }} aria-live="polite">
            🎤 Listening... speak now
          </p>
        )}

        {/* Emergency */}
        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }} role="complementary" aria-label="Emergency contacts">
          <span style={{ color: "#f87171", fontWeight: 700, fontSize: "0.8rem" }}>🚨 Emergency:</span>
          {EMERGENCY_CONTACTS.slice(0, 3).map((c) => (
            <a key={c.number} href={`tel:${c.number}`} style={{ color: "#f87171", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none" }}>
              {c.icon} {c.number}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
