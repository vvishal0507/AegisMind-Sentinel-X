from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import get_settings
from backend.database.database import init_db
from backend.routes import router


settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    description="AI-powered cyber defense backend with ML anomaly detection, multi-agent analysis, threat intelligence, and WebSocket alerts.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


app.include_router(router, prefix=settings.api_prefix)
