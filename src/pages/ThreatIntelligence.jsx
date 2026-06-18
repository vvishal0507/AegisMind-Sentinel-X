import { useState } from "react";
import { Globe2, Search } from "lucide-react";
import ThreatIntelPanel from "../components/ThreatIntelPanel.jsx";

export default function ThreatIntelligence({ context }) {
  const { api, intel } = context;
  const [ioc, setIoc] = useState(intel?.ioc || "185.220.101.4");
  const [iocType, setIocType] = useState("ip");
  const [result, setResult] = useState(intel);

  async function lookup() {
    const response = await api.get("/threat-intelligence", { params: { ioc, ioc_type: iocType } });
    setResult(response.data);
  }

  return (
    <div className="space-y-4">
      <section className="glass rounded p-5">
        <p className="mb-1 text-sm font-bold uppercase text-cyanline">Threat Intelligence</p>
        <h2 className="text-2xl font-black text-white">IOC reputation, domain analysis, and external connector view</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_12rem_auto]">
          <div className="flex h-11 items-center gap-2 rounded border border-slate-700 bg-slate-950/50 px-3">
            <Globe2 size={17} className="text-slate-500" />
            <input value={ioc} onChange={(event) => setIoc(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none" />
          </div>
          <select value={iocType} onChange={(event) => setIocType(event.target.value)} className="h-11 rounded border border-slate-700 bg-slate-950/80 px-3 text-sm text-white outline-none">
            <option value="ip">IP Address</option>
            <option value="domain">Domain</option>
          </select>
          <button onClick={lookup} className="inline-flex h-11 items-center justify-center gap-2 rounded border border-cyanline/40 bg-cyanline/10 px-4 text-sm font-bold text-cyan-100 hover:bg-cyanline/20">
            <Search size={17} />
            Check IOC
          </button>
        </div>
      </section>
      <ThreatIntelPanel intel={result || intel} />
    </div>
  );
}
