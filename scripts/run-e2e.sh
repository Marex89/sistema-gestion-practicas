#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# 1) Preparar .env
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "Creando .env desde .env.example (editar si es necesario)..."
    cp .env.example .env
  else
    echo "No existe .env ni .env.example. Abortando." >&2
    exit 1
  fi
fi

# 2) Levantar Docker Compose
echo "Levantando servicios con Docker Compose (build)..."
docker compose up --build -d

# 3) Esperar health del gateway
GATEWAY_URL="http://localhost:${GATEWAY_PORT:-8000}/health"
MAX_WAIT=120
SLEEP=3

echo "Esperando ${GATEWAY_URL} (timeout ${MAX_WAIT}s) ..."
secs=0
while ! curl -sSf "$GATEWAY_URL" >/dev/null 2>&1; do
  sleep $SLEEP
  secs=$((secs + SLEEP))
  if [ $secs -ge $MAX_WAIT ]; then
    echo "Gateway no respondió en ${MAX_WAIT}s. Mostrando logs relevantes..." >&2
    docker compose logs --no-color api-gateway | tail -n 200
    exit 2
  fi
done

echo "Gateway listo. Ejecutando script E2E interno dentro del contenedor 'api-gateway'..."

# Ejecutar el script Python dentro del contenedor (fallará si no existe)
docker compose exec api-gateway python /app/e2e_internal.py || {
  echo "E2E interno falló. Recolectando logs..." >&2
  docker compose logs --no-color api-gateway | tail -n 200
  docker compose logs --no-color auth-service | tail -n 200
  docker compose logs --no-color internship-service | tail -n 200
  exit 3
}

echo "E2E finalizado. Para más detalles revisar los logs o el output anterior." 
