# Internship Management System

Microservices system for managing academic internships/practices.

Stack: Python 3.12 · FastAPI · PostgreSQL 16 · Docker Compose

## Quick Start

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd sistema-gestion-practicas

# 2. Copy environment example and edit
cp .env.example .env
# set SECRET_KEY and database credentials

# 3. Start all services
docker compose up --build

# 4. Check gateway health
curl http://localhost:8000/health
```

Gateway: `http://localhost:8000`.
Each service includes a dedicated README with endpoint documentation and examples (English):
- `auth-service/README.md`
- `academic-service/README.md`
- `internship-service/README.md`
- `evaluation-service/README.md`
- `document-service/README.md`
- `notification-service/README.md`
- `api-gateway/README.md`

## Project layout

```
./
├── api-gateway/
├── auth-service/
├── academic-service/
├── internship-service/
├── evaluation-service/
├── document-service/
├── notification-service/
├── docs/
├── tests/
├── docker-compose.yml
└── .env.example
```

## Notes
- Development uses `Base.metadata.create_all()`; configure Alembic for production.
- `notification-service` prints emails to stdout if SMTP not configured.
- Document storage uses Docker volume `file_storage` mounted at `/app/storage`.

