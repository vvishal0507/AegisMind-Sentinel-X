from datetime import datetime, timezone
from ipaddress import ip_address
from typing import Any, Dict, Iterable, List


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_log(log: Dict[str, Any]) -> Dict[str, Any]:
    normalized = dict(log)
    normalized.setdefault("timestamp", utc_now_iso())
    normalized.setdefault("source_ip", "0.0.0.0")
    normalized.setdefault("destination_ip", "0.0.0.0")
    normalized.setdefault("event_type", "unknown")
    normalized.setdefault("status", "unknown")
    normalized.setdefault("bytes_out", 0)
    normalized.setdefault("bytes_in", 0)
    normalized.setdefault("failed_attempts", 0)
    normalized.setdefault("unique_ports", 0)
    normalized.setdefault("process_name", "")
    normalized.setdefault("command_line", "")
    normalized.setdefault("domain", "")
    return normalized


def normalize_logs(logs: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [normalize_log(log) for log in logs]


def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def is_public_ip(value: str) -> bool:
    try:
        parsed = ip_address(value)
        return not (parsed.is_private or parsed.is_loopback or parsed.is_reserved)
    except ValueError:
        return False


def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))
