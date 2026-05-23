# notification-service

Notifications and history. Development mode writes emails to stdout if SMTP is not configured.

## Run

Docker Compose:
```bash
docker compose up --build notification-service
```

Local:
```bash
cd notification-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8006
```

## Environment
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`

## Endpoints

POST `http://localhost:8000/api/v1/notifications/send` - Send notification
Input example
```json
{"destinatario": "user@example.com", "mensaje": "Hello"}
```
Return
```http
200 OK
```

GET `http://localhost:8000/api/v1/notifications/history/{user_id}` - Get notification history (requires COORDINADOR/ADMIN role)
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
