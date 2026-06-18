import { BellRing, Radio } from "lucide-react";

export default function AlertPanel({ alerts = [] }) {
  return (
    <section className="glass rounded p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">Real-Time Alerts</h2>
        <BellRing className="text-amber" size={18} />
      </div>
      <div className="max-h-80 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
        {alerts.length === 0 ? (
          <div className="rounded border border-slate-700/60 bg-slate-950/35 p-4 text-sm text-slate-400">
            Live alert stream is quiet.
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="rounded border border-slate-700/60 bg-slate-950/35 p-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Radio size={15} className="text-cyanline" />
                  {alert.event}
                </div>
                <span className="text-xs text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="line-clamp-2 text-xs leading-5 text-slate-400">
                {alert.payload?.message || alert.payload?.executive_summary || alert.payload?.risk_hint || "Security event received from live stream."}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
