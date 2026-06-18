from datetime import datetime
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.ai_engine import ai_engine
from backend.config import get_settings
from backend.database.database import get_db
from backend.database.models import RiskSnapshot, SecurityLog, Threat
from backend.fake_logs_generator import generate_fake_logs
from backend.llm_security_analyst import llm_security_analyst
from backend.mitre_mapping import mitre_mapper
from backend.security import authenticate_user, create_access_token
from backend.threat_intelligence import threat_intel_client
from backend.websocket_manager import WebSocketEvent, websocket_manager


router = APIRouter()


class AnalyzeRequest(BaseModel):
    logs: List[Dict[str, Any]] = Field(default_factory=list)


class PredictRequest(BaseModel):
    logs: List[Dict[str, Any]] = Field(default_factory=list)


@router.post("/auth/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Dict[str, Any]:
    user = authenticate_user(form_data.username, form_data.password)
    token = create_access_token(user["username"], {"role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "role": user["role"]}


@router.get("/")
def root() -> Dict[str, Any]:
    settings = get_settings()
    return {"service": settings.app_name, "status": "online", "version": "1.0.0"}


@router.get("/threats")
def get_threats(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    rows = db.query(Threat).order_by(Threat.timestamp.desc()).limit(100).all()
    return [
        {
            "id": row.id,
            "timestamp": row.timestamp.isoformat(),
            "source_ip": row.source_ip,
            "destination_ip": row.destination_ip,
            "event_type": row.event_type,
            "threat_level": row.threat_level,
            "confidence": row.confidence,
            "attack_id": row.attack_id,
            "technique": row.technique,
            "description": row.description,
            "recommendation": row.recommendation,
        }
        for row in rows
    ]


@router.get("/risk-score")
def get_risk_score(db: Session = Depends(get_db)) -> Dict[str, Any]:
    row = db.query(RiskSnapshot).order_by(RiskSnapshot.timestamp.desc()).first()
    if row is None:
        return {"score": 0, "level": "low", "drivers": []}
    return {"score": row.score, "level": row.level, "drivers": row.drivers, "timestamp": row.timestamp.isoformat()}


@router.post("/analyze")
async def analyze(request: AnalyzeRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    logs = request.logs or generate_fake_logs(20)
    analysis = ai_engine.analyze(logs)
    analyst = llm_security_analyst.analyze_detected_threats(analysis)
    risk = analysis["risk"]
    snapshot = RiskSnapshot(score=risk.get("risk_score", 0), level=risk.get("threat_level", "low"), drivers=analysis["agents"])
    db.add(snapshot)
    for prediction in analysis["anomalies"]:
        event = prediction["event"]
        db.add(SecurityLog(**_security_log_fields(event)))
        if prediction["is_anomaly"]:
            mapping = mitre_mapper.map_event(event)
            db.add(
                Threat(
                    timestamp=datetime.utcnow(),
                    source_ip=event.get("source_ip"),
                    destination_ip=event.get("destination_ip"),
                    event_type=event.get("event_type"),
                    threat_level=prediction.get("risk_hint"),
                    confidence=prediction.get("anomaly_score", 0) / 100,
                    attack_id=mapping["attack_id"],
                    technique=mapping["technique"],
                    description=mapping["description"],
                    recommendation=analyst["recommendations"][0],
                    raw_event=event,
                    agent_results=analysis["agents"],
                )
            )
    db.commit()
    await websocket_manager.broadcast(WebSocketEvent.RISK_UPDATE, risk)
    await websocket_manager.broadcast(WebSocketEvent.AI_ANALYSIS_COMPLETE, analyst)
    anomalous = [item for item in analysis["anomalies"] if item["is_anomaly"]]
    for item in anomalous:
        await websocket_manager.broadcast(WebSocketEvent.NEW_THREAT, item)
    return {"analysis": analysis, "security_analyst": analyst}


@router.post("/predict")
def predict(request: PredictRequest) -> Dict[str, Any]:
    return ai_engine.predict(request.logs or generate_fake_logs(10))


@router.get("/logs")
def get_logs(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    rows = db.query(SecurityLog).order_by(SecurityLog.timestamp.desc()).limit(100).all()
    if not rows:
        return generate_fake_logs(20)
    return [
        {
            "id": row.id,
            "timestamp": row.timestamp.isoformat(),
            "source_ip": row.source_ip,
            "destination_ip": row.destination_ip,
            "event_type": row.event_type,
            "status": row.status,
            "username": row.username,
            "message": row.message,
            "raw_event": row.raw_event,
        }
        for row in rows
    ]


@router.get("/ai-reasoning")
def get_ai_reasoning() -> Dict[str, Any]:
    analysis = ai_engine.analyze(generate_fake_logs(15))
    return llm_security_analyst.analyze_detected_threats(analysis)


@router.get("/mitre-mapping")
def get_mitre_mapping() -> Dict[str, Any]:
    return {"mappings": [mitre_mapper.map_event(log) for log in generate_fake_logs(10)]}


@router.get("/threat-intelligence")
def get_threat_intelligence(ioc: str = "185.220.101.4", ioc_type: str = "ip") -> Dict[str, Any]:
    return threat_intel_client.check_ioc(ioc, ioc_type)


@router.websocket("/ws/threats")
async def threat_websocket(websocket: WebSocket) -> None:
    await websocket_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)


def _security_log_fields(event: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "timestamp": datetime.utcnow(),
        "source_ip": event.get("source_ip"),
        "destination_ip": event.get("destination_ip"),
        "event_type": event.get("event_type"),
        "status": event.get("status"),
        "username": event.get("username"),
        "message": event.get("message", ""),
        "raw_event": event,
    }
