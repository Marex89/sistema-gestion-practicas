# Sistema de Gestión de Prácticas Profesionales
 
Sistema de microservicios para la gestión de prácticas profesionales académicas: postulación, seguimiento, evaluación y
documentación, con un frontend en React y backend en FastAPI.
 
**Stack:** Python 3.12 · FastAPI · React + Vite · PostgreSQL 16 · Docker Compose
 
## Arquitectura
 
El backend está compuesto por 6 microservicios independientes, cada uno con
su propia base de datos, expuestos al frontend a través de un único punto
de entrada (API Gateway) que valida el JWT y reenvía las peticiones:
 
| Servicio | Responsabilidad |
|---|---|
| `auth-service` | Autenticación (JWT) y gestión de usuarios |
| `academic-service` | Sedes, carreras y centros de práctica |
| `internship-service` | Prácticas profesionales (creación, estado, asignación de docente) |
| `evaluation-service` | Acta 1, evaluaciones de desempeño, informes, acta final |
| `document-service` | Subida y descarga de documentos y material de apoyo |
| `notification-service` | Notificaciones y alertas |
| `api-gateway` | Punto de acceso único del frontend, valida JWT y reenvía a cada servicio |
 
El frontend puede correr en dos modos, controlado por la variable
`VITE_USE_MOCK` en `frontend/.env`:
- **`false`** (por defecto): consume el backend real vía API Gateway.
- **`true`**: usa datos simulados en memoria (`mockApi.js`), sin necesidad de backend.
## Requisitos
 
- **Docker Desktop** (incluye Docker Compose). En Windows, con el backend WSL2 activado.
  Descarga: https://www.docker.com/products/docker-desktop/
- No se necesita instalar Python, Node ni PostgreSQL localmente — todo corre
  dentro de los contenedores.
- Puertos libres en tu máquina: `5173` (frontend), `8000` (API Gateway), `5432` (Postgres).
## Cómo iniciar el proyecto
 
### 1. Clonar y ubicarse en la carpeta del proyecto
 
```cmd
git clone <repo-url>
cd sistema-gestion-practicas
```
 
### 2. Configurar variables de entorno
 
```cmd
copy .env.example .env
copy frontend\.env.example frontend\.env
```
 
En Linux/Mac el equivalente es `cp` en vez de `copy`.
 
El `.env` de la raíz trae los valores por defecto (usuario/contraseña de
Postgres, `SECRET_KEY`, puertos). El `.env` del frontend ya viene
configurado con `VITE_USE_MOCK=false` y `VITE_API_URL=http://localhost:8000`
para apuntar al backend real.
 
### 3. Construir y levantar todos los contenedores
 
```cmd
docker compose up --build
```
 
Esto construye las imágenes (Postgres, los 6 microservicios, el API Gateway
y el frontend) y las levanta en una misma red Docker. La primera vez tarda
varios minutos; las siguientes veces es mucho más rápido gracias al caché.
 
Para dejarlo corriendo en segundo plano en vez de bloquear la terminal:
 
```cmd
docker compose up --build -d
```
 
### 4. Verificar que todo está arriba
 
```cmd
docker compose ps
```
 
Todos los servicios deben figurar como `Up`, y `postgres` como `Up (healthy)`.
 
### 5. Crear usuarios de prueba (solo la primera vez)
 
Una base de datos nueva no tiene ningún usuario, así que hay que sembrar
los usuarios demo antes del primer login:
 
```cmd
docker compose exec api-gateway python seed_demo_users.py
```
 
Debería imprimir `✔ Creado ...` para 7 usuarios.
 
### 6. Abrir la aplicación
 
- **Frontend:** http://localhost:5173
- **API Gateway** (para probar endpoints directamente): http://localhost:8000
- Chequeo de salud del gateway: `curl http://localhost:8000/health`
## Usuarios de prueba
 
Todos con la misma contraseña: **`demo1234`**
 
| RUT | Rol | Nombre |
|---|---|---|
| `11111111-1` | SUPER_ADMIN | Super Admin |
| `12345678-9` | COORDINADOR | Carmen Silva |
| `17654321-9` | JEFE_CARRERA | Andrés Castillo |
| `18234567-K` | DOCENTE | Isabella Morales |
| `20456789-2` | ALUMNO | Tomás Rojas |
| `20999888-7` | ALUMNO | Sofía Vargas |
| `19876543-0` | EMPLEADOR | Roberto Fuentes |
 
Para probar con el rol de mayor acceso, ingresa en el login con RUT
`11111111-1` y contraseña `demo1234`.
 
## Comandos útiles
 
| Acción | Comando |
|---|---|
| Apagar todo (conserva la base de datos) | `docker compose down` |
| Apagar y borrar también la base de datos | `docker compose down -v` |
| Reconstruir tras cambiar `requirements.txt` o `package.json` | `docker compose up --build` |
| Ver logs de un servicio específico | `docker compose logs -f auth-service` |
| Entrar a la base de datos de un servicio | `docker compose exec postgres psql -U postgres -d auth_db` |
| Entrar a una consola dentro de un contenedor | `docker compose exec auth-service bash` |
 
**Nota sobre hot-reload:** no necesitas reconstruir (`--build`) para cambios
en archivos `.py` o `.jsx`/`.js` — los servicios corren con recarga
automática (`--reload` en el backend, Vite dev server en el frontend) y las
carpetas están montadas como volumen. Solo reconstruye si cambias
dependencias (`requirements.txt`, `package.json`) o algún `Dockerfile`.
 
## Documentación por servicio
 
Cada microservicio incluye su propio README con el detalle de sus
endpoints:
- `auth-service/README.md`
- `academic-service/README.md`
- `internship-service/README.md`
- `evaluation-service/README.md`
- `document-service/README.md`
- `notification-service/README.md`
- `api-gateway/README.md`
- `frontend/README.md` (modo mock vs backend real, configuración de `.env`)
## Estructura del proyecto
 
```
./
├── api-gateway/
├── auth-service/
├── academic-service/
├── internship-service/
├── evaluation-service/
├── document-service/
├── notification-service/
├── frontend/
├── docs/
├── tests/
├── docker-compose.yml
└── .env.example
```
 
## Notas técnicas
 
- En desarrollo se usa `Base.metadata.create_all()` para crear las tablas;
  para producción se recomienda configurar Alembic (migraciones versionadas).
- `notification-service` imprime los correos por consola si no hay SMTP
  configurado.
- El almacenamiento de documentos usa el volumen Docker `file_storage`,
  montado en `/app/storage` dentro del contenedor.
