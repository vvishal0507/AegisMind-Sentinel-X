import { Activity, ShieldAlert } from "lucide-react";

const ringColor = {
  low: "from-signal to-cyanline",
  medium: "from-amber to-cyanline",
  high: "from-orange-400 to-amber",
  critical: "from-danger to-orange-400"
};

export default function RiskScore({ risk }) {
  const score = Math.round(risk?.score || 0);
  const level = risk?.level || "low";
  return (
    <section className="glass rounded p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">Enterprise Risk</h2>
        <ShieldAlert className="text-cyanline" size={20} />
      </div>
      <div className="flex items-center gap-5">
        <div className={`relative grid h-32 w-32 shrink-0 place-items-center rounded-full bg-gradient-to-br ${ringColor[level] || ringColor.low} p-1 shadow-glow`}>
          <div className="grid h-full w-full place-items-center rounded-full bg-slate-950">
            <div className="text-center">
              <p className="text-4xl font-black text-white">{score}</p>
              <p className="text-xs uppercase text-slate-400">risk score</p>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Activity size={16} className="text-signal" />
            <span className="text-sm font-bold uppercase text-white">{level}</span>
          </div>
          <p className="text-sm leading-6 text-slate-300">
            Current posture is calculated from anomaly severity, agent confidence, IOC reputation, and MITRE technique correlation.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded bg-slate-800">
            <div className="h-full rounded bg-gradient-to-r from-signal via-cyanline to-danger" style={{ width: `${Math.max(4, score)}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
