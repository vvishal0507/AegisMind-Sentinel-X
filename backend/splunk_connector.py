from typing import Any, Dict, List

from backend.fake_logs_generator import generate_fake_logs


class SplunkConnector:
    def __init__(self, host: str = "localhost", token: str = "") -> None:
        self.host = host
        self.token = token

    def search(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        logs = generate_fake_logs(limit)
        if "auth" in query.lower():
            return [log for log in logs if log["event_type"] == "auth_failure"]
        if "scan" in query.lower():
            return [log for log in logs if log["event_type"] == "network_scan"]
        return logs

    def health(self) -> Dict[str, Any]:
        return {
            "host": self.host,
            "connected": bool(self.token),
            "mode": "configured" if self.token else "local-simulation",
        }


splunk_connector = SplunkConnector()
