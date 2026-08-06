import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function HelpPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="rounded-[20px] border border-white/10 bg-[#101114]/90 p-8">
        <h1 className="text-2xl font-semibold text-white">Help Center</h1>
        <p className="mt-2 text-sm text-white/60">Access docs and support resources.</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => window.open('https://example.com', '_blank')}>Open docs</Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back</Button>
        </div>
      </div>
    </div>
  );
}
