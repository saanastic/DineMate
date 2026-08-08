import { useEffect, useRef, useState } from "react";
import { assistantService } from "../services/api";
import { Send, X } from "lucide-react";

export default function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "system",
      content:
        "Hello! I'm DineMate AI. Ask me about sales, kitchen, inventory, or menu.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await assistantService.chat({
        message: userMsg.content,
        conversationHistory: messages,
      });

      const reply =
        resp?.reply || resp || "I couldn't fetch an answer right now.";

      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (e) {
      console.error("Assistant error:", e);

      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Assistant unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const useExample = () => {
    setInput("What are today's sales?");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-[380px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="font-semibold text-white">DineMate AI</h2>
          <p className="text-xs text-white/50">
            Your restaurant operations assistant
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>

      {/* Example */}
      <div className="border-b border-white/10 px-4 py-3">
        <button
          onClick={useExample}
          className="text-xs text-white/60 transition hover:text-emerald-400"
        >
          Example: "What are today's sales?"
        </button>
      </div>

      {/* Messages */}
      <div className="max-h-64 overflow-y-auto space-y-3 p-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-md p-2 ${
              m.role === "assistant" || m.role === "system"
                ? "bg-white/5 text-white"
                : "bg-emerald-800/20 text-white/90"
            }`}
          >
            <div className="whitespace-pre-wrap text-sm">
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="rounded-md bg-white/5 p-2 text-sm text-white/50">
            DineMate AI is thinking...
          </div>
        )}

        <div ref={ref} />
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-white/10 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask DineMate AI..."
          disabled={loading}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-500/50"
        />

        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="rounded-lg bg-emerald-500 px-3 py-2 text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          {loading ? "..." : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
