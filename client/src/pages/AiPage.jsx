import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, BrainCircuit, TrendingUp, Boxes, Users, ArrowRight } from "lucide-react";
import SectionCard from "../components/SectionCard";
import Button from "../components/Button";
import { dashboardService } from "../services/api";
import ReactMarkdown from "react-markdown";

export default function AiPage() {
  const [insights, setInsights] = useState(null);
  useEffect(() => {
    dashboardService.getAiAssistant().then(setInsights);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/10 bg-[#101114]/90 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">AI Assistant</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">The flagship intelligence workspace</h1>
            <p className="mt-2 text-sm text-white/60">Every recommendation is presented as a premium insight card with metrics, explainability, and business context.</p>
          </div>
          <Button><Sparkles size={16} className="mr-2" />Ask DineMate</Button>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Conversation workspace" subtitle="AI chat experience with rich recommendations">
          <div className="rounded-3xl border border-white/10 bg-[#121317] p-4">
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <ReactMarkdown>{insights?.summary || "### Revenue forecast\nThe restaurant is projected to grow revenue by **14.2%** next week based on reservations, weather, and historical traffic.\n\n- Forecast window: Friday-Sunday\n- Inventory risk: salmon and truffle oil\n- Guest strategy: premium wine pairing upsell"}</ReactMarkdown>
            </div>
            <div className="mt-4 flex gap-2">
              {['Revenue forecast', 'Inventory prediction', 'Guest segmentation'].map((prompt) => (
                <button key={prompt} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{prompt}</button>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Recommended actions" subtitle="Smart notifications and business insights">
          <div className="space-y-3">
            {[
              { icon: TrendingUp, title: 'Revenue uplift', body: 'Add a premium tasting flight to increase average spend.' },
              { icon: Boxes, title: 'Inventory health', body: 'Reorder truffle oil before Friday service.' },
              { icon: Users, title: 'Customer segmentation', body: 'Weekend regulars prefer chef’s table experiences.' },
            ].map((item) => (
              <div key={item.title} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-white">
                  <item.icon size={16} className="text-emerald-400" /> {item.title}
                </div>
                <p className="mt-2 text-sm text-white/60">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
