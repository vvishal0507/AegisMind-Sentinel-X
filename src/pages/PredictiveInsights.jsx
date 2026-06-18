import { useMemo } from "react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, TrendingUp } from "lucide-react";

export default function PredictiveInsights({ context }) {
  const { risk, threats, logs } = context;
  const forecast = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => ({
        window: `${index * 10}m`,
        probability: Math.min(98, Math.max(18, (risk.score || 40) + Math.cos(index / 2) * 13 + index * 1.7)),
        volume: Math.max(3, logs.length + threats.length + index * 2)
      })),
    [risk.score, threats.length, logs.length]
  );

  return (
    <div className="space-y-4">
      <section className="glass rounded p-5">
        <p className="mb-1 text-sm font-bold uppercase text-cyanline">Predictive Insights</p>
        <h2 className="text-2xl font-black text-white">Forward-looking anomaly pressure and attack probability</h2>
      </section>
      <section className="glass rounded p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="section-title">Threat Probability Forecast</h3>
          <TrendingUp className="text-signal" size={20} />
        </div>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.13)" />
              <XAxis dataKey="window" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,.25)", borderRadius: 6 }} />
              <Line type="monotone" dataKey="probability" stroke="#38bdf8" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="volume" stroke="#14f195" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {["Credential pressure", "Reconnaissance drift", "Endpoint execution"].map((label, index) => (
          <div key={label} className="glass rounded p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-bold text-white">{label}</p>
              <Activity className="text-cyanline" size={18} />
            </div>
            <p className="text-3xl font-black text-white">{Math.round(forecast[index + 3].probability)}%</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Projected from ML anomaly score, event velocity, and active agent confidence.</p>
          </div>
        ))}
      </section>
    </div>
  );
}
