from datetime import datetime, timedelta, timezone
from random import choice, randint, seed
from typing import Any, Dict, List


seed(42)


def generate_fake_logs(count: int = 30) -> List[Dict[str, Any]]:
    base = datetime.now(timezone.utc) - timedelta(minutes=count)
    users = ["admin", "svc-backup", "jsmith", "apatel", "mchen"]
    logs = []
    for index in range(count):
        event_type = choice(["normal", "normal", "auth_failure", "network_scan", "suspicious_process"])
        failed = randint(8, 18) if event_type == "auth_failure" else randint(0, 1)
        ports = randint(20, 80) if event_type == "network_scan" else randint(1, 4)
        command = "powershell -EncodedCommand SQBFAFgA" if event_type == "suspicious_process" else ""
        logs.append(
            {
                "timestamp": (base + timedelta(minutes=index)).isoformat(),
                "source_ip": choice(["10.0.2.15", "185.220.101.4", "45.83.64.12", "192.168.1.22"]),
                "destination_ip": choice(["10.0.0.5", "10.0.0.9", "172.16.0.20"]),
                "event_type": event_type,
                "status": "failed" if event_type == "auth_failure" else "success",
                "username": choice(users),
                "bytes_in": randint(500, 10000),
                "bytes_out": randint(500, 90000000 if event_type == "network_scan" else 20000),
                "failed_attempts": failed,
                "unique_ports": ports,
                "process_name": "powershell.exe" if command else "browser.exe",
                "command_line": command,
                "domain": choice(["", "verify-mfa-reset.xyz", "updates.microsoft.com"]),
                "message": f"Generated {event_type} event",
            }
        )
    return logs
