# AegisMind Sentinel

AegisMind Sentinel is a FastAPI cyber defense backend with machine learning anomaly detection, Random Forest threat classification, a multi-agent security analysis system, MITRE ATT&CK mapping, threat intelligence enrichment, JWT authentication, SQLite persistence, and real-time WebSocket alert streaming.

## Backend Structure

```text
backend/
  app.py
  routes.py
  ai_engine.py
  anomaly_detection.py
  threat_reasoning.py
  mitre_mapping.py
  threat_intelligence.py
  websocket_manager.py
  llm_security_analyst.py
  splunk_connector.py
  fake_logs_generator.py
  config.py
  security.py
  agents/
  database/
  data/
  models/
  utils/
```

## Run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.app:app --reload
```

Open `http://127.0.0.1:8000/docs` for the interactive API documentation.

## Authentication

Use `POST /auth/token` with:

```text
username: analyst
password: AegisMind-Analyst-2026
```

The endpoint returns a bearer JWT suitable for protected production extensions.

## API

- `GET /`
- `GET /threats`
- `GET /risk-score`
- `POST /analyze`
- `POST /predict`
- `GET /logs`
- `GET /ai-reasoning`
- `GET /mitre-mapping`
- `GET /threat-intelligence`
- `POST /auth/token`
- `WS /ws/threats`

## WebSocket Events

- `NEW_THREAT`
- `RISK_UPDATE`
- `AI_ANALYSIS_COMPLETE`

## Notes

The default threat intelligence mode uses deterministic local reputation rules. Set `THREAT_INTEL_API_KEY` and `THREAT_INTEL_BASE_URL` to enable an external JSON API connector.
