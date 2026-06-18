import { useMemo } from "react";
import { Radio, Zap } from "lucide-react";

export default function LiveThreatStream({ alerts = [], connection }) {
  const rows = useMemo(() => alerts.slice(0, 8), [alerts]);
  return (
    <section className="glass rounded p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">Live Threat Stream</h2>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className={`status-dot ${connection === "online" ? "bg-signal" : "bg-amber"}`} />
          {connection}
        </div>
      </div>
      <div className="space-y-2">
        {(rows.length ? rows : [{ id: "quiet", event: "STREAM_READY", timestamp: new Date().toISOString(), payload: { message: "Awaiting live backend events." } }]).map((row) => (
          <div key={row.id} className="flex items-center gap-3 rounded border border-slate-700/60 bg-slate-950/35 p-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded bg-cyanline/10 text-cyanline">
              {row.event === "NEW_THREAT" ? <Zap size={15} /> : <Radio size={15} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{row.event}</p>
              <p className="truncate text-xs text-slate-400">{row.payload?.message || row.payload?.risk_hint || row.payload?.executive_summary || "Signal received."}</p>
            </div>
            <span className="shrink-0 text-xs text-slate-500">{new Date(row.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
