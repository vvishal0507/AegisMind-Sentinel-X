from typing import Any, Dict, List


class NetworkAnalysisAgent:
    agent_name = "Network Analysis Agent"

    def analyze(self, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        scan_events = [log for log in logs if int(log.get("unique_ports", 0) or 0) >= 15]
        large_transfers = [log for log in logs if int(log.get("bytes_out", 0) or 0) >= 50_000_000]
        abnormal = len(scan_events) + len(large_transfers)
        confidence = min(0.98, 0.35 + abnormal * 0.16) if abnormal else 0.22
        level = "critical" if abnormal >= 4 else "high" if abnormal >= 2 else "medium" if abnormal else "low"
        analysis = (
            f"Observed {len(scan_events)} scanning indicators and {len(large_transfers)} large outbound transfers."
        )
        return {
            "agent_name": self.agent_name,
            "analysis": analysis,
            "threat_level": level,
            "confidence": round(confidence, 2),
            "recommendation": "Throttle suspicious sources, inspect egress flows, and verify exposed services.",
        }
