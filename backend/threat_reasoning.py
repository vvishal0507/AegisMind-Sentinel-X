from collections import Counter
from typing import Any, Dict, List


class ThreatReasoner:
    def reason(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        anomalies = [item for item in analysis.get("anomalies", []) if item.get("is_anomaly")]
        agents = analysis.get("agents", [])
        levels = Counter(agent.get("threat_level", "low") for agent in agents)
        strongest = max(agents, key=lambda item: float(item.get("confidence", 0)), default={})
        summary = (
            f"{len(anomalies)} anomalous events were detected. "
            f"The strongest signal came from {strongest.get('agent_name', 'the AI engine')}."
        )
        reasoning = []
        for agent in agents:
            reasoning.append(
                {
                    "source": agent.get("agent_name"),
                    "finding": agent.get("analysis"),
                    "level": agent.get("threat_level"),
                    "confidence": agent.get("confidence"),
                }
            )
        return {
            "summary": summary,
            "level_distribution": dict(levels),
            "reasoning": reasoning,
            "recommended_priority": strongest.get("threat_level", "low"),
        }


threat_reasoner = ThreatReasoner()
