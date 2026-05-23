# api-gateway

API Gateway: validates JWT, injects `X-User-Id` and `X-User-Role`, and proxies requests to microservices.

## Run

Docker Compose:
```bash
docker compose up --build api-gateway
```

Local:
```bash
cd api-gateway
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Endpoints

GET `http://localhost:8000/health` - Gateway health check
Input example
```json
{}
```
Return
```http
200 OK
```

Proxy example (gateway forwards to services):

POST `http://localhost:8000/api/v1/auth/login` - Forward to auth-service
Input example
```json
{"username": "admin", "password": "secret"}
```
Return
```http
200 OK
```

## E2E / Tests
- `api-gateway/e2e_internal.py` is a quick internal E2E script (run inside gateway container).
- Orchestrated tests: `./tests/run-tests.sh`.

## Note
Ensure `SECRET_KEY` in `.env` is the same across gateway and services.
