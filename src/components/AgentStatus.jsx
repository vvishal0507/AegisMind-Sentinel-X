import { Bot, CheckCircle2, CircleAlert } from "lucide-react";

const levelColors = {
  low: "text-signal bg-signal/10 border-signal/20",
  medium: "text-amber bg-amber/10 border-amber/20",
  high: "text-orange-300 bg-orange-400/10 border-orange-400/20",
  critical: "text-red-300 bg-danger/10 border-danger/20"
};

export default function AgentStatus({ agents = [] }) {
  return (
    <section className="glass rounded p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">AI Agent Status</h2>
        <Bot className="text-cyanline" size={19} />
      </div>
      <div className="space-y-3">
        {agents.map((agent) => (
          <div key={agent.agent_name} className="rounded border border-slate-700/60 bg-slate-950/35 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {agent.threat_level === "low" ? <CheckCircle2 className="shrink-0 text-signal" size={17} /> : <CircleAlert className="shrink-0 text-amber" size={17} />}
                <p className="truncate text-sm font-bold text-white">{agent.agent_name}</p>
              </div>
              <span className={`rounded border px-2 py-1 text-xs font-bold ${levelColors[agent.threat_level] || levelColors.medium}`}>
                {agent.threat_level}
              </span>
            </div>
            <p className="mb-2 text-xs leading-5 text-slate-400">{agent.analysis}</p>
            <div className="h-1.5 overflow-hidden rounded bg-slate-800">
              <div className="h-full rounded bg-cyanline" style={{ width: `${Math.round((agent.confidence || 0) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
