# academic-service

Academic management: campuses (sedes), degrees (carreras), practice centers.

## Run

Docker Compose:
```bash
docker compose up --build academic-service
```

Local:
```bash
cd academic-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8002
```

## Environment
- `DATABASE_URL`

## Endpoints

GET `http://localhost:8000/api/v1/academic/sedes` - List campuses
Input example
```json
{}
```
Return
```http
200 OK
```

POST `http://localhost:8000/api/v1/academic/sedes` - Create campus (requires auth)
Input example
```json
{"nombre": "Main Campus"}
```
Return
```http
201 Created
```

GET `http://localhost:8000/api/v1/academic/carreras` - List degrees
Input example
```json
{}
```
Return
```http
200 OK
```

POST `http://localhost:8000/api/v1/academic/carreras` - Create degree (requires auth)
Input example
```json
{
  "nombre": "Engineering Example",
  "sede_id": "<uuid>",
  "horas_laboral": 240,
  "horas_profesional": 360
}
```
Return
```http
201 Created
```

GET `http://localhost:8000/api/v1/academic/centros` - List practice centers
Input example
```json
{}
```
Return
```http
200 OK
```

POST `http://localhost:8000/api/v1/academic/centros` - Create practice center (requires auth)
Input example
```json
{
  "nombre": "Company Demo",
  "giro": "IT",
  "nombre_gerente": "Manager Demo",
  "telefono": "+56900000000",
  "correo": "contact@company.demo",
  "nombre_contacto": "Supervisor",
  "correo_contacto": "boss@company.demo",
  "direccion": "123 Fake St"
}
```
Return
```http
201 Created
```

## Tests
```bash
pytest -q
```
