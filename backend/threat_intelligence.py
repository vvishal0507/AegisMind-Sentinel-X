from typing import Any, Dict, Optional

import requests

from backend.config import get_settings
from backend.utils.helpers import is_public_ip
from backend.utils.logger import get_logger


logger = get_logger(__name__)


class ThreatIntelligenceClient:
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, timeout: int = 5):
        settings = get_settings()
        self.api_key = api_key if api_key is not None else settings.threat_intel_api_key
        self.base_url = base_url or settings.threat_intel_base_url
        self.timeout = timeout

    def check_ioc(self, value: str, ioc_type: str = "ip") -> Dict[str, Any]:
        if ioc_type == "ip":
            return self.check_ip_reputation(value)
        if ioc_type == "domain":
            return self.analyze_domain(value)
        return {
            "ioc": value,
            "ioc_type": ioc_type,
            "reputation": "unknown",
            "score": 0,
            "source": "local",
            "details": "Unsupported IOC type",
        }

    def check_ip_reputation(self, ip: str) -> Dict[str, Any]:
        local = self._local_ip_reputation(ip)
        if not self.api_key or not is_public_ip(ip):
            return local

        headers = {"Key": self.api_key, "Accept": "application/json"}
        params = {"ipAddress": ip, "maxAgeInDays": 90}
        try:
            response = requests.get(self.base_url, headers=headers, params=params, timeout=self.timeout)
            response.raise_for_status()
            payload = response.json()
            data = payload.get("data", payload)
            score = int(data.get("abuseConfidenceScore", 0))
            return {
                "ioc": ip,
                "ioc_type": "ip",
                "reputation": self._score_to_reputation(score),
                "score": score,
                "source": "external",
                "raw": payload,
            }
        except requests.RequestException as exc:
            logger.info("Threat intelligence lookup failed, using local result: %s", exc)
            return {**local, "external_error": str(exc)}

    def analyze_domain(self, domain: str) -> Dict[str, Any]:
        lowered = domain.lower().strip()
        suspicious_terms = ["login-", "verify", "secure-update", "free-", "wallet", "mfa-reset"]
        score = 75 if any(term in lowered for term in suspicious_terms) else 10
        if lowered.endswith((".zip", ".mov", ".top", ".xyz")):
            score = max(score, 65)
        return {
            "ioc": domain,
            "ioc_type": "domain",
            "reputation": self._score_to_reputation(score),
            "score": score,
            "source": "local",
            "details": "Domain evaluated with lexical and TLD risk signals.",
        }

    def _local_ip_reputation(self, ip: str) -> Dict[str, Any]:
        high_risk_prefixes = ("185.", "45.", "91.219.", "203.0.113.")
        score = 85 if ip.startswith(high_risk_prefixes) else 5
        if not is_public_ip(ip):
            score = 0
        return {
            "ioc": ip,
            "ioc_type": "ip",
            "reputation": self._score_to_reputation(score),
            "score": score,
            "source": "local",
            "details": "IP evaluated with built-in reputation rules.",
        }

    @staticmethod
    def _score_to_reputation(score: int) -> str:
        if score >= 80:
            return "malicious"
        if score >= 50:
            return "suspicious"
        if score >= 15:
            return "watchlist"
        return "clean"


threat_intel_client = ThreatIntelligenceClient()
