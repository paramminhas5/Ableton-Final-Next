"use client";
/**
 * BeatCoach — AI tutor widget.
 *
 * Exports:
 *  - FloatingCoachButton  — fixed bottom-right button for lesson pages
 *  - CoachPanel           — full persistent chat panel (used by Dashboard too)
 *  - BeatCoach            — legacy inline widget (backward compat)
 *  - useBeatCoach         — hook for wrong-answer tracking (backward compat)
 *
 * Powered by Kimi API via /api/beat-coach.
 */
import { useState, useRef, useEffect, useCallback } from "react";

// ─── CoachPanel ───────────────────────────────────────────────────────────────
export function CoachPanel({ context, onClose }: { context: string; onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: "coach" | "user"; text: string }[]>([
    { role: "coach", text: "Hi! I'm Beat Coach 🎧 Ask me anything about this lesson — I'm here to help, not give away answers." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/beat-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, question: q }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "coach", text: data.reply ?? "Keep practicing — you're getting there!" }]);
    } catch {
      setMessages(prev => [...prev, { role: "coach", text: "Beat Coach is offline right now. Try re-reading the lesson!" }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, context]);

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[340px] brutal-border bg-bone brutal-shadow flex flex-col max-h-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 brutal-border border-x-0 border-t-0 bg-volt text-bone shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎧</span>
          <div>
            <div className="font-display text-base leading-none">Beat Coach</div>
            <div className="font-mono text-[9px] opacity-70">Kimi AI · Music Tutor</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="brutal-border bg-bone/20 text-bone w-7 h-7 flex items-center justify-center font-mono text-xs brutal-press"
          aria-label="Close Beat Coach"
        >
          ✕
        </button>
      </div>

      {/* Context pill */}
      <div className="px-3 py-2 brutal-border border-x-0 border-t-0 font-mono text-[9px] opacity-50 bg-bone/50 shrink-0 truncate">
        📍 {context}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`brutal-border px-3 py-2 font-mono text-xs leading-relaxed max-w-[85%] ${
              m.role === "coach" ? "bg-volt text-bone" : "bg-bone text-ink"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="brutal-border bg-volt text-bone px-3 py-2 font-mono text-xs">
              <span className="animate-pulse">🎧 thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-0 brutal-border border-x-0 border-b-0 shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything…"
          disabled={loading}
          className="flex-1 brutal-border border-y-0 border-l-0 bg-bone px-3 py-2.5 font-mono text-xs focus:outline-none focus:bg-sun/20 disabled:opacity-50"
          aria-label="Message Beat Coach"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="brutal-border border-y-0 border-r-0 bg-volt text-bone px-4 font-mono text-xs uppercase brutal-press disabled:opacity-40"
          aria-label="Send message"
        >
          {loading ? "…" : "→"}
        </button>
      </div>
    </div>
  );
}

// ─── FloatingCoachButton ──────────────────────────────────────────────────────
export function FloatingCoachButton({ context }: { context: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 brutal-border bg-volt text-bone w-14 h-14 flex items-center justify-center text-2xl brutal-press brutal-shadow hover:bg-volt/90 transition-colors"
        aria-label="Open Beat Coach"
        title="Ask Beat Coach"
      >
        🎧
      </button>
      {open && <CoachPanel context={context} onClose={() => setOpen(false)} />}
    </>
  );
}

// ─── Legacy BeatCoach (backward compat) ──────────────────────────────────────
interface Props {
  /** Current lesson/concept context — title + tagline */
  context: string;
  /** The specific question the student is struggling with */
  question?: string;
  /** Wrong answer(s) they gave */
  wrongAnswers?: string[];
  /** If true, shows in "triggered" mode (auto-opened after 3 wrong) */
  autoOpen?: boolean;
  onClose?: () => void;
}

const COACH_STARTERS = [
  "Here's what's happening:",
  "Great question actually —",
  "Let's break this down:",
  "Think of it this way:",
  "The key concept here is:",
];

function CoachAvatar() {
  return (
    <div
      className="w-12 h-12 brutal-border bg-volt text-bone flex items-center justify-center font-display text-2xl shrink-0"
      aria-hidden="true"
    >
      🎧
    </div>
  );
}

export function BeatCoach({ context, question, wrongAnswers, autoOpen, onClose }: Props) {
  const [open, setOpen] = useState(autoOpen ?? false);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [customQ, setCustomQ] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ask = async (q?: string) => {
    const questionToAsk = q ?? customQ ?? question ?? "";
    if (!questionToAsk && !context) return;
    setLoading(true);
    setError(false);
    setReply(null);
    try {
      const res = await fetch("/api/beat-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          question: questionToAsk,
          wrongAnswers: wrongAnswers ?? [],
        }),
      });
      const data = await res.json();
      setReply(data.reply ?? "Keep at it — check the concept section again.");
    } catch {
      setError(true);
      setReply("Beat Coach is offline right now. Try the 'Got It' button to re-read the concept.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (question && !reply) ask(question);
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="brutal-border bg-volt text-bone px-4 py-2.5 font-mono text-xs uppercase brutal-press flex items-center gap-2 w-full md:w-auto"
        aria-label="Ask Beat Coach for help"
      >
        🎧 Ask Beat Coach
      </button>
    );
  }

  return (
    <div
      className="brutal-border bg-ink text-bone p-5 space-y-4"
      role="complementary"
      aria-label="Beat Coach AI tutor"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CoachAvatar />
          <div>
            <div className="font-display text-xl">Beat Coach</div>
            <div className="font-mono text-[9px] uppercase opacity-50">Kimi AI · Music Tutor</div>
          </div>
        </div>
        <button
          onClick={() => { setOpen(false); onClose?.(); }}
          className="brutal-border bg-bone/10 px-3 py-1.5 font-mono text-xs uppercase brutal-press hover:bg-bone/20"
          aria-label="Close Beat Coach"
        >
          ✕
        </button>
      </div>

      {/* Context pill */}
      <div className="brutal-border bg-bone/10 px-3 py-2 font-mono text-[10px] opacity-70 leading-relaxed">
        📍 {context}
        {question && (
          <div className="mt-1 opacity-60">
            Q: {question.slice(0, 100)}{question.length > 100 ? "…" : ""}
          </div>
        )}
      </div>

      {/* Reply area */}
      <div className="brutal-border bg-volt/20 p-4 min-h-[80px] font-mono text-sm leading-relaxed">
        {loading ? (
          <div className="flex items-center gap-2 opacity-70">
            <span className="animate-pulse">🎧</span>
            <span>Beat Coach is thinking…</span>
          </div>
        ) : reply ? (
          <div>
            <span className="text-volt font-bold">
              {COACH_STARTERS[Math.floor(Math.random() * COACH_STARTERS.length)]}
            </span>{" "}
            {reply}
          </div>
        ) : (
          <div className="opacity-40">Ask me anything about this lesson…</div>
        )}
      </div>

      {/* Custom question input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={customQ}
          onChange={e => setCustomQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ask()}
          placeholder="Ask a follow-up question…"
          className="flex-1 brutal-border bg-bone text-ink px-3 py-2 font-mono text-sm focus:outline-none focus:bg-sun/20"
          aria-label="Ask a question to Beat Coach"
          disabled={loading}
        />
        <button
          onClick={() => ask()}
          disabled={loading || (!customQ && !question)}
          className="brutal-border bg-volt text-bone px-4 py-2 font-mono text-xs uppercase brutal-press disabled:opacity-40"
          aria-label="Submit question"
        >
          {loading ? "…" : "Ask →"}
        </button>
      </div>

      {error && (
        <div className="font-mono text-[10px] text-hot uppercase opacity-70">
          ⚠ Kimi API offline — answer cached locally
        </div>
      )}

      <div className="font-mono text-[9px] uppercase opacity-30">
        Powered by Kimi AI · Beat Coach won&apos;t give away answers
      </div>
    </div>
  );
}

// ─── useBeatCoach hook (backward compat) ─────────────────────────────────────
export function useBeatCoach() {
  const [wrongCount, setWrongCount] = useState(0);
  const [showCoach, setShowCoach] = useState(false);

  const onWrong = () => {
    setWrongCount(c => {
      const next = c + 1;
      if (next >= 3) setShowCoach(true);
      return next;
    });
  };

  const onCorrect = () => {
    setWrongCount(0);
    setShowCoach(false);
  };

  const dismiss = () => setShowCoach(false);

  return { wrongCount, showCoach, onWrong, onCorrect, dismissCoach: dismiss };
}
