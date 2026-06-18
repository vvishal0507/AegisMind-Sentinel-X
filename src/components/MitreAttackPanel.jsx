import { Crosshair } from "lucide-react";

export default function MitreAttackPanel({ mappings = [] }) {
  const unique = Array.from(new Map(mappings.map((item) => [item.attack_id, item])).values()).filter((item) => item.attack_id);
  return (
    <section className="glass rounded p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">MITRE ATT&CK Techniques</h2>
        <Crosshair className="text-danger" size={19} />
      </div>
      <div className="space-y-3">
        {(unique.length ? unique : [{ attack_id: "T1110", technique: "Brute Force", description: "Repeated authentication attempts against protected accounts." }]).map((mapping) => (
          <article key={`${mapping.attack_id}-${mapping.technique}`} className="rounded border border-slate-700/60 bg-slate-950/35 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <strong className="text-sm text-white">{mapping.technique}</strong>
              <span className="rounded bg-danger/12 px-2 py-1 text-xs font-black text-red-300">{mapping.attack_id}</span>
            </div>
            <p className="text-xs leading-5 text-slate-400">{mapping.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
