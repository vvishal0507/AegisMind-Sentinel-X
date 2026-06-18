from functools import lru_cache
import os
from pathlib import Path
from typing import List

try:
    from pydantic import Field
    from pydantic_settings import BaseSettings
except ModuleNotFoundError:
    BaseSettings = object

    def Field(default=None, **_: object):
        return default


BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    app_name: str = "AegisMind Sentinel"
    environment: str = "development"
    api_prefix: str = ""
    database_url: str = f"sqlite:///{BASE_DIR / 'database' / 'sentinel.db'}"
    jwt_secret_key: str = Field(default="change-this-secret-in-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    threat_intel_api_key: str = ""
    threat_intel_base_url: str = "https://api.abuseipdb.com/api/v2/check"
    cors_origins: List[str] = ["*"]
    risk_decay_factor: float = 0.82
    model_path: Path = BASE_DIR / "models" / "anomaly_model.pkl"
    sample_logs_path: Path = BASE_DIR / "data" / "sample_logs.json"
    attack_patterns_path: Path = BASE_DIR / "data" / "attack_patterns.json"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def __init__(self, **values):
        if BaseSettings is not object:
            super().__init__(**values)
            return
        for key, value in self.__class__.__dict__.items():
            if key.startswith("_") or key == "Config" or callable(value):
                continue
            env_value = os.getenv(key.upper())
            setattr(self, key, values.get(key, env_value if env_value is not None else value))


@lru_cache
def get_settings() -> Settings:
    return Settings()
