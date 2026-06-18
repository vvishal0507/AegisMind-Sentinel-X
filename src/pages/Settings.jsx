import { KeyRound, ServerCog, Wifi } from "lucide-react";

export default function Settings({ context }) {
  const { connection } = context;
  const cards = [
    { icon: ServerCog, title: "Backend API", value: import.meta.env.VITE_API_BASE_URL || "/api" },
    { icon: Wifi, title: "WebSocket", value: import.meta.env.VITE_WS_URL || "/ws/threats" },
    { icon: KeyRound, title: "Auth Mode", value: "JWT bearer token ready" }
  ];
  return (
    <div className="space-y-4">
      <section className="glass rounded p-5">
        <p className="mb-1 text-sm font-bold uppercase text-cyanline">Settings</p>
        <h2 className="text-2xl font-black text-white">Command center integration and runtime posture</h2>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map(({ icon: Icon, title, value }) => (
          <div key={title} className="glass rounded p-4">
            <Icon className="mb-4 text-cyanline" size={22} />
            <p className="mb-1 text-sm font-bold text-white">{title}</p>
            <p className="break-words text-sm text-slate-400">{value}</p>
          </div>
        ))}
      </section>
      <section className="glass rounded p-4">
        <p className="mb-2 font-bold text-white">Live stream state</p>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className={`status-dot ${connection === "online" ? "bg-signal" : "bg-amber"}`} />
          {connection}
        </div>
      </section>
    </div>
  );
}
