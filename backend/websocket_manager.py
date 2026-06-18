from enum import Enum
from typing import Any, Dict, List

from fastapi import WebSocket

from backend.utils.helpers import utc_now_iso


class WebSocketEvent(str, Enum):
    NEW_THREAT = "NEW_THREAT"
    RISK_UPDATE = "RISK_UPDATE"
    AI_ANALYSIS_COMPLETE = "AI_ANALYSIS_COMPLETE"


class WebSocketManager:
    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        await self.send_personal_message(
            websocket,
            WebSocketEvent.RISK_UPDATE,
            {"message": "Connected to AegisMind Sentinel threat stream."},
        )

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(
        self, websocket: WebSocket, event: WebSocketEvent, payload: Dict[str, Any]
    ) -> None:
        await websocket.send_json({"event": event.value, "timestamp": utc_now_iso(), "payload": payload})

    async def broadcast(self, event: WebSocketEvent, payload: Dict[str, Any]) -> None:
        stale: List[WebSocket] = []
        message = {"event": event.value, "timestamp": utc_now_iso(), "payload": payload}
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except RuntimeError:
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection)


websocket_manager = WebSocketManager()
