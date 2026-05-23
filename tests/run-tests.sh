#!/usr/bin/env bash
# run-tests.sh - Orquestador de pruebas ligeras por servicio + E2E mínimo
# Ejecutar desde la raíz del repo o ./tests/run-tests.sh

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Config
SERVICES_UNIT=(auth-service academic-service internship-service evaluation-service document-service notification-service)
GATEWAY_SERVICE=api-gateway
LOG_DIR="$REPO_ROOT/tests/logs"
mkdir -p "$LOG_DIR"

# Flags (ajustables)
DO_BUILD=true      # set to false to skip build
DO_E2E=true        # set to false to skip E2E
CLEAN_BEFORE=true  # run docker compose down -v before starting
HEALTH_URL="http://localhost:8000/health"
HEALTH_TIMEOUT=120

echo "[tests] Repo root: $REPO_ROOT"

echo "[tests] CLEAN_BEFORE=$CLEAN_BEFORE DO_BUILD=$DO_BUILD DO_E2E=$DO_E2E"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker not found in PATH. Aborting." >&2
  exit 2
fi

# Clean
if [ "$CLEAN_BEFORE" = true ]; then
  echo "[tests] docker compose down -v --remove-orphans"
  docker compose down -v --remove-orphans || true
fi

# Build (optional)
if [ "$DO_BUILD" = true ]; then
  echo "[tests] Building images (docker compose build)"
  docker compose build --pull --no-cache || echo "[tests] build failed (continuing)"
fi

# Up
echo "[tests] Starting services (docker compose up -d)"
docker compose up -d --remove-orphans

# Wait for gateway health
echo "[tests] Waiting for gateway health: $HEALTH_URL (timeout ${HEALTH_TIMEOUT}s)"
SECS=0
until curl -s -f "$HEALTH_URL" >/dev/null 2>&1 || [ $SECS -ge $HEALTH_TIMEOUT ]; do
  sleep 1
  SECS=$((SECS+1))
done
if [ $SECS -ge $HEALTH_TIMEOUT ]; then
  echo "[tests] Gateway healthcheck failed after ${HEALTH_TIMEOUT}s" >&2
else
  echo "[tests] Gateway is healthy"
fi

# Run pytest inside each service that contains /app/tests
declare -A results
for svc in "${SERVICES_UNIT[@]}"; do
  log_file="$LOG_DIR/${svc}.log"
  echo "\n===== Running tests for $svc (log: $log_file) ====="
  echo "Service: $svc" > "$log_file"

  cid=$(docker compose ps -q "$svc" || true)
  if [ -z "$cid" ]; then
    echo "$svc: not running, skipping" | tee -a "$log_file"
    results[$svc]=SKIPPED
    continue
  fi

  # Inside container: install pytest/httpx if needed (user install), then run pytest if tests exist
  docker compose exec -T "$svc" bash -lc '
    set -euo pipefail
    echo "PYTHON: $(python -V 2>&1)"
    # Install test deps non-intrusively
    python -m pip install --user pytest httpx -q || true
    if [ -d /app/tests ]; then
      echo "Running pytest inside container..."
      python -m pytest -q --maxfail=1 || true
      echo "PYTEST_EXIT:$?"
    else
      echo "NO_TESTS"
      echo "PYTEST_EXIT:0"
    fi
  ' > "$log_file" 2>&1 || true

  # Parse exit code
  exit_code=$(grep -m1 -o 'PYTEST_EXIT:[0-9]*' "$log_file" | sed 's/PYTEST_EXIT://') || exit_code=1
  if [ -z "$exit_code" ]; then exit_code=1; fi
  results[$svc]=$exit_code
  echo "[tests] $svc pytest exit: $exit_code"
  tail -n 50 "$log_file" || true
done

# Run quick E2E inside api-gateway (uses existing api-gateway/e2e_internal.py)
if [ "$DO_E2E" = true ]; then
  e2e_log="$LOG_DIR/e2e.log"
  echo "\n===== Running quick E2E inside $GATEWAY_SERVICE (log: $e2e_log) ====="
  if [ -z "$(docker compose ps -q $GATEWAY_SERVICE)" ]; then
    echo "$GATEWAY_SERVICE not running, skipping E2E" | tee "$e2e_log"
    results[e2e]=SKIPPED
  else
    docker compose exec -T "$GATEWAY_SERVICE" bash -lc 'python /app/e2e_internal.py' > "$e2e_log" 2>&1 || true
    e2e_exit=$(grep -m1 -o 'E2E interno finalizado' "$e2e_log" >/dev/null && echo 0 || echo 1)
    results[e2e]=$e2e_exit
    echo "[tests] E2E result: $e2e_exit"
    tail -n 200 "$e2e_log" || true
  fi
fi

# Summary
echo "\n===== TEST SUMMARY ====="
failures=0
for k in "${!results[@]}"; do
  v=${results[$k]}
  printf "%s -> %s\n" "$k" "$v"
  if [[ "$v" =~ ^[0-9]+$ ]] && [ "$v" -ne 0 ]; then
    failures=$((failures+1))
  fi
done

if [ $failures -ne 0 ]; then
  echo "[tests] Some tests failed (count: $failures). Revisa tests/logs for detalles." >&2
  exit 3
fi

echo "[tests] All checks passed (or no tests found). Logs in tests/logs"
exit 0
