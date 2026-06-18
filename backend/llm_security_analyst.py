from typing import Any, Dict, List

from backend.threat_reasoning import threat_reasoner


class LLMSecurityAnalyst:
    name = "AegisMind AI Security Analyst"

    def analyze_detected_threats(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        reasoning = threat_reasoner.reason(analysis)
        risk = analysis.get("risk", {})
        attack_behavior = self.explain_attack_behavior(analysis)
        recommendations = self.generate_recommendations(analysis)
        report = self.create_incident_report(analysis, attack_behavior, recommendations)
        return {
            "analyst": self.name,
            "executive_summary": reasoning["summary"],
            "risk_level": risk.get("threat_level", "low"),
            "risk_score": risk.get("risk_score", 0),
            "attack_behavior": attack_behavior,
            "recommendations": recommendations,
            "incident_report": report,
        }

    def explain_attack_behavior(self, analysis: Dict[str, Any]) -> List[str]:
        behaviors = []
        for mapping in analysis.get("mitre_mapping", []):
            behaviors.append(
                f"{mapping['technique']} ({mapping['attack_id']}): {mapping['description']}"
            )
        if not behaviors:
            behaviors.append("No mapped ATT&CK behavior was confirmed; continue monitoring correlated telemetry.")
        return sorted(set(behaviors))

    def generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        recommendations = []
        for agent in analysis.get("agents", []):
            rec = agent.get("recommendation")
            if rec:
                recommendations.append(rec)
        recommendations.extend(
            [
                "Preserve logs and volatile evidence for incident response review.",
                "Correlate source IPs, users, processes, and destination domains across the last 24 hours.",
            ]
        )
        return list(dict.fromkeys(recommendations))

    def create_incident_report(
        self, analysis: Dict[str, Any], behavior: List[str], recommendations: List[str]
    ) -> Dict[str, Any]:
        anomalies = [item for item in analysis.get("anomalies", []) if item.get("is_anomaly")]
        return {
            "title": "AegisMind Sentinel AI Incident Report",
            "scope": {"events_analyzed": analysis.get("events_analyzed", 0), "anomalies": len(anomalies)},
            "severity": analysis.get("risk", {}).get("threat_level", "low"),
            "confidence": analysis.get("risk", {}).get("confidence", 0),
            "observed_behavior": behavior,
            "recommended_actions": recommendations,
            "mitre_techniques": analysis.get("mitre_mapping", []),
        }


llm_security_analyst = LLMSecurityAnalyst()
