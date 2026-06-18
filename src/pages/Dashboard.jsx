import AgentStatus from "../components/AgentStatus.jsx";
import AIReasoningPanel from "../components/AIReasoningPanel.jsx";
import AlertPanel from "../components/AlertPanel.jsx";
import LiveThreatStream from "../components/LiveThreatStream.jsx";
import MitreAttackPanel from "../components/MitreAttackPanel.jsx";
import RiskScore from "../components/RiskScore.jsx";
import ThreatCard from "../components/ThreatCard.jsx";
import ThreatChart from "../components/ThreatChart.jsx";
import ThreatIntelPanel from "../components/ThreatIntelPanel.jsx";
import ThreatMap from "../components/ThreatMap.jsx";

export default function Dashboard({ context }) {
  const { threats, risk, agents, reasoning, mitre, intel, alerts, connection, loading } = context;
  const activeThreats = threats.slice(0, 4);

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass overflow-hidden rounded p-5">
          <div className="relative">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full border border-cyanline/20" />
            <p className="mb-2 text-sm font-bold uppercase text-cyanline">Operational Overview</p>
            <h2 className="max-w-3xl text-2xl font-black text-white sm:text-3xl">Cyber defense telemetry, AI reasoning, and live response in one SOC view.</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric label="Active Threats" value={Math.max(activeThreats.length, threats.length)} tone="danger" />
              <Metric label="AI Agents" value={agents.length} tone="signal" />
              <Metric label="Stream" value={connection} tone="cyan" />
            </div>
          </div>
        </div>
        <RiskScore risk={risk} />
      </section>

      <ThreatChart threats={threats} risk={risk} />

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr_0.9fr]">
        <div className="space-y-4">
          <ThreatMap />
          <LiveThreatStream alerts={alerts} connection={connection} />
        </div>
        <div className="space-y-4">
          <AgentStatus agents={agents} />
          <ThreatIntelPanel intel={intel} />
        </div>
        <div className="space-y-4">
          <section className="glass rounded p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">Active Threats</h2>
              <span className="text-xs text-slate-400">{loading ? "syncing" : "live"}</span>
            </div>
            <div className="space-y-3">
              {(activeThreats.length ? activeThreats : [{ threat_family: "reconnaissance", risk_hint: "medium", anomaly_score: 64, event: { source_ip: "45.83.64.12", destination_ip: "10.0.0.9", event_type: "network_scan" } }]).map((threat, index) => (
                <ThreatCard key={`${threat.id || threat.threat_family || "threat"}-${index}`} threat={threat} />
              ))}
            </div>
          </section>
          <AlertPanel alerts={alerts} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <AIReasoningPanel reasoning={reasoning} />
        <MitreAttackPanel mappings={mitre} />
      </section>
    </div>
  );
}

function Metric({ label, value, tone }) {
  const colors = {
    danger: "text-danger border-danger/20 bg-danger/8",
    signal: "text-signal border-signal/20 bg-signal/8",
    cyan: "text-cyanline border-cyanline/20 bg-cyanline/8"
  };
  return (
    <div className={`rounded border p-3 ${colors[tone]}`}>
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="mt-1 truncate text-2xl font-black text-white">{value}</p>
    </div>
  );
}
