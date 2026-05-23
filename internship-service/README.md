# internship-service

Internship lifecycle: registration, Acta 1 and status transitions.

## Run

Docker Compose:
```bash
docker compose up --build internship-service
```

Local:
```bash
cd internship-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8003
```

## Environment
- `DATABASE_URL`

## Endpoints

POST `http://localhost:8000/api/v1/internships` - Register internship
Input example
```json
{
  "alumno_id": "<uuid>",
  "coordinador_id": "<uuid>",
  "centro_practica_id": "<uuid>",
  "carrera_id": "<uuid>",
  "tipo": "LABORAL",
  "fecha_inicio": "2026-06-01"
}
```
Return
```http
201 Created
```

PATCH `http://localhost:8000/api/v1/internships/{id}/docente` - Assign teacher (docente)
Input example
```json
{"docente_id": "<uuid>"}
```
Return
```http
200 OK
```

GET `http://localhost:8000/api/v1/internships/{id}/acta1` - Get Acta 1
Input example
```json
{}
```
Return
```http
200 OK
```

## Tests
```bash
pytest -q
```
