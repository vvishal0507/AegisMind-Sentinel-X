from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, Text

from backend.database.database import Base


class Threat(Base):
    __tablename__ = "threats"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source_ip = Column(String(64), index=True)
    destination_ip = Column(String(64), index=True)
    event_type = Column(String(64), index=True)
    threat_level = Column(String(24), index=True)
    confidence = Column(Float, default=0.0)
    attack_id = Column(String(32), index=True)
    technique = Column(String(128))
    description = Column(Text)
    recommendation = Column(Text)
    raw_event = Column(JSON)
    agent_results = Column(JSON)


class SecurityLog(Base):
    __tablename__ = "security_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source_ip = Column(String(64), index=True)
    destination_ip = Column(String(64), index=True)
    event_type = Column(String(64), index=True)
    status = Column(String(32))
    username = Column(String(128))
    message = Column(Text)
    raw_event = Column(JSON)


class RiskSnapshot(Base):
    __tablename__ = "risk_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    score = Column(Float, default=0.0)
    level = Column(String(24), index=True)
    drivers = Column(JSON)
