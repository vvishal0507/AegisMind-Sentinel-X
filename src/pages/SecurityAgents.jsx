import AgentStatus from "../components/AgentStatus.jsx";

export default function SecurityAgents({ context }) {
  const { agents } = context;
  return (
    <div className="space-y-4">
      <section className="glass rounded p-5">
        <p className="mb-1 text-sm font-bold uppercase text-cyanline">Multi-Agent Defense</p>
        <h2 className="text-2xl font-black text-white">Specialized AI agents coordinating cyber security analysis</h2>
      </section>
      <AgentStatus agents={agents} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {agents.map((agent) => (
          <div key={agent.agent_name} className="glass rounded p-4">
            <p className="mb-2 text-sm font-bold text-white">{agent.agent_name}</p>
            <p className="mb-4 text-xs leading-5 text-slate-400">{agent.recommendation}</p>
            <div className="text-2xl font-black text-cyanline">{Math.round((agent.confidence || 0) * 100)}%</div>
            <p className="text-xs uppercase text-slate-500">confidence</p>
          </div>
        ))}
      </section>
    </div>
  );
}
