from typing import Any, Dict, List

from backend.agents import (
    AuthenticationAgent,
    MalwareDetectionAgent,
    NetworkAnalysisAgent,
    RiskAssessmentAgent,
    ThreatIntelligenceAgent,
)
from backend.anomaly_detection import anomaly_model
from backend.mitre_mapping import mitre_mapper
from backend.utils.helpers import normalize_logs


class AIEngine:
    def __init__(self) -> None:
        self.network_agent = NetworkAnalysisAgent()
        self.malware_agent = MalwareDetectionAgent()
        self.authentication_agent = AuthenticationAgent()
        self.threat_agent = ThreatIntelligenceAgent()
        self.risk_agent = RiskAssessmentAgent()

    def analyze(self, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        normalized = normalize_logs(logs)
        anomaly_results = anomaly_model.predict(normalized)
        agent_results = [
            self.network_agent.analyze(normalized),
            self.malware_agent.analyze(normalized),
            self.authentication_agent.analyze(normalized),
            self.threat_agent.analyze(normalized),
        ]
        risk_result = self.risk_agent.analyze(normalized, agent_results)
        agent_results.append(risk_result)
        mitre_results = [mitre_mapper.map_event(item["event"]) for item in anomaly_results if item["is_anomaly"]]
        return {
            "events_analyzed": len(normalized),
            "anomalies": anomaly_results,
            "agents": agent_results,
            "risk": risk_result,
            "mitre_mapping": mitre_results,
        }

    def predict(self, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        normalized = normalize_logs(logs)
        return {"predictions": anomaly_model.predict(normalized)}


ai_engine = AIEngine()
