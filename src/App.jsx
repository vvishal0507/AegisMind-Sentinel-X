import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ThreatAnalysis from "./pages/ThreatAnalysis.jsx";
import PredictiveInsights from "./pages/PredictiveInsights.jsx";
import SecurityAgents from "./pages/SecurityAgents.jsx";
import ThreatIntelligence from "./pages/ThreatIntelligence.jsx";
import Settings from "./pages/Settings.jsx";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000
});

const initialAgents = [
  { agent_name: "Network Analysis Agent", threat_level: "low", confidence: 0.91, analysis: "Watching east-west traffic and exposed services.", recommendation: "Continue baseline monitoring." },
  { agent_name: "Malware Detection Agent", threat_level: "low", confidence: 0.88, analysis: "Endpoint process telemetry is stable.", recommendation: "Keep EDR policies enforced." },
  { agent_name: "Authentication Agent", threat_level: "medium", confidence: 0.73, analysis: "Identity telemetry shows mild authentication pressure.", recommendation: "Review failed-login clusters." },
  { agent_name: "Threat Intelligence Agent", threat_level: "medium", confidence: 0.76, analysis: "IOC reputation feed has watchlist activity.", recommendation: "Enrich open alerts." },
  { agent_name: "Risk Assessment Agent", threat_level: "medium", confidence: 0.82, analysis: "Composite enterprise risk is elevated but contained.", recommendation: "Prioritize high-confidence detections.", risk_score: 46 }
];

export default function App() {
  const [threats, setThreats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [risk, setRisk] = useState({ score: 46, level: "medium", drivers: initialAgents });
  const [agents, setAgents] = useState(initialAgents);
  const [reasoning, setReasoning] = useState(null);
  const [mitre, setMitre] = useState([]);
  const [intel, setIntel] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [connection, setConnection] = useState("connecting");
  const [loading, setLoading] = useState(true);

  const pushAlert = useCallback((event, payload) => {
    const message = {
      id: `${Date.now()}-${Math.random()}`,
      event,
      payload,
      timestamp: new Date().toISOString()
    };
    setAlerts((current) => [message, ...current].slice(0, 20));
  }, []);

  const runAnalysis = useCallback(async () => {
    const response = await api.post("/analyze", { logs: [] });
    const analysis = response.data.analysis;
    setAgents(analysis.agents);
    setRisk({
      score: analysis.risk.risk_score,
      level: analysis.risk.threat_level,
      drivers: analysis.agents
    });
    setReasoning(response.data.security_analyst);
    setMitre(analysis.mitre_mapping);
    const newThreats = analysis.anomalies.filter((item) => item.is_anomaly);
    setThreats((current) => [...newThreats, ...current].slice(0, 30));
    pushAlert("AI_ANALYSIS_COMPLETE", response.data.security_analyst);
    return response.data;
  }, [pushAlert]);

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      setLoading(true);
      try {
        const [threatRes, riskRes, logRes, reasoningRes, mitreRes, intelRes] = await Promise.all([
          api.get("/threats"),
          api.get("/risk-score"),
          api.get("/logs"),
          api.get("/ai-reasoning"),
          api.get("/mitre-mapping"),
          api.get("/threat-intelligence")
        ]);
        if (!mounted) return;
        setThreats(threatRes.data);
        setRisk((current) => ({ ...current, ...riskRes.data }));
        setLogs(logRes.data);
        setReasoning(reasoningRes.data);
        setMitre(mitreRes.data.mappings || []);
        setIntel(intelRes.data);
      } catch (error) {
        pushAlert("BACKEND_OFFLINE", { message: "Using local command-center state until the backend is reachable." });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    hydrate();
    return () => {
      mounted = false;
    };
  }, [pushAlert]);

  useEffect(() => {
    const wsBase = import.meta.env.VITE_WS_URL || `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws/threats`;
    const socket = new WebSocket(wsBase);
    socket.onopen = () => setConnection("online");
    socket.onclose = () => setConnection("offline");
    socket.onerror = () => setConnection("degraded");
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      pushAlert(message.event, message.payload);
      if (message.event === "NEW_THREAT") {
        setThreats((current) => [message.payload, ...current].slice(0, 30));
      }
      if (message.event === "RISK_UPDATE") {
        setRisk((current) => ({
          ...current,
          score: message.payload.risk_score ?? message.payload.score ?? current.score,
          level: message.payload.threat_level ?? message.payload.level ?? current.level
        }));
      }
      if (message.event === "AI_ANALYSIS_COMPLETE") {
        setReasoning(message.payload);
      }
    };
    return () => socket.close();
  }, [pushAlert]);

  const context = useMemo(
    () => ({ api, threats, logs, risk, agents, reasoning, mitre, intel, alerts, connection, loading, runAnalysis }),
    [threats, logs, risk, agents, reasoning, mitre, intel, alerts, connection, loading, runAnalysis]
  );

  return (
    <div className="min-h-screen bg-obsidian/95">
      <Navbar connection={connection} risk={risk} onAnalyze={runAnalysis} />
      <div className="mx-auto flex w-full max-w-[1680px] gap-4 px-4 pb-6 pt-4 lg:px-6">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<Dashboard context={context} />} />
            <Route path="/analysis" element={<ThreatAnalysis context={context} />} />
            <Route path="/insights" element={<PredictiveInsights context={context} />} />
            <Route path="/agents" element={<SecurityAgents context={context} />} />
            <Route path="/intel" element={<ThreatIntelligence context={context} />} />
            <Route path="/settings" element={<Settings context={context} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
