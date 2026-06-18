from typing import Any, Dict, List


MITRE_TECHNIQUES = {
    "brute_force": {
        "attack_id": "T1110",
        "technique": "Brute Force",
        "description": "Adversaries may use repeated authentication attempts to gain access to accounts.",
    },
    "network_scan": {
        "attack_id": "T1046",
        "technique": "Network Service Scanning",
        "description": "Adversaries may scan victim networks to discover services and exposed ports.",
    },
    "command_execution": {
        "attack_id": "T1059",
        "technique": "Command and Scripting Interpreter",
        "description": "Adversaries may abuse command interpreters to execute malicious commands.",
    },
    "malware_behavior": {
        "attack_id": "T1204",
        "technique": "User Execution",
        "description": "Malicious code may run after a user or process launches suspicious content.",
    },
    "exfiltration": {
        "attack_id": "T1041",
        "technique": "Exfiltration Over C2 Channel",
        "description": "Adversaries may steal data by sending it over an existing command channel.",
    },
    "credential_access": {
        "attack_id": "T1003",
        "technique": "OS Credential Dumping",
        "description": "Adversaries may attempt to dump credentials from operating system stores.",
    },
}


class MitreMapper:
    def map_behavior(self, behavior: str) -> Dict[str, str]:
        return MITRE_TECHNIQUES.get(
            behavior,
            {
                "attack_id": "T0000",
                "technique": "Unmapped Behavior",
                "description": "The observed behavior does not match a configured MITRE ATT&CK technique.",
            },
        )

    def map_event(self, event: Dict[str, Any]) -> Dict[str, str]:
        event_type = str(event.get("event_type", "")).lower()
        command_line = str(event.get("command_line", "")).lower()
        failed_attempts = int(event.get("failed_attempts", 0) or 0)
        unique_ports = int(event.get("unique_ports", 0) or 0)
        bytes_out = int(event.get("bytes_out", 0) or 0)

        if failed_attempts >= 8 or event_type in {"auth_failure", "brute_force"}:
            return self.map_behavior("brute_force")
        if unique_ports >= 15 or event_type in {"port_scan", "network_scan"}:
            return self.map_behavior("network_scan")
        if any(token in command_line for token in ["powershell", "cmd.exe", "bash", "python -c", "curl "]):
            return self.map_behavior("command_execution")
        if event_type in {"malware", "suspicious_process"}:
            return self.map_behavior("malware_behavior")
        if bytes_out >= 50_000_000 or event_type == "data_exfiltration":
            return self.map_behavior("exfiltration")
        if "mimikatz" in command_line or "lsass" in command_line:
            return self.map_behavior("credential_access")
        return self.map_behavior("unmapped")

    def map_events(self, events: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        return [self.map_event(event) for event in events]


mitre_mapper = MitreMapper()
