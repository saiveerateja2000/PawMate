#!/usr/bin/env bash
# Helper to run the backend with a correct PYTHONPATH/app-dir so imports work
set -euo pipefail

# Ensure running from repo root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export PYTHONPATH="$ROOT_DIR":${PYTHONPATH:-}

# Allow overriding via env vars
: ${UVICORN_HOST:=0.0.0.0}
: ${UVICORN_PORT:=8000}
: ${UVICORN_RELOAD:=true}

if [ "$UVICORN_RELOAD" = "true" ]; then
  uvicorn app.main:app --app-dir backend --reload --host "$UVICORN_HOST" --port "$UVICORN_PORT"
else
  uvicorn app.main:app --app-dir backend --host "$UVICORN_HOST" --port "$UVICORN_PORT"
fi
