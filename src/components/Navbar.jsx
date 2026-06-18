import { Activity, Bell, BrainCircuit, Radar, ShieldCheck } from "lucide-react";

const riskColor = {
  low: "text-signal",
  medium: "text-amber",
  high: "text-orange-400",
  critical: "text-danger"
};

export default function Navbar({ connection, risk, onAnalyze }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/40 bg-obsidian/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1680px] items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="AegisMind Sentinel logo" className="h-9 w-9 rounded" />
          <div className="min-w-0">
            <h1 className="truncate text-base font-black tracking-normal text-white sm:text-lg">AegisMind Sentinel</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Radar size={13} className="text-cyanline" />
              <span>AI Cyber Security Command Center</span>
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <div className="glass flex items-center gap-2 rounded px-3 py-2 text-sm">
            <span className={`status-dot ${connection === "online" ? "bg-signal" : connection === "connecting" ? "bg-amber" : "bg-danger"}`} />
            <span className="text-slate-300">Stream {connection}</span>
          </div>
          <div className="glass flex items-center gap-2 rounded px-3 py-2 text-sm">
            <Activity size={16} className={riskColor[risk.level] || "text-slate-300"} />
            <span className="text-slate-300">Risk</span>
            <strong className={riskColor[risk.level] || "text-white"}>{Math.round(risk.score || 0)}</strong>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAnalyze}
            className="inline-flex h-10 items-center gap-2 rounded border border-cyanline/40 bg-cyanline/10 px-3 text-sm font-semibold text-cyan-100 shadow-cyan transition hover:bg-cyanline/20"
            title="Run AI analysis"
          >
            <BrainCircuit size={17} />
            <span className="hidden sm:inline">Analyze</span>
          </button>
          <button className="hidden h-10 w-10 items-center justify-center rounded border border-slate-700 bg-slate-900/60 text-slate-300 transition hover:text-white sm:inline-flex" title="Notifications">
            <Bell size={17} />
          </button>
          <div className="hidden h-10 w-10 items-center justify-center rounded bg-signal/10 text-signal sm:flex" title="Protected">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
