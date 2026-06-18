from typing import Any, Dict, List

from backend.utils.helpers import clamp


class RiskAssessmentAgent:
    agent_name = "Risk Assessment Agent"
    weights = {"low": 10, "medium": 35, "high": 70, "critical": 95}

    def analyze(self, logs: List[Dict[str, Any]], agent_results: List[Dict[str, Any]] | None = None) -> Dict[str, Any]:
        agent_results = agent_results or []
        if agent_results:
            weighted = [
                self.weights.get(str(result.get("threat_level", "low")), 10)
                * float(result.get("confidence", 0.1))
                for result in agent_results
            ]
            score = clamp(sum(weighted) / max(len(agent_results), 1) * 1.35)
        else:
            score = clamp(len(logs) * 4)
        level = "critical" if score >= 85 else "high" if score >= 65 else "medium" if score >= 35 else "low"
        return {
            "agent_name": self.agent_name,
            "analysis": f"Overall risk score is {round(score, 2)} based on event severity and AI agent confidence.",
            "threat_level": level,
            "confidence": round(min(0.99, 0.45 + score / 180), 2),
            "recommendation": "Prioritize containment for critical assets and verify the highest-confidence detections first.",
            "risk_score": round(score, 2),
        }
