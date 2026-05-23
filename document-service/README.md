# document-service

Document storage: upload and download PDF/DOCX files.

## Run

Docker Compose:
```bash
docker compose up --build document-service
```

Local:
```bash
cd document-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8005
```

## Environment
- `STORAGE_PATH` or `FILE_STORAGE` and `DATABASE_URL`

## Endpoints

GET `http://localhost:8000/api/v1/documents` - List documents
Input example
```json
{}
```
Return
```http
200 OK
```

POST `http://localhost:8000/api/v1/documents` - Upload document (multipart/form-data)
Input example
```json
{
  "practica_id": "<uuid>",
  "tipo": "INFORME",
  "file": "<binary file: informe.pdf>"
}
```
Return
```http
201 Created
```

GET `http://localhost:8000/api/v1/documents/{id}` - Download document
Input example
```json
{}
```
Return
```http
200 OK
```

## Notes
Supported MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.

## Tests
```bash
pytest -q
```
