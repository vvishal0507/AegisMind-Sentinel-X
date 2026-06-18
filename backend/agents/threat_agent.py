from typing import Any, Dict, List

from backend.threat_intelligence import ThreatIntelligenceClient


class ThreatIntelligenceAgent:
    agent_name = "Threat Intelligence Agent"

    def __init__(self, client: ThreatIntelligenceClient | None = None) -> None:
        self.client = client or ThreatIntelligenceClient()

    def analyze(self, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        iocs = []
        for log in logs[:20]:
            source_ip = str(log.get("source_ip", ""))
            domain = str(log.get("domain", ""))
            if source_ip:
                iocs.append(self.client.check_ip_reputation(source_ip))
            if domain:
                iocs.append(self.client.analyze_domain(domain))
        risky = [ioc for ioc in iocs if ioc.get("reputation") in {"watchlist", "suspicious", "malicious"}]
        max_score = max([int(ioc.get("score", 0)) for ioc in iocs], default=0)
        level = "critical" if max_score >= 80 else "high" if max_score >= 50 else "medium" if risky else "low"
        confidence = min(0.96, 0.28 + len(risky) * 0.12 + max_score / 200)
        return {
            "agent_name": self.agent_name,
            "analysis": f"Checked {len(iocs)} IOCs and found {len(risky)} reputation matches.",
            "threat_level": level,
            "confidence": round(confidence, 2),
            "recommendation": "Block malicious IOCs, enrich alerts with reputation data, and hunt for related activity.",
        }
