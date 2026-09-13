"use client";
/**
 * AI Chat Page — Gemini-Style Fixed Viewport Interface.
 * Non-scrollable outer page, smooth internal message stream, voice I/O.
 * Fully styled in Light Mode with Lucide icons and zero emojis.
 */

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Copy,
  Check,
  User,
  Bot,
  MapPin,
  Calendar,
  Users,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
import { useChatStream } from "@/lib/hooks/useChatStream";
import { useSpeech } from "@/lib/hooks/useSpeech";

export default function ChatPage() {
  const { messages, isStreaming, error, sendMessage, clearMessages } = useChatStream();
  const { isListening, isSpeaking, transcript, isSupported, startListening, stopListening, speak, stopSpeaking } = useSpeech();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside the messages container
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sync speech-to-text transcript
  useEffect(() => {
    if (transcript && inputRef.current) {
      inputRef.current.value = transcript;
    }
  }, [transcript]);

  const handleSend = () => {
    const val = inputRef.current?.value.trim();
    if (!val || isStreaming) return;
    void sendMessage(val);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const QUICK_PROMPTS = [
    { title: "Main Stage Location", text: "Where is the Main Stage located?", icon: MapPin },
    { title: "Keynote & AI Sessions", text: "Which sessions cover Artificial Intelligence and Cloud?", icon: Calendar },
    { title: "Food Concourse Crowd", text: "What is the current crowd occupancy at the Food Court?", icon: Users },
    { title: "Emergency & Safety", text: "What are the emergency contacts and medical desks?", icon: ShieldAlert },
  ];

  return (
    <div
      className="chat-viewport-locked"
      style={{
        height: "calc(100dvh - 4.5rem)",
        maxHeight: "calc(100dvh - 4.5rem)",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
        overflow: "hidden",
        position: "fixed",
        top: "4.5rem",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          height: "3.75rem",
          borderBottom: "1px solid var(--color-border)",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(8, 145, 178, 0.1))",
              border: "1px solid rgba(79, 70, 229, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-primary)",
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)" }}>
                EventIQ Concierge
              </span>
              <span className="badge badge-primary" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                Active Stream
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              Bangalore International Exhibition Centre Assistant
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isSupported && (
            <button
              onClick={isSpeaking ? stopSpeaking : () => {
                const last = [...messages].reverse().find((m) => m.role === "assistant");
                if (last) speak(last.content);
              }}
              className="btn btn-ghost btn-sm"
              title={isSpeaking ? "Mute audio response" : "Read response aloud"}
              aria-label={isSpeaking ? "Mute speech" : "Read speech"}
            >
              {isSpeaking ? <VolumeX size={16} color="var(--color-danger)" /> : <Volume2 size={16} />}
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="btn btn-ghost btn-sm"
              title="Clear conversation"
              aria-label="Clear chat history"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Center Messages Stream (Internal Scroll Only) */}
      <div
        role="log"
        aria-label="Chat messages"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {messages.length === 0 ? (
          /* Empty State / Welcome Screen (Gemini Style) */
          <div
            className="fade-in-up"
            style={{
              margin: "auto 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(8, 145, 178, 0.12))",
                border: "1px solid rgba(79, 70, 229, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
                marginBottom: "1.25rem",
              }}
            >
              <Sparkles size={32} />
            </div>

            <h1
              style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: "0.5rem",
              }}
            >
              How can I help you today?
            </h1>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "1rem",
                maxWidth: "500px",
                lineHeight: 1.6,
                marginBottom: "2.5rem",
              }}
            >
              Ask about session timings, speaker bios, hall directions, live crowd levels, or accessibility accommodations at BIEC.
            </p>

            {/* Quick Prompt Cards Grid */}
            <div className="grid-2" style={{ width: "100%", gap: "1rem", textAlign: "left" }}>
              {QUICK_PROMPTS.map((qp) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={qp.title}
                    type="button"
                    onClick={() => void sendMessage(qp.text)}
                    className="glass-card"
                    style={{
                      padding: "1.125rem 1.25rem",
                      background: "#ffffff",
                      cursor: "pointer",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "var(--radius-md)",
                          background: "var(--color-bg-3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-primary)",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                          {qp.title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                          {qp.text}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={16} color="var(--color-text-muted)" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Message List */
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                gap: "0.875rem",
                alignItems: "flex-start",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "assistant" && (
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(8, 145, 178, 0.1))",
                    border: "1px solid rgba(79, 70, 229, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-primary)",
                    flexShrink: 0,
                    marginTop: "4px",
                  }}
                >
                  <Bot size={18} />
                </div>
              )}

              <div
                style={{
                  maxWidth: "80%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    padding: "0.875rem 1.25rem",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background:
                      msg.role === "user"
                        ? "var(--color-primary)"
                        : "#ffffff",
                    color: msg.role === "user" ? "#ffffff" : "var(--color-text-primary)",
                    border:
                      msg.role === "assistant"
                        ? "1px solid var(--color-border)"
                        : "none",
                    boxShadow: "var(--shadow-sm)",
                    fontSize: "0.925rem",
                    lineHeight: 1.65,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                  {msg.isStreaming && (
                    <span
                      style={{
                        display: "inline-block",
                        width: "8px",
                        height: "16px",
                        background: "var(--color-primary)",
                        marginLeft: "4px",
                        verticalAlign: "middle",
                        animation: "spin 1s step-start infinite",
                      }}
                    />
                  )}
                </div>

                {/* Assistant Message Actions */}
                {msg.role === "assistant" && !msg.isStreaming && (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "0.35rem",
                      paddingLeft: "0.25rem",
                    }}
                  >
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}
                      title="Copy response"
                      aria-label="Copy to clipboard"
                    >
                      {copiedId === msg.id ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
                    </button>
                    {isSupported && (
                      <button
                        onClick={() => speak(msg.content)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}
                        title="Read response aloud"
                        aria-label="Speak text"
                      >
                        <Volume2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "var(--color-bg-3)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-text-secondary)",
                    flexShrink: 0,
                    marginTop: "4px",
                  }}
                >
                  <User size={18} />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Pinned Bottom Input Pill Container (Gemini Style) */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          background: "#ffffff",
          padding: "1rem 1.5rem 1.25rem",
          flexShrink: 0,
        }}
      >
        <div style={{ maxWidth: "850px", margin: "0 auto" }}>
          {error && (
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--color-danger)",
                marginBottom: "0.75rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {isListening && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                color: "var(--color-danger)",
                marginBottom: "0.5rem",
              }}
            >
              <div className="pulse-danger" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-danger)" }} />
              Listening to voice input... speak now
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f8fafc",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-full)",
              padding: "0.35rem 0.5rem 0.35rem 1.25rem",
              boxShadow: "var(--shadow-sm)",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask EventIQ anything about the summit, venue, or schedule..."
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "0.95rem",
                color: "var(--color-text-primary)",
                padding: "0.5rem 0",
              }}
              aria-label="Message input"
            />

            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              {isSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  type="button"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "none",
                    background: isListening ? "rgba(220, 38, 38, 0.1)" : "transparent",
                    color: isListening ? "var(--color-danger)" : "var(--color-text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}
                  title={isListening ? "Stop listening" : "Start voice input"}
                  aria-label="Toggle voice input"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}

              <button
                onClick={handleSend}
                disabled={isStreaming}
                type="button"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--color-primary)",
                  color: "#ffffff",
                  cursor: isStreaming ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isStreaming ? 0.6 : 1,
                  transition: "transform 0.15s ease",
                }}
                title="Send message"
                aria-label="Send message"
              >
                {isStreaming ? <div className="spinner" style={{ width: "16px", height: "16px", borderTopColor: "#ffffff" }} /> : <Send size={16} />}
              </button>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              marginTop: "0.6rem",
            }}
          >
            EventIQ Assistant provides live venue guidance and session schedules. Dial 112 for urgent emergency support.
          </div>
        </div>
      </div>
    </div>
  );
}
