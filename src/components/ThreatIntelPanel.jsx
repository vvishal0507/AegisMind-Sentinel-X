import { Globe2, RadioTower, ShieldQuestion } from "lucide-react";

export default function ThreatIntelPanel({ intel }) {
  const reputation = intel?.reputation || "watchlist";
  return (
    <section className="glass rounded p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">Threat Intelligence</h2>
        <RadioTower className="text-cyanline" size={19} />
      </div>
      <div className="rounded border border-cyanline/20 bg-cyanline/8 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded bg-cyanline/12 text-cyanline">
            <Globe2 size={20} />
          </div>
          <div>
            <p className="font-bold text-white">{intel?.ioc || "185.220.101.4"}</p>
            <p className="text-xs uppercase text-slate-400">{intel?.ioc_type || "ip"} reputation</p>
          </div>
        </div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate-300">Reputation</span>
          <strong className={reputation === "malicious" ? "text-danger" : reputation === "suspicious" ? "text-amber" : "text-signal"}>{reputation}</strong>
        </div>
        <div className="mb-3 h-2 overflow-hidden rounded bg-slate-800">
          <div className="h-full rounded bg-gradient-to-r from-signal via-amber to-danger" style={{ width: `${intel?.score ?? 68}%` }} />
        </div>
        <div className="flex items-start gap-2 text-xs leading-5 text-slate-400">
          <ShieldQuestion size={15} className="mt-0.5 shrink-0 text-signal" />
          <span>{intel?.details || "IOC evaluated with local and external intelligence connectors."}</span>
        </div>
      </div>
    </section>
  );
}
