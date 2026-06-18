import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = {
  low: "#14f195",
  medium: "#f59e0b",
  high: "#fb923c",
  critical: "#ef4444"
};

export default function ThreatChart({ threats = [], risk }) {
  const timeline = Array.from({ length: 10 }).map((_, index) => ({
    name: `${index + 1}`,
    risk: Math.max(12, Math.min(98, (risk?.score || 45) + Math.sin(index) * 12 + index * 2)),
    alerts: Math.max(1, Math.round((threats.length + index) % 7) + 1)
  }));

  const distribution = ["low", "medium", "high", "critical"].map((level) => ({
    level,
    count: threats.filter((threat) => (threat.risk_hint || threat.threat_level || "medium") === level).length + (level === risk?.level ? 2 : 0)
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
      <section className="glass rounded p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Threat Pressure</h2>
          <span className="text-xs text-slate-400">rolling AI score</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#14f195" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.13)" />
              <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,.25)", borderRadius: 6 }} />
              <Area type="monotone" dataKey="risk" stroke="#38bdf8" fill="url(#riskFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="glass rounded p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Severity Mix</h2>
          <span className="text-xs text-slate-400">active detections</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.13)" />
              <XAxis dataKey="level" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,.25)", borderRadius: 6 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {distribution.map((entry) => (
                  <Cell key={entry.level} fill={colors[entry.level]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
