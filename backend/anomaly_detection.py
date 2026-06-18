from pathlib import Path
from typing import Any, Dict, List

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

from backend.config import get_settings
from backend.utils.helpers import normalize_logs, safe_float


FEATURE_COLUMNS = [
    "bytes_in",
    "bytes_out",
    "failed_attempts",
    "unique_ports",
    "event_type_auth_failure",
    "event_type_network_scan",
    "event_type_suspicious_process",
    "event_type_data_exfiltration",
]


class AnomalyDetectionModel:
    def __init__(self, model_path: Path | None = None) -> None:
        self.model_path = model_path or get_settings().model_path
        self.model: IsolationForest | None = None
        self.classifier: RandomForestClassifier | None = None
        self.scaler: StandardScaler | None = None
        self.load_or_train()

    def load_or_train(self) -> None:
        if self.model_path.exists():
            bundle = joblib.load(self.model_path)
            self.model = bundle["model"]
            self.classifier = bundle.get("classifier")
            self.scaler = bundle["scaler"]
            if self.classifier is None:
                self.train(self._training_logs())
                self.save()
            return
        self.train(self._training_logs())
        self.save()

    def train(self, logs: List[Dict[str, Any]]) -> None:
        frame = self._to_frame(logs)
        self.scaler = StandardScaler()
        features = self.scaler.fit_transform(frame[FEATURE_COLUMNS])
        self.model = IsolationForest(n_estimators=180, contamination=0.18, random_state=42)
        self.model.fit(features)
        labels = [self._label_for_event(log) for log in logs]
        self.classifier = RandomForestClassifier(n_estimators=160, random_state=42, class_weight="balanced")
        self.classifier.fit(features, labels)

    def predict(self, logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if self.model is None or self.scaler is None:
            self.load_or_train()
        frame = self._to_frame(logs)
        features = self.scaler.transform(frame[FEATURE_COLUMNS])
        predictions = self.model.predict(features)
        scores = self.model.decision_function(features)
        classes = self.classifier.predict(features) if self.classifier is not None else ["unknown"] * len(logs)
        results = []
        for log, prediction, score, threat_family in zip(normalize_logs(logs), predictions, scores, classes):
            anomaly_score = float(np.clip((0.5 - score) * 100, 0, 100))
            results.append(
                {
                    "is_anomaly": bool(prediction == -1),
                    "anomaly_score": round(anomaly_score, 2),
                    "risk_hint": self._score_to_level(anomaly_score),
                    "threat_family": threat_family,
                    "event": log,
                }
            )
        return results

    def save(self) -> None:
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({"model": self.model, "classifier": self.classifier, "scaler": self.scaler}, self.model_path)

    def _to_frame(self, logs: List[Dict[str, Any]]) -> pd.DataFrame:
        rows = []
        for log in normalize_logs(logs):
            event_type = str(log.get("event_type", "")).lower()
            rows.append(
                {
                    "bytes_in": safe_float(log.get("bytes_in")),
                    "bytes_out": safe_float(log.get("bytes_out")),
                    "failed_attempts": safe_float(log.get("failed_attempts")),
                    "unique_ports": safe_float(log.get("unique_ports")),
                    "event_type_auth_failure": 1.0 if event_type == "auth_failure" else 0.0,
                    "event_type_network_scan": 1.0 if event_type in {"network_scan", "port_scan"} else 0.0,
                    "event_type_suspicious_process": 1.0 if event_type in {"suspicious_process", "malware"} else 0.0,
                    "event_type_data_exfiltration": 1.0 if event_type == "data_exfiltration" else 0.0,
                }
            )
        return pd.DataFrame(rows, columns=FEATURE_COLUMNS).fillna(0)

    @staticmethod
    def _score_to_level(score: float) -> str:
        if score >= 85:
            return "critical"
        if score >= 65:
            return "high"
        if score >= 35:
            return "medium"
        return "low"

    @staticmethod
    def _label_for_event(log: Dict[str, Any]) -> str:
        event_type = str(log.get("event_type", "normal")).lower()
        if event_type == "auth_failure":
            return "credential_attack"
        if event_type in {"network_scan", "port_scan"}:
            return "reconnaissance"
        if event_type in {"suspicious_process", "malware"}:
            return "malware_execution"
        if event_type == "data_exfiltration":
            return "exfiltration"
        return "benign"

    @staticmethod
    def _training_logs() -> List[Dict[str, Any]]:
        return [
            {"event_type": "normal", "bytes_in": 1200, "bytes_out": 900, "failed_attempts": 0, "unique_ports": 1},
            {"event_type": "normal", "bytes_in": 3400, "bytes_out": 2200, "failed_attempts": 1, "unique_ports": 2},
            {"event_type": "normal", "bytes_in": 800, "bytes_out": 600, "failed_attempts": 0, "unique_ports": 1},
            {"event_type": "auth_failure", "bytes_in": 900, "bytes_out": 500, "failed_attempts": 12, "unique_ports": 1},
            {"event_type": "network_scan", "bytes_in": 2200, "bytes_out": 1400, "failed_attempts": 0, "unique_ports": 42},
            {"event_type": "suspicious_process", "bytes_in": 1500, "bytes_out": 3000, "failed_attempts": 0, "unique_ports": 4},
            {"event_type": "data_exfiltration", "bytes_in": 9000, "bytes_out": 85000000, "failed_attempts": 0, "unique_ports": 3},
        ]


anomaly_model = AnomalyDetectionModel()
