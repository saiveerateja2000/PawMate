# PawMate

PawMate is a pet-management application scaffold (frontend + backend).

This repository contains two main services:

- `frontend/` — React + Vite + Tailwind UI
- `backend/` — FastAPI + SQLAlchemy + OpenTelemetry instrumentation

Also provided: `docker-compose.yml` to bring up Postgres, Jaeger, OTEL Collector, Prometheus and the backend service.

Quick start (development):

1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

For infrastructure (postgres, jaeger, collector, prometheus): see `docker-compose.yml`.
