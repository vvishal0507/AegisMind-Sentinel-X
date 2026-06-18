import { useState } from "react";
import { Search, ShieldAlert } from "lucide-react";
import AIReasoningPanel from "../components/AIReasoningPanel.jsx";
import MitreAttackPanel from "../components/MitreAttackPanel.jsx";
import ThreatCard from "../components/ThreatCard.jsx";

export default function ThreatAnalysis({ context }) {
  const { threats, reasoning, mitre, runAnalysis } = context;
  const [filter, setFilter] = useState("");
  const filtered = threats.filter((threat) => JSON.stringify(threat).toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-4">
      <section className="glass rounded p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-sm font-bold uppercase text-cyanline">Threat Analysis</p>
            <h2 className="text-2xl font-black text-white">Correlated detections and analyst reasoning</h2>
          </div>
          <button onClick={runAnalysis} className="inline-flex h-10 items-center gap-2 rounded border border-danger/40 bg-danger/10 px-3 text-sm font-bold text-red-100 hover:bg-danger/20">
            <ShieldAlert size={17} />
            Run Detection
          </button>
        </div>
        <div className="mt-4 flex h-11 items-center gap-2 rounded border border-slate-700 bg-slate-950/50 px-3">
          <Search size={17} className="text-slate-500" />
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Filter by IP, technique, severity, or event type"
          />
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-3">
          {(filtered.length ? filtered : threats).slice(0, 12).map((threat, index) => (
            <ThreatCard key={`${threat.id || threat.threat_family || "analysis"}-${index}`} threat={threat} />
          ))}
        </div>
        <div className="space-y-4">
          <AIReasoningPanel reasoning={reasoning} />
          <MitreAttackPanel mappings={mitre} />
        </div>
      </section>
    </div>
  );
}
