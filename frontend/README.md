# Frontend — Sistema de Gestión de Prácticas

React + Vite. Consume el backend real a través del API Gateway (por defecto
`http://localhost:8000`), o puede correr en modo mock (datos en memoria, sin
backend) con el switch `VITE_USE_MOCK`.

## Configuración

```bash
cp .env.example .env
```

Variables relevantes (`.env`):

| Variable         | Descripción                                                        |
|------------------|---------------------------------------------------------------------|
| `VITE_USE_MOCK`  | `false` -> backend real vía API Gateway. `true` -> `mockApi.js`.     |
| `VITE_API_URL`   | Base URL del API Gateway. Sin sufijo `/api` (el gateway expone sus rutas en la raíz: `/auth`, `/users`, `/academic`, `/internships`, `/evaluations`, `/documents`, `/notifications`). |

## Ejecutar en modo desarrollo (sin Docker)

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Requiere que el backend (API Gateway +
microservicios + Postgres) esté corriendo — ver el `README.md` en la raíz
del proyecto.

## Ejecutar con Docker Compose

Desde la raíz del repo:

```bash
docker compose up --build
```

Esto levanta Postgres, los 6 microservicios, el API Gateway y el frontend
(`http://localhost:5173`), todos en la misma red Docker.

## Modo mock (sin backend)

Para trabajar en el frontend sin levantar ningún microservicio:

```bash
echo "VITE_USE_MOCK=true" > .env
npm run dev
```

## Usuarios de prueba (backend real)

Con una base de datos nueva no existe ningún usuario todavía. Ejecuta el
seed una vez que los contenedores estén arriba:

```bash
docker compose exec api-gateway python seed_demo_users.py
```

Esto crea 7 usuarios (uno por rol) con contraseña `demo1234`, con los
mismos RUT/nombres que las tarjetas demo del modo mock — por ejemplo
`11111111-1` / `demo1234` para SUPER_ADMIN.
