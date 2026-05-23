# evaluation-service

Evaluaciones: desempeño del empleador y evaluación de informe del docente. Calcula acta final.

Ejecución
- Con Docker Compose: docker compose up --build evaluation-service
- Local: cd evaluation-service && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8004

Env: DATABASE_URL

Endpoints (interno http://evaluation-service:8000)
- POST /api/v1/evaluations/desempeno         -> crear evaluación de desempeño
- POST /api/v1/evaluations/informe           -> crear evaluación de informe
- POST /api/v1/evaluations/{id}/cerrar       -> cerrar evaluación (cambiar estado a CERRADA)
- GET  /api/v1/evaluations/acta-final/{practica_id} -> obtener acta final

Ejemplo curl (crear evaluación de desempeño):
curl -X POST http://localhost:8000/api/v1/evaluations/desempeno -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"practica_id":"...","items":[{"criterio":"Responsabilidad","puntaje_obtenido":5,"puntaje_max":7}]}'

Tests
- pytest -q
