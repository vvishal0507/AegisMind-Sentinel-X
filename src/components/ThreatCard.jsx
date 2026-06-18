import { AlertTriangle, ArrowRight, Network, ShieldAlert } from "lucide-react";

const levelStyle = {
  low: "border-signal/30 bg-signal/8 text-signal",
  medium: "border-amber/30 bg-amber/10 text-amber",
  high: "border-orange-400/30 bg-orange-400/10 text-orange-300",
  critical: "border-danger/40 bg-danger/10 text-red-300"
};

function extractThreat(threat) {
  const event = threat.event || threat.raw_event || threat;
  return {
    source: event.source_ip || threat.source_ip || "unknown",
    destination: event.destination_ip || threat.destination_ip || "unknown",
    type: event.event_type || threat.event_type || threat.threat_family || "unknown",
    score: threat.anomaly_score || Math.round((threat.confidence || 0) * 100),
    level: threat.risk_hint || threat.threat_level || "medium",
    technique: threat.technique || threat.threat_family || "AI anomaly"
  };
}

export default function ThreatCard({ threat }) {
  const data = extractThreat(threat);
  return (
    <article className="glass rounded p-4 transition hover:border-cyanline/40">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-danger/10 text-danger">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="font-bold text-white">{data.technique}</p>
            <p className="text-xs uppercase text-slate-500">{data.type}</p>
          </div>
        </div>
        <span className={`rounded border px-2 py-1 text-xs font-bold ${levelStyle[data.level] || levelStyle.medium}`}>
          {data.level}
        </span>
      </div>
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
        <Network size={15} className="text-cyanline" />
        <span className="truncate">{data.source}</span>
        <ArrowRight size={14} className="text-slate-500" />
        <span className="truncate">{data.destination}</span>
      </div>
      <div className="flex items-center justify-between border-t border-slate-700/60 pt-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <AlertTriangle size={14} className="text-amber" />
          AI confidence
        </div>
        <strong className="text-sm text-white">{Math.round(data.score || 0)}%</strong>
      </div>
    </article>
  );
}
