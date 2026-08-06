import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function ReportsPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="rounded-[20px] border border-white/10 bg-[#101114]/90 p-8">
        <h1 className="text-2xl font-semibold text-white">Reports</h1>
        <p className="mt-2 text-sm text-white/60">Generate financial and operational reports.</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => alert('Generating report (stub)')}>Generate</Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back</Button>
        </div>
      </div>
    </div>
  );
}
