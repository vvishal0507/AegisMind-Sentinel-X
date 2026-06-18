import { BrainCircuit, FileText } from "lucide-react";

export default function AIReasoningPanel({ reasoning }) {
  const recommendations = reasoning?.recommendations || [];
  const behaviors = reasoning?.attack_behavior || [];
  return (
    <section className="glass rounded p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">AI Security Analyst</h2>
        <BrainCircuit className="text-cyanline" size={20} />
      </div>
      <p className="mb-4 text-sm leading-6 text-slate-300">
        {reasoning?.executive_summary || "The analyst is correlating agent findings, MITRE behaviors, and risk drivers."}
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded border border-slate-700/60 bg-slate-950/35 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
            <FileText size={16} className="text-signal" />
            Attack Behavior
          </div>
          <ul className="space-y-2 text-xs leading-5 text-slate-400">
            {(behaviors.length ? behaviors : ["No confirmed ATT&CK behavior has been elevated."]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded border border-slate-700/60 bg-slate-950/35 p-3">
          <p className="mb-2 text-sm font-bold text-white">Recommendations</p>
          <ul className="space-y-2 text-xs leading-5 text-slate-400">
            {(recommendations.length ? recommendations : ["Continue monitoring live telemetry and enrich new detections."]).slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
