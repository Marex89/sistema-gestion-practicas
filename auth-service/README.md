# auth-service

Authentication and user management (JWT + roles).

## Run

Docker Compose:
```bash
docker compose up --build auth-service
```

Local:
```bash
cd auth-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8001
```

## Environment
- `SECRET_KEY` (JWT secret, must match gateway)
- `DATABASE_URL`

## Endpoints

POST `http://localhost:8000/api/v1/auth/login` - Login
Input example
```json
{"username": "admin", "password": "secret"}
```
Return
```http
200 OK
```

POST `http://localhost:8000/api/v1/users` - Create user (requires auth/role)
Input example
```json
{
  "rut": "99999999-9",
  "nombre": "Test",
  "apellido": "User",
  "email": "test@example.com",
  "password": "password",
  "rol": "ALUMNO"
}
```
Return
```http
201 Created
```

GET `http://localhost:8000/api/v1/users/{id}` - Get user (requires auth/role)
Input example
```json
{}
```
Return
```http
200 OK
```

GET `http://localhost:8000/api/v1/auth/validate` - Validate token
Input example
```json
{}
```
Return
```http
200 OK
```

## Tests
Run inside the service container or locally:
```bash
pytest -q
```
