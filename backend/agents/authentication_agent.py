from typing import Any, Dict, List


class AuthenticationAgent:
    agent_name = "Authentication Agent"

    def analyze(self, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        failures = [log for log in logs if str(log.get("status", "")).lower() == "failed"]
        high_attempts = [log for log in logs if int(log.get("failed_attempts", 0) or 0) >= 8]
        suspicious_users = sorted({str(log.get("username", "unknown")) for log in failures + high_attempts})
        signal_count = len(failures) + len(high_attempts)
        confidence = min(0.97, 0.3 + signal_count * 0.08) if signal_count else 0.18
        level = "critical" if signal_count >= 10 else "high" if signal_count >= 5 else "medium" if signal_count else "low"
        return {
            "agent_name": self.agent_name,
            "analysis": f"Found {len(failures)} failed logins and {len(high_attempts)} brute-force threshold breaches.",
            "threat_level": level,
            "confidence": round(confidence, 2),
            "recommendation": f"Enforce MFA, lock risky accounts, and review users: {', '.join(suspicious_users[:6]) or 'none'}.",
        }
