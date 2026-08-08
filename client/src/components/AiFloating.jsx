import { useState } from "react";
import ChatPanel from "./ChatPanel";
import { MessageCircle } from "lucide-react";

export default function AiFloating() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="fixed right-6 bottom-6 z-50">
        <button onClick={() => setOpen((s) => !s)} className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 shadow-lg text-white">
          <MessageCircle size={18} /> DineMate AI
        </button>
      </div>
      {open && <ChatPanel onClose={() => setOpen(false)} />}
    </div>
  );
}
