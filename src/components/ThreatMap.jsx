import { useEffect, useState } from "react";

const riskFill = {
  low: "#14f195",
  medium: "#f59e0b",
  high: "#fb923c",
  critical: "#ef4444"
};

export default function ThreatMap() {
  const [map, setMap] = useState({ nodes: [], links: [] });

  useEffect(() => {
    fetch("/threat-map.json")
      .then((response) => response.json())
      .then(setMap)
      .catch(() => setMap({ nodes: [], links: [] }));
  }, []);

  const nodeById = new Map(map.nodes.map((node) => [node.id, node]));

  return (
    <section className="glass rounded p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">Threat Map</h2>
        <span className="text-xs text-slate-400">sensor mesh</span>
      </div>
      <div className="grid-surface relative h-[320px] overflow-hidden rounded border border-slate-700/60 bg-slate-950/40">
        <div className="absolute inset-x-0 top-0 h-28 animate-scan bg-gradient-to-b from-transparent via-cyanline/10 to-transparent" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {map.links.map((link) => {
            const source = nodeById.get(link.source);
            const target = nodeById.get(link.target);
            if (!source || !target) return null;
            return (
              <line
                key={`${link.source}-${link.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="rgba(56, 189, 248, 0.42)"
                strokeWidth={Math.max(0.4, link.intensity / 70)}
                strokeDasharray="2 2"
              />
            );
          })}
          {map.nodes.map((node) => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r="4.8" fill={riskFill[node.risk] || riskFill.low} opacity="0.22" className="animate-pulse-ring" />
              <circle cx={node.x} cy={node.y} r="2.1" fill={riskFill[node.risk] || riskFill.low} />
            </g>
          ))}
        </svg>
        {map.nodes.map((node) => (
          <div
            key={node.id}
            className="absolute max-w-[9rem] rounded border border-slate-700/70 bg-slate-950/80 px-2 py-1 text-xs text-slate-200"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(8px, -50%)" }}
          >
            {node.label}
          </div>
        ))}
      </div>
    </section>
  );
}
