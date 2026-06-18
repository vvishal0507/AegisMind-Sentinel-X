import { Bot, ChartNoAxesCombined, Crosshair, Gauge, RadioTower, Settings, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/analysis", label: "Threat Analysis", icon: Crosshair },
  { to: "/insights", label: "Insights", icon: ChartNoAxesCombined },
  { to: "/agents", label: "AI Agents", icon: Bot },
  { to: "/intel", label: "Threat Intel", icon: RadioTower },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 shrink-0 overflow-hidden rounded glass lg:block">
      <div className="grid-surface relative h-full p-3">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyanline/10 to-transparent" />
        <div className="relative mb-4 flex items-center gap-2 rounded border border-slate-700/60 bg-slate-950/40 p-3">
          <Shield className="text-signal" size={22} />
          <div>
            <p className="text-sm font-bold text-white">Sentinel SOC</p>
            <p className="text-xs text-slate-400">Autonomous defense mesh</p>
          </div>
        </div>
        <nav className="relative space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded px-3 text-sm font-semibold transition ${
                  isActive ? "bg-cyanline/14 text-cyan-100 shadow-cyan" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-3 left-3 right-3 rounded border border-signal/20 bg-signal/8 p-3 text-xs text-slate-300">
          <p className="mb-1 font-bold text-signal">Defense posture</p>
          <p>Continuous monitoring, agent reasoning, and live MITRE mapping are active.</p>
        </div>
      </div>
    </aside>
  );
}
